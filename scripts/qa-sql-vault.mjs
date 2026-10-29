import {chromium} from 'playwright-core';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {resolve,sep,extname} from 'node:path';
const dir='docs/sql-integration-20261028/qa';await mkdir(dir,{recursive:true});
const index=JSON.parse(await readFile('content/sql/index.json','utf8')),checks=[],errors=[];
const out=resolve('out');const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json','.txt':'text/plain'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname),target=resolve(out,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!target.startsWith(out+sep))throw Error('Path');const data=await readFile(target);res.writeHead(200,{'content-type':mime[extname(target)]??'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
const check=(id,pass,detail='')=>{checks.push({id,status:pass?'PASS':'FAIL',detail});};
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const axe=await readFile('node_modules/axe-core/axe.min.js','utf8');
try{
 for(const width of [320,390,768,1280])for(const dark of [false,true]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width<500,isMobile:width<500});
  await context.addInitScript(dark=>{localStorage.setItem('amir-theme',dark?'dark':'light');localStorage.setItem('amir-lab-v1',JSON.stringify({sql:{best:80,attempts:2,lastAt:'2026-10-27T00:00:00Z'}}));localStorage.setItem('amir-fabric-v1','sql-preservation-sentinel');},dark);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['/learn/sql/','/learn/sql/05/','/learn/sql/09/','/learn/sql/10/','/practice/sql/','/study/sql/windows/']){
   const response=await page.goto(base+route,{waitUntil:'networkidle'});check(`HTTP:${width}:${dark}:${route}`,response.status()===200);
   if(route.startsWith('/learn/sql')||route==='/practice/sql/')check(`SQL-ORIENTATION:${width}:${dark}:${route}`,await page.getByRole('navigation',{name:'Learning context',exact:true}).getByRole('link',{name:'SQL topics',exact:true}).isVisible());
   check(`REFLOW:${width}:${dark}:${route}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.addScriptTag({content:axe});const violations=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.html)}));});check(`AXE:${width}:${dark}:${route}`,!violations.length,violations);
   if(width===390||width===1280)await page.screenshot({path:`${dir}/${width}-${dark?'dark':'light'}-${route.replaceAll('/','-')}.png`});
   if(route==='/learn/sql/05/'){
    const result=page.locator('.sql-verdict');check(`RAW-GRAIN:${width}:${dark}`,(await result.innerText()).includes('Order sum 300'));
    const aggregate=page.getByRole('button',{name:'Aggregate each child first'});await aggregate.focus();await page.keyboard.press('Enter');check(`KEYBOARD-GROUP:${width}:${dark}`,(await result.innerText()).includes('Order sum 150')&&await aggregate.getAttribute('aria-pressed')==='true');
    await page.getByRole('button',{name:'Reset trace'}).click();check(`RESET:${width}:${dark}`,(await result.innerText()).includes('Order sum 300'));
   }
   if(route==='/learn/sql/09/')check(`CORRECTED-FRAME:${width}:${dark}`,(await page.locator('.sql-source').innerText()).includes('15 + 30 + 25 = 70'));
   if(route==='/practice/sql/'){
    const first=page.locator('.sql-drills>li').first();const answer=first.locator('details');check(`HIDDEN-RESPONSE:${width}:${dark}`,await answer.getAttribute('open')===null);
    await first.locator('textarea').fill('One row per customer; check NULL and duplicates.');await answer.locator('summary').focus();await page.keyboard.press('Enter');check(`REVEAL-RESPONSE:${width}:${dark}`,await answer.getAttribute('open')!==null);
    check(`LOCAL-PROGRESS:${width}:${dark}`,await page.evaluate(()=>JSON.parse(localStorage.getItem('amir-lab-v1')).sql.best===80&&localStorage.getItem('amir-fabric-v1')==='sql-preservation-sentinel'));
   }
  }
  await context.close();
 }
 const context=await browser.newContext(),page=await context.newPage();await page.goto(base+'/learn/sql/05/',{waitUntil:'networkidle'});
 const destinations=new Set(['/learn/sql/','/practice/sql/',...index.pages.map(p=>p.href),'/study/sql/','/study/sql/path/','/lab/sql/']);
 for(const route of destinations){const response=await fetch(base+route);check('ROUTE:'+route,response.status===200);}
 for(const p of index.pages){await page.goto(base+p.href,{waitUntil:'domcontentloaded'});const missing=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(id=>id&&!document.getElementById(id)));check('ANCHORS:'+p.id,missing.length===0,missing);}
 await context.close();check('RUNTIME-ERRORS',errors.length===0,errors);
}finally{await browser.close();server.close();await writeFile(dir+'/results.json',JSON.stringify({checks},null,2));}
console.log(JSON.stringify({checks:checks.length,passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL')},null,2));assert.ok(checks.every(c=>c.status==='PASS'),'SQL browser QA has failures');
