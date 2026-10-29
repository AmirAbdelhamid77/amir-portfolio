import { chromium } from 'playwright-core';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir='docs/prototype-c/qa';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true});
const base=process.env.PROTOTYPE_BASE||'http://127.0.0.1:4197';
const report={checkedAt:new Date().toISOString(),base,cases:[],errors:[]};
const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
async function run(name,fn){try{await fn();report.cases.push({name,status:'PASS'});}catch(e){report.cases.push({name,status:'FAIL',error:String(e)});}}
for(const setting of [{width:1440,height:1100,colorScheme:'light',reducedMotion:'no-preference'},{width:390,height:844,colorScheme:'dark',reducedMotion:'reduce'},{width:320,height:800,colorScheme:'light',reducedMotion:'reduce'}]){
 const context=await browser.newContext({viewport:{width:setting.width,height:setting.height},colorScheme:setting.colorScheme,reducedMotion:setting.reducedMotion});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));
 await context.addInitScript(()=>{for(const key of ['amir-lab-v1','amir-fabric-v1','hansa-question-additions-v1','hansa-atlas-journey-v1'])localStorage.setItem(key,'preservation-sentinel-'+key);});
 await page.goto(base+'/prototype-c/',{waitUntil:'networkidle'});
 await run(`${setting.width}: render + no professional homepage links + five destinations`,async()=>{
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('a[href="/work"],a[href="/experience"]').count(),0);
  if(setting.width<1024){await page.getByRole('button',{name:'Open menu',exact:true}).click();const nav=page.getByRole('navigation',{name:'Mobile',exact:true});for(const label of ['Today','Learn','Practice','Atlas','About'])assert.equal(await nav.getByRole('link',{name:new RegExp('^'+label)}).count(),1);await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Open menu',exact:true}).getAttribute('aria-expanded'),'false');}
  else for(const label of ['Today','Learn','Practice','Atlas','About'])assert.equal(await page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link',{name:label,exact:true}).count(),1);
 });
 await run(`${setting.width}: keyboard reveal, timeline, permalink reload/back, reset on edition`,async()=>{
  const summary=page.getByTestId('daily-reveal').locator('summary');await summary.focus();await page.keyboard.press('Enter');assert.equal(await page.getByTestId('daily-reveal').getAttribute('open'),'');
  const editions=page.getByRole('navigation',{name:'Insight editions'}).getByRole('link');await editions.nth(2).click();assert.match(await page.locator('#daily-title').innerText(),/Name the object/);assert.equal(await page.getByTestId('daily-reveal').getAttribute('open'),null);
  await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('#daily-title').innerText(),/Name the object/);
  await page.getByRole('navigation',{name:'Insight editions'}).getByRole('link').nth(3).click();assert.match(await page.locator('#daily-title').innerText(),/Location changes/);
  await page.goBack({waitUntil:'networkidle'});assert.match(await page.locator('#daily-title').innerText(),/Name the object/);
 });
 await run(`${setting.width}: dealer rotation, full cycle, reset, no storage writes`,async()=>{
  const start=await page.locator('#card-title').innerText();await page.getByRole('button',{name:'Deal next card'}).click();assert.notEqual(await page.locator('#card-title').innerText(),start);
  await page.getByRole('button',{name:'Deal next card'}).click();await page.getByRole('button',{name:'Deal next card'}).click();assert.equal(await page.locator('#card-title').innerText(),start);
  await page.getByRole('button',{name:'Reset deck'}).click();assert.equal(await page.locator('#card-title').innerText(),start);
  assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).filter(k=>['amir-lab-v1','amir-fabric-v1','hansa-question-additions-v1','hansa-atlas-journey-v1'].includes(k)).map(k=>[k,localStorage.getItem(k)]))),Object.fromEntries(['amir-lab-v1','amir-fabric-v1','hansa-question-additions-v1','hansa-atlas-journey-v1'].map(k=>[k,'preservation-sentinel-'+k])));
 });
 await run(`${setting.width}: archive search, topic filter, empty and recovery`,async()=>{
  await page.getByRole('searchbox',{name:'Search preview insights'}).fill('zzzz-no-match');assert.match(await page.locator('#insight-archive').innerText(),/0 preview insights/);
  await page.getByRole('button',{name:'Clear filters'}).click();await page.getByRole('combobox').selectOption('Lakehouse');assert.equal(await page.locator('#insight-archive article').count(),1);await page.getByRole('button',{name:'Clear filters'}).click();assert.equal(await page.locator('#insight-archive article').count(),3);
 });
 await run(`${setting.width}: public Atlas remains fail-closed, no horizontal overflow, axe AA`,async()=>{
  assert.equal(await page.getByTestId('atlas-peek').getByRole('link',{name:'Why connected?'}).count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  await page.addScriptTag({content:axe});const a=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));fs.writeFileSync(`${dir}/axe-${setting.width}.json`,JSON.stringify(a.violations,null,2));assert.deepEqual(a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[]);
 });
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`${dir}/prototype-c-${setting.width}-${setting.colorScheme}.png`,fullPage:true});await context.close();
}
await run('No JavaScript: original prompt, native reveal and full archive remain readable',async()=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();await page.goto(base+'/prototype-c/');assert.equal(await page.locator('#insight-archive article').count(),3);await page.getByTestId('daily-reveal').locator('summary').click();assert.equal(await page.getByTestId('daily-reveal').getAttribute('open'),'');await context.close();
});
await run('Invalid permalink fallback and old destination HTTP availability',async()=>{
 const page=await browser.newPage();await page.goto(base+'/prototype-c/?insight=nonexistent',{waitUntil:'networkidle'});assert.match(await page.locator('[aria-live="polite"]').first().innerText(),/unavailable/);
 for(const route of ['/','/work/','/experience/','/learn/catalogue/','/practice/catalogue/','/learn/dp-600/atlas/','/learn/dp-600/ingestion/','/lab/dp-600/explore/','/lab/dp-600/explore/?view=legacy','/lab/dp-600/progress/','/search/']){const r=await page.request.get(base+route);assert.equal(r.status(),200,route);}await page.close();
});
await browser.close();fs.writeFileSync(dir+'/browser-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.cases,errors:report.errors},null,2));if(report.errors.length||report.cases.some(c=>c.status==='FAIL'))process.exitCode=1;
