"""Append a hash-bound successor; never rewrite a previous task's manifest."""
import pathlib,hashlib,json
r=pathlib.Path(__file__).resolve().parents[1]
d=r/'docs/cinematic-phase2'
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=json.loads((d/'baseline-hashes.json').read_text())
owned=[p.relative_to(r).as_posix() for p in (r/'components/knowledge').glob('*') if p.suffix in ['.tsx','.css']]
owned+=['components/site-header.tsx','scripts/canonical-home-receipt.mjs','scripts/verify-preservation-history.mjs','scripts/cinematic-phase2-receipt.mjs','tsconfig.tsbuildinfo']
owned+=[p.relative_to(r).as_posix() for p in (r/'scripts').glob('phase2-*')]
entries=[]
for rel in sorted(set(owned)):
    p=r/rel
    if not p.exists():continue
    current=digest(p)
    before=b.get(rel)
    if current==before:continue
    entry={'path':rel,'beforeSha256':before,'sha256':current}
    if rel=='tsconfig.tsbuildinfo':entry['generated']=True
    elif before is not None:
        snap=d/'before'/f'{rel}.snapshot'
        if not snap.exists():raise RuntimeError('Missing original snapshot: '+str(snap))
        assert digest(snap)==before,rel
        entry['rollbackPath']=snap.relative_to(r).as_posix()
    entries.append(entry)
prev=r/'docs/canonical-home/INTEGRATION_MANIFEST.json'
manifest={'scope':'hansa-cinematic-phase2-2026-10-28','previousManifest':prev.relative_to(r).as_posix(),'previousManifestSha256':digest(prev),'baselinePath':'docs/cinematic-phase2/baseline-hashes.json','baselineSha256':digest(d/'baseline-hashes.json'),'files':entries}
(d/'INTEGRATION_MANIFEST.json').write_text(json.dumps(manifest,indent=2))
allowed=set(owned)|{'docs/canonical-home/evidence/verify-canonical-home.json'}
unexpected=[];preserved=0
for rel,sha in b.items():
    p=r/rel
    if rel in allowed:continue
    if p.exists() and digest(p)==sha:preserved+=1
    else:unexpected.append(rel)
(d/'preservation-check.json').write_text(json.dumps({'preservedPreexistingFiles':preserved,'unexpectedChanges':unexpected,'ownedChanges':[e['path'] for e in entries],'generatedVerifierEvidence':'docs/canonical-home/evidence/verify-canonical-home.json is rewritten by the existing static verifier; original preflight hash retained in baseline-hashes.json.'},indent=2))
print('Sealed',len(entries),'owned changes;',preserved,'unrelated hashes preserved; unexpected:',unexpected)
if unexpected:raise SystemExit(1)
