import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { prototypeReceipt, PROTOTYPE_C } from './prototype-c-receipt.mjs';
import { R11_INTEGRATION } from './r11-question-receipt.mjs';
import { CANONICAL_HOME, canonicalHomeReceipt } from './canonical-home-receipt.mjs';
const root=process.cwd(),m=JSON.parse(fs.readFileSync(PROTOTYPE_C,'utf8'));
// Validate the real checkout first; the rejection cases below run on a throwaway copy.
prototypeReceipt(root);
// Files a bound successor retired have no bytes to copy into the disposable view.
const retired=new Set(canonicalHomeReceipt(root).removedPaths());
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'hansa-prototype-rejection-'));
// Every layer of the chain travels into the disposable copy. Copying only the
// prototype layer would degrade the chain there (each successor would resolve to
// its own recorded hashes) and the rejection cases below would pass for the
// wrong reason.
const chainPaths=new Set([PROTOTYPE_C,m.baselinePath,...m.files.flatMap(e=>[e.path,...(e.beforeSha256!==null?['docs/prototype-c/preservation/originals/'+e.path]:[])]),...(m.generatedArtifacts??[]).flatMap(e=>[e.path,e.basisPath])]);
for(const manifestPath of [R11_INTEGRATION,CANONICAL_HOME]){
  if(!fs.existsSync(manifestPath))continue;
  const layer=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  chainPaths.add(manifestPath);
  if(layer.previousManifest)chainPaths.add(layer.previousManifest);
  if(layer.baselinePath)chainPaths.add(layer.baselinePath);
  for(const b of layer.baselines??[])chainPaths.add(b.path);
  for(const e of [...(layer.files??[]),...(layer.generatedArtifacts??[])]){
    chainPaths.add(e.path);
    if(e.rollbackPath)chainPaths.add(e.rollbackPath);
    if(e.basisPath)chainPaths.add(e.basisPath);
  }
}
// Layers below canonical-home (cinematic → final-review → study → path-review →
// sql-integration → hansa-integration) must travel too, or the chain degrades to
// identity inside the copy and the rejection cases pass for the wrong reason.
// Field names differ per layer (previousManifest vs previous), and the
// final-review layer additionally binds a history file.
for(const manifestPath of ['docs/cinematic-phase2/INTEGRATION_MANIFEST.json','docs/final-review-20261028/INTEGRATION_MANIFEST.json','docs/learning-architecture-20261028/MANIFEST.json','docs/learning-path-review-20261028/MANIFEST.json','docs/sql-integration-20261028/MANIFEST.json','docs/hansa-integration-20261029/MANIFEST.json']){
  if(!fs.existsSync(manifestPath))continue;
  const layer=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  chainPaths.add(manifestPath);
  for(const extra of [layer.previousManifest,layer.previous,layer.baselinePath,layer.baseline,...(layer.baselines??[]).map(b=>b.path)].filter(Boolean))chainPaths.add(extra);
  if(manifestPath.includes('final-review')){
    chainPaths.add('docs/final-review-20261028/HISTORICAL_RECONCILIATION.json');
    const history=JSON.parse(fs.readFileSync('docs/final-review-20261028/HISTORICAL_RECONCILIATION.json','utf8'));
    for(const e of [...history.transitions,...history.additions]){
      chainPaths.add(e.path);
      if(e.originalPath)chainPaths.add(e.originalPath);
      if(e.capturedPath)chainPaths.add(e.capturedPath);
    }
    chainPaths.add(JSON.parse(fs.readFileSync('docs/final-review-20261028/INTEGRATION_MANIFEST.json','utf8')).baselinePath);
  }
  for(const e of layer.files??[]){
    chainPaths.add(e.path);
    if(e.rollbackPath)chainPaths.add(e.rollbackPath);
    if(e.originalPath)chainPaths.add(e.originalPath);
    if(e.capturedPath)chainPaths.add(e.capturedPath);
  }
}
const paths=[...chainPaths].filter(p=>!retired.has(p)&&fs.existsSync(p));
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
