# W4.1 follow-up report — post-closure engineering reconciliation

Date: 2026-11-07. Branch `feat/fabric-corpus-20261105`, baseline state
HEAD `1ea0388` (Wave-4 closure). This wave closes the three verified gaps
left open by the Wave-4 handoff, plus one reconciliation finding. Nothing
deployed; the original worktree (`D:\BeUI\amir-portfolio`, owner in-flight
work) untouched; no historical report or receipt rewritten (all changes are
additions or successor transitions).

## Item 1 — the fabric-corpus test suite is wired into npm scripts

The 237-test battery under `tests/fabric-corpus/` (bindings, comparator,
compiler, paths, routes, search, sync) existed but had no npm script; it was
runnable only by typing the raw `node --experimental-strip-types --test
"tests/fabric-corpus/**/*.test.mjs"` command, and `test:all` did not include
it.

- `package.json`: adds `test:fabric-corpus` and extends `test:all` with it.
- `scripts/final-review-receipt.mjs`: the successor audit's package.json
  allowlist gains the same two script strings, keeping the deepEqual exact.
- `docs/fabric-corpus-integration-20261105/INTEGRATION_MANIFEST.json`: two
  successor transitions appended (13 → 15): `package.json`
  (`previousSha256 c6443902…` → new) and `scripts/final-review-receipt.mjs`
  (`previousSha256 45bb65bc…` → new). No older receipt edited; no hash that
  still matched disk rewritten.

`audited()` hardening (required by the first transition): the FC layer may
advance a path more than once, hop by hop, but `audited()` matched only the
FIRST pin for a path. Once `package.json` gained a second hop, that lookup
would have silently revoked the audited `yaml@2.9.1` authorization and failed
the chain. `audited()` now walks the hop chain, authorizes only the terminal
pin whose recorded bytes match disk, and carries the union of
`auditedDependencyAdditions` recorded along the walked chain (order: earliest
hop first). Single-pin behavior is byte-for-byte identical to before
(`.gitignore`'s `auditedAppend` passes through the spread; both verifiers and
all negative cases pass unchanged).

## Item 2 — the CI reproducibility pin is implemented (w4a DEFECT-1 left open)

w4a-report.md documents "CI pins it to the release commit" for
`SOURCE_DATE_EPOCH`, but no workflow or script set `SOURCE_DATE_EPOCH` or
`FABRIC_BUILD_ID` — reproducibility in CI rested entirely on the app's
deterministic fallback constants (freeze date / constant build id), which are
correct but did not honor the documented convention.

- `.github/workflows/fabric-corpus-release.yml`: both jobs gain a
  "Pin reproducibility clock + build id to the release commit" step right
  after checkout — `SOURCE_DATE_EPOCH=$(git log -1 --format=%ct HEAD)` and
  `FABRIC_BUILD_ID=${GITHUB_SHA}` exported via `$GITHUB_ENV`. The packaging
  driver (`build-release.mjs` `buildEnvFor`) spreads `process.env`, so both
  reach `next build` (sitemap `lastmod`, `generateBuildId`). YAML validated
  with the repo's `yaml` devDependency; the workflow remains dispatch-only
  and deploy-free (HARD GATE comment and commented deploy stubs untouched).

## Item 3 — the reported asset drift (9,586 vs 9,572) is a counting artifact

The Wave-2/3/4 evidence compared the asset manifest's 9,586 path entries
against the on-disk `public/fabric-docs-assets/` file count (9,572) and
recorded 14 missing assets (e.g. "admin 80 vs 78"). A full reconciliation
against the manifest says otherwise:

- **0 assets missing from disk** — every one of the 9,586 manifest paths
  resolves to an existing file.
- **0 byte-size mismatches** across all 9,586 entries.
- **0 disk files outside the manifest** — nothing unaccounted.
- The 14-entry delta decomposes exactly into (a) 8 duplicate manifest path
  entries: assets legitimately referenced by two families (`cicd` ↔
  `data-factory`, `cicd` ↔ `fundamentals`, `admin` ↔ `fundamentals`,
  `database` ↔ `governance`, `real-time-hub` ↔ `real-time-intelligence`
  ×3) — the manifest counts paths, not distinct files; and (b) 6 true
  case-only collisions, all in `data-engineering/media/livy-api/`
  (`Lakehouse-settings(-livy-endpoint)?.png`, `Livy-monitoring-hub*.png`,
  `Livy-session-entra-token.png` vs their lowercase twins), which Windows
  folds into one on-disk file (the capitalized variant is what disk holds).

