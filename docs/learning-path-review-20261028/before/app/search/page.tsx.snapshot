import type { Metadata } from "next";
import { SearchClient } from "@/components/search/search-client";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container, Eyebrow } from "@/components/ui";
import { SITE_METRICS } from "@/lib/site-metrics";
import { buildSiteSearchIndex } from "@/lib/search/documents";
import { KIND_LABEL } from "@/lib/search/query";

export const metadata: Metadata = {
  title: "Search — courses, lessons, labs, questions and case studies",
  description:
    "One index across the visualization course, the statistics reference, the chart labs, the question banks and the case studies. English and Arabic, deep links, no account.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search — Hansa",
    description:
      "Search the course, the statistics reference, the labs, the question banks and the work from one field.",
    url: "/search",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hansa site search" }],
  },
};

export default function SearchPage() {
  const documents = buildSiteSearchIndex();
  const byKind = new Map<string, number>();
  for (const document of documents) {
    byKind.set(document.kind, (byKind.get(document.kind) ?? 0) + 1);
  }

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Search" }]} />
          <Eyebrow className="mt-6">Search · whole site</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Find the page, not the folder.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {documents.length} indexed destinations across the two courses, the labs, the
            question banks and the case studies — plus the{" "}
            {SITE_METRICS.practice.fabricQuestions} Fabric questions in a separate index you
            can switch on. Results link to the canonical page, never to a copy.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {Object.entries(KIND_LABEL)
              .filter(([kind]) => byKind.has(kind))
              .map(([kind, label]) => `${label} ${byKind.get(kind)}`)
              .join(" · ")}
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-10">
        <Container>
          <SearchClient documents={documents} />
        </Container>
      </section>

      <section className="border-t border-border py-10">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">What is indexed</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Case studies, services, chapters, lessons, statistics sections, journeys, labs,
                chart labs, tools, formulas, glossary terms, analyst questions and visualization
                scenarios.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">What is not</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Answer keys, rationales and anything from your saved sessions. Question results
                open the question bank or the explorer, and the explanation appears only after
                you answer.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">How matching works</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Arabic diacritics, tatweel, alef/ya variants, case and punctuation are folded
                before matching; every typed word must appear in the title, topic, keywords or
                summary. Titles rank first.
              </p>
            </div>
          </div>
          <p className="mt-5 text-[11px] leading-5 text-muted-foreground">
            The index is built from the same typed metadata the pages render, so a new lesson or
            lab appears here when it appears on the site. There is no network request beyond this
            site: search runs in the browser.
          </p>
        </Container>
      </section>
    </>
  );
}
