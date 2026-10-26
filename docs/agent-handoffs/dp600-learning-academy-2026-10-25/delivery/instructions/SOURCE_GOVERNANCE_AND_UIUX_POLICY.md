# Source Governance, UX Creativity and Implementation Boundaries

## Do not confuse the three kinds of authority
- **Instructions:** Owner's latest intent and actual repo-specific AGENTS.md govern implementation choices.
- **Source fidelity:** The untouched study guide is the canonical artifact for *what was originally written*. Its raw text must not be silently edited or omitted.
- **Current scientific correctness:** New learner-facing technical claims and answer keys require evidence; when source is outdated, keep the original plus a visibly versioned, cited correction. The Arabic plan is an editorial proposal/QA record, not new Microsoft official documentation.

## Interpret creative UI/UX as a reasoning exercise

For every content segment, run an explicit decision gate:

| Gate | Required answer |
| --- | --- |
| What must the learner DO after this segment? | An observable verb; include constraints |
| What is the common mistake? | Specific misconception grounded in the source or practice |
| What is the content form? | Definition/comparison/process/hierarchy/code/mechanism/assessment/etc. |
| What is the simplest useful representation? | Text/table/SVG/flow/code trace/simulation/intervention |
| What could the learner predict or manipulate? | A real state or input, not decorative motion |
| What shows causality/logic correctly? | Computation/decision rules with unit tests or explicit static states |
| How is it usable on mobile/keyboard/screen reader? | Controls, text alternatives, reduced motion, responsive layout |
| Why this specific library? | Audit existing components, free beUI, and complementary packages |
| How will we prove it works? | Source reference, hard scenario, expected outcome, error state, QA |

Do not generate charts with invented metrics. Do not introduce a chart because the concept includes the words 'data' or 'performance'. Do not import multiple competing visual libraries to show design skill.

## Suggested integration architecture (NOT a claim about current repo)

`Raw PDF -> immutable source/pages/sections -> QA-reviewed content units -> renderer registry -> learning path / skill taxonomy -> activities and existing question engine -> progress/review`.

Persist `originalText` and `teachingText` separately. Track `sourceId`, `pageNumber`, `skillsMeasuredTag`, `prerequisiteIds`, `qaState`, `links`, `activityIds`, `questionIds`, and `revision`. Use stable IDs. Reuse current app's schema when available instead of imposing new one.

## Files to inspect (within the package)

### Academy analysis ZIP
- Full Arabic audit and recommended rollout
- English detailed implementation prompt
- Source registry JSON
- Original PDF, page-extracted text, links and page index

### Structured web pack ZIP
- README and source/page hashes
- Chapters, sections, lesson blocks
- All original text extracts and rendered page previews (internal QA assets)
- Source-line mapping, link records, self-checks, practice stems and labs
- 14 proposed activity blueprints and ingestion demo HTML
- Scientific review queue and sample TypeScript adapter

## Publish constraints
- Check legal permission to publish the study guide before adding the entire book to public Hansa. Source can be used internally for editorial transformations and limited citations/attribution as allowed.
- Keep PDF and preview images out of public output unless permitted.
- Render only QA-reviewed derived lessons and exercises, preserving traceability.
- No production deploy without owner's direct approval.
