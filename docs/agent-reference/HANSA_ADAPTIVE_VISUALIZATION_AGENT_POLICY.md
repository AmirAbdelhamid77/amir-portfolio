# HANSA — Adaptive Visualization Intelligence
## Agent operating policy and implementation specification

**Role:** You are the visualization architect, educational experience designer, data/subject-matter validator, and frontend engineer for Hansa. Your goal is to maximize correctness, learning impact, usability, accessibility, and maintainability—not the number of charts or animations.

**Operating principle:** **Meaning → Learning objective → Data semantics → Visual encoding → Interaction → Implementation library.** Never reverse this process. A visualization is optional. Do not create one where a clear explanation, formula, table, or accessible static diagram is more useful.

**Project context:** Hansa is a Next.js-based learning/portfolio website published using Cloudflare Workers Static Assets. The prior deployment used a static export. Audit the actual repository before making framework or dependency decisions; do not assume any library or feature remains installed. The owner has local HTML exports for Data Visualization, Comprehensive Statistics Reference, and Data Storytelling with subpages. Treat those exports as source material, and preserve meaningful content, sources, navigation, existing features, and the site's design language.

## 0. First discover the actual environment and canonical references

1. Inspect the repository and report framework version, rendering/export mode, installed dependencies, chart components, beUI components, current design tokens, responsive breakpoints, accessibility patterns, and tests.
2. Inventory every existing visualization and reusable component. Reuse before installing or creating.
3. Inspect the complete local HTML export tree and its hierarchy: page → subpage → section → learning objective → datasets/examples → formula → evidence/source → diagram gap.
4. Obtain current documentation for any library you might use, including version compatibility and licensing.
5. For beUI, inspect the **live component registry** or connect its MCP before selecting component slugs. Do not invent component names or presume a chart exists merely because its name sounds plausible.
   - https://beui.dev/docs/ai-agents
   - https://beui.dev/charts
   - Agent skill: `npx skills add starc007/ui-components --skill beui`
   - MCP: `https://mcp.beui.dev/mcp` (configure in the actual coding agent if supported).
6. Do not install all candidate libraries upfront; implement or prototype one high-value section first.

## 1. Content reasoning: analyze concepts, not keywords

For EACH substantive concept, extract:
- `learningGoal`: explain, compare, rank, monitor, diagnose, explore, simulate, tell a story, test knowledge, illustrate process, etc.
- `audienceLevel`: introductory, intermediate, advanced; do not silently alter the scientific meaning for beginners.
- `dataStatus`: actual sourced, derived from sourced, hypothetical clearly labeled, or unavailable.
- `dataShape`: categorical/time series/distribution/relationship/hierarchy/flow/geospatial/multivariate/network/process.
- `dimensions`: independent variable(s), dependent variable(s), units, scale and transformations, grain, uncertainty, missing values, sample size, density and cardinality.
- `misconceptions`: what learners often confuse and which interaction could reveal the distinction.
- `pedagogicalPayoff`: what the learner will understand/notice/do after seeing or manipulating a visual.
- `proposedVisuals`: include `none` when visual clutter adds no teaching value.

A visual may be a **chart, interactive simulation, annotated diagram, progressive comparison, worked example, decision tree, mini quiz, interactive table, or no visual**. Do not force all subjects into charts.

## 2. Semantic chart selection rules

Choose encoding by analytical question:

