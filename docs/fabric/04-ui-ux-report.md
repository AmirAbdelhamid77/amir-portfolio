# UI/UX implementation report — DP-600 hub

## Where it lives

The hub is a first-class section of the existing Data Lab, not a separate product.

| Route | Purpose | Rendering |
|---|---|---|
| `/lab/dp-600/` | Overview: counts, coverage, modes, topics, packs, personal panels | static shell + one client panel |
| `/lab/dp-600/explore/` | Search, filters, list, in-place question detail | client island |
| `/lab/dp-600/study/` | Guided study (untimed, immediate feedback) | setup + runner |
| `/lab/dp-600/practice/` | Topic practice (status/difficulty filters) | setup + runner |
| `/lab/dp-600/mock/` | Timed, feedback-free simulation | setup + runner |
| `/lab/dp-600/cases/` | Scenario-focused practice | setup + runner |
| `/lab/dp-600/review/` | Mistakes, bookmarks, flags, never-attempted | setup + runner |
| `/lab/dp-600/progress/` | Mastery, trends, export/import | client island |
| `/lab/dp-600/resources/` | Videos, study-note chapters, reference registry | static + on-demand notes |

Every route is statically exported. Deep links work: `?session=<id>` resumes,
`?question=<id>`, `?pack=`, `?subject=`, `?type=`, `?status=` preselect an explorer view.

Discovery: the Data Lab page has a feature card, the homepage's Data Lab block has a
second card, and the footer's Explore column links "Fabric / DP-600". The **global
navigation is unchanged** — six top-level items as before.

## Design system

Nothing new was invented for the shell. The hub reuses:

- `Container`, `Eyebrow`, `ButtonLink` patterns and the existing type scale.
- oklch tokens (`--background`, `--card`, `--border`, `--primary`, `--success`, `--warning`,
  `--destructive`, chart palette) and the existing dark-mode block.
- `.press`, `.grid-noise`, `.no-print`, `:focus-visible`, the reduced-motion block.
- `ToggleChip`/`Panel` conventions from the data-viz lab UI where they fit
  (`components/fabric/ui.tsx` provides the Fabric-specific versions).

Typography: Geist sans/mono only. Numbers, ids and timestamps are monospace, which
keeps the existing Data Lab feel.

## Representation decisions

| Content | Representation | Why not something richer |
|---|---|---|
| Domain coverage vs official weight | Labelled bar + tick at the official midpoint + a table alternative | A radar or donut would imply a precision this comparison does not have |
| Topic distribution | Count list with descriptions | A pie of 14 unequal slices is harder to read than the numbers |
| Mastery by objective | `Meter` with `attempted / total` and a plain-language note | Separating coverage from mastery is the whole point; one blended score would hide it |
| Session trend | One bar per completed session, exact percentage printed | A smoothed line would invent continuity between unrelated sessions |
| Question types | Native radio/checkbox/ordered list | Custom widgets would break screen-reader expectations |

Every visual has a text equivalent: percentages are printed, bars carry an
`aria-label` with "value of total, percent", and the wider tables are available in
`<details>`.

## Question interaction

- **Single answer** — `role="radiogroup"` with real `<input type="radio">` elements,
  visually hidden but keyboard-operable. Options keep their letters (A–E), so a
  five-option question looks deliberate rather than crowded.
- **Multi-select** — `role="group"` with checkboxes. Exact-set scoring; the feedback
  names what was missed *and* what was wrongly included.
- **Ordered sequence** — a real ordered list. Each row has "Move up"/"Move down"
  buttons with descriptive labels, plus pointer drag-and-drop. The order on screen is
  the answer that gets scored, and the required order is revealed after checking.
  Drag is an enhancement, never the only path.
- **Case study** — rendered above the stem in a `<details open>` so it can be collapsed
  after reading, with the title and text verbatim. Every question that shares a
  scenario carries it, so nothing depends on remembering a previous screen.
