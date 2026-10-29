// Proves original-source reconciliation and rejection behavior in disposable
// copies. Does not alter tests, app/configuration sources or original snapshots.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, mkdtempSync } from "node:fs";
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
// Include the additive prototype successor in disposable rejection-test views.
try {
  const prototype = JSON.parse(readFileSync(resolve(root,PROTOTYPE_C),"utf8"));
  required.add(PROTOTYPE_C); required.add(prototype.baselinePath);
  prototype.files.forEach(entry => {
    required.add(entry.path);
    if(entry.beforeSha256!==null) required.add("docs/prototype-c/preservation/originals/"+entry.path);
  });
  (prototype.generatedArtifacts??[]).forEach(entry => { required.add(entry.path); required.add(entry.basisPath); });
} catch(error) { if(error.code!=="ENOENT") throw error; }
// Carry the exact R11 successor into disposable rejection-test views as well.
try {
  const r11=JSON.parse(readFileSync(resolve(root,R11_INTEGRATION),"utf8"));
  required.add(R11_INTEGRATION);r11.baselines.forEach(b=>required.add(b.path));
  r11.files.forEach(entry=>{required.add(entry.path);if(entry.beforeSha256!==null)required.add(entry.rollbackPath);});
} catch(error){if(error.code!=="ENOENT")throw error;}
for (const path of required) { const to = resolve(scratch, path); mkdirSync(dirname(to), { recursive: true }); copyFileSync(resolve(root, path), to); }
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
