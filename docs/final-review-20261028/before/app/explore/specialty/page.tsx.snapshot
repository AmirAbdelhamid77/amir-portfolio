import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Keyboard, Table2, TriangleAlert } from "lucide-react";
import { AngleLab } from "@/components/data-viz/angle-lab";
import { FunnelFlow } from "@/components/data-viz/funnel-flow";
import { SpecialtyFunnel, SpecialtyTreemap } from "@/components/data-viz/specialty-charts";
import { DATASETS } from "@/lib/data-viz/datasets";
import { formatNumber } from "@/lib/data-viz/chart-math";
import { DataTable, KeyNumbers } from "@/components/data-viz/lab-ui";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Specialty chart audit — BeUI funnel, treemap, flow and donut",
  description:
    "Four BeUI registry components audited against the lessons they support: numeric fidelity, keyboard support, reduced motion, and the data tables the components do not ship. Includes a Sankey of funnel losses and a donut used as an angle-versus-length counterexample.",
  alternates: { canonical: "/explore/specialty" },
};

const FUNNEL = DATASETS["hiring-funnel"];
const MIX = DATASETS["revenue-mix"];

const TREEMAP_LEAVES = MIX.nodes.flatMap((group) =>
  (group.children ?? []).map((child) => ({
    path: `${group.label} / ${child.label}`,
    value: child.value ?? 0,
  })),
);
const TREEMAP_TOTAL = TREEMAP_LEAVES.reduce((sum, leaf) => sum + leaf.value, 0);
const MIX_GROUPS = MIX.nodes.map((group) => ({
  label: group.label,
  value: (group.children ?? []).reduce((sum, child) => sum + (child.value ?? 0), 0),
}));

const FUNNEL_STEPS = FUNNEL.stages.map((stage, index) => {
  const previous = index === 0 ? null : FUNNEL.stages[index - 1];
  return {
    ...stage,
    step: previous ? (stage.value / previous.value) * 100 : null,
    overall: (stage.value / FUNNEL.stages[0].value) * 100,
    dropped: previous ? previous.value - stage.value : null,
  };
});
const TIGHTEST = [...FUNNEL_STEPS].slice(1).sort((a, b) => (a.step ?? 0) - (b.step ?? 0))[0];
const LARGEST_DROP = [...FUNNEL_STEPS].slice(1).sort((a, b) => (b.dropped ?? 0) - (a.dropped ?? 0))[0];
const OVERALL = FUNNEL_STEPS.at(-1)!.overall;

