"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AtlasNode {
  id: string;
  label: string;
  x: number;
  y: number;
  section: number;
  journey: string;
  definition: string;
  prereqs: string[];
  keywords: string[];
}

const NODES: AtlasNode[] = [
  {
    id: "foundations",
    label: "Foundations",
    x: 80,
    y: 60,
    section: 1,
    journey: "foundations",
    definition: "Population vs sample, parameter vs statistic, and the branch of analysis a question belongs to.",
    prereqs: [],
    keywords: ["population", "sample", "data types", "المجتمع", "العينة"],
  },
  {
    id: "describe",
    label: "Describe data",
    x: 215,
    y: 60,
    section: 4,
    journey: "describe",
    definition: "Centre, spread and shape of the observed sample: mean, median, SD, IQR.",
    prereqs: ["foundations"],
    keywords: ["mean", "median", "variance", "standard deviation", "IQR"],
  },
  {
    id: "probability",
    label: "Probability",
    x: 350,
    y: 60,
    section: 6,
    journey: "probability",
    definition: "A measure over a sample space: complements, intersections, conditionals, independence.",
    prereqs: ["describe"],
    keywords: ["event", "conditional", "independent", "mutually exclusive", "احتمال"],
  },
  {
    id: "distributions",
    label: "Distributions",
    x: 485,
    y: 60,
    section: 8,
    journey: "distributions",
    definition: "Models for counts and measurements: binomial, normal and Poisson, each with its own support.",
    prereqs: ["probability"],
    keywords: ["binomial", "normal", "Poisson", "PMF", "PDF", "z-score"],
  },
  {
    id: "sampling",
    label: "Sampling",
    x: 620,
    y: 60,
    section: 11,
    journey: "sampling",
    definition: "The sampling distribution of a statistic and the central limit theorem.",
    prereqs: ["distributions"],
    keywords: ["CLT", "sampling distribution", "Central Limit Theorem", "المعاينة"],
  },
  {
    id: "experiments",
    label: "Experiments",
    x: 80,
    y: 190,
    section: 24,
    journey: "experiments",
    definition: "Treatment, control, randomization and blinding: the design features that support causal claims.",
    prereqs: ["foundations"],
    keywords: ["RCT", "A/B", "randomization", "blinding", "placebo", "تجربة"],
  },
  {
    id: "correlation",
    label: "Correlation",
    x: 215,
    y: 190,
    section: 30,
    journey: "relationships",
    definition: "Pearson r measures the direction and strength of a linear association, in [−1, 1].",
    prereqs: ["describe"],
    keywords: ["r", "scatter", "linear", "regression", "ارتباط"],
  },
  {
    id: "causation",
    label: "Causation",
    x: 350,
    y: 190,
    section: 32,
    journey: "relationships",
    definition: "A causal claim needs a design, not just co-movement. Association alone cannot establish it.",
    prereqs: ["correlation", "experiments"],
    keywords: ["cause", "causal", "association", "سببية"],
  },
  {
    id: "confounding",
    label: "Confounding",
    x: 485,
    y: 190,
    section: 33,
    journey: "relationships",
    definition: "A third variable that affects both X and Y can create, remove or reverse an observed association.",
    prereqs: ["causation"],
    keywords: ["confounder", "third variable", "DAG", "مربك"],
  },
  {
    id: "se",
    label: "Standard error",
    x: 620,
    y: 190,
    section: 13,
    journey: "sampling",
    definition: "The standard deviation of a statistic's sampling distribution; for the mean, σ/√n.",
    prereqs: ["sampling"],
    keywords: ["SE", "standard error", "precision", "الخطأ المعياري"],
  },
  {
    id: "ci",
    label: "Confidence interval",
    x: 485,
    y: 320,
    section: 14,
    journey: "sampling",
    definition: "An interval procedure with long-run coverage, not a probability for a fixed parameter.",
    prereqs: ["se"],
    keywords: ["CI", "coverage", "interval", "فترة الثقة"],
  },
  {
    id: "hypothesis",
    label: "Hypothesis test",
    x: 350,
    y: 320,
    section: 15,
    journey: "hypothesis",
    definition: "A comparison of an observed statistic with its distribution under H₀.",
    prereqs: ["ci"],
    keywords: ["H0", "null", "alternative", "اختبار الفرضيات"],
  },
  {
    id: "pvalue",
    label: "p-value & α",
    x: 215,
    y: 320,
    section: 19,
    journey: "hypothesis",
    definition: "A tail area conditional on H₀; α is the pre-declared decision threshold.",
    prereqs: ["hypothesis"],
    keywords: ["p-value", "alpha", "significance", "القيمة الاحتمالية"],
  },
  {
    id: "decision",
    label: "Decision",
    x: 620,
    y: 320,
    section: 40,
    journey: "synthesis",
    definition: "Combine evidence, uncertainty, effect size, cost and context. A p-value alone is not a decision.",
    prereqs: ["pvalue", "confounding"],
    keywords: ["decision", "business", "practical significance", "قرار"],
  },
];

