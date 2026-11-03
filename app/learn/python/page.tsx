import type { Metadata } from "next";
import { SubjectHome } from "@/components/learn/subject-home";
import { requireSubject } from "@/lib/curriculum/model";

export const metadata: Metadata = {
  title: "Python — learning path",
  description:
    "A primary reading path into Python for analysis, with local practice and a clear note about what this site does not teach.",
  alternates: { canonical: "/learn/python/" },
};

export default function Page() {
  return <SubjectHome subject={requireSubject("python")} />;
}
