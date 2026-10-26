import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root=process.cwd(), dir=path.join(root,'docs/prototype-c/preservation');
const owned=['app/page.tsx','components/site-header.tsx','components/site-footer.tsx'];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(process.argv.includes('--capture')) {
  if(fs.existsSync(path.join(dir,'baseline.json'))) throw Error('Baseline already exists; never overwrite');
  const files=[...new Set(execFileSync('git',['ls-files','-co','--exclude-standard','-z'],{encoding:'utf8',maxBuffer:30e6}).split('\0').filter(Boolean))].filter(p=>fs.existsSync(p)&&fs.statSync(p).isFile()&&!p.startsWith('docs/prototype-c/'));
  fs.mkdirSync(path.join(dir,'originals'),{recursive:true});
  for(const p of owned){const dest=path.join(dir,'originals',p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(p,dest);}
  const baseline={capturedAt:new Date().toISOString(),root,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),status:execFileSync('git',['status','--short'],{encoding:'utf8'}),owned,files:Object.fromEntries(files.map(p=>[p,hash(p)]))};
  fs.writeFileSync(path.join(dir,'baseline.json'),JSON.stringify(baseline,null,2));
  console.log(`Captured ${files.length} existing files and ${owned.length} exact originals`);
} else {
  const b=JSON.parse(fs.readFileSync(path.join(dir,'baseline.json'),'utf8'));
  const changed=Object.keys(b.files).filter(p=>!b.owned.includes(p)&&(!fs.existsSync(p)||hash(p)!==b.files[p]));
  const result={checkedAt:new Date().toISOString(),status:changed.length?'FAIL':'PASS',preexistingFiles:Object.keys(b.files).length,allowedModified:b.owned,unexpectedChanges:changed};
  fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(changed.length)process.exitCode=1;
}
