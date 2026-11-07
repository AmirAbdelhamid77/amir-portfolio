// Record pin hops for reviewed changes, so the knowledge-stage receipt keeps
// checking bytes instead of being loosened.
//
//   node scripts/pin-integration.mjs            report only
//   node scripts/pin-integration.mjs --apply    append hops, then print the result
//   node scripts/pin-integration.mjs --add lib/x.ts --layer=A --attribution=B --apply
//                                               also pin runtime files no layer owns
//
// The tool never rewrites a recorded hash. A changed file gets one hop from the
// hash the chain currently expects to the bytes on disk, carrying the phase
// attribution below. It records bytes only: it cannot publish anything, and a
// missing file or a reappearing retired path is reported instead of pinned.
//
// `--add` exists for a phase that adds runtime files and forgets to pin them:
// both integrity verifiers walk app/lib/components/content/public/tests and
// reject anything no layer owns. It pins the bytes it finds and nothing more.
//
// Note: this script must not import the receipt chain. That chain verifies as it
// loads, so a single drifted file would abort the tool that exists to record it.
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "..");
const M0 = "docs/knowledge-stage-m0-20261103/INTEGRATION_MANIFEST.json";
const M6 = "docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json";
const LAYER = "release-readiness/2026-11-06";
const ATTRIBUTION = "release-readiness-integration";
const NOTE =
  "Release-readiness integration: the file changed as part of the accepted R1-R6 " +
  "integration and the release-candidate tooling. The hop records the new bytes " +
  "for the slice named in the phase report; no publication state moved.";

const argv = process.argv.slice(2);
const arg = (name, fallback) =>
  argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const apply = argv.includes("--apply");
const ADD_LAYER = arg("layer", LAYER);
const ADD_ATTRIBUTION = arg("attribution", ATTRIBUTION);
const read = (p) => readFileSync(resolve(root, p), "utf8");
const hash = (p) => createHash("sha256").update(readFileSync(resolve(root, p))).digest("hex");
const m0 = JSON.parse(read(M0));
const m6 = JSON.parse(read(M6));

const expected = (p, start) => {
  let current = start;
  for (let hop = 0; hop < 32; hop += 1) {
    const pin = m6.files.find((e) => e.path === p && e.previousSha256 === current);
    if (pin) {
      current = pin.sha256;
      continue;
    }
    if (current === null) {
      const addition = m6.additions.find((e) => e.path === p);
      if (addition) {
        current = addition.sha256;
        continue;
      }
    }
    return current;
  }
  assert.fail("pin chain does not terminate for " + p);
};

const hops = [];
const record = (path, previousSha256) => {
  if (!existsSync(resolve(root, path))) return;
  if (hops.some((h) => h.path === path)) return;
  const disk = hash(path);
  if (disk !== previousSha256) hops.push({ path, previousSha256, sha256: disk });
};

// Already-pinned paths (M0 files and additions).
for (const e of [...m0.files, ...m0.additions]) record(e.path, expected(e.path, e.sha256));
// Terminal pins inside the M6 layer itself.
for (const e of [...m6.files, ...m6.additions]) {
  const superseded =
    m6.files.some((f) => f.path === e.path && f.previousSha256 === e.sha256) ||
    (e.previousSha256 === null && m6.additions.some((a) => a.path === e.path));
  if (superseded) continue;
  record(e.path, e.sha256);
}

const missing = [...m0.files, ...m0.additions, ...m6.files, ...m6.additions]
  .map((e) => e.path)
  .filter((p) => !existsSync(resolve(root, p)));
const reclaimed = m0.removed.filter((e) => existsSync(resolve(root, e.path))).map((e) => e.path);

// `--add <path>...` pins runtime files that no layer owns. The integrity
// verifiers name the file they reject; this takes that path, never a wildcard,
// so a phase cannot quietly pin a whole tree.
const addPaths = argv.includes("--add")
  ? argv.slice(argv.indexOf("--add") + 1).filter((value) => !value.startsWith("--"))
  : [];
const alreadyOwned = new Set(
  [...m0.files, ...m0.additions, ...m6.files, ...m6.additions].map((e) => e.path),
);
const additions = addPaths.filter((p) => !alreadyOwned.has(p));
const unknown = additions.filter((p) => !existsSync(resolve(root, p)));

console.log("layer:", LAYER);
console.log("hops needed:", hops.length);
for (const h of hops) console.log("  hop ", h.path, h.previousSha256.slice(0, 12), "->", h.sha256.slice(0, 12));
console.log("missing pinned files:", missing.length);
for (const p of missing) console.log("  lost", p);
console.log("retired paths that reappeared:", reclaimed.length);
for (const p of reclaimed) console.log("  back", p);
console.log("new runtime files to pin:", additions.length);
for (const p of additions) console.log("  new", p);
if (unknown.length) {
  console.error("\nNot on disk:", unknown.join(", "));
  process.exit(1);
}

if (!apply && !additions.length) {
  console.log("\nreport only; pass --apply to record hops, or --add <path> to pin new runtime files.");
  process.exit(0);
}
if (!apply) {
  console.log("\nadditions are reports; pass --apply to record them.");
  process.exit(0);
}
if (reclaimed.length || missing.length) {
  console.error("\nResolve missing/reappearing paths by hand; refusing to pin around them.");
  process.exit(1);
}

for (const h of hops) {
  m6.files.push({
    path: h.path,
    previousSha256: h.previousSha256,
    sha256: h.sha256,
    bytes: statSync(resolve(root, h.path)).size,
    layer: LAYER,
    attribution: ATTRIBUTION,
    note: NOTE,
  });
}
for (const p of additions) {
  m6.additions.push({
    path: p,
    sha256: hash(p),
    bytes: statSync(resolve(root, p)).size,
    layer: ADD_LAYER,
    attribution: ADD_ATTRIBUTION,
    note: `Added by the ${ADD_ATTRIBUTION} phase. Pinned so the runtime inventory stays exact; the layer records bytes only and cannot publish anything.`,
  });
}
writeFileSync(resolve(root, M6), JSON.stringify(m6, null, 2) + "\n");
console.log("\nrecorded:", hops.length, "hops,", additions.length, "new runtime files");
