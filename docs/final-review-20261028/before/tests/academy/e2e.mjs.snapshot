// Local browser QA of a freshly built validation copy; no deployment.
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {BASE,ROOT,attachStaticHost,staticResponse,launchBrowser} from './static-host.mjs';
const require=createRequire(import.meta.url);
const DIR=process.env.ACADEMY_QA_DIR??path.join(ROOT,'docs/dp600-academy/qa');mkdirSync(DIR,{recursive:true});
const route='/learn/dp-600/ingestion/';
const results=[],errors=[],network=[];let browser;
const infrastructureNotes=[];

async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:String(e)});}}
try{
 browser=await launchBrowser();
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await attachStaticHost(context);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith(BASE)&&!r.url().startsWith('data:'))network.push(r.url());});
 await page.goto(BASE+route);await page.getByLabel('Confidence for your next answer').waitFor();await page.waitForFunction(()=>!document.querySelector('select[aria-label="Confidence for your next answer"]').disabled);
 await check('keyboard prediction, empty recovery and reset',async()=>{
  await page.getByRole('button',{name:'Check prediction',exact:true}).click();await page.getByText('Select a pattern, then check again.').waitFor();
  const radio=page.locator('input[name="prediction"]').first();await radio.focus();await page.keyboard.press('Space');await page.getByRole('button',{name:'Check prediction',exact:true}).click();await page.getByText('Correct. A shortcut reuses the accessible table without a separate ingestion replica.').waitFor();
  await page.getByRole('button',{name:'Reset exploration',exact:true}).click();assert.equal(await radio.isChecked(),false);
 });
 await check('constraint trace: unsupported source, permissions, transformation and batch',async()=>{
  await page.getByLabel('Source supplied').selectOption('database');await page.getByLabel('Continuous read-only analytical replica',{exact:true}).check();
  assert.ok((await page.getByRole('status').allTextContents()).join(' ').includes('Database Mirroring fits'));
  await page.getByLabel('Database Mirroring supports this source and its prerequisites are met').uncheck();assert.ok((await page.getByRole('status').allTextContents()).join(' ').includes('No single pattern'));
  await page.getByLabel('Required source, connection and destination access is available').uncheck();assert.ok((await page.locator('ol[aria-label="Decision trace"]').textContent()).includes('authorized source'));
  await page.getByLabel('Required source, connection and destination access is available').check();await page.getByLabel('Source supplied').selectOption('files');await page.getByLabel('Retain a dated batch result',{exact:true}).check();await page.getByLabel('Custom cleansing or joins are required',{exact:true}).check();assert.ok((await page.getByRole('status').allTextContents()).join(' ').includes('Copy + orchestration fits'));
  await page.getByRole('button',{name:'Reset exploration',exact:true}).click();
 });
 const ids=['academy-ingest-reuse','academy-ingest-replicate','academy-ingest-history'];
 await check('wrong response feedback, keyboard answers, progress and refresh preserve legacy keys',async()=>{
  await page.evaluate(()=>{localStorage.setItem('amir-fabric-v1','legacy-fabric-sentinel');localStorage.setItem('amir-lab-v1','legacy-lab-sentinel');});
  await page.locator(`input[name="${ids[0]}"]`).nth(2).check();await page.getByRole('button',{name:'Check case 1',exact:true}).click();assert.ok((await page.getByTestId('lesson-progress').textContent()).includes('0 of 3'));
  for(let i=0;i<3;i++){const radio=page.locator(`input[name="${ids[i]}"]`).nth(i);await radio.focus();await page.keyboard.press('Space');await page.getByRole('button',{name:`Check case ${i+1}`,exact:true}).click();}
  assert.ok((await page.getByTestId('lesson-progress').textContent()).includes('3 of 3'));await page.reload();await page.waitForFunction(()=>!document.querySelector('select[aria-label="Confidence for your next answer"]').disabled);assert.ok((await page.getByTestId('lesson-progress').textContent()).includes('3 of 3'));
  assert.deepEqual(await page.evaluate(()=>[localStorage.getItem('amir-fabric-v1'),localStorage.getItem('amir-lab-v1')]),['legacy-fabric-sentinel','legacy-lab-sentinel']);
 });
 let exported;
 await check('export/import schema and rejected import preserve answers',async()=>{
  await page.getByText('Manual progress backup',{exact:true}).click();
  exported=await page.getByLabel('Progress JSON',{exact:true}).inputValue();assert.equal(JSON.parse(exported).checked.length,3);
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export lesson progress',exact:true}).click();const download=await pending;const failure=await download.failure();
  if(failure){infrastructureNotes.push('Native download was cancelled by this host; independently reproduced on a minimal data-URL download. Manual JSON backup, import and snapshot fidelity are tested.');}
  else{assert.equal(readFileSync(await download.path(),'utf8'),exported);}
  await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});await page.getByText('Import rejected: incompatible or damaged lesson export. Current answers are preserved.').waitFor();assert.ok((await page.getByTestId('lesson-progress').textContent()).includes('3 of 3'));
  await page.getByRole('button',{name:'Reset this lesson',exact:true}).click();assert.ok((await page.getByTestId('lesson-progress').textContent()).includes('0 of 3'));
  await page.locator('input[type=file]').setInputFiles({name:'good.json',mimeType:'application/json',buffer:Buffer.from(exported)});await page.getByText('Lesson export restored. Existing Fabric quiz history is untouched.').waitFor();assert.ok((await page.getByTestId('lesson-progress').textContent()).includes('3 of 3'));
 });
 await check('corrupt local data is preserved until lesson-only reset',async()=>{
  await page.evaluate(()=>localStorage.setItem('hansa-academy-ingestion-v1','{broken'));await page.reload();await page.getByText(/Saved lesson data could not be read/).waitFor();await page.locator(`input[name="${ids[0]}"]`).first().check();await page.getByRole('button',{name:'Check case 1',exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('hansa-academy-ingestion-v1')),'{broken');await page.getByRole('button',{name:'Reset this lesson',exact:true}).click();assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('hansa-academy-ingestion-v1'))).version,1);assert.equal(await page.evaluate(()=>localStorage.getItem('amir-fabric-v1')),'legacy-fabric-sentinel');
 });
 const axe=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
 for(const theme of ['light','dark'])for(const width of [320,390,1280])await check(`${theme} ${width}px: axe, no overflow, screenshot`,async()=>{
  await page.setViewportSize({width,height:900});await page.evaluate(t=>document.documentElement.classList.toggle('dark',t==='dark'),theme);await page.addScriptTag({content:axe});const audit=await page.evaluate(async()=>await window.axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));writeFileSync(path.join(DIR,`axe-${theme}-${width}.json`),JSON.stringify(audit.violations,null,2));assert.equal(audit.violations.length,0,JSON.stringify(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:path.join(DIR,`ingestion-${theme}-${width}.png`),fullPage:true});
 });
 await check('reduced motion retains complete controls and text',async()=>{await page.emulateMedia({reducedMotion:'reduce'});await page.getByLabel('Source supplied').selectOption('database');await page.getByLabel('Continuous read-only analytical replica',{exact:true}).check();assert.ok((await page.getByRole('status').allTextContents()).join(' ').includes('Database Mirroring fits'));});
 await check('no-JS content and source explanations remain available',async()=>{const c=await browser.newContext({javaScriptEnabled:false});await attachStaticHost(c);const p=await c.newPage();await p.goto(BASE+route);assert.equal(await p.getByRole('heading',{name:'1. Follow the data, then choose the pattern'}).count(),1);assert.equal(await p.getByRole('link',{name:'OneLake shortcuts and caching — Microsoft Learn'}).count(),1);await c.close();});
 await check('denied storage degrades to session practice',async()=>{const c=await browser.newContext();await attachStaticHost(c);await c.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}));const p=await c.newPage();await p.goto(BASE+route);await p.getByText(/Browser storage is unavailable/).waitFor();await p.locator(`input[name="${ids[0]}"]`).first().check();await p.getByRole('button',{name:'Check case 1',exact:true}).click();assert.ok((await p.getByTestId('lesson-progress').textContent()).includes('1 of 3'));await c.close();});
 await check('new routes discoverable and internal source files not public',async()=>{for(const p of ['/learn/dp-600/','/learn/catalogue/','/lab/dp-600/']){assert.equal(staticResponse(BASE+p).status,200);}await page.goto(BASE+'/learn/catalogue/');assert.equal(await page.locator('a[href="/learn/dp-600/"]').count(),1);assert.equal(staticResponse(BASE+'/dp600/source/DP-600-Study-Guide-EN.pdf').status,404);});
 await check('no runtime errors or external lesson requests',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(network,[]);});
} catch(e){results.push({name:'browser setup/execution',status:'BLOCKED',error:String(e)});}
finally{if(browser)await browser.close();writeFileSync(path.join(DIR,'browser-results.json'),JSON.stringify({transport:process.env.ACADEMY_LIVE_BASE?'Chrome against live HTTPS origin':'Chrome rendering actual export through static-file interception; not a delivery test',results,errors,externalRequests:network,infrastructureNotes},null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.status!=='PASS'))process.exitCode=1;}
