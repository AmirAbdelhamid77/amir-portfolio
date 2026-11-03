import type { Metadata } from "next";
import { CurriculumHome } from "@/components/learn/curriculum-home";

// Alias of `/learn`. The address stays because old links, saved progress and
// topic breadcrumbs point at it; the canonical page is the learning home.
export const metadata: Metadata = {
  title: "Learning library — subjects, topics and practice",
  description:
    "Every subject, topic, explanation and practice set in one place.",
  alternates: { canonical: "/learn/" },
};

export default function Page() {
  return <CurriculumHome />;
}
