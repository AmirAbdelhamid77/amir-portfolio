import {existsSync,readFileSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
export const KNOWLEDGE_STAGE='docs/knowledge-stage-m0-20261103/INTEGRATION_MANIFEST.json';
// Newest receipt layer: M0 re-baseline, 3 Nov 2026.
//
// It records what happened to artifacts after the older receipts: the files the
// authorized /learn curriculum migration changed, the inherited bytes changes
// from the 2 Nov review snapshot that were proved inert, the artifacts that
// snapshot deleted, and the one build artifact that can never be a stable pin.
// It never edits an older receipt and never rewrites a hash that still matches
// disk; every entry states why it exists.
export function knowledgeStageReceipt(root){
 const path=KNOWLEDGE_STAGE;
 if(!existsSync(resolve(root,path)))return {expected:(_p,h)=>h,paths:()=>[],bytes:(_p,n)=>n,skip:()=>false,retired:()=>false,predecessor:(_p,h)=>h};
 const safe=p=>{const absolute=resolve(root,p);assert.ok(absolute.startsWith(root+sep),'Knowledge-stage receipt path escapes checkout');return absolute;};
 const hash=p=>createHash('sha256').update(readFileSync(safe(p))).digest('hex');
 const m=JSON.parse(readFileSync(safe(path),'utf8'));
 assert.equal(m.scope,'hansa-knowledge-stage-m0-20261103');
 assert.equal(hash(m.previous),m.previousSha256,'Knowledge-stage predecessor receipt drift');
 assert.equal(new Set(m.files.map(e=>e.path+'::'+e.previousSha256)).size,m.files.length,'Duplicate knowledge-stage pin');
 assert.equal(new Set(m.removed.map(e=>e.path)).size,m.removed.length,'Duplicate retired path');
 assert.equal(new Set(m.additions.map(e=>e.path)).size,m.additions.length,'Duplicate addition record');
 assert.equal(new Set(m.predecessors.map(e=>e.manifest+'::'+e.path+'::'+e.recordedSha256)).size,m.predecessors.length,'Duplicate predecessor record');
 for(const e of m.predecessors)assert.equal(hash(e.path),e.sha256,'Predecessor record drift '+e.path);
 for(const e of m.files)assert.equal(hash(e.path),e.sha256,'Knowledge-stage drift '+e.path);
 for(const e of m.additions)assert.equal(hash(e.path),e.sha256,'Knowledge-stage addition drift '+e.path);
 for(const e of m.removed)assert.ok(!existsSync(resolve(root,e.path)),'Retired artifact reappeared '+e.path);
 for(const e of m.excluded)assert.ok(!m.files.some(f=>f.path===e.path),'Excluded artifact cannot also be pinned '+e.path);
 for(const e of m.files){
  assert.ok(e.attribution&&e.layer,'Knowledge-stage pin must state attribution and layer '+e.path);
  assert.ok(!m.removed.some(r=>r.path===e.path),'Knowledge-stage path both pinned and retired '+e.path);
 }
 const excluded=new Set(m.excluded.map(e=>e.path));
 return {
  // Only a pin whose recorded predecessor is exactly this hash can advance the
  // chain. Matching on the successor too would make a second drift look like
  // identity, which is how a stale pin silently passes.
  expected:(p,h)=>{
   const pin=m.files.find(e=>e.path===p&&e.previousSha256===h);
   if(pin)return pin.sha256;
   if(h===null){const addition=m.additions.find(e=>e.path===p);if(addition)return addition.sha256;}
   if(excluded.has(p)&&existsSync(resolve(root,p)))return hash(p);
   return h;
  },
  paths:()=>[...m.files.map(e=>e.path),...m.removed.map(e=>e.path)],
  bytes:(p,n)=>m.files.find(e=>e.path===p)?.bytes??n,
  skip:p=>m.removed.some(e=>e.path===p)||excluded.has(p),
  retired:p=>m.removed.some(e=>e.path===p),
  // A layer that recorded "the manifest below me had hash X" can accept the
  // exact successor transition recorded here, and nothing else.
  predecessor:(p,h)=>m.predecessors.find(e=>e.path===p&&e.recordedSha256===h)?.sha256??h,
 };
}
