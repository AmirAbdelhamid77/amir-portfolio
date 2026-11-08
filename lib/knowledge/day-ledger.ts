import { eligibleInsights, type Insight } from "./insights";

// Day layer for the redesigned Home (redesign plan §6). Groups the fail-closed
// public insight feed into one Day per calendar date, oldest to newest, and
// fails loudly on structural problems instead of rendering a guessed state.
// Field names and values come from the bank unchanged — nothing is renamed or
// invented here.

export type DayLedgerInsight = Insight;

export type DayLedgerDay = {
  /** ISO date, the Day's identity. */
  date: string;
  insights: DayLedgerInsight[];
};

export class DayLedgerError extends Error {}

export function buildDays(items: Insight[]): DayLedgerDay[] {
  const byDate = new Map<string, DayLedgerInsight[]>();
  const seenIds = new Set<string>();
  for (const item of items) {
    if (seenIds.has(item.id)) throw new DayLedgerError(`Duplicate insight id: ${item.id}`);
    seenIds.add(item.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
      throw new DayLedgerError(`Insight ${item.id} has a non-ISO date: ${item.date}`);
    }
    if (!item.sourceUrl || !item.checkedAt) {
      throw new DayLedgerError(`Insight ${item.id} is missing its source or checked date.`);
    }
    const list = byDate.get(item.date) ?? [];
    list.push(item);
    byDate.set(item.date, list);
  }
  const days = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, insights]) => ({ date, insights }));
  for (const day of days) {
    if (day.insights.length > 3) {
      throw new DayLedgerError(`Date ${day.date} carries ${day.insights.length} insights; the day layer holds at most 3.`);
    }
  }
  return days;
}

/** The build-time day ledger: eligible insights only, grouped per day. The
 * preview flag passes through to eligibleInsights unchanged — the redesigned
 * Home shows exactly the set the accepted Home shows (plan §3: honesty). */
export function getDays(allItems: Insight[], preview = false): DayLedgerDay[] {
  return buildDays(eligibleInsights(allItems, preview));
}

/** The newest day on or before today (UTC), for the timeline's initial focus. */
export function newestDayOnOrBeforeToday(days: DayLedgerDay[], today = new Date()): string | undefined {
  const stamp = today.toISOString().slice(0, 10);
  const eligible = days.filter((day) => day.date <= stamp);
  return eligible[eligible.length - 1]?.date;
}
