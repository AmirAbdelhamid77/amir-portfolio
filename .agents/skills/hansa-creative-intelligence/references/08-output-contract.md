# Lightweight design-implementation record

Use this brief in an existing project work log or PR. Do not clutter user-facing Notion or learning pages with QA metadata.

```yaml
experience: ""
route_or_component: ""
canonical_source: ""
learning_goal: "After this, the user can..."
verified_data_or_content: []
source_unknowns: []
representation_shortlist:
  - {concept: "Editorial / precise", tradeoff: ""}
  - {concept: "Interactive 2D", tradeoff: ""}
  - {concept: "Narrative / spatial", tradeoff: ""}
chosen_signature: "What will be distinctive, observable and meaningful?"
composition:
  focal_point: ""
  visual_depth: ""
  typography_and_hierarchy: ""
interaction:
  input: ""
  state: ""
  semantic_output: ""
  mouse_keyboard_touch: ""
  reset: ""
motion:
  entry: ""
  data_change: ""
  reduced_motion: ""
library_choice: {existing_first: "", selected: "", extra_dependency: "none", rationale: ""}
mobile_strategy: ""
accessible_equivalent: ""
checks:
  content: NOT_RUN
  build: NOT_RUN
  unit: NOT_RUN
  browser: NOT_RUN
  accessibility: NOT_RUN
  reduced_motion: NOT_RUN
  responsive: NOT_RUN
  visual_art_direction_review: NOT_RUN
regression_risks: []
```

### Important

For small changes, keep this to a couple of sentences in the agent's final summary; do **not** force YAML artifacts for each CSS tweak. For a major new interactive visual, the explicit decision record is valuable. Preserve the team's existing task tracker rather than creating duplicated bureaucracy.
