// R4: Academy figures must resolve.
//
// The courseware markdown stores `./Images/...` and `Linked_image_Files/...`
// beside its source file. Those files were never copied into this repository,
// so the previous renderer emitted local hrefs that 404. `lib/academy/corpus.ts`
// now resolves every figure at import time to the same file in the MIT-licensed
// GitHub repository; this test keeps relative paths from returning and checks
// the built Academy pages for absent local image files.
//
//   npm run test:content   (after `npm run build`)
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { register } from "node:module";
import { join, resolve } from "node:path";
import test from "node:test";

register("../../scripts/study-loader.mjs", import.meta.url);
const { ACADEMY_TRACKS, resolveAcademyHref } = await import(
  "../../lib/academy/corpus.ts"
);

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "out");

const refs = (text = "") => [...text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map(m => m[1]);
const absolute = href => /^(https?:|mailto:|#)/.test(href);

test("every courseware link resolves to its upstream file or a real host", () => {
  let imageRefs = 0;
  let linkRefs = 0;
  for (const track of ACADEMY_TRACKS) {
    for (const lesson of track.lessons) {
      const hrefs = [];
      for (const block of lesson.blocks) {
        if (block.type === "image") hrefs.push(block.href);
        if (typeof block.text === "string") hrefs.push(...refs(block.text));
        if (Array.isArray(block.items)) for (const item of block.items) hrefs.push(...refs(item));
        if (Array.isArray(block.rows)) {
          for (const row of block.rows) for (const cell of row) hrefs.push(...refs(cell));
        }
      }
      for (const href of hrefs) {
        assert.ok(absolute(href), `${lesson.sourcePath}: unresolved href ${href}`);
        if (/\/Images\/|\/Linked_image_Files\//.test(href)) {
          imageRefs += 1;
          assert.ok(
            href.startsWith(`${track.repoUrl}/blob/main/`),
            `${lesson.sourcePath}: figure leaves its repository: ${href}`,
          );
          assert.ok(!href.includes("/../"), `${lesson.sourcePath}: figure escapes the repo: ${href}`);
        } else {
          linkRefs += 1;
        }
      }
    }
  }
  assert.ok(imageRefs > 500, `expected the courseware figures, found ${imageRefs}`);
  assert.ok(linkRefs > 0, "expected at least the DAX documentation link");
});

test("the resolver keeps source-relative paths inside the lesson directory", () => {
  const repo = "https://github.com/MicrosoftLearning/mslearn-fabric";
  assert.equal(
    resolveAcademyHref("./Images/new-lakehouse.png", "Instructions/Labs/01-lakehouse.md", repo),
    `${repo}/blob/main/Instructions/Labs/Images/new-lakehouse.png`,
  );
  assert.equal(
    resolveAcademyHref(
      "Linked_image_Files/01-get-data-in-power-bi_image11.png",
      "Instructions/Labs/01-get-data-in-power-bi.md",
      repo,
    ),
    `${repo}/blob/main/Instructions/Labs/Linked_image_Files/01-get-data-in-power-bi_image11.png`,
  );
  assert.equal(
    resolveAcademyHref("/dax/time-intelligence-functions-dax/?azure-portal=true", "Instructions/Labs/06-use-dax-time-intelligence.md", repo),
    "https://learn.microsoft.com/en-us/dax/time-intelligence-functions-dax/?azure-portal=true",
  );
  assert.equal(resolveAcademyHref("https://example.com/x.png", "a.md", repo), "https://example.com/x.png");
  assert.equal(resolveAcademyHref("#section", "a.md", repo), "#section");
});

function htmlPages(dir, pages = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) htmlPages(path, pages);
    else if (name === "index.html") pages.push(path);
  }
  return pages;
}

test("the built Academy pages link figures upstream and never to absent local files", () => {
  const academy = join(out, "learn/academy");
  assert.ok(existsSync(academy), "missing the Academy export; run `npm run build`");
  const pages = htmlPages(academy);
  assert.ok(pages.length > 60, `expected the Academy lessons, found ${pages.length} pages`);

  let upstreamFigures = 0;
  const missing = [];
  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    const label = page.slice(out.length + 1).replaceAll("\\", "/");
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (/^https:\/\/github\.com\/[^"]+\/blob\/main\/[^"]*\/(?:Images|Linked_image_Files)\//.test(href)) {
        upstreamFigures += 1;
      }
      if (!href.startsWith("/")) continue;
      const target = href.split("#")[0].split("?")[0];
      const isImage = /\.(png|jpe?g|gif|svg|webp)$/i.test(target);
      const looksLikeCourseware = /\/(?:Images|Linked_image_Files)\//.test(target);
      if (!isImage && !looksLikeCourseware) continue;
      const file = join(out, ...decodeURIComponent(target).split("/"));
      if (!existsSync(file)) missing.push(`${label}: ${href}`);
    }
  }
  assert.equal(missing.length, 0, missing.slice(0, 10).join("\n"));
  assert.ok(upstreamFigures > 500, `expected the figures as upstream links, found ${upstreamFigures}`);
});
