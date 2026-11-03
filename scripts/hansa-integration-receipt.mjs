import {existsSync,readFileSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {knowledgeStageReceipt} from './knowledge-stage-receipt.mjs';
// Newest receipt wave: Hansa Deep Research Corpus integration (29 Oct 2026).
// Curated study-hub reference layer, hands-on lab pages, external-link study
// browser, sitemap/metrics/verifier extensions. `acceptedDrift` rows document
// hashes older waves recorded for a path that no longer matched disk when this
// wave began (uncommitted 29 Oct study-hub edits postdated the 28 Oct
// recordings); the rollback snapshots hold the actual pre-wave bytes.
export function hansaIntegrationReceipt(root){
 const path='docs/hansa-integration-20261029/MANIFEST.json';
 if(!existsSync(resolve(root,path)))return {expected:(_p,h)=>h,paths:()=>[],bytes:(_p,n)=>n};
 const safe=p=>{const absolute=resolve(root,p);assert.ok(absolute.startsWith(root+sep),'Hansa integration receipt path escapes checkout');return absolute;};
 const hash=p=>createHash('sha256').update(readFileSync(safe(p))).digest('hex');
 const successor=knowledgeStageReceipt(root);
 const m=JSON.parse(readFileSync(safe(path),'utf8'));
 assert.equal(m.scope,'hansa-corpus-integration-20261029');
 assert.equal(hash(m.previous),m.previousSha256,'Hansa integration predecessor receipt drift');
 assert.equal(new Set(m.files.map(e=>e.path)).size,m.files.length);
 for(const e of m.files){
  if(successor.skip?.(e.path))continue;
  if(e.observeOnly){assert.equal(hash(e.path),successor.expected(e.path,e.sha256),'Hansa integration observed drift changed mid-flight '+e.path);continue;}
  if(e.beforeSha256!==null)assert.equal(hash(e.rollbackPath),e.beforeSha256,'Hansa integration rollback drift '+e.path);
  assert.equal(hash(e.path),successor.expected(e.path,e.sha256),'Hansa integration drift '+e.path);
 }
 return {expected:(p,h)=>successor.expected(p,m.files.find(e=>e.path===p&&(e.beforeSha256===h||e.acceptedDrift?.includes(h)||(e.observeOnly&&(e.sealedBeforeSha256===h||e.sha256===h))))?.sha256??h),paths:()=>m.files.map(e=>e.path),bytes:(p,n)=>successor.bytes(p,m.files.find(e=>e.path===p)?.bytes??n),retired:p=>successor.retired?.(p)===true};
}
