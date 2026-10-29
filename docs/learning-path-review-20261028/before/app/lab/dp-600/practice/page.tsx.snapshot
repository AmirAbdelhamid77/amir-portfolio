import type { Metadata } from "next";
import { HubHeader } from "@/components/fabric/ui";
import { SessionRunner } from "@/components/fabric/session-runner";

export const metadata: Metadata = {
  title: "Topic practice — Microsoft Fabric DP-600",
  description:
    "Build a focused Fabric practice session from one pack, topic or objective: unattempted, previously wrong, or everything, with a question count that fits the time you have.",
  alternates: { canonical: "/lab/dp-600/practice" },
};

export default function TopicPracticePage() {
  return (
    <>
      <HubHeader
        eyebrow="DP-600 · Topic practice"
        title="One topic, the number of questions you actually have time for."
        description="Filter by Fabric topic, source pack or official objective, then choose whether to see only questions you have never tried, only the ones you last got wrong, or everything. The session is seeded, so a refresh restores the same paper."
      />
      <section className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <SessionRunner
            mode="topic"
            title=""
            intro=""
            fields={["subject", "pack", "objective", "status", "difficulty", "count", "shuffle"]}
            startLabel="Start topic practice"
            defaultCount={15}
            defaultScopes={["core", "support"]}
            footnote="“Last answer wrong” uses your saved history on this device. It is the fastest way to spend a short session on the material that has not stuck yet."
          />
        </div>
      </section>
    </>
  );
}
