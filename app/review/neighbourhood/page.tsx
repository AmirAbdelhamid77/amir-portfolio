import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NeighbourhoodReview } from "@/components/knowledge/neighbourhood/review";
import { getAtlas } from "@/lib/atlas/server";

// R1 review surface. It is not the Home and it is not a publication:
//
//   - `getAtlas()` deliberately reads the review projection, which is only
//     non-empty when HANSA_ATLAS_REVIEW_PREVIEW=1. With the flag off the
//     projection is fail-closed (zero concepts), so `notFound()` runs during the
//     static export and no candidate record is emitted for this route.
//   - `noindex, nofollow` keeps the labelled review out of search.
//   - The route owns one client island; the page itself stays a server component.
//
// Rollback is deleting this folder and `components/knowledge/neighbourhood/`.

const REVIEW_PREVIEW = process.env.HANSA_ATLAS_REVIEW_PREVIEW === "1";

export const metadata: Metadata = {
  title: "Knowledge neighbourhood - local review surface",
  description:
    "A local design-review surface for the candidate knowledge neighbourhood. Not an approved or published knowledge graph.",
  // `notFound()` already writes its own `noindex` tag. Declaring ours in the
  // fail-closed build would emit two; the flag-on review build has no automatic
  // tag, so it needs the explicit pair.
  robots: REVIEW_PREVIEW ? { index: false, follow: false } : undefined,
};

export default function NeighbourhoodReviewPage() {
  const atlas = getAtlas();
  if (!REVIEW_PREVIEW || atlas.concepts.length === 0) {
    notFound();
  }
  const preferred = "concept:fabric:direct-lake";
  const initial = atlas.concepts.some((concept) => concept.id === preferred)
    ? preferred
    : atlas.concepts[0].id;
  return <NeighbourhoodReview atlas={atlas} initialConceptId={initial} />;
}
