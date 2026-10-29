// Browser verification for the 2026-10-26 continuation layer.
// Writes only into docs/knowledge-atlas/dp600-continuation/qa. Historical expansion
// screenshots are never overwritten. Serve the review build on 4191 first:
//   node scripts/preview-atlas.mjs
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='docs/knowledge-atlas/dp600-continuation/qa';mkdirSync(out,{recursive:true});
const base='http://localhost:4191',browser=await chromium.launch({executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true});
const checks=[],errors=[];
try{
 for(const width of [1440,390]){
  const ctx=await browser.newContext({viewport:{width,height:950},colorScheme:width===390?'dark':'light',reducedMotion:'reduce'});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  const shot=async name=>{if(width===390) await page.getByTestId('atlas-inspector').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+name+'.png',fullPage:false});};
  await page.goto(base+'/learn/dp-600/atlas/?concept=concept%3Afabric%3Acalculation-group',{waitUntil:'networkidle'});
  await page.getByTestId('review-notice').waitFor();await page.getByText('42 of 42 concepts',{exact:false}).waitFor();
  await page.getByLabel('Find a concept').fill('calculation group');
  await page.getByText('1 of 42 concepts',{exact:false}).waitFor();
  await page.getByLabel('Find a concept').fill('');
  await page.getByRole('button',{name:/Calculation group/i}).first().click();
  await page.getByTestId('atlas-inspector').getByText('Calculation group',{exact:false}).first().waitFor();
  const inspector=page.getByTestId('atlas-inspector');
  assert.ok((await inspector.innerText()).includes('calculation item'),'inspector must explain the calculation-item mechanism');
  const sourceLinks=inspector.locator('a[href^="https://learn.microsoft.com/"]');
  assert.ok((await sourceLinks.count())>0,'an official source link must be present');
  await page.goto(base+'/learn/dp-600/atlas/?concept=concept%3Afabric%3Aincremental-refresh&incoming=1',{waitUntil:'networkidle'});
  await page.getByText('42 of 42 concepts',{exact:false}).waitFor();
  await shot('atlas-'+width);
  const question=page.getByTestId('atlas-inspector').locator('a[href*="question="]').first();await question.waitFor();
  assert.ok((await question.getAttribute('href')).includes('atlasReturn='),'question deep link must carry the Atlas return context');
  await question.click();await page.getByTestId('unified-bank').waitFor();
  await page.getByRole('link',{name:'Return to Atlas view',exact:true}).click();assert.ok(page.url().includes('incremental-refresh'),'return navigation must restore the concept');
  const notes=page.getByTestId('atlas-inspector').locator('a[href*="pack=video"]').first();
  if(await notes.count()){await page.goto(base+'/learn/dp-600/atlas/?concept=concept%3Afabric%3Aols&incoming=1',{waitUntil:'networkidle'});const security=page.getByTestId('atlas-inspector').locator('a[href*="pack="]').first();await security.click();await page.getByText('Return to your Atlas view',{exact:true}).waitFor();assert.ok(page.url().includes('pack='));}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
  await page.goto(base+'/learn/dp-600/atlas/?concept=concept%3Afabric%3Awarehouse-cls&incoming=1',{waitUntil:'networkidle'});await page.getByText('42 of 42 concepts',{exact:false}).waitFor();await shot('atlas-security-'+width);
  checks.push({width,status:'PASS',checks:'42-concept review count, search narrowing, calculation-group inspector, official source link, incremental-refresh focus, question deep link with atlasReturn, notes return, no horizontal overflow'});
  await ctx.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();writeFileSync(out+'/BROWSER.json',JSON.stringify({checks,errors,note:'Review build on 4191; historical expansion screenshots untouched'},null,2));}
console.log('PASS: continuation Atlas review workflows at 1440 light and 390 dark.');
