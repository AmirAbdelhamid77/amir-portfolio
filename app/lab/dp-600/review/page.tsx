import type { Metadata } from "next";
import { HubHeader } from "@/components/fabric/ui";
import { SessionRunner } from "@/components/fabric/session-runner";

export const metadata: Metadata = {
  title: "Mistakes & bookmarks — Microsoft Fabric DP-600",
  description:
    "Review the Fabric questions you answered incorrectly, saved, flagged or never attempted, then retry them in a focused session.",
  alternates: { canonical: "/lab/dp-600/review" },
};

export default function ReviewPage() {
  return (
    <>
      <HubHeader
        eyebrow="DP-600 · Review"
        title="The questions that have not stuck yet."
        description="Everything wrong, saved, flagged or never tried, in one place. Retry them as a focused session and the answer history updates as you go — a question leaves this list when it is last answered correctly."
      />
      <section className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <SessionRunner
            mode="review"
            title=""
            intro=""
            fields={["status", "count", "shuffle"]}
            startLabel="Start review session"
            defaultCount={15}
            defaultScopes={["core", "support", "adjacent", "review"]}
            defaultStatus="incorrect"
            footnote="Review sessions are scored like any other practice session, but they are drawn from a filtered set — so treat the percentage as a measure of that set, not of the whole bank."
          />
        </div>
      </section>
    </>
  );
}
