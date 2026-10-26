# VisualizationSpec and selection record — HSE rate basis

Per `HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md` §5 (spec) and §4 (weighted
rubric). Decision recorded before implementation, not reconstructed after.

## Spec

```json
{
  "id": "hse-rate-basis",
  "sourcePage": "/work/hse-analytics/ (SRC-HSE-DASHBOARD, SRC-HSE-COPY)",
  "learningGoal": "Explain why TRIR (per 200,000 hours) and LTIFR (per 1,000,000 hours) cannot be compared until both use one base, and compute the conversion from counts.",
  "audience": "intermediate",
  "dataProvenance": "synthetic",
  "dataShape": "counts -> normalised rate; two denominators",
  "units": "cases per 200,000 hours; cases per 1,000,000 hours; hours worked",
  "selectedForm": "simulation",
  "visualType": "calculator + exact-value comparison table (no chart)",
  "library": "native",
  "reason": "The objective is the mechanism of a base change. A reader can only test a mechanism by moving the numbers; a chart would invite comparing bar lengths whose denominators differ, which is the exact error the page exists to prevent.",
  "interaction": [
    "recordable cases",
    "lost-time injuries",
    "hours worked",
    "reading base (200,000 / 1,000,000)",
    "reset"
  ],
  "misconceptionsAddressed": [
    "TRIR and LTIFR can be compared as printed",
    "a lower printed number always means a safer site",
    "the two rates share an hour denominator by convention"
  ],
  "mobileStrategy": "single column below sm; full-width number inputs; table in its own horizontal scroll container",
  "accessibilityFallback": "captioned table with scoped headers holding both bases, plus an always-visible interpretation sentence and a text-only error list",
  "validation": [
    "exact arithmetic in tests/content/hse-rates.test.mjs",
    "rates scale inversely with hours",
    "lost-time count cannot exceed recordables",
    "reset restores the fixture",
    "axe light+dark at 320/390/1280"
  ]
}
```

## Options compared (weighted rubric: 30/25/15/15/10/5)

| Option | Correctness 30 | Teaching 25 | Interaction 15 | Perf/mobile 15 | A11y 10 | Maintenance 5 | Weighted |
|---|---:|---:|---:|---:|---:|---:|---:|
| **A. No visual**: two formulas, a definitions table and the corrected copy | 5 | 3 | 1 | 5 | 4 | 5 | **76** |
| **B. Bar chart**: TRIR vs LTIFR, toggle the base | 2 | 3 | 3 | 3 | 2 | 3 | **52** |
| **C. Calculator + exact-value table** (chosen) | 5 | 4 | 4 | 4 | 4 | 4 | **86** |

**A** is safe and cheap, but the misconception is dynamic: readers need to see that
the counts are unchanged while the printed rate moves. Static text cannot show that
without asking the reader to trust a worked example.

**B** scores worst on correctness because the two bars would necessarily be drawn on
different denominators — the comparison the chart invites is the mistake being
taught. It also adds a chart library or a hand-rolled SVG for no semantic gain.

**C** wins and keeps A as its static fallback: the table inside the component *is*
the no-interaction path, so the fallback is exercised on every render rather than
being a separate artifact nobody tests. Hard disqualifiers: none (no invented data,
no incompatible deployment, essential information available without interaction,
no dependency).

## Verification record

- Arithmetic: `tests/content/hse-rates.test.mjs` — 9 tests, including the exact
  0.19 / 0.28 reproduction, the reversible conversion, inverse scaling and the
  subset rule.
- Interaction: `scripts/qa-hse-explainer.mjs` — 7/7 checks (defaults, halving,
  invalid input, reset, base re-labelling, no page errors).
- Accessibility: axe-core 0 violations on `/work/hse-analytics/` at 320/390/1280 in
  both themes; every derived value is in the table; the error is `role="alert"` text.
- Screenshot: `docs/upgrade/qa/hse-rate-basis-1280.png`.
- Bundle cost: no package added. The component is a client component of roughly
  6 KB source; the route previously shipped no interactive code below the gallery.
