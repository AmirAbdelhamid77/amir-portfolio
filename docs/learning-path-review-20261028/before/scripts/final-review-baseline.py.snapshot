import pathlib,os,hashlib,json,shutil,subprocess
r=pathlib.Path(__file__).resolve().parents[1]
d=r/'docs/final-review-20261028'
if (d/'BASELINE.json').exists():raise SystemExit('Original baseline already sealed')
d.mkdir(exist_ok=True)
files={}
for base,dirs,names in os.walk(r):
    dirs[:]=[x for x in dirs if x not in {'.git','node_modules','.next','out','build','.scratch','graphify-out','final-review-20261028'}]
    for n in names:
        p=pathlib.Path(base)/n;rel=p.relative_to(r).as_posix()
        files[rel]=hashlib.sha256(p.read_bytes()).hexdigest()
(d/'BASELINE.json').write_text(json.dumps({'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip(),'files':files},indent=2))
(d/'git-status-before.txt').write_bytes(subprocess.check_output(['git','status','--porcelain=v1'],cwd=r))
for folder in ['app','components','lib','scripts','tests','content/atlas']:
    for p in (r/folder).rglob('*'):
        if p.is_file() and p.suffix in {'.ts','.tsx','.css','.mjs','.py','.json'}:
            to=d/'before'/(p.relative_to(r).as_posix()+'.snapshot');to.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,to)
for rel in ['AGENTS.md','package.json','docs/agent-reference/PACKAGE_MANIFEST.json']:
    to=d/'before'/(rel+'.snapshot');to.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(r/rel,to)
print('Baseline:',len(files),'hashes; source snapshots saved without compilable extensions')
