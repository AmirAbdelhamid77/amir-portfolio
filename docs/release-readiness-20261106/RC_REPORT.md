# Release report — 6 November 2026

- **Status: promoted default, technically verified, awaiting final owner sign-off
  on D1. Not deployed. Publication still gated.**
- Build profile: **no `HANSA_*` variables.** R3–R6 are the default since D1;
  `HANSA_ATLAS_REVIEW_PREVIEW` and `HANSA_NEIGHBOURHOOD_REVIEW` remain unset.
- Design readiness: **ready** (R3 fan, R4 dealer, R5 closing, R6 polish, now the
  shipped build and re-measured against the M6 baseline).
- Publication readiness: **gated** (0 published concepts, 0 published edges, seed
  is still a proposal).
- Decisions: D1 **technically verified, awaiting owner sign-off**; D2–D5 open
  (`DECISIONS.md`).

Side-by-side artifact: `release-candidate.html` (generated from
`evidence/rc-e2e.json`, `evidence/rc-perf.json` and `build-rc.log`, no
hand-copied numbers).

## 1. What was promoted

The accepted design slices are no longer review switches. `components/knowledge/
hansa-landing.tsx` now reads:

```ts
const timelineFan  = process.env.HANSA_TIMELINE_REVIEW  !== "0";  // R3
const dealerReview = process.env.HANSA_DEALER_REVIEW    !== "0";  // R4
const closingReview = process.env.HANSA_CLOSING_REVIEW  !== "0";  // R5
const polishReview = process.env.HANSA_POLISH_REVIEW    !== "0";  // R6
```

A build with no variables carries all four slices, which is why `out/` and
`out-rc/` are now byte-identical. Only an explicit `"0"` disables a slice, so the
rollback path is a single variable plus a rebuild — the M6 branches and their
tests stay in the tree and remain reachable.

`scripts/build-rc.mjs` was rewritten for the promoted default: it builds **one**
export, prunes `review/`, mirrors `out/` to `out-rc/` byte-for-byte, and asserts
both copies carry the polish/fan/closing markup, no review route, 0 edge ids,
0 unowned concept ids, `publishedConcepts:0` / `publishedEdges:0` and identical
hashes. `--check` re-verifies an existing pair without rebuilding.

| Build | Content | Bytes | SHA-256 |
| --- | --- | --- | --- |
| M6 baseline (before D1) | no slices, pre-promotion | 93,144 | not comparable across builds (build id is per run) |
| `out/` (shipped) | promoted default | 113,129 | `73600bef89ebaa14a4976df61ea45049cc33578d6974ba1e31159a244106dfdd` |
| `out-rc/` (mirror) | byte-identical copy | 113,129 | `73600bef89ebaa14a4976df61ea45049cc33578d6974ba1e31159a244106dfdd` |

Hash of `index.html` only, from the final build in `build-rc.log`. The build id
changes `index.html` bytes between runs, so these values are quoted from that one
run and nowhere else; the 93,144 B baseline is the recorded size of the
pre-promotion export. The export is pruned:

- `review/` is removed, so `/review/neighbourhood/` answers **404** on a static
  host (checked through the request API).
- Neither export contains an `edge:fabric:` id.
- Each export carries exactly one `concept:fabric:` id,
  `concept:fabric:shortcut`, the internal key of an accepted public insight,
  rendered only as a slug label.
- Each export states `"publishedConcepts":0` and `"publishedEdges":0`.

### Acceptance review against the M6 baseline

`docs/release-readiness-20261106/acceptance-review.mjs` captured the
pre-promotion export (`out/` as it was on 4395, 7 PNGs in `evidence/m6-baseline/`,
taken 20:05, four minutes before the promotion build) and diffed its
route/heading/destination inventory against the reviewed candidate export
(`out-rc/`). The promotion rebuild then produced bytes identical to that reviewed
candidate — `--check` asserts `out/` and `out-rc/` have the same hash — so the
diff describes the promoted build, and the baseline captures describe the build
it replaced:

| Check | Result |
| --- | --- |
| Routes in baseline vs promoted | 436 / 436 |
| Routes missing from the promoted export | 0 |
| Routes added | 0 |
| `<h1>` text drift | 0 |
| Routes that lost an internal destination | 0 |
| `__next_error__` shells | 0 |
| Exported `review/` in either build | 0 |