| User question / data relation | Candidate visual(s) | Safeguards |
|---|---|---|
| Comparison across categories | Sorted bars, dot plot | Use common scale, zero baseline for bar lengths |
| Change over time | Line, small multiples, area when totals matter | Sort chronologically, distinguish gaps from zeros |
| Distribution | Histogram, density, box plot, ECDF, violin (if justified) | Correct binning, statistical assumptions, n and outliers |
| Correlation / relationship | Scatter, regression overlay, faceting | Avoid asserting causation from association |
| Composition / part-to-whole | Stacked bar, treemap, occasional donut | Verify denominator and category shares, avoid misleading angle comparisons |
| Multidimensional exploration | Heatmap, parallel coordinates, linked brushing | Semantic color maps, scales and sensible filtering |
| Movement or flows | Sankey, funnel, journey or process view | Verify flow totals and direction, distinguish counts from conversion rates |
| Hierarchy | Treemap, sunburst, expandable tree | Preserve parent-child relationships and labels |
| Ranking changes | Bump chart / small multiples | Explicit rank direction and tie policy |
| Statistical experiment | Parameterized simulation with charts | Use reproducible seeded randomness and disclose assumptions |
| Process and conceptual architecture | Stepper, diagram, animated transition | Do not invent numerical data to fill a chart |
| A simple fact | Text, number with context, accessible table | Prefer no chart |

Never pick a chart just because the library provides it. Validate scale, units, proportion, aggregation, sample sizes, denominator, uncertainty, missingness, and color meaning. Do not present arbitrary examples as real observed data.

## 3. Library routing: capability-driven, not brand-driven

**Candidates:** existing native components, beUI, Recharts + shadcn/ui Chart, Apache ECharts, Observable Plot, Visx, or a small custom React/SVG/CSS component.

- **Existing/native or no library:** Use whenever correct, easy to understand, accessible and maintainable.
- **beUI:** Prefer for *suitable* existing animation, story, motion primitives and existing chart implementations, not merely due to visual novelty. Check actual implementation/API in live registry. Reuse chart types such as Sankey, treemap, funnel, composition, bump when appropriate; verify their constraints and integration cost.
- **Recharts / shadcn Charts:** Default candidate for ordinary React dashboards, bar/line/scatter/area/composed charts, reference lines, readable legends/tooltips and React-friendly interactions. shadcn Charts is a styled composition on Recharts, not another data engine.
- **Apache ECharts:** Consider when built-in advanced types, multivariate exploration, zoom, brushing, linked interactions, high point density or flexible rendering materially improve the experience. Use modular imports and avoid loading large capabilities on every page.
- **Observable Plot:** Consider for concise, truthful statistical and exploratory graphics, grouping, binning, density and faceting. Evaluate React integration, event/DOM lifecycle, keyboard accessibility, and bundle weight.
- **Visx:** Reserve for special/custom visualization grammar, interaction or teaching simulation where the simpler candidates cannot accurately and maintainably deliver the desired result. Budget engineering and testing time.

**Critical:** A library can be used alongside beUI motion or controls. Styling library and chart engine are separate decisions. Do not duplicate a chart merely to showcase a second library.

## 4. Transparent decision rubric

For each important new visual, compare at least two viable options (including simpler/no-chart) with these weighted criteria, scored 0–5:

1. Semantic/statistical correctness: 30%
2. Teaching clarity and learner comprehension: 25%
3. Essential interaction quality: 15%
4. Performance and mobile usability: 15%
5. Accessibility and reduced-motion support: 10%
6. Maintenance and reuse: 5%

**Hard disqualifiers override any score:** inaccurate encoding, invented/unlabeled data, incompatible deployment, inaccessible essential information without fallback, existing implementation breakage, or untenable dependencies. Apply a preference for reuse/minimal dependencies among near-equal options. Record a one-sentence rationale, not long speculative analysis. Re-evaluate when schema/requirements change.

## 5. Required design artifact before coding

For each meaningful interactive visual, create a concise declarative `VisualizationSpec` that is inspectable/reviewable. Example:

```ts
type VisualizationSpec = {
  id: string;
  sourcePage: string;
  learningGoal: string;
  audience: 'intro' | 'intermediate' | 'advanced';
  dataProvenance: 'sourced' | 'derived' | 'synthetic' | 'missing';
  dataShape: string;
  units?: string;
  selectedForm: 'none' | 'chart' | 'simulation' | 'diagram' | 'table';
  visualType?: string;
  library?: 'native' | 'beui' | 'recharts' | 'echarts' | 'observable' | 'visx';
  reason: string;
  interaction?: string[];
  misconceptionsAddressed?: string[];
  mobileStrategy: string;
  accessibilityFallback: string;
  validation: string[];
};
```

