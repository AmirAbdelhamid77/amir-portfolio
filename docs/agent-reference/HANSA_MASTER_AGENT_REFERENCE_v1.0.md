# HANSA — Master AI Agent Reference for Content-Aware Educational Web Design

**Version:** 1.0  
**Prepared:** 2026-10-24  
**Audience:** Coding, content, UX, instructional-design, QA, documentation, and orchestration agents  
**Status:** Reference policy / implementation playbook, **not** a claim that the current site has been audited  
**Primary agent entry point:** `AGENTS.md` in this package

> **Governing rule:** Understand the knowledge and what the visitor needs to learn first; choose an explanatory representation second; select a component library third; implement only after verifying content, project constraints, and source documentation. A beautiful component is not evidence of successful teaching.

## Quick read — binding decisions

1. **Content accuracy and preservation win over aesthetics.** Do not silently omit, invent, simplify away, or reword technical content into incorrect statements.
2. **Default to the simplest effective representation.** Text, tables, and static SVG are valid first-class outcomes. A page does not need a chart or an animation to be good.
3. **Do not treat beUI as a replacement for analytic tooling.** Use it for presentation/interaction primitives and its existing charts when fit; add a complementary tool only for a distinct capability.
4. **The known Hansa hosting model is static-first and free-first.** Check actual repository/configuration before making changes. Avoid solutions that require paid services, server-only routes, secret-backed APIs, or undocumented backend dependencies.
5. **Every visible numeric claim, equation, diagram relationship, and answer key needs provenance or a clearly labeled illustrative basis.** Never fabricate observed data.
6. **Every interaction needs a learning purpose, correct output, reset/recovery, and an accessible fallback.** No deceptive controls or simulated functionality presented as real.
7. **No blind installs or unrestricted remote execution.** Inspect registry source, dependencies, versions, licenses, safety, and overlap before adoption.
8. **Never overwrite prior validated content/learning progress without migration and verification.** Preserve navigation, routes, SEO metadata, analytics definitions, accessibility, and user state where applicable.
9. **A passing build is necessary, not sufficient.** Check semantic correctness, teaching effectiveness, responsive states, keyboard accessibility, performance, and content parity.
10. **Produce an evidence-backed handoff.** Report what was actually inspected, what changed, what was tested, remaining risks, and source paths.

---

# Part I — Context, sources, and interpretation

## 1. Project identity and scope

Hansa's intent is to **transform complexity into structured knowledge, analysis, and better decisions**. The website should function as a learning-and-exploration experience, not merely a collection of aesthetically polished articles. The current intended knowledge areas include:

- Data Visualization: encoding, chart choice, visual perception, dashboard design, misleading charts, interaction design.
- Comprehensive Statistics: distributions, descriptive statistics, probability, inference, sampling, confidence intervals, hypothesis testing, correlation and regression.
- Data Storytelling: audience, narrative arc, insight, evidence, argument, editorial pacing, explanatory charts.
- Microsoft Fabric / DP-600: OneLake, Lakehouse, Warehouse, Delta tables, ingestion, mirroring, shortcuts, semantic models, DAX, security, performance and exam-style scenarios.
- SQL, Power BI, DAX and related applied analytics: precise query/measure semantics, filters, data modeling, reproducible examples.
- Future subject matter: use the same content-first methodology without forcing these domain defaults onto unrelated pages.

**Historical implementation context provided by the project owner:** a Next.js App Router site was reported as statically exported and deployed to Cloudflare Workers Static Assets at `https://hansa.amir-portfolio.workers.dev/` using a free configuration. Treat this as *reported context*, **not as freshly verified repository state**. The exact Next.js version, directory layout, UI framework versions, existing tokens, page routes, and actual accessible content must be confirmed from the local checkout. A public browse of the site was not reliable at guide preparation time.

## 2. Authority hierarchy (highest first)

1. Explicit current request and nonnegotiable owner constraints.
2. Current project's actual source files, app configuration, valid tests, and content exports (after inspection).
3. Original educational source material, including original Notion exports, HTML attachments, equations, data, citations, and references.
4. This master guide and any more-specific, nonconflicting local `AGENTS.md` instructions.
5. Verified up-to-date official library/API documentation.
6. Reasoned design suggestions and generic examples; label these as proposals, never as observed source facts.

If instructions conflict, document the conflict, apply the higher-priority reliable source, and preserve data. Do not hallucinate unseen pages, files, dependencies, content, or deployment capabilities.

## 3. What an agent must inspect before planning a change

- Repository root and workspace layout; Next configuration (`output`, plugins, image strategy, base paths).
- React/Next/Tailwind package versions, lockfile, TypeScript configuration and existing dependencies.
- Design tokens, CSS foundations, shared components, chart wrappers, typography and icon conventions.
- Current route tree, page titles, canonical URLs, cross-page links, search and navigation behavior.
- Source exports (all HTML and subfolders), media, equations, datasets, embedded code, citations and attachments.
- Existing reusable beUI components, registry-installed source, custom visualizations and duplicates.
- Available test commands, CI, lint, typecheck, test runner, visual tests and deployment workflow.
- Client-side state and persistence (if any), consent requirements, third-party networks and secrets.

### Minimum preflight output

Write a short `SOURCE_AUDIT.md` or worklog containing: inspected paths, missing paths, counts of source pages/assets, source-to-target page mapping, existing functionality at risk, known/unknown constraints, and a list of decisions needing verification. If source material is missing, do not claim complete coverage.

## 4. Content provenance, accuracy and preservation

**Do:**
- Treat each original page/subpage as a source unit; assign a stable ID and map it to a destination section or page.
- Preserve definitions, distinctions, caveats, equations, algorithm steps, citations, code semantics, and worked solutions.
- Link statements, numbers, data sources, image sources, diagrams and assessments to their origins.
- Maintain original text excerpts or immutable raw archives when transformation is extensive.
- Label every demo dataset as `Illustrative example — not observed data` unless grounded in actual evidence.
- Separate **source-backed fact**, **interpretation**, **analogy**, and **teaching exercise**.
- Flag disagreement or uncertain details rather than silently selecting a convenient answer.
- Explain units, time bases, populations, sampling methods, filtering logic and denominator whenever relevant.
- Use original references as the content's factual authority; use library docs for implementation authority.

**Do not:**
- Pretend to have viewed exported Notion pages if no local files are available.
- Infer charts from prose by making up empirical data, percentages, user studies or distributions.
- Convert precise mathematical or DAX semantics into simplistic but false explanations.
- Remove subpages or merge distinct concepts just because headings look similar.
- Present generated exam-style practice as authentic, leaked, or officially endorsed DP-600 examination items.
- Turn all content into an interactive widget at the cost of learnability.

### Source coverage ledger (required for larger imports)

| source_id | original_path | destination_route | section_anchor | status | preserved_elements | unresolved | reviewer |
|---|---|---|---|---|---|---|---|
| SRC-001 | path/to/export.html | /topic/example | #introduction | mapped / migrated / checked | formulas, text, example, chart | none | agent |

**Coverage denominator** = total identified source units. **Coverage numerator** = units mapped and manually/automatically verified against the source. Report both; do not call a migration “100% complete” based solely on pages created.

---

# Part II — Classify the knowledge before choosing the UI

## 5. Content ontology

For every major section assign one **primary** knowledge form plus optional secondary forms. Multiple forms can coexist, but avoid rendering all possible forms at once.

