import pathlib,json,hashlib,shutil,subprocess
r=pathlib.Path(__file__).resolve().parents[1];d=r/'docs/learning-path-review-20261028';d.mkdir(exist_ok=True)
if(d/'BASELINE.json').exists():raise SystemExit('Already sealed')
b={}
for folder in ['app','components','lib','content','scripts']:
 for p in(r/folder).rglob('*'):
  if p.is_file():
   rel=p.relative_to(r).as_posix();b[rel]=hashlib.sha256(p.read_bytes()).hexdigest();out=d/'before'/(rel+'.snapshot');out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,out)
(d/'BASELINE.json').write_text(json.dumps({'files':b,'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip()},indent=2));print(len(b),'preflight hashes')
