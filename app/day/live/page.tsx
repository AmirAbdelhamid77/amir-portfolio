import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveDay } from "@/components/hansa/live-day";
import { LIVE_DECKS } from "@/lib/knowledge/editorial-feed";

export const metadata: Metadata = {
  title: "Daily insights — Hansa",
  robots: { index: false, follow: true },
};

export default function LiveDayPage() {
  return (
    <Suspense fallback={<p role="status" className="p-8">Loading daily insights…</p>}>
      <LiveDay decks={LIVE_DECKS} />
    </Suspense>
  );
}