| Content form | The user needs to understand… | Preferred representation | Learning interaction | Common wrong choice |
|---|---|---|---|---|
| Definition / principle | What a concept means and when it applies | Clear prose + concise example + caveat | Reveal misconception / example | Decorative 3D scene |
| Comparison / tradeoff | How choices differ | Matrix, paired examples, decision table | Toggle same scenario across options | Pie chart without quantities |
| Sequence / chronology | Order and dependency | Numbered steps, timeline | Step through states | Random animations |
| Process / transformation | Inputs → operations → outputs | Flowchart or pipeline diagram | Trace a record or inspect a node | Static screenshot of unreadable UI |
| Hierarchy / taxonomy | Parent-child containment | Tree, indented outline, small treemap if quantitative | Expand branch, highlight path | Sankey for simple parent-child labels |
| Network / relationship | Connections and directionality | Node-edge graph | Highlight connected nodes | Unlabeled arrows |
| Quantity comparison | How amounts differ | Bars/dot plot with zero/baseline discipline | Filter categories / compare | 3D bars, distorted axes |
| Trend over time | Direction/shape/change | Line or area chart where justified | Brush/zoom, annotate turning points | Donut for a time series |
| Distribution / variation | Spread, shape, outliers | Histogram, box plot, violin/dotplot | Change bins/sample/parameters | Showing only an average |
| Correlation / model | Strength, confounding, fit | Scatterplot, regression diagnostic | Add/remove outlier, view residuals | Implying causation from correlation |
| Uncertainty / probability | Interval, sampling, variability | Distribution plus interval/uncertainty overlays | Repeated draws / sample-size slider | False precision |
| Composition / part to whole | Shares, mix and changes in mix | 100% stacked bar/treemap/area as appropriate | Change period/denominator | Pie with too many slices |
| Flow / conversion | Quantities moving between stages | Sankey/funnel **only with valid flow data** | Filter flow cohort | Sankey when links/weights are unknown |
| Decision / conditional rules | What to choose under constraints | Decision tree/branching scenario | Choose and reveal consequences | Endless generic FAQ |
| Code / syntax / execution | What code does and why | Syntax-highlighted code + inputs + outputs + execution trace | Safe playground or parameter selector | Pretend execution results |
| Formula / mechanism | How a quantity changes with inputs | Rendered equation + plotted response | Sliders + exact recomputation | Animated formula without explanations |
| Narrative / evidence | Why a finding matters | Story beats + annotated evidence | Scroll steps / chapter progression | Scrollytelling for every paragraph |
| Procedure / checklist | What must be done reliably | Sequential checklist + pitfalls | Mark progress / verify result | Impressive but unusable wizard |
| Assessment / practice | Whether the learner can transfer understanding | Scenario → response → feedback → rationale | Answer and retry; reveal why alternatives fail | Trivia-only flashcards |
| Reference / lookup | Find precise information quickly | Searchable table, glossary, callouts | Filter/copy/jump to source | Forced linear tutorial |

## 6. Educational objective taxonomy

Choose a learning objective as an observable action. An agent's choice of UI must follow the objective.

- **Recall / Identify:** structured text, term cards, glossary, quick checks.
- **Explain:** visual metaphor *only if precise*, annotated example, before/after.
- **Apply:** guided worksheet, code example, data filter, numerical scenario.
- **Analyze:** compare distributions, inspect trace, diagnose root cause, manipulate data.
- **Evaluate:** tradeoff matrix, counterexample, evidence-strength discussion, decision exercise.
- **Create:** sandbox, pipeline builder, freeform composition, save/export if truly supported.

For each interactive unit, write a one-line objective of the form: “After using this, the learner can **[verb]** **[concept]** under **[constraints]**.” If that sentence is weak or unclear, start with static content.

## 7. Page anatomy (adaptive, not mandatory decoration)

A strong educational page usually contains:

1. **Orientation:** topic, purpose, prerequisites, time/effort estimate only if grounded.
2. **Why it matters:** the real problem or decision the concept helps solve.
3. **Core explanation:** accurate definition, conditions, limitations.
4. **Visual model:** one meaningful diagram or chart when better than prose.
5. **Worked example:** inputs, process, output, explanation of result.
6. **Try it:** meaningful controls, valid feedback and reset.
7. **Failure modes:** common mistakes and counterexamples.
8. **Practice / transfer:** self-check or application to a novel case.
9. **Summary:** what changed in the learner's mental model.
10. **Explore next:** prerequisites, related pages, sources, references.

Use progressive disclosure for advanced details, **not** for hiding essential definitions. Maintain visible text labels. Provide landmarks, meaningful headings, anchors, breadcrumbs and readable sections. Not every page needs all ten blocks; inclusion is based on content.

## 8. Decision engine: content → representation → library

Apply these gates in order.

**Gate A — Source fidelity.** Are facts, numbers and examples available and understood? If not, use grounded prose, mark unknowns, or request/locate primary source; no invented chart.

**Gate B — Learning value.** Does the concept have a dynamic relationship, multiple states, complex pattern, or process whose structure is easier to understand visually? If no: good writing is enough.

**Gate C — Representation.** What visual grammar best matches the semantics: timeline, flow, hierarchy, compare, distribution, relationship, code trace, or narrative?

**Gate D — Interaction.** Would manipulating a real parameter reveal a mechanism or help answer a decision? If no: static diagram/chart is preferable. If yes: design controls and exact consequences.

**Gate E — Existing capability.** Search site's local component library and live beUI free registry. Reuse if appropriate. Avoid adding another chart library to draw a chart already well served by beUI.

**Gate F — Complementary tool.** Choose the smallest trustworthy library that provides a distinct semantic capability. Verify current docs, package compatibility, license, availability and static-hosting support.

**Gate G — Accessible fallback.** Every graphic has a textual summary; every data chart has accessible labels and, where useful, a table; every direct-manipulation feature has a keyboard/alternative control.

**Gate H — Performance & robustness.** Avoid introducing large eagerly loaded libraries for a minor enhancement. Lazy-load specialist experiences and provide meaningful loading and failure states.

### Mandatory representation selection record

For each nontrivial element write:

| Field | Example |
|---|---|
| source_id | SRC-017 |
| learning_goal | Distinguish variability from central tendency |
| content_form | distribution + comparison |
| data_basis | synthetic, parameterized normal distribution, clearly labeled |
| first_choice | annotated text + two histograms |
| interaction_reason | slider demonstrates spread with mean held constant |
| selected_library | Mafs or ECharts depending on required plot semantics |
| why_not_existing_beui | needs arbitrary mathematical function or statistical analysis not supported by chosen beUI chart |
| fallback | image/SVG and comparable data/parameter table |
| risks | false implication that all real-world data are normal |

---

# Part III — Library catalog and anti-duplication policy

## 9. Use beUI as the foundation, not as the universal answer

Official entry points (review each before installing):

- Website: https://beui.dev/
- Agent documentation: https://beui.dev/docs/ai-agents
- Registry index: https://beui.dev/r
- JSON catalog: https://beui.dev/registry.json
- LLM-readable index: https://beui.dev/llms.txt
- MCP server endpoint: `https://mcp.beui.dev/mcp` (if the coding agent supports remote MCP securely)

The free public beUI library includes animation primitives, basic interaction components, AI interface elements and several chart types; its public components are MIT licensed. beUI Pro is a separate paid offering. **Do not pull paid Pro components into a free-only project.** As the catalog changes, never hardcode stale component lists as authoritative: retrieve the *current* registry.

**Safe discovery sequence:**
1. Search the existing codebase for a component first.
2. Search the current beUI catalog by the *actual UI capability needed*.
3. Inspect registry item, component files, dependency list, required tokens and accessibility behavior.
4. Compare against existing primitives and avoid introducing duplicates.
5. Pin versions as appropriate for the project's package manager; install only required dependencies.
6. Verify behavior, styling, mobile interaction, reduced motion and license before reuse.

beUI public components often use modern React, Tailwind and Motion; confirm the project's exact compatibility. Do not infer that every displayed demo or Pro block is free. Be aware that a live MCP is an optional discovery convenience, not a requirement for this guide.

## 10. Complementary library capability matrix

These are **capability recommendations**, not a blanket instruction to install them all.

