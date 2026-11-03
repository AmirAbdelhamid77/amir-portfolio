import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import ts from 'typescript';
import {studyReceipt} from './study-receipt.mjs';
import {knowledgeStageReceipt} from './knowledge-stage-receipt.mjs';
export const FINAL_REVIEW='docs/final-review-20261028/INTEGRATION_MANIFEST.json';
export const FINAL_HISTORY='docs/final-review-20261028/HISTORICAL_RECONCILIATION.json';
const digest=b=>createHash('sha256').update(b).digest('hex');
function tokens(source){const scan=ts.createScanner(ts.ScriptTarget.Latest,true,ts.LanguageVariant.Standard,source),out=[];while(scan.scan()!==ts.SyntaxKind.EndOfFileToken)out.push(scan.getTokenText());return out;}
function exportsOf(source){const f=ts.createSourceFile('source.ts',source,ts.ScriptTarget.Latest,true);return new Map(f.statements.filter(n=>n.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword)).map(n=>[n.name?.getText(f)??n.declarationList?.declarations[0].name.getText(f),tokens(n.getText(f))]));}
const identity={expected:(_p,h)=>h,paths:()=>[],bytes:(_p,_h,n)=>n,historicalBytes:()=>null};
export function finalReviewReceipt(root){
 if(!existsSync(resolve(root,FINAL_REVIEW)))return identity;
 const safe=p=>{const a=resolve(root,p);assert.ok(a.startsWith(root+sep),'Final receipt path escapes checkout');return a;};
 const raw=p=>readFileSync(safe(p)),hash=p=>digest(raw(p)),json=p=>JSON.parse(raw(p));
 const m=json(FINAL_REVIEW);
 const successor=studyReceipt(root);
 assert.equal(m.scope,'hansa-final-review-20261028');
 assert.equal(hash(m.previousManifest),m.previousManifestSha256,'Original Phase 2 manifest changed');
 assert.equal(hash(m.baselinePath),knowledgeStageReceipt(root).predecessor(m.baselinePath,m.baselineSha256),'Final-review starting baseline changed');
 const baseline=json(m.baselinePath).files;
 const h=json(FINAL_HISTORY);
 assert.equal(hash(FINAL_HISTORY),knowledgeStageReceipt(root).predecessor(FINAL_HISTORY,m.historySha256),'Historical reconciliation changed');
 const transitions=h.transitions;
 assert.deepEqual(transitions.map(e=>e.path).sort(),['.gitignore','AGENTS.md','app/globals.css','eslint.config.mjs','lib/hooks/use-hover-capable.ts','lib/touch.ts','package.json'].sort());
 for(const e of transitions){
  assert.equal(hash(e.originalPath),e.fromSha256,'Historical original changed '+e.path);
  assert.equal(e.toSha256,baseline[e.path],'Historical evolution not bound to starting state');
  const captured=e.capturedPath?raw(e.capturedPath):raw(e.path);
  // A frozen capture must still hash to the recorded historical value. When
  // there is no capture, `captured` is the live file and the successor chain
  // checks it on the next assertion; demanding it still equal its 28 Oct bytes
  // made every later authorized change fail before it reached that check.
  if(e.capturedPath)assert.equal(digest(captured),successor.expected(e.capturedPath,e.toSha256),'Unaudited historical successor bytes '+e.path);
  assert.equal(hash(e.path),successor.expected(e.path,m.files.find(f=>f.path===e.path)?.sha256??e.toSha256),'Unaudited current historical source '+e.path);
  const original=raw(e.originalPath).toString('utf8'),current=captured.toString('utf8');
  if(e.path==='package.json'){
   assert.equal(e.fromSha256,'6561cd5806c9e436d8accdb74fb3a669d3620c848a710e22cb29c2dc9cc62d92');
   const expected=JSON.parse(original);
   Object.assign(expected.scripts,{
    'test:knowledge':'node --experimental-strip-types --test "tests/knowledge/*.test.mjs"',
    'test:atlas':'node --experimental-strip-types --test "tests/atlas/*.test.mjs"',
    'qa:prototype-c':'node scripts/qa-prototype-c-v2.mjs',
    'test:all':'npm test && npm run test:statistics && npm run test:fabric && npm run test:content && npm run test:knowledge && npm run test:atlas',
    'build:drafts':'node scripts/build-draft-banks.mjs','qa:drafts':'node scripts/qa-drafts.mjs','build:intake':'node scripts/build-intake-content.mjs',
    // Added by the authorized /learn curriculum wave (3 Nov 2026). Each is a
    // local read-only gate or inventory command; none adds a dependency.
    'lint:copy':'node scripts/lint-copy.mjs','map:tree':'node ../scripts/inventory-tree.mjs',
    'verify:curriculum':'node --experimental-strip-types scripts/verify-curriculum-routes.mjs',
    'qa:search-index':'node --experimental-strip-types scripts/qa-search-index.mjs',
   });
   assert.deepEqual(JSON.parse(current),expected,'Only audited script additions are allowed; dependency/other changes rejected');
  }else if(e.path==='AGENTS.md'){
   assert.equal(e.fromSha256,'806c749ff9cea0eeda69ef65bef5c5eee8809e3f59f8904779907ebff1039c4c');
   const prefix=original.replaceAll('\r\n','\n').trimEnd(),now=current.replaceAll('\r\n','\n');
   assert.ok(now.startsWith(prefix+'\n\n<!-- HANSA_CREATIVE_INTELLIGENCE_START -->'));
   const added=now.slice(prefix.length);assert.ok(added.trimEnd().endsWith('<!-- HANSA_CREATIVE_INTELLIGENCE_END -->'));
   assert.equal(digest(Buffer.from(added)),e.appendSha256,'Unreviewed instruction append');
  }else if(e.path==='app/globals.css'){
   assert.equal(e.fromSha256,'8f9a9b4015bfb2f1daad762f62055e183f6d94014f43f6137f6d51402a376fa2');
   const before=original.replaceAll('\r\n','\n').trimEnd(),now=current.replaceAll('\r\n','\n');
   assert.ok(now.startsWith(before));const added=now.slice(before.length);
   assert.equal(digest(Buffer.from(added)),e.appendSha256,'Unreviewed historic style append');
   assert.ok(added.includes('.hansa-stage')&&added.includes('.hansa-floor'));
   assert.ok(!added.includes(':root')&&!added.includes('@import'),'Historical append must remain stage-scoped');
  }else if(e.path==='eslint.config.mjs'){
   assert.equal(e.fromSha256,'a04fe04d3457bdafc2509c14ad13cec3acce51e7158e92d68c280d5e40c7cd5f');
   const now=tokens(current),index=now.indexOf('".scratch/**"');assert.ok(index>=0);assert.equal(now[index+1],',');now.splice(index,2);
   assert.deepEqual(now,tokens(original),'Only archived registry scratch copies may be added to lint ignores');
  }else if(e.path==='lib/hooks/use-hover-capable.ts'){
   assert.equal(e.fromSha256,'b5b9397bfa03859e04673c8f1817cf13ff55d2a9688955d6e0459ae70db90d06');
   assert.deepEqual(tokens(current),tokens(original),'Hover hook may differ only in comments/formatting');
  }else if(e.path==='lib/touch.ts'){
   assert.equal(e.fromSha256,'f2a15c243c86c8bd1abb6e2e65a423b3a4c45cc1d797ebd83997f21cd1beadb9');
   const before=exportsOf(original),now=exportsOf(current);
   assert.deepEqual([...now.keys()].sort(),['TOUCH_GESTURE_CLASS','capturePointer','isHoveringPointer','releasePointer'].sort());
   for(const [name,body] of now)assert.deepEqual(body,before.get(name),'Touch primitive semantics changed '+name);
  }else{
   assert.equal(e.fromSha256,'e6f49595e098e06bbce8d48ae707fd31eda8da46b394b540e697091e83246aef');
   const before=original.replaceAll('\r\n','\n').trimEnd(),now=current.replaceAll('\r\n','\n');
   const suffix='\n\n# Private intake mirror: package files that carry answer keys, historical keys,\n# review logs and agent guides. Kept on disk for review, never committed and\n# never served — no file under this path is imported by any app code.\nintake-private/\n';
   assert.equal(now.trimEnd(),(before+suffix).trimEnd(),'Only the documented private intake ignore rule is allowed');
  }
 }
 assert.equal(new Set(h.additions.map(e=>e.path)).size,h.additions.length);
 for(const e of h.additions){
  assert.match(e.path,/^(app|components|lib|content|public|tests)\//);
  assert.equal(e.sha256,baseline[e.path],'Preexisting addition missing from sealed baseline');
  assert.equal(hash(e.originalPath),successor.expected(e.originalPath,e.sha256),'Preserved addition bytes changed');
 }
 assert.equal(new Set(m.files.map(e=>e.path)).size,m.files.length,'Duplicate successor path');
 for(const e of m.files){
  assert.equal(e.beforeSha256,baseline[e.path]??null,'Unbound final-review change '+e.path);
  if(e.beforeSha256!==null&&!e.generated)assert.equal(hash(e.rollbackPath),successor.expected(e.rollbackPath,e.beforeSha256),'Rollback drift '+e.path);
  assert.equal(hash(e.path),successor.expected(e.path,e.sha256),'Final-review drift '+e.path);
 }
 // A preserved addition may itself be changed by this authorized successor, or
 // retired by it. A vanished file must be recorded in the successor layer; it
 // must not silently disappear because the old receipt cannot hash it.
 for(const e of h.additions){
  if(!existsSync(resolve(root,e.path))){assert.ok(successor.retired?.(e.path),'Preserved addition vanished without a successor record '+e.path);continue;}
  const change=m.files.find(f=>f.path===e.path);
  assert.equal(hash(e.path),successor.expected(e.path,change?.sha256??e.sha256),'Preexisting addition drift '+e.path);
 }
 function expected(p,old){const historic=transitions.find(e=>e.path===p&&e.fromSha256===old)?.toSha256??(old===null?h.additions.find(e=>e.path===p)?.sha256:undefined)??old;return successor.expected(p,m.files.find(e=>e.path===p&&e.beforeSha256===historic)?.sha256??historic);}
 return {expected,paths:()=>[...m.files.map(e=>e.path),...h.additions.map(e=>e.path),...successor.paths()],
  bytes(p,old,n){const next=expected(p,old);return next===old?n:successor.bytes(p,m.files.find(e=>e.path===p&&e.sha256===next)?.bytes??transitions.find(e=>e.path===p&&e.toSha256===next)?.toBytes??n);},
  historicalBytes(p,sha){const e=transitions.find(e=>e.path===p&&e.fromSha256===sha);return e?raw(e.originalPath):null;},
 };
}
