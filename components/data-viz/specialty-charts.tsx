"use client";

// Thin client adapters around the two vendored BeUI charts. The page that owns
// the copy and the audit tables stays a server component (it exports metadata,
// and static export prefers it that way); formatting callbacks have to live on
// the client side of the boundary, so they are defined here rather than passed
// down as props.

import { FunnelChart } from "@/components/charts/funnel-chart";
import { Treemap, type TreemapNode } from "@/components/charts/treemap";
import type { HierarchyNode } from "@/lib/data-viz/datasets";
import { formatNumber } from "@/lib/data-viz/chart-math";

const FUNNEL_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function SpecialtyFunnel({
  stages,
  label,
}: {
  stages: { id: string; label: string; value: number }[];
  label: string;
}) {
  return (
    <FunnelChart
      stages={stages.map((stage, index) => ({
        ...stage,
        color: FUNNEL_COLORS[index % FUNNEL_COLORS.length],
      }))}
      unit="people"
      label={label}
      formatValue={(value) => formatNumber(value)}
    />
  );
}

// The registry treemap needs a discriminated leaf/group union; the generated
// dataset stores the same shape with optional fields, so it is converted once,
// explicitly, rather than cast.
function toTreemapNode(node: HierarchyNode): TreemapNode {
  if (node.children?.length) {
    return {
      id: node.id,
      label: node.label,
      children: node.children.map(toTreemapNode),
    };
  }
  return { id: node.id, label: node.label, value: node.value ?? 0 };
}

export function SpecialtyTreemap({
  nodes,
  label,
}: {
  nodes: HierarchyNode[];
  label: string;
}) {
  return (
    <Treemap
      data={nodes.map(toTreemapNode)}
      label={label}
      colors={["#005f8f", "#00705a", "#8a5200", "#8a4a6b", "#8a3800"]}
      formatValue={(value) => `$${formatNumber(value)}k`}
    />
  );
}
