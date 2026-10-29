import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
import {BASE,attachStaticHost,launchBrowser} from './static-host.mjs';
const QA=process.env.ACADEMY_QA_DIR??'docs/dp600-academy/qa';mkdirSync(QA,{recursive:true});
const results=[];const errors=[];
const learningState=raw=>{const d=JSON.parse(raw);delete d.updatedAt;for(const session of Object.values(d.sessions??{}))delete session.updatedAt;return d;};const browser=await launchBrowser();
async function answerFirst(article){const inputs=article.locator('label:has(input)');if(await inputs.count())await inputs.first().click();else await article.getByRole('button',{name:/^Move .* down$/}).first().click();}
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:String(e)});}}
try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});await attachStaticHost(context);const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await check('existing hub retains 834 questions and all practice modes',async()=>{await page.goto(BASE+'/lab/dp-600/');assert.match(await page.locator('body').innerText(),/834/);const links=await page.locator('main a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));for(const p of ['explore','study','practice','mock','cases','review','progress','resources'])assert.ok(links.includes(`/lab/dp-600/${p}/`),p);});
 let before;
 await check('legacy guided answer and bookmark survive academy use/reset',async()=>{
  await page.goto(BASE+'/lab/dp-600/study/');await page.getByRole('button',{name:'Start guided study',exact:true}).click();const article=page.locator('article').first();await article.waitFor();await answerFirst(article);await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.getByText(/Why each option does or does not fit/).waitFor();const save=article.getByRole('button',{name:/Save|Saved/}).first();if(await save.getAttribute('aria-pressed')!=='true')await save.click();before=await page.evaluate(()=>localStorage.getItem('amir-fabric-v1'));assert.ok(JSON.parse(before).bookmarks.length);
  await page.goto(BASE+'/learn/dp-600/ingestion/');await page.waitForFunction(()=>!document.querySelector('select[aria-label="Confidence for your next answer"]').disabled);await page.getByRole('button',{name:'Reset this lesson',exact:true}).click();assert.deepEqual(learningState(await page.evaluate(()=>localStorage.getItem('amir-fabric-v1'))),learningState(before));assert.equal(await page.evaluate(()=>localStorage.getItem('amir-lab-v1')),null);
  await page.goto(BASE+'/lab/dp-600/study/');await page.getByRole('button',{name:'Resume session',exact:true}).click();await page.getByText(/Why each option does or does not fit/).waitFor();assert.match(await page.locator('article').first().innerText(),/Correct|Not quite/);
 });
 await check('mock deadline and answer survive refresh with feedback hidden',async()=>{
  const c=await browser.newContext();await attachStaticHost(c);const p=await c.newPage();await p.goto(BASE+'/lab/dp-600/mock/');await p.getByRole('button',{name:'30',exact:true}).click();await p.getByRole('button',{name:'15 min',exact:true}).click();await p.getByRole('button',{name:'Start timed session',exact:true}).click();await p.locator('article').first().waitFor();await answerFirst(p.locator('article').first());assert.equal(await p.getByText(/Why each option does or does not fit/).count(),0);
  const first=await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('amir-fabric-v1')).sessions).find(s=>s.status==='active'));assert.ok(first.deadlineAt);assert.ok(Object.keys(first.answers).length);
  await p.reload();await p.getByRole('button',{name:'Resume session',exact:true}).click();await p.getByRole('timer').waitFor();const next=await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('amir-fabric-v1')).sessions).find(s=>s.id===Object.keys(JSON.parse(localStorage.getItem('amir-fabric-v1')).sessions)[0]));assert.equal(next.deadlineAt,first.deadlineAt);assert.deepEqual(next.manifest.questionIds,first.manifest.questionIds);assert.deepEqual(next.answers,first.answers);await c.close();
 });
 await check('legacy smoke has no browser runtime errors',async()=>assert.deepEqual(errors,[]));
}finally{await browser.close();writeFileSync(QA+'/legacy-browser-results.json',JSON.stringify({transport:process.env.ACADEMY_LIVE_BASE?'Chrome against live HTTPS origin':'Chrome, actual static files via interception; no live host verification',results,errors},null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.status!=='PASS'))process.exitCode=1;}
