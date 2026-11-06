#!/usr/bin/env node
// FC12 — shared packaging driver for the two mandatory delivery profiles
// (RELEASE_AND_STORAGE.md §"Delivery profiles"; handover 03 §"Hosting-agnostic
// release contract").
//
//   node tools/fabric-corpus/packaging/build-release.mjs --profile root|subpath [--label NAME]
//
// One profile per invocation. Steps: clean (out/ + .next) → `npm run build`
// with NEXT_PUBLIC_BASE_PATH set per the profile seed (root: variable unset;
// subpath: the basePath read from tools/fabric-corpus/profiles/subpath.json —
// the schema v1 rule is that packaging injects the repository name at build
// time, never hard-codes it) → the npm `postbuild` segment-alias script runs
// automatically inside the build → coverage verification against the route
// registry (every published article has an index.html; every excluded path is
// absent — FAIL-CLOSED on any mismatch) → base-path prefix verification
// (subpath: no double prefix anywhere in text output, single-prefix spot
// checks on article pages, assets, shard URLs and alias pages; root: zero
// '/<repository>/' leakage) → deterministic release manifest at
// <FABRIC_CORPUS_BUILD_DIR>/packaging/<profile>/release-manifest.json.
//
// DRY-RUN ONLY: this driver builds, verifies and measures. It never deploys,
// publishes, activates a provider, touches credentials or runs git (the app
// SHA comes from FABRIC_APP_SHA when provided — CI — otherwise from the
// worktree HEAD files read directly, otherwise the literal
// 'local-uncommitted').
//
// Exit codes: 0 ok; 1 hard failure (build failure, coverage mismatch,
// double-prefix hits, root-profile repository leakage); 2 subpath
// single-prefix verification failure (findings recorded in the manifest).
// A nonzero exit still leaves the manifest on disk for evidence.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const REPO = path.resolve(import.meta.dirname, "..", "..", "..");
const OUT = path.join(REPO, "out");
const NEXT_DIR = path.join(REPO, ".next");
const BUILD_DIR = process.env.FABRIC_CORPUS_BUILD_DIR
  ? path.resolve(process.env.FABRIC_CORPUS_BUILD_DIR)
  : path.resolve(REPO, "..", "fabric-corpus-build");
const PROFILES_DIR = path.join(REPO, "tools", "fabric-corpus", "profiles");
const PACKAGING_DIR = path.join(BUILD_DIR, "packaging");

// Text-ish extensions scanned for prefix patterns. Media (png/jpg/webp/…)
// and archives are skipped: base-path checks are about URLs in text output.
const TEXT_EXTENSIONS = new Set([
  ".html", ".htm", ".txt", ".js", ".mjs", ".css", ".json", ".xml", ".svg",
  ".map", ".webmanifest", ".csv", ".md",
]);
const MAX_TEXT_SCAN_BYTES = 64 * 1024 * 1024;

function fail(message, code = 1) {
  console.error(`build-release: ${message}`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { profile: null, label: null };
  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === "--profile") args.profile = argv[++i] ?? null;
    else if (raw === "--label") args.label = argv[++i] ?? null;
    else fail(`unsupported argument: ${raw} (usage: --profile root|subpath [--label NAME])`, 2);
  }
  if (args.profile !== "root" && args.profile !== "subpath") {
    fail("--profile must be exactly \"root\" or \"subpath\" (the two mandatory profiles).");
  }
  return args;
}

