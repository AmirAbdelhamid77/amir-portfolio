# LANDING SOURCE MAP — one module, two addresses

## The single source

`components/knowledge/hansa-landing.tsx` — 41 lines, exports
`HansaKnowledgeLanding()`. It is the **only** module that composes the landing
experience. Design, motion and spatial work targets this file and the modules it
composes; no route file is ever the place to edit the landing.

```tsx
import feed from "@/content/knowledge/insights.json";
import { eligibleInsights } from "@/lib/knowledge/insights";
import { getAtlas } from "@/lib/atlas/server";
import { InsightStage } from "./insight-stage";

export function HansaKnowledgeLanding() {
  return (
    <InsightStage
      items={eligibleInsights(feed.items, true)}
      atlas={getAtlas()}
      notice={feed.notice}
    />
  );
}
```

Three deliberate decisions live in those four lines:

1. **`eligibleInsights(feed.items, true)`** — the public feed stays fail-closed
   (`eligibleInsights(items)` returns `0` for the current `technical_review`
   editions); the landing opts into preview editions explicitly. An unreviewed
   record can never reach the stage.
2. **`getAtlas()`** — the default **public** projection. The review-preview flag
   is never switched on here, so a draft relation cannot leak onto `/`.
3. **`notice={feed.notice}`** — the editorial notice travels with the content, so
   "human publication review pending" is shown wherever editions are shown.

## Both route files render it, and nothing else

| Route | File | Lines that matter |
|---|---|---|
| `/` | `app/page.tsx` | `metadata` (title.absolute, description, `canonical: "/"`, keywords, OG/Twitter with `/og.png`), `WebSite` JSON-LD, one `<HansaKnowledgeLanding />` |
| `/prototype-c/` | `app/prototype-c/page.tsx` | `metadata` (`robots: { index: false, follow: false }`, `canonical: "/"`), one `<HansaKnowledgeLanding />`, and `void LEGACY_LANDING` to keep the compatibility contract visible in source |

## Dependency / import graph

```
app/page.tsx ───────────────────┐
                                ├──→ components/knowledge/hansa-landing.tsx
app/prototype-c/page.tsx ───────┘            │
                                             ├──→ content/knowledge/insights.json
                                             ├──→ lib/knowledge/insights.ts
                                             ├──→ lib/atlas/server.ts → lib/atlas/* (public projection)
                                             └──→ components/knowledge/insight-stage.tsx
```

Inside the stage:

```
insight-stage.tsx
├── insight-rail.tsx          (beUI timeline adaptation; lib/knowledge/motion.ts)
├── insight-scene.tsx ──→ insight-experiment.tsx ──→ lib/knowledge/models.ts
├── knowledge-dealer.tsx      (lib/knowledge/motion.ts, lib/knowledge/models.ts)
├── atlas-peek-stage.tsx      (published-relation guard)
├── insight-archive.tsx       (searchInsights, root-scoped permalinks, id="archive")
└── knowledge-atmosphere.tsx
```

## Anti-duplication guards (source-level, run by `npm run test:knowledge`)

| Guard | Assertion |
|---|---|
| One owner | The set of files importing `insight-stage` must equal exactly `[components/knowledge/hansa-landing.tsx]` |
| No forked markup | Neither route file may contain `InsightStage`, `insight-rail`, `knowledge-dealer` or `className=` |
| One render | The alias must contain exactly one `<HansaKnowledgeLanding />` |
| Retired means gone | `prototype-c.tsx` and `knowledge-stage.tsx` must not exist |
| No build-time switch | The retired `NEXT_PUBLIC_HANSA_PROTOTYPE_C` string must not appear anywhere in `app`, `components`, `lib`, `content`, `scripts`, `tests` |
| Registry agrees | `lib/site.ts` must name `source: "components/knowledge/hansa-landing.tsx"`, `canonical: "/"`, `legacy: "/prototype-c/"` |
| No storage writes | No landing file may reference `localStorage`, `sessionStorage` or `indexedDB` |

## Where future work goes

- New landing section or reordering → `components/knowledge/insight-stage.tsx`.
- New landing data → `components/knowledge/hansa-landing.tsx` (and the loader it uses).
- New motion → `lib/knowledge/motion.ts` + the owning component.
- Anything spatial/cinematic → the modules above. **Never** `app/prototype-c/page.tsx`,
  and never a new route that composes the stage itself.
