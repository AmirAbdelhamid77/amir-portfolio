import pathlib,json,hashlib
r=pathlib.Path(__file__).resolve().parents[1];d=r/'docs/learning-path-review-20261028';h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();b=json.loads((d/'BASELINE.json').read_text())['files'];allowed={'lib/study/server.ts','components/fabric/pack-notes.tsx','components/study/directory.tsx','components/study/orientation.tsx','app/study/[subject]/[topic]/page.tsx','app/study/review/page.tsx','app/sitemap.ts','scripts/study-receipt.mjs','scripts/study-negative.mjs','scripts/verify-preservation-history.mjs'}
for folder in ['lib/study','components/study','app/study']:
 allowed.update(p.relative_to(r).as_posix()for p in(r/folder).rglob('*')if p.is_file()and p.relative_to(r).as_posix()not in b)
allowed.update(p.relative_to(r).as_posix()for p in(r/'scripts').glob('path-review-*'))
entries=[]
for rel in sorted(allowed):
 p=r/rel
 if not p.exists()or h(p)==b.get(rel):continue
 e={'path':rel,'beforeSha256':b.get(rel),'sha256':h(p),'bytes':p.stat().st_size}
 if b.get(rel):e['rollbackPath']='docs/learning-path-review-20261028/before/'+rel+'.snapshot'
 entries.append(e)
unexpected=[p for p,sha in b.items()if p not in allowed and h(r/p)!=sha];assert not unexpected,unexpected
prev=r/'docs/learning-architecture-20261028/MANIFEST.json';m={'scope':'source-grounded-learning-path-review','baseline':'docs/learning-path-review-20261028/BASELINE.json','baselineSha256':h(d/'BASELINE.json'),'previous':prev.relative_to(r).as_posix(),'previousSha256':h(prev),'files':entries,'preserved':len(b)-sum(e['beforeSha256']is not None for e in entries),'unexpected':unexpected};(d/'MANIFEST.json').write_text(json.dumps(m,indent=2));print(len(entries),'owned files;',m['preserved'],'baseline files preserved')
