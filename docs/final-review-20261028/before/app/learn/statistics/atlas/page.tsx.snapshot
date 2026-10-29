import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ConceptAtlas } from "@/components/statistics/concept-atlas";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Interactive concept atlas",
  description:
    "A prerequisite map of the statistics reference: foundations, description, probability, distributions, sampling, standard error, intervals, hypothesis testing, correlation, confounding and decisions.",
  alternates: { canonical: "/learn/statistics/atlas" },
};

export default function AtlasPage() {
  return (
    <>
      <StatisticsPageHeader
        eyebrow="Concept atlas"
        current="atlas"
        title="How the ideas depend on each other"
        description="A prerequisite graph, not a decorative galaxy. Select a node to see its definition, source section and what must be understood first. The arrows carry meaning, not weights."
        actions={
          <>
            <ButtonLink href="/learn/statistics/journey/foundations" variant="contrast" icon>
              Start at the root
            </ButtonLink>
            <ButtonLink href="/learn/statistics/decision" variant="secondary">
              Tool finder
            </ButtonLink>
          </>
        }
      />
      <Container className="py-8 md:py-10">
        <ConceptAtlas />
        <div className="mt-6 rounded-2xl border border-border bg-card/30 p-4 text-xs leading-6 text-muted-foreground">
          <p>
            The atlas is also available from{" "}
            <Link href="/learn/statistics/journey/synthesis#s36" className="text-foreground underline decoration-border-strong underline-offset-4">
              §36 “How the topics connect”
            </Link>
            , the section it visualises. Its nodes link back to the exact source section; the graph itself is a new
            teaching layer, not part of the export.
          </p>
          <p className="mt-2">
            <Link href="/learn/statistics/labs" className="inline-flex items-center gap-1 text-foreground">
              Browse the labs <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}