| Tool | Distinct value beyond beUI | Use when | Do NOT use when | Free/open-source notes |
|---|---|---|---|---|
| **Apache ECharts** https://echarts.apache.org/ | Advanced statistical and multi-dimensional charts, tooltips, linked interactions, brushing, heatmaps, box plots, treemaps | Data science/statistics, rich analytic plots and dashboards | Simple existing beUI chart is sufficient; plot has no verified/synthetic data model | Apache 2.0; import only needed charts/components; configure chart accessibility |
| **Mafs** https://mafs.dev/ | Mathematical coordinate system and draggable parameterized geometric/function models | Explain functions, regression intuition, transformations, distribution behavior | Routine KPI dashboards or categories-only charts | Open-source; verify current package/license before adding |
| **React Flow** https://reactflow.dev/ | Stateful node-edge interactions, custom nodes, connections, pan/zoom | Trace/manipulate pipelines, graphs, architectures | Immutable diagram can be conveyed in lightweight SVG/Mermaid | MIT core; optional paid offerings are not required |
| **Scrollama** https://github.com/russellsamora/scrollama | Observer-driven narrative transitions tied to reading position | Evidence-driven data stories with purposeful state changes | Standard articles, accessibility-sensitive forced scroll effects | Open-source; pair with independent text/keyboard navigation |
| **Perspective** https://perspective-dev.github.io/ | User-configurable pivot/data grid, grouped/faceted analytics in-browser | Exploratory BI teaching with sufficiently structured data | Static article or small single-purpose chart | Apache 2.0; WASM/asset loading and bundle impact must be tested |
| **Sandpack** https://sandpack.codesandbox.io/ | Editable in-browser JavaScript/React execution and preview | Safe, scoped code lessons and component exercises | SQL/DAX/Fabric execution without a real compatible engine; simple static snippet | Open-source; default bundler is network-hosted. Explicitly review service dependence/privacy |
| **Mermaid** https://mermaid.js.org/ | Maintainable diagrams-as-text: sequence, ER, process, architecture | Documentation diagrams generated from verified structures | Direct-manipulation graph builder; extremely custom visuals | MIT; prefer strict security level with untrusted content |
| **KaTeX** https://katex.org/ | Fast, precise mathematical typesetting | Stats/probability/formulas and derivations | A plot is needed to explore behavior (pair with graph) | MIT; can pre-render for static sites |
| **Rough Notation** https://roughnotation.com/ | Highlight explanatory text via hand-drawn emphasis | Small editorial emphasis, one or two key ideas | Every callout or animated chart | MIT; honor reduced motion |
| **React Three Fiber** https://r3f.docs.pmnd.rs/ | True interactive 3D/WebGL scenes | A 3D structure genuinely carries learning meaning | 2D statistical charts, weak mobile devices, decorative page filler | Open-source ecosystem; higher GPU/performance risk |

**Distinguish chart meaning from libraries:** a Sankey in beUI may already do the job. Choosing ECharts does not make it superior by default. The decisive factor is capability and evidence, not animation quality.

### Lightweight-first precedence

1. Semantic HTML / CSS / existing tokens.
2. Existing Hansa components.
3. Existing appropriate beUI free component.
4. Small SVG or purpose-built teaching graphic.
5. Specialist open-source library after justification.
6. Heavy 3D, code execution or client-side BI only for an explicit high-value use case.

### A library rejection log is a feature

Log declined additions: `tool`, `requested capability`, `existing alternative`, `bundle/dependency cost`, `reason rejected`. This prevents future agents from proposing the same duplicate packages again.

# Part IV — Subject-specific experience blueprints

## 11. Data Visualization: explain visual perception and chart choice

**Default learning flow:** the analytical question → dataset semantics → wrong representation → right representation → decoding the visual → try one variable → interpret.

Recommended experiences:

| Lesson | High-value visualization | User manipulation | Tool candidates | Required warning |
|---|---|---|---|---|
| Choosing a chart | Same data in bar, line, scatter and table | Switch question; inspect why choices fail | existing beUI + ECharts | Chart type must follow variable and question semantics |
| Axis truncation | Identical bar data with altered baseline | Toggle full/truncated axis | SVG or ECharts | Clearly label deceptive example |
| Bin-width effects | One fixed dataset in histograms | Change histogram bins | ECharts | Bin choice alters appearance, not observations |
| Correlation vs causation | Scatterplot with annotation | Add/remove confounder or stratify | ECharts | Correlation alone does not prove causation |
| Relative vs absolute change | Dual view: counts and percentages | Change denominator | ECharts or SVG | Always surface numerator and denominator |
| Outliers | Distribution and summary cards | Include/exclude extreme observation | ECharts | Don't hide removed data |
| Aggregation trap | Group vs combined trends | Toggle subgroups | ECharts | Explain Simpson's paradox only when data support it |
| Dashboard composition | Evidence-first before/after design | Reorganize cards or compare visual hierarchy | existing beUI + simple drag/drop | Avoid decorative KPI overload |
| Color encoding | Categorical/sequential/diverging scales | Switch palette with legends | SVG + beUI control | Color is not the only channel |
| Maps | Geographic data with explicit units | Zoom/filter grounded locations | mapping library only if needed | Never invent place coordinates |

Charts must have explicit titles (“what is being compared?”), units, legible legends, tooltips that *add* meaning, cited data sources, documented transformations, date windows, and empty/error states. Color choices must retain meaning in light and dark themes.

### Chart selection checklist

- What exactly is the analysis question? Is the viewer comparing amounts, change, distribution, association, flows, geographies, or uncertainty?
- Are variables categorical/ordinal/continuous/temporal, and are there meaningful zeroes?
- Are observations aggregated? If yes, by which measure/group/window?
- Is the view explanatory (guided) or exploratory (user-directed)?
- Are dual axes, smoothing, omitted zero baseline, percentages or color scales potentially misleading?
- Can a person understand the takeaway without hovering? Can they access a data table?
- Is the chart actually supported by source data, synthetic example math, or neither?

## 12. Comprehensive Statistics: make uncertainty tangible

**Default flow:** plain-English definition → assumptions → equation → exact example → interactive model → interpretation → misinterpretation → quick check.

**Example components and behavior:**

1. **Mean vs Median:** fixed editable dataset; moving one extreme value updates both values; show sorted data; explain robustness. Simple controlled React/SVG is often enough.
2. **Variance and Standard Deviation:** display each deviation and squared deviation with equation steps; adjust dataset; distinguish population versus sample denominators (`N` vs `n - 1`).
3. **Probability Distribution Explorer:** interactive `μ` and `σ` (mathematical continuous normal model), shade probability interval, display numeric probability and formula. Explain this is a model, not a universal empirical shape. Mafs + KaTeX.
4. **Central Limit Theorem:** repeated simulated samples from a selected parent distribution; plot sample mean distribution and sample size. Use deterministic seeded simulation when possible and label approximation, counts and assumptions.
5. **Confidence Intervals:** repeated sample intervals with known population parameter (simulation); show long-run coverage, not “95% probability that this fixed parameter lies in the realized interval” under a frequentist interpretation.
6. **Hypothesis Tests:** sample result → null model → test statistic → p-value area → interpretation; include test assumptions, significance level, sample size, and type-I/type-II error tradeoff. Never teach p-value as `P(H0 is true | data)`.
7. **Regression:** fit line and residuals; modify points, inspect leverage and outliers; surface coefficient interpretation, extrapolation limits and confounding.
8. **Sampling Bias:** compare target population and selected sample; manipulate selection probabilities; show that huge sample size does not automatically remove systematic bias.
9. **Bayes' theorem:** rate-based population grid / tree / probability table plus formula; vary base rate, sensitivity and specificity; label conditional probabilities correctly.
10. **Box plot and quantiles:** linked raw dot plot + quartiles, with convention clearly specified (quartile definitions can vary by software).

