"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  histogram,
  mulberry32,
  normalRandom,
} from "@/lib/statistics/math";
import { CHART, ChartFigure, ChartFrame, COLORS, PLOT, DataTableView, xScale, yScale } from "@/components/statistics/chart-kit";
import {
  Assumptions,
  Interpretation,
  LabNumber,
  LabShell,
  LabSlider,
  Panel,
  PredictionPrompt,
  ReadoutGrid,
  ResetButton,
  Segmented,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

type Assignment = "random" | "covariate";

interface Participant {
  id: number;
  age: number;
  group: "A" | "B";
}

function shuffle<T>(values: T[], seed: number): T[] {
  const random = mulberry32(seed);
  const copy = values.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function ExperimentsLab({ compact = false }: { compact?: boolean }) {
  const [participants, setParticipants] = useState(60);
  const [spread, setSpread] = useState(10);
  const [seed, setSeed] = useState(3);
  const [assignment, setAssignment] = useState<Assignment>("random");

  const safeParticipants = Math.max(12, Math.min(200, Math.round(participants)));
  const safeSpread = Math.max(1, spread);

  const ages = useMemo(() => {
    // Participant ages are fixed across reshuffles. Only the assignment seed
    // changes, so "reshuffle" really holds the people constant.
    const random = mulberry32(2026 + 1201);
    return Array.from({ length: safeParticipants }, (_, index) => ({
      id: index + 1,
      age: Math.max(18, Math.min(75, Math.round(normalRandom(random, 38, safeSpread)))),
    }));
  }, [safeParticipants, safeSpread]);

  const assigned: Participant[] = useMemo(() => {
    if (assignment === "covariate") {
      const sorted = ages.slice().sort((a, b) => b.age - a.age);
      return sorted.map((person, index) => ({
        ...person,
        group: index % 2 === 0 ? ("A" as const) : ("B" as const),
      }));
    }
    const order = shuffle(ages, seed + 77);
    return order.map((person, index) => ({
      ...person,
      group: index % 2 === 0 ? ("A" as const) : ("B" as const),
    }));
  }, [ages, assignment, seed]);

  const groupA = assigned.filter((person) => person.group === "A");
  const groupB = assigned.filter((person) => person.group === "B");
  const meanA = groupA.reduce((total, person) => total + person.age, 0) / Math.max(1, groupA.length);
  const meanB = groupB.reduce((total, person) => total + person.age, 0) / Math.max(1, groupB.length);
  const imbalance = meanA - meanB;

  const shuffleDistribution = useMemo(() => {
    const differences: number[] = [];
    for (let run = 0; run < 200; run += 1) {
      const order = shuffle(ages, run * 31 + 7);
      let sumA = 0;
      let countA = 0;
      let sumB = 0;
      let countB = 0;
      order.forEach((person, index) => {
        if (index % 2 === 0) {
          sumA += person.age;
          countA += 1;
        } else {
          sumB += person.age;
          countB += 1;
        }
      });
      differences.push(sumA / countA - sumB / countB);
    }
    return differences;
  }, [ages]);

  const summary = `Randomization check. Group A mean age ${formatNumber(meanA, 1)}, group B ${formatNumber(meanB, 1)}; observed imbalance ${formatNumber(imbalance, 1)} years. Across 200 seeded shuffles of the same participants, imbalances vary around zero.`;


  function reset() {
    setParticipants(60);
    setSpread(10);
    setSeed(3);
    setAssignment("random");
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="One shuffle is not a guarantee"
          description="Each dot is a participant's age. Random assignment balances in expectation; a particular run can still be lopsided."
          action={<ResetButton onClick={() => reset()} />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "A · control", people: groupA, mean: meanA },
              { label: "B · treatment", people: groupB, mean: meanB },
            ].map((group) => (
              <div key={group.label} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-medium text-foreground">{group.label}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">mean {formatNumber(group.mean, 1)}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
                  {group.people.map((person) => (
                    <span
                      key={person.id}
                      className={person.group === "A" ? "rounded bg-[var(--chart-1)]/25 px-1.5 py-0.5 font-mono text-[9px] text-foreground" : "rounded bg-[var(--chart-2)]/25 px-1.5 py-0.5 font-mono text-[9px] text-foreground"}
                      title={`Participant ${person.id}: age ${person.age}`}
                    >
                      {person.age}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">{group.people.length} participants</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Distribution of mean-age imbalance over 200 random shuffles
            </p>
            <BalanceHistogram differences={shuffleDistribution} observed={imbalance} summary={summary} />
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              The histogram is a distribution of the imbalance under random assignment, not a confidence interval.
              Your current run is marked; an unusually large imbalance is a warning to check the randomization.
            </p>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <Segmented
                label="Assignment method"
                value={assignment}
                onChange={setAssignment}
                options={[
                  { value: "random", label: "Random assignment" },
                  { value: "covariate", label: "Balanced on age" },
                ]}
                size="sm"
              />
              <LabSlider label="Participants" value={safeParticipants} min={12} max={200} step={2} onChange={setParticipants} display={String(safeParticipants)} />
              <LabSlider label="Age spread (SD)" value={safeSpread} min={1} max={20} step={0.5} onChange={setSpread} display={formatNumber(safeSpread, 1)} />
              <LabNumber label="Seed" value={seed} min={1} max={9999} step={1} onChange={setSeed} hint="reshuffle with a new seed" />
              <button
                type="button"
                onClick={() => setSeed((current) => current + 1)}
                className="press inline-flex h-9 w-full items-center justify-center rounded-full bg-foreground px-4 text-xs font-medium text-background"
              >
                Reshuffle participants
              </button>
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "Mean A", value: formatNumber(meanA, 1) },
                { label: "Mean B", value: formatNumber(meanB, 1) },
                { label: "Imbalance", value: formatNumber(imbalance, 2), note: "years (A − B)", tone: Math.abs(imbalance) > 3 ? "danger" : "default" },
                { label: "n per group", value: `${groupA.length} / ${groupB.length}` },
                { label: "Assignment", value: assignment === "random" ? "random" : "age-balanced" },
                { label: "Seed", value: String(seed) },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="Does random assignment guarantee that the two groups have identical mean ages?"
          options={["Yes, by design", "No, only balance in expectation", "Only when n is odd"]}
          correct={1}
          explanation="Randomization is a probability statement about the assignment mechanism. Any single randomization can produce an imbalance; repeating it shows a distribution centred near zero."
        />
        <Interpretation tone={assignment === "covariate" ? "warning" : "neutral"} title={assignment === "covariate" ? "Balancing is a design choice:" : "Why randomize?"}>
          {assignment === "covariate"
            ? "Balancing the groups on age removes this particular covariate difference, but it can introduce selection complexity and does not automatically balance variables you did not measure."
            : "Random assignment makes the groups comparable in expectation, including on variables you did not measure. It does not guarantee a particular shuffle is balanced, and it does not fix measurement bias or non-compliance."}
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "Ages are synthetic draws from a normal distribution and are used as a single covariate.",
          "The randomized arm alternates assignment after a seeded shuffle; this is a teaching mechanism, not a production randomizer.",
          "Balance in expectation does not imply balance in every realised sample.",
          "Randomization addresses confounding at assignment; it does not address outcome measurement error, attrition, or non-compliance.",
        ]}
        note="The imbalance histogram is computed from 200 shuffles of the same participant set. It is a distribution of a design property, not a p-value."
      />
      <SyntheticNote>Seeded synthetic participants; no real people or ages are represented.</SyntheticNote>

      <DataTableView
        caption="The first twenty participants, their ages, and their assigned group."
        title="Assignment table (first 20)"
        columns={["ID", "Age", "Group"]}
        rows={assigned.slice(0, 20).map((person) => [String(person.id), String(person.age), person.group])}
        align={["start", "end", "end"]}
      />
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Assignment shuffle & comparable groups"
      question="Does randomization make the groups identical?"
      description="Reshuffle synthetic participants, compare age balance, and see the distribution of imbalance over many random assignments."
      tier="P1"
    >
      {content}
    </LabShell>
  );

}

function BalanceHistogram({
  differences,
  observed,
  summary,
}: {
  differences: number[];
  observed: number;
  summary: string;
}) {
  const result = histogram(differences, 18);
  const maxAbs = Math.max(4, ...differences.map((value) => Math.abs(value)), Math.abs(observed));
  const domain: [number, number] = [-maxAbs * 1.1, maxAbs * 1.1];
  const yMax = Math.max(...result.bins.map((bin) => bin.count), 1);
  const yDomain: [number, number] = [0, yMax * 1.2];
  return (
    <ChartFigure summary={summary}>
      <ChartFrame
        summary={summary}
        xDomain={domain}
        yDomain={yDomain}
        xLabel="Mean age difference (A − B), years"
        yLabel="Shuffle count"
        xFormat={(value) => formatNumber(value, 1)}
        yFormat={(value) => formatNumber(value, 0)}
        grid="y"
      >
        {result.bins.map((bin) => (
          <rect
            key={bin.x0}
            x={xScale(bin.x0, domain)}
            y={yScale(bin.count, yDomain)}
            width={Math.max(1, xScale(bin.x1, domain) - xScale(bin.x0, domain) - 1)}
            height={yScale(0, yDomain) - yScale(bin.count, yDomain)}
            fill={COLORS.population}
            opacity={0.5}
          />
        ))}
        <line x1={xScale(0, domain)} x2={xScale(0, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke="var(--border-strong)" strokeDasharray="3 3" />
        <line x1={xScale(observed, domain)} x2={xScale(observed, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.danger} strokeWidth={2} />
        <text x={xScale(observed, domain) + 4} y={CHART.top + 12} fontSize={9} fill={COLORS.danger}>
          this shuffle
        </text>
      </ChartFrame>
    </ChartFigure>
  );
}