No `copy-assets.mjs` re-run was performed (the tree is already complete and
integrity-clean; regeneration would only chase a counting artifact).

### Deferred finding recorded (not silently dropped): case-sensitive-host image risk

The source corpus references the same livy-api image under two different
cases, and disk holds one case. On Windows (and any case-insensitive host)
both URL variants serve; on a case-sensitive deployment host the lowercase
variant 404s. Affected compiled articles: `data-engineering/get-started-api-livy`
and `data-engineering/get-started-api-livy-session` (the latter mixes both
cases for the same image; `get-started-api-livy-batch` uses the capitalized
variant that matches disk). Scope: 6 image URLs inside the livy-api article
cluster; images only, no content, links, or publication eligibility affected.
This belongs with the media-origin/renderer owner decisions already listed in
the wave3-final-report §10–11 blocker register — a one-line source
normalization in the corpus markdown or a sanitizer case-fold at compile time
would close it. It does NOT block local integration validation.

## Verification (this wave)

| Check | Result |
|---|---|
| `npm run test:fabric-corpus` (new script) | **PASS 237/237** (~151 s) |
| `npm run test:all` (now 7 areas incl. fabric-corpus) | **PASS — exit 0, 540 test results, 0 failures** |
| `node scripts/verify-agent-reference.mjs` | **PASS** (receipt chain incl. the 2 new transitions and the package.json audit with the extended allowlist) |
| `node scripts/verify-preservation-history.mjs` | **PASS** (90 relocations, 23 captures, 6 rejection cases) |
| `node scripts/final-review-negative.mjs` | **PASS** — 17 tamper cases rejected (incl. package.json dependency tampering) |
| `node scripts/canonical-home-receipt.mjs` | PASS (exit 0) |
| Asset reconciliation (manifest ↔ disk) | PASS — 0 missing, 0 extra, 0 byte mismatches |
| Workflow YAML parse + dispatch-only check | PASS |
| Full build `npm run build` | **PASS — exit 0**, 3,158 static pages + 3,151 segment-payload aliases |
| `verify:curriculum` | **PASS** — 883 internal links resolve in out/, 67 alias routes canonicalise |
| `qa:search-index` | **PASS** — 52/52 checks; index 448 destinations |
| `verify:metrics` | **PASS** — every published count matches the content |
| Byte audit of out/ | **PASS** — 2,716/2,716 published routes exported; 0/81 held routes leaked; docs index links to 0 held paths; sitemap lastmod single deterministic value `2026-11-05T00:00:00.000Z` and omits `learn/fabric/docs` entirely; shards manifest v46d7674dcdca2c3d at 2,716 articles / 105 files |
| Browser-level checks (served out/ at 127.0.0.1:4188, real GUI) | **PASS** — docs index (counts + honest held disclosure, held items not links); hub collections strip (9 collections summing exactly 2,716 published + 81 held); topic desk soft-nav and hard-load both correct; corpus article renders with embedded media, internal cross-links and "Back to the Microsoft Fabric hub" return link; rights-held article 404s ("The query returned no rows."); /search?q=OneLake → manifest + routing + all 104 shards fetched → **8 corpus matches with section-anchor deep links** |
| Both packaging profiles re-run | NOT RUN — no URL- or coverage-affecting change since the W4-A repro pair (same scope note as w4a-report) |

Browser-check observations (recorded honestly, both non-reproducible in fresh contexts and judged environmental rather than app defects): (1) the very first soft navigation from the hub to a topic desk transiently showed the knowledge-stage Home's DOM while the URL and title already pointed at the desk — a first-paint hydration race on that long-lived tab; a fresh tab and all subsequent soft navigations rendered correctly, and the static export + RSC payloads were verified correct byte-for-byte. (2) one long-lived browser tab (which had survived a machine power-cycle mid-session) reported "the Fabric documentation index could not load" with zero network requests — a fresh tab ran the full pipeline (manifest → routing → 104 shards → worker scoring) against the same server and produced results; the fail-closed message is the designed degradation.

## Commit (this wave)

W4.1 follow-up: test-suite wiring + successor transitions, CI reproducibility
pins, asset-drift reconciliation — see `git log` on the branch.
