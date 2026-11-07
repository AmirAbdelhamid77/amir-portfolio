// R6 - the polish layer.
//
// These are source guards, not a screenshot test: they keep the polish layer
// scoped, keep its switch independent, and keep the two accessibility
// corrections (the h1 space and the duplicate reading heading) from regressing.
// The visual evidence lives in evidence/r6-report.json and compare.html section 12.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(import.meta.dirname, "../..");
const read = (file) => readFileSync(path.join(ROOT, file), "utf8");

const CSS = read("components/knowledge/stage-editorial.css");
const LANDING = read("components/knowledge/hansa-landing.tsx");
const STAGE = read("components/knowledge/insight-stage.tsx");
const TIMELINE = read("components/knowledge/stage-timeline.tsx");
const SCENE = read("components/knowledge/insight-scene.tsx");

// The R6 layer starts at its own banner and runs to the end of the file; every
// rule in it must be inert without the attribute the flag writes.
const start = CSS.indexOf("R6 - the polish layer");
assert.notEqual(start, -1, "the R6 polish layer must exist");
const polish = CSS.slice(CSS.lastIndexOf("/*", start));

test("the polish layer keeps one independent build-time switch", () => {
  assert.match(
    LANDING,
    /const polishReview = process\.env\.HANSA_POLISH_REVIEW !== "0"/,
    "R6 must own its switch, promoted by default and rolled back only by an explicit 0",
  );
  assert.match(LANDING, /polishReview=\{polishReview\}/, "the switch must reach the stage");
  // The four earlier stage switches must still be independent of it.
  for (const flag of [
    "HANSA_NEIGHBOURHOOD_REVIEW",
    "HANSA_TIMELINE_REVIEW",
    "HANSA_DEALER_REVIEW",
    "HANSA_CLOSING_REVIEW",
  ]) {
    assert.match(LANDING, new RegExp(flag), `${flag} must stay independent`);
  }
  assert.match(STAGE, /polishReview = false/, "the stage must default the layer off");
  assert.match(
    STAGE,
    /data-stage-polish=\{polishReview \? "true" : undefined\}/,
    "the attribute must only exist when the switch is on",
  );
});

test("every polish rule is scoped to the flag attribute", () => {
  const body = polish.replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors = [...body.matchAll(/(?:^|\})\s*([^{}]+)\{/g)].map((match) =>
    match[1].trim().replace(/\s+/g, " "),
  );
  assert.ok(selectors.length > 20, "the layer should carry the whole scale");
  for (const selector of selectors) {
    for (const part of selector.split(",")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      assert.ok(
        trimmed.startsWith('[data-stage-polish="true"]'),
        `unscoped polish selector: ${trimmed}`,
      );
    }
  }
});

test("the measured scale is nine named roles, not 25 incidental sizes", () => {
  for (const token of [
    "--polish-display",
    "--polish-title",
    "--polish-heading",
    "--polish-quote",
    "--polish-subhead",
    "--polish-lead",
    "--polish-body",
    "--polish-meta",
    "--polish-label",
  ]) {
    assert.match(polish, new RegExp(`${token}:`), `${token} is missing`);
  }
  // No raw size may reintroduce a near-duplicate inside the layer: sizes come
  // from the tokens, except the two role aliases and the tick alias.
  const raw = [...polish.matchAll(/font-size:\s*([^;]+);/g)].map((match) => match[1].trim());
  for (const value of raw) {
    assert.ok(
      value.startsWith("var(--polish-"),
      `the polish layer must not hard-code a size (${value})`,
    );
  }
});

test("prose keeps a 13px floor and labels keep their capitals", () => {
  // The 10-11px sentences in the reading card are the reason for the floor.
  const metaGroup = polish.match(
    /\/\* 13px is the smallest[\s\S]*?\{([\s\S]*?)\}/,
  );
  assert.ok(metaGroup, "the 13px floor group must exist");
  assert.match(metaGroup[0], /\.stage-close-posture/);
  assert.match(metaGroup[1], /font-size: var\(--polish-meta\)/);
  assert.match(
    polish,
    /\.insight-reading dl \{[\s\S]*?font-size: var\(--polish-meta\);[\s\S]*?text-transform: none;/,
    "the decision-model rows must stop shouting their content",
  );
  // Kickers and clock ticks keep the identity treatment.
  assert.doesNotMatch(
    polish,
    /\.stage-kicker[^{]*\{[^}]*text-transform: none/,
    "kickers keep their capitals",
  );
  assert.match(polish, /text-transform: none;\s*letter-spacing: 0\.02em;/);
});

test("the three small targets are given a 44px row", () => {
  for (const selector of [
    "a.stage-quiet-link",
    "button.stage-quiet-link",
    ".instrument-reset",
    ".stage-close-saved-button",
  ]) {
    assert.match(
      polish,
      new RegExp(selector.replace(/[.]/g, "\\.")),
      `${selector} must be covered by the target rule`,
    );
  }
  assert.match(polish, /min-height: 44px/);
  // The native disclosure keeps its marker: padding, not a display swap.
  assert.match(polish, /\.stage-close-details summary \{[^}]*padding-block: 11px/);
});

test("the h1 carries an explicit space between its two lines", () => {
  assert.match(
    TIMELINE,
    /Choose a moment\.\{" "\}/,
    "JSX drops the newline; the accessible name needs the space",
  );
});

test("the reading heading is named, so the outline has no duplicate h2", () => {
  assert.match(
    SCENE,
    /<span className="sr-only">The reading: <\/span>/,
    "the full reading must be distinguishable from the scene-1 peek",
  );
});

test("the flag-off stage still renders the accepted type", () => {
  // No token or polish declaration may escape the attribute selector.
  const unscoped = [...CSS.matchAll(/^(--polish-[a-z-]+):/gm)].map((match) => match[1]);
  assert.deepEqual(unscoped, [], "tokens must be declared inside the scoped block");
  assert.match(
    CSS,
    /\[data-stage-polish="true"\] \{\n  --polish-display/,
    "the token block itself must be scoped",
  );
  // The attribute is written on `.hansa-stage` itself, so a descendant
  // `.hansa-stage` would never match and would silently do nothing.
  assert.doesNotMatch(
    polish,
    /\[data-stage-polish="true"\] \.hansa-stage/,
    "the stage carries the attribute; do not select it as a descendant",
  );
});
