# Hansa EasyUI v2 — Verified Component Fit Matrix

**Scope:** verified publicly documented capabilities vs current beUI. Fit scores are judgement calls, not benchmarks. The complete codebase is NOT inspected.

**Priority philosophy:** inspect actual Hansa local implementations before installation, prefer reuse, and only add components that solve identifiable educational/user tasks.

| Component | Decision | Fit / 10 | Unique task for Hansa | Comparison / guardrail |
|---|---|---:|---|---|
| [Dependency Trace](https://easyui.site/components/dependency-trace) | adopt-pilot | 9 | Knowledge Atlas micrograph; Fabric lineage | beUI has no equivalent semantic node/edge trace; **caution:** Manually positioned nodes. Large Atlas requires dedicated graph engine; do not conflate semantic vs structural edges |
| [Smart Comparison](https://easyui.site/components/smart-comparison) | adopt-pilot | 9 | Fabric choices Mirroring vs Shortcut; SQL Warehouse vs Lakehouse | No directly equivalent searchable differences-only matrix in free beUI; **caution:** SaaS pricing layout must be restyled to educational decision matrix |
| [Code Snippet Deck](https://easyui.site/components/code-snippet-deck) | adopt-pilot | 9 | SQL, DAX, PySpark, T-SQL snippets and parameterized code examples | beUI Code Block is optimized for display; snippet deck supports parameter-driven variants; **caution:** Adapt original API runtime switching to educational syntax; never claim executable editor |
| [Product Tour](https://easyui.site/components/product-tour) | adopt-pilot | 8 | First-run learning lab/Atlas discovery | beUI general popover/modal lacks ready guided spotlight-target sequence; **caution:** Skippable, user-invoked, target existence guards, keyboard/touch and focus return |
| [Scroll Progress Navigation](https://easyui.site/components/scroll-progress-navigation) | adopt-pilot | 8 | Long statistics / Fabric / storytelling chapters | beUI Scroll Animation has progress indication, but not necessarily section-linked floating TOC; **caution:** Only on long docs; accessibility and sticky offsets |
| [Activity Heatmap](https://easyui.site/components/activity-heatmap) | conditional | 8 | Hour-of-week learning usage; GitHub-style calendar | beUI Heat Calendar covers daily heatmap, not weekday-by-hour grid; **caution:** Use EasyUI only for hourly mode or distinct API fit; never invent learning data |
| [Stepper](https://easyui.site/components/stepper) | conditional | 8 | Guided ingestion decision lab and learning step panels | beUI has adaptive numeric stepper; this is multi-stage workflow indicator; **caution:** Reuse existing learning wizard if any; not assessment/state engine |
| [Focus Mode](https://easyui.site/components/focus-mode) | conditional | 7 | Isolate a concept card/diagram when studying | beUI modal/drawer are alternatives but not spotlight dimming of selected area; **caution:** Avoid trapping hidden content; preserve focus and screen-reader clarity |
| [Activity Feed](https://easyui.site/components/activity-feed) | conditional | 7 | Delta Lake event history; Fabric processing demo log | beUI Agent Activity covers agent-oriented activity, not necessarily general categorized logs; **caution:** Use genuine events or label simulation, disable auto fake stream by default |
| [Live Line Chart](https://easyui.site/components/live-line-chart) | conditional | 7 | Streaming and real-time analytics simulator | beUI is chart-rich but this is specifically streaming with pause/scrub; **caution:** Client simulation not actual live data; end subscriptions on unmount |
| [Interactive Area Chart](https://easyui.site/components/interactive-area-chart) | conditional | 6 | Change time horizon with smooth data morphing | beUI Composition Chart handles stacked share; not same transition goal; **caution:** Meaningful domain and units, accessible table |
| [Advanced Data Table](https://easyui.site/components/advanced-data-table) | evaluate-parity | 6 | Question bank browsing, QA registers, evidence lists | beUI free virtualized Table: sort/select/resize/reorder; EasyUI faceted filters, bulk actions, pagination; **caution:** Only if real gaps not solved by local table; check 1000+ rows and data model |
| [Selection Basket](https://easyui.site/components/selection-basket) | optional | 6 | Multi-select concepts or questions for compare queue | Can be achieved in existing tables and beUI action bars; **caution:** Only if multi-select compare is a proven learner task |
| [Expandable Data Row](https://easyui.site/components/expandable-data-row) | optional | 5 | Evidence/provenance row details | EasyUI Advanced Data Table has renderSubComponent and beUI rows can be adapted; **caution:** Avoid duplicative nested expandable UX |
| [Metric HUD](https://easyui.site/components/metric-hud) | optional | 5 | Time-window drill-down telemetry cards | beUI stats/metric cards already exist; **caution:** Adopt only if its time-range + scrub behavior matters |
| [Density Lens](https://easyui.site/components/density-lens) | experimental | 4 | Magnified details of high-density diagrams | Other zoom/detail-on-demand patterns usually work better on mobile; **caution:** Pointer-dependent; alternative touch & keyboard, avoid essential data only in lens |
| [Interactive Timeline](https://easyui.site/components/interactive-timeline) | prefer-beui | 3 | DevOps milestones only | beUI draggable Timeline already available; **caution:** Retain beUI except exact status telemetry requirements |
| [AI Agent Activity](https://easyui.site/components/ai-agent-activity) | prefer-beui | 2 | Agent trace displays | beUI Agent Activity already available; **caution:** Avoid duplication |
| [Stat Card](https://easyui.site/components/stat-card) | prefer-beui | 2 | KPI overview | beUI free/pro and existing KPIs; **caution:** Avoid duplication |
| [Donut/Bar/Funnel Chart](https://easyui.site/components/donut-chart) | prefer-beui | 2 | Standard charts | beUI already has chart family incl Funnel / composition; **caution:** Do not add chart merely for animation |
| [Sticky Pages](https://easyui.site/components/sticky-pages) | design-experiment | 4 | Immersive visual narrative; future landing redesign | beUI has Scroll Animation, but not equivalent CSS stacking mechanism; **caution:** Use only deliberate storytelling surfaces; no global scroll trap |
| [Recovery Ledger](https://easyui.site/components/recovery-ledger) | defer | 4 | Version/snapshot inspection | Custom logic required, similar to timeline; **caution:** Dangerous rollback affordance; read-only unless real backend and explicit permissions |

## Crucial Atlas design correction
- The EasyUI Dependency Trace accepts nodes with x/y, links, selection and hover callbacks. It is a **small manually laid-out graph presentation**, not a semantic graph layout/Atlas architecture.
- Use it in restricted topic sketches / lineage mini-demos. For a complete Knowledge Atlas, independently evaluate [React Flow / XYFlow](https://reactflow.dev/) (or another dedicated graph engine), explicit semantic edge types, clustering, filter/search, zoom/pan, impact tracing, and accessible outline/list view.
- Knowledge relations must be explicit and evidence backed, **not inferred from folder hierarchy**.

## Key corrections since v1
- **Advanced Data Table:** downgrade from P0 to parity test; beUI already supplies a virtualized high-performance Table.
- **Activity Heatmap:** beUI already has Heat Calendar; use EasyUI specifically for weekday-by-hour mode or proven need.
- **Interactive Timeline:** prefer beUI Timeline; EasyUI variant particularly suits build/deploy status.
- **Agent Activity:** beUI already has direct equivalent.
- **Density Lens:** downgrade; pointer-heavy approach needs a robust alternative and clear value.
- **New pilot:** Code Snippet Deck for Fabric/SQL/DAX/Python; new conditional Stepper and Activity Feed.
- **Corrected package root:** v2 ZIP places docs directly at `docs/...` instead of accidentally nesting files under `hansa_easyui_pack/...`.

## What we deliberately are NOT adding now
- All 131 EasyUI components, entire chart family, decorative shaders, 3D motion, floating docks, navigation replacements, or any new core state engine.
- A full graph engine: needs independent architecture/deployment decision after Atlas design pilot.
- Automated installs or deployment: this documentation contains no code changes.

## Success gates
- inspect `git status`, `AGENTS.md`, app framework/build, existing components and design tokens
- source/license/dependency checks for every imported component; preserve one package manager and lockfile
- use real or clearly labeled simulation data; no unverified Fabric claims
- verify keyboard, touch, screen reader, reduced motion, light/dark, responsive viewport and navigation state
- static export build, bundle-size regression and cleanup of subscriptions; functional tests
- do not deploy without user approval

## Primary checked references
- https://easyui.site/components
- https://easyui.site/docs/introduction
- https://github.com/Surajmaurya1/easyui
- https://beui.dev/components/motion
- https://beui.dev/charts
- https://reactflow.dev/learn/concepts/built-in-components
- https://reactflow.dev/learn/advanced-use/accessibility
