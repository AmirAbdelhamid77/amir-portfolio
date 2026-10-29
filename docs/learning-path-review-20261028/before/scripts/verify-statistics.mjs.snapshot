// Verification gate for the Comprehensive Statistics Reference.
//
//   npm run verify:statistics
//
// It checks the imported source, the coverage mapping, the formula ledger, the
// numerical core and the actual static export. It does not claim a browser
// passed; that is the separate Playwright check.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import katex from "katex";
import {
  JOURNEYS,
  LABS,
  SECTIONS,
  FORMULAS,
  MYTHS,
  GLOSSARY,
  DECISION_NODES,
  DECISION_RESULTS,
  journeyHref,
  labHref,
} from "../lib/statistics/content.ts";
import {
  binomialCdf,
  meanConfidenceInterval,
  normalCdf,
  poissonPmf,
  poissonTailAtLeast,
  studentTQuantile,
  twoProportionTest,
  zTestPower,
} from "../lib/statistics/math.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
const failures = [];

function check(name, fn) {
  try {
    fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    failures.push({ name, error: error instanceof Error ? error.message : String(error) });
    results.push({ name, status: "FAIL" });
  }
}

const read = (file) => readFileSync(path.join(ROOT, file), "utf8");
const source = JSON.parse(read("content/statistics/source.json"));
const manifest = JSON.parse(read("docs/statistics/source-manifest.json"));
const registry = read("components/statistics/visual-registry.tsx");
const registryIds = new Set([...registry.matchAll(/^\s{2}"?([a-z0-9-]+)"?:\s/gim)].map((match) => match[1]));

check("43 numbered source sections exist with stable ids", () => {
  assert.equal(source.sections.length, 43);
  assert.deepEqual(
    source.sections.map((section) => section.id),
    Array.from({ length: 43 }, (_, index) => `s${index + 1}`),
  );
  for (const section of source.sections) {
    assert.ok(section.blocks.length > 0, `${section.id} has no blocks`);
    assert.ok(section.title.length > 0, `${section.id} has no title`);
  }
});

check("source counts match the manifest and inventory", () => {
  assert.equal(source.counts.htmlFiles, 1);
  assert.equal(source.counts.sections, 43);
  assert.equal(source.counts.figures, 0);
  assert.equal(source.counts.assets, 0);
  assert.equal(manifest.totals.formulas, source.counts.formulas);
  assert.equal(manifest.snapshot.sha256, source.source.sha256);
  assert.ok(existsSync(path.join(ROOT, "docs/statistics/source-inventory.md")));
  assert.ok(read("docs/statistics/source-inventory.md").includes("HTML files"));
});

check("all 43 source sections have a journey, objective, misconception and registered visual", () => {
  assert.equal(SECTIONS.length, 43);
  for (const section of SECTIONS) {
    assert.ok(JOURNEYS.some((journey) => journey.slug === section.journey), `${section.id} journey`);
    assert.ok(section.objectives.length > 0, `${section.id} objective`);
    assert.ok(section.misconception.length > 20, `${section.id} misconception`);
    assert.ok(section.visual, `${section.id} has no visual`);
    assert.ok(registryIds.has(section.visual.id), `${section.id} visual ${section.visual.id} is not registered`);
    if (section.visual.kind === "lab") {
      assert.ok(LABS.some((lab) => lab.slug === section.visual.id), `${section.id} lab ${section.visual.id}`);
    }
  }
});

check("journey grouping covers each section exactly once", () => {
  const numbers = JOURNEYS.flatMap((journey) => journey.sections);
  assert.equal(numbers.length, 43);
  assert.equal(new Set(numbers).size, 43);
  assert.deepEqual(
    [...numbers].sort((a, b) => a - b),
    Array.from({ length: 43 }, (_, index) => index + 1),
  );
  for (const section of SECTIONS) {
    const journey = JOURNEYS.find((item) => item.slug === section.journey);
    assert.ok(journey?.sections.includes(section.number), `${section.id} not in its journey's section list`);
  }
});

