import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {resolve,dirname} from 'node:path';
import {cinematicReceipt,CINEMATIC_PHASE2} from './cinematic-phase2-receipt.mjs';
const root=process.cwd(),m=JSON.parse(readFileSync(resolve(root,CINEMATIC_PHASE2),'utf8'));
const temp=mkdtempSync(resolve(tmpdir(),'hansa-phase2-negative-'));
const paths=new Set([CINEMATIC_PHASE2,m.previousManifest,m.baselinePath,...m.files.flatMap(e=>[e.path,...(e.rollbackPath?[e.rollbackPath]:[])])]);
for(const p of paths){const dest=resolve(temp,p);mkdirSync(dirname(dest),{recursive:true});copyFileSync(resolve(root,p),dest);}
cinematicReceipt(temp);let rejected=0;
function reject(p,mutate){const file=resolve(temp,p),original=readFileSync(file);try{mutate(file);assert.throws(()=>cinematicReceipt(temp));rejected++;}finally{writeFileSync(file,original);}}
reject('components/knowledge/insight-stage.tsx',p=>writeFileSync(p,readFileSync(p,'utf8')+'\n// unauthorized drift\n'));
reject(m.files.find(e=>e.rollbackPath).rollbackPath,p=>writeFileSync(p,'corrupt rollback'));
reject(m.baselinePath,p=>writeFileSync(p,'{}'));
reject(m.previousManifest,p=>writeFileSync(p,'{}'));
reject(CINEMATIC_PHASE2,p=>{const v=JSON.parse(readFileSync(p));v.files[0].beforeSha256='0'.repeat(64);writeFileSync(p,JSON.stringify(v));});
reject(CINEMATIC_PHASE2,p=>{const v=JSON.parse(readFileSync(p));v.files.push(v.files[0]);writeFileSync(p,JSON.stringify(v));});
console.log(`PASS ${rejected} corruption cases rejected; actual sources and older manifests untouched`);
