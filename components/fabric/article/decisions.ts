/**
 * Article rendering decisions (FC05) — PURE functions, no React, no fs, no
 * imports. They turn compiled typed nodes into concrete rendering decisions
 * so the link-rewrite / anchor-validation / admonition / image rules are
 * unit-testable against node fixtures (tests/fabric-corpus/routes/).
 *
 * Contracts implemented:
 *   - handover 03 §"Static routes": "Rewrite eligible intra-corpus links to
 *     local targets and preserve mapped anchors."
 *   - Task FC05 LINK REWRITE RULES: relative .md → local logical route via
 *     registry lookup; anchor-only → same-page anchors validated against the
 *     compiled heading set; everything else → upstream with the recorded
 *     fallback rule (upstream-link fallback; never a dead local link).
 *   - Task FC05 ASSET POLICY: images render locally only when the asset
 *     manifest proves the bytes were copied; otherwise an accessible
 *     fallback block, never a broken image request.
 */

/** Well-known upstream origin for Microsoft Learn (the corpus is a Learn
 *  docset; site-absolute hrefs and relative links all live there). */
export const UPSTREAM_ORIGIN = "https://learn.microsoft.com";

/** Admonition kinds the compiler emits ([!NOTE] etc.). */
export type AdmonitionKind = "note" | "tip" | "important" | "warning" | "caution";

export interface AdmonitionDecision {
  label: string;
  tone: "info" | "success" | "warning";
}

const ADMONITIONS: Record<AdmonitionKind, AdmonitionDecision> = {
  note: { label: "Note", tone: "info" },
  tip: { label: "Tip", tone: "success" },
  important: { label: "Important", tone: "warning" },
  warning: { label: "Warning", tone: "warning" },
  caution: { label: "Caution", tone: "warning" },
};

export function decideAdmonition(kind: unknown): AdmonitionDecision | null {
  if (typeof kind !== "string") return null;
  return ADMONITIONS[kind as AdmonitionKind] ?? null;
}

/** A registry row reduced to what link decisions need. */
export interface LocalArticleTarget {
  logicalPath: string;
}

/** Context the caller (page/build) assembles once per article. */
export interface LinkContext {
  /** docs-relative source path of the article being rendered,
   *  e.g. "docs/fundamentals/analyze-train-data.md". */
  sourcePath: string;
  /** Heading slug set of the article being rendered (same-page anchors). */
  headingSlugs: string[] | Set<string>;
  /** Registry lookup: docs-relative corpus doc path ('docs/<fam>/…') →
   *  local target, or null when the doc is not published. */
  lookup: (corpusDocPath: string) => LocalArticleTarget | null;
}

export type LinkDecision =
  | { kind: "local-article"; logicalPath: string; anchor: string | null }
  | { kind: "local-anchor"; slug: string }
  | { kind: "upstream"; href: string }
  | { kind: "mail"; href: string }
  /** Render the link text as plain text plus a visible note (task rule for
   *  unresolvable same-page anchors; upstreamUrl is shown in the sources
   *  note when known). */
  | { kind: "plain-text"; reason: string; upstreamUrl: string | null };

/** Split a site-absolute or upstream href into path + anchor. */
function splitAnchor(href: string): { path: string; anchor: string | null } {
  const hashAt = href.indexOf("#");
  if (hashAt === -1) return { path: href, anchor: null };
  return { path: href.slice(0, hashAt), anchor: href.slice(hashAt + 1) || null };
}

/** Upstream URL for a docs-relative corpus document
 *  ('docs/<fam>/<rest>.md' → learn.microsoft.com/en-us/fabric/<fam>/<rest>). */
export function upstreamUrlForDoc(corpusDocPath: string): string | null {
  if (!corpusDocPath.startsWith("docs/")) return null;
  const rest = corpusDocPath.slice("docs/".length).replace(/\.(md|markdown)$/i, "");
  if (rest === "") return null;
  return `${UPSTREAM_ORIGIN}/en-us/fabric/${rest}`;
}

/** Upstream URL for a site-absolute href ('/power-bi/…' → learn.microsoft.com). */
export function upstreamUrlForSitePath(sitePath: string): string {
  return `${UPSTREAM_ORIGIN}/en-us${sitePath}`;
}