export default function SpecialtyPage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground">
              Labs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Specialty charts</span>
          </nav>
          <Eyebrow className="mt-6">BeUI audit · four components, four lessons</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            A component is not evidence until it survives the table
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            These four charts come from the BeUI registry (MIT). All are animation-led,
            and each is good at something the core six labs cannot do — but only one
            ships a data table, and it is screen-reader-only. Here is what was adopted,
            what was added, and what would have been wrong to adopt. The donut appears
            as a counterexample, not a recommendation.
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container className="space-y-6">
          {/* ---------------------------------------------------------------- */}
          <article className="rounded-3xl border border-border bg-card/30 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Demo 01 · Hiring pipeline
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-tight">BeUI funnel, audited</h2>
                <p className="mt-1 max-w-2xl text-sm text-foreground/70">
                  Ordered stages where each count is a subset of the one before it. The
                  funnel is the right shape for the question; the surrounding evidence is
                  what makes it checkable.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
                <Check className="h-3 w-3" aria-hidden="true" />
                Adopt
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
              <div className="rounded-2xl border border-border bg-background p-3 sm:p-4">
                <SpecialtyFunnel
                  stages={FUNNEL.stages.map((stage) => ({
                    id: stage.id,
                    label: stage.label,
                    value: stage.value,
                  }))}
                  label="Hiring funnel: applications to hires"
                />
                <p className="mt-3 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
                  Colour is sequential by stage, not categorical — the stages are ordered,
                  so the palette is ordered too. Every stage is a focusable button with an
                  accessible name; arrow keys are not required to read the values because
                  the table below carries them.
                </p>
              </div>

              <div className="space-y-3">
                <KeyNumbers
                  items={[
                    { label: "Overall", value: `${OVERALL.toFixed(1)}%`, note: "applications → hires" },
                    { label: "Tightest gate", value: `${TIGHTEST.step!.toFixed(1)}%`, note: `${TIGHTEST.label} from ${FUNNEL.stages[FUNNEL_STEPS.indexOf(TIGHTEST) - 1].label.toLowerCase()}` },
                    { label: "Largest loss", value: formatNumber(LARGEST_DROP.dropped!), note: `${LARGEST_DROP.label} stage` },
                    { label: "Stages", value: String(FUNNEL.stages.length) },
                  ]}
                />
                <DataTable
                  title="Funnel table — added by this site"
                  caption="Synthetic hiring funnel with step conversion, overall conversion, and the drop from the previous stage."
                  columns={["Stage", "Count", "Step", "Overall", "Dropped"]}
                  rows={FUNNEL_STEPS.map((stage) => [
                    stage.label,
                    formatNumber(stage.value),
                    stage.step === null ? "—" : `${stage.step.toFixed(1)}%`,
                    `${stage.overall.toFixed(1)}%`,
                    stage.dropped === null ? "—" : formatNumber(stage.dropped),
                  ])}
                />
                <p className="rounded-xl border border-border bg-background/60 p-3 text-xs leading-6 text-muted-foreground">
                  The component renders no table of its own — only tooltips and a
                  first→last summary. The table above is the adapter, and it is the reason
                  this demo passes the evidence test.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <AuditCard title="Kept">
                Curved stage geometry, hover/focus tooltips, animated counts, and reduced
                motion via <code className="font-mono text-[10px]">useReducedMotion</code>.
              </AuditCard>
              <AuditCard title="Added">
                A visible table with step and overall conversion, the tightest gate, and
                the largest absolute loss — the two numbers that compete for the headline.
              </AuditCard>
              <AuditCard title="Changed">
                Stage colours are passed from the site&apos;s sequential chart palette so
                the funnel does not import a second brand system.
              </AuditCard>
            </div>
          </article>

          {/* ---------------------------------------------------------------- */}
          <article className="rounded-3xl border border-border bg-card/30 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Demo 02 · Revenue mix
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-tight">BeUI treemap, adapted</h2>
                <p className="mt-1 max-w-2xl text-sm text-foreground/70">
                  Nested parts of a whole. Area carries magnitude, nesting carries the
                  hierarchy, and the table carries the values that area cannot.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">
                <TriangleAlert className="h-3 w-3" aria-hidden="true" />
                Adapt
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
              <div className="rounded-2xl border border-border bg-background p-3 sm:p-4">
                <SpecialtyTreemap
                  nodes={MIX.nodes}
                  label="Revenue mix by product line"
                />
                <p className="mt-3 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
                  Tiles are keyboard reachable: Tab enters the grid, arrow keys move,
                  Home/End jump, Escape dismisses the tooltip. The component ships a
                  screen-reader-only table; the visible table below repeats it for
                  sighted readers who need exact values.
                </p>
              </div>

              <div className="space-y-3">
                <KeyNumbers
                  items={[
                    { label: "Total", value: `$${formatNumber(TREEMAP_TOTAL)}k`, note: "sum of leaves" },
                    ...MIX_GROUPS.map((group) => ({
                      label: group.label,
                      value: `${((group.value / TREEMAP_TOTAL) * 100).toFixed(1)}%`,
                      note: `$${formatNumber(group.value)}k`,
                    })),
                  ]}
                />
                <DataTable
                  title="Treemap table — visible copy"
                  caption="Revenue mix leaves with value and share of total. The shares sum to 100%."
                  columns={["Path", "Value", "Share"]}
                  rows={TREEMAP_LEAVES.map((leaf) => [
                    leaf.path,
                    `$${formatNumber(leaf.value)}k`,
                    `${((leaf.value / TREEMAP_TOTAL) * 100).toFixed(1)}%`,
                  ])}
                />
                <p className="rounded-xl border border-border bg-background/60 p-3 text-xs leading-6 text-muted-foreground">
                  Area comparison is weaker than a shared bar scale: Growth ($610k) and
                  Enterprise ($380k) are close in area, while the exact gap is only
                  legible in the table. That is the trade the treemap makes for showing
                  hierarchy in one frame.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <AuditCard title="Kept" icon="keyboard">
                Binary tiling, focus management, arrow-key navigation, a screen-reader
                table, value/share tooltips, and reduced-motion support.
              </AuditCard>
              <AuditCard title="Added">
                A visible table, explicit shares, and a documented total so the picture can
                be reconciled with the numbers by hand.
              </AuditCard>
              <AuditCard title="Constrained">
                The default palette is kept: its dark tiles carry white labels at readable
                contrast. Re-theming the tiles to lighter chart tokens would have traded
                accessibility for brand consistency.
              </AuditCard>
            </div>
          </article>

          {/* ---------------------------------------------------------------- */}
          <article className="rounded-3xl border border-border bg-card/30 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Demo 03 · Where the loss goes
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-tight">BeUI Sankey, adopted</h2>
                <p className="mt-1 max-w-2xl text-sm text-foreground/70">
                  The same hiring counts as additive flows: survivors continue, and the
                  people who stopped at each gate get their own band. No new people are
                  invented — every node balances to the published stage count.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
                <Check className="h-3 w-3" aria-hidden="true" />
                Adopt
              </span>
            </div>

            <div className="mt-5">
              <FunnelFlow />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <AuditCard title="Kept">
                Column layout, band hover/focus tooltips, keyboard-reachable nodes, a
                screen-reader-only flow table, and reduced-motion handling in the layout
                spring.
              </AuditCard>
              <AuditCard title="Added">
                Visible flow table with share-of-source, a toggle that hides the rejection
                bands, and a balance check that the diagram cannot show on its own.
              </AuditCard>
              <AuditCard title="Constrained">
                Rejection nodes are neutral grey on purpose. Giving them a categorical hue
                would imply they are a sixth stage rather than the residue of the previous
                one.
              </AuditCard>
            </div>
          </article>

          {/* ---------------------------------------------------------------- */}
          <article className="rounded-3xl border border-border bg-card/30 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Demo 04 · Angle versus length
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-tight">
                  BeUI donut, kept as the counterexample
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-foreground/70">
                  Five shares, two encodings, one dataset. The ring is accurate and hard
                  to rank; the sorted bars share a zero baseline and rank instantly. The
                  closest pair is the test.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">
                <TriangleAlert className="h-3 w-3" aria-hidden="true" />
                Adapt · counterexample
              </span>
            </div>

            <div className="mt-5">
              <AngleLab />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <AuditCard title="Kept" icon="keyboard">
                Shared ring/legend focus, arrow-key movement between legend rows, a
                rolling center readout, and reduced-motion handling.
              </AuditCard>
              <AuditCard title="Added">
                A zero-baseline bar panel with a ranking toggle, the closest-pair readout
                in points and degrees, and a table with the arc for every slice.
              </AuditCard>
              <AuditCard title="Why not adopt as advice">
                Chapter 06 argues that angle comparisons fail beyond a few slices. The
                donut is displayed to be judged against the bars, not offered as the
                recommended chart for this question.
              </AuditCard>
            </div>
          </article>

          {/* ---------------------------------------------------------------- */}
          <article className="rounded-3xl border border-border bg-card/30 p-4 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-medium tracking-tight">Decision register</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Last reviewed 2026-10-25
              </p>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-foreground/70">
              Every row is a dated decision, not a ban. Two rows changed when a new dataset
              and a new lesson made the earlier reason stop applying; the old reason is
              kept so the reversal can be checked.
            </p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-background" tabIndex={0}>
              <table className="w-full border-collapse text-xs">
                <caption className="sr-only">
                  BeUI chart candidates considered for this site and the dated decision taken.
                </caption>
                <thead>
                  <tr className="border-b border-border bg-card/60">
                    <th scope="col" className="px-3 py-2.5 text-start font-medium">Candidate</th>
                    <th scope="col" className="px-3 py-2.5 text-start font-medium">Decision</th>
                    <th scope="col" className="px-3 py-2.5 text-start font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["funnel-chart", "ADOPT", "Ordered subsets are a real curriculum topic; the geometry is honest and the stages are focusable. Missing table added."],
                    ["treemap", "ADAPT", "Nested composition is taught; the component ships only a screen-reader table, so a visible table was added."],
                    ["sankey-chart", "ADOPT · 2026-10-25", "Earlier DEFER said “no flow dataset, no flow lesson”. Both changed: the funnel counts now derive an additive-flow dataset with a balance test, and Demo 03 asks a flow question the funnel cannot answer. Kept the earlier reason here rather than deleting it."],
                    ["donut-chart", "ADAPT · 2026-10-25", "The earlier REJECT still governs the recommendation: this site does not propose angles for ranking. Demo 04 adopts the component as the counterexample beside sorted bars, so the chapter's claim is tested by the reader instead of asserted."],
                    ["composition-chart", "ADOPT · /explore/dashboards", "Normalized composition over eight quarters belongs to the dashboard lesson, where “share moved while every line grew” is the point. Mounting it here too would split one teaching idea across two routes."],
                    ["bump-chart", "DEFER", "Rankings over time is a legitimate specialty, but it is not in the ten-chapter spine."],
                    ["heat-calendar", "DEFER", "A calendar heatmap needs a daily series. The export has none, and generating one would be data theatre — the pattern would be an artefact of the generator."],
                  ].map(([name, decision, reason]) => (
                    <tr key={name} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 font-mono text-[10px] text-foreground">{name}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {decision}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 leading-5 text-muted-foreground">{reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/40 p-4">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
              Try all four charts with the keyboard only: Tab to enter, arrows to move,
              Escape to dismiss. The toggles are ordinary buttons, so they work with
              Space and Enter as well.
            </p>
            <Link
              href="/learn/core-chart-types"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline hover:decoration-border-strong hover:underline-offset-4"
            >
              Read the core chart chapter
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function AuditCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: "keyboard";
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
        {icon === "keyboard" ? (
          <Keyboard className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Table2 className="h-3 w-3" aria-hidden="true" />
        )}
        {title}
      </p>
      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{children}</p>
    </div>
  );
}
