# Measurements — what was run, what passed, what it does not prove

Machine: Windows, headless Microsoft Edge via `playwright-core`, static export
served by `scripts/serve-out.mjs` on `127.0.0.1`. Nothing here is field data.

## 1. Build and static analysis — PASS

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | PASS, no output |
| Lint (touched files) | `npx eslint components/cinematic components/knowledge/insight-stage.tsx` | PASS |
| Static export | `npm run build` | PASS, `out/` written, `export-segment-aliases.mjs` wrote 259 alias files |
| Unit tests | `npm run test:knowledge` | PASS 33/33 (includes the 8 geometry/honesty tests in `tests/knowledge/cinematic-field.test.mjs`) |
| Atlas publication gate | `tests/atlas/expansion.test.mjs` (inside the suite) | PASS — public projection still publishes 0 semantic edges |

## 2. Browser QA

### Canonical landing — PASS 45/45 (`docs/canonical-home/evidence/`)

Sections, header/nav, URL state, scenario reveal, dealer, rail arrow keys, deep
links, back-navigation, 320/390/768 reflow, reduced motion, no-JS, keyboard,
axe (0 non-serious).

### Spatial layer — PASS 43/43 (`evidence/qa.json`)

New behavioural suite, `scripts/phase2-spatial-qa.mjs`, at 1440/1280/768/390:

| Group | Checks |
| --- | --- |
| reflow | no horizontal overflow at any of the four widths |
| wheel | wheel over the canvas moves the page (420 px measured) — the field never captures it |
| ink | painted canvas pixels: 8731 / 7706 / 6260 / 2116 (not blank) |
| keyboard | the field takes focus; `ArrowRight` changes the rendered frame |
| list | 7 vertex buttons; selecting one updates the URL and the inspector |
| back | scrolling up out of the field moves the page (1.7k–2.4k px) |
| no-trap | the hero is reachable again after the field |
| axe | 0 A/AA violations at 1440 and 390 with the field and list open |
| deep link | `/?insight=…#archive` survives, archive search present |
| no canvas | `getContext` returning null shows the fallback and keeps all 7 vertices |
| reduced | static frame (identical canvas hash over 900 ms), 7724 painted pixels, Act III readable |
| no JS | the archive carries every edition |
| console | no console or page errors in any pass |

### Screenshots — PASS (`evidence/*.png`, `evidence/capture.json`)

Acts captured at 1440/1280/768/390, plus light theme, reduced motion, atlas
open/mid/far, a list selection, the coda and Act III. Zero console errors per
pass recorded in `capture.json`.

## 3. Lab performance (`evidence/performance.json`)

Conditions: 4× CPU throttling, 1.6 Mbit/s down / 0.75 Mbit/s up / 75 ms latency
(CDP emulation), headless software rasteriser, 3 samples per viewport, median
reported. The scroll phase drives one scroll step per animation frame, which is
harsher than a real flick.

| Metric | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| LCP | 2900 ms | 3096 ms | 2744 ms |
| CLS | 0 | 0.0033 | 0.0012 |
| Hero idle frame p95 | 16.8 ms | 16.8 ms | 16.8 ms |
| Atlas idle frame p95 (canvas live) | 33.4 ms | 16.8 ms | 16.8 ms |
| Frames over 50 ms, atlas | 0 | 1 | 0 |
| Scripted-scroll frame p95 | 16.8 ms | 16.9 ms | 16.8 ms |
| Reduced-motion frame p95 | 16.8 ms | — | 16.8 ms |
| Canvas redraws/s when reduced-motion and idle | 0 | — | 0 |
| DOM nodes | 824 | 825 | 829 |

Weight: the landing requests 14 scripts — **884 KB raw / 279 KB gzip** in total
(the local server does not compress, which is why the harness reports 777 KB
"transferred"). The route chunk that carries the three-act stage is **99.6 KB
raw / 28.8 KB gzip**. No dependency was added for this work.

Long tasks during *load*: 6–12 tasks, 0.9–2.0 s total per sample. That is
hydration of the existing 884 KB bundle under 4× throttling, not the spatial
layer; it pre-dates this phase.

## 4. Defects found by measuring, then fixed

Both were found by this QA pass and both are verified by the numbers above.

