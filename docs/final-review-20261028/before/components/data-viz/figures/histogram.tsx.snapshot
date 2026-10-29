"use client";

import { useMemo, useState } from "react";
import {
  HISTOGRAM_SHAPES,
  countModes,
  histogramCopy,
  histogramSample,
  type HistogramShape,
} from "@/lib/data-viz/figure-data";
import { histogram, mean, niceScale, quantile, scaleLinear } from "@/lib/data-viz/chart-math";
import { DataTable, Insight, KeyNumbers, RangeControl, ToggleChip } from "@/components/data-viz/lab-ui";
import { Plot, Controls, ResetButton, LiveReadout, PLOT, VerdictPill } from "./kit";

export function HistogramFigure() {
  const [shape, setShape] = useState<HistogramShape>("unimodal");
  const [bins, setBins] = useState(10);

  const model = useMemo(() => {
    const values = histogramSample(shape, 160);
    const binsData = histogram(values, { binCount: bins });
    const peak = Math.max(1, ...binsData.counts);
    const y = scaleLinear({ min: 0, max: peak }, { min: PLOT.height - PLOT.bottom, max: PLOT.top });
    const x = scaleLinear(
      { min: binsData.min, max: binsData.max },
      { min: PLOT.left, max: PLOT.width - PLOT.right },
    );
    const average = mean(values);
    const median = quantile(values, 0.5);
    const sd = Math.sqrt(
      values.reduce((total, value) => total + (value - average) ** 2, 0) / (values.length - 1),
    );
    const modes = countModes(binsData.counts);
    const skew = average - median;
    return { values, binsData, peak, y, x, average, median, sd, modes, skew };
  }, [shape, bins]);

  const tickSource = niceScale(0, model.peak, 4).ticks;

  return (
    <div className="space-y-3">
      <Controls>
        <div role="group" aria-label="Distribution shape" className="flex flex-wrap gap-1">
          {HISTOGRAM_SHAPES.map((item) => (
            <ToggleChip key={item.id} pressed={shape === item.id} onClick={() => setShape(item.id)}>
              {item.label}
            </ToggleChip>
          ))}
        </div>
        <div className="min-w-[220px] flex-1">
          <RangeControl
            label="Bins"
            value={bins}
            min={4}
            max={16}
            step={1}
            onChange={setBins}
            display={String(bins)}
          />
        </div>
        <ResetButton
          onClick={() => {
            setShape("unimodal");
            setBins(10);
          }}
          disabled={shape === "unimodal" && bins === 10}
        />
      </Controls>

      <Plot
        label={`Histogram of a ${shape} sample of 160 values in ${bins} bins. Mean ${model.average.toFixed(1)}, median ${model.median.toFixed(1)}.`}
        caption={
          <>
            {HISTOGRAM_SHAPES.find((item) => item.id === shape)?.note} Bin width is a
            choice: switch bins and watch detail appear or disappear. The sample is
            synthetic and seeded; the table lists every bin.
          </>
        }
      >
        <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} className="h-auto w-full">
          {tickSource.map((tick) => (
            <g key={tick}>
              <line
                x1={PLOT.left}
                x2={PLOT.width - PLOT.right}
                y1={model.y(tick)}
                y2={model.y(tick)}
                stroke="var(--border)"
              />
              <text
                x={PLOT.left - 8}
                y={model.y(tick) + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {tick}
              </text>
            </g>
          ))}

          {model.binsData.bins.map((bin) => {
            const left = model.x(bin.x0);
            const right = model.x(bin.x1);
            const width = Math.max(1, right - left - 1);
            const top = model.y(bin.count);
            return (
              <g key={`${bin.x0}-${bin.x1}`}>
                <rect
                  x={left}
                  y={top}
                  width={width}
                  height={Math.max(1, model.y(0) - top)}
                  rx={1.5}
                  fill="var(--chart-1)"
                  opacity={0.85}
                />
                <title>
                  {`${bin.x0.toFixed(1)}–${bin.x1.toFixed(1)}: ${bin.count} values`}
                </title>
              </g>
            );
          })}

          <line
            x1={model.x(model.average)}
            x2={model.x(model.average)}
            y1={PLOT.top}
            y2={PLOT.height - PLOT.bottom}
            stroke="var(--chart-5)"
            strokeDasharray="4 4"
          />
          <line
            x1={model.x(model.median)}
            x2={model.x(model.median)}
            y1={PLOT.top}
            y2={PLOT.height - PLOT.bottom}
            stroke="var(--chart-2)"
            strokeDasharray="2 4"
          />

          {[model.binsData.min, (model.binsData.min + model.binsData.max) / 2, model.binsData.max].map(
            (value, index) => (
              <text
                key={index}
                x={model.x(value)}
                y={PLOT.height - 14}
                textAnchor={index === 0 ? "start" : index === 2 ? "end" : "middle"}
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {value.toFixed(0)}
              </text>
            ),
          )}

          <text x={PLOT.width - PLOT.right} y={PLOT.top - 10} textAnchor="end" fontSize={10} fill="var(--chart-5)">
            mean
          </text>
          <text x={PLOT.width - PLOT.right} y={PLOT.top + 2} textAnchor="end" fontSize={10} fill="var(--chart-2)">
            median
          </text>
        </svg>
      </Plot>

      <LiveReadout>
        <KeyNumbers
          items={[
            { label: "Mean", value: model.average.toFixed(1), note: "synthetic sample" },
            { label: "Median", value: model.median.toFixed(1), note: "50th percentile" },
            { label: "SD", value: model.sd.toFixed(1), note: "sample" },
            { label: "Bins", value: String(bins), note: "learned choice" },
          ]}
        />
      </LiveReadout>

      <div className="flex flex-wrap items-center gap-3">
        <VerdictPill tone={model.modes > 1 ? "warn" : "neutral"}>
          {model.modes > 1 ? `${model.modes} peaks` : "one peak"} in this binning
        </VerdictPill>
        <VerdictPill tone={Math.abs(model.skew) < 0.6 ? "neutral" : "warn"}>
          {Math.abs(model.skew) < 0.6
            ? "mean ≈ median"
            : model.skew > 0
              ? "mean > median · right tail"
              : "mean < median · left tail"}
        </VerdictPill>
        <span className="text-[11px] text-muted-foreground">
          {histogramCopy(shape)} · n = 160
        </span>
      </div>

      <Insight>
        The peak count is a heuristic on the drawn bins, not a formal test. A bimodal
        sample can look unimodal at four bins and a unimodal sample can grow false
        bumps at sixteen. Read the shape together with the bin width, the sample size
        and the process that produced the data — the mean and median alone are not
        enough.
      </Insight>

      <DataTable
        title="Read the numbers · bin table"
        caption="Every bin of the current histogram, including empty bins."
        columns={["Bin", "Count", "Share"]}
        rows={model.binsData.bins.map((bin) => [
          `${bin.x0.toFixed(1)}–${bin.x1.toFixed(1)}`,
          bin.count,
          `${((bin.count / model.values.length) * 100).toFixed(1)}%`,
        ])}
      />
    </div>
  );
}
