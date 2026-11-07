# Final integration and release plan - Hansa

- Date: 2026-11-06
- Scope: integrate the accepted R1-R6 slices, verify the combined Home end to
  end, close the known technical debt, separate design readiness from publication
  readiness, and prepare a release candidate for owner approval.
- Explicit non-goals: no deployment, no publication-policy change, no publishing
  of candidate knowledge, no declaration of completion without owner approval.

Status legend: **DONE** (verified in this repository), **IN PROGRESS** (safe work
being executed now), **OWNER** (needs an owner decision), **BLOCKED** (external
access or evidence missing).

**State on 2026-11-06, after the D1 promotion:** W1–W7 and T1–T12, T17 are DONE
and evidenced in `RC_REPORT.md` (436/436 baseline routes retained, 86/86 E2E
checks on the promoted `out/`, three verifiers PASS, 329 tests PASS, `tsc` clean).
D1 is applied and **technically verified, awaiting final owner sign-off**. W8 and
T13–T16, T18 are owner decisions, listed in `DECISIONS.md` as D2–D5. Nothing was
deployed and no publication flag changed.

## 1. What "integrated" means

One Home build that contains every accepted design surface at once:

| Slice | Surface | In the integrated Home | Why |
| --- | --- | --- | --- |
| M6 | three scenes, public stage | yes | accepted baseline |
| R3 | desktop timeline fan (≥1024 px), strip below | yes | accepted design |
| R4 | cinematic modal dealer | yes | accepted design |
| R5 | closing with idea, action, kept cards, coverage ledger | yes | accepted design |
| R6 | nine-role type scale, label discipline, 44 px targets, scene rhythm | yes | accepted design |
| R1 | review neighbourhood route | **no** | reads candidate Atlas records; publication-gated |
| R2 | neighbourhood block in the Home | **no** | reads candidate Atlas records; publication-gated |

R1 and R2 are *design-complete* but *publication-blocked*. They render candidate
concepts and candidate relations, which the release must never expose. Their
components and tests stay in the repository; the flags stay off in every public
build. When an approved Atlas seed exists, R2 can be switched on for the public
projection without new design work - that is a publication decision, not a design
one.

The integrated build is therefore composed as:

```
# no HANSA_* variables: R3-R6 are the default since D1 (2026-11-06)
# HANSA_ATLAS_REVIEW_PREVIEW and HANSA_NEIGHBOURHOOD_REVIEW stay unset
```

`scripts/build-rc.mjs` builds this one profile into `out/`, prunes the local
`review/` route, mirrors the result byte-for-byte to `out-rc/` and prints the
hashes. Any slice can be rolled back with `HANSA_*_REVIEW=0` plus a rebuild; the
M6 branches stay in the source as that rollback path.

## 2. Workstreams and status

| # | Workstream | Owner | Acceptance | Status |
| --- | --- | --- | --- | --- |
| W1 | Integration profile and reproducible RC build | me | one command builds the promoted `out/`, mirrors `out-rc/`, prints profile + hashes | DONE |
| W2 | End-to-end verification of the combined Home | me | 5 viewports × 2 themes, interactions, keyboard, reduced/full motion, routes | DONE |
| W3 | Technical debt: Atlas verifier, bundle cost, regressions | me | verifier PASS, no review code/data in public chunks, no regression | DONE |
| W4 | Design vs publication separation | me | public HTML has 0 candidate ids/edges; review surfaces unreachable | DONE |
| W5 | Atlas seed proposal | me → **you** | minimal seed with evidence, exact diff, validations run, **not applied** | DONE |
| W6 | Release candidate artifacts | me | side-by-side vs prototype, blockers, evidence, commands | DONE |
| W7 | Promotion of accepted design to public default | me | D1 applied as default-on with an explicit-`0` rollback; promoted build re-measured | **DONE — pending owner sign-off** |
| W8 | Deployment (Cloudflare/Pages) | **you** | D4 approval + credentials | BLOCKED |

## 3. Task-level completion plan

| Task | Depends on | Acceptance criterion | Who |
| --- | --- | --- | --- |
| T1 add `scripts/build-rc.mjs` | - | RC build reproducible from a clean tree | me |
| T2 allow `serve-out.mjs <port> <dir>` | T1 | `out-rc/` served unchanged; default `out/` unaffected | me |
| T3 fix Atlas verifier false positive | - | `verify-knowledge-atlas.mjs` PASS with EGM docs intact | me |
| T4 build promoted default + mirror | T1 | `out/` carries R3-R6 by default; `out-rc/` is a byte-identical mirror | me |
| T5 E2E: navigation and routes | T4 | every primary route 200, no console error, back/forward intact | me |
| T6 E2E: interactions | T4 | fan select, stepper, dealer open/read/save/close, close reopen, saved card, archive, coverage disclosure | me |
| T7 E2E: responsive + themes | T4 | 1280/1024/768/390/320, dark/light, 0 overflow, 0 axe | me |
| T8 E2E: motion | T4 | reduced motion 0 animations; full motion animates only explained changes; no CLS | me |
| T9 E2E: performance | T4 | LCP/CLS/bytes table; dealer chunk lazy; compare to R5/R6 | me |
| T10 bundle audit | T4 | no `concept:` ids or review components in public/RC HTML; dead review JS quantified | me |
| T11 publish-safety audit | T4 | 0 published concepts/edges in `out/`; review route 404; `noindex` | me |
| T12 seed proposal | W5 | 3 concepts / 3 edges with evidence + exact patch, validation dry-run | me |
| T13 seed approval | T12 | signed review of each claim and source | **you** |
| T14 publish seed | T13 | only after approval: states → published with `Human:` reviewer, tests, public HTML shows it | me |
| T15 manual AT pass | T4 | NVDA or VoiceOver walk of Home, fan, dealer, close | **you / waived** |
| T16 RC review | T5-T12 | side-by-side accepted, blockers list accepted | **you** |
| T17 promote design default | D1 | R3-R6 are the default build, rollback is `HANSA_*_REVIEW=0`, public build re-measured, pins updated | me — **DONE, pending sign-off** |
| T18 deploy | D4 | production URL smoke test, rollback recorded | **you + me** |

