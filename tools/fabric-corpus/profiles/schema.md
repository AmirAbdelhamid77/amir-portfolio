# Delivery profile schema — v1 (FC11)

Status: schema v1 defined by FC11 on 2026-11-05, worktree
`amir-portfolio-fabric`, branch `feat/fabric-corpus-20261105`. Evolves the
FC01 seed freeze in `docs/fabric-corpus/contracts/RELEASE_AND_STORAGE.md`
§"Delivery profiles"; the seven-field set stays frozen until the integration
lead re-opens it. Enforcing implementation: `lib/fabric/paths.ts`
(`validateProfile`), pure and dependency-free, FC11-owned. The seed freeze
annotations from the FC01 seeds ("profiles differ only in delivery settings;
identical logical coverage"; "origins require separate owner approval before
any activation"; "basePath is set per repository name at packaging time,
never hard-coded") are absorbed into this document; the seeds themselves now
carry only the v1 field set.

## Purpose

A delivery profile is the complete set of delivery-only settings that turns
one frozen content release into one deployment target. The two mandatory
profiles — `root` (Vercel primary, Cloudflare optional) and `subpath` (GitHub
Pages project site) — differ ONLY in these fields and MUST have identical
logical article, search, curriculum and Atlas coverage (RELEASE_AND_STORAGE.md;
handover 03 §"Hosting-agnostic release contract"). Profiles never select
different articles or application logic.

## Field set (v1)

| Field | Type | `root` value | `subpath` value | Validation rule (`validateProfile`) | Who may change |
|---|---|---|---|---|---|
| `profile` | `"root" \| "subpath"` | `"root"` | `"subpath"` | Exactly one of the two literals; a third target kind is a schema v2 change | FC11 (schema); integration lead merges |
| `basePath` | string | `""` | `"/<repository>"` | `""` for root; otherwise starts with `"/"`, does not end with `"/"`, no `"//"` segments, no backslash/whitespace/`?`/`#`, no `.` or `..` segments, ASCII `[A-Za-z0-9._~-]` per segment. Profile-consistent (root ⇔ `""`, subpath ⇔ non-empty) | Packaging step (FC12) at build time from the repository name — never hard-coded in source, content or registries |
| `publicOrigin` | string | owner-approved canonical origin | `"https://<owner>.github.io"` (or approved mirror policy) | https origin only (no path, no user info; optional 1–5 digit port), or the literal `"TO_BE_APPROVED"` until approval. Plain http rejected | Owner only, via the approval gate |
| `canonicalOrigin` | string | the approved canonical host | same | Same rule as `publicOrigin` | Owner only, via the approval gate |
| `trailingSlash` | literal `true` | `true` | `true` | Must be exactly `true` (frozen v1; matches `next.config.ts` `trailingSlash: true` and the mandatory trailing slash of the Fabric route namespace) | Frozen — change requires a RELEASE_AND_STORAGE.md contract revision |
| `assetOrigin` | string | optional immutable asset origin | `""` | `""`, an https origin, or `"TO_BE_APPROVED"`. Any non-empty value requires owner approval (handover 03: approved immutable independent delivery with exact version manifest, integrity checks and CORS) | Owner only; schema FC11 |
| `robotsPolicy` | `"canonical" \| "mirror"` | `"canonical"` (post-approval) | `"canonical"` (post-approval) | One of the two literals (semantics below) | FC11 + owner gate |

Unknown annotation fields are tolerated (ignored) by `validateProfile` so the
schema can gain metadata without invalidating older shapes; the seeds carry
exactly the seven fields above.

## The base-path-once rule

Route registries and every content-owned URL stay **unprefixed**. Exactly one
resolver — `lib/fabric/paths.ts` — adds the base path, exactly once, at the
output boundary. Output boundary call sites (handover 03, verbatim scope):
assets, links, redirects, search shard URLs and result targets, Atlas
returns, fragments, sitemap, robots and social metadata.

- Page URLs: `buildPublicUrl(logicalPath, profile)` — applies `basePath`,
  normalizes the trailing slash to the profile policy, preserves `?query` and
  `#hash` verbatim.
- Asset URLs: `buildAssetUrl(assetPath, profile)` — see routing semantics
  below; file URLs never gain a trailing slash.
- Absolute metadata URLs (sitemap, robots, social cards):
  `absoluteCanonicalUrl(logicalPath, profile)` — `canonicalOrigin` plus the
  base-pathed URL; throws on an unapproved canonical origin.
- Alias-page redirect targets: `safeRedirectTarget(raw)` — same-origin gate,
  query/hash preserved (semantics below).

Renderer-agnostic rule (WORK_PACKAGE_OWNERSHIP.md): none of these functions
imports a framework, reads the filesystem, or assumes Next dynamic routes
versus a static HTML compiler. Either renderer — App Router static params or
the same-origin static HTML compiler — calls the same pure functions.

## The no-double-prefix rule (Next-internal URLs vs raw content URLs)

With `basePath: "/repo"` set in `next.config.ts`, Next.js applies the base
path to **its own** URLs automatically. Content-owned URLs are raw logical
paths that Next never touches, so the resolver must prefix exactly those:

```tsx
// Next-internal URL: Next applies basePath itself.
<Link href="/learn/fabric/docs/onelake/intro/">
// renders <a href="/repo/learn/fabric/docs/onelake/intro/"> — do NOT re-resolve.

// next/image src, router.push("/learn/..."), _next/static asset paths:
// all already base-pathed by Next (next.config.ts assetPrefix = basePath).

// Content-owned URL (compiler-emitted HTML, shard URL, Atlas return,
// sitemap entry, alias target): raw logical path, Next does not touch it.
buildPublicUrl("/learn/fabric/docs/onelake/intro/", profile);
// → "/repo/learn/fabric/docs/onelake/intro/"
```

Feeding a Next-rendered URL back through `buildPublicUrl`/`buildAssetUrl`
would publish `/repo/repo/learn/...`. Both functions therefore **throw** when
the input path already equals or starts with `basePath + "/"` (segment-bound:
`/repoX/...` under `basePath: "/repo"` is NOT a match). The error message
names the rule and lists the Next-internal URL kinds. The behaviour is pinned
by `tests/fabric-corpus/paths/paths.test.mjs` (FC11 fixture referenced by
RELEASE_AND_STORAGE.md).

## Asset-origin routing (`buildAssetUrl`)

- `assetOrigin === ""` (both v1 seeds): assets ride the public base path,
  same as pages.
- `assetOrigin` set and owner-approved: the origin **replaces** the base
  entirely — the approved immutable independent delivery hosts the logical
  asset tree at its root (`buildAssetUrl("/shards/search-0.json", p)` →
  `"https://assets.example/shards/search-0.json"`). No base path is added;
  the base-path-once rule is honoured by substitution, not stacking.
- File URLs are never slash-terminated: the `trailingSlash` policy governs
  document URLs only (matches `next.config.ts` assetPrefix behaviour).
- No asset origin is approved in v1; any non-empty value is an owner gate.

## Robots policy semantics

- `"canonical"`: this deployment is the approved canonical host. `robots.txt`
  allows crawling; the sitemap and social metadata point at
  `canonicalOrigin`; mirrors and previews must canonicalise to it.
- `"mirror"`: preview/mirror deployment. `robots.txt` disallows crawling and
  the deployment must never be referenced as canonical by anything.

A profile whose origins are still `"TO_BE_APPROVED"` can be validated and used
to resolve relative URLs, but must never be activated or emitted as absolute
metadata: `validateProfile` accepts the placeholder at the config level, while
`absoluteCanonicalUrl` throws at the output level. Origin approval is a
separate owner gate; deployment activation is a separate gate again
(RELEASE_AND_STORAGE.md).

## Alias-page redirect gate (`safeRedirectTarget`)

Static alias pages forward only safe same-origin targets (handover 03:
"Generate static alias pages with visible links and safe query/hash
forwarding where HTTP redirects are unavailable"):

- Accepted: a string starting with `"/"` (no scheme), not protocol-relative
  (`"//"`), no backslash anywhere, no control characters, at most 2048
  characters; query and hash preserved verbatim.
- Rejected (returns `null`, never throws): absolute URLs
  (`"https://evil.example/x"`), protocol-relative (`"//evil.example"`),
  backslash forms (`"/\evil"`), over-length, empty, non-strings.
- A `null` result means "no approved target": the alias page falls back to a
  visible, unparameterized link and must never pass the raw value through.

## Seeds

`root.json` and `subpath.json` are the two mandatory profiles built from the
same frozen content release. `TO_BE_APPROVED` placeholders remain until the
owner approves origins; `subpath.basePath` remains the `"/REPOSITORY_NAME"`
placeholder until the packaging step injects the real repository name at
build time. Neither placeholder is ever hard-coded into source, content or
route registries.

## Change log

- v1 (2026-11-05, FC11): froze the seven-field set from the FC01 seed; added
  validation rules, the no-double-prefix contract with the Next-internal-URL
  example, asset-origin routing semantics, robots policy enum, the
  alias-page redirect gate, and the base-path-once statement; reduced the
  seeds to exactly the v1 field set.
