import {existsSync,readFileSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
export const KNOWLEDGE_STAGE='docs/knowledge-stage-m0-20261103/INTEGRATION_MANIFEST.json';
// The M6 layer sits above M0 and is read by the same function, so every receipt
// that already depends on `knowledgeStageReceipt` sees the successor without
// being edited. M0 keeps its own pins; M6 only adds transitions it can prove.
export const KNOWLEDGE_STAGE_M6='docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json';
// Newest receipt layer: M0 re-baseline, 3 Nov 2026.
//
// It records what happened to artifacts after the older receipts: the files the
// authorized /learn curriculum migration changed, the inherited bytes changes
// from the 2 Nov review snapshot that were proved inert, the artifacts that
// snapshot deleted, and the one build artifact that can never be a stable pin.
// It never edits an older receipt and never rewrites a hash that still matches
// disk; every entry states why it exists.
//
// The M6 layer (4 Nov 2026) is the first successor after M0. It records the
// three-scene Home foundation: the public stage boundary, its test, the
// pre-integration baseline, and one stale guard repaired after the M2 search
// rewrite replaced the object literal it asserted. It is an addition, not a
// rewrite of M0, and it cannot widen publication: it pins files only.
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
 // The successor layer is optional so a checkout from before M6 still verifies
 // against M0 alone, but when it exists its numbers are checked, not trusted.
 const m6Path=KNOWLEDGE_STAGE_M6;
 const m6=existsSync(resolve(root,m6Path))?JSON.parse(readFileSync(safe(m6Path),'utf8')):null;
 if(m6){
  assert.equal(m6.scope,'hansa-knowledge-stage-m6-20261104');
  assert.equal(m6.previous,path,'M6 layer must name M0 as its predecessor');
  assert.equal(hash(m6.previous),m6.previousSha256,'M6 predecessor receipt drift');
  assert.equal(new Set(m6.files.map(e=>e.path+'::'+e.previousSha256)).size,m6.files.length,'Duplicate M6 pin');
  assert.equal(new Set(m6.additions.map(e=>e.path)).size,m6.additions.length,'Duplicate M6 addition');
  // A pin is only compared with disk when no later pin supersedes it. Step 1's
  // record of a path must stay in the layer as history; the terminal hop is the
  // one that must match the file.
  const superseded=(p,sha)=>m6.files.some(e=>e.path===p&&e.previousSha256===sha);
  for(const e of m6.files){
   if(!superseded(e.path,e.sha256))assert.equal(hash(e.path),e.sha256,'M6 drift '+e.path);
   assert.ok(e.attribution&&e.layer,'M6 pin must state attribution and layer '+e.path);
   assert.ok(
    !(e.previousSha256===null&&m6.additions.some(a=>a.path===e.path)),
    'M6 path is both added and pinned from null '+e.path
   );
  }
  for(const e of m6.additions){
   if(!superseded(e.path,e.sha256))assert.equal(hash(e.path),e.sha256,'M6 addition drift '+e.path);
   assert.ok(e.attribution&&e.layer,'M6 addition must state attribution and layer '+e.path);
  }
 }
 // A successor hash advances exactly the recorded predecessor hash it names.
 // The layer may pin the same path more than once (step 1, then step 2), so the
 // transition is followed hop by hop until no recorded pin accepts the current
 // hash. The hop limit turns a mistaken cycle into a failure, not a hang.
 const m6After=(p,h)=>{
  if(!m6)return h;
  let current=h;
  for(let hop=0;hop<32;hop+=1){
   const pin=m6.files.find(e=>e.path===p&&e.previousSha256===current);
   if(pin){current=pin.sha256;continue;}
   if(current===null){
    const addition=m6.additions.find(e=>e.path===p);
    if(addition){current=addition.sha256;continue;}
   }
   return current;
  }
  assert.fail('M6 pin chain does not terminate for '+p);
 };
 // Every transition must start from a hash the layer chain already recorded:
 // M0's pin or addition for the path, or an M6 addition/hop. A pin with an
 // invented predecessor would verify in isolation and never apply in practice.
 if(m6){
  const recorded=new Map();
  const remember=(path,sha)=>{
   if(!recorded.has(path))recorded.set(path,new Set());
   recorded.get(path).add(sha);
  };
  for(const e of m.files)remember(e.path,e.sha256);
  for(const e of m.additions)remember(e.path,e.sha256);
  // Additions are seeded first so a later pin can advance the addition it
  // supersedes (step 1 added a file, step 2 changed it).
  for(const e of m6.additions)remember(e.path,e.sha256);
  for(const e of m6.files){
   if(e.previousSha256===null){
    assert.ok(m6.additions.some(a=>a.path===e.path),'M6 pin starts from null without an addition '+e.path);
   }else{
    assert.ok(recorded.get(e.path)?.has(e.previousSha256),'M6 pin predecessor was never recorded '+e.path);
   }
   remember(e.path,e.sha256);
  }
  for(const e of m6.additions){
   assert.ok(!m.files.some(f=>f.path===e.path),'M6 addition overwrites a pinned path '+e.path);
  }
 }
 // M0's own pins are read through M6, so a recorded successor transition is not
 // mistaken for drift; a hash M6 did not name still fails here.
 for(const e of m.files)assert.equal(hash(e.path),m6After(e.path,e.sha256),'Knowledge-stage drift '+e.path);
 for(const e of m.additions)assert.equal(hash(e.path),m6After(e.path,e.sha256),'Knowledge-stage addition drift '+e.path);
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
   const m0Expected=(()=>{
    const pin=m.files.find(e=>e.path===p&&e.previousSha256===h);
    if(pin)return pin.sha256;
    if(h===null){const addition=m.additions.find(e=>e.path===p);if(addition)return addition.sha256;}
    if(excluded.has(p)&&existsSync(resolve(root,p)))return hash(p);
    return h;
   })();
   return m6After(p,m0Expected);
  },
  paths:()=>[
   ...m.files.map(e=>e.path),
   ...m.removed.map(e=>e.path),
   ...(m6?[m6Path,...m6.files.map(e=>e.path),...m6.additions.map(e=>e.path)]:[]),
  ],
  bytes:(p,n)=>m6?.files.find(e=>e.path===p)?.bytes??m.files.find(e=>e.path===p)?.bytes??n,
  skip:p=>m.removed.some(e=>e.path===p)||excluded.has(p),
  retired:p=>m.removed.some(e=>e.path===p),
  // A layer that recorded "the manifest below me had hash X" can accept the
  // exact successor transition recorded here, and nothing else.
  predecessor:(p,h)=>m.predecessors.find(e=>e.path===p&&e.recordedSha256===h)?.sha256??h,
 };
}
