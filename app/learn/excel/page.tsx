import type { Metadata } from "next";
import { SubjectHome } from "@/components/learn/subject-home";
import { requireSubject } from "@/lib/curriculum/model";

export const metadata: Metadata = {
  title: "Excel — learning path",
  description:
    "A primary reading path into spreadsheet analysis, with local practice and a clear note about what this site does not teach.",
  alternates: { canonical: "/learn/excel/" },
};

export default function Page() {
  return <SubjectHome subject={requireSubject("excel")} />;
}
