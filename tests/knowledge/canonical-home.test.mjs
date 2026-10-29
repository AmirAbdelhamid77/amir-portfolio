// Guards for the canonical homepage consolidation.
//
// These are source-level invariants: they fail if a second landing
// implementation appears, if the legacy address stops being an alias, if the
// reviewed insight records drift, or if the landing starts promising a published
// Atlas graph. The browser and HTTP behaviour is proven separately by
// `scripts/verify-canonical-home.mjs` (static export) and
// `scripts/qa-canonical-home.mjs` (real interactions).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { eligibleInsights } from "../../lib/knowledge/insights.ts";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const LANDING_SOURCE = "components/knowledge/hansa-landing.tsx";
const ROOT_ROUTE = "app/page.tsx";
const ALIAS_ROUTE = "app/prototype-c/page.tsx";
const STAGE = "components/knowledge/insight-stage.tsx";

const feed = JSON.parse(read("content/knowledge/insights.json"));

// The reviewed records as published on 2026-10-26. If an edition is added or
// corrected it must be re-recorded here deliberately, together with its source
// check — this is the guard against silent editorial drift during a refactor.
const EXPECTED_EDITIONS = [
  {
    id: "hansa-insight-shortcut-reference-v1",
    date: "2026-10-26",
    topic: "OneLake",
    conceptId: "concept:fabric:shortcut",
    sourceUrl: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts",
    sourceLocator: "What are shortcuts?; Internal OneLake shortcuts; Caching",
    reviewStatus: "technical_review",
  },
  {
    id: "hansa-insight-shortcut-delete-v1",
    date: "2026-10-25",
    topic: "OneLake",
    conceptId: "concept:fabric:shortcut",
    sourceUrl: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts",
    sourceLocator: "How do shortcuts handle deletions?",
    reviewStatus: "technical_review",
  },
  {
    id: "hansa-insight-shortcut-discovery-v1",
    date: "2026-10-24",
    topic: "Lakehouse",
    conceptId: "concept:fabric:shortcut",
    sourceUrl: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts",
    sourceLocator: "Where can I create shortcuts? → Lakehouse",
    reviewStatus: "technical_review",
  },
];

test("exactly one landing implementation exists and both routes render it", () => {
  assert.ok(exists(LANDING_SOURCE), "the canonical landing module is missing");

  const landing = read(LANDING_SOURCE);
  assert.match(landing, /export function HansaKnowledgeLanding\b/);
  assert.match(landing, /InsightStage/, "the landing must compose the existing stage");

  for (const route of [ROOT_ROUTE, ALIAS_ROUTE]) {
    const source = read(route);
    assert.match(
      source,
      /HansaKnowledgeLanding/,
      `${route} must render the canonical landing module`,
    );
    assert.doesNotMatch(
      source,
      /InsightStage|insight-rail|knowledge-dealer/,
      `${route} must not compose the stage itself — that is a second implementation`,
    );
    assert.doesNotMatch(
      source,
      /className=/,
      `${route} must not carry its own landing markup`,
    );
  }

  // The alias renders one component and no second copy of the experience.
  const alias = read(ALIAS_ROUTE);
  assert.equal(
    (alias.match(/<HansaKnowledgeLanding\s*\/>/g) ?? []).length,
    1,
    "the alias must render the landing exactly once",
  );
  assert.match(alias, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  assert.match(alias, /canonical:\s*"\/"/);
});

test("the retired landing implementations are gone, not merely unused", () => {
  for (const retired of [
    "components/knowledge/prototype-c.tsx",
    "components/knowledge/knowledge-stage.tsx",
  ]) {
    assert.equal(
      exists(retired),
      false,
      `${retired} is a superseded landing implementation and must not remain`,
    );
  }
});

test("only the canonical landing module imports the stage", () => {
  const owners = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["out", "build"].includes(entry.name)) continue;
        walk(rel);
      } else if (/\.(tsx|ts)$/.test(entry.name)) {
        if (/from\s+"\.\/insight-stage"|from\s+"@\/components\/knowledge\/insight-stage"/.test(read(rel))) {
          owners.push(rel.replaceAll(path.sep, "/"));
        }
      }
    }
  };
  walk("app");
  walk("components");
  assert.deepEqual(
    owners.sort(),
    [LANDING_SOURCE],
    "the stage must have exactly one owner module",
  );
});

test("no build-time switch re-selects a different homepage", () => {
  // Assembled so this file does not contain the flag it searches for.
  const retiredFlag = ["NEXT_PUBLIC", "HANSA", "PROTOTYPE_C"].join("_");
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      if (["node_modules", "out", "build", ".git", ".next"].includes(entry.name)) continue;
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".")) continue;
        walk(rel);
      } else if (/\.(tsx|ts|mjs|js|json|jsonc)$/.test(entry.name)) {
        if (read(rel).includes(retiredFlag)) {
          offenders.push(rel.replaceAll(path.sep, "/"));
        }
      }
    }
  };
  for (const dir of ["app", "components", "lib", "content", "scripts", "tests"]) walk(dir);
  assert.deepEqual(
    offenders,
    [],
    "the landing is selected by the route, never by an environment flag",
  );
});

