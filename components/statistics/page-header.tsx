import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { cn } from "@/lib/utils";

export const STATISTICS_LINKS = [
  { href: "/learn/statistics", label: "Overview", key: "overview" },
  { href: "/learn/statistics/journey/foundations", label: "Journeys", key: "journeys" },
  { href: "/learn/statistics/labs", label: "Labs", key: "labs" },
  { href: "/learn/statistics/atlas", label: "Atlas", key: "atlas" },
  { href: "/learn/statistics/formulas", label: "Formulas", key: "formulas" },
  { href: "/learn/statistics/decision", label: "Tool finder", key: "decision" },
  { href: "/learn/statistics/glossary", label: "Glossary", key: "glossary" },
  { href: "/learn/statistics/cheatsheet", label: "Field guide", key: "cheatsheet" },
] as const;

export function StatisticsNav({ current }: { current?: string }) {
  return (
    <nav aria-label="Statistics reference sections" className="border-b border-border bg-background/60 pt-14">
      <Container className="flex flex-wrap gap-1 py-2">
        {STATISTICS_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current === link.key ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] transition-colors",
              current === link.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/learn"
          className="ml-auto hidden shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          Data Visualization
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </Container>
    </nav>
  );
}

export function StatisticsPageHeader({
  eyebrow,
  breadcrumb,
  title,
  description,
  current,
  actions,
  aside,
}: {
  eyebrow?: string;
  breadcrumb?: string;
  title: ReactNode;
  description?: ReactNode;
  current?: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <>
      <StatisticsNav current={current} />
      <section className="border-b border-border">
        <Container className="pb-8 pt-10 md:pb-10 md:pt-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground">
              Learn
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/learn/statistics" className="hover:text-foreground">
              Statistics
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-foreground/70">{breadcrumb ?? eyebrow ?? "Overview"}</span>
          </nav>

          <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <Eyebrow dot>{eyebrow ?? "Comprehensive Statistics Reference"}</Eyebrow>
              <h1 className="mt-3 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                  {description}
                </p>
              ) : null}
              {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
            </div>
            {aside}
          </div>
        </Container>
      </section>
    </>
  );
}