function sha256File(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function timed(fn) {
  const start = process.hrtime.bigint();
  const result = fn();
  return { result, ms: Number(process.hrtime.bigint() - start) / 1e6 };
}

/**
 * Worktree HEAD commit SHA read directly from git internals — NO git command
 * is run (hard constraint). Resolves `<repo>/.git` (a "gitdir: …" pointer for
 * worktrees), `<gitdir>/HEAD` (symbolic ref), then the loose ref file or
 * packed-refs. Returns null on any failure; callers fall back to
 * 'local-uncommitted' unless FABRIC_APP_SHA was provided.
 */
function readWorktreeHeadSha(repo) {
  try {
    const dotGit = path.join(repo, ".git");
    let gitDir = dotGit;
    if (statSync(dotGit).isFile()) {
      const pointer = readFileSync(dotGit, "utf8").trim();
      const match = /^gitdir:\s*(.+)$/.exec(pointer);
      if (!match) return null;
      gitDir = path.resolve(repo, match[1]);
    }
    const head = readFileSync(path.join(gitDir, "HEAD"), "utf8").trim();
    const direct = /^[0-9a-f]{40}$/i.exec(head);
    if (direct) return head.toLowerCase();
    const refMatch = /^ref:\s*(\S+)$/.exec(head);
    if (!refMatch) return null;
    const ref = refMatch[1];
    const loose = path.join(gitDir, ref);
    if (existsSync(loose)) {
      const sha = readFileSync(loose, "utf8").trim();
      if (/^[0-9a-f]{40}$/i.test(sha)) return sha.toLowerCase();
    }
    const packed = path.join(path.dirname(gitDir), "packed-refs");
    if (existsSync(packed)) {
      for (const line of readFileSync(packed, "utf8").split("\n")) {
        const entry = line.trim().split(/\s+/);
        if (entry.length === 2 && entry[1] === ref && /^[0-9a-f]{40}$/i.test(entry[0])) {
          return entry[0].toLowerCase();
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

function loadProfileSeed(name) {
  const file = path.join(PROFILES_DIR, `${name}.json`);
  if (!existsSync(file)) fail(`profile seed missing: ${file}`);
  const seed = JSON.parse(readFileSync(file, "utf8"));
  if (seed.profile !== name) fail(`profile seed ${file} declares profile "${seed.profile}", expected "${name}".`);
  if (typeof seed.basePath !== "string") fail(`profile seed ${file} has no string basePath.`);
  if (name === "root" && seed.basePath !== "") fail(`root profile basePath must be "" (got ${JSON.stringify(seed.basePath)}).`);
  if (name === "subpath") {
    const bp = seed.basePath;
    if (!bp.startsWith("/") || bp.endsWith("/") || bp.includes("//") || bp.length < 2) {
      fail(`subpath basePath must look like "/<repository>" (got ${JSON.stringify(bp)}).`);
    }
  }
  return seed;
}

/** The load-bearing leakage/double-prefix patterns, derived from the seeds. */
function placeholderPatterns(seeds) {
  const subBase = seeds.subpath.basePath; // "/REPOSITORY_NAME"
  return { subBase, repoName: subBase.slice(1), doublePrefix: `${subBase}${subBase}` };
}

// ---------------------------------------------------------------------------
// Route registry (fail-closed; same file the app build consumes).
// ---------------------------------------------------------------------------

function loadRegistry() {
  const file = path.join(BUILD_DIR, "route-registry", "route-registry.json");
  if (!existsSync(file)) {
    fail(`route registry missing: ${file} — the docs namespace fails closed (RELEASE_AND_STORAGE.md).`);
  }
  const registry = JSON.parse(readFileSync(file, "utf8"));
  if (registry?.schema !== "hansa.fabric-route-registry/1") {
    fail(`route registry at ${file} has an unknown schema — refusing to package from it.`);
  }
  const published = registry.families.flatMap((family) =>
    family.articles.filter((article) => article.published === true).map((article) => article.logicalPath),
  );
  if (published.length !== registry.counts?.publishedArticles) {
    fail(
      `route registry inconsistency: ${published.length} published rows vs counts.publishedArticles ` +
        `${registry.counts?.publishedArticles} — refusing to package.`,
    );
  }
  const excluded = registry.excluded.map((row) => ({
    logicalPath: row.logicalPathIfItWereEligible ?? row.logicalPath,
    articleId: row.articleId,
    reason: row.reason,
  }));
  return { registry, published, excluded };
}

// ---------------------------------------------------------------------------
// out/ inventory walk: sizes, extension counts and in-flight prefix scans.
// ---------------------------------------------------------------------------

function walkAndScan(profile, patterns, label) {
  const files = [];
  let bytes = 0;
  const byExt = new Map();
  const scanState = {
    doublePrefix: { count: 0, examples: [] },
    leakage: { count: 0, examples: [] },
    subPrefixFiles: 0,
    scannedTextFiles: 0,
  };
  const doublePrefixNeedle = profile === "subpath" ? Buffer.from(patterns.doublePrefix, "latin1") : null;
  const leakageNeedle = Buffer.from(patterns.subBase, "latin1");

  const walk = (dir, relBase) => {
    for (const entry of existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : []) {
      const full = path.join(dir, entry.name);
      const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(full, rel);
        continue;
      }
      if (!entry.isFile()) continue;
      const size = statSync(full).size;
      files.push({ rel, size });
      bytes += size;
      const ext = path.extname(rel).toLowerCase() || "(none)";
      byExt.set(ext, (byExt.get(ext) ?? 0) + 1);
      if (!TEXT_EXTENSIONS.has(ext) || size > MAX_TEXT_SCAN_BYTES) continue;
      const buf = readFileSync(full);
      scanState.scannedTextFiles += 1;
      if (doublePrefixNeedle && buf.includes(doublePrefixNeedle)) {
        scanState.doublePrefix.count += 1;
        if (scanState.doublePrefix.examples.length < 25) scanState.doublePrefix.examples.push(rel);
      }
      if (profile === "root" && buf.includes(leakageNeedle)) {
        scanState.leakage.count += 1;
        if (scanState.leakage.examples.length < 25) scanState.leakage.examples.push(rel);
      }
      if (profile === "subpath" && buf.includes(leakageNeedle)) scanState.subPrefixFiles += 1;
    }
  };
  walk(OUT, "");
  void label;
  return { files, bytes, byExt, scanState };
}

// ---------------------------------------------------------------------------
// Spot checks: article pages, assets, shard URLs, alias pages.
// ---------------------------------------------------------------------------

const UNPREFIXED_ATTR_PATTERNS = [
  ["href=/_next/", 'href="/_next/'],
  ["href=/fabric-docs-assets/", 'href="/fabric-docs-assets/'],
  ["href=/fabric-search/", 'href="/fabric-search/'],
  ["href=/fabric-aliases/", 'href="/fabric-aliases/'],
  ["href=/learn/fabric/docs/", 'href="/learn/fabric/docs/'],
  ["src=/_next/", 'src="/_next/'],
  ["src=/fabric-docs-assets/", 'src="/fabric-docs-assets/'],
  ["src=/fabric-search/", 'src="/fabric-search/'],
];
const REFRESH_URL_PATTERN = /content="0;\s*url=([^"]+)"/;

/** Evenly spaced deterministic sample of `count` items from a sorted list. */
function spacedSample(sorted, count) {
  if (sorted.length <= count) return sorted.slice();
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(sorted[Math.floor((i * sorted.length) / count)]);
  }
  return out;
}

function checkHtmlDocument(rel, content, patterns, profile) {
  const unprefixed = [];
  for (const [name, needle] of UNPREFIXED_ATTR_PATTERNS) {
    let index = content.indexOf(needle);
    let hits = 0;
    while (index !== -1) {
      hits += 1;
      if (unprefixed.length < 10 && hits === 1) unprefixed.push({ kind: name, example: content.slice(index, index + 120) });
      index = content.indexOf(needle, index + needle.length);
    }
    if (hits > 0) unprefixed.push({ kind: name, hits });
  }
  const prefixedDocsHrefs = countOccurrences(content, `href="${patterns.subBase}/learn/fabric/docs/`);
  const prefixedNextStatic = countOccurrences(content, `${patterns.subBase}/_next/static/`);
  const prefixedDocsAssets = countOccurrences(content, `${patterns.subBase}/fabric-docs-assets/`);
  const canonicalMatch = /rel="canonical"\s+href="([^"]+)"/.exec(content);
  const refreshMatch = REFRESH_URL_PATTERN.exec(content);
  const refreshTarget = refreshMatch ? refreshMatch[1] : null;
  const unprefixedRefresh = refreshTarget !== null && refreshTarget.startsWith("/") && !refreshTarget.startsWith(`${patterns.subBase}/`);
  return {
    rel,
    profile,
    bytes: Buffer.byteLength(content),
    unprefixedAttrHits: unprefixed.filter((entry) => entry.hits > 0).reduce((sum, entry) => sum + entry.hits, 0),
    unprefixedDetail: unprefixed,
    prefixedDocsHrefs,
    prefixedNextStatic,
    prefixedDocsAssets,
    canonical: canonicalMatch ? canonicalMatch[1] : null,
    refreshTarget,
    unprefixedRefresh,
    doublePrefix: content.includes(patterns.doublePrefix),
  };
}

