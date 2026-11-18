// R6 regression: the Academy unit suite must run as part of `test:all`.
// `tests/academy/` held working unit tests, but no suite script or aggregate
// command ran them, so the stale About baseline stayed invisible until it was
// run by hand. The e2e and smoke programs stay separate: they need a server or
// a browser and are not matched by the unit glob.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

test("test:all runs the Academy unit suite", () => {
  const script = pkg.scripts["test:academy"];
  assert.ok(script, "package.json needs a test:academy script");
  assert.match(script, /--test "tests\/academy\/\*\.test\.mjs"/);
  assert.match(pkg.scripts["test:all"], /npm run test:academy/);
});

test("the Academy unit glob selects the unit tests and leaves e2e/smoke out", () => {
  const files = readdirSync(join(root, "tests/academy"));
  const unit = files.filter(name => name.endsWith(".test.mjs")).sort();
  const separate = files.filter(name => !name.endsWith(".test.mjs")).sort();
  assert.ok(unit.length >= 2, `expected Academy unit tests, found ${unit.length}`);
  assert.ok(separate.includes("e2e.mjs"), "the browser e2e program stays separate");
  assert.ok(separate.includes("legacy-smoke.mjs"), "the smoke program stays separate");
  assert.ok(separate.includes("static-host.mjs"), "the host program stays separate");
  assert.ok(
    !pkg.scripts["test:academy"].includes("e2e"),
    "the unit script must not pick up the e2e program",
  );
});
