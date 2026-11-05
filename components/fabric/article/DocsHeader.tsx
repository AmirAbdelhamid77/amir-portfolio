/**
 * Article page header + docs index header (FC05). Same visual shape as
 * HubHeader (components/fabric/ui.tsx) but with the Fabric docs breadcrumb —
 * HubHeader itself is bound to the DP-600 academy trail.
 */

import Link from "next/link";
import type { ReactNode } from "react";

export function DocsHeader({
  trail,
  title,
  description,
  children,
}: {
  /** Breadcrumb segments after "Microsoft Fabric": [{label, href?}] */
  trail: { label: string; href?: string }[];
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-20 md:px-6 md:pb-10 md:pt-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/learn/fabric/" className="hover:text-foreground">
            Microsoft Fabric
          </Link>
          {trail.map((segment) => (
            <span key={segment.label} className="flex flex-wrap items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {segment.href ? (
                <Link href={segment.href} className="hover:text-foreground">
                  {segment.label}
                </Link>
              ) : (
                <span>{segment.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="mt-5 max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
