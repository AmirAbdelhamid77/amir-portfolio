"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";
import type { FigureId, FigureMeta } from "@/lib/data-viz/figures";

// Explicit static paths keep the bundler honest: each figure is its own chunk,
// and a lesson only downloads the modules it actually shows. All modules render
// on the server (no `ssr: false`), so the static export keeps readable markup.
const MODULES: Record<FigureId, ComponentType> = {
  pipeline: dynamic(() => import("./figures/pipeline").then((module) => module.PipelineFigure)),
  encoding: dynamic(() => import("./figures/encoding").then((module) => module.EncodingFigure)),
  "dual-axis": dynamic(() => import("./figures/dual-axis").then((module) => module.DualAxisFigure)),
  palette: dynamic(() => import("./figures/palette").then((module) => module.PaletteFigure)),
  histogram: dynamic(() => import("./figures/histogram").then((module) => module.HistogramFigure)),
  dashboard: dynamic(() => import("./figures/dashboard").then((module) => module.DashboardFigure)),
  kpi: dynamic(() => import("./figures/kpi").then((module) => module.KpiFigure)),
  quartet: dynamic(() => import("./figures/quartet").then((module) => module.QuartetFigure)),
  "same-mean": dynamic(() => import("./figures/same-mean").then((module) => module.SameMeanFigure)),
  simpson: dynamic(() => import("./figures/simpson").then((module) => module.SimpsonFigure)),
  uncertainty: dynamic(() =>
    import("./figures/uncertainty").then((module) => module.UncertaintyFigure),
  ),
  baseline: dynamic(() => import("./figures/baseline").then((module) => module.BaselineFigure)),
};


export function LiveFigure({
  meta,
  original,
  caption,
}: {
  meta: FigureMeta;
  original: ReactNode;
  caption?: ReactNode;
}) {
  const Module = MODULES[meta.id];

  return (
    <section
      aria-label={`${meta.title} — live teaching figure`}
      className="my-8 rounded-3xl border border-border bg-card/25 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Live figure · rebuilt
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {meta.provenance === "sourced"
            ? "source claim"
            : meta.provenance === "synthetic"
              ? "synthetic teaching data"
              : "derived example"}
        </span>
      </div>

      <h3 className="mt-3 text-base font-medium tracking-tight text-foreground">{meta.title}</h3>
      <p className="mt-1 max-w-2xl text-xs leading-6 text-muted-foreground">{meta.objective}</p>
      {caption ? (
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">{caption}</p>
      ) : null}

      <div className="mt-4">
        <Module />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="max-w-xl text-[10px] leading-5 text-muted-foreground">
          <strong className="font-medium text-foreground">Data:</strong> {meta.dataNote}
        </p>
        {meta.lab ? (
          <Link
            href={meta.lab.href}
            className="press inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <FlaskConical className="h-3 w-3" aria-hidden="true" />
            {meta.lab.label}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <details className="group mt-3 rounded-2xl border border-border bg-background/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-[11px] text-muted-foreground">
          <span>Original source figure (unchanged)</span>
          <span aria-hidden="true" className="transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="border-t border-border p-2">{original}</div>
      </details>
    </section>
  );
}
