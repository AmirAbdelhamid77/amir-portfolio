# 04 — Canonical knowledge, Atlas, navigation and data-state contracts

## Hansa is not a content-free motion demo

Daily Insight comes from a curated, source-backed knowledge bank. Questions provide pedagogic prompts and related application links; **unreviewed answer keys never become authoritative facts**. `scientifically_verified` and `source_reviewed` are separate flags; source authenticity != scientific approval. Atlas edges are typed, cited, stable, publication-gated.

## Suggested TypeScript contracts (illustrative, adapt repo naming)

```ts
type ReviewStatus = 'draft' | 'source_checked' | 'scientific_approved' | 'rejected';
type PublishStatus = 'private' | 'ready' | 'published' | 'archived';
type InteractionKind = 'prediction' | 'parameter_model' | 'compare' | 'trace' | 'explain_only';
interface Insight {
  id: string; slug: string; title: string; lang: string;
  publicationDate: string; timezone: 'Africa/Cairo'; topicId: string;
  objective: string; scenario: string; shortExplanation: string;
  detailSections: Array<{id: string; type: 'principle'|'experiment'|'misconception'|'evidence'; body: string}>;
  interaction: { kind: InteractionKind; fixtureId?: string; inputSchemaId?: string; calculationId?: string };
  sourceRefs: string[]; lessonRefs: string[]; questionRefs: string[];
  conceptIds: string[]; edgeRefs: string[];
  scientificReview: ReviewStatus; publication: PublishStatus;
  updatedAt: string;
}
interface CanonicalAtlasEdge {
  id: string; sourceId: string; targetId: string;
  relationType: string; evidenceRefs: string[];
  reviewStatus: ReviewStatus; publication: PublishStatus;
}
```

Do NOT automatically infer missing relations from question co-occurrence or vocabulary similarity. Recommended suggestions are not published graph truth. Before coding, adapt existing canonical schemas; **never duplicate authoritative registries**.

## Publication gates

- Only `scientific_approved` + `published` insights show to general public as verified explanations.
- Only edges with approved/published status appear as visible concept relationships in the public Atlas Peek.
- Demo fixtures can be original **synthetic** and clearly labeled; never masquerade as measured customer/company data.
- Preserve IDs, original raw question, source mapping, QA histories and attempts. No question bank migrations in landing implementation.
- Display source references within Evidence card and meaningful `View source` links; do not fabricate citations or a Microsoft endorsement.
- If there's no approved insight on a calendar day, use a clearly labeled curated featured insight; don't fake daily publishing.
- If Atlas has zero published edges (the live page showed publication pending in prior audit), provide honest list-based related *verified lessons* and explicit status, not a theatrical fake 3D network.

## Stable date and archive behavior

Use a static manifest (build-time) of approved insights, not unsupervised daily AI generation or an unnecessary production backend. Compute current site date in `Africa/Cairo`; SSR/static markup should not silently mismatch hydration due to client timezone. For a static export, use a safe deterministic shell then derive today's date in a client island; do not show the wrong day in initial markup. Archive links use stable slugs and work on hard-refresh and deep-link.

At minimum: today fallback, previous day, 3+ archived items, unknown slug/404, duplicate publish date conflict validation, date rollover at midnight Cairo, and hydration-safe client behavior. Timeline chronological order is deterministic; no random date order.

## Data story acceptance: example revenue vs margin

Only use synthetic labeled parameters. Keep numbers mathematically consistent; test math with independent calculations. For illustration: baseline revenue 100, cost 70, profit 30, margin 30%; new revenue 118, choose cost 88.5, profit 29.5 and margin 25%. Revenue +18%, margin -5 **percentage points**, absolute profit -0.5, but conclusion depends on objective and period. These numbers are a *candidate fixture*, not content cleared for public publication; scientific/editorial review first.

On slider/choice change: update exact values, chart marks and explanatory text from the SAME pure model. Show assumptions, unit labels, data table, reset. No 3D distortion for quantitative comparison.

## IA and routing — target semantics, verify actual paths

**Global:** `Today | Learn | Practice | Atlas | About` + `Search`. Do not convert Learn or Practice into unlabeled dropdown piles. Footer/about can link Work/Experience/Services/Contact but landing body contains no portfolio showcase.

- Today `/` → Daily Insight, timeline/archive, card reader, Atlas Peek, Learn/Practice continuation.
- Learn → course/reference catalogue, then DP-600, Statistics, Data Visualization, labs.
- Practice → question-bank catalogue, then drills/assessment and progress.
- Atlas → source-backed full graph/related lessons with publication status.
- About → author identity, work, experience, services, contact links.
- Search → sitewide index with result type, topic, language and deep link.

**Never assume:** `/learn/` can be replaced immediately; prior audit says it currently corresponds to Visualization course. Current published catalogue is `/learn/catalogue/`, practice catalogue `/practice/catalogue/` and Atlas route `/learn/dp-600/atlas/`. Confirm latest actual routes and redesign header labels without destructive renames. No route migration without URL-alias + query/hash+storage compatibility test.

## UX flow conventions

Navigation is task-based; Atlas is complementary **knowledge graph**, not filesystem or breadcrumb replacement. Visible current location + next logical action on every lesson. One primary CTA per state. `Today` route must never force user to complete the Insight to access Learn/Practice.

**Visitors:**
- curious first-timer: prompt → try/reveal → principle card → relationship → lesson;
- directed exam learner: search → DP-600 lesson/question directly without mandatory cinematic intro;
- returning learner: unobtrusive `Resume` only with real saved progress; no fake stats;
- professional visitor: About/Work direct access, not homepage hero.

## Semantics and privacy

Avoid account/backend changes for local progress. If reusing browser storage, leave existing namespaces and keys untouched. Any new insight dismissal/progress storage key must be namespaced/versioned with explicit migration plan; no destructive overwrite. No analytics user profiling added without review.