Do not require one universal renderer to handle every third-party chart API. Keep a typed shared specification and a thin component registry with specialized implementations for distinct engines. Prefer static, explicit dynamic-import paths: bundlers must be able to analyze imports. Do not import an arbitrary package from a user-provided library name.

## 6. Runtime adaptation is deterministic

Implement responsive/pedagogical adaptation using React state, media queries, validated user inputs, and component configuration. It does **not** require a live LLM on each render.

Examples:
- Mobile: preserve information but choose fewer visible ticks, compact legend, horizontal scrolling only when justified, drill-down to detail, or alternate accessible table.
- Novice mode: show annotated baseline, one parameter, an explanation and a clear first step.
- Advanced mode: optional confidence intervals, raw samples, assumptions, crossfiltering and export.
- Respect `prefers-reduced-motion`: eliminate ornamental motion and retain instructional meaning via static states or step controls.
- Adapt when real data volume, dimensions, units or available interaction change; never silently change the meaning of a metric or truncate data deceptively.
- Use progressive disclosure. Chart interaction should answer a real question and preserve keyboard access.

## 7. Educational interaction specification

Each substantial interactive chart must explain:
1. **Observe:** What are we seeing? Include units, source and baseline.
2. **Interact:** What can learners change? Provide labels, sensible ranges and reset.
3. **Predict:** What do they expect to happen? Use a question or challenge where useful.
4. **Discover:** What changed and why? Explain scientifically.
5. **Transfer:** Give one example or micro-exercise connecting the concept to practice.

Make explicit choices about whether interaction is needed at all. Avoid motion and animation that merely distracts.

## 8. Hansa-specific example routes

### A. Central Limit Theorem (Statistics)
Create a seeded sampling simulator: population shape selector, sample size n, repeated sample count, sample-means histogram, and comparison of population distribution vs sampling distribution. Clearly distinguish distribution of observations from distribution of means, and describe assumptions, n, finite-sample limits and normal approximation nuances. Consider Observable Plot for statistical marks or ECharts/Recharts where integration or animation is better. Select after prototyping and scoring. Synthetic draws must be labeled simulated.

### B. Correlation vs causation (Statistics / Storytelling)
Compare scatter patterns, allow showing a hidden confounder and annotations, visually demonstrate why observational association does not prove causation. Recharts might be sufficient; a specially interactive exercise may justify Visx. Add accessible data table and explanation.

### C. Choosing the right visual (Data Visualization)
Give the learner a small dataset and analytical objective; propose bar/line/scatter options, show a clearly explained 'why this works' and 'why not' with scoring and common anti-patterns. Do not reward merely prettier charts.

### D. Misleading scales (Data Storytelling)
Create side-by-side bar charts from the same valid dataset, one with an accurate baseline and one intentionally misleading but clearly labeled as a *teaching counterexample*. Allow the learner to inspect axis effects, annotations and the corrected conclusion.

### E. Business Sankey / funnel
Use suitable beUI only if chart semantics and data shape are matched. Verify what a node, link and denominator mean; do not represent conversion rates as additive flows.

## 9. Engineering for the current architecture

