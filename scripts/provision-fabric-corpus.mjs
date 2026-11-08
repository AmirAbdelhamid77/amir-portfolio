#!/usr/bin/env node
// Provision the pinned Microsoft Fabric corpus for a clean checkout.
//
// The compiled corpus is intentionally not in Git (RELEASE_AND_STORAGE.md):
// `public/fabric-docs-assets/`, `public/fabric-search/` and the compiler
// workspace are generated. This script reproduces them from the pinned upstream
// revision and fails closed on any count or byte mismatch.
//
// Usage (CI and local clean-room):
//   node scripts/provision-fabric-corpus.mjs \
//     --source=<checkout>/docs \
//     --build-dir=<external-build-dir> \
//     --public-root=<checkout>/public \
//     [--clean] [--compare=<verified-public-root>] [--compare-registry=<registry.json>]
//
// Exit codes: 0 = provisioned and verified; 1 = verification failure; 2 = usage
// or missing input. No network access is performed here: the caller checks out
// the pinned upstream revision (CI does it explicitly).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const UPSTREAM_URL = "https://github.com/MicrosoftDocs/fabric-docs.git";
export const PINNED_REVISION = "774592ea3f2d4558f763d6e5b74abf4785948fb5";
export const EXPECTED = Object.freeze({
  families: 22,
  ledgerArticleRows: 2797,
  publishedArticles: 2716,
  excludedArticles: 81,
  aliasesWired: 947,
  aliasesSuppressed: 67,
  // The asset manifest lists one row per family that references an asset, so a
  // shared asset appears once per family. The public tree writes each key once.
  docsAssetRows: 9586,
  docsAssets: 9572,
  searchFiles: 106,
});

const SCRIPTS = {
  compile: "tools/fabric-corpus/route-registry/compile-all-families.mjs",
  registry: "tools/fabric-corpus/route-registry/build-registry.mjs",
  assets: "tools/fabric-corpus/route-registry/copy-assets.mjs",
  shards: "tools/fabric-corpus/search/build-shards.mjs",
  copyShards: "tools/fabric-corpus/search/copy-shards.mjs",
};

