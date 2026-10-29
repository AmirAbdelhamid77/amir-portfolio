import {chromium} from 'playwright-core';
import {mkdir,writeFile} from 'node:fs/promises';
const label=process.argv[2]??'before';
const samples=Number(process.argv[3]??1);
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const results=[];
for(const width of [390,1440])for(let sample=0;sample<samples;sample++){
 const ctx=await browser.newContext({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});
 await ctx.addInitScript(()=>{localStorage.setItem('amir-theme','dark');window.finalLab={lcp:0,element:'',cls:0,events:[]};new PerformanceObserver(l=>{for(const e of l.getEntries()){window.finalLab.lcp=e.startTime;window.finalLab.element=e.element?.outerHTML.slice(0,400);}}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.finalLab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(['click','pointerdown','pointerup'].includes(e.name))window.finalLab.events.push({name:e.name,duration:e.duration});}).observe({type:'event',buffered:true,durationThreshold:16});});
 const p=await ctx.newPage(),cdp=await ctx.newCDPSession(p);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:75,downloadThroughput:200000,uploadThroughput:100000});
 await p.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});await p.waitForTimeout(1000);
 const metrics=await p.evaluate(()=>({...window.finalLab,paint:performance.getEntriesByType('paint').map(e=>({name:e.name,start:e.startTime})),resources:performance.getEntriesByType('resource').map(e=>({name:e.name.replace(location.origin,''),transfer:e.transferSize,decoded:e.decodedBodySize,end:e.responseEnd,duration:e.duration})).sort((a,b)=>b.transfer-a.transfer),fonts:document.fonts.status}));
 if(width<500)await p.locator('.instrument-switch').tap();else await p.locator('.instrument-switch').click();await p.waitForTimeout(600);
 metrics.interactions=await p.evaluate(()=>window.finalLab.events);
 results.push({width,sample,...metrics});await ctx.close();
}
await browser.close();await mkdir('docs/final-review-20261028/performance',{recursive:true});await writeFile(`docs/final-review-20261028/performance/${label}.json`,JSON.stringify({conditions:'Edge headless; 4x CPU; 200000 bytes/sec down; 75ms latency; local static server; emulated touch on phone widths; not field CWV/INP',results},null,2));
console.log(JSON.stringify(results.map(r=>({width:r.width,lcp:r.lcp,element:r.element,cls:r.cls,top:r.resources.slice(0,5),interactions:r.interactions})),null,2));
