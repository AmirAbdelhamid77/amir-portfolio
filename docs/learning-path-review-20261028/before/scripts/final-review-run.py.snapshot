import pathlib,subprocess,sys,json
sys.stdout.reconfigure(encoding='utf8')
r=pathlib.Path(__file__).resolve().parents[1];label,*args=sys.argv[1:]
d=r/'docs/final-review-20261028/checks';d.mkdir(exist_ok=True)
p=subprocess.run(args,cwd=r,capture_output=True,text=True,encoding='utf8',errors='replace')
(d/(label+'.log')).write_text(p.stdout+'\n'+p.stderr,encoding='utf8')
(d/(label+'.json')).write_text(json.dumps({'command':args,'exitCode':p.returncode},indent=2))
print(label,'PASS' if p.returncode==0 else 'FAIL','exit',p.returncode)
lines=(p.stdout+'\n'+p.stderr).splitlines()
important=[s for s in lines if s.startswith(('PASS','FAIL','not ok','# tests','# pass','# fail','AssertionError','Error:'))]
print('\n'.join(important or lines[-18:]))
sys.exit(p.returncode)
