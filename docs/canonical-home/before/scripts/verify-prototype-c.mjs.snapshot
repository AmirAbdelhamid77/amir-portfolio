import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { prototypeReceipt, PROTOTYPE_C } from './prototype-c-receipt.mjs';
const root=process.cwd(),m=JSON.parse(fs.readFileSync(PROTOTYPE_C,'utf8'));
prototypeReceipt(root);
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'hansa-prototype-rejection-'));
const paths=[PROTOTYPE_C,m.baselinePath,...m.files.flatMap(e=>[e.path,...(e.beforeSha256!==null?['docs/prototype-c/preservation/originals/'+e.path]:[])]),...(m.generatedArtifacts??[]).flatMap(e=>[e.path,e.basisPath])];
for(const p of paths){fs.mkdirSync(path.dirname(path.join(scratch,p)),{recursive:true});fs.copyFileSync(p,path.join(scratch,p));}
let negatives=0;
function reject(p,change){const file=path.join(scratch,p),before=fs.readFileSync(file);try{change(file);assert.throws(()=>prototypeReceipt(scratch));negatives++;}finally{fs.writeFileSync(file,before);}}
reject('app/page.tsx',file=>fs.appendFileSync(file,'\n// unexpected change'));
reject('docs/prototype-c/preservation/originals/app/page.tsx',file=>fs.appendFileSync(file,'\n// invalid backup'));
reject(m.baselinePath,file=>fs.appendFileSync(file,' '));
reject('tsconfig.tsbuildinfo',file=>fs.appendFileSync(file,' '));
reject(PROTOTYPE_C,file=>{const data=JSON.parse(fs.readFileSync(file,'utf8'));data.files[0].beforeSha256='0'.repeat(64);fs.writeFileSync(file,JSON.stringify(data));});
reject(PROTOTYPE_C,file=>{const data=JSON.parse(fs.readFileSync(file,'utf8'));data.files.push(data.files[0]);fs.writeFileSync(file,JSON.stringify(data));});
prototypeReceipt(scratch);
const result={checkedAt:new Date().toISOString(),status:'PASS',ownedPaths:m.files.length,corruptionRejectionCases:negatives,unrelatedConcurrentWork:'not waived; see preservation/verification.json'};
fs.writeFileSync('docs/prototype-c/qa/prototype-integrity.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
