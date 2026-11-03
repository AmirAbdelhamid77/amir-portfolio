# Initial risk list — M0, 2026-11-03

Scope: milestone M0 of `docs/knowledge-stage-next-phase-v3-20261101/NEXT_PHASE_PLAN_EN.md`
§5, output "initial risk list". HEAD `88158d689f39fe17cc8fea4acfbd675dcc732349`.

Severity is impact if the risk fires, not current status. Every row names a
trigger that would show the risk is firing, so a later pass can re-check rather
than re-argue.

## 1. Semantic and content risks

| ID | Risk | Evidence | Sev | Likelihood | Mitigation | Trigger |
|---|---|---|---|---|---|---|
| R1 | Eligible units are counted as "read" without a semantic decision | 6,201 extracted; 4,337 eligible; 1,859 metadata-only; 5 non-learning. `source-reconciliation-v3.json` | High | High | M1 separates extraction / matching / reading / review / publication states; never collapse them into one label | any report saying "complete" while `units-analyzed.jsonl` still has unreviewed eligible rows |
| R2 | Unmatched units are dropped instead of reviewed | 728 unmatched units named in the plan §6.2 | High | High | resumable batches, context restored around formulas/procedures/fragments | unmatched count falls without a matching review ledger entry |
| R3 | Quote match is treated as entailment | every assertion carries a passage, but a passage is a provenance check | High | Medium | M1 review of direction, conditions and support per assertion | an assertion published with only a substring match and no review record |
| R4 | Media meaning is inferred from captions | 628 media references; reconciliation limit says rendered pixels are not independently reviewed | Medium | High | track inaccessible media separately; do not count caption reading as figure review | coverage report claiming figure coverage without a per-figure review row |
| R5 | Revision overlays double-count as new knowledge | 222 revision overlay units, 4,925 unique canonical resources | Medium | Medium | resolve aliases/scope/identity; keep R11 revisions distinct from extra question entities | unit total grows while unique-resource total is unchanged and no overlay decision exists |
| R6 | Content-family gaps hide in untracked files | 108 untracked content files (59 intake exports, 49 live), 15 families | Medium | Medium | family ledger in `source-reconciliation-v3.md`; zero-overlap files stay explicit gaps | a new bank is cited in a lesson but is absent from the family ledger |

## 2. Integrity and receipt risks

| ID | Risk | Evidence | Sev | Likelihood | Mitigation | Trigger |
|---|---|---|---|---|---|---|
| R7 | Older receipts drift silently and a gate goes red mid-task | five layers recorded 47 drifted paths before M0; three verifiers were failing at M0 start | High | High | successor layer `docs/knowledge-stage-m0-20261103/` with 214 pins, 233 additions, 7 removed, 1 exclusion, 1 predecessor record; each entry carries attribution | `node scripts/verify-agent-reference.mjs` fails with a path not present in the successor manifest |
| R8 | A pin is "fixed" by editing the expected hash | the temptation that produced this risk list | High | Low | append-only rule: old manifests are never edited; only a new layer may record a transition, with a commit attribution | diff touching `docs/*/MANIFEST.json` or `docs/*/INTEGRATION_MANIFEST.json` without a new successor file |
| R9 | A build artifact is pinned as source | `tsconfig.tsbuildinfo` was pinned by four layers with four different hashes | Medium | High (already fired) | recorded as `excluded` with a reason; the chain resolves it to current bytes instead of asserting a frozen value | `tsconfig.tsbuildinfo` appears again in `files` of a new manifest |
| R10 | Receipt scripts are edited after the manifest is generated | every script edit changes a pinned hash | Medium | High | regenerate with the generator after the last script edit; the build step is documented in §12.11 | `Knowledge-stage drift scripts/*.mjs` in the verifier output |
| R11 | Negative tests silently stop covering new layers | `final-review-negative.mjs` copies a scratch checkout; deleted files broke it | Medium | Medium | scratch closure now walks the whole predecessor chain; 17 corruption cases must stay rejected | negative run reports fewer than 17 cases |

