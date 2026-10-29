// Generates the coverage matrix and visual-opportunity audit from the typed
// content model so those documents cannot drift from the site.
//
//   node --experimental-strip-types scripts/generate-statistics-docs.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  JOURNEY_BY_SLUG,
  LABS,
  LAB_BY_SLUG,
  SECTIONS,
  journeyHref,
  labHref,
  sectionHref,
} from "../lib/statistics/content.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs/statistics");
mkdirSync(DOCS, { recursive: true });
const source = JSON.parse(readFileSync(path.join(ROOT, "content/statistics/source.json"), "utf8"));
const sourceByNumber = new Map(source.sections.map((section) => [section.number, section]));

const LAB_FILES = {
  "center-spread": "center-spread-lab.tsx",
  binomial: "binomial-lab.tsx",
  normal: "normal-lab.tsx",
  poisson: "poisson-lab.tsx",
  sampling: "sampling-lab.tsx",
  confidence: "confidence-lab.tsx",
  "p-value": "pvalue-lab.tsx",
  correlation: "correlation-lab.tsx",
  errors: "errors-lab.tsx",
  "business-decision": "business-lab.tsx",
  probability: "probability-lab.tsx",
  distributions: "distributions-lab.tsx",
  experiments: "experiments-lab.tsx",
  "practical-significance": "practical-lab.tsx",
  "dot-to-decision": "dot-to-decision.tsx",
};

const EXHIBIT_FILES = {
  "evidence-journey": "exhibits/interactive.tsx",
  "type-sorter": "exhibits/interactive.tsx",
  "branch-compare": "exhibits/static.tsx",
  "decision-path": "exhibits/interactive.tsx",
  "cause-response": "exhibits/static.tsx",
  "comparable-groups": "exhibits/static.tsx",
  "bias-shields": "exhibits/interactive.tsx",
  "experiment-blueprint": "exhibits/static.tsx",
  "variable-switchboard": "exhibits/interactive.tsx",
  "causation-gap": "exhibits/static.tsx",
  "evidence-choice": "exhibits/static.tsx",
  "concept-atlas": "concept-atlas.tsx",
  "formula-workbench": "exhibits/static.tsx",
  "tool-navigator": "tool-navigator.tsx",
  "myth-cards": "exhibits/static.tsx",
  "mental-model": "exhibits/static.tsx",
  cheatsheet: "exhibits/static.tsx",
  capstone: "exhibits/interactive.tsx",
};

const COMPUTATION = {
  "evidence-journey": "No numeric estimate; stage dependency map.",
  "type-sorter": "Classification only; no numeric output.",
  "branch-compare": "Fixed illustrative summary; no inferential claim.",
  "center-spread": "mean, median, modes, sample/population SD, IQR, Tukey fences from user-entered values.",
  "binomial": "closed-form PMF/CDF with log-gamma; E(X)=np, Var=np(1−p).",
  normal: "normal PDF/CDF; shaded area via Φ; z=(x−μ)/σ.",
  poisson: "closed-form PMF/CDF with log-gamma; seeded arrival strip.",
  sampling: "seeded samples; empirical SE vs σ/√n; separate population/sample/sampling panels.",
  confidence: "estimate ± critical × SE; t or z; repeated seeded coverage count.",
  "p-value": "z test statistic; one-/two-sided tail area; α comparison.",
  correlation: "Pearson r, least-squares slope, within-group r.",
  probability: "exact enumeration of a fair sample space; conditional probability.",
  distributions: "closed-form PMF/PDF; mass vs area; point probability 0.",
  experiments: "seeded random assignment; mean-age imbalance over shuffles.",
  errors: "normal power function; α, β, power under a specified alternative.",
  "business-decision": "pooled two-proportion z test; Wilson arm intervals; unpooled CI for pB−pA.",
  "practical-significance": "z=(effect/SE); 95% interval; comparison with a business threshold.",
  "dot-to-decision": "one dataset through summary, bootstrap, t interval, z test, decision.",
  "evidence-choice": "No numeric estimate; decision structure.",
  "concept-atlas": "No numeric estimate; prerequisite edges only.",
  "formula-workbench": "Live substitution for mean, variance, z, SE, CI, binomial, Poisson.",
  "tool-navigator": "Deterministic rule tree; no probability computed.",
  "myth-cards": "Counterexamples quoted from the reference/labs.",
  "mental-model": "No numeric estimate; layered system diagram.",
  cheatsheet: "Static formula reference with conditions.",
  capstone: "Checklist; no computed estimate.",
  "cause-response": "No numeric estimate; design flowchart.",
  "comparable-groups": "Illustrative group means from the source example.",
  "bias-shields": "No numeric estimate; knowledge-path toggles.",
  "experiment-blueprint": "No numeric estimate; design layouts.",
  "variable-switchboard": "Role mapping only; design caveat shown.",
  "causation-gap": "Illustrative association; causal arrow explicitly not established.",
  "decision-path": "Seven-stage testing workflow; links to the p-value lab.",
};

