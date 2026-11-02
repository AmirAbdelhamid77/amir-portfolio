// Small local inspection helper: search the extracted ledger and print
// evidence-bearing snippets. Never used at runtime by the prototype.
import { readFileSync } from "node:fs";

const [query, limitArg] = process.argv.slice(2);
if (!query) {
  console.error("usage: node search-units.mjs <regex> [limit]");
  process.exit(2);
}
const limit = Number(limitArg ?? 12);
const units = readFileSync("intelligent-atlas/analysis/units.jsonl", "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line));
const pattern = new RegExp(query, "i");
let shown = 0;
for (const unit of units) {
  if (shown >= limit) break;
  const match = unit.text.match(pattern);
  if (!match) continue;
  const start = Math.max(0, match.index - 180);
  const end = Math.min(unit.text.length, match.index + match[0].length + 320);
  console.log(`\n### ${unit.unitId} · ${unit.title}`);
  console.log(`${unit.canonicalHref} · ${unit.locator}`);
  console.log(`…${unit.text.slice(start, end).replace(/\s+/g, " ")}…`);
  shown += 1;
}
console.log(`\n(${shown} shown)`);
