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
import { getAtlasPublic, getAtlasReview } from "@/lib/atlas/server";
import { buildStageModel } from "@/lib/knowledge/stage-model";
import { InsightStage } from "./insight-stage";

export function HansaKnowledgeLanding() {
  // Preview editions are an explicit caller decision here; the public feed stays
  // fail-closed. The stage model always receives the explicit public Atlas
  // projection, so an accidentally enabled Atlas preview variable cannot widen
  // what the Home ships.
  const items = eligibleInsights(feed.items, true);
  const atlas = getAtlasPublic();
  const model = buildStageModel({
    items,
    graph: atlas,
    audience: "review",
    today: new Date(),
  });
  // R2: a separate, build-time local review switch. Only this branch asks for
  // candidate records, and only it mounts the neighbourhood block.
  const neighbourhood =
    process.env.HANSA_NEIGHBOURHOOD_REVIEW === "1" ? getAtlasReview() : null;
  // R3-R6 are the accepted design, promoted to the default build on 2026-11-06
  // (D1, owner-approved pending final verification). The switch survives as a
  // one-variable rollback: `HANSA_*_REVIEW=0` restores that slice's M6 branch
  // without touching source. Only an explicit "0" disables a slice, so a build
  // with no variables at all is the promoted default.
  const timelineFan = process.env.HANSA_TIMELINE_REVIEW !== "0";
  // R4: the cinematic modal dealer. With the switch off the accepted inline table
  // is the only dealer and nothing else is mounted.
  const dealerReview = process.env.HANSA_DEALER_REVIEW !== "0";
  // R5: the close (one idea, one action, the coverage ledger). With the switch
  // off the accepted M6 closing is the only closing scene.
  const closingReview = process.env.HANSA_CLOSING_REVIEW !== "0";
  // R6: the polish layer (measured type scale, label discipline, 44 px targets,
  // scene rhythm). Purely presentational: with the switch off the style attribute
  // is absent and the accepted M6 typography renders from the same stylesheet.
  const polishReview = process.env.HANSA_POLISH_REVIEW !== "0";

  return (
    <InsightStage
      items={items}
      atlas={atlas}
      model={model}
      notice={feed.notice}
      neighbourhood={neighbourhood}
      timelineFan={timelineFan}
      dealerReview={dealerReview}
      closingReview={closingReview}
      polishReview={polishReview}
    />
  );
}
