import {chromium} from 'playwright-core';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const dir='docs/final-review-20261028/evidence/atlas';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const checks=[],errors=[],axe=await readFile('node_modules/axe-core/axe.min.js','utf8');
const check=(id,pass,detail)=>{checks.push({id,status:pass?'PASS':'FAIL',detail});console.log(`${pass?'PASS':'FAIL'} ${id} ${detail??''}`);};
async function open(width,dark,review=false,reduced=false){const ctx=await browser.newContext({viewport:{width,height:950},hasTouch:width<500,isMobile:width<500,reducedMotion:reduced?'reduce':'no-preference'});await ctx.addInitScript(d=>{localStorage.setItem('amir-theme',d?'dark':'light');localStorage.setItem('final-atlas-preservation-probe','keep');},dark);const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${review?4320:4318}/learn/dp-600/atlas/`,{waitUntil:'networkidle'});return {p,ctx};}
try{
 for(const width of [320,390,768,1280,1440])for(const dark of [false,true])for(const review of [false,true]){
  const {p,ctx}=await open(width,dark,review);const id=`${review?'REVIEW':'PUBLIC'}-${width}-${dark?'dark':'light'}`;
  check(id+'-REFLOW',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');
  if(!review){
   check(id+'-GATE',await p.getByTestId('atlas-pending-desk').count()===1&&await p.getByTestId('atlas-explorer').count()===0,'No candidate graph hydrated');
   check(id+'-PENDING',await p.getByText('Publication review is pending',{exact:true}).isVisible(),'Explicit publication state');
   const rows=p.getByRole('list',{name:'Public documentation sources'}).getByRole('button');const count=await rows.count();
   check(id+'-BIBLIOGRAPHY',count>5,`${count} inherited official source records`);
   await rows.nth(1).click();const url=p.url();const title=await p.locator('.reading-folio h3').innerText();
   check(id+'-SELECT',url.includes('reading=')&&await rows.nth(1).getAttribute('aria-pressed')==='true','Source selection and URL synchronized');
   check(id+'-OFFICIAL',(await p.locator('.reading-folio a').getAttribute('href')).startsWith('https://learn.microsoft.com/'),'Official source URL');
   await p.reload({waitUntil:'networkidle'});check(id+'-PERMALINK',await p.locator('.reading-folio h3').innerText()===title,'Reading selection restored');
   await p.getByLabel('Find a source',{exact:true}).fill('zz-no-such-source');check(id+'-EMPTY',await p.locator('.reading-empty').count()>0,'Honest search empty state');
   await p.getByRole('button',{name:'Reset desk'}).click();check(id+'-RESET',!p.url().includes('reading=')&&await p.getByLabel('Find a source',{exact:true}).inputValue()==='','Reset state and URL');
   await p.goBack({waitUntil:'domcontentloaded'});check(id+'-BACK',await p.locator('.reading-folio h3').innerText()===title,'History selection restored');
   check(id+'-PROGRESS',await p.evaluate(()=>localStorage.getItem('final-atlas-preservation-probe'))==='keep','Unrelated saved state retained');
  }else{
   check(id+'-NOTICE',await p.getByTestId('review-notice').isVisible(),'Explicit local scientific review notice');
   if(width<1280)await p.getByRole('button',{name:'Open the optional map'}).click();
   const nodes=p.locator('.atlas-circle-node');check(id+'-CIRCLES',await nodes.count()>1&&await nodes.first().locator('circle').count()>=2,'Authentic circular graph');
   const edge=p.locator('.atlas-circle-edge').first();await edge.focus();await p.keyboard.press('Enter');
   check(id+'-EDGE',await p.getByTestId('atlas-inspector').innerText().then(t=>t.includes('Under which conditions?')&&t.includes('Why this connection?')),'Conditions, rationale and evidence');
   check(id+'-INSPECTOR-FOCUS',await p.getByTestId('atlas-inspector').evaluate(e=>e===document.activeElement),'Focus moved to readable inspector');
   check(id+'-CAPTION',await p.locator('.atlas-edge-caption').count()===1&&await p.locator('[data-edge-focus="endpoint"]').count()===2,'Relationship type and endpoint rings');
   await p.keyboard.press('Escape');await p.waitForTimeout(50);check(id+'-ESCAPE',await p.evaluate(()=>document.activeElement?.classList.contains('atlas-circle-edge'))&&!p.url().includes('edge='),'Escape restores originating graph connection focus');
   await p.getByRole('button',{name:'Zoom in',exact:true}).click();check(id+'-CAMERA',p.url().includes('zoom=1.2'),'Camera state permalink');
   await p.getByRole('button',{name:'Fit map',exact:true}).click();
   await p.getByRole('combobox',{name:'Relationship',exact:true}).selectOption({index:1});
   check(id+'-FILTER',await p.locator('.atlas-edge-caption').count()===0,'Filter clears selected edge');
   await p.getByRole('button',{name:'Reset view',exact:true}).click();await p.getByRole('searchbox',{name:'Find a concept'}).fill('zz-no-such-concept');
   check(id+'-SEARCH',await p.getByText('No concept matches. Try a shorter term or an alias.').isVisible(),'Empty search');await p.getByRole('button',{name:'Reset view',exact:true}).click();
   check(id+'-PROGRESS',await p.evaluate(()=>localStorage.getItem('final-atlas-preservation-probe'))==='keep','Reset keeps unrelated saved state');
  }
  await p.addScriptTag({content:axe});const violations=await p.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}));});
  await writeFile(`${dir}/axe-${id}.json`,JSON.stringify(violations,null,2));check(id+'-AXE',violations.length===0,`${violations.length} automated A/AA violations; manual review still required`);
  if(!review){await p.locator('.reading-layout').screenshot({path:`${dir}/${id}-desk.png`});await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(100);}else await p.getByTestId('atlas-map').scrollIntoViewIfNeeded();
  await p.screenshot({path:`${dir}/${id}.png`,fullPage:!review});await ctx.close();
 }
 for(const review of [false,true]){const {p,ctx}=await open(390,true,review,true);check(`REDUCED-${review}`,await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),'Reduced motion preference honored');if(review){await p.getByRole('button',{name:'Open the optional map'}).tap();await p.locator('.atlas-circle-node').first().tap();check('TOUCH-CONCEPT',await p.getByTestId('atlas-inspector').evaluate(e=>e===document.activeElement),'Touch opens readable inspector');}else{await p.getByRole('list',{name:'Public documentation sources'}).getByRole('button').nth(2).tap();check('TOUCH-SOURCE',p.url().includes('reading='),'Touch source selection');}await p.screenshot({path:`${dir}/reduced-${review}.png`,fullPage:true});await ctx.close();}
 check('PAGE-ERRORS',errors.length===0,errors.join('; '));
}finally{await browser.close();await writeFile(`${dir}/results.json`,JSON.stringify({checks,errors},null,2));}
if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
