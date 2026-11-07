// FC05 — renderer decision fixtures (components/fabric/article/decisions.ts).
//
//   node --experimental-strip-types --test tests/fabric-corpus/routes/
//
// The decision layer is pure (no React, no fs), so these fixtures pin the
// LINK REWRITE RULES, anchor validation, admonition mapping and image
// fallback policy as data → expected decision.

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  UPSTREAM_ORIGIN,
  decideAdmonition,
  decideImage,
  decideInlineHtml,
  decideLink,
  upstreamUrlForDoc,
} from "../../../components/fabric/article/decisions.ts";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Registry stub: two published articles + one held doc. */
const PUBLISHED = {
  "docs/fundamentals/what-is-microsoft-fabric.md": {
    logicalPath: "/learn/fabric/docs/fundamentals/what-is-microsoft-fabric/",
  },
  "docs/data-science/ai-functions/pyspark/analyze-sentiment.md": {
    logicalPath: "/learn/fabric/docs/data-science/ai-functions/pyspark/analyze-sentiment/",
  },
};

const CONTEXT = {
  sourcePath: "docs/fundamentals/what-is-microsoft-fabric.md",
  headingSlugs: ["overview", "fabric-concepts", "next-steps"],
  lookup: (docPath) => PUBLISHED[docPath] ?? null,
};

test("link rewrite: relative .md to a published article becomes a local logical route", () => {
  const decision = decideLink(
    {
      href: "../data-science/ai-functions/pyspark/analyze-sentiment.md",
      classification: "relative-md",
      resolved: "data-science/ai-functions/pyspark/analyze-sentiment.md",
      exists: true,
      anchor: null,
      anchorExists: null,
    },
    CONTEXT,
  );
  assert.deepEqual(decision, {
    kind: "local-article",
    logicalPath: "/learn/fabric/docs/data-science/ai-functions/pyspark/analyze-sentiment/",
    anchor: null,
  });
});

test("link rewrite: anchors are preserved on local routes when the compiler validated them", () => {
  const decision = decideLink(
    {
      href: "what-is-microsoft-fabric.md#overview",
      classification: "relative-md",
      resolved: "fundamentals/what-is-microsoft-fabric.md",
      exists: true,
      anchor: "overview",
      anchorExists: true,
    },
    CONTEXT,
  );
  assert.deepEqual(decision, {
    kind: "local-article",
    logicalPath: "/learn/fabric/docs/fundamentals/what-is-microsoft-fabric/",
    anchor: "overview",
  });
});

test("link rewrite: a local article with a PROVEN-missing anchor falls back upstream", () => {
  const decision = decideLink(
    {
      href: "what-is-microsoft-fabric.md#renamed-section",
      classification: "relative-md",
      resolved: "fundamentals/what-is-microsoft-fabric.md",
      exists: true,
      anchor: "renamed-section",
      anchorExists: false,
    },
    CONTEXT,
  );
  assert.equal(decision.kind, "upstream");
  assert.equal(
    decision.href,
    `${UPSTREAM_ORIGIN}/en-us/fabric/fundamentals/what-is-microsoft-fabric`,
  );
});

test("link rewrite: relative .md to an UNPUBLISHED article falls back upstream (never a dead local link)", () => {
  const decision = decideLink(
    {
      href: "../cicd/deployment-plan/deployment-plan-overview.md",
      classification: "relative-md",
      resolved: "cicd/deployment-plan/deployment-plan-overview.md",
      exists: true, // exists upstream, held locally (quarantine)
      anchor: null,
      anchorExists: null,
    },
    CONTEXT,
  );
  assert.equal(decision.kind, "upstream");
  assert.equal(
    decision.href,
    `${UPSTREAM_ORIGIN}/en-us/fabric/cicd/deployment-plan/deployment-plan-overview`,
  );
});

test("link rewrite: broken relative link (compiler says missing) falls back upstream", () => {
  const decision = decideLink(
    {
      href: "no-such-page.md",
      classification: "relative-md",
      resolved: "fundamentals/no-such-page.md",
      exists: false,
      anchor: null,
    },
    CONTEXT,
  );
  assert.equal(decision.kind, "upstream");
});

test("anchor-only link: same-page anchor resolves locally when the slug exists", () => {
  const decision = decideLink(
    { href: "#fabric-concepts", classification: "anchor-only", anchor: "fabric-concepts" },
    CONTEXT,
  );
  assert.deepEqual(decision, { kind: "local-anchor", slug: "fabric-concepts" });
});

test("anchor-only link: missing slug becomes plain text with a note (task rule)", () => {
  const decision = decideLink(
    { href: "#gone-section", classification: "anchor-only", anchor: "gone-section", anchorExists: false },
    CONTEXT,
  );
  assert.deepEqual(decision, { kind: "plain-text", reason: "missing-anchor", upstreamUrl: null });
});

test("site-absolute /fabric/ link rewrites to the local article", () => {
  const decision = decideLink(
    {
      href: "/fabric/data-science/ai-functions/pyspark/analyze-sentiment",
      classification: "site-absolute",
      anchor: null,
    },
    CONTEXT,
  );
  assert.deepEqual(decision, {
    kind: "local-article",
    logicalPath: "/learn/fabric/docs/data-science/ai-functions/pyspark/analyze-sentiment/",
    anchor: null,
  });
});