## 4. Definition of DONE (release)

A release is DONE only when all of the following are true and evidenced:

1. **One Home.** A single integrated build renders the three scenes with the fan
   (≥1024 px) or strip, the modal dealer, the closing and the polish layer, and
   the shipped export has no competing implementation.
2. **Interactions.** Fan selection and steppers, edition open, card read, save,
   saved-card reopen, close reopen, archive search/open, coverage disclosure and
   Escape focus return all pass a scripted browser run.
3. **Responsive and themes.** 0 horizontal overflow and 0 axe violations at
   1280/1024/768/390/320 in both themes; no stage target under 44 px; prose never
   below 11 px and no text below 9 px.
4. **Motion.** Reduced motion has 0 animations and 0 transitions; full motion
   only animates the dealer and disclosure state changes; CLS 0.
5. **Performance.** The integrated Home meets the stated local budget
   (LCP ≤ 1,200 ms at 1280, CLS 0, no console errors), and every byte above the
   M6 baseline is attributable to a rendered feature, not dead review code.
6. **Publication separation.** The public build contains no candidate concept,
   candidate edge, review route or review-only component markup; `0 published`
   until a seed is approved. A failing check blocks the build.
7. **Atlas integrity.** `verify-knowledge-atlas.mjs`, `verify-agent-reference.mjs`
   and the full unit suite pass. The only permitted NOT RUN item is the manual
   AT pass, and it must be named in the release record.
8. **Content.** Either (a) an owner-approved seed is published through the
   existing human-review gate, or (b) the release ships with 0 published and the
   Home states that honestly. No third option.
9. **Release candidate.** Side-by-side against the original prototype, blocker
   list, reproducible commands, RC hash and rollback path are recorded.
10. **Approval.** The owner signs off D1 and separately approves deployment.
    Nothing is deployed by this plan.

## 5. Decisions that need the owner

| ID | Decision | Options | Recommendation | Impact if deferred |
| --- | --- | --- | --- | --- |
| D1 | Public default for R3-R6 | (a) promote all four to the default; (b) keep them review-only | **(a) applied** — default-on with `HANSA_*_REVIEW=0` as the rollback; technically verified, awaiting final owner sign-off | already the shipped `out/`; sign-off confirms it stays |
| D2 | Atlas seed | (a) approve the 3-concept / 3-edge seed; (b) defer | **(a)** if the evidence reads correctly; otherwise (b) ships with 0 published | R1/R2 stay review-only; the Atlas keeps an honest empty state |
| D3 | Manual screen-reader pass | (a) run NVDA/VoiceOver; (b) explicitly waive | **(a)** for release confidence | accessibility claim stays limited to automated evidence |
| D4 | Deployment | (a) deploy to Pages/Workers; (b) hold | owner call | no production change |
| D5 | R1/R2 publication | (a) keep review-only until a seed is published; (b) publish a larger seed now | **(a)** | the neighbourhood remains a review surface |

## 6. Evidence this plan produces

- `docs/release-readiness-20261106/RC_REPORT.md` - profile, hashes, gates,
  Blockers.
- `docs/release-readiness-20261106/release-candidate.html` - side-by-side with
  the original prototype and the accepted slices.
- `docs/release-readiness-20261106/rc-e2e.mjs` + `evidence/rc-*.json` - the
  scripted run.
- `docs/release-readiness-20261106/ATLAS_SEED_PROPOSAL.md` + candidate JSON -
  not applied.
- `docs/release-readiness-20261106/DECISIONS.md` - D1-D5 with the exact diff each
  implies.
- Updated `INTEGRATION_MANIFEST.json` pins for every changed file.

## 7. Explicit limits

- A scripted browser run is not a manual AT audit; the record says so.
- One local machine is not field performance data.
- The Atlas seed is a proposal, not a publication: its JSON is not imported by
  the app, and its states stay `technical_review` until the owner signs each
  claim.
- Deployment is out of scope until D4. No Cloudflare call is made by this work.

## 8. Immediate sequence

1. ~~T1–T4~~ — done: one command builds the promoted `out/` and mirrors `out-rc/`.
2. ~~T5–T11~~ — done: 86/86 checks, three verifiers PASS, 329 tests, `tsc` clean.
3. ~~T12, T15–T16 evidence~~ — done: seed proposed and dry-run, evidence page
   generated, report written.
4. ~~T17 promotion (D1)~~ — done: R3–R6 are the default, rollback is
   `HANSA_*_REVIEW=0`, promoted build re-measured (436/436 routes, 86/86 E2E).
   **Technically verified, awaiting final owner sign-off.**
5. After sign-off: T14 seed publication if approved (D2) → T15 manual AT (D3) →
   T18 deploy (D4). D5 stays closed.

