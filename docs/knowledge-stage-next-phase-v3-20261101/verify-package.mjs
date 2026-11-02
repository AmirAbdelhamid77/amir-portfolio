import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const roots = ['app','components','lib','content','tests','scripts','intelligent-atlas'];
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
function snapshot() {
  const files = roots.flatMap(n => walk(path.join(root,n)));
  for(const n of ['package.json','package-lock.json','next.config.ts','wrangler.jsonc']) if(fs.existsSync(path.join(root,n))) files.push(path.join(root,n));
  return Object.fromEntries(files.sort().map(p => [path.relative(root,p).replaceAll('\\','/'),hash(p)]));
}
const write = (n,v) => fs.writeFileSync(path.join(here,n), JSON.stringify(v,null,2)+'\n');
if(process.argv.includes('--baseline')) {
  const data = snapshot(); write('SOURCE_BASELINE.json',data);
  console.log(JSON.stringify({baselineFiles:Object.keys(data).length}));
} else {
  const before=JSON.parse(fs.readFileSync(path.join(here,'SOURCE_BASELINE.json'),'utf8')), after=snapshot();
  const changed=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(p => before[p]!==after[p]);
  const docs=fs.readdirSync(here).filter(n=>n.endsWith('.md'));
  const broken=[],nonEnglish=[],placeholders=[];
  for(const n of docs) {
    const text=fs.readFileSync(path.join(here,n),'utf8');
    if(/[\u0600-\u06ff]/u.test(text)) nonEnglish.push(n);
    if(/\b(TODO|TBD|FIXME)\b/.test(text)) placeholders.push(n);
    for(const m of text.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)) {
      if(/^(https?:\/\/|#)/.test(m[1])) continue;
      const target=m[1].split('#')[0];
      if(target && !fs.existsSync(path.resolve(here,target))) broken.push({file:n,target});
    }
  }
  const result={documents:docs.length,sourceFilesChecked:Object.keys(before).length,sourceChanges:changed,brokenLocalLinks:broken,nonEnglishDocuments:nonEnglish,placeholders};
  result.pass=docs.length>0 && ![changed,broken,nonEnglish,placeholders].some(a=>a.length);
  write('PACKAGE_VALIDATION.json',result);
  write('PACKAGE_MANIFEST.json',Object.fromEntries([...docs,'verify-package.mjs','SOURCE_BASELINE.json','HANDOFF_STATUS.json'].filter(n=>fs.existsSync(path.join(here,n))).map(n=>[n,hash(path.join(here,n))])));
  console.log(JSON.stringify(result));
  if(!result.pass) process.exitCode=1;
}
