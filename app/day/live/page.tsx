import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveDay } from "@/components/hansa/live-day";
import { LIVE_DAILY_DECK } from "@/lib/knowledge/editorial-feed";

export const metadata: Metadata = {
  title: "Daily insights — Hansa",
  robots: { index: false, follow: true },
};

export default function LiveDayPage() {
  return (
    <Suspense fallback={<p role="status" className="p-8">Loading daily insights…</p>}>
      <LiveDay deck={LIVE_DAILY_DECK} />
    </Suspense>
  );
}