## 3. Build, deploy and delivery risks

| ID | Risk | Evidence | Sev | Likelihood | Mitigation | Trigger |
|---|---|---|---|---|---|---|
| R12 | Cold-CI build differs from the warm local build | local `npm run build` previously needed a real `node_modules` copy and warm Turbopack cache | High | Medium | treat CI build as the authoritative artifact; never claim a successful deploy from a local build | Cloudflare workflow fails while local build passes |
| R13 | Deploy publishes more than M0 | the workflow triggers on any push to `main` | High | Medium | M0 changes only docs, scripts and `intelligent-atlas/`; no `app/` file is touched | `git diff --name-only main...HEAD` contains `app/` or `components/` |
| R14 | Branch topology diverges and the fast-forward breaks | chain is linear: `main 496fddf` → 45704b5 → 0902e15 → 7 checkpoints → 88158d6 | Medium | Low | verify `git merge-base --is-ancestor main HEAD` before merging | `--ff-only` refuses |
| R15 | Live site regresses while the build is green | no post-deploy browser QA in M0 scope | Medium | Medium | run the existing `qa:search`, `test:content`, `verify:metrics`, `verify:curriculum` gates before push; verify the live routes after | a route returns 404/500 or a metrics gate fails after deploy |
| R16 | `/learn` consolidation broke deep links or saved progress | the migration added `/learn/[subject]/[topic]` and `/study` aliases | High | Low | `verify:curriculum` and `qa:search-index` gates; route aliases kept | a previously recorded route stops resolving |

## 4. Scope and process risks

| ID | Risk | Evidence | Sev | Likelihood | Mitigation | Trigger |
|---|---|---|---|---|---|---|
| R17 | A chart or motion library is added before choosing representation | adaptive policy requires meaning before library | Medium | Medium | no dependency added in M0; two-option comparison required per visual | `package.json` dependency diff without a recorded rubric |
| R18 | Private review payload reaches the public site | `data.js` is 2.75 MB of candidate content inside `intelligent-atlas/` | High | Low | projection builder is a separate M2 deliverable; `intake-private/` is gitignored | any `app/` import of `intelligent-atlas/` |
| R19 | M0 is treated as delivery | M0 only re-baselines and reconciles | Medium | Medium | §12.11 states the next atomic task is the statistics semantic pass, not publication | a message claiming the knowledge stage is complete |
| R20 | Two agents edit the same receipt scripts | the chain is shared by five verifiers | Medium | Medium | edit receipts only inside the layer that owns the change; regenerate once | concurrent diff on `scripts/*-receipt.mjs` |

## 5. Status at M0 exit

| Gate | Result |
|---|---|
| `node scripts/verify-agent-reference.mjs` | PASS — 13 active hashes, router v1.1, 6 intake hashes |
| `node scripts/verify-knowledge-atlas.mjs` | PASS — 16 payload, 33 integration, 23 doc links, 90 relocations |
| `node scripts/verify-easyui-integration.mjs` | PASS — 41 owned, 1,169 prior-file contracts, 22 decisions |
| `node scripts/final-review-negative.mjs` | PASS — 17/17 corruption cases rejected |
| Cold CI build | NOT RUN in M0 |
| Post-deploy browser QA | NOT RUN in M0 |
| Semantic review of the corpus | BLOCKED — M1, not started |

## 6. Rollback

- Prototype bytes: `intelligent-atlas/baselines/2026-11-03-pre-m0/` (32 files).
- Pre-M0 corpus report: `intelligent-atlas/analysis/source-reconciliation-v2.*`
  (v3 is additive; v2 was not overwritten).
- Receipts: the new layer is additive; deleting
  `docs/knowledge-stage-m0-20261103/` and `scripts/knowledge-stage-receipt.mjs`
  returns the chain to its pre-M0 behaviour, because every older receipt is
  unchanged except for the successor hook.
