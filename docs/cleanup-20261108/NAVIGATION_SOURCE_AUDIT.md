# Navigation integration pilot — source audit and brief

Owner objective: audit source integration and natural navigation before deployment. This pilot fixes verified entry-point gaps; it does not claim a corpus-wide semantic audit or approve draft/restricted material.

## Inspected evidence and risks

- Primary `NAV` points Practice at `/practice/catalogue/` (`StudyDirectory`). The recovered draft-bank card was added only to `/practice/`, a different route. Add contextual entry points to the actual catalogue, not another top-level menu.
- `CurriculumHome` labels `/lab/` as labs although that route holds assessment sets. Use the existing visualization gallery `/explore/` with precise wording.
- The original visualization-course link in `StudyDirectory` points at curriculum home `/learn/`; use `/learn/visualization/`.
- `ContentIndexPage` claims a reference-renderer gap for all 3,131 inputs, ignoring recorded curation (1,859 curated, 654 duplicates, 537 unmatched placement, 81 other exclusions). Link to topic desks without changing curation.
- `/content-index/#backlog` has no matching anchor. Add the existing review tasks as a clearly labelled in-page section; no fabricated completion.
- RTI recovery JSON contains 18 blueprints; only eight draft lab routes exist. `/learn/drafts/` deliberately holds L11 for licensing. Do not publish ten additional routes by assuming every stored blueprint is cleared.
- `/patterns/`, `/insight-records/`, `/atlas-records/` and `/held-articles/` already exist with honest statuses but rely heavily on the content index. Attach them to Learn/Fabric/Atlas context as review/reference surfaces, never as approved lessons or semantic edges.

## Source coverage independently checked

Eight source/target pairs checked: R18 learner bank, RTI blueprints, patterns lessons/modules/paths, reference inputs, experiment inputs, and standalone Study Hub. R18, catalogue inputs and Study Hub match byte-for-byte. RTI and three pattern files are deep-JSON-identical with serialization differences only. All 48 storytelling HTML/SVG files match byte-for-byte. No original source was modified. These checks establish preservation for those files, not scientific accuracy or complete workspace coverage. PL-300 private question bytes, R18 PRIVATE_QA, source corpora, code/dataset indexes and holds remain protected and outside this pilot's publication scope.

## Page brief / representation decision

- Source IDs: existing collection IDs/routes in `lib/recovery/collections.ts`; navigation metadata will not duplicate question or lesson bodies.
- Audience/task: learners should find an existing draft/reference collection from its relevant catalogue and understand its review limitations before entering.
- Learning objective: distinguish scored practice, ungraded drafts, documentation and awaiting-review metadata, then select the appropriate destination.
- Alternatives considered: (1) contextual editorial link rows — selected; (2) filterable card directory — rejected as unnecessary client state for a handful of links; (3) spatial relationship map — rejected because page membership is not a verified semantic relationship.
- Visual signature: restrained numbered rows, strong title/status hierarchy, explanatory side copy and an accessible arrow. Integrates with existing tokens and reading rhythm instead of another card wall. Mobile stacks naturally; native links support keyboard/touch and no-JS/reduced-motion without special logic.
- Tools: existing Next Link, semantic HTML and local Tailwind tokens. No chart, new library, paid component, network service or runtime API. No gratuitous motion.
- Boundaries: existing URLs/IDs/answers/progress and all review states unchanged. No rewrite of original sources, no new grading, no publication/rights upgrade.
- Verification: typed navigation uniqueness/route targets, rendered shelf links and status text, collection parity/canonical curation accounting, focused content tests, static build and browser checks at desktop/mobile. Full domain validation remains NOT RUN.
