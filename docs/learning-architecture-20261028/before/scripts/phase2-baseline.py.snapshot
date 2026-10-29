"""Capture actual dirty source, never Git HEAD, before Phase 2 edits."""
import hashlib, json, pathlib, shutil, subprocess, zipfile, io

root = pathlib.Path(__file__).resolve().parents[1]
dest = root / 'docs/cinematic-phase2'
if (dest / 'baseline-hashes.json').exists():
    raise SystemExit('Baseline already exists. Refusing to replace the original evidence.')
dest.mkdir(exist_ok=True)
excluded = {'.git', 'node_modules', '.next', 'out', '.wrangler'}
records = {}
for p in root.rglob('*'):
    rel = p.relative_to(root)
    if any(part in excluded for part in rel.parts) or rel.parts[:2] == ('docs', 'cinematic-phase2'):
        continue
    if p.is_file():
        records[rel.as_posix()] = hashlib.sha256(p.read_bytes()).hexdigest()
(dest / 'baseline-hashes.json').write_text(json.dumps(records, indent=2))
for name, args in {'status': ['status', '--porcelain=v1'], 'worktrees': ['worktree', 'list'], 'head': ['rev-parse', 'HEAD'], 'branch': ['branch', '--show-current']}.items():
    result = subprocess.run(['git', *args], cwd=root, capture_output=True, text=True)
    (dest / f'baseline-{name}.txt').write_text(result.stdout, encoding='utf8')
for folder in ['components/knowledge', 'lib/knowledge']:
    for p in (root / folder).rglob('*'):
        if p.is_file():
            target = dest / 'before' / p.relative_to(root)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, target)
package = pathlib.Path('C:/Users/amira/Downloads/Hansa_Canonical_Home_Architecture_Agent_Package_2026-10-28.zip')
with zipfile.ZipFile(package) as z:
    nested = next(n for n in z.namelist() if n.endswith('PREVIOUS_PROTOTYPE_C_VISUAL_BLUEPRINT.zip'))
    with zipfile.ZipFile(io.BytesIO(z.read(nested))) as b:
        print('Nested visual blueprint:', '\n'.join(b.namelist()))
        for name in b.namelist():
            if name.lower().endswith(('.md', '.json', '.csv', '.txt')):
                target = dest / 'inputs' / pathlib.PurePosixPath(name).name
                target.parent.mkdir(exist_ok=True)
                target.write_bytes(b.read(name))
    for name in z.namelist():
        if name.endswith(('ROUTE_INVENTORY_SEED_117.csv', 'HANSA_Architecture_Content_Audit_2026-10-28.md')):
            target = dest / 'inputs' / pathlib.PurePosixPath(name).name
            target.write_bytes(z.read(name))
(dest / 'input-provenance.json').write_text(json.dumps({'package': str(package), 'sha256': hashlib.sha256(package.read_bytes()).hexdigest(), 'note': 'Previous visual blueprint recovered from nested archive; source inventory is historical.'}, indent=2))
print('Captured', len(records), 'preexisting file hashes and exact knowledge source bytes.')
