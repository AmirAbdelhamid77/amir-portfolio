import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='docs/knowledge-atlas/dp600-expansion/qa';mkdirSync(out,{recursive:true});
const base='http://localhost:4191',browser=await chromium.launch({executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true});
const checks=[],errors=[];
try{
 for(const width of [1440,390]){
  const ctx=await browser.newContext({viewport:{width,height:950},colorScheme:width===390?'dark':'light',reducedMotion:'reduce'});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/lab/dp-600/explore/?question=new-mixed-1',{waitUntil:'networkidle'});
  await page.getByTestId('added-question').waitFor();await page.getByText('1286 source records match',{exact:true}).waitFor();
  await page.evaluate(()=>{for(const k of ['amir-fabric-v1','amir-lab-v1','hansa-atlas-journey-v1','hansa-academy-ingestion-v1'])localStorage.setItem(k,'preserve-'+k);});
  await page.getByTestId('added-question').getByRole('radio').last().check();await page.getByRole('button',{name:'Check against source answer',exact:true}).click();
  await page.reload({waitUntil:'networkidle'});await page.getByTestId('added-question').getByRole('radio').last().waitFor();assert.equal(await page.getByTestId('added-question').getByRole('radio').last().isChecked(),true);
  await page.getByRole('button',{name:'Reset this imported question',exact:true}).click();
  assert.equal(await page.evaluate(()=>['amir-fabric-v1','amir-lab-v1','hansa-atlas-journey-v1','hansa-academy-ingestion-v1'].every(k=>localStorage.getItem(k)==='preserve-'+k)),true);
  await page.getByLabel('Images required later',{exact:true}).check();await page.getByText('98 source records match',{exact:true}).waitFor();
  await page.goto(base+'/lab/dp-600/explore/?question=new-json-t1q10',{waitUntil:'networkidle'});await page.getByText('⚑ Images required later — scoring paused',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Check against source answer',exact:true}).isDisabled(),true);
  await page.goto(base+'/lab/dp-600/explore/?question=new-litware-2',{waitUntil:'networkidle'});const selects=page.getByTestId('added-question').locator('select');await selects.first().waitFor();assert.equal(await selects.count(),2);
  await page.screenshot({path:out+'/bank-'+width+'.png',fullPage:false});
  await page.goto(base+'/learn/dp-600/atlas/?concept=concept%3Afabric%3Adirect-lake&incoming=1',{waitUntil:'networkidle'});await page.getByTestId('review-notice').waitFor();await page.getByText('42 of 42 concepts',{exact:false}).waitFor();
  const link=page.getByTestId('atlas-inspector').locator('a[href*="question="]').first();await link.waitFor();assert.ok((await link.getAttribute('href')).includes('atlasReturn='));await link.click();await page.getByTestId('unified-bank').waitFor();await page.getByRole('link',{name:'Return to Atlas view',exact:true}).click();assert.ok(page.url().includes('direct-lake'));
  const notes=page.getByTestId('atlas-inspector').locator('a[href*="pack="]').first();await notes.click();await page.getByText('Return to your Atlas view',{exact:true}).waitFor();assert.ok(page.url().includes('pack=video07'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.goto(base+'/learn/dp-600/atlas/?concept=concept%3Afabric%3Adirect-lake&incoming=1',{waitUntil:'networkidle'});await page.screenshot({path:out+'/atlas-'+width+'.png',fullPage:false});
  checks.push({width,status:'PASS',checks:'Unified count, new answer reload/reset, four legacy keys preserved, missing exhibits unscored, dropdowns, 42 concepts, question return and notes link, no horizontal overflow'});await ctx.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();writeFileSync(out+'/BROWSER.json',JSON.stringify({checks,errors},null,2));}
console.log('PASS: desktop/mobile unified-bank and expanded Atlas workflows; legacy progress preserved.');
