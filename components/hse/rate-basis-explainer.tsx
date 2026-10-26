"use client";

// Rate-basis explainer for the HSE case study.
//
// VisualizationSpec
//   id: hse-rate-basis
//   sourcePage: /work/hse-analytics/ (fixture values from lib/case-studies.ts)
//   learningGoal: "Explain why TRIR and LTIFR are not comparable until their hour
//                  bases match, and compute the alignment from counts."
//   audience: intermediate
//   dataProvenance: synthetic (illustrative counts, labelled)
//   dataShape: counts → normalised rate; two bases
//   selectedForm: simulation (no chart)
//   visualType: calculator + exact-value table
//   library: native React + HTML inputs (no dependency added)
//   reason: the learning objective is the *mechanism* of a base change, which a
//           reader can only test by moving the numbers; a bar chart would invite
//           comparing lengths across different denominators, which is the error
//           the component exists to prevent.
//   interaction: [recordables, lost-time, hours worked, base selector, reset]
//   misconceptionsAddressed: ["TRIR and LTIFR can be compared as printed",
//                             "a lower number always means a safer site"]
//   mobileStrategy: single column; number inputs are full width; table wraps
//   accessibilityFallback: every derived value is in a captioned table with
//                          units, and each warning is text, not colour
//   validation: tests in tests/content/hse-rates.test.mjs (exact arithmetic,
//               monotonicity, subset rule, reset and invalid input)

import { useId, useMemo, useState } from "react";
import {
  ILLUSTRATIVE_COUNTS,
  formatInteger,
  formatRate,
  modelFor,
  type HseCounts,
} from "@/lib/hse/rates";

const INPUTS: { key: keyof HseCounts; label: string; hint: string; step: number; min: number }[] = [
  {
    key: "recordables",
    label: "Recordable cases",
    hint: "Every case that meets the recording criteria, including lost-time cases.",
    step: 1,
    min: 0,
  },
  {
    key: "lostTime",
    label: "Lost-time injuries",
    hint: "The subset of recordables that cost at least one day away from work.",
    step: 1,
    min: 0,
  },
  {
    key: "hours",
    label: "Hours worked",
    hint: "The same exposure window for both rates — all sites, whole period.",
    step: 100_000,
    min: 0,
  },
];

