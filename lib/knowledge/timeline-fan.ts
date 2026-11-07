// Pure geometry for the desktop timeline fan (R3).
//
// The fan is the prototype's beUI timeline grammar: one selected card in the
// centre, its neighbours stepped out and scaled down, cables to the stage edges,
// a ruler between the cards and a ghost year behind them. Nothing here touches
// the DOM, so the same numbers can be tested and rendered on the server.
//
// The formulas are the prototype's (`intelligent-atlas/prototype/timeline-model.js`)
// with explicit guards: a width below 320 is treated as 320, and a non-finite
// width falls back to 800 so a server render can never produce NaN transforms.

export type FanGeometry = {
  cardWidth: number;
  cardHeight: number;
  gap: number;
  step: number;
  near: number;
  sideScale: number;
};

export type FanPosition = {
  offset: number;
  x: number;
  scale: number;
  z: number;
  opacity: number;
};

export type FanDayParts = {
  weekday: string;
  day: string;
  month: string;
};

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function fanGeometry(width: number): FanGeometry {
  const safeWidth = Math.max(320, Number.isFinite(width) ? Number(width) : 800);
  const cardWidth = Math.min(190, safeWidth * (safeWidth < 640 ? 0.58 : 0.36));
  const gap = clamp(cardWidth * 0.22, 40, 72);
  const sideScale = 0.72;
  const step = cardWidth * sideScale + gap;
  const near = (cardWidth * (1 + sideScale)) / 2 + gap;
  const cardHeight = safeWidth < 640 ? 196 : 212;
  return { cardWidth, cardHeight, gap, step, near, sideScale };
}

/** Signed distance from the centre, in pixels, for a card `offset` steps away. */
export function fanCardX(offset: number, geometry: FanGeometry): number {
  const distance = Math.abs(offset);
  const value = distance <= 1 ? distance * geometry.near : geometry.near + (distance - 1) * geometry.step;
  return Math.sign(offset) * value;
}

/** Neighbours are 72% size; the centre is full size. */
export function fanCardScale(offset: number): number {
  return 1 - (1 - 0.72) * Math.min(Math.abs(offset), 1);
}

export function fanPositionAt(index: number, position: number, geometry: FanGeometry): FanPosition {
  const offset = index - position;
  return {
    offset,
    x: fanCardX(offset, geometry),
    scale: fanCardScale(offset),
    z: 100 - Math.round(Math.abs(offset) * 10),
    opacity: clamp(1 - 0.42 * Math.min(Math.abs(offset), 1), 0.32, 1),
  };
}

/**
 * The card the fan settles on after a drag or a wheel. Only edition days are
 * activation targets; a quiet day can sit nearer the release point but never
 * becomes the selection.
 */
export function nearestEditionIndex(indexes: readonly number[], position: number): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  for (const index of indexes) {
    const distance = Math.abs(index - position);
    if (distance < bestDistance || (distance === bestDistance && best !== null && index > best)) {
      best = index;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * `MON 26 OCT` -> `{weekday: "MON", day: "26", month: "OCT"}`, with the ISO date
 * as the fallback when a label is missing or malformed.
 */
export function fanDayParts(dayLabel: string, date: string): FanDayParts {
  const tokens = String(dayLabel ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date ?? ""));
  const monthIndex = iso ? Number(iso[2]) - 1 : -1;
  return {
    weekday: tokens[0] || (iso ? "DATE" : ""),
    day: tokens[1] || (iso ? iso[3] : ""),
    month: tokens[2] || (monthIndex >= 0 ? MONTHS[monthIndex] ?? "" : ""),
  };
}

/** Edition ordinals, oldest first: the newest edition carries the highest number. */
export function editionOrdinals(editions: readonly { id: string; date: string }[]): Map<string, number> {
  return new Map(
    [...editions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((edition, index) => [edition.id, index + 1]),
  );
}
