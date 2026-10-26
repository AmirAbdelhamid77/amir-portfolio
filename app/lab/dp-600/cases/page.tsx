import type { Metadata } from "next";
import { HubHeader } from "@/components/fabric/ui";
import { SessionRunner } from "@/components/fabric/session-runner";
import { CASE_STUDIES } from "@/lib/fabric/data";

export const metadata: Metadata = {
  title: "Case studies — Microsoft Fabric DP-600",
  description:
    "Work the 76 case studies behind 343 Microsoft Fabric practice questions, keeping each scenario's assumptions and constraints in view while you answer.",
  alternates: { canonical: "/lab/dp-600/cases" },
};

export default function CaseStudyPage() {
  const shared = CASE_STUDIES.filter((study) => study.questionIds.length > 1);
  const largest = [...CASE_STUDIES].sort((a, b) => b.questionIds.length - a.questionIds.length)[0];
  const ordered = [...CASE_STUDIES].sort((a, b) => {
    if (b.questionIds.length !== a.questionIds.length) return b.questionIds.length - a.questionIds.length;
    return a.title.localeCompare(b.title);
  });

  return (
    <>
      <HubHeader
        eyebrow="DP-600 · Scenario practice"
        title="Scenarios, with the constraints kept in front of you."
        description={`${CASE_STUDIES.length} case studies carry ${shared.length > 0 ? "most of the" : ""} 343 questions that depend on a shared situation. Each question renders its scenario before the stem, including the assumptions the answer relies on.`}
      >
        <p className="mt-5 max-w-2xl text-xs leading-6 text-muted-foreground">
          {shared.length} scenarios are shared by more than one question
          {largest ? `, the largest by ${largest.questionIds.length}` : ""}. A session drawn from a
          case keeps the case text attached to every question in it, so nothing has to be
          remembered from a previous screen.
        </p>
      </HubHeader>

      <section className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <SessionRunner
            mode="case"
            title=""
            intro=""
            fields={["count", "shuffle"]}
            startLabel="Start case-study session"
            defaultCount={ordered[0]?.questionIds.length ?? 5}
            countOptions={[4, 8, 12, 20]}
            defaultScopes={["core", "support", "adjacent", "review"]}
            caseStudies={ordered}
            footnote="Pick a scenario above. The question count is capped by how many questions that scenario actually owns — nothing is padded."
          />
        </div>
      </section>

      <section className="pb-14">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <h2 className="text-sm font-medium">All scenarios</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {ordered.map((study) => (
              <li key={study.id} className="rounded-2xl border border-border bg-card/40 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xs font-medium text-foreground">
                    {study.title.replace(/^Case study\s*·\s*/i, "")}
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {study.questionIds.length} Q
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-3 text-[11px] leading-5 text-muted-foreground">
                  {study.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