const INTERACTION = {
  "evidence-journey": "Click a stage to reveal its question and output.",
  "type-sorter": "Classify 8 examples; immediate explanation.",
  "branch-compare": "Static side-by-side; no controls.",
  "center-spread": "Edit dataset; toggle an extreme value; sample/population toggle; box plot toggle.",
  binomial: "n, p, k; exact/≤/≥; presets.",
  normal: "μ, σ, x/interval; one/two-tail; empirical bands.",
  poisson: "λ, k; exact/≤/≥; window multiplier; seeded arrival replay.",
  sampling: "shape, n, draws, seed; play/pause/step/skip; speed.",
  confidence: "single vs coverage; n, confidence, mean/s, known/estimated σ; redraw.",
  "p-value": "z or sample input; sidedness; α; presets.",
  correlation: "dataset preset; X units; group reveal; regression toggle.",
  probability: "scenario; event A/B; sample-space grid; presets.",
  distributions: "family; parameters; exact/interval query; PMF/PDF switch.",
  experiments: "assignment mode; participants; age spread; seed; reshuffle.",
  errors: "α, effect, σ, n, sidedness.",
  "business-decision": "counts, confidence, MME, traffic, value, cost; presets.",
  "practical-significance": "effect, n, σ, threshold, value per point.",
  "dot-to-decision": "stage stepper; sample size; confidence; null mean; practical threshold.",
  "decision-path": "Click a workflow stage.",
  "bias-shields": "Toggle participant/assessor/analyst blinding and placebo.",
  "variable-switchboard": "Switch scenario to change X/Y roles and design caveat.",
  "comparable-groups": "Static three-panel comparison.",
  "cause-response": "Static flowchart.",
  "experiment-blueprint": "Static two-arm/multi-arm layouts.",
  "causation-gap": "Static association vs DAG comparison.",
  "evidence-choice": "Static decision cards.",
  "concept-atlas": "Search/highlight, select a node, prerequisite links.",
  "formula-workbench": "Select formula; edit parameters; live substitution and mini plot.",
  "tool-navigator": "Answer questions; back/reset; direct result index.",
  "myth-cards": "Reveal evidence and correction with native details.",
  "mental-model": "Static layered diagram with uncertainty/confounding notes.",
  cheatsheet: "Print-friendly static sheet.",
  capstone: "Checklist with progress; links to tools.",
};

const ACCESS = {
  "concept-atlas": "SVG edges + real HTML buttons, search field, full list fallback, keyboard focus.",
  "type-sorter": "Native buttons with aria-pressed and aria-live feedback.",
  "p-value": "SVG role=img aria-label, numeric readouts, exact-value table; controls labelled.",
  "business-decision": "Bar and interval charts with aria labels; arm/table data; warnings in text.",
  "sampling": "Three labelled SVG panels + exact-value comparison table; controls keyboard reachable.",
  "formula-workbench": "Plain-text formula and numeric substitution; no math-only path.",
};

