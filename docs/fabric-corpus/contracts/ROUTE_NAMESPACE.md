# Route namespace contract — FROZEN (FC01)

Status: frozen by FC01 on 2026-11-05 on branch `feat/fabric-corpus-20261105`.
Change authority: integration lead only, with owner approval for namespace changes.

## Reserved namespace

All compiled Fabric documentation articles publish under:

```
/learn/fabric/docs/<family>/<article>/
```

- `family` — the corpus top-level documentation family (resolved from the
  coverage ledger, e.g. `fundamentals`, `onelake`, `data-factory`,
  `real-time-intelligence`, `admin`, `security`, …). FC02's ledger assigns the
  final family per article; FC03 emits it into the route registry.
- `article` — the article slug, sanitized from the source file basename,
  deduplicated per family by the identity ledger. Slugs are ASCII, lowercase,
  hyphen-delimited, ≤100 chars.
- Trailing slash is mandatory (matches `next.config.ts` `trailingSlash: true`).

Logical route paths are **unprefixed**. The base path is applied exactly once
at the output boundary (see RELEASE_AND_STORAGE.md). Never hard-code a base
path inside article content or route registries.

## Next.js implementation shape (FC05)

- `app/learn/fabric/docs/[family]/[article]/page.tsx` — static parameters
  generated from the compiler-emitted route registry read from the build
  workspace (`FABRIC_CORPUS_BUILD_DIR`), not from any in-repo generated file.
- An optional docs index at `/learn/fabric/docs/` (depth 2) must be a real
  static route (`app/learn/fabric/docs/page.tsx`); it 404s cleanly today.

## Collision evidence (measured 2026-11-05 at 3d94030)

- `app/learn/fabric/` contains only `page.tsx`; no depth-2+ children exist.
- `app/learn/[subject]` is the data-viz lesson-slug route (`dynamicParams =
  false`); its source comment already documents that static subject routes
  such as `/learn/fabric` take precedence.
- `app/learn/[subject]/[topic]` (`dynamicParams = false`, params enumerated
  from `SUBJECTS × topics`) never generates unknown combinations.
- Built export check: `out/learn/fabric/docs` and `out/learn/docs` do not
  exist; no data-viz lesson slug equals `docs`; no `docs` literal in
  `lib/study/taxonomy.ts`.
- Verdict: the namespace is free in every slug registry. FC05 must still run
  the automated collision test (`generateStaticParams` output ∩ existing
  static/dynamic params = ∅ for `docs` and for every emitted family/article
  slug against `out/` route inventory).

## Slug registry rule

`docs` is reserved for this namespace and must not be adopted by any other
route, topic slug, or lesson slug. The identity registry (FC02) records the
reservation. Family slugs come from the corpus; if a family slug collides
with an existing first-level `/learn/fabric/` route name (`atlas`, `ingestion`
are reserved by DP-600 routes), the ledger records the disambiguation.
