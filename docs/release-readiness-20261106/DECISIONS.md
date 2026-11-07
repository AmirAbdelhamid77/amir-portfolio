# Decisions that need the owner

- Date: 2026-11-06
- Context: `FINAL_INTEGRATION_AND_RELEASE_PLAN.md`
- **D1 has been applied** (owner approved provisionally, subject to final
  verification) and is now technically verified, awaiting final sign-off. D2–D5
  are still unapplied proposals; each lists the exact change it authorises, so
  approving one is a single, reviewable step.

---

## D1 — Make the accepted design the public default

**Status: APPLIED 2026-11-06 — technically verified, awaiting final owner
sign-off.** Owner approval was provisional ("subject to final verification");
the verification below is what that condition required.

**Question:** should the four accepted design slices stop being review switches
and become the shipped Home?

**What was done instead of the original plan.** The proposal below said "delete
the four flags' branch points". That was not done, deliberately: deleting them
would have destroyed the rollback path the owner required and made the M6
baseline unreachable. Instead the switches became **default-on with an explicit
`0` rollback**:

```ts
const timelineFan   = process.env.HANSA_TIMELINE_REVIEW  !== "0";
const dealerReview  = process.env.HANSA_DEALER_REVIEW    !== "0";
const closingReview = process.env.HANSA_CLOSING_REVIEW   !== "0";
const polishReview  = process.env.HANSA_POLISH_REVIEW    !== "0";
```

A build with no `HANSA_*` variables carries all four slices. An explicit `"0"`
restores that slice's M6 branch, which stays in the source with its tests. R1/R2
are untouched and still need an explicit `"1"`.

**Mechanism changes that came with it:**

- `components/knowledge/hansa-landing.tsx`: the four `=== "1"` reads became
  `!== "0"`; R1/R2 unchanged.
- `scripts/build-rc.mjs`: builds one promoted default into `out/`, prunes
  `review/`, mirrors byte-for-byte to `out-rc/`, and asserts the polish/fan/
  closing markup, no review route, 0 edge ids, 0 unowned concept ids,
  `publishedConcepts:0` / `publishedEdges:0` and identical hashes.
- `tests/knowledge/polish.test.mjs`, `tests/knowledge/canonical-home.test.mjs`:
  two source guards updated to the new switch (`!== "0"`) and to describe the M6
  close as the rollback. The M6 fallback is still asserted to exist — the guards
  got stricter, not weaker.
- Pins: three hops recorded through `scripts/pin-integration.mjs --apply`.

**Verification after promotion** (full detail in `RC_REPORT.md`):

| Check | Result |
| --- | --- |
| Baseline acceptance diff | 436/436 routes, 0 missing, 0 added, 0 `<h1>` drift, 0 lost links |
| Promoted E2E (on `out/`) | 86 checks, 0 failed, 0 console errors |
| axe / targets / type floor / overflow | 0 violations, 0 undersized targets, 0 overflow |
| Export profile `--check` | PASS, `out/` and `out-rc/` byte-identical |
| Unit + integration tests | 329 pass, 0 fail |
| TypeScript | clean |
| Three verifiers + seed dry run | PASS, nothing published, nothing written |

**Export hash:** `out/` = `out-rc/` = `73600bef89ebaa14a4976df61ea45049cc33578d6974ba1e31159a244106dfdd`
(113,129 B).

**Rollback:** set the relevant `HANSA_*_REVIEW=0` and rebuild; or unset all four
and rebuild to return to the captured M6 baseline. The original M6 baseline is
preserved as evidence in `evidence/m6-baseline/`.

**Still open:** final owner sign-off on D1. The technical evidence is complete;
the acceptance of the promoted page as the public Home remains the owner's call.

**Original proposal (retained for the record):** delete the four flags' branch
points so the accepted design is the only branch, drop the `timelineFan`,
`dealerReview`, `closingReview`, `polishReview` props, remove the `fan?` /
`dealerMode?` / `polish?` optionality, and let `scripts/build-rc.mjs` become
unnecessary. Not adopted, because it removes the rollback path.

