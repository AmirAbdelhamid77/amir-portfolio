// FC13 — link-rule parity spot checks: the comparator must apply the SAME
// link decisions as components/fabric/article/ArticleBody.tsx + decisions.ts
// (the rules documented in the FC05 report §4):
//
//   relative .md   → local logical route via registry lookup (anchors only
//                    when compiler-validated; unpublished target → upstream)
//   anchor-only    → same-page slug validation (else plain text, never dead)
//   site-absolute  → local when /fabric/<published>, else upstream
//   other docsets  → upstream learn.microsoft.com
//   external/mail  → preserved (external opens new tab, rel=noopener)
//   unclassified   → plain text with an accessible note (never a dead href)
//
//   node --experimental-strip-types --test tests/fabric-corpus/comparator/
//
// Reads the canonical comparator sites (fail-safe skip when not rendered).

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");
const SITE_ROOT = path.join(buildDir, "comparator", "root", "site");
const SITE_SUB = path.join(buildDir, "comparator", "subpath", "site");
const registryPath = path.join(buildDir, "route-registry", "route-registry.json");

const registry = existsSync(registryPath)
  ? JSON.parse(readFileSync(registryPath, "utf8"))
  : null;

function walk(root) {
  const out = [];
  const rec = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) rec(full);
      else out.push({ rel: path.relative(root, full).split(path.sep).join("/"), file: full });
    }
  };
  rec(root);
  return out;
}

const htmlFiles = (root) => walk(root).filter((f) => f.rel.endsWith(".html"));
const SITE_READY = existsSync(SITE_ROOT) && htmlFiles(SITE_ROOT).length > 0;

const article = (rel) => readFileSync(path.join(SITE_ROOT, ...rel.split("/")), "utf8");

test("link-rule parity [relative-md → local]: cross-family link renders as the unprefixed logical route", (t) => {
  if (!SITE_READY) t.skip("comparator root site missing — render it first");
  // fundamentals/analyze-train-data links ../data-science/concept-data-agent.md
  // (published) → must be a local route href, NOT upstream, NOT a .md href.
  const html = article("learn/fabric/docs/fundamentals/analyze-train-data/index.html");
  assert.ok(
    html.includes('href="/learn/fabric/docs/data-science/concept-data-agent/"'),
    "relative-md to a published article must become the local logical route",
  );
  assert.ok(
    !html.includes('href="/learn/fabric/docs/data-science/concept-data-agent.md'),
    "never a raw .md local href",
  );
});

test("link-rule parity [unpublished target → upstream]: excluded/quarantined targets never get local links", (t) => {
  if (!SITE_READY || !registry) t.skip("site or registry missing");
  const publishedPaths = new Set(
    registry.families.flatMap((f) => f.articles.map((a) => a.logicalPath)),
  );
  assert.ok(registry.excluded.length >= 78, "registry carries excluded rows");
  // Whole-site scan: every local docs href resolves to a PUBLISHED route —
  // held paths never appear as local links (they stay upstream, fail-closed).
  for (const f of htmlFiles(SITE_ROOT)) {
    const html = readFileSync(f.file, "utf8");
    for (const m of html.matchAll(/href="(\/learn\/fabric\/docs\/[^"#?]*)\/?(#[^"]*)?"/g)) {
      const logical = m[1].endsWith("/") ? m[1] : m[1] + "/";
      assert.ok(
        publishedPaths.has(logical) || logical === "/learn/fabric/docs/",
        `${f.rel}: local docs href ${logical} must be a published route (excluded paths stay upstream)`,
      );
    }
  }
});

test("link-rule parity [anchor-only → same-page slug validation]: every same-page #anchor resolves to an id", (t) => {
  if (!SITE_READY) t.skip("comparator root site missing");
  const articleFiles = htmlFiles(SITE_ROOT).filter(
    (f) => f.rel.startsWith("learn/fabric/docs/") && f.rel.endsWith("index.html"),
  );
  assert.ok(articleFiles.length > 1000, "sanity: the docs corpus is present");
  for (const f of articleFiles) {
    const html = readFileSync(f.file, "utf8");
    const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
    for (const m of html.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(ids.has(m[1]), `${f.rel}: same-page anchor #${m[1]} must target an existing id`);
    }
  }
});

test("link-rule parity [other docsets + external → upstream]: only the docs namespace is served locally", (t) => {
  if (!SITE_READY) t.skip("comparator root site missing");
  // Upstream links exist corpus-wide with the safe-external attribute set.
  let sawSafeUpstream = false;
  for (const f of htmlFiles(SITE_ROOT)) {
    for (const m of readFileSync(f.file, "utf8").matchAll(/href="(\/[^"]+)"/g)) {
      const href = m[1];
      assert.ok(
        href.startsWith("/learn/fabric/"),
        `${f.rel}: unexpected local absolute href ${href} — other docsets must stay upstream (learn.microsoft.com)`,
      );
    }
    if (!sawSafeUpstream && /href="https:\/\/learn\.microsoft\.com\/en-us\/[^"]+" target="_blank" rel="noopener noreferrer"/.test(readFileSync(f.file, "utf8"))) {
      sawSafeUpstream = true;
    }
  }
  assert.equal(sawSafeUpstream, true, "corpus-wide upstream links carry target=_blank rel=noopener noreferrer");
});

