// Public titles imported from the owner's Notion exports carried the page icon
// and the author's own ordering prefix ("📊 03 — …", "1️⃣ …"). The importers
// strip them; this helper is the display-time safety net for content already in
// the repository. IDs, anchors, URLs and source bodies are untouched.

const LEADING_MARK =
  /^(?:(?:[0-9#*]\uFE0F?\u20E3)|[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D])+\s*/u;
const LEADING_ORDER = /^(?:#?\d{1,3}[.)]\s+|\d{1,2}\s*[—–-]\s+)/;

export function displayTitle(value: string): string {
  return value
    .trim()
    .replace(LEADING_MARK, "")
    .replace(LEADING_ORDER, "")
    .replace(/\s+/g, " ")
    .trim();
}