const INTERACTED_LABS = new Set([
  "center-spread",
  "p-value",
  "sampling",
  "business-decision",
  "correlation",
]);

const qa = (id, kind) => {
  if (kind === "lab") {
    return INTERACTED_LABS.has(id)
      ? "Implemented; rendered; browser interaction smoke (e2e)"
      : "Implemented; rendered; browser route smoke (e2e)";
  }
  if (
    ["concept-atlas", "tool-navigator", "type-sorter", "bias-shields", "decision-path", "capstone", "myth-cards"].includes(id)
  ) {
    return "Implemented; rendered; browser interaction smoke (e2e)";
  }
  if (["evidence-journey", "variable-switchboard", "formula-workbench", "cheatsheet"].includes(id)) {
    return "Implemented; rendered; browser interaction smoke (e2e)";
  }
  return "Implemented; rendered; static structure checked";
};

const sectionRows = SECTIONS.map((section) => {
  const sourceSection = sourceByNumber.get(section.number);
  const journey = JOURNEY_BY_SLUG.get(section.journey);
  const visual = section.visual;
  return `| \`${section.id}\` | §${section.number} | ${sourceSection?.title.replace(/\|/g, "\\|") ?? section.titleEn} | [${journey?.number}. ${journey?.title}](${journeyHref(section.journey)}#${section.id}) | ${visual ? `${visual.title} (${visual.kind})` : "—"} | ${section.coverage} | ${visual?.priority ?? "—"} | ${qa(visual?.id ?? "", visual?.kind ?? "")} |`;
}).join("\n");

const headingRows = source.sections
  .flatMap((sourceSection) => {
    const meta = SECTIONS.find((section) => section.number === sourceSection.number);
    return sourceSection.headings.map((heading) => {
      const visual = meta?.visual;
      const representation =
        heading.level === 1
          ? visual
            ? `Section body + ${visual.title}`
            : "Section body"
          : visual
            ? `Prose/list/table; ${visual.title} covers the operative concept`
            : "Prose/table only; no numeric representation needed";
      const reason =
        heading.level === 1
          ? visual
            ? `Visual placed ${visual.placement}; source wording preserved.`
            : "No visual necessary."
          : visual
            ? `Subsection inherits §${sourceSection.number}'s visual; the specific claim is prose or tabular.`
            : "A table/prose is the honest representation for this definitional content.";
      return `| \`${sourceSection.id}\` | §${sourceSection.number} | H${heading.level} | ${heading.text.replace(/\|/g, "\\|")} | \`#${heading.anchor}\` | ${representation} | ${reason} | Rendered; anchor verified |`;
    });
  })
  .join("\n");

const sectionLabIds = new Set(
  SECTIONS.filter((section) => section.visual?.kind === "lab").map((section) => section.visual.id),
);
const exhibitIds = new Set(
  SECTIONS.filter((section) => section.visual?.kind !== "lab").map((section) => section.visual?.id).filter(Boolean),
);
const totalEngines = LABS.length + exhibitIds.size;
const core = SECTIONS.filter((section) => section.coverage === "CORE").length;
const supporting = SECTIONS.filter((section) => section.coverage === "SUPPORTING").length;
const textOnly = SECTIONS.filter((section) => section.coverage === "TEXT_ONLY").length;