check("every lab has metadata, a component and a static route", () => {
  assert.ok(LABS.length >= 15);
  for (const lab of LABS) {
    assert.ok(registryIds.has(lab.slug), `lab ${lab.slug} has no registered component`);
    assert.ok(existsSync(path.join(ROOT, "out", labHref(lab.slug).replace(/^\//, ""), "index.html")), `lab page ${lab.slug}`);
    assert.ok(lab.controls.length >= 2, `lab ${lab.slug} controls`);
    assert.ok(lab.math.length > 5, `lab ${lab.slug} math`);
  }
});

check("all formulas render through KaTeX with trust disabled", () => {
  assert.equal(source.unmappedFormulas.length, 0);
  const unique = new Set(source.formulas.map((formula) => formula.tex));
  for (const tex of unique) {
    assert.doesNotThrow(() => katex.renderToString(tex, { throwOnError: true, trust: false, strict: "ignore" }), tex);
  }
  for (const formula of FORMULAS) {
    assert.doesNotThrow(() => katex.renderToString(formula.tex, { throwOnError: true, trust: false, strict: "ignore" }), formula.id);
    assert.ok(formula.alt.length > 10, `${formula.id} alt text`);
    assert.ok(formula.plain.length > 3, `${formula.id} plain text`);
  }
});

check("the brief's Poisson λ=20 values are exact", () => {
  assert.ok(Math.abs(poissonPmf(20, 13) - 0.027115648104173072) < 1e-12);
  assert.ok(Math.abs(poissonTailAtLeast(20, 25) - 0.156772621826238) < 1e-10);
  assert.ok(poissonTailAtLeast(20, 25) > 0.15, "the source's 11% claim is wrong");
});

check("normal, binomial, t and interval benchmarks hold", () => {
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-12);
  assert.ok(Math.abs(binomialCdf(10, 10, 0.3) - 1) < 1e-12);
  assert.ok(Math.abs(studentTQuantile(0.975, 10) - 2.2281388519862744) < 1e-8);
  const interval = meanConfidenceInterval({ mean: 80, sd: 10, n: 25, confidence: 0.95 });
  assert.ok(Math.abs(interval.lower - 75.87220287674396) < 1e-9);
  assert.ok(Math.abs(interval.upper - 84.12779712325604) < 1e-9);
});

check("two-proportion and power benchmarks hold", () => {
  const result = twoProportionTest({ successesA: 320, nA: 4000, successesB: 376, nB: 4000 });
  assert.ok(Math.abs(result.difference - 0.014) < 1e-12);
  assert.ok(Math.abs(result.pValue - 0.026316526094114) < 1e-9);
  assert.ok(result.interval.lower > 0);
  const power = zTestPower({ effect: 2, sigma: 15, n: 100, alpha: 0.05 });
  assert.ok(power.power > 0.2 && power.power < 0.3);
});

check("myths, glossary and decision tree are present and internally linked", () => {
  assert.ok(MYTHS.length >= 10);
  assert.ok(GLOSSARY.length >= 40);
  assert.ok(DECISION_NODES.length >= 5);
  assert.ok(DECISION_RESULTS.length >= 10);
  for (const myth of MYTHS) {
    assert.ok(SECTIONS.some((section) => section.number === myth.section), `myth ${myth.id} section`);
    if (myth.lab) assert.ok(LABS.some((lab) => lab.slug === myth.lab), `myth ${myth.id} lab`);
  }
  for (const result of DECISION_RESULTS) {
    assert.ok(SECTIONS.some((section) => section.number === result.section), `decision ${result.id} section`);
    if (result.lab) assert.ok(LABS.some((lab) => lab.slug === result.lab), `decision ${result.id} lab`);
  }
});

check("every journey page exists and contains exactly its section anchors", () => {
  for (const journey of JOURNEYS) {
    const file = path.join(ROOT, "out", journeyHref(journey.slug).replace(/^\//, ""), "index.html");
    assert.ok(existsSync(file), `missing ${file}`);
    const html = readFileSync(file, "utf8");
    for (const number of journey.sections) {
      assert.ok(html.includes(`id="s${number}"`), `${journey.slug} missing s${number}`);
    }
    const allAnchors = [...html.matchAll(/id="s(\d+)"/g)].map((match) => Number(match[1]));
    const uniqueAnchors = [...new Set(allAnchors)].sort((a, b) => a - b);
    assert.deepEqual(uniqueAnchors, [...journey.sections].sort((a, b) => a - b), `${journey.slug} anchor set`);
  }
});

check("tool pages exist and the export contains the corrected Poisson value", () => {
  const pages = [
    "/learn/statistics",
    "/learn/statistics/labs",
    "/learn/statistics/atlas",
    "/learn/statistics/formulas",
    "/learn/statistics/glossary",
    "/learn/statistics/decision",
    "/learn/statistics/cheatsheet",
    "/learn/statistics/source",
  ];
  for (const page of pages) {
    const file = path.join(ROOT, "out", page.replace(/^\//, ""), "index.html");
    assert.ok(existsSync(file), `missing ${file}`);
  }
  const distributions = read("out/learn/statistics/journey/distributions/index.html");
  assert.ok(distributions.includes("15.68"), "corrected Poisson tail is missing from the rendered section");
  assert.ok(distributions.includes("s10"), "§10 anchor missing");
});

check("no visible NaN/undefined placeholders in statistics HTML", () => {
  const files = [
    "index.html",
    ...JOURNEYS.map((journey) => path.join("journey", journey.slug, "index.html")),
    ...LABS.map((lab) => path.join("labs", lab.slug, "index.html")),
  ];
  for (const relative of files) {
    const file = path.join(ROOT, "out/learn/statistics", relative);
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    assert.ok(!html.includes(">NaN<"), `${relative} contains >NaN<`);
    assert.ok(!html.includes(">undefined<"), `${relative} contains >undefined<`);
  }
});

check("all internal statistics links resolve to an exported file", () => {
  const pages = [
    "out/learn/statistics/index.html",
    ...JOURNEYS.map((journey) => path.join("out", journeyHref(journey.slug).replace(/^\//, ""), "index.html")),
    ...LABS.map((lab) => path.join("out", labHref(lab.slug).replace(/^\//, ""), "index.html")),
  ];
  const missing = new Set();
  for (const page of pages) {
    if (!existsSync(path.join(ROOT, page))) continue;
    const html = read(page);
    for (const match of html.matchAll(/href="(\/learn\/statistics[^"#?]*)"/g)) {
      const href = match[1].replace(/\/$/, "");
      const target = path.join(ROOT, "out", href.replace(/^\//, ""), "index.html");
      if (!existsSync(target)) missing.add(`${page} → ${href}`);
    }
  }
  assert.deepEqual([...missing], [], `broken links: ${[...missing].slice(0, 5).join(", ")}`);
});

check("required documentation artefacts exist", () => {
  const files = [
    "docs/statistics/source-inventory.md",
    "docs/statistics/source-manifest.json",
    "docs/statistics/coverage-matrix.md",
    "docs/statistics/math-errata.md",
    "docs/statistics/beui-component-decisions.md",
    "docs/statistics/visual-opportunity-audit.md",
    "docs/statistics/visual-storyboards.md",
    "docs/statistics/visualization-spec.md",
  ];
  for (const file of files) {
    assert.ok(existsSync(path.join(ROOT, file)), `missing ${file}`);
    assert.ok(read(file).length > 400, `${file} looks empty`);
  }
});

const passed = results.filter((result) => result.status === "PASS").length;
console.log(`\nStatistics verification: ${passed}/${results.length} checks passed.`);
for (const result of results) console.log(`${result.status === "PASS" ? "PASS" : "FAIL"}  ${result.name}`);
if (failures.length) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`- ${failure.name}: ${failure.error}`);
  process.exit(1);
}
