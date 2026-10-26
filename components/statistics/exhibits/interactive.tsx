"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FlaskConical,
  GitBranch,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Table2,
  Users,
} from "lucide-react";
import { Segmented } from "@/components/statistics/lab-kit";
import { cn } from "@/lib/utils";

const JOURNEY_STAGES = [
  {
    label: "Population / data",
    question: "Who or what is the question about, and what was actually observed?",
    output: "A defined population, sample and variable type.",
    href: "/learn/statistics/journey/foundations#s1",
    lab: null,
  },
  {
    label: "Description",
    question: "Where is the centre, how wide is the spread, and what shape is the data?",
    output: "Mean/median, SD/IQR, plots — statements about the observed sample.",
    href: "/learn/statistics/journey/describe#s4",
    lab: "/learn/statistics/labs/center-spread",
  },
  {
    label: "Probability",
    question: "What could have happened, and how likely is each event?",
    output: "A probability model with a sample space or density.",
    href: "/learn/statistics/journey/probability#s6",
    lab: "/learn/statistics/labs/probability",
  },
  {
    label: "Sampling",
    question: "How would the statistic vary if the study were repeated?",
    output: "Sampling distribution and standard error.",
    href: "/learn/statistics/journey/sampling#s11",
    lab: "/learn/statistics/labs/sampling",
  },
  {
    label: "Inference",
    question: "What range or claim is compatible with the data under a model?",
    output: "Confidence interval or test statistic and p-value.",
    href: "/learn/statistics/journey/sampling#s14",
    lab: "/learn/statistics/labs/confidence",
  },
  {
    label: "Decision",
    question: "What should be done, given evidence, effect size, cost and context?",
    output: "A qualified decision with an explicit limitation.",
    href: "/learn/statistics/journey/synthesis#s40",
    lab: "/learn/statistics/labs/business-decision",
  },
];

