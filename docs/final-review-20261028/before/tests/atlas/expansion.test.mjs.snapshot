import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {projectAtlas,defaultView,resourceReturnHref,validResourceHref,neighborhood} from '../../lib/atlas/model.ts';
import {parseAddedProgress,gradeAdded} from '../../lib/fabric/additions.ts';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const pilot=json('content/atlas/editorial.json'),extension=json('content/atlas/dp600-extension.json');
const data={...pilot,concepts:[...pilot.concepts,...extension.concepts],semanticEdges:[...pilot.semanticEdges,...extension.semanticEdges],sources:[...pilot.sources,...extension.sources],catalog:[...pilot.catalog,...extension.catalog]};
const qs=json('content/fabric/additions/questions.json'),manifest=json('content/fabric/additions/manifest.json');
test('full expansion is valid, semantic-only, and never published through normal projection',()=>{
 const review=projectAtlas(data,true);assert.equal(review.concepts.length,28);assert.equal(review.semanticEdges.length,31);
 assert.equal(projectAtlas(data).concepts.length,0);assert.equal(projectAtlas(data).catalog.length,0);
 assert.ok(extension.semanticEdges.every(e=>e.editorialState==='technical_review'&&e.conditions&&e.rationale));
 assert.ok(neighborhood(review,{...defaultView(),concept:'concept:fabric:direct-lake',incoming:true}).edges.length>=5);
});
test('catalogue question and learning-note associations resolve to real records without becoming graph edges',()=>{
 const index=json('content/fabric/index.json');const ids=new Set([...index,...qs].map(q=>q.id));const packs=new Set(json('content/fabric/packs.json').map(p=>p.key));
 for(const r of extension.catalog){assert.ok(r.mappingEvidence&&r.mappingReview);const u=new URL(r.href,'https://local.invalid');assert.ok(validResourceHref(r.href));if(r.kind==='question')assert.ok(ids.has(u.searchParams.get('question')));else assert.ok(packs.has(u.searchParams.get('pack')));}
 const q=extension.catalog.find(r=>r.kind==='question');const href=resourceReturnHref(q.href,defaultView());assert.equal(new URL(href,'https://local.invalid').searchParams.get('question'),q.questionId);assert.ok(href.includes('atlasReturn='));
 for(const url of ['//evil.test','/lab/dp-600/explore/?question=x&next=evil','/lab/dp-600/resources/?pack=../foo#study-notes','javascript:alert(1)'])assert.equal(validResourceHref(url),false);
});
test('all four exact source bytes, original question records and supplied image assets retained',()=>{
 assert.equal(qs.length,532);assert.equal(qs.filter(q=>q.exam==='PL-300').length,80);assert.equal(qs.filter(q=>q.blockers.length).length,98);assert.equal(new Set(qs.map(q=>q.id)).size,532);
 for(const f of manifest.inputs)assert.equal(createHash('sha256').update(readFileSync('intake/dp600-additions-2026-10-26/'+f.file)).digest('hex'),f.sha256);
 assert.equal(manifest.matchingStemGroups.length,101);assert.ok(manifest.matchingStemGroups.every(group=>group.every(id=>qs.some(q=>q.id===id))));
 for(const q of qs){assert.doesNotMatch(q.stemHtml+q.contextHtml+q.explanationHtml,/<(?:script|iframe|img)|\son\w+=/i);for(const im of q.images)assert.ok(existsSync('public'+im.src));}
});
test('every complete source question grades its supplied answer, and absent exhibits never score',()=>{
 for(const q of qs){const answer=q.mode==='controls'?Object.fromEntries(q.controls.map(c=>[c.id,c.answer])):Object.fromEntries(q.answers.map(a=>[a,'1']));assert.equal(gradeAdded(q,answer),q.blockers.length?null:true,q.id);assert.equal(gradeAdded(q,{}),null);}
 const single=qs.find(q=>q.mode==='single'&&!q.blockers.length);assert.equal(gradeAdded(single,Object.fromEntries(single.options.map(o=>[o.id,'1']))),null);
});
test('new progress is bounded and fail-closed; unknown formats and corrupt data are never repaired silently',()=>{
 assert.deepEqual(parseAddedProgress(null),{});assert.equal(parseAddedProgress('{bad'),null);assert.equal(parseAddedProgress(JSON.stringify({version:2,questions:{}})),null);
 const data={version:1,questions:{'new-litware-2':{values:{d1:'value'},checked:false}}};assert.deepEqual(parseAddedProgress(JSON.stringify(data)),data.questions);
 for(const value of [null,[],{values:[],checked:false},{values:{d:'x'.repeat(3001)},checked:false}])assert.equal(parseAddedProgress(JSON.stringify({version:1,questions:{'new-litware-2':value}})),null);
});