test("the reviewed editions survive the migration byte-for-byte in meaning", () => {
  assert.equal(feed.items.length, EXPECTED_EDITIONS.length);
  for (const expected of EXPECTED_EDITIONS) {
    const actual = feed.items.find((item) => item.id === expected.id);
    assert.ok(actual, `edition ${expected.id} disappeared`);
    for (const [key, value] of Object.entries(expected)) {
      assert.equal(actual[key], value, `${expected.id}.${key} drifted`);
    }
    assert.deepEqual(actual.questionIds, [], "an edition must never carry question IDs");
    assert.ok(actual.scenario.length > 40 && actual.takeaway && actual.caveat);
  }
  // The public projection stays fail-closed; the landing opts into preview
  // editions explicitly.
  assert.equal(eligibleInsights(feed.items).length, 0);
  assert.equal(eligibleInsights(feed.items, true).length, 3);
});

test("public copy drops the prototype framing but keeps the review status", () => {
  const publicFiles = [
    LANDING_SOURCE,
    ROOT_ROUTE,
    ALIAS_ROUTE,
    STAGE,
    "components/knowledge/insight-archive.tsx",
    "components/knowledge/atlas-peek-stage.tsx",
    "content/knowledge/insights.json",
  ];
  for (const file of publicFiles) {
    assert.doesNotMatch(
      read(file),
      /Prototype C|local editorial preview/i,
      `${file} still shows the experimental framing to the public`,
    );
  }
  assert.match(read(STAGE), /Editions under editorial review/);
  assert.match(read(STAGE), /Technical review/);
  assert.match(read("content/knowledge/insights.json"), /human publication review is pending/i);
});

test("the landing never promises a published Atlas graph", () => {
  const stage = read(STAGE);
  const peek = read("components/knowledge/atlas-peek-stage.tsx");
  for (const source of [stage, peek]) {
    assert.doesNotMatch(source, /Explore the full Atlas|Launch full Atlas/);
  }
  assert.match(peek, /Reviewed connections are not published yet/);
  assert.match(peek, /Open the Atlas/);
});

test("landing permalinks are root-scoped and the archive anchor is intact", () => {
  const archive = read("components/knowledge/insight-archive.tsx");
  assert.match(archive, /href=\{`\/\?insight=\$\{encodeURIComponent\(item\.id\)\}`\}/);
  assert.match(archive, /id="archive"/, "the #archive anchor must keep working");
  assert.match(read(STAGE), /href="#archive"/);
});

test("the route registry names one landing source and one canonical URL", () => {
  const site = read("lib/site.ts");
  assert.match(site, /export const LANDING = \{/);
  assert.match(site, /source: "components\/knowledge\/hansa-landing\.tsx"/);
  assert.match(site, /canonical: "\/"/);
  assert.match(site, /legacy: "\/prototype-c\/"/);
  assert.ok(exists("components/knowledge/hansa-landing.tsx"));
});

test("Today is reachable from every page and the landing adds Atlas", () => {
  const site = read("lib/site.ts");
  assert.match(site, /export const NAV = \[\s*\{\s*href: "\/",\s*label: "Today"/);
  assert.match(site, /export const LANDING_NAV = \[/);
  for (const href of [
    '"/"',
    '"/learn/catalogue"',
    '"/practice/catalogue"',
    '"/learn/dp-600/atlas/"',
    '"/about"',
  ]) {
    assert.ok(
      site.slice(site.indexOf("export const LANDING_NAV")).includes(href),
      `the landing navigation must include ${href}`,
    );
  }
  const header = read("components/site-header.tsx");
  assert.match(header, /isLanding \? LANDING_NAV : NAV/);
  assert.match(header, /activeHrefFor/);
});

test("the legacy URL stays out of sitemap, robots and the search index", () => {
  const sitemap = read("app/sitemap.ts");
  assert.doesNotMatch(sitemap, /prototype-c/);
  const paths = [...sitemap.matchAll(/path:\s*"([^"]*)"/g)].map((match) => match[1]);
  assert.ok(paths.includes(""), "the canonical homepage must be in the sitemap");
  const documents = read("lib/search/documents.ts");
  assert.doesNotMatch(documents, /prototype-c/);
  assert.match(documents, /url: "\/",/, "the landing must be findable in site search");
});

test("the professional routes stay discoverable from the landing", () => {
  const footer = read("components/site-footer.tsx");
  assert.doesNotMatch(
    footer,
    /FOOTER_LINKS\.filter/,
    "the landing must not hide the Work/Experience/Contact footer group",
  );
  const site = read("lib/site.ts");
  for (const href of ['"/work"', '"/services"', '"/experience"', '"/contact"', '"/about"']) {
    assert.ok(site.includes(href), `${href} must remain a registered destination`);
  }
});

test("the landing never writes learner progress or question state", () => {
  for (const file of [
    LANDING_SOURCE,
    STAGE,
    "components/knowledge/insight-archive.tsx",
    "components/knowledge/atlas-peek-stage.tsx",
    ROOT_ROUTE,
    ALIAS_ROUTE,
  ]) {
    const source = read(file);
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|indexedDB/,
      `${file} must not read or write browser storage`,
    );
  }
});
