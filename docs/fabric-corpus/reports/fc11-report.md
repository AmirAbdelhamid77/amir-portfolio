# FC11 (Portability) batch report — delivery profile schema v1 + base-path-once resolver

- Date: 2026-11-05
- Worktree: `D:\BeUI\amir-portfolio-fabric`, branch `feat/fabric-corpus-20261105`
- Source revision: working tree as found by FC11 at task start (no git commands
  run, per FC11 hard constraint). Recovery point: the integration lead should
  stamp the commit hash when merging this batch; no ledger snapshot was needed
  (no shared contract file was edited).
- Ownership: FC11 write-exclusive areas only. `lib/site.ts`, `next.config.ts`,
  `package.json` and all other packages' areas untouched (verified by review of
  the file list below; only the five listed paths were created/modified).

## What was delivered

Wave 1 of the portability layer: the standalone, tested resolver that applies
the base path EXACTLY ONCE at the output boundary, plus delivery profile
schema v1 and seeds. Renderer-agnostic throughout: pure string functions, no
imports, no fs, no framework calls — usable by Next static routes and by a
static HTML compiler alike. Wiring into the app is FC05's job once routes
exist (per task brief; WORK_PACKAGE_OWNERSHIP.md lists base-path integration
in `lib/site.ts` as a reviewed FC11 change, deliberately deferred to the
wiring wave).

### Files created / modified

| Path | Status | Purpose |
|---|---|---|
| `lib/fabric/paths.ts` | NEW | Pure resolver: `DeliveryProfile`, `RobotsPolicy`, `validateProfile`, `buildPublicUrl`, `buildAssetUrl`, `absoluteCanonicalUrl`, `safeRedirectTarget`, plus `ORIGIN_PLACEHOLDER` / `SAFE_REDIRECT_MAX_LENGTH` constants and `isOriginApproved`. Zero runtime dependencies; types only + functions; erasable-syntax TS (runs under `node --experimental-strip-types`). |
| `tools/fabric-corpus/profiles/schema.md` | NEW | Profile schema v1: field table (name, type, root/subpath values, validation rule, who may change), base-path-once rule, no-double-prefix rule with the Next-internal-URL example, asset-origin routing semantics, canonical/mirror robots semantics, alias-page redirect gate, change log. |
| `tools/fabric-corpus/profiles/root.json` | MODIFIED | Reduced to exactly the seven v1 fields; `TO_BE_APPROVED` origin placeholders kept (owner gate). Seed note text absorbed into schema.md. |
| `tools/fabric-corpus/profiles/subpath.json` | MODIFIED | Same; `basePath` remains the `/REPOSITORY_NAME` packaging placeholder, never hard-coded. |
| `tests/fabric-corpus/paths/paths.test.mjs` | NEW | 23 tests; imports `../../../lib/fabric/paths.ts` with explicit relative `.ts` extension, no `@/` aliases, no JSON imports (seeds read via `fs`, like build-time consumers). |
| `docs/fabric-corpus/reports/fc11-report.md` | NEW | This report. |

### Resolver semantics (summary; full contract text in schema.md and paths.ts doc comments)

1. **Base-path-once** (RELEASE_AND_STORAGE.md §"Delivery profiles"; handover 03
   §"Hosting-agnostic release contract"): inputs are always UNPREFIXED logical
   paths starting with `/`; the resolver adds `basePath` once at the output
   boundary. `buildPublicUrl` = pages/links/redirects/shard URLs/result
   targets/Atlas returns; `buildAssetUrl` = media/shards/licensed files;
   `absoluteCanonicalUrl` = sitemap/robots/social metadata.
2. **No-double-prefix**: any input whose path portion equals or starts with
   `basePath + "/"` throws with a message naming the rule and the
   Next-internal URL kinds (next/link hrefs, next/image src, router results,
   `_next/static` — Next base-paths those itself). Segment-boundary matched:
   `/repoX/…` under `basePath: "/repo"` is NOT a match and resolves normally.
