"""Recover the exact older verifier JSON after its fixed-output runner refreshes it.
The old SHA-256 is the acceptance oracle; no historical expectation is changed.
"""
import pathlib,json,hashlib,re,datetime
r=pathlib.Path(__file__).resolve().parents[1];d=r/'docs/final-review-20261028';rel='docs/canonical-home/evidence/verify-canonical-home.json';p=r/rel
expected=json.loads((d/'BASELINE.json').read_text())['files'][rel]
if hashlib.sha256(p.read_bytes()).hexdigest()==expected:print('Original generated report already intact');raise SystemExit()
current=p.read_bytes();(d/'checks/canonical-static-current.json').write_bytes(current)
old_command=json.loads((r/'docs/cinematic-phase2/checks/canonical-integrity.json').read_text())['command']
old_port=old_command[old_command.index('--port')+1]
now_port=json.loads(current)['command'].rsplit(' ',1)[-1]
recovered=current.replace(now_port.encode(),old_port.encode())
match=re.search(rb'"generatedAt": "([^"]+)"',recovered);prefix=recovered[:match.start(1)];suffix=recovered[match.end(1):]
end=round((r/'docs/cinematic-phase2/checks/canonical-integrity.log').stat().st_mtime*1000)
for t in range(end+5000,end-300000,-1):
    timestamp=datetime.datetime.fromtimestamp(t/1000,datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z').encode()
    candidate=prefix+timestamp+suffix
    if hashlib.sha256(candidate).hexdigest()==expected:
        backup=d/'before'/(rel+'.snapshot');backup.parent.mkdir(parents=True,exist_ok=True);backup.write_bytes(candidate);p.write_bytes(candidate)
        (d/'GENERATED_EVIDENCE_RECOVERY.json').write_text(json.dumps({'path':rel,'originalSha256':expected,'method':'Exact prior generatedAt and recorded port recovered against sealed preflight SHA-256; all other original bytes match','originalBytesRestored':True,'currentRunSaved':'checks/canonical-static-current.json'},indent=2))
        print('PASS exact original report restored:',timestamp.decode());break
else:raise SystemExit('No exact match; leave evidence explicit rather than waive preservation')
