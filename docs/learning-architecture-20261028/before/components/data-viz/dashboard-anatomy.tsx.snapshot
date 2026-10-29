"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, Gauge, Table2 } from "lucide-react";
import { DATASETS } from "@/lib/data-viz/datasets";
import {
  formatCompact,
  formatNumber,
  niceScale,
  scaleLinear,
} from "@/lib/data-viz/chart-math";
import { DataTable, Segmented, ToggleChip } from "@/components/data-viz/lab-ui";
import { cn } from "@/lib/utils";

const REVENUE = DATASETS["regional-revenue"].rows;
const SESSIONS = DATASETS["weekly-sessions"].series;
const FUNNEL = DATASETS["hiring-funnel"].stages;
const MIX = DATASETS["channel-mix"].rows;

const REVENUE_TOTAL = REVENUE.reduce((sum, row) => sum + row.value, 0);
const TOP_REGION = [...REVENUE].sort((a, b) => b.value - a.value)[0];
const LATEST_TOTAL = SESSIONS.reduce((sum, item) => sum + (item.points.at(-1) ?? 0), 0);
const FIRST_TOTAL = SESSIONS.reduce((sum, item) => sum + (item.points[0] ?? 0), 0);
const SESSION_GROWTH = ((LATEST_TOTAL - FIRST_TOTAL) / FIRST_TOTAL) * 100;
const HIRE_RATE = (FUNNEL.at(-1)!.value / FUNNEL[0].value) * 100;
const TIGHTEST = FUNNEL.map((stage, index) => ({
  from: FUNNEL[index - 1],
  stage,
  rate: index === 0 ? 100 : (stage.value / FUNNEL[index - 1].value) * 100,
})).slice(1).sort((a, b) => a.rate - b.rate)[0];
const TOP_CHANNEL = [...MIX].sort((a, b) => b.value - a.value)[0];
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];
const MIX_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const ANATOMY = [
  {
    number: 1,
    title: "Context",
    body: "Who, where, and over what period. Without it, every number below is unfalsifiable.",
  },
  {
    number: 2,
    title: "Headline",
    body: "One number, one comparison, one direction. The reader should be able to repeat it.",
  },
  {
    number: 3,
    title: "Evidence",
    body: "The chart that explains the headline. One message per chart, not six lines on one grid.",
  },
  {
    number: 4,
    title: "Exception",
    body: "The thing that would change the decision. If nothing would, the dashboard is decoration.",
  },
  {
    number: 5,
    title: "Action",
    body: "What happens next, who owns it, and what would make the recommendation wrong.",
  },
];

function Mark({ number, tone = "neutral" }: { number: number; tone?: "neutral" | "warm" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
        tone === "warm"
          ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          : "border-border-strong bg-background text-foreground",
      )}
    >
      {number}
    </span>
  );
}

function MiniBars({ max, height = 170 }: { max: number; height?: number }) {
  const width = 340;
  const left = 74;
  const right = 44;
  const top = 8;
  const band = (height - top - 8) / REVENUE.length;
  const bar = Math.min(16, band * 0.58);
  const x = scaleLinear({ min: 0, max }, { min: left, max: width - right });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" aria-hidden="true">
      {REVENUE.map((row, index) => {
        const cy = top + band * (index + 0.5);
        return (
          <g key={row.id}>
            <text x={left - 6} y={cy + 3} textAnchor="end" fontSize={9.5} fill="var(--foreground)">
              {row.label}
            </text>
            <rect x={left} y={cy - bar / 2} width={Math.max(1, x(row.value) - left)} height={bar} rx={2} fill="var(--chart-1)" opacity={0.9} />
            <text x={x(row.value) + 4} y={cy + 3} fontSize={9} fill="var(--muted-foreground)" fontFamily="var(--font-geist-mono)">
              {formatNumber(row.value)}
            </text>
          </g>
        );
      })}
      <line x1={left} x2={left} y1={top} y2={height - 6} stroke="var(--border-strong)" strokeWidth={1} />
    </svg>
  );
}

