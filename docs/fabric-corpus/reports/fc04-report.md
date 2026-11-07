# FC04 report — Atlas isolation hardening

Status: complete on branch `feat/fabric-corpus-20261105` (base commit `6d34e88`).
Scope: `lib/atlas/model.ts`, `lib/atlas/server.ts`, `tests/atlas/**`, this report.
`components/atlas/**` was deliberately untouched (isolation work is lib + tests).
No git commands were run; no `npm install`; no `npm run build` (integration
builds belong to the lead). No files outside the FC04 write areas were modified.

## 1. What changed

### 1.1 New file — `tests/atlas/isolation.test.mjs` (8 tests)

Covers the five deliverable areas:

- **(a) Public isolation.** A synthetic mixed fixture (2 published + 1
  technical_review + 1 candidate concept; published, technical_review and
  candidate edges; published/review/candidate catalog and TOC rows; a
  public-link source referenced only by withheld records) is built inside the
  test — `content/atlas/*.json` is not touched. `projectAtlas(fixture, false)`
  must retain exactly the published concepts/edges/sources/catalog/toc, render
  the fixed public notice, and its serialized form must contain none of the
  fixture's marker strings, no candidate record ids, and not even the word
  "candidate". A second assertion proves the review projection
  (`projectAtlas(fixture, true)`) admits `technical_review` records but never
  `candidate` records. The real merged dataset (same assembly as
  `server.ts` `DATA`) is also proven to project fully empty in public mode.
- **(b) Review-flag rejection.** The **real, unmodified `lib/atlas/server.ts`
  module graph is imported and executed in the test process** via
  `node:module registerHooks` (see 1.3). `getAtlasPublic()` output is captured
  with `HANSA_ATLAS_REVIEW_PREVIEW` unset and with the flag `=1`; the two
  projections must be structurally identical. Additionally:
  `getAtlasPublic() === projectAtlas(SERVER_DATA, false)` and
  `getAtlasReview() === projectAtlas(SERVER_DATA, true)` (proves the fixed
  preview arguments and the dataset assembly), while legacy `getAtlas()` still
  honors the flag (unset → public-equivalent, `=1` → review projection),
  pinning the documented legacy contract. `getAtlasReadingSources()` is
  asserted to stay bibliographic, public-link-only and 5-field only. A static
  tripwire asserts `getAtlasPublic()`/`getAtlasReview()` bodies contain no
  `process.env`.
- **(c) Legacy href families.** `validResourceHref()` accepts representative
  valid hrefs from all three families (including shipped catalog rows) and
  rejects: `/learn/fabric/docs/<family>/<article>/` (and `#anchor` variant —
  the FC08 tripwire), `javascript:alert(1)`, `//evil.example/...`,
  absolute `https://learn.microsoft.com/...`, `/../` traversal, missing
  trailing slash, case variants, unknown anchors, empty/uppercase/overlong
  ids, missing `question` param, unexpected query params (including a
  pre-attached `atlasReturn`), param escapes and overflow.
- **(d) atlasReturn.** `resourceReturnHref()` round-trips full view state
  (concept, edge, source, relation, hops, incoming, zoom, x, y) through the
  `atlasReturn` param on all three valid families while preserving the
  original question/pack/anchor, and returns `""` for every invalid input.
  `safeReturn()` round-trips and enforces the host-safety rules documented in
  `components/atlas/return-link.tsx` and `lib/atlas/model.ts`: same-origin
  atlas prefix only, **>= 2048 chars rejected**, no backslash, fail-closed
  property (anything admitted is always a same-origin atlas href).
- **(e) parseView/viewHref.** View state round-trips (with and without an
  edge); the unrecognized-field warning text and behavior are unchanged
  (unknown field → fixed warning + defaults preserved, mixed valid+unknown →
  valid field applied with warning, `v=2` → version warning with early return,
  unknown concept → concept warning, >2048 search → too-long warning, unknown
  edge/source ids → silently dropped with no warning — unchanged, deliberately
  not a warning), and numeric clamps hold.

### 1.2 Minimal lib fix revealed by the tests — `lib/atlas/model.ts`

The deliverable-(d) test failed before any change: `safeReturn` admitted an
`atlasReturn` of exactly 2048 characters (`value.length > 2048`), while the
documented rule and the client guard in
`components/atlas/return-link.tsx` (`v.length < 2048`) reject >= 2048. The
server-side gate on the atlasReturn admission path was weaker than both the
documented contract and the client. One-character, fail-closed fix:

```diff
 export function safeReturn(value: string | null, atlas: Atlas) {
-  if (!value || !value.startsWith("/learn/dp-600/atlas/?") || value.length > 2048 || value.includes("\\")) return "";
+  // >=2048 matches the documented rule and the client guard in
+  // components/atlas/return-link.tsx (length < 2048): the server-side gate
+  // must never be weaker than the client's for the same return-state param.
+  if (!value || !value.startsWith("/learn/dp-600/atlas/?") || value.length >= 2048 || value.includes("\\")) return "";
```

