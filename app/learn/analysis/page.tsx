import type { Metadata } from "next";
import { SubjectHome } from "@/components/learn/subject-home";
import { requireSubject } from "@/lib/curriculum/model";

export const metadata: Metadata = {
  title: "Analytical foundations — learning path",
  description:
    "Frame the question before choosing a tool: the analytical process, its decisions and the practice that follows.",
  alternates: { canonical: "/learn/analysis/" },
};

export default function Page() {
  return <SubjectHome subject={requireSubject("analysis")} />;
}
