// The fixed dataset behind the flagship "From dot to decision" story.
// It is authored teaching data, not product telemetry. Keeping it here means
// the landing-page teaser, the lab and the docs all quote the same numbers.
import {
  meanConfidenceInterval,
  summarize,
  zTestPValue,
} from "@/lib/statistics/math";

export const FLAGSHIP_DATA = [
  4.2, 5.1, 5.4, 5.8, 6.0, 6.1, 6.3, 6.4, 6.6, 6.8, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9,
  8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.9, 9.0, 9.2, 9.4, 9.7, 10.0, 10.3, 10.8, 11.5, 12.4, 14.0, 16.2,
] as const;

export const FLAGSHIP_SEED = 2026;
export const FLAGSHIP_MU0 = 7.5;
export const FLAGSHIP_THRESHOLD = 1;

const summary = summarize(FLAGSHIP_DATA);
const se = summary.sampleSd / Math.sqrt(FLAGSHIP_DATA.length);
const interval = meanConfidenceInterval({
  mean: summary.mean,
  sd: summary.sampleSd,
  n: FLAGSHIP_DATA.length,
  confidence: 0.95,
});
const z = (summary.mean - FLAGSHIP_MU0) / se;

export const FLAGSHIP = {
  n: FLAGSHIP_DATA.length,
  mean: summary.mean,
  median: summary.median,
  sd: summary.sampleSd,
  se,
  interval,
  effect: summary.mean - FLAGSHIP_MU0,
  z,
  p: zTestPValue(z, "two-sided"),
  significant: zTestPValue(z, "two-sided") <= 0.05,
  practical: summary.mean - FLAGSHIP_MU0 >= FLAGSHIP_THRESHOLD,
  mu0: FLAGSHIP_MU0,
  threshold: FLAGSHIP_THRESHOLD,
} as const;