Impact analysis: only inputs of exactly 2048 chars (previously admitted) are
now rejected; `AtlasPeek` would show no return link for such a URL (previously
it would). Legitimate `viewHref()` outputs are ~200 chars max, so no working
behavior changes; `resourceReturnHref` and `validResourceHref` are untouched.
This is the only lib change. `parseView`'s separate 2048 rule ("This Atlas
link is too long") was intentionally not altered.

### 1.3 How `server.ts` is exercised without a refactor

`server.ts` cannot be imported under plain `node --test` (its `@/content/…`
aliases and JSON imports are unresolvable), and the brief allows either a
minimal production refactor or using `model.ts` directly. Both were used:
synthetic fixtures go through `model.ts` `projectAtlas` directly, and the real
`server.ts` module graph is imported **unmodified** via `node:module
registerHooks` — the resolve hook maps `@/content/atlas/*.json` to repo files
and the extensionless `./model` import to `model.ts`; the load hook serves
those JSON bytes as a plain JS module. Node never performs an alias resolution
or a JSON import itself, so the "no @/ aliases, no JSON imports in
test-imported modules" constraint holds while giving real behavioral evidence
for (b). No production refactor was needed. The server-level test skips
cleanly on Node builds without `registerHooks` (verified on Node v22.23.3).

## 2. Test evidence

Command (repo root):

```
node --experimental-strip-types --test tests/atlas/*.test.mjs
```

Result after the fix: **33 tests, 33 pass, 0 fail, 0 skipped, 0 cancelled**.
Breakdown: circle-layout 3, continuation 5, expansion 5, **isolation 8 (new)**,
model 7, peek-layout 5 — every pre-existing atlas test still passes.

Isolation file alone: `node --experimental-strip-types --test
tests/atlas/isolation.test.mjs` → 8 tests, 8 pass.

Evidence trail for the fix: first run of `isolation.test.mjs` was **7 pass /
1 fail** — the failure was exactly the 2048-char `safeReturn` admission
(`actual: '/learn/dp-600/atlas/?v=1&concept=…'`, `expected: ''`), which
motivated the 1.2 change; the re-run is 8/8, and the full suite is 33/33.

No pre-existing failures anywhere in `tests/atlas/` were observed before or
after the change.

## 3. Typed-target contract PROPOSAL for FC08 (mechanism design only — no implementation)

Goal: admit `/learn/fabric/docs/<family>/<article>[#anchor]` targets as a
**separate typed target family with approved-route-ID resolution only**, never
by editing `validResourceHref`. The isolation test now permanently asserts
that `validResourceHref("/learn/fabric/docs/…") === false`, so widening the
legacy regex fails CI.

Proposed mechanism (FC08 owns `lib/atlas/fabric-targets.ts` and
`content/atlas/fabric-extension.json`):

1. **Targets are typed objects, not strings.** A Fabric resource record
   carries `target: { kind: "fabric-article"; routeTargetId: string }` where
   `routeTargetId` is a `rt:/learn/fabric/docs/<family>/<article>/[#anchor]`
   ID from the frozen identity registry (IDENTITY_REGISTRY.md). The legacy
   `href` field stays reserved for the three DP-600 families; a record with
   both `href` and a fabric `target` is invalid (one admission mechanism per
   record, no double admission).
2. **Approved-route-ID resolution only.** `resolveFabricTarget(routeTargetId,
   registry)` admits a target solely by exact-match lookup in the
   compiler-emitted route registry (FC03 output read from the build workspace,
   per ROUTE_NAMESPACE.md). No prefix rules, no regex over path strings, no
   normalization, no alias guessing beyond registry-listed aliases. Unknown
   `routeTargetId` → fail closed (throw in `validateDataset`; drop at
   projection time), never silently degrade. A missing/stale registry at build
   time fails the build.
3. **Anchor set membership.** An anchor must be a member of the article's
   approved anchor list in the registry; unknown anchors are rejected, not
   trimmed. Route ids resolve to hrefs only through a registry-driven
   generator (`fabricArticleHref(target, registry)`), so the base-path rule
   (applied once at the output boundary) is preserved.
4. **Projection gating is inherited, not widened.** Fabric rows live in the
   same `catalog` array, so `projectAtlas`'s editorialState filter applies
   unchanged: only published rows reach the public projection. No new preview
   channel is introduced.
5. **Returns: local-only state.** `resourceReturnHref()` stays untouched for
   legacy families; a parallel `fabricResourceReturnHref(target, view)` may
   append `atlasReturn` **only** to approved local route targets (always the
   case for registry-resolved route IDs). For **external evidence** — vetted
   external source URLs resolved separately as vetted source IDs — local
   return state is never attached: no `atlasReturn`, no view params on
   outbound external links. This keeps local view state inside the origin,
   keeps provenance links clean, and makes the FC12 scan (§4, item 7)
   mechanical. Article→Atlas back-links reuse the existing
   `AtlasReturnLink`/`safeReturn` path, which is already same-origin-only.
6. **Question-bank dereference audit.** Any consumer that dereferences
   resource targets by id must resolve through the same typed resolver; the
   audit required by the architecture doc's Atlas section applies to
   `components/atlas/explorer.tsx` and the peek/return consumers when FC08
   lands.

