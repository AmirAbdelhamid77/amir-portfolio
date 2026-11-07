import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { KnowledgeGraph } from "@/components/prototype/knowledge-graph";
import { prototypeGraph } from "@/lib/prototype/graph-data";
import { getAtlasPublic } from "@/lib/atlas/server";

// Prototype route. It exists only in the isolated prototype sandbox and is not
// linked from navigation, the sitemap or the search index. `robots: noindex`
// keeps it out of indexing if the sandbox is ever served publicly.
export const metadata: Metadata = {
  title: "Knowledge graph prototype",
  description:
    "An isolated prototype of an Obsidian-style 2D knowledge graph over the statistics curriculum. Not part of the published release.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/prototype/graph/" },
};

export default function PrototypeGraphPage() {
  const data = prototypeGraph();
  const atlas = getAtlasPublic();

  return (
    <>
      <section className="border-b border-border">
        <Container className="py-12 md:py-16">
          <Eyebrow>Prototype · not in the release</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">
            Knowledge graph, local and expandable
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Notes are nodes; the only edges are explicit sequence membership and the
            reviewed curriculum dependencies. Expand a sequence to reveal its notes,
            open a note to read its objectives and follow the real link. Nothing on this
            page is invented, and nothing here is part of the frozen production build.
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-10">
        <Container>
          <KnowledgeGraph data={data} />
        </Container>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <Container className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium">Data provenance</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              The dataset is derived at build time from registries that already ship.
              No relation is typed by hand; an unknown section, duplicate membership or
              dependency outside the corpus fails the build.
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
              {data.provenance.map((line) => (
                <li key={line} className="border-l border-border pl-3">
                  {line}
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {[
                ["Sequences", data.stats.sequences],
                ["Notes", data.stats.notes],
                ["Dependencies", data.stats.dependencies],
                ["Cross-sequence", data.stats.crossSequenceDependencies],
                ["Atlas concepts (published)", atlas.concepts.length],
                ["Atlas links (published)", atlas.semanticEdges.length],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 text-xl font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-medium">What the edges are, and are not</h2>
            <ul className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>
                <strong className="font-medium text-foreground">Membership</strong> — a
                sequence points at the notes listed in its own declared order. This is
                navigation, not a knowledge claim.
              </li>
              <li>
                <strong className="font-medium text-foreground">Dependency</strong> — the
                reviewed curriculum prerequisites used to order teaching. They are
                editorial, not source-declared links, and they are not Atlas assertions.
              </li>
              <li>
                <strong className="font-medium text-foreground">Not drawn</strong> — the
                Atlas. Its public projection publishes {atlas.concepts.length} concepts
                and {atlas.semanticEdges.length} connections; the prototype adds none and
                fabricates no relation. Atlas publication isolation and rights are
                unchanged.
              </li>
            </ul>
            <h2 className="mt-8 text-lg font-medium">Known limitations</h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
              <li>
                One corpus only: the statistics curriculum (9 sequences, 43 notes). Other
                subjects use different registries and are not in this prototype.
              </li>
              <li>
                No persistence: view, expansion, selection and drag positions live in
                component state and reset on reload. Deep links are not supported yet.
              </li>
              <li>
                Paging is implemented but latent: no journey exceeds eight notes, well
                under the 20-note page size, so large-sequence behaviour is untested.
              </li>
              <li>
                Automated accessibility checks do not replace a screen-reader pass; NVDA
                and VoiceOver remain unverified.
              </li>
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              <Link className="underline underline-offset-4" href="/learn/statistics/">
                Open the statistics reference
              </Link>{" "}
              or{" "}
              <Link className="underline underline-offset-4" href="/learn/">
                the curriculum
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
