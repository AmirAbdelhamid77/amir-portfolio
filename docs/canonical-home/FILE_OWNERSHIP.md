# FILE OWNERSHIP — one landing, one editable implementation

**Rule:** exactly one landing implementation exists. A second landing surface is
either the canonical module, a compatibility alias that renders it, or a
deliberately retired module recorded in the receipt. There is no fourth category,
and `tests/knowledge/canonical-home.test.mjs` fails if one appears.

## The canonical landing

**`components/knowledge/hansa-landing.tsx`** — `HansaKnowledgeLanding()`:

```tsx
<InsightStage items={eligibleInsights(feed.items, true)} atlas={getAtlas()} notice={feed.notice} />
```

It owns the landing's data wiring only: the insight feed through
`eligibleInsights`, the **public** Atlas projection from `getAtlas()`, and the
editorial notice. It composes the stage; it does not restyle it.

| Consumer | File | What it does |
|---|---|---|
| Root homepage | `app/page.tsx` | `<HansaKnowledgeLanding />` plus root metadata + `WebSite` JSON-LD |
| Legacy address | `app/prototype-c/page.tsx` | `<HansaKnowledgeLanding />`, `noindex, nofollow`, `canonical: "/"` |

Both route files are metadata-only. The guard test asserts that neither mentions
`InsightStage`, `insight-rail` or `knowledge-dealer`, carries `className=`, or
renders the landing more than once.

## The stage and its supporting modules (one owner each)

| File | Owns |
|---|---|
| `components/knowledge/insight-stage.tsx` | The whole stage as the v3 gate flow (2026-10-30): masthead, four full-viewport gates (date hero → insight → Learn Gate → certificate gate) with the sticky crossfade choreography, footer-context strips. **Imported by the canonical landing and by nothing else** (asserted by test). |
| `components/knowledge/stage-today.tsx` | Gate 0: the live-date hero (edition-date fallback, display-only live swap) and the full-viewport dealer takeover state |
| `components/knowledge/stage-learn-gate.tsx` | Gate 2: curated catalogue destinations from `lib/catalogue.ts` + totals via `number-ticker` |
| `components/knowledge/stage-cert-gate.tsx` | Gate 3: practice banks from `lib/catalogue.ts` + the per-objective coverage bar list from `lib/fabric/data.ts` |
| `components/knowledge/stage-about.tsx` | The identity strip — `compact` renders in the footer context; `full` is kept reusable for other pages |
| `components/knowledge/stage-editorial.css` | The gate system: sticky crossfades via `--gate-rise`/`--gate-dim`, date/titles, dealer stage, coverage bars; entirely theme-token driven |
| `components/knowledge/insight-scene.tsx` | One edition's reading surface (scenario → prediction → takeaway → caveat → sources) + `InsightCompact` |
| `components/knowledge/insight-experiment.tsx` | The scenario interaction/derived readout |
| `components/knowledge/insight-rail.tsx` | The condensed kinetic edition rail (beUI timeline adaptation): wheel, drag, flick, arrow keys, reduced-motion fallback |
| `components/knowledge/knowledge-dealer.tsx` | The card dealer (deck → hand → spread → flip) |
| `components/knowledge/insight-archive.tsx` | The archive board and its filters |
| `components/knowledge/atlas-peek-stage.tsx` | The Atlas peek inside the stage (published-only relation guard) |
| `lib/knowledge/insights.ts` | The one insight loader (`eligibleInsights`, `searchInsights`, `selectedInsight`) |
| `lib/knowledge/models.ts` | Insight types and the edition admission rule |
| `lib/knowledge/motion.ts` | Motion tokens used by the stage |
| `content/knowledge/insights.json` | The three reviewed editions |

## Retired (recorded, not silently deleted)