const EDGES: [string, string][] = NODES.flatMap((node) => node.prereqs.map((prereq) => [prereq, node.id] as [string, string]));

const NODE_BY_ID = new Map(NODES.map((node) => [node.id, node]));

export function ConceptAtlas() {
  const [selectedId, setSelectedId] = useState("sampling");
  const [query, setQuery] = useState("");
  const selected = NODE_BY_ID.get(selectedId) ?? NODES[0];
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return NODES;
    return NODES.filter((node) =>
      [node.label, node.definition, ...node.keywords].join(" ").toLowerCase().includes(value),
    );
  }, [query]);
  const matchedIds = new Set(filtered.map((node) => node.id));

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Highlight a concept — try confounder, r, p-value, فترة الثقة"
          aria-label="Search the concept atlas"
          className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
        <span className="font-mono text-[10px] text-muted-foreground">{filtered.length}/{NODES.length}</span>
      </label>

      <div className="relative hidden aspect-[720/420] w-full overflow-hidden rounded-2xl border border-border bg-card/20 md:block">
        <svg viewBox="0 0 720 420" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <marker id="atlas-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
            </marker>
          </defs>
          {EDGES.map(([from, to]) => {
            const a = NODE_BY_ID.get(from);
            const b = NODE_BY_ID.get(to);
            if (!a || !b) return null;
            const active = from === selected.id || to === selected.id;
            const dim = query.length > 0 && (!matchedIds.has(from) || !matchedIds.has(to));
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? "var(--chart-2)" : "var(--border-strong)"}
                strokeWidth={active ? 2 : 1}
                strokeDasharray={dim ? "2 4" : undefined}
                opacity={dim ? 0.25 : 1}
                markerEnd="url(#atlas-arrow)"
              />
            );
          })}
        </svg>
        {NODES.map((node) => {
          const dim = query.length > 0 && !matchedIds.has(node.id);
          const active = node.id === selected.id;
          return (
            <button
              key={node.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedId(node.id)}
              className={cn(
                "absolute min-h-6 -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2 py-1 text-[10px] font-medium leading-4 transition-all",
                active
                  ? "z-10 border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
                dim && "opacity-30",
              )}
              style={{ left: `${(node.x / 720) * 100}%`, top: `${(node.y / 420) * 100}%` }}
            >
              {node.label}
            </button>
          );
        })}
        <p className="absolute bottom-2 left-3 text-[9px] text-muted-foreground">
          Arrows point from prerequisite to dependent concept. Select a node for its definition and source section.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-3 md:grid md:grid-cols-[1fr_260px] md:gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Selected concept</p>
          <h3 className="mt-1 text-base font-medium text-foreground">{selected.label}</h3>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">{selected.definition}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <Link
              href={`/learn/statistics/journey/${selected.journey}#s${selected.section}`}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-foreground hover:border-border-strong"
            >
              Source §{selected.section} <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            {selected.prereqs.length ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                Prerequisites: {selected.prereqs.map((id) => NODE_BY_ID.get(id)?.label ?? id).join(", ")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                Starting point
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 max-h-52 overflow-y-auto rounded-xl border border-border md:mt-0">
          <ul className="divide-y divide-border">
            {filtered.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  aria-pressed={node.id === selected.id}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-[11px]",
                    node.id === selected.id ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {node.label}
                  <span className="font-mono text-[9px] text-muted-foreground">§{node.section}</span>
                </button>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? <p className="p-3 text-[11px] text-muted-foreground">No concept matches “{query}”. Try an English or Arabic synonym.</p> : null}
        </div>
      </div>
      <p className="text-[10px] leading-5 text-muted-foreground">
        This is a prerequisite map, not a weighted flow diagram. The arrows encode “read this before that”; they carry no
        quantitative value. A text list of every node is available above for keyboard and mobile use.
      </p>
    </div>
  );
}
