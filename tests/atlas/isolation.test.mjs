// FC04 Atlas isolation hardening — tests/atlas/isolation.test.mjs
//
// What this file guards:
//   1. Public projection isolation: no candidate or technical_review concept,
//      edge, catalog row, TOC row, review-only source or review notice may
//      survive projectAtlas (model.ts) or getAtlasPublic (server.ts) whether
//      HANSA_ATLAS_REVIEW_PREVIEW is unset or set. Candidate records must not
//      survive even the explicit review projection.
//   2. Legacy href families: validResourceHref stays a closed set over the
//      three documented DP-600 families. New Fabric article targets (FC08)
//      must enter through a new typed mechanism, never by widening this
//      validator — the negative case below is the tripwire for that.
//   3. atlasReturn: resourceReturnHref round-trips view state for valid hrefs
//      and returns "" for everything else; safeReturn enforces the host-safety
//      rules documented in components/atlas/return-link.tsx and
//      lib/atlas/model.ts (same-origin atlas prefix only, >=2048 chars
//      rejected, no backslash).
//   4. parseView/viewHref: view state round-trips and the unrecognized-field
//      warning behavior is unchanged.
//
// server.ts is executed by the flag-invariance test through node:module
// registerHooks: the resolve hook intercepts the "@/content/atlas/*.json"
// specifiers and the extensionless "./model" import, and the load hook serves
// those JSON file bytes as a plain JS module. Node therefore never performs an
// alias resolution or a real JSON import itself, while the real, unmodified
// lib/atlas/server.ts module graph is imported and exercised. No production
// refactor was needed to make server.ts testable; the synthetic mixed fixture
// below goes through model.ts projectAtlas directly, as the work-package brief
// allows.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  validateDataset, projectAtlas, defaultView, parseView, viewHref,
  resourceReturnHref, safeReturn, validResourceHref,
} from "../../lib/atlas/model.ts";

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const editorial = json("content/atlas/editorial.json");
const extension = json("content/atlas/dp600-extension.json");
const continuation = json("content/atlas/dp600-continuation.json");

// Same assembly as lib/atlas/server.ts DATA, including its buildVersion
// override, so projections computed here are directly comparable.
const SERVER_DATA = {
  ...editorial,
  buildVersion: "atlas-dp600-2026-10-26.2",
  concepts: [...editorial.concepts, ...extension.concepts, ...continuation.concepts],
  semanticEdges: [...editorial.semanticEdges, ...extension.semanticEdges, ...continuation.semanticEdges],
  sources: [...editorial.sources, ...extension.sources, ...continuation.sources],
  catalog: [...editorial.catalog, ...extension.catalog, ...continuation.catalog],
};

const PUBLIC_NOTICE = "The reviewed public graph is not yet published. Normal lessons and practice remain available.";

