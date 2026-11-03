// Contracts for the one curriculum model that the learning home and every
// subject page share. These are graph checks, not rendering checks: a broken
// prerequisite or a duplicate id should fail the build here, not surface as a
// dead link on a page.
//
//   npm run test:content
import assert from "node:assert/strict";
import { register } from "node:module";
import { test } from "node:test";

// Resolves `@/` aliases, `.ts` modules and JSON imports the same way the study
// catalogue test does.
register("../../scripts/study-loader.mjs", import.meta.url);

const { curriculum, STAGE_ORDER, SUBJECT_HOME, unitsByStage } = await import(
  "../../lib/curriculum/model.ts"
);
const { SUBJECTS } = await import("../../lib/study/taxonomy.ts");

const model = curriculum();

test("the curriculum builds and holds units", () => {
  assert.ok(model.units.length > 0, "at least one teaching unit");
  assert.ok(model.subjects.length === SUBJECTS.length, "every taxonomy subject is represented");
});

test("unit ids are unique", () => {
  const ids = model.units.map((unit) => unit.id);
  assert.equal(new Set(ids).size, ids.length, "no duplicate unit id");
  assert.equal(model.byId.size, ids.length, "the id index covers every unit");
});

test("every prerequisite resolves and is taught earlier", () => {
  const seen = new Set();
  for (const unit of model.units) {
    for (const prerequisite of unit.prerequisites) {
      assert.ok(model.byId.has(prerequisite), `${unit.id} requires a real unit (${prerequisite})`);
      assert.ok(seen.has(prerequisite), `${unit.id} comes after its prerequisite ${prerequisite}`);
    }
    seen.add(unit.id);
  }
});

test("unit ids, titles, objectives and hrefs are filled in", () => {
  for (const unit of model.units) {
    assert.ok(unit.id.length > 0);
    assert.ok(unit.title.trim().length > 0, `${unit.id} has a title`);
    assert.ok(unit.objective.trim().length > 0, `${unit.id} has an objective`);
    assert.ok(STAGE_ORDER.includes(unit.stage), `${unit.id} has a known stage`);
    assert.ok(unit.position >= 1, `${unit.id} has a position`);
  }
});

test("every unit href is an internal route or an https reading", () => {
  for (const unit of model.units) {
    if (unit.kind === "external-foundation") {
      assert.ok(
        unit.href.startsWith("https://"),
        `${unit.id} is external and secure: ${unit.href}`,
      );
      continue;
    }
    assert.ok(unit.href.startsWith("/"), `${unit.id} is internal: ${unit.href}`);
    assert.ok(!unit.href.startsWith("//"), `${unit.id} is not protocol-relative: ${unit.href}`);
    assert.ok(!unit.href.endsWith("//"), `${unit.id} has no doubled slash: ${unit.href}`);
  }
});

test("every subject declares a home and positions run 1..n", () => {
  for (const subject of model.subjects) {
    assert.equal(subject.href, SUBJECT_HOME[subject.id], `${subject.id} has its canonical home`);
    assert.ok(subject.href.startsWith("/learn/"), `${subject.id} lives under /learn`);
    const positions = subject.units.map((unit) => unit.position);
    assert.deepEqual(
      positions,
      positions.map((_, index) => index + 1),
      `${subject.id} positions are contiguous`,
    );
    const total = Object.values(subject.stageCounts).reduce((sum, count) => sum + count, 0);
    assert.equal(total, subject.units.length, `${subject.id} stage counts add up`);
    const entry =
      subject.units.find((unit) => unit.kind !== "study-note") ?? subject.units[0] ?? null;
    assert.equal(subject.entry, entry, `${subject.id} entry is its first taught unit`);
    for (const unit of subject.units) {
      assert.equal(unit.subject, subject.id, `${unit.id} is filed under ${subject.id}`);
    }
  }
});

test("unitsByStage returns only the stages the subject uses, in order", () => {
  for (const subject of model.subjects) {
    const groups = unitsByStage(subject);
    const stages = groups.map((group) => group.stage);
    assert.deepEqual(
      stages,
      STAGE_ORDER.filter((stage) => stages.includes(stage)),
      `${subject.id} stages follow the declared order`,
    );
    assert.equal(
      groups.reduce((sum, group) => sum + group.units.length, 0),
      subject.units.length,
      `${subject.id} grouping keeps every unit`,
    );
    for (const group of groups) {
      for (const unit of group.units) assert.equal(unit.stage, group.stage);
    }
  }
});

test("every subject with units has a teaching entry point", () => {
  for (const subject of model.subjects) {
    if (subject.units.length === 0) {
      assert.equal(subject.entry, null, `${subject.id} declares an empty entry`);
      continue;
    }
    assert.ok(subject.entry, `${subject.id} has an entry unit`);
    assert.equal(subject.entry.subject, subject.id);
  }
});

test("subject homes are unique and every programme points inside /learn", () => {
  const homes = model.subjects.map((subject) => subject.href);
  assert.equal(new Set(homes).size, homes.length, "no two subjects share a home");
  const subjectIds = new Set(model.subjects.map((subject) => subject.id));
  for (const programme of model.programmes) {
    assert.ok(programme.href.startsWith("/learn/"), `${programme.id} lives under /learn`);
    assert.ok(programme.title.trim().length > 0);
    assert.ok(programme.summary.trim().length > 0);
    assert.ok(programme.subjects.length > 0, `${programme.id} names a subject`);
    for (const subject of programme.subjects) {
      assert.ok(subjectIds.has(subject), `${programme.id} names a real subject (${subject})`);
    }
  }
});

test("requireSubject returns a home for every subject and refuses an unknown one", async () => {
  const { requireSubject, subjectHome } = await import("../../lib/curriculum/model.ts");
  for (const subject of model.subjects) {
    assert.equal(requireSubject(subject.id), subject);
    assert.equal(subjectHome(subject.id), subject);
  }
  assert.throws(() => requireSubject("no-such-subject"), /Unknown subject/);
});

test("topic links name a real taxonomy topic", () => {
  for (const subject of model.subjects) {
    const taxonomy = new Map(SUBJECTS.find((entry) => entry.id === subject.id).topics);
    const ids = subject.topics.map((topic) => topic.id);
    assert.equal(new Set(ids).size, ids.length, `${subject.id} topic ids are unique`);
    for (const topic of subject.topics) {
      assert.ok(taxonomy.has(topic.id), `${subject.id}/${topic.id} exists in the taxonomy`);
      assert.equal(topic.href, `/learn/${subject.id}/${topic.id}/`);
    }
  }
});
