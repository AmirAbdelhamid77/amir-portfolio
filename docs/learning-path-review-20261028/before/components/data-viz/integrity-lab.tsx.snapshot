"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, TriangleAlert } from "lucide-react";
import { DATASETS } from "@/lib/data-viz/datasets";
import { formatNumber, mean, niceScale, scaleLinear } from "@/lib/data-viz/chart-math";
import { DataTable, KeyNumbers, ToggleChip } from "@/components/data-viz/lab-ui";
import { cn } from "@/lib/utils";

const PANE = { w: 320, h: 200, top: 18, right: 14, bottom: 28, left: 38 };

function Pane({
  verdict,
  label,
  caption,
  children,
}: {
  verdict: "honest" | "misleading";
  label: string;
  caption: string;
  children: React.ReactNode;
}) {
  const honest = verdict === "honest";
  return (
    <figure
      className={cn(
        "rounded-2xl border p-3",
        honest
          ? "border-emerald-500/25 bg-emerald-500/[0.04]"
          : "border-rose-500/25 bg-rose-500/[0.04]",
      )}
    >
      <figcaption
        className={cn(
          "mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]",
          honest ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
        )}
      >
        {honest ? (
          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
        ) : (
          <TriangleAlert className="h-3 w-3" aria-hidden="true" />
        )}
        {label}
      </figcaption>
      <div className="rounded-xl border border-border bg-background/70 p-1.5">{children}</div>
      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{caption}</p>
    </figure>
  );
}

