import type { Metadata } from "next";
import { SubjectHome } from "@/components/learn/subject-home";
import { requireSubject } from "@/lib/curriculum/model";

export const metadata: Metadata = {
  title: "Power BI — learning path",
  description:
    "Prepare data, model meaning and communicate a decision: Power Query, report design, workspace roles and the local practice that sits beside them.",
  alternates: { canonical: "/learn/power-bi/" },
};

export default function Page() {
  return <SubjectHome subject={requireSubject("power-bi")} />;
}
