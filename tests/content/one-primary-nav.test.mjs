import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

// PRODUCT.md §4: one primary navigation on every route, including home —
// Learn, Practice, Work, About, plus Search and Contact. No second primary
// nav: the island capsule, the landing variant and the CSS that hid the header
// on home are all retired.

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "out");

const source = path => readFileSync(join(root, path), "utf8");
const build = path => readFileSync(join(out, ...path.split("/")), "utf8");

const PRIMARY = ["Learn", "Practice", "Work", "About"];

function primaryNav(html) {
  const match = html.match(/<nav[^>]*aria-label="Primary"[^>]*>([\s\S]*?)<\/nav>/);
  return match?.[1] ?? "";
}

function labels(nav) {
  return [...nav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map(match =>
    match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  );
}

test("the shared nav is Learn, Practice, Work, About everywhere", () => {
  const site = source("lib/site.ts");
  const block = site.match(/export const NAV = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const values = [...block.matchAll(/label: "([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(values, PRIMARY);
  assert.ok(!site.includes("LANDING_NAV"), "the landing variant must be retired");
  assert.ok(!/label: "Today"/.test(block), "Today is not a primary item");
  assert.ok(!/label: "Atlas"/.test(block), "Atlas is not a primary item");

  const header = source("components/site-header.tsx");
  assert.match(header, /const navigation = NAV;/);
  assert.ok(!header.includes("IslandNav"), "the header must not mount the island nav");
  assert.ok(header.includes("href=\"/contact\""), "Contact stays in the header");
  assert.ok(header.includes("Search the site"), "Search stays in the header");
});

test("no route mounts a second primary nav and home no longer hides the header", () => {
  const files = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(tsx|ts)$/.test(entry.name)) files.push(path);
    }
  })(join(root, "app"));
  for (const path of ["components/hansa/timeline-home.tsx", "components/hansa/live-day.tsx"]) {
    files.push(join(root, ...path.split("/")));
  }
  for (const path of files) {
    const rel = path.slice(root.length + 1);
    assert.ok(!readFileSync(path, "utf8").includes("island-nav"), `${rel}: mounts the island nav`);
  }

  const css = source("app/globals.css");
  assert.ok(!css.includes("data-home-v2"), "the home header-hiding rule must be gone");
});

test("the static home renders the shared header, footer and one primary nav", () => {
  assert.ok(existsSync(join(out, "index.html")), "run `npm run build` before `npm run test:all`");

  for (const route of ["index.html", "day/2026-10-24/index.html", "learn/index.html"]) {
    const html = build(route);
    assert.equal((html.match(/<header\b/g) ?? []).length, 1, `${route}: expected one header`);
    assert.equal((html.match(/<footer\b/g) ?? []).length >= 1, true, `${route}: expected a footer`);

    const navs = [...html.matchAll(/<nav[^>]*aria-label="Primary"[^>]*>/g)];
    assert.equal(navs.length, 1, `${route}: expected exactly one Primary nav`);
    assert.deepEqual(labels(primaryNav(html)).slice(0, 4), PRIMARY, `${route}: primary order`);
    // The static export writes trailing slashes (`/contact/`); accept both so
    // the guard tests presence, not the export's trailing-slash setting.
    assert.match(html, /href="\/search\/?"/, `${route}: Search`);
    assert.match(html, /href="\/contact\/?"/, `${route}: Contact`);
  }
});
