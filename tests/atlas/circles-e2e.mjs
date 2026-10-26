import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const out='docs/knowledge-atlas/circular-nodes/qa';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true});
const base='http://127.0.0.1:4193',checks=[],errors=[];
const layers=['editorial','dp600-extension','dp600-continuation'].map(name=>JSON.parse(readFileSync('content/atlas/'+name+'.json')));
const prerequisite=layers.flatMap(l=>l.semanticEdges).find(e=>e.relationType==='requires_understanding_of');
try {
 for(const width of [320,390,1440,1920]) {
  const ctx=await browser.newContext({viewport:{width,height:1000},colorScheme:width===390?'dark':'light',reducedMotion:width===1920?'no-preference':'reduce',hasTouch:width<400});
  const page=await ctx.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/learn/dp-600/atlas/?concept='+encodeURIComponent(prerequisite.from)+'&incoming=1&hops=2',{waitUntil:'networkidle'});
  await page.getByText('42 of 42 concepts',{exact:false}).waitFor();
  await page.evaluate(()=>{for(const key of ['amir-lab-v1','amir-fabric-v1','hansa-academy-ingestion-v1','hansa-atlas-journey-v1']) localStorage.setItem(key,'circle-regression-sentinel');});
  const before=await page.evaluate(()=>JSON.stringify(localStorage));
  const toggle=page.getByRole('button',{name:'Open the optional map',exact:true});
  if(await toggle.isVisible()) await toggle.click();
  const map=page.getByTestId('atlas-map');await map.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const reservedHeight=await map.locator('.atlas-circle-viewport').evaluate(n=>n.getBoundingClientRect().height);
  assert.equal(await map.locator('rect').count(),0,'no graph rectangles');
  const geometry=await map.locator('[data-concept-id]').evaluateAll(nodes=>nodes.map(node=>{
   const circle=node.querySelector('g circle'),c=circle.getBBox(),r=c.width/2;
   const text=node.querySelector('text');
   return {id:node.dataset.conceptId,w:c.width,h:c.height,r,labels:[...text.querySelectorAll('tspan')].map(t=>{const b=t.getBBox();return {x:b.x,y:b.y,w:b.width,h:b.height};})};
  }));
  assert.ok(geometry.length>1);
  for(const node of geometry) {
   assert.equal(node.w,node.h,'true circle');
   for(const b of node.labels) for(const x of [b.x,b.x+b.w]) for(const y of [b.y,b.y+b.h]) assert.ok(Math.hypot(x,y)<=node.r,node.id+' label inside circle');
  }
  assert.ok(await map.locator('[data-state="Prerequisite"]').count()>0);
  const node=map.locator('[data-state="Prerequisite"]').first();const title=await node.locator('title').textContent();
  await page.keyboard.press('Tab');await node.focus();await page.waitForTimeout(100);
  assert.equal(await node.evaluate(n=>getComputedStyle(n.querySelector('circle')).opacity),'1','visible keyboard ring '+JSON.stringify(await node.evaluate(n=>({active:document.activeElement===n,visible:n.matches(':focus-visible'),width:innerWidth}))));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  assert.equal(await page.getByTestId('atlas-inspector').evaluate(n=>n===document.activeElement),true);
  assert.ok(title.includes((await page.getByTestId('atlas-inspector').locator('h2').innerText())));
  const selected=map.locator('[data-state="Selected"]');await selected.focus();await page.keyboard.press('Space');
  assert.ok(await page.getByTestId('atlas-inspector').locator('a[href^="https://learn.microsoft.com/"]').count());
  if(width<400) {
   const target=map.locator('[data-concept-id]').last(),id=await target.getAttribute('data-concept-id');
   await target.tap();await page.waitForTimeout(200);
   assert.equal(new URL(page.url()).searchParams.get('concept'),id,'touch selection updates context');
   await page.goBack();await page.waitForTimeout(200);
   assert.notEqual(new URL(page.url()).searchParams.get('concept'),id,'history restores previous view');
  }
  await page.getByRole('button',{name:'Reset view',exact:true}).click();
  assert.equal(await map.locator('.atlas-circle-viewport').evaluate(n=>n.getBoundingClientRect().height),reservedHeight,'selection/reset does not shift the map viewport');
  assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),before,'all existing state values unchanged');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no page overflow');
  const edge=map.locator('.atlas-circle-edge').first();await edge.focus();await page.keyboard.press('Enter');
  await page.getByTestId('atlas-inspector').getByText('Relationship inspector',{exact:true}).waitFor();
  await page.getByTestId('atlas-inspector').getByText('Under which conditions?',{exact:true}).waitFor();
  await page.getByTestId('atlas-inspector').getByRole('button',{name:'Back to the concept',exact:true}).click();
  await map.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
  const current=map.locator('[data-state="Selected"]');await current.focus();
  const face=current.locator('g');const initial=await face.evaluate(n=>getComputedStyle(n).transform);
  await current.hover();await page.waitForTimeout(200);
  const hovered=await face.evaluate(n=>getComputedStyle(n).transform);
  if(width===1920) assert.notEqual(hovered,initial,'purposeful hover scale');
  else {
   assert.ok(await face.evaluate(n=>parseFloat(getComputedStyle(n).transitionDuration)<=.00001),'reduced motion is effectively instant (global accessibility rule uses 0.01ms)');
   assert.equal(hovered,initial,'reduced motion does not scale nodes');
  }
  await page.screenshot({path:out+'/map-'+width+'.png',fullPage:false});
  await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
  const axe=await page.evaluate(async()=>{const r=await window.axe.run(document.querySelector('[data-testid="atlas-explorer"]'));return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.map(v=>v.id)};});
  assert.deepEqual(axe.violations,[],'Axe Explorer violations');
  checks.push({width,status:'PASS',nodes:geometry.length,geometry,axe,checks:'true circles, label bounds, prerequisite state, keyboard Enter/Space, focus ring and inspector, sources, state preservation, Reset, no overflow, hover/reduced motion',touch:width<400?'emulated tap and history PASS':'NOT RUN'});
  await ctx.close();
 }
 assert.deepEqual(errors,[]);
} finally {await browser.close();writeFileSync(out+'/BROWSER.json',JSON.stringify({checks,errors},null,2));}
console.log('PASS: circular Atlas browser checks at 320, 390 dark, 1440 and 1920; zero Axe violations.');
