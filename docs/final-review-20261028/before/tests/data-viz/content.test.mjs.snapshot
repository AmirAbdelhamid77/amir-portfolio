import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relative) => JSON.parse(readFileSync(path.join(ROOT, relative), "utf8"));

const pages = readJson("content/data-viz/pages.json");
const curriculum = readJson("content/data-viz/curriculum.json");
const editorial = readJson("content/data-viz/editorial.json");
const datasets = readJson("content/data-viz/datasets.json");

const blocksOf = (page) => {
  const out = [];
  const visit = (blocks) => {
    for (const block of blocks) {
      out.push(block);
      if (block.type === "callout" || block.type === "toggle") visit(block.blocks);
    }
  };
  visit(page.blocks);
  return out;
};

test("the export is accounted for exactly once", () => {
  assert.equal(pages.length, 25);
  const sourcesUsed = curriculum.lessons.filter((lesson) => lesson.kind === "source").map((lesson) => lesson.source);
  assert.equal(sourcesUsed.length, 25);
  assert.equal(new Set(sourcesUsed).size, 25);
  assert.deepEqual(
    [...sourcesUsed].sort(),
    pages.map((page) => page.slug).sort(),
  );
});

test("every chapter lists lessons that exist, and every lesson sits in a chapter", () => {
  const slugs = new Set(curriculum.lessons.map((lesson) => lesson.slug));
  const listed = new Set();
  for (const chapter of curriculum.chapters) {
    assert.ok(chapter.lessons.length > 0, `chapter ${chapter.number} has no lessons`);
    for (const slug of chapter.lessons) {
      assert.ok(slugs.has(slug), `chapter ${chapter.number} lists unknown lesson ${slug}`);
      assert.ok(!listed.has(slug), `${slug} appears in more than one chapter`);
      listed.add(slug);
    }
  }
  for (const lesson of curriculum.lessons) {
    if (lesson.chapter === null) continue;
    assert.ok(listed.has(lesson.slug), `${lesson.slug} is not listed by its chapter`);
  }
});

test("English and Arabic paths are both complete", () => {
  const en = curriculum.lessons.filter((lesson) => lesson.section === "en");
  const ar = curriculum.lessons.filter((lesson) => lesson.section === "ar");
  assert.equal(en.length, 16);
  assert.equal(ar.length, 11);

  for (const lesson of ar) {
    assert.ok(/[\u0600-\u06FF]/.test(lesson.title), `${lesson.slug}: Arabic lesson has no Arabic title`);
    assert.ok(lesson.slug.startsWith("ar-") === false, `${lesson.slug}: route slug should not keep the ar- prefix`);
  }

  const arSlugs = new Set(ar.map((lesson) => lesson.slug));
  for (const lesson of curriculum.lessons) {
    assert.ok(!arSlugs.has(lesson.slug) || lesson.section === "ar", `${lesson.slug}: duplicate route slug across sections`);
  }
});

test("editorial lessons never claim a source page", () => {
  const editorialLessons = curriculum.lessons.filter((lesson) => lesson.kind === "editorial");
  assert.deepEqual(editorialLessons.map((lesson) => lesson.slug).sort(), ["applied-cases", "audience-story"]);
  for (const lesson of editorialLessons) {
    assert.equal(lesson.source, null);
    assert.equal(lesson.coverage, "MISSING");
    assert.ok(Array.isArray(editorial[lesson.slug]) && editorial[lesson.slug].length >= 5);
  }
});

test("no authored text carries executable markup", () => {
  const forbidden = /<script|onerror\s*=|javascript:/i;
  for (const page of pages) {
    for (const block of blocksOf(page)) {
      const strings = [];
      if (block.type === "heading") strings.push(block.text);
      if (block.type === "paragraph" || block.type === "quote") strings.push(...block.inline.map((node) => node.text));
      if (block.type === "list") strings.push(...block.items.flat().map((node) => node.text));
      if (block.type === "code") strings.push(block.text);
      if (block.type === "table") {
        strings.push(...block.headers.flat().map((node) => node.text));
        strings.push(...block.rows.flat(2).map((node) => node.text));
      }
      for (const text of strings) {
        assert.ok(!forbidden.test(text), `${page.slug}: unsafe markup in "${text.slice(0, 60)}"`);
      }
    }
  }
});

