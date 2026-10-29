import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const phase = process.argv[2] || 'before';
const base = process.env.PHASE2_BASE || 'http://127.0.0.1:4318';
const dir = path.resolve(`docs/final-review-20261028/evidence/${phase}`);
await mkdir(dir, {recursive: true});
const browser = await chromium.launch({executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true});
const results = [];
for (const width of [1440,1280,768,390,320]) {
  for (const dark of [false,true]) {
    const ctx = await browser.newContext({viewport:{width,height:900},hasTouch:width<500, isMobile:width<500});
    await ctx.addInitScript(dark=>{localStorage.setItem('amir-theme',dark?'dark':'light');}, dark);
    const p = await ctx.newPage();
    const errors=[];
    p.on('pageerror', e=>errors.push(e.message));
    await p.addInitScript(()=>{
      window.phase2Perf={lcp:0,cls:0,events:[]};
      new PerformanceObserver(l=>{for(const e of l.getEntries())window.phase2Perf.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.phase2Perf.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
      new PerformanceObserver(l=>{for(const e of l.getEntries())window.phase2Perf.events.push(e.duration);}).observe({type:'event',buffered:true,durationThreshold:16});
    });
    await p.goto(base,{waitUntil:'networkidle'});
    await p.waitForTimeout(1000);
    await p.screenshot({path:path.join(dir,`${width}-${dark?'dark':'light'}.png`),fullPage:true});
    await p.screenshot({path:path.join(dir,`${width}-${dark?'dark':'light'}-opening.png`)});
    results.push({width,dark,errors,...await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,theme:document.documentElement.className,metrics:window.phase2Perf}))});
    // Actual interaction frames. A frame sequence is usable without an external codec.
    if ((width===1440||width===390)&&dark) {
      const frames=path.join(dir,`motion-${width}`);await mkdir(frames,{recursive:true});
      await p.getByRole('button',{name:'Deal three ideas',exact:true}).scrollIntoViewIfNeeded();
      await p.screenshot({path:path.join(frames,'00-deck.png')});
      await p.getByRole('button',{name:'Deal three ideas',exact:true}).click();
      for(let i=1;i<=9;i++){await p.waitForTimeout(55);await p.screenshot({path:path.join(frames,`${String(i).padStart(2,'0')}-flight.png`)});}
      const card=p.locator('[aria-label="Knowledge card tray"] button[aria-expanded]').first();
      await card.click();await p.waitForTimeout(500);
      await p.screenshot({path:path.join(frames,'10-reader.png')});
      await p.getByRole('button',{name:'Back to the hand'}).click();
      await p.getByRole('button',{name:'Collect all',exact:true}).click();
      await p.locator('[aria-current="date"]').scrollIntoViewIfNeeded();
      const rail=p.locator('[aria-current="date"]');const box=await rail.boundingBox();
      if(box){await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x-160,box.y+box.height/2,{steps:12});await p.screenshot({path:path.join(frames,'11-rail-drag.png')});await p.mouse.up();}
      await p.waitForTimeout(700);await p.screenshot({path:path.join(frames,'12-rail-settled.png')});
    }
    await ctx.close();
  }
}
await browser.close();
await writeFile(path.join(dir,'capture.json'),JSON.stringify({phase,base,results,recording:'Timestamped PNG interaction sequence; screenshot capture overhead means these are not FPS measurements.'},null,2));
console.log(JSON.stringify(results,null,2));
