import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { dailyBankEntry, cairoDay } from '../../lib/knowledge/daily-bank.ts';
import { normalizedText } from '../../scripts/insight-source-evidence.mjs';
const items=Array.from({length:7},(_,i)=>({id:`fixture-${i}`,reviewStatus:'published',sourceReviewed:true,scientificallyVerified:true,publicationApproved:true}));
const release={version:'fixture-v1',startsOn:'2026-11-01',items};
const date=i=>new Date(Date.UTC(2026,10,1+i)).toISOString().slice(0,10);
test('stable selection, input order independence, and no mutation',()=>{
 const before=JSON.stringify(release);
 assert.equal(dailyBankEntry(release,date(3)).id,dailyBankEntry({...release,items:[...items].reverse()},date(3)).id);
 assert.equal(JSON.stringify(release),before);
});
test('every rolling bank-sized window has unique IDs across cycle boundaries',()=>{
 for(let start=0;start<21;start++)assert.equal(new Set(Array.from({length:7},(_,i)=>dailyBankEntry(release,date(start+i)).id)).size,7);
});
test('every publication gate fails closed',()=>{
 for(const field of ['sourceReviewed','scientificallyVerified','publicationApproved'])assert.equal(dailyBankEntry({...release,items:items.map(x=>({...x,[field]:false}))},date(0)),undefined);
 assert.equal(dailyBankEntry({...release,items:items.map(x=>({...x,reviewStatus:'technical_review'}))},date(0)),undefined);
 assert.equal(dailyBankEntry({...release,items:[]},date(0)),undefined);
 assert.equal(dailyBankEntry(release,'2026-10-31'),undefined);
});
test('reject invalid dates and duplicate IDs',()=>{
 for(const day of ['2026-02-30','nonsense','2026-1-1'])assert.throws(()=>dailyBankEntry(release,day));
 assert.throws(()=>dailyBankEntry({...release,items:[items[0],items[0]]},date(0)));
});
test('Cairo civil day changes at local midnight, including summer offset',()=>{
 assert.equal(cairoDay(new Date('2026-11-06T21:59:59Z')),'2026-11-06');
 assert.equal(cairoDay(new Date('2026-11-06T22:00:00Z')),'2026-11-07');
 assert.equal(cairoDay(new Date('2026-07-01T21:00:00Z')),'2026-07-02');
});
test('staging bank sources resolve with unchanged fingerprints and all entries are excluded',()=>{
 const bank=JSON.parse(fs.readFileSync('docs/daily-insight-bank-20261106/INSIGHT_BANK.json','utf8'));
 assert.equal(new Set(bank.items.map(x=>x.id)).size,bank.items.length);
 for(const item of bank.items){
  let value=JSON.parse(fs.readFileSync(item.source.path,'utf8'));
  for(const part of item.source.pointer.slice(1).split('/'))value=value[part];
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'),item.source.sha256);
  for(const field of ['title','scenario','takeaway','caveat'])assert.ok(item[field]?.trim());
 }
 assert.equal(dailyBankEntry({...release,items:bank.items},date(0)),undefined);
});
test('batch 2 preserves every original ID, teaching claim, source fingerprint and review gate',()=>{
 const baseline=JSON.parse(fs.readFileSync('docs/daily-insight-bank-20261106/BATCH1_ARCHIVE.json','utf8'));
 const bank=JSON.parse(fs.readFileSync('docs/daily-insight-bank-20261106/INSIGHT_BANK.json','utf8'));
 for(const previous of baseline.items){
  const current=bank.items.find(x=>x.id===previous.id);
  assert.ok(current,previous.id);
  for(const field of ['subject','topic','title','scenario','takeaway','caveat','source','reviewStatus','sourceReviewed','scientificallyVerified','publicationApproved'])assert.deepEqual(current[field],previous[field],`${previous.id}: ${field}`);
 }
});
test('every topic has a candidate and new evidence points to a matching local passage',()=>{
 const inventory=JSON.parse(fs.readFileSync('docs/daily-insight-bank-20261106/SOURCE_INVENTORY.json','utf8'));
 const bank=JSON.parse(fs.readFileSync('docs/daily-insight-bank-20261106/INSIGHT_BANK.json','utf8'));
 const baseline=JSON.parse(fs.readFileSync('docs/daily-insight-bank-20261106/BATCH1_ARCHIVE.json','utf8'));
 const previousIds=new Set(baseline.items.map(x=>x.id));
 assert.equal(inventory.subjects.length,8);
 assert.equal(inventory.subjects.flatMap(x=>x.topics).length,55);
 for(const subject of inventory.subjects)for(const topic of subject.topics){
  assert.ok(topic.candidateIds.length,`${subject.id}/${topic.id}`);
  for(const id of topic.candidateIds)assert.ok(bank.items.some(x=>x.id===id&&x.subject===subject.id&&x.topic===topic.id));
 }
 for(const item of bank.items.filter(x=>!previousIds.has(x.id))){
  assert.ok(item.evidence?.excerpt,item.id);
  let source=JSON.parse(fs.readFileSync(item.source.path,'utf8'));
  for(const part of item.evidence.pointer.slice(1).split('/'))source=source[part.replace(/~1/g,'/').replace(/~0/g,'~')];
  assert.ok(normalizedText(source).includes(normalizedText(item.evidence.excerpt)),item.id);
 }
 assert.equal(new Set(bank.items.map(x=>x.takeaway.trim())).size,bank.items.length);
});
test('batch 3 adds exactly 150 entries without changing any of the previous 76',()=>{
 const prefix='docs/daily-insight-bank-20261106/';
 const old=JSON.parse(fs.readFileSync(prefix+'PRE_BATCH3_ARCHIVE.json','utf8'));
 const bank=JSON.parse(fs.readFileSync(prefix+'INSIGHT_BANK.json','utf8'));
 const batch=JSON.parse(fs.readFileSync(prefix+'BATCH3_150_INSIGHTS.json','utf8'));
 assert.equal(old.items.length,76);
 assert.equal(batch.items.length,150);
 assert.equal(bank.items.length,400);
 for(const item of old.items)assert.deepEqual(bank.items.find(x=>x.id===item.id),item);
 const oldIds=new Set(old.items.map(x=>x.id));
 for(const item of batch.items){assert.ok(!oldIds.has(item.id));assert.deepEqual(bank.items.find(x=>x.id===item.id),item);}
 for(const item of batch.items){
  assert.equal(item.reviewStatus,'draft');
  assert.equal(item.scientificallyVerified,false);
  assert.equal(item.publicationApproved,false);
  assert.ok(item.evidence?.excerpt&&item.evidence?.pointer);
  assert.ok(item.lessonHref.startsWith('/'));
 }
});
test('batch 4 preserves all 226 prior entries and adds exactly 174 source-backed drafts',()=>{
 const prefix='docs/daily-insight-bank-20261106/';
 const old=JSON.parse(fs.readFileSync(prefix+'PRE_BATCH4_ARCHIVE.json','utf8'));
 const bank=JSON.parse(fs.readFileSync(prefix+'INSIGHT_BANK.json','utf8'));
 const batch=JSON.parse(fs.readFileSync(prefix+'BATCH4_174_INSIGHTS.json','utf8'));
 assert.equal(old.items.length,226);
 assert.equal(bank.items.length,400);
 assert.equal(batch.items.length,174);
 for(const item of old.items)assert.deepEqual(bank.items.find(x=>x.id===item.id),item);
 const oldIds=new Set(old.items.map(x=>x.id));
 assert.deepEqual(bank.items.filter(x=>!oldIds.has(x.id)),batch.items);
 for(const item of batch.items){
  assert.equal(item.reviewStatus,'draft');
  assert.equal(item.sourceReviewed,true);
  assert.equal(item.scientificallyVerified,false);
  assert.equal(item.publicationApproved,false);
  assert.ok(item.evidence?.excerpt&&item.evidence?.pointer);
 }
});
test('evidence normalization preserves SQL inequalities and following source prose',()=>{
 assert.equal(normalizedText('<code>x < upper_bound</code> ثم الشرح <b>المحلي</b>'),'x < upper_bound ثم الشرح المحلي');
});
