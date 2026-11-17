import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// PRODUCT.md §5: Power BI is its own course, but it currently has about four
// taught units. Until a full course exists, the subject page says plainly how
// much is taught and points exam-level material at the DP-600 track. The count
// is derived from the curriculum model, so this guard compares the notice with
// the unit statistic rendered beside it rather than pinning the literal 4.

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "out");

const text = path =>
  readFileSync(join(out, ...path.split("/")), "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

test("the Power BI page states the derived unit count and points at DP-600", () => {
  assert.ok(existsSync(join(out, "index.html")), "run `npm run build` before `npm run test:all`");

  const page = text("learn/power-bi/index.html");
  const stat = page.match(/(\d+) Taught units/);
  const notice = page.match(/(\d+) taught units? so far/);
  assert.ok(stat, "the subject page must keep its taught-unit statistic");
  assert.ok(notice, "the Power BI page must state how much is taught");
  assert.equal(notice[1], stat[1], "the notice must derive the same count as the statistic");
  assert.ok(Number(notice[1]) > 0, "the notice must not claim zero taught units");
  assert.match(page, /full course \(prepare, model, DAX, report, publish and govern\) is planned/);
  assert.ok(
    readFileSync(join(out, "learn", "power-bi", "index.html"), "utf8").includes('href="/learn/dp-600/"'),
    "the notice must link the DP-600 Learning Academy",
  );
});

test("the notice is opt-in, so subjects with a full path do not inherit it", () => {
  for (const route of ["learn/sql/index.html", "learn/visualization/index.html"]) {
    assert.ok(!text(route).includes("taught units so far"), `${route}: unexpected notice`);
  }
});