**Mathematical integrity gates:**
- Equation definitions are exact and symbols are defined.
- Show intermediate steps for at least one numeric worked example.
- Constrain parameter ranges and guard against division by zero, negative probabilities, empty samples, NaNs and infinity.
- Every simulator states randomness model, sample assumptions, seed/reproducibility, variability and interpretation limits.
- Prefer deriving outputs from code functions, not hardcoded changing annotations.
- Distinguish inference, illustration and operational decisions.

## 13. Data Storytelling: tell a story with evidence, not scroll effects

For a story, require these seven fields before choosing scrollytelling:

1. **Audience:** who will act on the insight?
2. **Decision:** what choice or question matters?
3. **Tension:** which expectation, ambiguity, contradiction or cost needs explaining?
4. **Evidence:** what verified observations support the argument?
5. **Insight:** what is the key supported conclusion?
6. **Implication:** so what, for whom, under which caveats?
7. **Next action:** what should the reader examine, decide, or test next?

Only introduce Scrollama if visual changes across successive steps strengthen the causal order of the explanation. Otherwise use standard well-written article sections with embedded charts.

**Suggested evidence-driven sequence:**
- Hook: the question or surprising change, with relevant baseline.
- Orientation: clarify metrics, timeframe and source.
- Reveal 1: broad trend.
- Reveal 2: segment or subgroup differences.
- Reveal 3: plausible mechanism and uncertainty, carefully labeled.
- Counterargument: alternative interpretation / missing evidence.
- Resolution: supported conclusion with limitation.
- Action: decision and measurable next step.

**Scrollytelling interaction spec:**
- Narrative steps are meaningful standalone text and can be navigated without scrolling effects.
- Sticky chart updates highlight one *consistent underlying dataset*, not a different unstated dataset per step.
- Chart has explicit annotation for the highlighted feature; no disappearing context that distorts the story.
- Respect reduced motion; use step buttons or static fallback on small screens.
- No scroll-jacking and no animation required to understand essential facts.
- Include a printable/static representation of the story, preferably with the evidence images and references.

## 14. Microsoft Fabric / DP-600: visualize architecture and operational consequences

**Model information as structured systems:** resource hierarchy, compute/storage separation, movement/lineage, table semantics, governance, and performance tradeoffs. Use current Microsoft Learn documentation for factual verification if content is not sourced or may change. Do not assume a familiar diagram accurately reflects the present product behavior.

### Learning targets and mapping

| Topic | Mental model to teach | High-value UI | Misconception to correct |
|---|---|---|---|
| Tenant, capacity, workspace, items | Organizational/resource containment vs compute | Tree + linked definition table | Capacity is not another data file |
| OneLake vs Lakehouse vs Warehouse | Storage vs experiences/engines | Layered architecture + compare table | These are not interchangeable item names |
| Mirroring vs Shortcuts vs Copy | Replication, reference, movement | Same source scenario with branch choices | Not all patterns create a second physical copy |
| Lakehouse SQL analytics endpoint vs Warehouse | Engine/interface and write capability | Same data access scenario + capability matrix | Do not treat SQL endpoint write support as identical |
| Delta logs / Parquet | Current logical table vs underlying files | Versioned file timeline | Raw Parquet reads need not apply Delta transaction semantics |
| Deletion vectors, OPTIMIZE, VACUUM | Logical row visibility vs file compaction vs cleanup | Step-through file state with before/after | VACUUM is not the same as OPTIMIZE |
| Time travel and retention | Dependency on surviving data/log state | Timeline with simulated retention slider | Metadata alone does not restore deleted data files |
| Medallion pipeline | Transformations and quality contracts | Node-edge data flow with record tracing | Bronze/Silver/Gold are patterns, not product-enforced names |
| Semantic models and DAX | Filter contexts and relationships | Filter propagation trace | Measures are not simple row-by-row formulas |
| Fabric performance | Tradeoff between layout, engine, query, model | Diagnostic decision tree | There is no universally best optimization |

**Interactive architecture rules:**
- For a read-only explanation, use Mermaid or SVG first; use React Flow when node selection, editing, tracing, zoom or connectivity is itself educational.
- Mark every node type and edge direction. Distinguish “reference,” “copy,” “compute,” “query,” “shortcut,” “replication,” and “logical relationship” visually and in text.
- Tooltips explain constraints, not marketing descriptions.
- Use scenarios to expose tradeoffs; do not label an option optimal without explicit requirements.
- For potentially fast-changing Microsoft Fabric features, attach documentation version/access date and a verification-needed flag.

### DP-600-style assessment principle

Use original realistic scenario-based questions that test architecture decisions, tradeoffs, diagnostic reasoning and implementation constraints. Correct answers need **rationales**, rejected-choice explanations and source-backed distinctions. Clearly state `original practice content; not authentic examination material`; do not reproduce unauthorized exam dumps or suggest they are official real-exam questions.

## 15. SQL, DAX and Power BI: explain execution precisely

A code teaching component should show five distinct things:

1. **Schema and sample data** with types and relationships.
2. **Code/measure** with syntax highlighting and trustworthy engine context.
3. **Execution mental model** (row/filter/aggregation context, logical phases, joins, evaluation).
4. **Expected result** with traceable computation, not fake runtime responses.
5. **Diagnostic change** showing which clause/filter makes the output change.

**SQL teaching examples:** `GROUP BY`, joins and duplicate multiplication, `PARTITION BY`, window frames, `LAG`, `RANK`, CTEs, null semantics, transaction behavior; note dialect (PostgreSQL vs T-SQL vs Fabric SQL).

**DAX teaching examples:** `CALCULATE` and filter context changes, `KEEPFILTERS` vs replacement, `ALL` vs `REMOVEFILTERS`, `FILTER` table expression, context transition, measures vs calculated columns; do not imply SQL window frames are DAX concepts.

**Engine integrity:** Sandpack runs JavaScript/React, not a real DAX/Fabric SQL engine. Do not present a JavaScript imitation as native SQL/DAX execution. A genuine SQL lab needs a vetted browser-compatible SQL engine and safe fixture data, or clearly labeled static guided execution traces; actual Fabric cloud execution requires appropriate connected services and credentials, not a static page pretending to run queries.

## 16. Applied dashboards / HSE example

For real business metrics, teach semantic definitions before visuals:
- Identify numerator, denominator, unit, population, time range, filter scope and applicable standards.
- If illustrating TRIR/DART, note calculation standards may use different hour normalization bases. Never compare rates until the denominator/basis is aligned.
- Distinguish leading and lagging indicators; do not mistake absence of reports for absence of risk.
- Drilldown should trace exactly how a KPI rolls up from lower-level facts.
- Use explanatory annotations for false signals, delayed reporting or changed definitions.
- Use simulated data when no verified real observations are provided; do not imply it reflects a real organization.

---

# Part V — Build reliable interaction contracts

## 17. Every interactive component must declare a semantic contract

Document this near its implementation or in a component manifest:

```yaml
component_id: normal-distribution-explorer
learning_objective: "Predict how mean and standard deviation affect a normal density."
representation: continuous_probability_density
source_kind: mathematical_model
library: mafs
input_controls:
  - name: mu
    type: slider
    range: [-3, 3]
    step: 0.25
    default: 0
  - name: sigma
    type: slider
    range: [0.5, 3]
    step: 0.25
    default: 1
outputs:
  - density_curve
  - parameter_summary
invariants:
  - "sigma > 0"
  - "curve integrates to approximately 1 over the full real line"
fallback: "Equation, static plot, and explanatory text"
accessibility: "Keyboard-adjustable controls; readable numerical values"
reset: "Restore mu=0, sigma=1"
verification: "Independent numerical/math check and interaction test"
```

