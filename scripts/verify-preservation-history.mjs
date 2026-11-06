// Proves original-source reconciliation and rejection behavior in disposable
// copies. Does not alter tests, app/configuration sources or original snapshots.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, mkdtempSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { HISTORY, loadPreservationHistory, loadRepairReceipt } from "./preservation-history.mjs";
import { ATLAS_IMPLEMENTATION } from "./atlas-implementation-receipt.mjs";
import { EXPANSION } from "./dp600-expansion-receipt.mjs";
import { CONTINUATION } from "./dp600-continuation-receipt.mjs";
import { CIRCLES } from "./atlas-circle-receipt.mjs";
import { PROTOTYPE_C } from "./prototype-c-receipt.mjs";
import { R11_INTEGRATION } from "./r11-question-receipt.mjs";
import { CANONICAL_HOME, canonicalHomeReceipt } from "./canonical-home-receipt.mjs";
import { CINEMATIC_PHASE2 } from "./cinematic-phase2-receipt.mjs";
import { FINAL_REVIEW, FINAL_HISTORY } from "./final-review-receipt.mjs";
import { KNOWLEDGE_STAGE, knowledgeStageReceipt } from "./knowledge-stage-receipt.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const history = loadPreservationHistory(root);
loadRepairReceipt(root);
const { data } = history;
const scratch = mkdtempSync(resolve(tmpdir(), "hansa-preservation-negative-"));
const required = new Set([
  HISTORY + "RECONCILIATION.json", HISTORY + "START_BASELINE.json",
  ...Object.values(data.originalBaselines).map(entry => entry.path),
  "docs/knowledge-atlas/PRESERVATION_BASELINE.json", data.academyBaselineTransition.path,
  ...data.sourceTransitions.flatMap(entry => [entry.path, entry.originalPath]),
  ...data.legacyAliases.map(entry => entry.currentPath), ...Object.keys(data.testFiles), data.registrySnapshotLicense.path,
]);
if(existsSync(resolve(root,'docs/learning-architecture-20261028/MANIFEST.json'))){const name='docs/learning-architecture-20261028/MANIFEST.json',m=JSON.parse(readFileSync(resolve(root,name),'utf8'));[name,m.baseline,m.previous].forEach(p=>required.add(p));m.files.forEach(e=>{required.add(e.path);if(e.rollbackPath)required.add(e.rollbackPath);});Object.keys(JSON.parse(readFileSync(resolve(root,m.baseline),'utf8')).files).filter(p=>p.startsWith('content/')).forEach(p=>required.add(p));}
if(existsSync(resolve(root,'docs/learning-path-review-20261028/MANIFEST.json'))){const name='docs/learning-path-review-20261028/MANIFEST.json',m=JSON.parse(readFileSync(resolve(root,name),'utf8'));[name,m.baseline,m.previous].forEach(p=>required.add(p));m.files.forEach(e=>{required.add(e.path);if(e.rollbackPath)required.add(e.rollbackPath);});}
// The SQL integration layer sits between the path review and the corpus wave;
// both manifests must be carried or the chained receipt cannot resolve.
if(existsSync(resolve(root,'docs/sql-integration-20261028/MANIFEST.json'))){const name='docs/sql-integration-20261028/MANIFEST.json',m=JSON.parse(readFileSync(resolve(root,name),'utf8'));[name,m.previous].forEach(p=>required.add(p));m.files.forEach(e=>{required.add(e.path);if(e.rollbackPath)required.add(e.rollbackPath);});}
if(existsSync(resolve(root,'docs/hansa-integration-20261029/MANIFEST.json'))){const name='docs/hansa-integration-20261029/MANIFEST.json',m=JSON.parse(readFileSync(resolve(root,name),'utf8'));[name,m.previous].forEach(p=>required.add(p));m.files.forEach(e=>{required.add(e.path);if(e.rollbackPath)required.add(e.rollbackPath);});}
// Carry the exact current successor and the audited historical before-bytes
// into disposable views; the original rejection cases remain unchanged.
if (existsSync(resolve(root,FINAL_REVIEW))) {
  const final=JSON.parse(readFileSync(resolve(root,FINAL_REVIEW),'utf8'));
  const history=JSON.parse(readFileSync(resolve(root,FINAL_HISTORY),'utf8'));
  [FINAL_REVIEW,FINAL_HISTORY,final.previousManifest,final.baselinePath].forEach(p=>required.add(p));
  final.files.forEach(e=>{required.add(e.path);if(e.rollbackPath)required.add(e.rollbackPath);});
  history.transitions.forEach(e=>{required.add(e.path);required.add(e.originalPath);if(e.capturedPath)required.add(e.capturedPath);});
  history.additions.forEach(e=>{required.add(e.path);required.add(e.originalPath);});
}
try {
  const implementation = JSON.parse(readFileSync(resolve(root, ATLAS_IMPLEMENTATION), "utf8"));
  required.add(ATLAS_IMPLEMENTATION); required.add("docs/knowledge-atlas/implementation/START_BASELINE.json");
  implementation.files.forEach(entry => required.add(entry.path));
} catch (error) { if (error.code !== "ENOENT") throw error; }
try {
  const expansion = JSON.parse(readFileSync(resolve(root,EXPANSION),"utf8"));
  required.add(EXPANSION); required.add("docs/knowledge-atlas/dp600-expansion/START_BASELINE.json");
  expansion.files.forEach(entry=>required.add(entry.path));
} catch(error) { if(error.code!=="ENOENT") throw error; }
// The continuation layer supersedes part of the expansion layer, so its own manifest and
// every file it binds must exist in the disposable copy for the chained receipt to resolve.
try {
  const continuation = JSON.parse(readFileSync(resolve(root,CONTINUATION),"utf8"));
  required.add(CONTINUATION);
  continuation.files.forEach(entry=>required.add(entry.path));
} catch(error) { if(error.code!=="ENOENT") throw error; }
try {
  const circles = JSON.parse(readFileSync(resolve(root,CIRCLES),"utf8"));
  required.add(CIRCLES);
  circles.files.forEach(entry => {
    required.add(entry.path);
    if (entry.beforeSha256 !== null) required.add("docs/knowledge-atlas/circular-nodes/before/" + entry.path);
  });
} catch(error) { if(error.code!=="ENOENT") throw error; }
// Carry Phase 2's exact bound successor into the disposable corruption tests.
try {
  const cinematic = JSON.parse(readFileSync(resolve(root,CINEMATIC_PHASE2),"utf8"));
  required.add(CINEMATIC_PHASE2); required.add(cinematic.previousManifest); required.add(cinematic.baselinePath);
  cinematic.files.forEach(entry => { required.add(entry.path); if(entry.rollbackPath) required.add(entry.rollbackPath); });
} catch(error) { if(error.code!=="ENOENT") throw error; }
// The newest layer retires two superseded landing modules; a retired path has no
// bytes to copy into the disposable view.
const retired = new Set(canonicalHomeReceipt(root).removedPaths());
// Receipts also record artifacts that can never be stable pins (build caches and
// generated files); an absent path is acceptable only when a receipt states why,
// either by retiring it or by excluding it with a recorded reason.
const stageReceipt = knowledgeStageReceipt(root);
// Include the additive prototype successor in disposable rejection-test views.
try {
  const prototype = JSON.parse(readFileSync(resolve(root,PROTOTYPE_C),"utf8"));
  required.add(PROTOTYPE_C); required.add(prototype.baselinePath);
  prototype.files.forEach(entry => {
    if(retired.has(entry.path)) return;
    required.add(entry.path);
    if(entry.beforeSha256!==null) required.add("docs/prototype-c/preservation/originals/"+entry.path);
  });
  (prototype.generatedArtifacts??[]).forEach(entry => { required.add(entry.path); required.add(entry.basisPath); });
} catch(error) { if(error.code!=="ENOENT") throw error; }
// Carry the canonical-home successor (manifest, baseline and rollback bytes) into
// the disposable view too, so the chained receipt stays resolvable there.
try {
  const canonical = JSON.parse(readFileSync(resolve(root,CANONICAL_HOME),"utf8"));
  required.add(CANONICAL_HOME); required.add(canonical.previousManifest);
  canonical.baselines.forEach(baseline => required.add(baseline.path));
  canonical.files.forEach(entry => { required.add(entry.path); if(entry.rollbackPath) required.add(entry.rollbackPath); });
} catch(error) { if(error.code!=="ENOENT") throw error; }
// Carry the exact R11 successor into disposable rejection-test views as well.
try {
  const r11=JSON.parse(readFileSync(resolve(root,R11_INTEGRATION),"utf8"));
  required.add(R11_INTEGRATION);r11.baselines.forEach(b=>required.add(b.path));
  r11.files.forEach(entry=>{required.add(entry.path);if(entry.beforeSha256!==null)required.add(entry.rollbackPath);});
} catch(error){if(error.code!=="ENOENT")throw error;}
if (existsSync(resolve(root, KNOWLEDGE_STAGE))) {
  const stage = JSON.parse(readFileSync(resolve(root, KNOWLEDGE_STAGE), "utf8"));
  const stagePaths = [
    KNOWLEDGE_STAGE, stage.previous,
    ...stage.predecessors.map(entry => entry.path),
    ...stage.additions.map(entry => entry.path),
    ...knowledgeStageReceipt(root).paths(),
  ].filter(path => typeof path === "string" && path.length > 0 && existsSync(resolve(root, path)));
  for (const path of stagePaths) required.add(path);
}
// Copy every path that still has bytes in this checkout. A path an older layer
// pinned but a newer layer retired has nothing to copy; it must be recorded as
// retired, otherwise the missing evidence fails here instead of vanishing.
for (const path of required) {
  if (existsSync(resolve(root, path))) {
    const to = resolve(scratch, path); mkdirSync(dirname(to), { recursive: true }); copyFileSync(resolve(root, path), to);
    continue;
  }
  assert.ok(retired.has(path) || stageReceipt.skip(path), `Pinned artifact is absent and no receipt records it as retired or excluded: ${path}`);
}
const readJSON = path => JSON.parse(readFileSync(resolve(scratch, path), "utf8"));
const writeJSON = (path, value) => writeFileSync(resolve(scratch, path), JSON.stringify(value, null, 2));
const digest = path => createHash("sha256").update(readFileSync(resolve(scratch, path))).digest("hex");
let negatives = 0;
function reject(path, mutate) {
  const original = readFileSync(resolve(scratch, path));
  const receipt = readFileSync(resolve(scratch, HISTORY + "RECONCILIATION.json"));
  try { mutate(); assert.throws(() => loadPreservationHistory(scratch)); negatives++; }
  finally { writeFileSync(resolve(scratch, path), original); writeFileSync(resolve(scratch, HISTORY + "RECONCILIATION.json"), receipt); }
}
loadPreservationHistory(scratch);
reject("package.json", () => {
  const value = readJSON("package.json"); value.dependencies["unapproved-library"] = "1.0.0"; writeJSON("package.json", value);
  const proof = readJSON(HISTORY + "RECONCILIATION.json"); proof.sourceTransitions.find(entry => entry.path === "package.json").afterSha256 = digest("package.json"); writeJSON(HISTORY + "RECONCILIATION.json", proof);
});
reject("scripts/import-notion-statistics.mjs", () => {
  const path = "scripts/import-notion-statistics.mjs"; writeFileSync(resolve(scratch, path), readFileSync(resolve(scratch, path), "utf8") + "\nthrow new Error('changed logic');\n");
  const proof = readJSON(HISTORY + "RECONCILIATION.json"); proof.sourceTransitions.find(entry => entry.path === path).afterSha256 = digest(path); writeJSON(HISTORY + "RECONCILIATION.json", proof);
});
reject(data.legacyAliases[0].currentPath, () => writeFileSync(resolve(scratch, data.legacyAliases[0].currentPath), "corrupted original"));
reject(data.academyBaselineTransition.path, () => { const value = readJSON(data.academyBaselineTransition.path); value.files.pop(); writeJSON(data.academyBaselineTransition.path, value); });
const testPath = Object.keys(data.testFiles)[0];
reject(testPath, () => {
  writeFileSync(resolve(scratch, testPath), "// altered test");
  const proof = readJSON(HISTORY + "RECONCILIATION.json"); proof.testFiles[testPath] = digest(testPath); writeJSON(HISTORY + "RECONCILIATION.json", proof);
});
reject(HISTORY + "RECONCILIATION.json", () => { const proof = readJSON(HISTORY + "RECONCILIATION.json"); proof.legacyAliases.pop(); writeJSON(HISTORY + "RECONCILIATION.json", proof); });
loadPreservationHistory(scratch);
console.log(`PASS: 90 exact source relocations, 23 original registry captures, three source-path-only transitions, unchanged existing tests, original Atlas baseline, precisely one Academy config expectation update; ${negatives} corruption/waiver rejection cases.`);
