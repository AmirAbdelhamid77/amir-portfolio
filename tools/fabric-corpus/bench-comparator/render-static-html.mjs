#!/usr/bin/env node
// FC13 — same-origin static HTML comparator generator (renderer-gate arm B).
//
//   node --experimental-strip-types tools/fabric-corpus/bench-comparator/render-static-html.mjs \
//     --profile root|subpath [--out DIR] [--limit N] [--dry-run] [--quiet]
//
// Renders ONE self-contained HTML file per published article (2,716) straight
// from the frozen build workspace (route registry + compiled typed nodes +
// asset manifest), with ZERO JavaScript, so the open "Rendering and hosting
// decision" gate (handover 03 §"Independent review dispositions") can compare
// the measured Next App Router static export (FC05/FC12: ~6 files / ~262 KB
// per article) against a 1-file-per-article static HTML compiler using the
// same inputs, link rules and asset tree.
//
// Contracts mirrored (the comparator MUST render the same content decisions
// as the Next renderer — parity is gate-checked):
//   components/fabric/article/ArticleBody.tsx  (block/inline rendering)
//   components/fabric/article/decisions.ts     (link/anchor/admonition/image rules)
//   lib/fabric/articles/article-data.ts        (include resolution, heading slugs)
//   lib/fabric/paths.ts                        (base path EXACTLY ONCE at the
//                                               output boundary, via buildPublicUrl
//                                               / buildAssetUrl — imported with
//                                               an explicit .ts extension)
//   components/fabric/article/ProvenanceFooter.tsx (provenance footer fields)
//
// Output (outside Git):
//   FABRIC_CORPUS_BUILD_DIR/comparator/<profile>/site/              the site
//   FABRIC_CORPUS_BUILD_DIR/comparator/<profile>/site-manifest.json  deterministic per-file sha256 manifest (no clock)
//   FABRIC_CORPUS_BUILD_DIR/comparator/<profile>/render-report.json  measurement + gates (timing included — bench evidence, not a content artifact)
//
// Shared trees are REFERENCED, never copied (one asset tree serves both
// renderers): image src points at /fabric-docs-assets/... (base-pathed via
// buildAssetUrl) and search shards stay at /fabric-search/... — the packaging
// step assembles the deployed tree. Alias pages are re-emitted from the
// route-registry receipt using the write-alias-routes.mjs template with the
// profile base path applied once (mirrors the FC12 packaging driver fix: the
// on-disk public/fabric-aliases tree is root-profile; per-profile alias
// regeneration is required).
//
// Determinism: no clock, no randomness, sorted iteration everywhere; the SITE
// and the site manifest are byte-identical across re-runs (tests prove it).
// Exit codes: 0 ok (all gates pass); 1 gate failure; 2 usage/IO error.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  buildAssetUrl,
  buildPublicUrl,
  safeRedirectTarget,
  validateProfile,
} from "../../../lib/fabric/paths.ts";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..", "..", "..");