// Synthetic dataset mixing published, technical_review and candidate records.
// Built entirely in this file; content/atlas/*.json is never modified. Every
// string that must never reach a public projection carries a distinctive
// marker so the leak assertions below cannot pass by accident.
const FIXTURE = {
  schemaVersion: "1.1",
  buildVersion: "fc04-isolation-fixture",
  editorialState: "published",
  reviewNotice: "FC04-FIXTURE-REVIEW-NOTICE: internal review-only notes must never reach a public build.",
  sources: [
    { id: "src:pub", title: "Published official source", url: "https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse", locator: "Overview", checkedAt: "2026-11-01", kind: "official-documentation", visibility: "public-link" },
    { id: "src:cand", title: "Review-only official source", url: "https://learn.microsoft.com/en-us/fabric/data-engineering/one-lake-overview", locator: "Internal draft section", checkedAt: "2026-11-01", kind: "official-documentation", visibility: "public-link" },
  ],
  concepts: [
    { id: "concept:test:alpha", title: "Alpha published", aliases: ["Alpha"], definition: "Published definition of alpha.", kind: "technology_mechanism", sourceIds: ["src:pub"], editorialState: "published", position: [10, 20], mapLabel: ["Alpha"] },
    { id: "concept:test:beta", title: "Beta published", aliases: ["Beta"], definition: "Published definition of beta.", kind: "technology_mechanism", sourceIds: ["src:pub"], editorialState: "published", position: [40, 20], mapLabel: ["Beta"] },
    { id: "concept:test:delta-review", title: "Delta review", aliases: ["Delta"], definition: "FC04-FIXTURE-REVIEW-DEFINITION for delta.", kind: "technology_mechanism", sourceIds: ["src:cand"], editorialState: "technical_review", position: [70, 20], mapLabel: ["Delta"] },
    { id: "concept:test:gamma-candidate", title: "Gamma candidate", aliases: ["Gamma"], definition: "FC04-FIXTURE-CANDIDATE-DEFINITION for gamma.", kind: "technology_mechanism", sourceIds: ["src:cand"], editorialState: "candidate", position: [100, 20], mapLabel: ["Gamma"] },
  ],
  semanticEdges: [
    { id: "edge:test:alpha-beta", from: "concept:test:alpha", to: "concept:test:beta", relationType: "enables", direction: "directed", claim: "Alpha enables beta.", conditions: "When prerequisites hold.", rationale: "Documented dependency.", sourceIds: ["src:pub"], supportKind: "direct", revision: 1, checkedAt: "2026-11-01", reviewer: "Human: Fixture Reviewer", editorialState: "published" },
    { id: "edge:test:beta-delta", from: "concept:test:beta", to: "concept:test:delta-review", relationType: "related_in_decision", direction: "directed", claim: "Beta relates to delta in a decision.", conditions: "Review conditions.", rationale: "Review rationale.", sourceIds: ["src:cand"], supportKind: "direct", revision: 1, checkedAt: "2026-11-01", reviewer: "Agent: fixture", editorialState: "technical_review" },
    { id: "edge:test:gamma-delta", from: "concept:test:gamma-candidate", to: "concept:test:delta-review", relationType: "complements", direction: "symmetric", claim: "FC04-FIXTURE-CANDIDATE-CLAIM.", conditions: "Candidate conditions.", rationale: "Candidate rationale.", sourceIds: ["src:cand"], supportKind: "inference", revision: 1, checkedAt: "2026-11-01", reviewer: "Agent: fixture", editorialState: "candidate" },
  ],
  catalog: [
    { id: "res:pub", title: "Published lesson", href: "/learn/dp-600/ingestion/", kind: "lesson", conceptIds: ["concept:test:alpha"], sourcePages: [1] },
    { id: "res:rev", title: "Review question", href: "/lab/dp-600/explore/?question=fb-fixture-01", kind: "question", conceptIds: ["concept:test:delta-review"], sourcePages: [] },
    { id: "res:cand", title: "Candidate notes", href: "/lab/dp-600/resources/?pack=fixture-pack#study-notes", kind: "lesson-notes", conceptIds: ["concept:test:gamma-candidate"], sourcePages: [] },
  ],
  toc: [
    { id: "toc:pub", title: "Published guide entry", resourceId: "res:pub", conceptIds: ["concept:test:alpha"] },
    { id: "toc:cand", title: "Candidate guide entry", resourceId: "res:cand", conceptIds: ["concept:test:gamma-candidate"] },
  ],
};
validateDataset(FIXTURE);

// The public projection of the fixture is the view state used by the
// atlasReturn round-trip tests.
const ATLAS = projectAtlas(FIXTURE, false);
const VIEW = { ...defaultView(), concept: "concept:test:alpha", edge: "edge:test:alpha-beta", source: "src:pub", relation: "enables", hops: 2, incoming: true, zoom: 1.6, x: -120, y: 90 };

const forbiddenIn = (serialized, tokens, label) => {
  for (const token of tokens) assert.ok(!serialized.includes(token), `${label} leaked: ${token}`);
};

test("public projection drops every candidate and review-only record from the synthetic mixed fixture", () => {
  const pub = projectAtlas(FIXTURE, false);
  assert.deepEqual(pub.concepts.map((c) => c.id), ["concept:test:alpha", "concept:test:beta"]);
  assert.deepEqual(pub.semanticEdges.map((e) => e.id), ["edge:test:alpha-beta"]);
  assert.deepEqual(pub.sources.map((s) => s.id), ["src:pub"]);
  assert.deepEqual(pub.catalog.map((r) => r.id), ["res:pub"]);
  assert.deepEqual(pub.toc.map((t) => t.id), ["toc:pub"]);
  assert.equal(pub.preview, false);
  assert.equal(pub.notice, PUBLIC_NOTICE);
  const serialized = JSON.stringify(pub);
  forbiddenIn(serialized, [
    "candidate", "concept:test:gamma-candidate", "concept:test:delta-review",
    "edge:test:beta-delta", "edge:test:gamma-delta", "src:cand", "res:cand", "res:rev", "toc:cand",
    "FC04-FIXTURE-REVIEW-NOTICE", "FC04-FIXTURE-CANDIDATE-DEFINITION", "FC04-FIXTURE-CANDIDATE-CLAIM",
    "FC04-FIXTURE-REVIEW-DEFINITION",
  ], "public projection");
});

