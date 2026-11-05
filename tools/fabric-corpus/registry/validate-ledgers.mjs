#!/usr/bin/env node
// validate-ledgers.mjs — FC02 registry/ledger validation (deterministic).
//
// Usage:
//   node validate-ledgers.mjs [registry-dir] [coverage-manifest.json] [--expect-fabric-learn-urls N]
//
// Defaults: registry-dir = this script's directory; manifest = the handoff
// coverage manifest if present; the optional expectation arg lets the caller
// pin the Fabric Learn URL count for content/study/references.json.
//
// Checks (each reported PASS/FAIL/WARN/SKIP; exit 1 on any FAIL):
//  I1 identity.json parses with contract header fields
//  I2 row count == counts.in == counts.out == 15496 == manifest rows
//  I3 unique paths, unique ids
//  I4 path safety: forward slashes, no '..', not absolute, no drive letters
//  I5 id prefix matches kind (art:/sf:/fg:/as:); art ids are family/slug
//  I6 disposition vocabulary match (terminal outcomes only)
//  I7 rightsState vocabulary match
//  I8 every art: row carries a valid route target; non-article rows carry none
//  I9 sha256/bytes pairing and sha256 shape
//  I10 counts re-aggregate from rows and match the manifest
//  I11 1:1 reconciliation against the manifest by path (both directions)
//  I12 dep: rows unique, referencedBy non-empty, repo declared in publish config (WARN if not)
//  R1 rights.json parses; rules and exceptions present
//  R2 every exception: status=hold, classes valid, rationale/action/evidence non-empty
//  R3 exception paths all exist in identity.json; identityId mapping reported
//  R4 identity rows with gated rightsState/disposition have matching exception rows
//  R5 no exception is marked cleared (never clear rights-gated rows)
//  A1 aliases.json parses; summary/blockers/redirectionFiles/redirections present
//  A2 redirection rows: from/to strings, unique from across all files, posix shapes
//  A3 summary.rowsTotal == redirections.length == sum(per-file rows)
//  A4 the missing config-referenced redirection file is recorded as an open BLOCKER
//  A5 cycles array length matches summary.cycles (expected 0)
//  S1 FC03 identity/rights/aliases JSON schemas: validated if published, else SKIP
//  F1 references.json Fabric Learn URL subset recomputed (== expectation if given)

import fs from "node:fs";
import path from "node:path";

const PINNED_REVISION = "774592ea3f2d4558f763d6e5b74abf4785948fb5";
const EXPECTED_TOTAL = 15496;

const argv = process.argv.slice(2);
let registryDir = null, manifestPath = null, expectFabricLearn = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--expect-fabric-learn-urls") expectFabricLearn = Number(argv[++i]);
  else if (!registryDir) registryDir = argv[i];
  else if (!manifestPath) manifestPath = argv[i];
}
registryDir = path.resolve(registryDir || path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")));
if (!manifestPath) {
  const candidate = path.resolve(registryDir, "..", "..", "..", "fabric-integration-handoff", "FULL_CORPUS_COVERAGE.json");
  if (fs.existsSync(candidate)) manifestPath = candidate;
}

const results = [];
let failures = 0;
const check = (id, name, ok, detail = "") => {
  const status = ok ? "PASS" : "FAIL";
  if (!ok) failures += 1;
  results.push({ id, name, status, detail });
  console.log(`${status}  ${id}  ${name}${detail ? "  — " + detail : ""}`);
};
const warn = (id, name, detail) => {
  results.push({ id, name, status: "WARN", detail });
  console.log(`WARN  ${id}  ${name}${detail ? "  — " + detail : ""}`);
};
const skip = (id, name, detail) => {
  results.push({ id, name, status: "SKIP", detail });
  console.log(`SKIP  ${id}  ${name}${detail ? "  — " + detail : ""}`);
};

const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (err) {
    return { __error: err.message };
  }
};

// ---------------------------------------------------------------------------
// identity.json
// ---------------------------------------------------------------------------

const identityPath = path.join(registryDir, "identity.json");
const identity = readJson(identityPath);
if (identity.__error) {
  check("I1", "identity.json parses", false, identity.__error);
  console.error("identity.json unreadable; aborting identity checks.");
  process.exit(1);
}
check("I1", "identity.json parses with header", true,
  `revision=${identity.revision?.slice(0, 8)} generatedAt=${identity.generatedAt}`);
