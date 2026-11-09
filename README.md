> **AI agents:** begin with [AGENTS.md](AGENTS.md) and
> [the active reference map](docs/agent-reference/START_HERE.md).
> The v2 reorganization plan governs structure/UX; the integrated adaptive
> visualization policy governs charts, simulations, visual interactions and motion.
> Older implementation reports are historical evidence. Verify references with
> `node scripts/verify-agent-reference.mjs`. This integration does not deploy or
> implement the site reorganization.
# Amir Abdelhamid — portfolio

Personal site for **Amir Abdelhamid** — data analyst and BI builder. Case studies,
experience, services, and the **Data Lab**: free, browser-scored practice exams for
SQL, Power BI/DAX, Excel, Python/Pandas, statistics, and analytics fundamentals.

Live at <https://hansa.amir-portfolio.workers.dev/>.

The design language (neutral oklch surfaces, `#0285f7` primary, cyan→violet accent,
Geist, hairline borders, glass header, BeUI colour presets) is ported from the BeUI
project tokens, not from a template.

---

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + BeUI design tokens in `app/globals.css` |
| Icons | `lucide-react` + two hand-written brand SVGs in `components/icons.tsx` |
| Content | Typed TS modules + JSON exam banks validated with Zod |
| Hosting | Cloudflare Workers Static Assets (Free plan, split `out-docs/` + `out-main/` uploaded by Wrangler) |
| Images | Pre-optimised WebP via `sharp` — no server-side optimiser |

There is no database, no auth, and no backend. Exam results live in `localStorage`;
the contact form posts to an optional endpoint or opens a pre-filled email.

---

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # writes the static site to out/
```

`npm run build` must stay server-free: `next.config.ts` sets `output: "export"`,
`trailingSlash: true`, and `images.unoptimized: true`. It also registers the
`@tailwindcss/turbopack` CSS loader — Tailwind 4 directives fail to parse without it.

To preview the exported site with the same trailing-slash and 404 behaviour as
production:

```bash
npm run preview        # http://localhost:4173 - plain static file server
npm run preview:worker # http://localhost:8787 - Wrangler, applies _headers + asset routing
```

(`scripts/serve-out.mjs` mirrors the hosted routing: trailing-slash redirects, 404
fallback, correct MIME types.)

### Comprehensive Statistics Reference

`/learn/statistics` is the visual-first statistics hub built from the owner's local Notion export.
It is a separate learning surface from the ten-chapter Data Visualization path at
`/learn/visualization`, but the two cross-link rather than duplicating each other.

- **Source:** one Notion HTML export, 43 numbered sections, 102 formula occurrences, 0 figures.
  The importer is `scripts/import-notion-statistics.mjs`; the typed output is
  `content/statistics/source.json`. No raw exported HTML is injected.
- **Routes:** the hub; nine journey routes (`/learn/statistics/journey/<slug>`); fifteen lab routes
  (`/learn/statistics/labs/<slug>`); a concept atlas, formula workbench, bilingual glossary, tool
  finder, printable field guide and a public source audit.
- **Math:** every probability, interval, test and correlation value lives in
  `lib/statistics/math.ts`; charts draw it but never compute it. KaTeX renders repaired formulas at
  build time with `trust:false`.
- **Content conventions:** source Arabic explanations and English statistical terms are preserved.
  Technical notation stays LTR inside Arabic prose. Formulae that the export stripped of backslashes
  are repaired from a verified lexicon; corrections (notably the Poisson λ=20 tail) are visible in
  the section and recorded in `docs/statistics/math-errata.md`.
- **Labs:** client islands with seeded randomness, visible reset/presets, exact-value tables, and a
  reduced-motion path. Synthetic data is labelled; no live traffic, patients, customers or revenue
  is implied.

```bash
npm run import:statistics     # re-import the export; idempotent
npm run docs:statistics       # regenerate coverage matrix + visual audit
npm run test:statistics       # 18 numerical tests
npm run verify:statistics     # coverage, formulas, routes, links, numeric gate
npm run build
node scripts/serve-out.mjs 4174
npm run test:e2e:statistics   # Edge via playwright-core; writes docs/statistics/screenshots
```

The `e2e` script expects the static export on `http://127.0.0.1:4174` and a local Edge installation
(`EDGE_PATH` can override). It does not download a browser. The documentation set is under
`docs/statistics/`: source inventory, coverage matrix, errata, beUI decisions, visual audit,
storyboards, visualization spec and the implementation report.

