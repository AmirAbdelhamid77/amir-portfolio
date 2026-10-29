"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  binomialCdf,
  binomialPmf,
  formatNumber,
  formatPercent,
  normalCdf,
  normalPdf,
  poissonCdf,
  poissonPmf,
} from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { DensityChart } from "@/components/statistics/charts/density";
import { PmfChart } from "@/components/statistics/charts/pmf";
import {
  Assumptions,
  Interpretation,
  LabShell,
  LabSlider,
  Panel,
  PredictionPrompt,
  ReadoutGrid,
  ResetButton,
  Segmented,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

type Family = "binomial" | "poisson" | "normal";
type Query = "exact" | "interval";

export function DistributionsLab({ compact = false }: { compact?: boolean }) {
  const [family, setFamily] = useState<Family>("binomial");
  const [query, setQuery] = useState<Query>("interval");
  const [p, setP] = useState(0.4);
  const [lambda, setLambda] = useState(4);
  const [sigma, setSigma] = useState(1);
  const [k, setK] = useState(6);
  const [a, setA] = useState(-1);
  const [b, setB] = useState(1);

  const binomialBars = useMemo(
    () => Array.from({ length: 21 }, (_, index) => ({ k: index, p: binomialPmf(20, index, p) })),
    [p],
  );
  const poissonBars = useMemo(
    () => Array.from({ length: Math.ceil(lambda + 5 * Math.sqrt(lambda) + 2) + 1 }, (_, index) => ({ k: index, p: poissonPmf(lambda, index) })),
    [lambda],
  );
  const low = Math.min(a, b);
  const high = Math.max(a, b);

  let probability = 0;
  let summary = "";
  let chart: ReactNode = null;
  let tableRows: ReactNode[][] = [];

  if (family === "binomial") {
    const pk = binomialPmf(20, k, p);
    probability = query === "exact" ? pk : binomialCdf(20, Math.floor(high), p) - binomialCdf(20, Math.ceil(low) - 1, p);
    summary = `Binomial with n=20 and p=${formatNumber(p, 2)}. ${query === "exact" ? `Exactly ${k} successes` : `Between ${Math.ceil(low)} and ${Math.floor(high)} successes`} has probability ${formatPercent(probability, 2)}.`;
    chart = (
      <PmfChart
        bars={binomialBars}
        highlight={(index) => (query === "exact" ? index === k : index >= Math.ceil(low) && index <= Math.floor(high))}
        xLabel="k successes"
        summary={summary}
        caption="Each bar is a probability mass. The bars sum to 1 over k=0…20."
        table={
          <DataTableView caption="Binomial PMF for n=20." title="PMF table" columns={["k", "P(X=k)"]} rows={binomialBars.map((bar) => [String(bar.k), formatNumber(bar.p, 5)])} />
        }
      />
    );
    tableRows = [
      ["Exact k", String(k), formatNumber(pk, 6)],
      ["Interval", `${Math.ceil(low)}…${Math.floor(high)}`, formatNumber(probability, 6)],
      ["Total", "0…20", formatNumber(binomialCdf(20, 20, p), 6)],
    ];
  } else if (family === "poisson") {
    const pk = poissonPmf(lambda, k);
    probability = query === "exact" ? pk : poissonCdf(lambda, Math.floor(high)) - poissonCdf(lambda, Math.ceil(low) - 1);
    summary = `Poisson with λ=${formatNumber(lambda, 2)}. ${query === "exact" ? `Exactly ${k} events` : `Between ${Math.ceil(low)} and ${Math.floor(high)} events`} has probability ${formatPercent(probability, 2)}.`;
    chart = (
      <PmfChart
        bars={poissonBars}
        highlight={(index) => (query === "exact" ? index === k : index >= Math.ceil(low) && index <= Math.floor(high))}
        meanLine={lambda}
        xLabel="k events per interval"
        summary={summary}
        caption="The masses sum to 1 over the non-negative integers."
        table={
          <DataTableView caption="Poisson PMF for the selected λ." title="PMF table" columns={["k", "P(X=k)"]} rows={poissonBars.map((bar) => [String(bar.k), formatNumber(bar.p, 5)])} />
        }
      />
    );
    tableRows = [
      ["Exact k", String(k), formatNumber(pk, 6)],
      ["Interval", `${Math.ceil(low)}…${Math.floor(high)}`, formatNumber(probability, 6)],
      ["Total", "all k", "1.000000"],
    ];
  } else {
    const point = normalPdf(0, 0, sigma);
    probability = query === "exact" ? 0 : normalCdf(high, 0, sigma) - normalCdf(low, 0, sigma);
    summary =
      query === "exact"
        ? `A normal density at one exact point has probability zero, regardless of its height (${formatNumber(point, 4)} at x=0).`
        : `Normal with μ=0 and σ=${formatNumber(sigma, 2)}. The area between ${formatNumber(low, 2)} and ${formatNumber(high, 2)} is ${formatPercent(probability, 2)}.`;
    chart = (
      <DensityChart
        mu={0}
        sigma={sigma}
        xDomain={[-4 * sigma, 4 * sigma]}
        shades={query === "exact" ? [] : [{ kind: "between", from: low, to: high }]}
        markers={query === "exact" ? [{ x: 0, label: "point x = 0 → P = 0", color: "var(--chart-5)" }] : []}
        xLabel="Value"
        summary={summary}
        caption="A density curve is read by area. At a single point the area is zero; the height is not a probability."
      />
    );
    tableRows = [
      ["Density at 0", "0", formatNumber(point, 6)],
      ["P(X = 0)", "exact", "0.000000"],
      ["Interval", `${formatNumber(low, 2)}…${formatNumber(high, 2)}`, formatNumber(probability, 6)],
    ];
  }


  function reset() {
    setFamily("binomial");
    setQuery("interval");
    setP(0.4);
    setLambda(4);
    setSigma(1);
    setK(6);
    setA(2);
    setB(5);
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Switch the family, keep the semantics"
          description="A PMF bar and a PDF area are different objects. The interface changes its question when the support changes."
          action={<ResetButton onClick={() => reset()} />}
        >
          {chart}
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <Segmented
                label="Distribution family"
                value={family}
                onChange={(next) => {
                  setFamily(next);
                  setQuery(next === "normal" ? "interval" : "interval");
                  setA(next === "normal" ? -1 : 2);
                  setB(next === "normal" ? 1 : 5);
                }}
                options={[
                  { value: "binomial", label: "Binomial (discrete)" },
                  { value: "poisson", label: "Poisson (discrete)" },
                  { value: "normal", label: "Normal (continuous)" },
                ]}
                size="sm"
              />
              <Segmented
                label="Query"
                value={query}
                onChange={setQuery}
                options={[
                  { value: "exact", label: family === "normal" ? "Exact point" : "Exact count" },
                  { value: "interval", label: "Interval" },
                ]}
                size="sm"
              />

              {family === "binomial" ? (
                <LabSlider label="p" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} display={formatNumber(p, 2)} />
              ) : family === "poisson" ? (
                <LabSlider label="λ" value={lambda} min={0.5} max={20} step={0.1} onChange={setLambda} display={formatNumber(lambda, 1)} />
              ) : (
                <LabSlider label="σ" value={sigma} min={0.3} max={4} step={0.1} onChange={setSigma} display={formatNumber(sigma, 1)} />
              )}

              {query === "exact" ? (
                <LabSlider
                  label="Exact value"
                  value={k}
                  min={0}
                  max={family === "poisson" ? Math.max(10, Math.ceil(lambda + 4 * Math.sqrt(lambda))) : 20}
                  step={1}
                  onChange={setK}
                  display={family === "normal" ? "—" : String(k)}
                  disabled={family === "normal"}
                />
              ) : (
                <>
                  <LabSlider label="Lower bound" value={a} min={family === "normal" ? -3 : 0} max={family === "normal" ? 3 : 15} step={family === "normal" ? 0.1 : 1} onChange={setA} display={formatNumber(a, family === "normal" ? 2 : 0)} />
                  <LabSlider label="Upper bound" value={b} min={family === "normal" ? -3 : 0} max={family === "normal" ? 3 : 20} step={family === "normal" ? 0.1 : 1} onChange={setB} display={formatNumber(b, family === "normal" ? 2 : 0)} />
                </>
              )}
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "Selected probability", value: formatNumber(probability, 5), note: formatPercent(probability, 2) },
                { label: "Support", value: family === "normal" ? "all real x" : family === "binomial" ? "0…20" : "0, 1, 2, …" },
                { label: "Event", value: query === "exact" ? (family === "normal" ? "x = 0" : `k = ${k}`) : `${formatNumber(low, 2)}…${formatNumber(high, 2)}` },
                { label: "Point probability", value: family === "normal" ? "0" : "mass at k" },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="Under a continuous distribution, what is P(X = exactly 0.5000…)?"
          options={["Equal to the density height", "Zero", "Depends on σ"]}
          correct={1}
          explanation="A single point is an interval of width zero, so its area under a density is zero. Continuous probability is assigned to ranges; that is why we ask P(a < X < b) rather than P(X = k)."
        />
        <Interpretation tone="neutral" title="Different objects, different arithmetic:">
          {family === "normal"
            ? "Density × width gives probability. The curve height alone is not a probability, and the probability at one point is zero."
            : "Mass at one k is a probability; a cumulative probability adds adjacent masses. Discrete bars have gaps because non-integer counts do not exist."}
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "Each family has its own support and assumptions; switching the picture does not make the assumptions transferable.",
          "PMF masses sum to 1 over the countable support.",
          "A PDF integrates to 1 over the real line; density values can exceed 1 for narrow distributions.",
          "Cumulative probabilities are computed from PMFs/CDFs, not estimated from the drawing.",
        ]}
        note="This studio is for comparing probability semantics. Use the dedicated binomial, Poisson and normal labs for parameter exploration."
      />
      <SyntheticNote>Closed-form distributions; no observed data are used.</SyntheticNote>

      <DataTableView caption="The selected quantity alongside the exact and cumulative probabilities." title="Computation record" columns={["Quantity", "Setting", "Probability"]} rows={tableRows} align={["start", "start", "end"]} />
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Distribution morph studio"
      question="Why is a PMF bar not a PDF curve?"
      description="Switch between discrete and continuous families and change the event query. The probability semantics change with the support."
      tier="Signature"
    >
      {content}
    </LabShell>
  );

}
