# HANSA — Master UX, Information Architecture, Accessibility & Portfolio Upgrade Plan (v2)

**Audit date:** 2026-10-24  
**Target:** <https://hansa.amir-portfolio.workers.dev/>  
**Scope:** read-only live-site audit **plus comparative source-code and editorial review** of the user-supplied `portfolio-upgrade.zip`. This v2 is the **single master specification**: retain all supported v1 conclusions and incorporate accepted elements from the package only after adaptation and verification. **No changes made or deployed.**  
**Revision:** v2, 2026-10-24. Prior v1 preserved separately as an evidence baseline.  
**Inputs:** (A) `hansa_live_site_audit_and_reorganization_plan_2026-10-24.md` (355 lines); (B) `portfolio-upgrade.zip` (README, copy tasks, Next.js components, Cloudflare Worker, SEO utilities and PWA files).  
**Accessibility target:** WCAG 2.2 AA (<https://www.w3.org/TR/WCAG22/>).

## 0. Evidence, scope & limitations

The v1 live-site inspection navigated the public site's accessible links and examined page content for Home, Work, all three cases, Services, Experience, About, Contact, general Data Lab, SQL quiz, DP-600 overview/explore/study/practice/mock/cases/review/progress/resources, Data Visualization course and individual lesson/chapter, Arabic path, the library map, Chart chooser, Chart labs, Integrity lab, dashboard composition, specialty charts, visualization practice bank, Statistics overview, one journey (including hypothesis journey), Labs directory and individual labs, formulas, glossary, atlas, field guide and statistical tool finder. Representative clickable URLs are linked throughout this report.

**Evidence classification:** `Observed` = directly present in retrieved live pages; `Inferred design problem` = recommendation based on observed organization or content; `Needs manual/automated test` = cannot be asserted as an actual failure from the text/link exploration. Live page retrieval is not the same as an authenticated full browser session. JavaScript controls could not be exercised, desktop/mobile screenshots were not captured, computed contrast and visual layout were not measured, axe was not run on the DOM, and screen-reader output was not audited. The ZIP's source code was inspected as **unintegrated candidate implementation**; its code was not compiled, executed in the Hansa repository, deployed or end-to-end tested. Candidate-code defects are therefore **package risks**, not findings that those defects already exist on the live site. Statements in proposed copy—including identity, university-project history, response-time promises, accomplishments and project figures—must be verified with the owner before publication.

Client-side loading text in an initial document must **not** be treated as proof that the feature is broken after hydration. The attempted `sitemap.xml` and `robots.txt` reads were inaccessible through the retrieval mechanism; that is **not** proof those files are missing from the server.

## 1. Executive conclusion

### Master decision after package review

**Retain the v1 IA as the organizing principle.** Hansa should be a single identity serving three jobs: **evaluate professional work, learn concepts, and practise skills**. The ZIP's strongest incremental value is in the professional evidence, CV/contact conversion, helpful accessibility utilities, source provenance and SEO governance. Adopt those **as adaptations**, not as a copy-and-paste patch. The ZIP has **not** established that its components compile against the repo; its timing, service-worker, worker/API and regex classification proposals carry specific pre-release risks.

**Design principle:** no portfolio improvement should obscure education. **Engineering principle:** no educational, accessibility or deployment enhancement should replace existing progress, URLs, question IDs, original material or user data without tested migration and owner approval.

The site contains three interrelated product experiences: (1) professional BI/data portfolio and services, (2) structured visual/data learning, and (3) practice/exam engines. Each is valuable. The top-level navigation currently mixes them into eight peers — Work, Experience, Services, Data Lab, Learn, Statistics, Labs, About — plus Contact. Meanwhile, `Learn` is specifically the Data Visualization course rather than a catalogue, `Statistics` is nested under `/learn/` even though presented at the same nav level, `Labs` means visualization demonstrations under `/explore/`, and `Data Lab` means assessment questions under `/lab/`. This is the principal IA problem.

**Recommendation:** five primary destinations **Work · Learn · Practice · Services · About**, an explicit **Contact** CTA, and a global **Search** affordance; use local subnavigation for courses and question banks. Retain existing source content, progress schemas and deep links while performing staged route migrations. Keep the home page a task-led gateway, not an exhaustive catalogue.

### What v2 incorporates from `portfolio-upgrade.zip`

- **Career credibility:** an accessible downloadable CV, verified professional-project/case-study evidence, verification links for qualifications, and an honest division between professional and synthetic portfolio work.
- **Sharper visitor journeys:** a three-choice homepage gateway, but use **Explore Work → `/work/`**, **Start Learning → a new learning catalogue**, and **Test Skills → a practice catalogue**; keep project inquiries in the hero/header and Services.
- **Accessible interface primitives:** descriptive links instead of repeated `Start`/`Details`; explicit Arabic `lang` and `dir`; language badges with readable labels; visible focus, minimum touch targets, reduced-motion behavior and responsive navigation, all validated in-context.
- **Metadata hygiene:** one verified public-facts registry; page-unique canonical/OG/Twitter metadata, generated sitemap and robots policy, optional schema.org markup tied to actual content.
- **Educational integrity:** per-pack source credits and independently written-question claims only when backed by provenance; expanded semantic-model objective coverage after the existing mapping/count audit.
- **Practical conversion:** visible email + Copy email as a dependable baseline; a backend contact form, custom domain, booking tools, analytics, PWA/offline and prices are **conditional**, not default requirements.

### Notable strengths to preserve

- Skip-to-content link and descriptive page titles; consistently visible high-level IA in source content.
- Project case studies use decision/method/limitations and explicitly label synthetic data.
- DP-600 differentiates independent practice from actual Microsoft exam questions and exposes serious objective-coverage limitations rather than making an unrealistic exam-equivalence claim.
- Course has 10 chapters, 25 source pages and 11 Arabic lessons, with sources and provenance; statistics keeps 43 original sections and offers nine learning journeys, 15 labs and 102 source formulas.
- Educational charts generally have plain-language interpretations, numbers and sometimes tabular alternatives; labs have seeded/synthetic disclosures, resets and warnings.
- DP-600 question bank is 834 questions, structured by objective, topic, pack and mode; per-device history has export/import.

## 2. Prioritized finding register

| ID | Priority | Confidence | Page(s) | Finding | Implementable correction |
|---|---|---|---|---|---|
| F01 | P0 content integrity | Observed discrepancy, interpretation conditional | `/lab/dp-600/` | Domain-focused counts (297/170/13) don't reconcile with displayed focused sub-objective totals (347/125/8). May reflect alternate assignment or multi-mapping; currently no reconciliation explanation. | Centralize aggregation over explicit tags, document membership rules, state whether counts are unique or overlapping, add assertions/tests so summaries reconcile under those rules. |
| F02 | P0 content integrity | Potential inconsistency, requires definitions | `/work/hse-analytics/`, `/` | TRIR=0.19 and LTIFR=0.28 per 1M hours: unexpected if lost-time cases are a subset of recordables under identical population/time denominator. | Compare numerator, denominator, scope, dates and standard; correct data or explain incomparable definitions before using the numbers as endorsements. |
| F03 | P1 IA | Observed | Global header | Eight top-level peers mix portfolio, courses, stats and labs, obscuring parent-child relationships. | Reduce to five task-based items and CTA, plus contextual subnav. |
| F04 | P1 IA | Observed | `/learn/`, `/learn/statistics/`, `/explore/`, `/lab/` | Learn=visualization only; Statistics lives under learn yet separate in nav; Labs=visual lab; Data Lab=exams; `/practice/`=visualization-only practice. | One learning catalogue and practice catalogue; visible descriptive sublabels. |
| F05 | P1 discoverability | Observed separate indexes | DP explore, Statistics, Data Lab | Search is local to separate products; no sitewide federated search established in inspected navigation. | Global client-side index with type/topic/language/level filters and deep links; local search remains. |
| F06 | P1 pedagogical usability | Inferred from rendered density | Stats journey `/learn/statistics/journey/hypothesis/` (~992 text-extraction lines) | Long journey interleaves substantial prose and full interactive exhibits; hard to scan, skim and resume. | Short journey overview, section anchor index, progressive disclosure of teaching demos, sticky non-obscuring TOC, 'Continue' navigation, bounded embed weight. |
| F07 | P1 navigation | Observed | `/lab/dp-600/` and its nine tabs | Nine submodes of roughly equal emphasis make novice path selection harder than it should be. | Primary actions: Start learning, Practice weak areas, Browse questions; rest inside Study/Practice/Review/Resources groups. |
| F08 | P1 discoverability | Observed | `/lab/dp-600/` | Topic card 'OneLake & storage foundation' shows 0 questions but is clickable into a filtered explorer. | Disable or relabel empty categories with clear 'No questions yet'; offer nearby topics or learning notes instead. |
| F09 | P1 accessibility | Needs runtime tests | All interactive labs, quizzes, contact | Control focus state, keyboard use, announcements, alternative chart text, 320px reflow, zoom, tap targets cannot be certified from extracted content. | Run full WCAG AA matrix below; fix issues and rerun. |
| F10 | P1 search/SEO | Observed initial content, dynamic state unverified | `/lab/dp-600/explore/` | Question stems are absent from pre-hydration text ("Loading the question index"); direct deep-linking and indexability need verification. | Shareable question URLs, descriptive loading/empty/error states, static searchable metadata/crawlable learning previews; don't expose answer keys to pre-exam candidates. |
| F11 | P2 hiring funnel | Observed | `/experience/`, `/about/` | Site explicitly says downloadable CV and certificate images are not available yet. | Provide a verified one-page accessible PDF CV and selection evidence, with safe public information only. |
| F12 | P2 learner persistence | Observed | `/lab/`, `/lab/dp-600/progress/` | General exams and Fabric use separate localStorage namespaces, and Fabric has a specific export/import flow. | Unified visible progress gateway without merging data schemas in first release; optional cross-product backup after proper migration plan. |
| F13 | P2 content ergonomics | Observed | `/learn/foundations/`, statistics journeys | File hashes, source block counts and provenance are surfaced prominently above learning content. | Keep provenance discoverable as an expandable source panel after primary learning objective; do not erase it. |
| F14 | P2 microcopy | Observed | DP explorer | Search placeholder uses "V-ACUUM" rather than `VACUUM`. | Correct spelling and search examples. |
| F15 | P2 mobile | Needs viewport test | Header, filters, formulas, table-heavy journeys, cases | Long labels, tables, formulas and multi-control layouts warrant dedicated small-screen audit. | Apply responsive test matrix; no desktop-only essential controls. |
| F16 | P2 contact friction | Observed method, behavior unverified | `/contact/` | Message form opens external mail app (no backend delivery). Some visitors have no default mail handler. | Clearly label 'Open email app', provide always-visible Copy email and direct email link; preserve draft text if handler cannot open. |

### Additional v2 finding register — proposed-package opportunities and safeguards

**Do not label these as confirmed live-site bugs.** They are actionable findings from the candidate patch and associated editorial tasks.

| ID | Priority | Status | Finding / accepted improvement | Integration requirement |
|---|---|---|---|---|
| V01 | P1 | Adopt after factual verification | The experience page could include professional university automation and analytics projects. | Confirm employer/role, project dates, permission to name institution, deliverables, actual impact; use approved anonymized evidence. Do not publish ZIP copy containing `[CONFIRM]`. |
| V02 | P1 | Adopt | Downloadable accessible CV and qualification links improve recruiter journey. | Publish only verified, privacy-reviewed files; functional download and meaningful labels; avoid placeholders/broken links. |
| V03 | P1 | Adapt | Three homepage gateway cards are useful but ZIP's “I want to learn” sends learners to `/lab/` exams. | Three distinct routes: Work, Learn, Practice. Keep Services/Contact discoverable elsewhere. |
| V04 | P1 | Adopt/adapt | Semantic link labels, Arabic wrappers, readable language badges and focus CSS are helpful. | Integrate with existing components/tokens; do not blanket-replace native controls; test actual accessibility. |
| V05 | P1 | Adopt/adapt | Central public-facts registry, page metadata, canonical/OG/Twitter, sitemap and robots. | Verify real routes/images/data; generate sitemap from content inventory; never ship invented OG assets or schema facts. |
| V06 | P1 | Adopt after review | Source credits and original-authorship disclosures for each question pack. | Tie to existing source metadata and rights/provenance; allow multiple sources; do not change original questions/IDs during IA work. |
| V07 | P1 | Redesign, don't copy | Proposed timer stores mode but not attempt elapsed time, pause state or deadline; `setInterval` counts can drift. | Derive remaining time from persisted session timestamps and accumulated pauses; restore after refresh; expiry idempotent; offer accessible accommodation rules separately from exam-simulation settings. |
| V08 | P1 | Reject as authoritative mapping | Regex `examOf(objective)` matches literal “DP-600”/“DP-700” strings only and cannot establish curricular alignment. | Versioned reviewed objective tagging with explicit mixed/uncertain mapping and aggregation tests. |
| V09 | P1 | Do not deploy as supplied | Candidate contact Worker changes assets-only hosting, assumes Resend/Turnstile, and lacks hardened abuse limits/robust deployment integration. | Contact page works without server; if backend requested later, threat model, rate limits, bounded body, bot token verification, domain/secrets, spam testing, privacy notice and separate deployment approval. |
| V10 | P1 | Defer | Service-worker `addAll` includes `/offline/` not present in ZIP; cache-first `.json` may make question data stale; activation removes unrelated cache names. | No SW registration until asset inventory, ownership-scoped cache cleanup, offline UX, update/invalidation and progressive enhancement tests. |
| V11 | P2 | Adopt selectively | Remove redundant homepage metric strips, declutter provenance banners, add meaningful Services anchors and project proof. | Retain essential caveats and links; never substitute unverified career claims or response promises. |
| V12 | P2 | Optional | Domain, analytics, custom share images, booking and pricing ideas. | Require explicit owner choice, non-sensitive tracking configuration and verified assets/pricing; not blockers for initial IA improvements. |

## 3. Existing information architecture (representative published routes)

```text
/                                  Home — portfolio + lab + course promotions
├── /work/                          Portfolio
│   ├── /work/hse-analytics/
│   ├── /work/ibm-capstone/
│   └── /work/adas/
├── /experience/                    Work, skills, education, certificates
├── /services/                      Dashboard, cleanup, training
├── /about/                         Biography, methods, goals
├── /contact/                       Email-app contact
├── /lab/                           Six 10-question general analyst exams
│   ├── /lab/sql/                   Other subjects share /lab/<slug>/
│   └── /lab/dp-600/                Fabric: 834 questions; 18 packs
│       ├── /explore/
│       ├── /study/
│       ├── /practice/
│       ├── /mock/
│       ├── /cases/
│       ├── /review/
│       ├── /progress/
│       └── /resources/
├── /learn/                         Data Visualization course, 10 chapters
│   ├── /learn/overview/
│   ├── /learn/ar/                  Arabic companion curriculum
│   ├── /learn/chapter/01/ ... /10/
│   ├── /learn/foundations/         Plus other individual source lessons
│   └── /learn/statistics/          43 sections, nine journeys
│       ├── /journey/<slug>/
│       ├── /labs/ and /labs/<slug>/
│       ├── /atlas/
│       ├── /formulas/
│       ├── /decision/
│       ├── /glossary/
│       └── /cheatsheet/
├── /explore/                       Data Visualization interactive gallery
│   ├── /choose/
│   ├── /charts/ and chart-specific labs
│   ├── /integrity/
│   ├── /dashboards/
│   └── /specialty/
└── /practice/                      Data Visualization scenario bank (12)
```

The sitemap reflects traversed major destinations, not a claim that every generated source-lesson URL has been exhaustively enumerated.

## 4. Proposed information architecture — end state

```text
/                                  Task-led home: Work | Learn | Practice
├── /work/                          Selected case studies
│   ├── /work/hse-analytics/
│   ├── /work/ibm-capstone/
│   └── /work/adas/
├── /learn/                         NEW learning catalogue
│   ├── /learn/data-visualization/  Ten-chapter course
│   │   ├── /chapters/01/ ... /10/
│   │   ├── /lessons/<slug>/
│   │   ├── /ar/                    Arabic companion path
│   │   ├── /labs/                  Curated interactive gallery
│   │   ├── /tools/chart-picker/
│   │   └── /practice/              12 visualization scenarios
│   └── /learn/statistics/          Existing canonical hub retained
│       ├── /journey/<slug>/
│       ├── /labs/ ...
│       ├── /formulas/
│       ├── /decision/
│       ├── /glossary/
│       ├── /atlas/
│       └── /cheatsheet/
├── /practice/                      NEW practice catalogue
│   ├── /practice/analyst/          6 sets / 60 questions
│   └── /practice/fabric-dp600/     834-question Fabric hub
│       ├── /study/
│       ├── /questions/
│       ├── /topics/
│       ├── /mock/
│       ├── /cases/
│       ├── /review/
│       ├── /progress/
│       └── /resources/
├── /services/
├── /about/
│   └── /about/experience/          EXPERIENCE label remains discoverable
├── /contact/
└── /search/                        NEW site-wide results route
```

**ZIP comparison:** The proposed `SiteNav.tsx` collapses all education and exams into a single “Learn” dropdown, making Practice less prominent. It also hard-codes current URLs rather than implementing the catalogue destination. **Reject this IA as the final sitemap**, while reusing its accessible expanded/collapsed menu ideas and descriptive footer grouping after testing.

**Routing safeguard:** This is a *logical target sitemap*, **not** a directive to delete or immediately rename every existing route. First ship navigation/landing-page organization with old routes intact. Only then migrate route trees in independently tested batches. Preserve `/lab/dp-600/*` and existing `/learn/*` deep links with real tested redirects or aliases; do not assume Cloudflare's static hosting handles any particular redirect format before confirming. Preserve query params, hash anchors, and `localStorage` storage keys. If redirects can't be guaranteed, leave original URLs canonical until the replacement routing has been proven.

### Current → proposed mappings

| Current | Proposed entry point | Migration instruction |
|---|---|---|
| `/` | `/` | Keep; rebalance employer/learner CTAs. |
| `/work/` | `/work/` | Keep exact URLs and case content. |
| `/experience/` | `/about/experience/` | Move nav position first; preserve old public route. |
| `/services/` | `/services/` | Keep. |
| `/about/`, `/contact/` | Same | Keep. |
| `/learn/` (currently Visualization course) | `/learn/` catalogue + `/learn/data-visualization/` course | Create new course route and catalogue, preserve every old lesson URL. High-risk migration: do last. |
| `/learn/ar/` | `/learn/data-visualization/ar/` | Add Arabic lane with stable language metadata. |
| `/learn/statistics/` | Same | Keep published route, restructure only page-level discovery. |
| `/explore/` | `/learn/data-visualization/labs/` | Move into visualization context; old deep links still resolve. |
| `/practice/` (12 visualization scenarios) | `/learn/data-visualization/practice/` | Keep alias/redirect; do not erase attempts/state. |
| `/lab/` (60 general questions) | `/practice/analyst/` | Keep existing quiz URLs in first release. |
| `/lab/dp-600/` | `/practice/fabric-dp600/` | Move only after session/deep-link/localStorage regression tests; otherwise keep current routes and change labels only. |
| Separate local search inputs | `/search/` + contextual filters | Add federated search without removing specialist search. |

## 5. Navigation and page patterns

### Global header

**Adapted navigation specification (do not copy `SiteNav.tsx` unchanged):** brand should consistently say **Hansa** with an intelligible personal-owner relationship; preserve semantic `header`/`nav`; dedicated Learn and Practice entries, visible search and Contact. On nested routes, compute active ancestors robustly (not only `pathname.startsWith`), and ensure focus restoration on menu close, correct `aria-expanded`, Escape behavior and no duplicated accessible nav across breakpoints. Optional `Hire me` copy is a contextual header/CTA label rather than an extra top-level content taxonomy item.

Desktop: `Hansa [Work] [Learn] [Practice] [Services] [About] [Search] [Contact]`.

Mobile: visible brand; Search; a single Menu button; primary list with grouped secondaries. Menu opens/closes by keyboard; focus moves predictably, background isn't reachable if menu is modal, Escape closes, and focus is restored to trigger. Avoid hover-only interactions. Use correct `aria-current="page"` and landmark `nav aria-label="Primary"`. Avoid duplicated navigation links in the accessibility tree when responsive variants are hidden.

### Homepage

**Merge of the ZIP's `ThreeDoors` and copy recommendations:** keep the task-based three-door pattern, but replace employer/freelancer/learner segmentation with **Work / Learn / Practice** as the dominant architecture. An explicit **Hire / Discuss a project** action belongs in the hero or Services, so clients are still served without misrouting learners into quizzes. Deduplicate duplicated metric strips, but only after verifying counts and ensuring no unique disclosure is lost. A downloadable CV appears only after the actual PDF is present and privacy-reviewed; never show a dead button. The project section should separate **Verified professional work** from **Synthetic demonstrations** and describe the nature of each artifact.

1. Brief value proposition and two task-specific links: **Explore my work** and **Start learning**; smaller **Practice questions**.
2. Three gateway cards (Hire/Work, Learn, Practice) with one action each.
3. Flagship HSE example with verified values and synthetic label.
4. Featured learning routes: Visualize data, Statistics, DP-600 (each labelled course/reference/assessment).
5. Case studies; trust/provenance; short About; contact CTA.

### Learning catalogue `/learn/`

Course cards should show purpose, prerequisites, estimated time, chapter count, language, study format, whether practice exists, and a single Start/Resume control. Provide 'I want to...' entry points: Choose a chart; Learn statistics; Prepare DP-600; Build dashboards; Interview preparation. Explicitly distinguish **Read**, **Experiment**, **Test**.

### Course shell

Local breadcrumb, course progress, collapsible chapter TOC, lesson position, objectives, prerequisite, concise explanation, **Predict → Explore → Explain → Apply**, accessible data/table, common misconception, key takeaway, next/previous lesson. Put source hashes and import provenance in secondary disclosure without removing auditability. Distinguish original source transcription vs editorial content.

### Statistics

Keep nine journeys and 43 section numbering; use a searchable taxonomy of methods/questions rather than exposing the entire inventory above the fold. Each journey gets a short outline with anchor links and a clear primary lab. Embed a lightweight static preview plus 'Launch full lab' when several heavyweight demos would otherwise repeat on a very long page. Formula cards should include meaning, assumptions, units and a worked example, not formula-only decoration. Preserve deep links such as `#s19`.

### Fabric learning and practice

**Added provenance and coverage policy:** Use a source-credit catalogue listing pack ID, title, author/creator, working source URL, official documentation references where relevant, authoring basis and reviewed-on date. Claim that questions are independently authored only after inspecting the actual bank; do not reproduce memorized/leaked exam questions or misstate real Microsoft questions. An authoring standard should require scenario constraint, plausible options, reasoning for correct and incorrect answers, objective mapping, and citation/evidence, but **do not mutate the 834-question bank merely to make it conform**. Handle remediation in a separately versioned educational-content pass.

**DP-600 vs DP-700:** keep the hub's existing focus and explicitly distinguish DP-600-focused, supporting, DP-700-primary and unmapped content. The ZIP's `examOf()` prefix regex can be a temporary **display parser only** if actual metadata has reliable prefixes; it is **not** a defensible objective/coverage mapping. Require a reviewed mapping table, objective-framework version, explicit overlap rules, mapping provenance, and reconciliation tests. Preserve existing topic counts until audited; never advertise "real exam" equivalence. Prioritize semantic models based on uncovered objectives, not an arbitrary promised count such as "60+".

**Timed assessments:** optionally expose Standard / Extended / No limit for *learning-mode practice*, with an honest label when not running a realistic timed simulation. State before starting whether extension/pausing is permitted in the selected mode. Persistence is part of the full attempt/session record (start time, elapsed/paused duration, deadline policy, question order and answers) and remains consistent after refresh/backgrounding; expiry must never submit twice. Screen-reader announcements use milestone live regions, not per-second updates.

New learner path: `Start studying → Topic practice → Review mistakes → Timed simulation`. Put bank browsing and evidence sources within the same shell. Clearly label `480 DP-600 focused`, `251 supporting`, `90 DP-700-primary`, `13 unmapped` and ensure every denominator/overlap rule is explained. The 834-question *collection size* is not a claim of DP-600 alignment. Group nine existing mode links: Study (Guided, Bank, Topics), Assess (Mock, Cases), Improve (Mistakes, Progress), Trust (Resources). Do not change question IDs or answer/option data.

### Search

Use a build-generated, versioned **client-side index** (no backend required for static hosting). Search records:

```ts
type SearchDocument = {
  id: string; title: string; url: string;
  kind: 'case-study'|'course'|'lesson'|'section'|'lab'|'question'|'glossary'|'formula';
  summary: string; topic: string[]; language: 'en'|'ar'|'mixed';
  level?: string; course?: string; sourceId?: string;
  keywords?: string[];
};
```

Index projects, source lessons, 43 stats sections, 15 statistics labs, six chart labs, formulas, glossary and eligible practice question metadata. For 834 Fabric questions use a separate lazy-loaded index shard, with stable shareable `?q=` and filter parameters; keep rationales gated to answer/review flow where appropriate. Query normalization must handle Arabic diacritics and common Arabic/English technology labels. Debounced results, keyboard navigable list with semantic links, visible result count, zero-results actions and 'clear filters'; do not implement search as an inaccessible pseudo-combobox. `Ctrl/Cmd+K` is an enhancement, not the only entry point.

### Professional portfolio and Services patterns (new in v2)

Use verified content and evidence over promotional density. Each professional case study should have **Context → Responsibility → Problem → Constraints → Process → Artifact → Result → Evidence → Limitations → Tools**, with role/date/data sensitivity made explicit. If a result is not measurable, state the delivered capability or observed outcome; do not invent percentages, business impact or endorsements. Proposed Moodle course provisioning, Teams creation, faculty-survey dashboard and CRN reporting work from `experience-additions.md` remain **candidate claims requiring owner confirmation and institutional publication permission**. Screenshots must be anonymized and checked for institution/student/staff identifiers.

Services: add real `#dashboards`, `#analysis`, `#training` anchors only to actual sections; contextual links should have descriptive accessible names. Pricing is **optional**: do not insert illustrative `$X` values into production. Do not promise a 1–2-day response time unless consistently achievable. Use a visible mailto address and Copy email; only add a server-side contact form if the owner values reliable delivery enough to support the security and operational burden.

### Search, SEO and public facts governance (new in v2)

Maintain a single verified facts registry (`SITE`-like utility) for URL/brand/person name, role, public email, CV availability, verified social links and optional booking URL; **do not copy unverified ZIP values into production**. Write unique page-specific metadata, canonical URLs, OG/Twitter images that exist, `sitemap.xml` generated from the actual route/content manifest, and `robots.txt` consistent with intended indexing. Add JSON-LD only for verifiable Person/Website/Course semantics; avoid unsupported employment, alumni or certification claims and ensure tests reject invalid URL assets. Arabic `hreflang` is warranted only for genuine equivalent translated pages; merely having an Arabic companion does not make every English page a one-to-one alternate. Do not accidentally index answer keys or private/sensitive material. Confirm static-export build compatibility before shipping Next.js metadata route handlers.

**Optional distribution:** custom domain (with deliberate canonical/redirect plan), privacy-conscious analytics and branded share images can improve reach but are **not prerequisites** for shipping safe IA/content improvements. PWA registration should remain disabled until the full offline release gate in Section 10.

## 6. Key user journey audits

| Persona & goal | Existing representative path | Observed issue | Proposed happy path & acceptance |
|---|---|---|---|
| Recruiter evaluating skills | Home → Work → HSE → Experience → Contact | All exist, but separate nav items and no downloadable CV. | Home → Work → HSE + **verified professional projects** → About/Experience → privacy-reviewed CV/Contact. On every case, project role, result, artifact, data provenance, and limitations visible. |
| New learner studying visualization | Home → Learn (Viz) → Chapter overview → lesson → Labs/Practice | `Learn` title suggests a full library but is Viz only; mixed route families. | Home → Learn → Visualization → Start → one lesson → associated lab → check understanding → next. Keep resume point in browser. |
| Learner preparing DP-600 | Home → Data Lab → Fabric hub → Guided/Topic/Mock/Review | General exam and Fabric lab are visually sibling but hugely different; nine equal modes. | Home → Practice → Fabric → Choose objective → Guided → mistakes → timed session. Show alignment caution at mock start. |
| Analyst looking up p-value or chart | Home → Statistics / Learn / Labs → nested reference/tool | Three plausible starts and disconnected local search. | Global Search → result type → precise section/lab; crumb and 'related lab' displayed. |
| Arabic learner | Learn → Arabic companion → mixed Arabic/English lessons | Good dedicated lane, but needs real language switches and checked text direction. | Learn → Visualization → العربية → lesson; text remains RTL while formulas/code stay LTR. |
| Employer reviewing credibility | Work → synthetic dashboard → Experience | Professional vs synthetic evidence may be unclear; ZIP proposes university projects. | Work clearly groups verified professional deliverables and synthetic cases; each has permission, outcome and sanitized proof; recruiter can download CV. |
| Prospective client wanting contact | Home → Services → Contact | Existing mailto path may depend on an external mail app. | Anchor-linked Services → contact, visible email and Copy email; optional hardened form only after backend signoff. |
| Returning exam learner | Practice → DP hub → mock → reload | Existing flow needs a retention test; ZIP's timer hook would reset elapsed time if used. | Reload/restoration recovers selected timing mode, questions, answers, clock and status without double submission. |

## 7. WCAG 2.2 AA test & remediation matrix

**No overall WCAG pass/fail is asserted.** Below are items to test and implement against <https://www.w3.org/TR/WCAG22/>.

| WCAG SC | Areas | Test and remediation | Acceptance |
|---|---|---|---|
| 1.1.1 Non-text content (A) | Portfolio screenshots, instructional charts | Meaningful alt or labeled caption; detailed nearby equivalent for complex visuals. | Images can be understood without sight; decorative imagery ignored. |
| 1.3.1 Info/relationships (A), 2.4.6 Headings (AA) | All | One clear H1, hierarchical H2/H3, true `<table>` headers, fieldset/legend for grouped questions, proper lists. | Screen-reader heading/table navigation coherent. |
| 1.3.2 Meaningful sequence (A), 2.4.3 Focus order (A) | Mobile nav, exam, lesson, modal | Inspect DOM reading/tab order after responsive changes and overlays. | No skipped/illogical order or keyboard traps. |
| 1.4.3 Text contrast (AA), 1.4.11 Non-text contrast (AA) | Badges, muted meta text, charts, outlines | Measure actual computed color contrast: normal text >=4.5:1; large text >=3:1; required UI boundaries/marks >=3:1 where criterion applies. | Tested for light/dark and all interaction states. |
| 1.4.4 Resize text (AA), 1.4.10 Reflow (AA) | Header, tables, panels, controls | 200% zoom and 320 CSS-pixel equivalent; avoid clipped labels; limit horizontal scrolling to genuinely 2D content such as wide data tables. | No lost content/functions or page-wide horizontal scroll at 320 CSS px. |
| 1.4.13 Content on hover/focus (AA) | Tooltips, popovers, chart callouts | Hover content dismissible, hoverable and persistent; same information reachable by keyboard and text. | No tooltip-only teaching content. |
| 2.1.1 Keyboard (A), 2.1.2 No trap (A) | All lab input states, menus, exam selection, screenshot viewer | Tab, Shift+Tab, Enter/Space, arrows and Escape from start to submission. | All functions operable; focus doesn't get stranded. |
| 2.4.1 Bypass blocks (A), 2.4.5 Multiple ways (AA) | Global site | Retain skip link and add genuine multiple ways to reach content via sitemap/search/nav. | Skip goes to actual main landmark; content reachable through search and nav. |
| 2.4.7 Focus visible (AA), 2.4.11 Focus not obscured (AA) | Sticky header, tabs, menus | Visible focus and no fully obscured focused element; test scrolling while tabbing. | Every focused target remains findable on-screen. |
| 2.5.7 Dragging movements (AA), 2.5.8 Target size (AA) | Sliders, charts, small selectors | All drag functionality also has non-drag path; >=24x24 CSS px or documented exception; aim >=44px comfortable mobile target. | Lab works on touch, mouse, keyboard. |
| 3.1.1 Language of page (A), 3.1.2 Language of parts (AA) | Arabic path, bilingual stats source | Correct `<html lang>`, inline `lang` on mixed runs and `dir="rtl"`/`dir="auto"`; formula/code kept LTR. | Correct reading in Arabic and English screen readers. |
| 3.3.1 Error identification (A), 3.3.2 Labels/instructions (A) | Contact, numeric controls, exam setup | Visible errors and associated `aria-describedby`; clear input bounds, multi-select rules and required fields. | Invalid entries are announced; user can recover. |
| 4.1.2 Name/role/value (A), 4.1.3 Status messages (AA) | Toggles, stepper, search, scores | Native inputs; `aria-pressed` on toggle buttons; results changes via restrained live regions; do not announce entire chart on every slider tick. | Assistive technology announces control and key result appropriately. |
| 2.2.1 Timing Adjustable (A) | Timed quizzes and mock exams | Check whether real time limits qualify for an exception; otherwise give user appropriate mechanisms to turn off, adjust, or extend time with defined rules. Keep session clock persisted if permitted. | Exam mode and accommodation policy are visible up front; screen-reader milestones and refresh-resumption function as expected. |
| 2.4.4 Link Purpose (In Context) (A) | Repeated `Start`/`Details` links | Replace vague repeated link text with contextual names, visible labels where possible; nonvisual suffix may work but test all link-list contexts. | Links are distinguishable out of context without unnecessary verbose duplication. |
| 2.3.3 Animation from Interactions (AAA, desirable, not AA release criterion) | Sampling/visual labs | Provide reduced motion and manual pause/step controls where appropriate; distinguish AAA enhancements from mandatory AA gates. | Comfortable operation and predictable static alternatives. |

### Device and assistive technology coverage

- Viewports: 320, 360, 390, 768, 1024, 1280+ CSS px; test portrait/landscape as relevant.
- Zoom and text: 200% and 400% zoom; 200% text-only resizing where available.
- Input: keyboard-only, touch-only; mouse pointer; verify native swipe/scroll.
- Assistive tech: NVDA + Firefox/Chrome on Windows, VoiceOver + Safari on iOS/macOS, TalkBack + Chrome on Android if possible.
- Routes that MUST be sampled: Home, nav menu, HSE screenshot viewer, Contact form, `/lab/sql/` quiz flow, DP explore filters + study + mock + results + progress import/export, Visual course and Arabic lesson, Statistics journey and two contrasting labs, Formula workbench, Integrity gallery.
- Automated: axe-core or axe DevTools + Lighthouse accessibility checks; automated PASS is not manual conformance.

## 8. Mobile and semantic design requirements

1. Use one-column content flow for reading and teaching. Multi-column charts stack with logical reading order; a grid may become a scroller **only** for tables or genuinely spatial visualizations.
2. Replace desktop double sidebars with one course menu/drawer; on small devices retain current page label and a clear Next action.
3. Sticky controls cannot obscure targeted section anchors or focus; use `scroll-margin-top` where appropriate and test WCAG 2.4.11.
4. Quiz choices become full-width reachable targets; important submit/next controls remain visible without overlaying last questions.
5. Data tables get captions, scoped row/column headers and their own overflow container if essential; provide a compact summary above them.
6. Long mathematical expressions wrap or scroll inside a labeled container without clipping. Use accessible MathML or a verbal text alternative; verify that source text, rendered formula and fallback do not become **unintended duplicate announcements**.
7. Native HTML first for `main`, `nav`, `aside`, `article`, `section`, `figure`, `figcaption`, `details`, `button`, `fieldset`, `legend`, `table`. Chart libraries are presentational layers over inspectable data, not the sole source of meaning.
8. Support `prefers-reduced-motion`; animated sampling machines need Pause, Step and Skip-to-result with a stable static first frame.
9. For route data fetch/chunks, show a semantic skeleton/loading message, failure/Retry, and a no-JS information path for essential catalogue pages where feasible.

### Accessibility adaptation notes for ZIP components

- **`A11yLink.tsx`, `Ar`, `LangBadge`, `ExternalLink`:** good patterns to adapt. Prefer naturally descriptive visible text first; distinguish external destination from new-tab behavior; only put `lang="ar"` on Arabic runs or pages, and test bidi/voice switching with actual assistive tech.
- **`src/styles/a11y.css`:** treat as a candidate checklist, not a safe global stylesheet; global `form label` and `input` selectors may conflict with BeUI/site components. Merge design tokens, test contrast in light/dark modes, and use scoped rules. Verify 44 CSS px targets and other relevant WCAG 2.5.8 exceptions; larger targets alone do not prove compliance.
- **`SiteNav.tsx`:** useful mobile-menu mechanics but wrong IA and no complete modal focus/scroll specification. Ensure focus return when Escape closes; ensure hidden and open submenu behavior is compatible with screen readers, touch and keyboard.
- **`ContactForm.tsx`:** client validation and status messages are examples; no production-ready contact system exists until a server-side endpoint with abuse controls and deployment integration is approved.
- **`TimerControl.tsx` and `useExamTimer.ts`:** do **not** merge unchanged. The current proposed hook increments local React elapsed time, persists only mode, and can reset on reload/drift in background tabs; require session model redesign.

## 9. Component patterns (including BeUI)

Use existing BeUI components **where they implement the expected semantics**, not just for visual variety. Verify exact component APIs in the repo/reference library before coding. Choose:

| Problem | Pattern | Data/accessibility behavior |
|---|---|---|
| Learn/practice catalogue | Consistent cards + segmented type filters | Card has type, progress/level and one clear link; filters have selected state. |
| Course navigation | Breadcrumb + local chapter TOC + stepper + next/previous | Actual semantic navigation; `aria-current` and non-obscured focus. |
| Explanations | Predict/Explore/Explain/Apply sections | Disclose extra details after concise primary takeaway. |
| Statistics labs | Single-responsibility controls + chart + exact-value table | One state source for both plot and accessible numeric summary. |
| DP filters | Search + grouped facets + active filter chips | URL-deep-linkable query, clear all, reset and results count. |
| Question flow | Fieldset/radio/checkbox, review flag, visible rationale | Preserve seeded exam order and accessible feedback announcements. |
| Sources/provenance | Disclosure + references list | Keep traceability but remove hashes from visual priority path. |
| Charts not supported by BeUI | Appropriate additional chart engine only when justified | Visualization, semantic text and table fallback share calculation layer; avoid redundant chart libraries. |

Do not create a new unmaintainable library of custom controls when native HTML/BeUI suffice.

## 10. Implementation sequence & acceptance criteria

### Phase 0 — Baseline and correctness gates (P0)

- **New v2 baseline:** record the current Worker name (`hansa`), static-export strategy, configured asset routes and deploy identifiers **from the actual repository/account**, not from ZIP example files. Candidate `wrangler.example.jsonc` names a different Worker (`amir-portfolio`) and contains a script entry, so it is **not** a drop-in replacement. Do not run deploy commands.
- Inventory public identity, displayed credentials, professional dates and job/project claims separately from technical baselines. Obtain approval for any university/client branding or artifacts and redact personal or institution-internal data.

- Freeze current deployment ID/commit and export a complete route, metadata, title/heading, internal-link, and question-ID inventory; record a baseline of localStorage keys and saved attempts. Make backups **locally**; no public mutations.
- Trace HSE TRIR/LTIFR measures to fact data and published values; document scopes/denominators or correct outputs.
- For Fabric, write deterministic tests that reconcile top-domain and subobjective counts under declared mapping rules, and surface totals/overlaps in UI. Verify domain content and 834 total before any navigation work.
- Acceptance: all integrity discrepancies resolved or transparently qualified, and no question content lost.

### Phase 1 — Navigation and entry points (P1, low risk)

- Add **verified professional-project case-study structure**, a CV download only if its file is present and privacy-reviewed, contextual service anchors, and non-repetitive accessible calls to action. Professional-project content is a factual approval dependency—not a reason to block independent navigation improvements.
- Apply ZIP-inspired `ThreeDoors` as Work/Learn/Practice (not “Learn → /lab/”), descriptive link patterns and language annotations only after adapting to the existing component/theme system.
- Consolidate repeated HSE/portfolio metrics without removing synthetic-data disclaimers or unverified KPI caveats.

- Replace primary menu labels and reorganize footer with stable destinations; if necessary create `/learn/catalogue/` and `/practice/catalogue/` temporary landings while existing `/learn/` and `/practice/` retain their old meanings.
- Add task-based home gateway and metadata-rich cards.
- Add true breadcrumb trails and context labels to course, statistics and DP subpages.
- Acceptance: from home, an unfamiliar visitor can reach (a) HSE case, (b) starting Data Viz lesson, (c) DP-600 guided practice, (d) statistics p-value lab in <=3 intentional selections; menu works on keyboard and 320px.

### Phase 2 — Federated discovery (P1)

- Centralize **verified** public site facts and route metadata; generate and verify page titles, descriptions, canonical/OG paths and image asset paths across the actual route inventory. Add route-derived sitemap/robots and validated semantic schema where meaningful; do not infer current SEO defects solely from claims in ZIP README.

- Build static search index at compile time from typed content metadata, with deterministic IDs and index integrity tests; shard question bank to avoid loading all content on every landing page.
- Global search with filters: Courses, Lessons, Labs, Questions, Methods, Work; native search result links and stable URL filters.
- Acceptance: searches `p-value`, `Direct Lake`, `DAX`, `box plot`, `المدرج التكراري` return relevant correct destinations; empty queries and no-result cases are understandable; no private data indexed.

### Phase 3 — Learning shells and pacing (P1)

- Add a source-credit/provenance view for existing packs, with working references, authorship status and reviewed mappings; validate copyright/originality assertions before publication.
- Create a versioned, explicit DP-600/DP-700 objective association—not regex-only inference. Reconcile totals and clarify the coverage gap without inventing new question counts.
- Define testable clock/session-resumption contract for both timed and accommodations modes; do **not** paste the ZIP timer. Add progressive content migration only when stable IDs, answers and state are preserved.

- Rebuild course catalogue/shell with objectives, progress/position, chapter TOC, language switch, lab association and next/previous.
- Statistics: keep source section anchors, add compact journey guides and launch-full-lab controls for heavy repeats.
- Fabric: group modes into Study, Assess, Review, Resources; identify empty topics; surface exam-coverage caveat before mock start.
- Acceptance: reading, experimenting and testing are visibly distinct; restarting a session after refresh works; all old IDs and progress keys retained.

### Phase 4 — Accessibility and mobile QA (P1, release blocker)

- Verify all adapted semantic link, language, nav and contrast patterns **against existing BeUI implementations**. Test keyboard navigation, custom/selected native inputs, focus restore, screen-reader timing milestones and language-switch behavior; package CSS is a starting point only.

- Manual WCAG matrix on critical routes with axe automated checks; capture defect list with criterion, repro steps, screenshot, severity, correction and retest.
- Fix all confirmed A/AA failures before public release; run screen-reader and touch regression on two stats labs and both quiz engines.
- Acceptance: no known blocking keyboard/reflow/reading-order defects; documented WCAG checklist, with explicit untested items — no unsupported 'WCAG certified' badge.

### Phase 5 — Route canonicalization and performance (P2, high migration risk)

- Reconcile actual build and delivery semantics for any sitemap, robots, metadata and JSON-LD changes; structured data must refer to actual courses/people and correct canonical pages.
- Verify no new API script or SW has been added by mistake: keep existing assets-only architecture as the Phase 1–5 default unless owner separately authorizes the runtime redesign.

- Only after route inventory and QA, move nested canonical routes toward proposed sitemap, using tested redirects/aliases and maintaining inbound anchors.
- Defer client question data and expensive chart modules until necessary; avoid loading all Fabric assets on landing routes.
- Add SEO metadata and breadcrumbs/structured data where appropriate, plus verified sitemap/robots coverage and internal link audit.
- Acceptance: all existing bookmarks and query-param deep links resolve; refresh on nested static route works; all local progress persists; no major accessibility/performance regression.

### Phase 6 — Optional infrastructure and offline features (P3; separate decision)

Only if the owner explicitly requests them, individually: (A) contact API with rate limiting, bounded request body, Turnstile token verification if used, secrets and verified sender domain; (B) custom domain and canonical/redirect migration; (C) analytics with privacy/consent assessment and actual event plan; (D) offline/PWA, with real `/offline/` page, tested precache assets, cache namespace cleanup scoped to this app, network-vs-cache policy for question data, version upgrades and complete rollback. These are **not** dependencies for launch of the IA improvement. The ZIP's `RegisterSW` must stay unused until phase D passes, and its `wrangler.example.jsonc` must **never** be copied blindly to an account.

**Production change gate for every phase:** reviewed diff, repeatable tests, owner-approved facts, verified Cloudflare target and documented rollback. Only a separate explicit deploy approval authorizes production changes.

## 11. Minimum regression scenarios

1. Navigate with Tab only: Home → Work → HSE → Contact → email copy, then back.
2. Mobile 320px: open/close primary menu, open course chapter, reach Next, no lost controls.
3. Open an Arabic lesson: screen reader language and direction correct with inline English terms.
4. Search global English/Arabic terms, clear facets, deep-link a result, use browser Back.
5. Open statistics p-value from section and from search: visible hypothesis, controls, table, source link; tab through and operate without drag.
6. Fabric deep-linked `?subject=...`: correct filter state after hydration, 0-result state for empty subject, no infinite loading.
7. Start 10-question Fabric guided session; answer, bookmark, refresh; resume same session and seeded order; review and export JSON; import on fresh browser without duplication.
8. Run Fabric mock: countdown doesn't reset on refresh, answer state persists, grading/rationale appears only at correct point.
9. General analyst 10-question quiz: answer/check/review with keyboard; previous history intact.
10. Screenshot viewer: opens, announces image and position, arrow keys work, Escape closes, focus returns to source trigger.
11. Contact button: mail handler works when configured; without one, visible email and Copy email provide a practical alternative.
12. Check all old routes, redirects and hash anchors after future migration.
13. Career path: verified professional project labels, restricted/private information redacted, real CV PDF opens and downloads on desktop/mobile; no broken CV button if unavailable.
14. Link-purpose review: repeated Start/Details links have meaningful accessible names; service anchors point to real sections; Arabic/English parts are correctly announced.
15. SEO: route manifest ↔ sitemap ↔ canonical URLs consistent, OG images exist and return successfully, actual Arabic alternates paired only when semantically equivalent; JSON-LD validates against published facts.
16. Timer state: pause, background tab, sleep, reload and network interruption do not reset allowed session time or submit twice; no-time-limit option has honest exam mode wording.
17. Negative controls: `examOf()` regex cannot silently classify missing/misleading metadata as reviewed DP-600 coverage; objective counts reconcile under declared multi-mapping rules.
18. Platform: original assets-only Worker configuration stays unchanged unless an approved runtime change is tested; contact form never pretends success when email delivery fails.
19. Offline/PWA if separately enabled: no missing precache URLs, cached question data never silently masks a new version, unrelated CacheStorage namespaces remain intact and recovery works offline and online.

## 12. Suggested outcome metrics

### Extra v2 success indicators

- **Recruiter conversion:** from homepage, CV (once supplied), representative verified professional project and Contact are discoverable in <=2–3 purposeful choices; no false claims or unapproved client data.
- **Evidence accuracy:** 100% of published education, employment, qualifications, social links, response commitments and project outcomes are checked by owner against evidence.
- **Metadata completeness:** all public canonical destinations have an actual page title/description, working canonical URL and share asset or valid fallback; no misleading `hreflang` equivalents.
- **Provenance quality:** every question pack shows reviewed source credits or transparent unsupported-source status without implying affiliation with Microsoft.


- **Task findability:** user can locate the five benchmark destinations without prompting; record number of clicks and time; target <=3 purposeful choices from home.
- **Search:** proportion of benchmark queries returning an appropriate top-3 result; target 100% of tested curated queries.
- **Learning:** completion of one course lesson + linked lab + return/continue without disorientation.
- **Practice:** 100% deterministic session-restoration regression pass for both engines; import/export idempotence tests.
- **Accessibility:** zero open confirmed WCAG A/AA violations in critical workflows; automated checks supplemented by human testing.
- **Routing:** zero broken public deep links from the frozen baseline after migration.
- **Performance:** measure LCP/INP/CLS on mobile after instrumentation rather than inventing current scores; verify question-bank chunks and labs are loaded on demand.

## 13. Implementation agent instruction (copy into task tracker)

> **Master v2 source of truth:** use this document for scope, priority and acceptance. `portfolio-upgrade.zip` is a **reference and candidate implementation only**, not approved code. Review its actual files as inspiration for accessible links, source credits, content tasks and metadata, but reject its final IA, regex-only exam classification, non-persistent timer, service worker and unapproved Cloudflare contact runtime. Verify employer/project facts and privacy permissions. Preserve professional portfolio and learning roles equally, adding the three task destinations Work, Learn and Practice.
>
> Work in the existing Next.js static-export Hansa repository. Your source of truth is this audit plus the current live behavior. Begin by inventorying routes, content metadata, question IDs, source-provenance links, localStorage namespaces and existing tests. Do not modify production or deploy. First resolve the HSE KPI and Fabric objective-count discrepancies through source-backed tests and transparent UI notes. Implement architecture through additive catalogue routes and navigation labels **before** moving any existing routes. Build task-based Home / Learn / Practice gateways, contextual subnavigation, unified client-side search and an accessible consistent course shell. Keep source lessons, Arabic content, all 834 Fabric and 60 general questions, rationales, saved progress and deep-link parameters intact. Use BeUI where semantic and interactive behaviors are verified, with native accessible fallback for charts/tables. Do not invent component imports or APIs; inspect available components in the repository. Test 320px reflow, keyboard, WCAG 2.2 AA, screen readers, exam refresh/state restoration, questions and source references. For each phase report files changed, before/after routes, assertions, accessibility test evidence, unresolved defects and a rollback plan. **Submit changes as a reviewable local branch/patch only; obtain the owner's explicit approval before any production modification or deployment.**

## 14. `portfolio-upgrade.zip` adoption register and technical merge decisions

The table below is deliberately **file-level**. "Adopt" means **take the design pattern after integration/testing**, **not** copy/ship the file unchanged.

| Package path | Decision | What to take / what to change |
|---|---|---|
| `content/content-tasks.md` | Adopt selectively | CV, qualification verification, truthful public evidence, source credits and QA tasks. Domain/analytics/PWA optional; do not expose secrets or private screenshots. |
| `content/experience-additions.md` | Conditional | Use verified university-related project **types**; require role/date/outcome and publication permission. Never ship `[CONFIRM]` or unverified names. |
| `content/page-copy.md` | Adapt | Concise course description, reduced duplicate KPI strip, Services anchors, better CTAs. Reject wholesale overwrite and misrouting learners to exams. |
| `src/lib/site.ts` | Adapt | Single source for public facts/links. Rebuild nav arrays to Work/Learn/Practice/Services/About/Search/Contact; verify email, social URLs and asset existence. |
| `src/components/ThreeDoors.tsx` | Adapt | Retain three gateway presentation; retarget to Work/Learn/Practice and keep separate hiring/client CTA. |
| `src/components/SiteNav.tsx` | Redesign | Adapt menu open/close keyboard patterns; don't ship one overloaded Learn dropdown or unchecked route matching. |
| `src/components/SiteFooter.tsx` | Adapt | Group links by professional, learning, practice and contact destinations; reduce duplication and add CV only if file exists. |
| `src/components/A11yLink.tsx` | Adopt/adapt | Contextual names, Arabic runs, language badges and labelled new-tab links, validated against existing markup. |
| `src/styles/a11y.css` | Adapt | Focus, reduced motion, target sizes and readable badges. Scope CSS to Hansa tokens; test contrast/reflow with BeUI; prevent unwanted global form changes. |
| `src/lib/metadata.ts` | Adopt/adapt | Central page-unique metadata; verify URL/image mappings; don't assume all pages have `/og.png`. |
| `src/app/sitemap.ts` | Adapt | Generate real complete route list (lessons, stats journeys, labs, question landing routes) and keep canonical URLs accurate; example's list is incomplete. |
| `src/app/robots.ts` | Adopt conditionally | Verify actual indexing/privacy policy and static-export output rather than automatically allowing every path. |
| `src/components/JsonLd.tsx` | Adopt conditionally | Verified Person/WebSite/Course structures; remove any unsupported education/credential/provider claims. |
| `src/components/SourceCredits.tsx` | Adopt/adapt | Build from real 18-pack provenance with multi-source IDs and accurate original-work/licensing language; do not change question content. |
| `src/lib/exam-labels.ts` | Do not adopt as truth | Regex is neither syllabus validation nor coverage mapping. Replace with explicit tagged/versioned objective mapping; optional temporary parser only. |
| `src/components/TimerControl.tsx` | Redesign | Reuse legible control UI and milestone announcements; connect to persisted attempt session with honest timing policy. |
| `src/components/useExamTimer.ts` | Reject as production implementation | Reload resets elapsed time, mode-only storage, timer drift and double-expiry risks. Implement persistent session clock model and tests. |
| `src/components/ContactForm.tsx` | Defer | Keep direct email + Copy email; if wanted, rebuild endpoint integration, validation, Turnstile and privacy/error states. |
| `worker/index.ts`, `wrangler.example.jsonc`, `.env.example` | Do not deploy | Worker `name` differs from production; introduces runtime and Resend/Turnstile/secrets dependencies. Separate infra approval, no placeholder `vars` for email destinations. |
| `public/sw.js`, `src/components/RegisterSW.tsx`, `public/manifest.webmanifest` | Defer | Incomplete `/offline/`, version/cache ownership and missing icon assets; validate offline content-version policy before registration. |
| `README.md` | Documentation only | Its “drop-in” and “about half a day” framing is not an implementation estimate or compatibility guarantee; this v2 supersedes its application order. |

### Explicit non-adoption and protected invariants

**Reject or defer:** replacing v1's separate Learn and Practice with the ZIP's Learn dropdown; immediately replacing Hansa's assets-only Worker; copying untested code; publishing claims about a university without permission; promising artificial prices/reply SLAs; installing PWA/offline before cache and content testing; using regex as a source of truth for exam coverage; using the supplied non-persistent timer in mocks.

**Never regress:** all 834 question IDs, answer keys and rationales; 60 general assessment questions; original data-viz/statistics learning material and lesson IDs; Arabic counterparts; question pack source metadata; saved/active attempts and import/export; all live legacy routes, query parameters and anchors; honest synthetic/professional project labeling; accessibility of key interactions. If an import changes these inadvertently, stop and report the regression.

### Responsibility and approval boundaries

The agent can investigate, prepare a local branch, write tests and produce reviewed patches after the owner authorizes development work; **this document is not permission to change or deploy the current production site**. Separate approvals are required for publishing sensitive professional evidence, adding an API/runtime or third-party email service, changing canonical domains, collecting analytics, and deploying to Cloudflare.

## 15. Evidence links

- [Homepage](https://hansa.amir-portfolio.workers.dev/)
- [Work](https://hansa.amir-portfolio.workers.dev/work/), [HSE case](https://hansa.amir-portfolio.workers.dev/work/hse-analytics/), [Experience](https://hansa.amir-portfolio.workers.dev/experience/), [Contact](https://hansa.amir-portfolio.workers.dev/contact/)
- [General Data Lab](https://hansa.amir-portfolio.workers.dev/lab/), [Fabric hub](https://hansa.amir-portfolio.workers.dev/lab/dp-600/), [Fabric question bank](https://hansa.amir-portfolio.workers.dev/lab/dp-600/explore/), [Fabric mock](https://hansa.amir-portfolio.workers.dev/lab/dp-600/mock/), [Progress](https://hansa.amir-portfolio.workers.dev/lab/dp-600/progress/)
- [Visualization course](https://hansa.amir-portfolio.workers.dev/learn/), [Foundations lesson](https://hansa.amir-portfolio.workers.dev/learn/foundations/), [Arabic path](https://hansa.amir-portfolio.workers.dev/learn/ar/), [Chart experiments](https://hansa.amir-portfolio.workers.dev/explore/), [Visualization practice](https://hansa.amir-portfolio.workers.dev/practice/)
- [Statistics home](https://hansa.amir-portfolio.workers.dev/learn/statistics/), [Hypothesis testing journey](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/hypothesis/), [Statistics labs](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/), [Sampling lab](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/sampling/), [Decision navigator](https://hansa.amir-portfolio.workers.dev/learn/statistics/decision/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), [W3C new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

### Reviewed local package

- Original audit: `hansa_live_site_audit_and_reorganization_plan_2026-10-24.md` (v1; archived as the baseline).
- Candidate patch: `portfolio-upgrade.zip` (README; `content/*.md`; `src/components/*`; `src/lib/*`; `src/app/{sitemap,robots}.ts`; `src/styles/a11y.css`; `public/*`; `worker/index.ts`; `wrangler.example.jsonc`).
- This merge was a **read-only inspection and editorial reconciliation** of those files. No app compilation, test suite or direct deployment was executed in preparing this document.

**End of integrated v2 audit. No site modifications were performed. No deployment was performed.**