- **Code** — `<pre><code>` with preserved indentation; only comment lines are tinted.
  No HTML from question text is ever interpreted, and there is no syntax-highlighter
  dependency that could mis-tokenise KQL/SQL.

## Feedback contract

After "Check answer" (guided/practice/review/browse) or on the results screen:

1. Correct / Not quite, with a live region.
2. For multi-select: missing and extra options named.
3. For sequences: the positions that differ, plus the required order.
4. The author's general explanation.
5. Every option's own rationale, marked correct / selected-but-wrong / not selected.
6. Source links: the video at the exact timestamp, plus the Microsoft Learn entries.
7. Pack, difficulty and origin.

Mock exams hide all of this until submission, then use the same component — one
feedback implementation, not two.

## Motion

- `animate-ping`/`reveal`/`NumberTicker` are the only animations used, all inherited.
- The mock exam's timer, navigator and progress bar do not animate on every tick.
- `prefers-reduced-motion: reduce` kills all transitions via the existing global rule;
  verified in the browser suite.
- No scroll-driven storytelling in the quiz surface.

## Accessibility decisions

- Skip link first in tab order; landmark structure unchanged (`header`, `main`, `footer`).
- Options are reachable and answerable by keyboard; the browser test tabs from the
  Save button and reaches a radio input.
- Answer feedback uses `aria-live="polite"`, not a focus jump.
- Timer is `role="timer"` with an accessible name; countdown text is not the only cue
  (it turns red and announces under a minute).
- Navigator buttons carry "Question N, answered/unanswered, flagged".
- The confirm dialog is `role="alertdialog"` with an accessible name.
- Contrast: white-on-`#0285f7` measured **3.68:1**, below AA for normal text. New
  text-bearing primary actions therefore use the site's existing ink button style
  (`bg-foreground text-background`), and reduced-opacity text utilities were removed.
  The two shared "AA" logo tiles were darkened with `color-mix` so the white logotype
  passes; see the testing evidence for the axe results.
- The header's link lost its `aria-label` (which did not contain its own spaced-out
  visible text) in favour of an `sr-only` suffix.

## beUI usage

Installed and reused: `number-ticker` (not used in the end — see below), `tooltip`
(not used), `command-palette` (not used), `funnel/treemap` (not relevant).

Honest selection record:

| Candidate | Decision | Reason |
|---|---|---|
| Expandable Tabs | **Rejected** | The hub needed nine destinations; tabs imply a panel swap and would hide eight of them. A secondary nav row + cards is more legible and links are shareable. |
| Command Palette | **Rejected for v1** | The explorer already has faceted search over 834 questions; a second search surface with different semantics would be confusing. It remains available for a future cross-site search. |
| Bouncy Accordion | **Partially adopted** | Used as plain `<details>` for case studies and study notes; the spring animation adds nothing to reading. |
| Drawer (question navigator) | **Rejected** | A drawer traps focus and hides context in a timed exam. The navigator sits beside the question on desktop and below it on mobile, always visible. |
| Range Slider | **Adopted, native** | `<input type="range">` with a live count; no new dependency. |
| Animated Toast Stack | **Rejected** | Feedback already has a live region in place; toasts would duplicate it and move the message away from the answer. |
| Number Animation | **Not used** | The hub's numbers are static facts; animating 834 would suggest activity that is not happening. |
| `NumberTicker` | **Unused** | Same reason; kept installed from the earlier integration. |

No beUI Pro component, no new npm dependency, no new runtime service.

## Known UX limitations

- The explorer caps the rendered list at 40 with "show more"; filtering is instant but
  a reader who wants to scan all 834 must press it repeatedly. A virtualised list was
  not worth another dependency.
- The results review shows one question at a time with Previous/Next rather than a
  long scroll; printing therefore only prints the visible question. The print button
  is still useful for the summary, but a full-session print would need a different
  layout.
- No cross-device sync: the UI says so explicitly in three places.