function countOccurrences(text, needle) {
  let count = 0;
  let index = text.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(needle, index + needle.length);
  }
  return count;
}

function spotChecks(files, published, patterns, profile) {
  const fileSet = new Set(files.map((f) => f.rel));
  const sortedPublished = [...published].sort();
  const articleSample = spacedSample(sortedPublished, 20).map((logicalPath) => {
    const rel = `${logicalPath.replace(/^\//, "")}index.html`;
    if (!fileSet.has(rel)) return { rel, exists: false };
    return { exists: true, ...checkHtmlDocument(rel, readFileSync(path.join(OUT, rel), "utf8"), patterns, profile) };
  });

  const aliasRels = files
    .map((f) => f.rel)
    .filter((rel) => rel.startsWith("fabric-aliases/") && rel.endsWith(".html"))
    .sort();
  const aliasSample = spacedSample(aliasRels, 10).map((rel) =>
    checkHtmlDocument(rel, readFileSync(path.join(OUT, rel), "utf8"), patterns, profile),
  );

  // Shard URLs: the manifest is profile-independent (relative file names only);
  // the base path is applied client-side through buildAssetUrl with the
  // NEXT_PUBLIC_BASE_PATH constant inlined into the JS bundle.
  const manifestRel = "fabric-search/manifest.json";
  const manifestExists = fileSet.has(manifestRel);
  let shardCheck = { manifestExists, manifestContainsBasePath: null, filesOnDisk: null, filesInManifest: null, bundleInlinesBasePath: null };
  if (manifestExists) {
    const manifestRaw = readFileSync(path.join(OUT, manifestRel), "utf8");
    const manifest = JSON.parse(manifestRaw);
    const versionDirRel = `fabric-search/${manifest.version}/`;
    shardCheck.manifestContainsBasePath = manifestRaw.includes(patterns.subBase);
    shardCheck.filesInManifest = Array.isArray(manifest.files) ? manifest.files.length : null;
    shardCheck.filesOnDisk = files.filter((f) => f.rel.startsWith(versionDirRel)).length;
    const bundleHit = files.find(
      (f) => f.rel.startsWith("_next/static/chunks/") && f.rel.endsWith(".js") && f.size < MAX_TEXT_SCAN_BYTES
        && readFileSync(path.join(OUT, f.rel)).includes(leakageNeedleFor(patterns)),
    );
    shardCheck.bundleInlinesBasePath = bundleHit ? bundleHit.rel : null;
  }

  return { articleSample, aliasSample, aliasPageCount: aliasRels.length, shardCheck };
}

