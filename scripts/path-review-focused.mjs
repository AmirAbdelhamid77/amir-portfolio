import {chromium} from 'playwright-core';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
const dir='docs/learning-path-review-20261028/evidence';await mkdir(dir,{recursive:true});
const checks=[],record=(id,pass,detail='')=>{checks.push({id,status:pass?'PASS':'FAIL',detail});console.log(pass?'PASS':'FAIL',id,detail);};
const walk=async d=>(await Promise.all((await readdir(d,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]))).flat();
for(const file of(await walk('out')).filter(p=>p.endsWith('index.html'))){const route=('/'+path.relative('out',path.dirname(file)).replaceAll('\\','/')+'/').replace('//','/');const response=await fetch('http://127.0.0.1:4318'+route);record('ROUTE:'+route,response.status===200);if(route.startsWith('/study/')&&!route.includes('/review/')){const html=await readFile(file,'utf8');record('CANONICAL:'+route,html.includes('rel="canonical" href="https://hansa.amir-portfolio.workers.dev'+route+'"'));}}
const sitemap=await readFile('out/sitemap.xml','utf8');for(const route of ['study/review','study/review/path']){const html=await readFile('out/'+route+'/index.html','utf8');record('NOINDEX:'+route,html.includes('noindex')&&!sitemap.includes('/study/review'));}
const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const c=await b.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await c.addInitScript(()=>localStorage.setItem('amir-theme','dark'));const p=await c.newPage();
 await p.goto('http://127.0.0.1:4318/study/review/path/',{waitUntil:'networkidle'});const unit=p.locator('.path-unit').first(),id=await unit.getAttribute('id');const assessment=unit.locator('.path-activities a').first();
 record('REVIEW-UNAPPROVED-LABEL',(await p.locator('main').innerText()).includes('REVIEW_REQUIRED'));
 await assessment.click();await p.getByRole('link',{name:'Back to this lesson step',exact:true}).click();await p.locator('[id="'+id+'"]').waitFor();record('REVIEW-QUESTION-RETURN',p.url().includes('/study/review/path/#'+id));
 await p.goto('http://127.0.0.1:4318/study/statistics/path/#stats-section-s15',{waitUntil:'networkidle'});const target=p.locator('#stats-section-s15');await target.waitFor();await target.locator('details summary').first().click();await target.scrollIntoViewIfNeeded();await p.screenshot({path:dir+'/linked-unit-390-dark.png',fullPage:true});
 await target.locator('.path-activities a').first().click();await p.getByRole('link',{name:'Back to this lesson step',exact:true}).click();await p.locator('#stats-section-s15').waitFor();record('QUESTION-RETURN-EXACT-STEP',p.url().includes('#stats-section-s15'));
 await p.keyboard.press('Tab');record('KEYBOARD-FOCUS',await p.evaluate(()=>document.activeElement!==document.body));
 await p.goto('http://127.0.0.1:4318/?insight=onelake-shortcuts#archive',{waitUntil:'networkidle'});record('CANONICAL-HOME',await p.locator('main').count()===1);await p.goto('http://127.0.0.1:4318/prototype-c/?insight=onelake-shortcuts#archive',{waitUntil:'networkidle'});await p.waitForURL('**/?insight=onelake-shortcuts#archive');record('LEGACY-QUERY-HASH',true);await c.close();
 const desktop=await b.newPage({viewport:{width:1440,height:1000}});await desktop.goto('http://127.0.0.1:4318/study/statistics/path/#stats-section-s15',{waitUntil:'networkidle'});await desktop.locator('#stats-section-s15').waitFor();await desktop.locator('#stats-section-s15 details summary').first().click();await desktop.screenshot({path:dir+'/linked-unit-1440-light.png',fullPage:true});await desktop.close();
 const nojs=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),staticPage=await nojs.newPage();await staticPage.goto('http://127.0.0.1:4318/study/statistics/path/');record('NO-JS-SOURCE-LINKS',(await staticPage.locator('.path-read').count())===12);await nojs.close();
}finally{await b.close();await writeFile(dir+'/focused-results.json',JSON.stringify({checks},null,2));}if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
