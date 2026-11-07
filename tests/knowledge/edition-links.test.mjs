import test from "node:test";
import assert from "node:assert/strict";
import {
  atlasDeskHref,
  homeEditionHref,
  isConceptId,
  isEditionId,
  readEditionReturn,
} from "../../lib/knowledge/edition-links.ts";

const EDITION = "hansa-insight-shortcut-reference-v1";
const CONCEPT = "concept:fabric:shortcut";

test("edition ids accept the real feed ids and nothing path-shaped", () => {
  assert.equal(isEditionId(EDITION), true);
  assert.equal(isEditionId("hansa-insight-shortcut-delete-v1"), true);
  for (const value of ["", "/", "../x", "hansa-insight-", "javascript:alert(1)", "https://evil.test", null, 7]) {
    assert.equal(isEditionId(value), false, String(value));
  }
  assert.equal(isEditionId(`hansa-insight-${"a".repeat(101)}`), false);
});

test("concept ids are concept-shaped, not arbitrary URLs", () => {
  assert.equal(isConceptId(CONCEPT), true);
  assert.equal(isConceptId("concept:fabric:direct-lake"), true);
  for (const value of ["", "concept:", "/learn", "javascript:alert(1)", "concept:fabric:shortcut?x=1", null]) {
    assert.equal(isConceptId(value), false, String(value));
  }
});

test("the edition link is the Home link the stage already restores", () => {
  assert.equal(homeEditionHref(EDITION), `/?insight=${EDITION}#edition`);
  assert.equal(homeEditionHref("https://evil.test"), "/");
  assert.equal(homeEditionHref(""), "/");
});

test("the Atlas desk keeps the concept and carries the edition home", () => {
  const href = atlasDeskHref(CONCEPT, EDITION);
  assert.ok(href.startsWith("/learn/dp-600/atlas/?v=1&"), href);
  assert.match(href, /concept=concept%3Afabric%3Ashortcut/);
  assert.match(href, new RegExp(`&return=${EDITION}$`));
  assert.equal(readEditionReturn(href.slice(href.indexOf("?"))), EDITION);
});

test("an unknown concept falls back to the plain desk, without a return", () => {
  const href = atlasDeskHref("https://evil.test", EDITION);
  assert.equal(href, "/learn/dp-600/atlas/");
  assert.equal(atlasDeskHref(CONCEPT, "https://evil.test"), atlasDeskHref(CONCEPT));
});

test("the return value cannot become an open redirect", () => {
  assert.equal(readEditionReturn("?return=https://evil.test"), "");
  assert.equal(readEditionReturn("?return=//evil.test"), "");
  assert.equal(readEditionReturn("?return=%2Flearn"), "");
  assert.equal(readEditionReturn(`?return=${EDITION}&other=1`), EDITION);
  assert.equal(readEditionReturn(`?return=${"a".repeat(2050)}`), "");
});

test("links round-trip and stay same-origin", () => {
  const href = atlasDeskHref(CONCEPT, EDITION);
  assert.equal(new URL(href, "https://hansa.test").origin, "https://hansa.test");
  assert.equal(homeEditionHref(readEditionReturn(href.slice(href.indexOf("?")))), `/?insight=${EDITION}#edition`);
});
