import type { Metadata } from "next";
import { HubHeader, Callout } from "@/components/fabric/ui";
import { ProgressPanel } from "@/components/fabric/progress-panel";

export const metadata: Metadata = {
  title: "Progress & performance — Microsoft Fabric DP-600",
  description:
    "Your Fabric practice history: attempts by objective and topic, session trend, bookmarks and flags, plus JSON export and import. Stored in your browser only.",
  alternates: { canonical: "/lab/dp-600/progress" },
};

export default function ProgressPage() {
  return (
    <>
      <HubHeader
        eyebrow="DP-600 · Progress"
        title="What you have actually done."
        description="Attempts, last-answer-correct rates, session scores and saved questions. Everything here is computed from your own history in this browser — no figures are estimated, smoothed or back-filled."
      >
        <div className="mt-5">
          <Callout title="Coverage and mastery are two different things">
            The bank holds 480 focused questions. Attempting 40 of them in one topic says nothing
            about the other 440, and a high percentage on a hand-picked set is not the same skill as
            answering a broad sample under time. Both numbers are shown separately below.
          </Callout>
        </div>
      </HubHeader>

      <section className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <ProgressPanel />
        </div>
      </section>
    </>
  );
}
