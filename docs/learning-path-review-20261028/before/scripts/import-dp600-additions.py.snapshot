"""Read-only import of the owner's four sources. No legacy bank/state writes."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import json, hashlib, zipfile, re, shutil, sys

ROOT = Path(__file__).resolve().parents[1]
INPUT = Path(sys.argv[1]) if len(sys.argv)>1 else ROOT.parent
OUT = ROOT/'content/fabric/additions'
RAW = ROOT/'intake/dp600-additions-2026-10-26'
OUT.mkdir(parents=True, exist_ok=True); RAW.mkdir(parents=True, exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
def save(p,d): p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
class Safe(HTMLParser):
    tags=set('p br b strong em i code pre ul ol li table thead tbody tr td th h3 h4 div span blockquote'.split())
    def __init__(self): super().__init__(convert_charrefs=True); self.out=[]
    def handle_starttag(self,t,a):
        if t in self.tags:self.out.append('<'+t+'>')
    def handle_endtag(self,t):
        if t in self.tags and t!='br':self.out.append('</'+t+'>')
    def handle_data(self,d):self.out.append(escape(d))
def safe(s): p=Safe();p.feed(s or '');return ''.join(p.out)
def text(s):return '<pre>'+escape(s or '')+'</pre>'
records=[]; inputs=[]; cases=[]
def base(id,source,exam):return dict(id=id,sourceId=source,exam=exam,stemHtml='',contextHtml='',options=[],controls=[],mode='single',answers=[],explanationHtml='',images=[],refs=[],blockers=[],sourceRecords=[source],review='Source-supplied answer; not independently validated')
def add_html(q,source,exam,prefix,assetprefix=''):
    r=base(prefix+str(q['n']),source+':'+str(q['n']),exam)
    r['stemHtml']=safe(q['stem_html']);r['contextHtml']=safe(q.get('exh',''))
    r['explanationHtml']=safe(q.get('explanation_html',''))+safe(q.get('key_note',''))
    r['options']=[dict(id=o['letter'],text=o.get('text','')) for o in q.get('options',[])]
    r['mode']='multi' if q['kind']=='multi' else 'single';r['answers']=q.get('key') or []
    aa=q.get('answer_area')or{}
    if aa:
        if aa['kind']=='image_zones':
            r['mode']='multi';r['options']=[dict(id=c['id'],text=c['label'])for c in aa['controls']];r['answers']=[c['id']for c in aa['controls']if c['correct']]
        else:
            r['mode']='controls'
            if aa.get('code'):r['contextHtml']+=text(aa['code'])
            for c in aa['controls']:
                options=c.get('options') or aa.get('values') or (['Yes','No'] if aa['kind']=='statements' else [])
                r['controls'].append(dict(id=c['id'],label=c.get('label')or c.get('text')or c.get('before')or c['id'],options=options,answer=c.get('correct')))
    for im in q.get('images',[]):r['images'].append(dict(src=assetprefix+im['src'],caption=im.get('caption','Source exhibit')))
    for o in q.get('options',[]):
        if o.get('image'):r['images'].append(dict(src=assetprefix+o['image'],caption=o.get('alt')or 'Option '+o['letter']))
    # Reveal-only assets remain attached, but are never mistaken for question exhibits.
    r['revealImages']=[dict(src=assetprefix+im['src'],caption=im.get('caption','Source answer exhibit'))for im in q.get('reveal_images',[])]
    r['caseLabel']=q.get('case')or ''
    records.append(r)
for filename in ['dp600-litware-interactive.zip','dp600-mixed-interactive.zip','dp600-questions-2026-10-25.json','DP-600___PL-300_Study_Hub.html']:
    p=INPUT/filename;raw=p.read_bytes();target=RAW/filename
    if target.exists() and target.read_bytes()!=raw:raise ValueError('Conflicting intake '+filename)
    target.write_bytes(raw);inputs.append(dict(file=filename,sha256=sha(raw),bytes=len(raw)))
    if p.suffix=='.zip':
        with zipfile.ZipFile(p)as z:
            htmlname=next(n for n in z.namelist()if n.endswith('/index.html'));s=z.read(htmlname).decode('utf-8-sig');qs=json.JSONDecoder().raw_decode(s.split('const QUESTIONS =',1)[1].lstrip())[0]
            key='litware'if 'litware'in filename else 'mixed';assetprefix='/fabric-additions/'+key+'/'
            for n in z.namelist():
                if '/images/'in n and not n.endswith('/'):
                    rel=n.split('/',1)[1];dest=ROOT/'public/fabric-additions'/key/rel
                    assert '..'not in Path(rel).parts
                    dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(n))
            for q in qs:add_html(q,key,'DP-600','new-'+key+'-',assetprefix)
    elif p.suffix=='.html':
        d=json.JSONDecoder().raw_decode(raw.decode('utf-8-sig').split('const DATA =',1)[1].lstrip())[0]
        for group,qs in d.items():
            for i,q in enumerate(qs):
                add_html(q,'study-hub:'+group,'PL-300'if group=='pl300'else'DP-600','new-hub-'+group+'-')
                records[-1]['id']+='-r'+str(i+1)
                records[-1]['sourceRecords'][0]+=':row'+str(i+1)
    else:
        d=json.loads(raw);cases=d['caseStudies'];bycase={c['id']:c for c in cases}
        for q in d['questions']:
            r=base('new-json-'+q['id'].lower(),'json:'+q['id'],'DP-600');r['stemHtml']=text(q['stem']);r['explanationHtml']=text(q['explanation']);r['contextHtml']=text(bycase[q['caseStudy']]['text'])if q.get('caseStudy')else''
            r['options']=[dict(id=o['letter'],text=o.get('text',''))for o in q.get('options',[])];r['answers']=list(q.get('answer')or'');r['mode']='multi'if q['type']=='multi'else'single'
            controls=q.get('blanks')or q.get('statements')or(q.get('drag')or{}).get('targets')or[]
            if controls:
                r['mode']='controls'
                for i,c in enumerate(controls):r['controls'].append(dict(id=str(i),label=c.get('label')or c.get('text')or str(i+1),options=c.get('options')or(q.get('drag')or{}).get('items')or['Yes','No'],answer=c.get('answer')))
            r['refs']=[dict(title=x['t'],url=x['u'])for x in q.get('refs',[])if x['u'].startswith('https://learn.microsoft.com/')]
            r['missingExhibits']=q.get('exhibits',[]);r['missingAnswerImages']=q.get('answerImages',[])
            if r['missingExhibits']:r['blockers'].append('Original question exhibit files not supplied: '+', '.join(r['missingExhibits']))
            records.append(r)
for r in records:
    if r['mode']=='controls':
        for c in r['controls']:
            if not isinstance(c['answer'],str)or c['answer']not in c['options']:r['blockers'].append('Source answer/control options require review: '+c['id'])
    elif not r['answers']or any(a not in [o['id']for o in r['options']]for a in r['answers']):r['blockers'].append('Source answer/options incomplete')
    for im in r['images']+r.get('revealImages',[]):
        if not im['src'].startswith('/fabric-additions/')or not(ROOT/'public'/im['src'].lstrip('/')).is_file():r['blockers'].append('Unavailable source image: '+im['src'])
assert len({r['id']for r in records})==len(records)
# Preserve separate source assertions, including disagreements. Never silently choose an answer.
stems={}
for r in records:
    k=re.sub(r'\W+','',re.sub('<[^>]+>',' ',r['stemHtml'])).lower();stems.setdefault(k,[]).append(r['id'])
duplicates=[v for v in stems.values()if len(v)>1]
save(OUT/'questions.json',records)
save(OUT/'manifest.json',dict(inputs=inputs,sourceRecords=len(records),dp600=sum(r['exam']=='DP-600'for r in records),pl300=sum(r['exam']=='PL-300'for r in records),blocked=sum(bool(r['blockers'])for r in records),matchingStemGroups=duplicates,policy='Source records retained separately. Matching wording does not establish equivalent context or answers. No dump/quiz/extra learner categories. PL-300 kept explicitly adjacent.'))
print(json.dumps(dict(records=len(records),blocked=sum(bool(r['blockers'])for r in records),matchingStemGroups=len(duplicates))))
