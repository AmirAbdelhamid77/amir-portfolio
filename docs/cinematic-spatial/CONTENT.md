# Content — how the next idea joins the acts

The stage is a projection of real records, not a layout to be filled with
copy. Nothing on this page is written twice: the hero, the seed card, the Atlas
vertices, the coda, the rail and the archive all read the same data.

## 1. One edition = one record

`content/knowledge/insights.json` (3 records today) is the only source of an
edition. Each record feeds a specific part of the stage:

| Field | Where it appears |
| --- | --- |
| `id` | selection key, `?insight=` deep links, `data-*` hooks |
| `date` | hero edition link, date badges in the Atlas, rail, archive, seed card |
| `topic` | hero status line, `Principle · {topic}` on the seed card, coda context |
| `title` | hero edition link, Atlas inspector, archive heading |
| `cardTitle` | seed card headline, dealer card face |
| `takeaway` | seed card body, dealer principle card, scenario |
| `caveat` | dealer caveat card, reader panel, archive reasoning |
| `scenario` | Act III scenario block |
| `prediction` | Act III reveal ("what to think about first") |
| `conceptId` | Atlas hub vertex (`concept:…`) and semantic coda |
| `lessonHref` / `practiceHref` | Atlas destination vertices and the coda links |
| `sourceId` / `sourceUrl` / `sourceLocator` | source vertex, inspector link, archive source |
| `checkedAt` / `reviewStatus` / `reviewer` | review status shown in the eyebrow, the Atlas and the archive |
| `questionIds` | question references preserved for the practice routes |

Adding a fourth edition is a data change plus a build. The Atlas picks it up
automatically: `buildField` allocates it a slot on the edition ring, and every
vertex it shares with an existing edition (concept, lesson, practice, source) is
reused rather than duplicated.

**Do not** add placeholder cards, invented topics or decorative vertices. The
dealer's deck is derived from the record; the Atlas only draws what the record
states.

## 2. The dealer

`insightCards(insight)` in `lib/knowledge/models.ts` derives the hand:

* `principle` starts in the hand (`defaultZone`), everything else starts in the
  deck;
* the deck holds `caveat` and `evidence`;
* the button label is computed from the deck (`Deal 2 more`, `Deal three ideas`).

If a record gains a third supporting card, the label and the fan geometry update
with it — no component change is needed. Keep the `aria-label`s
(`Knowledge card tray`, `Selected card`, `Back to the hand`) intact; QA asserts
them.

## 3. The Atlas and publication governance

`lib/atlas/model.ts` is fail-closed. `projectAtlas(data, published)` publishes a
vertex or an edge only when the record is human-reviewed; today every concept
(42) and relation (49) is `technical_review`, so the public projection contains
no semantic edges and `tests/atlas/expansion.test.mjs` locks that in.

Consequences for new content:

1. A new edition still appears (editions are records with a real route and a
   real date). Its concept hub is drawn because the edition **states** the
   concept; that is a membership fact, not an inferred relation.
2. A semantic edge (concept → concept) only appears after human publication
   review flips the record. Until then the field keeps the in-place label
   "semantic relations · awaiting human publication review" and
   `data-pending="true"` on `.atlas-field`.
3. Never synthesise a relation to make the field look richer. A sparse, honest
   field is the design; the narrative is carried by camera, depth and labels.

## 4. Tuning the travel

Long-form additions to Act III do not need new motion code: they belong inside
`.cine-content` and use `<Reveal pattern="…">`, which reads `CINEMATIC` tokens.
If an act grows enough that the Atlas travel should lengthen, set
`--atlas-travel` (default `240vh`, `200vh` below 1024px) rather than adding
scroll listeners.

## 5. Copy rules that QA enforces

The landing must keep these strings reachable in the DOM:

* "the daily insight", "one idea.", "deal an idea", "knowledge atlas",
  "the insight archive";
* "Editions under editorial review" and "Technical review" inside `#today`;
* the coda eyebrow "Semantic layer · review status".

`scripts/qa-canonical-home.mjs` fails the build contract if any of them
disappear, so a copy edit cannot quietly drop the review status.