function DemoShell({
  index,
  title,
  question,
  children,
  numbers,
  table,
  takeaway,
}: {
  index: string;
  title: string;
  question: string;
  children: React.ReactNode;
  numbers: { label: string; value: string; note?: string }[];
  table: { caption: string; columns: string[]; rows: React.ReactNode[][] };
  takeaway: string;
}) {
  return (
    <article className="rounded-3xl border border-border bg-card/30 p-4 sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Demo {index}
      </p>
      <h2 className="mt-2 text-xl font-medium tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-foreground/70">{question}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">{children}</div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <KeyNumbers items={numbers} />
          <p className="rounded-xl border border-border bg-background/60 p-3 text-xs leading-6 text-muted-foreground">
            {takeaway}
          </p>
        </div>
        <DataTable
          title="Read the numbers"
          caption={table.caption}
          columns={table.columns}
          rows={table.rows}
        />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared mini chart primitives                                               */
/* -------------------------------------------------------------------------- */

function barWidth(value: number, domainMin: number, domainMax: number) {
  const x = scaleLinear({ min: domainMin, max: domainMax }, { min: PANE.left, max: PANE.w - PANE.right });
  return { x, start: x(domainMin), end: x(value) };
}

function HorizontalBars({
  rows,
  domainMin,
  domainMax,
  color = "var(--chart-1)",
  height = 180,
}: {
  rows: { label: string; value: number }[];
  domainMin: number;
  domainMax: number;
  color?: string;
  height?: number;
}) {
  const top = 12;
  const band = (height - top - 8) / rows.length;
  const bar = Math.min(20, band * 0.58);

  return (
    <svg viewBox={`0 0 ${PANE.w} ${height}`} className="h-auto w-full" aria-hidden="true">
      {rows.map((row, index) => {
        const cy = top + band * (index + 0.5);
        const { start, end } = barWidth(row.value, domainMin, domainMax);
        return (
          <g key={row.label}>
            <text x={PANE.left - 6} y={cy + 3.5} textAnchor="end" fontSize={10} fill="var(--foreground)">
              {row.label}
            </text>
            <rect
              x={Math.min(start, end)}
              y={cy - bar / 2}
              width={Math.max(1, Math.abs(end - start))}
              height={bar}
              rx={2.5}
              fill={color}
              opacity={0.88}
            >
              <title>{`${row.label}: ${formatNumber(row.value)}`}</title>
            </rect>
            <text
              x={Math.max(start, end) + 4}
              y={cy + 3.5}
              fontSize={9.5}
              fill="var(--muted-foreground)"
              fontFamily="var(--font-geist-mono)"
            >
              {formatNumber(row.value)}
            </text>
          </g>
        );
      })}
      <line
        x1={PANE.left}
        x2={PANE.left}
        y1={top - 4}
        y2={height - 4}
        stroke="var(--border-strong)"
        strokeWidth={1}
      />
      <text x={PANE.left} y={height - 1} fontSize={8.5} fill="var(--muted-foreground)">
        axis starts at {formatNumber(domainMin)}
      </text>
    </svg>
  );
}

function LinePlot({
  series,
  domain,
  height = 180,
  xLabels = 4,
  highlight,
}: {
  series: { id: string; color: string; points: number[]; dashed?: boolean }[];
  domain: { min: number; max: number };
  height?: number;
  xLabels?: number;
  highlight?: { from: number; to: number };
}) {
  const innerW = PANE.w - PANE.left - PANE.right;
  const innerH = height - PANE.top - PANE.bottom;
  const count = Math.max(1, ...series.map((item) => item.points.length));
  const ticks = niceScale(domain.min, domain.max, 4);
  const x = scaleLinear({ min: 0, max: Math.max(1, count - 1) }, { min: PANE.left, max: PANE.left + innerW });
  const y = scaleLinear({ min: ticks.min, max: ticks.max }, { min: PANE.top + innerH, max: PANE.top });

  const labelEvery = Math.max(1, Math.floor((count - 1) / xLabels));

  return (
    <svg viewBox={`0 0 ${PANE.w} ${height}`} className="h-auto w-full" aria-hidden="true">
      {highlight ? (
        <rect
          x={x(highlight.from)}
          y={PANE.top}
          width={Math.max(1, x(highlight.to) - x(highlight.from))}
          height={innerH}
          fill="var(--chart-3)"
          opacity={0.14}
        />
      ) : null}

      {ticks.ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PANE.left}
            x2={PANE.left + innerW}
            y1={y(tick)}
            y2={y(tick)}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <text x={PANE.left - 5} y={y(tick) + 3} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">
            {formatNumber(tick)}
          </text>
        </g>
      ))}

      {Array.from({ length: count }, (_, index) => index)
        .filter((index) => index % labelEvery === 0 || index === count - 1)
        .map((index) => (
          <text
            key={`x-${index}`}
            x={x(index)}
            y={height - 8}
            textAnchor="middle"
            fontSize={9}
            fill="var(--muted-foreground)"
          >
            {index + 1}
          </text>
        ))}

      {series.map((item) => (
        <path
          key={item.id}
          d={item.points
            .map((value, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(value)}`)
            .join(" ")}
          fill="none"
          stroke={item.color}
          strokeWidth={2.2}
          strokeDasharray={item.dashed ? "5 4" : undefined}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

function stripStats(values: number[]) {
  const m = mean(values);
  const variance = mean(values.map((value) => (value - m) ** 2));
  return { mean: m, sd: Math.sqrt(variance), min: Math.min(...values), max: Math.max(...values) };
}

/* -------------------------------------------------------------------------- */
/* 1. Axis origin                                                             */
/* -------------------------------------------------------------------------- */

function AxisDemo() {
  const rows = DATASETS["baseline-bars"].rows;
  const max = Math.max(...rows.map((row) => row.value));
  const min = Math.min(...rows.map((row) => row.value));
  const floor = Math.floor((min - 3) / 2) * 2;
  const west = rows.find((row) => row.id === "west")!;
  const south = rows.find((row) => row.id === "south")!;
  const trueRatio = west.value / south.value;
  const pixelRatio = (west.value - floor) / Math.max(0.01, south.value - floor);

  return (
    <DemoShell
      index="01"
      title="The axis that starts at 98"
      question="Same four numbers. One axis tells the truth about the gap; the other sells it."
      numbers={[
        { label: "True gap", value: `${(trueRatio * 100 - 100).toFixed(1)}%` },
        { label: "Bar-length gap", value: `${(pixelRatio * 100 - 100).toFixed(0)}%` },
        { label: "Truncated origin", value: formatNumber(floor) },
        { label: "Largest region", value: formatNumber(max) },
      ]}
      table={{
        caption: "Regional revenue index used by both panels.",
        columns: ["Region", "Index", "Share of largest"],
        rows: rows.map((row) => [
          row.label,
          formatNumber(row.value),
          `${((row.value / max) * 100).toFixed(1)}%`,
        ]),
      }}
      takeaway={`West is ${trueRatio.toFixed(2)}× South. Starting the axis at ${floor} makes West's bar look ${pixelRatio.toFixed(1)}× longer, because length from an arbitrary origin is not a ratio. Bar charts must start at zero; the only honest shortcut is a different chart that encodes position, not length.`}
    >
      <Pane
        verdict="honest"
        label="Honest — zero baseline"
        caption="The four regions differ by about five percent. The bars look almost equal because they almost are."
      >
        <HorizontalBars rows={rows.map((row) => ({ label: row.label, value: row.value }))} domainMin={0} domainMax={110} />
      </Pane>
      <Pane
        verdict="misleading"
        label="Misleading — truncated axis"
        caption={`The bars start at ${floor}. The numbers are unchanged; the comparison is not.`}
      >
        <HorizontalBars
          rows={rows.map((row) => ({ label: row.label, value: row.value }))}
          domainMin={floor}
          domainMax={108}
          color="var(--chart-5)"
        />
      </Pane>
    </DemoShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Dual axes                                                               */
/* -------------------------------------------------------------------------- */

function DualAxisDemo() {
  const [flip, setFlip] = useState(false);
  const rows = DATASETS["dual-metric"].rows;
  const base = rows[0];
  const indexed = rows.map((row) => ({
    spend: (row.spend / base.spend) * 100,
    revenue: (row.revenue / base.revenue) * 100,
  }));
  const spendGrowth = ((rows[rows.length - 1].spend / base.spend) * 100 - 100).toFixed(1);
  const revenueGrowth = ((rows[rows.length - 1].revenue / base.revenue) * 100 - 100).toFixed(1);

  const indexedDomain = (() => {
    const all = indexed.flatMap((row) => [row.spend, row.revenue]);
    return { min: Math.min(...all) - 4, max: Math.max(...all) + 4 };
  })();

  return (
    <DemoShell
      index="02"
      title="Two axes, one invented story"
      question="Ad spend and revenue are both rising. Can the chart make one look like it is losing?"
      numbers={[
        { label: "Spend growth", value: `${spendGrowth}%` },
        { label: "Revenue growth", value: `${revenueGrowth}%` },
        { label: "Months", value: formatNumber(rows.length) },
        { label: "Right axis", value: flip ? "reversed" : "normal" },
      ]}
      table={{
        caption: "Monthly synthetic ad spend and revenue, with both series indexed to month one.",
        columns: ["Month", "Spend", "Revenue", "Spend idx", "Revenue idx"],
        rows: rows.map((row, index) => [
          row.month,
          formatNumber(row.spend),
          formatNumber(row.revenue),
          formatNumber(indexed[index].spend, 1),
          formatNumber(indexed[index].revenue, 1),
        ]),
      }}
      takeaway="Both series grew. The dual-axis panel lets the right-hand scale start and end wherever the author likes; reversing it turns two rising lines into a crossing pattern. If two measures need different units, index them to a common base or use two stacked panels — never two y-axes on one plot."
    >
      <Pane
        verdict="honest"
        label="Honest — one indexed scale"
        caption="Both series are rebased to 100 at month one. The reader compares growth rates on the same axis."
      >
        <LinePlot
          series={[
            { id: "spend", color: "var(--chart-1)", points: indexed.map((row) => row.spend) },
            { id: "revenue", color: "var(--chart-2)", points: indexed.map((row) => row.revenue) },
          ]}
          domain={indexedDomain}
        />
        <div className="mt-1 flex flex-wrap items-center gap-3 px-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: "var(--chart-1)" }} />
            Spend index
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: "var(--chart-2)" }} />
            Revenue index
          </span>
        </div>
      </Pane>

      <Pane
        verdict="misleading"
        label="Misleading — two independent axes"
        caption="Left axis: spend. Right axis: revenue, drawn on its own scale. The visual relationship is a choice, not a finding."
      >
        <DualAxisPlot rows={rows} flip={flip} />
        <div className="mt-1 flex justify-end">
          <ToggleChip pressed={flip} onClick={() => setFlip((value) => !value)}>
            Reverse right axis
          </ToggleChip>
        </div>
      </Pane>
    </DemoShell>
  );
}

function DualAxisPlot({
  rows,
  flip,
}: {
  rows: { month: string; spend: number; revenue: number }[];
  flip: boolean;
}) {
  const innerW = PANE.w - PANE.left - PANE.right;
  const innerH = PANE.h - PANE.top - PANE.bottom;
  const spendValues = rows.map((row) => row.spend);
  const revenueValues = rows.map((row) => row.revenue);

  const spendScale = niceScale(Math.min(...spendValues) * 0.9, Math.max(...spendValues) * 1.05, 4);
  const revenueScale = niceScale(Math.min(...revenueValues) * 0.98, Math.max(...revenueValues) * 1.02, 4);

  const x = scaleLinear({ min: 0, max: rows.length - 1 }, { min: PANE.left, max: PANE.left + innerW });
  const yLeft = scaleLinear({ min: spendScale.min, max: spendScale.max }, { min: PANE.top + innerH, max: PANE.top });
  const yRight = flip
    ? scaleLinear({ min: revenueScale.max, max: revenueScale.min }, { min: PANE.top + innerH, max: PANE.top })
    : scaleLinear({ min: revenueScale.min, max: revenueScale.max }, { min: PANE.top + innerH, max: PANE.top });

  return (
    <svg viewBox={`0 0 ${PANE.w} ${PANE.h}`} className="h-auto w-full" aria-hidden="true">
      {spendScale.ticks.map((tick) => (
        <g key={`l-${tick}`}>
          <line x1={PANE.left} x2={PANE.left + innerW} y1={yLeft(tick)} y2={yLeft(tick)} stroke="var(--border)" strokeWidth={1} />
          <text x={PANE.left - 5} y={yLeft(tick) + 3} textAnchor="end" fontSize={8.5} fill="var(--chart-1)">
            {formatNumber(tick)}
          </text>
        </g>
      ))}
      {revenueScale.ticks.map((tick) => (
        <text key={`r-${tick}`} x={PANE.left + innerW + 5} y={yRight(tick) + 3} fontSize={8.5} fill="var(--chart-2)">
          {formatNumber(tick)}
        </text>
      ))}

      <path
        d={rows.map((row, index) => `${index === 0 ? "M" : "L"}${x(index)} ${yLeft(row.spend)}`).join(" ")}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth={2.2}
      />
      <path
        d={rows.map((row, index) => `${index === 0 ? "M" : "L"}${x(index)} ${yRight(row.revenue)}`).join(" ")}
        fill="none"
        stroke="var(--chart-2)"
        strokeWidth={2.2}
      />

      <text x={PANE.left} y={PANE.h - 6} fontSize={8.5} fill="var(--muted-foreground)">
        month 1 → {rows.length}
      </text>
      <text x={PANE.left} y={PANE.top - 6} fontSize={8.5} fill="var(--chart-1)">
        spend (left)
      </text>
      <text x={PANE.left + innerW} y={PANE.top - 6} textAnchor="end" fontSize={8.5} fill="var(--chart-2)">
        revenue (right{flip ? ", reversed" : ""})
      </text>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Aggregation / Simpson's paradox                                         */
/* -------------------------------------------------------------------------- */

function SimpsonDemo() {
  const segments = DATASETS.simpson.segments;
  const pooled = segments.reduce(
    (acc, segment) => ({
      controlConverted: acc.controlConverted + segment.control.converted,
      controlTotal: acc.controlTotal + segment.control.total,
      treatmentConverted: acc.treatmentConverted + segment.treatment.converted,
      treatmentTotal: acc.treatmentTotal + segment.treatment.total,
    }),
    { controlConverted: 0, controlTotal: 0, treatmentConverted: 0, treatmentTotal: 0 },
  );
  const controlRate = (pooled.controlConverted / pooled.controlTotal) * 100;
  const treatmentRate = (pooled.treatmentConverted / pooled.treatmentTotal) * 100;
  const deltas = segments.map((segment) => ({
    label: segment.label,
    control: (segment.control.converted / segment.control.total) * 100,
    treatment: (segment.treatment.converted / segment.treatment.total) * 100,
  }));

  const groupedRows = deltas.flatMap((delta) => [
    { label: `${delta.label} · control`, value: delta.control },
    { label: `${delta.label} · treatment`, value: delta.treatment },
  ]);

  return (
    <DemoShell
      index="03"
      title="Treatment wins everywhere and loses overall"
      question="Two segments, one pooled total. Which number answers the question?"
      numbers={[
        { label: "Control pooled", value: `${controlRate.toFixed(1)}%` },
        { label: "Treatment pooled", value: `${treatmentRate.toFixed(1)}%` },
        { label: "New customers", value: `${deltas[0].treatment > deltas[0].control ? "+" : ""}${(deltas[0].treatment - deltas[0].control).toFixed(1)} pts` },
        { label: "Returning", value: `${deltas[1].treatment > deltas[1].control ? "+" : ""}${(deltas[1].treatment - deltas[1].control).toFixed(1)} pts` },
      ]}
      table={{
        caption: "Conversion counts by segment and arm, with pooled totals.",
        columns: ["Segment", "Control", "Treatment", "Control rate", "Treatment rate"],
        rows: [
          ...segments.map((segment) => [
            segment.label,
            `${segment.control.converted}/${segment.control.total}`,
            `${segment.treatment.converted}/${segment.treatment.total}`,
            `${((segment.control.converted / segment.control.total) * 100).toFixed(1)}%`,
            `${((segment.treatment.converted / segment.treatment.total) * 100).toFixed(1)}%`,
          ]),
          [
            "Pooled",
            `${pooled.controlConverted}/${pooled.controlTotal}`,
            `${pooled.treatmentConverted}/${pooled.treatmentTotal}`,
            `${controlRate.toFixed(1)}%`,
            `${treatmentRate.toFixed(1)}%`,
          ],
        ],
      }}
      takeaway="Treatment is ahead in both segments. Pooling reverses the sign because the arms have very different segment mixes: the control group is mostly high-converting returning customers, the treatment group is mostly new ones. Aggregate rates are only comparable when the mix is comparable — or when the rate is weighted to a common standard."
    >
      <Pane
        verdict="honest"
        label="Honest — split by segment"
        caption="Treatment is slightly better in both segments. The comparison holds the segment constant."
      >
        <HorizontalBars
          rows={groupedRows}
          domainMin={0}
          domainMax={100}
          color="var(--chart-2)"
          height={210}
        />
      </Pane>
      <Pane
        verdict="misleading"
        label="Misleading — pooled only"
        caption="The pooled bars look decisive. They compare two different populations and call it a treatment effect."
      >
        <HorizontalBars
          rows={[
            { label: "Control", value: Number(controlRate.toFixed(1)) },
            { label: "Treatment", value: Number(treatmentRate.toFixed(1)) },
          ]}
          domainMin={0}
          domainMax={100}
          color="var(--chart-5)"
          height={210}
        />
      </Pane>
    </DemoShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Same mean, different shape                                              */
/* -------------------------------------------------------------------------- */

function SameMeanDemo() {
  const groups = DATASETS["same-mean"].groups;
  const stats = groups.map((group) => ({ ...group, stats: stripStats(group.values) }));
  const sds = stats.map((group) => group.stats.sd);
  const minSd = Math.min(...sds);
  const maxSd = Math.max(...sds);

  return (
    <DemoShell
      index="04"
      title="Four bars, four different realities"
      question="Every group averages exactly fifty. Does that mean they are interchangeable?"
      numbers={[
        { label: "Group mean", value: "50.0", note: "all four" },
        { label: "Smallest SD", value: minSd.toFixed(1) },
        { label: "Largest SD", value: maxSd.toFixed(1) },
        { label: "Groups", value: String(groups.length) },
      ]}
      table={{
        caption: "Mean, standard deviation, and range for four synthetic groups.",
        columns: ["Group", "Mean", "SD", "Min", "Max"],
        rows: stats.map((group) => [
          group.label,
          formatNumber(group.stats.mean, 1),
          formatNumber(group.stats.sd, 1),
          formatNumber(group.stats.min, 1),
          formatNumber(group.stats.max, 1),
        ]),
      }}
      takeaway="A bar of means is a summary of a summary. The bimodal group has a hole in the middle where no observation sits, and the skewed group has a long upper tail. Choosing between them is a decision about risk, not about the average — so the average cannot make it for you."
    >
      <Pane
        verdict="honest"
        label="Honest — every observation"
        caption="Each dot is one synthetic observation. The mean line crosses all four, but the shapes do not agree."
      >
        <StripPlot groups={groups} />
      </Pane>
      <Pane
        verdict="misleading"
        label="Misleading — means only"
        caption="Four identical bars. Nothing here is false, and nothing here is enough."
      >
        <HorizontalBars
          rows={groups.map((group) => ({ label: group.label, value: 50 }))}
          domainMin={0}
          domainMax={60}
          color="var(--chart-5)"
          height={180}
        />
      </Pane>
    </DemoShell>
  );
}

function StripPlot({ groups }: { groups: { id: string; label: string; values: number[] }[] }) {
  const height = 200;
  const top = 18;
  const band = (height - top - 10) / groups.length;
  const x = scaleLinear({ min: 15, max: 85 }, { min: PANE.left + 18, max: PANE.w - PANE.right });

  return (
    <svg viewBox={`0 0 ${PANE.w} ${height}`} className="h-auto w-full" aria-hidden="true">
      {[20, 40, 60, 80].map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={top - 4} y2={height - 8} stroke="var(--border-strong)" strokeWidth={1} />
          <text x={x(tick)} y={height - 1} textAnchor="middle" fontSize={8.5} fill="var(--muted-foreground)">
            {tick}
          </text>
        </g>
      ))}
      {groups.map((group, index) => {
        const cy = top + band * (index + 0.5);
        return (
          <g key={group.id}>
            <text x={PANE.left - 2} y={cy + 3} textAnchor="end" fontSize={9} fill="var(--foreground)">
              {group.label}
            </text>
            <line x1={x(50)} x2={x(50)} y1={cy - band * 0.32} y2={cy + band * 0.32} stroke="var(--chart-5)" strokeWidth={1.4} strokeDasharray="4 3" />
            {group.values.map((value, valueIndex) => (
              <circle
                key={valueIndex}
                cx={x(value)}
                cy={cy + ((valueIndex * 37) % 9) - 4}
                r={1.9}
                fill="var(--chart-1)"
                opacity={0.55}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Cherry-picked window                                                    */
/* -------------------------------------------------------------------------- */

function WindowDemo() {
  const values = DATASETS["long-series"].values;
  const size = 8;
  const tail = values.slice(-size);
  const peak = Math.max(...values);
  const fullChange = ((values[values.length - 1] - values[0]) / values[0]) * 100;
  const tailChange = ((tail[tail.length - 1] - tail[0]) / tail[0]) * 100;

  return (
    <DemoShell
      index="05"
      title="The eight-week crash that is also a good year"
      question="Which window is the honest one — and who chose it?"
      numbers={[
        { label: "Full-period change", value: `${fullChange > 0 ? "+" : ""}${fullChange.toFixed(1)}%` },
        { label: "Last-8 change", value: `${tailChange.toFixed(1)}%` },
        { label: "Peak week", value: formatNumber(values.indexOf(peak) + 1) },
        { label: "Weeks", value: String(values.length) },
      ]}
      table={{
        caption: "Weekly synthetic sessions. The last eight weeks are highlighted in the honest panel.",
        columns: ["Week", "Sessions", "vs week 1"],
        rows: values.map((value, index) => [
          String(index + 1),
          formatNumber(value),
          `${(((value - values[0]) / values[0]) * 100).toFixed(1)}%`,
        ]),
      }}
      takeaway={`Both panels plot real observations. The full year ends ${fullChange > 0 ? "up" : "down"} ${Math.abs(fullChange).toFixed(1)}% from week one, after a peak in week ${values.indexOf(peak) + 1}. The last eight weeks alone fall ${Math.abs(tailChange).toFixed(1)}%, and a tight axis makes that fall look like a collapse. Always show the window that contains the claim, and label the window you excluded.`}
    >
      <Pane
        verdict="honest"
        label={`Honest — all ${values.length} weeks`}
        caption="The highlighted tail is real, but it sits inside a longer rise. The y-axis starts at zero."
      >
        <LinePlot
          series={[{ id: "sessions", color: "var(--chart-1)", points: values }]}
          domain={{ min: 0, max: peak * 1.06 }}
          highlight={{ from: values.length - size, to: values.length - 1 }}
          xLabels={6}
        />
      </Pane>
      <Pane
        verdict="misleading"
        label="Misleading — last 8 weeks only"
        caption="The same eight observations, a tight y-axis, and no context. The trend is now the whole story."
      >
        <LinePlot
          series={[{ id: "tail", color: "var(--chart-5)", points: tail }]}
          domain={{ min: Math.min(...tail) * 0.985, max: Math.max(...tail) * 1.01 }}
          xLabels={3}
        />
        <p className="px-1 pb-1 text-[9px] text-muted-foreground">
          window: weeks {values.length - size + 1}–{values.length}
        </p>
      </Pane>
    </DemoShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. Pie vs sorted bar                                                       */
/* -------------------------------------------------------------------------- */

function PieDemo() {
  const rows = DATASETS["channel-mix"].rows;
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const direct = rows.find((row) => row.id === "direct")!;
  const email = rows.find((row) => row.id === "email")!;
  const referral = rows.find((row) => row.id === "referral")!;

  return (
    <DemoShell
      index="06"
      title="Angles are not a ranking"
      question="Email, Direct, and Referral differ by 8, 16, and 11 percent. Can you order them without reading the labels?"
      numbers={[
        { label: "Direct", value: `${direct.value}%` },
        { label: "Email", value: `${email.value}%` },
        { label: "Referral", value: `${referral.value}%` },
        { label: "Slices", value: String(rows.length) },
      ]}
      table={{
        caption: "Synthetic session share by channel, sorted descending as the bar panel draws it.",
        columns: ["Channel", "Share", "Sorted rank"],
        rows: sorted.map((row, index) => [row.label, `${row.value}%`, String(index + 1)]),
      }}
      takeaway="A pie encodes value as angle, and people compare angles poorly. With five slices the ordering is already hard; with eight it is guesswork. A sorted bar encodes the same shares as length from a common baseline, so rank and gap are both readable. Pie charts are defensible for two or three slices that genuinely form a whole — and even then, a bar is usually kinder."
    >
      <Pane
        verdict="honest"
        label="Honest — sorted bar"
        caption="Same shares, ordered. The rank is immediate and the gaps are proportional."
      >
        <HorizontalBars
          rows={sorted.map((row) => ({ label: row.label, value: row.value }))}
          domainMin={0}
          domainMax={45}
          height={200}
        />
      </Pane>
      <Pane
        verdict="misleading"
        label="Misleading — unsorted, exploded pie"
        caption="The slices sum to 100%, the labels are correct, and the reader still has to measure angles."
      >
        <Pie total={total} rows={rows} colors={colors} explodeId="email" />
        <ul className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 px-1 pb-1 text-[9.5px] text-muted-foreground">
          {rows.map((row, index) => (
            <li key={row.id} className="inline-flex items-center gap-1">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: colors[index % colors.length] }} />
              {row.label} {row.value}%
            </li>
          ))}
        </ul>
      </Pane>
    </DemoShell>
  );
}

function Pie({
  rows,
  total,
  colors,
  explodeId,
}: {
  rows: { id: string; label: string; value: number }[];
  total: number;
  colors: string[];
  explodeId?: string;
}) {
  const cx = PANE.w / 2;
  const cy = 96;
  const radius = 62;
  // Sweep offsets are computed before JSX so the render stays a pure mapping.
  const arcs = rows.reduce<{ row: (typeof rows)[number]; start: number; end: number }[]>(
    (accumulator, row) => {
      const start = accumulator.length
        ? accumulator[accumulator.length - 1].end
        : -Math.PI / 2;
      const end = start + (row.value / total) * Math.PI * 2;
      accumulator.push({ row, start, end });
      return accumulator;
    },
    [],
  );

  return (
    <svg viewBox={`0 0 ${PANE.w} 180`} className="h-auto w-full" aria-hidden="true">
      {arcs.map(({ row, start, end }, index) => {
        const sweep = end - start;
        const exploded = row.id === explodeId;
        const mid = (start + end) / 2;
        const dx = exploded ? Math.cos(mid) * 7 : 0;
        const dy = exploded ? Math.sin(mid) * 7 : 0;
        const x1 = cx + Math.cos(start) * radius + dx;
        const y1 = cy + Math.sin(start) * radius + dy;
        const x2 = cx + Math.cos(end) * radius + dx;
        const y2 = cy + Math.sin(end) * radius + dy;
        const large = sweep > Math.PI ? 1 : 0;
        return (
          <path
            key={row.id}
            d={`M${cx + dx} ${cy + dy} L${x1} ${y1} A${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={colors[index % colors.length]}
            opacity={0.9}
            stroke="var(--background)"
            strokeWidth={1.5}
          >
            <title>{`${row.label}: ${row.value}%`}</title>
          </path>
        );
      })}
      <circle cx={cx} cy={cy} r={26} fill="var(--background)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill="var(--foreground)">
        {formatNumber(total)}%
      </text>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. Bubble area                                                             */
/* -------------------------------------------------------------------------- */

function BubbleDemo() {
  const rows = DATASETS["regional-revenue"].rows;
  const max = Math.max(...rows.map((row) => row.value));
  const min = Math.min(...rows.map((row) => row.value));
  const valueRatio = max / min;
  const radiusRatio = valueRatio;
  const areaRatio = radiusRatio * radiusRatio;

  return (
    <DemoShell
      index="07"
      title="A circle that is thirty-five times too big"
      question="When area carries the number, radius is the wrong knob."
      numbers={[
        { label: "Value ratio", value: `${valueRatio.toFixed(1)}×` },
        { label: "Area ratio (radius∝value)", value: `${areaRatio.toFixed(0)}×` },
        { label: "Correct area ratio", value: `${valueRatio.toFixed(1)}×` },
        { label: "Regions", value: String(rows.length) },
      ]}
      table={{
        caption: "Synthetic revenue by region with the two circle radii each encoding implies.",
        columns: ["Region", "Revenue", "Radius ∝ value", "Radius ∝ √value"],
        rows: rows.map((row) => [
          row.label,
          formatNumber(row.value),
          formatNumber(row.value / max, 2),
          formatNumber(Math.sqrt(row.value / max), 2),
        ]),
      }}
      takeaway={`Scaling the radius with the value squares the visual difference: the largest region is ${valueRatio.toFixed(1)}× the smallest in the data and ${areaRatio.toFixed(0)}× its area on screen. Scale the area instead (radius ∝ √value) and the picture agrees with the table. This is why bubble charts are a screening tool, not a comparison tool.`}
    >
      <Pane
        verdict="honest"
        label="Honest — area scales with value"
        caption="Radius is the square root of the value, so visible area matches the ratio in the data."
      >
        <BubbleRow rows={rows} max={max} mode="area" />
      </Pane>
      <Pane
        verdict="misleading"
        label="Misleading — radius scales with value"
        caption="Radius is the value itself. The biggest circle swallows the chart."
      >
        <BubbleRow rows={rows} max={max} mode="radius" />
      </Pane>
    </DemoShell>
  );
}

function BubbleRow({
  rows,
  max,
  mode,
}: {
  rows: { id: string; label: string; value: number }[];
  max: number;
  mode: "area" | "radius";
}) {
  const maxR = 30;
  const minR = 4;
  const positions = rows.map((_, index) => 30 + index * 34);
  const height = 180;

  return (
    <svg viewBox={`0 0 ${PANE.w} ${height}`} className="h-auto w-full" aria-hidden="true">
      {rows.map((row, index) => {
        const ratio = row.value / max;
        const r = mode === "area" ? minR + (maxR - minR) * Math.sqrt(ratio) : minR + (maxR - minR) * ratio;
        const cx = positions[index];
        const cy = height / 2 - 6;
        return (
          <g key={row.id}>
            <circle cx={cx} cy={cy} r={r} fill="var(--chart-1)" opacity={0.55}>
              <title>{`${row.label}: ${formatNumber(row.value)}`}</title>
            </circle>
            <text x={cx} y={height - 6} textAnchor="middle" fontSize={8} fill="var(--muted-foreground)">
              {row.label.slice(0, 4)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

const DEMOS = [AxisDemo, DualAxisDemo, SimpsonDemo, SameMeanDemo, WindowDemo, PieDemo, BubbleDemo];

export function IntegrityLab() {
  const [only, setOnly] = useState<number | null>(null);
  const visible = useMemo(
    () => (only === null ? DEMOS : DEMOS.filter((_, index) => index === only)),
    [only],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/40 p-3">
        <span className="me-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Jump to
        </span>
        <ToggleChip pressed={only === null} onClick={() => setOnly(null)}>
          All 7
        </ToggleChip>
        {DEMOS.map((_, index) => (
          <ToggleChip key={index} pressed={only === index} onClick={() => setOnly(index)}>
            {String(index + 1).padStart(2, "0")}
          </ToggleChip>
        ))}
      </div>

      {visible.map((Demo, index) => (
        <Demo key={index} />
      ))}
    </div>
  );
}
