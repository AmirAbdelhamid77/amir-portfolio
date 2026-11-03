import type { Metadata } from "next";
import { SearchClient } from "@/components/search/search-client";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container, Eyebrow } from "@/components/ui";
import { SITE_METRICS } from "@/lib/site-metrics";
import { buildSearchIndexPayload } from "@/lib/search/build-index";
import type { SearchDocument } from "@/lib/search/query";

export const metadata: Metadata = {
  title: "Search — lessons, labs, topics and reference",
  description:
    "Search the data curriculum by concept, tool or exam objective. Results open the canonical lesson, lab or reference page.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search — Hansa",
    description: "Search lessons, labs, topics and reference across the curriculum.",
    url: "/search",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hansa site search" }],
  },
};

/** Six real destinations that cover the main ways into the curriculum. */
const START_HERE = [
  "topic-fabric-foundations",
  "topic-statistics-foundations",
  "topic-visualization-foundations",
  "topic-sql-foundations",
  "page-fabric-atlas",
  "tool--explore-choose-",
];

export default function SearchPage() {
  const payload = buildSearchIndexPayload();
  const featured = START_HERE.map((id) =>
    payload.documents.find((document) => document.id === id),
  ).filter((document): document is SearchDocument => Boolean(document));

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Search" }]} />
          <Eyebrow className="mt-6">Search</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Find the page, not the folder.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Search the curriculum by concept, tool or exam objective. Results open the page where
            the idea is taught, not a copy.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {payload.counts.total} destinations · {SITE_METRICS.practice.fabricQuestions} Fabric
            questions in the bank
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-10">
        <Container>
          <SearchClient total={payload.counts.total} featured={featured} />
        </Container>
      </section>

      <section className="border-t border-border py-8">
        <Container>
          <details className="rounded-2xl border border-border bg-card/40 p-4">
            <summary className="cursor-pointer text-sm font-medium">
              How matching works
            </summary>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-muted-foreground">
              Every word you type must appear in the title, topic, keywords or summary. Arabic
              diacritics, letter variants, case and punctuation are ignored. Titles rank first;
              each type keeps its own short group. Question stems are searched in their bank so a
              concept search does not return a thousand exam rows.
            </p>
          </details>
          <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
            The index is built from the same metadata the pages render, so a new lesson appears
            here when it appears on the site. Search runs in your browser; nothing is sent to a
            server.
          </p>
        </Container>
      </section>
    </>
  );
}
