// FC07 — deterministic full-text search-shard builder (Wave 2 + full corpus).
//
//   node tools/fabric-corpus/search/build-shards.mjs --families=fundamentals,onelake,data-factory,real-time-intelligence,admin
//   node tools/fabric-corpus/search/build-shards.mjs --families=all
//
// Inputs (read-only):
//   <build-dir>/route-registry/route-registry.json   published route registry
//   <build-dir>/compiler-output/<family>/nodes/**.json  typed compiler nodes
// where <build-dir> is FABRIC_CORPUS_BUILD_DIR (default <repo>/../fabric-corpus-build).
//
// Output (default <build-dir>/search-shards/<version>/):
//   manifest.json                     versioned shard manifest (compact)
//   routing-<sha8>.json               term→shard postings for bounded routing
//   shard-<sha8>.json                 section records for a bounded article group
//
// Contracts implemented (handover 03 §Search; RELEASE_AND_STORAGE.md):
//   * published registry articles ONLY — the 92 excluded articles never enter
//     shards, manifest, routing or dictionaries (hard-tested);
//   * content-derived version, content-hashed filenames, no clock in output;
//   * deterministic: two runs over the same inputs are byte-identical;
//   * shard files target ≤ ~250 KB by grouping articles (family, slug) order;
//   * text is decoded (entities), whitespace-normalised and markup-free;
//   * term routing over-approximates (never under-selects) so sharded search
//     recall equals whole-index recall (parity-gated in tests).
//
// No JSON `import` (fs reads), no npm dependencies, no git, no network.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeSearchText } from "../../../lib/search/query.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(here, "..", "..", "..");
const DEFAULT_BUILD_DIR = path.resolve(REPO_ROOT, "..", "fabric-corpus-build");

const SHARD_SCHEMA = "hansa.fabric-search-shard/1";
const MANIFEST_SCHEMA = "hansa.fabric-search-manifest/1";
const ROUTING_SCHEMA = "hansa.fabric-search-routing/1";
/** Target serialized size per shard file, in bytes (hard grouping budget).
 *  The comparison reserves a small margin for the per-shard envelope so the
 *  final file stays at or under the target. */
const SHARD_TARGET_BYTES = 250_000;
const SHARD_ENVELOPE_MARGIN = 4096;
/** Guard against a pathological single section dominating a shard (documented
 *  in the report; the Wave-2 max observed section is ~81 KB, never hit). */
const SECTION_TEXT_GUARD_CHARS = 100_000;
/** A token present in at least this share of shards becomes a routing
 *  wildcard (over-approximation: the client loads every shard for it). */
const WILDCARD_THRESHOLD = 0.7;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { families: null, out: null, buildDir: process.env.FABRIC_CORPUS_BUILD_DIR || DEFAULT_BUILD_DIR };
  for (const raw of argv) {
    const match = /^--([a-zA-Z-]+)=(.*)$/.exec(raw);
    if (!match) throw new Error(`build-shards: unsupported argument ${raw}`);
    const [, name, value] = match;
    if (name === "families") args.families = value === "all" ? "all" : value.split(",").map((f) => f.trim()).filter(Boolean);
    else if (name === "out") args.out = path.resolve(value);
    else if (name === "build-dir") args.buildDir = path.resolve(value);
    else throw new Error(`build-shards: unknown option --${name}`);
  }
  if (!args.families) throw new Error("build-shards: --families=<comma,list|all> is required");
  return args;
}

// ---------------------------------------------------------------------------
// Text extraction from compiler nodes (typed blocks → markup-free text)
// ---------------------------------------------------------------------------

/** Named HTML entities seen in the corpus, plus the numeric forms. */
const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…",
  mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  bull: "•", middot: "·", times: "×", deg: "°", plusmn: "±", sup2: "²",
  sup3: "³", trade: "™", reg: "®", copy: "©", laquo: "«", raquo: "»",
  shy: "", zwnj: "", zwj: "", lrm: "", rlm: "",
};

