"use client";

// Where the funnel's people actually go.
//
// A funnel chart draws the survivors and leaves the loss as white space: the
// width narrows, but the reader cannot see the people who stopped. A Sankey
// makes the same counts additive — each stage splits into "moved on" and
// "stopped here" — so every node's outgoing flows sum to its own count. That is
// the teaching point, and it is the reason the component is worth the extra
// ink here.
//
// The dataset records counts, not reasons. The drop-node labels name the gate,
// not a cause; the footnote says so rather than inventing an explanation.

import { useState } from "react";
import {
  SankeyChart,
  SankeyChartPlot,
  SankeyChartTooltip,
} from "@/components/charts/sankey-chart";
import {
  DATASETS,
  type FunnelDataset,
} from "@/lib/data-viz/datasets";
import { formatNumber } from "@/lib/data-viz/chart-math";
import { funnelLinks, type FunnelStage } from "@/lib/data-viz/figure-data";
import {
  DataTable,
  Insight,
  KeyNumbers,
  Segmented,
  ToggleChip,
} from "@/components/data-viz/lab-ui";

const FUNNEL = DATASETS["hiring-funnel"] as FunnelDataset;
const STAGES: FunnelStage[] = FUNNEL.stages.map((stage) => ({
  id: stage.id,
  label: stage.label,
  value: stage.value,
}));

/** Drop-node labels name the gate, not a cause: the data has no reason field. */
const DROP_LABELS: Record<string, string> = {
  applied: "Stopped before screening",
  screened: "Stopped before interview",
  interviewed: "Stopped before offer",
  offered: "Offer not accepted",
};

const STAGE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const LINKS = funnelLinks(STAGES);

const FIRST = STAGES[0].value;
const LAST = STAGES[STAGES.length - 1].value;
const OVERALL = (LAST / FIRST) * 100;

const BIGGEST_DROP = STAGES.slice(1)
  .map((stage, index) => ({
    stage,
    drop: STAGES[index].value - stage.value,
    from: STAGES[index],
  }))
  .sort((a, b) => b.drop - a.drop)[0];

/**
 * The stages plus, optionally, one rejection node per gate. Balanced by
 * construction: `funnelLinks` sends the difference to a `drop-*` node.
 */
function buildGraph(showDrops: boolean) {
  const nodes = STAGES.map((stage, index) => ({
    id: stage.id,
    label: stage.label,
    color: STAGE_COLORS[index % STAGE_COLORS.length],
    description: `${formatNumber(stage.value)} people · ${((stage.value / FIRST) * 100).toFixed(1)}% of applications`,
  }));

  if (!showDrops) {
    return {
      nodes,
      links: LINKS.filter((link) => !link.target.startsWith("drop-")).map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        value: link.value,
      })),
    };
  }

  for (const stage of STAGES.slice(0, -1)) {
    const drop = LINKS.find((link) => link.id === `${stage.id}-drop`);
    if (!drop) continue;
    nodes.push({
      id: drop.target,
      label: DROP_LABELS[stage.id] ?? `Stopped at ${stage.label.toLowerCase()}`,
      color: "var(--muted-foreground)",
      description: `${formatNumber(drop.value)} people left between ${stage.label.toLowerCase()} and the next stage`,
    });
  }

  return {
    nodes,
    links: LINKS.map((link) => ({
      id: link.id,
      source: link.source,
      target: link.target,
      value: link.value,
    })),
  };
}