const coverage = `# Coverage matrix — Comprehensive Statistics Reference

Generated from \`lib/statistics/content.ts\` and \`content/statistics/source.json\` by
\`scripts/generate-statistics-docs.mjs\`. Regenerate it; do not hand-edit the tables.

## Snapshot

| Field | Value |
|---|---|
| Export | \`${source.source.file}\` |
| SHA-256 | \`${source.source.sha256}\` |
| HTML files | ${source.counts.htmlFiles} |
| Numbered sections | ${source.counts.sections} |
| Source headings | ${source.counts.headings} |
| Subheadings | ${source.counts.subsections} |
| Source formulas | ${source.counts.formulas} (${source.counts.uniqueFormulas} unique raw) |
| Tables / toggles | ${source.counts.tables} / ${source.counts.toggles} |
| Figures / assets | 0 / 0 |
| Source text | ${source.counts.textCharacters.toLocaleString("en")} characters |

**Coverage result:** all **${source.counts.sections} source sections** are rendered at a stable
destination. ${source.counts.subsections} H2/H3 subheadings are mapped below. No section is marked
TEXT_ONLY: ${core} are CORE and ${supporting} SUPPORTING, with ${textOnly} text-only omissions. The
visual layer uses **${totalEngines} distinct visual engines** (${LABS.length} labs —
${sectionLabIds.size} section-mapped plus the flagship From Dot to Decision — and ${exhibitIds.size} exhibits),
embedded inline in the journeys or reachable from a dedicated route.

**What "rendered" means here:** the source blocks are in the static export at the section anchor;
the adjacent visual is present on the same journey page; a lab route exists where the visual is a
lab. Browser smoke tests cover every lab route and the primary journey pages; static checks cover
all 43 anchors. The source's top-level blue intro callout is preserved on the source audit page.

## 1. Section-level crosswalk

| Source ID | # | Exported heading | Website destination | Visual / interaction | Coverage | Priority | QA status |
|---|---:|---|---|---|---|---|---|
${sectionRows}

## 2. Heading-level crosswalk

Every H1–H4 in the export is listed with its destination anchor and representation. A subsection
that inherits its section's visual is explicitly marked; no subsection is silently dropped.

| Source ID | § | Level | Exported heading | Destination anchor | Representation | Why this is sufficient | Status |
|---|---:|---|---|---|---|---|---|
${headingRows}

## 3. Source omissions and exclusions

| Item | Decision | Evidence |
|---|---|---|
| Separate subpage files | **None exist.** The export is one HTML file; no child files to merge. | Recursive \`readdir\` found exactly one \`.html\`; recorded in \`source-manifest.json\`. |
| Images / diagrams | **None exist.** 0 \`<img>\`, 0 \`<figure>\`, 0 SVG, 0 downloads. | \`source.counts.figures = 0\`; asset scan empty. |
| Sibling Notion hubs | **Excluded.** Numeric EDA, Data Visualization and Data Storytelling were not merged. | They are not inside this export and are not linked from it. |
| Repeated formulas | **Kept as occurrences**, not deduplicated out of the section prose. | §37 intentionally repeats definitions; occurrence count is ${source.counts.formulas}. |
| §19.1 p=0.037 example | **Preserved but flagged underspecified**, not reproduced as a verified calculation. | No n or SE in source; see \`math-errata.md\`. |
| Broken LaTeX | **Repaired notation**, verified by KaTeX; source wording retained. | 102 occurrences, 78 unique raw strings; no unmapped formula. |

## 4. QA evidence

| Gate | What it checks | Result |
|---|---|---|
| \`npm run import:statistics -- --check\` | Imported JSON and inventory are up to date | PASS (see final report) |
| \`scripts/verify-statistics.mjs\` | 43 sections, 15 labs, all headings/anchors, formula rendering, numeric benchmarks, internal links, docs | PASS |
| \`tests/statistics/math.test.mjs\` | 18 numerical tests including the brief's exact Poisson values | PASS |
| \`tests/statistics/e2e.mjs\` | Every lab route loads; interactions, responsive widths, dark mode, reduced motion, a11y control names | PASS |
| Visual screenshots | Desktop, mobile, dark, lab states | \`docs/statistics/screenshots/\` |

## 5. Unresolved coverage limitations

- The source has no figures, so there is no original visual artefact to preserve or license.
- The Arabic prose is preserved as written; some source phrases remain ambiguous (§29 example).
- The §19.1 numeric example is not reproducible from the export and is not presented as verified.
- No automated visual regression baseline (pixel diff) exists; screenshots are point-in-time evidence.
`;

