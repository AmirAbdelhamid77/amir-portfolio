import pathlib,json,hashlib
r=pathlib.Path(__file__).resolve().parents[1];d=r/'docs/learning-architecture-20261028';digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();b=json.loads((d/'BASELINE.json').read_text())['files']
allowed={'app/layout.tsx','app/sitemap.ts','app/learn/catalogue/page.tsx','app/practice/catalogue/page.tsx','app/lab/dp-600/page.tsx','components/site-header.tsx','components/practice/draft-review.tsx','components/learn/intake-review.tsx','lib/site.ts','lib/search/documents.ts','scripts/final-review-receipt.mjs'}
allowed.add('scripts/verify-preservation-history.mjs')
allowed.add('components/lab/exam-player.tsx')
for folder in ['app/study','lib/study','components/study']:
 allowed.update(p.relative_to(r).as_posix()for p in(r/folder).rglob('*')if p.is_file())
allowed.update(p.relative_to(r).as_posix()for p in(r/'scripts').glob('study-*'))
entries=[]
for rel in sorted(allowed):
 p=r/rel
 if not p.exists()or digest(p)==b.get(rel):continue
 e={'path':rel,'beforeSha256':b.get(rel),'sha256':digest(p),'bytes':p.stat().st_size}
 if b.get(rel):e['rollbackPath']='docs/learning-architecture-20261028/before/'+rel+'.snapshot'
 entries.append(e)
unexpected=[p for p,h in b.items()if p not in allowed and digest(r/p)!=h]
assert not unexpected,unexpected
previous=r/'docs/final-review-20261028/INTEGRATION_MANIFEST.json';(d/'MANIFEST.json').write_text(json.dumps({'scope':'topic-led-learning-architecture','baseline':'docs/learning-architecture-20261028/BASELINE.json','baselineSha256':digest(d/'BASELINE.json'),'previous':previous.relative_to(r).as_posix(),'previousSha256':digest(previous),'files':entries,'unchanged':len(b)-sum(e['beforeSha256']is not None for e in entries),'unexpected':unexpected},indent=2));print(len(entries),'owned source changes; all other baseline bytes preserved')
