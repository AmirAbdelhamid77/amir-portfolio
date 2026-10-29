# 11 — Spatial experience accessibility and mobile

## The absolute contract
No essential information exists solely in pixels of WebGL Canvas. Provide semantically equivalent DOM labels, controls, summaries, edge lists, details, legend, data tables and explanations. Use semantic headings and focus order. WebGL picking must be mirrored by accessible selection controls.

## WCAG-related concerns
- Motion triggered by interaction may need to be disableable unless essential (WCAG 2.3.3 AAA); follow applicable accessibility requirements and user preference.
- Animating content that starts automatically and continues beyond relevant conditions may need pause/stop/hide controls depending on criterion.
- Meaning must not rely on color only, spatial position only, or auditory cues only.
- Keyboard operation, focus indicator, visible labels, readable type, contrast and target sizes must be checked.
- If canvas entirely fails to render, do not collapse to an error preventing navigation.

## Accessible structural pattern
```
<section aria-labelledby='atlas-title'>
  <h2 id='atlas-title'>...</h2>
  <p>Graph overview and help...</p>
  <div aria-hidden='true'>[pure visual scene]</div>
  <nav aria-label='Browse concepts'>[real accessible buttons/list]</nav>
  <section aria-live='polite' ...>[selected concept details]</section>
</section>
```
Illustrative structure only: `aria-hidden` on an actually interactive canvas requires an *equivalent fully operable* DOM interface; never inadvertently hide primary controls.

## Responsive redesign
Desktop: immersive scene + anchored inspector. Tablet: tighter camera and simplified layout + collapsible inspector. Phone: deliberate limited-scene preview or thumbnail with concept list and full detail panel; no tiny radial link labels. At 320px all essential tasks remain possible. Account for large text/reflow and virtual keyboard.

## Motion/visual preferences
Respect `prefers-reduced-motion`; provide user-controlled motion intensity for immersive environments when appropriate. Preserve semantic transitions instantly or with crossfade; do not hide branches or reset progress. High contrast mode should prioritize labels and outlines rather than glass effects.

## QA matrix
Tab/Shift+Tab/Enter/Space/Escape and arrows only when appropriate; iOS/Android tap/drag; 200%/400% zoom with overflow checks; reduced motion; screen-reader interpretation of state changes; focus return after inspector close; touch targets; no hover-only content.
