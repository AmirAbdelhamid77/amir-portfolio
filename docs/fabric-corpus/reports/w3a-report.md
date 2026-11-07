# W3-A report — compiler remediation (Fabric corpus Wave 3)

Status: COMPLETED AND LEAD-VERIFIED. Provenance note: the W3-A agent session
was interrupted by a dispatch quota error and continued to completion outside
the reported hand-back; the report below was reconstructed by the integration
lead (6 Nov 2026) from the delivered code, fixtures, recompilation receipts and
test evidence, every item re-run and verified before acceptance. No git
commands were available to the sub-agents; nothing was committed until the
lead's audit.

## Outcome

Wave 2 excluded 89 compiler-quarantined articles. After remediation the route
registry (revision `0c9dd4f84395…`) reconciles **2,716 published + 81 excluded
= 2,797** — **11 articles recovered**; all 2,797 article candidates remain
resolved with exactly one terminal role.

## Recovered classes (parser-repairable, now compiling clean)

| Class | Wave-2 count | Fix |
|---|---|---|
| `unterminated-code-fence` | 4 | docfx closes an unclosed fence at EOF; parser now applies the same rule (fixture: `inline-code-span-fence`) |
| `orphan-construct-end` / `unterminated-construct` | 3 (+4 further) | orphan `:::*-end` markers handled per docfx behavior (fixture: `orphan-construct-end`); self-closing image interplay with zones fixed (fixture: `zone-self-closing-images`) |

Recovered-article proof: affected families recompile exit 0 with zero
quarantines — cicd 68 files, data-engineering 291, extensibility-toolkit 62
(inclusive of the rights-notice ledger holds, which remain excluded by
disposition, not by quarantine). Spot check: `/learn/fabric/docs/cicd/
best-practices-cicd/` renders with title + provenance in the full export.

## Remaining quarantines — reclassified as structured dependency holds

78 articles remain fail-closed, ALL on `include-tilde-path` (cross-repo
includes to unpinned upstream repositories). The compiler now emits a
STRUCTURED dependency manifest per quarantine instead of a bare reason:
per-article include references with target repo. Distribution by target repo
(from recompile receipts):

- powerquery-repo: 276 includes (data-factory 273, mirroring 3)
- kusto-repo: 25 (real-time-intelligence)
- powerbi-repo: 4 (enterprise)
- reusable-content: 2 (database 1, data-factory 1)

These are NOT recoverable locally: the upstream repositories are not pinned,
and the architecture forbids resolving cross-repo content against an uncleared
dependency (03 §Private intake). They are accounted dependency holds awaiting
the owner's dependency-acquisition decision; no partial publication is
permitted for them (fail-closed maintained; verified 0/81 present in the
full export).

## Verification

- Compiler suite: 63/63 (52 Wave-1 + new tolerance fixtures + dependency-manifest tests); fabric-corpus total 214/214.
- Determinism: unaffected — emit path unchanged; two-run byte-identity holds on recompiled families (receipt `schema` field versioned).
- Receipt schema extended (`quarantineSummary`, `dependencySummary`,
  `orphanConstructEndsSummary`) — `receipt.schema.json` updated.
- Lead re-ran: full battery 520/520 (after registry rebuild + downstream
  artifacts), full export 29,015 files, exclusion leak check 0/81.

## Deviations

1. CLI corpus root convention is now `<corpusRoot>/docs` (documented in the
   script header) — call sites in reports updated accordingly.
2. Include-resolution hardening in the renderer/loader (ArticleBody include
   trail, article-data nested rows/inline/header traversal, shard routing
   early-exit) delivered alongside as the same defect class discovered during
   the deep include work; covered by the extended search/compiler suites.
3. `build-shards.mjs` manifest aggregate field double-counts article entries
   across files (cosmetic; authoritative distinct-article count measured from
   shard contents = 2,716/2,716 published). Flagged for Wave-4 cleanup.

## NOT RUN

Browser/visual QA of recovered articles (programmatic HTML verification only);
production dependency acquisition (owner-gated); registry rebuild itself
(lead-run after this package).
