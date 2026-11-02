# Visual direction V3.1 — Hansa clarity, beUI depth and color

Owner amendment, 1 November 2026: combine the current Hansa design and the sought beUI-inspired character, with a higher level of beauty, detail and visual craft. This is a required art-direction amendment to the next-phase plan. It changes the visual target, not the agreed information architecture, evidence rules or scope of execution.

## 1. The intended result

Create an editorial learning space with luminous, tactile interactive objects. Preserve Hansa's readable content, deliberate spacing, stable concepts and source-backed exploration. Bring beUI's confident contrast, saturated focal accents, layered surfaces and responsive object behavior into those compositions.

The result is one coherent design language across Timeline, Dealer, Knowledge Graph, comparison, routes and closing. Do not alternate between an unrelated cream editorial website and a neon component demo. The warmth of the current prototype becomes a subtle material choice within the existing Hansa theme system.

Beauty is part of acceptance: the page must feel composed when still, expressive while responding, and calm while the learner reads. The main interactive object should be immediately recognizable. Color, elevation and motion reinforce its role.

## 2. Reference evidence and interpretation

Inspected on 1 November 2026:

- [beUI homepage](https://beui.dev/): rendered dark hero and recently launched component previews. Observed neutral charcoal surfaces, bright blue calls to action, selective colored highlights, pill controls, rounded inset preview frames and generous negative space. These observations describe the visited state, not every beUI page or theme.
- [beUI Timeline](https://beui.dev/components/motion/timeline): rendered dark preview, API and live connector source. The source uses a focused full-size card, smaller neighbors, a surface-colored veil, large year numerals, a ruler and cable geometry. Selection/geometry creates depth without requiring a 3D world.
- [beUI Card Dealer](https://beui.dev/components/blocks/card-dealer): live connector source and official documentation. It exposes deck/hand/pile zones, custom faces/backs, arc movement and guarded hover/reduced-motion behavior. Source inspection is not a fresh visual or accessibility certification of Hansa's adapted Dealer.
- Local Hansa [global tokens](../../app/globals.css): neutral light/dark surfaces, readable primary variants, teal/violet accents, gradients, glass roles and multiple color presets already exist.
- Local [review prototype CSS](../../intelligent-atlas/prototype/styles.css): warm drafting surfaces, blue selection, mono metadata, paper-like cards and offset slabs. Retain the useful composition and tactile reading qualities; refine the palette and elevation.

Read-only computed styles in beUI's visited dark state reported background `#151515`, card `#1c1c1c`, primary `#0285f7`, white primary foreground and a cyan-to-violet accent gradient. These are reference observations, not approved replacement tokens. Hansa already uses a darker light-theme primary for small white button text. Preserve accessible role-specific values rather than copying a reference color into every context.

The light-theme treatment below is a Hansa proposal based on local tokens. A live light-theme visual review and final contrast measurements are still implementation QA tasks. No beUI Pro component, paid service or premium asset is required. Verify the current source/license when reusing a free component; references do not authorize copying unrelated branded content.

## 3. Blend matrix — concrete visual changes

| Before: current reference or prototype | After: required blended direction | Why |
|---|---|---|
| Warm paper and large offset slabs dominate the prototype | Warmth remains in reading surfaces; main field uses neutral Hansa surfaces, lighter contact shadows and selective luminous edges | Preserves identity while improving precision and depth |
| Blue mainly appears as outlines and a few buttons | Blue anchors selection and actions; cyan/violet light appears in bounded decorative areas | Adds vibrance with a clear focal hierarchy |
| Graph is a framed review canvas beside a large inspector | Selected concept becomes the authored focal object; detail opens in a readable contextual surface | Makes intelligence and learner intent visually central |
| Similar rectangles carry many kinds of information | Temporal cards, conceptual anchors, evidence sheets and resource actions have related but distinct material/shape roles | Helps users recognize what an object does |
| Header, large headline and review metadata compete with Timeline | First viewport is the expressive Timeline; minimal essential controls remain available | Honors the original entry experience |
| Thick layer offsets can feel like stacked paper on every panel | Reserve tangible stacking for the Dealer and Pocket; use inset surfaces and soft elevation elsewhere | Makes depth purposeful and varied |
| Long explanatory surfaces can become dense and technical | Calm reading body, stronger typographic hierarchy, restrained mono metadata and concise actions | Keeps the site suitable for sustained learning |
| Motion concentrates on scene fades | Selection, object continuity, card dealing and intent changes carry the signature motion | Beauty explains state rather than decorating every frame |

The blend is by role, not a literal 50/50 split. Hansa supplies the content architecture and reading discipline; beUI informs surface craft, contrast, selective chroma and responsive behavior. The new task-led graph supplies the distinctive composition.

## 4. Color language

### Separate appearance, meaning and evidence

There are four independent color roles:

1. **Brand/action:** primary action, selection and focus. Follow the active Hansa preset.
2. **Atmosphere:** low-opacity light, decorative gradient edges and card backs. These carry no scientific meaning.
3. **Content identity:** existing domain/category/chart colors, where defined. Preserve their meaning across themes and use labels/shapes too.
4. **Status:** warning, error, success and review state. These are data-driven, never decorative indicators of approval.

Do not recolor a semantic relation to imply greater confidence because it is selected. Do not use green decoration to imply a mastered concept. Changing a color preset must not alter domain meanings or the apparent publication state.

### Role mapping for the executing agent

Proposed `--knowledge-*` names are local semantic aliases, not instructions to create a second global token system. Adapt naming to the existing code and scope them to the Home/knowledge surface.

| Role | Starting mapping | Intended use |
|---|---|---|
| Stage base | Existing `--background` | Neutral canvas and stable scene continuity |
| Reading surface | Existing card/background, with an optional very subtle warm tint in light mode | Card faces, explanations and evidence sheets |
| Recessed surface | Existing muted/card contrast role | Graph field, quiet controls and secondary trays |
| Raised surface | Opaque existing card plus elevation tokens | Selected card, active concept detail, open comparison |
| Main action | Existing `--primary` with `--primary-foreground` | One principal action and selected intent pill |
| Vivid accent | Reference blue or existing accent ramp, subject to role checks | Decorative edge, small emissive marker and bounded light source |
| Secondary light | Existing cyan/teal and violet decorative roles | Wide soft illumination, card-back artwork and scene transition atmosphere |
| Meaningful text | Existing foreground/muted roles after contrast measurement | Body, labels and control text; never a decorative glow token |
| Focus | Existing ring with verified contrast and separation | Keyboard outline, distinct from selected-state glow |
| Review/error/success | Original status tokens and explicit label/icon | Actual state only |
| Categorical meaning | Original chart/domain palette and legend | No automatic brand-gradient remapping |

The observed beUI `#0285f7` is an inspiration for brightness. It may be suitable for decorative treatment; it must not replace Hansa's `#0b62b5` light primary for small white text without measuring the actual pair. In dark mode keep the existing readable light-primary/dark-text pairing unless the tested design improves it.

### Light and dark recipes

**Light:** existing near-white base, porcelain-like opaque cards, a quiet warm tone on editorial reading surfaces, dark ink, confident blue actions and sparse cyan/violet atmospheric light. A possible exploration swatch is `#F8F7F3` for a warm surface; it is a proposed design seed, not a new global background or measured accessible pair.

**Dark:** use the existing charcoal family, distinguish base/recess/raised surfaces with tone and edge light, and let blue/cyan/violet accents have more presence without flooding the whole scene. Do not rely on black shadows alone to separate dark layers. Foreground text remains neutral and crisp.

Both themes receive equal design attention. Do not force a dark landing or overwrite the visitor's theme/preset. Warm light and atmospheric dark should read as the same material system under different lighting.

As a composition starting point, keep roughly four-fifths of the visible area quiet and neutral. Concentrate saturation near the current action/object. This is a visual tuning guide, not a computed coverage metric. A scene can be vibrant because one well-placed object is vivid.

## 5. Depth and material system

Use five conceptual planes; these are not a requirement for five full-screen compositing layers:

| Plane | Content | Depth cues |
|---|---|---|
| Background | Neutral field and optional quiet texture | Broad low-opacity light, static vignette and negative space |
| Context | Timeline neighbors, graph regions and inactive supporting objects | Smaller scale where appropriate, lower emphasis, stable positions |
| Active object | Selected date/card/concept | Full contrast, selective ring/edge, tight contact shadow and clear label |
| Reading | Evidence, explanation or comparison surface | Opaque surface, generous line spacing, restrained elevation |
| Utility | Focus indicator, tooltip, explicit modal controls | Crisp boundaries and reliable layering above decoration |

Light should have a consistent broad direction, for example upper-left key light with a faint cool rim. Do not put opposing hard shadows on adjacent cards. Soft ambient lift, a short contact shadow and a fine inner highlight together are more convincing than a single giant blur.

Starting elevation ranges for visual exploration:

- Resting card: 1px contact definition, modest 2–6px local shadow, a soft 12–24px ambient falloff.
- Raised selection: 2–4px perceived lift with a 20–36px soft falloff and a restrained edge accent.
- Dealer stack: 2–3 visible physical layers, each offset only enough to communicate a deck; do not add thick slabs beneath every reading panel.
- Dark surfaces: use a subtle top-edge highlight and tonal lift; retain an actual visible boundary when color/lighting is unavailable.

Derive exact shadow alpha and color per theme after review. The numbers are hypotheses. Use nested radii consistent with padding: an outer 24px surface with an 8px inset starts with an inner 16px radius. Optical alignment can refine the result. Avoid arbitrarily mixing pill, sharp and heavily rounded forms for equivalent controls.

**Glass has a narrow role:** compact floating controls or a small overlay may use a stable translucent surface with a solid fallback. Main explanations, graph labels, evidence and card bodies are opaque. Limit overlapping blur layers; preserve contrast against the actual background. Low-power and reduced-transparency/forced-color behavior must remain usable where supported.

## 6. Per-scene visual recipes

### Timeline — an object with presence

Retain beUI's focused-card hierarchy, date rhythm, ruler/cables and background year treatment where useful. Fill the viewport through authored scale and spacing, not oversized empty margins around a small component.

The selected date has a crisp face, restrained blue edge and soft local illumination. Neighbors recede through scale and an opaque surface-colored veil; do not make them translucent enough that cables show through card text. Make title/date labels readable at rest. No permanent blinking playhead.

A quiet cyan/violet wash may sit behind the selected region, subordinate to the date. It settles after interaction. Cable geometry stays decorative and neutral so it cannot be confused with the graph's scientific relationships. Do not add decorative line charts or numerical badges without real content.

Keep this scene free of a competing marketing headline. Tiny essential labels can orient the user; typography should serve the Timeline itself.

### Dealer — tactile and collectible

Use opaque editorial card faces with clear title, idea and provenance hierarchy. Card backs can carry an original Hansa geometric motif using the accent gradient, a subtle inset border and sparse pattern. Do not import beUI branding or use synthetic scientific diagrams as decoration.

Make the deck/hand/reader distinction visible even when motion is paused. A dealt card shows a brief edge highlight during its flight, settles onto a contact shadow, and becomes a stable reading object. The reader's longer text remains on a calm surface. Multiple cards should feel carefully arranged, not randomly scattered.

A single-card edition receives the same care; visual richness never justifies inventing extra ideas. The hand can be expansive while the reading surface is precise. On mobile, preserve tactile layering with fewer visible objects and no hover dependency.

### Knowledge Graph — a stable field with a luminous focus

Remove the impression of tiny dots embedded in a generic dashboard. Give the selected concept a composed identity: circular anchor or compact concept surface, readable label, one-line definition nearby and a controlled halo that does not swallow neighboring labels.

Keep a small neighborhood and plenty of meaningful negative space. Regions may have very faint tonal fields, but boundaries are organizational metadata rather than scientific edges. Typed edges remain neutral until selected; the active edge becomes clearer with its label and endpoints emphasized. A selected line's brightness means selection, not truth or causal force.

Use crisp DOM labels or equivalent accessible text. Neighbor size and emphasis must not hide required information. A category's hue remains consistent under different intents; mode changes alter composition and actions rather than recoloring the entire graph.

### Understand, Compare, Apply and Reach a goal

**Understand:** strongest emphasis around the selected concept, with controlled outward disclosure. Reading panels use the editorial material.

**Compare:** two stable anchors of equal visual weight; shared criteria occupy a neutral center. Give both options equally dignified treatment. Highlight the criterion the user changed, not a fabricated winning option. Two labeled markers can distinguish the pair without borrowing success/error colors.

**Apply:** present actual examples and labs as useful objects with consistent source/type labels. Let a selected example rise slightly into the reading plane. Do not convert the scene into a wall of equally vivid tiles.

**Reach a goal:** numbered steps and the selected step carry visual rhythm. The active step uses the action color; planned, visited and completed states remain separately labelled. Do not light a full route as completed when it is merely previewed.

### Pocket, Thread and closing

Pocket uses a compact stack/tray metaphor with real count and an understated save response. Thread is a light navigation trace with distinct styling from semantic edges. Neither becomes a gamified score meter.

The closing quiets the atmosphere and retains the same typography/materials. It should feel like a natural resting point, with a few useful actions rather than another new visual theme.

## 7. Typography, spacing and optical details

- Reuse the current Hansa font stack and loaded assets. Inspect actual font setup before proposing a new face. There is no need to add a remote font for similarity to beUI.
- Reserve mono for dates, short provenance identifiers and compact metadata; use readable body typography for concepts and explanations.
- Retain the plan's approximate 16–18px reading copy and 13–14px meaningful labels. Large headings must not reduce the graph or Timeline to a secondary thumbnail.
- Keep comfortable reading measure, initially around 55–70 characters for long Latin paragraphs, adapted to Arabic and viewport. Avoid letter-spacing that breaks Arabic reading.
- Use a coherent spacing rhythm from the existing tokens; give graph anchors, intent controls and reading actions enough separation to be identified immediately.
- Align icons optically with text and use one consistent icon vocabulary/stroke family. Distinguish active/focus states through more than hue.
- Tabular numerals prevent date/count shifts. Avoid layout jumps when status text, source names or titles vary.

The beauty pass should inspect cropped shadows, inconsistent radii, abrupt divider endings, label collisions, awkward line wraps, misaligned arrows, washed-out secondary text and mismatched hover/click states. These are real acceptance issues even when the page is functional.

## 8. Motion refinement

The detailed durations and scene progress rules in [INTERACTION_AND_MOTION_EN.md](INTERACTION_AND_MOTION_EN.md) remain in force. This amendment adds material response, not a second animation scheduler.

| Moment | Added craft | Limit |
|---|---|---|
| Pointer hover on a large card | 1–2px lift or a restrained light shift | Fine pointer only; no moving graph click targets |
| Press | Small compression around 0.98 and immediate state response | Keyboard state changes are immediate; no decorative delay |
| Card flight | Brief edge/rim emphasis and changing contact shadow | One coherent trajectory; finish stable, not perpetual float |
| Intent selection | Active pill glides and shared objects retain identity | No full entrance replay or color sweep over body text |
| Why this connection | One short trace and crisp explanation | No looping particles or implied causal flow |
| Return | Origin cue and restored surface emphasis | No camera ride across the entire corpus |
| Scene handoff | Outgoing atmosphere softens, incoming focal object becomes clear | Active reading surfaces remain opaque and legible |

No shimmer across readable text, endless animated gradients or automatic orbiting nodes. Ambient light can be static. A rare entrance may be expressive; repeated actions become immediate or nearly immediate. Effects stop when offscreen and are removed or simplified for reduced motion, coarse pointers and constrained devices.

In the signature transition from card to concept, preserve a meaningful identity cue such as title/marker only when the mapping supports it. Do not morph the whole date into a scientific node. At rest, the new composition must work without animation explaining it.

## 9. Token integration and migration

1. Inventory `app/globals.css`, active presets, local component styling and prototype variables. Produce a role crosswalk before changing colors.
2. Reuse existing global semantic tokens. Scope any new atmosphere/elevation aliases to the knowledge scene. Preserve the independent chart palette and status meanings.
3. Map the prototype's warm material into that system; avoid retaining a complete parallel theme engine or hard-coded palette inside every component.
4. Remove or revise stale comments that say only one saturated color is allowed if the implemented scoped decorative accents now use the owner-approved wider palette. Do not globally recolor unrelated lessons or charts.
5. Verify light/dark and saved color presets, including selection, focus, hover, disabled, loading, empty, warning and review states. Measure contrast on composited surfaces and at scroll checkpoints.
6. Profile the actual effects: no full-canvas filter on every frame, no React-wide pointer rerenders, no uncontrolled shadow stack. Reuse Motion values/CSS where appropriate and load only needed capabilities.

All palette/radius/shadow samples in this document are proposed starting points. Neither reference inspection nor a token table is runtime accessibility/performance certification.

## 10. Updated design deliverables and acceptance

Extend M3 with a small style study using the same real content in three treatments: current editorial baseline, beUI-weighted exploration, and the recommended blended direction. These are comparison boards, not three competing production themes. Explain which qualities were retained and why the blend is stronger for learning.

Then provide six polished keyframes: Timeline, Dealer and Knowledge Stage in light and dark. Include a focused graph and a Comparison Desk detail, default and selected/pressed states, plus one 390px view and reduced-motion still. Carry the selected direction through the full nine-frame storyboard and transition recordings already required by the plan.

The review must answer:

- Is there a recognizable Hansa composition, with beUI-level material and interaction care?
- Is the focal object immediately apparent while supporting information stays accessible?
- Does the selected concept/card feel tangible when motion is paused?
- Are color and lighting purposeful without implying scientific confidence or progress?
- Are Timeline, Dealer and Graph distinct experiences within one visual system?
- Do both themes and mobile receive equal craft, with readable text and clear focus?

Apply V01–V12 in [ACCEPTANCE_MATRIX_EN.md](ACCEPTANCE_MATRIX_EN.md). Record owner visual acceptance separately from technical validation. If a design is functional but generic, flat, noisy or inconsistent, revise the concrete composition rather than adding more glow or animation.