export function FunnelFlow() {
  const [showDrops, setShowDrops] = useState(true);
  const [view, setView] = useState<"flow" | "funnel">("flow");
  const graph = buildGraph(showDrops && view === "flow");

  // One row per drawn flow, with the share of the stage it leaves from.
  const rows = graph.links.map((link) => {
    const source = STAGES.find((stage) => stage.id === link.source);
    const label =
      link.target.startsWith("drop-")
        ? (DROP_LABELS[link.source] ?? "Stopped")
        : (STAGES.find((stage) => stage.id === link.target)?.label ?? link.target);
    return [
      source?.label ?? link.source,
      label,
      formatNumber(link.value),
      source && source.value ? `${((link.value / source.value) * 100).toFixed(1)}%` : "—",
    ];
  });

  const checks = STAGES.slice(0, -1).map((stage) => {
    const outgoing = graph.links
      .filter((link) => link.source === stage.id)
      .reduce((total, link) => total + link.value, 0);
    return { stage, outgoing, balanced: outgoing === stage.value };
  });
  const unbalanced = checks.filter((check) => !check.balanced).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Additive flow · 5 stages, 4 gates
          </p>
          <h3 className="mt-1 text-base font-medium tracking-tight">
            A funnel hides the loss; a flow accounts for it
          </h3>
        </div>
        <Segmented
          label="Chart type"
          value={view}
          options={[
            { value: "flow", label: "Flow" },
            { value: "funnel", label: "Funnel only" },
          ]}
          onChange={setView}
        />
      </div>

      <div className="rounded-2xl border border-border bg-background p-3 sm:p-4">
        <SankeyChart
          nodes={graph.nodes}
          links={graph.links}
          label="Hiring pipeline: each stage's people split between the next stage and the gate where they stopped"
          formatValue={formatNumber}
          nodeWidth={14}
          nodePadding={18}
        >
          <SankeyChartPlot />
          <SankeyChartTooltip />
        </SankeyChart>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ToggleChip
          pressed={showDrops && view === "flow"}
          onClick={() => {
            if (view === "funnel") {
              setView("flow");
              setShowDrops(true);
              return;
            }
            setShowDrops((current) => !current);
          }}
        >
          {showDrops && view === "flow" ? "Hide the rejection flows" : "Show where the drop goes"}
        </ToggleChip>
        <button
          type="button"
          onClick={() => {
            setShowDrops(true);
            setView("flow");
          }}
          className="press rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          Reset
        </button>
        <span className="text-[10px] text-muted-foreground">
          {view === "funnel" ? "The funnel view keeps only the survivor chain." : showDrops ? "Flow widths are people; each stage balances." : "Survivors only — the drop is invisible again."}
        </span>
      </div>

      <p className="text-[11px] leading-5 text-muted-foreground">
        {view === "funnel"
          ? "This is the same data as a chain. The narrowing is honest about the totals, and the four rejection bands were the only place the losses were visible — which is why taking them away makes the picture easier to read and easier to misread."
          : showDrops
            ? "Every stage now splits in two: people who moved on, and people who stopped at that gate. Read the bands, not the node heights — a Sankey is additive, so width is count and the total is conserved across the diagram."
            : "Survivors only. Nothing is wrong with the counts, but the reader cannot tell whether the loss happened at screening or at offer without the table below."}
      </p>

      <KeyNumbers
        items={[
          { label: "Applications → hires", value: `${OVERALL.toFixed(1)}%`, note: `${formatNumber(FIRST)} → ${formatNumber(LAST)}` },
          { label: "Largest single loss", value: formatNumber(BIGGEST_DROP.drop), note: `${BIGGEST_DROP.from.label} stage` },
          { label: "Stage balance", value: unbalanced ? `${unbalanced} unbalanced` : "All balanced", note: "outgoing = stage count" },
          { label: "Gates drawn", value: String(showDrops && view === "flow" ? STAGES.length - 1 : 0), note: "rejection nodes" },
        ]}
      />

      <Insight tone="warning">
        The Sankey does not prove the reason for a drop. It only proves the
        arithmetic: {formatNumber(STAGES[0].value)} applications split into{" "}
        {formatNumber(STAGES[1].value)} screened and{" "}
        {formatNumber(STAGES[0].value - STAGES[1].value)} who stopped. The synthetic
        dataset records counts, not causes, so the labels name the gate and stop there.
      </Insight>

      <DataTable
        title="Read the flows · every band, every count"
        caption="Each row is one drawn flow. Share is of the stage the flow leaves, so the rows from one stage sum to 100%."
        columns={["From", "To", "People", "Share of stage"]}
        rows={rows}
      />

      <details className="rounded-xl border border-border bg-card/30 p-3">
        <summary className="cursor-pointer list-none text-[11px] text-muted-foreground">
          Why not just use the funnel chart twice?
        </summary>
        <p className="mt-2 text-[11px] leading-6 text-muted-foreground">
          A second funnel would duplicate the survivor chain and still hide the
          loss. The reason to switch shape is the question: “what share of
          applications survive to hire?” is a funnel question; “where does the
          pipeline lose people?” is a flow question. The table above answers the
          second one numerically even if the diagram is unreadable on a small screen.
        </p>
      </details>

      <p className="text-[10px] leading-5 text-muted-foreground">
        Synthetic hiring data ({formatNumber(FIRST)} applications). Flows are derived
        from the published stage counts — no reasons, dates or people are invented.
        Reduced motion is handled by the component: bands appear without springing.
      </p>
    </div>
  );
}
