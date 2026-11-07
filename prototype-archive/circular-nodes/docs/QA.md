# Prototype QA — knowledge graph

Run 2026-11-06T19:47:46.660Z against `http://127.0.0.1:4400/prototype/graph/` with Microsoft Edge (Playwright, headless).

**40/40 checks passed.**

| Result | Check | Detail |
| --- | --- | --- |
| PASS | route returns 200 | status 200 |
| PASS | 9 sequences rendered, 0 notes at rest | 9 sequences / 0 notes |
| PASS | page is noindex | noindex, nofollow |
| PASS | h1 present | Knowledge graph, local and expandable |
| PASS | clicking a sequence reveals its notes | 3 note nodes |
| PASS | expansion moves no other sequence | all anchors unchanged |
| PASS | chip reflects expanded state | before=false |
| PASS | sequence panel shows declared order | panel text contains 'Declared order' |
| PASS | visible notes equal declared membership | 3 ordered / 3 drawn |
| PASS | note click selects the note | stats-section-s1 |
| PASS | note preview has a title | The big picture: what is statistics? |
| PASS | note preview links to the real content | /learn/statistics/journey/foundations/#s1 |
| PASS | preview carries objectives, misconception and dependencies |  |
| PASS | status announces the selection | Note selected: The big picture: what is statistics?. Position 1 of 3. 0 recorded dependenc |
| PASS | selected note link resolves on the static host | 2 href verified |
| PASS | back restores the previous graph state | 3 notes, Previous graph state restored. |
| PASS | focus mode dims unrelated nodes | 8 dimmed, button "Exit focus" |
| PASS | dragging a node repositions it | translate(1.8369701987210297e-14 -195) -> translate(78.67469515124607 -150.0430313421451) |
| PASS | reset collapses the graph and restores node positions | 0 notes, translate(1.8369701987210297e-14 -195) |
| PASS | dragging the canvas pans the view | translate(371 295.7316423005505) scale(0.8897397043030212) -> translate(451 345.7316423005505) scale(0.8897397043030212) |
| PASS | wheel zooms and Fit restores the fitted scale | wheel k=1.25, fit k=0.89 |
| PASS | graph nodes are focusable | seq:statistics:foundations |
| PASS | Enter toggles the focused sequence | Sequence expanded: Foundations: from a question to data. 3 notes shown. |
| PASS | arrow keys move focus between nodes | seq:statistics:foundations → stats-section-s1 |
| PASS | search returns matching sequences and notes | 3 results |
| PASS | choosing a result updates the inspector | 12 notes visible |
| PASS | list view renders every sequence | 9 groups |
| PASS | list view links every note | 43 links |
| PASS | list view names dependencies |  |
| PASS | page states the Atlas publishes 0 concepts and 0 links |  |
| PASS | page states the Atlas is not drawn |  |
| PASS | axe: graph view has no serious/critical violations | clean |
| PASS | axe: list view has no serious/critical violations | clean |
| PASS | mobile 390px has no horizontal overflow | 0px overflow |
| PASS | mobile shows sequence chips | flex |
| PASS | mobile can expand a sequence | 3 note nodes |
| PASS | mobile console is clean | no errors |
| PASS | reduced motion removes node and link animation | {"nodeAnimation":"none","nodeTransition":"1e-05s","lineAnimation":"none"} |
| PASS | page loads without console errors | none |
| PASS | page loads without runtime errors | none |

## axe (WCAG 2.1 A/AA tags)

No violations reported in either view.

Automated checks do not replace a screen-reader pass. NVDA and VoiceOver are **NOT RUN**, so the accessibility gate is not met by this file.

## Limits

- Chromium accessibility tree is not a screen-reader test; NVDA/VoiceOver remain NOT RUN.
- Only the statistics corpus is covered (9 sequences, 43 notes).
- No persistence or deep links; state resets on reload.
