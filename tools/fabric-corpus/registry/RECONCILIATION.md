# Registry reconciliation report — FC02 (Evidence and Rights)

Status: delivered 2026-11-05 by FC02. Corpus: MicrosoftDocs/fabric-docs pinned
revision `774592ea3f2d4558f763d6e5b74abf4785948fb5`. Contract:
`docs/fabric-corpus/contracts/IDENTITY_REGISTRY.md` + `WORK_PACKAGE_OWNERSHIP.md`.
All outputs live in FC02 write-owned areas
(`tools/fabric-corpus/registry/**`, `docs/fabric-corpus/ledgers/**`).

## 1. Deliverables and status

| Deliverable | File | Status |
|---|---|---|
| Identity registry builder | `tools/fabric-corpus/registry/build-identity.mjs` | PASS (deterministic; hash-stable excluding `generatedAt`) |
| Identity registry | `tools/fabric-corpus/registry/identity.json` | PASS (15,496/15,496, 1:1, zero dup/missing) |
| Rights ledger builder | `tools/fabric-corpus/registry/build-rights.mjs` | PASS |
| Rights ledger | `tools/fabric-corpus/registry/rights.json` | PASS (9 rules, 524 held exceptions, none cleared) |
| Redirect/alias builder | `tools/fabric-corpus/registry/build-aliases.mjs` | PASS |
| Alias ledger | `tools/fabric-corpus/registry/aliases.json` | PASS (1,014 rows, 0 cycles, 1 BLOCKER) |
| Redirect ledger (human) | `docs/fabric-corpus/ledgers/redirect-ledger.md` | PASS (1:1 with `aliases.json`) |
| References reconciliation | `tools/fabric-corpus/registry/reconcile-references.mjs` + `references-reconciliation.json` | PASS (919 = handover figure) |
| Validator | `tools/fabric-corpus/registry/validate-ledgers.mjs` | PASS — 29 pass / 0 fail / 0 warn / 1 skip (S1, FC03 schemas not yet published) |
| This report | `tools/fabric-corpus/registry/RECONCILIATION.md` | this document |

NOT RUN in this package (owned elsewhere, recorded so nothing is silently dropped):
parser/compile fidelity (FC03), page export and browser checks, performance,
public-artifact scans, live-link checks, hosting capacity (handoff 05 §Acceptance).

## 2. Coverage reconciliation (1:1 proof)

`FULL_CORPUS_COVERAGE.json` (15,496 rows) → `identity.json` (15,496 rows),
sorted by path, one row per manifest path in both directions:

- in = out = 15,496; duplicate paths = 0; duplicate ids = 0 (I2, I3, I3b)
- bidirectional set equality vs manifest: missing = 0, extra = 0 (I11)
- counts re-aggregate from rows and match manifest counts per kind (I10, I10b)
- every row terminal: all dispositions drawn from the fixed 12-value
  vocabulary; no row left in a planning state (I6)

### 2.1 In/out per kind (manifest kind → registry id prefix → disposition)

| Manifest kind | In | ID prefix | Out | Terminal disposition(s) |
|---|---:|---|---:|---|
| article-candidate | 2,797 | `art:` | 2,797 | eligible-article 2,794; article-hold-external-dependency 1; article-hold-rights-notice 2 |
| asset | 12,123 | `as:` | 12,123 | asset-local 12,123 |
| fragment | 429 | `fg:` | 429 | fragment-dependency 429 |
| navigation | 42 | `fg:` | 42 | navigation-dependency 42 |
| structured-doc | 59 | `sf:` | 59 | structured-page-candidate 59 |
| redirect | 22 | `sf:` | 22 | redirect-map 22 |
| repository-control | 5 | `sf:` | 5 | repository-control 5 |
| rights | 3 | `sf:` | 3 | rights-reference 3 |
| support | 1 | `sf:` | 1 | publish-config-support 1 |
| unavailable-or-special | 15 | `sf:` | 15 | unavailable-hold 15 |
| **Total** | **15,496** | | **15,496** | 12-value vocabulary, sums reconcile |

ID prefix totals: `art:` 2,797 · `fg:` 471 (429 fragments + 42 navigation) ·
`as:` 12,123 · `sf:` 105 · plus 234 `dep:` rows in a separate
`externalDependencies` table (dep targets are not corpus paths, so the 1:1
path reconciliation is unaffected).

ID scheme notes: `art:<family>/<slug>` is derived deterministically from the
source path (`docs/<family>/<slug>.md`), 1:1 with its route target; the
contract's `lb:` LearningBinding rows are FC06 scope and are not minted here;
`rt:` route targets are carried as `plannedDestination` per row (identity.json
is one row per path by contract).

### 2.2 Route plan