test("every figure is local, hashed, sized, and has an accessible name", () => {
  const figures = pages.flatMap((page) => blocksOf(page).filter((block) => block.type === "figure"));
  assert.equal(figures.length, 29);
  assert.equal(new Set(figures.map((figure) => figure.src)).size, 12);

  for (const figure of figures) {
    assert.match(figure.src, /^\/data-viz\/figures\/[a-z0-9_]+\.svg$/);
    assert.match(figure.asset.sha256, /^[a-f0-9]{64}$/);
    assert.ok(figure.width > 0 && figure.height > 0, `${figure.src}: no intrinsic size`);
    assert.ok(figure.alt.trim().length >= 12, `${figure.src}: alt text is missing or too thin`);
    assert.ok(!/^https?:/.test(figure.src), `${figure.src}: remote asset`);
  }
});

test("source-level links never point at a missing page or an executable URL", () => {
  const sourceSlugs = new Set(pages.map((page) => page.slug));
  const visit = (blocks) => {
    for (const block of blocks) {
      const inlines = [
        ...(block.inline ?? []),
        ...(block.items?.flat() ?? []),
        ...(block.headers?.flat() ?? []),
        ...(block.rows?.flat(2) ?? []),
      ];
      for (const node of inlines) {
        const link = node.link;
        if (!link) continue;
        assert.ok(!/^javascript:/i.test(link.href), `javascript: link found: ${link.href}`);
        if (link.kind === "page") {
          assert.ok(sourceSlugs.has(link.targetSlug), `page link to unknown source ${link.targetSlug}`);
        }
        if (link.kind === "external" || link.kind === "notion") {
          assert.match(link.href, /^(https?:\/\/|mailto:)/);
        }
      }
      if (block.blocks) visit(block.blocks);
    }
  };
  for (const page of pages) visit(page.blocks);
});

test("the dataset file is byte-identical to a fresh build", () => {
  assert.doesNotThrow(() => {
    execFileSync(process.execPath, ["scripts/build-datasets.mjs", "--check"], { cwd: ROOT, stdio: "pipe" });
  }, "content/data-viz/datasets.json is stale — run: node scripts/build-datasets.mjs");
});

test("datasets are synthetic, seeded, and internally consistent", () => {
  assert.equal(datasets.meta.synthetic, true);
  assert.equal(datasets.meta.seed, 20261023);
  assert.equal(Object.keys(datasets.datasets).length, 14);

  const funnel = datasets.datasets["hiring-funnel"].stages;
  assert.equal(funnel[0].value, 12400);
  assert.equal(funnel.at(-1).value, 512);
  for (let index = 1; index < funnel.length; index += 1) {
    assert.ok(funnel[index].value < funnel[index - 1].value, `funnel stage ${funnel[index].id} is not a subset`);
  }

  const mix = datasets.datasets["channel-mix"].rows;
  assert.equal(mix.reduce((total, row) => total + row.value, 0), 100);

  const treemapTotal = datasets.datasets["revenue-mix"].nodes.reduce(
    (total, group) => total + group.children.reduce((inner, child) => inner + child.value, 0),
    0,
  );
  assert.equal(treemapTotal, 1960);

  const groups = datasets.datasets["same-mean"].groups;
  for (const group of groups) {
    const average = group.values.reduce((total, value) => total + value, 0) / group.values.length;
    assert.ok(Math.abs(average - 50) < 0.05, `${group.id}: mean ${average} is not 50`);
  }

  const simpson = datasets.datasets.simpson.segments;
  for (const segment of simpson) {
    assert.ok(
      segment.treatment.converted / segment.treatment.total >
        segment.control.converted / segment.control.total,
      `${segment.id}: treatment must win inside the segment`,
    );
  }
  const pooled = (arm) =>
    simpson.reduce((sum, segment) => sum + segment[arm].converted, 0) /
    simpson.reduce((sum, segment) => sum + segment[arm].total, 0);
  assert.ok(pooled("treatment") < pooled("control"), "the pooled comparison must reverse");
});
