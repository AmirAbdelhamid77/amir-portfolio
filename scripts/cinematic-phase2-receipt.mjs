// Exact successor for the owner-authorized canonical landing visual upgrade.
// Does not rewrite an older baseline or accept unknown content drift.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import {finalReviewReceipt} from './final-review-receipt.mjs';
import {knowledgeStageReceipt} from './knowledge-stage-receipt.mjs';
export const CINEMATIC_PHASE2='docs/cinematic-phase2/INTEGRATION_MANIFEST.json';
const identity={expected:(_p,old)=>old,paths:()=>[]};
export function cinematicReceipt(root){
 const successor=finalReviewReceipt(root),stage=knowledgeStageReceipt(root);
 if(!existsSync(resolve(root,CINEMATIC_PHASE2)))return identity;
 const read=p=>readFileSync(resolve(root,p));
 const hash=p=>createHash('sha256').update(read(p)).digest('hex');
 const m=JSON.parse(read(CINEMATIC_PHASE2));
 assert.equal(m.scope,'hansa-cinematic-phase2-2026-10-28');
 assert.equal(hash(m.previousManifest),stage.predecessor(m.previousManifest,m.previousManifestSha256),'Phase 1 manifest changed');
 assert.equal(hash(m.baselinePath),stage.predecessor(m.baselinePath,m.baselineSha256),'Phase 2 dirty baseline changed');
 const baseline=JSON.parse(read(m.baselinePath));
 assert.equal(new Set(m.files.map(e=>e.path)).size,m.files.length,'Duplicate Phase 2 path');
 for(const e of m.files){
  assert.ok(resolve(root,e.path).startsWith(root+sep),'Phase 2 path escapes checkout');
  assert.equal(e.beforeSha256,baseline[e.path]??null,'Unbound Phase 2 before hash '+e.path);
  if(e.beforeSha256!==null&&!e.generated){
   assert.ok(e.rollbackPath,'Missing rollback bytes '+e.path);
   assert.ok(resolve(root,e.rollbackPath).startsWith(root+sep));
   assert.equal(hash(e.rollbackPath),successor.expected(e.rollbackPath,e.beforeSha256),'Phase 2 rollback drift '+e.path);
  }
  if(!existsSync(resolve(root,e.path))){assert.ok(stage.retired(e.path),'Phase 2 file vanished without a successor record '+e.path);continue;}
  assert.equal(hash(e.path),successor.expected(e.path,e.sha256),'Phase 2 source drift '+e.path);
 }
 return {expected:(p,old)=>successor.expected(p,m.files.find(e=>e.path===p&&e.beforeSha256===old)?.sha256??old),paths:()=>[...m.files.map(e=>e.path),...successor.paths()],retired:p=>stage.retired(p)};
}
