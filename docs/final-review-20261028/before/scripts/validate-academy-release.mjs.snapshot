// Executes validation only. Every Wrangler invocation here includes --dry-run.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd(),qa='docs/dp600-academy/qa';mkdirSync(qa,{recursive:true});
const commands=[
 ['unit-tests',['--experimental-strip-types','--test','tests/data-viz/*.test.mjs','tests/statistics/*.test.mjs','tests/fabric/*.test.mjs','tests/content/*.test.mjs','tests/academy/*.test.mjs']],
 ['typecheck',['node_modules/typescript/bin/tsc','--noEmit']],
 ['lint-feature',['node_modules/eslint/bin/eslint.js','lib/academy','components/academy','app/learn/dp-600','scripts/audit-dp600-academy.mjs','scripts/build-academy-preview.mjs','scripts/preview-dp600-academy.mjs','scripts/validate-academy-release.mjs','scripts/prepare-academy-release.mjs','tests/academy']],
 ['source-integrity',['scripts/audit-dp600-academy.mjs']],
 ['reference-integrity',['scripts/verify-agent-reference.mjs']],
 ['export',['tests/academy/export.mjs']],
 ['browser',['tests/academy/e2e.mjs']],
 ['legacy-browser',['tests/academy/legacy-smoke.mjs']],
 ['wrangler-dry-run',['node_modules/wrangler/bin/wrangler.js','deploy','--dry-run','--assets','build/dp600-academy-preview/out','--outdir','build/dp600-academy-preview/wrangler-dry-run']],
];
const results=[];
for(const [name,args] of commands){
 const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:180000,env:{...process.env,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_PATH:path.join(root,'build/wrangler-logs')}});
 writeFileSync(`${qa}/${name}.log`,(r.stdout??'')+(r.stderr??''));
 results.push({check:name,status:r.status===0?'PASS':'FAIL',exit_code:r.status,error:r.error?.message,log:`${qa}/${name}.log`});
 console.log(`${name}: ${r.status===0?'PASS':'FAIL'}`);
 if(r.status!==0)console.log(((r.stdout??'')+(r.stderr??'')).slice(-1600));
}
const browser=JSON.parse(readFileSync(`${qa}/browser-results.json`,'utf8'));
writeFileSync(`${qa}/release-validation.json`,JSON.stringify({checked_at:new Date().toISOString(),results,browser_transport:browser.transport,limitations:browser.infrastructureNotes??[],human_screen_reader:'NOT RUN',physical_mobile_device:'NOT RUN',live_delivery:'NOT RUN',standard_turbopack_build:'BLOCKED by baseline sandbox child-process failure; isolated webpack export validated'},null,2));
if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
