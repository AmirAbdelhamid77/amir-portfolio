import type { Metadata } from "next";
import { SubjectHome } from "@/components/learn/subject-home";
import { requireSubject } from "@/lib/curriculum/model";
import { createFabricBindingsReader } from "@/lib/fabric/bindings";
import { CollectionShelf } from "@/components/learn/collection-shelf";

export const metadata: Metadata = {
  title: "Microsoft Fabric — learning path",
  description:
    "Build, query and govern an analytical data platform: nine topics from OneLake and ingestion to semantic models, security and real-time intelligence.",
  alternates: { canonical: "/learn/fabric/" },
};

export default function Page() {
  // FC06 reading overview: deterministic counts from the binding ledger
  // (build-time fs reads, no client JS). Held documentation is counted, not
  // linked — fail-closed by construction.
  const overview = createFabricBindingsReader().getFabricTopicReadingOverview();
  const publishedTotal = overview.reduce((sum, row) => sum + row.primary, 0);
  return (
    <>
      <SubjectHome subject={requireSubject("fabric")} />
      <section
        aria-label="Official documentation reading collections"
        className="mx-auto w-full max-w-[1200px] px-4 pb-10"
      >
        <h2 className="text-lg font-medium">Official documentation library</h2>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          {publishedTotal.toLocaleString("en-US")} published Microsoft Fabric articles, grouped by
          topic and document class. Documentation held under review is counted, not linked.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {overview
            .filter((row) => row.primary > 0)
            .map((row) => (
              <li
                key={row.topic}
                className="rounded-full border border-border-strong px-3 py-1.5 text-sm"
              >
                <a
                  className="min-h-11 py-3 underline-offset-4 hover:underline"
                  href={`/learn/fabric/${row.topic}/`}
                >
                  {row.topic} · {row.primary.toLocaleString("en-US")} articles
                  {row.held > 0 ? ` (${row.held} held)` : ""}
                </a>
              </li>
            ))}
        </ul>
        <CollectionShelf context="fabric" />
      </section>
    </>
  );
}
