import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';
import { r11QuestionReceipt } from './r11-question-receipt.mjs';
export const PROTOTYPE_C='docs/prototype-c/INTEGRATION_MANIFEST.json';
export function prototypeReceipt(root) {
  const successor=r11QuestionReceipt(root);
  if(!existsSync(resolve(root,PROTOTYPE_C))) return {expected:(_path,old)=>old};
  const read=p=>readFileSync(resolve(root,p));
  const hash=p=>createHash('sha256').update(read(p)).digest('hex');
  const m=JSON.parse(read(PROTOTYPE_C));
  assert.equal(m.scope,'hansa-prototype-c-local-2026-10-26');
  assert.equal(hash(m.baselinePath),m.baselineSha256,'Prototype baseline changed');
  const baseline=JSON.parse(read(m.baselinePath));
  assert.equal(new Set(m.files.map(e=>e.path)).size,m.files.length);
  for(const e of m.files){
    assert.ok(resolve(root,e.path).startsWith(root+sep),'Prototype path outside checkout');
    assert.equal(e.beforeSha256,baseline.files[e.path]??null,'Unbound prototype before-hash '+e.path);
    if(e.beforeSha256!==null)assert.equal(hash('docs/prototype-c/preservation/originals/'+e.path),e.beforeSha256,'Prototype rollback drift '+e.path);
    assert.equal(hash(e.path),successor.expected(e.path,e.sha256),'Prototype drift '+e.path);
  }
  for(const e of m.generatedArtifacts??[]){
    assert.equal(e.path,'tsconfig.tsbuildinfo','Only the declared TypeScript build cache is generated');
    assert.equal(hash(e.basisPath),e.basisSha256,'Generated-cache predecessor receipt changed');
    const basis=JSON.parse(read(e.basisPath));
    assert.equal(basis.files.find(f=>f.path===e.path)?.sha256,e.beforeSha256,'Unbound generated-cache before-hash');
    assert.equal(hash(e.path),e.sha256,'Generated-cache drift; rebuild then explicitly reseal');
  }
  return {expected(path,old){return successor.expected(path,[...m.files,...(m.generatedArtifacts??[])].find(e=>e.path===path&&e.beforeSha256===old)?.sha256??old);}};
}
