import {chromium} from 'playwright-core';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
for(const width of [1440,390]){
 const dir=path.resolve(`.scratch/final-review-video/${width}`);await mkdir(dir,{recursive:true});
 const ctx=await browser.newContext({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});
 await ctx.addInitScript(()=>localStorage.setItem('amir-theme','dark'));
 const p=await ctx.newPage(),cdp=await ctx.newCDPSession(p);const frames=[],pending=[];
 cdp.on('Page.screencastFrame',evt=>{
   const file=`${String(frames.length).padStart(5,'0')}.jpg`;
   frames.push({file,timestamp:evt.metadata.timestamp});
   pending.push(writeFile(path.join(dir,file),Buffer.from(evt.data,'base64')));
   void cdp.send('Page.screencastFrameAck',{sessionId:evt.sessionId});
 });
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:82,maxWidth:width,maxHeight:900,everyNthFrame:1});
 await p.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});await p.waitForTimeout(750);
 await p.locator('.instrument-switch').click();await p.waitForTimeout(700);
 await p.getByRole('button',{name:'Reset model',exact:true}).click();
 const rail=p.locator('.insight-rail-viewport');await rail.scrollIntoViewIfNeeded();await p.waitForTimeout(350);
 const box=await rail.boundingBox();await p.mouse.move(box.x+box.width*.6,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width*.6-190,box.y+box.height/2,{steps:20});await p.mouse.up();await p.waitForTimeout(900);
 await p.getByRole('button',{name:'Reveal the reasoning',exact:true}).click();await p.waitForTimeout(850);
 await p.getByRole('button',{name:'Deal three ideas',exact:true}).scrollIntoViewIfNeeded();await p.waitForTimeout(300);await p.getByRole('button',{name:'Deal three ideas',exact:true}).click();await p.waitForTimeout(1000);
 await p.locator('[aria-label="Knowledge card tray"] button[aria-expanded]').first().click();await p.waitForTimeout(1100);
 await p.getByRole('button',{name:'Back to the hand'}).click();await p.waitForTimeout(600);await p.getByRole('button',{name:'Collect all',exact:true}).click();await p.waitForTimeout(900);
 await p.locator('[aria-labelledby="atlas-peek-title"]').scrollIntoViewIfNeeded();await p.waitForTimeout(1200);
 await cdp.send('Page.stopScreencast');await Promise.all(pending);await writeFile(path.join(dir,'frames.json'),JSON.stringify(frames,null,2));
 console.log(`${width}: ${frames.length} actual compositor frames captured`);await ctx.close();
}
await browser.close();