test("link-rule parity [no raw local .md hrefs site-wide]", (t) => {
  if (!SITE_READY) t.skip("comparator root site missing");
  let rawLocalMd = 0;
  for (const f of htmlFiles(SITE_ROOT)) {
    const html = readFileSync(f.file, "utf8");
    for (const m of html.matchAll(/href="([^"]*\.md[^"]*)"/g)) {
      // Every .md-bearing href must be an absolute upstream URL — a local
      // .md href would be a broken rewrite (FC05 rule).
      if (!m[1].startsWith("https://")) rawLocalMd += 1;
    }
  }
  assert.equal(rawLocalMd, 0, "no local .md hrefs anywhere in the comparator site");
});

test("link-rule parity [unresolvable → plain text]: unresolved references are inert notes, never dead <a> elements", (t) => {
  if (!SITE_READY) t.skip("comparator root site missing");
  let unresolvedSpans = 0;
  for (const f of htmlFiles(SITE_ROOT).filter((f) => f.rel.startsWith("learn/fabric/docs/"))) {
    const html = readFileSync(f.file, "utf8");
    for (const m of html.matchAll(/<span[^>]*class="link-unresolved"[^>]*>[\s\S]*?<\/span>/g)) {
      unresolvedSpans += 1;
      assert.ok(!/<a\s/.test(m[0]), `${f.rel}: unresolved reference must not contain an <a> element`);
    }
  }
  assert.ok(unresolvedSpans > 0, "the corpus contains unresolved references; the decision layer must surface them as notes");
});

test("link-rule parity [subpath]: identical pages with the base path applied exactly once", (t) => {
  if (!SITE_READY) t.skip("comparator root site missing");
  if (!existsSync(SITE_SUB) || htmlFiles(SITE_SUB).length === 0) t.skip("comparator subpath site missing");
  const rootHtml = article("learn/fabric/docs/fundamentals/analyze-train-data/index.html");
  const subHtml = readFileSync(
    path.join(SITE_SUB, "learn/fabric/docs/fundamentals/analyze-train-data/index.html"),
    "utf8",
  );
  // Same logical link decisions; only the prefix differs.
  assert.equal(
    subHtml.replaceAll("/REPOSITORY_NAME", ""),
    rootHtml,
    "subpath page equals the root page with the base path stripped",
  );
  // And no double prefix anywhere in the subpath page.
  assert.ok(!subHtml.includes("/REPOSITORY_NAME/REPOSITORY_NAME"), "no double prefix");
});
