import pathlib,hashlib,json,shutil,subprocess
r=pathlib.Path(__file__).resolve().parents[1];d=r/'docs/learning-architecture-20261028';d.mkdir(exist_ok=True)
if (d/'BASELINE.json').exists():raise SystemExit('Baseline already exists')
files={}
for folder in ['app','components','lib','content','scripts']:
 for p in (r/folder).rglob('*'):
  if p.is_file():
   rel=p.relative_to(r).as_posix();files[rel]=hashlib.sha256(p.read_bytes()).hexdigest();to=d/'before'/(rel+'.snapshot');to.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,to)
for rel in ['package.json','package-lock.json','next.config.ts','AGENTS.md']:
 p=r/rel;files[rel]=hashlib.sha256(p.read_bytes()).hexdigest()
(d/'BASELINE.json').write_text(json.dumps({'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip(),'files':files},indent=2))
(d/'git-status-before.txt').write_bytes(subprocess.check_output(['git','status','--porcelain=v1'],cwd=r))
print(len(files),'source/content/script hashes captured')
