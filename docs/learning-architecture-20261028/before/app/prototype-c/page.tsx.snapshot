import type { Metadata } from "next";
import { HansaKnowledgeLanding } from "@/components/knowledge/hansa-landing";
import { LEGACY_LANDING } from "@/lib/site";

// Legacy address of the landing, kept deliberately as a THIN ALIAS: it renders
// the same canonical component, so there is still exactly one implementation and
// one place to edit. The URL survives because existing bookmarks and shared
// links point here, and a hosted redirect cannot preserve the `#archive`
// fragment (a fragment is never sent to the server). See
// `docs/canonical-home/REDIRECT_DECISION.md` for the tested behaviour.
//
// The alias is excluded from the sitemap, from the search index and from
// primary navigation, and it claims `/` as its canonical URL.

export const metadata: Metadata = {
  title: { absolute: "Hansa — interactive data learning and knowledge" },
  description:
    "The legacy address of the Hansa landing. The canonical page is https://hansa.amir-portfolio.workers.dev/ — this address shows the same daily insight, editions timeline and knowledge cards.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function LegacyLandingPage() {
  // Recorded so the compatibility contract is visible in the source, and so a
  // test can assert that no second implementation has appeared here.
  void LEGACY_LANDING;
  return <HansaKnowledgeLanding />;
}
