import { chromium } from 'playwright-core';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const dir=path.resolve('docs/final-review-20261028/evidence/home');await mkdir(dir,{recursive:true});
const base='http://127.0.0.1:4318';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const checks=[],issues=[];
const record=(id,pass,detail)=>{checks.push({id,status:pass?'PASS':'FAIL',detail});console.log(`${pass?'PASS':'FAIL'} ${id}: ${detail}`);};
const axeSource=await readFile('node_modules/axe-core/axe.min.js','utf8');
const ids=['hansa-insight-shortcut-reference-v1','hansa-insight-shortcut-delete-v1','hansa-insight-shortcut-discovery-v1'];
const titles=['A reference is a design decision.','Name the object you are deleting.','Location changes discovery.'];
async function open(width=1440,dark=true,reduced=false,js=true){
 const ctx=await browser.newContext({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500,reducedMotion:reduced?'reduce':'no-preference',javaScriptEnabled:js});
 await ctx.addInitScript(d=>localStorage.setItem('amir-theme',d?'dark':'light'),dark);
 const p=await ctx.newPage();p.on('pageerror',e=>issues.push(e.message));await p.goto(base,{waitUntil:'networkidle'});await p.waitForTimeout(600);return {p,ctx};
}
try{
 for(const width of [320,390,768,1280,1440])for(const dark of [false,true]){
  const {p,ctx}=await open(width,dark);
  record(`REFLOW-${width}-${dark}`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal page overflow');
  await p.addScriptTag({content:axeSource});
  const axe=await p.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}));});
  await writeFile(path.join(dir,`axe-${width}-${dark?'dark':'light'}.json`),JSON.stringify(axe,null,2));
  record(`AXE-${width}-${dark}`,axe.length===0,`${axe.length} automated A/AA violations`);
  // Every breakpoint exercises real controls, not only screenshots.
  const instrument=p.getByRole('button',{name:'Change the requirement'});
  await instrument.click();await p.waitForTimeout(250);
  record(`SYNC-${width}-${dark}`,await p.getByRole('radio',{name:'Its own retained result'}).isChecked(),'hero input changes the actual scenario radio');
  await p.getByRole('button',{name:'Reset model',exact:true}).click();
  record(`RESET-${width}-${dark}`,await p.getByRole('radio',{name:'Read the existing table'}).isChecked(),'reset restores model');
  await p.getByRole('button',{name:'Deal three ideas',exact:true}).click();await p.waitForTimeout(650);
  const cards=p.locator('[aria-label="Knowledge card tray"] button[aria-expanded]');
  record(`DEAL-${width}-${dark}`,await cards.count()>0,'real hand buttons available');
  if(width<500){
   record(`MOBILE-SLOT-${width}-${dark}`,await cards.count()===1,'phone uses one readable front card, not a tiny three-card fan');
   const firstName=await cards.first().getAttribute('aria-label');
   await p.getByRole('button',{name:'Next card',exact:true}).click();await p.waitForTimeout(400);
   record(`MOBILE-NEXT-${width}-${dark}`,await cards.first().getAttribute('aria-label')!==firstName,'explicit next control changes front card');
   await p.getByRole('button',{name:'Previous card',exact:true}).click();await p.waitForTimeout(400);
  }
  await cards.first().click();await p.waitForTimeout(500);
  record(`READ-${width}-${dark}`,await p.getByRole('region',{name:'Selected card'}).isVisible(),'readable expansion visible');
  await p.keyboard.press('Escape');await p.waitForTimeout(450);
  record(`ESCAPE-${width}-${dark}`,await p.getByRole('region',{name:'Selected card'}).count()===0,'Escape closes reader');
  record(`FOCUS-${width}-${dark}`,await p.evaluate(()=>document.activeElement?.getAttribute('aria-expanded')==='false'),'focus returned to originating card');
  await p.getByRole('button',{name:'Collect all',exact:true}).click();await p.waitForTimeout(650);
  record(`COLLECT-${width}-${dark}`,await p.getByRole('button',{name:'Deal three ideas',exact:true}).isEnabled(),'hand returns to physical deck');
  await ctx.close();
 }
 const {p,ctx}=await open();
 for(let i=0;i<ids.length;i++){
  await p.goto(`${base}/?insight=${ids[i]}`,{waitUntil:'networkidle'});
  record(`EDITION-${i}`,await p.locator('#today').innerText().then(t=>t.includes(titles[i])),'query selects exact canonical scenario');
  const before=await p.locator('.instrument-state').innerText();await p.locator('.instrument-switch').click();await p.waitForTimeout(300);
  record(`MODEL-${i}`,before!==await p.locator('.instrument-state').innerText(),'real action changes instrument derived state');
  await p.getByText('Read the model as a table',{exact:true}).click();
  record(`TABLE-${i}`,await p.locator('.model-table tbody tr').count()>=2,'exact current object states available as semantic table');
 }
 await p.goto(base,{waitUntil:'networkidle'});
 await p.locator('[aria-current="date"]').focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(750);
 record('RAIL-KEY',p.url().includes(ids[1]),'keyboard date and URL synchronized');
 await p.keyboard.press('End');await p.waitForTimeout(750);
 record('RAIL-END',p.url().includes(ids[2]),'End selects chronological last edition');
 await p.keyboard.press('Home');await p.waitForTimeout(750);
 record('RAIL-HOME',p.url().includes(ids[0]),'Home selects latest edition');
 const rail=p.locator('.insight-rail-viewport');await rail.scrollIntoViewIfNeeded();let box=await rail.boundingBox();
 await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2-230,box.y+box.height/2,{steps:16});
 await p.screenshot({path:path.join(dir,'rail-mid-drag.png')});await p.mouse.up();await p.waitForTimeout(850);
 record('RAIL-DRAG',!p.url().includes(ids[0]),'pointer travel changes actual edition on spring settle');
 await p.locator('[aria-current="date"]').focus();await p.keyboard.press('Home');await p.keyboard.press('End');await p.keyboard.press('Home');await p.waitForTimeout(800);
 record('RAIL-INTERRUPT',p.url().includes(ids[0])&&(await p.locator('#today').innerText()).includes(titles[0]),'rapid retarget settles on latest request without stale content');
 await p.evaluate(()=>{localStorage.setItem('amir-fabric-v1','phase2-fabric-sentinel');localStorage.setItem('amir-lab-v1','phase2-lab-sentinel');});
 await p.locator('.instrument-switch').click();await p.reload({waitUntil:'networkidle'});
 record('PROGRESS',await p.evaluate(()=>localStorage.getItem('amir-fabric-v1')==='phase2-fabric-sentinel'&&localStorage.getItem('amir-lab-v1')==='phase2-lab-sentinel'),'both learner namespaces byte-preserved');
 await p.goto(`${base}/prototype-c/?insight=${ids[2]}#archive`,{waitUntil:'networkidle'});
 record('ALIAS-HASH',p.url().includes('#archive')&&(await p.locator('#today').innerText()).includes(titles[2]),'legacy alias keeps query, hash and canonical content');
 record('ONE-LANDING',await p.locator('.observatory').count()===1,'compatibility route renders only one stage');
 record('PUBLICATION',await p.getByText('Reviewed connections are not published yet',{exact:true}).isVisible(),'no graph invented to fill pending approval');
 // Navigation arrow icons are not graph edges; count non-icon SVG paths.
 record('NO-ATLAS-EDGES',await p.locator('[aria-labelledby="atlas-peek-title"] svg:not(.lucide) path').count()===0,'pending public projection draws no semantic graph');
 await p.goto(base,{waitUntil:'networkidle'});await p.getByRole('button',{name:'Deal three ideas',exact:true}).click();await p.waitForTimeout(650);await p.locator('[aria-label="Knowledge card tray"] button[aria-expanded]').first().click();await p.waitForTimeout(500);await p.getByRole('button',{name:'Reveal the reasoning',exact:true}).click();await p.waitForTimeout(500);
 await p.addScriptTag({content:axeSource});const richAxe=await p.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))})));
 await writeFile(path.join(dir,'axe-expanded.json'),JSON.stringify(richAxe,null,2));record('AXE-EXPANDED',richAxe.length===0,`${richAxe.length} violations with reader and explanation open`);
 await p.screenshot({path:path.join(dir,'expanded-desktop.png'),fullPage:true});
 await ctx.close();
 const mobile=await open(390,true);const cdp=await mobile.ctx.newCDPSession(mobile.p);await mobile.p.locator('.insight-rail-viewport').scrollIntoViewIfNeeded();box=await mobile.p.locator('.insight-rail-viewport').boundingBox();
 const x=box.x+box.width*.7,y=box.y+box.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*15,y}]});await mobile.p.waitForTimeout(16);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.p.waitForTimeout(850);
 record('TOUCH-SWIPE',mobile.p.url().includes('insight=')&&!mobile.p.url().includes(ids[0]),'CDP touch gesture changes date; physical phone not tested');
 await mobile.ctx.close();
 for(const width of [320,1440]){const r=await open(width,true,true);await r.p.locator('.instrument-switch').click();await r.p.getByRole('button',{name:'Deal three ideas',exact:true}).click();await r.p.waitForTimeout(150);await r.p.locator('[aria-label="Knowledge card tray"] button[aria-expanded]').first().click();await r.p.waitForTimeout(200);record(`REDUCED-${width}`,await r.p.getByRole('region',{name:'Selected card'}).isVisible(),'model, deal and readable reader work with reduced motion');await r.p.screenshot({path:path.join(dir,`reduced-${width}.png`),fullPage:true});await r.ctx.close();}
 const nojs=await open(390,false,false,false);record('NO-JS',(await nojs.p.locator('#archive').innerText()).includes(titles[0]),'archive remains readable without hydration');await nojs.ctx.close();
 const stress=await open(320,false);await stress.p.evaluate(()=>{document.documentElement.style.fontSize='200%';});record('TEXT-200',await stress.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% root text enlargement does not cause page overflow');await stress.p.screenshot({path:path.join(dir,'text-200-320.png'),fullPage:true});await stress.ctx.close();
 const contrast=await open(390,true);await contrast.p.emulateMedia({forcedColors:'active'});await contrast.p.locator('.instrument-switch').click();record('FORCED-COLORS',await contrast.p.getByRole('radio',{name:'Its own retained result'}).isChecked(),'forced-colors keeps equivalent DOM interaction');await contrast.p.screenshot({path:path.join(dir,'forced-colors-390.png')});await contrast.ctx.close();
 const rtl=await open(320,false);await rtl.p.evaluate(()=>{const t=document.querySelector('#today h2');t.textContent='اختبار تخطيط لنص عربي طويل مع OneLake و SQL — هذه بيانات اختبار واجهة فقط';t.lang='ar';t.dir='rtl';});record('RTL-MIX-STRESS',await rtl.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'injected Arabic/English long-heading layout fixture; not published content');await rtl.p.screenshot({path:path.join(dir,'rtl-mix-stress-320.png'),fullPage:true});await rtl.ctx.close();
 record('CONSOLE',issues.length===0,JSON.stringify(issues));
}catch(e){record('HARNESS',false,e.stack);}finally{await browser.close();}
await writeFile(path.join(dir,'results.json'),JSON.stringify({generatedAt:new Date().toISOString(),base,checks,issues,limits:['automated axe is not full WCAG certification','CDP touch is not physical mobile','human screen reader NOT RUN','owner creative approval PENDING']},null,2));
if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
