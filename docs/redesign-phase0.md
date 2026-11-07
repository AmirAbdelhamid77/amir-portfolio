# Redesign Phase 0 — discovery and gap matrix (2026-11-08)

Branch `feat/hansa-redesign` (from `feat/learn-graph-map` @ `8bf283f`, which carries the
validated Learn → Graph work; RC `release/v1` @ `3d32a51` / `release-candidate-1` untouched).

## Framework and versions

- Next.js **16.4.3** (App Router), static export (`output: "export"`), React 19.3, Tailwind v4
  (`@tailwindcss/turbopack`), `motion` 14.6 (`motion/react`), wrangler 4.152 (deploy only, not
  touched here), npm.
- All four beUI Timeline npm dependencies are already installed: `clsx`, `lucide-react`,
  `motion`, `tailwind-merge`.
- `lib/utils.ts` (`cn`) and `lib/touch.ts` already exist and are the official beUI upstream
  source retrieved 2026-10-26 (only comment trims and semicolons differ — functionally
  identical). No library changes needed.

## Official beUI components (verified against the live registry)

- `https://beui.dev/r/timeline.json` — 23,633-char `components/motion/timeline.tsx` (750 lines)
  + `lib/touch.ts` + `lib/utils.ts`. Install command per docs:
  `bunx --bun shadcn add @beui/timeline`. Props: `events` (`TimelineEvent{id,date,title,media,meta}`),
  `value/defaultValue/onValueChange`, `itemWidth 340`, `height 600`, `years/ruler/cables`,
  `formatDate/formatYear`, `aria-label`. Behaviors verified in source: 4 px drag threshold,
  flick momentum (spring 120/24, 0.3 events/s, cap 4), rubber band 0.3×, horizontal wheel only,
  keyboard (arrows/Home/End, single tab stop, `aria-current="step"`), reduced-motion instant
  glides, side cards 0.72 scale + solid veil, cables fade past 1.6 events, ruler ticks per gap,
  year numerals at 0.5× parallax.
- `https://beui.dev/r/card-dealer.json` — 324-line `components/motion/card-dealer.tsx` +
  `lib/hooks/use-hover-capable.ts`. Generic over card type (`CardDealerCard`), zones
  deck/hand/pile. API recorded in the Stage D commit.

Both sources are stored under `D:/BeUI/release-v1-20261108/official-*.tsx` and installed from
these registry files, attributed to beui.dev, with every fork deviation commented.

## Insight bank (existing, reused verbatim)

- Live feed: `content/knowledge/insights.json` — **3 published items** (2026-10-24 → 2026-10-26,
  one per day), schema `Insight{id,date,topic,title,scenario,prediction,takeaway,caveat,
  cardTitle,conceptId,lessonHref,practiceHref,sourceId,sourceUrl,sourceLocator,checkedAt,
  reviewStatus,reviewer,questionIds}` in `lib/knowledge/insights.ts` with a fail-closed
  `eligibleInsights()` filter.
- Larger batches (150 + 174 records) exist only as **review-queue** material under
  `docs/daily-insight-bank-20261106/` — they are not published and are not added to the feed.
- **Plan conflict, reported:** the plan's performance targets assume 200–365 days. The real,
  honest dataset is 3 days. The redesign renders the real data; windowing and large-collection
  behavior are exercised by unit fixtures, not by invented content.

## Theme tokens

`app/globals.css` already defines `--background`, `--foreground`, `--card`, `--muted-foreground`,
`--border` (oklch, light + dark) — exactly the names beUI components use. No token mapping
needed; only the motion duration variables from plan §7 are added.

## Gap matrix

| Area | Status | Action |
|---|---|---|
| R3–R6 Home (three scenes) | Implemented; accepted fallback | Keep intact; mount behind `HOME_V2` flag; also reachable at `/archive/` |
| Timeline-fan | Implemented; superseded visual | Data/logic reused; visual replaced by the official beUI Timeline |
| Header navigation | Implemented | Replaced by supplied Island Navigation in the v2 shell only |
| Insight bank + fail-closed eligibility | Implemented | Reused verbatim; no content changes |
| Decision instrument, reasoning, caveats, sources | Implemented | Reused in the detail layer, order per plan §10 |
| Day layer + insight detail routes | **Missing** | New: `/day/[date]`, `/day/[date]/[insightId]` (static-export safe) |
| beUI Timeline Home | **Missing** | New: official source fork per plan §9 (6 commented deviations) |
| beUI Card Dealer day layer | **Missing** | New: official source, wrapped |
| Island navigation | **Missing** | New: supplied `island-nav.tsx` in the v2 shell |
| Learn + Knowledge Graph | Implemented & verified on this branch | Carried in; no rebuild |
| Atlas (fail-closed public projection) | Implemented | Untouched |
| Fabric corpus + media | Implemented | Untouched |
| Search, Practice, question banks | Implemented | Untouched |
| `HOME_V2` flag | **Missing** | New: build-time env flag, default off |

## Known routing constraint

Static export cannot do server-side intercepting routes; per plan §5 the same URLs are
implemented as real statically generated routes (`/day/[date]/…`) with client-side layer
behavior on soft navigation, so direct links, refresh and back all work without server features.
