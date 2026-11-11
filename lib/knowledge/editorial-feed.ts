// The single build-time day ledger for the timeline Home and the day/detail
// routes. It starts from the fail-closed dated feed and appends the explicit
// editorial placements from the owner's bank. Import this module everywhere
// the editorial timeline is rendered; do not rebuild the boundary per route.
import insightsContent from "@/content/knowledge/insights.json";
import insightBank from "@/docs/daily-insight-bank-20261106/INSIGHT_BANK.json";
import { getDays } from "./day-ledger";
import { buildEditorialDays, type EditorialBankRecord } from "./editorial-days";
import type { Insight } from "./insights";

export const EDITORIAL_DAYS = buildEditorialDays(
  getDays(insightsContent.items as Insight[], true),
  insightBank.items as EditorialBankRecord[],
);
