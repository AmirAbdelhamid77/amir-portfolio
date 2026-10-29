import {chromium} from 'playwright-core';import {mkdir,writeFile} from 'node:fs/promises';import path from 'node:path';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
for(const width of [1440,390])for(const review of [false,true]){
 const dir=path.resolve(`.scratch/final-review-atlas/${review?'review':'public'}-${width}`);await mkdir(dir,{recursive:true});const ctx=await browser.newContext({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});await ctx.addInitScript(()=>localStorage.setItem('amir-theme','dark'));const p=await ctx.newPage(),cdp=await ctx.newCDPSession(p),frames=[],pending=[];
 cdp.on('Page.screencastFrame',e=>{const file=`${String(frames.length).padStart(5,'0')}.jpg`;frames.push({file,timestamp:e.metadata.timestamp});pending.push(writeFile(path.join(dir,file),Buffer.from(e.data,'base64')));void cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId});});await cdp.send('Page.startScreencast',{format:'jpeg',quality:82,maxWidth:width,maxHeight:900,everyNthFrame:1});
 await p.goto(`http://127.0.0.1:${review?4320:4318}/learn/dp-600/atlas/`,{waitUntil:'networkidle'});await p.waitForTimeout(800);
 const act=async target=>{if(width<500)await target.tap();else await target.click();};
 if(review){
  if(width<1280)await act(p.getByRole('button',{name:'Open the optional map'}));await p.getByTestId('atlas-map').scrollIntoViewIfNeeded();await p.waitForTimeout(800);
  const edge=p.locator('.atlas-circle-edge').first();await edge.focus();await p.keyboard.press('Enter');await p.waitForTimeout(1400);await p.keyboard.press('Escape');await p.waitForTimeout(500);
  await act(p.getByRole('button',{name:'Zoom in',exact:true}));await p.waitForTimeout(600);await act(p.getByRole('button',{name:'Pan right',exact:true}));await p.waitForTimeout(700);await act(p.getByRole('button',{name:'Fit map',exact:true}));
  await act(p.locator('.atlas-circle-node').nth(2));await p.waitForTimeout(1200);await p.getByTestId('atlas-map').scrollIntoViewIfNeeded();await p.waitForTimeout(900);
  await p.getByRole('combobox',{name:'Relationship',exact:true}).selectOption({index:1});await p.waitForTimeout(800);await act(p.getByRole('button',{name:'Reset view',exact:true}));await p.waitForTimeout(700);
 }else{
  await p.getByTestId('atlas-pending-desk').scrollIntoViewIfNeeded();await p.waitForTimeout(700);await p.getByLabel('Find a source',{exact:true}).fill('shortcut');await p.waitForTimeout(700);await act(p.getByRole('list',{name:'Public documentation sources'}).getByRole('button').nth(1));await p.locator('.reading-folio').scrollIntoViewIfNeeded();await p.waitForTimeout(1400);await act(p.getByRole('button',{name:'Reset desk'}));await p.waitForTimeout(700);await p.locator('.reading-continuation').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);
 }
 await cdp.send('Page.stopScreencast');await Promise.all(pending);await writeFile(path.join(dir,'frames.json'),JSON.stringify(frames,null,2));console.log(`${review?'review':'public'}-${width}: ${frames.length} compositor frames`);await ctx.close();
}await browser.close();