check("I1b", "identity.json pinned revision", identity.revision === PINNED_REVISION, identity.revision || "missing");
check("I1c", "identity.json vocabularies declared", Array.isArray(identity.vocabularies?.dispositions) && Array.isArray(identity.vocabularies?.rightsStates));

const rows = Array.isArray(identity.rows) ? identity.rows : [];
check("I2", "identity row count", rows.length === EXPECTED_TOTAL && identity.counts?.in === EXPECTED_TOTAL && identity.counts?.out === EXPECTED_TOTAL,
  `rows=${rows.length} counts.in=${identity.counts?.in} counts.out=${identity.counts?.out}`);

const pathSet = new Set();
const idSet = new Set();
let dupPath = 0, dupId = 0;
for (const r of rows) {
  if (pathSet.has(r.path)) dupPath++;
  pathSet.add(r.path);
  if (idSet.has(r.id)) dupId++;
  idSet.add(r.id);
}
check("I3", "unique paths", dupPath === 0, `duplicates=${dupPath}`);
check("I3b", "unique ids", dupId === 0, `duplicates=${dupId}`);

let unsafe = 0;
for (const r of rows) {
  if (r.path.includes("\\") || r.path.includes("..") || path.posix.isAbsolute(r.path) || /^[A-Za-z]:/.test(r.path)) unsafe++;
}
check("I4", "path safety (forward slashes, no .., relative)", unsafe === 0, `unsafe=${unsafe}`);

const kindPrefix = (kind) =>
  kind === "article-candidate" ? "art:" :
  kind === "asset" ? "as:" :
  kind === "fragment" || kind === "navigation" ? "fg:" : "sf:";
let badPrefix = 0, badArtId = 0;
for (const r of rows) {
  if (!r.id.startsWith(kindPrefix(r.kind))) badPrefix++;
  if (r.id.startsWith("art:") && !/^art:[a-z0-9][a-z0-9/-]*$/.test(r.id)) badArtId++;
}
check("I5", "id prefix per kind", badPrefix === 0, `bad=${badPrefix}`);
check("I5b", "art: id shape family/slug", badArtId === 0, `bad=${badArtId}`);

const dispositions = new Set(identity.vocabularies?.dispositions || []);
const rightsStates = new Set(identity.vocabularies?.rightsStates || []);
let badDisp = 0, badRights = 0;
for (const r of rows) {
  if (!dispositions.has(r.disposition)) badDisp++;
  if (!rightsStates.has(r.rightsState)) badRights++;
}
check("I6", "disposition vocabulary match", badDisp === 0, `bad=${badDisp} vocabSize=${dispositions.size}`);
check("I7", "rightsState vocabulary match", badRights === 0, `bad=${badRights} vocabSize=${rightsStates.size}`);

let badRoute = 0, routeOnNonArticle = 0;
const ROUTE_RE = /^\/learn\/fabric\/docs\/[a-z0-9][a-z0-9/-]*\/$/;
for (const r of rows) {
  if (r.id.startsWith("art:")) {
    if (!ROUTE_RE.test(r.plannedDestination || "")) badRoute++;
  } else if (r.plannedDestination && r.plannedDestination !== "") {
    routeOnNonArticle++;
  }
}
check("I8", "every art: row has a valid route target; non-article rows have none", badRoute === 0 && routeOnNonArticle === 0,
  `artMissingRoute=${badRoute} nonArticleWithRoute=${routeOnNonArticle}`);

let badSha = 0, badPairing = 0, badBytes = 0;
for (const r of rows) {
  if (r.sha256 !== null && !/^[0-9a-f]{64}$/.test(r.sha256)) badSha++;
  if (r.sha256 === null !== (r.bytes === null)) badPairing++;
  if (r.bytes !== null && !Number.isInteger(r.bytes)) badBytes++;
}
check("I9", "sha256 shape + sha256/bytes pairing", badSha === 0 && badPairing === 0 && badBytes === 0,
  `badSha=${badSha} badPairing=${badPairing} badBytes=${badBytes}`);