| Defect | Cause | Fix | Effect |
| --- | --- | --- | --- |
| CLS 0.294 at 768 px, 0.046 at 1440 px | `Geist Mono` was loaded with `preload: false`; the late swap re-wrapped the hero status bar and moved the whole first act down 23 px | `app/layout.tsx` preloads the mono subset (the mono labels are above the fold in Act I) | CLS 0.0033 / 0.0012 |
| Scripted-scroll p95 183 ms at 390 px, 50 ms at 1440 px; 12 long tasks up to 383 ms through the handoff | `useScrollProgress` returned React state, so every scroll frame re-rendered the entire three-act stage | `useScrollProgress` returns a stable reading object; the stage writes five CSS custom properties on the leaf elements that consume them | p95 16.8 ms at every width, 0 long tasks during scroll |

The second fix had a false start worth recording: writing the five properties on
the stage root invalidated style for ~800 nodes per write and *worsened* scroll
p95 to ~117 ms per frame. Writing each property on its consumer
(`.cine-edition-link`, `.cine-seed-wrap`, `.cine-environment`) is what made it
cheap.

## 5. Production deployment — PASS 14/14

Published at the owner's request on 2026-10-29 with `npx wrangler deploy`
(OAuth token, account `b84c4bfbf06e399ceb5f5267f87cb37e`, Workers write scope).
Static assets only: no Worker script, no new service, still the Free plan.

| Item | Value |
| --- | --- |
| URL | `https://hansa.amir-portfolio.workers.dev` |
| Version | `684da0e9-d5a5-4478-b6d5-7e361d257135` |
| Upload | 1057 assets (737 already present), 82 s upload / 94 s total |
| Encoding | `zstd` negotiated for the document |
| Build served | byte-identical script set to the local `out/index.html` (14 chunks, `Compare-Object` empty) |

`scripts/qa-production-smoke.mjs` drives the live origin (not `out/`) and passed
**14/14**:

| Check | Result |
| --- | --- |
| status / compression | 200, `zstd` |
| hero | "One idea." and "The hand behind the claim" in Act I |
| canvas | 8734 sampled painted pixels on the deployed field |
| pending label | `.atlas-field[data-pending="true"]` + "Semantic layer · review status" and "Reviewed connections are not published yet" as real text in the coda |
| wheel | wheel over the canvas scrolled the page 420 px |
| list select | 7 vertices; selection wrote `?insight=hansa-insight-shortcut-delete-v1` |
| archive | all three editions reachable |
| console | no console or page errors |
| mobile 390 | 0 px horizontal overflow, 2118 painted canvas pixels, no errors |
| `/prototype-c/` | 200, serves the same three-act landing |
| unknown route | 404 from the exported `404.html` |

Direct `Invoke-WebRequest` confirmation against the live origin: `/` 200 (95.2 KB
HTML), `/prototype-c/` 200, `/learn/dp-600/ingestion/` 200,
`/lab/dp-600/explore/` 200, unknown route 404.

Two failures in the first production run were **test-assumption bugs, not site
defects**, and are recorded because they matter for anyone re-running the suite:
the compression assertion only accepted `gzip|br` (Cloudflare chose `zstd`), and
the pending-label assertion looked for "awaiting human publication review" in the
DOM when that sentence is painted inside the canvas. Both were corrected to
assert what the site actually guarantees.

The deploy published the whole `out/` build of the working tree, including the
other uncommitted changes that were present at the time. No commit or push was
made; see [ROLLBACK.md](./ROLLBACK.md).

## 6. What this does not prove — NOT RUN

* **NOT RUN**: field Core Web Vitals / real-device INP. All numbers are lab,
  synthetic, on one machine.
* **NOT RUN**: physical phone, tablet or low-end Android. 390 px is a viewport,
  not a device; 4× CPU throttling is a proxy, not a thermal soak.
* **NOT RUN**: Safari, Firefox, or Windows High Contrast in a real session
  (only the `forced-colors` CSS branch exists).
* **NOT RUN**: a human screen-reader pass (NVDA/JAWS/VoiceOver). Automated axe
  is not a WCAG audit.
* **NOT RUN**: GPU profile. The headless rasteriser is the pessimistic case.
* **BLOCKED**: the "published relation focus" acceptance for Act II. The public
  projection contains 0 semantic edges until human publication review; the field
  labels that state instead of simulating it.
