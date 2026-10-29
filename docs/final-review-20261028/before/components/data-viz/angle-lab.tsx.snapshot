"use client";

// Angle versus length, on five real numbers.
//
// Chapter 06 argues that people judge length better than angle. This module
// puts both encodings on the same five values so the argument can be checked
// rather than believed: the donut is the pie by another name (same angles, one
// hole in the middle), and the bars share a zero baseline.
//
// The interaction is deliberately small. Reordering the bars is the one control
// that changes what the reader can do — ranking by value is the task, and a
// sorted bar chart answers it before the eye has moved. The donut cannot be
// reordered, because the ring encodes the order you give it.

import { useState } from "react";
import {
  DonutChart,
  DonutChartCenter,
  DonutChartLegend,
  DonutChartPlot,
} from "@/components/charts/donut-chart";
import { CHANNEL_MIX } from "@/lib/data-viz/figure-data";
import {
  DataTable,
  Insight,
  KeyNumbers,
  Segmented,
} from "@/components/data-viz/lab-ui";

const TOTAL = CHANNEL_MIX.reduce((sum, slice) => sum + slice.value, 0);

interface Pair {
  a: (typeof CHANNEL_MIX)[number];
  b: (typeof CHANNEL_MIX)[number];
  gap: number;
  degrees: number;
}

/** The two values a reader is most likely to confuse: the closest pair. */
function closestPair(): Pair {
  const sorted = [...CHANNEL_MIX].sort((a, b) => b.value - a.value);
  let best: Pair | null = null;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const gap = sorted[index].value - sorted[index + 1].value;
    if (!best || gap < best.gap) {
      best = {
        a: sorted[index],
        b: sorted[index + 1],
        gap,
        degrees: (gap / TOTAL) * 360,
      };
    }
  }
  return best!;
}

const PAIR = closestPair();
const LARGEST = [...CHANNEL_MIX].sort((a, b) => b.value - a.value)[0];
const SMALLEST = [...CHANNEL_MIX].sort((a, b) => a.value - b.value)[0];