---

## Editing content

### Curriculum and subject homes
`lib/curriculum/model.ts` derives the learning graph from `lib/study/taxonomy` and
`learningUnits()`: eight subjects, four stages (Foundation → Applied → Advanced →
Reference), topic desks and guided programmes. `/learn` renders the umbrella, and
each subject has a home under `/learn/<subject>/` (`visualization` keeps its full
ten-chapter course page there). `/study`, `/study/<subject>` and `/learn/catalogue`
are aliases that canonicalise to `/learn`. Topic desks live at
`/learn/<subject>/<topic>/` and subject paths at `/learn/<subject>/path/`; their
`/study/...` addresses render the same pages and canonicalise to `/learn`.

### Site identity, nav, links
`lib/site.ts` — name, role, email, socials, availability, nav items, footer links,
and the optional contact endpoint.

```ts
contactEndpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "",
```

### Case studies
`lib/case-studies.ts` holds the whole case-study model:

- `problem[]` — what was broken and why it mattered
- `approach[]` — title + body, rendered as numbered steps
- `architecture[]` — optional schema/scale numbers
- `metrics[]` — the four headline numbers
- `sections[]` — long-form detail with optional bullets
- `gallery[]` — screenshots with manual `srcSet`
- `outcome[]` and `limitations` — both are required, on purpose

Adding a case study automatically creates `/work/<slug>/`, adds it to `/work`, the
home page, the sitemap, and the "next case study" link. Set `featured: true` for the
full-width treatment.

### Exam banks
`content/exams/*.json`, one file per topic, validated in `lib/exams.ts` at build time
(a bad answer index fails the build, not the browser). Four question types:

```jsonc
{ "type": "single",  "options": ["A", "B"], "answer": 0 }
{ "type": "multi",   "options": ["A", "B", "C"], "answer": [0, 2] }
{ "type": "boolean", "answer": true }
{ "type": "numeric", "answer": 6, "tolerance": 0, "unit": "rows" }
```

Every question needs `id`, `topic`, `prompt`, and `explanation`. To add a topic,
drop in a new JSON file and register it in `RAW_BANKS`; the catalogue, filters,
sitemap, and stats update themselves.

### Microsoft Fabric / DP-600 hub
`/lab/dp-600/` is a separate question bank from the six `content/exams/*.json` sets:
1,264 practice questions in 27 source packs, with per-option rationales, case studies,
source-video timestamps and DP-600 objective coverage.

- **Content** lives in `content/fabric/` and is generated — do not hand-edit it.
  `scripts/import-fabric-bank.mjs` reads the supplied package
  (`LAB_PACKS.merged.json` + `SOURCES.merged.json`), verifies every record, and writes
  the catalog, the 817 KB searchable index, 27 lazy question chunks, the case-study
  groups and the reference registry. `content/fabric/meta.json` carries the audit and
  coverage figures the site displays.
- **Classification** (`lib/fabric/classify.ts`) maps each question to an official
  DP-600 sub-objective and a browsable Fabric subject. It is pure and deterministic;
  the importer, the UI and the tests all use the same function.
- **Routes**: overview, explorer, guided study, topic practice, mock, case studies,
  review, progress, resources. Every one is statically exported; a session is resumed
  with `?session=<id>`.
- **Persistence**: `localStorage["amir-fabric-v1"]`, versioned and normalised, with
  JSON export/import de-duplicated by session id. It never touches
  `amir-lab-v1`, which keeps the six original exams' history intact.
- **Scripts**: `npm run import:fabric`, `npm run test:fabric`, `npm run report:fabric`,
  `npm run test:e2e:fabric`.

Reports and evidence are in `docs/fabric/`; start with
`docs/fabric/01-architecture-audit.md`.

