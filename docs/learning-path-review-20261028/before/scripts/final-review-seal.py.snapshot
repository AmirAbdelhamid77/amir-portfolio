import pathlib,json,hashlib,shutil
r=pathlib.Path(__file__).resolve().parents[1];d=r/'docs/final-review-20261028'
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=json.loads((d/'BASELINE.json').read_text())['files']
hpath=d/'HISTORICAL_RECONCILIATION.json'
if not hpath.exists():
    transitions=[]
    for rel in ['AGENTS.md','package.json']:
        old=d/'history'/(rel+'.historical.snapshot');current=r/rel
        e={'path':rel,'fromSha256':digest(old),'toSha256':b[rel],'originalPath':old.relative_to(r).as_posix(),'toBytes':current.stat().st_size}
        assert digest(current)==b[rel]
        if rel=='AGENTS.md':
            prefix=old.read_text(encoding='utf8').rstrip();now=current.read_text(encoding='utf8');assert now.startswith(prefix)
            e['appendSha256']=hashlib.sha256(now[len(prefix):].encode()).hexdigest()
        transitions.append(e)
    old=json.loads((r/'docs/knowledge-atlas/PRESERVATION_BASELINE.json').read_text(encoding='utf8'))['files']
    additions=[]
    for rel,sha in b.items():
        if rel.split('/')[0] not in {'app','components','lib','content','public','tests'} or rel in old:continue
        original=d/'before'/(rel+'.snapshot')
        if not original.exists():
            assert digest(r/rel)==sha,rel
            original.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(r/rel,original)
        assert digest(original)==sha
        additions.append({'path':rel,'sha256':sha,'originalPath':original.relative_to(r).as_posix()})
    hpath.write_text(json.dumps({'scope':'audited-preexisting-script-skill-and-runtime-evolution','transitions':transitions,'additions':additions,'note':'Exact preexisting runtime additions preserved as found; this inventory does not confer scientific approval. Draft status and keys remain unchanged.'},indent=2))
allowed={
 'app/layout.tsx','app/globals.css','components/statistics/math.tsx','lib/touch.ts',
 'components/atlas/explorer.tsx','components/atlas/circle-map.css','components/atlas/pending-desk.tsx','components/atlas/reading-desk.css','lib/atlas/server.ts','app/learn/dp-600/atlas/page.tsx',
 'components/knowledge/insight-stage.tsx','components/knowledge/knowledge-instrument.tsx','components/knowledge/insight-rail.tsx',
 'scripts/cinematic-phase2-receipt.mjs','scripts/preservation-history.mjs','scripts/verify-agent-reference.mjs','scripts/verify-easyui-integration.mjs','scripts/verify-preservation-history.mjs',
 'scripts/final-review-receipt.mjs','tsconfig.tsbuildinfo',
}
allowed.update(p.relative_to(r).as_posix() for p in (r/'scripts').glob('final-review-*'))
entries=[]
for rel in sorted(allowed):
    p=r/rel
    if not p.exists():continue
    current=digest(p);before=b.get(rel)
    if current==before:continue
    e={'path':rel,'beforeSha256':before,'sha256':current,'bytes':p.stat().st_size}
    if rel=='tsconfig.tsbuildinfo':e['generated']=True
    elif before is not None:
        original=d/'before'/(rel+'.snapshot');assert original.exists() and digest(original)==before,rel
        e['rollbackPath']=original.relative_to(r).as_posix()
    entries.append(e)
prev=r/'docs/cinematic-phase2/INTEGRATION_MANIFEST.json'
m={'scope':'hansa-final-review-20261028','previousManifest':prev.relative_to(r).as_posix(),'previousManifestSha256':digest(prev),'baselinePath':'docs/final-review-20261028/BASELINE.json','baselineSha256':digest(d/'BASELINE.json'),'historySha256':digest(hpath),'files':entries}
(d/'INTEGRATION_MANIFEST.json').write_text(json.dumps(m,indent=2))
unexpected=[];preserved=0
for rel,sha in b.items():
    if rel in allowed:continue
    p=r/rel
    if p.exists() and digest(p)==sha:preserved+=1
    else:unexpected.append(rel)
(d/'PRESERVATION.json').write_text(json.dumps({'preserved':preserved,'unexpected':unexpected,'owned':[e['path'] for e in entries]},indent=2))
print('Sealed',len(entries),'changes;',preserved,'starting files preserved; unexpected',unexpected)
if unexpected:raise SystemExit(1)
