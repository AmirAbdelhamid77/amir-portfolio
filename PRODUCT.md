# PRODUCT.md — what this site is, for whom, and how it is organised

Status: **DRAFT, 2026-11-17.** ✔ = accepted by the owner (2026-11-17). ◇ = still a proposal waiting for the owner to accept, change or reject.
Once accepted, this file sets product direction: audience, naming, structure and what visitors see.
The agent references in `docs/agent-reference/` still govern *how* work is done (preservation, accessibility,
visual validation, no paid services). If they conflict with this file on *what* the product is, this file wins.
Evidence for each decision: `../docs/INDEPENDENT_AUDIT_2026-11-17.md`.

---

## 1. One sentence

◇ **Hansa is Amir Abdelhamid's data learning lab: honest, source-backed lessons and practice in
visualization, statistics, SQL, Power BI and Microsoft Fabric. It is also the working proof of how he thinks as an analyst.**

The person is the publisher, and Hansa is the thing he built. One product, one owner, stated the same way on every page.

## 2. Who it is for (ranked)

✔ When two audiences conflict, the higher one wins. Hiring comes first.

| Rank | Audience | Arrives wanting to… | Must reach in one click from any page |
|---|---|---|---|
| 1 | **Hiring manager / client** | Judge whether Amir can do the job | Work, About, Contact (✔ CV later: no CV button appears until the PDF exists) |
| 2 | **Learner** (self-study, DP-600 candidate) | Understand a concept, then practise it | Learn, Practice, Search |
| 3 | **Returning learner** | Continue where they stopped | Their progress (from browser storage) |

**Why hiring comes first:** the site's stated purpose is still to get Amir work. The learning platform is
the strongest evidence for that, so it should be framed as evidence, never hidden *from* the hiring audience.

## 3. Brand and naming

✔ **Lockup:** "Hansa" with a fixed sub-line "by Amir Abdelhamid", the same on every route.
No route-dependent logo, label or initials.
✔ **Page titles:** `<Page> — Hansa`. The author stays in metadata (`authors`, JSON-LD) and on About/Work.

**Names visitors see** (◇ everything else is internal only):

| Use | Means |
|---|---|
| **Learn** | Courses and lessons |
| **Practice** | Question banks, mock exams, mistakes, progress (always spelled "Practice" in UI; "practise" only as a verb in body copy) |
| **Labs** | Interactive experiments (chart labs, statistics labs, Fabric labs) |
| **Reference** | Formulas, glossary, cheat sheets, the Fabric documentation mirror |
| **Work** | Case studies |
| **Insight** | A short daily card derived from a practice question or lesson (see §6a) |

**Retire from the UI:** Observatory, Learning library, Data Lab, Learning Academy, Corpus Academy, Knowledge Atlas
(until it is published), Today, Programmes, editions, and the "AA" mark.

## 4. Navigation

◇ **One primary navigation on every route, including home:**

```
Hansa · by Amir Abdelhamid    Learn   Practice   Work   About        [Search]  [Contact]
```

- The mobile menu has the same four items, then Services, Experience and Contact as secondary links.
- No second primary nav anywhere (the island nav, the landing variant and the CSS that hides the header on home all go).
- **Inside a subject**, one visible tab bar: `Overview · Learn · Practice · Labs · Reference`. It is never inside a
  collapsed `<details>`. Tabs with no content are omitted, not shown empty.
- **Breadcrumbs** always start at a primary item: `Learn / SQL / Window functions`.
- At most two navigation layers above the content (header + subject tabs, with the breadcrumb inline).
  The orientation strip is folded into the subject tabs.

## 5. Structure (target; old URLs keep working)

✔ Subjects in three honest tiers. A subject moves up a tier only when it has the content.

| Tier | Subjects | Shown as |
|---|---|---|
| **Courses** | Data visualization · Statistics · SQL · Power BI | Full subject pages with an ordered path |
| **Certification track** | Microsoft Fabric / DP-600 | One hub: Learn · Practice · Labs · Reference |
| **Practice sets** | Python · Excel · Analytical foundations | Listed under Practice only, until they have lessons |

✔ **Power BI is its own course.** It currently has about 4 taught units. It needs a content plan (prepare →
model → DAX → report → publish & govern) before it is shown as a full course. Until that plan lands, its page
says plainly how much is taught. Power BI material that is DP-600 exam content stays cross-linked from the Fabric track.

✔ **Fabric documentation mirror:** kept for in-site reading and search, and marked `noindex` so it does not
compete with the learn.microsoft.com originals. It stays out of the sitemap and keeps its CC BY 4.0 attribution.

◇ **Target URL shape**, moved later in tested batches with aliases. IDs, anchors, query parameters and
storage keys (`amir-lab-v1`, `amir-fabric-v1`, …) are preserved.

```
/                         Home
/learn/                   All courses
/learn/<subject>/         Subject overview + path
/learn/<subject>/<unit>/  Lesson / chapter / topic
/practice/                All practice
/practice/<subject>/      Bank, mock, mistakes, progress
/labs/<subject>/<lab>/    Interactive labs
/reference/<subject>/     Formulas, glossary, docs mirror
/work/  /work/<case>/     Case studies (incl. "Building Hansa")
/about/  /services/  /contact/  /search/
/insights/                The insight timeline (moved off home)
```

Not public or linked (noindex, removed from navigation, retired after one release):
`/prototype*`, `/archive`, `/review/*`, `/held-articles`, `/insight-records`, `/atlas-records`,
`/content-index`, `/learn/drafts`, `/practice/drafts`.

## 6. Home page

◇ The home page orients; it does not exhibit. In order:

1. **Who and what** in one line, plus two buttons: *Start learning* and *See my work*. *Practice* is a smaller link.
2. **Continue** card: shown only when browser storage holds progress.
3. **Three doors:** Learn, Practice, Work. One sentence and one action each.
4. **Today's insight:** one card, with a "Practise this" link to its source question or lesson and a link to `/insights/`.
5. **Flagship case study** card (labelled synthetic where it is).
6. Footer.

There is no dated-editions framing. Cards rotate, and the page says so.

## 6a. Insights

✔ **The current insight bank is replaced.** It is not good enough to lead with. New insights are **derived
from the site's own validated material:**

- **Question banks first, DP-600 above all.** One insight = the key idea behind a question, especially the
  misconception its wrong options test (taken from the option-level rationale).
- **Course material second.** These come from lesson takeaways, statistics traps and SQL gotchas.

Every insight carries:
- its **source ID** (question ID or lesson unit) and a link to practise or read it;
- the subject and topic;
- the review status inherited from its source.

An insight never states a fact its source does not state. The existing preservation rules apply: question
IDs, answers and wording are not changed. Generating insights is a separate, scoped task. No runtime
LLM is involved: insights are authored or derived at build time and reviewed before they are published.

**First release** (`hansa-question-insights-2026-11-18`, starts 2026-11-18):
- Contents: 90 Fabric/DP-600 insights plus 43 analyst-subject insights (SQL, statistics, Power BI,
  Python, Excel, foundations). Each day shows 2 Fabric and 1 analyst insight, and the deck repeats after 45 days.
- Generated by `node --experimental-strip-types scripts/build-question-insights.mjs`.
  The rules live in `lib/knowledge/question-insights.ts`. Every rejection and suspected answer-key defect is
  listed in `content/knowledge/question-insights.report.json`.
- 557 Fabric questions are eligible, so later releases can rotate in new material without new authoring.
- Dates before 2026-11-18 keep their earlier records.

◇ **Placement:** one card on home plus the full set on `/insights/`. The owner has not confirmed this yet.
Old insight URLs (`/day/...`) keep resolving.

## 7. What visitors see about provenance and review

◇ There is **one** learner-facing status, shown only when it changes a decision:
`Draft — not yet reviewed` (amber dot). Everything else goes in a per-page **"Sources & review"** disclosure
and on `/about/sources`.

| Never in visible UI copy | Instead |
|---|---|
| NOT_RUN, R-numbers, "held", publication gates, rights-review wording | "Not available yet" or omit |
| SHA-256, export shape, figure counts | Sources & review disclosure |
| "owner's Notion export", migration history | Omit |
| Links to `app.notion.com` | Cite the original source |
| Notion emoji / numbering in titles | Stripped at import |
| Placeholder admissions ("portrait pending") | Omit until the asset exists |

The honesty principle stays. Its delivery changes: visitors get one plain sentence, and auditors get the detail.

## 8. Numbers

◇ Every count shown anywhere comes from `lib/site-metrics.ts` and uses a fixed noun:
*lessons* (taught units), *questions* (scored, published), *articles* (documentation mirror).
Source notes and pages are not shown as headline counts. Hubs lead with what the learner can *do*, not with inventory.

## 9. Language

◇ English is the default. Arabic is a **reading mode** per course (`EN | عربي` toggle) with its own lesson list
and an RTL shell. English chapters list English lessons, with a single link to the Arabic companion. Mixed-language
titles are only allowed where a term has no translation (e.g. `JOIN`), and never on the home page.

## 10. Visual principles

◇ The site's distinctive idea comes from its subject: **honest charts**.
- One accent colour. Remove the seven user-selectable accent presets (light/dark stays).
- A signature motif built from annotated mini-charts for section markers and empty states, not decorative glass or gradients.
- Typography: Geist for UI, plus one reading face for long lessons (to be chosen).
- One card radius scale (e.g. 8 / 12 / 16 / full). No arbitrary pixel radii.
- Stat-tile rows are not used as page heroes.
- Motion explains a change; content never depends on an animation finishing.

## 11. Non-goals

- No accounts, backend, paid services or server-side learner data.
- No new subjects until existing tiers are complete.
- The Knowledge Atlas does not appear in navigation until its graph is published.
- No new homepage concepts until §6 has shipped and been reviewed.

## 12. How this document changes

- One file. Decisions are edited in place, with an entry in the log below. Do not add dated handoff folders for product decisions.
- Before starting structural work, check it against §2–§5. If the work conflicts, change this file first (owner approval), then the code.

### Decision log

| Date | Decision | By |
|---|---|---|
| 2026-11-17 | Draft created from the independent audit; all ◇ items proposed | Claude (draft) |
| 2026-11-17 | Hiring is audience #1 (§2) | Owner |
| 2026-11-17 | Lockup "Hansa · by Amir Abdelhamid"; titles "— Hansa" (§3) | Owner |
| 2026-11-17 | Power BI becomes its own course (§5) | Owner |
| 2026-11-17 | Current insight bank replaced; insights derived from question banks (DP-600 first) and course material (§6a) | Owner |
| 2026-11-17 | Fabric docs mirror kept, `noindex` (§5) | Owner |
| 2026-11-17 | CV not ready; no CV button until the PDF exists (§2) | Owner |
| 2026-11-17 | First question-derived insight release built (§6a); not yet committed or deployed | Claude (owner request) |

### Open questions for the owner

1. Insight placement: one card on home plus `/insights/` (§6a)?
2. All remaining ◇ items: navigation (§4), URL shape (§5), home order (§6), status policy (§7), numbers (§8),
   language (§9), visual principles (§10), non-goals (§11).
