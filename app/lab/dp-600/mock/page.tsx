import type { Metadata } from "next";
import { HubHeader, Callout } from "@/components/fabric/ui";
import { SessionRunner } from "@/components/fabric/session-runner";

export const metadata: Metadata = {
  title: "Mock exam — Microsoft Fabric DP-600",
  description:
    "A timed, feedback-free Microsoft Fabric practice simulation with a question navigator, flags, answer review before submission and automatic submission on expiry.",
  alternates: { canonical: "/lab/dp-600/mock" },
};

export default function MockExamPage() {
  return (
    <>
      <HubHeader
        eyebrow="DP-600 · Timed simulation"
        title="A custom practice simulation, not a replica of the exam."
        description="Feedback stays hidden until you submit, the clock runs from a stored deadline, and the navigator shows what is still unanswered. You choose the length and the time limit."
      />
      <section className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <div className="mb-5">
            <Callout tone="warning" title="Read this before treating a score as a prediction">
              The bank is not distributed like the DP-600 blueprint: 62% of its focused questions
              sit in “Maintain a data analytics solution” against an official 25–30%, and only 2.7%
              target “Implement and manage semantic models” against 25–30%. A percentage here
              measures how you did on <em>these</em> questions. It is not a predicted exam score.
            </Callout>
          </div>

          <SessionRunner
            mode="mock"
            title=""
            intro=""
            fields={["scope", "count", "time", "shuffle"]}
            startLabel="Start timed session"
            defaultCount={40}
            countOptions={[20, 30, 40, 60, 100]}
            defaultScopes={["core"]}
            footnote="Microsoft lists 100 minutes for DP-600; that is context for the presets, not a claim of equivalence. Auto-submission happens exactly at zero, and a refresh resumes from the same deadline rather than restarting the clock."
          />
        </div>
      </section>
    </>
  );
}
