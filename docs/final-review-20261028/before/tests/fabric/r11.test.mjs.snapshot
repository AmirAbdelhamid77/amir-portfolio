import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gradeR11,r11Expected,r11Complete,parseR11Progress,R11_REVISION,R11_STORAGE_KEY} from '../../lib/fabric/r11.ts';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const qs=json('content/fabric/r11/questions.json'),old=json('content/fabric/additions/questions.json');
const source=json('intake/dp600-r11-2026-10-26/source-v3.json'),audit=json('intake/dp600-r11-2026-10-26/dp600-r11-corrected-candidate.json');
const mappings=json('docs/dp600-r11-integration/SOURCE_MAPPING_222.json');
test('R11 enriches exactly the existing 222 source IDs; all 532 imports remain immutable',()=>{
 assert.equal(qs.length,222);assert.equal(old.length,532);assert.equal(new Set(qs.map(q=>q.hansaId)).size,222);
 assert.deepEqual(qs.map(q=>q.sourceId),source.questions.map(q=>q.id));
 assert.equal(new Set([...old.map(q=>q.id),...qs.map(q=>q.hansaId)]).size,532);
 const manifest=json('content/fabric/additions/manifest.json');
 for(const f of manifest.inputs)assert.equal(createHash('sha256').update(readFileSync('intake/dp600-additions-2026-10-26/'+f.file)).digest('hex'),f.sha256);
 for(const m of mappings){const q=old.find(q=>q.id===m.hansaId);assert.equal(q.sourceId,'json:'+m.sourceId);assert.ok(m.originalRecordSha256);}
 assert.deepEqual(json('content/fabric/r11/case-studies.json'),source.caseStudies);
});
test('only approved patches reach the learner view; unapproved candidate rewrites remain private',()=>{
 for(const q of qs){
  const s=source.questions.find(s=>s.id===q.sourceId),a=audit.questions.find(a=>a.id===q.sourceId);
  assert.equal(q.original.officialAnswer,s.officialAnswer);assert.equal('answer' in q.original,'answer' in s);assert.equal(q.original.answer,s.answer);
  assert.equal(q.stem,q.gradingEnabled?(a.r11CandidatePatch.stem??s.stem):s.stem,q.id);
  assert.equal(q.gradingEnabled,a.scientificGradingEnabled);
  assert.equal(gradeR11(q,r11Expected(q)),q.gradingEnabled?true:null,q.id);
  assert.equal(gradeR11(q,[]),null);
  assert.equal(gradeR11({...q,gradingEnabled:true,scientificStatus:'CORRECTION_PROPOSED'},r11Expected(q)),null);
 }
 assert.equal(qs.filter(q=>q.gradingEnabled).length,11);
 assert.equal(qs.filter(q=>!q.gradingEnabled).length,211);
 for(const [id,key]of[['T1Q120','D'],['T1Q193','A'],['T1Q221','C'],['T1Q222','C']])assert.equal(gradeR11(qs.find(q=>q.sourceId===id),key),false,id);
});
test('all seven control formats retain their source subparts and valid option mappings',()=>{
 assert.equal(new Set(qs.map(q=>q.type)).size,7);
 for(const q of qs){const expected=r11Expected(q);if(!r11Complete(q,expected))assert.equal(q.gradingEnabled,false,q.id);}
 const parts=qs.find(q=>q.type==='hotspot-yesno');assert.equal(r11Complete(parts,new Array(parts.statements.length)),false);
 const dropdown=qs.find(q=>q.type==='hotspot-dropdown');assert.equal(r11Complete(dropdown,['unlisted value']),false);
 const sequence=qs.find(q=>q.type==='dragdrop'&&!q.drag.reuse&&q.drag.targets.length>1);assert.equal(r11Complete(sequence,new Array(sequence.drag.targets.length).fill(sequence.drag.items[0])),false);
 const multi=qs.find(q=>q.type==='multi');assert.equal(r11Complete(multi,['B','B']),false);
});
test('progress rejects corrupt, oversized, unknown revision and malformed states while retaining a separate namespace',()=>{
 assert.notEqual(R11_STORAGE_KEY,'hansa-question-additions-v1');assert.deepEqual(parseR11Progress(null),{});
 for(const raw of ['bad','x'.repeat(500001),JSON.stringify({version:1,revision:'old',questions:{}})])assert.equal(parseR11Progress(raw),null);
 const good={version:1,revision:R11_REVISION,questions:{T1Q1:{answer:['B','C'],revealed:true,checked:true}}};assert.deepEqual(parseR11Progress(JSON.stringify(good)),good.questions);
 for(const value of [null,[],{answer:42,revealed:true,checked:false},{answer:[null],revealed:false,checked:false}])assert.equal(parseR11Progress(JSON.stringify({...good,questions:{T1Q1:value}})),null);
 assert.equal(parseR11Progress(JSON.stringify({...good,questions:{T1Q223:good.questions.T1Q1}})),null);
});
test('search publishes question metadata and deep links, with no answer/explanation payload',()=>{
 const docs=json('content/fabric/r11/search.json');assert.equal(docs.length,222);
 for(const d of docs){assert.equal(d.kind,'question');assert.ok(qs.some(q=>q.sourceId===d.sourceId&&d.url.endsWith('question='+q.hansaId)));for(const key of ['answer','officialAnswer','explanation','scientificApprovedAnswer'])assert.equal(key in d,false);}
 const component=readFileSync('components/fabric/r11-question.tsx','utf8');assert.doesNotMatch(component,/<(?:img|picture|canvas)\b/);assert.doesNotMatch(component,/dangerouslySetInnerHTML/);
});
