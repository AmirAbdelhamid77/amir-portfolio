// FC01 benchmark harness — measures a complete export without deploying anything.
//   node tools/fabric-corpus/bench/measure-export.mjs [--no-build] [--label NAME]
// Output: FABRIC_CORPUS_BUILD_DIR/bench/<label>.json
// FC13 extends this with peak-RSS capture per platform; wall time and output
// metrics are already authoritative.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const noBuild = args.includes("--no-build");
const labelIndex = args.indexOf("--label");
const label = labelIndex >= 0 ? args[labelIndex + 1] : `export-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const REPO = path.resolve(import.meta.dirname, "..", "..", "..");
const OUT = path.join(REPO, "out");
const BUILD_DIR = process.env.FABRIC_CORPUS_BUILD_DIR || path.resolve(REPO, "..", "fabric-corpus-build");

function gitSha() {
  const r = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : `unknown(${r.status})`;
}

function timed(fn) {
  const start = process.hrtime.bigint();
  const result = fn();
  return { result, ms: Number(process.hrtime.bigint() - start) / 1e6 };
}

function scan(dir, base = dir, acc = { files: [], bytes: 0 }) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full, base, acc);
    else {
      const size = statSync(full).size;
      acc.files.push({ rel: path.relative(base, full).replaceAll("\\", "/"), size });
      acc.bytes += size;
    }
  }
  return acc;
}

const report = { label, timestamp: new Date().toISOString(), appSha: gitSha(), node: process.version, platform: process.platform, cpus: (() => { try { return require("node:os").cpus().length; } catch { return null; } })() };

if (!noBuild) {
  const build = timed(() => spawnSync("npm", ["run", "build"], { cwd: REPO, stdio: "inherit", shell: process.platform === "win32" }));
  report.buildExitCode = build.result.status;
  report.buildMs = Math.round(build.ms);
  if (build.result.status !== 0) { console.error(`Build failed (${build.result.status}); report still written.`); }
  const alias = timed(() => spawnSync("node", ["scripts/export-segment-aliases.mjs"], { cwd: REPO, stdio: "inherit" }));
  report.aliasMs = Math.round(alias.ms);
  report.aliasExitCode = alias.result.status;
}

if (!existsSync(OUT)) { report.error = "out/ missing"; }
else {
  const scanned = timed(() => scan(OUT));
  const byExt = new Map();
  for (const f of scanned.result.files) {
    const ext = path.extname(f.rel).toLowerCase() || "(none)";
    byExt.set(ext, (byExt.get(ext) ?? 0) + 1);
  }
  const top = [...scanned.result.files].sort((a, b) => b.size - a.size).slice(0, 20).map((f) => ({ ...f, mb: +(f.size / 1048576).toFixed(2) }));
  const topLevel = new Map();
  for (const f of scanned.result.files) {
    const seg = f.rel.split("/")[0];
    topLevel.set(seg, (topLevel.get(seg) ?? 0) + 1);
  }
  report.out = {
    fileCount: scanned.result.files.length,
    bytes: scanned.result.bytes,
    mb: +(scanned.result.bytes / 1048576).toFixed(1),
    byExtension: Object.fromEntries([...byExt.entries()].sort((a, b) => b[1] - a[1])),
    byTopLevelDir: Object.fromEntries([...topLevel.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)),
    largest: top,
    scanMs: Math.round(scanned.ms),
    outHash: (() => { const h = createHash("sha256"); const names = scanned.result.files.map((f) => `${f.rel} ${f.size}`).sort(); for (const n of names) h.update(n + "\n"); return h.digest("hex"); })(),
  };
}

const benchDir = path.join(BUILD_DIR, "bench");
mkdirSync(benchDir, { recursive: true });
const file = path.join(benchDir, `${label}.json`);
writeFileSync(file, JSON.stringify(report, null, 2) + "\n");
console.log(`Report: ${file}`);
if (report.out) console.log(`out/: ${report.out.fileCount} files, ${report.out.mb} MB, build ${report.buildMs ?? "(skipped)"} ms, aliases ${report.aliasMs ?? "(skipped)"} ms`);
