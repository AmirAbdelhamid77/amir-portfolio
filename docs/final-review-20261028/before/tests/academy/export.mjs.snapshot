import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,existsSync,statSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {parse} from 'node-html-parser';
const root=process.cwd(),out=path.join(root,'build/dp600-academy-preview/out');
const routes=['/learn/dp-600/','/learn/dp-600/ingestion/'],results=[];
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=walk(out),payload=[];
for(const route of routes){
 const file=path.join(out,route,'index.html'),html=readFileSync(file,'utf8'),doc=parse(html);
 assert.equal(doc.querySelectorAll('h1').length,1);assert.ok(html.includes('canonical'));
 const broken=[];
 for(const a of doc.querySelectorAll('a[href]')){const href=a.getAttribute('href');if(!href.startsWith('/')&&!href.startsWith('#'))continue;const u=new URL(href,'http://local'+route),target=path.join(out,u.pathname);if(!existsSync(target)&&!existsSync(path.join(target,'index.html')))broken.push(href);if(href.startsWith('#'))assert.ok(doc.querySelector(`[id="${u.hash.slice(1)}"]`),href);}
 assert.deepEqual(broken,[]);let bytes=0,gzip=0;
 for(const a of doc.querySelectorAll('script[src],link[rel=stylesheet]')){const src=a.getAttribute('src')??a.getAttribute('href');if(!src.startsWith('/'))continue;const asset=path.join(out,new URL(src,'http://local').pathname);assert.ok(existsSync(asset),src);if(src.endsWith('.js')){const b=readFileSync(asset);bytes+=b.length;gzip+=gzipSync(b).length;}}
 payload.push({route,html_bytes:statSync(file).size,initial_script_bytes:bytes,initial_script_gzip_sum:gzip});results.push({check:`${route} HTML, links, anchors and referenced assets`,status:'PASS'});
}
assert.ok(readFileSync(path.join(out,'learn/catalogue/index.html'),'utf8').includes('href="/learn/dp-600/"'));
assert.ok(readFileSync(path.join(out,'sitemap.xml'),'utf8').includes('/learn/dp-600/ingestion/'));
assert.equal(files.some(f=>/DP-600-Study-Guide|page-0\d\d\.(txt|webp)|source_content\.json|source_line_map\.json/.test(f)),false);
results.push({check:'Catalogue/sitemap discovery and no raw guide assets in export',status:'PASS'});
const baselineOut=path.join(root,'out');const previous=walk(baselineOut).filter(f=>f.endsWith('.html')).map(f=>path.relative(baselineOut,f));const now=new Set(files.filter(f=>f.endsWith('.html')).map(f=>path.relative(out,f)));
const missing=previous.filter(p=>!now.has(p));assert.deepEqual(missing,[]);results.push({check:`${previous.length} pre-existing exported HTML paths retained (dated out/ baseline, not live verification)`,status:'PASS'});
mkdirSync('docs/dp600-academy/qa',{recursive:true});writeFileSync('docs/dp600-academy/qa/export-results.json',JSON.stringify({results,payload,notes:'Initial script byte sums include shared runtime; gzip sum is not a measured network transfer/CWV or a before-after performance comparison.'},null,2));console.log(JSON.stringify({results,payload},null,2));
