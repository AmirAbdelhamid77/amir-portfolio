// FC07 — copy built search shards into the app's public tree.
//
//   node tools/fabric-corpus/search/copy-shards.mjs [--version=<v...>]
//   node tools/fabric-corpus/search/copy-shards.mjs --all
//
// Reads <build-dir>/search-shards/<version>/ (build-shards.mjs output) and
// writes, deterministically:
//   public/fabric-search/manifest.json           copy of the versioned manifest
//   public/fabric-search/<version>/shard-*.json   immutable content-hashed shards
//   public/fabric-search/<version>/routing-*.json term-routing postings
//
// Public-asset assumption (RELEASE_AND_STORAGE.md, next.config.ts): the site is
// `output: "export"`, and Next.js copies `public/**` verbatim into `out/**` —
// the same mechanism the existing `public/fabric-docs-assets/**` tree already
// relies on (components/fabric/article/ArticleBody.tsx references
// /fabric-docs-assets/... URLs that resolve only because of that copy). No
// build is run here; the lead's build verifies the copied tree.
//
// Only the files listed in the manifest are copied; nothing else is picked up.
// Never imports JSON (fs reads); no git, no network, no clock in output.
//
// NOTE FOR THE LEAD: public/fabric-search/** is generated output. It should be
// added to .gitignore (shared file — FC07 does not edit it) and rebuilt by CI
// before `next build`, exactly like the other build-dir outputs.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(here, "..", "..", "..");
const DEFAULT_BUILD_DIR = process.env.FABRIC_CORPUS_BUILD_DIR
  ? path.resolve(process.env.FABRIC_CORPUS_BUILD_DIR)
  : path.resolve(REPO_ROOT, "..", "fabric-corpus-build");
// FABRIC_PUBLIC_ROOT lets a clean-room run publish the shards into a disposable
// tree for byte comparison instead of the live public/ directory.
const PUBLIC_SEARCH_DIR = process.env.FABRIC_PUBLIC_ROOT
  ? path.join(path.resolve(process.env.FABRIC_PUBLIC_ROOT), "fabric-search")
  : path.join(REPO_ROOT, "public", "fabric-search");

function parseArgs(argv) {
  const args = { versions: null, buildDir: DEFAULT_BUILD_DIR };
  for (const raw of argv) {
    const match = /^--([a-zA-Z-]+)=(.*)$/.exec(raw);
    if (match && match[1] === "version") args.versions = [match[2].trim()];
    else if (raw === "--all") args.versions = "all";
    else if (match && match[1] === "build-dir") args.buildDir = path.resolve(match[2]);
    else throw new Error(`copy-shards: unsupported argument ${raw}`);
  }
  return args;
}