const ENTITY_RE = /&(#[xX]?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g;

function decodeEntities(value) {
  if (!value.includes("&")) return value;
  return value.replace(ENTITY_RE, (entity, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return " ";
      const replacement = String.fromCodePoint(code);
      return /[\t\n\r\f\v]/.test(replacement) ? " " : replacement;
    }
    const named = NAMED_ENTITIES[body];
    return named === undefined ? entity : named;
  });
}

function normalizeWhitespace(value) {
  return value.replace(/[\t\n\r\f\v ]+/g, " ").trim();
}

/** Flatten inline nodes (text/inlineCode/emphasis/link/softbreak/image/include). */
function inlineToText(inlines, ctx) {
  let out = "";
  const stack = [...(inlines ?? [])];
  while (stack.length > 0) {
    const node = stack.shift();
    if (!node || typeof node !== "object") continue;
    switch (node.type) {
      case "text":
        out += typeof node.value === "string" ? node.value : "";
        break;
      case "inlineCode":
        out += typeof node.value === "string" ? node.value : "";
        break;
      case "softbreak":
        out += " ";
        break;
      case "inlineHtml":
        // Raw markup — never emitted into search text.
        break;
      case "emphasis":
      case "link":
        stack.unshift(...(node.children ?? []));
        break;
      case "image": {
        const alt = node.attributes?.["alt-text"];
        if (typeof alt === "string") out += ` ${alt} `;
        break;
      }
      case "include": {
        // Resolved include: the fragment's own blocks inline into the section.
        out += includeToText(node, ctx);
        break;
      }
      default:
        if (Array.isArray(node.children)) stack.unshift(...node.children);
        break;
    }
  }
  return out;
}

