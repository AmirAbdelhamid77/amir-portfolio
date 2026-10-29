# REDIRECT DECISION — thin alias, not an HTTP redirect

## Decision

`/prototype-c/` is kept as a **thin alias that renders the same canonical
component**, with `noindex, nofollow` and `canonical: "/"`. No `_redirects` rule,
no Worker-side redirect, no duplicated JSX.

Recorded in `lib/site.ts`:

```ts
export const LANDING = {
  source: "components/knowledge/hansa-landing.tsx",
  canonical: "/",
  legacy: "/prototype-c/",
} as const;
```

## Why not a hosted redirect

1. **A fragment is never sent to the server.** Old links were shared as
   `/prototype-c/#archive`. Any HTTP redirect breaks `#archive`, because the
   server only ever sees `/prototype-c/`. An alias lets the browser keep the
   fragment and the page scroll to the same anchor.
2. **Query state is not a static redirect condition.** Cloudflare Workers static
   assets support `_redirects`, but its rules operate on static asset responses
   and do not match on dynamic query conditions. `?insight=<id>` must survive,
   because the landing reads it to select an edition.
3. **`output: "export"` has no server runtime.** Next static export cannot emit
   the usual server redirect/rewrite handling; the only levers are host-level
   rules or a real page.
4. **A 301 is a cache trap.** Browsers and intermediaries cache a permanent
   redirect aggressively; a wrong target would be hard to undo for exactly the
   users who bookmarked the old page.

The host still does the one redirect it must: with `html_handling:
"auto-trailing-slash"` and `trailingSlash: true`, `/prototype-c` (no slash)
301-redirects once to `/prototype-c/`. That was verified, including that the
alias itself does **not** redirect (no loop).

## Tested behaviour (measured, not asserted)

Local static export served by the project's own `scripts/serve-out.mjs`, the way
a static host serves `out/`:

| Request | Result | Source |
|---|---|---|
| `GET /` | `200`, root HTML is the knowledge stage | `evidence/verify-canonical-home.json` → `ROOT02` |
| `GET /prototype-c/` | `200`, same 5/5 stage markers as `/` | `ROUTE01`, `R3` |
| `GET /prototype-c` | `301` → `/prototype-c/`, once | `H054a` |
| `GET /prototype-c/` again (alias body) | no redirect emitted — no loop | `H054b` |
| `GET /?insight=hansa-insight-shortcut-reference-v1` | `200` | `URL01-05` |
| `GET /?insight=hansa-insight-shortcut-delete-v1#archive` | `200` | `URL01-05` |
| `GET /?insight=hansa-insight-shortcut-discovery-v1` | `200` | `URL01-05` |
| `GET /?insight=not-a-real-edition` | `200` → falls back to newest with an explanation | `URL04` (browser) |
| `GET /prototype-c/?insight=hansa-insight-shortcut-delete-v1#archive` | `200`, selects the deep-linked edition | `URL01-05` + `ROUTE01c` (browser) |
| `GET /intentionally-nonexistent-qa/` | `404` (real 404 page, not a homepage 200) | `SITE02` |

Browser-level confirmation (real Chromium, `scripts/qa-canonical-home.mjs`):

- `URL03` — fragment kept: `#archive`, archive visible.
- `H026` — `#archive` actually landed in view (`y=250`).
- `URL03b` — edition **and** anchor together select "Files versus Tables".
- `URL05` / `URL05b` — selecting an edition writes `/?insight=…` and Back
  restores the previous edition with no stale card content.
- `ROUTE01c` / `ROUTE01d` / `R3b` / `NAV01c` — the alias deep-links, renders the
  same landing, has no console errors, and points `Today` at the canonical root.

## Reversibility

- Turning the alias off (or adding a host-level 301 later) is a single-file change
  in `app/prototype-c/page.tsx` plus a metadata decision; the canonical landing is
  unaffected. See `ROLLBACK.md`.
- If a future redirect is wanted, it must be tested for query/fragment loss first.
  Fragments will always be lost by an HTTP redirect; that is a product decision the
  owner must make knowingly, not a technical detail.

## Residual risk

The measurement above is a **local static-server** measurement. Cloudflare's
`auto-trailing-slash` and `404-page` handling is configured in `wrangler.jsonc`
but was **not** exercised against the live host in this session, so production
slash behaviour is reported as NOT RUN, not PASS. Post-deploy smoke should repeat
`/prototype-c` (no slash) and one `?insight=…#archive` link.
