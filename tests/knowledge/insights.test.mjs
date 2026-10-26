import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { eligibleInsights, searchInsights, selectedInsight } from '../../lib/knowledge/insights.ts';
const feed=JSON.parse(fs.readFileSync(new URL('../../content/knowledge/insights.json',import.meta.url),'utf8'));
test('Public projection excludes every unreviewed scenario; preview has three stable original IDs',()=>{
  assert.equal(eligibleInsights(feed.items).length,0);
  const preview=eligibleInsights(feed.items,true);assert.equal(preview.length,3);
  assert.equal(new Set(preview.map(x=>x.id)).size,3);
  assert.ok(preview.every(x=>x.questionIds.length===0&&x.reviewStatus==='technical_review'));
});
test('Unknown editorial states and missing essential evidence never become eligible',()=>{
  const original=feed.items[0];
  for(const patch of [{reviewStatus:'approved'},{reviewStatus:'candidate'},{sourceUrl:'javascript:alert(1)'},{sourceLocator:''},{takeaway:''},{caveat:''},{checkedAt:''},{reviewer:''}]){
    assert.equal(eligibleInsights([{...original,...patch}],true).length,0);
  }
});
test('Published eligibility does not mutate original records',()=>{
  const before=JSON.stringify(feed.items); const candidate={...feed.items[0],reviewStatus:'published'};
  assert.equal(eligibleInsights([candidate]).length,1);assert.equal(JSON.stringify(feed.items),before);
});
test('Search includes caveats, is case-insensitive, combines topic and recovers empty results',()=>{
  assert.equal(searchInsights(feed.items,'WRITE permissions').length,1);
  assert.equal(searchInsights(feed.items,'','Lakehouse').length,1);
  assert.equal(searchInsights(feed.items,'permissions','Lakehouse').length,0);
  assert.equal(searchInsights(feed.items,'zzzz-no-match').length,0);
  assert.equal(searchInsights(feed.items,'  ').length,3);
});
test('Invalid, stale or hostile permalink falls back without manufacturing content',()=>{
  assert.equal(selectedInsight(feed.items,'<script>'),feed.items[0]);
  assert.equal(selectedInsight(feed.items,feed.items[1].id),feed.items[1]);
  assert.equal(selectedInsight([],null),undefined);
});