/** Resolved include fragment → text (cached per build; skipped when unresolved). */
function includeToText(node, ctx) {
  const resolved = typeof node.resolved === "string" ? node.resolved : null;
  if (!resolved || node.exists === false || node.blocked === true) {
    ctx.stats.unresolvedIncludes += 1;
    return "";
  }
  // resolved "includes/product-name.md" → includes/nodes/includes/product-name.json
  const relative = resolved.replace(/^docs\//, "").replace(/\.md$/i, ".json");
  const nodeFile = path.join(ctx.compilerOutput, relative.split("/")[0], "nodes", relative);
  let fragment = ctx.includeCache.get(nodeFile);
  if (fragment === undefined) {
    fragment = existsSync(nodeFile) ? JSON.parse(readFileSync(nodeFile, "utf8")) : null;
    if (fragment === null) ctx.stats.missingIncludeNodes += 1;
    ctx.includeCache.set(nodeFile, fragment);
  }
  if (!fragment) return "";
  return blocksToText(fragment.nodes ?? [], ctx);
}

/** Block-level text (paragraphs, lists, tables, code, admonitions, constructs). */
function blocksToText(blocks, ctx) {
  let out = "";
  for (const block of blocks ?? []) {
    if (!block || typeof block !== "object") continue;
    switch (block.type) {
      case "heading":
        out += ` ${typeof block.text === "string" ? block.text : ""} `;
        break;
      case "paragraph":
        out += ` ${inlineToText(block.inline, ctx)} `;
        break;
      case "admonition":
      case "blockquote":
        out += ` ${blocksToText(block.children, ctx)} `;
        break;
      case "list":
        for (const item of block.items ?? []) {
          out += ` ${inlineToText(item.inline, ctx)} ${blocksToText(item.children, ctx)} `;
        }
        break;
      case "table":
        for (const cell of (block.header ?? []).concat(...(block.rows ?? []))) {
          out += ` ${inlineToText(cell.inline, ctx)} `;
        }
        break;
      case "code":
        out += ` ${typeof block.value === "string" ? block.value : ""} `;
        break;
      case "learnConstruct": {
        const alt = block.attributes?.["alt-text"];
        if (typeof alt === "string") out += ` ${alt} `;
        if (Array.isArray(block.children)) out += ` ${blocksToText(block.children, ctx)} `;
        if (Array.isArray(block.items)) {
          for (const item of block.items ?? []) {
            out += ` ${inlineToText(item.inline, ctx)} ${blocksToText(item.children, ctx)} `;
          }
        }
        break;
      }
      case "unsupported":
      case "htmlComment":
      case "commentedDirective":
      case "thematicBreak":
      default:
        // Raw snippets and non-text blocks never enter search text.
        break;
    }
  }
  return out;
}

/**
 * One article's compiler node → section records.
 * kind: 'intro' (before the first heading; carries the front-matter
 * description) | 'section' (one heading plus its following blocks).
 */
function articleSections(node, article, ctx) {
  const sections = [];
  const description = typeof article.description === "string" ? article.description : "";
  if (normalizeWhitespace(description)) {
    sections.push({ heading: article.title, anchor: "", text: normalizeWhitespace(description), kind: "intro" });
  }
  let current = sections[0] ?? null;
  for (const block of node.nodes ?? []) {
    if (!block || typeof block !== "object") continue;
    if (block.type === "heading") {
      const heading = normalizeWhitespace(decodeEntities(typeof block.text === "string" ? block.text : ""));
      current = { heading, anchor: typeof block.slug === "string" ? block.slug : "", text: "", kind: "section" };
      sections.push(current);
      continue;
    }
    const chunk = decodeEntities(blocksToText([block], ctx));
    if (!chunk.trim()) continue;
    if (!current) {
      current = { heading: article.title, anchor: "", text: "", kind: "intro" };
      sections.push(current);
    }
    current.text = `${current.text} ${chunk}`.trim();
  }
  const cleaned = [];
  for (const section of sections) {
    const text = normalizeWhitespace(decodeEntities(section.text ?? ""));
    if (text.length > SECTION_TEXT_GUARD_CHARS) {
      ctx.stats.sectionsGuardCapped += 1;
      section.text = text.slice(0, SECTION_TEXT_GUARD_CHARS).trimEnd();
    } else {
      section.text = text;
    }
    if (section.text || section.heading) cleaned.push(section);
  }
  return cleaned;
}

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Canonical JSON: insertion order is construction order; callers sort keys. */
function sortedEntries(map) {
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function buildShards(options) {
  const args = parseArgs(options.argv ?? process.argv.slice(2));
  const registryPath = path.join(args.buildDir, "route-registry", "route-registry.json");
  if (!existsSync(registryPath)) {
    throw new Error(`build-shards: route registry missing at ${registryPath} (RELEASE_AND_STORAGE.md build-dir contract: fail closed)`);
  }
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  if (registry.schema !== "hansa.fabric-route-registry/1") {
    throw new Error(`build-shards: unexpected registry schema ${registry.schema}`);
  }

  const allFamilies = registry.families.map((family) => family.family).sort();
  const selected = args.families === "all"
    ? allFamilies
    : [...new Set(args.families)].filter((family) => {
        if (!allFamilies.includes(family)) {
          throw new Error(`build-shards: unknown family "${family}" (registry has: ${allFamilies.join(", ")})`);
        }
        return true;
      });
  if (selected.length === 0) throw new Error("build-shards: --families selected nothing");

  const compilerOutput = path.join(args.buildDir, "compiler-output");
  const ctx = {
    compilerOutput,
    includeCache: new Map(),
    stats: { unresolvedIncludes: 0, missingIncludeNodes: 0, sectionsGuardCapped: 0, articlesMissingNode: 0 },
  };

  // Articles in deterministic order: family (alphabetical), then slug.
  const articles = [];
  const articleIds = new Set();
  for (const familyEntry of registry.families) {
    if (!selected.includes(familyEntry.family)) continue;
    const sorted = [...familyEntry.articles].sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
    for (const article of sorted) {
      if (article.published !== true || articleIds.has(article.articleId)) {
        throw new Error(`build-shards: invalid or duplicate published article ${article.articleId}`);
      }
      articleIds.add(article.articleId);
      articles.push(article);
    }
  }

  // Extract section records.
  const records = [];
  for (const article of articles) {
    const nodeFile = path.join(compilerOutput, article.nodeFile);
    if (!existsSync(nodeFile)) {
      // Fail closed: a published article without compiled output is a build
      // error, never a silently shrunken index (RELEASE_AND_STORAGE.md).
      ctx.stats.articlesMissingNode += 1;
      throw new Error(`build-shards: compiled node missing for published article ${article.articleId} (${article.nodeFile})`);
    }
    const node = JSON.parse(readFileSync(nodeFile, "utf8"));
    if (node.source?.sha256 !== article.sha256 || node.quarantine?.blocked !== false) {
      throw new Error(`build-shards: compiled node is stale or quarantined for published article ${article.articleId}`);
    }
    const sections = articleSections(node, article, ctx);
    // Doc-level terms: the alias signal (title, description, slug words and
    // every heading). Markup-free; the client tokenises with the shared
    // normalisation rules.
    const headingsText = sections
      .filter((section) => section.kind === "section")
      .map((section) => section.heading)
      .join(" ");
    const terms = normalizeWhitespace(
      decodeEntities(
        [
          article.title,
          article.description ?? "",
          typeof article.slug === "string" ? article.slug.replace(/[-_]+/g, " ") : "",
          Array.isArray(article.articleSegments) ? article.articleSegments.join(" ").replace(/[-_]+/g, " ") : "",
          headingsText,
        ].join(" "),
      ),
    );
    records.push({
      articleId: article.articleId,
      logicalPath: article.logicalPath,
      title: article.title,
      family: article.family,
      terms,
      sections,
    });
  }

  // Group into shards ≤ SHARD_TARGET_BYTES (articles stay whole; the largest
  // single article in the Wave-2 corpus is ~145 KB serialized, so one-article
  // shards keep the budget).
  const groups = [];
  let currentGroup = [];
  let currentBytes = 0;
  for (const record of records) {
    const bytes = Buffer.byteLength(JSON.stringify(record), "utf8") + 24;
    if (currentGroup.length > 0 && currentBytes + bytes > SHARD_TARGET_BYTES - SHARD_ENVELOPE_MARGIN) {
      groups.push(currentGroup);
      currentGroup = [];
      currentBytes = 0;
    }
    currentGroup.push(record);
    currentBytes += bytes;
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  // Shard bodies: content-hashed, envelope carries the version.
  const shardIds = [];
  const groupBodies = groups.map((group) => {
    const body = JSON.stringify(group);
    const hash = sha256Hex(body).slice(0, 8);
    shardIds.push(`shard-${hash}`);
    return { group, hash, body };
  });

  // Routing: term → shard postings over ALL shard tokens (title, headings,
  // body, terms). Over-approximates by design: ultra-common tokens become
  // wildcardTokens instead of long postings lists.
  const postings = new Map();
  const shardTokenSets = groupBodies.map(({ group }) => {
    const tokens = new Set();
    for (const article of group) {
      const text = [
        article.title,
        article.terms,
        ...article.sections.map((section) => `${section.heading} ${section.text}`),
      ].join(" ");
      const key = normalizeSearchText(text);
      for (const token of key.split(" ")) {
        if (token) tokens.add(token);
      }
    }
    return tokens;
  });
  for (let index = 0; index < shardTokenSets.length; index += 1) {
    for (const token of shardTokenSets[index]) {
      let list = postings.get(token);
      if (!list) postings.set(token, (list = []));
      list.push(index);
    }
  }
  const wildcardLimit = Math.floor(shardTokenSets.length * WILDCARD_THRESHOLD);
  const wildcardTokens = [];
  const routingTokens = Object.create(null);
  for (const [token, list] of sortedEntries(postings)) {
    if (list.length >= Math.max(2, wildcardLimit)) {
      wildcardTokens.push(token);
    } else {
      routingTokens[token] = list;
    }
  }
  // The routing NAME hash covers the payload WITHOUT the version key (the
  // version envelope wraps it; sha8 is over the version-independent content).
  const routingHash = sha256Hex(
    JSON.stringify({
      schema: ROUTING_SCHEMA,
      wildcardThreshold: WILDCARD_THRESHOLD,
      wildcardTokens,
      tokens: routingTokens,
    }),
  ).slice(0, 8);

  // Include routing and shard order in the immutable version identity:
  // routing postings are ordinal indexes into the ordered shard list.
  const versionSource = JSON.stringify({
    corpusRevision: registry.corpusRevision,
    registryRevision: registry.registryRevision,
    families: selected.sort(),
    shardIds,
    routingHash,
  });
  const version = `v${sha256Hex(versionSource).slice(0, 16)}`;

  // Final files (envelopes carry the version; hashes cover the final bytes).
  const outDir = args.out ?? path.join(args.buildDir, "search-shards", version);
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const shardArticleCounts = groups.map((group) => group.length);
  const fileRecords = [];
  const written = [];
  groupBodies.forEach(({ group, hash }, index) => {
    const envelope = {
      schema: SHARD_SCHEMA,
      version,
      shardId: `shard-${hash}`,
      articles: group,
    };
    const name = `shard-${hash}.json`;
    const final = JSON.stringify(envelope);
    writeOut(path.join(outDir, name), final);
    written.push(name);
    fileRecords.push({ name, role: "shard", articleCount: shardArticleCounts[index] });
  });
  const routingName = `routing-${routingHash}.json`;
  const routingFinal = JSON.stringify({
    schema: ROUTING_SCHEMA,
    version,
    wildcardThreshold: WILDCARD_THRESHOLD,
    wildcardTokens,
    tokens: routingTokens,
  });
  writeOut(path.join(outDir, routingName), routingFinal);
  written.push(routingName);
  fileRecords.push({ name: routingName, role: "routing", articleCount: records.length });

  // Manifest lists sha256 + bytes of the FINAL bytes of every file.
  const manifestFiles = fileRecords.map((record) => {
    const abs = path.join(outDir, record.name);
    const content = readFileSync(abs, "utf8");
    return {
      name: record.name,
      role: record.role,
      sha256: sha256Hex(content),
      bytes: Buffer.byteLength(content, "utf8"),
      articleCount: record.articleCount,
    };
  });

  const manifest = {
    schema: MANIFEST_SCHEMA,
    version,
    versionBasis: "ordered-shards-routing",
    corpusRevision: registry.corpusRevision,
    registryRevision: registry.registryRevision,
    shardCount: shardIds.length,
    articleCount: records.length,
    families: selected.sort(),
    files: manifestFiles,
    // Counts the lead can reconcile against the registry (counts.publishedArticles
    // minus excluded articles in the selected families).
    generatedFrom: { registryRevision: registry.registryRevision, corpusRevision: registry.corpusRevision },
  };
  writeOut(path.join(outDir, "manifest.json"), JSON.stringify(manifest));
  written.push("manifest.json");

  const allFileBytes = manifestFiles.reduce((sum, file) => sum + file.bytes, 0);
  const shardBytes = manifestFiles.filter((f) => f.role === "shard").map((f) => f.bytes);
  const sectionCount = records.reduce((sum, record) => sum + record.sections.length, 0);

  return {
    version,
    outDir,
    written,
    stats: {
      articles: records.length,
      sections: sectionCount,
      shards: shardIds.length,
      routingTokens: Object.keys(routingTokens).length,
      wildcardTokens: wildcardTokens.length,
      totalBytes: allFileBytes,
      shardBytesMin: Math.min(...shardBytes),
      shardBytesMax: Math.max(...shardBytes),
      shardBytesAvg: Math.round(shardBytes.reduce((a, b) => a + b, 0) / shardBytes.length),
      ...ctx.stats,
    },
  };
}

function writeOut(absPath, content) {
  const bytes = Buffer.byteLength(content, "utf8");
  writeFileSync(absPath, content, "utf8");
  return bytes;
}

// ---------------------------------------------------------------------------

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirectRun) {
  const started = process.hrtime.bigint();
  const result = buildShards({ argv: process.argv.slice(2) });
  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  console.log(`PASS  shards built → ${result.outDir}`);
  console.log(`      version=${result.version} in ${ms.toFixed(0)} ms`);
  for (const [key, value] of Object.entries(result.stats)) console.log(`      ${key}: ${value}`);
}

export { buildShards, parseArgs, SHARD_TARGET_BYTES, WILDCARD_THRESHOLD };
