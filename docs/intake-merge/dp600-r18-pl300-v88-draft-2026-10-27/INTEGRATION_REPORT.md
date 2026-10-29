# DP-600 R18 + PL-300 V88 — draft integration report

**Date:** 2026-10-27
**Scope:** Stage two intake packages into Hansa as disabled review drafts.
**Outcome:** Implemented locally · tested locally · **not deployed** · **no grading enabled** · **no approved content replaced**.
**Statuses preserved:** DP-600 R18 = `NO_GO`. PL-300 V88 = `NONFINAL`.

---

## 1. Sources and verification (before any Hansa change)

Both archives were extracted **outside the project** to
`C:\Users\amira\AppData\Local\Temp\hansa-merge-intake-20261027\` and their SHA-256
digests matched the delivered receipts exactly:

| Package | SHA-256 (verified) | Files |
|---|---|---|
| `Hansa_DP600_R18_ISOLATED_VERIFIED_HANDOFF_NO_GO_2026-10-27.zip` | `80b39070…eebf67` | 30 |
| `PL300_V88_CODEX_SOURCE_KEY_RECOVERY_AND_SCOPED_REPAIRS_NONFINAL_2026-10-27.zip` | `1a68a5ab…330ce3` | 194 |

Handoff guides read: `READ_ONLY_INTEGRATION_HANDOFF.md`, `REPORT_AR.md`,
`QA/CURRENT_ACCEPTANCE_STATUS.json`, `HANDOFF/15_ITEM_CONTINUATION_MATRIX.json`
(DP-600); `README.md`, `HANDOFF/START_HERE.md`, `QA/V88_SUMMARY.json`,
`QA/OPEN_ACCEPTANCE_GATES.json`, `SCIENTIFIC_QA_REPORT_AR.md` (PL-300).

Included verification checks, run as delivered:

| Check | Result |
|---|---|
| DP-600 `TOOLS/verify_isolated.py` | **PASS** — `PASS_PACKAGE_INTEGRITY_AND_PARENT_PARITY_ONLY`, matches receipt |
| DP-600 original nested `TOOLS/verify_r18.py` | **PASS** (222 ids, 207 untouched, 15 reversible, NO-GO) |
| DP-600 original nested `verify_r18.py --deep` | **FAIL — `FAIL_PATH_SEPARATOR_COMPATIBILITY`** (R16 compares backslash paths with slash-delimited manifest entries) |
| DP-600 declared adapter `AUDIT_SCRIPTS/windows_r16_adapter.py` | **PASS — `PASS_COMPATIBILITY_ADAPTED`**, original verifier sha256 `9c8d2139…e4ea37`, file on disk unchanged, `scientific_approval: false` |
| PL-300 `TOOLS/verify_v88.py` | **PASS** — `PASS_STRUCTURAL_AND_PROVENANCE_ONLY`, matches receipt |
| PL-300 original parent `TOOLS/verify_checkpoint.py` (V87 extracted fresh) | **PASS** — hashes, 1,285 ids, 1,285 reviews / 5,160 per-option records |

**The DP-600 distinction is maintained:** the original sequential deep verifier
*failed* on Windows; the separate declared compatibility adaptation — which
normalizes one manifest-coverage comparison in memory and modifies nothing on
disk — *passed*. The adapter's pass is never reported here as an original deep
pass, and neither pass is treated as scientific approval.

Both nested originals needed `PYTHONUTF8=1` because they read UTF-8 JSON with
the platform default encoding (cp1252 on this locale). That is an environment
setting, not a script or file modification; no archived script or data file was
altered.

The packages grant no repository write, build, browser or deployment
authorization by themselves. The authorization for this staging is your explicit
instruction to merge both as disabled review drafts.

## 2. What the current Hansa state required

- The approved Fabric bank is `834` index entries + `532` additions (`452`
  DP-600 + `80` PL-300) + `11` documentation-backed graded R11 questions.
- Progress lives in three browser keys: `amir-fabric-v1`, `amir-lab-v1` and
  `hansa-question-additions-v1`.
- **All 222 DP-600 R18 ids (`T1Q1…T1Q222`) already exist in approved content**,
  so R18 is a *parallel candidate revision* of the current bank — merging it
  would have replaced approved content, which the brief forbids.
- **PL-300 V88's 1,285 ids have zero overlap** with anything in Hansa.
- The PL-300 working bank carries an answer on **every** record (`correct`),
  per-option `why` rationales on all 1,285, explanations on 862, historical keys
  on 407 and per-question review logs — none of which may reach a browser.
- The architecture has no native "unapproved draft" mode, so the brief's
  fallback applies: an **isolated review mode** was built instead.

## 3. Changes (all additive; nothing existing was modified)

| Path | What it is |
|---|---|
| `content/drafts/dp600-r18.json` | 222-record key-free projection, ids namespaced `draft-dp600-r18-*`, `gradingEnabled: false` |
| `content/drafts/pl300-v88.json` | 1,285-record allowlist projection, ids namespaced `draft-pl300-v88-*`, `gradingEnabled: false` |
| `content/drafts/manifest.json` | Statuses, source receipts, counts, policy, output hashes |
| `lib/drafts/data.ts` | Draft types and search helpers |
| `components/practice/draft-review.tsx` | Review UI: bank switcher, search, paging, expansion; **no storage access** |
| `app/practice/drafts/page.tsx` | Isolated route — `robots: noindex`, absent from sitemap and catalogue |
| `scripts/build-draft-banks.mjs` | Allowlist projector (`npm run build:drafts`) |
| `scripts/qa-drafts.mjs` | Browser QA (`npm run qa:drafts`) |
| `tests/content/drafts-integration.test.mjs` | 12 guards encoding the merge conditions |
| `intake/dp600-r18-2026-10-27/MANIFEST.json`, `intake/pl300-v88-2026-10-27/MANIFEST.json` | Provenance, hashes, verifier results, authorization record |
| `.gitignore` | Adds `intake-private/` |
| `package.json` | Adds `build:drafts`, `qa:drafts` scripts only |
| `intake-private/` (gitignored, 58 MB) | Full private mirror of both packages: expected answers, historical keys, review logs, evidence, handoff guides, nested archives |

Existing banks, pages, components, progress keys and content files: **untouched**
(`git status` shows modifications only to `.gitignore` and `package.json`, both
additive one-liners).

## 4. Security and key separation

Projection is **allowlist-based**: a field only survives if `build-draft-banks.mjs`
names it, so a future package adding an answer field drops it instead of
forwarding it. Stripped from PL-300: `correct`, `explanation`, `options[].why`,
`historical_original_key`, evidence/claim traces, all review logs, SME and
native-runtime fields. Stripped from DP-600: per-question candidate/review
metadata.

Key material lives in `intake-private/`, which is (a) gitignored — never
committed or pushed, (b) never imported by any app source file — asserted by
test, and (c) therefore absent from the build. Verified against the actual
build output (`out/`): **0 hits** for all 13 private markers, including
`PRIVATE QA ONLY`, `draftExpectedByID`, `historical_original_key`,
`R18_15_PRIVATE_EXPECTED_ANSWERS` and a sample PL-300 explanation string. The
two draft chunks themselves contain zero `"correct"`, `"explanation"`, `"why"`
or `"answers"` keys; the pre-existing hits elsewhere in `out/` belong to the
approved banks that always shipped explanations.

## 5. Test results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** |
| `npm run lint` | **PASS** (exit 0, whole project) |
| `npm run test:all` | **PASS 183/183** — six suites, including the 12 new draft guards |
| `npm run build` | **PASS** — static export, `/practice/drafts` prerendered |
| `npm run qa:drafts` | **PASS 22/22** — see `qa-drafts.json` |
| Private-marker scan of `out/` | **0/13 markers present** |
| Console errors on the draft route | **0** |

Browser evidence (`qa-drafts.json`, `draft-review-1440.png`):

- **User progress saving:** sentinel values written to `amir-fabric-v1` and
  `amir-lab-v1` are byte-identical after opening the draft route, switching
  banks, searching and reloading; draft review **adds zero new storage keys**.
- **No question duplication:** DP-600 list shows `T1Q1…` under draft ids;
  PL-300 shows `PL300-…` ids; catalogue, DP-600 hub and sitemap contain no
  draft ids, links or entries; approved counts unchanged (834 / 532 / 80).
- **No answer leaks:** 23 network responses on the route scanned, 0 private
  markers; an expanded question shows options and the label
  "Grading disabled · no answer shipped", with no answer text.
- Bank switch, search filtering, match counters and noindex meta all verified.

## 6. Blockers (unchanged by this work)

- **DP-600 release is `NO_GO`.** Package integrity passing is not academic
  approval. Open: R11/exhibit equivalence not established, six reauthored
  variants unverified against originals, native Warehouse/KQL/Spark/DAX/Gen2
  runs `NOT_RUN`, original deep verifier still failing on Windows.
- **PL-300 is `NONFINAL`, `FINAL_READY: false`.** Open gates: whole-bank
  adjudication (27/1,285 newly reviewed), historical key semantics, 782-item
  leakage queue (21 touched), evidence validation (14× 404), native execution
  `NOT_RUN`, **0 SME approvals**.
- **Not done by design:** grading not enabled, no approved content replaced,
  **site not deployed**, drafts not listed as an approved bank, screen-reader
  and cross-browser QA not run for the new route.

## 7. Rollback

Everything staging-related is additive, so removal restores the previous state:

```bash
cd amir-portfolio
rm -rf content/drafts lib/drafts components/practice app/practice/drafts
rm -rf intake/dp600-r18-2026-10-27 intake/pl300-v88-2026-10-27
rm -rf docs/intake-merge/dp600-r18-pl300-v88-draft-2026-10-27
rm -f scripts/build-draft-banks.mjs scripts/qa-drafts.mjs tests/content/drafts-integration.test.mjs
git checkout -- package.json .gitignore          # drops the two script entries and the ignore line
rm -rf intake-private                            # optional: removes the private mirror too
npm run build                                    # regenerates out/ without the draft route
```

`git status` before and after confirms no pre-existing file is modified; the
changes are currently **uncommitted**, so `git checkout -- . && git clean -fd`
on the listed paths is an equivalent one-step rollback while they remain
uncommitted.

## 8. Deliverables

- **Preview:** local static export served from `out/` at
  `http://127.0.0.1:PORT/practice/drafts/` (opened in the preview panel). No
  deployment was performed.
- **Report:** this file; machine-readable results in `qa-drafts.json`; screenshot
  `draft-review-1440.png`; provenance in `intake/*/MANIFEST.json`.