`plannedDestination` is rebuilt from the source path
(`/learn/fabric/docs/<family>/<article>/`, family seed = first `docs/` segment)
and cross-checked against the manifest's planning value: agreement **2,797 /
2,797**. Non-routable kinds carry an empty destination (I8). 22 families
(admin 80, apps 30, cicd 61, data-engineering 290, data-factory 500,
data-science 162, data-warehouse 151, database 112, embed 4, enterprise 94,
extensibility-toolkit 62, fundamentals 76, governance 54, graph 40, iq 304,
known-issues 1, mirroring 91,
onelake 82, real-time-hub 108, real-time-intelligence 394, security 67,
workload-development-kit 34). Structured-doc (.yml) candidates stay
non-routable until compiler classification (handoff 02), per contract
"structured-doc candidates that graduate to pages join this table".

### 2.3 Cross-repo dependencies discovered (`dep:` rows, all unpinned)

| Repo | Distinct targets | Sample |
|---|---:|---|
| powerquery-repo | 203 | `includes/get-data-home-module.md` (used by mirroring/get-started-with-mirroring.md) |
| kusto-repo | 26 | `includes/cross-repo/schema-best-practice.md` (whole body of real-time-intelligence/schema-best-practice.md) |
| powerbi-repo | 4 | `includes/what-is-capacity.md` (enterprise/powerbi/service-premium-what-is.md) |
| reusable-content | 1 | (see identity.json) |

234 targets across the four repos declared in
`.openpublishing.publish.config.json#dependent_repositories` (validator I12b).
All are `unpinned-hold` until pinned at immutable revisions and cleared.
This is a first expansion from textual `~/../<repo>/...` include references;
full transitive closure (including commented directives — e.g.
real-time-intelligence/get-data-fluent.md carries a commented include, so
regexes cannot certify closure) is FC03's compile gate.

## 3. Disposition vocabulary (explicit, terminal)

1. `eligible-article` — article candidate with a planned local route; still
   subject to rights + dependency gates before publication (a publication
   gate, not an unfinished ledger state).
2. `article-hold-external-dependency` — body requires an unpinned cross-repo
   include (1 row: `docs/real-time-intelligence/schema-best-practice.md`,
   whose body is `kusto-repo/includes/cross-repo/schema-best-practice.md`).
3. `article-hold-rights-notice` — embedded all-rights-reserved validation
   footer (2 rows: `docs/extensibility-toolkit/publishing-requirements-workload.md`,
   `docs/extensibility-toolkit/publishing-requirements-item.md`).
4. `structured-page-candidate` — .yml schema doc awaiting classification.
5. `fragment-dependency` — include/snippet rendered through owning articles.
6. `asset-local` — image/media resolved from the local corpus.
7. `navigation-dependency` — toc.yml/breadcrumb.yml ordering input; never
   infers semantic edges.
8. `redirect-map` — redirection source file, consumed for aliases.
9. `repository-control` — repo control files; publishing role inspected.
10. `rights-reference` — LICENSE, LICENSE-CODE, ThirdPartyNotices.md.
11. `publish-config-support` — docs/docfx.json.
12. `unavailable-hold` — tracked but absent in the sparse checkout (15 rows).

Note on vocabulary placement: the task's example list included
`rights-exception` as a disposition; it is implemented as a **rightsState**
with role dispositions carrying the holds (`article-hold-*`,
`unavailable-hold`). This keeps role and rights orthogonal; the combination
is validated cross-consistently (R4).

## 4. Rights model (never clears a gated row)

Ground rules from pinned `ThirdPartyNotices.md`: documentation and other
content → CC BY 4.0 (LICENSE); code → MIT (LICENSE-CODE); trademarks
reserved. Handoff 02 adds: per-asset review for media; cross-repo includes
and absent/external assets are dependency AND rights holds; the two
extensibility-toolkit articles carry unresolved all-rights-reserved footers.

### 4.1 rightsState distribution (identity rows)

| rightsState | Rows | Composition |
|---|---:|---|
| cc-by-4.0-docs | 2,847 | textual content without exceptions (articles, fragments, nav, yml, config, README/SECURITY, ThirdPartyNotices) |
| mit-code | 2 | LICENSE, LICENSE-CODE (grant texts; code scope) |
| review-required | 12,125 | 12,123 assets pending per-asset clearance + the 2 all-rights-notice articles |
| rights-exception | 507 | rows with cross-tree references and/or cross-repo includes (see 4.2) |
| unresolved-review | 15 | tracked-but-absent rows (no bytes/hash to evaluate) |

### 4.2 Exception rows (524, all `status: hold`, none cleared)

