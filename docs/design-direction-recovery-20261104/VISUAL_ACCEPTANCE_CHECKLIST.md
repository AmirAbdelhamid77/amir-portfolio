# Visual acceptance checklist

Used at every V3 review (R1-R6). A checklist row is scored 1-4. Passing tests never
replace this review, and this review never replaces the tests. Evidence is a
screenshot or a live URL for each row, at both viewports and both themes unless the
row says otherwise.

## How to run a review

1. Start the review surface:
   `$env:HANSA_ATLAS_REVIEW_PREVIEW="1"; npm run dev -- -p 4391` and open
   `http://localhost:4391/review/neighbourhood/`. Use `localhost`, not
   `127.0.0.1`: Next dev blocks its client chunks for another origin, so the page
   renders but never hydrates (inputs type, buttons do nothing).
2. Capture with `node docs/design-direction-recovery-20261104/r1-capture.mjs`
   (writes `evidence/r1-*.png`).
3. Compare against `compare.html` and the frozen prototype.
4. Score below; record the result in `ACCEPTANCE/R<n>-<date>.md` from
   `ACCEPTANCE/TEMPLATE.md`.

## A. Composition and hierarchy (score 1-4)

- [ ] One clear first read above the fold: serif headline, one supporting line, search.
- [ ] The centre concept is unmistakably the centre; branches read as satellites, not
      as a card grid.
- [ ] Title levels do not repeat (scene title != concept title != panel title).
- [ ] The field's height follows its content; no large dead region at 1280 or 390.
- [ ] Kickers and counts are metadata; they do not compete with the serif display.

## B. Visual identity (1-4)

- [ ] Serif display + italic second line; sans body; mono only for labels and counts.
- [ ] Warm paper in light, deep ink in dark; the same tokens as the site.
- [ ] Domain colour is an accent (centre ring, branch tag, edge), not a wash.
- [ ] Domain colours survive in both themes at AA contrast for text.
- [ ] No equal-rounded-card grid, no repeated mono kicker on every block.
- [ ] Depth comes from layered surfaces and one accent, not from glow or shadows
      everywhere.

## C. Reading density and content fidelity (1-4)

- [ ] Every label, claim, condition and count comes from `content/atlas` or the
      reviewed insight feed; nothing invented.
- [ ] Candidate state is stated where the data is shown (`technical review`,
      `0 published`), not buried.
- [ ] The definition is complete enough to decide whether to explore.
- [ ] Evidence (source titles/links) is reachable for the concept and for a branch.
- [ ] Aliases are shown where they help search, not as decoration.

## D. Interaction parity with the prototype (1-4)

- [ ] Entrances exist and rank starters by real degree/read state.
- [ ] Search covers title, aliases and definition; `/` focuses it; Enter opens the
      first result; Escape clears and returns.
- [ ] Centre card + four labelled groups (Requires first / Unlocks / Contrasts /
      Related), with direction labels that match stored direction.
- [ ] Curved connectors per group, in the group colour.
- [ ] Hover and focus preview a branch (claim + conditions + two actions).
- [ ] `Explore connections` moves the neighbourhood; `Open content` opens real reading.
- [ ] Hidden-connection count is visible and expand/collapse works.
- [ ] Same-subject membership is shown and is clearly not a semantic relation.
- [ ] Text/table fallback is reachable at all times and lists the full neighbourhood.

## E. Continuity (1-4)

- [ ] Concept -> evidence -> lesson/practice/resource destinations resolve.
- [ ] The review surface links to the Atlas desk and back without losing the concept.
- [ ] The concept can be reached from the latest edition's concept id (R2 full
      wiring; R1 at least by URL).

## F. Truth and publication posture (must be 4)

- [ ] The review surface is gated (`HANSA_ATLAS_REVIEW_PREVIEW=1`) and `noindex`.
- [ ] Public build emits no candidate concept, claim or edge from this route.
- [ ] Nothing on the page implies the graph is published.
- [ ] `0 published` is stated where counts appear.
- [ ] No save/pocket/route control that does not work yet.

## G. Responsive and input parity (1-4)

- [ ] 390 px: the field becomes a labelled list; no horizontal scroll.
- [ ] 320 px: no clipped labels or overlapping nodes.
- [ ] Touch: tap selects a branch, a second tap opens it; no hover-only content.
- [ ] Keyboard: Tab reaches search, each branch, expand, fallback and panel; visible
      focus ring; arrow keys move between branches inside a group.
- [ ] No pointer-trap; Escape unwinds search -> preview -> list.

## H. Accessibility and motion (1-4)

- [ ] Landmarks and headings are ordered; the centre card is a heading, not a div.
- [ ] Branch buttons have accessible names that include group and direction.
- [ ] The preview strip is announced when the focused branch changes.
- [ ] `prefers-reduced-motion`: no deal, no layout animation, no parallax.
- [ ] With JS off, the concept definition, branch table and evidence are readable.

## I. Performance (1-4)

- [ ] No new runtime dependency.
- [ ] Route JS within the R0 budget; no long task over 200 ms from the field.
- [ ] CLS 0 at 1280 and 390; field height reserved before hydration.
- [ ] 42 concepts / 49 edges render without measurable jank.

## J. Engineering integrity (1-4)

- [ ] `npm run test:all` passes; new model tests cover grouping, direction, limits,
      hidden counts, membership, search and layout separation.
- [ ] `noindex` and gate verified in the built output.
- [ ] M6 pinned files untouched (or a successor receipt exists).
- [ ] Rollback is a route/flag switch; no deletion of the current Home in R1.

## Verdict

- Minimum to pass: 3+ on A-E, 4 on F, 3+ on G-J.
- A 2 on B (identity) or D (interaction parity) fails the review outright.
- Record open caveats honestly; "not run" is a valid entry, silence is not.
