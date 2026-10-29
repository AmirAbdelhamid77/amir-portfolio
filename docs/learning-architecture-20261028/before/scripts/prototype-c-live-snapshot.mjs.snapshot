import fs from 'node:fs';
import crypto from 'node:crypto';
const dir='docs/prototype-c/qa';fs.mkdirSync(dir,{recursive:true});
const paths=['/','/learn/catalogue/','/practice/catalogue/','/learn/dp-600/atlas/','/work/','/experience/'];
const results=await Promise.all(paths.map(async path=>{
 const url='https://hansa.amir-portfolio.workers.dev'+path;
 try {const r=await fetch(url,{signal:AbortSignal.timeout(25000)}),body=await r.text();return {url,status:r.status,finalUrl:r.url,checkedAt:new Date().toISOString(),title:body.match(/<title>(.*?)<\/title>/s)?.[1],h1:body.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]*>/g,' '),sha256:crypto.createHash('sha256').update(body).digest('hex'),cacheControl:r.headers.get('cache-control'),bytes:Buffer.byteLength(body),prototypePresent:body.includes('Knowledge Stage'),deploymentId:'unavailable from public HTTP'};}
 catch(e){return {url,status:'BLOCKED',reason:String(e),checkedAt:new Date().toISOString()};}
}));fs.writeFileSync(dir+'/live-snapshot.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