| Class | Rows | Rationale (condensed) | Required action |
|---|---:|---|---|
| cross-tree-reference | 508 | manifest `crossTreeHints > 0`: file references content outside the pinned tree (sibling-docset links like /power-bi/, /azure/, and cross-repo hints) | pin+clear external targets or apply approved outbound-link policy; hold full-text sign-off |
| cross-repo-include | 79 | file embeds `~/../<repo>/...` include directives; targets unpinned, per-target rights unverified | dependency expansion gate: pin at immutable revision, verify rights, then clear |
| explicit-rights-notice | 2 | embedded all-rights-reserved validation footer conflicts with the repository CC BY 4.0 grant; effect unresolved (handoff 02) | human rights review before any local body is published; alternatives (approved explanation / coverage record) never count as full-text delivery |
| unavailable-hold | 15 | tracked but absent; no content to evaluate | recover in authorized staging only if role requires; keep visible |

Classes overlap and merge per file (all 79 include files are inside the 508
cross-tree set; one of the two notice articles is also cross-tree). The 507
identity rows at `rights-exception` = 508 cross-tree rows − 1
(publishing-requirements-workload.md takes the more specific
`review-required` from the notice rule). Evidence pointers on every exception
row cite the manifest row, the corpus scan, and/or direct file inspection.

Named exceptions from the task, verified:
- (a) `docs/extensibility-toolkit/publishing-requirements-workload.md` and
  `publishing-requirements-item.md` — explicit-rights-notice, held.
- (b) every `crossTreeHints > 0` row (508) and every cross-repo include row
  (79) — dependency holds, held.