For each control confirm:
- The control changes the relevant state and all dependent outputs together.
- The UI tells the user what changed and what to notice; labels/units are not implied.
- Reset, error, no-data, and invalid-input states are handled.
- The user can achieve the core task with keyboard/touch, not just drag-and-drop.
- Tooltips do not hold essential content hostage.
- Animations are not required for comprehension.
- Conclusions update correctly and never contradict the computed display.

## 18. Chart integrity and accessibility contract

A chart should provide:

```yaml
question: "Which category increased most between 2024 and 2025?"
metric: "Count of events"
unit: "events"
aggregation: "sum"
granularity: "year x category"
filters: ["valid_record = true"]
provenance: "source.csv#table/events or synthetic-example-id"
missing_values: "explicit, never silently converted to zero"
uncertainty: "not estimated / interval method named"
visual_encoding: "grouped bar"
insight: "Verifiable takeaway that follows from data"
accessible_equivalent: "human-readable description plus data table"
```

**Chart rules:**
- Prefer a plain data table when exact lookup matters more than pattern recognition.
- Use line charts for sequential/temporal order; do not connect unrelated categories with a line.
- Use explicit categories and scales. Avoid unlabeled transformed or truncated axes.
- A stacked bar is often better than many pie slices for comparisons.
- A heatmap must show how color maps to values and should offer a tabular fallback.
- A Sankey needs meaningful entities and measurable link weights that reconcile.
- A funnel needs stages/cohorts and appropriately defined conversion bases.
- A scatterplot needs x/y units; regression lines must be labeled as fitted models.
- Show baseline/context for percentage change, seasonality and sample size.
- Never use 3D perspective to exaggerate 2D magnitudes.

Apache ECharts can produce ARIA chart descriptions, but that does not replace testing. Its documented ARIA capability may require registering `AriaComponent` and setting `aria.show: true` when using modular imports. Add keyboard-accessible filters and descriptions separately.

## 19. Exercises and assessments

Use **diagnostic feedback** rather than generic green/red validation:

- Prompt: realistic scenario and relevant constraints.
- Action: multiple choice, multi-select, drag/order with keyboard alternative, numerical response or construction task.
- Feedback: correct/incorrect **and why**, hidden assumption, counterexample, why other choices fail.
- Mastery: track conceptual errors separately from careless input errors where feasible.
- Recovery: reveal explanation, allow retry, and offer prerequisite refresher.
- Evidence: each answer key links to the lesson's stated claim/source.
- Variation: change meaningful inputs, not only wording.
- Integrity: avoid ambiguous stems and unsupported “best answer” when multiple options plausibly fit.

Do not silently persist sensitive responses to third-party services. If progress is stored locally, explain that it is local to that browser/device and may be lost when storage is cleared. Do not claim cross-device sync without a real backend.

## 20. Page-to-page learning design

A collection of educational pages is a **knowledge graph**, not a folder tree alone.

Each topic should specify:
- `requires`: concepts that should be understood before this lesson.
- `introduces`: distinct concepts explained here.
- `reinforces`: concepts revisited or practiced.
- `connects_to`: related pages and rationale.
- `common_confusions`: misconceptions addressed.
- `practice`: exercises and their target concepts.
- `source_ids`: all original source units used.

Create a navigation graph with no dead ends; give a coherent journey while allowing direct access for experienced learners. Do not force a novice progression onto reference users. Preserve URLs/anchors when moving or combining pages; plan redirects only if hosting supports them or equivalent static strategy is verified.

# Part VI — Engineering, quality, and deployment

## 21. Static-first application architecture

**Assume (and verify) Hansa is a Next.js App Router static export.** Official Next.js static export uses `output: 'export'`, creates HTML/CSS/JS assets at build time, and excludes capabilities requiring a live dynamic server. Under a static-only deployment, do **not** silently add:

- Server Actions, request-dependent Route Handlers, runtime cookies/headers, server-side session auth or data processing.
- Runtime dynamic routes whose parameter values cannot be enumerated during build.
- Runtime API endpoints, ISR, server-only image optimization or an assumed persistent database.
- Write operations that require a server or credentials kept private.
- Third-party services with unavoidable charges without explicit owner approval.

**Compatible design options:**
- Static HTML, Markdown/MDX processed at build, local JSON/CSV, precomputed visual data.
- React Client Components for bounded local interactions; verify SSR/prerender behavior.
- Browser-native client-side arithmetic, computations and WASM (subject to performance, security and licensing checks).
- Build-time content ingestion and code highlighting.
- Static SVG/diagrams with lightweight enhancement.
- Client-side browser persistence **only when explicitly disclosed**, with no claim of remote synchronization.

### Client-only modules / hydration safety

Never access `window`, `document`, `navigator`, `localStorage`, browser workers or WebGL during server-side module evaluation or static prerender. Use client boundaries, effects, or an appropriate dynamically imported client component for browser-only dependencies. Test direct route loads, reloads and build output, not just client navigation.

### Asset and route policy

- Keep local content/media assets inside version-controlled or stable build inputs.
- For diagrams, use accessible SVG with meaningful title/description or server/build-rendered output where appropriate.
- Optimize raster images and reserve dimensions to avoid layout shifts.
- Check relative links, exported route names, basePath/trailingSlash behavior and 404 pages against the deployed host.
- Preserve existing canonical metadata, descriptions, heading hierarchy and navigation.
- Do not hardcode a new domain or redirect strategy without verifying deployment settings.

## 22. Design system integration

**Inspect existing design tokens before changing them.** Components from different libraries should look like one cohesive Hansa system, not multiple stitched websites.

Recommend semantic tokens rather than unrelated raw hex values:

```css
/* Proposed semantics, not a directive to overwrite existing design tokens */
:root {
  --hansa-bg: var(--background);
  --hansa-fg: var(--foreground);
  --hansa-surface: var(--card);
  --hansa-border: var(--border);
  --hansa-muted: var(--muted-foreground);
  --hansa-accent: var(--primary);
  --hansa-positive: var(--chart-positive, #16856f);
  --hansa-negative: var(--chart-negative, #c04444);
}
```

Apply consistent spacing, border radii, typography, heading scale, focus ring, legend styling, button affordance, interactive status and responsive containers. Never use semantic color alone to carry a decision. Use real fonts already available or appropriately licensed. Beware chart-specific theme differences when switching between light and dark.

### Motion rules

Motion should answer: *what changed? what is connected? where did it go? why did the state change?* If it answers none, reduce or remove it.

- Respect `prefers-reduced-motion` and provide an equivalent static/in-place transition.
- Avoid perpetual nonessential animation, especially around code and numeric content.
- Do not animate chart elements in ways that temporarily misstate values.
- Maintain a persistent anchor/reference when transforming a visualization.
- Do not use motion/scroll as the sole means of navigating or accessing content.

## 23. Accessibility and language policy

Target **WCAG 2.2 AA** as a practical baseline, subject to actual testing.

### Required checks

- Structure: semantic HTML; correct headings and reading order; landmarks and labels.
- Keyboard: every needed action works without a mouse; no focus trap; visible focus; suitable tab order.
- Motion: honor user reduced-motion preference.
- Visuals: meaningful alt text, descriptions, legends, axis units, data tables when appropriate; charts are not comprehensible only by color.
- Forms/controls: visible names, values, minimum/maximum as appropriate, validation errors and reset options.
- Touch/mobile: controls do not rely on hover; content does not require horizontal scrolling to read text.
- Contrast: verify text, focus indicators and data marks on both themes (do not guess compliance).
- Dialogs/overlays: correct accessible names, focus handling, Escape behavior, close mechanism.
- Reading modes: print styles and no-JS or reduced-interaction fallbacks where educational content would otherwise disappear.

### Arabic and English

Use language metadata and directional behavior appropriately. For mixed Arabic/English technical documents:
- Use `lang="ar"` / `dir="rtl"` for Arabic blocks and `lang="en"` / `dir="ltr"` for English excerpts/code where needed.
- Keep code, mathematical notation and numeric expressions readable in their natural direction.
- Translate explanatory labels accurately; do not translate code identifiers or product names nonsensically.
- Ensure chart axes and tooltips do not clip or reverse numbers in RTL layouts.
- Never assume a page is English-only because the library documentation is English.

