import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,mkdtempSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {r11QuestionReceipt,R11_INTEGRATION} from './r11-question-receipt.mjs';
import {gradeR11,r11Expected} from '../lib/fabric/r11.ts';
const root=process.cwd(),json=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
r11QuestionReceipt(root);
const qs=json('content/fabric/r11/questions.json'),manifest=json('content/fabric/r11/manifest.json'),old=json('content/fabric/additions/questions.json'),index=json('content/fabric/index.json'),mapping=json('docs/dp600-r11-integration/SOURCE_MAPPING_222.json');
assert.equal(qs.length,222);assert.equal(mapping.length,222);assert.equal(old.length,532);assert.equal(index.length,834);
assert.equal(new Set([...index.map(q=>q.id),...old.map(q=>q.id),...qs.map(q=>q.hansaId)]).size,1366);
assert.equal(qs.filter(q=>gradeR11(q,r11Expected(q))===true).length,11);assert.equal(qs.filter(q=>gradeR11(q,r11Expected(q))===null).length,211);
assert.equal(manifest.originalScientificBlockersRemaining,59);
const proof=json(R11_INTEGRATION),scratch=mkdtempSync(resolve(tmpdir(),'hansa-r11-negative-'));
const required=new Set([R11_INTEGRATION,proof.previousManifest,...proof.baselines.map(b=>b.path),...proof.files.map(e=>e.path),...proof.files.filter(e=>e.rollbackPath).map(e=>e.rollbackPath)]);
for(const p of required){const target=resolve(scratch,p);mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(root,p),target);}
r11QuestionReceipt(scratch);let rejected=0;
function reject(path,mutate){const p=resolve(scratch,path),bytes=readFileSync(p);try{mutate(p);assert.throws(()=>r11QuestionReceipt(scratch));rejected++;}finally{writeFileSync(p,bytes);}}
reject('content/fabric/r11/questions.json',p=>writeFileSync(p,'[]'));
reject(R11_INTEGRATION,p=>{const m=JSON.parse(readFileSync(p,'utf8'));m.files[0].beforeSha256='0'.repeat(64);writeFileSync(p,JSON.stringify(m));});
reject(proof.baselines[0].path,p=>writeFileSync(p,'{}'));
reject(proof.files.find(e=>e.rollbackPath).rollbackPath,p=>writeFileSync(p,'changed rollback'));
reject(proof.previousManifest,p=>writeFileSync(p,'changed historical manifest'));
r11QuestionReceipt(scratch);
const hash=p=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex');
const before=json('docs/dp600-r11-integration/START_BASELINE.json');
for(const p of ['content/fabric/additions/questions.json','content/fabric/additions/manifest.json','content/fabric/questions.json','content/fabric/index.json','content/atlas/editorial.json','content/atlas/dp600-extension.json','content/atlas/dp600-continuation.json','package.json','package-lock.json','next.config.ts','wrangler.jsonc'])if(before.files[p])assert.equal(hash(p),before.files[p],'Unrelated source changed '+p);
console.log(`PASS: 222 existing rows enriched, zero duplicate catalogue rows, 1366 total records, 11 documentation-graded/211 held; exact rollback/source hashes and ${rejected} corruption rejection cases. Product runtime NOT RUN; no deploy.`);
