// Reproducible LOCAL validation only. Does not change next.config.ts or out/.
// Uses installed webpack, the existing Tailwind loader and already-exported fonts.
import {cpSync,rmSync,mkdirSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=process.cwd(), preview=path.resolve(root,'build/dp600-academy-preview');
mkdirSync(preview,{recursive:true});
const inputRoots=['app','components','lib','content','public'];
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const sourceManifest={method:'Source snapshot before compilation, unchanged-source assertion after export',files:[...inputRoots.flatMap(walk),'package.json','package-lock.json','next.config.ts','tsconfig.json'].map(p=>({path:p.split(path.sep).join("/"),sha256:sha(p)}))};
for(const dir of ['app','components','lib','content','public','scripts'])cpSync(path.join(root,dir),path.join(preview,dir),{recursive:true});
for(const file of ['package.json','package-lock.json','tsconfig.json','next-env.d.ts'])if(existsSync(file))cpSync(path.join(root,file),path.join(preview,file));
// Local node_modules resolves from the parent repository; no junction required.
let config=readFileSync('next.config.ts','utf8');
config=config.replace('const nextConfig: NextConfig = {',`const nextConfig: NextConfig = {
  experimental: { webpackBuildWorker: false, workerThreads: true, cpus: 1 },
  webpack(config) {
    config.module.rules.push({ test: /globals\\.css$/, enforce: "pre", use: [{ loader: "@tailwindcss/turbopack", options: {base: ${JSON.stringify(root)}} }] });
    return config;
  },`);
writeFileSync(path.join(preview,'next.config.ts'),config);
const cssDir=path.join(root,'out/_next/static/chunks');
const allCss=readdirSync(cssDir).filter(f=>f.endsWith('.css')).map(f=>readFileSync(path.join(cssDir,f),'utf8')).join('\n');
const faces=[...allCss.matchAll(/@font-face\{[^}]*\}/g)].map(m=>m[0]).filter(s=>/font-family:["']?Geist/.test(s)&&s.includes('src:url('));
if(!faces.length)throw Error('No existing Geist font cache; cannot make faithful offline preview');
const cached={};
for(const family of ['Geist','Geist Mono']){
 const css=faces.filter(s=>s.includes(`font-family:${family==='Geist'?'Geist;':'Geist Mono;'}`)||s.includes(`font-family:"${family}";`)).map(s=>s.replaceAll('src:url(../media/','src: url('+root.replaceAll('\\','/').replace(/^[A-Za-z]:/,'')+'/out/_next/static/media/')).join('\n');
 if(!css)throw Error('No cached font faces for '+family);
 cached[family]=css;
}
const mock=path.join(preview,'font-cache.cjs');
writeFileSync(mock,`const cache=${JSON.stringify(cached)};module.exports=new Proxy({}, {get:(_,url)=>typeof url==='string'?cache[url.includes('Geist+Mono')?'Geist Mono':'Geist']:undefined});`);
const normalize=path.join(preview,'mkdir-normalize.cjs');
// Windows host async mkdir intermittently returns EPERM even on writable directories.
// Use the synchronous API with the same path/options; never suppress errors.
writeFileSync(normalize,`const fs=require('fs');fs.mkdir=function(p,options,callback){if(typeof options==='function'){callback=options;options=undefined;}try{const result=fs.mkdirSync(p,options);queueMicrotask(()=>callback(null,result));}catch(error){queueMicrotask(()=>callback(error));}};fs.promises.mkdir=async(p,options)=>fs.mkdirSync(p,options);`);
console.log('Local validation copy:',preview,'; offline cached Geist fonts; webpack + existing Tailwind loader');
const result=spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build','--webpack'],{cwd:preview,env:{...process.env,NEXT_FONT_GOOGLE_MOCKED_RESPONSES:mock,NODE_OPTIONS:((process.env.NODE_OPTIONS??'')+' --require='+normalize)},encoding:'utf8'});
mkdirSync(path.join(root,'docs/dp600-academy/qa'),{recursive:true});
writeFileSync(path.join(root,'docs/dp600-academy/qa/static-build.log'),(result.stdout??'')+(result.stderr??''));
console.log((result.stdout??'')+(result.stderr??''));
if(result.status===0){
 for(const f of sourceManifest.files)if(sha(f.path)!==f.sha256)throw Error('Source changed during build: '+f.path);
 writeFileSync(path.join(root,'docs/dp600-academy/qa/build-source-manifest.json'),JSON.stringify(sourceManifest,null,2));
 const aliases=spawnSync(process.execPath,[path.join(preview,'scripts/export-segment-aliases.mjs')],{cwd:preview,encoding:'utf8'});
 console.log(aliases.stdout??'');
 if(aliases.status!==0)throw Error(aliases.stderr||'Segment aliases failed');
 // Remove only this script's generated input/cache copies; retain static out/.
 for(const name of ['app','components','lib','content','public','scripts','.next','next.config.ts','tsconfig.json','next-env.d.ts','package.json','package-lock.json','font-cache.cjs','mkdir-normalize.cjs']){
  const target=path.resolve(preview,name);
  if(preview!==path.resolve(root,'build/dp600-academy-preview')||!target.startsWith(preview+path.sep))throw Error('Unsafe cleanup path');
  rmSync(target,{recursive:true,force:true});
 }
}
process.exitCode=result.status??1;
