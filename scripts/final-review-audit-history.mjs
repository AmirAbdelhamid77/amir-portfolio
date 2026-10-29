import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {implementationReceipt} from './atlas-implementation-receipt.mjs';
import {canonicalHomeReceipt} from './canonical-home-receipt.mjs';
import {loadPreservationHistory} from './preservation-history.mjs';
const root=process.cwd(),impl=implementationReceipt(root),canonical=canonicalHomeReceipt(root),history=loadPreservationHistory(root);
const read=p=>JSON.parse(readFileSync(p,'utf8')),digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const result=[];
for(const name of ['docs/knowledge-atlas/PRESERVATION_BASELINE.json','docs/design-system/easyui-v2/PRESERVATION_BASELINE.json']){
 const baseline=read(name),modified=read(name.replace('PRESERVATION_BASELINE.json','INTEGRATION_MANIFEST.json')).modifiedExisting;
 for(const [p,h] of Object.entries(baseline.files)){
  if(modified.includes(p)||canonical.removed(p))continue;
  const physical=existsSync(p)?p:history.relocatedPath(p,h);const expected=impl.expected(p,history.expectedCurrentHash(p,h));
  const actual=physical&&existsSync(physical)?digest(physical):null;
  if(actual!==expected)result.push({baseline:name,path:p,old:h,expected,actual});
 }
}
writeFileSync('docs/final-review-20261028/history/unresolved.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
