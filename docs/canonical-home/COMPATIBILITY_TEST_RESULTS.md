# COMPATIBILITY TEST RESULTS — canonical `/`, legacy `/prototype-c/`

Two independent evidence sets, both produced on the working tree of
`feat/dp600-academy-ingestion-20261025` (no deployment):

1. **HTTP + static export audit** — `node scripts/verify-canonical-home.mjs --port 4312`
   → `evidence/verify-canonical-home.json` (35 checks, `failed: []`, `routeCrawlFailures: []`).
2. **Real-browser QA** — `node scripts/qa-canonical-home.mjs` against the local export
   → `evidence/qa-canonical-home.json` (46 checks, all `pass: true`) plus six
   screenshots in `evidence/`.

## Critical journeys

| Journey | Status | Evidence |
|---|---|---|
| Root renders the knowledge stage and refreshes into it | **PASS** | `out/index.html` contains all 5 stage markers; `GET / → 200`; `ROOT02/H052`, `ROOT01`; browser `ROOT01`, `ROOT02` (no console errors) |
| The retired gateway directory is gone from `/` | **PASS** | `ROOT01b` (HTTP: no retired markers) + browser `ROOT01b` |
| No prototype/experimental framing in public HTML | **PASS** | `R4`, `R4b`; browser `ROOT01c` |
| Legacy `/prototype-c/` still works, unchanged | **PASS** | `ROUTE01`, `R3` (5/5 shared markers), browser `R3b` |
| `/prototype-c` (no slash) resolves once, no loop | **PASS** | `H054a` 301 → `/prototype-c/`, `H054b` no further redirect |
| Old `?insight=` deep links keep their selection | **PASS** | HTTP `URL01-05` (3 IDs + unknown + hashed) 200; browser `URL01b/02b/03b` select the right edition; `URL04` unknown ID falls back with an explanation |
| `#archive` fragment | **PASS** | browser `URL03` (`#archive` kept, archive visible), `H026` landed in view at `y=250` |
| Edition + anchor together | **PASS** | `URL03b` selects "Files versus Tables" with the rail agreeing |
| Selection is reflected in the URL, Back restores it | **PASS** | `URL05`, `URL05b` |
| Archive filters and root-scoped permalinks | **PASS** | `ARCHIVE01` (search "permissions" → 1 edition), `ARCHIVE02` (`/?insight=hansa-insight-shortcut-delete-v1`) |
| Daily insight + scenario reveal/reset | **PASS** | `URL01` (bare `/` opens newest edition + scenario), `SCENARIO02/02b/02c` |
| Editions rail: pointer and keyboard | **PASS** | `TIMELINE01` (rail next), `TIMELINE02` (ArrowRight, focus stays in the rail), `KEYBOARD01c` (Home handled without trapping focus) |
| Card dealer deal / open / close | **PASS** | `DEALER01` (3 dealt), `DEALER02` (panel, 335 chars), `DEALER03` (close returns card, no leftover overlay) |
| Atlas pending state, no fabricated edges | **PASS** | Source guard (`Reviewed connections are not published yet`, no "Explore the full Atlas" CTA) + browser stage renders the peek without console errors |
| Header `Today` marks the canonical root, alias included | **PASS** | `NAV01`, `NAV01c`; zero links to the legacy address in the landing (`NAV01b`) |
| Learn / Practice / About / Search reachable | **PASS** | `LANDING_NAV` + `NAV` registry guard in `tests/knowledge/canonical-home.test.mjs`; footer groups intact; all 119 exported routes answered 200 (`H063`) |
| Question-bank progress untouched | **PASS** | browser `H064/STATE`: "progress namespaces unchanged; landing wrote nothing"; source guard: no landing file references browser storage |
| Unknown path is a real 404 | **PASS** | `SITE02` `GET /intentionally-nonexistent-qa/ → 404`, `out/404.html` exists (`SITE02b`) |
| SEO: one indexed homepage | **PASS** | `H043` root title, `H045c` root canonical, `H044`/`H044b` OG+Twitter, `H045a/b` alias noindex + canonical `/`, `H046a` alias absent from sitemap, `H046b/c` homepage 1× and 117 routes, `H045d/e` robots |
| Mobile 320 / 390 / 768 | **PASS** | `MOBILE01` ×3: horizontal overflow 0px |
| Light/dark at 1280 | **PASS** | `DESKTOP01` (light, no console errors); `evidence/root-desktop-1280-light.png`, `…-dark.png` |
| Reduced motion | **PASS** | `REDUCED01` every control keeps working |
| No JavaScript | **PASS** | `NOJS01` archive and reasoning readable; `evidence/root-nojs-1280.png` |
| Keyboard + screen reader smoke | **PASS** | `KEYBOARD01a/b` skip link and first Tab to `#main`; `ACCESS01` axe: 0 non-serious findings |
| Whole-site route regression | **PASS** | `H063` 119 exported routes answered 200; census reconciles all 117 audit routes |
| Author identity still credited | **PASS** | `R9` |

## Route regression matrix (owner audit vs this repository)

| Set | Count | Result |
|---|---|---|
| Owner audit internal linked routes | 117 | Every one exists as a source route or an export — `auditRowsWithoutExportOrSource: []` |
| Source route files (`app/**/page.tsx`) | 57 | Includes dynamic segments (`[slug]`, `[number]`) that expand into the audit's URLs |
| Exported routes answering 200 | 119 | `H063` |
| Sitemap entries | 117 | `H046c` |
| Exported but not in the audit | 3 | `/learn/drafts/`, `/practice/drafts/` (created by the parallel intake work during this session), `/prototype-c/` (**the omission the audit itself flagged**) |
| Audit routes not in the sitemap | 0 | Reconciled in `ROUTE_CENSUS.csv` |
| Crawl failures | 0 | `routeCrawlFailures: []` |

Full per-route table: [ROUTE_CENSUS.csv](ROUTE_CENSUS.csv)
(columns: route, in audit, source file, exported, exported status, sitemap).

## Deliberate non-goals in this test pass

- **No production verification.** No browser was pointed at
  `hansa.amir-portfolio.workers.dev`. Not run, by instruction.
- **No deep test of the two new draft-review routes.** They belong to a different
  work stream and are only counted in the route census.
- **No screen-reader session.** axe plus keyboard traversal, not NVDA/VoiceOver.
- **No performance measurement** in this pass; see `BUILD_TEST_LOG.md`.
