import {chromium} from 'playwright-core';import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const results=[];
for(const width of [390,1440])for(let sample=0;sample<3;sample++){
 const ctx=await browser.newContext({viewport:{width,height:900}});await ctx.addInitScript(()=>{
 localStorage.setItem('amir-theme','dark');window.lab={lcp:0,cls:0,eventDurations:[]};
 new PerformanceObserver(l=>{for(const e of l.getEntries())window.lab.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
 new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
 new PerformanceObserver(l=>{for(const e of l.getEntries())window.lab.eventDurations.push({name:e.name,duration:e.duration});}).observe({type:'event',buffered:true,durationThreshold:16});
 });
 const p=await ctx.newPage(),cdp=await ctx.newCDPSession(p);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:75,downloadThroughput:200000,uploadThroughput:100000});
 await p.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});await p.waitForTimeout(1000);
 const initial=await p.evaluate(()=>({...window.lab,js:performance.getEntriesByType('resource').filter(r=>r.name.includes('.js')).reduce((n,r)=>n+r.transferSize,0),navigation:performance.getEntriesByType('navigation')[0].toJSON()}));
 await p.evaluate(()=>{window.pacing=[];let last=performance.now();function tick(now){window.pacing.push(now-last);last=now;if(window.pacing.length<150)requestAnimationFrame(tick);}requestAnimationFrame(tick);});
 await p.locator('.instrument-switch').click();await p.getByRole('button',{name:'Deal three ideas',exact:true}).click();await p.waitForTimeout(1300);
 const pacing=await p.evaluate(()=>({frames:window.pacing,eventDurations:window.lab.eventDurations}));
 const sorted=pacing.frames.slice().sort((a,b)=>a-b);results.push({width,sample,cpuSlowdown:4,network:'200000 bytes/sec down; 75ms latency; local static server',...initial,interactionEvents:pacing.eventDurations,frameCount:sorted.length,p50FrameMs:sorted[Math.floor(sorted.length*.5)],p95FrameMs:sorted[Math.floor(sorted.length*.95)],gapsOver34ms:sorted.filter(n=>n>34).length});await ctx.close();
}
await browser.close();await mkdir('docs/cinematic-phase2/evidence/performance',{recursive:true});await writeFile('docs/cinematic-phase2/evidence/performance/lab.json',JSON.stringify({browser:browser.version(),results,limits:['Synthetic local lab; NOT field CWV or field INP','Event Timing max is a diagnostic, not a claimed INP score','rAF gaps include scripted scrolling, CPU throttle, and host load; not GPU-only frame drops','No real handset or thermal testing']},null,2));console.log(JSON.stringify(results.map(({width,sample,lcp,cls,p95FrameMs,gapsOver34ms,js})=>({width,sample,lcp,cls,p95FrameMs,gapsOver34ms,js})),null,2));
