# amirabdelhamid77.github.io

Personal site for **Amir Abdelhamid** — data analyst and BI builder. Case studies,
experience, services, and the **Data Lab**: free, browser-scored practice exams for
SQL, Power BI/DAX, Excel, Python/Pandas, statistics, and analytics fundamentals.

Live at <https://amirabdelhamid77.github.io/>.

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
| Hosting | GitHub Pages (static `out/`, deployed by Actions) |
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

To preview the exported site exactly as Pages will serve it:

```bash
npm run preview   # http://localhost:4173
```

(`scripts/serve-out.mjs` mirrors Pages: trailing-slash redirects, 404 fallback,
correct MIME types.)

---

## Editing content

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

To enable delivery, create a GitHub repository variable named
`NEXT_PUBLIC_CONTACT_ENDPOINT` (Settings → Secrets and variables → Actions →
Variables). The deploy workflow passes it to the build.

There is a honeypot field (`company`) and client-side validation, but no server-side
spam protection — add that at the endpoint if the form gets abused.

---

## Deployment

The workflow in `.github/workflows/deploy.yml` runs on every push to `main`:
install → lint → build → upload `out/` → deploy to Pages.

First-time setup for a **root** Pages site (`https://amirabdelhamid77.github.io/`):

1. Create the repository **`AmirAbdelhamid77.github.io`** (public).
2. Push this project to `main`.
3. Settings → Pages → **Source: GitHub Actions**.
4. Run the workflow (or push again). The first deploy publishes the site.

No `basePath` is needed for a root repository. If the site is ever served from a
subpath (e.g. a project repo at `/portfolio/`), set
`NEXT_PUBLIC_BASE_PATH=/portfolio` at build time — `next.config.ts` wires it into
both `basePath` and `assetPrefix`.

`public/.nojekyll` is copied into `out/` so Pages does not strip the `_next`
directory.

### Redirecting the old repository

`legacy-redirect/index.html` is a standalone redirect page. Copy it over the
`index.html` of the old `AmirAbdelhamidStats.github.io` repository (and delete the
old assets if you want the repo to stop serving 21 MB of images). It uses a canonical
link, `meta refresh`, and `location.replace`, so it works with or without JavaScript.

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
  about/  contact/        narrative and contact channels
  sitemap.ts  robots.ts   generated at build time
components/
  site-header/footer, theme-controls, ui primitives
  case-study-card, dashboard-gallery (native <dialog> viewer)
  contact-form
  lab/exam-catalog, lab/exam-player
content/exams/            six JSON question banks
lib/                      site config, case studies, exams (Zod), experience, services,
                          lab-storage (useSyncExternalStore wrapper)
scripts/prepare-images.mjs   Sharp resize/WebP + social card
scripts/serve-out.mjs        Pages-like static preview server
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
