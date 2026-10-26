// Verify live delivery against the owner-approved frozen artifact. GET only.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base='https://hansa.amir-portfolio.workers.dev';
const candidate=JSON.parse(readFileSync('docs/dp600-academy/RELEASE_CANDIDATE.json','utf8'));
const manifest=JSON.parse(readFileSync(path.join(path.dirname(candidate.assets_directory),'RELEASE_MANIFEST.json'),'utf8'));
const assets=candidate.assets_directory,qa='docs/dp600-academy/qa/live';mkdirSync(qa,{recursive:true});
const files=new Map(manifest.files.map(f=>[f.path,f]));
const htmls=manifest.files.filter(f=>f.path.endsWith('.html')&&!['404.html','404/index.html','_not-found/index.html'].includes(f.path));
const targets=new Map();
for(const f of htmls){const route=f.path==='index.html'?'/':'/'+f.path.replace(/index\.html$/,'');targets.set(route,{...f,route});const html=readFileSync(path.join(assets,f.path),'utf8');for(const m of html.matchAll(/(?:src|href)="(\/_next\/[^"?#]+\.(?:js|css|woff2))(?:\?[^"#]*)?"/g)){const local=m[1].slice(1);if(files.has(local))targets.set(m[1],{...files.get(local),route:m[1]});}}
const checks=[];let done=0;
async function inspect(t){let last;for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(base+t.route,{redirect:'follow',signal:AbortSignal.timeout(20000),headers:{'cache-control':'no-cache'}});const body=Buffer.from(await r.arrayBuffer());const sha=createHash('sha256').update(body).digest('hex');last={route:t.route,status:r.status,bytes:body.length,hash_matches:sha===t.sha256,expected_sha256:t.sha256,actual_sha256:sha};if(r.status===200&&sha===t.sha256)break;}catch(e){last={route:t.route,status:0,error:String(e)}}}checks.push(last);if(++done%30===0)console.log('Verified',done,'of',targets.size);}
const queue=[...targets.values()];await Promise.all(Array.from({length:8},async()=>{while(queue.length)await inspect(queue.shift())}));
const missing=await fetch(base+'/__hansa-release-not-found-d1eb29b03dd3/',{signal:AbortSignal.timeout(20000)});const missingBody=Buffer.from(await missing.arrayBuffer());
const notFound={status:missing.status,custom_404_matches:createHash('sha256').update(missingBody).digest('hex')===files.get('404.html').sha256};
const slash=await fetch(base+'/learn/dp-600/ingestion',{redirect:'manual',signal:AbortSignal.timeout(20000)});const trailing_slash={status:slash.status,location:slash.headers.get('location')};
const failed=checks.filter(x=>x.status!==200||!x.hash_matches);
const summary={checked_at:new Date().toISOString(),base,release_id:candidate.release_id,artifact_sha256:candidate.artifact_sha256,html_routes:htmls.length,total_html_and_referenced_assets:targets.size,matched:checks.length-failed.length,failures:failed,not_found:notFound,trailing_slash,checks:checks.sort((a,b)=>a.route.localeCompare(b.route))};
writeFileSync(`${qa}/delivery-verification.json`,JSON.stringify(summary,null,2));console.log(JSON.stringify({...summary,checks:undefined},null,2));
if(failed.length||notFound.status!==404||!notFound.custom_404_matches||(![301,302,307,308].includes(slash.status)||new URL(slash.headers.get('location')??'',base).pathname!=='/learn/dp-600/ingestion/'))process.exitCode=1;
