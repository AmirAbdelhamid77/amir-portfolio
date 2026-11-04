// The canonical Hansa landing — the ONE editable implementation.
//
// `/` renders this module, and the legacy `/prototype-c/` address renders the
// same module as a thin alias (no forked JSX, data or state). Future design,
// motion and spatial work targets this component and the ones it composes, never
// a route-specific copy. The route files only own metadata and nothing else.
//
// Every observable below is already reviewed content:
//   - the insights feed is read through `eligibleInsights`, so an unreviewed
//     record can never reach the stage;
//   - the Atlas is the default public projection — the review-preview flag is
//     never switched on here, so a draft relation cannot leak into the stage.
//
// The audience decision is made exactly once, here, by `buildStageModel`. The
// Home shows the review-visible editions (technical review included) and labels
// them as such in the masthead; that flag never travels to the Atlas, which
// keeps its own fail-closed public projection.
//
// `today` is the build date. A static export has no server clock at request
// time, so the fifteen-day window is anchored at build and the archive below it
// remains the complete list. That is why the timeline says "newest first" rather
// than pretending to know the visitor's date.

import feed from "@/content/knowledge/insights.json";
import { eligibleInsights } from "@/lib/knowledge/insights";
import { getAtlas } from "@/lib/atlas/server";
import { buildStageModel } from "@/lib/knowledge/stage-model";
import { InsightStage } from "./insight-stage";

export function HansaKnowledgeLanding() {
  // Preview editions are an explicit caller decision here; the public feed stays
  // fail-closed. The Atlas uses its default public projection — never the
  // review-preview flag, which the landing must not switch on.
  const items = eligibleInsights(feed.items, true);
  const atlas = getAtlas();
  const model = buildStageModel({
    items,
    graph: atlas,
    audience: "review",
    today: new Date(),
  });

  return (
    <InsightStage items={items} atlas={atlas} model={model} notice={feed.notice} />
  );
}
