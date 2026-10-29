// Real Hansa static-export browser QA. No Microsoft product runtime is exercised.
import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {r11Expected} from '../../lib/fabric/r11.ts';
const require=createRequire(import.meta.url),axe=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const qs=JSON.parse(readFileSync('content/fabric/r11/questions.json','utf8'));
const old=JSON.parse(readFileSync('content/fabric/additions/questions.json','utf8'));
const out='docs/dp600-r11-integration/qa';mkdirSync(out,{recursive:true});
const base=process.env.R11_BASE_URL??'http://localhost:4196';
const checks=[],errors=[],accessibility=[];
const legacy={version:1,questions:{'new-json-t1q1':{values:{C:'1'},checked:true}}};
const sentinels={'hansa-question-additions-v1':JSON.stringify(legacy),'amir-fabric-v1':'existing-fabric-progress','amir-lab-v1':'existing-lab-progress','hansa_dp600_noimage_demo':'standalone-source-progress'};
let browser;
try{
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 for(const width of [1440,390,320]){
  const ctx=await browser.newContext({viewport:{width,height:1000},colorScheme:width===1440?'light':'dark',reducedMotion:'reduce'});
  await ctx.addInitScript(s=>{for(const[k,v]of Object.entries(s))if(localStorage.getItem(k)===null)localStorage.setItem(k,v);},sentinels);
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/lab/dp-600/explore/?question=new-json-t1q1');
  const view=p.getByTestId('r11-question');await view.waitFor();
  await p.getByText('1286 source records match',{exact:true}).waitFor();
  await view.getByText('Your earlier source-version response (preserved)',{exact:true}).waitFor();
  assert.equal(await view.getByRole('checkbox').filter({visible:true}).count(),4);
  assert.equal(await view.locator('input:checked').count(),0);
  const go=async q=>{await p.getByLabel('Search questions',{exact:true}).fill(q.sourceId);await p.getByRole('button',{name:new RegExp('^'+q.sourceId+' · Image-free practice')}).click();await p.locator(`[data-source-id="${q.sourceId}"]`).waitFor();};
  for(const q of qs){
   await go(q);assert.equal(await view.locator('img,picture,canvas').count(),0,q.sourceId);
   assert.equal(await view.locator('section[aria-label="Answer and review notes"]').count(),0,q.sourceId);
   if(q.type==='hotspot-dropdown')assert.equal(await view.locator('select').count(),q.blanks.length,q.sourceId);
   if(q.type==='dragdrop')assert.equal(await view.locator('select').count(),q.drag.targets.length,q.sourceId);
   if(q.type==='hotspot-yesno')assert.equal(await view.locator('fieldset').count(),q.statements.length,q.sourceId);
   if(q.options)assert.equal(await view.locator('fieldset input').count(),q.options.length,q.sourceId);
   assert.equal(await view.getByRole('button',{name:'Check reviewed answer',exact:true}).isDisabled(),true,q.sourceId+' initially incomplete/held');
   if(!q.gradingEnabled)assert.ok((await view.innerText()).includes('Scientific grading is paused.'));
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'page overflow '+q.sourceId);
  }
  checks.push({width,status:'PASS',name:'all 222 mapped Hansa records render seven native formats, no raster, no pre-answer explanation, grading held, no overflow'});
  for(const q of qs.filter(q=>q.gradingEnabled)){
   await go(q);const expected=r11Expected(q);
   async function fill(a){
    if(q.type==='hotspot-dropdown'){for(let i=0;i<a.length;i++)await view.locator('select').nth(i).selectOption(a[i]);}
    else if(q.type==='multi'){for(const o of q.options)await view.locator(`input[value="${o.letter}"]`).setChecked(a.includes(o.letter));}
    else await view.locator(`input[value="${a}"]`).check();
   }
   await fill(expected);const check=view.getByRole('button',{name:'Check reviewed answer',exact:true});await check.click();assert.match(await view.getByRole('status').innerText(),/Correct according/);
   if(q.type==='hotspot-dropdown'){const wrong=[...expected];wrong[0]=q.blanks[0].options.find(v=>v!==expected[0]);await fill(wrong);}
   else if(q.type==='multi')await fill([q.options.find(o=>!expected.includes(o.letter)).letter]);
   else await fill(q.options.find(o=>o.letter!==expected).letter);
   assert.equal(await view.locator('section[aria-label="Answer and review notes"]').count(),0,'old grade invalidated');await check.click();assert.match(await view.getByRole('status').innerText(),/Incorrect according/);
   await view.getByRole('button',{name:'Reset this answer',exact:true}).click();assert.equal(await check.isDisabled(),true);
  }
  await go(qs.find(q=>q.sourceId==='T1Q7'));await view.locator('select').nth(0).selectOption('VIEW');await p.reload();await view.waitFor();assert.equal(await view.locator('select').nth(0).inputValue(),'VIEW');await view.getByRole('button',{name:'Read explanation',exact:true}).click();assert.equal(await view.getByRole('button',{name:'Check reviewed answer',exact:true}).isDisabled(),true);
  await view.getByRole('button',{name:'Reset this answer',exact:true}).click();
  await p.getByLabel('Search questions',{exact:true}).fill('');await p.getByRole('combobox',{name:/^Image-free bank review/}).selectOption('reviewed');await p.getByText('11 source records match',{exact:true}).waitFor();await p.getByRole('combobox',{name:/^Image-free bank review/}).selectOption('held');await p.getByText('211 source records match',{exact:true}).waitFor();await p.getByRole('combobox',{name:/^Image-free bank review/}).selectOption('all');
  await p.getByRole('combobox',{name:/^Exam scope/}).selectOption('all');await p.getByText('1366 source records match',{exact:true}).waitFor();await p.getByRole('combobox',{name:/^Exam scope/}).selectOption('PL-300');await p.getByText('80 source records match',{exact:true}).waitFor();
  await p.goto(base+'/lab/dp-600/explore/?question='+old.find(q=>q.id.startsWith('new-litware-')).id);await p.getByTestId('added-question').waitFor();
  await p.goto(base+'/lab/dp-600/explore/?view=legacy');assert.equal(await p.getByTestId('r11-question').count(),0);await p.getByRole('link',{name:'All source questions',exact:true}).waitFor();
  for(const id of ['T1Q120','T1Q31','T1Q161','T1Q48']){
   await p.goto(base+'/lab/dp-600/explore/?question='+id);await view.waitFor();await p.addScriptTag({content:axe});const r=await p.evaluate(async()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));accessibility.push({width,id,violations:r.violations});
  }
  await p.goto(base+'/lab/dp-600/explore/?question=T1Q221&atlasReturn='+encodeURIComponent('/learn/dp-600/atlas/?concept=concept%3Afabric%3Adirect-lake'));await view.waitFor();await p.getByRole('link',{name:'Return to Atlas view',exact:true}).waitFor();
  await p.screenshot({path:out+`/hansa-r11-${width}.png`,fullPage:false});
  const preserved=await p.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(sentinels));assert.deepEqual(preserved,sentinels);
  checks.push({width,status:'PASS',name:'11 reviewed keys right/wrong/reset, saved reload, review/PL-300/all filters, legacy views, prior progress, deep links and Atlas return'});await ctx.close();
 }
 const ctx=await browser.newContext();const p=await ctx.newPage();await p.goto(base+'/lab/dp-600/explore/?question=T1Q120');await p.getByTestId('r11-question').waitFor();
 await p.evaluate(()=>localStorage.setItem('hansa-dp600-r11-progress-v1','{broken'));await p.reload();await p.getByTestId('r11-question').waitFor();await p.locator('[data-testid="r11-question"] input[value="C"]').check();assert.equal(await p.evaluate(()=>localStorage.getItem('hansa-dp600-r11-progress-v1')),'{broken');
 await p.goto(base+'/search/?q=T1Q221');const link=p.locator('a[href="/lab/dp-600/explore/?question=new-json-t1q221"]').first();await link.waitFor();await link.click();await p.getByTestId('r11-question').waitFor();assert.ok((await p.getByTestId('r11-question').innerText()).includes('T1Q221'));
 await ctx.close();const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}}));const dp=await denied.newPage();await dp.goto(base+'/lab/dp-600/explore/?question=T1Q120');await dp.getByTestId('r11-question').waitFor();assert.match(await dp.getByTestId('r11-question').getByRole('status').innerText(),/unavailable/);await denied.close();
 checks.push({status:'PASS',name:'corrupt/denied storage and site-wide source-ID search deep link'});
 assert.deepEqual(errors,[]);assert.equal(accessibility.reduce((n,a)=>n+a.violations.length,0),0,'sampled axe violations');
}catch(e){checks.push({status:'FAIL',name:'browser execution',error:e.stack});process.exitCode=1;}
finally{await browser?.close();writeFileSync(out+'/BROWSER_RESULTS.json',JSON.stringify({checks,errors,accessibility,productRuntime:'NOT_RUN',humanScreenReader:'NOT_RUN'},null,2));console.log(JSON.stringify(checks,null,2));}
