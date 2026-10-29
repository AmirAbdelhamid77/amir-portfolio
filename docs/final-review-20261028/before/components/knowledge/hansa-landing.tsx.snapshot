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

import feed from "@/content/knowledge/insights.json";
import { eligibleInsights } from "@/lib/knowledge/insights";
import { getAtlas } from "@/lib/atlas/server";
import { InsightStage } from "./insight-stage";

export function HansaKnowledgeLanding() {
  // Preview editions are an explicit caller decision here; the public feed stays
  // fail-closed. The Atlas uses its default public projection — never the
  // review-preview flag, which the landing must not switch on.
  return (
    <InsightStage
      items={eligibleInsights(feed.items, true)}
      atlas={getAtlas()}
      notice={feed.notice}
    />
  );
}
