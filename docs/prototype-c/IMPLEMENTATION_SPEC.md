# Prototype C — agent implementation specification

## Product intent and decision hierarchy
Audience: a learner who wants a useful data/Fabric concept without navigating a maze. Prerequisite: basic awareness of data storage; no previous session required. Observable outcome: explain the relevant distinction, name its caveat, and choose an appropriate next resource. The first action is thinking, not choosing among course directories. The stage carries one primary scenario and one smaller optional discovery deck; the graph is a contextual continuation.

The owner's current requirements supersede older professional-homepage recommendations: **Today / Learn / Practice / Atlas / About**, no Work or Experience presentation on the homepage; preserve their actual website pages. This is a prototype interpretation, not a pixel reconstruction of inaccessible mockups.

## Visual Design Direction
**Editorial learning desk.** Large calm typographic opening, short date rail, clear main teaching card, smaller card stack, then a quiet Atlas preview. Reading depth comes from content hierarchy and progressive disclosure. Use existing Geist / Geist Mono and semantic CSS variables; do not replace the global palette or import fonts.

| Element | Exact implementation direction |
|---|---|
| Canvas | Current background token; max width `72rem`/1152px; 16px mobile gutter, 24px from sm |
| Top spacing | 96px narrow / 112px desktop from page top, clearing the fixed 56px header |
| Primary heading | 48px narrow, 60px sm, 72px lg; weight 500; line-height 1.08; negative tracking; balanced wrap |
| Supporting copy | 16px / 32px; muted token; max ~36rem; no placeholder statistics |
| Micro labels | 12px mono; generous tracking; never the only label for an action |
| Timeline | Structural outer border, 16px radius; three equally important editions in an ordered list; selected date has border + `aria-current` |
| Stage | 24px radius; 24px padding narrow, 36px wider; foreground text on card token |
| Desktop columns | At lg (1024px): `1.65fr 1fr`, 20px gap; natural height, no fixed card clipping |
| Card stack | One semantic readable card and one aria-hidden backing layer offset 8px; no overlap over the reading surface |
| Buttons | Pill, at least 44px high, explicit focus outline; primary foreground fill + background text; secondary structural border |
| Spacing | 12/16/20/24/32/40/48/56px rhythm; content sections never depend on arbitrary absolute positioning |
| Palette | `background`, `foreground`, `card`, `muted-foreground`, `border-strong`, `primary`, `primary-foreground`; test both light/dark and existing accent presets |
| Icons | Existing lucide, 16–20px, decorative `aria-hidden`; text identifies the task |
| State | Selection: outline + date text. Feedback: visible sentence. No reliance on green/red, hover or tiny badges |
| Motion | Immediate edition/deck updates and existing ≤150ms color transitions; no flying body copy, autoplay, scroll-jacking or parallax. Reduced motion retains all meaning |

This prototype prioritizes readable Hansa knowledge cards over the upstream playing-card fan. It intentionally does not claim to install beUI Timeline or Card Dealer. Refer to the scored alternatives in `COMPONENT_DECISIONS.json`.

## Desktop wireframe — 1440px viewport
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Existing brand   Today  Learn  Practice  Atlas  About   Search  Theme    │ 56px fixed
└─────────────────────────────────────────────────────────────────────────┘
   ┌────────────────────── max 1152px ────────────────────────────────┐
   │ HANSA / KNOWLEDGE STAGE                    Local editorial preview│
   │ A small idea. A better decision.                                  │
   │ Make room for                                                    │
   │ one good question.                  (intentional quiet space)      │
   │ Short invitation / explanation                                   │
   ├───────────────────────────────────────────────────────────────────┤
   │ Daily Insight / condensed timeline                 All editions → │
   │ [26 Oct · Reference] [25 Oct · Object] [24 Oct · Location]         │
   └───────────────────────────────────────────────────────────────────┘
   ┌──────────────────────────────┐ ┌──────────────────────────────────┐
   │ 01 / THINK IT THROUGH        │ │ 02 / CHANGE YOUR LENS            │
   │ Title + scenario             │ │ Deal an idea.                    │
   │ Prediction cue               │ │  ┌ knowledge card / 1 of 3 ┐    │
   │ ▸ Reveal the reasoning       │ │  │ takeaway                │    │
   │   takeaway / caveat / source │ │  │ ▸ Caveat & source       │    │
   │ [Read lesson] [Practice →]   │ │  └─────────────────────────┘    │
   └──────────────────────────────┘ │ [Deal next] [Reset]              │
                                    └──────────────────────────────────┘
   ┌───────────────────────────────────────────────────────────────────┐
   │ Atlas Peek: exact existing published projection                    │
   │ connections + evidence if available; honest pending state if empty│
   │ [Full Atlas] [Guided journey]                                      │
   └───────────────────────────────────────────────────────────────────┘
   [Learn door]                [Practice door]              [Atlas door]
   Archive       [search insights____________] [topic ▾] [Clear filters]
   [Edition row + native explanation + source + edition permalink] × 3
   Editorial disclosure / existing learning footer (no Work/Experience)
