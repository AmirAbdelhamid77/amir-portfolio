# Hansa Knowledge Atlas — Quality Gates and Test Matrix

**Release policy:** A build can be technically correct but scientifically unfit for publication. Check both. The list is an agent checklist and review guide, not a statement that tests have already passed.

## Gate 0 — Verified working state (must pass before edits)

- [ ] Real repository access demonstrated with root path and status (`git status`); current branch, clean/dirty state and tracked/untracked files recorded without overwriting.
- [ ] `AGENTS.md` at applicable scope(s), existing handoffs, site architecture and user-specific design guidance read.
- [ ] Actual Next.js/runtime version, export mode, lockfile, dependency library and beUI compatibility checked; avoid assumptions based on earlier conversations.
- [ ] Current live routes, key existing user journeys and local build baseline recorded. Never disclose secrets.
- [ ] DP-600 Guide original files identified and source inventory created; screenshot is inspiration only.
- [ ] Existing question/progress/state IDs snapshotted so regressions can be detected.

## Gate 1 — Scientific integrity & data contracts

- [ ] Every published node stable, unique and definition/support clearly attributed.
- [ ] Every visible edge type belongs to controlled *semantic* taxonomy and has endpoints, scoped claim, rationale, citations/anchors and approved review state.
- [ ] Structural `contains/chapter_of/belongs_to` relationships prohibited from graph export, even if present in catalog.
- [ ] Directed vs symmetric edges correct; inverse labels and traversal correct.
- [ ] No semantic links generated from keyword co-occurrence alone or unverified LLM suggestions.
- [ ] Original guide coverage matrix reconciles extracted sections/pages against actual edition.
- [ ] Book TOC and source-order preserved in catalog independent of graph.
- [ ] Exam objective mappings verified with current official exam guide; source-specific update date recorded.
- [ ] Existing bank question IDs and QA status unaffected by graph integration.
- [ ] Known source conflicts, stale statements and unverified relations withheld or clearly labeled outside public graph.
- [ ] Source/copyright/license constraints respected.

## Gate 2 — UX and functional state

- [ ] Reading content accessible without opening Atlas; Atlas entry is optional.
- [ ] Peek opens fast, closes without disturbing reader and links to same contextual focus.
- [ ] Search resolves exact title, aliases, safe empty state and actual selected node.
- [ ] Selecting a node opens correct Inspector and no unexpected route.
- [ ] Clicking an edge opens *that edge's* conditions, explanation and citation; not a generic definition.
- [ ] Focus 1-hop vs 2-hop correct for directed and symmetric edges with rendering caps.
- [ ] Filter vs Showcase visual semantics and reset are obvious; changed counts/empty states readable.
- [ ] Book lens scopes by source concept mapping but never draws hierarchy edges.
- [ ] Content destination links exist, and unavailable content is not disguised as published.
- [ ] Back/Forward, deep links, invalid URL state, return from lesson/question and Reset work; learning progress isn't reset.
- [ ] Mobile list, map option, bottom sheet and standard site menu don't conflict.
- [ ] Empty graph/data loading/offline error handling provides useful next step.

## Gate 3 — A11y WCAG 2.2 AA

- [ ] Keyboard users can find concept, inspect relationship/source and navigate to learning without drag/hover.
- [ ] Screen readers receive textual relation list and meaningful role/label/direction.
- [ ] Focus visible and restored appropriately after overlay; skip links and headings logical.
- [ ] Escape/Back controls work and do not trap focus.
- [ ] Contrast/semantic statuses not color-only; clickable targets and spacing meet standards.
- [ ] Graph is optional on mobile and 200–400% zoom; linear representation complete.
- [ ] No path-based gesture or dragging needed for any essential action; alternative buttons exist.
- [ ] Reduced-motion preference prevents nonessential movement, transitions don't block controls.
- [ ] Accessibility review includes automated checks AND manual NVDA/VoiceOver, keyboard, touch and zoom scenarios.

## Gate 4 — Engineering, licensing, security, performance

- [ ] Schema parser and deterministic graph exporter unit-tested; no candidate/draft edge leaks into public asset.
- [ ] No escaping/HTML injection from imported books/question text.
- [ ] No credentials, user-specific learning data or private guide full text leaked in static asset.
- [ ] beUI/React Flow/graph library source versions and licenses verified, only necessary modules imported; no proprietary Pro examples copied.
- [ ] Clean build, lint/typecheck and hydration tests; route/deep-link smoke test on static export.
- [ ] Bundle delta and responsiveness measured on mobile/desktop; graph engine lazy-loaded from Peek pages.
- [ ] Graph stress tests with few, hundreds and thousands of records; selection remains responsive within defined acceptance budgets.
- [ ] Errors and missing content yield graceful, accessible fallback.
- [ ] Existing site navigation, portfolio, learning pages, bank, progress and link inventory pass regression checks.

## Gate 5 — Controlled release

- [ ] Exact changes and published scope documented with counts from files/test outputs.
- [ ] Link audit verifies source pages, lesson and question deep links.
- [ ] Screenshots or short screen recordings show desktop, mobile, light/dark (as applicable), reduced motion and inspector interactions.
- [ ] Known limitations and unreviewed edge queue disclosed; no false scientific-completeness claims.
- [ ] Production deploy explicitly authorized and rollback/source revision known.
- [ ] Post-release checks include home, guide page, Atlas route, representative concept direct link, keyboard/mobile navigation and asset/network errors.

## Recommended automated tests / illustrative specs

```text
schema rejects: duplicate concept IDs, orphan edges, forbidden structural relation
exporter includes: only published and approved semantic relations
exporter excludes: all candidate, rejected, withdrawn, `contains`, `chapter_of`
relationship inspector: has title/type/direction/rationale/evidence anchors
book TOC selection: changes concept scope; never creates synthetic semantic links
focus: one-hop / two-hop yields correct directional neighborhood
URL: encoded selection restores after reload; unknown ID returns useful fallback
progress: before/after ID snapshot matches; no inadvertent storage clear
content growth: importing another guide does not duplicate canonical concept
accessibility: keyboard to concept to connection to source; no drag required
mobile: list-driven concept navigation remains fully functional
```

## Suggested user acceptance scripts

**UAT-01 — Discover:** Start from guide hub; open Atlas; locate "Direct Lake" using search; select it; say in plain language what a displayed relation means and inspect its cited evidence.

**UAT-02 — Reading ↔ Atlas:** Open an existing lesson; interact with Peek; open full Explorer; go to lesson link; return without losing selected node/filters.

**UAT-03 — Ambiguous content:** Open a concept with no reviewed link or no live practice; interface must say mapping pending/unavailable rather than invent paths.

**UAT-04 — Book hierarchy vs semantics:** Select chapter in TOC. Page location and chapter order remain available; graph edges are knowledge links only.

**UAT-05 — Accessibility:** With keyboard only and then screen reader, locate a concept, inspect edge rationale, navigate to source and return. Repeat at 400% zoom and under reduced motion.

**UAT-06 — Scale:** Add a new book fixture with concept overlap; test canonical reuse, crosswalk and scoped graph filtering without modifying existing renderer.

## Evidence & report template

```
Gate: [0..5] | Status: PASS / FAIL / NOT RUN / BLOCKED
Test ID & expected result:
Actual observed result:
Command / browser / viewport / source version:
Evidence path or artifact:
Known limitations / owner / remediation:
```

Never mark PASS without observed output. If any non-negotiable gate fails, do not claim the release is ready.
