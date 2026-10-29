# 20 — Agent deliverables and evidence contract

## For a design-only request
Deliver: repository-read-only findings, source-backed audience and data map, at least 4 divergent concepts for flagship, signature sketches/storyboard, recommended direction, interaction/3D architecture, performance and accessibility plan, open risks, no repo edits unless expressly requested.

## For an isolated prototype
Deliver: path, run commands, actual source assets, interaction map, screenshots/video if actually captured, tested breakpoints, reduced-motion/fallback evidence, weighted score, bugs/limitations, no deployment unless expressly requested.

## For approved production implementation
Deliver: changed files and git diff, dependency justification and approval, verified source IDs, screenshot gallery, automated tests, manual browser test matrix with PASSED/FAILED/NOT RUN, build and hydration logs, rollback instructions, deployment state (never infer).

## Minimum design decision record
`name`, `source_of_truth`, `user_goal`, `data_semantics`, `alternatives[]` each with metaphor/visual stage/interaction/renderer/benefit/cost, `selected`, `rejected`, `visual_signature`, `motion_storyboard`, `fallback`, `quality_scores`, `hard_blockers`, `test_evidence`, `repo_safety`, `next_step`.

## Evidence labels
`PROPOSED`, `PROTOTYPED`, `TESTED_LOCAL`, `BUILD_PASSED`, `PRODUCTION_VERIFIED`, `NOT_RUN`, `BLOCKED`, `FAIL`. One status applies to each distinct claim. No green checkmarks when no test was executed.

## When to challenge the existing brief
If the user asks for a scene that cannot preserve accurate learning content, propose a dual-view architecture rather than silently compromising. When inspiration is reference-only, summarize principle not imitate exact visuals.