**Risk:** this was the only change in the plan that could alter the shipped
page. It was re-measured after promotion: `out/` served on 4395 and
`rc-e2e.mjs` run with `RC_BASE=http://127.0.0.1:4395`.

---

## D2 — Publish the six-record Atlas seed

**Question:** should the public graph show "a reference is not a replica"?

**File:** `ATLAS_SEED_PROPOSAL.md` + `atlas-seed-candidate.json`.
**Exact diff:** 3 concepts and 3 edges move from `technical_review` to
`published`; each edge's reviewer becomes `Human: <your name>`.
**Proof it cannot happen by accident:** the placeholder reviewer fails
`validateDataset`; the dry run asserts that rejection.

**If approved:** I apply the six field changes, set the reviewer string you give
me, run `node scripts/verify-knowledge-atlas.mjs`, `npm run test:atlas`, rebuild,
and confirm the public HTML carries 3 concepts / 3 edges and the Home states
3 published.

**If deferred:** the release ships with 0/0 and the honest "42 concepts and 49
connections are under technical review" line. Nothing is fake; nothing is broken.

**Recommendation:** approve if the three claims read correctly against the two
Microsoft Learn pages. It is six records; a re-review is minutes.

**Not included:** `concept:fabric:delta`, the DP-600 extension/continuation
layers, and anything whose only review is an agent note.

---

## D3 — Manual screen-reader pass

**Question:** run NVDA (Windows) or VoiceOver over the Home, fan, dealer and
closing — or ship with automated evidence only?

**What exists:** axe-core WCAG 2.1 A/AA at five viewports (0 violations), focus
trap and focus return tested, `aria-*` state asserted, reduced-motion run,
keyboard-only fan navigation and Escape paths.

**What does not exist:** a real assistive-technology session. Chromium's
accessibility tree is not an AT test, and the report will say so either way.

**If approved:** 20 minutes with NVDA, notes recorded in
`ACCEPTANCE/manual-at-2026-11-06.md`.

**If waived:** the release record names the gap explicitly; no accessibility
claim is overstated.

**Recommendation:** run it once. It is the only gate automated evidence cannot
cover, and it is cheap now — expensive after a public complaint.

---

## D4 — Deploy

**Question:** publish the candidate to Cloudflare Pages/Workers, or hold?

**Today:** nothing is deployed by this work; no Cloudflare call is made. The
repository already carries `.github/workflows/deploy-cloudflare.yml`,
`wrangler.jsonc` and `public/_headers`; the production target referenced by the
canonical link is `hansa.amir-portfolio.workers.dev`.

**If approved:** build `out/` from the approved commit, run the smoke list
(routes, 404, `_headers`, canonical, sitemap, no `review/`), record the rollback
(previous deployment id), then deploy.

**If held:** the RC stays local; nothing public changes.

**Recommendation:** hold until D1 is applied, so the deployed build is the
accepted design rather than the M6 baseline. Order matters: D1, then D2 if
approved, then D4.

---

## D5 — R1/R2 publication

**Question:** should the review neighbourhood (R1 route, R2 block) ever become
public?

**Today:** both are design-complete, both read candidate Atlas records, both stay
off. The export prunes `/review/`, so a static host answers 404.

**If approved later:** R2 needs a published projection with actual edges to draw;
R1 needs a published seed large enough to be worth a page. Neither is a design
task — both are publication tasks, sequenced after D2 and a much larger review.

**Recommendation:** keep off. R1/R2 are the strongest argument for doing D2
properly, not for publishing candidate records.

---

## Order of operations

1. **D1** — ~~accepted design becomes the default~~ **applied and technically
   verified; awaiting final owner sign-off.**
2. **D2** — seed publication, if you approve the claims. **Not approved here.**
3. **D3** — manual AT pass, or explicit waiver. **Not run, not waived.**
4. **D4** — deploy the approved build. **Nothing deployed.**
5. **D5** — remains closed until a larger reviewed seed exists.

Each step is independently reversible: a design slice can be switched off with
`HANSA_*_REVIEW=0`, the six Atlas fields can be set back to `technical_review`,
and a deployment can be rolled back to the recorded previous id.