| File | Action | Reason | Evidence |
|---|---|---|---|
| `components/knowledge/knowledge-stage.tsx` | Deleted (staged) | The previous root landing implementation; keeping it would leave two landing trees | `INTEGRATION_MANIFEST.json` → `removed[1]`; test asserts absence |
| `components/knowledge/prototype-c.tsx` | Deleted (staged) | A 9-line pass-through whose only job was naming the route; the landing is now imported directly | `INTEGRATION_MANIFEST.json` → `removed[0]` (records that this path had *already* drifted at HEAD) |
| `components/cinematic/spacetime-atlas.tsx` | Deleted 2026-10-30 | The pinned Act II camera; the editorial re-stage replaced it with the published-only `StageAtlasPeek`, leaving no importer | `INTEGRATION_MANIFEST.json` → `removed[2]` |
| `components/cinematic/spacetime.css` | Deleted 2026-10-30 | Its only consumer was the retired camera renderer | `INTEGRATION_MANIFEST.json` → `removed[3]` |
| `components/cinematic/cinematic.css` | Deleted 2026-10-30 | Every `cine-*` class it defined belonged to the hero/handoff/pinned-Atlas/content wrappers the re-stage replaced; the kept language lives in `stage-editorial.css` | `INTEGRATION_MANIFEST.json` → `removed[4]` |
| `components/knowledge/knowledge-atmosphere.tsx` | Deleted 2026-10-30 | The aurora/wash atmosphere was replaced by theme-token backdrops | `INTEGRATION_MANIFEST.json` → `removed[5]` |
| `components/knowledge/stage-marquee.tsx` | Deleted 2026-10-30 (v3) | The v2 manifesto marquee gave way to the full-screen date hero the owner asked for | `INTEGRATION_MANIFEST.json` → `removed[6]` |
| `components/knowledge/stage-works.tsx` | Deleted 2026-10-30 (v3) | Off the landing by owner decision; the duplicated-group marquee pattern is preserved in git history for a future `/work` showcase | `INTEGRATION_MANIFEST.json` → `removed[7]` |

(`.stage-ink` — the v2 landing-only dark token scope in `app/globals.css` — was
removed the same day: the owner wants the site's own light/dark themes on the
landing, and the scope was pinning the theme toggle. The v2 amber/black palette
is fully retired.)

(`components/cinematic/use-scroll-progress.ts` was briefly retired with the v2
re-stage and **restored** the same day for the v3 gate flow — its pinned/leave
readings drive the full-screen gate crossfades. It is a live module again.)

## Compatibility

| File | Role |
|---|---|
| `app/prototype-c/page.tsx` | Thin alias to the same component; keeps `?insight=` and `#archive` working; `noindex`; canonical `/`; absent from sitemap, search index and primary nav |

## Navigation and chrome

| File | Change | Why |
|---|---|---|
| `lib/site.ts` | Adds `LANDING`, `LEGACY_LANDING`, `LANDING_NAV`; updates `NAV` (Today/Work/Learn/Practice/Services/About) and `NAV_SECTIONS` | One registry for the landing source, canonical URL and the two nav sets |
| `components/site-header.tsx` | Uses `isLanding ? LANDING_NAV : NAV`, plus `activeHrefFor` family highlighting | The landing adds Atlas; interior pages keep Work/Services. `Today` is reachable everywhere |
| `components/site-footer.tsx` | Keeps all three link groups (Work / Learn / Practice) | The professional routes stay discoverable after the old homepage body was retired |
| `app/sitemap.ts` | Homepage first; alias omitted | One indexed homepage |
| `lib/search/documents.ts` | Indexes the landing at `/`; no `prototype-c` entry | Search never routes to a duplicate |
| `tsconfig.json` | Excludes the gitignored `build/` scratch tree | The typecheck project is the real source tree |

## Import graph of the landing

```
app/page.tsx ─┐
              ├─→ components/knowledge/hansa-landing.tsx
app/prototype-c/page.tsx ─┘        ├─→ content/knowledge/insights.json
                                   ├─→ lib/knowledge/insights.ts (eligibleInsights)
                                   ├─→ lib/atlas/server.ts (getAtlas → public projection)
                                   └─→ components/knowledge/insight-stage.tsx
                                          ├─→ stage-today.tsx (dealer prop ← knowledge-dealer.tsx)
                                          ├─→ insight-scene.tsx ─→ insight-experiment.tsx
                                          ├─→ insight-rail.tsx
                                          ├─→ stage-learn-gate.tsx ─→ lib/catalogue.ts
                                          ├─→ stage-cert-gate.tsx ─→ lib/catalogue.ts + lib/fabric/data.ts
                                          ├─→ stage-about.tsx ─→ lib/site.ts
                                          ├─→ insight-archive.tsx
                                          ├─→ atlas-peek-stage.tsx
                                          ├─→ cinematic/reveal.tsx + use-calm-motion.ts
                                          │    + use-scroll-progress.ts (gate crossfades)
                                          └─→ observatory.css + stage-editorial.css (theme tokens)
```

## Deliberately untouched

Question banks (`content/drafts/`, `content/intake/`, `intake/`), learner progress
(`lib/fabric/storage.ts` and its storage keys), Atlas graph relations,
`/learn/*`, `/lab/*`, the new draft-review routes, and the media intake files.