function parseArgs(argv) {
  const args = { clean: false, allowUnpinnedSource: false, source: null, buildDir: null, publicRoot: null, compare: null, compareRegistry: null };
  for (const raw of argv) {
    const match = /^--(source|build-dir|public-root|compare|compare-registry)=(.*)$/.exec(raw);
    if (match) {
      args[match[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = resolve(match[2]);
    } else if (raw === "--clean") args.clean = true;
    else if (raw === "--allow-unpinned-source") args.allowUnpinnedSource = true;
    else if (raw === "--help" || raw === "-h") args.help = true;
    else throw new Error(`provision-fabric-corpus: unsupported argument ${raw}`);
  }
  return args;
}

function usage() {
  console.log(`Usage: node scripts/provision-fabric-corpus.mjs --source=<docs-dir> [options]

  --source=<path>            Upstream checkout's docs/ directory (pinned revision)
  --build-dir=<path>         External compiler workspace (default FABRIC_CORPUS_BUILD_DIR)
  --public-root=<path>       Public tree that receives fabric-docs-assets/ and fabric-search/
  --clean                    Remove compiler-output, route-registry and search-shards first
  --compare=<path>           Compare generated asset/search trees with a verified public root
  --compare-registry=<path>  Compare the generated registry JSON with a verified copy
  --allow-unpinned-source    Permit a source without a matching Git HEAD (not for CI)

Defaults: build dir = FABRIC_CORPUS_BUILD_DIR or <repo>/../fabric-corpus-build;
public root = <repo>/public; source = FABRIC_CORPUS_ROOT if set.`);
}

function run(label, script, scriptArgs, env) {
  process.stdout.write(`\n== ${label} ==\n`);
  execFileSync(process.execPath, ["--experimental-strip-types", script, ...scriptArgs], {
    cwd: REPO_ROOT,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
}

function assertSafeBuildDir(buildDir, source, publicRoot) {
  const target = resolve(buildDir);
  for (const [label, other] of [["repository", REPO_ROOT], ["source", source], ["public root", publicRoot]]) {
    const value = resolve(other);
    if (target === value || target.startsWith(value + sep) || value.startsWith(target + sep)) {
      throw new Error(`Refusing build dir ${target}: it overlaps the ${label} (${value})`);
    }
  }
}

function walk(root, dir = root, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(root, path, files);
    else if (entry.isFile()) files.push(relative(root, path).split(sep).join("/"));
    else throw new Error(`Unsupported entry in ${root}: ${path}`);
  }
  return files.sort();
}

function digest(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function compareTrees(label, expectedRoot, actualRoot) {
  assert.ok(existsSync(expectedRoot), `${label}: verified tree is missing at ${expectedRoot}`);
  assert.ok(existsSync(actualRoot), `${label}: generated tree is missing at ${actualRoot}`);
  const expected = walk(expectedRoot);
  const actual = walk(actualRoot);
  assert.deepEqual(actual, expected, `${label}: generated file set differs from the verified tree`);
  for (const path of expected) {
    assert.equal(
      digest(join(actualRoot, ...path.split("/"))),
      digest(join(expectedRoot, ...path.split("/"))),
      `${label}: byte mismatch at ${path}`,
    );
  }
  console.log(`PASS compare ${label}: ${expected.length} files are byte-identical`);
}

function sumAssets(manifest) {
  return Object.values(manifest.families).reduce((sum, family) => sum + family.copiedCount, 0);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return usage();
  const source = args.source ?? (process.env.FABRIC_CORPUS_ROOT ? resolve(process.env.FABRIC_CORPUS_ROOT) : null);
  const buildDir = args.buildDir ?? resolve(process.env.FABRIC_CORPUS_BUILD_DIR ?? join(REPO_ROOT, "..", "fabric-corpus-build"));
  const publicRoot = args.publicRoot ?? join(REPO_ROOT, "public");
  if (!source) throw new Error("Missing --source (or FABRIC_CORPUS_ROOT)");
  if (!existsSync(source)) throw new Error(`Source does not exist: ${source}`);
  assertSafeBuildDir(buildDir, source, publicRoot);

  if (!args.allowUnpinnedSource) {
    const head = execFileSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    assert.equal(head, PINNED_REVISION, `Source HEAD ${head} is not the pinned revision ${PINNED_REVISION}`);
  } else {
    console.warn("WARN: source revision is not verified (--allow-unpinned-source)");
  }

  const env = {
    FABRIC_CORPUS_ROOT: source,
    FABRIC_CORPUS_BUILD_DIR: buildDir,
    FABRIC_PUBLIC_ROOT: publicRoot,
  };

  if (args.clean) {
    for (const name of ["compiler-output", "route-registry", "search-shards"]) {
      rmSync(join(buildDir, name), { recursive: true, force: true });
    }
    console.log(`Cleared generated build subdirectories under ${buildDir}`);
  }

  run("compile all route-plan families", SCRIPTS.compile, ["--revision", PINNED_REVISION], env);
  run("build route registry", SCRIPTS.registry, [], env);
  run("copy docs assets", SCRIPTS.assets, ["--copy=all"], env);
  run("build search shards", SCRIPTS.shards, ["--families=all"], env);
  run("copy search shards", SCRIPTS.copyShards, [], env);

  const registryPath = join(buildDir, "route-registry", "route-registry.json");
  const assetManifestPath = join(buildDir, "route-registry", "asset-manifest.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const assets = JSON.parse(readFileSync(assetManifestPath, "utf8"));
  assert.equal(registry.corpusRevision, PINNED_REVISION, "Registry revision does not match the pin");
  assert.equal(registry.counts.families, EXPECTED.families, "Family count changed");
  assert.equal(registry.counts.ledgerArticleRows, EXPECTED.ledgerArticleRows, "Ledger row count changed");
  assert.equal(registry.counts.publishedArticles, EXPECTED.publishedArticles, "Published article count changed");
  assert.equal(registry.counts.excludedArticles, EXPECTED.excludedArticles, "Excluded article count changed");
  assert.equal(registry.counts.aliases.wired, EXPECTED.aliasesWired, "Wired alias count changed");
  assert.equal(registry.counts.aliases.suppressed, EXPECTED.aliasesSuppressed, "Suppressed alias count changed");
  assert.equal(sumAssets(assets), EXPECTED.docsAssetRows, "Docs-asset manifest row count changed");
  assert.equal(assets.corpusRevision, PINNED_REVISION, "Asset manifest revision does not match the pin");

  const assetRoot = join(publicRoot, "fabric-docs-assets");
  const searchRoot = join(publicRoot, "fabric-search");
  const assetFiles = walk(assetRoot);
  assert.equal(assetFiles.length, EXPECTED.docsAssets, "Docs-asset file count changed");
  for (const [family, row] of Object.entries(assets.families)) {
    for (const [path, meta] of Object.entries(row.assets)) {
      const absolute = join(assetRoot, ...path.split("/"));
      assert.ok(existsSync(absolute), `${family}: manifest asset is missing: ${path}`);
      assert.equal(statSync(absolute).size, meta.bytes, `${family}: asset byte count changed: ${path}`);
    }
  }
  const searchFiles = walk(searchRoot);
  assert.equal(searchFiles.length, EXPECTED.searchFiles, "Search-shard file count changed");

  if (args.compare) {
    compareTrees("docs assets", join(args.compare, "fabric-docs-assets"), assetRoot);
    compareTrees("search shards", join(args.compare, "fabric-search"), searchRoot);
  }
  if (args.compareRegistry) {
    assert.deepEqual(
      JSON.parse(readFileSync(args.compareRegistry, "utf8")),
      registry,
      "Generated route registry differs from the verified registry",
    );
    console.log("PASS compare registry: byte-equivalent JSON");
  }

  const receipt = {
    schema: "hansa.fabric-provision-receipt/1",
    upstream: UPSTREAM_URL,
    revision: PINNED_REVISION,
    counts: {
      families: registry.counts.families,
      ledgerArticleRows: registry.counts.ledgerArticleRows,
      publishedArticles: registry.counts.publishedArticles,
      excludedArticles: registry.counts.excludedArticles,
      aliasesWired: registry.counts.aliases.wired,
      aliasesSuppressed: registry.counts.aliases.suppressed,
      docsAssetRows: sumAssets(assets),
      docsAssets: assetFiles.length,
      searchFiles: searchFiles.length,
    },
  };
  if (args.compareRegistry) receipt.registryRevision = registry.registryRevision;
  writeFileSync(join(buildDir, "provision-receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
  console.log(
    `\nPASS provision: ${receipt.counts.families} families, ${receipt.counts.publishedArticles} published, ` +
      `${receipt.counts.docsAssets} assets, ${receipt.counts.searchFiles} search files at ${PINNED_REVISION.slice(0, 12)}`,
  );
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