function copyOne(buildDir, version, report) {
  const sourceDir = path.join(buildDir, "search-shards", version);
  const manifestPath = path.join(sourceDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`copy-shards: manifest missing at ${manifestPath} — run build-shards.mjs first`);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.version !== version) {
    throw new Error(`copy-shards: manifest version ${manifest.version} does not match directory ${version}`);
  }
  // DEFECT-2 aggregate reconciliation (fail-closed, Wave-4): per-file
  // articleCount counts article records INSIDE that file, so the SHARD-role
  // files must sum to the manifest's article aggregate, and — when the fixed
  // manifest carries `distinctArticles` — the routing file must contribute 0.
  // Legacy manifests (pre-fix, without distinctArticles) keep the same
  // shard-sum invariant, so both generations verify under this gate.
  const shardSum = manifest.files
    .filter((file) => file.role === "shard")
    .reduce((sum, file) => sum + file.articleCount, 0);
  if (shardSum !== manifest.articleCount) {
    throw new Error(
      `copy-shards: shard-role articleCount sum ${shardSum} does not equal manifest.articleCount ${manifest.articleCount} — refusing to publish an unreconcilable index`,
    );
  }
  if (manifest.distinctArticles !== undefined && manifest.distinctArticles !== null) {
    if (manifest.distinctArticles !== manifest.articleCount) {
      throw new Error(
        `copy-shards: manifest.distinctArticles ${manifest.distinctArticles} does not equal manifest.articleCount ${manifest.articleCount} — refusing to publish`,
      );
    }
    const routingSum = manifest.files
      .filter((file) => file.role === "routing")
      .reduce((sum, file) => sum + (file.articleCount ?? 0), 0);
    if (routingSum !== 0) {
      throw new Error(
        `copy-shards: routing-role files carry articleCount ${routingSum} — routing holds postings, not articles; rebuild the shards (build-shards.mjs) so per-file sums reconcile`,
      );
    }
  }

  const versionDir = path.join(PUBLIC_SEARCH_DIR, version);
  rmSync(versionDir, { recursive: true, force: true });
  mkdirSync(versionDir, { recursive: true });

  let bytes = 0;
  for (const file of manifest.files) {
    const from = path.join(sourceDir, file.name);
    const to = path.join(versionDir, file.name);
    copyFileSync(from, to);
    const actual = readFileSync(to);
    if (actual.byteLength !== file.bytes) {
      throw new Error(`copy-shards: copied ${file.name} has ${actual.byteLength} bytes, manifest says ${file.bytes}`);
    }
    bytes += file.bytes;
  }
  // The public manifest pointer: the client fetches /fabric-search/manifest.json
  // and derives the versioned shard URLs from its contents.
  copyFileSync(manifestPath, path.join(PUBLIC_SEARCH_DIR, "manifest.json"));

  report.push({
    version,
    files: manifest.files.length + 1,
    bytes: bytes + statSize(manifestPath),
    articleCount: manifest.articleCount,
    distinctArticles: manifest.distinctArticles ?? manifest.articleCount,
    shardCount: manifest.shardCount,
  });
}

function statSize(absPath) {
  try {
    return readFileSync(absPath).byteLength;
  } catch {
    return 0;
  }
}

/** Newest version directory by mtime (deterministic tie-break by name). */
function newestVersion(shardsRoot) {
  let best = null;
  let bestKey = -1;
  for (const name of readdirSync(shardsRoot)) {
    const dir = path.join(shardsRoot, name);
    if (!existsSync(path.join(dir, "manifest.json"))) continue;
    const mtime = statSync(dir).mtimeMs;
    const key = mtime * 1000 + (name < (best ?? "") ? 0 : 1);
    if (key > bestKey) {
      bestKey = key;
      best = name;
    }
  }
  if (!best) throw new Error(`copy-shards: no built version found under ${shardsRoot}`);
  return best;
}

function run(argv) {
  const args = parseArgs(argv);
  const shardsRoot = path.join(args.buildDir, "search-shards");
  if (!existsSync(shardsRoot)) {
    throw new Error(`copy-shards: no shards built under ${shardsRoot} — run build-shards.mjs first`);
  }
  let versions = args.versions;
  if (!versions) {
    // Default: the most recently built version (stale builds stay put).
    versions = [newestVersion(shardsRoot)];
  } else if (versions === "all") {
    versions = readdirSync(shardsRoot).filter((name) => existsSync(path.join(shardsRoot, name, "manifest.json"))).sort();
  }
  mkdirSync(PUBLIC_SEARCH_DIR, { recursive: true });
  const report = [];
  for (const version of versions) copyOne(args.buildDir, version, report);

  // The public tree carries exactly the copied versions: the manifest.json
  // pointer is the authority, older version dirs are dead weight.
  const keep = new Set(versions);
  for (const name of readdirSync(PUBLIC_SEARCH_DIR)) {
    if (name === "manifest.json") continue;
    if (!keep.has(name)) {
      rmSync(path.join(PUBLIC_SEARCH_DIR, name), { recursive: true, force: true });
    }
  }
  return report;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirectRun) {
  const report = run(process.argv.slice(2));
  for (const row of report) {
    console.log(`PASS  copied ${row.shardCount} shards (${row.files} files, ${(row.bytes / 1e6).toFixed(1)} MB) → public/fabric-search/${row.version}/`);
  }
  console.log("      NOTE: public/fabric-search/** is generated — ask the lead to gitignore it (shared .gitignore, FC07 does not edit it).");
}

export { run, parseArgs };