test("review projection admits technical_review records but never candidate records", () => {
  const review = projectAtlas(FIXTURE, true);
  assert.deepEqual(review.concepts.map((c) => c.id).sort(), ["concept:test:alpha", "concept:test:beta", "concept:test:delta-review"]);
  assert.deepEqual(review.semanticEdges.map((e) => e.id).sort(), ["edge:test:alpha-beta", "edge:test:beta-delta"]);
  assert.deepEqual(review.catalog.map((r) => r.id).sort(), ["res:pub", "res:rev"]);
  assert.deepEqual(review.toc.map((t) => t.id), ["toc:pub"]);
  assert.equal(review.preview, true);
  assert.equal(review.notice, FIXTURE.reviewNotice);
  const serialized = JSON.stringify(review);
  forbiddenIn(serialized, [
    "candidate", "concept:test:gamma-candidate", "edge:test:gamma-delta",
    "res:cand", "toc:cand", "FC04-FIXTURE-CANDIDATE-DEFINITION", "FC04-FIXTURE-CANDIDATE-CLAIM",
  ], "review projection");
});

// ---------------------------------------------------------------------------
// Real server.ts behavior. registerHooks lets Node import lib/atlas/server.ts
// unmodified: "@/content/atlas/*.json" specifiers are resolved to repo files
// and served as JS modules; the extensionless "./model" import resolves to
// model.ts. No alias resolution and no JSON import is ever performed by Node
// itself, and no exported server behavior is changed.
// ---------------------------------------------------------------------------

const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const hooks = {
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(pathToFileURL(join(repoRoot, specifier.slice(2))).href, context);
    }
    const extensionless = (specifier.startsWith("./") || specifier.startsWith("../"))
      && !/\.(m|c)?[jt]sx?$/.test(specifier) && !specifier.endsWith(".json");
    if (extensionless) {
      try { return nextResolve(specifier, context); }
      catch { return nextResolve(specifier + ".ts", context); }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".json")) {
      return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")};`, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
};

test("real server.ts: getAtlasPublic() is identical with HANSA_ATLAS_REVIEW_PREVIEW unset and =1", async (t) => {
  if (typeof registerHooks !== "function") return t.skip("node:module registerHooks is unavailable in this Node build");
  registerHooks(hooks);
  delete process.env.HANSA_ATLAS_REVIEW_PREVIEW;
  const server = await import("../../lib/atlas/server.ts");

  const publicUnset = server.getAtlasPublic();
  const legacyUnset = server.getAtlas();
  const review = server.getAtlasReview();

  process.env.HANSA_ATLAS_REVIEW_PREVIEW = "1";
  try {
    const publicSet = server.getAtlasPublic();
    const legacySet = server.getAtlas();

    // Deliverable: the public projection must be identical under either flag.
    assert.deepEqual(publicSet, publicUnset);

    // The server projections are exactly the model projections of the same
    // dataset assembly (proves DATA and the fixed preview arguments).
    assert.deepEqual(publicUnset, projectAtlas(SERVER_DATA, false));
    assert.deepEqual(review, projectAtlas(SERVER_DATA, true));

    // Legacy env-driven behavior is preserved and only getAtlas() honors it.
    assert.equal(legacyUnset.preview, false);
    assert.equal(legacySet.preview, true);
    assert.notDeepEqual(legacySet, legacyUnset);
    assert.deepEqual(legacyUnset, publicUnset);
    assert.deepEqual(legacySet, review);

    // The real corpus has nothing published yet, so the public projection is
    // empty and carries only the fixed public notice.
    assert.equal(publicUnset.concepts.length, 0);
    assert.equal(publicUnset.semanticEdges.length, 0);
    assert.equal(publicUnset.sources.length, 0);
    assert.equal(publicUnset.catalog.length, 0);
    assert.equal(publicUnset.toc.length, 0);
    assert.equal(publicUnset.notice, PUBLIC_NOTICE);
    forbiddenIn(JSON.stringify(publicUnset), ["HANSA_ATLAS_REVIEW_PREVIEW", "technical_review"], "real public projection");
  } finally {
    delete process.env.HANSA_ATLAS_REVIEW_PREVIEW;
  }

  // The reading desk stays bibliographic and public-link only, whatever the flag.
  for (const source of server.getAtlasReadingSources()) {
    assert.equal(new URL(source.url).hostname, "learn.microsoft.com");
    assert.deepEqual(Object.keys(source).sort(), ["checkedAt", "id", "locator", "title", "url"]);
  }
});

test("server.ts source tripwire: getAtlasPublic() must not read the environment", () => {
  const source = readFileSync("lib/atlas/server.ts", "utf8");
  const publicFn = source.match(/export function getAtlasPublic\(\)[\s\S]*?\n\}/);
  assert.ok(publicFn, "getAtlasPublic() not found in lib/atlas/server.ts");
  assert.ok(!publicFn[0].includes("process.env"), "getAtlasPublic() must pin the public projection, not consult HANSA_ATLAS_REVIEW_PREVIEW");
  const reviewFn = source.match(/export function getAtlasReview\(\)[\s\S]*?\n\}/);
  assert.ok(reviewFn && !reviewFn[0].includes("process.env"), "getAtlasReview() must be explicit, not env-driven");
});

test("validResourceHref keeps the three legacy families closed; fabric article targets are rejected", () => {
  const valid = [
    "/learn/dp-600/ingestion/",
    "/learn/dp-600/ingestion/#understand",
    "/learn/dp-600/ingestion/#experiment",
    "/lab/dp-600/explore/?question=fb-v01",
    "/lab/dp-600/explore/?question=new-fabric-foundations-01",
    "/lab/dp-600/resources/?pack=delta#study-notes",
  ];
  for (const href of valid) assert.equal(validResourceHref(href), true, href);

  const invalid = [
    // The future Fabric article family must never be admitted by the legacy
    // validator: FC08 adds a separate typed mechanism instead.
    "/learn/fabric/docs/warehouse/get-started/",
    "/learn/fabric/docs/warehouse/get-started/#anchor",
    // Scheme, host and traversal escapes.
    "javascript:alert(1)",
    "//evil.example/learn/dp-600/ingestion/",
    "https://learn.microsoft.com/en-us/fabric/",
    "/learn/dp-600/ingestion/../ingestion/",
    // Family-external shapes.
    "/learn/dp-600/ingestion",
    "/learn/dp-600/INGESTION/",
    "/learn/dp-600/ingestion/?ref=newsletter",
    "/learn/dp-600/ingestion/#other",
    "/lab/dp-600/explore/",
    "/lab/dp-600/explore/?question=FB-v01",
    "/lab/dp-600/explore/?question=fb-",
    "/lab/dp-600/explore/?question=fb-v01#study-notes",
    // Unexpected query parameters, including a pre-attached atlasReturn.
    "/lab/dp-600/explore/?question=fb-v01&next=evil",
    "/lab/dp-600/explore/?question=fb-v01&atlasReturn=%2Flearn%2Fdp-600%2Fatlas%2F",
    // Param escapes and overflow.
    "/lab/dp-600/resources/?pack=../etc/passwd#study-notes",
    "/lab/dp-600/resources/?pack=" + "a".repeat(31) + "#study-notes",
    "",
  ];
  for (const href of invalid) assert.equal(validResourceHref(href), false, href);

  // Every shipped catalog row stays inside the closed families.
  for (const resource of SERVER_DATA.catalog) assert.equal(validResourceHref(resource.href), true, resource.href);
});

test("resourceReturnHref round-trips view state on every valid family and rejects everything else", () => {
  const roundTrip = (href) => {
    const returned = resourceReturnHref(href, VIEW);
    assert.notEqual(returned, "", href);
    const url = new URL(returned, "https://local.invalid");
    assert.ok(url.searchParams.has("atlasReturn"), href);
    assert.deepEqual(parseView(url.searchParams.get("atlasReturn"), ATLAS).view, VIEW, href);
    return url;
  };

  const lesson = roundTrip("/learn/dp-600/ingestion/");
  assert.equal(lesson.pathname, "/learn/dp-600/ingestion/");
  assert.equal(lesson.hash, "");

  const anchor = roundTrip("/learn/dp-600/ingestion/#experiment");
  assert.equal(anchor.pathname, "/learn/dp-600/ingestion/");
  assert.equal(anchor.hash, "#experiment");

  const question = roundTrip("/lab/dp-600/explore/?question=fb-v01");
  assert.equal(question.searchParams.get("question"), "fb-v01");

  const pack = roundTrip("/lab/dp-600/resources/?pack=delta#study-notes");
  assert.equal(pack.searchParams.get("pack"), "delta");
  assert.equal(pack.hash, "#study-notes");

  // Every shipped catalog row produces a usable return href.
  for (const resource of SERVER_DATA.catalog) assert.notEqual(resourceReturnHref(resource.href, VIEW), "", resource.href);

  for (const href of ["", "javascript:alert(1)", "//evil.example/", "/learn/fabric/docs/x/y/", "https://learn.microsoft.com/en-us/fabric/"]) {
    assert.equal(resourceReturnHref(href, VIEW), "", href);
  }
  assert.equal(resourceReturnHref("/learn/dp-600/ingestion/", VIEW).length, "/learn/dp-600/ingestion/".length + 1 + "atlasReturn=".length + encodeURIComponent(viewHref(VIEW)).length);
});

test("safeReturn enforces the documented atlasReturn host-safety rules (same-origin prefix, >=2048 rejected, no backslash)", () => {
  const returned = safeReturn(viewHref(VIEW), ATLAS);
  assert.notEqual(returned, "");
  assert.ok(returned.startsWith("/learn/dp-600/atlas/?"));
  assert.deepEqual(parseView(returned.split("?")[1], ATLAS).view, VIEW);

  const atlasPrefix = "/learn/dp-600/atlas/?"; // 21 chars
  const rejects = [
    null, "",
    "//evil.example/?v=1",
    "/contact/?next=evil",
    "https://learn.microsoft.com/learn/dp-600/atlas/?v=1",
    " javascript:/learn/dp-600/atlas/?v=1",
    "/learn/dp-600/atlas/?v=1\\evil",
    atlasPrefix + "v=1&pad=" + "a".repeat(3000),
    atlasPrefix + "a".repeat(2048 - atlasPrefix.length), // exactly 2048 chars: the documented rule rejects >= 2048
  ];
  for (const value of rejects) {
    assert.equal(safeReturn(value, ATLAS), "", JSON.stringify(String(value).slice(0, 60)));
  }
  // Fail-closed property: anything admitted is always a same-origin atlas href.
  for (const value of rejects) {
    const out = safeReturn(value, ATLAS);
    assert.ok(out === "" || out.startsWith(atlasPrefix));
  }
});

test("parseView/viewHref round-trip and the unrecognized-field warning behavior is unchanged", () => {
  assert.deepEqual(parseView(viewHref(VIEW).split("?")[1], ATLAS).view, VIEW);
  assert.deepEqual(parseView(viewHref({ ...VIEW, edge: "" }).split("?")[1], ATLAS).view, { ...VIEW, edge: "" });

  assert.equal(parseView("?foo=bar", ATLAS).warning, "Unrecognized view fields were ignored.");
  assert.deepEqual(parseView("?foo=bar", ATLAS).view, defaultView());
  const mixed = parseView("?concept=concept%3Atest%3Aalpha&foo=bar", ATLAS);
  assert.equal(mixed.view.concept, "concept:test:alpha");
  assert.equal(mixed.warning, "Unrecognized view fields were ignored.");

  assert.equal(parseView("?v=2", ATLAS).warning, "Unknown view version. Default view restored.");
  assert.equal(parseView("?v=2", ATLAS).view.concept, defaultView().concept);
  assert.equal(parseView("?concept=missing", ATLAS).warning, "Unknown concept. Default view restored.");
  assert.equal(parseView("x".repeat(2049), ATLAS).warning, "This Atlas link is too long. Default view restored.");

  // Unknown ids are dropped silently — unchanged behavior, deliberately not a warning.
  const silent = parseView("?edge=missing&source=missing", ATLAS);
  assert.equal(silent.warning, "");
  assert.deepEqual(silent.view, defaultView());

  const clamped = parseView("?zoom=9&x=99999&y=-99999&hops=2", ATLAS);
  assert.equal(clamped.view.zoom, 2.5);
  assert.equal(clamped.view.x, 400);
  assert.equal(clamped.view.y, -400);
  assert.equal(clamped.view.hops, 2);
  assert.equal(parseView("?", ATLAS).warning, "");
});