### Experience, skills, services
`lib/experience.ts` (timeline, skill groups, facts) and `lib/services.ts`
(services, process). Nothing on those pages is hard-coded in JSX except headings.

### Images
Source screenshots are not committed at full resolution. Drop them in a folder and
run the optimiser:

```bash
node scripts/prepare-images.mjs "C:/path/to/screenshots"
```

It writes `public/images/hse/<slug>-1200.webp` and `-2000.webp`. Update the
`gallery` entries in `lib/case-studies.ts` to match. The social card
(`public/og.png`, 1200×630 PNG) is rendered from SVG inside the same script; link
previews deliberately use the PNG rather than a WebP screenshot, because some
crawlers still refuse WebP.

---

## Contact form

The form never silently discards a message:

- **With** `NEXT_PUBLIC_CONTACT_ENDPOINT` set at build time, it `POST`s JSON
  (`name`, `email`, `subject`, `message`) to that URL — Formspree, Basin, a Worker,
  anything that accepts JSON.
- **Without** it, it validates, then opens the visitor's email client with the
  message pre-filled, and shows the address as a fallback.

To enable delivery, set `NEXT_PUBLIC_CONTACT_ENDPOINT` in the environment that runs
the build (a GitHub Actions repository variable, or a local `.env`). It is inlined
into the static bundle by design, so use a public form endpoint — never a secret.
`NEXT_PUBLIC_SITE_URL` works the same way and updates canonical, Open Graph,
sitemap, and robots URLs.

There is a honeypot field (`company`) and client-side validation, but no server-side
spam protection — add that at the endpoint if the form gets abused.

---

## Deployment

Hosted on **Cloudflare Workers Static Assets** (Free plan), split across two
Workers so each version stays under the 20,000-file Free limit:

| Worker | Serves | Files |
| --- | --- | --- |
| `hansa-docs` | `/learn/fabric/**` documentation tree | 13,642 |
| `hansa` | public hostname; every other route plus the docs gateway | 12,420 |

`workers/gateway.mjs` forwards `/learn/fabric` and `/learn/fabric/*` to the
`hansa-docs` service binding. Every other request is served directly from the
`hansa` assets without running Worker code. The public hostname and every URL,
alias and anchor are unchanged.

| Setting | Value |
| --- | --- |
| Live URL | <https://hansa.amir-portfolio.workers.dev/> |
| Docs Worker URL | <https://hansa-docs.amir-portfolio.workers.dev/> |
| Account ID | `b84c4bfbf06e399ceb5f5267f87cb37e` |
| Deployed docs version | `24cc0da9-7a9b-47b1-a1cf-61687c4a0a55` |
| Deployed gateway version | `2b96e415-141b-4bc8-b52e-00f6391acd02` |
| Main asset directory | `./out-main` |
| Docs asset directory | `./out-docs` |
| HTML handling | `auto-trailing-slash` |
| Unknown paths | `404-page` -> the real `404.html` |
| Response headers | `_headers` copied into both trees |

### Corpus prerequisites

The Fabric documentation tree is generated, not committed. A clean checkout must
provision it from the pinned upstream before `npm run build`:

```bash
git clone --filter=blob:none https://github.com/MicrosoftDocs/fabric-docs.git ../fabric-docs-light
git -C ../fabric-docs-light checkout 774592ea3f2d4558f763d6e5b74abf4785948fb5
npm run corpus:provision -- --source=../fabric-docs-light/docs --build-dir=../fabric-corpus-build
npm run build
```

The script compiles all 22 families, builds the route registry, writes 174
alias pages, copies 9,572 docs assets, builds the 106-file search index, and
fails on any count or revision drift. `FABRIC_PUBLIC_ROOT` and `--compare` let
you provision into a disposable tree and compare the asset, alias and search
trees byte-for-byte with a verified export.

### Deploying

```bash
npx wrangler login
npm run build
npm run build:workers
npm run deploy:docs
npm run deploy:main
```

