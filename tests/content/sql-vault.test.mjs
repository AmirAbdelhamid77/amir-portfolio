import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {register} from 'node:module';
register('../../scripts/study-loader.mjs',import.meta.url);
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const vault=json('content/sql/vault.json'),index=json('content/sql/index.json'),coverage=json('docs/sql-integration-20261028/SOURCE_COVERAGE.json');
const sha=b=>createHash('sha256').update(b).digest('hex');

test('every source entry is accounted for and canonical order has exactly one owner',()=>{
 assert.equal(coverage.exportCount,10);assert.equal(coverage.sourceEntries,85);assert.equal(coverage.uniqueSourceIds,76);
 assert.equal(coverage.ledger.length,85);assert.equal(new Set(vault.pages.map(p=>p.id)).size,vault.pages.length);
 const modules=vault.pages.filter(p=>p.role==='canonical');assert.deepEqual(modules.map(p=>p.module),Array.from({length:18},(_,i)=>i));
 assert.match(modules[14].title,/DDL, DML & Transactions/);assert.match(modules[15].title,/Database Design/);assert.match(modules[16].title,/Performance/);
 for(const p of vault.pages){assert.ok(coverage.ledger.some(e=>e.id===p.id&&e.sha256===sha(p.body)));assert.ok(p.blocks.length);}
 for(const entry of coverage.ledger.filter(e=>/archive.*excluded/.test(e.sourceType)))assert.ok(!vault.pages.some(p=>p.id===entry.id));
 assert.equal(index.pages.find(p=>p.id==='3cb3906c5d6c81a79c56d4bb581dfc02').topic,'aggregation','GROUP BY extensions keep their source collection but teach under aggregation');
});
test('source diagrams, code, media and bilingual bodies survive import',()=>{
 for(const p of vault.pages){const fences=[...p.body.matchAll(/^```([^\n]*)\n([\s\S]*?)^```/gm)];assert.equal(p.blocks.filter(b=>b.type==='code').length,fences.length,p.title);for(const f of fences)assert.ok(p.blocks.some(b=>b.type==='code'&&b.text===f[2].replace(/\n$/,'')),p.title);}
 const images=vault.pages.flatMap(p=>p.blocks.filter(b=>b.type==='image'));assert.equal(images.length,4);for(const b of images)assert.ok(fs.existsSync('public'+b.path));
 assert.ok(vault.pages.some(p=>/[\u0600-\u06ff]/.test(p.body)));
 assert.ok(vault.pages.find(p=>p.module===12).blocks.some(b=>b.type==='table'&&b.rows.some(r=>r.includes('1000'))));
});
test('pre-existing content, exam answers and identities remain byte-identical',()=>{
 for(const file of json('docs/sql-integration-20261028/BASELINE.json'))assert.equal(sha(fs.readFileSync(file.path)),file.sha256,file.path);
 const exam=json('content/exams/sql.json');assert.deepEqual(exam.questions.map(q=>q.id),Array.from({length:10},(_,i)=>'sql-'+String(i+1).padStart(2,'0')));
 assert.deepEqual(Object.keys(index.legacyMap).sort(),exam.questions.map(q=>q.id).sort());
});
test('source self-checks retain prompts and responses without adding grading keys to discovery',()=>{
 assert.equal(vault.drills.length,16);assert.equal(new Set(vault.drills.map(q=>q.id)).size,16);
 for(const q of vault.drills){const page=vault.pages.find(p=>p.id===q.sourceId);assert.ok(page.body.includes(q.answer));assert.ok(q.answerBlocks.length);assert.ok(vault.pages.some(p=>p.module===q.module));}
 for(const q of index.drills){assert.ok(!('answer' in q));assert.ok(!('answerBlocks' in q));assert.ok(!('options' in q));}
});
test('grain trace agrees with independently executed SQL and preserves pre-aggregation grain',async()=>{
 const {grainTrace}=await import('../../lib/sql/grain.ts');const db=new DatabaseSync(':memory:');
 db.exec('CREATE TABLE orders(customer_id INT,amount INT);CREATE TABLE payments(customer_id INT,amount INT);INSERT INTO orders VALUES(1,100),(1,50);INSERT INTO payments VALUES(1,80),(1,70);');
 const raw=db.prepare('SELECT COUNT(*) AS n,SUM(o.amount) AS orders,SUM(p.amount) AS payments FROM orders o JOIN payments p USING(customer_id)').get();
 const grouped=db.prepare('WITH o AS(SELECT customer_id,SUM(amount) amount FROM orders GROUP BY customer_id),p AS(SELECT customer_id,SUM(amount) amount FROM payments GROUP BY customer_id) SELECT COUNT(*) n,SUM(o.amount) orders,SUM(p.amount) payments FROM o JOIN p USING(customer_id)').get();
 for(const [mode,result]of [[false,raw],[true,grouped]]){const trace=grainTrace(mode);assert.equal(trace.rows.length,result.n);assert.equal(trace.displayedOrders,result.orders);assert.equal(trace.displayedPayments,result.payments);}
 db.close();
});
test('corrected window figure includes only the two preceding rows and current row',()=>{
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE sales(day INT,amount INT);INSERT INTO sales VALUES(1,10),(2,20),(3,15),(4,30),(5,25),(6,40),(7,35);');
 const row=db.prepare('SELECT * FROM (SELECT day,SUM(amount) OVER(ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS total FROM sales) WHERE day=5').get();assert.equal(row.total,70);db.close();
});
test('new SQL discovery is unique, topic-valid and has a complete canonical reading sequence',async()=>{
 const {studyRecords}=await import('../../lib/study/server.ts');const {learningUnits,resolveEvidence}=await import('../../lib/study/learning-path.ts');const {TOPIC_REVIEW}=await import('../../lib/study/topic-review.ts');const {SUBJECTS}=await import('../../lib/study/taxonomy.ts');
 const records=studyRecords();assert.equal(new Set(records.map(r=>r.id)).size,records.length);
 for(const r of records){assert.ok(SUBJECTS.find(s=>s.id===r.subject)?.topics.some(t=>t[0]===r.topic),r.id);assert.ok(!('answer'in r));}
 const units=learningUnits().filter(u=>u.subject==='sql');assert.equal(units.length,18);assert.deepEqual(units.map(u=>u.id),Array.from({length:18},(_,i)=>'sql-module-'+String(i).padStart(2,'0')));
 for(const [topic]of SUBJECTS.find(s=>s.id==='sql').topics){const review=TOPIC_REVIEW['sql.'+topic];assert.ok(review,topic);for(const key of review.evidence)assert.ok(resolveEvidence(key));}
 assert.equal(records.filter(r=>r.kind==='question').length,1547);// 1467 baseline + the 80 authored corpus questions (phase C)
});