```

## Mobile wireframe — 390px and 320px
```text
┌──────────────────────────────────────┐
│ Brand       Search Theme [Menu]      │ fixed header; dropdown, not modal
├──────────────────────────────────────┤
│ Knowledge Stage / Preview            │
│ Make room for                        │
│ one good question.                   │ wraps naturally; no clipped words
│ Invitation                           │
│ Daily Insight       All editions →   │
│ [26 Oct · Reference]                 │ actual ordered list, stacked <640px
│ [25 Oct · Object]                    │ no horizontal dragging required
│ [24 Oct · Location]                  │
│ ┌ Daily scenario ──────────────────┐ │
│ │ Title / prompt / prediction      │ │
│ │ ▸ Reveal                         │ │ native summary, ≥44px
│ │ [Lesson] [Practice]               │ │ wraps
│ └──────────────────────────────────┘ │
│ ┌ Dealer + readable card ──────────┐ │ follows scenario in DOM order
│ │ [Next card] [Reset deck]         │ │
│ └──────────────────────────────────┘ │
│ Status sentence                     │
│ Atlas Peek / honest empty state     │ no full graph shoved into mobile
│ Learn / Practice / Atlas doors      │ one column <768px
│ Archive / global search link        │
│ Search field                        │ filters wrap, every label visible
│ Topic [____] [Clear filters]        │
│ Results and edition accordions      │
│ Disclosure + learning footer        │
└──────────────────────────────────────┘
```

At 640–1023px, Timeline has three columns but the teaching stage/dealer remain stacked. At ≥1024px, stage/dealer form two columns. At 200% zoom use the resulting narrow layout; avoid fixed reading heights. Any future RTL page uses `lang=ar`, `dir=rtl`, logical spacing and LTR code/URLs; the current English prototype is not an Arabic localization.

## Information architecture and destinations
| Task label | Prototype destination | Canonical existing destination / later release |
|---|---|---|
| Today | `/prototype-c/` | `/` once approved; do not create `/today` migration merely for the label |
| Learn | `/learn/catalogue/` | same; retain `/learn/` as visualization course, not a new global redirect |
| Practice | `/practice/catalogue/` | same; retain `/practice/` visualization and `/lab/` engines |
| Atlas | `/learn/dp-600/atlas/` | same; separate statistics atlas remains in its course |
| About | `/about/` | same; professional pages remain accessible through existing website routes/context |
| Search | `/search/` | existing federated search, not a second global search overlay |
| Archive | `#insight-archive` | same page section initially; separate route only when volume justifies it |

Global adoption backlog: share one navigation definition across all five destinations and use the longest matching route prefix so Atlas does not also activate Learn. Retain professional routes in About/contextual navigation without reintroducing Work/Experience homepage cards. This prototype does not silently change navigation throughout the rest of the site.

## Exact UX flows and state transitions
### F1 — New visitor: observe, predict, discover, transfer
1. Open `/prototype-c/`: latest available preview edition selected, explanation closed, first knowledge card visible. Dates denote preview editions, not fabricated publication events or a claim of a live daily scheduler.
2. Read scenario; prediction cue offers a reasoning lens. No answer input or assessment score is required.
3. Activate `Reveal the reasoning` by pointer, touch, Enter or Space. Native `<details>` opens in document flow; focus remains on summary. Read takeaway, conditions and source. Closing restores the compact state.
4. Choose `Read the lesson` → unchanged `/learn/dp-600/ingestion/`; or `Explore practice` → unchanged `/lab/dp-600/explore/`. This is a catalogue link, not a fabricated question-specific association or filter.
5. Browser Back returns to the edition URL. Reveal and deck state reset on full reload; no saved-answer promise is made.

