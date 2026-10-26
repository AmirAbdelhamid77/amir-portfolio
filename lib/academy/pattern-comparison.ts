import { PATTERNS } from "./ingestion.ts";

export type ComparisonRow = {
  id: string;
  label: string;
  values: readonly string[];
  sourceIds: readonly string[];
};

// Read the canonical teaching content; this view never owns a second definition.
export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  { id: "mechanism", label: "What happens to the data?", values: PATTERNS.map(p => p.mechanism), sourceIds: ["MS-SHORTCUT", "MS-MIRROR", "MS-COPY"] },
  { id: "freshness", label: "Freshness and update policy", values: PATTERNS.map(p => p.freshness), sourceIds: ["MS-SHORTCUT", "MS-MIRROR", "MS-COPY"] },
  { id: "limits", label: "When it is insufficient", values: PATTERNS.map(p => p.limit), sourceIds: ["MS-SHORTCUT", "MS-MIRROR", "MS-DECISION"] },
  { id: "access", label: "Access prerequisite", values: PATTERNS.map(() => "Verify source, connection and destination permissions for the chosen pattern."), sourceIds: ["MS-SECURITY", "MS-MIRROR", "MS-COPY"] },
];

export function filterComparison(rows: readonly ComparisonRow[], query: string, differencesOnly: boolean): readonly ComparisonRow[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter(row => {
    const text = [row.label, ...row.values].join(" ").toLowerCase();
    const differs = new Set(row.values).size > 1;
    return (!differencesOnly || differs) && words.every(word => text.includes(word));
  });
}