/**
 * Decide how to render one link node.
 *
 * Node fields come from the compiler: classification
 * (relative-md | site-absolute | anchor-only | external | mail |
 * relative-asset | relative-other | locale-ref | …), resolved (docs-relative
 * path for relative links, null when unresolved), exists, anchor,
 * anchorExists (only computed for relative-md into existing docs). The node
 * is read loosely (`Record<string, unknown>`) because compiled blocks are
 * loaded as JSON at runtime, not through generated types.
 */
export function decideLink(
  node: Record<string, unknown>,
  context: LinkContext,
): LinkDecision {
  const classification = typeof node.classification === "string" ? node.classification : "unclassified";
  const href = typeof node.href === "string" ? node.href : "";

  if (classification === "mail" && href !== "") return { kind: "mail", href };

  if (classification === "anchor-only") {
    const slug = typeof node.anchor === "string" && node.anchor !== "" ? node.anchor : href.slice(1);
    if (slug !== "" && hasSlug(context.headingSlugs, slug)) {
      return { kind: "local-anchor", slug };
    }
    return { kind: "plain-text", reason: "missing-anchor", upstreamUrl: null };
  }

  if (classification === "relative-md") {
    const resolved = typeof node.resolved === "string" ? node.resolved : null;
    const exists = node.exists === true;
    if (resolved === null || !exists) {
      // Broken relative link: upstream fallback keeps the learner on an
      // authoritative page (recorded fallback rule).
      const upstream = resolved
        ? upstreamUrlForDoc(`docs/${resolved}`)
        : null;
      return { kind: "upstream", href: upstream ?? upstreamUrlForSitePath("/fabric/") };
    }
    const target = context.lookup(`docs/${resolved}`);
    const anchor = typeof node.anchor === "string" && node.anchor !== "" ? node.anchor : null;
    if (target === null) {
      // Not published locally → upstream (fail-closed: never a dead local link).
      return { kind: "upstream", href: upstreamUrlForDoc(`docs/${resolved}`) ?? upstreamUrlForSitePath("/fabric/") };
    }
    if (anchor !== null && node.anchorExists === false) {
      // The compiler proved the anchor is absent from the local target; the
      // upstream page remains authoritative for its own anchors.
      return { kind: "upstream", href: upstreamUrlForDoc(`docs/${resolved}`) ?? upstreamUrlForSitePath("/fabric/") };
    }
    return { kind: "local-article", logicalPath: target.logicalPath, anchor };
  }

  if (classification === "site-absolute" || classification === "locale-ref") {
    if (href === "") return { kind: "plain-text", reason: "empty-href", upstreamUrl: null };
    const { path, anchor } = splitAnchor(href);
    if (path === "/fabric/" || path.startsWith("/fabric/")) {
      const rest = path.slice("/fabric/".length);
      const docPath = rest === "" ? null : `docs/${rest}.md`;
      const target = docPath ? context.lookup(docPath) : null;
      if (target) return { kind: "local-article", logicalPath: target.logicalPath, anchor };
      // Unpublished / unresolved fabric path: keep the upstream target
      // (learn.microsoft.com serves /fabric/... directly).
      return { kind: "upstream", href: upstreamUrlForSitePath(href) };
    }
    // Other docsets (e.g. /power-bi/...) stay upstream.
    return { kind: "upstream", href: upstreamUrlForSitePath(href) };
  }

  if (classification === "external") {
    return href === "" ? { kind: "plain-text", reason: "empty-href", upstreamUrl: null } : { kind: "upstream", href };
  }

  if (classification === "relative-asset" || classification === "relative-other") {
    // Downloads and non-article references have no local projection in Wave 2.
    const resolved = typeof node.resolved === "string" ? node.resolved : null;
    const sourceDir = context.sourcePath.replace(/^docs\//, "").split("/").slice(0, -1);
    const docPath = resolved
      ? normalizeDocPath(sourceDir, resolved)
      : null;
    return {
      kind: "upstream",
      href: docPath ? upstreamUrlForDoc(docPath) ?? upstreamUrlForSitePath("/fabric/") : upstreamUrlForSitePath("/fabric/"),
    };
  }

  // 'unclassified' / unexpected shapes: plain text with the raw href shown in
  // the sources note (never an unvalidated href).
  return { kind: "plain-text", reason: "unclassified-link", upstreamUrl: href === "" ? null : href };
}

function normalizeDocPath(sourceDir: string[], resolved: string): string | null {
  const parts = [...sourceDir];
  for (const segment of resolved.replace(/\\/g, "/").split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (parts.length === 0) return null;
      parts.pop();
    } else parts.push(segment);
  }
  return parts.length > 0 ? `docs/${parts.join("/")}` : null;
}

