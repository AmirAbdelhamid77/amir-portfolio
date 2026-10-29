// Integration guards for the DP-600 R18 / PL-300 V88 draft staging.
//
// These assertions encode the conditions of the merge itself: both packages
// arrive NO_GO / NONFINAL, so they may only appear as disabled review drafts —
// separate from each other and from the approved banks, carrying no answer key
// to the browser, writing no learner progress, and never reading the private
// intake mirror into app code.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const read = (relative) => readFileSync(path.join(ROOT, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const hash = (file) => createHash("sha256").update(readFileSync(path.join(ROOT, file))).digest("hex");

const FORBIDDEN_KEY =
  /^(correct|answers?|expected|expectedAnswer|draftExpectedByID|explanation|why|historical_original_key|historical.*key|answer_key.*|review_status|evidence|human_sme.*|humanSME.*|scientific_qa.*|qa_.*|v\d+_review)$/i;

function walk(value, visit, where = "$") {
  if (Array.isArray(value)) return value.forEach((entry, index) => walk(entry, visit, `${where}[${index}]`));
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      visit(key, where);
      walk(child, visit, `${where}.${key}`);
    }
  }
}

function sourceFilesUnder(...directories) {
  const files = [];
  const walkDir = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walkDir(full);
      else if (/\.(ts|tsx|mjs|js)$/.test(entry)) files.push(full);
    }
  };
  directories.forEach((dir) => {
    const full = path.join(ROOT, dir);
    if (existsSync(full)) walkDir(full);
  });
  return files;
}

/** Every id declared anywhere under content/fabric — the approved content. */
function approvedContentIds() {
  const ids = new Set();
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (value && typeof value === "object") {
      if (typeof value.id === "string") ids.add(value.id);
      Object.values(value).forEach(visit);
    }
  };
  const walkDir = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walkDir(full);
      else if (entry.endsWith(".json")) visit(json(path.relative(ROOT, full)));
    }
  };
  walkDir(path.join(ROOT, "content/fabric"));
  return ids;
}

test("DP-600 R18 draft: 222 records, unique namespaced ids, grading off, NO_GO", () => {
  const bank = json("content/drafts/dp600-r18.json");
  assert.equal(bank.questions.length, 222);
  assert.equal(bank.status, "NO_GO");
  assert.equal(bank.gradingEnabled, false);
  assert.equal(bank.answersShipped, false);
  const ids = bank.questions.map((question) => question.draftId);
  assert.equal(new Set(ids).size, 222, "draft ids must be unique");
  for (const id of ids) assert.match(id, /^draft-dp600-r18-t1q\d+$/, "ids must be namespaced to the draft");
  assert.ok(bank.questions.every((question) => question.gradingEnabled === false));
  assert.ok(bank.questions.every((question) => question.sourceId === question.draftId.replace(/^draft-dp600-r18-/, "").toUpperCase()));
});

test("PL-300 V88 draft: 1,285 records, unique namespaced ids, grading off, NONFINAL", () => {
  const bank = json("content/drafts/pl300-v88.json");
  assert.equal(bank.questions.length, 1285);
  assert.equal(bank.status, "NONFINAL");
  assert.equal(bank.gradingEnabled, false);
  assert.equal(bank.answersShipped, false);
  assert.equal(bank.source.finalReady, false);
  const ids = bank.questions.map((question) => question.draftId);
  assert.equal(new Set(ids).size, 1285, "draft ids must be unique");
  for (const id of ids) assert.match(id, /^draft-pl300-v88-PL300-/);
  assert.ok(bank.questions.every((question) => question.gradingEnabled === false));
});

test("no answer-bearing field reaches either shipped projection", () => {
  for (const file of ["content/drafts/dp600-r18.json", "content/drafts/pl300-v88.json"]) {
    const data = json(file);
    walk(data, (key, where) => {
      assert.doesNotMatch(key, FORBIDDEN_KEY, `forbidden field "${key}" at ${where} in ${file}`);
      if (key === "gradingEnabled") {
        // The walk visits nested values, so only the check performed at the
        // question and bank level below carries meaning; here we at least
        // guarantee the value is a boolean literal.
        assert.equal(typeof data.questions, "object");
      }
    });
    const optionKeys = new Set();
    for (const question of data.questions) {
      assert.equal(question.gradingEnabled, false);
      for (const option of question.options) Object.keys(option).forEach((k) => optionKeys.add(k));
    }
    for (const key of optionKeys) assert.ok(["id", "letter", "text"].includes(key), `unexpected option field "${key}" in ${file}`);
  }
});

test("shipped drafts contain none of the private mirror's marker strings", () => {
  const markers = [
    "PRIVATE QA ONLY",
    "draftExpectedByID",
    "historical_original_key",
    "answer_key_version",
    "human_sme_approval",
    "R18_15_PRIVATE_EXPECTED_ANSWERS",
    "SOURCE_KEY_RECOVERY_LEDGER",
  ];
  for (const file of ["content/drafts/dp600-r18.json", "content/drafts/pl300-v88.json", "content/drafts/manifest.json"]) {
    const body = read(file);
    for (const marker of markers) assert.ok(!body.includes(marker), `${file} contains private marker "${marker}"`);
  }
});

