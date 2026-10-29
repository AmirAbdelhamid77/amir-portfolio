#!/usr/bin/env python3
"""Offline structural checks for the skill package, not a runtime/UI test."""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
skill = root / 'SKILL.md'
expected = [
    'references/01-art-direction.md',
    'references/02-decision-engine.md',
    'references/03-technical-playbook.md',
    'references/04-interaction-motion.md',
    'references/05-quality-gates.md',
    'references/06-hansa-scenarios.md',
    'references/07-anti-patterns.md',
    'references/08-output-contract.md',
]
errors=[]
if not skill.is_file(): errors.append('Missing SKILL.md')
else:
    body=skill.read_text(encoding='utf-8')
    if not body.startswith('---\n'): errors.append('SKILL.md missing frontmatter delimiter')
    m=re.search(r'\A---\n(.*?)\n---\n',body,re.S)
    if not m: errors.append('Invalid SKILL frontmatter boundary')
    else:
        fm=m.group(1)
        for k in ('name:', 'description:'):
            if not re.search(r'^'+re.escape(k),fm,re.M): errors.append(f'Missing {k}')
        name=re.search(r'^name:\s*(.*?)\s*$',fm,re.M)
        if not name or name.group(1)!=root.name: errors.append('Skill name/folder mismatch')
        description=re.search(r'^description:\s*(.*?)\s*$',fm,re.M)
        if description and not 1<=len(description.group(1).strip("'\""))<=1024:errors.append('Description length invalid')
    for rel in expected:
        if rel not in body: errors.append(f'SKILL does not reference {rel}')
for rel in expected:
    if not (root/rel).is_file(): errors.append(f'Missing {rel}')
if errors:
    print('FAILED: structural verification')
    for e in errors: print('-',e)
    sys.exit(1)
print('PASS: skill package structure, metadata and 8 referenced documents')
print('NOTE: no local Hansa repo, browser, build or agent-discovery tests were run.')
