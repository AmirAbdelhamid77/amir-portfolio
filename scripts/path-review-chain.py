from pathlib import Path
r=Path(__file__).resolve().parents[1];p=r/'scripts/study-receipt.mjs';s=p.read_text();s="import {pathReviewReceipt} from './path-review-receipt.mjs';\n"+s;s=s.replace("const path='docs/learning-architecture-20261028/MANIFEST.json';","const successor=pathReviewReceipt(root),path='docs/learning-architecture-20261028/MANIFEST.json';").replace("assert.equal(hash(e.path),e.sha256,","assert.equal(hash(e.path),successor.expected(e.path,e.sha256),").replace("m.files.find(e=>e.path===p&&e.beforeSha256===h)?.sha256??h","successor.expected(p,m.files.find(e=>e.path===p&&e.beforeSha256===h)?.sha256??h)").replace("paths:()=>m.files.map(e=>e.path)","paths:()=>[...m.files.map(e=>e.path),...successor.paths()]").replace("bytes:(p,n)=>m.files.find(e=>e.path===p)?.bytes??n","bytes:(p,n)=>successor.bytes(p,m.files.find(e=>e.path===p)?.bytes??n)");p.write_text(s)
for name in ['scripts/verify-preservation-history.mjs','scripts/study-negative.mjs']:
 p=r/name;s=p.read_text();marker="const required = new Set([" if 'verify-preservation' in name else 'for(const p of paths)';block="""if(existsSync(resolve(root,'docs/learning-path-review-20261028/MANIFEST.json'))){const name='docs/learning-path-review-20261028/MANIFEST.json',m=JSON.parse(readFileSync(resolve(root,name),'utf8'));[name,m.baseline,m.previous].forEach(p=>TARGET.add(p));m.files.forEach(e=>{TARGET.add(e.path);if(e.rollbackPath)TARGET.add(e.rollbackPath);});}
"""
 if 'verify-preservation'in name:
  at=s.index('// Carry the exact current successor');s=s[:at]+block.replace('TARGET','required')+s[at:]
 else:
  s=s.replace('mkdtempSync,readFileSync','existsSync,mkdtempSync,readFileSync');s=s.replace("const manifest=", "const root=process.cwd(),manifest=");at=s.index(marker);s=s[:at]+block.replace('TARGET','paths')+s[at:]
 p.write_text(s)