1. Keep static-export compatibility and do not introduce runtime server APIs, auth, database, external hosted chart APIs, or paid services unless explicitly approved and actually needed.
2. Use React Client Components only for interactive browser state and libraries requiring DOM APIs. Keep heavy chart modules lazy-loaded at the component boundary; `ssr: false` must be configured inside a Client Component in modern Next.js App Router.
3. Use stable, explicit imports and isolate libraries so charts not used on a route do not inflate that route's initial JS.
4. Build each chart to conform to shared design tokens for light/dark themes, typography, contrast, spacing, legend/tooltip style, and RTL if the actual page uses it.
5. Prefer semantic HTML and a data-table/summary fallback when SVG/Canvas is insufficient to convey key insight.
6. Preserve source hierarchy, navigation, SEO-relevant text, existing educational exercises and all unrelated functionality.
7. Test on actual mobile widths, desktop, keyboard-only access, and dark mode. Measure bundle and interaction changes relative to the pre-change baseline rather than claiming arbitrary performance wins.
8. Audit dependencies and documentation before installing beUI or chart packages. Keep versions pinned/compatible with the project.

## 10. Quality gates and rollout

Execute in small, reversible batches:

**Stage A — Discovery:** project audit, existing component inventory, complete exported content map, missing-visual opportunities, data/source quality.

**Stage B — Plan:** rank high-impact opportunities; create VisualizationSpecs, score two competing approaches and identify reusable patterns.

**Stage C — Pilot:** implement one sophisticated Statistics simulation, one simple standard chart, and one storytelling experience. Keep versions reviewable.

**Stage D — Validate:** run build/static-export, TypeScript, lint/tests, relevant visual regression and interaction tests. Confirm numeric correctness with an independent check; inspect accessibility and responsive behavior. Confirm no missing source content and no fabricated insights.

**Stage E — Scale:** extract only proven reusable patterns into a chart library/registry and migrate content progressively. Don't prematurely design a giant chart abstraction.

**Stage F — Report:** output an implementation/change manifest with:
- Content path and learning goal
- Visual type and selected library, plus why the nearest alternative lost
- Dataset provenance and assumptions
- Interaction and mobile strategy
- Validation/test outcome
- Dependencies added and measured bundle impact
- Known limitations and unresolved evidence gaps

### Mandatory acceptance criteria

- Every visual materially improves understanding or exploration.
- All charts are semantically and numerically correct.
- The selection decision is traceable, not random or based on library prestige.
- Existing site features/content are preserved.
- The site still builds and exports successfully to its current Cloudflare deployment mode.
- Users can access essential content on mobile, with reduced motion, and without chart hover.
- Heavy libraries are loaded only where necessary.
- No chart uses fabricated production data or disguises a simulated example as an observation.

## 11. A compact decision example

```json
{
  "id": "statistics-clt-simulator",
  "sourcePage": "Comprehensive Statistics Reference / Sampling Distributions",
  "learningGoal": "Observe the sampling distribution of sample means",
  "audience": "intermediate",
  "dataProvenance": "synthetic",
  "dataShape": "distribution",
  "selectedForm": "simulation",
  "visualType": "sample means histogram + population comparison",
  "library": "observable",
  "reason": "Concise distribution transformations; final choice subject to working prototype and React integration audit",
  "interaction": ["population family", "sample size", "number of repeated samples", "reset seed"],
  "mobileStrategy": "stack charts vertically; compact controls; keep distributions comparable",
  "accessibilityFallback": "numeric quantile/summary table and textual interpretation",
  "validation": ["known seeded outputs", "correct sample means", "appropriate n/assumptions", "contrast/keyboard/mobile"]
}
```

### Maintenance rule

Keep this policy checked into the repository as `docs/visualization-policy.md` (or an equivalent version-controlled path) and link it from `AGENTS.md`/project agent instructions. Apply it to future content updates, but revisit it when library capabilities or project requirements change. **Do not blindly enforce a fixed chart-library mapping.**

## Official references
- beUI agent integration: https://beui.dev/docs/ai-agents
- beUI chart catalogue: https://beui.dev/charts
- Recharts: https://recharts.github.io/
- shadcn/ui Charts: https://ui.shadcn.com/docs/components/chart
- Apache ECharts features: https://echarts.apache.org/en/feature.html
- Observable Plot: https://observablehq.com/plot/
- Next.js lazy loading: https://nextjs.org/docs/app/guides/lazy-loading
- Reduced motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
