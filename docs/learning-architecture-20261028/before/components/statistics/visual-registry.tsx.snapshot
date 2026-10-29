import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import { LABS, LAB_BY_SLUG } from "@/lib/statistics/content";
import {
  BiasShields,
  CapstoneChecklist,
  DecisionPath,
  EvidenceJourney,
  TypeSorter,
  VariableSwitchboard,
} from "@/components/statistics/exhibits/interactive";
import {
  BranchCompare,
  CausationGap,
  CauseResponse,
  CheatSheetPreview,
  ComparableGroups,
  EvidenceChoice,
  ExperimentBlueprint,
  FormulaSpotlight,
  MentalModel,
  MythCards,
} from "@/components/statistics/exhibits/static";
import { ConceptAtlas } from "@/components/statistics/concept-atlas";
import { ToolNavigator } from "@/components/statistics/tool-navigator";
import { CenterSpreadLab } from "@/components/statistics/labs/center-spread-lab";
import { BinomialLab } from "@/components/statistics/labs/binomial-lab";
import { NormalLab } from "@/components/statistics/labs/normal-lab";
import { PoissonLab } from "@/components/statistics/labs/poisson-lab";
import { SamplingLab } from "@/components/statistics/labs/sampling-lab";
import { ConfidenceLab } from "@/components/statistics/labs/confidence-lab";
import { PValueLab } from "@/components/statistics/labs/pvalue-lab";
import { CorrelationLab } from "@/components/statistics/labs/correlation-lab";
import { ErrorsLab } from "@/components/statistics/labs/errors-lab";
import { BusinessLab } from "@/components/statistics/labs/business-lab";
import { ProbabilityLab } from "@/components/statistics/labs/probability-lab";
import { DistributionsLab } from "@/components/statistics/labs/distributions-lab";
import { ExperimentsLab } from "@/components/statistics/labs/experiments-lab";
import { PracticalLab } from "@/components/statistics/labs/practical-lab";
import { DotToDecision } from "@/components/statistics/labs/dot-to-decision";

type Visual = ComponentType<{ compact?: boolean }>;

const VISUALS: Record<string, Visual> = {
  "center-spread": CenterSpreadLab,
  binomial: BinomialLab,
  normal: NormalLab,
  poisson: PoissonLab,
  sampling: SamplingLab,
  confidence: ConfidenceLab,
  "p-value": PValueLab,
  correlation: CorrelationLab,
  errors: ErrorsLab,
  "business-decision": BusinessLab,
  probability: ProbabilityLab,
  distributions: DistributionsLab,
  experiments: ExperimentsLab,
  "practical-significance": PracticalLab,
  "dot-to-decision": DotToDecision,
  "evidence-journey": EvidenceJourney,
  "type-sorter": TypeSorter,
  "branch-compare": BranchCompare,
  "decision-path": DecisionPath,
  "cause-response": CauseResponse,
  "comparable-groups": ComparableGroups,
  "bias-shields": BiasShields,
  "experiment-blueprint": ExperimentBlueprint,
  "variable-switchboard": VariableSwitchboard,
  "causation-gap": CausationGap,
  "evidence-choice": EvidenceChoice,
  "concept-atlas": ConceptAtlas,
  "formula-workbench": FormulaSpotlight,
  "tool-navigator": ToolNavigator,
  "myth-cards": () => <MythCards />,
  "mental-model": MentalModel,
  cheatsheet: CheatSheetPreview,
  capstone: CapstoneChecklist,
};

const EXHIBIT_LINKS: Record<string, string> = {
  "formula-workbench": "/learn/statistics/formulas",
  "tool-navigator": "/learn/statistics/decision",
  "concept-atlas": "/learn/statistics/atlas",
  cheatsheet: "/learn/statistics/cheatsheet",
};

export function LessonVisual({ id, title }: { id: string; title: string }) {
  const Visual = VISUALS[id];
  if (!Visual) {
    return (
      <div className="my-5 rounded-2xl border border-dashed border-border bg-card/30 p-4 text-xs text-muted-foreground">
        The visual <code className="font-mono">{id}</code> ({title}) is not registered. This is a visible defect,
        not a silent omission.
      </div>
    );
  }
  const lab = LAB_BY_SLUG.get(id);
  const href = lab ? `/learn/statistics/labs/${lab.slug}` : EXHIBIT_LINKS[id];
  const kind = lab ? `Lab · ${lab.tier}` : "Interactive exhibit";

  return (
    <div className="my-6 rounded-3xl border border-border bg-card/25 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {lab ? <FlaskConical className="h-3 w-3" aria-hidden="true" /> : null}
            {kind}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            Open full {lab ? "lab" : "page"}
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <Visual compact />
    </div>
  );
}

export function visualExists(id: string): boolean {
  return Boolean(VISUALS[id]);
}

export function visualIds(): string[] {
  return Object.keys(VISUALS);
}

export function labCount(): number {
  return LABS.length;
}

/** The raw lab component (no lesson wrapper), used by the dedicated lab pages. */
export function getLabVisual(slug: string): Visual | undefined {
  return VISUALS[slug];
}

/** Renders a lab by slug without creating a component during the page render. */
export function LabVisual({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const Visual = VISUALS[slug];
  if (!Visual) return null;
  return <Visual compact={compact} />;
}
