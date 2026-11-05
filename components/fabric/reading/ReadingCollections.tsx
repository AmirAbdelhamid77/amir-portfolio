import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  getBindingsForTopic,
  getCollectionsForTopic,
  getHeldCountForTopic,
  isBoundFabricTopic,
  type PrimaryBindingRow,
  type ReadingCollection,
} from "@/lib/fabric/bindings";
import { subjectById } from "@/lib/study/taxonomy";

/**
 * Fabric reading collections (FC06). Self-contained React server component:
 * no client JS, no browser APIs — it renders the deterministic per-topic
 * reading collections produced by content/fabric/bindings/build-bindings.mjs
 * through lib/fabric/bindings.ts.
 *
 * Wiring (lead merge step, not done here): render <ReadingCollections
 * subject="fabric" topic={topic} /> on the fabric topic desk
 * (app/learn/[subject]/[topic]/page.tsx) and, for an at-a-glance hub panel,
 * on app/learn/fabric/page.tsx with a single topic. Non-fabric subjects and
 * unbound topics render nothing, so the component can sit on the shared page
 * unchanged for other subjects.
 *
 * Article destinations are the UNPREFIXED logical paths from the route
 * registry (/learn/fabric/docs/...); next/link applies the site basePath, so
 * no base path is hardcoded here.
 */

const KIND_LABEL: Record<PrimaryBindingRow["kind"], string> = {
  concept: "Concept",
  "how-to": "How-to",
  reference: "Reference",
  tutorial: "Tutorial",
};

export interface ReadingCollectionsProps {
  subject: string;
  topic: string;
}

function CollectionCard({
  collection,
  rowsById,
}: {
  collection: ReadingCollection;
  rowsById: Map<string, PrimaryBindingRow>;
}) {
  return (
    <li>
      <article className="rounded-3xl border border-border-strong bg-card/40 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium">{collection.title}</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {collection.counts.articles} {collection.counts.articles === 1 ? "article" : "articles"}
          </span>
        </div>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">{collection.description}</p>
        <ul className="mt-3 divide-y divide-border/60">
          {collection.articleIds.map((articleId) => {
            const row = rowsById.get(articleId);
            // Collections are validated against the bindings at build time;
            // a missing row means the artifacts disagree — skip rather than
            // render a dead link (the data test suite fails loudly on drift).
            if (!row) return null;
            return (
              <li key={articleId}>
                <Link
                  href={row.logicalPath}
                  className="group flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-2 py-2 transition-colors hover:bg-card/60"
                >
                  <span className="min-w-0 flex-1 text-sm leading-7">{row.title}</span>
                  <span className="text-xs text-muted-foreground">{collection.title}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {KIND_LABEL[row.kind]}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </article>
    </li>
  );
}

export function ReadingCollections({ subject, topic }: ReadingCollectionsProps) {
  // The fabric corpus has no bindings for other subjects, and an unbound
  // topic has nothing to render — stay silent rather than fabricate content.
  if (subject !== "fabric" || !isBoundFabricTopic(topic)) return null;

  const collections = getCollectionsForTopic(topic);
  const rows = getBindingsForTopic(subject, topic);
  const rowsById = new Map(rows.map((row) => [row.articleId, row]));
  const heldCount = getHeldCountForTopic(topic);
  const topicTitle = subjectById("fabric")?.topics.find(([id]) => id === topic)?.[1] ?? topic;

  return (
    <section aria-labelledby="fabric-reading-collections" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 id="fabric-reading-collections" className="text-2xl font-medium tracking-tight">
          Reading collections
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          {rows.length} Microsoft Fabric documentation {rows.length === 1 ? "article" : "articles"} for{" "}
          {topicTitle}, grouped into {collections.length} deterministic{" "}
          {collections.length === 1 ? "collection" : "collections"} by source directory and document kind.
        </p>

        <ul className="mt-6 space-y-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} rowsById={rowsById} />
          ))}
        </ul>

        {heldCount > 0 ? (
          <p className="mt-6 rounded-3xl border border-border p-4 text-sm leading-7 text-muted-foreground">
            Held documentation: {heldCount} further {heldCount === 1 ? "article" : "articles"} for {topicTitle}{" "}
            {heldCount === 1 ? "is" : "are"} held from publication (rights or dependency review) and{" "}
            {heldCount === 1 ? "has" : "have"} no local reading destination yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default ReadingCollections;
