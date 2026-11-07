import type { Metadata } from "next";
import { HansaKnowledgeLanding } from "@/components/knowledge/hansa-landing";

// The accepted R3–R6 Home, kept reachable while the redesigned Home is
// evaluated behind HOME_V2 (redesign plan §15). Not indexed: it is a fallback
// surface, not a second canonical home.
export const metadata: Metadata = {
  title: "Hansa — the accepted Home (archive)",
  description:
    "The three-scene Home as accepted in release-candidate-1, kept reachable while the timeline Home is under review.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/archive/" },
};

export default function ArchiveHomePage() {
  return <HansaKnowledgeLanding />;
}