function BarPanel({ sorted }: { sorted: boolean }) {
  const rows = sorted
    ? [...CHANNEL_MIX].sort((a, b) => b.value - a.value)
    : CHANNEL_MIX;
  const max = Math.max(...CHANNEL_MIX.map((slice) => slice.value));

  return (
    <figure className="rounded-2xl border border-border bg-background p-3 sm:p-4">
      <figcaption className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {sorted ? "Sorted bars · zero baseline" : "Source-order bars · zero baseline"}
        </span>
        <span className="text-[10px] text-muted-foreground">% of sessions</span>
      </figcaption>
      <ul className="space-y-2">
        {rows.map((slice) => (
          <li key={slice.id} className="grid grid-cols-[minmax(6.5rem,9rem)_1fr_auto] items-center gap-2">
            <span className="truncate text-[11px] text-foreground">{slice.name}</span>
            <span aria-hidden="true" className="h-3 w-full rounded-full bg-muted">
              <span
                className="block h-3 rounded-full"
                style={{
                  width: `${(slice.value / max) * 100}%`,
                  backgroundColor: slice.color,
                }}
              />
            </span>
            <span className="w-10 text-end font-mono text-[11px] tabular-nums text-foreground">
              {slice.value}%
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
        All bars start at zero and share one scale, so the gap between two bars is
        the gap between two values. {sorted
          ? "Sorted, the ranking is the reading order — no scanning back and forth."
          : "In source order the reader has to compare each bar against every other bar to rank them."}
      </p>
    </figure>
  );
}

export function AngleLab() {
  const [sorted, setSorted] = useState(true);
  const [lens, setLens] = useState<"angle" | "length">("angle");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Encoding comparison · 5 channels, 1 dataset
          </p>
          <h3 className="mt-1 text-base font-medium tracking-tight">
            Same numbers, two encodings — and only one of them ranks
          </h3>
        </div>
        <Segmented
          label="Lead with"
          value={lens}
          options={[
            { value: "angle", label: "Angle first" },
            { value: "length", label: "Length first" },
          ]}
          onChange={setLens}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className={lens === "angle" ? "order-1" : "order-2"}>
          <figure className="rounded-2xl border border-border bg-background p-3 sm:p-4">
            <figcaption className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Donut · angle encodes share
            </figcaption>
            <DonutChart
              segments={CHANNEL_MIX}
              label="Session share by channel as a ring of five arcs"
              thickness={24}
              formatValue={(value) => `${value}%`}
            >
              <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,15rem)_1fr]">
                <DonutChartPlot>
                  <DonutChartCenter totalLabel="Sessions" />
                </DonutChartPlot>
                <DonutChartLegend />
              </div>
            </DonutChart>
            <p className="mt-3 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
              The ring can be read as a share (“roughly two-fifths organic”) but not
              ranked. Nothing here is dishonest — the angles are exact — the problem
              is the comparison the reader has to perform.
            </p>
          </figure>
        </div>

        <div className={lens === "angle" ? "order-2" : "order-1"}>
          <BarPanel sorted={sorted} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Bar order"
          value={sorted ? "sorted" : "source"}
          options={[
            { value: "sorted", label: "Ranked" },
            { value: "source", label: "Source order" },
          ]}
          onChange={(value) => setSorted(value === "sorted")}
        />
        <button
          type="button"
          onClick={() => {
            setSorted(true);
            setLens("angle");
          }}
          className="press rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          Reset
        </button>
        <span className="text-[10px] text-muted-foreground">
          The ring keeps the source order; only the bars can be re-ordered.
        </span>
      </div>

      <p className="text-[11px] leading-5 text-muted-foreground">
        {lens === "angle"
          ? "The ring leads because it is what most dashboards ship by default. Read one arc, then try to say which of the middle three is larger without using the legend values."
          : "The bars lead because length on a shared baseline is the comparison people make most accurately. The ring is still here — as the counterexample, not the recommendation."}
      </p>

      <KeyNumbers
        items={[
          { label: "Largest", value: `${LARGEST.value}%`, note: LARGEST.name },
          { label: "Smallest", value: `${SMALLEST.value}%`, note: SMALLEST.name },
          {
            label: "Closest pair",
            value: `${PAIR.gap} pts`,
            note: `${PAIR.a.name} vs ${PAIR.b.name}`,
          },
          {
            label: "Same gap in arc",
            value: `${PAIR.degrees.toFixed(1)}°`,
            note: "of 360°",
          },
        ]}
      />

      <Insight tone="warning">
        {PAIR.a.name} ({PAIR.a.value}%) and {PAIR.b.name} ({PAIR.b.value}%) differ by{" "}
        {PAIR.gap} points — {PAIR.degrees.toFixed(1)}° of arc. At that size the
        angle is inside the noise of how the ring is drawn and how the eye lands on
        a curved edge; the bar gap is visible at a glance. The data did not change
        between the two panels. Only the encoding did.
      </Insight>

      <DataTable
        title="Read the numbers · value, share, arc"
        caption="Five channels summing to 100%. Arc is share × 360°, printed so the ring can be checked against the table."
        columns={["Channel", "Sessions", "Share", "Arc"]}
        rows={[...CHANNEL_MIX]
          .sort((a, b) => b.value - a.value)
          .map((slice) => [
            slice.name,
            `${slice.value}%`,
            `${((slice.value / TOTAL) * 100).toFixed(0)}%`,
            `${((slice.value / TOTAL) * 360).toFixed(1)}°`,
          ])}
      />

      <details className="rounded-xl border border-border bg-card/30 p-3">
        <summary className="cursor-pointer list-none text-[11px] text-muted-foreground">
          When would the donut be the right call?
        </summary>
        <p className="mt-2 text-[11px] leading-6 text-muted-foreground">
          When the question is “does this one slice dominate?” and the answer is
          obvious from the shape — one arc near half, the rest clearly smaller. That
          is a composition check, not a ranking. As soon as the reader needs to order
          the middle slices, or compare two close ones, a sorted bar with a zero
          baseline is the safer encoding. Nothing on this page is a ban on pies; it is
          a test of what a pie can be asked to do.
        </p>
      </details>

      <p className="text-[10px] leading-5 text-muted-foreground">
        Synthetic session mix, five channels. Shares are percentages of the same
        total, so the bar scale is a percentage scale, not a count scale. Reduced
        motion is handled by the component; hover and focus share one readout.
      </p>
    </div>
  );
}