## 4. Public-fingerprint checklist for FC12 CI

A release-build scan must assert, over the actual exported HTML, RSC/flight
payloads, TXT payloads and client JS (not the source tree):

1. Zero non-published concept records: no `concept:fabric:*` id, title,
   alias, definition or `mapLabel` value outside the published set (today:
   the published set is empty, so no `concept:fabric:` record at all).
2. Zero non-published edge records: no edge id, claim, conditions, rationale
   or reviewer string outside the published set.
3. Zero catalog rows and zero TOC rows outside the published projection (ids,
   titles, hrefs).
4. `reviewNotice` absent from every public artifact; the fixed public notice
   string ("The reviewed public graph is not yet published. …") present as a
   positive canary on Atlas surfaces.
5. The literal `HANSA_ATLAS_REVIEW_PREVIEW` absent from all client JS and
   serialized payloads (a server-only env read must never be inlined into a
   bundle).
6. No serialized `"preview":true` Atlas payload in HTML/RSC output.
7. Every `atlasReturn=` occurrence sits in an href beginning `/learn/` or
   `/lab/` — never on an `http(s)://` external link.
8. Every `/learn/fabric/docs/…` href in the export resolves to an approved
   `RouteTarget` in the shipped route registry manifest; zero orphan article
   hrefs.
9. `getAtlasReadingSources` footprint: only `learn.microsoft.com` URLs, and
   the `visibility` field never serialized.
10. Reviewer identity strings (`"Human: …"`, `"Agent: …"`) absent from public
    artifacts. OPEN owner decision recorded: a *published* graph would today
    keep `reviewer`/`checkedAt` on public edges; if reviewer names must not be
    public, `projectAtlas` must strip those fields from the public projection
    before item 10 can pass with a non-empty published graph. Nothing to strip
    today (public graph is empty).

## 5. Status table

| Item | Status | Evidence |
|---|---|---|
| 1a Public isolation (synthetic fixture + real DATA, candidate/withheld excluded) | PASS | isolation.test.mjs tests 1–3 |
| 1b getAtlasPublic identical under flag unset vs =1 | PASS | isolation.test.mjs tests 3–4 |
| 1c Legacy href families accept/reject incl. `/learn/fabric/docs` rejection | PASS | isolation.test.mjs test 5 |
| 1d atlasReturn round-trip + >=2048/backslash/host rules | PASS (after 1.2 fix) | isolation.test.mjs tests 6–7; pre-fix run 7/8 |
| 1e parseView/viewHref round-trip + unchanged warnings | PASS | isolation.test.mjs test 8 |
| 2 Real isolation gaps found and fixed | PASS — 1 gap (safeReturn 2048 boundary), 1-char fix in `lib/atlas/model.ts` | §1.2 |
| 4 Full `tests/atlas/*.test.mjs` suite after changes | PASS — 33/33 | §2 |
| `npm run build` | NOT RUN | prohibited for FC04; lead runs integration builds |
| `components/atlas/**` changes | NOT RUN (none made — by design) | — |
| Suites outside `tests/atlas/` | NOT RUN (not affected: only `lib/atlas/model.ts`, `tests/atlas/`, this report changed) | — |

## 6. Findings and risks

- **HIGH — outside my write areas, needs lead/owner action.**
  `components/knowledge/hansa-landing.tsx` (the Home landing) still calls the
  env-driven `getAtlas()`, while `lib/atlas/server.ts`'s own doc comment
  requires the Home to call `getAtlasPublic()`. With
  `HANSA_ATLAS_REVIEW_PREVIEW=1`, the Home would render the full review graph
  publicly. The one-line consumer change belongs to whoever owns
  `components/knowledge/**` (not in the FC04 map). Related, documented-and-
  unchanged legacy behavior: `app/learn/dp-600/atlas/page.tsx`,
  `app/lab/dp-600/explore/page.tsx`, `app/learn/dp-600/ingestion/page.tsx`
  and `app/learn/dp-600/page.tsx` call `getAtlas()`; the Atlas Explorer page
  is publicly routable, so the flag exposes the review graph there by design.
- **Accepted observation, no change made:** `projectAtlas` returns filtered
  arrays of the *same* record references (no deep clone). Safe under RSC
  serialization; an in-process consumer that mutated a returned record would
  alias `DATA`. If such a consumer ever appears, clone/freeze in
  `projectAtlas` — not needed for any current call site.
- **Test-infra dependency:** the server-level flag-invariance test needs
  `node:module registerHooks` (Node ≥ 22.15; verified on v22.23.3) and skips
  cleanly otherwise; the other 7 isolation tests have no such dependency.
- **Recovery point:** no commit made (git commands prohibited). Worktree
  state = `feat/fabric-corpus-20261105` @ `6d34e88` + uncommitted FC04 paths:
  `lib/atlas/model.ts` (1.2), `tests/atlas/isolation.test.mjs` (new), this
  report. The lead should commit at the next contract checkpoint.
