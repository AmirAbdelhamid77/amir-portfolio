# IA DRAFT — navigation contract and naming proposals (not applied)

This document is a **draft**. Only the items marked *implemented* in the last
column of the taxonomy were changed by this migration. No URL was renamed, no
route moved, and no mass relabelling happened: the 30 proposals below remain
owner decisions, and the machine-readable seed is
[NAMING_REVIEW_SEED_30.csv](audit-baseline/NAMING_REVIEW_SEED_30.csv).

## 1. Navigation contract (implemented)

Two nav sets, one registry (`lib/site.ts`), one header (`components/site-header.tsx`):

```ts
NAV            // interior pages: Today · Work · Learn · Practice · Services · About
LANDING_NAV    // the landing:   Today · Learn · Practice · Atlas · About
SECONDARY_NAV  // Experience & skills · Contact
FOOTER_LINKS   // Work | Learn | Practice groups (unchanged in substance)
```

- **`Today`** (href `/`) is the homepage everywhere, in both sets. The label
  replaces the old ambiguous "Home" and matches what the page is: today's edition
  plus the editions archive.
- **The landing adds `Atlas`** because that is the context of the stage itself;
  the interior pages add `Work` and `Services` because those are their work.
- **Active state is family-based** (`NAV_SECTIONS` + `activeHrefFor`), so a reader
  inside `/learn/chapter/04/` is still in Learn and `/explore/*` counts as
  learning material, while `/lab/*` counts as practice. Only an exact `/` match
  lights `Today`, so `/learn` never looks like the homepage.
- **The sub-destinations became catalogues.** `/learn` and `/learn/statistics`
  were peers of different levels; `Learn` now points at `/learn/catalogue` and
  `Practice` at `/practice/catalogue`, which hold the sub-destinations. Both URLs
  still exist and are linked from the footer.
- **The old root's unique links survived.** The retired directory's doorways are
  covered by `NAV`/`LANDING_NAV`, the landing's own continuation strip, and
  `FOOTER_LINKS`: `/learn`, `/learn/statistics`, `/learn/ar`, `/explore/charts`,
  `/explore/choose`, `/lab`, `/lab/dp-600`, `/lab/dp-600/progress`, `/practice`,
  `/work`, `/work/hse-analytics`, `/services`, `/experience`, `/about`,
  `/contact`, `/search`.
- **The alias is excluded** from the sitemap, the search index and primary nav;
  it claims `canonical: "/"` and is `noindex, nofollow`.
- **Breadcrumbs**: not introduced in this release (no route in the landing family
  needs one; the stage has its own section markers `01 … 05`).

## 2. Taxonomy

### Domain (where the thing lives — unchanged URLs)

| Domain | URL family | Kind |
|---|---|---|
| Knowledge stage | `/` (canonical), `/prototype-c/` (alias) | Landing / daily edition |
| Learning | `/learn/*`, `/explore/*` | Course, reference, lab gallery |
| Practice | `/practice/*`, `/lab/*` | Question banks, scenarios, drills |
| Professional | `/work/*`, `/services`, `/experience`, `/about`, `/contact` | Case studies, services, background |
| Utility | `/search`, `/sitemap.xml`, `/robots.txt` | Discovery |

### Kind / mode (draft vocabulary, not yet wired to content)

| Field | Values (proposed) |
|---|---|
| `contentType` | `lesson`, `reference`, `lab`, `scenario`, `question-bank`, `case-study`, `insight-edition`, `service` |
| `interactionMode` | `reading`, `experimenting`, `testing` |
| `reviewStatus` | `technical_review` (public with the pending notice), `human_reviewed` (admission required for the public feed) |

The only two of those already load-bearing in code are `reviewStatus` and the
edition admission rule in `lib/knowledge/models.ts`.

## 3. Pending Atlas policy (implemented as a truthful state)

`/learn/dp-600/atlas/` and the landing's peek both show the review state instead
of a graph. Copy the guard test enforces: **"Reviewed connections are not
published yet"** with an `Open the Atlas` action; the strings "Explore the full
Atlas" and "Launch full Atlas" must not appear. The landing uses the **public**
projection (`getAtlas()`), never the review-preview flag, so no draft relation can
leak onto `/`.

## 4. The 30 naming proposals — status

Nothing below was applied except where noted. `owner_approval` is `PENDING` and
`implemented` is `NO` in the seed CSV for all 30 rows.

| Priority | IDs | Touched by this migration? |
|---|---|---|
| P0 | N01 (Atlas link label → pending state), N02 (homepage OG/Twitter copy) | **Partially implemented**: the landing tells the truth about Atlas pending, and the root OG/Twitter text is now the Hansa learning identity (`H044`, `H044b`). The naming itself is still an owner decision. |
| P1 | N03, N04, N05, N06, N07, N08, N09, N10, N11, N13, N27 | Not applied. `NAV`/`LANDING_NAV` do not adopt these labels. |
| P2 | N12, N14–N26, N28, N29, N30 | Not applied. |

Two notes for the owner:

- **N04/N05** are the reason `Learn` and `Practice` point at catalogues rather than
  at `/learn` (the course) and `/practice` (visual scenarios): the short label was
  doing two jobs. That structural fix is implemented; the *labels* stay as they are
  until approved.
- **N30** (bilingual headings) touches chapter headings only — untouched here.

## 5. What an approved rename would cost

Nothing in this migration blocks a rename later: the landing resolves its links
through `lib/site.ts` and the stage's own continuation strip, the sitemap is
generated from route files, and `scripts/export-segment-aliases.mjs` already keeps
older segment aliases working. A rename would still be a **separate release** with
its own redirect plan, per the audit's own rule against changing all URLs in one
go.