## 24. Performance and reliability budget

Measure before and after. Core Web Vitals good-experience targets (Google):
- **LCP ≤ 2.5 seconds**
- **INP ≤ 200 milliseconds**
- **CLS ≤ 0.1**

Treat these as user-experience targets, not a guarantee based on a single local Lighthouse run. For changes to an existing page, avoid regressions in observed metrics and JavaScript shipped. Every new large dependency requires an explanation of why a native or existing solution was insufficient.

### Engineering rules

- Lazy-load specialist charts, WASM, CodeSandboxes, diagram editors and 3D only when the experience is approached or requested.
- Use modular ECharts imports rather than bringing in the complete library by default.
- Prefer one chart engine per page when possible; avoid maintaining three toolkits for small chart variations.
- Memoize expensive transforms; throttle/worker heavy computation when necessary; avoid unnecessary rerender loops.
- Precompute fixed examples at build time; render only necessary data points at once.
- Avoid autoplay video and heavyweight animation below the fold.
- Ship a visual/static fallback for slow networks and unsupported graphics capabilities.
- Test 320–375px widths, tablets, large screens, reduced motion, slow devices, keyboard-only navigation and touch.

## 25. Security, privacy, and free-only guardrails

- Do not add tracking, remote analytics, user profiling or third-party embeddings without an explicit purpose/consent review.
- Never send user-entered code, datasets, email, credentials or site secrets to external bundlers/services without disclosure and approval.
- Treat user-supplied HTML, Markdown, SVG and Mermaid diagram text as untrusted. Sanitize appropriately; prefer Mermaid `securityLevel: 'strict'`.
- Sandbox executable playgrounds with isolation; do not grant them parent DOM/storage access. Do not embed secrets in client bundles.
- Check the exact license of each dependency/version and copied component. Preserve copyright/license notices and assess transitive dependencies.
- “Open source” does not automatically mean “zero external operating cost.” Separate local package license from cloud runtime/service pricing.
- No beUI Pro/private premium components without a separate authorization and compatible license.
- Keep an explicit list of all external runtime services/endpoints and their optional/required status.
- Never claim a client-side static site provides server-side user accounts, private grading or persistent cloud-backed history without actual infrastructure.

---

# Part VII — Agent operating procedure and deliverable contracts

## 26. Recommended agent roles (one agent may fill all roles)

| Role | Question answered | Required artifact |
|---|---|---|
| Content auditor | Do we have every original source unit and its evidence? | Coverage ledger, gap report |
| Learning designer | What must the visitor be able to understand/do? | Learning objectives + misconception map |
| Visual designer | Which representation teaches each concept best? | Representation decision record |
| Frontend implementer | Can this be built within real project constraints? | Source code + dependency/implementation notes |
| Domain reviewer | Are concepts, equations, datasets and answer keys correct? | Domain correctness checks and rationale |
| QA/accessibility tester | Does it work across devices/conditions? | Test results, unresolved defects |
| Integrator/release agent | Did we preserve old behaviors and ship safely? | Diff, build evidence, deployment checks |

The orchestrator must pass source IDs, constraints and acceptance criteria between roles. Do not send “make it beautiful” as a complete implementation task.

## 27. End-to-end phases — run without unnecessary approvals

### Phase 0 — Reality audit

Inspect actual repository, source exports, metadata, dependencies, tokens, content inventory, relevant docs and existing UI. Report blockers with impact and verified evidence.

**Pass:** actual file/config facts separated from assumptions; baseline routes and functionality listed.

### Phase 1 — Source extraction and integrity

Inventory all original HTML pages and nested pages; extract headings, semantics, tables, equations, images, captions, code and citations. Build source mapping with preserved raw references.

**Pass:** each source unit has an ID and destination or explicit unprocessed status.

### Phase 2 — Knowledge modeling

Assign concepts, prerequisites, common misconceptions, objectives and content ontology types. Resolve contradictory explanations using sources; list uncertain facts.

**Pass:** page purpose and learning outcome documented.

### Phase 3 — Experience strategy

Map objectives to representation; design user journey and progressive disclosure. Choose static vs interactive components based on actual learning payoff.

**Pass:** each visual/interactive element has a purpose and selection rationale.

### Phase 4 — Component selection and design

Audit existing local UI first; then discover current free beUI registry; then specialist library if needed. Write dependency, licensing, performance and accessibility reasoning.

**Pass:** no unneeded duplicate dependency; implementation is compatible with verified versions.

### Phase 5 — Incremental implementation

Implement one coherent page or section at a time; preserve routes, source completeness, current behavior and tested components. Avoid sweeping rewrites when adding learning experiences.

**Pass:** each incremental unit builds and displays its actual content.

### Phase 6 — Domain and content QA

Cross-check explanations, calculations, visual encodings, examples and answer keys. Test negative cases and edge cases.

**Pass:** no known critical inaccuracies; every numeric display is reproducible from defined data/model.

### Phase 7 — UX / A11y / responsiveness / performance QA

Test real controls, focus order, screen-size breakpoints, reduced motion, theme changes, static export and loading/error states. Compare bundle impact.

**Pass:** no critical accessibility blocker or route/build failure; performance change justified.

### Phase 8 — Integration and release verification

Run available lint/typecheck/tests/build, inspect `out` content, check local preview/deployed URLs if accessible, preserve rollback path and document effects.

**Pass:** verified output paths and affected routes; no unverifiable claims about deployment.

### Phase 9 — Handoff / continuous improvement

Update source ledger, page registry, component catalog and known limitations. Add automated checks for recurring failure modes.

**Pass:** another agent can proceed without re-discovering core facts or accidentally undoing decisions.

## 28. Required per-page design brief

Each implemented page must have a short structured record:

```yaml
page_id: statistics-confidence-intervals
source_units: [SRC-101, SRC-102]
canonical_route: /statistics/confidence-intervals
audience: intermediate_analyst
language: en
primary_concept: confidence_interval
prerequisites: [sampling_distribution, standard_error]
learning_objectives:
  - "Interpret a confidence-interval procedure in repeated sampling."
common_misconceptions:
  - "An observed 95% frequentist interval has a 95% probability of containing the fixed parameter."
representation_plan:
  - concept: repeated_sampling_coverage
    form: uncertainty
    experience: interval_simulation
    library: echarts
    data_provenance: simulation
    static_fallback: annotated_static_svg_and_text
interactions:
  - controls: [sample_size, confidence_level, simulate]
    reset: true
assessments:
  - question_id: CI-001
references: ["source_ref_or_url"]
validation_status: not_started
```

See `CONTENT_BRIEF_TEMPLATE.yaml` for a reusable blank contract. **Treat this as a proposed design record, not content verified in an existing Hansa page.**

## 29. Scoring rubric: evaluate actual outcomes, not decoration

Rate each item from 0–5 with supporting evidence. Score as `sum(weight × score/5)`.

| Dimension | Weight | 5 / 5 means… |
|---|---:|---|
| Content fidelity and domain accuracy | **30** | All source units accounted for; precise examples, math and references; no invented facts |
| Explanation / representation fit | **20** | Visual format directly supports the learner's question; static vs interactive choice justified |
| Interaction design and cognitive clarity | **15** | Real meaningful controls, feedback/reset, progressive disclosure, usable navigation |
| Accessibility and mobile | **15** | Keyboard, reduced motion, semantic information, alternatives and responsive behaviors tested |
| Performance and reliability | **10** | Static build works; core web experiences remain fast; dependencies deliberate |
| Maintainability and handoff | **10** | Reusable components, provenance, clear implementation notes, no unnecessary duplication |
| **Total** | **100** | |