`build:workers` hardlinks `out/` into `out-docs/` and `out-main/` and enforces
the 20,000-file limit on each. Deploy docs first; the gateway forwards to it.
`npm run deploy` runs the whole sequence.

The `postbuild` step writes the flat RSC payload names the client router asks
for (3,175 files) and removes the 3,175 nested `__next.*` originals those
aliases duplicate. That leaves a 26,060-file `out/`; the raw Next export before
the step is 29,235 files. Keep the step: deploying both copies stalled the
Workers asset manifest and wasted upload bandwidth.

Because Next typechecks the repository, a rebuild must start from a checkout
without the generated split trees: run `npm run build` before `build:workers`,
or delete `out-main/` and `out-docs/` before rebuilding. The split trees are
generated and gitignored.

Roll back either Worker independently:

```bash
npx wrangler rollback --config wrangler.docs.jsonc
npx wrangler rollback --config wrangler.gateway.jsonc
```

### Custom domain

Workers Free supports custom domains on a Cloudflare-hosted zone. Add one to the
`hansa` Worker (Workers -> hansa -> Settings -> Domains & Routes), then rebuild
with the canonical origin:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com npm run deploy
```

That keeps canonical links, Open Graph URLs, `sitemap.xml`, and `robots.txt` in
step. No `basePath` change is needed at the root of a domain. The docs Worker
needs no separate domain: the gateway reaches it through the service binding.

### CI

`.github/workflows/deploy-split-workers.yml` is manual-only
(`workflow_dispatch`) and requires the operator to type `DEPLOY`. It checks out
the pinned corpus revision, provisions the asset, alias and search trees, runs
the preservation receipts and content tests, lints, builds, splits, and deploys
`hansa-docs` then the `hansa` gateway. No push or schedule trigger exists.

The first dispatched run (`42658023133`) failed during corpus provisioning before
any credential was read: Linux checked out LF while the FC02 ledger pins CRLF
worktree hashes. The workflow now sets `core.autocrlf true` before checkout.
The current release was deployed locally with the existing Wrangler OAuth
session because the repository has no Actions secrets; a fresh CI run is still
unvalidated.

`.github/workflows/deploy-cloudflare.yml` is the historical single-Worker
workflow, preserved byte-for-byte by
`docs/cleanup-20261108/DEPLOYMENT_PAUSE_RECEIPT.json`. Do not dispatch it after
the split release: its 26,060-file `out/` still exceeds the Free limit.
`fabric-corpus-release.yml` remains a deploy-free dry-run package.

Add these repository secrets:

- `CLOUDFLARE_API_TOKEN` - least privilege: **Workers Scripts: Edit** for both Workers
- `CLOUDFLARE_ACCOUNT_ID` - `b84c4bfbf06e399ceb5f5267f87cb37e`

Both were absent at release time (`total_count=0`), so the workflow cannot deploy
until the owner adds them. Optional repository variables:
`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_ENDPOINT`. The older GitHub Pages
workflow (`.github/workflows/deploy.yml`) is not used by this host.

### Caching and headers

`public/_headers` sets security headers on every route and immutable, one-year
caching for fingerprinted `/_next/static/*` files. HTML keeps Cloudflare default
`Cache-Control: public, max-age=0, must-revalidate` plus an ETag, so a deploy is
visible immediately without forcing a full re-download.

Everything used here is on the Cloudflare Free plan: no paid add-ons, no KV/D1/R2
bindings, and no server-side runtime. The only Worker code is the small docs
gateway. Static-asset requests are unlimited and there is no total-size cap; the
20,000-file and 25 MiB-per-file limits are enforced by the build split.

### Static export note

Next 16.4 writes per-segment RSC payloads to nested folders (for example
`out/work/__next.work/$d$slug/__PAGE__.txt`) while its client router requests the
flat dotted name (`/work/__next.work.$d$slug.__PAGE__.txt`). The `postbuild` step
(`scripts/export-segment-aliases.mjs`) copies each payload to the requested path, so
Link prefetching succeeds and navigation stays client-side. It is idempotent and can
be removed once `next build` emits both names.

### Redirecting the old repository

`legacy-redirect/index.html` is a standalone redirect page pointing at
`https://hansa.amir-portfolio.workers.dev/`. Copy it over the `index.html` of the
old `AmirAbdelhamidStats.github.io` repository (and delete the old assets if you
want the repo to stop serving 21 MB of images). It uses a canonical link,
`meta refresh`, and `location.replace`, so it works with or without JavaScript.

---

## Project layout

```
app/
  layout.tsx              fonts, metadata, no-flash theme script, header/footer
  page.tsx                home: hero, evidence panel, work, services, lab, about, CTA
  work/                   index + [slug] case-study template
  experience/             timeline, skill groups, education, certification
  services/               three services, process, FAQ
  lab/                    catalogue + [slug] exam player
  learn/statistics/       visual-first statistics hub, 9 journeys, 15 labs, atlas,
                          formula workbench, glossary, tool finder, field guide, source audit
  about/  contact/        narrative and contact channels
  sitemap.ts  robots.ts   generated at build time
components/
  statistics/              chart primitives, labs, exhibits, source renderer, search
  site-header/footer, theme-controls, ui primitives
  case-study-card, dashboard-gallery (native <dialog> viewer)
  contact-form
  lab/exam-catalog, lab/exam-player
content/exams/            six JSON question banks
lib/                      site config, case studies, exams (Zod), experience, services,
                          lab-storage (useSyncExternalStore wrapper)
scripts/prepare-images.mjs   Sharp resize/WebP + social card
scripts/serve-out.mjs        Static preview server (trailing slash + 404)
scripts/export-segment-aliases.mjs  Post-build RSC payload aliases for prefetching
public/_headers              Cloudflare response headers (security + caching)
wrangler.jsonc               Frozen single-Worker config (preserved, no longer used)
wrangler.gateway.jsonc       Public hostname Worker: ./out-main plus docs gateway
wrangler.docs.jsonc          Docs Worker: ./out-docs
```

## Accessibility & behaviour notes

- Theme and accent are set by an inline script before first paint; the accent
  checkmark (and its screen-reader "selected" text) is driven by CSS from
  `<html data-theme>`, so there is no hydration mismatch and no flash.
- All interactive controls are real buttons, links, radio groups, or checkboxes;
  the screenshot viewer is a native `<dialog>` with keyboard navigation, Escape,
  backdrop-click close, and a visible close button.
- The mobile menu closes on Escape (returning focus to the trigger) and on a tap
  outside it.
- Contact validation moves focus to the first invalid field, and status messages
  are announced through a polite live region.
- Status is never encoded by colour alone — labels and values accompany every band.
- `prefers-reduced-motion` disables the reveal/sweep animations.
- Exam pages print cleanly (`@media print` hides controls and keeps the review).

## Exam scoring rules

- Practice and mock runs save a personal best and attempt count in `localStorage`.
- Mock mode auto-submits when the clock reaches zero and labels the result
  "time expired".
- **Retry incorrect** starts a drill over just the missed questions. A drill is
  never saved, so a good drill cannot inflate your record and a bad one cannot
  lower it. The results screen says "Drill · not saved" when that applies.
- "Finish now" asks for confirmation in both modes, including how many questions
  are still unanswered.

## Known gaps

These are deliberately visible rather than faked:

- **Portrait** — the About and home cards use a monogram, not a stock photo. Add a
  real headshot and replace the gradient block.
- **CV** — no downloadable PDF yet. Email for the current version.
- **Certificates** — IBM/IMT certificate images are not published.
- **IBM capstone / ADAS detail** — both pages are honest summaries; expand with
  notebooks, charts, and project photos when available.
- **Contact endpoint** — unset, so the form falls back to email.

## Knowledge Atlas preparation
Atlas documentation and the repository compatibility amendment start at [docs/knowledge-atlas/START_HERE.md](docs/knowledge-atlas/START_HERE.md). The Contextual Hybrid semantic Atlas is prepared for future implementation; no Atlas feature or deployment is included. Continuation: [NEXT_AGENT_START_HERE.md](docs/knowledge-atlas/NEXT_AGENT_START_HERE.md).
