// HSE rate mathematics, kept pure so the explainer, the case-study copy and the
// tests all use one definition.
//
// Definitions (the ones the HSE case study publishes):
//   TRIR  = recordable cases      × 200,000 / hours worked   (OSHA base)
//   LTIFR = lost-time injuries    × 1,000,000 / hours worked (1M base)
//
// The two rates are quoted on different hour bases. They are not comparable until
// they share one: a recordable case includes a lost-time case, so on a common
// base the recordable rate must be the larger number. That single sentence is
// what the explainer exists to make visible.

export const OSHA_BASE_HOURS = 200_000;
export const MILLION_HOURS = 1_000_000;

export type HseCounts = {
  /** Recordable cases in the period (includes lost-time cases). */
  recordables: number;
  /** Lost-time injuries in the period; must be a subset of `recordables`. */
  lostTime: number;
  /** Hours worked in the period. */
  hours: number;
};

export type HseValidation = {
  ok: boolean;
  problems: string[];
};

/** Round-half-up to two decimals for display; the value itself stays exact. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** A rate per `base` hours. Returns `null` when the inputs cannot produce one. */
export function rateFor(count: number, hours: number, base: number): number | null {
  if (!Number.isFinite(count) || !Number.isFinite(hours) || !Number.isFinite(base)) return null;
  if (count < 0 || hours <= 0 || base <= 0) return null;
  return (count * base) / hours;
}

export function trir(recordables: number, hours: number): number | null {
  return rateFor(recordables, hours, OSHA_BASE_HOURS);
}

export function ltifr(lostTime: number, hours: number): number | null {
  return rateFor(lostTime, hours, MILLION_HOURS);
}

/** Convert a rate from one hour base to another: r2 = r1 × base2 / base1. */
export function convertRate(rate: number | null, fromBase: number, toBase: number): number | null {
  if (rate === null || !Number.isFinite(rate) || fromBase <= 0 || toBase <= 0) return null;
  return (rate * toBase) / fromBase;
}

export function validateCounts(counts: HseCounts): HseValidation {
  const problems: string[] = [];
  if (!Number.isFinite(counts.hours) || counts.hours <= 0) {
    problems.push("Hours worked must be greater than zero.");
  }
  if (!Number.isInteger(counts.recordables) || counts.recordables < 0) {
    problems.push("Recordable cases must be a whole number, zero or more.");
  }
  if (!Number.isInteger(counts.lostTime) || counts.lostTime < 0) {
    problems.push("Lost-time injuries must be a whole number, zero or more.");
  }
  if (
    Number.isInteger(counts.recordables) &&
    Number.isInteger(counts.lostTime) &&
    counts.lostTime > counts.recordables
  ) {
    problems.push(
      "Lost-time injuries cannot exceed recordable cases: every lost-time case is also a recordable case.",
    );
  }
  return { ok: problems.length === 0, problems };
}

export type HseModel = {
  /** Recordable rate on the OSHA 200,000-hour base. */
  trirOsha: number | null;
  /** Lost-time rate on the 1,000,000-hour base. */
  ltifrMillion: number | null;
  /** Both rates expressed on the 1,000,000-hour base. */
  trirMillion: number | null;
  ltifrOnMillion: number | null;
  /** Both rates expressed on the OSHA 200,000-hour base. */
  trirOnOsha: number | null;
  ltifrOsha: number | null;
  /** Recordables per lost-time injury, the ratio the two published rates imply. */
  ratio: number | null;
  /** True when the common-base recordable rate is at least the lost-time rate. */
  consistent: boolean;
  validation: HseValidation;
};

export function modelFor(counts: HseCounts): HseModel {
  const validation = validateCounts(counts);
  const trirOsha = trir(counts.recordables, counts.hours);
  const ltifrMillion = ltifr(counts.lostTime, counts.hours);
  const trirMillion = trirOsha === null ? null : (trirOsha * MILLION_HOURS) / OSHA_BASE_HOURS;
  const ltifrOnMillion = ltifrMillion;
  const trirOnOsha = trirOsha;
  const ltifrOsha =
    ltifrMillion === null ? null : (ltifrMillion * OSHA_BASE_HOURS) / MILLION_HOURS;
  const consistent =
    trirMillion !== null && ltifrOnMillion !== null ? trirMillion >= ltifrOnMillion : false;
  const ratio =
    counts.lostTime > 0 && Number.isFinite(counts.recordables)
      ? counts.recordables / counts.lostTime
      : null;
  return {
    trirOsha,
    ltifrMillion,
    trirMillion,
    ltifrOnMillion,
    trirOnOsha,
    ltifrOsha,
    ratio,
    consistent,
    validation,
  };
}

/**
 * Illustrative counts that reproduce the case study's published display values
 * after rounding: TRIR 0.19 per 200,000 hours and LTIFR 0.28 per 1,000,000 hours.
 * These are counts, not observations — the case study ships no fact table.
 */
export const ILLUSTRATIVE_COUNTS: HseCounts = {
  recordables: 24,
  lostTime: 7,
  hours: 25_000_000,
};

export function formatRate(value: number | null): string {
  return value === null || !Number.isFinite(value) ? "—" : value.toFixed(2);
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