### F2 — Timeline and shareable edition
1. Select any edition link. JavaScript sets the canonical edition ID and pushes `?insight=<stable-id>` into the URL, retaining unrelated query parameters.
2. Scenario/title/date change; native details remounts closed. A polite status sentence announces selection. No automatic scroll or focus move.
3. Copy the address; reload or direct load resolves the same ID after hydration. A missing/invalid ID falls back to latest preview and displays an explicit warning.
4. Browser Back/Forward resolves URL state through `popstate`. The rail never cycles automatically.
5. Without JavaScript, Timeline anchors lead directly to complete archived editions. The initial stage is still readable. No claim that static server HTML varies by query parameter.

### F3 — Card Dealer / knowledge card
1. First card and counter appear at load; all factual text comes from canonical insight records.
2. `Deal next card` cycles in fixed order modulo eligible card count. No duplicates before completing the cycle; after the last card it returns to first. This is discovery, not randomized difficulty, mastery or a game score.
3. `Caveat & source` opens a native disclosure. Dealing closes the old card disclosure; action focus remains on the button. Status announces card change.
4. `Reset deck` selects first card and announces reset. It never clears practice, Atlas or theme state.
5. Zero eligible cards: show honest empty learning destination rather than dividing by zero or manufacturing a card.

### F4 — Atlas Peek → Explorer → Guided Journey
1. Stage renders the existing `AtlasPeek` with `getAtlas()` public projection. No review override is added by this feature.
2. If published edges exist, show bounded semantic claims with existing evidence deep links; follow exact current Atlas behavior.
3. If none exist, show the actual pending-publication message and ordinary lesson/journey destinations. Do not substitute review-only nodes, illustrative connections, hierarchy or progress dots.
4. Full Explorer retains its URL filters, concept/edge IDs and return links. Guided Journey retains its own storage schema. No graph-engine installation or relationship publication occurs here.

### F5 — Discovery and archive search
1. Scroll or activate `All editions` to reach the archive anchor, clearing the fixed header.
2. Search title/scenario/takeaway/caveat/topic/card title using a trimmed case-insensitive substring; optional topic filter intersects results. Result count updates visibly and with a status role.
3. Zero matches: explicit recovery sentence; `Clear filters` resets query and topic, without changing selected scenario or deck.
4. Open an archive disclosure to read the complete explanation inline, or open its edition permalink to set the stage after hydration.
5. Use `Search all Hansa` for broader discovery. The existing search index is preserved; draft preview scenarios are intentionally not inserted into the public index.

### F6 — Theme, keyboard, small screens, errors
Existing theme controls work across the stage. Dropdown menu uses `aria-expanded`, Escape and focus return from the shared shell. Keyboard tab order follows DOM: shell → Timeline → scenario reveal/source/CTAs → deck → Peek → doors → search/filter/archive. Content is never hover-only. Reload clears transient stage/deck/search state, retaining edition in URL and all unrelated existing storage. If scripts fail, native disclosures and full archive stay readable. No remote loading spinner is necessary: all stage content is included in static export.

## Implementation map
| File | Responsibility |
|---|---|
| `content/knowledge/insights.json` | Only new insight/card content authority; stable IDs, source locators, editorial status |
| `lib/knowledge/insights.ts` | Public/preview eligibility, bounded search, safe selection fallback |
| `components/knowledge/knowledge-stage.tsx` | Client memory state, native disclosures, Timeline, deck, archive and destinations |
| `components/knowledge/prototype-c.tsx` | Server composition of canonical feed + existing projected Atlas |
| `app/prototype-c/page.tsx` | Isolated noindex preview route |
| `app/page.tsx` | One opt-in build-time root switch, otherwise prior home intact |
| `components/site-header.tsx` / footer | Prototype-scoped IA and homepage-safe footer |
| `scripts/prototype-c-*.mjs` | Preservation, production snapshot, handoff manifest and successor evidence |
| `tests/knowledge/insights.test.mjs`, `scripts/qa-prototype-c.mjs` | Content gate/search and actual browser acceptance |

No external runtime service, account, telemetry, learner data transfer or recurring fee is added. Source links navigate only when invoked. No new graph or animation dependency is required.