Visual review of the paired captures: same header, kicker and headline identity;
the promoted build adds the fan, the closing idea/action/coverage ledger, keeps
the four destination cards, the author block and the notice; no content was
lost. **No material regression found**, which is what authorised the promotion.

## 2. Gates on the promoted build

| Gate | Command | Result |
| --- | --- | --- |
| Baseline acceptance diff | `node docs/release-readiness-20261106/acceptance-review.mjs` | **PASS — 436/436 routes, 0 drift, 0 lost destinations** |
| Integrated E2E (on `out/`) | `RC_BASE=http://127.0.0.1:4395 node docs/release-readiness-20261106/rc-e2e.mjs` | **PASS — 86 checks, 0 failed, 0 console errors** |
| axe WCAG 2.1 A/AA | inside E2E, 5 viewports | **PASS — 0 violations** |
| Export profile | `node scripts/build-rc.mjs --check` | **PASS — existing exports are the promoted default** |
| Knowledge Atlas verifier | `node scripts/verify-knowledge-atlas.mjs` | **PASS** |
| EasyUI successor verifier | `node scripts/verify-easyui-integration.mjs` | **PASS** |
| Agent-reference verifier | `node scripts/verify-agent-reference.mjs` | **PASS** |
| Unit + integration tests | `npm run test:all` | **PASS — 329 tests, 0 failed** |
| TypeScript | `npx tsc --noEmit` | **PASS — no diagnostics** |
| Atlas seed dry run | `node --experimental-strip-types docs/release-readiness-20261106/atlas-seed-dryrun.mjs` | **PASS — 0 problems, no file written** |

E2E groups (86 checks): overflow 6/6, polish attribute 6/6, fan/strip 10/10 and
6/6, type floor 15/15, 44 px targets 6/6, axe 5/5, routes 6/6, canonical and
review-404 2/2, dealer 5/5, save 2/2, escape/focus return 2/2, closing 1/1,
kept card 1/1, coverage disclosure 2/2, archive 2/2, theme 1/1, accent menu 3/3,
public-payload separation 1/1, reduced motion 2/2, LCP 1/1, CLS 1/1.

Test breakdown: data-viz 62, statistics 18, fabric 35, content 68, knowledge 121,
atlas 25.

Performance sample (headless Edge, local static server, 1280×900, warm cache):
LCP 460 ms, CLS 0 across 1 shift, 46 requests, 849,206 B JS, 204,578 B CSS,
1,259,931 B total, 1,188 DOM nodes. Regression signal only — not field data.

## 3. What changed in this pass

1. **R3–R6 promoted (D1, provisional).** `components/knowledge/hansa-landing.tsx`:
   the four design switches are default-on (`!== "0"`). R1/R2 are untouched and
   still require an explicit `"1"`.
2. **One build instead of two.** `scripts/build-rc.mjs` builds the promoted
   default into `out/`, prunes `review/`, mirrors to `out-rc/` and asserts
   equivalence and publication separation instead of building a second profile.
3. **Source guards updated to the new truth, not weakened.** 
   `tests/knowledge/polish.test.mjs` asserts the `!== "0"` switch; 
   `tests/knowledge/canonical-home.test.mjs` asserts the same for the closing and
   describes the M6 close as the rollback. Both still require the M6 branch to
   exist and to be the fallback.
4. **Acceptance evidence.** `acceptance-review.mjs` added: it crashes the build
   decision if the promoted export loses a baseline route, an `<h1>` or an
   internal destination, or leaks an error shell or the review route.
5. **Pin chain.** Three hops recorded through `scripts/pin-integration.mjs
   --apply` (`hansa-landing.tsx`, `canonical-home.test.mjs`, `polish.test.mjs`);
   no pins rewritten, none loosened.
6. **Evidence regenerated.** 15 promoted-build PNGs, 7 baseline PNGs,
   `evidence/m6-baseline-inventory.json`, `evidence/rc-summary.json`,
   `evidence/rc-e2e.json`, `evidence/rc-perf.json`, `evidence/atlas-seed-dryrun.txt`,
   `release-candidate.html`, `build-rc.log`, `e2e-promoted.log`.

## 4. Limits — what this evidence is not