- (c) the 15 unavailable-or-special rows — unavailable-hold, held.
- (d) `docs/real-time-intelligence/schema-best-practice.md` (cross-repo Kusto
  include for its body — verified in file, line 11) and the mirroring
  get-started article (Power Query includes — verified: 3 cross-repo
  `powerquery-repo` includes + 1 local include). **Path correction:** the task
  text named `docs/database/mirroring/get-started-with-mirroring.md`; the
  pinned path is `docs/mirroring/get-started-with-mirroring.md` (no
  `docs/database/mirroring/` directory exists in the manifest or on disk;
  handoff 02's own text agrees with the pinned path). Ledger uses the pinned
  path; discrepancy escalated in §7.

Open gates NOT cleared here: final rights disposition is a human gate
(handoff 05 checkpoint 2); this ledger records holds with owners, actions and
evidence and marks nothing cleared.

## 5. Redirect/alias findings

Source of truth: `.openpublishing.publish.config.json` at the corpus ROOT
(`docsets_to_publish[0].redirection_files`, 20 entries) + every present
`.openpublishing.redirection.*.json`. Full detail:
`docs/fabric-corpus/ledgers/redirect-ledger.md` + `aliases.json`.

- Files: 22 tracked redirect files in the manifest, all present on disk (21
  glob-matched + the root `.openpublishing.redirection.json`).
  20 config-referenced: **19 present**, **1 missing (BLOCKER)**; 3 present
  files are NOT referenced by the config (root — 0 rows by upstream comment;
  `docs/governance/...governance.json` — 7 rows; `docs/real-time-hub/...real-time-hub.json` — 3 rows).
- Rows: **1,014 total**. The handover's "19 present files / 1,004 rows" is the
  config-referenced-present subset (1,014 − 7 − 3 − 0 = 1,004): the claim
  reconciles under that definition and is documented in the ledger.
- `redirect_document_id: true`: 159. Query strings: 1. Fragments: 13.
  Absolute-URL targets: 2. Self-redirect: 1.
- Target resolution (1,000 `/fabric/...` targets): 505 resolve to a real
  pinned corpus path; 483 are themselves redirect sources (chain through the
  alias map); 12 unresolvable in the pinned snapshot (stale upstream targets,
  sample in `aliases.json#unresolvableTargetsSample`).
- Chains: 397 chain paths recorded; **cycles: 0**.
- BLOCKER blk-0001: `docs/database/mirrored-database/.openpublishing.redirection.database.json`
  is referenced by the publish config but neither present on disk nor tracked
  in the manifest at the pinned revision (the directory does not exist).
  Remediation owner: FC02 ledger record + upstream investigation (recover
  from upstream history into authorized staging if needed). Status: open.
- Data-quality anomalies recorded, not silently normalized: 1 row using
  `source_path` instead of `source_path_from_root`
  (data-science redirection, also missing its leading slash — normalized and
  flagged); 20 sources with trailing slashes; 1 with trailing whitespace.
- Alias usage note: per contract, identity follows the reviewed canonical
  target; these maps are consumed for alias fidelity, and
  `redirect_document_id: true` rows (159) additionally pin document identity.

## 6. references.json reconciliation

Input: `content/study/references.json` — 1,859 records. Output:
`tools/fabric-corpus/registry/references-reconciliation.json`
(script `reconcile-references.mjs`, re-validated by validator check F1).

**Definition D1 (Fabric Learn URL)** — a record counts iff (1) `href` is an
absolute, parseable http(s) URL, (2) hostname is exactly
`learn.microsoft.com`, (3) the pathname begins at the Fabric product content
root: `/fabric/` or `/en-us/fabric/` (optional locale prefix, nothing else).
Query/fragment suffixes are permitted and do not affect membership.

| Measure | Count |
|---|---:|
| Total records | 1,859 |
| **D1 Fabric Learn URLs** | **919 — matches the handover figure exactly** |
| D2 (broad): Learn-host URLs whose path contains a `/fabric/` segment anywhere | 1,037 (the contract's "1,037 rows with /fabric/ URLs") |
| D2 − D1 | 118 — all `/en-us/rest/api/fabric/...` REST API reference pages, outside the fabric-docs corpus tree |
| D1 matched to registry rows | 909 = 901 article routes (`art:`/plannedDestination) + 8 structured-doc sources (`sf:` … `.yml`) |
| D1 no-local-destination exceptions | 10 — family landing URLs (`/fabric/`, `/fabric/<family>/`) with no corpus article row; they render from TOC data, not a source file; disposition `no-local-destination` recorded per record |

Verdict: the handover's "919" and the contract's "1,037" are both correct —
they measure D1 and D2 respectively; the 118-record delta is definitional
(REST API reference pages are Fabric URLs but not fabric-docs corpus URLs).
901 + 8 = 909 D1 records resolve to corpus rows; the remaining 10 are recorded
as explicit no-local-destination exceptions with dispositions.

## 7. Discrepancies vs handover/task claims (escalated, not silently resolved)

1. **Mirroring path (task text).** Task named
   `docs/database/mirroring/get-started-with-mirroring.md`; pinned path is
   `docs/mirroring/get-started-with-mirroring.md`. Evidence: manifest row +
   on-disk file + absence of any `docs/database/mirroring/` rows. Handoff 02's
   own text ("mirroring/get-started-with-mirroring.md") is consistent with the
   corpus. Ledger uses the pinned path.
2. **Redirect file count (handover).** "19 present redirection files / 1,004
   rows" counts only publish-config-referenced files present on disk. All
   tracked files: 22 present, 1,014 rows. Reconciles; definition documented.
3. **Contract field name (contract vs task).** IDENTITY_REGISTRY §Registry
   files names the master-table field `rights`; the task spec names
   `rightsState` (with the same semantics). Emitted `rightsState` per the
   operative task spec; flagging so the lead can align the contract at the
   merge checkpoint.
4. **`rights-exception` vocabulary placement.** Task's example disposition
   list included `rights-exception`; implemented as a rightsState with
   role-disposition holds (§3 note). Both remain validated.
5. **New upstream data-quality findings** (not previously flagged):
   3 `~/..//<repo>/...` double-slash includes in
   `docs/enterprise/powerbi/service-premium-what-is.md`; 1 `source_path` key
   variant + missing leading slash in the data-science redirection file;
   20 trailing-slash and 1 trailing-whitespace redirect sources; 1
   self-redirect; 12 stale redirect targets and 483 targets resolvable only
   via further redirect chains; 1 config-referenced redirection file missing
   (§5 BLOCKER).
6. **Dependency scale.** 234 distinct unpinned cross-repo include targets
   across 79 corpus files (203 powerquery-repo) — larger than the two
   explicitly named articles; all held per the same rule.

## 8. Open gates after FC02

1. Rights review (human): 524 held exceptions + per-asset clearance for
   12,123 assets + notice interpretation for the 2 flagged articles.
2. Dependency expansion: pin all 234 `dep:` targets at immutable revisions;
   parser-level closure including commented directives (FC03).
3. FC03 field schemas for identity/rights/aliases (validator check S1 is SKIP
   until published; contract-level checks I1–A5 cover the gap meanwhile).
4. Structured-doc (59 .yml) route/publishability classification.
5. Alias fidelity for the 12 stale redirect targets and the missing
   mirrored-database file (upstream investigation).

## 9. Reproduction

```
node tools/fabric-corpus/registry/build-identity.mjs  FULL_CORPUS_COVERAGE.json
node tools/fabric-corpus/registry/build-rights.mjs    FULL_CORPUS_COVERAGE.json
node tools/fabric-corpus/registry/build-aliases.mjs   <corpus-root> FULL_CORPUS_COVERAGE.json aliases.json ../docs/fabric-corpus/ledgers/redirect-ledger.md
node tools/fabric-corpus/registry/reconcile-references.mjs content/study/references.json FULL_CORPUS_COVERAGE.json
node tools/fabric-corpus/registry/validate-ledgers.mjs . FULL_CORPUS_COVERAGE.json --expect-fabric-learn-urls 919
```

All builders are deterministic (sorted keys, no clock except `generatedAt`;
identity rows hash-stable across runs — verified). Scripts read files via `fs`
(no JSON imports), Node >= 22 ESM.