export function EvidenceJourney() {
  const [active, setActive] = useState(0);
  const stage = JOURNEY_STAGES[active];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {JOURNEY_STAGES.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={index === active}
            onClick={() => setActive(index)}
            className={cn(
              "relative rounded-xl border px-2.5 py-2 text-left text-[11px] leading-4 transition-colors",
              index === active
                ? "border-foreground bg-foreground text-background"
                : index < active
                  ? "border-emerald-500/30 bg-emerald-500/[0.08] text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            <span className="font-mono text-[9px]">{String(index + 1).padStart(2, "0")}</span>
            <span className="mt-0.5 block font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Stage {active + 1} of 6</p>
          <p className="mt-1 text-sm font-medium text-foreground">{stage.question}</p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            <strong className="font-medium text-foreground">What it produces:</strong> {stage.output}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link href={stage.href} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-foreground hover:border-border-strong">
            Open the source section <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
          {stage.lab ? (
            <Link href={stage.lab} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background">
              <FlaskConical className="h-3 w-3" aria-hidden="true" /> Open the lab
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const TYPE_CARDS = [
  { id: "customers", label: "Number of customers in a store", correct: "discrete", why: "A countable whole number (0, 1, 2, …), not a continuous measurement." },
  { id: "height", label: "Height (cm)", correct: "continuous", why: "Between any two heights there is another possible height; the scale is continuous." },
  { id: "city", label: "City name", correct: "nominal", why: "Labels with no natural order. A city is not “more” than another city." },
  { id: "satisfaction", label: "Satisfaction: Low / Medium / High", correct: "ordinal", why: "There is a natural order, but the distance between levels is not defined." },
  { id: "student-id", label: "Student ID number", correct: "nominal", why: "Digits can be labels. Averaging or adding IDs is meaningless." },
  { id: "temperature", label: "Temperature (°C)", correct: "continuous", why: "A continuous measurement on an interval scale." },
  { id: "defects", label: "Defects per 100 units", correct: "discrete", why: "A count of events, bounded and whole-numbered." },
  { id: "shirt", label: "Shirt size S / M / L", correct: "ordinal", why: "Ordered sizes, but the step from S to M need not equal M to L." },
] as const;

type TypeKey = (typeof TYPE_CARDS)[number]["correct"];
const TYPE_OPTIONS: { value: TypeKey; label: string }[] = [
  { value: "discrete", label: "Discrete" },
  { value: "continuous", label: "Continuous" },
  { value: "nominal", label: "Nominal" },
  { value: "ordinal", label: "Ordinal" },
];

export function TypeSorter() {
  const [answers, setAnswers] = useState<Record<string, TypeKey>>({});
  const answered = Object.keys(answers).length;
  const correct = TYPE_CARDS.filter((card) => answers[card.id] === card.correct).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
          Sort each observation. Feedback appears immediately; correct answers stay explained.
        </span>
        <span className="font-mono" aria-live="polite">
          {correct} / {TYPE_CARDS.length} correct · {answered} answered
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {TYPE_CARDS.map((card) => {
          const answer = answers[card.id];
          const isCorrect = answer === card.correct;
          return (
            <div key={card.id} className={cn("rounded-xl border bg-background p-3", answer ? (isCorrect ? "border-emerald-500/30" : "border-red-500/30") : "border-border")}>
              <p className="text-xs font-medium text-foreground">{card.label}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={answer === option.value}
                    onClick={() => setAnswers((current) => ({ ...current, [card.id]: option.value }))}
                    className={cn(
                      "inline-flex min-h-6 items-center rounded-full border px-2 py-0.5 text-[10px] transition-colors",
                      answer === option.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div aria-live="polite">
                {answer ? (
                  <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                    <strong className={isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}>
                      {isCorrect ? "Correct. " : `Not quite — ${card.correct}. `}
                    </strong>
                    {card.why}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setAnswers({})}
        className="press rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
      >
        Reset sorter
      </button>
    </div>
  );
}

const WORKFLOW = [
  { title: "Populations / groups", detail: "Define what is being compared and the unit of observation." },
  { title: "H₀ and Hₐ", detail: "State the null model and the alternative, including sidedness, before analysis." },
  { title: "Sample data", detail: "Collect data with a design that makes the comparison meaningful." },
  { title: "Appropriate statistic", detail: "Choose a statistic that maps to the question (mean difference, proportion difference, …)." },
  { title: "Test statistic and p-value", detail: "Standardise the observed result by its standard error under H₀; compute the tail." },
  { title: "Compare with α", detail: "Apply the pre-declared threshold. p≤α rejects; p>α fails to reject." },
  { title: "Conclusion with limits", detail: "State the evidence, the effect, the interval and what the design cannot establish." },
];

export function DecisionPath() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
      <ol className="space-y-1.5">
        {WORKFLOW.map((step, index) => (
          <li key={step.title}>
            <button
              type="button"
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left",
                index === active ? "border-foreground bg-card/60" : "border-border bg-background hover:border-border-strong",
              )}
            >
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px]", index === active ? "bg-foreground text-background" : "border border-border text-muted-foreground")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs text-foreground">{step.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Stage {active + 1}</p>
        <p className="mt-2 text-sm font-medium text-foreground">{WORKFLOW[active].title}</p>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">{WORKFLOW[active].detail}</p>
        {active >= 4 ? (
          <Link href="/learn/statistics/labs/p-value" className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-foreground underline decoration-border-strong underline-offset-4">
            Open the p-value observatory <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : null}
        <p className="mt-3 border-t border-border pt-2 text-[10px] leading-5 text-muted-foreground">
          The workflow is a discipline, not a guarantee. A clean computation cannot rescue a biased design or a
          hypothesis chosen after seeing the data.
        </p>
      </div>
    </div>
  );
}

export function BiasShields() {
  const [participant, setParticipant] = useState(true);
  const [assessor, setAssessor] = useState(true);
  const [analyst, setAnalyst] = useState(false);
  const [placebo, setPlacebo] = useState(true);
  const roles = [
    { id: "participant", label: "Participant", knows: !participant, toggle: setParticipant, value: participant },
    { id: "assessor", label: "Experimenter / assessor", knows: !assessor, toggle: setAssessor, value: assessor },
    { id: "analyst", label: "Analyst", knows: !analyst, toggle: setAnalyst, value: analyst },
  ];
  const protection = [participant, assessor, placebo, analyst].filter(Boolean).length;
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        {roles.map((role) => (
          <label key={role.id} className={cn("rounded-xl border p-3 text-xs", role.value ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-border bg-background")}>
            <span className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">{role.label}</span>
              <input type="checkbox" checked={role.value} onChange={(event) => role.toggle(event.target.checked)} className="h-4 w-4 accent-foreground" />
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[10px] leading-4 text-muted-foreground">
              {role.knows ? <ShieldOff className="h-3 w-3 text-amber-700 dark:text-amber-300" aria-hidden="true" /> : <ShieldCheck className="h-3 w-3 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />}
              {role.knows ? "knows the assignment" : "blinded to the assignment"}
            </span>
          </label>
        ))}
      </div>
      <label className={cn("flex items-start gap-2 rounded-xl border p-3 text-xs", placebo ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-border bg-background")}>
        <input type="checkbox" checked={placebo} onChange={(event) => setPlacebo(event.target.checked)} className="mt-0.5 h-4 w-4 accent-foreground" />
        <span>
          <span className="font-medium text-foreground">Placebo / sham control</span>
          <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">
            Controls expectation and attention, not just “doing nothing”. Not always possible or ethical.
          </span>
        </span>
      </label>
      <div className="rounded-xl border border-border bg-background p-3 text-[11px] leading-5 text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground">
          {protection >= 3 ? <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" aria-hidden="true" /> : <ShieldOff className="h-4 w-4 text-amber-700 dark:text-amber-300" aria-hidden="true" />}
          Protection score: {protection} / 4
        </p>
        <p className="mt-1">
          Double-blind means participants and the people administering or assessing the treatment do not know
          assignment. Blinding the analyst is good practice but is not what “double” refers to. A web A/B test can
          blind users but cannot usually blind the analyst to the assignment.
        </p>
      </div>
    </div>
  );
}

const SCENARIOS = {
  ad: {
    label: "Ad spend → sales",
    x: "Ad spend (predictor)",
    y: "Sales (response)",
    design: "Observational unless spend is randomized",
    caveat: "Higher spend may follow high-demand regions; seasonality and store size can confound.",
  },
  income: {
    label: "Age → income",
    x: "Age (predictor)",
    y: "Income (response)",
    design: "Observational",
    caveat: "Cohort, education and geography differ with age; a causal reading is unsupported.",
  },
  treatment: {
    label: "Treatment → conversion",
    x: "Treatment assignment (X)",
    y: "Conversion (Y)",
    design: "Causal if randomized and analysed as assigned",
    caveat: "Non-compliance, missing outcomes and multiple testing can still undermine the claim.",
  },
} as const;

export function VariableSwitchboard() {
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>("treatment");
  const current = SCENARIOS[scenario];
  return (
    <div className="space-y-3">
      <Segmented
        label="Scenario"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "ad", label: "Ad spend" },
          { value: "income", label: "Age" },
          { value: "treatment", label: "Treatment" },
        ]}
      />
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-xl border border-[var(--chart-1)]/30 bg-[var(--chart-1)]/10 p-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">X axis · predictor</p>
          <p className="mt-1 text-xs font-medium text-foreground">{current.x}</p>
        </div>
        <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-muted-foreground sm:rotate-0" aria-hidden="true" />
        <div className="rounded-xl border border-[var(--chart-2)]/30 bg-[var(--chart-2)]/10 p-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Y axis · response</p>
          <p className="mt-1 text-xs font-medium text-foreground">{current.y}</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-background p-3 text-[11px] leading-5 text-muted-foreground">
        <p className="font-medium text-foreground">Design: {current.design}</p>
        <p className="mt-1">{current.caveat}</p>
      </div>
    </div>
  );
}

const CAPSTONE_STEPS = [
  { title: "State the question and the unit", detail: "Population, sample, outcome, comparison. Is the goal description, estimation, testing or a causal decision?" },
  { title: "Name the design", detail: "Observational or randomized? What is the assignment unit? What could confound the comparison?" },
  { title: "Check the data and assumptions", detail: "Independence, shape, missingness, denominators, measurement. Reject a method whose assumptions fail." },
  { title: "Compute and report", detail: "Effect size with units, interval, test statistic and p-value, sample size, seed or data source." },
  { title: "Decide and state the limitation", detail: "Compare with a pre-specified meaningful threshold. Name the assumption that would change the conclusion." },
];

export function CapstoneChecklist() {
  const [done, setDone] = useState<boolean[]>(Array(CAPSTONE_STEPS.length).fill(false));
  const completed = done.filter(Boolean).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <p className="text-[11px] text-muted-foreground">A transferable route, not a score.</p>
        <p className="font-mono text-[11px] text-foreground" aria-live="polite">
          {completed} / {CAPSTONE_STEPS.length} checked
        </p>
      </div>
      <ol className="space-y-2">
        {CAPSTONE_STEPS.map((step, index) => (
          <li key={step.title}>
            <label className={cn("flex cursor-pointer items-start gap-2.5 rounded-xl border p-3", done[index] ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-border bg-background")}>
              <input
                type="checkbox"
                checked={done[index]}
                onChange={(event) => setDone((current) => current.map((value, position) => (position === index ? event.target.checked : value)))}
                className="mt-0.5 h-4 w-4 shrink-0 accent-foreground"
              />
              <span>
                <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                  {done[index] ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
                  {index + 1}. {step.title}
                </span>
                <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">{step.detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Link href="/learn/statistics/decision" className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background">
          <GitBranch className="h-3 w-3" aria-hidden="true" /> Choose a tool
        </Link>
        <Link href="/learn/statistics/labs/business-decision" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
          <Users className="h-3 w-3" aria-hidden="true" /> Run the decision room
        </Link>
        <Link href="/learn/statistics/cheatsheet" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
          <Sparkles className="h-3 w-3" aria-hidden="true" /> Print the field guide
        </Link>
      </div>
    </div>
  );
}
