import type { Metadata } from "next";
import Link from "next/link";
import { SubjectHome } from "@/components/learn/subject-home";
import { requireSubject } from "@/lib/curriculum/model";

export const metadata: Metadata = {
  title: "Power BI - learning path",
  description:
    "Prepare data, model meaning and communicate a decision: Power Query, report design, workspace roles and the local practice that sits beside them.",
  alternates: { canonical: "/learn/power-bi/" },
};

export default function Page() {
  const subject = requireSubject("power-bi");
  // PRODUCT.md §5: until a full Power BI course exists, the page states how
  // much is actually taught. The count comes from the curriculum model rather
  // than a written number, so it cannot drift when a unit is added.
  const taught = subject.units.filter((unit) => unit.kind !== "study-note").length;
  return (
    <SubjectHome
      subject={subject}
      notice={
        <>
          <span className="font-medium text-foreground">
            {taught} taught {taught === 1 ? "unit" : "units"} so far.
          </span>{" "}
          A full course (prepare, model, DAX, report, publish and govern) is
          planned; until then this page lists exactly what exists. Power BI
          material for the DP-600 exam stays in the{" "}
          <Link
            href="/learn/dp-600/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            DP-600 Learning Academy
          </Link>
          .
        </>
      }
    />
  );
}
