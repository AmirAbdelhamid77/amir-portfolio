// Gate 3 — Certificate preparation. The practice surface of the landing: the
// real question banks (lib/catalogue.ts verbatim) and an honest, dependency-free
// bar list of DP-600 questions per exam objective, computed from the shipped
// coverage metadata (content/fabric/meta.json — the same numbers the tests
// recompute). The bar list is a plain list: label and count are real text, the
// bars are decoration, and the caption states when coverage was measured.
//
// beUI's bar-chart was considered here and rejected for this pass: its registry
// JSON carries no license field, so its 25 files cannot be copied into this
// repository under the free/local rules. The proportional bar list is the
// "simplest precise" representation for eleven static counts anyway.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PRACTICE_ENTRIES } from "@/lib/catalogue";
import { COVERAGE, COUNTS, META } from "@/lib/fabric/data";

/** The banks the gate surfaces, in reading order. */
const GATE_IDS = ["fabric-dp600", "analyst-bank", "fabric-rti-provenance", "visualization-scenarios"] as const;

/** "DP-600 1.1 · Implement security and governance" → "1.1 · Implement …" */
const shortLabel = (label: string) => label.replace(/^DP-600\s+/, "");

export function StageCertGate() {
  const banks = GATE_IDS.map((id) =>
    PRACTICE_ENTRIES.find((entry) => entry.id === id),
  ).filter((entry) => entry !== undefined);

  // Only the scored exam objectives (1.1–3.2): the domain-level and unmapped
  // buckets are rollups, not objectives, and would double-count the bars.
  const objectives = COVERAGE.byObjective
    .filter((row) => /^\d\.\d$/.test(row.key))
    .map((row) => ({ ...row, label: shortLabel(row.label) }));
  const max = Math.max(...objectives.map((row) => row.total));
  const measured = META.generatedAt.slice(0, 10);

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-center px-5 py-12 md:px-8">
      <p className="stage-kicker">Certificate preparation</p>
      <h2 id="stage-cert-title" className="stage-gate-title">
        Walk in <em>ready</em>.
      </h2>
      <p className="stage-section-note">
        {COUNTS.questions.toLocaleString("en-GB")} reviewed questions across{" "}
        {COUNTS.packs} packs and {COUNTS.sources} traced sources, plus scenario
        banks with model answers. Every question states its provenance; nothing
        is promoted to an answer without review.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <ul className="grid gap-3 sm:grid-cols-2">
          {banks.map((bank) => (
            <li key={bank.id}>
              <Link
                href={bank.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-border-strong hover:bg-card"
              >
                <span className="mt-2 text-[15px] font-medium leading-6">{bank.title}</span>
                <span className="mt-1.5 text-xs leading-6 text-muted-foreground">
                  {bank.purpose}
                </span>
                <span className="mt-3 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {bank.inside}
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
                  {bank.linkLabel}
                  <ArrowUpRight
                    className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            DP-600 · questions per exam objective
          </p>
          <ul className="stage-bars">
            {objectives.map((row) => (
              <li key={row.key}>
                <span className="stage-bars-label" title={row.label}>
                  {row.label}
                </span>
                <span className="stage-bars-track" aria-hidden="true">
                  <span className="stage-bars-fill" style={{ width: `${(row.total / max) * 100}%` }} />
                </span>
                <span className="stage-bars-value">{row.total}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
            Measured {measured}. Domain-level and unmapped questions are tracked
            in the full coverage table and are not shown here.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-end">
        <Link
          href="/lab/dp-600"
          className="press inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Start practising
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
