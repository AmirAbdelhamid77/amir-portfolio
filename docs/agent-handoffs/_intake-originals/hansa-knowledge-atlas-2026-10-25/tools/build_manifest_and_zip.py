#!/usr/bin/env python3
"""Regenerate the deterministic manifest and ZIP for handoff distribution."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
out = root.parent / (root.name + '.zip')
entries = []
for p in sorted(root.rglob('*')):
    if p.is_file() and p.name != 'HANDOFF_MANIFEST.json':
        raw = p.read_bytes()
        entries.append({'path': p.relative_to(root).as_posix(), 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
manifest = {
    'package': 'Hansa Knowledge Atlas — Semantic Graph / Contextual Hybrid Implementation Handoff',
    'version': '1.0.0',
    'preparedDate': '2026-10-25',
    'status': 'documentation-only; website and repository not modified',
    'governingDecision': 'Every drawn Atlas edge represents evidence-reviewed semantic knowledge, not content or chapter hierarchy.',
    'firstPilot': 'DP-600 Guide',
    'future': ['New books and guides', 'Data Visualization', 'Data Storytelling', 'Statistics', 'More question banks, labs and learning tabs', 'Global Hansa Atlas only after later approval'],
    'validation': {
        'fixtureSchema': 'validated using jsonschema Draft 2020-12 on 2026-10-25',
        'repoInspection': 'not performed: Windows project files unavailable here',
        'originalGuideFullCoverage': 'not performed; must be inventoried in Phase 0',
        'deployment': 'not requested and not performed',
        'fixturePublicReady': False
    },
    'files': entries
}
(root / 'HANDOFF_MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
with ZipFile(out, 'w', compression=ZIP_DEFLATED) as z:
    for p in sorted(root.rglob('*')):
        if p.is_file():
            z.write(p, arcname=f'{root.name}/{p.relative_to(root).as_posix()}')
print(json.dumps({'zip':str(out),'file_count':len(entries)+1,'zip_bytes':out.stat().st_size, 'documentation_bytes':sum(e['bytes'] for e in entries)},indent=2))
