/**
 * Fabric docs library index (FC05): /learn/fabric/docs/ (ROUTE_NAMESPACE.md
 * depth-2 real static route). Lists the route-plan families with honest
 * published / held counts from the route registry. Held articles are shown
 * with their exclusion reason category — never as links (fail-closed: the
 * registry is the only publication source).
 */

import type { Metadata } from "next";
import Link from "next/link";

import { DocsHeader } from "@/components/fabric/article/DocsHeader";
import { Container } from "@/components/ui";
import { getRouteRegistry, type RegistryExcludedRow } from "@/lib/fabric/articles/registry";

export const metadata: Metadata = {
  title: "Microsoft Fabric documentation library",
  description:
    "The eligible articles of the pinned Microsoft Fabric documentation corpus, compiled for local reading with source provenance.",
  alternates: { canonical: "/learn/fabric/docs/" },
};

const REASON_LABELS: Record<string, string> = {
  "compiler-quarantine": "compiler quarantine",
  "article-hold-rights-notice": "rights notice hold",
  "article-hold-external-dependency": "external dependency hold",
  "rights-hold": "rights hold",
  "compiler-node-missing": "compiled node missing",
  "blob-hash-mismatch": "source hash mismatch",
  "logical-path-shape": "unplanned route shape",
};

function reasonLabel(reason: string): string {
  const category = reason.split(":")[0];
  return REASON_LABELS[category] ?? category;
}

export default function FabricDocsIndex() {
  const registry = getRouteRegistry();

  const excludedByFamily = new Map<string, Map<string, number>>();
  for (const row of registry.excluded as RegistryExcludedRow[]) {
    const family = row.sourcePath.match(/^docs\/([^/]+)\//)?.[1] ?? "unknown";
    const category = row.reason.split(":")[0];
    const byCategory = excludedByFamily.get(family) ?? new Map<string, number>();
    byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
    excludedByFamily.set(family, byCategory);
  }

  return (
    <>
      <DocsHeader
        trail={[{ label: "Docs" }]}
        title="Microsoft Fabric documentation library"
        description="The publishable articles of the pinned Microsoft Fabric documentation corpus, compiled for offline local reading. Every article carries its source path, revision and license; held articles stay out of the library with their reason recorded."
      />
      <Container className="py-8 md:py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <p className="text-sm leading-7 text-muted-foreground">
            {registry.counts.publishedArticles} articles across{" "}
            {registry.counts.families} families are published locally.{" "}
            {registry.counts.excludedArticles} corpus articles are held out
            (rights notices, external dependencies or compiler quarantine) and
            listed per family below with their reason — they are intentionally
            not links. Upstream redirects that resolve to a local article are
            generated as static alias pages.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {registry.families.map((family) => {
              const held = excludedByFamily.get(family.family);
              const heldTotal = family.counts.excluded;
              return (
                <section
                  key={family.family}
                  className="rounded-3xl border border-border bg-card/40 p-5"
                >
                  <h2 className="font-mono text-sm font-medium tracking-tight text-foreground">
                    {family.family}
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {family.counts.published} published article
                    {family.counts.published === 1 ? "" : "s"}
                    {heldTotal > 0 ? ` · ${heldTotal} held` : ""}
                  </p>
                  {held && held.size > 0 ? (
                    <ul className="mt-2 space-y-1 text-xs leading-6 text-muted-foreground">
                      {[...held.entries()].map(([category, count]) => (
                        <li key={category}>
                          {count} held: {reasonLabel(category)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-3 border-t border-border pt-2.5 text-[11px] leading-5 text-muted-foreground">
                    Articles live at{" "}
                    <span className="font-mono">/learn/fabric/docs/{family.family}/…</span> and are
                    reachable from search and the curriculum; this index does not list 2,700+ links.
                    The{" "}
                    <Link className="underline underline-offset-4" href="/learn/fabric/">
                      Fabric learning hub
                    </Link>{" "}
                    organises the teaching material.
                  </p>
                </section>
              );
            })}
          </div>
        </div>
      </Container>
    </>
  );
}
