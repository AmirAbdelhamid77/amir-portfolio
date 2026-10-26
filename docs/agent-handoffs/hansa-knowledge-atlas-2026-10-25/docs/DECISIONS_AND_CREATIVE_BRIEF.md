# Approved decisions, open design space and examples of appropriate creativity

## Approved decisions (do not silently revise)

| ID | Decision | Why it matters |
|---|---|---|
| D01 | Kumu-inspired Contextual Hybrid | Context without forcing a graph on all users |
| D02 | All visible canvas connections are *knowledge/semantic* connections | Prevents decorative or misleading book hierarchy edges |
| D03 | Book hierarchy remains metadata / TOC / breadcrumbs | Preserves original source navigation while keeping conceptual meaning truthful |
| D04 | A common canonical graph supports multiple scopes, lenses and sources | Avoids duplicating concepts when books/questions grow |
| D05 | DP-600 Guide is the first Atlas; global Hansa Atlas deferred | Maintains tractable scope; landing page will be redesigned later |
| D06 | Learn and Library expand; Data Visualization, Storytelling, Statistics have independent learning tabs | Makes room for future educational domains |
| D07 | BeUI is a component candidate, not the mandated basis of every visualization | Context-first design, low lock-in |
| D08 | Scientific edge publication requires rationale, conditions and verifiable provenance | A pretty wrong graph harms learning |
| D09 | Accessibility-first mobile text alternative and non-drag navigation | Equal access independent of interaction mode |
| D10 | No deployment or destructive rewrite from handoff alone | Preserves existing website and progress |

## Deliberately open decisions for design and engineering agents

The owner has not yet locked: exact palette, visual metaphor (system map vs soft constellation), node silhouette/shape tokens, clustering algorithm, camera easing duration, default chapter concepts and pilot fixture size, inspector dock behavior, graph package, diagram library, charts chosen for future tabs, locale strategy, icon set, target breakpoints or advanced saved-view UX. The agent may explore and choose thoughtfully based on user tasks, live repo constraints and accessibility tests. Do not pretend these are requirements already approved.

## Prototype comparison brief

Prepare up to three viable concepts, each shown in desktop and mobile context:

- **Calm Systems Map:** readable, precise, quiet motion, Kumu-inspired semantic networks.
- **Editorial Knowledge Constellation:** visually distinctive, but concepts/labels/relationships remain sharply understandable.
- **Focus-Driven Atlas:** intentionally starts almost empty with search and curated gateways; visual graph reveals only relevant neighbors.

Evaluation: semantic clarity, navigation time, source visibility, scientific defensibility, mobile legibility, perceived creativity, maintainability and accessible parity. Use the strongest combination rather than copying a reference wholesale.

## Example context-to-component decisions

- If teaching *lakehouse versus warehouse write behavior*, use a verified comparison matrix and a contextual diagram. A radial graph doesn't help compare feature availability.
- If explaining *Shortcut vs Mirroring vs Copy*, use conditional decision inputs and a truthful data-path diagram; optionally reveal conceptual links to OneLake governance. Avoid depicting same transport mechanism for all three.
- If explaining *Direct Lake*, a semantic focus graph can link to storage modes, OneLake, semantic models and prerequisites; a simulator should be separately scoped to technically correct conditions.
- If teaching *statistical distribution comparison*, use properly scaled interactive distributions with labels/data and an accessible table; don't attach the chart because the page is called Statistics.
- If teaching *Data Storytelling*, controlled chart annotations, small multiples and step-by-step narrative can be more instructive than graph nodes.
- If integrating a future book, its TOC is a list/tree; its concepts participate in a shared graph with reviewed semantic edges.

## Design review questions the agent must answer

1. What does the viewer learn from this *specific* connection?
2. Is this an editorial claim or directly grounded fact? Is the source current?
3. Can the same fact be perceived without animation, color or spatial position?
4. Does the transition preserve orientation or simply attract attention?
5. What happens when the graph grows 20× or the user arrives with a narrow viewport?
6. Does new content reuse canonical IDs and respect old question IDs/progress?
7. How does the first-time user get back to reading instantly?

## Candidate layout recommendations vs requirements

- **Recommended** desktop pattern: 20% navigator / 55% graph / 25% inspector, adapt dynamically, not rigid percentages.
- **Recommended** focus: 1 hop default and optional 2 hops with a visible cap, tweak through usability testing.
- **Recommended** hover: lightweight tooltip only, full details on click/focus.
- **Recommended** animations: under a few hundred milliseconds and interruptible where practical; reduced-motion instant state.
- **Required**: no false structural links, no unverified published scientific links, no forced immersive UI, no absent linear alternative.

The agent should record which of these suggestions it adopted and why. A principled different solution is acceptable within the hard product contract.
