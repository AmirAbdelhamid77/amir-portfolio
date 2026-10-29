"use client";

import { useMemo, useState } from "react";
import { formatNumber, formatPercent } from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import {
  Assumptions,
  Interpretation,
  LabSelect,
  LabShell,
  Panel,
  PredictionPrompt,
  PresetButtons,
  ReadoutGrid,
  ResetButton,
  Segmented,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

type Scenario = "coin" | "die" | "dice";

interface Outcome {
  id: string;
  label: string;
  a: boolean;
  b: boolean;
}

interface EventDef {
  id: string;
  label: string;
  test: (values: number[]) => boolean;
}

const SCENARIOS: Record<
  Scenario,
  { label: string; outcomes: { id: string; label: string; values: number[] }[]; events: EventDef[] }
> = {
  coin: {
    label: "Two coin flips",
    outcomes: [
      { id: "HH", label: "HH", values: [1, 1] },
      { id: "HT", label: "HT", values: [1, 0] },
      { id: "TH", label: "TH", values: [0, 1] },
      { id: "TT", label: "TT", values: [0, 0] },
    ],
    events: [
      { id: "at-least-one-head", label: "At least one head", test: (v) => v[0] + v[1] >= 1 },
      { id: "same", label: "Both flips the same", test: (v) => v[0] === v[1] },
      { id: "first-head", label: "First flip is head", test: (v) => v[0] === 1 },
      { id: "at-least-one-tail", label: "At least one tail", test: (v) => v[0] + v[1] <= 1 },
    ],
  },
  die: {
    label: "One fair die",
    outcomes: [1, 2, 3, 4, 5, 6].map((value) => ({ id: String(value), label: String(value), values: [value] })),
    events: [
      { id: "even", label: "Even", test: (v) => v[0] % 2 === 0 },
      { id: "at-least-five", label: "At least 5", test: (v) => v[0] >= 5 },
      { id: "prime", label: "Prime (2, 3, 5)", test: (v) => [2, 3, 5].includes(v[0]) },
      { id: "less-than-three", label: "Less than 3", test: (v) => v[0] < 3 },
    ],
  },
  dice: {
    label: "Two fair dice",
    outcomes: Array.from({ length: 6 }, (_, row) =>
      Array.from({ length: 6 }, (_, column) => ({
        id: `${row + 1}-${column + 1}`,
        label: `${row + 1},${column + 1}`,
        values: [row + 1, column + 1],
      })),
    ).flat(),
    events: [
      { id: "sum-nine", label: "Sum ≥ 9", test: (v) => v[0] + v[1] >= 9 },
      { id: "both-even", label: "Both dice even", test: (v) => v[0] % 2 === 0 && v[1] % 2 === 0 },
      { id: "doubles", label: "Doubles", test: (v) => v[0] === v[1] },
      { id: "first-six", label: "First die is 6", test: (v) => v[0] === 6 },
      { id: "sum-seven", label: "Sum = 7", test: (v) => v[0] + v[1] === 7 },
    ],
  },
};

export function ProbabilityLab({ compact = false }: { compact?: boolean }) {
  const [scenario, setScenario] = useState<Scenario>("dice");
  const [aId, setAId] = useState("sum-nine");
  const [bId, setBId] = useState("first-six");

  const config = SCENARIOS[scenario];
  const eventA = config.events.find((event) => event.id === aId) ?? config.events[0];
  const eventB = config.events.find((event) => event.id === bId) ?? config.events[1] ?? config.events[0];
  const outcomes: Outcome[] = useMemo(
    () =>
      config.outcomes.map((outcome) => ({
        ...outcome,
        a: eventA.test(outcome.values),
        b: eventB.test(outcome.values),
      })),
    [config, eventA, eventB],
  );
  const total = outcomes.length;
  const countA = outcomes.filter((outcome) => outcome.a).length;
  const countB = outcomes.filter((outcome) => outcome.b).length;
  const countBoth = outcomes.filter((outcome) => outcome.a && outcome.b).length;
  const pA = countA / total;
  const pB = countB / total;
  const pBoth = countBoth / total;
  const pUnion = pA + pB - pBoth;
  const pAGivenB = countB > 0 ? pBoth / pB : Number.NaN;
  const independent = Math.abs(pBoth - pA * pB) < 1e-12;
  const exclusive = countBoth === 0;
  const gridColumns = scenario === "dice" ? 6 : scenario === "die" ? 6 : 2;

  const summary = `${config.label}: P(A)=${formatPercent(pA, 1)}, P(B)=${formatPercent(pB, 1)}, P(A∩B)=${formatPercent(pBoth, 1)}, P(A|B)=${formatNumber(pAGivenB, 3)}. ${independent ? "The events are independent." : "The events are not independent."}`;

  function changeScenario(next: Scenario) {
    setScenario(next);
    setAId(SCENARIOS[next].events[0].id);
    setBId(SCENARIOS[next].events[1]?.id ?? SCENARIOS[next].events[0].id);
  }


  function reset() {
    setScenario("dice");
    setAId("sum-nine");
    setBId("first-six");
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="The sample space is the whole picture"
          description="Every cell is one equally likely outcome. Selecting A and B colours the same cells; P(A|B) restricts the denominator to B."
          action={<ResetButton onClick={() => reset()} />}
        >
          <div
            className="mx-auto grid max-w-md gap-1"
            style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
            role="img"
            aria-label={summary}
          >
            {outcomes.map((outcome) => {
              const both = outcome.a && outcome.b;
              const onlyA = outcome.a && !outcome.b;
              const onlyB = !outcome.a && outcome.b;
              return (
                <div
                  key={outcome.id}
                  className={
                    both
                      ? "flex aspect-square items-center justify-center rounded-md border border-[var(--chart-4)] bg-[var(--chart-4)]/25 font-mono text-[10px] text-foreground"
                      : onlyA
                        ? "flex aspect-square items-center justify-center rounded-md border border-[var(--chart-1)] bg-[var(--chart-1)]/20 font-mono text-[10px] text-foreground"
                        : onlyB
                          ? "flex aspect-square items-center justify-center rounded-md border border-[var(--chart-2)] bg-[var(--chart-2)]/20 font-mono text-[10px] text-foreground"
                          : "flex aspect-square items-center justify-center rounded-md border border-border bg-card/40 font-mono text-[10px] text-muted-foreground"
                  }
                  title={`${outcome.label}: ${outcome.a ? "A" : "not A"}, ${outcome.b ? "B" : "not B"}`}
                >
                  {outcome.label}
                </div>
              );
            })}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <li>■ A only</li>
            <li>■ B only</li>
            <li>■ A ∩ B</li>
            <li>□ neither</li>
          </ul>

          <div className="mt-4 space-y-2">
            {[
              { label: "P(A)", value: pA, color: "var(--chart-1)" },
              { label: "P(B)", value: pB, color: "var(--chart-2)" },
              { label: "P(A ∩ B)", value: pBoth, color: "var(--chart-4)" },
              { label: "P(A ∪ B)", value: pUnion, color: "var(--chart-3)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">{item.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, item.value * 100))}%`, backgroundColor: item.color }}
                  />
                </span>
                <span className="w-14 text-end font-mono text-[10px] text-foreground">{formatNumber(item.value, 3)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <DataTableView
              caption="Every outcome in the sample space and whether it belongs to A, B, both or neither."
              title="Outcome table"
              columns={["Outcome", "A", "B"]}
              rows={outcomes.map((outcome) => [
                outcome.label,
                outcome.a ? "yes" : "no",
                outcome.b ? "yes" : "no",
              ])}
              align={["start", "end", "end"]}
            />
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <Segmented
                label="Scenario"
                value={scenario}
                onChange={changeScenario}
                options={[
                  { value: "coin", label: "2 coins" },
                  { value: "die", label: "1 die" },
                  { value: "dice", label: "2 dice" },
                ]}
                size="sm"
              />
              <LabSelect
                label="Event A"
                value={eventA.id}
                options={config.events.map((event) => ({ value: event.id, label: event.label }))}
                onChange={setAId}
              />
              <LabSelect
                label="Event B"
                value={eventB.id}
                options={config.events.map((event) => ({ value: event.id, label: event.label }))}
                onChange={setBId}
              />
              <PresetButtons
                presets={[
                  { id: "independent", label: "Independent flips" },
                  { id: "exclusive", label: "Mutually exclusive" },
                  { id: "conditional", label: "Conditional dice" },
                ]}
                onSelect={(id) => {
                  if (id === "independent") {
                    setScenario("coin");
                    setAId("first-head");
                    setBId("at-least-one-tail");
                  } else if (id === "exclusive") {
                    setScenario("die");
                    setAId("even");
                    setBId("prime");
                  } else {
                    setScenario("dice");
                    setAId("sum-nine");
                    setBId("first-six");
                  }
                }}
              />
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "P(A)", value: formatNumber(pA, 4) },
                { label: "P(B)", value: formatNumber(pB, 4) },
                { label: "P(A ∩ B)", value: formatNumber(pBoth, 4) },
                { label: "P(A ∪ B)", value: formatNumber(pUnion, 4) },
                { label: "P(A | B)", value: formatNumber(pAGivenB, 4) },
                { label: "P(A)·P(B)", value: formatNumber(pA * pB, 4) },
                { label: "Count A / B / both", value: `${countA} / ${countB} / ${countBoth}` },
                {
                  label: "Independent?",
                  value: independent ? "Yes" : "No",
                  tone: independent ? "default" : "danger",
                },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="If A and B are mutually exclusive and both have positive probability, can they be independent?"
          options={["Yes", "No", "Only if P(A)=P(B)"]}
          correct={1}
          explanation="Mutually exclusive means P(A∩B)=0. Independence requires P(A∩B)=P(A)P(B), which is positive when both probabilities are positive. A zero product cannot equal a positive probability, so the two ideas are incompatible here."
        />
        <Interpretation tone={exclusive ? "warning" : "neutral"} title={exclusive ? "Mutually exclusive, not independent:" : "Independence check:"}>
          {exclusive
            ? "The events cannot happen together. That is information: knowing B occurred changes the chance of A to zero. Independence would mean B tells you nothing about A."
            : independent
              ? "P(A∩B) equals P(A)P(B), so knowing B does not change the probability of A in this sample space."
              : "P(A∩B) differs from P(A)P(B), so the events are dependent: conditioning on B changes the probability of A."}
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "Every listed outcome is equally likely. A biased coin or loaded die would need different weights.",
          "The sample space is complete and outcomes are mutually exclusive.",
          "P(A|B) is undefined when P(B)=0; the readout reports — in that case.",
          "Independence is a property of the probability measure, not a visual impression from the grid.",
        ]}
        note="The grid enumerates a fair model exactly. It is not a simulation and contains no sampling error."
      />
      <SyntheticNote>
        Coins and dice are fair by definition here. No real gambling, user or experiment data is involved.
      </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Probability space lab"
      question="What is the difference between independent and mutually exclusive?"
      description="Select two events on a finite sample space and read the complement, intersection, union and conditional from the same cells."
      tier="P1"
    >
      {content}
    </LabShell>
  );

}
