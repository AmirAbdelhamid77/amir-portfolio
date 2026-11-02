# Browser QA — Intelligent Atlas prototype

Status: **PASS** for the tested prototype scope. QA run 2026-11-01; prototype
clock 2026-10-31. This is not a full WCAG audit and not publication approval.

## Environment

| Item | Value |
| --- | --- |
| OS | Windows (win32) |
| Browser | Microsoft Edge 156.0.4314.58, headless |
| Driver | `playwright-core` 1.64.1 |
| Node | v22.23.3 |
| Prototype | `file:///D:/BeUI/amir-portfolio/intelligent-atlas/prototype/index.html` |
| Desktop viewport | 1280 × 900 |
| Tablet viewport | 768 × 900 |
| Mobile viewports | 390 × 844, 320 × 800 |
| Themes | light, dark, forced-colors |
| Motion | default, `prefers-reduced-motion: reduce` |

No server, bundler, network request or live-app route is required. The page reads
`data.js` / `public-data.js` from `file://`.

## Commands

The harnesses live in the approved external temp directory:

```powershell
node "$env:TEMP\opencode\atlas-qa.cjs"
node "$env:TEMP\opencode\atlas-qa-interactions.cjs"
node "$env:TEMP\opencode\atlas-qa-forced-colors.cjs"
```

Archived results:

- `browser-qa-core.json` — 44 checks.
- `browser-qa-interactions.json` — 21 checks.
- `browser-qa-forced-colors.json` — forced-colors probe.
- `browser-qa-forced-colors-dealer.png`, `browser-qa-forced-colors-register.png`.

## Result summary

| Suite | Result | Evidence |
| --- | --- | --- |
| Core keyboard, modal, history, restore, responsive | **44 / 44 PASS** | `browser-qa-core.json` |
| Interaction, public mode, search, goals, return | **21 / 21 PASS** | `browser-qa-interactions.json` |
| Forced colors | **PASS** (14 cards, 1 active, 0 overflow, Dealer + register open, 0 errors) | `browser-qa-forced-colors.json` |
| Console/page errors | **0** across all suites | both JSON files, forced-colors JSON |
| Publication / scientific / rights review | **BLOCKED / PENDING** | `analysis/public-projection.json` |

## Core suite (44/44)

### Keyboard and focus (15)

- `Home` selects 18 October; `End` selects 31 October.
- Arrow keys reach the latest edition (26 October) and update the
  `LATEST EDITION` focus label.
- `Enter` opens the edition and updates the hash to `#edition/2026-10-26`.
- The edition rail has three editions; selecting 24 October updates the title,
  `aria-pressed` and hash.
- Evidence opens and moves focus to its back control.
- `Escape` from evidence returns to the card; `Escape` from the card closes the
  Dealer and restores focus to the opener.
- `Shift+Tab` from the dialog lands inside; repeated `Tab` stays inside.
- Browser Back closes the Dealer; Forward reopens it.

### Persistence and theme (3)

- Session restore keeps the selected date (24 October → 24 October after reload).
- Dark theme toggles and persists.
- No runtime errors during the keyboard/dealer/history run.

### Reduced motion (4)

- Stacked scenes activate.
- The journey rise is removed.
- The dealing animation is skipped.
- No runtime errors.

### Responsive (22)

At 320, 390 and 768 px:

- document horizontal overflow is `0`;
- the Dealer box fits the viewport (320: `10..310`; 390: `10..380`; 768:
  `20..748`);
- the Dealer has no inner horizontal overflow;
- the Atlas has no horizontal overflow;
- the review register and About panel fit the viewport;
- no runtime errors at any width.

At 1280 × 900, the card reader actions are visible without inner scrolling:
reader `scrollHeight` 697 / `clientHeight` 665, actions end at 803, reader bottom
820, dialog height 876.

## Interaction suite (21/21)

### Timeline (3)

- Drag selects an earlier date (26 → 23 October).
- Horizontal wheel moves forward (23 → 26 October).
- An interrupted transition settles on the last request (31 October).

### Reader and return (5)

- Destination preview shows the recorded lesson and practice routes.
- `Escape` from destination returns to the card.
- Locate in Atlas carries the return context (`Return to 26 Oct 2026 edition`).
- The return context reopens the 26 October edition.
- The coverage note separates analysis from the prototype.

### Public mode (6)

- Public mode renders a fail-closed empty graph: 0 nodes, 0 edges, legend hidden,
  expand hidden, goals hidden.
- Editorial cards are labelled `editorial preview · not published`.
- The public Dealer withholds the candidate concept.
- Public evidence withholds candidate assertions.
- Returning to review restores the candidate graph (5 nodes).
- The public projection remains empty; no candidate edge is published by the
  toggle.

### Search, list and goals (7)

- Search returns one concept match and selects `OneLake shortcut`.
- List view is a complete accessible alternative: graph hidden, list visible,
  24 rows in 1 group.
- Goal selection opens a supported route: 2 steps, 2/2 targets with a resource,
  no gaps.
- Next step advances with coverage status and the caveat that route support is
  not a mastery estimate.
- A goal step opens a recorded resource preview.
- No runtime errors.

## Forced colors

`forced-colors: active` reports:

```json
{
  "media": true,
  "cards": 14,
  "activeCard": 1,
  "topbarHeight": 64,
  "overflow": 0,
  "dealer": true,
  "register": true,
  "errors": []
}
```

Screenshots were captured for the Dealer and the review register. This proves
the page renders and remains operable; it is **not** a formal contrast or
focus-indicator audit.

## Screenshots

Five story frames and sixteen appendix images are in
`intelligent-atlas/storyboard/`. They cover 1280 desktop, 320/390/768 responsive,
dark theme and reduced motion. The storyboard document annotates each frame.

## PASS / FAIL / NOT RUN / BLOCKED

### PASS

- Keyboard operation of the timeline, Dealer, evidence, destination, search, list,
  goals and return.
- Focus trap, focus restoration, Escape semantics and browser Back/Forward.
- Session restore of the selected date; dark theme persistence.
- 320/390/768 layout with no horizontal overflow and no Dealer inner overflow.
- Reader actions visible at 1280 × 900 without inner scroll.
- Reduced-motion static alternative.
- Fail-closed public mode and withholding of candidate concepts/evidence.
- Forced-colors render and operation.
- Zero console/page errors in the tested runs.

### FAIL

- None in the tested prototype scope.

### NOT RUN

- Real screen-reader testing (NVDA, JAWS, VoiceOver, TalkBack).
- Firefox and Safari.
- Physical iOS/Android devices and touch gestures beyond Playwright pointer
  emulation.
- Full WCAG 2.2 AA audit, axe/Lighthouse, 200% zoom/reflow audit and a formal
  contrast measurement.
- Visual review of the underlying images/videos; media was analysed through
  captions/alt text only.
- Live-app integration, route execution, assessment delivery or deployment.

### BLOCKED

- Human publication review: **blocked**.
- Scientific review: **pending**.
- Rights review: **pending**.
- Assessment review: **not-applicable** to the current projection.
- Public semantic graph: **zero published concepts and zero published
  assertions**; candidate data cannot be shown in public mode.

## Caveats

- The core and interaction suites are deterministic Playwright scripts against a
  fixed local file. They are not a substitute for moderated usability testing.
- The 320/390/768 checks use headless desktop Edge with mobile-sized viewports,
  not real mobile browsers.
- The forced-colors probe checks render and operation, not every token pair.
- The screenshots show one state each; interaction claims come from the suites.
- The prototype is not integrated into `app/` and was not deployed.
