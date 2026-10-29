# Visual QA — observed result and remaining decisions

Local self-review only. Owner artistic approval is PENDING; no automatic score is presented as owner acceptance.

## Evidence matrix

| Scenario | Actual evidence | Observed status |
|---|---|---|
| Opening / paused depth, 1440 and 1280 | evidence/after/*-opening.png vs before equivalents | TESTED_LOCAL: asymmetrical type, aperture/cutaway, solid layered strata, focused time rail; not a generic equal tile grid |
| Phone recut, 390 and 320 | opening screenshots; motion-390/10-reader.png | PASS reflow and controls; readable one-card stack and expansion; decorative diagram labels are supplemental to exact DOM readout |
| Tablet 768 | light/dark opening/full screenshots | PASS layout; study/dealer stack under split hero |
| Timeline start/mid/end | qa/rail-mid-drag.png, after/motion-*/11-rail-drag.png and 12-rail-settled.png, MP4 | PASS drag, momentum/spring, controlled date/title/URL; keyboard Home/End/arrows, rapid reversal |
| Decision manipulation | MP4, qa results MODEL/SYNC/TABLE/RESET | PASS shared actual model; dashed retained-result plane denotes a requirement, not completed cloud execution |
| Card flight/flip/inspect/close/collect | native compositor MP4, actual frame sequence, desktop/mobile readers | PASS local interaction, focus return, reversible state; phone next/previous explicitly checked |
| Atlas context | last shot in both MP4s, expanded screenshot | PASS honest pending status and native links; graph focus is BLOCKED_PUBLICATION |
| Themes and sampled A/AA axe | ten initial theme/width JSONs + expanded JSON | PASS: zero automated violations after contrast correction; not a full WCAG audit |
| Reduced motion | qa/reduced-320.png and reduced-1440.png | PASS controls and reading; no spatial travel required |
| Touch / mixed direction / high contrast | qa results TOUCH-SWIPE / RTL-MIX-STRESS / FORCED-COLORS | PASS CDP touch, synthetic long Arabic/English heading stress and forced-colors control smoke; not real handset or translated-home approval |
| Performance | performance/lab.json | FAIL provisional 2.5s throttled LCP target; viewport medians 3.144s / 2.716s. No field INP claim; frame pacing under CPU throttle is not claimed 60fps |

## Critique and revisions actually made

1. The first hero filled too much of desktop opening. Constrained the instrument and retained the full dated rail in the first 900px desktop scene.
2. The original model labels became too dim on the new solid surface. Removed 70% text opacity; axe contrast failures resolved at all five widths in both themes.
3. Three fanned cards were too crowded on the 390px phone. Changed the measured tray breakpoint to <420px, with visible backing edges, one readable front card and explicit next/previous. Reviewed actual final reader screenshot.
4. Replaced old repeated enclosing rectangles with a free editorial article, separate model sheet, projected dealer bench and an Atlas context seal. These intentionally have different silhouettes/material roles.
5. Added no perpetual particles, fabricated graph links, numerical chart, unreadable perspective reading text, required intro wait or external rendering package. Typography and core scenario stay semantic DOM at initial paint.

## Review rubric (evidence-based, not certification)

Source integrity: unchanged model/feed/route/storage bytes and known review limitations. Spatial craft: coherent 2.5D plane hierarchy with true face/back CSS card rotation, not a claim of world-space rendering. Meaningful interaction: inputs alter actual derived verdict/geometry, rail changes chronological identity, cards carry the same source-backed claim/caveat/evidence. Accessibility: automated and emulated coverage is strong; human screen reader/phone ergonomics remain NOT RUN. Performance: provisional target missed under explicit throttle; therefore no unconditional production GO or invented >=85/100 final visual score.

The owner must judge whether this execution meets the requested artistic bar. Review the actual gallery and movies, especially grayscale silhouette, resting-frame depth, timing, phone readability, and whether the instrument clarifies the insight. A build or automated PASS cannot make that decision.
