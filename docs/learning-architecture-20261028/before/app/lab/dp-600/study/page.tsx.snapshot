import type { Metadata } from "next";
import { HubHeader } from "@/components/fabric/ui";
import { SessionRunner } from "@/components/fabric/session-runner";

export const metadata: Metadata = {
  title: "Guided study — Microsoft Fabric DP-600",
  description:
    "Untimed Fabric practice with the explanation, the option-by-option rationale, Microsoft Learn references and the source video timestamp after every answer.",
  alternates: { canonical: "/lab/dp-600/study" },
};

export default function GuidedStudyPage() {
  return (
    <>
      <HubHeader
        eyebrow="DP-600 · Guided study"
        title="Understanding first, speed later."
        description="Check one answer at a time. The explanation, the reason each option does or does not fit, the Microsoft Learn references and the source video timestamp all arrive before you move on. Nothing here is timed."
      />
      <section className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <SessionRunner
            mode="guided"
            title=""
            intro=""
            fields={["pack", "subject", "objective", "count", "shuffle"]}
            startLabel="Start guided study"
            defaultCount={10}
            defaultScopes={["core", "support"]}
            footnote="Focused and supporting questions are both included by default here: study is where the adjacent material earns its place. Switch to a pack or objective to narrow it."
          />
        </div>
      </section>
    </>
  );
}
