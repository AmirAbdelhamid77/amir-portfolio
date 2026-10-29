import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  CircleHelp,
  FlaskConical,
  GitBranch,
  MoveRight,
  ShieldQuestion,
  TriangleAlert,
  Users,
} from "lucide-react";
import { FORMULAS, MYTHS, SECTIONS, type Myth } from "@/lib/statistics/content";
import { COLORS, xScale } from "@/components/statistics/chart-kit";
import { MathBlock } from "@/components/statistics/math";
import { formatNumber } from "@/lib/statistics/math";

export function BranchCompare() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          Descriptive
        </p>
        <p className="mt-2 text-sm text-foreground">What do these observations say?</p>
        <svg viewBox="0 0 260 110" className="mt-3 h-auto w-full" role="img" aria-label="A sample histogram with a mean marker and an SD label.">
          {[18, 34, 52, 61, 48, 30, 16].map((height, index) => (
            <rect key={index} x={12 + index * 34} y={90 - height} width={24} height={height} rx={2} fill={COLORS.sample} opacity={0.55} />
          ))}
          <line x1={12} x2={248} y1={92} y2={92} stroke="var(--border-strong)" />
          <line x1={130} x2={130} y1={18} y2={92} stroke={COLORS.observed} strokeDasharray="3 3" />
          <text x={134} y={26} fontSize={8} fill="var(--muted-foreground)">x̄ = 8.3</text>
          <text x={12} y={106} fontSize={8} fill="var(--muted-foreground)">observed sessions only</text>
        </svg>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
          Stops at the sample: mean, median, spread, plots. No claim beyond these 40 observations.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
          Inferential
        </p>
        <p className="mt-2 text-sm text-foreground">What might the population mean be?</p>
        <svg viewBox="0 0 260 110" className="mt-3 h-auto w-full" role="img" aria-label="A single confidence interval around an uncertain population mean.">
          <line x1={12} x2={248} y1={70} y2={70} stroke="var(--border-strong)" />
          <line x1={130} x2={130} y1={20} y2={92} stroke={COLORS.population} strokeDasharray="4 3" />
          <line x1={70} x2={190} y1={55} y2={55} stroke={COLORS.sample} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
          <circle cx={130} cy={55} r={4} fill={COLORS.observed} />
          <text x={132} y={26} fontSize={8} fill="var(--population, var(--chart-1))">μ unknown, fixed</text>
          <text x={12} y={106} fontSize={8} fill="var(--muted-foreground)">interval + assumptions</text>
        </svg>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
          Adds a sampling model, uncertainty and assumptions. The parameter is fixed; the interval is the procedure.
        </p>
      </div>
    </div>
  );
}

export function CauseResponse() {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="grid items-center gap-2 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Design</p>
          <p className="mt-1 text-xs font-medium text-foreground">Random assignment</p>
        </div>
        <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-muted-foreground sm:rotate-0" aria-hidden="true" />
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Manipulation</p>
          <p className="mt-1 text-xs font-medium text-foreground">Treatment vs control</p>
        </div>
        <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-muted-foreground sm:rotate-0" aria-hidden="true" />
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Measurement</p>
          <p className="mt-1 text-xs font-medium text-foreground">Response</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-[11px] leading-5 text-muted-foreground sm:grid-cols-2">
        <p className="rounded-lg border border-dashed border-border p-2">
          Competing influences are meant to be balanced by assignment, not wished away.
        </p>
        <p className="rounded-lg border border-dashed border-border p-2">
          No manipulation → no causal claim from this diagram alone.
        </p>
      </div>
    </div>
  );
}

