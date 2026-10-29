// Shared presentation pieces for the DP-600 hub.
//
// Deliberately plain: HTML bars and tables rather than a chart library, because
// every number here is a coverage or mastery figure that must stay readable as
// text, print correctly and survive a screen reader.

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  children,
  action,
  className,
  tone = "plain",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: { href: string; label: string };
  className?: string;
  tone?: "plain" | "accent" | "muted";
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-3xl border border-border p-5 sm:p-6",
        tone === "accent" ? "bg-primary/[0.04]" : tone === "muted" ? "bg-background/60" : "bg-card/40",
        className,
      )}
    >
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h2 className="text-sm font-medium tracking-tight text-foreground">{title}</h2>
            {description ? (
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? (
            <Link
              href={action.href}
              className="group inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {action.label}
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}

export function Chip({
  children,
  active = false,
  onClick,
  className,
  title,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
}) {
  const classes = cn(
    "press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
    className,
  );
  if (!onClick) {
    return (
      <span className={classes} title={title}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={classes} title={title}>
      {children}
    </button>
  );
}

/** A labelled proportion. The percentage is always text, never colour alone. */
export function Meter({
  label,
  value,
  total,
  note,
  tone = "primary",
}: {
  label: string;
  value: number;
  total: number;
  note?: string;
  tone?: "primary" | "success" | "warning" | "muted";
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="min-w-0 flex-1 truncate text-foreground">{label}</span>
        <span className="shrink-0 font-mono text-muted-foreground">
          {value}
          <span className="text-muted-foreground">/{total}</span>
        </span>
      </div>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/5"
        role="img"
        aria-label={`${label}: ${value} of ${total}, ${percent}%`}
      >
        <div
          className={cn(
            "h-full rounded-full",
            tone === "success" && "bg-success",
            tone === "warning" && "bg-warning",
            tone === "muted" && "bg-muted-foreground/40",
            tone === "primary" && "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {note ? <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function StatTile({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="bg-card/70 p-4">
      <p className="font-mono text-2xl font-medium tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      {note ? <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function Callout({
  children,
  tone = "info",
  title,
}: {
  children: ReactNode;
  tone?: "info" | "warning";
  title?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-2xl border p-3.5 text-xs leading-6",
        tone === "warning"
          ? "border-warning/30 bg-warning/5 text-foreground"
          : "border-border bg-background/60 text-muted-foreground",
      )}
    >
      <Info
        className={cn("mt-1 h-3.5 w-3.5 shrink-0", tone === "warning" ? "text-warning" : "text-muted-foreground")}
        aria-hidden="true"
      />
      <div>
        {title ? <p className="mb-1 font-medium text-foreground">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function ModeCard({
  href,
  title,
  description,
  meta,
  icon,
  primary = false,
}: {
  href: string;
  title: string;
  description: string;
  meta?: string;
  icon: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-3xl border p-5 transition-colors",
        primary
          ? "border-primary/30 bg-primary/[0.06] hover:border-primary/50"
          : "border-border bg-card/40 hover:border-border-strong hover:bg-card/70",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          primary ? "bg-primary/15 text-foreground" : "bg-card text-foreground",
        )}
      >
        {icon}
      </span>
      <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-6 text-muted-foreground">{description}</p>
      {meta ? (
        <p className="mt-3 border-t border-border pt-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {meta}
        </p>
      ) : null}
    </Link>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-6 text-muted-foreground">{description}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-4 text-xs hover:bg-card"
        >
          {action.label}
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

/** A compact, honest table used as the text alternative for the bars. */
export function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {head.map((cell) => (
              <th key={cell} scope="col" className="py-2 pr-3 font-medium text-muted-foreground">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border/60 last:border-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn("py-2 pr-3", cellIndex === 0 ? "text-foreground" : "font-mono text-muted-foreground")}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const DISCLAIMER =
  "These are independently authored practice questions and study notes, not official Microsoft exam content and not leaked or recalled exam items. Question wording, explanations and option rationales come from the supplied source pack; they have not been re-executed in a live Fabric tenant.";

/** Breadcrumb + title block shared by every DP-600 sub-page. */
export function HubHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-20 md:px-6 md:pb-10 md:pt-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/lab" className="hover:text-foreground">
            Data Lab
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/lab/dp-600" className="hover:text-foreground">
            Microsoft Fabric · DP-600
          </Link>
        </nav>
        {eyebrow ? (
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
