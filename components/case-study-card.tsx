/* eslint-disable @next/next/no-img-element -- pre-optimised WebP with manual
   srcset; the Next image optimiser needs a server and this is a static export. */
import Link from "next/link";
import { ArrowUpRight, BarChart3, Cpu } from "lucide-react";
import type { CaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

const MOTIFS: Record<string, { className: string; icon: typeof BarChart3; label: string }> = {
  "ibm-capstone": {
    className:
      "from-sky-100 via-cyan-50 to-violet-100 dark:from-sky-950/50 dark:via-cyan-950/30 dark:to-violet-950/50",
    icon: BarChart3,
    label: "SQL · Pandas · Seaborn",
  },
  adas: {
    className:
      "from-emerald-100 via-teal-50 to-amber-100 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-amber-950/40",
    icon: Cpu,
    label: "Sensors · Validation · Real-time",
  },
};

export function CaseStudyCard({
  study,
  variant = "default",
}: {
  study: CaseStudy;
  variant?: "default" | "feature";
}) {
  const motif = MOTIFS[study.slug];
  const cover = study.gallery?.[0];

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-border bg-card/50 transition-colors hover:border-border-strong",
        variant === "feature" && "md:col-span-2",
      )}
    >
      <Link href={`/work/${study.slug}`} className="flex flex-1 flex-col">
        <div
          className={cn(
            "relative overflow-hidden border-b border-border bg-gradient-to-br",
            "aspect-[16/9]",
            motif?.className,
          )}
        >
          {cover ? (
            <img
              src={cover.src}
              srcSet={cover.srcSet}
              sizes="(min-width: 768px) 1100px, 100vw"
              alt={cover.alt}
              width={cover.width}
              height={cover.height}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.015]"
            />
          ) : (
            <div className="grid-noise absolute inset-0 opacity-70" aria-hidden="true" />
          )}

          {!cover && motif ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 text-foreground shadow-sm backdrop-blur">
                <motif.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60">
                {motif.label}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {/* Status sits below the cover, not on top of it: the screenshots are
              themselves dense UI, and badges over them fight the content. */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {study.status}
            </span>
            {study.featured ? (
              <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-primary-foreground">
                Flagship
              </span>
            ) : null}
            <span className="ml-auto text-[11px] text-muted-foreground">
              {study.timeframe.split("·")[0]}
            </span>
          </div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium tracking-tight sm:text-xl">{study.title}</h3>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                {study.subtitle}
              </p>
            </div>
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-border-strong group-hover:text-foreground">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>

          {variant === "feature" ? (
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {study.metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-border bg-background/60 px-3 py-2">
                  <p className="font-mono text-sm font-medium tracking-tight">{metric.value}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
            {study.tools.slice(0, 4).map((tool) => (
              <span
                key={tool}
                className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
