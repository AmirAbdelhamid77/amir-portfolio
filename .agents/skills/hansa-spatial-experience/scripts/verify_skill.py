#!/usr/bin/env python3
"""Structural check only, not web UI / browser / semantic verification."""
import json, re, sys, pathlib
skill=pathlib.Path(__file__).resolve().parents[1]
errors=[]
main=skill/'SKILL.md'
if not main.is_file():errors.append('SKILL.md missing')
else:
    s=main.read_text(encoding='utf-8')
    if not s.startswith('---\n'):errors.append('frontmatter missing')
    parts=s.split('---',2)
    if len(parts)<3:errors.append('invalid frontmatter')
    else:
        fm=parts[1]
        name=re.search(r'^name:\s*(.+)$',fm,re.M)
        desc=re.search(r'^description:\s*(.+)$',fm,re.M)
        if not name or name.group(1).strip()!='hansa-spatial-experience':errors.append('name mismatch')
        if not desc:errors.append('description missing')
        elif len(desc.group(1).strip(" '\""))>1024:errors.append('description too long')
    for p in re.findall(r'`(references/[^`]+\.md)`',s):
        if not (skill/p).is_file():errors.append('unresolved reference: '+p)
    if len(s.splitlines())>=500:errors.append('SKILL.md too long for progressive loading')
    if len(s.split())>5000:errors.append('SKILL.md may be too large for progressive loading')
for x in range(1,28):
    if not list((skill/'references').glob(f'{x:02d}-*.md')):errors.append(f'missing reference {x:02d}')
for fname,key,count in [('pattern-registry.json','patterns',80),('scenario-briefs.json','scenarios',30)]:
    p=skill/'assets'/fname
    try:
        doc=json.loads(p.read_text(encoding='utf-8'))
        if len(doc[key])!=count:errors.append(f'{fname} expected {count} items got {len(doc[key])}')
        ids=[x['id'] for x in doc[key]]
        if len(ids)!=len(set(ids)):errors.append(f'{fname} duplicate ID')
    except Exception as ex: errors.append(f'{fname} invalid: {ex}')
try:
    d=json.loads((skill/'assets/decision-record.template.json').read_text(encoding='utf-8'))
    if len(d['alternatives'])<4:errors.append('fewer than 4 alternative concepts in template')
    if len(d['scores'])!=10:errors.append('incorrect scorecard dimensions')
except Exception as ex:errors.append(f'decision template invalid: {ex}')
print('Hansa Spatial Experience structural verification')
print('References:',len(list((skill/'references').glob('*.md'))))
print('Main lines:',len(main.read_text(encoding='utf-8').splitlines()) if main.exists() else 0)
print('Status: '+('FAILED' if errors else 'PASSED'))
for err in errors:print('ERROR:',err)
print('NOTE: no visual browser tests, repository integration or deployment performed.')
sys.exit(1 if errors else 0)