function MiniLine({ height = 180 }: { height?: number }) {
  const width = 520;
  const left = 42;
  const right = 12;
  const top = 12;
  const bottom = 26;
  const innerW = width - left - right;
  const innerH = height - top - bottom;
  const max = Math.max(...SESSIONS.flatMap((item) => item.points));
  const ticks = niceScale(0, max * 1.08, 4);
  const count = SESSIONS[0].points.length;
  const x = scaleLinear({ min: 0, max: count - 1 }, { min: left, max: left + innerW });
  const y = scaleLinear({ min: 0, max: ticks.max }, { min: top + innerH, max: top });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" aria-hidden="true">
      {ticks.ticks.map((tick) => (
        <g key={tick}>
          <line x1={left} x2={left + innerW} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeWidth={1} />
          <text x={left - 5} y={y(tick) + 3} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">
            {formatCompact(tick)}
          </text>
        </g>
      ))}
      {SESSIONS.map((item, index) => (
        <path
          key={item.id}
          d={item.points
            .map((value, week) => `${week === 0 ? "M" : "L"}${x(week)} ${y(value)}`)
            .join(" ")}
          fill="none"
          stroke={COLORS[index % COLORS.length]}
          strokeWidth={1.9}
        />
      ))}
      {[1, 7, 13, 19, 26].map((week) => (
        <text key={week} x={x(week - 1)} y={height - 8} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)">
          {week}
        </text>
      ))}
    </svg>
  );
}

