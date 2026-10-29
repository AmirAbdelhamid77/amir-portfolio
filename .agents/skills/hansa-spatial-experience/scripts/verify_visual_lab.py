#!/usr/bin/env python3
"""Offline static smoke test of packaged lab; NOT a browser QA substitute."""
from html.parser import HTMLParser
from pathlib import Path
import re,sys
# scripts -> skill -> skills -> .agents -> package root.
html=Path(__file__).resolve().parents[4]/'examples/spatial_visual_lab.html'
class Scan(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.mode_buttons=0;self.remote=[]
 def handle_starttag(self,tag,attrs):
  attr=dict(attrs)
  if 'id' in attr:self.ids.add(attr['id'])
  if tag=='button' and 'data-mode' in attr:self.mode_buttons+=1
  if attr.get('src','').startswith(('http://','https://')):self.remote.append(attr['src'])
source=html.read_text(encoding='utf-8');scan=Scan();scan.feed(source)
needed={'scene','sceneArea','conceptList','reduce','reset','zoomin','zoomout','conceptTitle','conceptBody'}
issues=[]
if not needed.issubset(scan.ids):issues.append('missing UI element IDs')
if scan.mode_buttons!=3:issues.append('expected 3 design directions')
if scan.remote:issues.append('network-dependent asset')
if 'prefers-reduced-motion:reduce' not in source:issues.append('missing CSS reduced-motion fallback')
if 'requestAnimationFrame' not in source:issues.append('no interactive motion loop')
if not re.search('aria-pressed',source):issues.append('missing pressed/selected semantics')
print('Visual lab structural status:', 'PASS' if not issues else 'FAIL')
for x in issues:print('ERROR:',x)
print('NOTE: browser rendering not measured by this structural check.')
sys.exit(1 if issues else 0)
