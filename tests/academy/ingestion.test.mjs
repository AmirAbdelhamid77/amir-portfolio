import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {implementationReceipt} from '../../scripts/atlas-implementation-receipt.mjs';
import {DEFAULT_CONSTRAINTS,evaluate,TRANSFER,emptyLessonState,parseLessonState,completedCount,LESSON,REFERENCES} from '../../lib/academy/ingestion.ts';
test('decision oracle: reference, managed replica, and transformed retained batch',()=>{
 assert.equal(evaluate(DEFAULT_CONSTRAINTS).recommendation,'shortcut');
 assert.equal(evaluate({...DEFAULT_CONSTRAINTS,source:'database',goal:'replica'}).recommendation,'mirroring');
 assert.equal(evaluate({...DEFAULT_CONSTRAINTS,source:'files',goal:'snapshot',transform:true}).recommendation,'copy');
});
test('constraints fail closed; unsupported replication never silently becomes batch copy',()=>{
 assert.equal(evaluate({...DEFAULT_CONSTRAINTS,access:false}).recommendation,null);
 assert.equal(evaluate({...DEFAULT_CONSTRAINTS,transform:true}).recommendation,null);
 assert.equal(evaluate({...DEFAULT_CONSTRAINTS,source:'database',goal:'replica',mirrorSupported:false}).recommendation,null);
 assert.equal(evaluate({...DEFAULT_CONSTRAINTS,source:'database',goal:'replica',transform:true}).recommendation,null);
});
test('exhaustive truth table preserves requirements in all 72 states',()=>{
 let n=0;
 for(const source of ['gold','database','files'])for(const goal of ['reference','replica','snapshot'])for(const access of [true,false])for(const mirrorSupported of [true,false])for(const transform of [true,false]){
 const r=evaluate({source,goal,access,mirrorSupported,transform});n++;
 assert.equal(r.decisions.length,3);assert.ok(r.summary.length);
 assert.equal(r.decisions.filter(d=>d.fits).length,r.recommendation?1:0);
 if(!access)assert.equal(r.recommendation,null);
 if(r.recommendation==='shortcut'){assert.notEqual(source,'database');assert.equal(goal,'reference');assert.equal(transform,false);}
 if(r.recommendation==='mirroring'){assert.equal(source,'database');assert.equal(goal,'replica');assert.equal(mirrorSupported,true);assert.equal(transform,false);}
 if(r.recommendation==='copy')assert.equal(goal,'snapshot');
 }assert.equal(n,72);
});
test('all three original transfer cases have distinct IDs and complete alternative reasoning',()=>{
 assert.equal(new Set(TRANSFER.map(q=>q.id)).size,3);
 assert.equal(new Set(TRANSFER.map(q=>q.answer)).size,3);
 for(const q of TRANSFER){assert.ok(q.id.startsWith('academy-'));for(const p of ['shortcut','mirroring','copy'])assert.ok(q.rationales[p].length>40);}
});
test('stored progress round trips without trusting stored success flags',()=>{
 const s=emptyLessonState();for(const q of TRANSFER)s.answers[q.id]=q.answer;s.checked=TRANSFER.map(q=>q.id);
 assert.equal(completedCount(parseLessonState(JSON.stringify(s))),3);
 s.answers[TRANSFER[0].id]='copy';assert.equal(completedCount(s),2);
 s.checked=[];assert.equal(completedCount(s),0);
 assert.deepEqual(parseLessonState(null),emptyLessonState());
});
test('corrupt, mismatched, oversized or unknown-ID state is rejected',()=>{
 for(const value of ['', 'null','[]','{}','not json',JSON.stringify({...emptyLessonState(),revision:2}),JSON.stringify({...emptyLessonState(),answers:{unknown:'copy'}}),JSON.stringify({...emptyLessonState(),checked:[TRANSFER[0].id]}),JSON.stringify({...emptyLessonState(),journal:[null]}),JSON.stringify({...emptyLessonState(),journal:Array(31).fill({id:TRANSFER[0].id,answer:'copy',confidence:'low'})})])assert.equal(parseLessonState(value),null);
});
test('guide references resolve, no raw source asset is imported by academy UI',()=>{
 const base='docs/agent-handoffs/dp600-learning-academy-2026-10-25/web-content-pack/HANSA_DP600_WEB_CONTENT_PACK_v1';
 const ids=new Set(JSON.parse(readFileSync(`${base}/data/sections.json`)).map(s=>s.id));for(const id of LESSON.sourceSections)assert.ok(ids.has(id));
 for(const r of REFERENCES)assert.equal(new URL(r.url).hostname,'learn.microsoft.com');
 for(const f of ['components/academy/ingestion-lab.tsx','app/learn/dp-600/page.tsx','app/learn/dp-600/ingestion/page.tsx'])assert.doesNotMatch(readFileSync(f,'utf8'),/import.*agent-handoffs|import.*source_content|\.pdf#page/);
});
test('pre-existing working files are byte-preserved except three additive integration points',()=>{
 const baseline=JSON.parse(readFileSync('docs/dp600-academy/PHASE_0_PRESERVATION_BASELINE.json'));
 const allowed=new Set(['lib/fabric/nav.ts','lib/catalogue.ts','app/sitemap.ts']);
 const implementation=implementationReceipt(resolve('.'));
 for(const f of [...baseline.files,...baseline.config]){assert.ok(existsSync(f.path),`missing ${f.path}`);if(allowed.has(f.path))continue;assert.equal(createHash('sha256').update(readFileSync(f.path)).digest('hex'),implementation.expected(f.path,f.sha256),`unexpected change ${f.path}`);}
});