**Suggested release policy:** ≥85/100 and **zero critical blockers**. High weighted score **never** overrides any of these blockers: incorrect formula/answer, lost source material, inaccessible core functionality, unsafe execution, broken static export, hidden paid dependency or disclosed-as-real fabricated data. Rubric is a Hansa project policy proposal, not an external certification.

## 30. Verification test matrix

| Class | Minimum test | Evidence expected |
|---|---|---|
| Source completeness | Source file/subpage counts and explicit mapping | Ledger diff |
| Content correctness | Sample every concept, check all formulas and material claims | Source pointers, computed assertions |
| UI behavior | Change each visible control and observe dependent state | Interaction test / notes |
| Data fidelity | Recompute chart outputs from input data independently | Small fixture, expected values |
| A11y | Keyboard, focus, labels, text equivalents, reduced motion | Manual findings + automated checks |
| Mobile | Narrow portrait, wide, landscape; touch | Screenshots or documented checks |
| Themes | Light/dark, legends, emphasis, contrast | Screenshots/checks |
| Static export | Clean build and resulting route assets | Command exit status / paths |
| Integration | Existing nav/routes/search/old features continue | Regression checks |
| Privacy/cost | No new paid service or unapproved external data transfer | Dependency/service list |
| Performance | Before/after page size or relevant CWV/Lighthouse measurements | Report and device/test assumptions |
| Handoff | One agent can find what changed and why | Implementation report |

Never write `PASS` for a test not run. Use `PASS`, `FAIL`, `NOT RUN`, or `BLOCKED` with evidence.

## 31. Failure patterns to detect automatically

- **UI first/content second:** lots of visual widgets with little conceptual explanation.
- **Duplicate components:** new libraries introduced for controls already in project/beUI.
- **Chart theater:** compelling animated visual with fabricated or semantically invalid numbers.
- **Dead controls:** sliders/tabs do not alter the expected representation or explanatory result.
- **Incorrect pedagogy:** output shown without derivation; no misconception addressed.
- **Source evaporation:** nested Notion subpages, tables, captions, or citations missing after import.
- **Fake code execution:** static output labeled as actual runtime result; wrong language engine.
- **SSR breakage:** browser API used during static prerender; builds fail or hydrate inconsistently.
- **A11y exclusion:** essential teaching available only through drag, hover, color or fast animation.
- **Performance regression:** huge global chart bundles because of one component.
- **Vendor leakage:** Pro blocks, credentials or third-party bundlers introduced without approval.
- **Unverifiable completion:** agent claims finished without checking production route/build/source mapping.

---

# Part VIII — Worked selection examples

## 32. Case A — A Notion chapter explains normal distribution

**Source:** prose definitions of normality, mean, standard deviation, density formula, and examples; no empirical dataset.

1. Preserve precise definitions and assumptions. Present symbolic formula with KaTeX.
2. Create a **clearly synthetic mathematical model** with `μ` and `σ` controls. Use Mafs or a small SVG if that better fits existing dependencies.
3. Draw a density curve, not a labeled count histogram. Show that the y-axis is density; shaded probability equals area under the curve.
4. Provide mathematical/computed values, a textual explanation, a reset and keyboard-operable controls.
5. Add “not all observed data are normally distributed” and an assessment comparing changes to the mean versus the spread.
6. Use beUI tabs/cards to frame “definition / experiment / interpretation”, but not as the math engine.
7. Validate `σ > 0`, numerical integration behavior, bounds, rounding and whether probability claims match the model.

**Rejected:** ECharts KPI gauge, decorative WebGL bell curve, actual-world frequency claims with no data.

## 33. Case B — A Notion chapter explains good data storytelling

**Source:** narrative techniques, audience intent, chart annotation practices; optionally accompanied by a factual case dataset.

1. Split **storytelling methodology** from **storytelling demonstration**.
2. For methodology, offer a readable reference matrix and before/after annotated examples; no Scrollama required.
3. For a source-backed multi-step story, storyboard evidence beats and display a consistent annotated chart state across beats.
4. If Scrollama is used, include next/previous step controls, no scroll-jacking, no lost narrative in reduced-motion mode.
5. If no fact-backed case data exist, use synthetic examples explicitly labeled as fictional, not fabricated real business case outcomes.
6. Test whether the final insight and recommended action are supported rather than emotionally asserted.

**Rejected:** scroll animation on every heading, graphs merely to fill space, causal claims unsupported by evidence.

## 34. Case C — A Microsoft Fabric module compares Shortcut and Mirroring

**Source:** product definitions, workflow scenarios, architecture explanations and limits.

1. Verify current official Microsoft Fabric documentation because capabilities evolve.
2. Create a concise side-by-side capability matrix with source links.
3. Use an architecture sketch: upstream system, OneLake representation, consumers, data movement/reference behavior. Distinguish storage and compute explicitly.
4. Include interactive scenarios asking about freshness, source of truth, data residency, connector support, permissions and operational burden.
5. A **static Mermaid diagram** may suffice for conceptual overview; use React Flow only if tracing, rearranging or inspecting flows helps learning.
6. Evaluate learner choices with both the preferred outcome **and its assumptions**; do not assert a universal winner.

**Rejected:** animated arrows implying physical data replication where there is none; a fabricated performance benchmark.

## 35. Case D — Teaching a Power BI/DAX filter context measure

1. Display tiny model: `FactSales`, `DimDate`, `DimProduct` with cardinalities and relationship directions.
2. Provide table data and a simple base measure.
3. Show filter context entering a measure and identify affected rows before evaluating the result.
4. Toggle a filter and show recomputed answer; explain why `KEEPFILTERS` intersects rather than replacing filters under relevant `CALCULATE` usage.
5. Use a node diagram only if it clarifies propagation; a table or step trace may be simpler.
6. Do not claim an in-browser JavaScript calculation proves execution on the DAX engine; if simulated, label it as a conceptual evaluator.
7. Verify official syntax and context behavior before grading an answer.

**Rejected:** a React playground labeled `Run DAX` that merely returns a hardcoded number.

---

# Part IX — Copyable operating prompts and handoff format

## 36. Primary instruction for any new AI agent

Copy this **in addition to** placing `AGENTS.md` and this reference file in the repository:

```text
You are working on Hansa, a content-first educational data/analytics website.

Before modifying code, read AGENTS.md, HANSA_MASTER_AGENT_REFERENCE_v1.0.md,
and CONTENT_BRIEF_TEMPLATE.yaml completely.

Inspect the actual project, source exports, existing UI, documentation, app configuration,
package versions, routes and baseline tests. Do not assert that any source page or runtime
capability exists unless inspected.

For each target page:
1. Inventory every source unit and preserve its evidence.
2. Define audience, concept, prerequisite, misconception and observable learning objectives.
3. Classify knowledge forms and choose the simplest correct explanatory representation.
4. Reuse local and free beUI components before proposing a distinct specialist library.
5. Justify every interaction and ensure controls drive correct derived results.
6. Keep mathematical and domain statements accurate; label synthetic data clearly.
7. Honor static-export, free-only, a11y, RTL and performance constraints.
8. Implement incrementally; validate sources, behavior, build and page completeness.
9. Deliver a test-evidenced report with source coverage, changed files, costs/services,
   unresolved risks, and next recommended work.

Do not redesign the whole site or delete content for visual consistency. Do not install
paid Pro components, invent statistics, fake query execution, or claim tests you did not run.
Proceed without unnecessary approval checkpoints; if source access is blocked, preserve
current functionality and clearly scope work to what can actually be verified.
```

## 37. Standard agent handoff report