test("site-absolute link to another docset stays upstream", () => {
  const decision = decideLink(
    { href: "/power-bi/enterprise/service-security", classification: "site-absolute" },
    CONTEXT,
  );
  assert.equal(decision.kind, "upstream");
  assert.equal(decision.href, `${UPSTREAM_ORIGIN}/en-us/power-bi/enterprise/service-security`);
});

test("external and mail links pass through with their kinds", () => {
  assert.deepEqual(
    decideLink({ href: "https://example.com/x", classification: "external" }, CONTEXT),
    { kind: "upstream", href: "https://example.com/x" },
  );
  assert.deepEqual(
    decideLink({ href: "mailto:someone@example.com", classification: "mail" }, CONTEXT),
    { kind: "mail", href: "mailto:someone@example.com" },
  );
});

test("admonition mapping covers the compiler kinds", () => {
  assert.deepEqual(decideAdmonition("note"), { label: "Note", tone: "info" });
  assert.deepEqual(decideAdmonition("tip"), { label: "Tip", tone: "success" });
  assert.deepEqual(decideAdmonition("important"), { label: "Important", tone: "warning" });
  assert.deepEqual(decideAdmonition("warning"), { label: "Warning", tone: "warning" });
  assert.deepEqual(decideAdmonition("caution"), { label: "Caution", tone: "warning" });
  assert.equal(decideAdmonition("mystery"), null);
});

const COPIED_FAMILY = {
  policy: "copied",
  assets: {
    "fundamentals/media/article/figure.png": { bytes: 10, width: 640, height: 480 },
  },
};

test("image decision: copied asset renders an img with manifest dimensions", () => {
  const decision = decideImage("./media/article/figure.png", {
    family: "fundamentals",
    articleDir: [],
    manifestFamily: COPIED_FAMILY,
  });
  assert.deepEqual(decision, {
    kind: "img",
    assetKey: "/fabric-docs-assets/fundamentals/media/article/figure.png",
    width: 640,
    height: 480,
  });
});

test("image decision: nested article directory resolves into the asset key", () => {
  const decision = decideImage("../shared/pic.jpg", {
    family: "data-science",
    articleDir: ["ai-functions", "pyspark"],
    manifestFamily: {
      policy: "copied",
      assets: { "data-science/ai-functions/shared/pic.jpg": { bytes: 1, width: null, height: null } },
    },
  });
  assert.equal(decision.kind, "img");
  assert.equal(decision.assetKey, "/fabric-docs-assets/data-science/ai-functions/shared/pic.jpg");
  assert.equal(decision.width, null); // dims only when derivable
});

test("image decision: family without copied assets falls back (never a broken image request)", () => {
  for (const manifestFamily of [null, { policy: "not-copied", assets: {} }]) {
    const decision = decideImage("./media/x.png", {
      family: "iq",
      articleDir: [],
      manifestFamily,
    });
    assert.deepEqual(decision, { kind: "fallback", reason: "family-assets-not-copied" });
  }
});

test("image decision: copied family with a missing specific asset falls back with its reason", () => {
  const decision = decideImage("./media/missing.png", {
    family: "fundamentals",
    articleDir: [],
    manifestFamily: COPIED_FAMILY,
  });
  assert.deepEqual(decision, { kind: "fallback", reason: "asset-not-copied" });
});

test("image decision: traversal escaping the docset never becomes an asset path", () => {
  const decision = decideImage("../../../../etc/passwd.png", {
    family: "fundamentals",
    articleDir: [],
    manifestFamily: COPIED_FAMILY,
  });
  assert.equal(decision.kind, "fallback");
});

test("inline html leftovers: paired sup/code/anchor markers and br", () => {
  assert.deepEqual(decideInlineHtml("<br />"), { kind: "br" });
  assert.deepEqual(decideInlineHtml("<sup>"), { kind: "open-sup" });
  assert.deepEqual(decideInlineHtml("</sup>"), { kind: "close-sup" });
  assert.deepEqual(decideInlineHtml("<code>"), { kind: "open-code" });
  assert.deepEqual(decideInlineHtml("</code>"), { kind: "close-code" });
  assert.deepEqual(decideInlineHtml('<a id="method-1">'), { kind: "anchor-target", id: "method-1" });
  assert.deepEqual(decideInlineHtml("</a>"), { kind: "skip", raw: "</a>" });
  assert.deepEqual(decideInlineHtml("<b>"), { kind: "skip", raw: "<b>" });
});

test("upstream URL shape matches Microsoft Learn (docs/ prefix and extension stripped)", () => {
  assert.equal(
    upstreamUrlForDoc("docs/fundamentals/what-is-microsoft-fabric.md"),
    `${UPSTREAM_ORIGIN}/en-us/fabric/fundamentals/what-is-microsoft-fabric`,
  );
  assert.equal(
    upstreamUrlForDoc("docs/data-science/ai-functions/pyspark/analyze-sentiment.md"),
    `${UPSTREAM_ORIGIN}/en-us/fabric/data-science/ai-functions/pyspark/analyze-sentiment`,
  );
  assert.equal(upstreamUrlForDoc("not-docs/x.md"), null);
});
