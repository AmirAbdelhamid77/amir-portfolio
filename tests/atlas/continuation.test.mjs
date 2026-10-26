import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectAtlas,defaultView,resourceReturnHref,validResourceHref,neighborhood,validateDataset} from '../../lib/atlas/model.ts';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const pilot=json('content/atlas/editorial.json'),extension=json('content/atlas/dp600-extension.json'),continuation=json('content/atlas/dp600-continuation.json');
const data={...pilot,concepts:[...pilot.concepts,...extension.concepts,...continuation.concepts],semanticEdges:[...pilot.semanticEdges,...extension.semanticEdges,...continuation.semanticEdges],sources:[...pilot.sources,...extension.sources,...continuation.sources],catalog:[...pilot.catalog,...extension.catalog,...continuation.catalog]};
test('continuation layer validates, adds objective coverage, and stays out of the public projection',()=>{
 validateDataset(data);
 const review=projectAtlas(data,true);assert.equal(review.concepts.length,42);assert.equal(review.semanticEdges.length,49);
 assert.equal(projectAtlas(data).concepts.length,0);assert.equal(projectAtlas(data).semanticEdges.length,0);
 assert.equal(continuation.concepts.length,14);assert.equal(continuation.semanticEdges.length,18);
 assert.ok(continuation.semanticEdges.every(e=>e.editorialState==='technical_review'&&e.conditions.trim()&&e.rationale.trim()&&e.sourceIds.length));
 assert.ok(continuation.concepts.concat(continuation.semanticEdges).every(r=>!r.reviewer||!r.reviewer.startsWith('Human:')),'no layer may claim human approval');
});
test('every continuation concept is connected and every added relation is reachable in the review map',()=>{
 const ids=new Set(data.concepts.map(c=>c.id)),edges=data.semanticEdges;
 for(const concept of continuation.concepts){assert.ok(edges.some(e=>e.from===concept.id||e.to===concept.id),'orphan concept '+concept.id);}
 for(const edge of continuation.semanticEdges){assert.ok(ids.has(edge.from)&&ids.has(edge.to));}
 const review=projectAtlas(data,true);
 const focus=neighborhood(review,{...defaultView(),concept:'concept:fabric:incremental-refresh',hops:2,incoming:true});
 assert.ok(focus.edges.some(e=>e.id==='edge:fabric:cont-import-incremental'));
 assert.ok(focus.edges.some(e=>e.id==='edge:fabric:cont-incremental-directlake'));
 assert.ok(neighborhood(review,{...defaultView(),concept:'concept:fabric:warehouse-cls',hops:2}).edges.some(e=>e.id==='edge:fabric:cont-cls-directlake'));
});
test('added sources are official, dated, uniquely identified and locatable',()=>{
 const ids=new Map();for(const source of continuation.sources){assert.ok(!ids.has(source.id),'duplicate source '+source.id);ids.set(source.id,source);assert.equal(new URL(source.url).hostname,'learn.microsoft.com');assert.equal(source.checkedAt,'2026-10-26');assert.ok(source.locator.length>10);}
 const earlier=new Set([...pilot.sources,...extension.sources].map(s=>s.id));
 for(const source of continuation.sources)assert.ok(!earlier.has(source.id),'source id reused: '+source.id);
});
test('reviewed catalogue associations resolve to real records and stay catalogue metadata',()=>{
 const index=json('content/fabric/index.json'),qs=json('content/fabric/additions/questions.json');
 const ids=new Set([...index,...qs].map(q=>q.id)),packs=new Set(json('content/fabric/packs.json').map(p=>p.key));
 assert.equal(continuation.catalog.length,11);
 assert.equal(continuation.catalog.filter(c=>c.kind==='question').length,8);
 assert.equal(continuation.catalog.filter(c=>c.kind==='lesson-notes').length,3);
 for(const r of continuation.catalog){
  assert.ok(r.mappingEvidence.length>30&&r.mappingReview&&r.checkedAt==='2026-10-26');
  const u=new URL(r.href,'https://local.invalid');assert.ok(validResourceHref(r.href));
  if(r.kind==='question'){assert.ok(ids.has(u.searchParams.get('question')),'unknown question '+r.questionId);assert.equal(u.searchParams.get('question'),r.questionId);}
  else assert.ok(packs.has(u.searchParams.get('pack')));
  assert.ok(!data.semanticEdges.some(e=>e.id===r.id||e.from===r.id||e.to===r.id),'association became a graph edge');
 }
 const blocked=new Set(qs.filter(q=>q.blockers.length).map(q=>q.id));
 for(const r of continuation.catalog.filter(c=>c.kind==='question'))assert.ok(!blocked.has(r.questionId),'blocked exhibit must not be cited as reviewed: '+r.questionId);
 const q=continuation.catalog.find(r=>r.kind==='question');const href=resourceReturnHref(q.href,defaultView());
 assert.equal(new URL(href,'https://local.invalid').searchParams.get('question'),q.questionId);assert.ok(href.includes('atlasReturn='));
});
test('objective coverage names only reviewable concepts and records what is still missing',()=>{
 const ids=new Set(data.concepts.map(c=>c.id));
 assert.equal(continuation.coverage.objectives.length,10);
 for(const row of continuation.coverage.objectives){assert.ok(row.conceptIds.length&&row.domain&&row.objective);for(const id of row.conceptIds)assert.ok(ids.has(id),'unknown coverage concept '+id);}
 const covered=new Set(continuation.coverage.objectives.flatMap(r=>r.conceptIds));
 for(const concept of continuation.concepts)assert.ok(covered.has(concept.id),'new concept missing from objective coverage: '+concept.id);
 assert.ok(continuation.coverage.remaining.length>=4);
});