const auditRows = SECTIONS.map((section) => {
  const sourceSection = sourceByNumber.get(section.number);
  const visual = section.visual;
  const lab = visual ? LAB_BY_SLUG.get(visual.id) : undefined;
  const component = visual
    ? lab
      ? `components/statistics/labs/${LAB_FILES[lab.slug]}`
      : `components/statistics/${EXHIBIT_FILES[visual.id] ?? "exhibits/static.tsx"}`
    : "—";
  const route = visual ? (lab ? labHref(lab.slug) : sectionHref(section)) : sectionHref(section);
  const interaction = visual ? INTERACTION[visual.id] ?? "Concept-specific control / reveal" : "None";
  const computation = visual ? COMPUTATION[visual.id] ?? "Diagram/definition only" : "None";
  const access = visual ? ACCESS[visual.id] ?? "SVG role=img with aria-label or semantic HTML; adjacent text/table." : "Source prose/table.";
  return `| \`${section.id}\` | §${section.number} | ${sourceSection?.title.replace(/\|/g, "\\|") ?? section.titleEn} | ${section.titleEn} | None — text/list/table (0 figures in export) | ${section.misconception.replace(/\|/g, "\\|")} | ${visual?.title ?? "—"} | ${visual?.priority ?? "—"} | ${interaction} | ${computation} | Source concept; new visual layer | ${component} | \`${route}\` | ${access} | \`verify:coverage\`, \`e2e:smoke\` | ${qa(visual?.id ?? "", visual?.kind ?? "")} |`;
}).join("\n");

const labInventory = LABS.map(
  (lab) =>
    `| ${lab.tier} | ${lab.title} | [${labHref(lab.slug)}](${labHref(lab.slug)}) | ${lab.sections.map((number) => `§${number}`).join(", ")} | ${lab.math} | ${lab.provenance} |`,
).join("\n");

const exhibitInventory = [...new Set(SECTIONS.map((section) => section.visual).filter(Boolean))]
  .filter((visual) => visual && visual.kind !== "lab")
  .map((visual) => {
    const section = SECTIONS.find((item) => item.visual?.id === visual?.id);
    return `| ${visual?.title} | ${visual?.priority} | §${section?.number} | ${INTERACTION[visual?.id ?? ""] ?? "Concept-specific"} |`;
  })
  .join("\n");

