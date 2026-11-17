// The patrick-dp600 bank must keep the source's own answer keys.
//
// History: the community-bank importer read the key from the
// "<summary>Answer</summary>" label, so it keyed every question A. 22 of the
// 30 questions were wrong until the 2026-11-17 errata
// (docs/answer-key-errata-20261117.md). The importer is pinned by an older
// receipt layer that no current layer can hop, so the correction lives in the
// data and this test is the tripwire: re-running the old importer and
// committing its output fails here instead of silently returning 22 wrong
// keys to learners.
//
//   npm run test:knowledge
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const SOURCE = "content/intake/hansa-integration/packs/patrick-dp600/source.md";
const BANK = "content/fabric/questions/patrick-dp600.json";

function readSourceKeys() {
  const text = readFileSync(path.join(repoRoot, SOURCE), "utf8");
  const keys = new Map();
  // split with a capture returns [before, number, body, number, body, ...].
  // Questions 16-30 append their domain to the heading, so the tail is free.
  const blocks = text.split(/^### Question\s+(\d+)\b.*$/m);
  for (let index = 1; index < blocks.length; index += 2) {
    const number = Number(blocks[index]);
    const body = blocks[index + 1];
    const match = body.match(/\*\*Correct:\s*([A-D])\s*\*\*/);
    assert.ok(match, `source question ${number} states a "**Correct: X**" key`);
    keys.set(number, match[1]);
  }
  return keys;
}

test("the patrick-dp600 bank keeps the source's 30 answer keys", () => {
  const keys = readSourceKeys();
  assert.equal(keys.size, 30, "the source holds 30 questions");

  const bank = JSON.parse(readFileSync(path.join(repoRoot, BANK), "utf8"));
  assert.equal(bank.length, 30, "the bank holds 30 questions");

  for (const question of bank) {
    const number = Number(String(question.sourceId).replace(/^PATRICK-/, ""));
    assert.ok(keys.has(number), `${question.id} maps to a source question`);
    assert.deepEqual(question.correct, [keys.get(number)], `${question.id} key matches the source`);
  }

  // The defect made every key A; a single distinct key means it is back.
  assert.ok(new Set(keys.values()).size > 1, "the all-A importer bug has not recurred");
});
