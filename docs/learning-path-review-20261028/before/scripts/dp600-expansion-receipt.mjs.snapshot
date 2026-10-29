import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { continuationReceipt } from "./dp600-continuation-receipt.mjs";
export const EXPANSION = "docs/knowledge-atlas/dp600-expansion/INTEGRATION_MANIFEST.json";
export function expansionReceipt(root) {
  if (!existsSync(resolve(root,EXPANSION))) return { expected: (_p,old)=>old };
  const continuation = continuationReceipt(root);
  const manifest=JSON.parse(readFileSync(resolve(root,EXPANSION),"utf8"));
  assert.equal(manifest.scope,"dp600-question-intake-and-atlas-expansion-2026-10-26");
  const baselineRaw=readFileSync(resolve(root,"docs/knowledge-atlas/dp600-expansion/START_BASELINE.json"));
  assert.equal(createHash("sha256").update(baselineRaw).digest("hex"),manifest.baselineSha256);
  const baseline=JSON.parse(baselineRaw);
  assert.equal(new Set(manifest.files.map(e=>e.path)).size,manifest.files.length);
  for(const e of manifest.files){const p=resolve(root,e.path);assert.ok(p.startsWith(root+sep));assert.equal(e.beforeSha256,baseline.files[e.path]??null);assert.equal(createHash("sha256").update(readFileSync(p)).digest("hex"),continuation.expected(e.path,e.sha256),"DP600 expansion drift: "+e.path);}
  return { expected(path,old){return continuation.expected(path,manifest.files.find(e=>e.path===path&&e.beforeSha256===old)?.sha256??old);} };
}