export function ComparableGroups() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { title: "Observed imbalance", treatment: 25, control: 50, note: "Age differs; sales may follow age, not treatment." },
        { title: "Matched / adjusted", treatment: 38, control: 39, note: "Comparable on the measured covariate — if the model is right." },
        { title: "Randomized", treatment: 40, control: 41, note: "Balanced in expectation; this run still differs slightly." },
      ].map((group) => (
        <div key={group.title} className="rounded-xl border border-border bg-background p-3">
          <p className="text-xs font-medium text-foreground">{group.title}</p>
          <div className="mt-2 space-y-2">
            {[
              { label: "Treatment", value: group.treatment, color: "var(--chart-2)" },
              { label: "Control", value: group.control, color: "var(--chart-1)" },
            ].map((arm) => (
              <div key={arm.label}>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{arm.label} mean age</span>
                  <span className="font-mono">{arm.value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-border">
                  <div className="h-full rounded-full" style={{ width: `${(arm.value / 60) * 100}%`, backgroundColor: arm.color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">{group.note}</p>
        </div>
      ))}
    </div>
  );
}

export function ExperimentBlueprint() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Two-arm A/B</p>
        <div className="mt-3 space-y-2">
          <div className="rounded-lg border border-border bg-card/40 px-3 py-2 text-xs text-foreground">Eligible users</div>
          <div className="flex justify-center text-muted-foreground"><ArrowDown className="h-3 w-3" aria-hidden="true" /></div>
          <div className="rounded-lg border border-border bg-card/40 px-3 py-2 text-xs text-foreground">Random assignment</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[var(--chart-1)]/30 bg-[var(--chart-1)]/10 px-2 py-2 text-center text-xs">A · control</div>
            <div className="rounded-lg border border-[var(--chart-2)]/30 bg-[var(--chart-2)]/10 px-2 py-2 text-center text-xs">B · treatment</div>
          </div>
          <p className="text-[10px] leading-4 text-muted-foreground">One treatment factor, two levels. The assignment unit is the user here; it must match the analysis unit.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Multi-arm RCT</p>
        <div className="mt-3 space-y-2">
          <div className="rounded-lg border border-border bg-card/40 px-3 py-2 text-xs text-foreground">Eligible participants</div>
          <div className="flex justify-center text-muted-foreground"><ArrowDown className="h-3 w-3" aria-hidden="true" /></div>
          <div className="rounded-lg border border-border bg-card/40 px-3 py-2 text-xs text-foreground">Random assignment</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-[var(--chart-1)]/30 bg-[var(--chart-1)]/10 px-2 py-2 text-center text-[10px]">Control</div>
            <div className="rounded-lg border border-[var(--chart-2)]/30 bg-[var(--chart-2)]/10 px-2 py-2 text-center text-[10px]">Dose 1</div>
            <div className="rounded-lg border border-[var(--chart-3)]/30 bg-[var(--chart-3)]/10 px-2 py-2 text-center text-[10px]">Dose 2</div>
          </div>
          <p className="text-[10px] leading-4 text-muted-foreground">An RCT is not defined by having exactly two arms. A/B testing is one simple randomized design.</p>
        </div>
      </div>
    </div>
  );
}

export function CausationGap() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-background p-3">
        <p className="text-xs font-medium text-foreground">Observed co-movement</p>
        <svg viewBox="0 0 280 150" className="mt-2 h-auto w-full" role="img" aria-label="An upward scatter of water cost against life expectancy, labelled r equals 0.61 association only.">
          {Array.from({ length: 14 }, (_, index) => {
            const x = 24 + index * 17 + ((index * 7) % 9);
            const y = 126 - index * 6 - ((index * 11) % 14);
            return <circle key={index} cx={x} cy={y} r={3} fill="var(--chart-1)" opacity={0.7} />;
          })}
          <line x1={24} x2={262} y1={132} y2={132} stroke="var(--border-strong)" />
          <line x1={24} x2={24} y1={12} y2={132} stroke="var(--border-strong)" />
          <text x={132} y={16} fontSize={9} fill="var(--muted-foreground)">r = 0.61 · association</text>
          <text x={80} y={146} fontSize={8} fill="var(--muted-foreground)">water cost →</text>
        </svg>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Illustrative values from the source example, not a measured dataset.</p>
      </div>
      <div className="rounded-xl border border-border bg-background p-3">
        <p className="text-xs font-medium text-foreground">Causal claim</p>
        <svg viewBox="0 0 280 150" className="mt-2 h-auto w-full" role="img" aria-label="A directed acyclic graph with economic strength affecting both water cost and life expectancy; a direct arrow from water cost to life expectancy is crossed out.">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
            </marker>
          </defs>
          <rect x={95} y={10} width={90} height={26} rx={6} fill="var(--chart-3)" opacity={0.2} stroke="var(--chart-3)" />
          <text x={140} y={27} textAnchor="middle" fontSize={9} fill="var(--foreground)">Economic strength</text>
          <rect x={16} y={96} width={82} height={26} rx={6} fill="var(--card)" stroke="var(--border-strong)" />
          <text x={57} y={113} textAnchor="middle" fontSize={9} fill="var(--foreground)">Water cost</text>
          <rect x={182} y={96} width={82} height={26} rx={6} fill="var(--card)" stroke="var(--border-strong)" />
          <text x={223} y={113} textAnchor="middle" fontSize={9} fill="var(--foreground)">Life expectancy</text>
          <line x1={118} y1={36} x2={68} y2={96} stroke="var(--muted-foreground)" markerEnd="url(#arrow)" />
          <line x1={162} y1={36} x2={212} y2={96} stroke="var(--muted-foreground)" markerEnd="url(#arrow)" />
          <line x1={98} y1={109} x2={180} y2={109} stroke="var(--danger)" strokeDasharray="4 3" />
          <text x={139} y={88} textAnchor="middle" fontSize={8} fill="var(--danger)">NOT ESTABLISHED</text>
        </svg>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">The dashed arrow is the claim the association cannot license. A third variable is enough to explain the slope.</p>
      </div>
    </div>
  );
}

