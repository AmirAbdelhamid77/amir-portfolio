import type { Metadata } from "next";
import { CurriculumHome } from "@/components/learn/curriculum-home";

// The library used to live here. `/learn` now owns the same job, so this route
// keeps the old address alive and points search engines at the one home.
export const metadata: Metadata = {
  title: "Learn — one path through the subjects",
  alternates: { canonical: "/learn/" },
};

export default function Page() {
  return <CurriculumHome />;
}
