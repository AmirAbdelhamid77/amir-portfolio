import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import {canonicalHomeReceipt} from './canonical-home-receipt.mjs';
import {knowledgeStageReceipt} from './knowledge-stage-receipt.mjs';
export const R11_INTEGRATION='docs/dp600-r11-integration/INTEGRATION_MANIFEST.json';
export function r11QuestionReceipt(root){
 // The newest layer is consulted first: it may supersede a hash this layer
 // recorded, and it is the only layer that can declare a file removed.
 const successor=canonicalHomeReceipt(root);
 if(!existsSync(resolve(root,R11_INTEGRATION)))return successor;
 const read=p=>readFileSync(resolve(root,p)),hash=p=>createHash('sha256').update(read(p)).digest('hex');
 const m=JSON.parse(read(R11_INTEGRATION));assert.equal(m.scope,'hansa-existing-222-r11-question-enrichment-2026-10-26');
 assert.equal(hash(m.previousManifest),m.previousManifestSha256,'Prior Prototype C manifest changed');
 const baselines=new Map(m.baselines.map(b=>{assert.equal(hash(b.path),knowledgeStageReceipt(root).predecessor(b.path,b.sha256),'R11 baseline changed');return[b.path,JSON.parse(read(b.path))];}));
 assert.equal(new Set(m.files.map(e=>e.path)).size,m.files.length);
 for(const e of m.files){
  assert.ok(resolve(root,e.path).startsWith(root+sep),'R11 path outside checkout');const b=baselines.get(e.basis);assert.ok(b,'Unknown R11 baseline');
  assert.equal(e.beforeSha256,b.files[e.path]??null,'Unbound R11 before-hash '+e.path);
  if(e.beforeSha256!==null){assert.ok(resolve(root,e.rollbackPath).startsWith(root+sep));assert.equal(hash(e.rollbackPath),successor.expected(e.rollbackPath,e.beforeSha256),'R11 rollback bytes changed '+e.path);}
  if(successor.removed(e.path))continue;
  assert.equal(hash(e.path),successor.expected(e.path,e.sha256),'R11 integration drift '+e.path);
 }
 return {
  expected(path,old){return successor.expected(path,m.files.find(e=>e.path===path&&e.beforeSha256===old)?.sha256??old);},
  removed:path=>successor.removed(path),
  removedPaths:()=>successor.removedPaths(),
 };
}
