// Check that every curriculum link lands on an exported page.
//
// The model test proves the graph is sound; this proves the graph points at
// pages the static export actually wrote. Run it after `npm run build`.
//
//   npm run verify:curriculum
import { existsSync, readFileSync } from "node:fs";
import { register } from "node:module";
import path from "node:path";
import process from "node:process";

register("./study-loader.mjs", import.meta.url);

const { curriculum } = await import("../lib/curriculum/model.ts");

const OUT = path.resolve("out");

/** Route → file the static export writes for it. */
function exportedFile(url) {
  const clean = url.split("#")[0].split("?")[0];
  const withoutSlash = clean.replace(/\/+$/, "");
  const decoded = decodeURIComponent(withoutSlash);
  return path.join(OUT, decoded, "index.html");
}

const targets = [];
for (const subject of curriculum().subjects) {
  targets.push({ owner: `subject:${subject.id}`, href: subject.href });
  for (const topic of subject.topics) {
    targets.push({ owner: `topic:${subject.id}/${topic.id}`, href: topic.href });
  }
}
for (const unit of curriculum().units) {
  if (unit.href.startsWith("/")) targets.push({ owner: `unit:${unit.id}`, href: unit.href });
}
for (const programme of curriculum().programmes) {
  targets.push({ owner: `programme:${programme.id}`, href: programme.href });
}

const missing = [];
for (const target of targets) {
  if (!existsSync(exportedFile(target.href))) missing.push(target);
}

if (missing.length > 0) {
  console.error(`Curriculum routes: ${missing.length} link(s) have no exported page.`);
  for (const target of missing.slice(0, 40)) {
    console.error(`  ${target.owner} -> ${target.href}`);
  }
  if (missing.length > 40) console.error(`  ... and ${missing.length - 40} more`);
  process.exit(1);
}

const internal = targets.length;
console.log(`Curriculum routes: ${internal} internal links resolve in out/.`);

// The alias routes must still render and must point at the canonical page.
const ALIASES = [
  { file: "study/index.html", canonical: "/learn/" },
  { file: "study/visualization/index.html", canonical: "/learn/visualization/" },
  { file: "study/sql/index.html", canonical: "/learn/sql/" },
  { file: "learn/catalogue/index.html", canonical: "/learn/" },
];

const badAliases = [];
for (const alias of ALIASES) {
  const file = path.join(OUT, alias.file);
  if (!existsSync(file)) {
    badAliases.push(`${alias.file} was not exported`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const match = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!match) {
    badAliases.push(`${alias.file} has no canonical link`);
    continue;
  }
  const canonical = new URL(match[1]).pathname;
  if (canonical !== alias.canonical) {
    badAliases.push(`${alias.file} canonicalises to ${canonical}, expected ${alias.canonical}`);
  }
}

if (badAliases.length > 0) {
  console.error(`Alias routes: ${badAliases.length} problem(s).`);
  for (const problem of badAliases) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`Alias routes: ${ALIASES.length} old addresses render and canonicalise to /learn.`);