export function EvidenceChoice() {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {[
        { icon: GitBranch, title: "Association", body: "Do X and Y move together? Use a scatterplot and r. Conclusion: association, not cause.", color: "var(--chart-1)" },
        { icon: FlaskConical, title: "Causal comparison", body: "Did the treatment change the response? Requires a design with control and assignment. Conclusion: causal, within assumptions.", color: "var(--chart-2)" },
        { icon: ShieldQuestion, title: "Not enough", body: "Strong r from an observational sample cannot identify the direction or rule out confounding.", color: "var(--chart-3)" },
      ].map((item) => (
        <div key={item.title} className="rounded-xl border border-border bg-background p-3">
          <item.icon className="h-4 w-4" style={{ color: item.color }} aria-hidden="true" />
          <p className="mt-2 text-xs font-medium text-foreground">{item.title}</p>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export function MentalModel() {
  const layers = [
    { title: "Population", detail: "The real process, usually unknown", color: "var(--chart-1)" },
    { title: "Sample", detail: "Observed values; sampling variability enters", color: "var(--chart-2)" },
    { title: "Statistic", detail: "x̄, s, p̂; varies from sample to sample", color: "var(--chart-3)" },
    { title: "Sampling distribution", detail: "Model for that variability; SE", color: "var(--chart-4)" },
    { title: "Inference", detail: "Interval or test under assumptions", color: "var(--chart-5)" },
    { title: "Decision", detail: "Evidence + effect + cost + context", color: "var(--foreground)" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <ol className="grid gap-2 sm:grid-cols-3">
        {layers.map((layer, index) => (
          <li key={layer.title} className="relative rounded-xl border border-border bg-card/30 p-3">
            <span className="font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
            <p className="mt-1 text-xs font-medium text-foreground">{layer.title}</p>
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{layer.detail}</p>
            <span aria-hidden="true" className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ backgroundColor: layer.color }} />
          </li>
        ))}
      </ol>
      <div className="mt-3 grid gap-2 text-[10px] leading-4 text-muted-foreground sm:grid-cols-2">
        <p className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/[0.05] p-2">
          <strong className="font-medium text-foreground">Uncertainty</strong> enters at the sample → statistic → sampling
          distribution link. Ignoring it turns a point estimate into a false certainty.
        </p>
        <p className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/[0.05] p-2">
          <strong className="font-medium text-foreground">Confounding</strong> is a population-level alternative
          explanation. A test on an observational sample does not remove it; a design must.
        </p>
      </div>
    </div>
  );
}

export function MythCards({ myths = MYTHS }: { myths?: readonly Myth[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {myths.map((myth) => (
        <details key={myth.id} className="group rounded-xl border border-border bg-background">
          <summary className="flex cursor-pointer list-none items-start gap-2 p-3">
            <span className="mt-0.5 rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-red-700 dark:text-red-300">
              {myth.verdict}
            </span>
            <span className="flex-1 text-xs font-medium leading-5 text-foreground">{myth.claim}</span>
            <span aria-hidden="true" className="text-muted-foreground transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="border-t border-border p-3">
            <p className="flex items-start gap-1.5 text-[11px] leading-5 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              {myth.evidence}
            </p>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-foreground">
              <BadgeCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
              {myth.correction}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href={`/learn/statistics/journey/${SECTIONS.find((section) => section.number === myth.section)?.journey ?? "synthesis"}#s${myth.section}`}
                className="text-[10px] text-foreground underline decoration-border-strong underline-offset-4"
              >
                Read §{myth.section}
              </Link>
              {myth.lab ? (
                <Link href={`/learn/statistics/labs/${myth.lab}`} className="text-[10px] text-muted-foreground hover:text-foreground">
                  Open the lab
                </Link>
              ) : null}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

export function FormulaSpotlight() {
  const picks = ["mean", "binomial-pmf", "normal-pdf", "p-value"];
  const entries = picks
    .map((id) => FORMULAS.find((formula) => formula.id === id))
    .filter((formula): formula is (typeof FORMULAS)[number] => Boolean(formula));
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map((formula) => (
          <article key={formula.id} className="rounded-xl border border-border bg-background p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formula.group}</p>
            <p className="mt-1 text-xs font-medium text-foreground">{formula.title}</p>
            <div className="mt-2 overflow-x-auto">
              <MathBlock tex={formula.tex} display />
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground" dir="ltr">
              {formula.plain}
            </p>
          </article>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Open the{" "}
        <Link href="/learn/statistics/formulas" className="text-foreground underline decoration-border-strong underline-offset-4">
          formula workbench
        </Link>{" "}
        for the full index with substitution, conditions and section links.
      </p>
    </div>
  );
}

export function CheatSheetPreview() {
  const rows = [
    { concept: "Centre", question: "What is a typical value?", formula: "x̄ / median", href: "/learn/statistics/journey/describe#s4" },
    { concept: "Spread", question: "How widely do values vary?", formula: "s / IQR", href: "/learn/statistics/journey/describe#s5" },
    { concept: "Binomial", question: "How many successes in n fixed trials?", formula: "C(n,k)pᵏ(1−p)ⁿ⁻ᵏ", href: "/learn/statistics/journey/distributions#s8" },
    { concept: "Normal", question: "What area lies beyond x?", formula: "z=(x−μ)/σ", href: "/learn/statistics/journey/distributions#s9" },
    { concept: "Poisson", question: "How many events in a fixed interval?", formula: "e^(−λ)λᵏ/k!", href: "/learn/statistics/journey/distributions#s10" },
    { concept: "Standard error", question: "How variable is the mean?", formula: "σ/√n", href: "/learn/statistics/journey/sampling#s13" },
    { concept: "Interval", question: "What range is compatible?", formula: "estimate ± critical×SE", href: "/learn/statistics/journey/sampling#s14" },
    { concept: "Test", question: "How unusual under H₀?", formula: "p ≤ α → reject", href: "/learn/statistics/journey/hypothesis#s21" },
    { concept: "Correlation", question: "How strong is the linear association?", formula: "r ∈ [−1,1]", href: "/learn/statistics/journey/relationships#s30" },
    { concept: "Decision", question: "Is it worth acting on?", formula: "evidence + effect + cost", href: "/learn/statistics/journey/synthesis#s40" },
  ];
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border" tabIndex={0}>
        <table className="w-full border-collapse text-[11px]">
          <caption className="p-2 text-start text-[10px] text-muted-foreground">A compact field guide. Each row links back to the full conditions.</caption>
          <thead>
            <tr className="border-b border-border bg-card/60">
              <th scope="col" className="px-2 py-1.5 text-start font-medium">Concept</th>
              <th scope="col" className="px-2 py-1.5 text-start font-medium">Question</th>
              <th scope="col" className="px-2 py-1.5 text-start font-medium">Quick form</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.concept} className="border-b border-border last:border-0">
                <td className="px-2 py-1.5">
                  <Link href={row.href} className="text-foreground underline decoration-border-strong underline-offset-4">
                    {row.concept}
                  </Link>
                </td>
                <td className="px-2 py-1.5 text-muted-foreground">{row.question}</td>
                <td className="px-2 py-1.5 font-mono text-foreground" dir="ltr">{row.formula}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Print the full{" "}
        <Link href="/learn/statistics/cheatsheet" className="text-foreground underline decoration-border-strong underline-offset-4">
          one-page field guide
        </Link>{" "}
        for the assumptions and cautions that must travel with each quick form.
      </p>
    </div>
  );
}

export function CausalTrapNote() {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-3 text-[11px] leading-5 text-muted-foreground">
      <MoveRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      A large sample narrows uncertainty; it does not break the arrow between a confounder and the outcome. Design,
      not sample size, is what licenses a causal claim.
    </p>
  );
}

export function TinyInterval({ lower, upper, point, label }: { lower: number; upper: number; point: number; label: string }) {
  const domain: [number, number] = [Math.min(lower, point) - 1, Math.max(upper, point) + 1];
  return (
    <svg viewBox="0 0 260 60" className="h-auto w-full" role="img" aria-label={label}>
      <line x1={xScale(lower, domain)} x2={xScale(upper, domain)} y1={30} y2={30} stroke={COLORS.sample} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
      <circle cx={xScale(point, domain)} cy={30} r={3.5} fill={COLORS.observed} />
      <text x={xScale(lower, domain)} y={48} fontSize={8} fill="var(--muted-foreground)">{formatNumber(lower, 1)}</text>
      <text x={xScale(upper, domain)} y={48} fontSize={8} textAnchor="end" fill="var(--muted-foreground)">{formatNumber(upper, 1)}</text>
    </svg>
  );
}