function leakageNeedleFor(patterns) {
  return Buffer.from(patterns.subBase, "latin1");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
const label = args.label ?? `${args.profile}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
console.log(`[fc12] packaging profile "${args.profile}" (label ${label})`);

const seeds = { root: loadProfileSeed("root"), subpath: loadProfileSeed("subpath") };
const patterns = placeholderPatterns(seeds);
const profileSeed = seeds[args.profile];
const basePath = profileSeed.basePath;

const appSha =
  process.env.FABRIC_APP_SHA?.trim() ||
  readWorktreeHeadSha(REPO) ||
  "local-uncommitted";
console.log(`[fc12] appSha: ${appSha}${process.env.FABRIC_APP_SHA ? " (FABRIC_APP_SHA)" : " (worktree HEAD files)"}`);
console.log(`[fc12] basePath for this build: ${basePath === "" ? '(unset — root profile)' : JSON.stringify(basePath)}`);

const totalStart = process.hrtime.bigint();
const { registry, published, excluded } = loadRegistry();
console.log(
  `[fc12] registry ${registry.registryRevision.slice(0, 8)} / corpus ${registry.corpusRevision.slice(0, 8)}: ` +
    `${published.length} published, ${excluded.length} excluded, ${registry.counts.aliases?.wired ?? "?"} aliases wired`,
);

/** Build environment with the profile's NEXT_PUBLIC_BASE_PATH applied once. */
function buildEnvFor(basePath) {
  const env = { ...process.env };
  if (basePath === "") delete env.NEXT_PUBLIC_BASE_PATH;
  else env.NEXT_PUBLIC_BASE_PATH = basePath;
  return env;
}

// --- clean ------------------------------------------------------------------
const clean = timed(() => {
  rmSync(OUT, { recursive: true, force: true });
  rmSync(NEXT_DIR, { recursive: true, force: true });
});
console.log(`[fc12] clean (out/ + .next): ${Math.round(clean.ms)} ms`);

// --- regenerate alias pages for THIS profile ----------------------------------
// Lead fix (subpath dry run caught 10/10 sampled alias pages serving
// root-profile targets): public/fabric-aliases/*.html are profile-dependent
// generated files — the generator applies NEXT_PUBLIC_BASE_PATH at their
// output boundary (write-alias-routes.mjs line comment), but the driver never
// re-ran it, so each build shipped the last generation's files. Regenerate
// with this profile's base path before every build.
const aliasRegen = timed(() =>
  spawnSync(
    process.execPath,
    ["tools/fabric-corpus/route-registry/write-alias-routes.mjs"],
    { cwd: REPO, env: buildEnvFor(basePath), stdio: "inherit" },
  ),
);
console.log(`[fc12] alias regeneration (${basePath || "no base path"}): exit ${aliasRegen.result.status}, ${Math.round(aliasRegen.ms)} ms`);
if (aliasRegen.result.status !== 0) fail("alias regeneration failed", 1);

// --- build (npm run build; postbuild alias script runs inside it) ------------
const buildEnv = buildEnvFor(basePath);

const build = timed(() =>
  spawnSync("npm", ["run", "build"], {
    cwd: REPO,
    env: buildEnv,
    stdio: "inherit",
    shell: process.platform === "win32",
  }),
);
const buildMs = Math.round(build.ms);
console.log(`[fc12] npm run build (incl. postbuild aliases): ${buildMs} ms, exit ${build.result.status}`);

if (build.result.status !== 0 || !existsSync(OUT)) {
  mkdirSync(path.join(PACKAGING_DIR, args.profile), { recursive: true });
  writeFileSync(
    path.join(PACKAGING_DIR, args.profile, "release-manifest.json"),
    JSON.stringify(
      {
        schema: "hansa.fabric-release-manifest/1",
        profile: args.profile,
        appSha,
        corpusRevision: registry.corpusRevision,
        registryRevision: registry.registryRevision,
        failed: { stage: "build", exitCode: build.result.status, outExists: existsSync(OUT) },
        timing: { generatedAt: new Date().toISOString(), cleanMs: Math.round(clean.ms), buildMs },
      },
      null,
      2,
    ) + "\n",
  );
  fail(`build failed (exit ${build.result.status}) — manifest records the failure.`);
}

// --- inventory + scans -------------------------------------------------------
const scan = timed(() => walkAndScan(args.profile, patterns, label));
const { files, bytes, byExt, scanState } = scan.result;
const fileRelSet = new Set(files.map((f) => f.rel));
console.log(
  `[fc12] out/: ${files.length} files, ${(bytes / 1048576).toFixed(1)} MB ` +
    `(${scanState.scannedTextFiles} text files scanned, ${Math.round(scan.ms)} ms)`,
);

// --- coverage verification (fail-closed) -------------------------------------
const coverageMismatches = [];
let rendered = 0;
for (const logicalPath of published) {
  const rel = `${logicalPath.replace(/^\//, "")}index.html`;
  if (fileRelSet.has(rel)) rendered += 1;
  else coverageMismatches.push({ kind: "missing-rendered", logicalPath });
}
let excludedPresent = 0;
for (const row of excluded) {
  const rel = `${row.logicalPath.replace(/^\//, "")}index.html`;
  if (fileRelSet.has(rel)) {
    excludedPresent += 1;
    coverageMismatches.push({ kind: "excluded-present", logicalPath: row.logicalPath, articleId: row.articleId, reason: row.reason });
  }
}
console.log(
  `[fc12] coverage: rendered ${rendered}/${published.length} published; excluded-present ${excludedPresent}/${excluded.length}; ` +
    `mismatches ${coverageMismatches.length}`,
);
for (const mismatch of coverageMismatches.slice(0, 20)) {
  console.error(`[fc12] coverage mismatch: ${JSON.stringify(mismatch)}`);
}

// --- prefix / leakage verification -------------------------------------------
// Lead fix (interrupted session left this call referencing an undefined
// `profile`; the driver's profile lives on `args.profile`).
const spots = spotChecks(files, published, patterns, args.profile);
const articlePagesWithBody = spots.articleSample.filter((page) => page.exists);
const unprefixedArticleHits = articlePagesWithBody.reduce((sum, page) => sum + page.unprefixedAttrHits, 0);
const doublePrefixInSample = articlePagesWithBody.filter((page) => page.doublePrefix).length;
const prefixedAssetEvidence =
  articlePagesWithBody.reduce((sum, page) => sum + (page.prefixedNextStatic ?? 0), 0) +
  articlePagesWithBody.reduce((sum, page) => sum + (page.prefixedDocsAssets ?? 0), 0);
const unprefixedAliasHits = spots.aliasSample.reduce((sum, page) => sum + page.unprefixedAttrHits, 0);
const unprefixedAliasRefresh = spots.aliasSample.filter((page) => page.unprefixedRefresh).length;

let prefixChecks;
let prefixGate = "pass";
if (args.profile === "subpath") {
  const articlePass = unprefixedArticleHits === 0 && doublePrefixInSample === 0;
  const assetsPass = articlePass && prefixedAssetEvidence > 0;
  const shardsPass =
    spots.shardCheck.manifestExists === true &&
    spots.shardCheck.manifestContainsBasePath === false &&
    spots.shardCheck.filesOnDisk === spots.shardCheck.filesInManifest &&
    spots.shardCheck.bundleInlinesBasePath !== null;
  // Alias pages are generated by the compile-time alias writer from raw
  // logical targets; the dry run records whether they honour the subpath.
  const aliasPass = unprefixedAliasHits === 0 && unprefixedAliasRefresh === 0;
  prefixChecks = {
    repoName: patterns.repoName,
    doublePrefixScan: {
      pattern: patterns.doublePrefix,
      filesScanned: scanState.scannedTextFiles,
      hits: scanState.doublePrefix.count,
      examples: scanState.doublePrefix.examples,
    },
    articlePages: {
      sampled: spots.articleSample.length,
      missingFromOut: spots.articleSample.filter((p) => !p.exists).map((p) => p.rel),
      pass: articlePass,
      unprefixedAttrHits: unprefixedArticleHits,
      unprefixedExamples: articlePagesWithBody.flatMap((page) => page.unprefixedDetail.filter((d) => d.hits > 0).map((d) => ({ rel: page.rel, ...d }))).slice(0, 25),
      doublePrefixInSample,
      prefixedDocsHrefs: articlePagesWithBody.reduce((sum, page) => sum + (page.prefixedDocsHrefs ?? 0), 0),
      canonicalSamples: articlePagesWithBody.slice(0, 5).map((page) => ({ rel: page.rel, canonical: page.canonical })),
    },
    assets: { pass: assetsPass, prefixedUrlEvidence: prefixedAssetEvidence },
    shardUrls: {
      pass: shardsPass,
      ...spots.shardCheck,
    },
    aliasPages: {
      pass: aliasPass,
      pageCount: spots.aliasPageCount,
      sampled: spots.aliasSample.length,
      unprefixedAttrHits: unprefixedAliasHits,
      unprefixedRefreshTargets: unprefixedAliasRefresh,
      examples: spots.aliasSample.slice(0, 3).map((page) => ({ rel: page.rel, refreshTarget: page.refreshTarget, href: page.unprefixedDetail.find((d) => d.kind === "href=/learn/fabric/docs/")?.example ?? null })),
    },
  };
  if (!articlePass || !assetsPass || !shardsPass || !aliasPass) prefixGate = "fail";
} else {
  prefixChecks = {
    leakageScan: {
      pattern: patterns.subBase,
      filesScanned: scanState.scannedTextFiles,
      hits: scanState.leakage.count,
      examples: scanState.leakage.examples,
    },
    articlePages: {
      sampled: spots.articleSample.length,
      missingFromOut: spots.articleSample.filter((p) => !p.exists).map((p) => p.rel),
      // Root profile: unprefixed asset URLs are CORRECT here; only the global
      // leakage scan above is a gate.
      unprefixedDocsHrefEvidence: articlePagesWithBody.reduce((sum, page) => sum + countOccurrences(readFileSync(path.join(OUT, page.rel), "utf8"), 'href="/learn/fabric/docs/'), 0),
      assetUrlEvidence: articlePagesWithBody.reduce((sum, page) => sum + (page.prefixedDocsAssets === 0 ? countOccurrences(readFileSync(path.join(OUT, page.rel), "utf8"), 'src="/fabric-docs-assets/') : 0), 0),
      canonicalSamples: articlePagesWithBody.slice(0, 5).map((page) => ({ rel: page.rel, canonical: page.canonical })),
    },
  };
  if (scanState.leakage.count > 0) prefixGate = "fail";
}

// --- checksums ----------------------------------------------------------------
const searchManifestRel = "fabric-search/manifest.json";
const assetManifestFile = path.join(BUILD_DIR, "route-registry", "asset-manifest.json");
const dependencyManifestFile = path.join(BUILD_DIR, "compiler-output", "dependency-manifest.json");
const sortedPublishedFirst = [...published].sort()[0];

const keyArtifacts = [
  "index.html",
  "404.html",
  "sitemap.xml",
  searchManifestRel,
  sortedPublishedFirst ? `${sortedPublishedFirst.replace(/^\//, "")}index.html` : null,
  spots.shardCheck.manifestExists
    ? `fabric-search/${JSON.parse(readFileSync(path.join(OUT, searchManifestRel), "utf8")).version}/${JSON.parse(readFileSync(path.join(OUT, searchManifestRel), "utf8")).files[0].name}`
    : null,
].filter(Boolean);
const checksumsOfKeyArtifacts = [];
for (const rel of keyArtifacts) {
  const file = path.join(OUT, rel);
  if (!existsSync(file)) continue;
  checksumsOfKeyArtifacts.push({ path: rel, bytes: statSync(file).size, sha256: sha256File(file) });
}
for (const [name, file] of [
  ["route-registry.json", path.join(BUILD_DIR, "route-registry", "route-registry.json")],
  ["asset-manifest.json", assetManifestFile],
  ["dependency-manifest.json", dependencyManifestFile],
]) {
  if (existsSync(file)) {
    checksumsOfKeyArtifacts.push({ path: `<build-dir>/…/${name}`, bytes: statSync(file).size, sha256: sha256File(file) });
  }
}

const searchManifestSha = existsSync(path.join(OUT, searchManifestRel)) ? sha256File(path.join(OUT, searchManifestRel)) : null;
const assetManifestSha = existsSync(assetManifestFile) ? sha256File(assetManifestFile) : null;

const byExtensionTop = [...byExt.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([extension, count]) => ({ extension, count }));

const outInventoryHash = (() => {
  const h = createHash("sha256");
  for (const f of files.map((f) => `${f.rel} ${f.size}`).sort()) h.update(f + "\n");
  return h.digest("hex");
})();

const manifest = {
  schema: "hansa.fabric-release-manifest/1",
  appSha,
  corpusRevision: registry.corpusRevision,
  registryRevision: registry.registryRevision,
  profile: args.profile,
  profileSettings: {
    basePath: profileSeed.basePath,
    publicOrigin: profileSeed.publicOrigin,
    canonicalOrigin: profileSeed.canonicalOrigin,
    trailingSlash: profileSeed.trailingSlash,
    assetOrigin: profileSeed.assetOrigin,
    robotsPolicy: profileSeed.robotsPolicy,
  },
  rendererVersion: JSON.parse(readFileSync(path.join(REPO, "package.json"), "utf8")).dependencies?.next ?? null,
  dependencyEvidence: existsSync(dependencyManifestFile)
    ? (() => {
        const dep = JSON.parse(readFileSync(dependencyManifestFile, "utf8"));
        return {
          schema: dep.schema ?? null,
          compiler: dep.compiler ?? null,
          manifestSha256: dep.manifestSha256 ?? null,
        };
      })()
    : null,
  coverage: {
    published: published.length,
    rendered,
    excluded: excluded.length,
    excludedPresent,
    mismatches: coverageMismatches,
  },
  prefixGate,
  prefixChecks,
  searchManifestSha,
  assetManifestSha,
  outputStats: {
    files: files.length,
    bytes,
    byExtensionTop,
    articleIndexHtml: files.filter((f) => f.rel.startsWith("learn/fabric/docs/") && f.rel.endsWith("index.html")).length,
    fabricAliasPages: spots.aliasPageCount ?? 0,
    searchVersionFiles: spots.shardCheck.filesOnDisk ?? 0,
    outInventoryHash,
  },
  checksumsOfKeyArtifacts,
  // ONLY the fields below are allowed to differ between two clean builds of
  // the same profile (reproducibility contract, FC12):
  timing: {
    generatedAt: new Date().toISOString(),
    cleanMs: Math.round(clean.ms),
    buildMs,
    buildMsIncludesPostbuild: true,
    scanMs: Math.round(scan.ms),
    totalMs: Math.round(Number(process.hrtime.bigint() - totalStart) / 1e6),
  },
};

const outDir = path.join(PACKAGING_DIR, args.profile);
mkdirSync(outDir, { recursive: true });
const manifestFile = path.join(outDir, "release-manifest.json");
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(
  path.join(outDir, "run-log.json"),
  JSON.stringify({ label, manifestFile, exitGate: { coverage: coverageMismatches.length, prefixGate }, timing: manifest.timing }, null, 2) + "\n",
);
console.log(`[fc12] manifest: ${manifestFile}`);

if (coverageMismatches.length > 0) {
  fail(`coverage verification FAILED (${coverageMismatches.length} mismatches) — fail-closed per RELEASE_AND_STORAGE.md.`, 1);
}
if (prefixGate === "fail") {
  const reason =
    args.profile === "subpath"
      ? `subpath single-prefix verification failed (doublePrefix=${scanState.doublePrefix.count}, unprefixedArticle=${unprefixedArticleHits}, alias=${unprefixedAliasHits})`
      : `root profile repository leakage (${scanState.leakage.count} files contain "${patterns.subBase}")`;
  fail(`${reason} — see prefixChecks in the manifest.`, 2);
}

console.log(`[fc12] OK: coverage PASS, prefix gate PASS. Total ${manifest.timing.totalMs} ms.`);
