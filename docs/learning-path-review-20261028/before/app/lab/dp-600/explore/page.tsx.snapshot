import type { Metadata } from "next";
import { HubHeader } from "@/components/fabric/ui";
import { UnifiedBank } from "@/components/fabric/unified-bank";
import { COUNTS } from "@/lib/fabric/data";
import { getAtlas } from "@/lib/atlas/server";
import { defaultView, viewHref } from "@/lib/atlas/model";

export const metadata: Metadata = {
  title: "Explore the Fabric question bank",
  description:
    "Search existing and imported learning questions, including 222 enriched image-free source records with explicit scientific grading gates.",
  alternates: { canonical: "/lab/dp-600/explore" },
};

export default function ExplorePage() {
  const atlas = getAtlas();
  const atlasLinks = atlas.catalog.filter(r=>r.kind==="question").flatMap(r=>r.conceptIds.map(id=>({ questionId: new URL(r.href,"https://local.invalid").searchParams.get("question")!, title: atlas.concepts.find(c=>c.id===id)!.title, href:viewHref({...defaultView(),concept:id,incoming:true}) })));
  return (
    <>
      <HubHeader
        eyebrow="DP-600 · Question bank"
        title="Your learning questions, together."
        description="Search all sources together, including the enriched 222-question image-free bank. Read tables, code and case context, with reviewed corrections kept separate from source answers."
      >
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          Original 834-question bank: {COUNTS.singleSelect} single · {COUNTS.multiSelect} multi-select · {COUNTS.sequence} ordered
          sequence · {COUNTS.fiveOption} with five options · {COUNTS.withCaseStudy} with case context
        </p>
      </HubHeader>

      <section className="py-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <UnifiedBank atlasLinks={atlasLinks} />
        </div>
      </section>
    </>
  );
}
