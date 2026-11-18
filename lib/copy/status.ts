// Display-time translation of recorded package status codes. The codes stay in
// the data and the receipts; visitors see a sentence. Keep this a pure string
// map so tests can hold it to exact expected output.

const STATUS_LABELS: Record<string, string> = {
  NOT_RUN: "Not run",
  PASS_DATA_PROFILE: "Source data profiled",
  PASS_RESPONSE_PROFILE: "Source response profiled",
  PASS_SQLITE_SELECT_EXECUTION: "Read-only source query run",
  COMPLETE_SOURCE_PACKAGE_WITH_EXPLICIT_HOLDS: "Complete source package, with holds stated",
};

export function plainStatus(value: string): string {
  let output = value;
  for (const [code, label] of Object.entries(STATUS_LABELS)) {
    output = output.replaceAll(code, label);
  }
  return output;
}

/** First clause of a recorded validation note, translated for display. */
export function plainStatusLead(value: string): string {
  return plainStatus(value.split(";")[0] ?? value).trim();
}

/** Apply plainStatus to every string in a parsed content object. */
export function plainStatusDeep<T>(value: T): T {
  if (typeof value === "string") return plainStatus(value) as T;
  if (Array.isArray(value)) return value.map((item) => plainStatusDeep(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        plainStatusDeep(item),
      ]),
    ) as T;
  }
  return value;
}
