// Read-only source parity, not a scientific/content-completeness certification.
// node scripts/audit-recovery-sources.mjs [--output <report.json>]
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = resolve(app, "..");
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const pairs = [
  ["r18-learner", "Hansa_DP600_R18_ISOLATED_VERIFIED_HANDOFF_NO_GO_2026-10-27/LEARNER_CANDIDATE/R18_222_QUESTIONS_IMAGEFREE_UNGRADED.json", "content/recovery/r18-learner-bank.json"],
  ["rti-blueprints", "Hansa_Fabric_RTI_Authentic_Source_Milestone/LAB_BLUEPRINTS.json", "content/recovery/rti-lab-blueprints.json"],
  ...["lessons", "modules", "paths"].map(name => [`patterns-${name}`, `Hansa_Notion_Creative_Patterns_Knowledge_Package_2026-10-27/LEARNING/${name}.json`, `content/recovery/patterns-${name}.json`]),
  ["reference-input", "hansa-integration/data/catalogue/reference_records.jsonl", "content/intake/hansa-integration/reference_records.jsonl"],
  ["experiment-input", "hansa-integration/data/catalogue/experiment_records.jsonl", "content/intake/hansa-integration/experiment_records.jsonl"],
  ["study-hub", "DP-600___PL-300_Study_Hub.html", "public/study-hub/dp600-pl300-study-hub.html"],
];
function compare(id, source, target) {
  if (!existsSync(resolve(workspace, source))) return { id, source, target, status: "BLOCKED_SOURCE_NOT_AVAILABLE" };
  if (!existsSync(resolve(app, target))) return { id, source, target, status: "FAIL_TARGET_MISSING" };
  const a = readFileSync(resolve(workspace, source)), b = readFileSync(resolve(app, target));
  let status = a.equals(b) ? "PASS_BYTE_IDENTICAL" : "FAIL_DIFFERENT";
  if (status === "FAIL_DIFFERENT" && source.endsWith(".json")) {
    if (isDeepStrictEqual(JSON.parse(a), JSON.parse(b))) status = "PASS_JSON_IDENTICAL_SERIALIZATION_DIFFERS";
  }
  return { id, source, target, status, sourceSha256: sha256(a), targetSha256: sha256(b) };
}
function filesUnder(root, prefix = "") {
  return readdirSync(resolve(root, prefix), { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error("Source audit refuses link traversal: " + entry.name);
    const p = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? filesUnder(root, p) : /\.(html|svg)$/i.test(p) ? [p] : [];
  }).sort();
}
const comparisons = pairs.map(args => compare(...args));
const storytelling = existsSync(resolve(workspace, "storytelling"))
  ? filesUnder(resolve(workspace, "storytelling")).map(p => compare("storytelling:" + p, "storytelling/" + p, "public/storytelling/" + p))
  : [{ id: "storytelling", status: "BLOCKED_SOURCE_NOT_AVAILABLE" }];
const all = [...comparisons, ...storytelling];
const report = {
  scope: "eight-recovery-artifacts-and-recursive-storytelling-html-svg-parity",
  limits: "File/parsed-JSON parity only. Not a full workspace audit, factual review, rights clearance, navigation verification or deployment approval. Restricted bytes never copied.",
  summary: { checked: all.length, passed: all.filter(row => row.status.startsWith("PASS")).length,
    failed: all.filter(row => row.status.startsWith("FAIL")).length, blocked: all.filter(row => row.status.startsWith("BLOCKED")).length },
  comparisons, storytelling,
  protectedNotCertified: ["HansaDatabase full corpus", "PL-300 private question bytes", "R18 PRIVATE_QA", "delivery/recovery snapshots", "code/dataset indexes", "all other intake/export units"],
};
const outputIndex = process.argv.indexOf("--output");
if (outputIndex >= 0) {
  if (!process.argv[outputIndex + 1]) throw new Error("--output requires a report path");
  writeFileSync(resolve(app, process.argv[outputIndex + 1]), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report.summary));
} else console.log(JSON.stringify(report, null, 2));
if (report.summary.failed || report.summary.blocked) process.exitCode = 1;
