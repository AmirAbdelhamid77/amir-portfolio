#!/usr/bin/env python3
"""Score reviewed human entries. A high numeric score is not runtime verification."""
import argparse, json, sys
from pathlib import Path
WEIGHTS = {
    'data_integrity':16, 'originality':14, 'spatial_craft':12, 'interaction':12,
    'semantic_motion':10, 'accessibility':12, 'responsive':8, 'performance':8,
    'usefulness':5, 'maintainability':3
}

def main():
    p=argparse.ArgumentParser(description='Hansa spatial experience review scorer')
    p.add_argument('record',type=Path)
    args=p.parse_args()
    obj=json.loads(args.record.read_text(encoding='utf-8'))
    provided=obj.get('scores',{})
    missing=[k for k in WEIGHTS if k not in provided]
    if missing:raise SystemExit('Missing scores: '+', '.join(missing))
    for k in WEIGHTS:
        v=provided[k]
        if type(v) not in (int,float) or not 0<=v<=5:
            raise SystemExit(f'Invalid {k} score; use 0..5')
    score=round(sum(provided[k]*w/5 for k,w in WEIGHTS.items()),1)
    blocks=obj.get('hard_blockers',[])
    if not isinstance(blocks,list):raise SystemExit('hard_blockers must be an array')
    missing_evidence=[]
    # No fabricated QA approvals: numeric self-ratings without actual inspection
    # may rank ideas, but cannot mark a design review-ready.
    if not obj.get('selected_id') or not obj.get('selection_rationale'):
        missing_evidence.append('selected direction and rationale')
    if not obj.get('canonical_sources'):
        missing_evidence.append('source inventory (or explicit synthetic-demo source entry)')
    if not obj.get('test_evidence'):
        missing_evidence.append('actual test evidence (PASS/FAIL/NOT RUN records)')
    if blocks: verdict='NO_GO_HARD_BLOCKER'
    elif missing_evidence: verdict='EVIDENCE_PENDING'
    elif score>=85: verdict='REVIEW_READY_NOT_APPROVED'
    else: verdict='REWORK_REQUIRED'
    print(json.dumps({
        'score_100':score,'verdict':verdict,'hard_blockers':blocks,
        'missing_evidence':missing_evidence,
        'warning':'Review scores are human judgment; this script does NOT run visual, browser, accessibility, or scientific tests.'
    },indent=2,ensure_ascii=False))
    return 2 if blocks else 0
if __name__=='__main__':sys.exit(main())
