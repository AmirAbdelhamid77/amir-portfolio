import subprocess, sys, pathlib, json
sys.stdout.reconfigure(encoding='utf8')
label, *args = sys.argv[1:]
root = pathlib.Path(__file__).resolve().parents[1]
result = subprocess.run(args, cwd=root, capture_output=True, text=True, encoding='utf8', errors='replace')
folder = root / 'docs/cinematic-phase2/checks'
folder.mkdir(exist_ok=True)
(folder / (label + '.log')).write_text(result.stdout + '\n' + result.stderr, encoding='utf8')
(folder / (label + '.json')).write_text(json.dumps({'command': args, 'exitCode': result.returncode}, indent=2))
print(label, 'PASS' if result.returncode == 0 else 'FAIL', 'exit', result.returncode)
for line in (result.stdout + '\n' + result.stderr).splitlines():
    if line.startswith(('# tests', '# pass', '# fail', 'not ok', 'FAIL', 'PASS', 'Error', 'error')):
        print(line[:400])
sys.exit(result.returncode)
