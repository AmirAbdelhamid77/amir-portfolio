// Curated bridges between the words a reader types and the page that teaches
// the idea under a different name.
//
// Automatic synonym expansion pulled unrelated pages into results ("sql"
// matched a Fabric course because a topic title contained it). An alias is
// explicit and reviewable: one concept, the destinations that genuinely teach
// it, and nothing else. Aliases are added as keywords, so they rank below a
// title match and above summary prose — the page still has to be the right one.
//
// Add an entry only when a real query failed. Remove the entry when the page
// gains the concept in its own title.

import type { SearchDocument } from "./query";

/** concept (as typed, lower case) → canonical document IDs that teach it. */
export const SEARCH_ALIASES: Record<string, string[]> = {
  "star schema": [
    "academy-fabric-analytics-26-design-dimensional-models",
    "academy-power-bi-demos-04-design-data-model",
  ],
  "dimensional model": [
    "academy-fabric-analytics-26-design-dimensional-models",
    "topic-fabric-model",
  ],
  "fact table": ["academy-fabric-analytics-26-design-dimensional-models"],
  "dimension table": ["academy-fabric-analytics-26-design-dimensional-models"],
  grain: ["sql-grain-lens", "academy-fabric-analytics-26-design-dimensional-models"],
  cardinality: [
    "sql-grain-lens",
    "sql-page-3ce3906c5d6c81419b2fecc50db92f04",
    "topic-sql-joins",
  ],
  "direct lake": [
    "academy-fabric-analytics-15-design-semantic-model-scale",
    "academy-fabric-analytics-16-optimize-semantic-model-performance",
    "topic-fabric-model",
  ],
  directquery: [
    "academy-fabric-analytics-15-design-semantic-model-scale",
    "topic-fabric-model",
  ],
  medallion: [
    "academy-fabric-analytics-03b-medallion-lakehouse",
    "topic-fabric-foundations",
  ],
  "row level security": [
    "academy-power-bi-demos-12-enforce-rls",
    "academy-power-bi-labs-11-secure-data-access",
  ],
  rls: [
    "academy-power-bi-demos-12-enforce-rls",
    "academy-power-bi-labs-11-secure-data-access",
  ],
  "time intelligence": ["academy-power-bi-labs-06-use-dax-time-intelligence"],
  "filter context": [
    "academy-power-bi-labs-05-modify-dax-filter-context",
    "topic-power-bi-model",
  ],
  mirroring: ["topic-fabric-ingestion", "topic-fabric-foundations"],
  "deployment pipeline": ["topic-fabric-delivery"],
};

/**
 * Adds each alias to the keywords of the documents it names.
 *
 * A missing target is a broken promise — the alias would silently do nothing —
 * so it fails the build instead of shipping a dead concept bridge. The content
 * is static; a renamed or removed lesson should be a loud fix, not a quiet gap.
 */
export function applySearchAliases(documents: SearchDocument[]): SearchDocument[] {
  const byId = new Map(documents.map((document) => [document.id, document]));
  const missing: string[] = [];

  for (const [concept, ids] of Object.entries(SEARCH_ALIASES)) {
    for (const id of ids) {
      const document = byId.get(id);
      if (!document) {
        missing.push(`${concept} → ${id}`);
        continue;
      }
      document.keywords = [...(document.keywords ?? []), concept];
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Search aliases point at documents that do not exist:\n  ${missing.join("\n  ")}`,
    );
  }

  return documents;
}