export function HseRateBasisExplainer() {
  const uid = useId();
  const [counts, setCounts] = useState<HseCounts>(ILLUSTRATIVE_COUNTS);
  const [base, setBase] = useState<"osha" | "million">("million");
  const model = useMemo(() => modelFor(counts), [counts]);

  const baseLabel =
    base === "osha" ? "per 200,000 hours (OSHA)" : "per 1,000,000 hours";

  const chosen = {
    trir: base === "osha" ? model.trirOnOsha : model.trirMillion,
    ltifr: base === "osha" ? model.ltifrOsha : model.ltifrOnMillion,
  };

  const update = (key: keyof HseCounts, raw: string) => {
    const value = raw === "" ? 0 : Number(raw);
    setCounts((current) => ({ ...current, [key]: Number.isFinite(value) ? value : 0 }));
  };

  return (
    <section
      id="rate-basis"
      aria-labelledby={`${uid}-title`}
      className="scroll-mt-24 rounded-3xl border border-border bg-card/40 p-5 sm:p-6"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Rate basis · interactive
      </p>
      <h2 id={`${uid}-title`} className="mt-2 text-xl font-medium tracking-tight">
        The same counts, two denominators
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
        TRIR is quoted per 200,000 hours and LTIFR per 1,000,000. Until both sit on the same base
        the two numbers cannot be compared at all. Change the counts below and watch the
        conversion do its work — the underlying cases never change.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {INPUTS.map((input) => (
          <div key={input.key}>
            <label
              htmlFor={`${uid}-${input.key}`}
              className="block text-xs font-medium text-foreground"
            >
              {input.label}
            </label>
            <input
              id={`${uid}-${input.key}`}
              type="number"
              inputMode="numeric"
              min={input.min}
              step={input.step}
              value={counts[input.key]}
              onChange={(event) => update(input.key, event.target.value)}
              aria-describedby={`${uid}-${input.key}-hint`}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm tabular-nums outline-none focus:border-primary"
            />
            <p
              id={`${uid}-${input.key}-hint`}
              className="mt-1 text-[11px] leading-5 text-muted-foreground"
            >
              {input.hint}
              {input.key === "hours" && Number.isFinite(counts.hours) ? (
                <span className="mt-0.5 block font-mono text-foreground/80">
                  = {formatInteger(counts.hours)} hours
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <label
            htmlFor={`${uid}-base`}
            className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            Reading base
          </label>
          <select
            id={`${uid}-base`}
            value={base}
            onChange={(event) => setBase(event.target.value as "osha" | "million")}
            className="mt-1 h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="million">per 1,000,000 hours</option>
            <option value="osha">per 200,000 hours (OSHA)</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setCounts(ILLUSTRATIVE_COUNTS);
            setBase("million");
          }}
          className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
        >
          Reset to the illustrative counts
        </button>
      </div>

      {model.validation.ok ? null : (
        <div role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-xs font-medium text-foreground">These counts cannot produce a rate.</p>
          <ul className="mt-1 space-y-0.5 text-[11px] leading-5 text-muted-foreground">
            {model.validation.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            On the selected base · {baseLabel}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[11px] text-muted-foreground">TRIR</dt>
              <dd className="font-mono text-2xl tabular-nums">{formatRate(chosen.trir)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">LTIFR</dt>
              <dd className="font-mono text-2xl tabular-nums">{formatRate(chosen.ltifr)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            {model.validation.ok ? (
              model.consistent ? (
                <>
                  Lost-time cases are a subset of recordables, so the recordable rate is the larger
                  of the two. That is the check that catches a mis-stated base.
                </>
              ) : (
                <>
                  On a common base the lost-time rate is <strong>higher</strong> than the
                  recordable rate, which cannot happen when both use the same population and
                  window. One of the two figures is on a different base or period.
                </>
              )
            ) : (
              "Fix the inputs above to see the interpretation."
            )}
          </p>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
            {model.ratio === null
              ? "With no lost-time injuries the ratio is undefined."
              : `The counts imply ${model.ratio.toFixed(1)} recordable cases per lost-time injury.`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <caption className="mb-2 text-left text-[11px] leading-5 text-muted-foreground">
              Every derived value, both bases. Cases: {formatInteger(counts.recordables)} recordable,{" "}
              {formatInteger(counts.lostTime)} lost-time, {formatInteger(counts.hours)} hours.
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-1.5 pr-3 font-medium">
                  Measure
                </th>
                <th scope="col" className="py-1.5 pr-3 text-right font-medium">
                  per 200,000 h
                </th>
                <th scope="col" className="py-1.5 text-right font-medium">
                  per 1,000,000 h
                </th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              <tr className="border-b border-border/60">
                <th scope="row" className="py-1.5 pr-3 font-sans font-normal text-muted-foreground">
                  TRIR
                </th>
                <td className="py-1.5 pr-3 text-right">{formatRate(model.trirOnOsha)}</td>
                <td className="py-1.5 text-right">{formatRate(model.trirMillion)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-1.5 pr-3 font-sans font-normal text-muted-foreground">
                  LTIFR
                </th>
                <td className="py-1.5 pr-3 text-right">{formatRate(model.ltifrOsha)}</td>
                <td className="py-1.5 text-right">{formatRate(model.ltifrOnMillion)}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
            Conversion: a rate per <span className="font-mono">B₁</span> hours becomes{" "}
            <span className="font-mono">r × B₂ ÷ B₁</span> per <span className="font-mono">B₂</span>{" "}
            hours. With the illustrative counts this reproduces the case study&apos;s published
            0.19 and 0.28 after rounding.
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
        Illustrative counts, not observations: the case study ships no fact-level dataset. The
        arithmetic here is exact; the numbers are a teaching fixture.
      </p>
    </section>
  );
}