3. **Trailing slash**: path portion normalized to `profile.trailingSlash`
   (frozen `true` v1, matches `next.config.ts`); `?query`/`#hash` preserved
   verbatim and re-attached after normalization; empty query/fragment markers
   dropped. Asset URLs never gain a slash (file URLs).
4. **Asset origin routing**: `assetOrigin === ""` → basePath; non-empty (owner
   approved) → the origin REPLACES the base entirely (independent delivery
   hosts the logical asset tree at its root). No asset origin approved in v1.
5. **Canonical URLs fail closed**: `absoluteCanonicalUrl` throws when
   `canonicalOrigin` is `TO_BE_APPROVED` or malformed — an unapproved origin is
   never emitted. `validateProfile` still accepts placeholders (config level).
6. **Alias-page redirect gate** (handover 03: "alias pages preserve approved
   query/hash behavior and reject unsafe redirects"): `safeRedirectTarget`
   returns the input verbatim only if it is a string starting with `/`, not
   protocol-relative `//`, no backslash anywhere, no control characters,
   ≤ 2048 chars; otherwise `null`. Callers must treat `null` as "no approved
   target" (visible unparameterized link fallback), never pass the raw value.
7. **validateProfile** throws on: non-objects; unknown `profile` kinds;
   basePath not matching `""`-or-`/segment…` rules (no leading slash, trailing
   slash, `//`, backslash/whitespace/`?`/`#`, `.`/`..` segments, charset
   `[A-Za-z0-9._~-]`), or profile-inconsistent values (root ⇔ `""`, subpath ⇔
   non-empty); non-https origins (plain http, paths, user info, empty hosts
   rejected; optional 1–5 digit port allowed); `trailingSlash !== true`;
   `assetOrigin` not `""`/https/placeholder; `robotsPolicy` outside
   `canonical`/`mirror`. Unknown annotation fields are tolerated (ignored).

## Checks

| Check | Command | Result |
|---|---|---|
| Targeted resolver tests | `node --experimental-strip-types --test tests/fabric-corpus/paths/paths.test.mjs` | PASS — 23/23 tests, 0 fail, 0 skipped (~0.3 s) |
| Mandated directory-wide run | `node --experimental-strip-types --test tests/fabric-corpus/` | FAIL — environment-level CLI limitation, see below |
| Directory-wide equivalent (glob) | `node --experimental-strip-types --test "tests/fabric-corpus/**/*.test.mjs"` | PASS — 23/23 tests, 0 fail |
| Other fabric-corpus packages' test dirs | — | NOT RUN — none exist yet (`tests/fabric-corpus/` contains only `paths/`); nothing to run |
| Existing repo suites regression | — | NOT RUN — out of FC11 scope (no shared file touched); lead runs integration builds/tests |
| `npm run build` | — | NOT RUN — forbidden by FC11 hard constraints (lead runs integration builds) |
| Visual/domain QA | — | NOT RUN / not applicable — pure logic layer, no visual surface, no domain content |

**Mandated directory-wide command — failure analysis (not a code defect):**
`node --experimental-strip-types --test tests/fabric-corpus/` fails with
`Cannot find module 'D:\...\tests\fabric-corpus' (MODULE_NOT_FOUND)` on Node
v22.23.3 / win32 — the positional directory argument is resolved as a module
instead of being scanned. Reproduced identically: (a) with the pre-existing
`tests/data-viz` directory, (b) without the trailing slash, and (c) via
`cmd.exe` (`node --experimental-strip-types --test tests\fabric-corpus`), so
it is not Git Bash path mangling. The repo's own `package.json` test scripts
all use explicit glob arguments (`"tests/data-viz/*.test.mjs"`, …),
corroborating this host behavior. The glob equivalent passes 23/23. If the
lead wants an `npm` script later, the glob pattern is the form that works on
this host; `package.json` is outside FC11's write area, so nothing was
changed.

## Component/library rationale

No third-party library was introduced. The resolver is ~330 lines of
dependency-free TypeScript so that (a) the frozen base-path-once rule has
exactly one implementation both renderers can call, (b) the no-double-prefix
contract can throw with an instructive message instead of silently publishing
`/repo/repo/...`, and (c) tests run with the repo's existing zero-install
`node --experimental-strip-types --test` setup. Costs: none (no new dependency,
no runtime cost beyond string ops, no paid service).

## Coverage of source contracts

- RELEASE_AND_STORAGE.md §"Delivery profiles" — frozen field set implemented
  1:1 (`basePath`, `publicOrigin`, `canonicalOrigin`, `trailingSlash`,
  `assetOrigin`, `robotsPolicy`, profile kind); both seeds validate; the
  referenced FC11 no-double-prefix test fixture exists in
  `tests/fabric-corpus/paths/paths.test.mjs`.
- Handover 03 §"Hosting-agnostic release contract" — one resolver, output
  boundary list, Next-internal-URL no-double-prefix contract, project-Pages
  `/<repository>`, root empty base path, canonical/mirror marking, static
  alias pages with safe query/hash forwarding — all implemented and tested.
- ROUTE_NAMESPACE.md — trailing slash mandatory; logical paths unprefixed;
  resolver never hard-codes a base path (no hardcoded route strings at all).
- WORK_PACKAGE_OWNERSHIP.md — write areas respected; renderer selection left
  OPEN (no assumption of App Router vs static HTML compiler).

## Deviations and interpretations (explicit for lead review)

1. **Asset URLs are never slash-terminated.** `buildAssetUrl` performs no
   trailing-slash normalization even though the profile policy is `true`:
   the policy governs document URLs; file URLs with a trailing slash break
   (and Next's `assetPrefix` behaviour matches). Documented in paths.ts and
   schema.md; pinned by tests.
2. **`assetOrigin` replaces the base entirely when set** (output =
   `assetOrigin + logicalPath`), rather than `assetOrigin + basePath + path`.
   Reading of "uses assetOrigin when non-empty, else basePath" plus handover
   03's "independent delivery" language. No asset origin is approved in v1,
   so the semantic is unexercised in production until the owner gate — flag
   for owner confirmation before any non-empty value is approved.
3. **`validateProfile` tolerates unknown annotation fields** (ignored), so
   the schema can gain metadata without invalidating older shapes. The v1
   seeds carry exactly the seven fields; the FC01 seed's `target`/`note`
   values were moved into schema.md prose (nothing lost).
4. **Profile/basePath consistency enforced** (root ⇔ `""`, subpath ⇔
   non-empty) — stricter than the task's minimum ("non-empty basePath must
   start with '/' and not end with '/'") but exactly what the frozen contract
   table pins. Documented and tested.
5. **`lib/fabric/` already contained pre-existing app files** (classify.ts,
   engine.ts, taxonomy.ts, …). FC11's write area is `lib/fabric/paths.ts` +
   internal helpers; only `paths.ts` was added there, existing files untouched.

## Risks

- **CLI quirk for directory-wide test runs on this host** (see failure
  analysis): future fabric-corpus test packages should use the glob form in
  their runner invocations, or the lead may prefer fixing the runner script
  form centrally (outside FC11's area).
- **Asset-origin semantics await owner confirmation** (deviation 2). Any
  approved non-empty `assetOrigin` also needs the version manifest /
  integrity / CORS arrangement from handover 03 before use.
- **Placeholders block absolute-URL emission by design**: sitemap, robots and
  social metadata cannot be generated from either seed until the owner
  approves origins; relative resolution works immediately. This is the
  intended fail-closed behavior, but downstream packages (FC05/FC07/FC10)
  should code against the throw.
- **TS subset**: `paths.ts` is written in erasable-syntax TypeScript (no
  enums/namespaces) so it runs under `node --experimental-strip-types`; a
  future switch to `tsc`-typechecking is unaffected.

## Next atomic task

Wiring wave (FC05-led, FC11 supporting): route `lib/site.ts` base-path
integration and the first consumer call sites (`buildPublicUrl` for content
links, `buildAssetUrl` for media, `absoluteCanonicalUrl` for metadata,
`safeRedirectTarget` in alias pages) once the route registry contract exists
— per the task brief and WORK_PACKAGE_OWNERSHIP.md.