```markdown
# Hansa Implementation Handoff — [date / task]

## Mission & scope
- Requested pages/features:
- Baseline reference/commit:
- Source export location(s):

## What was inspected (verified, not inferred)
- Project config and versions:
- Routes, existing shared components, source units:

## Content & experience decisions
| source_id | page/section | learning objective | representation | library | reason |
|---|---|---|---|---|---|

## Changes made
| file | summary | risk |
|---|---|---|

## Coverage
- Source units found:
- Units mapped:
- Units fully verified:
- Missing/uncertain:

## Quality and checks
| check | PASS/FAIL/NOT RUN/BLOCKED | evidence |
|---|---|---|

## Dependencies and external services
- Added packages + exact versions:
- License review:
- External network/service exposure and cost:

## Known issues, follow-up, and rollback
- Unresolved items:
- Next atomic task:
- How to undo/revert safely:
```

## 38. Agent memory: what to retain for the next session

Persist **only project knowledge**, such as:
- Site structure, routes, content relationships and source inventories.
- Decisions made and alternatives rejected (with reasons).
- Verified version/compatibility notes and docs checked.
- Specialized components already installed and their semantic purposes.
- Bugs/tests/quality outcomes and risk status.
- Unresolved source discrepancies and dependencies.

Do **not** store personal secrets, API keys, private user data or unneeded identifiers in agent context, prompts, repositories, logs or exported content. Prefer compact manifest files over repeated freeform chat summaries.

---

# Part X — Sources, validation and guide maintenance

## 39. Official/reference links (checked 2026-10-24)

**Primary implementation documentation**
- beUI Home and public catalog — https://beui.dev/
- beUI for AI Agents / live registry & MCP — https://beui.dev/docs/ai-agents
- Next.js App Router static export — https://nextjs.org/docs/app/guides/static-exports
- Next.js lazy loading — https://nextjs.org/docs/app/guides/lazy-loading
- Apache ECharts features — https://echarts.apache.org/en/feature.html
- Apache ECharts chart accessibility — https://echarts.apache.org/handbook/en/best-practices/aria/
- Mafs interactive math — https://mafs.dev/
- Mafs movable points and keyboard — https://mafs.dev/guides/interaction/movable-points
- React Flow documentation — https://reactflow.dev/learn
- Scrollama repository — https://github.com/russellsamora/scrollama
- Perspective interactive analytics — https://perspective-dev.github.io/
- Sandpack documentation — https://sandpack.codesandbox.io/docs
- Sandpack bundler hosting/trust boundaries — https://sandpack.codesandbox.io/docs/guides/hosting-the-bundler
- Mermaid documentation — https://mermaid.js.org/intro/
- Mermaid security levels — https://mermaid.js.org/config/schema-docs/config-properties-securitylevel.html
- KaTeX — https://katex.org/
- Rough Notation — https://roughnotation.com/
- React Three Fiber documentation — https://r3f.docs.pmnd.rs/

**Standards and experience targets**
- W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/
- MDN prefers-reduced-motion — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- Google Core Web Vitals — https://developers.google.com/search/docs/appearance/core-web-vitals

**Domain verification (when appropriate)**
- Microsoft Fabric Learn hub — https://learn.microsoft.com/en-us/fabric/
- Microsoft DAX documentation — https://learn.microsoft.com/en-us/dax/
- PostgreSQL documentation — https://www.postgresql.org/docs/

External docs can change. The agent must check docs at implementation time and must not treat these links as a complete version-locked bill of materials.

## 40. Guide maintenance and changelog policy

Update the guide when the site architecture, source domains, hosting rules, accessibility bar or supported UI ecosystem changes. For every update record:

```markdown
### YYYY-MM-DD — version
- Decision/change:
- Why:
- Source / evidence:
- What older agents must change:
- Compatibility / migration impact:
```

Do not merge speculative designs into verified project facts. Keep the source catalog and reusable component registry close to the codebase, rather than allowing a prompt to become stale.

### Current known limitations of this edition

- No local Hansa repository or complete Notion HTML exports were attached to this request; current pages, folder paths, actual dependency versions and data assets were **not audited** for this document.
- The previously reported live Hansa site could not be reliably fetched by the public browse used here; this guide is an architectural/content reference, **not** a visual or functional audit of the deployed website.
- Capability and licensing notes are broad selection guidance, not a license/legal audit of every transitive dependency or an assertion that every integration was installed and tested.
- Examples are **design proposals**. Their correctness must be tested against actual source content and implementation.

---

## Final principle

**Hansa succeeds when the reader moves from “I saw it” to “I understand it, can test it, can explain it, and know what decision it informs.”** The agent's primary job is to protect that transition; libraries and motion are supporting instruments.

## 41. Notion HTML export intake — practical preservation checklist

When the original material arrives as a locally exported Notion page and its nested pages, treat the export as an evidence package, **not as a layout template to copy blindly**.

### Inventory pass

- Traverse all relevant directories **recursively**; enumerate every `.html` file and referenced asset.
- Record relative path, document title, heading structure, source links and cryptographic hash if practical.
- Follow local page links to discover nested subpages and detect broken references.
- Count total source pages, headings, paragraphs, tables, code blocks, formulas, diagrams, images, downloadable files and cited URLs as practical.
- Preserve original export files unmodified. Keep a manifest of source revision and extraction date.

### Semantic extraction pass

Extract and preserve the meaning of:
- Headings and hierarchy; paragraphs, bullet/numbered/task lists, quotes and callouts.
- Tables, merged cells where meaningful, captions, footnotes and references.
- Code blocks with language tags and their surrounding interpretation.
- Mathematical notation (LaTeX, images of math, rendered HTML); verify signs and symbols.
- Image captions, image context and embedded media; add descriptive alternative text in the new site without fabricating image content.
- Toggles and hidden sections; do not lose content because it was collapsed in the original.
- All subpages and cross-links; turn them into purposeful navigation with route parity.

### Transformation pass

- Convert presentation markup to stable structured content; avoid carrying over brittle Notion classes, inline styles and layout artifacts.
- Choose target page splits based on learning units and navigational coherence, not export file count alone.
- Keep a mapping from original file/anchor to target route/anchor.
- Detect verbatim duplicates and near-duplicates, **but do not delete meaningful repetitions without checking** whether they serve different learning objectives or prerequisites.
- If merging repeated definitions, keep one canonical explanation and explicit cross-links from related contexts; preserve original source references.
- Evaluate every opportunity for an infographic/chart through the content ontology. **Lack of visuals in the source is permission to design explanatory visuals, not permission to invent factual data.**

### Reconciliation pass

Create counts by source and by target; sample deeply across the full hierarchy, not just the first-level overview. Record `found`, `transformed`, `linked`, `quality_checked`, `missing`, and `rejected-with-reason` statuses. Reject a “complete import” label while any source units are unaccounted for.

## 42. Token-efficient use by multiple agents

The master reference is intentionally comprehensive. **Do not paste or reread its entire contents into every small task** when persistent project files remain available.

- **Initial onboarding/new model:** read `AGENTS.md`, this master guide, the actual repository/source audit and task-specific source pages.
- **Focused edit after onboarding:** reread `AGENTS.md`, the target `CONTENT_BRIEF_TEMPLATE.yaml` instance, the relevant master sections, current files and affected tests.
- **Component selection:** consult sections 5–10, actual local components, and current official beUI registry, then only the selected specialist tool's docs.
- **Statistics:** sections 12, 17–19, 23–24 and 29–30.
- **Data Storytelling:** sections 13, 17–18, 23–24 and 29–30.
- **Microsoft Fabric / DP-600:** sections 14–15, 17–19, 25 and 29–30, plus authoritative up-to-date Microsoft Learn sources.
- **Exporting Notion content:** sections 3–4, 27–28 and 41, plus every relevant nested export.
- **Technical QA/release:** sections 21–31 and the actual tests/build configuration.

For handoffs, pass references to persistent files, source IDs and concise verified findings, **not long rewritten copies** of all material. Re-read this whole document when its version changes materially or when the task crosses multiple domains. No token-saving shortcut may waive source verification or critical QA.