| Not done | Why it matters |
| --- | --- |
| **Manual screen-reader pass (D3)** | axe and the Chromium AX tree are not assistive-technology testing. NVDA/VoiceOver over Home, fan, dealer and closing is **NOT RUN**. |
| Field performance | One local machine, no throttling, no CDN. LCP/CLS are a regression signal, not a field measurement. |
| Whole-corpus semantic review | 4,228 of 4,337 eligible content units are unread. The seed covers 3 records; the other 39 concepts / 46 edges stay in review. |
| Deployment and DNS | Nothing was deployed, no Cloudflare call was made, and no publication policy changed. |
| Cross-browser | Only Microsoft Edge (Chromium) was driven. Safari/Firefox were not run. |
| Visual diffusion beyond the captures | 15 promoted + 7 baseline screenshots at 1280/390/320 in light and dark; no exhaustive state grid. |

## 5. Decisions

Full text and exact diffs in `DECISIONS.md`.

| ID | Decision | Status | If deferred |
| --- | --- | --- | --- |
| D1 | Promote R3–R6 to the public default | **technically verified — awaiting final owner sign-off** | Rollback is available per slice (`HANSA_*_REVIEW=0` + rebuild); the M6 baseline is preserved |
| D2 | Approve the six-record Atlas seed, signed `Human: <name>` | open — **not approved by this work** | Ships with the honest 0/0 graph and the review counts |
| D3 | Run NVDA/VoiceOver, or waive it explicitly | open — **no waiver issued** | Accessibility evidence stays automated-only and the record says so |
| D4 | Deploy the approved build to Cloudflare | open — **nothing deployed** | Nothing public changes |
| D5 | Publish R1/R2 (review neighbourhood) | open — **stays closed** | Remains a local review surface |

Order: **D1 sign-off → D2 (if approved) → D3 → D4 → D5.** D1 is the only change
that altered the shipped page and it has already been measured; D2 is data, not
design; D5 stays closed until a much larger seed is reviewed.

## 6. Rollback

- **Any design slice:** rebuild with that slice switched off —
  `HANSA_TIMELINE_REVIEW=0`, `HANSA_DEALER_REVIEW=0`, `HANSA_CLOSING_REVIEW=0`
  or `HANSA_POLISH_REVIEW=0` — then `node scripts/build-rc.mjs --check`. Only an
  explicit `"0"` disables a slice; unset means promoted. The M6 branch, its
  markup and its tests are still in the tree, which is why deletion was not used
  for the promotion.
- **Whole promoted default:** unset every variable and rebuild `out/`; it is one
  command and produces the M6 baseline the acceptance run captured in
  `evidence/m6-baseline/`.
- **Seed (only if D2 is approved and later withdrawn):** set the six fields back
  to `technical_review` and restore the prior reviewer string; verify with
  `node scripts/verify-knowledge-atlas.mjs`.
- **Deployment:** record the previous deployment id before D4; a rollback is a
  redeploy of that id.
- **Pin chain:** hops are additive history; nothing was rewritten or loosened.

## 7. Reproduce

```powershell
node scripts/build-rc.mjs                 # build out/, prune review/, mirror to out-rc/
node scripts/build-rc.mjs --check         # re-verify the pair without rebuilding
node scripts/serve-rc.mjs 4395 out        # serve the promoted export
$env:NODE_PATH="$PWD\node_modules"
node docs/release-readiness-20261106/acceptance-review.mjs   # baseline vs promoted
# (re-running it today compares the two identical promoted exports; the M6 diff
#  recorded in evidence/m6-baseline-inventory.json was taken from the
#  pre-promotion build — see section 1)
$env:RC_BASE="http://127.0.0.1:4395"
node docs/release-readiness-20261106/rc-e2e.mjs
node docs/release-readiness-20261106/capture-evidence.mjs
node docs/release-readiness-20261106/make-rc-artifacts.mjs
node scripts/verify-knowledge-atlas.mjs
node scripts/verify-easyui-integration.mjs
node scripts/verify-agent-reference.mjs
npm run test:all
npx tsc --noEmit
```

Evidence files: `build-rc.log`, `e2e-promoted.log`, `e2e.log`, `test-all.log`,
`tsc.log`, `evidence/rc-e2e.json`, `evidence/rc-perf.json`,
`evidence/rc-summary.json`, `evidence/m6-baseline-inventory.json`,
`evidence/atlas-seed-dryrun.txt`, `evidence/m6-baseline/` (7 PNGs) and 15
promoted-build PNG captures.
