# 02 — Locked product direction, divergent art compositions, and spatial signature

## Product direction LOCKED

**Prototype C** (Hybrid Knowledge Stage) is the product UX. A visitor starts with an actual insight, not a directory or mandatory timeline browse. The visual grammar is **calm-to-cinematic**: immediately legible content, spatial interaction on deliberate user input, editorial reading state afterward. Do not reopen Prototype A vs C. Prototype A remains an optional future archive gallery, not today's landing.

## Required signature: Knowledge Observatory, not a generic dashboard

One coherent stage with: a dominant Daily Insight, an associated dimensional timeline ribbon, an instrument/data story, a tactile deck of knowledge objects, and a limited contextual Atlas. The object of attention changes as the visitor progresses while location/context remain stable. **The hero must still be recognizable in grayscale without labels.**

Anti-flat criteria: asymmetry, foreground-midground-background, one strong silhouette, visible object scale hierarchy, authored light/shadow/material, a spatial transition with meaning, and non-square editorial rhythm. Use a dark atmospheric *hero* if it improves contrast; follow it with warmer/lighter reading surfaces, not the same glowing dark graph everywhere.

## FOUR art-direction options WITHIN Prototype C

### C1 — Editorial Observatory (default recommended proof)
- **Metaphor:** editorial theater + scientific instrument.
- **Desktop silhouette:** left typographic reading column occupies ~46%, right central kinetic instrument/knowledge object ~54%; time ribbon travels diagonally behind/below, not below as simple pills.
- **Spatial mode:** 2.5D DOM/SVG+motion; optional contained R3F instrument only after measured proof.
- **Material:** matte ink/ceramic surfaces, narrow luminous data thread, single mint accent; warm paper explanation sheet unfolds.
- **Action:** prediction changes data story, instrument shifts and sends a signal to selected card, card opens; Atlas focus later.
- **Why:** distinctive first glance and source-backed reading, with performance control.

### C2 — Temporal Ribbon Chamber
- **Metaphor:** calendar history as a finite ribbon passing through an interactive focal aperture.
- **Desktop silhouette:** active insight placed against a sweeping curved rail in depth; real card/experiment secondary.
- **Spatial mode:** 2.5D initially, possible 3D rail if scroll/occlusion genuinely improves navigation.
- **Action:** drag changes day while main Insight remains centered and readable; current event enlarges; older events recede.
- **Risk:** could drift toward Prototype A; **fail** if selecting day is required before reading today's insight.

### C3 — Mechanical Insight Theater
- **Metaphor:** physically opened analytical mechanism, with discrete labeled slabs for definition/assumption/observation.
- **Desktop silhouette:** separated floating layers that reorganize around a precise 2D chart and readout.
- **Spatial mode:** isolated true 3D candidate for meaning-bearing model; accessible DOM chart remains authoritative.
- **Action:** user changes a parameter, mechanical separation exposes what drives the change; card flight inherits position from mechanism.
- **Risk:** cost/GPU, arbitrary literal interpretation of analytical data. No bogus z-axis to represent exact values.

### C4 — Organic Knowledge Unfold
- **Metaphor:** one core insight extends branching fibers to evidence, misconception, and related concepts.
- **Desktop silhouette:** asymmetric organic tendrils frame a fixed readable editorial core, not a generic centered radial web.
- **Spatial mode:** SVG/Canvas 2D or 2.5D; true 3D only if occlusion/camera legitimately communicates relations.
- **Action:** reveal causes a verified connection to unfold toward Atlas preview; dependency remains a typed, documented edge.
- **Risk:** visually beautiful but semantic ambiguity or repeated Atlas graphic. Limit unverified filaments.

**Decision instruction:** Present low-fidelity compositional frames for all four, then compare C1 vs the strongest challenger with SAME content and controls. Choose after side-by-side visual review. The original user choice of Prototype C is preserved in all. A full WebGL scene is not automatically required just because a 3D sample was included in the Skill.

## Material / light / type directions (tunable, not fixed brand change)

Design candidates: atmosphere `#080E1C`, deep layer `#111B2D`, high contrast text `#F8FAFF`, muted info `#BAC5D7`, mint focal `#72E8D1`, iris relationships `#9D91FF`, paper `#F5F2EC`, amber caution `#E9B779`.

- **Text** remains semantic DOM; do not render the explanation itself as 3D/canvas text.
- **Light**: one readable key, softer environmental fill, restrained rim highlighting active object only, not endless neon edges.
- **Depth**: at least 3 visually separable spatial planes. Meaningful scale/perspective/occlusion, controlled background.
- **Type**: visual contrast between grand editorial statement, compact date/metadata, exact table/caption. Readable Arabic/English and natural RTL.
- **Signature moment**: selecting a prediction draws/reshapes the data view; this motion is handed off to a physically arriving knowledge card; the focused related concept illuminates in Atlas. Distinct visual continuity but no forced scroll-jacking.

## What must NOT be reused from existing site

Do not reproduce: centered 1-column headline + two buttons + three equal destination cards, even with dark background, tilt, neon border or particle wallpaper. The existing site architecture can supply actual links; it must not prescribe the new hero composition.

## What NOT to copy from attached visual lab

The companion Skill's `examples/spatial_visual_lab.html` has a useful 2.5D graph and controls, but its sidebar + central graph + inspector is a **research lab**, not the Hansa landing art direction. The Atlas on the landing should be a small coherent teaser and text-backed relationship, never a clone of this demo with invented edges.

## Decision deliverable

A finished `visual-signature.md` includes: selected ID C1–C4, four visual thumbnails (or screenshots), precise scene silhouette, scene hierarchy/z-depth, material, lens/camera assumptions, animation signature, differentiation from existing pages, why user input matters, mobile recut, fallback, source gate, and concrete rejected alternatives. The user/owner reviews this **before** a production page rebuild.