function FunnelBars() {
  const max = FUNNEL[0].value;
  return (
    <ul className="space-y-1.5">
      {FUNNEL.map((stage, index) => {
        const share = (stage.value / max) * 100;
        const step = index === 0 ? null : (stage.value / FUNNEL[index - 1].value) * 100;
        return (
          <li key={stage.id} className="grid grid-cols-[86px_minmax(0,1fr)_54px] items-center gap-2 text-[10px]">
            <span className="truncate text-muted-foreground">{stage.label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full rounded-full"
                style={{ width: `${Math.max(2, share)}%`, background: "var(--chart-2)", opacity: 1 - index * 0.12 }}
              />
            </span>
            <span className="text-end font-mono tabular-nums text-foreground">
              {step === null ? formatCompact(stage.value) : `${step.toFixed(1)}%`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function SessionTable() {
  const weeks = SESSIONS[0].points.length;
  return (
    <DataTable
      title="Weekly sessions"
      caption="Synthetic weekly sessions for three channels, with the row total."
      columns={["Week", ...SESSIONS.map((item) => item.label), "Total"]}
      rows={Array.from({ length: weeks }, (_, week) => [
        `W${week + 1}`,
        ...SESSIONS.map((item) => formatNumber(item.points[week])),
        formatNumber(SESSIONS.reduce((total, item) => total + item.points[week], 0)),
      ])}
    />
  );
}

function Kpi({
  label,
  value,
  note,
  mark,
  delta,
}: {
  label: string;
  value: string;
  note: string;
  mark?: number;
  delta?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {mark ? <Mark number={mark} /> : null}
      </div>
      <p className="mt-1.5 font-mono text-lg tracking-tight text-foreground">{value}</p>
      <div className="mt-0.5 flex items-center gap-1.5 text-[9.5px] text-muted-foreground">
        {delta ? (
          <span className={delta.positive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}>
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        ) : null}
        <span>{note}</span>
      </div>
    </div>
  );
}

export function DashboardAnatomy() {
  const [mode, setMode] = useState<"executive" | "analyst">("executive");
  const [showNotes, setShowNotes] = useState(true);

  const numbers = useMemo(
    () => ({
      revenue: `$${formatNumber(REVENUE_TOTAL)}k`,
      sessions: formatCompact(LATEST_TOTAL),
      hire: `${HIRE_RATE.toFixed(1)}%`,
      topChannel: `${TOP_CHANNEL.value}%`,
    }),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Audience view"
            value={mode}
            onChange={setMode}
            options={[
              { value: "executive", label: "Executive" },
              { value: "analyst", label: "Analyst" },
            ]}
          />
          <ToggleChip pressed={showNotes} onClick={() => setShowNotes((value) => !value)}>
            Anatomy notes
          </ToggleChip>
        </div>
        <p className="max-w-md text-[11px] leading-5 text-muted-foreground">
          One synthetic business, two audiences. The data is identical; the density,
          the headline, and the requested action are not.
        </p>
      </div>

      {showNotes ? (
        <ol className="grid gap-2 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-5">
          {ANATOMY.map((item) => (
            <li key={item.number} className="flex gap-2">
              <Mark number={item.number} />
              <span>
                <span className="block text-[11px] font-medium text-foreground">{item.title}</span>
                <span className="mt-0.5 block text-[10px] leading-5 text-muted-foreground">{item.body}</span>
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-border bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">
              {mode === "executive" ? "Commercial overview" : "Commercial detail"}
            </p>
            {showNotes ? <Mark number={1} /> : null}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              <Filter className="h-2.5 w-2.5" aria-hidden="true" />
              All regions · weeks 1–26
            </span>
            <span className="font-mono">synthetic</span>
          </div>
        </div>

        {mode === "executive" ? (
          <div className="space-y-4 p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                label="Revenue"
                value={numbers.revenue}
                note="last 26 weeks, all regions"
                delta={{ value: "8.4% vs prior", positive: true }}
                mark={showNotes ? 2 : undefined}
              />
              <Kpi label="Sessions" value={numbers.sessions} note="latest week" delta={{ value: `${SESSION_GROWTH.toFixed(0)}% since week 1`, positive: true }} />
              <Kpi label="Offer → hire" value={numbers.hire} note="all applicants to hires" delta={{ value: "4.1% overall", positive: false }} />
              <Kpi label="Top channel" value={numbers.topChannel} note={TOP_CHANNEL.label} delta={{ value: "share of sessions", positive: true }} />
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <section className="rounded-2xl border border-border bg-card/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-medium">Revenue by region</h2>
                  {showNotes ? <Mark number={3} /> : null}
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {TOP_REGION.label} contributes ${TOP_REGION.value}k of ${REVENUE_TOTAL}k.
                </p>
                <div className="mt-2">
                  <MiniBars max={Math.max(...REVENUE.map((row) => row.value)) * 1.08} />
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-amber-500/[0.06] p-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-medium">What would change the decision</h2>
                  {showNotes ? <Mark number={4} tone="warm" /> : null}
                </div>
                <ul className="mt-2 space-y-2 text-[11px] leading-5 text-muted-foreground">
                  <li className="flex gap-2">
                    <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                    <span>
                      <strong className="font-medium text-foreground">{TIGHTEST.stage.label}</strong> is
                      the tightest gate at {TIGHTEST.rate.toFixed(1)}% from {TIGHTEST.from.label.toLowerCase()}.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                    <span>
                      {REVENUE.at(-1)!.label} and {REVENUE.at(-2)!.label} together are{" "}
                      {(
                        ((REVENUE.at(-1)!.value + REVENUE.at(-2)!.value) / REVENUE_TOTAL) *
                        100
                      ).toFixed(1)}
                      % of revenue — a concentration risk, not a growth story.
                    </span>
                  </li>
                </ul>
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/70 p-2.5">
                  {showNotes ? <Mark number={5} /> : null}
                  <p className="text-[10.5px] leading-5 text-muted-foreground">
                    <strong className="font-medium text-foreground">Requested:</strong> approve a
                    two-week review of the interview stage, owned by hiring operations.
                  </p>
                </div>
              </section>
            </div>

            <p className="text-[10px] leading-5 text-muted-foreground">
              Executive view: four numbers, one chart, one exception, one request. If the
              reader remembers only the headline, the page still worked.
            </p>

            <details className="rounded-2xl border border-border bg-card/30 px-3 py-2">
              <summary className="cursor-pointer text-[11px] text-muted-foreground">
                Read the numbers behind this view
              </summary>
              <div className="mt-3 space-y-3">
                <DataTable
                  title="Revenue by region"
                  caption="Synthetic revenue by region with share of total."
                  columns={["Region", "Revenue", "Share"]}
                  rows={[...REVENUE]
                    .sort((a, b) => b.value - a.value)
                    .map((row) => [
                      row.label,
                      formatNumber(row.value),
                      `${((row.value / REVENUE_TOTAL) * 100).toFixed(1)}%`,
                    ])}
                />
                <SessionTable />
                <DataTable
                  title="Session mix"
                  caption="Synthetic share of sessions by channel; the shares sum to 100%."
                  columns={["Channel", "Share"]}
                  rows={[...MIX]
                    .sort((a, b) => b.value - a.value)
                    .map((row) => [row.label, `${row.value}%`])}
                />
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <section className="rounded-2xl border border-border bg-card/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-medium">Weekly sessions by channel</h2>
                  <span className="font-mono text-[9px] text-muted-foreground">26 weeks</span>
                </div>
                <MiniLine />
                <ul className="mt-1 flex flex-wrap gap-3 text-[9.5px] text-muted-foreground">
                  {SESSIONS.map((item, index) => (
                    <li key={item.id} className="inline-flex items-center gap-1">
                      <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                      {item.label}
                    </li>
                  ))}
                </ul>
                <details className="mt-2 border-t border-border pt-2">
                  <summary className="cursor-pointer text-[10px] text-muted-foreground">
                    Weekly sessions — all 26 rows
                  </summary>
                  <div className="mt-2">
                    <SessionTable />
                  </div>
                </details>
              </section>

              <section className="rounded-2xl border border-border bg-card/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-medium">Hiring stage pass-through</h2>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {HIRE_RATE.toFixed(1)}% overall
                  </span>
                </div>
                <div className="mt-2.5">
                  <FunnelBars />
                </div>
              </section>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <section className="rounded-2xl border border-border bg-card/30 p-3">
                <h2 className="text-xs font-medium">Revenue by region</h2>
                <div className="mt-2">
                  <MiniBars max={Math.max(...REVENUE.map((row) => row.value)) * 1.08} />
                </div>
              </section>
              <section className="rounded-2xl border border-border bg-card/30 p-3">
                <h2 className="text-xs font-medium">Session mix</h2>
                <ul className="mt-2 space-y-1.5">
                  {[...MIX].sort((a, b) => b.value - a.value).map((row, index) => (
                    <li key={row.id} className="grid grid-cols-[92px_minmax(0,1fr)_34px] items-center gap-2 text-[10px]">
                      <span className="truncate text-muted-foreground">{row.label}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-border">
                        <span className="block h-full rounded-full" style={{ width: `${row.value}%`, background: MIX_COLORS[index % MIX_COLORS.length] }} />
                      </span>
                      <span className="text-end font-mono tabular-nums">{row.value}%</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="rounded-2xl border border-border bg-card/30 p-1">
              <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] text-muted-foreground">
                <Table2 className="h-3 w-3" aria-hidden="true" />
                Analyst table — the view above is built from these rows
              </div>
              <DataTable
                title="Regional detail"
                caption="Synthetic revenue by region with share of total and rank."
                columns={["Region", "Revenue", "Share", "Rank"]}
                rows={[...REVENUE]
                  .sort((a, b) => b.value - a.value)
                  .map((row, index) => [
                    row.label,
                    formatNumber(row.value),
                    `${((row.value / REVENUE_TOTAL) * 100).toFixed(1)}%`,
                    String(index + 1),
                  ])}
              />
            </div>

            <p className="text-[10px] leading-5 text-muted-foreground">
              Analyst view: same page, more evidence. Nothing was added that the
              executive summary does not already imply — the detail explains the
              headline rather than competing with it.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/40 p-4">
        <p className="max-w-xl text-xs leading-6 text-muted-foreground">
          A dashboard is not a collection of charts. It is an argument with a scan path:
          context, headline, evidence, exception, action.
        </p>
        <Link
          href="/learn/dashboard-design"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline hover:decoration-border-strong hover:underline-offset-4"
        >
          Read chapter 08
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
