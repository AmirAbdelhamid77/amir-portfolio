import feed from "@/content/knowledge/insights.json";
import { eligibleInsights } from "@/lib/knowledge/insights";
import { InsightStage } from "./insight-stage";
import { getAtlas } from "@/lib/atlas/server";

export function PrototypeC() {
  // Preview editions are an explicit caller decision here; the public feed stays
  // fail-closed. The Atlas uses its default public projection — never the
  // review-preview flag, which the homepage must not switch on.
  return (
    <InsightStage
      items={eligibleInsights(feed.items, true)}
      atlas={getAtlas()}
      notice={feed.notice}
    />
  );
}
