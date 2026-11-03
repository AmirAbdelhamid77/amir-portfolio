import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';import {resolve,dirname} from 'node:path';import {createHash} from 'node:crypto';
import {finalReviewReceipt,FINAL_REVIEW,FINAL_HISTORY} from './final-review-receipt.mjs';
import {KNOWLEDGE_STAGE} from './knowledge-stage-receipt.mjs';
const root=process.cwd(),read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8')),m=read(FINAL_REVIEW),h=read(FINAL_HISTORY);
const scratch=mkdtempSync(resolve(tmpdir(),'hansa-final-negative-'));
const paths=new Set([FINAL_REVIEW,FINAL_HISTORY,m.previousManifest,m.baselinePath,...m.files.flatMap(e=>[e.path,...(e.rollbackPath?[e.rollbackPath]:[])]),...h.transitions.flatMap(e=>[e.path,e.originalPath,...(e.capturedPath?[e.capturedPath]:[])]),...h.additions.flatMap(e=>[e.path,e.originalPath])]);
// The predecessor chain is part of the scratch too: the newest layer resolves
// bytes that the older layers can no longer see.
{
  const seen=new Set();
  const readJson=p=>{try{return read(p);}catch{return null;}};
  const addManifest=file=>{if(!file||seen.has(file)||!existsSync(resolve(root,file)))return null;seen.add(file);paths.add(file);
    const x=readJson(file);if(!x)return null;
    for(const e of [...(Array.isArray(x.files)?x.files:[]),...(Array.isArray(x.additions)?x.additions:[]),...(Array.isArray(x.removed)?x.removed:[])])for(const p of [e.path,e.rollbackPath,e.capturedPath,e.originalPath])if(p)paths.add(p);
    for(const e of Array.isArray(x.predecessors)?x.predecessors:[])if(e&&e.path)paths.add(e.path);
    for(const key of ['baselinePath','baseline','previous','previousManifest'])if(x[key])paths.add(x[key]);
    for(const e of x.transitions??[])for(const p of [e.path,e.originalPath,e.capturedPath])if(p)paths.add(p);
    return x;};
  addManifest(KNOWLEDGE_STAGE);
  // Every manifest reached so far names its own predecessor and baseline; walk
  // the closure so the whole chain can evaluate inside the scratch checkout.
  for(let changed=true;changed;){
    changed=false;
    for(const p of [...paths]){
      const y=readJson(p);
      if(!y||typeof y!=='object')continue;
      for(const key of ['previous','previousManifest','baselinePath','baseline']){
        const next=y[key];
        if(next&&!seen.has(next)&&addManifest(next))changed=true;
      }
    }
  }
}
// Retired artifacts are recorded by the newest layer and have no bytes to copy.
for(const p of paths){if(!existsSync(resolve(root,p)))continue;const dest=resolve(scratch,p);mkdirSync(dirname(dest),{recursive:true});copyFileSync(resolve(root,p),dest);}
finalReviewReceipt(scratch);let rejected=0;const cases=[];
function reject(id,p,mutate){const file=resolve(scratch,p),original=readFileSync(file);try{mutate(file);assert.throws(()=>finalReviewReceipt(scratch));rejected++;cases.push(id);}finally{writeFileSync(file,original);}}
for(const p of ['package.json','AGENTS.md','eslint.config.mjs','lib/touch.ts','lib/hooks/use-hover-capable.ts','components/atlas/explorer.tsx','lib/atlas/server.ts','components/knowledge/insight-stage.tsx'])reject('source-drift:'+p,p,f=>writeFileSync(f,readFileSync(f,'utf8')+'\n/* unaudited change */\n'));
reject('old-phase2-manifest',m.previousManifest,f=>writeFileSync(f,'{}'));
reject('starting-baseline',m.baselinePath,f=>writeFileSync(f,'{}'));
reject('historical-original',h.transitions[0].originalPath,f=>writeFileSync(f,'corrupt'));
reject('rollback',m.files.find(e=>e.rollbackPath).rollbackPath,f=>writeFileSync(f,'corrupt'));
reject('captured-preexisting-runtime',h.additions[0].originalPath,f=>writeFileSync(f,'corrupt'));
reject('history-inventory',FINAL_HISTORY,f=>{const x=JSON.parse(readFileSync(f));x.transitions.pop();writeFileSync(f,JSON.stringify(x));});
reject('duplicate-manifest-path',FINAL_REVIEW,f=>{const x=JSON.parse(readFileSync(f));x.files.push(x.files[0]);writeFileSync(f,JSON.stringify(x));});
reject('unbound-change',FINAL_REVIEW,f=>{const x=JSON.parse(readFileSync(f));x.files[0].beforeSha256='0'.repeat(64);writeFileSync(f,JSON.stringify(x));});
// Even rehashing a changed historical package cannot authorize a dependency.
const hash=p=>createHash('sha256').update(readFileSync(resolve(scratch,p))).digest('hex');
const saved=new Map(['package.json',FINAL_HISTORY,m.baselinePath,FINAL_REVIEW].map(p=>[p,readFileSync(resolve(scratch,p))]));
try{const pkg=JSON.parse(saved.get('package.json'));pkg.dependencies['unauthorized-library']='1.0.0';writeFileSync(resolve(scratch,'package.json'),JSON.stringify(pkg));const history=JSON.parse(saved.get(FINAL_HISTORY));history.transitions.find(e=>e.path==='package.json').toSha256=hash('package.json');writeFileSync(resolve(scratch,FINAL_HISTORY),JSON.stringify(history));const baseline=JSON.parse(saved.get(m.baselinePath));baseline.files['package.json']=hash('package.json');writeFileSync(resolve(scratch,m.baselinePath),JSON.stringify(baseline));const manifest=JSON.parse(saved.get(FINAL_REVIEW));manifest.historySha256=hash(FINAL_HISTORY);manifest.baselineSha256=hash(m.baselinePath);writeFileSync(resolve(scratch,FINAL_REVIEW),JSON.stringify(manifest));assert.throws(()=>finalReviewReceipt(scratch),/Only audited script additions|Knowledge-stage drift package\.json|Predecessor record drift/);cases.push('rehash-cannot-waive-dependency-policy');rejected++;}finally{for(const [p,bytes] of saved)writeFileSync(resolve(scratch,p),bytes);}
finalReviewReceipt(scratch);
writeFileSync(resolve(root,'docs/final-review-20261028/checks/negative-cases.json'),JSON.stringify({rejected,cases,realSourcesUntouched:true},null,2));
console.log(`PASS ${rejected} corruption/waiver cases rejected; original sources and manifests untouched`);
