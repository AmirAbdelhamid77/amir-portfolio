# Anti-patterns: what this skill is meant to prevent

## Banned defaults (unless genuinely justified)

1. **Card cloning:** every page becomes identical rounded rectangles, with minor background-color changes.
2. **Preset theater:** spring + stagger + fade-in added to old layout without a new interaction or information design.
3. **Chart everywhere:** forcing a numerical plot onto qualitative explanations or a page with no real data.
4. **D3 as an aesthetic badge:** using D3 when CSS/SVG/current chart library does the same thing with less risk.
5. **Graph confetti:** random orbit lines and nodes that suggest connections unsupported by the content.
6. **Fake liveness:** mock real-time data labeled as actual streaming, pretend database queries, fake runtime-generated results.
7. **Unverified scientific promotion:** changing question grading, certified status or source answer keys because of UI convenience.
8. **Animation as obstruction:** forced auto-scroll, perpetual motion, timing barriers, parallax in dense educational reading.
9. **Accessible-only-on-paper:** hover-only tooltips, keyboard-unreachable graph, no reduced motion, unreadable tiny mobile visualization.
10. **Dependency pileup:** installing chart, motion, graph and 3D libraries for one component without inspection.
11. **Vanity dimensionality:** 3D charts distorting position, depth or comparisons.
12. **Refactor drift:** rewriting neighboring learning engines/URLs/state while a local agent is modifying them.
13. **Static-export regression:** browser APIs during prerender, server-only dependencies in client-side static deployment.
14. **Uninspected "looks good":** claim of polished visual result without browser/design QA or reference to observed screenshots.

## Self-correction drill

If the first result is generic:
- Replace equal-weight tiles with a hierarchy tied to the concept.
- Introduce one information-bearing spatial relation (flow, branch, sequence, distribution, dependency).
- Design a meaningful selection that changes the representation, not just its border.
- Make the focus state tell the story at a glance.
- Add a deliberate second reading layer (details-on-demand or annotated source) rather than duplicate elements.
- Re-check mobile; re-check contrast and reduced motion.

If the result is over-designed:
- Remove ambient loops and repeated glow.
- Simplify to one clear interactive question.
- Restore precise labels, numerically honest axes, provenance and focus hierarchy.
- Reduce chart width/layers rather than hiding essential information.
- Prefer an explanatory sentence or table over an inaccurate visual metaphor.

### The ultimate test

Ask: "If the animation is turned off, is the structure still original, informative and coherent? If the user interacts, do they learn something real? If the page is printed or read by assistive technology, are facts and navigation still intact?" All three matter.
