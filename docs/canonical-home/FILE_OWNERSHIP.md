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
| `components/knowledge/insight-stage.tsx` | The whole stage: masthead, daily insight, edition rail, claim ledger, dealer, Atlas peek, routing strip. **Imported by the canonical landing and by nothing else** (asserted by test). |
| `components/knowledge/insight-scene.tsx` | One edition's reading surface (scenario → prediction → takeaway → caveat → sources) + `InsightCompact` |
| `components/knowledge/insight-experiment.tsx` | The scenario interaction/derived readout |
| `components/knowledge/insight-rail.tsx` | The condensed kinetic edition rail (beUI timeline adaptation): wheel, drag, flick, arrow keys, reduced-motion fallback |
| `components/knowledge/knowledge-dealer.tsx` | The card dealer (deck → hand → spread → flip) |
| `components/knowledge/insight-archive.tsx` | The archive board and its filters |
| `components/knowledge/atlas-peek-stage.tsx` | The Atlas peek inside the stage (published-only relation guard) |
| `components/knowledge/knowledge-atmosphere.tsx` | The stage's atmosphere layer |
| `lib/knowledge/insights.ts` | The one insight loader (`eligibleInsights`, `searchInsights`, `selectedInsight`) |
| `lib/knowledge/models.ts` | Insight types and the edition admission rule |
| `lib/knowledge/motion.ts` | Motion tokens used by the stage |
| `content/knowledge/insights.json` | The three reviewed editions |

## Retired (recorded, not silently deleted)

| File | Action | Reason | Evidence |
|---|---|---|---|
| `components/knowledge/knowledge-stage.tsx` | Deleted (staged) | The previous root landing implementation; keeping it would leave two landing trees | `INTEGRATION_MANIFEST.json` → `removed[1]`; test asserts absence |
| `components/knowledge/prototype-c.tsx` | Deleted (staged) | A 9-line pass-through whose only job was naming the route; the landing is now imported directly | `INTEGRATION_MANIFEST.json` → `removed[0]` (records that this path had *already* drifted at HEAD) |

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
                                          ├─→ insight-scene.tsx ─→ insight-experiment.tsx
                                          ├─→ insight-rail.tsx
                                          ├─→ knowledge-dealer.tsx
                                          ├─→ insight-archive.tsx
                                          ├─→ atlas-peek-stage.tsx
                                          └─→ knowledge-atmosphere.tsx
```

## Deliberately untouched

Question banks (`content/drafts/`, `content/intake/`, `intake/`), learner progress
(`lib/fabric/storage.ts` and its storage keys), Atlas graph relations,
`/learn/*`, `/lab/*`, the new draft-review routes, and the media intake files.
