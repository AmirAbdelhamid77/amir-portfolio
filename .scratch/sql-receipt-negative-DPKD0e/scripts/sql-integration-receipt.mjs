import {existsSync,readFileSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {hansaIntegrationReceipt} from './hansa-integration-receipt.mjs';
export function sqlIntegrationReceipt(root){
 const successor=hansaIntegrationReceipt(root);
 const path='docs/sql-integration-20261028/MANIFEST.json';
 if(!existsSync(resolve(root,path)))return {expected:(_p,h)=>h,paths:()=>[],bytes:(_p,n)=>n};
 const safe=p=>{const absolute=resolve(root,p);assert.ok(absolute.startsWith(root+sep),'SQL receipt path escapes checkout');return absolute;};
 const hash=p=>createHash('sha256').update(readFileSync(safe(p))).digest('hex');
 const m=JSON.parse(readFileSync(safe(path),'utf8'));
 assert.equal(m.scope,'notion-sql-source-integration-20261028');
 assert.equal(hash(m.previous),m.previousSha256,'SQL predecessor receipt drift');
 assert.equal(new Set(m.files.map(e=>e.path)).size,m.files.length);
 for(const e of m.files){if(e.beforeSha256!==null)assert.equal(hash(e.rollbackPath),e.beforeSha256,'SQL rollback drift '+e.path);assert.equal(hash(e.path),successor.expected(e.path,e.sha256),'SQL integration drift '+e.path);}
 return {expected:(p,h)=>successor.expected(p,m.files.find(e=>e.path===p&&e.beforeSha256===h)?.sha256??h),paths:()=>m.files.map(e=>e.path),bytes:(p,n)=>successor.bytes(p,m.files.find(e=>e.path===p)?.bytes??n)};
}
