import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import TreeExplorer from "@/components/knowledge-graph/tree-explorer";

// The corpus knowledge map. Reached from the Learn hub's "Knowledge map"
// action; excluded from search indexes and the sitemap because it is a
// navigation tool over the corpus, not a content page.
export const metadata: Metadata = {
  title: "Knowledge map — the corpus, one branch at a time",
  description:
    "An expanding radial map of the corpus: eight subject roots, programme lenses, URL-grouped sources and declared containment only. Opened from the Learn hub.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/prototype/network/" },
};

export default function PrototypeNetworkPage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-10 md:py-12">
          <Eyebrow>Knowledge map · declared containment only</Eyebrow>
          <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">
            The corpus, as a map you open one branch at a time
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Eight subject roots, held apart so none is crushed by Fabric&rsquo;s thousand notes. A ring is one level of
            containment; a click opens the next. Leaves open a card with an explicit <strong className="font-medium text-foreground">Open</strong>{" "}
            action, so browsing never navigates by accident. Switch to a programme lens to study the same declared material as
            DP-600, Fabric RTI or Corpus Academy — one track at a time.
          </p>
        </Container>
      </section>

      <section className="py-6 md:py-8">
        <Container className="max-w-[1560px]">
          <TreeExplorer />

          <details className="mx-auto mt-8 max-w-6xl rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm open:bg-card/60">
            <summary className="cursor-pointer select-none font-medium">About this map</summary>
            <div className="mt-3 grid gap-4 text-xs leading-relaxed text-muted-foreground md:grid-cols-2">
              <div className="space-y-2">
                <p>
                  <strong className="text-foreground">What a line means.</strong> Lines are containment declared by the
                  corpus registries: a subject holds packs or courses, a pack holds notes, a note cites a source. There are no
                  inferred, co-citation or text-similarity edges here. Declared cross-references are dashed and appear only for
                  the selected node.
                </p>
                <p>
                  <strong className="text-foreground">Two navigational layers.</strong> Notes that repeat the same declared
                  chapter title are collected under that title, and cited documents are grouped by URL host and documentation
                  area. Both are display grouping, not new knowledge claims; the raw source URL stays in the card.
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong className="text-foreground">Programme lenses.</strong> DP-600 projects the declared Fabric subject
                  without RTI, Academy or packs that have no notes yet. It is not an exam blueprint. Fabric RTI and Corpus
                  Academy keep their own declared courses. The corpus declares no DP-700 programme, so none is invented.
                </p>
                <p>
                  <strong className="text-foreground">Reading and access.</strong> The List view mirrors the open branches in
                  reading order. The map supports arrow keys, Enter, Escape, search, zoom and drag; reduced-motion users get
                  the same states without animation. <em>Show everything</em> is an explicit labels-off overview, never the
                  default.
                </p>
              </div>
            </div>
            <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
              Generated from the corpus at build time and opened from the Learn hub&rsquo;s <em>Knowledge map</em> action.
              Excluded from search indexes and the sitemap; leaf cards link back into the learning path.
            </p>
          </details>
        </Container>
      </section>
    </>
  );
}