function hasSlug(slugs: string[] | Set<string>, slug: string): boolean {
  if (slugs instanceof Set) return slugs.has(slug);
  return slugs.includes(slug);
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export interface ImageManifestEntry {
  bytes: number;
  width: number | null;
  height: number | null;
}

export interface ImageDecisionContext {
  /** Family of the article being rendered. */
  family: string;
  /** Intra-family directory segments of the article (articleSegments minus
   *  the slug). */
  articleDir: string[];
  /** Family entry from the asset manifest, or null when the manifest was
   *  not generated / family not processed. */
  manifestFamily: {
    policy: "copied" | "not-copied";
    assets: Record<string, ImageManifestEntry>;
  } | null;
}

export type ImageDecision =
  | { kind: "img"; assetKey: string; width: number | null; height: number | null }
  | { kind: "fallback"; reason: string };

/**
 * Decide how to render one image reference. `source` is the article-relative
 * source attribute; resolution mirrors copy-assets.mjs exactly (the asset
 * keys are docset-relative: family dir first, then the article's intra-family
 * directory, then the source segments).
 */
export function decideImage(source: unknown, context: ImageDecisionContext): ImageDecision {
  if (typeof source !== "string" || source.trim() === "") {
    return { kind: "fallback", reason: "image-source-missing" };
  }
  if (context.manifestFamily === null || context.manifestFamily.policy !== "copied") {
    return { kind: "fallback", reason: "family-assets-not-copied" };
  }
  const parts = [context.family, ...context.articleDir];
  for (const segment of source.replace(/\\/g, "/").split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (parts.length === 0) return { kind: "fallback", reason: "source-escapes-docset" };
      parts.pop();
    } else parts.push(segment);
  }
  if (parts.length === 0) return { kind: "fallback", reason: "source-escapes-docset" };
  const assetKey = parts.join("/");
  const entry = context.manifestFamily.assets[assetKey];
  if (!entry) return { kind: "fallback", reason: "asset-not-copied" };
  return { kind: "img", assetKey: `/fabric-docs-assets/${assetKey}`, width: entry.width, height: entry.height };
}

// ---------------------------------------------------------------------------
// Inline HTML leftovers (benign paired tags the parser keeps verbatim)
// ---------------------------------------------------------------------------

export type InlineHtmlDecision =
  | { kind: "br" }
  | { kind: "open-sup" }
  | { kind: "close-sup" }
  | { kind: "open-code" }
  | { kind: "close-code" }
  /** A raw anchor carrying an id becomes a real in-page anchor target so
   *  external deep links keep working. */
  | { kind: "anchor-target"; id: string }
  | { kind: "skip"; raw: string };

export function decideInlineHtml(raw: unknown): InlineHtmlDecision {
  if (typeof raw !== "string") return { kind: "skip", raw: "" };
  const value = raw.trim().toLowerCase();
  if (value === "<br>" || value === "<br/>" || value === "<br />") return { kind: "br" };
  if (value === "<sup>") return { kind: "open-sup" };
  if (value === "</sup>") return { kind: "close-sup" };
  if (value === "<code>") return { kind: "open-code" };
  if (value === "</code>") return { kind: "close-code" };
  const anchor = value.match(/^<a\s+id="([^"]+)">$/);
  if (anchor) return { kind: "anchor-target", id: anchor[1] };
  if (value === "</a>") return { kind: "skip", raw };
  return { kind: "skip", raw };
}
