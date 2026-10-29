// Build the SAME source in an isolated QA directory. Never replace normal out/.
import {cpSync,mkdirSync,writeFileSync,readFileSync,readdirSync,symlinkSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=process.cwd(),folder=resolve(root,`build/atlas-final-review-${Date.now()}`);
if(!folder.startsWith(resolve(root,'build')+sep))throw new Error('Invalid review directory');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);
const before=new Map(walk(resolve(root,'out')).map(p=>[p,hash(p)]));
mkdirSync(folder,{recursive:true});
for(const dir of ['app','components','lib','content','public'])cpSync(resolve(root,dir),resolve(folder,dir),{recursive:true});
for(const name of ['package.json','package-lock.json','tsconfig.json','next-env.d.ts'])cpSync(resolve(root,name),resolve(folder,name));
// This build-only root permits the shared dependency junction; route sources
// and all content are exact copies. Production next.config.ts stays untouched.
const config=readFileSync(resolve(root,'next.config.ts'),'utf8').replace('turbopack: {',`turbopack: {\n    root: ${JSON.stringify(root)},`);
writeFileSync(resolve(folder,'next.config.ts'),config);
symlinkSync(resolve(root,'node_modules'),resolve(folder,'node_modules'),'junction');
const result=spawnSync(process.execPath,[resolve(root,'node_modules/next/dist/bin/next'),'build',folder],{cwd:folder,env:{...process.env,HANSA_ATLAS_REVIEW_PREVIEW:'1'},stdio:'inherit',windowsHide:true});
if(result.status!==0)throw new Error(`Isolated review build failed: ${result.status}`);
const aliases=spawnSync(process.execPath,[resolve(root,'scripts/export-segment-aliases.mjs')],{cwd:folder,stdio:'inherit',windowsHide:true});
if(aliases.status!==0)throw new Error('Review segment alias generation failed');
const atlas=readFileSync(resolve(folder,'out/learn/dp-600/atlas/index.html'),'utf8');
if(!atlas.includes('Local review preview')&&!atlas.includes('Documentation-reviewed local preview'))throw new Error('Missing review-only notice');
for(const [p,sha] of before)if(hash(p)!==sha)throw new Error('Normal public export was modified: '+p);
writeFileSync(resolve(folder,'LOCAL_REVIEW_ONLY.json'),JSON.stringify({humanPublicationReviewPending:true,deployable:false,host:'127.0.0.1'},null,2));
writeFileSync(resolve(root,'docs/final-review-20261028/REVIEW_ARTIFACT.json'),JSON.stringify({folder,out:resolve(folder,'out'),normalExportUnchanged:true,publication:'LOCAL_REVIEW_ONLY; NOT APPROVED FOR DEPLOYMENT'},null,2));
console.log('PASS isolated Atlas review built; normal out/ remained byte-identical:',resolve(folder,'out'));
