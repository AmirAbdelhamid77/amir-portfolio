// Build the promoted default export, then mirror it for the side-by-side.
//
//   node scripts/build-rc.mjs            build `out/`, mirror to `out-rc/`
//   node scripts/build-rc.mjs --check    re-verify an existing pair
//
// R3-R6 are the default since D1 (2026-11-06, owner-approved pending final
// verification): a build with no `HANSA_*` variables carries the fan, the
// cinematic dealer, the closing and the polish layer. The two candidate-data
// slices stay off unless explicitly switched on: R1 and R2 read technical-review
// concepts and relations, which may never reach a public build. Publication
// readiness is a separate decision.
//
// Output:
//   out/     the promoted shipped export (pruned of the local-only review route)
//   out-rc/  an exact copy, so the E2E runner and the comparison page have a
//            stable second directory without a second build
//
// The script is deliberately boring: no source is rewritten, every switch is a
// build-time environment variable, and the profile is printed so the evidence
// can quote it verbatim.
import { cpSync, existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const RC = path.join(ROOT, "out-rc");
const SHIPPED = path.join(ROOT, "out");

// The promoted default is "no variables at all". These two must never be set by
// this script, whatever the caller's shell carries.
const OFF = ["HANSA_ATLAS_REVIEW_PREVIEW", "HANSA_NEIGHBOURHOOD_REVIEW"];

function build(extra, label) {
  const env = { ...process.env, ...extra };
  for (const key of OFF) delete env[key];
  console.log(`\n=== ${label} ===`);
  console.log(
    Object.entries(extra)
      .map(([key, value]) => `${key}=${value}`)
      .join(" ") || "(no HANSA_* variables)",
  );
  const result = spawnSync("npm", ["run", "build"], {
    cwd: ROOT,
    env,
    stdio: "inherit",
    shell: true,
  });
  // `next build` regenerates AGENTS.md from its own template; the repository
  // copy is authority, so restore it before anything reads the tree again.
  spawnSync("git", ["checkout", "--", "AGENTS.md"], { cwd: ROOT, shell: true });
  if (result.status !== 0) {
    throw new Error(`${label} build failed with exit ${result.status}`);
  }
}

function hash(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

// The review route is a local-only surface: with its flag off it renders
// `notFound()`, but `next build` still emits the error shell as
// `review/neighbourhood/index.html`. A static host would answer that path with
// 200, so a directory that exists but refuses to render would look like a
// reachable page. Removing it from the export makes the path a real 404 and
// keeps the publication boundary honest. The route source stays in the repo for
// local review builds.
function pruneReview(dir, label) {
  const target = path.join(dir, "review");
  if (!existsSync(target)) return false;
  rmSync(target, { recursive: true, force: true });
  console.log(`pruned ${label}: review/ removed from the export (local-only route)`);
  return true;
}

function inspect(dir, label) {
  const index = path.join(dir, "index.html");
  if (!existsSync(index)) throw new Error(`${label}: ${index} missing`);
  const html = readFileSync(index, "utf8");
  // The only `concept:fabric:` strings a public page may carry are the internal
  // keys of the accepted public insights (the stage links each edition to the
  // concept it teaches). Any other id would be candidate data that no accepted
  // edition references, so the build fails instead of shipping it.
  const insightIds = new Set(
    JSON.parse(readFileSync(path.join(ROOT, "content/knowledge/insights.json"), "utf8")).items.map(
      (entry) => entry.conceptId,
    ),
  );
  const conceptIds = [...new Set(html.match(/concept:fabric:[a-z0-9-]+/g) ?? [])];
  return {
    label,
    bytes: statSync(index).size,
    sha256: hash(index),
    polish: html.includes('data-stage-polish="true"'),
    fan: html.includes("stage-fan"),
    closingReview: html.includes("stage-close-quote"),
    dealerChunk: /dealer-cinematic/i.test(html),
    reviewRoute: html.includes("/review/neighbourhood"),
    conceptIds,
    unownedConceptIds: conceptIds.filter((id) => !insightIds.has(id)),
    edgeIds: (html.match(/edge:fabric:/g) ?? []).length,
    publishedConcepts: (html.match(/publishedConcepts\\?":0/g) ?? []).length,
    publishedEdges: (html.match(/publishedEdges\\?":0/g) ?? []).length,
  };
}

if (process.argv.includes("--check")) {
  const rc = inspect(RC, "out-rc");
  const shipped = inspect(SHIPPED, "out");
  console.log(JSON.stringify({ rc, shipped }, null, 2));
  const faults = [];
  for (const [label, entry] of [
    ["RC", rc],
    ["shipped", shipped],
  ]) {
    if (!entry.polish || !entry.fan || !entry.closingReview)
      faults.push(`${label} is missing an accepted design surface`);
    if (existsSync(path.join(ROOT, label === "RC" ? "out-rc" : "out", "review")))
      faults.push(`${label} export still contains the review route`);
    if (entry.edgeIds > 0) faults.push(`${label} HTML contains candidate edge ids`);
    if (entry.unownedConceptIds.length) faults.push(`${label} HTML contains unowned concept ids`);
    if (entry.publishedConcepts !== 1 || entry.publishedEdges !== 1)
      faults.push(`${label} does not state 0 published concepts and 0 published edges`);
  }
  if (rc.sha256 !== shipped.sha256) faults.push("the two exports are not identical bytes");
  if (faults.length) {
    console.error("\nFAILED:", faults.join("; "));
    process.exit(1);
  }
  console.log("\nPASS: existing exports are the promoted default.");
  process.exit(0);
}

build({}, "promoted default (no HANSA_* variables)");
pruneReview(SHIPPED, "promoted default");
rmSync(RC, { recursive: true, force: true });
cpSync(SHIPPED, RC, { recursive: true });

const rc = inspect(RC, "out-rc");
const shipped = inspect(SHIPPED, "out");

const problems = [];
for (const [label, entry] of [
  ["RC", rc],
  ["shipped", shipped],
]) {
  if (!entry.polish) problems.push(`${label} is missing the R6 polish attribute`);
  if (!entry.fan) problems.push(`${label} is missing the R3 fan markup`);
  if (!entry.closingReview) problems.push(`${label} is missing the R5 closing markup`);
  if (entry.edgeIds > 0) problems.push(`${label} HTML contains candidate edge ids`);
  if (entry.unownedConceptIds.length)
    problems.push(
      `${label} HTML contains concept ids no published insight references: ` +
        entry.unownedConceptIds.join(", "),
    );
  if (entry.reviewRoute) problems.push(`${label} links the review neighbourhood route`);
  if (entry.publishedConcepts !== 1 || entry.publishedEdges !== 1)
    problems.push(`${label} does not state 0 published concepts and 0 published edges`);
}
if (rc.sha256 !== shipped.sha256) problems.push("the mirrored export is not byte-identical");

console.log("\n=== profile summary ===");
console.log(JSON.stringify({ rc, shipped, problems }, null, 2));
if (problems.length) {
  console.error("\nFAILED:", problems.join("; "));
  process.exit(1);
}
console.log("\nPASS: promoted default built, review route pruned, export mirrored byte-for-byte.");
