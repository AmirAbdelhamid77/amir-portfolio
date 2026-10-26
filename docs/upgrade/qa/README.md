# Browser QA artifacts

`report.json` is the evidence: for every route × viewport × theme it records the
HTTP status, page title, `<h1>` count, `lang`/`dir`, horizontal-overflow
measurement and the offending elements, axe-core violations with their targets and
colour pairs, console errors, failed requests, and (at 320 px on the home page) the
mobile-menu open/close/focus-return result.

Regenerate it with:

```bash
npm run build
npm run qa:browser        # light
npm run qa:browser:dark   # dark
npm run qa:search         # /search/ interactions
npm run qa:hse            # rate-basis explainer interactions
```

Only a small sample of screenshots is committed (home at 320/1280 and dark,
both catalogues, search, the DP-600 hub and the rate-basis explainer). Running the
QA script writes the full set again — several megabytes — so pruning before a commit
is expected, not a sign that a run was skipped.