// re-aggregate counts from rows
const reKind = {}, reDisp = {}, reRights = {};
for (const r of rows) {
  reKind[r.kind] = (reKind[r.kind] || 0) + 1;
  reDisp[r.disposition] = (reDisp[r.disposition] || 0) + 1;
  reRights[r.rightsState] = (reRights[r.rightsState] || 0) + 1;
}
const sameCounts = (a, b) =>
  Object.keys(a).length === Object.keys(b || {}).length &&
  Object.keys(a).every((k) => a[k] === b[k]);
check("I10", "counts re-aggregate from rows", sameCounts(reKind, identity.counts?.byKind) && sameCounts(reDisp, identity.counts?.byDisposition) && sameCounts(reRights, identity.counts?.byRightsState));

// manifest reconciliation
if (manifestPath && fs.existsSync(manifestPath)) {
  const manifest = readJson(manifestPath);
  if (!manifest.__error && Array.isArray(manifest.rows)) {
    const mPaths = manifest.rows.map((r) => r.path);
    let missing = 0, extra = 0;
    for (const p of mPaths) if (!pathSet.has(p)) missing++;
    for (const p of pathSet) if (!mPaths.includes(p)) extra++;
    check("I11", "1:1 reconciliation vs manifest (both directions)", missing === 0 && extra === 0 && manifest.rows.length === rows.length,
      `manifestRows=${manifest.rows.length} missing=${missing} extra=${extra}`);
    const mCounts = manifest.counts || {};
    check("I10b", "kind counts match manifest", sameCounts(reKind, mCounts),
      `manifest=${JSON.stringify(mCounts)}`);
  } else {
    skip("I11", "manifest reconciliation", "manifest unreadable at " + manifestPath);
  }
} else {
  skip("I11", "manifest reconciliation", "coverage manifest not found; pass its path as argv[2]");
}

// dep: rows
const deps = Array.isArray(identity.externalDependencies) ? identity.externalDependencies : [];
const depIds = new Set();
let dupDep = 0, emptyRef = 0, unsafeDep = 0;
for (const d of deps) {
  if (depIds.has(d.id)) dupDep++;
  depIds.add(d.id);
  if (!Array.isArray(d.referencedBy) || d.referencedBy.length === 0) emptyRef++;
  if (d.id.includes("..") || d.id.includes("\\")) unsafeDep++;
}
check("I12", "dep: rows unique, referenced, safe", dupDep === 0 && emptyRef === 0 && unsafeDep === 0,
  `deps=${deps.length} dup=${dupDep} emptyRef=${emptyRef} unsafe=${unsafeDep}`);
{
  // repo declared in publish config? (WARN only: undeclared repos are escalations, not schema violations)
  let configRepos = null;
  const corpusRootForConfig = process.env.FABRIC_CORPUS_ROOT
    ? process.env.FABRIC_CORPUS_ROOT
    : manifestPath
      ? path.resolve(path.dirname(manifestPath), "..", "fabric-docs-light")
      : null;
  const cfgPath = corpusRootForConfig
    ? path.join(corpusRootForConfig, ".openpublishing.publish.config.json")
    : null;
  if (cfgPath && fs.existsSync(cfgPath)) {
    const cfg = readJson(cfgPath);
    // dependent_repositories lives at the config root (docset-level entry is a fallback)
    configRepos = new Set(
      ((cfg.dependent_repositories || []).concat(cfg.docsets_to_publish?.[0]?.dependent_repositories || []))
        .map((r) => r.path_to_root)
    );
  }
  if (configRepos) {
    const undeclared = [...new Set(deps.map((d) => d.repo))].filter((r) => !configRepos.has(r));
    if (undeclared.length) warn("I12b", "dep repos outside publish-config dependent_repositories", undeclared.join(","));
    else check("I12b", "dep repos all declared in publish config", true, `${configRepos.size} declared repos`);
  } else {
    skip("I12b", "dep repo declaration check", "publish config not found");
  }
}

// ---------------------------------------------------------------------------
// rights.json
// ---------------------------------------------------------------------------

const rightsPath = path.join(registryDir, "rights.json");
const rights = readJson(rightsPath);
if (rights.__error) {
  check("R1", "rights.json parses", false, rights.__error);
} else {
  check("R1", "rights.json parses; rules+exceptions present", Array.isArray(rights.rules) && rights.rules.length > 0 && Array.isArray(rights.exceptions),
    `rules=${rights.rules?.length} exceptions=${rights.exceptions?.length}`);

  const VALID_CLASSES = new Set(["explicit-rights-notice", "cross-repo-include", "cross-tree-reference", "unavailable-hold"]);
  let badExc = 0;
  for (const e of rights.exceptions || []) {
    if (e.status !== "hold") badExc++;
    if (!Array.isArray(e.classes) || e.classes.length === 0 || e.classes.some((c) => !VALID_CLASSES.has(c))) badExc++;
    if (!e.rationale || !e.requiredAction || !Array.isArray(e.evidence) || e.evidence.length === 0 || !e.owner) badExc++;
  }
  check("R2", "exception rows complete and held", badExc === 0, `bad=${badExc} of ${rights.exceptions?.length}`);

  let unmatched = 0;
  const classIndex = new Map();
  for (const e of rights.exceptions || []) {
    const row = rows.find((r) => r.path === e.path);
    if (!row) unmatched++;
    for (const c of e.classes) {
      if (!classIndex.has(c)) classIndex.set(c, 0);
      classIndex.set(c, classIndex.get(c) + 1);
    }
  }
  check("R3", "exception paths exist in identity.json", unmatched === 0, `unmatched=${unmatched}`);

  // R4: gated identity rows must carry exceptions
  const excPaths = new Set((rights.exceptions || []).map((e) => e.path));
  const excWithClass = (p, cls) => (rights.exceptions || []).some((e) => e.path === p && e.classes.includes(cls));
  let missingExc = 0;
  for (const r of rows) {
    if (r.rightsState === "rights-exception" && !(excWithClass(r.path, "cross-repo-include") || excWithClass(r.path, "cross-tree-reference"))) missingExc++;
    if (r.disposition === "article-hold-rights-notice" && !excWithClass(r.path, "explicit-rights-notice")) missingExc++;
    if (r.disposition === "article-hold-external-dependency" && !excWithClass(r.path, "cross-repo-include")) missingExc++;
    if (r.disposition === "unavailable-hold" && !excWithClass(r.path, "unavailable-hold")) missingExc++;
    if (r.rightsState === "review-required" && r.kind !== "asset" && !excWithClass(r.path, "explicit-rights-notice")) missingExc++;
  }
  check("R4", "gated identity rows carry matching exceptions", missingExc === 0, `missing=${missingExc}`);

  const cleared = (rights.exceptions || []).filter((e) => e.status !== "hold").length;
  check("R5", "no exception cleared (hold only)", cleared === 0, `cleared=${cleared}`);
  console.log(`INFO  R3b  exception classes: ${[...classIndex.entries()].map(([k, v]) => k + "=" + v).join(", ")}`);
}

// ---------------------------------------------------------------------------
// aliases.json
// ---------------------------------------------------------------------------

