# Acceptance record - R<n> <name>

Copy this file to `ACCEPTANCE/R<n>-<YYYY-MM-DD>.md`. One record per slice. The owner
signs V3 and V5; the agent fills everything else with evidence.

- Date:
- Slice / route:
- Commit:
- Review URL:
- Flag state:
- Build id:

## What was presented

- Intent (one paragraph):
- Prototype reference (file/section + screenshot):
- Live surfaces:
- Captures:
  - 1280 light:
  - 1280 dark:
  - 390 light:
  - 390 dark:
  - reduced motion:
- Interaction script run (list the moves and the result):
- JS-off check:

## What changed

- Added:
- Changed:
- Removed (must be explicit; "none" is a valid entry):
- Preserved (architecture, publication gates, interactions, tests, receipts):

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Unit tests | PASS / FAIL / NOT RUN | |
| Browser/a11y (axe, keyboard) | | |
| Leak check (`out/`) | | |
| Pin/receipt integrity | | |
| Performance vs R0 | | |
| Visual checklist | | |

## Rubric (1-4)

| # | Dimension | Score | Justification |
| --- | --- | --- | --- |
| 1 | Composition and hierarchy | | |
| 2 | Visual identity | | |
| 3 | Reading density and fidelity | | |
| 4 | Interaction parity | | |
| 5 | Continuity | | |
| 6 | Truth and publication posture | | |
| 7 | Responsive and input parity | | |
| 8 | Accessibility and motion | | |
| 9 | Performance | | |
| 10 | Engineering integrity | | |

Pass threshold: 3+ on 1-5, 4 on 6, 3+ on 7-10. A 2 on identity or interaction parity
fails the slice.

## Owner decision

- Decision: pending | approved | changes requested
- Requested changes (numbered, each with the evidence row):
- Conditions for the next slice:
- Flag default decision (keep off / promote later):

## Open caveats

- Source coverage limits:
- Browser/AT not exercised:
- Known prototype defects still present:
- Next atomic task:
