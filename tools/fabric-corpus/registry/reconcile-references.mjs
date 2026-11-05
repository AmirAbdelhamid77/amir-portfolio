#!/usr/bin/env node
// reconcile-references.mjs — FC02 references.json reconciliation (deterministic).
//
// Usage:
//   node reconcile-references.mjs <references.json> <coverage-manifest.json> [output.json]
//
// Reconciles content/study/references.json against the identity registry route
// plan, per docs/fabric-corpus/contracts/IDENTITY_REGISTRY.md §Reference
// reconciliation.
//
// DEFINITION D1 (Fabric Learn URL) — a record counts iff:
//   1. href is an absolute http(s) URL that parses,
//   2. hostname === 'learn.microsoft.com',
//   3. pathname begins with the Fabric product content root: '/fabric/' or
//      '/en-us/fabric/' (case-sensitive; optional locale prefix only).
// The broad definition D2 (Learn-host URL whose path merely CONTAINS a
// '/fabric/' segment, e.g. /en-us/rest/api/fabric/...) counts 1,037; the 118
// difference are Fabric REST API reference pages outside the fabric-docs
// corpus tree. The handover's "919 Fabric Learn URLs" figure matches D1
// exactly.
//
// Matching: strip locale + query/fragment from the URL path, map
// /en-us/fabric/<rest> -> logical route /learn/fabric/docs/<rest>/ and match
// against the identity registry's plannedDestination set (articles) and, as a
// fallback, the structured-doc source path docs/<rest>.yml. Records that hit
// neither are no-local-destination exceptions (family landing pages rendered
// from TOC data, not corpus files).

import fs from "node:fs";
import path from "node:path";

const PINNED_REVISION = "774592ea3f2d4558f763d6e5b74abf4785948fb5";
const [, , refsArg, manifestArg, outArg] = process.argv;
if (!refsArg || !manifestArg) {
  console.error("usage: node reconcile-references.mjs <references.json> <coverage-manifest.json> [output.json]");
  process.exit(2);
}
const refsPath = path.resolve(refsArg);
const manifestPath = path.resolve(manifestArg);
const output = path.resolve(
  outArg || path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "references-reconciliation.json")
);

const fail = (msg) => {
  console.error("BUILD FAIL: " + msg);
  process.exit(1);
};

const refs = JSON.parse(fs.readFileSync(refsPath, "utf8"));
if (!Array.isArray(refs.records)) fail("references.json has no records array");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.revision !== PINNED_REVISION) fail(`manifest revision ${manifest.revision} != pinned`);

const isFabricLearn = (href) => {
  if (typeof href !== "string") return false;
  let u;
  try { u = new URL(href); } catch { return false; }
  if (u.hostname !== "learn.microsoft.com") return false;
  return /^\/(?:en-us\/)?fabric(?:\/|$)/.test(u.pathname);
};
const mentionsFabricSegment = (href) => {
  if (typeof href !== "string") return false;
  let u;
  try { u = new URL(href); } catch { return false; }
  return u.hostname === "learn.microsoft.com" && u.pathname.includes("/fabric/");
};

const routeSet = new Set();             // plannedDestination values (articles)
const structuredByLogical = new Map();  // logical route -> structured-doc path
for (const r of manifest.rows) {
  if (r.plannedDestination) routeSet.add(r.plannedDestination);
  if (r.kind === "structured-doc" && r.path.startsWith("docs/") && r.path.endsWith(".yml")) {
    const logical = "/learn/fabric/docs/" + r.path.slice("docs/".length, -".yml".length) + "/";
    structuredByLogical.set(logical, r.path);
  }
}

const matched = [];
const noLocalDestination = [];
const d2Broad = [];

for (const rec of refs.records) {
  if (mentionsFabricSegment(rec.href)) d2Broad.push({ recordId: rec.id, href: rec.href });
  if (!isFabricLearn(rec.href)) continue;
  const u = new URL(rec.href);
  const rest = u.pathname.replace(/^\/(?:en-us\/)?fabric\//, "").replace(/\/$/, "");
  const logical = "/learn/fabric/docs/" + rest + "/";
  const entry = { recordId: rec.id, href: rec.href, logicalRoute: logical };
  if (routeSet.has(logical)) {
    entry.matchedTo = "art:" + rest;
    entry.matchedKind = "article-route";
    matched.push(entry);
  } else if (structuredByLogical.has(logical)) {
    entry.matchedTo = "sf:" + structuredByLogical.get(logical);
    entry.matchedKind = "structured-doc";
    matched.push(entry);
  } else {
    entry.disposition = "no-local-destination";
    entry.reason = "no corpus row renders this URL as an article or structured page (family landing page or non-document URL)";
    noLocalDestination.push(entry);
  }
}

const byMatchedKind = {};
for (const m of matched) byMatchedKind[m.matchedKind] = (byMatchedKind[m.matchedKind] || 0) + 1;

const doc = {
  generatedAt: new Date().toISOString(),
  revision: PINNED_REVISION,
  contract: "docs/fabric-corpus/contracts/IDENTITY_REGISTRY.md §Reference reconciliation",
  input: { references: path.basename(refsPath), records: refs.records.length },
  definition: {
    D1_fabricLearnUrl:
      "absolute http(s) URL, hostname learn.microsoft.com, pathname beginning with /fabric/ or /en-us/fabric/",
    D2_mentionsFabricSegment:
      "Learn-host URL whose pathname contains a /fabric/ segment anywhere (superset; includes /rest/api/fabric/... API reference pages)",
    handoverFigure: 919,
  },
  counts: {
    totalRecords: refs.records.length,
    d1FabricLearnUrls: matched.length + noLocalDestination.length,
    d2MentionsFabricSegment: d2Broad.length,
    d2MinusD1: d2Broad.length - (matched.length + noLocalDestination.length),
    matchedToRegistryRows: matched.length,
    matchedByKind: byMatchedKind,
    noLocalDestinationExceptions: noLocalDestination.length,
  },
  matched,
  noLocalDestinationExceptions: noLocalDestination,
  d2MinusD1Sample: d2Broad.slice(0, 20),
};

fs.writeFileSync(output, JSON.stringify(doc, null, 1) + "\n", "utf8");
console.log(`references reconciliation built: ${output}`);
console.log(`  records=${refs.records.length} D1=${matched.length + noLocalDestination.length} D2=${d2Broad.length} (D2-D1=${d2Broad.length - (matched.length + noLocalDestination.length)})`);
console.log(`  matchedToRegistryRows=${matched.length} (${JSON.stringify(byMatchedKind)}) noLocalDestination=${noLocalDestination.length}`);