const aliasesPath = path.join(registryDir, "aliases.json");
const aliases = readJson(aliasesPath);
if (aliases.__error) {
  check("A1", "aliases.json parses", false, aliases.__error);
} else {
  check("A1", "aliases.json parses; sections present", Boolean(aliases.summary) && Array.isArray(aliases.redirections) && Array.isArray(aliases.redirectionFiles) && Array.isArray(aliases.blockers),
    `rows=${aliases.redirections?.length} files=${aliases.redirectionFiles?.length} blockers=${aliases.blockers?.length}`);

  let badShape = 0;
  const fromSet = new Map();
  let dupFrom = 0;
  for (const r of aliases.redirections || []) {
    if (typeof r.from !== "string" || typeof r.to !== "string" || !r.from.startsWith("/") || r.to === "") badShape++;
    if (!/^[a-z0-9/._-]+$/i.test(r.from)) badShape++;
    if (fromSet.has(r.from)) {
      dupFrom += fromSet.get(r.from) === r.to ? 0 : 1;
    }
    fromSet.set(r.from, r.to);
  }
  check("A2", "redirection rows well-formed, unique from", badShape === 0 && dupFrom === 0, `badShape=${badShape} dupFrom=${dupFrom}`);

  const perFileSum = (aliases.redirectionFiles || []).reduce((a, f) => a + f.redirections, 0);
  check("A3", "row totals reconcile (summary == rows == per-file)", aliases.summary?.rowsTotal === aliases.redirections?.length && perFileSum === aliases.redirections?.length,
    `summary=${aliases.summary?.rowsTotal} rows=${aliases.redirections?.length} perFile=${perFileSum}`);

  const MISSING_BLOCKER_PATH = "docs/database/mirrored-database/.openpublishing.redirection.database.json";
  const blk = (aliases.blockers || []).find((b) => b.path === MISSING_BLOCKER_PATH);
  check("A4", "missing redirection file recorded as open BLOCKER",
    Boolean(blk) && blk.status === "open" && Boolean(blk.owner) && Boolean(blk.evidence) && Boolean(blk.requiredAction),
    blk ? blk.id : "not recorded");

  check("A5", "cycle count consistent (array vs summary)", (aliases.cycles?.length || 0) === (aliases.summary?.cycles || 0),
    `cycles=${aliases.cycles?.length} summary=${aliases.summary?.cycles}`);
}

// ---------------------------------------------------------------------------
// S1: FC03 schemas (consumed when published)
// ---------------------------------------------------------------------------

const schemasDir = path.resolve(registryDir, "..", "schemas");
const schemaNames = ["identity.schema.json", "rights.schema.json", "aliases.schema.json"];
const presentSchemas = schemaNames.filter((s) => fs.existsSync(path.join(schemasDir, s)));
if (presentSchemas.length === 0) {
  skip("S1", "FC03 field schemas for identity/rights/aliases", "not published in tools/fabric-corpus/schemas/ (FC03-owned); contract-level checks I1–A5 apply");
} else {
  // shallow structural validation: required top-level fields from the schema
  let schemaFail = 0;
  for (const s of presentSchemas) {
    const sch = readJson(path.join(schemasDir, s));
    if (sch.__error) { schemaFail++; continue; }
    const target = s.startsWith("identity") ? identity : s.startsWith("rights") ? rights : aliases;
    for (const req of sch.required || []) if (!(req in target)) schemaFail++;
  }
  check("S1", "FC03 schema shallow validation", schemaFail === 0, `schemas=${presentSchemas.join(",")}`);
}

// ---------------------------------------------------------------------------
// F1: references.json Fabric Learn URL subset
// ---------------------------------------------------------------------------

const repoRoot = path.resolve(registryDir, "..", "..", "..");
const referencesPath = path.join(repoRoot, "content", "study", "references.json");
if (fs.existsSync(referencesPath)) {
  const refs = readJson(referencesPath);
  if (!refs.__error && Array.isArray(refs.records)) {
    const isFabricLearn = (href) => {
      if (typeof href !== "string") return false;
      let u;
      try { u = new URL(href); } catch { return false; }
      if (u.hostname !== "learn.microsoft.com") return false;
      return /^\/(?:en-us\/)?fabric(?:\/|$)/.test(u.pathname);
    };
    const count = refs.records.filter((r) => isFabricLearn(r.href)).length;
    if (expectFabricLearn !== null && !Number.isNaN(expectFabricLearn)) {
      check("F1", "references.json Fabric Learn URL count (definition D1)", count === expectFabricLearn, `computed=${count} expected=${expectFabricLearn} totalRecords=${refs.records.length}`);
    } else {
      check("F1", "references.json Fabric Learn URL count computed", true, `computed=${count} totalRecords=${refs.records.length} (no expectation provided)`);
    }
  } else {
    skip("F1", "references.json Fabric Learn URL count", "references.json unreadable");
  }
} else {
  skip("F1", "references.json Fabric Learn URL count", "content/study/references.json not found at repo root");
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;
const warns = results.filter((r) => r.status === "WARN").length;
const skips = results.filter((r) => r.status === "SKIP").length;
console.log(`\nVALIDATION ${failures === 0 ? "PASS" : "FAIL"}: ${pass} pass, ${fail} fail, ${warns} warn, ${skips} skip`);
process.exit(failures === 0 ? 0 : 1);