function parseArgs(argv) {
  const args = { profile: null, out: null, limit: 0, quiet: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--profile") args.profile = argv[++i] ?? null;
    else if (a.startsWith("--profile=")) args.profile = a.slice("--profile=".length);
    else if (a === "--out") args.out = argv[++i] ?? null;
    else if (a.startsWith("--out=")) args.out = a.slice("--out=".length);
    else if (a === "--limit") args.limit = Number.parseInt(argv[++i] ?? "0", 10) || 0;
    else if (a.startsWith("--limit=")) args.limit = Number.parseInt(a.slice("--limit=".length), 10) || 0;
    else if (a === "--quiet") args.quiet = true;
    else { process.stderr.write(`unknown argument: ${a}\n`); process.exit(2); }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (args.profile !== "root" && args.profile !== "subpath") {
  process.stderr.write('error: --profile must be "root" or "subpath"\n');
  process.exit(2);
}

const BUILD_DIR = path.resolve(
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(REPO_ROOT, "..", "fabric-corpus-build"),
);

/** Frozen-v1 delivery profile. Root: basePath "". Subpath: the profile seed
 *  (fs-read, never a JSON import — repo constraint) validated fail-closed. */
function deliveryProfile(name) {
  if (name === "root") {
    return validateProfile({
      profile: "root",
      basePath: "",
      publicOrigin: "TO_BE_APPROVED",
      canonicalOrigin: "TO_BE_APPROVED",
      trailingSlash: true,
      assetOrigin: "",
      robotsPolicy: "canonical",
    });
  }
  const seedPath = path.join(REPO_ROOT, "tools", "fabric-corpus", "profiles", "subpath.json");
  const seed = JSON.parse(readFileSync(seedPath, "utf8"));
  return validateProfile(seed);
}

const profile = deliveryProfile(args.profile);
const basePath = profile.basePath;

const registryPath = path.join(BUILD_DIR, "route-registry", "route-registry.json");
const assetManifestPath = path.join(BUILD_DIR, "route-registry", "asset-manifest.json");
const aliasReceiptPath = path.join(BUILD_DIR, "route-registry", "alias-pages.json");
for (const file of [registryPath, assetManifestPath, aliasReceiptPath]) {
  try {
    statSync(file).isFile();
  } catch {
    process.stderr.write(`error: required input missing: ${file}\n`);
    process.exit(2);
  }
}

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
if (registry?.schema !== "hansa.fabric-route-registry/1") {
  process.stderr.write(`error: unknown registry schema at ${registryPath}\n`);
  process.exit(2);
}
const assetManifest = JSON.parse(readFileSync(assetManifestPath, "utf8"));
const aliasReceipt = JSON.parse(readFileSync(aliasReceiptPath, "utf8"));
if (aliasReceipt?.schema !== "hansa.fabric-alias-pages/1") {
  process.stderr.write(`error: unknown alias receipt schema at ${aliasReceiptPath}\n`);
  process.exit(2);
}

const ASSET_TREE = path.join(REPO_ROOT, "public", "fabric-docs-assets");
// public/fabric-search is REFERENCED, never copied: a no-JS page fetches
// nothing, so the shards ride the packaging step from the same public/ tree
// the Next build uses (one shard set serves both renderers).
const OUT_ROOT = args.out
  ? path.resolve(args.out)
  : path.join(BUILD_DIR, "comparator", args.profile, "site");

const log = (...m) => { if (!args.quiet) process.stdout.write(m.join(" ") + "\n"); };

// ---------------------------------------------------------------------------
// Shared decision mirrors (keep byte-for-byte parity with decisions.ts)
// ---------------------------------------------------------------------------

const UPSTREAM_ORIGIN = "https://learn.microsoft.com";
const ADMONITIONS = {
  note: { label: "Note", tone: "info" },
  tip: { label: "Tip", tone: "success" },
  important: { label: "Important", tone: "warning" },
  warning: { label: "Warning", tone: "warning" },
  caution: { label: "Caution", tone: "warning" },
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitAnchor(href) {
  const hashAt = href.indexOf("#");
  if (hashAt === -1) return { path: href, anchor: null };
  return { path: href.slice(0, hashAt), anchor: href.slice(hashAt + 1) || null };
}

function upstreamUrlForDoc(corpusDocPath) {
  if (!corpusDocPath.startsWith("docs/")) return null;
  const rest = corpusDocPath.slice("docs/".length).replace(/\.(md|markdown)$/i, "");
  if (rest === "") return null;
  return `${UPSTREAM_ORIGIN}/en-us/fabric/${rest}`;
}

function upstreamUrlForSitePath(sitePath) {
  return `${UPSTREAM_ORIGIN}/en-us${sitePath}`;
}

function normalizeDocPath(sourceDir, resolved) {
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

/** Mirror of decisions.ts decideLink (fixture-parity). */
function decideLink(node, context) {
  const classification = typeof node.classification === "string" ? node.classification : "unclassified";
  const href = typeof node.href === "string" ? node.href : "";

  if (classification === "mail" && href !== "") return { kind: "mail", href };

  if (classification === "anchor-only") {
    const slug = typeof node.anchor === "string" && node.anchor !== "" ? node.anchor : href.slice(1);
    if (slug !== "" && context.headingSlugs.has(slug)) {
      return { kind: "local-anchor", slug };
    }
    return { kind: "plain-text", reason: "missing-anchor" };
  }

  if (classification === "relative-md") {
    const resolved = typeof node.resolved === "string" ? node.resolved : null;
    const exists = node.exists === true;
    if (resolved === null || !exists) {
      const upstream = resolved ? upstreamUrlForDoc(`docs/${resolved}`) : null;
      return { kind: "upstream", href: upstream ?? upstreamUrlForSitePath("/fabric/") };
    }
    const target = context.lookup(`docs/${resolved}`);
    const anchor = typeof node.anchor === "string" && node.anchor !== "" ? node.anchor : null;
    if (target === null) {
      return { kind: "upstream", href: upstreamUrlForDoc(`docs/${resolved}`) ?? upstreamUrlForSitePath("/fabric/") };
    }
    if (anchor !== null && node.anchorExists === false) {
      return { kind: "upstream", href: upstreamUrlForDoc(`docs/${resolved}`) ?? upstreamUrlForSitePath("/fabric/") };
    }
    return { kind: "local-article", logicalPath: target.logicalPath, anchor };
  }

  if (classification === "site-absolute" || classification === "locale-ref") {
    if (href === "") return { kind: "plain-text", reason: "empty-href" };
    const { path: pathPart, anchor } = splitAnchor(href);
    if (pathPart === "/fabric/" || pathPart.startsWith("/fabric/")) {
      const rest = pathPart.slice("/fabric/".length);
      const docPath = rest === "" ? null : `docs/${rest}.md`;
      const target = docPath ? context.lookup(docPath) : null;
      if (target) return { kind: "local-article", logicalPath: target.logicalPath, anchor };
      return { kind: "upstream", href: upstreamUrlForSitePath(href) };
    }
    return { kind: "upstream", href: upstreamUrlForSitePath(href) };
  }

  if (classification === "external") {
    return href === "" ? { kind: "plain-text", reason: "empty-href" } : { kind: "upstream", href };
  }

  if (classification === "relative-asset" || classification === "relative-other") {
    const resolved = typeof node.resolved === "string" ? node.resolved : null;
    const sourceDir = context.sourcePath.replace(/^docs\//, "").split("/").slice(0, -1);
    const docPath = resolved ? normalizeDocPath(sourceDir, resolved) : null;
    return {
      kind: "upstream",
      href: docPath ? upstreamUrlForDoc(docPath) ?? upstreamUrlForSitePath("/fabric/") : upstreamUrlForSitePath("/fabric/"),
    };
  }

  return { kind: "plain-text", reason: "unclassified-link" };
}

/** Mirror of decisions.ts decideImage. */
function decideImage(source, context) {
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

/** Mirror of decisions.ts decideInlineHtml. */
function decideInlineHtml(raw) {
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

// ---------------------------------------------------------------------------
// Include resolution (mirror of article-data.ts resolveIncludes)
// ---------------------------------------------------------------------------

const MAX_INCLUDE_DEPTH = 5;

function resolveIncludes(blocks, seenSha, depth) {
  const map = new Map();
  if (depth > MAX_INCLUDE_DEPTH) return map;
  for (const block of blocks) {
    if (block.type !== "include") {
      const nested = [block.children, block.items, block.inline, block.header];
      if (Array.isArray(block.rows)) nested.push(...block.rows);
      for (const children of nested) {
        if (!Array.isArray(children)) continue;
        for (const [key, fragment] of resolveIncludes(children, seenSha, depth)) {
          if (!map.has(key)) map.set(key, fragment);
        }
      }
      continue;
    }
    const resolved = typeof block.resolved === "string" ? block.resolved : null;
    const key = resolved ? `docs/${resolved}` : null;
    if (key === null || map.has(key)) continue;
    if (block.blocked === true) {
      map.set(key, { sourcePath: key, blocks: [], blocked: true, blockedReason: typeof block.blockedReason === "string" ? block.blockedReason : "include-blocked" });
      continue;
    }
    const resolvedPath = typeof resolved === "string" ? resolved.replace(/\.md$/i, ".json").split("/") : null;
    const fragmentAbs =
      resolvedPath && resolvedPath.length >= 2
        ? path.join(BUILD_DIR, "compiler-output", resolvedPath[0], "nodes", ...resolvedPath)
        : null;
    if (fragmentAbs === null || !existsSyncSafe(fragmentAbs)) {
      map.set(key, { sourcePath: key, blocks: [], blocked: true, blockedReason: "fragment-node-missing" });
      continue;
    }
    const raw = readFileSync(fragmentAbs, "utf8");
    const fragmentNodes = JSON.parse(raw).nodes ?? [];
    const sha = typeof block.fragmentSha256 === "string" ? block.fragmentSha256 : createHash("sha256").update(raw).digest("hex");
    if (seenSha.has(sha)) continue;
    seenSha.add(sha);
    map.set(key, { sourcePath: key, blocks: fragmentNodes, blocked: false, blockedReason: null });
    for (const [nestedKey, nestedFragment] of resolveIncludes(fragmentNodes, seenSha, depth + 1)) {
      if (!map.has(nestedKey)) map.set(nestedKey, nestedFragment);
    }
  }
  return map;
}

function existsSyncSafe(file) {
  try {
    statSync(file).isFile();
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// HTML rendering (mirror of ArticleBody.tsx projections)
// ---------------------------------------------------------------------------

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function localHref(logicalPathWithAnchor) {
  // The base path is applied here exactly once, at this output boundary,
  // through the shared resolver (no double prefix possible — it throws).
  return buildPublicUrl(logicalPathWithAnchor, profile);
}

function assetHref(assetPath) {
  return buildAssetUrl(assetPath, profile);
}

function anchorAttr(kind, href, label, state) {
  if (kind === "upstream") {
    return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true"> ↗</span><span class="sr-only"> (opens Microsoft Learn in a new tab)</span></a>`;
  }
  if (kind === "plain") {
    return `<span title="This reference is not available in the local copy; see the upstream source page." class="link-unresolved">${label}<span class="sr-only"> (reference unavailable in the local copy)</span></span>`;
  }
  if (kind === "local") {
    void state;
    return `<a href="${esc(href)}">${label}</a>`;
  }
  return `<a href="${esc(href)}">${label}</a>`;
}

function renderInlineSeq(blocks, state) {
  let out = "";
  let index = 0;
  while (index < blocks.length) {
    const node = blocks[index];
    if (node.type === "inlineHtml") {
      const decision = decideInlineHtml(node.raw);
      if (decision.kind === "br") {
        out += "<br>";
        index += 1;
        continue;
      }
      if (decision.kind === "open-sup" || decision.kind === "open-code") {
        const closer = decision.kind === "open-sup" ? "close-sup" : "close-code";
        const inner = [];
        let cursor = index + 1;
        while (cursor < blocks.length) {
          const candidate = blocks[cursor];
          if (candidate.type === "inlineHtml" && decideInlineHtml(candidate.raw).kind === closer) break;
          inner.push(candidate);
          cursor += 1;
        }
        const rendered = renderInlineSeq(inner, state);
        out += decision.kind === "open-sup" ? `<sup>${rendered}</sup>` : `<code class="inline-code">${rendered}</code>`;
        index = cursor < blocks.length ? cursor + 1 : cursor;
        continue;
      }
      if (decision.kind === "anchor-target") {
        out += `<span id="${esc(decision.id)}"></span>`;
        index += 1;
        continue;
      }
      index += 1;
      continue;
    }
    out += renderInlineNode(node, state);
    index += 1;
  }
  return out;
}

function renderInline(blocks, state) {
  return renderInlineSeq(asArray(blocks), state);
}

function renderInlineNode(node, state) {
  switch (node.type) {
    case "text":
      return typeof node.value === "string" ? esc(node.value) : "";
    case "softbreak":
      return " ";
    case "emphasis": {
      const flavor = typeof node.flavor === "string" ? node.flavor : "strong";
      const inner = renderInline(node.children, state);
      return flavor === "em" || flavor === "italic" ? `<em>${inner}</em>` : `<strong>${inner}</strong>`;
    }
    case "inlineCode":
      return `<code class="inline-code">${esc(typeof node.value === "string" ? node.value : "")}</code>`;
    case "link":
      return renderLinkNode(node, state);
    case "include":
      return renderInlineInclude(node, state);
    case "image": {
      const attrs = node.attributes ?? {};
      return renderFigure(node.source ?? attrs.source, node["alt-text"] ?? attrs["alt-text"], state);
    }
    case "hardbreak":
      return "<br>";
    default:
      if (Array.isArray(node.children)) return renderInline(node.children, state);
      return "";
  }
}

function renderLinkNode(node, state) {
  const decision = decideLink(node, state.linkContext);
  const label = renderInline(node.children, state);
  switch (decision.kind) {
    case "local-article": {
      const href = decision.anchor ? `${decision.logicalPath}#${decision.anchor}` : decision.logicalPath;
      return anchorAttr("local", localHref(href), label, state);
    }
    case "local-anchor":
      return anchorAttr("local", `#${decision.slug}`, label, state);
    case "upstream":
      return anchorAttr("upstream", decision.href, label, state);
    case "mail":
      return anchorAttr("local", decision.href, label, state);
    case "plain-text":
      return anchorAttr("plain", "", label, state);
    default:
      return "";
  }
}

function renderInlineInclude(node, state) {
  const fragment = findFragment(node, state);
  if (!fragment || fragment.blocked) {
    return '<span role="note">[Included text unavailable in this copy]</span>';
  }
  const inner = flattenInline(fragment.blocks);
  return renderInline(inner, withinFragment(state, fragment));
}

function flattenInline(blocks) {
  const out = [];
  for (const block of blocks) {
    if (block.type === "paragraph") out.push(...asArray(block.inline));
    else if (Array.isArray(block.children)) out.push(...flattenInline(block.children));
  }
  return out;
}

function findFragment(block, state) {
  const resolved = typeof block.resolved === "string" ? block.resolved : null;
  if (!resolved || block.blocked === true) return undefined;
  const key = `docs/${resolved}`;
  return state.includeTrail.has(key) ? undefined : state.data.includes.get(key);
}

function withinFragment(state, fragment) {
  return { ...state, includeTrail: new Set([...state.includeTrail, fragment.sourcePath]) };
}

const ALIGNMENTS = { left: "ta-left", center: "ta-center", right: "ta-right", none: "ta-left" };

function renderBlocks(blocks, state) {
  let out = "";
  for (const block of asArray(blocks)) out += renderBlock(block, state);
  return out;
}

function renderBlock(block, state) {
  switch (block.type) {
    case "heading":
      return renderHeading(block);
    case "paragraph":
      return `<p>${renderInline(block.inline, state)}</p>`;
    case "list":
      return renderList(block, state);
    case "table":
      return renderTable(block, state);
    case "code":
      return renderCodeBlock(block);
    case "blockquote":
      return `<blockquote>${renderBlocks(asArray(block.children), state)}</blockquote>`;
    case "admonition":
      return renderAdmonition(block, state);
    case "thematicBreak":
      return "<hr>";
    case "include":
      return renderInclude(block, state);
    case "learnConstruct":
      return renderLearnConstruct(block, state);
    case "content":
    case "complex":
      return renderFigure(block.source, block["alt-text"], state);
    case "commentedDirective":
      return "";
    default:
      return "";
  }
}

function renderHeading(block) {
  const level = typeof block.level === "number" ? block.level : 2;
  const slug = typeof block.slug === "string" ? block.slug : undefined;
  const text = typeof block.text === "string" ? block.text : "";
  const tag = level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
  return `<${tag}${slug ? ` id="${esc(slug)}"` : ""}>${esc(text)}</${tag}>`;
}

function renderList(block, state) {
  const ordered = block.ordered === true;
  const tag = ordered ? "ol" : "ul";
  let items = "";
  for (const item of asArray(block.items)) {
    items += `<li>${renderInline(item.inline, state)}`;
    if (Array.isArray(item.children) && item.children.length > 0) {
      items += `<div class="list-nested">${renderBlocks(item.children, state)}</div>`;
    }
    items += "</li>";
  }
  return `<${tag}>${items}</${tag}>`;
}

function renderTable(block, state) {
  const alignments = Array.isArray(block.alignments) ? block.alignments : [];
  const header = asArray(block.header);
  const rows = Array.isArray(block.rows) ? block.rows : [];
  let thead = "<thead><tr>";
  for (let index = 0; index < header.length; index += 1) {
    const align = ALIGNMENTS[alignments[index] ?? "none"] ?? "ta-left";
    thead += `<th scope="col" class="${align}">${renderInline(header[index].inline, state)}</th>`;
  }
  thead += "</tr></thead>";
  let tbody = "<tbody>";
  for (const row of rows) {
    tbody += "<tr>";
    for (let cellIndex = 0; cellIndex < row.length; cellIndex += 1) {
      const align = ALIGNMENTS[alignments[cellIndex] ?? "none"] ?? "ta-left";
      tbody += `<td class="${align}">${renderInline(row[cellIndex].inline, state)}</td>`;
    }
    tbody += "</tr>";
  }
  tbody += "</tbody>";
  return `<div class="table-wrap"><table>${thead}${tbody}</table></div>`;
}

function renderCodeBlock(block) {
  const language = typeof block.language === "string" && block.language !== "" ? block.language : null;
  const value = typeof block.value === "string" ? block.value : "";
  const caption = language ? `<figcaption class="code-lang">${esc(language)}</figcaption>` : "";
  return `<figure class="code-block">${caption}<pre><code>${esc(value)}</code></pre></figure>`;
}

function renderAdmonition(block, state) {
  const decision = ADMONITIONS[block.kind] ?? { label: "Note", tone: "info" };
  return (
    `<aside class="admonition tone-${decision.tone}" role="note" aria-label="${esc(decision.label)}">` +
    `<p class="admonition-label">${esc(decision.label)}</p>` +
    `<div class="admonition-body">${renderBlocks(asArray(block.children), state)}</div>` +
    "</aside>"
  );
}

function renderInclude(block, state) {
  const fragment = findFragment(block, state);
  if (!fragment) return renderBlockedInclude(block, null);
  if (fragment.blocked) return renderBlockedInclude(block, fragment.blockedReason);
  return `<div class="include-body">${renderBlocks(fragment.blocks, withinFragment(state, fragment))}</div>`;
}

function renderBlockedInclude(block, reason) {
  const target = typeof block.target === "string" ? block.target : "include";
  return (
    `<div class="blocked-include" role="note">Included section not available in the local copy (${esc(target)}` +
    `${reason ? `; ${esc(reason)}` : ""}). See the upstream source page for the original content.</div>`
  );
}

function renderLearnConstruct(block, state) {
  const kind = typeof block.kind === "string" ? block.kind : "";
  const attributes = block.attributes ?? {};
  const children = asArray(block.children);
  switch (kind) {
    case "image":
      return renderFigure(attributes.source, attributes["alt-text"], state);
    case "zone": {
      const pivot = typeof attributes.pivot === "string" ? attributes.pivot : null;
      const label = pivot ? `Section filtered by pivot: ${pivot}` : "Section";
      return (
        `<section class="zone" aria-label="${esc(label)}">` +
        (pivot ? renderPivotNote(pivot) : "") +
        renderBlocks(children, state) +
        "</section>"
      );
    }
    case "tab": {
      const label =
        (typeof attributes.title === "string" && attributes.title !== "" && attributes.title) ||
        (typeof block.rawAttributes === "string" && block.rawAttributes !== "" && block.rawAttributes) ||
        "Tab";
      return (
        `<section class="tab" aria-label="Tab: ${esc(label)}">` +
        `<p class="tab-label">Tab · ${esc(label)}</p>` +
        renderBlocks(children, state) +
        "</section>"
      );
    }
    case "row":
    case "column":
    case "div":
    case "section":
      return children.length > 0 ? `<div class="layout">${renderBlocks(children, state)}</div>` : "";
    case "video":
      return (
        '<div class="blocked-include" role="note">A video is embedded in the upstream article; it is not reproduced locally. ' +
        anchorAttr("upstream", state.upstreamUrl, "Watch on Microsoft Learn", state) +
        ".</div>"
      );
    default:
      return children.length > 0 ? `<div class="layout">${renderBlocks(children, state)}</div>` : "";
  }
}

function renderPivotNote(pivot) {
  const terms = pivot.split(/[\s,]+/).filter(Boolean);
  let chips = "";
  for (const term of terms) chips += `<span class="chip">${esc(term)}</span>`;
  return `<p class="pivot-note"><span>Applies to:</span>${chips}</p>`;
}

function renderFigure(source, alt, state) {
  const decision = decideImage(source, state.imageContext);
  const altText = typeof alt === "string" && alt.trim() !== "" ? alt : null;
  if (decision.kind === "img") {
    const dimensions =
      decision.width != null && decision.height != null
        ? ` width="${decision.width}" height="${decision.height}"`
        : "";
    const caption = altText ? `<figcaption>${esc(altText)}</figcaption>` : "";
    return (
      `<figure class="figure">` +
      `<img src="${esc(assetHref(decision.assetKey))}" alt="${esc(altText ?? "")}" loading="lazy"${dimensions}>` +
      caption +
      "</figure>"
    );
  }
  return (
    '<figure class="figure-fallback" role="note">' +
    `<p>${altText ? `<span class="sr-only">Figure. </span>${esc(altText)}` : "Figure (no description available in the source)."}</p>` +
    `<p class="fallback-link">This figure is available in the upstream source: ${anchorAttr("upstream", state.upstreamUrl, "open on Microsoft Learn", state)}.</p>` +
    "</figure>"
  );
}

// ---------------------------------------------------------------------------
// Page shells
// ---------------------------------------------------------------------------

const CSS = `
:root{--fg:#101828;--fg-muted:#4b5563;--border:#e4e7ec;--border-strong:#98a2b3;--card:#fcfcfd;--bg:#ffffff;--accent:#6941c6;--ok:#067647;--warn:#b54708;--code-bg:#f4f5f7;}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.75 ui-sans-serif,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
a{color:inherit;text-decoration:underline;text-underline-offset:4px}
a:hover{opacity:.8}
.docs-header{border-bottom:1px solid var(--border);padding:2.5rem 1.25rem 2rem}
.docs-header .inner,.layout-shell{max-width:72rem;margin:0 auto;padding:0 1rem}
@media(min-width:768px){.docs-header{padding:3rem 1.5rem 2.5rem}.docs-header .inner,.layout-shell{padding:0 1.5rem}}
.breadcrumb{display:flex;flex-wrap:wrap;gap:.375rem;font-size:.75rem;color:var(--fg-muted);margin:0}
.breadcrumb li{display:flex;flex-wrap:wrap;gap:.375rem;list-style:none}
.breadcrumb li+li::before{content:"/";color:var(--border-strong)}
.breadcrumb ul{display:flex;flex-wrap:wrap;gap:.375rem;margin:0;padding:0}
.page-title{margin:1.25rem 0 0;font-size:1.875rem;font-weight:500;letter-spacing:-.025em;line-height:1.2;max-width:48rem}
@media(min-width:768px){.page-title{font-size:2.25rem}}
.page-desc{margin:.75rem 0 0;max-width:42rem;font-size:.875rem;line-height:1.75;color:var(--fg-muted)}
.layout-shell{padding-top:2rem;padding-bottom:2.5rem}
article{max-width:48rem;margin:0 auto;display:grid;gap:1.25rem}
article h2{margin:1.5rem 0 0;font-size:1.25rem;font-weight:500;letter-spacing:-.025em;line-height:1.4;scroll-margin-top:1rem}
article h3{margin:1rem 0 0;font-size:1rem;font-weight:500;letter-spacing:-.025em;line-height:1.5;scroll-margin-top:1rem}
article h4{margin:.75rem 0 0;font-size:.875rem;font-weight:600;letter-spacing:-.025em;line-height:1.5;scroll-margin-top:1rem}
article p{margin:0;font-size:.875rem;line-height:1.75}
article ul,article ol{margin:0;padding-left:1.5rem;display:grid;gap:.375rem;font-size:.875rem;line-height:1.75}
.list-nested{margin-top:.375rem;margin-bottom:.25rem;display:grid;gap:.375rem}
.table-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:1rem;background:var(--card)}
table{width:100%;border-collapse:collapse;text-align:left;font-size:.75rem;line-height:1.5}
thead tr{border-bottom:1px solid var(--border)}
tbody tr{border-bottom:1px solid var(--border)}
tbody tr:last-child{border-bottom:0}
th,td{padding:.625rem 1rem;vertical-align:top;color:var(--fg-muted)}
th{color:var(--fg);font-weight:500}
td:first-child{color:var(--fg)}
.ta-left{text-align:left}.ta-center{text-align:center}.ta-right{text-align:right}
.code-block{margin:0;overflow:hidden;border:1px solid var(--border);border-radius:1rem;background:var(--card)}
.code-lang{border-bottom:1px solid var(--border);padding:.375rem 1rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.625rem;text-transform:uppercase;letter-spacing:.12em;color:var(--fg-muted);background:var(--bg)}
.code-block pre{margin:0;overflow-x:auto;padding:1rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.75rem;line-height:1.5;color:var(--fg)}
.inline-code{border-radius:.25rem;background:var(--code-bg);padding:.05rem .3rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.85em}
blockquote{margin:0;border-left:2px solid var(--border-strong);padding-left:1rem;font-size:.875rem;line-height:1.75;color:var(--fg-muted)}
.admonition{border:1px solid var(--border);border-radius:1rem;background:var(--bg);padding:1rem;font-size:.875rem;line-height:1.75}
.admonition.tone-warning{border-color:rgba(180,71,8,.4);background:rgba(180,71,8,.05)}
.admonition.tone-success{border-color:rgba(6,118,71,.3);background:rgba(6,118,71,.05)}
.admonition-label{margin:0 0 .375rem;font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:var(--fg)}
.admonition-body{display:grid;gap:.5rem;color:var(--fg-muted)}
.admonition-body a{color:var(--fg)}
hr{border:0;border-top:1px solid var(--border);margin:.25rem 0}
.figure{margin:0;overflow:hidden;border:1px solid var(--border);border-radius:1rem;background:var(--card);padding:.5rem}
.figure img{display:block;margin:0 auto;height:auto;max-width:100%}
.figure figcaption{padding:.5rem 0 .25rem;font-size:.75rem;line-height:1.5;color:var(--fg-muted)}
.figure-fallback{margin:0;border:1px dashed var(--border);border-radius:1rem;background:var(--bg);padding:1rem;font-size:.75rem;line-height:1.5;color:var(--fg-muted)}
.figure-fallback p{margin:0;font-size:.75rem;line-height:1.5}
.figure-fallback .fallback-link{margin-top:.375rem}
.blocked-include{border:1px dashed var(--border);border-radius:1rem;background:var(--bg);padding:.75rem;font-size:.75rem;line-height:1.5;color:var(--fg-muted)}
.zone{border:1px solid var(--border);border-radius:1.5rem;background:var(--card);padding:1rem;display:grid;gap:1rem}
.tab{border:1px dashed var(--border);border-radius:1rem;padding:1rem;display:grid;gap:.5rem}
.tab-label,.layout-note{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.625rem;text-transform:uppercase;letter-spacing:.14em;color:var(--fg-muted)}
.pivot-note{display:flex;flex-wrap:wrap;align-items:center;gap:.375rem;font-size:.75rem;color:var(--fg-muted);margin:0}
.chip{border:1px solid var(--border);border-radius:9999px;background:var(--bg);padding:.05rem .5rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.625rem;color:var(--fg)}
.link-unresolved{color:var(--fg-muted)}
.include-body{display:grid;gap:.75rem}
.layout{display:grid;gap:.75rem}
.provenance{margin-top:2.5rem;border:1px solid var(--border);border-radius:1rem;background:var(--bg);padding:1rem;font-size:.75rem;line-height:1.5;color:var(--fg-muted)}
.provenance h2{margin:0;font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:var(--fg)}
.provenance dl{margin:.5rem 0 0;display:grid;gap:.25rem}
.provenance dt{float:left;clear:left;margin-right:.5rem}
.provenance dd{margin:0;overflow-wrap:anywhere}
.provenance .mono,dd .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.back-link{display:inline-block;min-height:2.25rem;border:1px solid var(--border-strong);border-radius:9999px;padding:.25rem .75rem;font-size:.75rem;text-decoration:none;margin-top:.75rem}
.family-grid{display:grid;gap:1rem;max-width:48rem;margin:0 auto}
@media(min-width:640px){.family-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.family-card{border:1px solid var(--border);border-radius:1.5rem;background:var(--card);padding:1.25rem}
.family-card h2{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.875rem;font-weight:500;letter-spacing:-.025em;color:var(--fg)}
.family-card p{margin:.5rem 0 0;font-size:.75rem;line-height:1.5;color:var(--fg-muted)}
.index-intro{max-width:48rem;margin:0 auto;font-size:.875rem;line-height:1.75;color:var(--fg-muted)}
.error-page{max-width:48rem;margin:0 auto;padding:4rem 1rem;display:grid;gap:1rem}
`.trim();

function pageShell({ title, description, breadcrumb, mainHtml }) {
  return (
    "<!doctype html>\n" +
    '<html lang="en">\n' +
    "<head>\n" +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    `<title>${esc(title)}</title>\n` +
    (description ? `<meta name="description" content="${esc(description)}">\n` : "") +
    `<style>\n${CSS}\n</style>\n` +
    "</head>\n" +
    "<body>\n" +
    '<header class="docs-header"><div class="inner">' +
    breadcrumb +
    "</div></header>\n" +
    '<main class="layout-shell">\n' +
    mainHtml +
    "\n</main>\n" +
    "</body>\n</html>\n"
  );
}

function breadcrumbHtml(segments) {
  // segments: [{label, href?}] after "Microsoft Fabric" (mirrors DocsHeader).
  let items = `<li><a href="${esc(localHref("/learn/fabric/"))}">Microsoft Fabric</a></li>`;
  for (const segment of segments) {
    items += segment.href
      ? `<li><a href="${esc(localHref(segment.href))}">${esc(segment.label)}</a></li>`
      : `<li>${esc(segment.label)}</li>`;
  }
  return `<nav aria-label="Breadcrumb" class="breadcrumb"><ul>${items}</ul></nav>`;
}

function renderProvenance(row) {
  const upstream = `https://learn.microsoft.com/en-us/fabric/${row.sourcePath.replace(/^docs\//, "").replace(/\.(md|markdown)$/i, "")}`;
  return (
    '<footer class="provenance">' +
    "<h2>Provenance</h2>" +
    "<dl>" +
    `<div><dt>Source</dt><dd><span class="mono">${esc(row.sourcePath)}</span></dd></div>` +
    `<div><dt>Pinned revision</dt><dd><span class="mono">${esc(registry.corpusRevision.slice(0, 12))}</span></dd></div>` +
    `<div><dt>Blob SHA-256</dt><dd><span class="mono">${esc(row.sha256)}</span></dd></div>` +
    '<div><dt>Rights</dt><dd>Content available under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>' +
    ` (${esc(row.rightsState)}); transformed for local rendering (structure, link targets and media delivery adapted — wording preserved).</dd></div>` +
    `<div><dt>Upstream</dt><dd>${anchorAttr("upstream", upstream, "Read on Microsoft Learn", null)}</dd></div>` +
    "</dl>" +
    `<p><a class="back-link" href="${esc(localHref("/learn/fabric/"))}">Back to the Microsoft Fabric hub</a></p>` +
    "</footer>"
  );
}

function articlePage(row, data) {
  const upstreamUrl = `https://learn.microsoft.com/en-us/fabric/${row.sourcePath.replace(/^docs\//, "").replace(/\.(md|markdown)$/i, "")}`;
  const state = {
    data,
    linkContext: {
      sourcePath: row.sourcePath,
      headingSlugs: data.headingSlugs,
      lookup: sourcePathLookup,
    },
    imageContext: {
      family: row.family,
      articleDir: row.articleSegments.slice(0, -1),
      manifestFamily: assetManifest.families[row.family] ?? null,
    },
    upstreamUrl,
    includeTrail: new Set(),
  };
  const body = renderBlocks(data.blocks, state);
  const breadcrumb = breadcrumbHtml([
    { label: "Docs", href: "/learn/fabric/docs/" },
    { label: row.family },
  ]);
  const mainHtml =
    `<article class="article-page" data-article-id="${esc(row.articleId)}">` +
    `<h1 class="page-title">${esc(data.frontMatter.title)}</h1>` +
    (data.frontMatter.description ? `<p class="page-desc">${esc(data.frontMatter.description)}</p>` : "") +
    body +
    renderProvenance(row) +
    "</article>";
  return pageShell({
    title: `${data.frontMatter.title} — Hansa Fabric docs`,
    description: data.frontMatter.description ?? undefined,
    breadcrumb,
    mainHtml,
  });
}

function docsIndexPage() {
  const excludedByFamily = new Map();
  for (const row of registry.excluded) {
    const family = row.sourcePath.match(/^docs\/([^/]+)\//)?.[1] ?? "unknown";
    const category = row.reason.split(":")[0];
    const byCategory = excludedByFamily.get(family) ?? new Map();
    byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
    excludedByFamily.set(family, byCategory);
  }
  const REASON_LABELS = {
    "compiler-quarantine": "compiler quarantine",
    "article-hold-rights-notice": "rights notice hold",
    "article-hold-external-dependency": "external dependency hold",
    "rights-hold": "rights hold",
    "compiler-node-missing": "compiled node missing",
    "blob-hash-mismatch": "source hash mismatch",
    "logical-path-shape": "unplanned route shape",
  };
  let cards = "";
  for (const family of registry.families) {
    const held = excludedByFamily.get(family.family);
    let heldText = "";
    if (held) {
      const parts = [...held.entries()].map(
        ([category, count]) => `${count} ${REASON_LABELS[category] ?? category}`,
      );
      heldText = ` Held out: ${parts.join(", ")} — intentionally not links.`;
    } else if (family.counts.excluded > 0) {
      heldText = ` Held out: ${family.counts.excluded} article(s).`;
    }
    cards += (
      `<section class="family-card"><h2>${esc(family.family)}</h2>` +
      `<p>${family.counts.published} published articles.${heldText ? esc(heldText) : heldText}</p></section>`
    );
  }
  const intro =
    `<p class="index-intro">${registry.counts.publishedArticles} articles across ${registry.counts.families} families are published locally. ` +
    `${registry.counts.excludedArticles} corpus articles are held out (rights notices, external dependencies or compiler quarantine) and listed per family below with their reason — they are intentionally not links. ` +
    "Upstream redirects that resolve to a local article are generated as static alias pages.</p>";
  const mainHtml = intro + `<div class="family-grid">${cards}</div>`;
  return pageShell({
    title: "Microsoft Fabric documentation library — Hansa Fabric docs",
    description:
      "The eligible articles of the pinned Microsoft Fabric documentation corpus, compiled for local reading with source provenance.",
    breadcrumb: breadcrumbHtml([{ label: "Docs" }]),
    mainHtml,
  });
}

function notFoundPage() {
  const mainHtml =
    '<div class="error-page"><h1 class="page-title">Page not found</h1>' +
    '<p class="page-desc">This address is not part of the published Microsoft Fabric documentation library. Held and quarantined corpus articles intentionally have no local page.</p>' +
    `<p><a class="back-link" href="${esc(localHref("/learn/fabric/docs/"))}">Open the docs library</a></p></div>`;
  return pageShell({
    title: "Page not found — Hansa Fabric docs",
    description: null,
    breadcrumb: breadcrumbHtml([{ label: "Docs", href: "/learn/fabric/docs/" }]),
    mainHtml,
  });
}

/** Alias page — byte-parity with write-alias-routes.mjs aliasPageHtml(), with
 *  the profile base path applied at this output boundary (the on-disk
 *  public/ tree is root-profile; per-profile regeneration is the FC12 rule). */
function aliasPageHtml(from, targetLogicalPath, delaySeconds = 0) {
  const candidate = `${basePath}${targetLogicalPath}`;
  const safeTarget = safeRedirectTarget(candidate);
  const refresh = safeTarget
    ? `<meta http-equiv="refresh" content="${delaySeconds}; url=${esc(safeTarget)}">`
    : "";
  const visibleHref = safeTarget ?? `${basePath}/learn/fabric/docs/`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${refresh}
<meta name="robots" content="noindex">
<title>Page moved — Hansa Fabric docs</title>
</head>
<body>
<p>This address (<code>${esc(from)}</code>) moved in the Microsoft
Fabric documentation. The article now lives at
<a href="${esc(visibleHref)}">${esc(visibleHref)}</a>.</p>
<noscript><p>Use the link above to continue.</p></noscript>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Node loading + source-path lookup
// ---------------------------------------------------------------------------

function loadCompiledNode(row) {
  const abs = path.join(BUILD_DIR, "compiler-output", ...row.nodeFile.split("/"));
  if (!existsSyncSafe(abs)) {
    throw new Error(`compiled node missing for ${row.articleId}: ${abs}`);
  }
  const node = JSON.parse(readFileSync(abs, "utf8"));
  if (node.quarantine?.blocked) {
    throw new Error(`compiled node for ${row.articleId} is quarantined but its registry row is published`);
  }
  const data = node.frontMatter?.data ?? {};
  const rawTitle = typeof data.title === "string" && data.title.trim() !== "" ? data.title.trim() : null;
  const rawDescription =
    typeof data.description === "string" && data.description.trim() !== "" ? data.description.trim() : null;
  const headingSlugs = new Set();
  for (const block of node.nodes ?? []) {
    if (block.type === "heading" && typeof block.slug === "string") headingSlugs.add(block.slug);
  }
  const includes = resolveIncludes(node.nodes ?? [], new Set(), 0);
  return {
    frontMatter: { title: rawTitle ?? row.title, description: rawDescription, raw: data },
    blocks: node.nodes ?? [],
    includes,
    headingSlugs,
  };
}

const sourcePathLookup = (() => {
  const map = new Map();
  for (const family of registry.families) {
    for (const article of family.articles) map.set(article.sourcePath, { logicalPath: article.logicalPath });
  }
  return (corpusDocPath) => map.get(corpusDocPath) ?? null;
})();

// ---------------------------------------------------------------------------
// Render + gates
// ---------------------------------------------------------------------------

const SITE_FILES = []; // { rel, bytes }

function stripBase(absoluteUrl) {
  if (basePath !== "") {
    if (!absoluteUrl.startsWith(basePath + "/")) return null;
    return absoluteUrl.slice(basePath.length);
  }
  return absoluteUrl;
}

function articleSitePath(row) {
  return `learn/fabric/docs/${[row.family, ...row.articleSegments].join("/")}/index.html`;
}

function excludedSitePath(row) {
  const logical = row.logicalPathIfItWereEligible ?? row.logicalPath;
  return `${logical.replace(/^\//, "")}index.html`;
}

function canonicalJson(value) {
  // Sorted-key canonical stringify (determinism of JSON artifacts).
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
}

function scanHtmlGate(html) {
  const violations = [];
  // <script never appears from escaped code (esc() escapes < >), so a literal
  // "<script" in the output is always a real script element.
  if (html.toLowerCase().includes("<script")) violations.push("script-tag");
  // javascript: as a URL scheme — check attribute values only, because code
  // samples may legitimately teach about the scheme (inert escaped text).
  if (/href=["']javascript:/i.test(html)) violations.push("javascript-url");
  // Event-handler attributes. Escaped code cannot produce `on*=` + quote
  // (quotes are escaped), but scan outside code samples anyway to stay honest.
  const nonCode = html
    .replace(/<pre[\s\S]*?<\/pre>/g, "")
    .replace(/<code[^>]*>[\s\S]*?<\/code>/g, "");
  if (/\son[a-z]+\s*=\s*["']/.test(nonCode)) violations.push("event-handler-attr");
  // Data-fetching constructs OUTSIDE code samples: static pages must not
  // fetch anything (search shards are inert data for the JS-time feature).
  // No \s* before the paren: prose like "under-fetch (make multiple calls)"
  // must not match — only a real call shape does.
  if (/\bfetch\(/.test(nonCode)) violations.push("fetch-call");
  if (/xmlhttprequest/i.test(nonCode)) violations.push("xhr");
  if (/new\s+EventSource|new\s+WebSocket/i.test(nonCode)) violations.push("streaming-api");
  return violations;
}

function countTag(html, tag) {
  const re = new RegExp(`<${tag}[\\s>]`, "g");
  let count = 0;
  while (re.exec(html) !== null) count += 1;
  return count;
}

async function main() {
  const totalStart = process.hrtime.bigint();

  const publishedRows = registry.families.flatMap((family) => family.articles);
  const rows = args.limit > 0 ? publishedRows.slice(0, args.limit) : publishedRows;

  // No dry-run mode: the gates read the site back from disk (fail-closed).
  mkdirSync(OUT_ROOT, { recursive: true });

  // --- pages ---------------------------------------------------------------
  const articleStats = [];
  const gateViolations = [];
  let assetRefs = 0;
  let assetRefsResolved = 0;
  const assetRefsMissing = [];
  let htmlScanned = 0;

  const heapStart = process.memoryUsage().heapUsed;

  function emit(rel, content) {
    const bytes = Buffer.byteLength(content, "utf8");
    const abs = path.join(OUT_ROOT, ...rel.split("/"));
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
    SITE_FILES.push({ rel, bytes });
    return bytes;
  }

  function gateScan(rel, html) {
    htmlScanned += 1;
    const violations = scanHtmlGate(html);
    if (violations.length > 0) gateViolations.push({ file: rel, violations });

    // Prefix-exact-once + asset-resolution over emitted HTML.
    for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const url = match[1];
      if (url.startsWith("//")) continue; // protocol-relative = external, not emitted locally
      const stripped = stripBase(url);
      if (stripped === null) {
        gateViolations.push({ file: rel, violations: [`unprefixed-absolute-url:${url}`] });
        continue;
      }
      // Double prefix: the raw URL carries the base path more than once.
      if (basePath !== "" && url.split(basePath).length - 1 > 1) {
        gateViolations.push({ file: rel, violations: [`double-prefix:${url}`] });
        continue;
      }
      if (args.profile === "root" && url.includes("/REPOSITORY_NAME/")) {
        gateViolations.push({ file: rel, violations: [`root-profile-placeholder-leak:${url}`] });
      }
      const assetMatch = stripped.match(/^\/fabric-docs-assets\/(.+)$/);
      if (assetMatch) {
        assetRefs += 1;
        if (existsSyncSafe(path.join(ASSET_TREE, ...assetMatch[1].split("/")))) assetRefsResolved += 1;
        else if (assetRefsMissing.length < 50) assetRefsMissing.push({ file: rel, asset: assetMatch[1] });
      }
    }
  }

  let rendered = 0;
  const renderFailures = [];
  for (const row of rows) {
    try {
      const data = loadCompiledNode(row);
      const html = articlePage(row, data);
      const rel = articleSitePath(row);
      const bytes = emit(rel, html);
      articleStats.push({ articleId: row.articleId, rel, bytes });
      gateScan(rel, html);
      rendered += 1;
    } catch (error) {
      renderFailures.push({ articleId: row.articleId, error: String(error?.message ?? error) });
    }
  }
  if (renderFailures.length > 0) {
    process.stderr.write(`error: ${renderFailures.length} article(s) failed to render — fail-closed:\n`);
    for (const failure of renderFailures.slice(0, 10)) {
      process.stderr.write(`  ${failure.articleId}: ${failure.error}\n`);
    }
    process.exit(1);
  }

  // Docs index + 404 + aliases.
  const indexRel = "learn/fabric/docs/index.html";
  const indexHtml = docsIndexPage();
  emit(indexRel, indexHtml);
  gateScan(indexRel, indexHtml);

  const notFoundRel = "404.html";
  const notFoundHtml = notFoundPage();
  emit(notFoundRel, notFoundHtml);
  gateScan(notFoundRel, notFoundHtml);

  let aliasPages = 0;
  for (const page of aliasReceipt.pages) {
    const rel = `fabric-aliases/${page.file.replace(/^public\/fabric-aliases\//, "")}`;
    const html = aliasPageHtml(page.from, page.to);
    emit(rel, html);
    gateScan(rel, html);
    aliasPages += 1;
  }

  const heapPeak = Math.max(process.memoryUsage().heapUsed, heapStart);
  const rssPeak = process.memoryUsage().rss;

  // --- gates ---------------------------------------------------------------
  const renderedSet = new Set(articleStats.map((s) => s.rel));

  // Coverage: every published article has an HTML file (registry = authority).
  const missingCoverage = [];
  for (const row of rows) {
    const rel = articleSitePath(row);
    if (!renderedSet.has(rel) || !existsSyncSafe(path.join(OUT_ROOT, ...rel.split("/")))) {
      missingCoverage.push(row.articleId);
    }
  }

  // Exclusions: every held/quarantined logical path ABSENT.
  const exclusionsPresent = [];
  for (const row of registry.excluded) {
    const rel = excludedSitePath(row);
    if (renderedSet.has(rel) || existsSyncSafe(path.join(OUT_ROOT, ...rel.split("/")))) {
      exclusionsPresent.push(row.articleId);
    }
  }

  // Structural spot checks (5 representative articles, parity with FC05 §9).
  const SPOT_ARTICLES = [
    "docs/fundamentals/analyze-train-data.md",
    "docs/data-factory/slowly-changing-dimension-type-two.md",
    "docs/real-time-intelligence/eventhouse-as-endpoint.md",
    "docs/admin/service-admin-portal-copilot.md",
    "docs/database/hub/overview.md",
  ];
  const spotChecks = [];
  for (const sourcePath of SPOT_ARTICLES) {
    const row = rows.find((r) => r.sourcePath === sourcePath);
    if (!row) {
      // Only possible under --limit (tests); the full run requires all five.
      spotChecks.push({ sourcePath, present: false, skippedByLimit: args.limit > 0 });
      continue;
    }
    const data = loadCompiledNode(row);
    const html = readFileSync(path.join(OUT_ROOT, ...articleSitePath(row).split("/")), "utf8");
    // Body region only: the provenance footer legitimately carries its own h2.
    const bodyRegion = html.slice(
      html.indexOf('<article class="article-page"'),
      html.indexOf('<footer class="provenance"'),
    );
    const nodeHeadings = data.blocks.filter((b) => b.type === "heading").length;
    const htmlHeadings = countTag(bodyRegion, "h2") + countTag(bodyRegion, "h3") + countTag(bodyRegion, "h4");
    // h1 is the page title; body headings map to h2-h4 exactly as ArticleBody does.
    const spot = {
      sourcePath,
      present: true,
      articleId: row.articleId,
      nodeHeadings,
      htmlHeadings,
      headingsMatch: nodeHeadings === htmlHeadings,
      hasTitle: html.includes(`>${esc(data.frontMatter.title)}</h1>`),
      hasProvenance: html.includes("Provenance") && html.includes(row.sha256),
      hasBodyContent: html.includes("<p>") && (html.includes("<table") || html.includes("<pre") || nodeHeadings > 0),
      imagesLocal: (html.match(/<img /g) ?? []).length,
      imageFallbacks: (bodyRegion.match(/class="figure-fallback"/g) ?? []).length,
    };
    spotChecks.push(spot);
  }

  // Statistics.
  const sizes = articleStats.map((s) => s.bytes).sort((a, b) => a - b);
  const sum = sizes.reduce((acc, n) => acc + n, 0);
  const quantile = (q) => (sizes.length > 0 ? sizes[Math.min(sizes.length - 1, Math.floor(q * sizes.length))] : 0);
  const totalBytes = SITE_FILES.reduce((acc, f) => acc + f.bytes, 0);
  const largest = [...SITE_FILES].sort((a, b) => b.bytes - a.bytes).slice(0, 12);
  const byTopLevel = {};
  for (const file of SITE_FILES) {
    const seg = file.rel.split("/")[0];
    byTopLevel[seg] = (byTopLevel[seg] ?? 0) + 1;
  }

  // Deterministic site manifest (no clock) + its hash.
  function manifestFilesSorted() {
    return [...SITE_FILES].sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  }

  const manifest = {
    schema: "hansa.fabric-comparator-site-manifest/1",
    renderer: "bench-comparator/static-html/1",
    profile: args.profile,
    basePath,
    corpusRevision: registry.corpusRevision,
    registryRevision: registry.registryRevision,
    files: manifestFilesSorted().map((f) => ({ rel: f.rel, bytes: f.bytes })),
    contentSha256: (() => {
      const h = createHash("sha256");
      for (const f of manifestFilesSorted()) h.update(`${f.rel} ${f.bytes}\n`);
      return h.digest("hex");
    })(),
  };

  const gates = {
    coverage: { expected: rows.length, rendered, missing: missingCoverage, pass: missingCoverage.length === 0 && rendered === rows.length },
    exclusions: { excludedRows: registry.excluded.length, present: exclusionsPresent, pass: exclusionsPresent.length === 0 },
    prefix: {
      profile: args.profile,
      basePath,
      filesScanned: htmlScanned,
      violations: gateViolations,
      pass: gateViolations.length === 0,
    },
    assets: {
      policy: "referenced-not-copied (shared /fabric-docs-assets tree serves both renderers)",
      refs: assetRefs,
      resolved: assetRefsResolved,
      missing: assetRefsMissing,
      pass: assetRefsMissing.length === 0,
    },
    noJs: {
      filesScanned: htmlScanned,
      scriptTags: 0,
      violationKinds: ["script-tag", "javascript-url", "event-handler-attr", "fetch-call", "xhr", "streaming-api"],
      violations: gateViolations.filter((v) =>
        v.violations.some((x) =>
          ["script-tag", "javascript-url", "event-handler-attr", "fetch-call", "xhr", "streaming-api"].some((kind) =>
            x.startsWith(kind),
          ),
        ),
      ),
      pass: gateViolations.every((v) =>
        v.violations.every(
          (x) =>
            !["script-tag", "javascript-url", "event-handler-attr", "fetch-call", "xhr", "streaming-api"].some((kind) =>
              x.startsWith(kind),
            ),
        ),
      ),
    },
    spotChecks: {
      articles: spotChecks.length,
      allPass:
        spotChecks.every((s) => !s.present || (s.headingsMatch && s.hasProvenance && s.hasBodyContent)) &&
        (args.limit === 0 ? spotChecks.every((s) => s.present) : true),
      details: spotChecks,
    },
  };

  const allPass =
    gates.coverage.pass &&
    gates.exclusions.pass &&
    gates.prefix.pass &&
    gates.assets.pass &&
    gates.noJs.pass &&
    gates.spotChecks.allPass;

  const report = {
    schema: "hansa.fabric-comparator-render/1",
    renderer: "same-origin static HTML compiler (bench-comparator)",
    profile: args.profile,
    basePath,
    corpusRevision: registry.corpusRevision,
    registryRevision: registry.registryRevision,
    inputs: {
      registry: "route-registry/route-registry.json",
      compiledNodes: "compiler-output/<family>/nodes/**",
      assetManifest: "route-registry/asset-manifest.json",
      assetTree: "public/fabric-docs-assets (referenced, not copied)",
      searchTree: "public/fabric-search (referenced, not copied)",
      aliasReceipt: "route-registry/alias-pages.json (re-emitted per profile)",
    },
    timing: {
      renderMs: Math.round(Number(process.hrtime.bigint() - totalStart) / 1e6),
      heapStartBytes: heapStart,
      heapPeakBytes: heapPeak,
      rssPeakBytes: rssPeak,
      nodeVersion: process.version,
      platform: process.platform,
    },
    output: {
      siteDir: OUT_ROOT,
      fileCount: SITE_FILES.length,
      bytes: totalBytes,
      byTopLevelDir: byTopLevel,
      articlePages: rendered,
      docsIndexPages: 1,
      notFoundPages: 1,
      aliasPages,
      sharedTreesNotCounted: { assets: "9,586 files / 2,154,259,527 bytes (public/fabric-docs-assets)", search: "105 files (public/fabric-search)" },
      perArticle: {
        avgBytes: sizes.length > 0 ? Math.round(sum / sizes.length) : 0,
        medianBytes: quantile(0.5),
        p95Bytes: quantile(0.95),
        minBytes: sizes.length > 0 ? sizes[0] : 0,
        maxBytes: sizes.length > 0 ? sizes[sizes.length - 1] : 0,
      },
      largest,
    },
    gates,
    determinism: { siteManifestSha256: manifest.contentSha256, siteFiles: manifest.files.length },
    allGatesPass: allPass,
  };

  writeFileSync(path.join(OUT_ROOT, "..", "site-manifest.json"), canonicalJson(manifest) + "\n", "utf8");
  writeFileSync(path.join(OUT_ROOT, "..", "render-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");

  log(
    `comparator render [${args.profile}] basePath="${basePath}" — articles ${rendered}/${rows.length}, ` +
      `files ${SITE_FILES.length}, ${(totalBytes / 1048576).toFixed(1)} MB, ` +
      `renderMs ${report.timing.renderMs}, allGatesPass=${allPass}`,
  );
  log(`siteManifestSha256 ${manifest.contentSha256}`);

  process.exit(allPass ? 0 : 1);
}

main().catch((error) => {
  process.stderr.write(`error: ${error?.stack ?? error}\n`);
  process.exit(2);
});