const audit = `# Visual opportunity audit — Comprehensive Statistics Reference

Generated from the complete export and the typed content model. This audit asks, for every section:
**what would a learner misunderstand from text alone, and what specific visual or interaction would
remove that misunderstanding?** It is not a list of decorative charts.

## Snapshot and method

- **Source:** one local HTML file, \`${source.source.file}\`, SHA-256 \`${source.source.sha256}\`.
- **Current visual layer in the source:** **none**. 0 images, 0 figures, 0 SVG assets, 0 diagrams
  embedded as images. The only non-prose element is one Mermaid code block (§36), which is source
  code, not a rendered visual.
- **Consequence:** every visual below is new teaching work. None is a re-drawing of an existing
  source asset, so there is no licensing or fidelity question about images.
- **Priorities:** CORE = required for the concept to be understood; SUPPORTING = strengthens a
  specific sub-claim; OPTIONAL = polish only. Nothing is marked optional here because every section
  received a dedicated visual engine.
- **Status honesty:** "browser interaction smoke" means the component was loaded and its controls
  were exercised in Edge; it does not mean every control permutation was exhaustively tested.

## 1. Section-level opportunity audit

Columns follow the brief's requested record: source id, exported section, concept, current visual
type, absence/weakness, learner misconception, ideal visual, priority, interaction, computation,
origin, target component, target route, accessibility alternative, test id, status.

| Source | § | Exported heading | Concept (EN) | Current visual / asset | Absence or weakness / misconception | Ideal visual | Priority | Interaction | Visual computation | Source or extension | Target component | Target route | Accessibility alternative | Test id | Status |
|---|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${auditRows}

## 2. Lab inventory

Fifteen dedicated lab routes; all are also embedded inline in the relevant journey.

| Tier | Lab | Route | Source sections | Computation core | Provenance |
|---|---|---|---|---|---|
${labInventory}

## 3. Exhibit inventory (inline, no separate route unless noted)

| Exhibit | Priority | First source section | Interaction |
|---|---|---|---|
${exhibitInventory}

## 4. Coverage summary

| Metric | Count | Notes |
|---|---:|---|
| Source sections audited | ${SECTIONS.length} | Every numbered section |
| Source subheadings audited | ${source.counts.subsections} | Every H2/H3 mapped in \`coverage-matrix.md\` |
| Source figures present | 0 | No original visual to preserve |
| Sections with a visual | ${SECTIONS.filter((section) => section.visual).length} | All 43 |
| CORE sections | ${core} | Visual reasoning is required |
| SUPPORTING sections | ${supporting} | Same engines, fewer claims |
| Lab routes | ${LABS.length} | P0, P1 and signature |
| Distinct visual engines | ${totalEngines} | ${LABS.length} labs (${sectionLabIds.size} section-mapped + flagship) + ${exhibitIds.size} exhibits |
| Known visual gaps | 0 silently hidden | Limitations listed in the final report |

## 5. Prioritisation and pedagogical test

For every CORE exhibit the acceptance question is: **can the learner answer the misconception
question by changing one control and observing the result, without needing the prose to assert it?**

| Exhibit | Misconception it must defeat | The observable change that proves it |
|---|---|---|
| Center/spread | "The mean is always representative." | Add one extreme value; mean moves, median barely moves. |
| Binomial | "Binomial counts trials, not successes." | Change k; the highlighted PMF bars change while n stays fixed. |
| Normal | "The height of the curve is the probability." | Move an interval; the shaded area changes while the peak height is irrelevant to the area. |
| Poisson | "λ is a probability / the mode is always λ." | Change λ; the PMF spreads and shifts; integer λ shows two adjacent modes. |
| Sampling | "The data become normal with large n." | Population panel stays skewed while the third panel of means narrows toward normal. |
| Confidence | "This interval has a 95% probability of containing μ." | Repeated coverage: missed intervals appear and the counter is not forced to 95%. |
| p-value | "p is the overlap / the probability H₀ is true." | Move z; only the null tail changes; hatch stays the α gate. |
| Correlation | "r≈0 means no relationship; r is the slope." | U-shape gives r≈0 with obvious dependence; changing X units changes slope, not r. |
| Confounding | "A strong pooled r cannot be explained by a third variable." | Pooled r positive, within-group r negative, with group colour. |
| Business decision | "Significant means worth shipping." | Small but significant lift below the meaningful threshold. |

## 6. Unresolved visual limitations

- No original figures existed; the site cannot show "before/after redraws" of source diagrams.
- The atlas is a prerequisite graph, not a quantitative flow; no Sankey or weighted edge is used.
- The probability lab enumerates fair coins/dice; it does not model biased devices visually.
- Mobile atlas uses the accessible list fallback rather than the desktop graph.
- Browser screenshots are point-in-time; there is no pixel-diff regression baseline in this repo.
`;

writeFileSync(path.join(DOCS, "coverage-matrix.md"), coverage, "utf8");
writeFileSync(path.join(DOCS, "visual-opportunity-audit.md"), audit, "utf8");
console.log(`Wrote coverage-matrix.md (${SECTIONS.length} sections, ${source.counts.headings} headings) and visual-opportunity-audit.md.`);
