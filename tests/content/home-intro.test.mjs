import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// T2.5: the top of the home page orients before it exhibits. This guard holds
// the three accepted parts in order — who and what, the way in, the three doors
// — and proves the Continue card cannot appear in prerendered HTML, where no
// browser storage exists.

const root = resolve(import.meta.dirname, "../..");
const read = (path) => readFileSync(join(root, path), "utf8");
const page = read("app/page.tsx");
const home = read("components/hansa/timeline-home.tsx");
const intro = read("components/hansa/home-intro.tsx");

test("the home opening renders above the timeline and keeps every day URL", () => {
  assert.match(page, /<TimelineHome[\s\S]*exams=/);
  assert.match(home, /<HomeIntro exams=\{exams\} \/>/);
  assert.ok(
    home.indexOf("<HomeIntro") < home.indexOf("<Timeline"),
    "the opening must precede the timeline",
  );
  assert.match(home, /date >= DAILY_HISTORY_START \? `\/day\/live\/\?date=\$\{date\}` : `\/day\/\$\{date\}\/`/);
  assert.doesNotMatch(home, /<h1[\s>]/, "the intro owns the only h1");
});

test("who and what, two buttons and a smaller Practice link", () => {
  assert.match(intro, /I&apos;m Amir Abdelhamid\./);
  assert.match(intro, />\s*Start learning\s*</);
  assert.match(intro, />\s*See my work\s*</);
  assert.match(intro, /href="\/practice\/catalogue"/);
  assert.equal((intro.match(/<h1/g) ?? []).length, 1);
});

test("three doors, one sentence and one action each", () => {
  for (const [title, href] of [
    ["Learn", "/learn"],
    ["Practice", "/practice/catalogue"],
    ["Work", "/work"],
  ]) {
    assert.match(intro, new RegExp(`title: "${title}",\\s*href: "${href}"`));
  }
  assert.equal((intro.match(/action: "/g) ?? []).length, 3);
});

test("the Continue card is storage-gated and renders nothing when empty", () => {
  assert.match(intro, /if \(!target\) return null;/);
  assert.match(intro, /useLabStore\(\)/);
  assert.match(intro, /useFabricStore\(\)/);
  assert.match(intro, /amir-lab-v1|useLabStore/);
  assert.match(intro, /\/lab\/dp-600\/\$\{MODE_ROUTE\[active\.mode\]\}\/\?session=/);
});

test("the built home carries the opening and no storage-dependent card", (t) => {
  const file = join(root, "out/index.html");
  if (!existsSync(file)) {
    t.skip("out/ is not built");
    return;
  }
  const html = readFileSync(file, "utf8");
  const count = (html.match(/<h1/g) ?? []).length;
  assert.equal(count, 1, "the home page renders exactly one h1");
  assert.match(html, /Start learning/);
  assert.match(html, /See my work/);
  for (const href of ["/learn", "/practice/catalogue", "/work"]) {
    assert.ok(
      html.includes(`href="${href}"`) || html.includes(`href="${href}/"`),
      href,
    );
  }
  assert.doesNotMatch(html, /Continue where you left off/);
});
