// The single build-time day ledger for the timeline Home and the day/detail
// routes. It starts from the fail-closed dated feed and appends the explicit
// editorial placements from the owner's bank. Import this module everywhere
// the editorial timeline is rendered; do not rebuild the boundary per route.
import insightsContent from "@/content/knowledge/insights.json";
import insightBank from "@/docs/daily-insight-bank-20261106/INSIGHT_BANK.json";
import { getDays } from "./day-ledger";
import { adaptBankRecord, buildEditorialDays, type EditorialBankRecord } from "./editorial-days";
import { LIVE_DAILY_START, shuffleDailyBank } from "./daily-bank";
import type { Insight } from "./insights";

export const EDITORIAL_DAYS = buildEditorialDays(
  getDays(insightsContent.items as Insight[], true),
  insightBank.items as EditorialBankRecord[],
);

// This dated bank release is the fixed input for live editions. Records are
// shown with their original review labels, just as on the bank's own page.
export const LIVE_DAILY_DECK = shuffleDailyBank(
  "hansa-insight-bank-2026-11-06",
  (insightBank.items as EditorialBankRecord[])
    .filter(record =>
      record.sourceReviewed === true &&
      (record.reviewStatus === "draft" || record.reviewStatus === "technical_review") &&
      record.lessonHref?.startsWith("/") && !record.lessonHref.startsWith("//") &&
      !(record.reviewStatus === "draft" && record.publicationApproved === true),
    )
    .map(record => adaptBankRecord(record, LIVE_DAILY_START)),
);

if (LIVE_DAILY_DECK.length < 6) {
  throw new Error("Live daily insights require at least six source-reviewed bank records.");
}