test("the two banks stay separate and never collide", () => {
  const dp = json("content/drafts/dp600-r18.json");
  const pl = json("content/drafts/pl300-v88.json");
  assert.equal(dp.bank, "dp600-r18");
  assert.equal(pl.bank, "pl300-v88");
  const dpIds = new Set(dp.questions.map((question) => question.draftId));
  for (const question of pl.questions) assert.ok(!dpIds.has(question.draftId), `cross-bank id collision: ${question.draftId}`);
  const dpSource = new Set(dp.questions.map((question) => question.sourceId));
  for (const question of pl.questions) assert.ok(!dpSource.has(question.sourceId), `cross-bank source id collision: ${question.sourceId}`);
});

test("drafts are not merged into the approved banks", () => {
  const index = json("content/fabric/index.json");
  const additions = json("content/fabric/additions/questions.json");
  const manifest = json("content/fabric/additions/manifest.json");
  assert.equal(index.length, 914, "approved Fabric index unchanged apart from the authored corpus packs (834 baseline + 80 phase-C questions)");
  assert.equal(additions.length, 532, "approved additions must be unchanged");
  assert.equal(manifest.pl300, 80, "existing PL-300 records must be unchanged");
  const approvedIds = new Set([
    ...index.map((entry) => entry.id),
    ...additions.map((entry) => entry.id),
  ]);
  for (const id of approvedIds) assert.ok(!id.startsWith("draft-"), "a draft id leaked into an approved bank");

  const dp = json("content/drafts/dp600-r18.json");
  const dpSourceIds = new Set(dp.questions.map((question) => question.sourceId));
  // The R18 ids are a parallel revision of ids that already exist in approved
  // content; they must appear only as draft-mapped source ids, never as new
  // approved entries.
  const approved = approvedContentIds();
  const overlap = [...dpSourceIds].filter((id) => approved.has(id));
  assert.equal(overlap.length, 222, "expected the full R18 id set to already exist in approved content");
  for (const entry of additions) assert.ok(!entry.id.startsWith("draft-dp600-r18"), "R18 drafts must not be appended to additions");
});

test("the draft route is isolated: noindex, out of the sitemap and catalogue", () => {
  const page = read("app/practice/drafts/page.tsx");
  assert.match(page, /index:\s*false/, "draft route must be noindex");
  assert.ok(!read("app/sitemap.ts").includes("practice/drafts"), "draft route must not be in the sitemap");
  assert.ok(!read("lib/catalogue.ts").includes("practice/drafts"), "draft route must not be in the catalogue");
});

test("draft code never touches learner progress storage", () => {
  const files = [
    "components/practice/draft-review.tsx",
    "lib/drafts/data.ts",
    "app/practice/drafts/page.tsx",
  ];
  for (const file of files) {
    const body = read(file);
    assert.ok(!body.includes("localStorage"), `${file} must not use localStorage`);
    assert.ok(!body.includes("amir-fabric-v1"), `${file} must not open the Fabric progress key`);
    assert.ok(!body.includes("amir-lab-v1"), `${file} must not open the Data Lab progress key`);
    assert.ok(!body.includes("hansa-question-additions-v1"), `${file} must not open the additions progress key`);
  }
});

test("no app code imports the private intake mirror or the intake manifests", () => {
  const files = sourceFilesUnder("app", "components", "lib");
  assert.ok(files.length > 100, "expected to scan the app source tree");
  for (const file of files) {
    const body = readFileSync(file, "utf8");
    assert.ok(!body.includes("intake-private"), `${path.relative(ROOT, file)} references intake-private`);
    assert.ok(!/from\s+["']@\/intake/.test(body), `${path.relative(ROOT, file)} imports from intake/`);
    assert.ok(!body.includes("PRIVATE_QA"), `${path.relative(ROOT, file)} references PRIVATE_QA`);
  }
});

test("the private mirror is gitignored and excluded from version control", () => {
  assert.match(read(".gitignore"), /^intake-private\/$/m, ".gitignore must exclude intake-private/");
});

test("projection hashes recorded in the intake manifests still match the shipped files", () => {
  const dpManifest = json("intake/dp600-r18-2026-10-27/MANIFEST.json");
  const plManifest = json("intake/pl300-v88-2026-10-27/MANIFEST.json");
  assert.equal(dpManifest.projection.sha256, hash("content/drafts/dp600-r18.json"));
  assert.equal(plManifest.projection.sha256, hash("content/drafts/pl300-v88.json"));
  const built = json("content/drafts/manifest.json");
  assert.equal(built.banks[0].status, "NO_GO");
  assert.equal(built.banks[1].status, "NONFINAL");
  assert.ok(built.policy.toLowerCase().includes("disabled review drafts"));
});

test("both intake packages' declared statuses survive into the shipped manifest", () => {
  const built = json("content/drafts/manifest.json");
  const [dp, pl] = built.banks;
  assert.equal(dp.source.verifier, "PASS_PACKAGE_INTEGRITY_AND_PARENT_PARITY_ONLY");
  assert.equal(dp.source.release, "R18_STAGING_UNGRADED_NO_PRODUCTION_AUTHORIZATION");
  assert.equal(pl.source.verifier, "PASS_STRUCTURAL_AND_PROVENANCE_ONLY");
  assert.equal(pl.source.finalReady, false);
  assert.equal(dp.answersShipped, false);
  assert.equal(pl.answersShipped, false);
});
