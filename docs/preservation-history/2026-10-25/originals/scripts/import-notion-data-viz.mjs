// Offline importer for the owner's locally exported Notion "Data Visualization"
// corpus. It never touches Notion: it reads a folder of exported .html files,
// normalises them into typed blocks, and writes sanitised JSON content that the
// static site imports at build time.
//
//   node scripts/import-notion-data-viz.mjs --source "Data Visualization"
//   node scripts/import-notion-data-viz.mjs --source "..." --dry-run
//
// Flags:
//   --source <dir>   export root (relative to the repo or absolute). Defaults to
//                    $DATA_VIZ_EXPORT or "Data Visualization".
//   --dry-run        parse + report, write nothing.
//   --check          fail if generated files are out of date (no writes).
//   --verbose        print the per-page crosswalk.
//
// The importer is idempotent: identical input bytes produce identical output.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const args = process.argv.slice(2);
function flag(name) {
  return args.includes(name);
}
function option(name, fallback) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
}

const SOURCE = path.resolve(ROOT, option("--source", process.env.DATA_VIZ_EXPORT ?? "Data Visualization"));
const DRY = flag("--dry-run");
const CHECK = flag("--check");
const VERBOSE = flag("--verbose");

const CONTENT_DIR = path.join(ROOT, "content", "data-viz");
const PUBLIC_FIGURES = path.join(ROOT, "public", "data-viz", "figures");
const DOCS_DIR = path.join(ROOT, "docs", "data-visualization");

// Stable, readable slugs keyed by Notion page id (32 hex, dashes stripped).
// Anything not listed gets a deterministic title-derived slug.
const SLUGS = {
  "3cd3906c5d6c8191959ef2ecc8c0ca59": "foundations",
  "3cd3906c5d6c816fb3e9d8809b4dbe8e": "core-chart-types",
  "3cd3906c5d6c815996b1ca4687c3808b": "advanced-multivariate",
  "3cd3906c5d6c81c19cadc4d11b657ffd": "color-perception",
  "3cd3906c5d6c819ab08ac1f7717dc4c2": "accessibility-color-qa",
  "3cd3906c5d6c81809fa1ea9a9146aea0": "visual-integrity",
  "3cd3906c5d6c81febadef001c3adffc8": "statistical-traps",
  "3cd3906c5d6c81219916c1029b5aecd5": "chart-selection",
  "3cd3906c5d6c81b793aaf1036705960f": "dashboard-design",
  "3cd3906c5d6c81b583dadccead758b3c": "power-bi-playbook",
  "3cd3906c5d6c81f49e4cc8ca53d6e812": "interview-bank",
  "3cd3906c5d6c813ea34dc5e5e4870d71": "quick-reference",
  "3e53906c5d6c81e588dee386862fecac": "visual-atlas",
  // Arabic companion pages
  "3cd3906c5d6c817a8116e9e1b38d216f": "ar-comprehensive",
  "3cd3906c5d6c81ee9070c16e5c6be1ed": "ar-core-charts",
  "3cd3906c5d6c8101aa91eb72bc14c030": "ar-color",
  "3cd3906c5d6c81a1b557e07b0d15bca7": "ar-line-plot",
  "3cd3906c5d6c8103bf02edeecfa351fc": "ar-scatter-plot",
  "3cd3906c5d6c817682b0d6ec864e154e": "ar-bar-plot",
  "3cd3906c5d6c8159a9a9ce758a6e26e2": "ar-box-plot",
  "3cd3906c5d6c81299255f295d7b2434d": "ar-histogram",
  "3cd3906c5d6c8185b9c4e5d2d80ca4fe": "ar-dot-plot",
  "3cd3906c5d6c8109a01fc02be38ff15a": "ar-tips-interview",
  "e93dca8916a5445e9d0f8ca3192d01dc": "ar-reading-paths",
  "4ceee50e87384884a9f663de5eb7e521": "ar-references",
};

const PAGE_ID_RE = /([0-9a-f]{32})/i;
const SAFE_ASSET_RE = /\.(svg|png|jpe?g|webp|gif)$/i;

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function normalizeSpace(value) {
  return value.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function pageIdFrom(html, filename) {
  const article = html.match(/<article[^>]*\bid="([^"]+)"/i);
  const fromArticle = article?.[1]?.replace(/[^0-9a-f]/gi, "").toLowerCase();
  if (fromArticle?.length === 32) return fromArticle;
  const fromName = filename.match(PAGE_ID_RE)?.[1]?.toLowerCase();
  return fromName ?? null;
}

// ---------------------------------------------------------------------------
// Inline text with marks. React escapes everything at render time; the importer
// only records a whitelist of semantic marks and never emits HTML.
// ---------------------------------------------------------------------------
function pushInline(out, node) {
  if (!node.text) return;
  const previous = out[out.length - 1];
  const marks = ["strong", "em", "code", "href"].filter((m) => node[m]);
  const previousMarks = previous ? ["strong", "em", "code", "href"].filter((m) => previous[m]) : null;
  if (
    previous &&
    previousMarks &&
    previousMarks.length === marks.length &&
    marks.every((m, i) => previousMarks[i] === m && previous[m] === node[m])
  ) {
    previous.text += node.text;
    return;
  }
  out.push({ ...node });
}

function collectInline(node, out, marks = {}) {
  for (const child of node.childNodes ?? []) {
    if (child.nodeType === 3) {
      // `text` is entity-decoded (`&amp;` → `&`); `rawText` is not, so never use it.
      const text = normalizeSpace(child.text ?? child.textContent ?? "").replace(/\n/g, " ");
      if (text) pushInline(out, { ...marks, text });
      continue;
    }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName?.toLowerCase();
    if (!tag) continue;
    if (tag === "br") {
      pushInline(out, { ...marks, text: "\n" });
      continue;
    }
    const next = { ...marks };
    if (tag === "strong" || tag === "b") next.strong = true;
    if (tag === "em" || tag === "i") next.em = true;
    if (tag === "code") next.code = true;
    if (tag === "a") {
      const href = child.getAttribute("href");
      if (href) next.href = href;
    }
    if (tag === "script" || tag === "style") continue;
    collectInline(child, out, next);
  }
}

function inlineOf(node) {
  const out = [];
  collectInline(node, out);
  return out;
}

function directChildren(node, tag) {
  return (node.childNodes ?? []).filter(
    (child) => child.nodeType === 1 && child.tagName?.toLowerCase() === tag,
  );
}

function plainOf(node) {
  return normalizeSpace(node.textContent ?? "").replace(/\s+/g, " ").trim();
}

function inlineText(nodes) {
  return normalizeSpace(nodes.map((n) => n.text).join("")).replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Block extraction
// ---------------------------------------------------------------------------
function extractBlocks(container, context) {
  const blocks = [];
  for (const child of container.childNodes ?? []) {
    if (child.nodeType !== 1) continue;
    const tag = child.tagName?.toLowerCase();
    if (!tag) continue;
    if (tag === "style" || tag === "script" || tag === "nav" || tag === "header") continue;

    const cls = child.getAttribute("class") ?? "";

    if (tag === "div" && cls.includes("table_of_contents")) {
      context.toc = child.querySelectorAll("a").map((a) => ({
        text: plainOf(a),
        href: a.getAttribute("href") ?? "",
      }));
      continue;
    }

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      const text = plainOf(child);
      if (!text) continue;
      blocks.push({ type: "heading", level: Number(tag[1]), text, anchor: context.anchor(text) });
      continue;
    }

    if (tag === "p") {
      const inline = inlineOf(child);
      if (inlineText(inline)) blocks.push({ type: "paragraph", inline });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items = child
        .querySelectorAll("li")
        .map((li) => inlineOf(li))
        .filter((item) => inlineText(item));
      if (items.length) blocks.push({ type: "list", ordered: tag === "ol", items });
      continue;
    }

    if (tag === "blockquote") {
      const inline = inlineOf(child);
      if (inlineText(inline)) blocks.push({ type: "quote", inline });
      continue;
    }

    if (tag === "aside" && cls.includes("callout")) {
      const icon = child.getAttribute("data-notion-callout-icon") ?? "";
      const background = (child.getAttribute("data-notion-callout-background") ?? "gray").replace(
        "_background",
        "",
      );
      const content = directChildren(child, "div").at(-1) ?? child;
      const inner = extractBlocks(content, context);
      blocks.push({ type: "callout", tone: background, icon, blocks: inner });
      continue;
    }

    if (tag === "pre") {
      let text = (child.textContent ?? "").replace(/\r\n/g, "\n").replace(/\t/g, "  ").trimEnd();
      let language =
        /language-([\w+-]+)/.exec(child.innerHTML)?.[1] ??
        /language-([\w+-]+)/.exec(child.getAttribute("class") ?? "")?.[1] ??
        "";
      // Notion exports some code blocks as escaped HTML: the text content is
      // literally `<code class="language-mermaid">…</code>`. Unwrap it so the
      // reader sees the diagram source, not the wrapper markup.
      const wrapped = /^<code[^>]*class="language-([\w+-]+)"[^>]*>([\s\S]*)<\/code>$/i.exec(text);
      if (wrapped) {
        language = wrapped[1];
        text = wrapped[2];
      }
      if (text) blocks.push({ type: "code", language, text });
      continue;
    }

    if (tag === "table") {
      const headRow = child.querySelector("thead tr");
      const headers = headRow
        ? headRow.querySelectorAll("th,td").map((cell) => inlineOf(cell))
        : [];
      const rows = child
        .querySelectorAll("tbody tr")
        .map((row) => row.querySelectorAll("td,th").map((cell) => inlineOf(cell)));
      if (headers.length || rows.length) blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (tag === "figure") {
      if (cls.includes("equation")) {
        const tex = child.getAttribute("data-notion-equation") ?? plainOf(child);
        if (tex) blocks.push({ type: "equation", tex });
        continue;
      }
      if (cls.includes("image")) {
        const img = child.querySelector("img");
        const src = img?.getAttribute("src") ?? child.getAttribute("data-notion-image") ?? "";
        const caption = child.querySelector("figcaption");
        if (src) {
          blocks.push({
            type: "figure",
            src,
            href: src,
            alt: img?.getAttribute("alt") ?? "",
            caption: caption ? plainOf(caption) : "",
          });
        }
        continue;
      }
    }

    if (tag === "details") {
      const summary = child.querySelector("summary");
      const body = directChildren(child, "div")[0] ?? child;
      const inner = extractBlocks(body, context);
      blocks.push({ type: "toggle", summary: summary ? plainOf(summary) : "Details", blocks: inner });
      continue;
    }

    if (tag === "hr") {
      blocks.push({ type: "divider" });
      continue;
    }

    if (tag === "img") {
      const src = child.getAttribute("src") ?? "";
      if (src) blocks.push({ type: "figure", src, href: src, alt: child.getAttribute("alt") ?? "", caption: "" });
      continue;
    }

    if (tag === "div" || tag === "section" || tag === "article") {
      // Notion wraps some content in layout divs; unwrap rather than drop it.
      blocks.push(...extractBlocks(child, context));
      continue;
    }

    // Unknown element: keep its text rather than silently losing content.
    const inline = inlineOf(child);
    if (inlineText(inline)) blocks.push({ type: "paragraph", inline });
  }
  return blocks;
}

function walkBlocks(blocks, visit) {
  for (const block of blocks) {
    visit(block);
    if (block.type === "callout" || block.type === "toggle") walkBlocks(block.blocks, visit);
  }
}

// ---------------------------------------------------------------------------
// Link + asset resolution
// ---------------------------------------------------------------------------
function classifyHref(href, page, htmlFiles, assets) {
  const raw = href.trim();
  if (!raw) return null;
  if (raw.startsWith("#")) return { kind: "anchor", href: raw };
  if (/^mailto:|^tel:/i.test(raw)) return { kind: "external", href: raw };
  if (/^https?:/i.test(raw)) {
    const notion = /app\.notion\.com\/p\/([0-9a-f]{32})/i.exec(raw)?.[1]?.toLowerCase();
    return { kind: notion ? "notion" : "external", href: raw, notionId: notion };
  }
  let decoded = raw.split("#")[0].split("?")[0];
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the raw reference; it will surface as an unresolved link instead of
    // aborting the whole import on one malformed percent escape.
  }
  const slot = path.posix.normalize(`${page.dir}/${decoded.replace(/\\/g, "/")}`).replace(/^\.\//, "");
  const anchor = raw.includes("#") ? `#${raw.split("#").slice(1).join("#")}` : "";
  if (/\.html?$/i.test(decoded)) {
    const target = htmlFiles.find((file) => file === slot || path.basename(file) === path.basename(slot));
    if (target) return { kind: "page", href: raw, targetFile: target, anchor };
    return { kind: "missing-page", href: raw, targetFile: slot };
  }
  const asset = assets.find((file) => file === slot || path.basename(file) === path.basename(slot));
  if (asset) return { kind: "asset", href: raw, targetFile: asset };
  if (SAFE_ASSET_RE.test(decoded)) return { kind: "missing-asset", href: raw, targetFile: slot };
  return { kind: "external-or-unknown", href: raw };
}

function rewriteInlines(inlines, linkFor) {
  for (const node of inlines) {
    if (node.href) {
      const link = linkFor(node.href);
      if (link) {
        node.link = link;
        delete node.href;
      }
    }
  }
}

function rewriteBlocks(blocks, linkFor) {
  for (const block of blocks) {
    if (block.type === "figure" && block.href) {
      block.link = linkFor(block.href);
      delete block.href;
    }
    if (block.inline) rewriteInlines(block.inline, linkFor);
    if (block.type === "list") block.items.forEach((item) => rewriteInlines(item, linkFor));
    if (block.type === "table") {
      block.headers.forEach((cell) => rewriteInlines(cell, linkFor));
      block.rows.forEach((row) => row.forEach((cell) => rewriteInlines(cell, linkFor)));
    }
    if (block.type === "callout" || block.type === "toggle") rewriteBlocks(block.blocks, linkFor);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const htmlFiles = (await readdir(SOURCE, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

if (!htmlFiles.length) {
  console.error(`No .html files found in ${SOURCE}`);
  process.exit(1);
}

const allFiles = (await readdir(SOURCE, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const assets = allFiles.filter((name) => /\.(svg|png|jpe?g|webp|gif|css|js|woff2?)$/i.test(name));

const pages = [];
const figureHasher = new Map();

for (const filename of htmlFiles) {
  const fullPath = path.join(SOURCE, filename);
  const buffer = await readFile(fullPath);
  const info = await stat(fullPath);
  const hash = sha256(buffer);
  const html = buffer.toString("utf8");
  const doc = parse(html, {
    blockTextElements: { script: false, style: false, pre: true },
    comment: false,
  });

  const article = doc.querySelector("article.page") ?? doc.querySelector("article") ?? doc;
  const notionId = pageIdFrom(html, filename);
  const title = plainOf(article.querySelector("h1.page-title") ?? {}) || filename.replace(/\.html$/, "");
  const icon = doc.querySelector('meta[name="data-notion-page-icon"]')?.getAttribute("content") ?? "";
  const description = plainOf(article.querySelector("p.page-description") ?? {});

  let headingIndex = 0;
  const usedAnchors = new Set();
  const context = {
    toc: [],
    anchor(text) {
      headingIndex += 1;
      let base = slugify(text);
      if (!base) base = `section-${headingIndex}`;
      let anchor = base;
      let suffix = 2;
      while (usedAnchors.has(anchor)) anchor = `${base}-${suffix++}`;
      usedAnchors.add(anchor);
      return anchor;
    },
  };

  const body = article.querySelector("div.page-body") ?? article;
  const blocks = extractBlocks(body, context);

  const links = [];
  const figures = [];
  walkBlocks(blocks, (block) => {
    if (block.type === "figure") figures.push(block);
  });

  const linkFor = (href) => classifyHref(href, { dir: "" }, htmlFiles, assets);
  rewriteBlocks(blocks, linkFor);

  // Collect resolved links from the rewritten blocks.
  const collectLinks = (inlines) => {
    for (const node of inlines) if (node.link) links.push(node.link);
  };
  walkBlocks(blocks, (block) => {
    if (block.inline) collectLinks(block.inline);
    if (block.type === "list") block.items.forEach(collectLinks);
    if (block.type === "table") {
      block.headers.forEach(collectLinks);
      block.rows.forEach((row) => row.forEach(collectLinks));
    }
  });

  const plain = plainOf(body);
  const arabicChars = (plain.match(/[\u0600-\u06ff]/g) ?? []).length;
  const latinChars = (plain.match(/[A-Za-z]/g) ?? []).length;
  const arabicShare = arabicChars / Math.max(1, arabicChars + latinChars);
  const lang = arabicShare > 0.2 ? "ar" : "en";
  const direction = arabicShare > 0.5 ? "rtl" : "ltr";

  const headings = [];
  walkBlocks(blocks, (block) => {
    if (block.type === "heading") headings.push({ level: block.level, text: block.text, anchor: block.anchor });
  });

  let counts = { paragraphs: 0, lists: 0, listItems: 0, tables: 0, tableRows: 0, figures: 0, equations: 0, callouts: 0, toggles: 0, code: 0 };
  walkBlocks(blocks, (block) => {
    if (block.type === "paragraph") counts.paragraphs += 1;
    if (block.type === "list") {
      counts.lists += 1;
      counts.listItems += block.items.length;
    }
    if (block.type === "table") {
      counts.tables += 1;
      counts.tableRows += block.rows.length;
    }
    if (block.type === "figure") counts.figures += 1;
    if (block.type === "equation") counts.equations += 1;
    if (block.type === "callout") counts.callouts += 1;
    if (block.type === "toggle") counts.toggles += 1;
    if (block.type === "code") counts.code += 1;
  });

  const slug = SLUGS[notionId ?? ""] ?? (slugify(title) || `page-${(notionId ?? hash).slice(0, 8)}`);

  pages.push({
    notionId,
    canonicalUrl: notionId ? `https://app.notion.com/p/${notionId}` : null,
    slug,
    lang,
    direction,
    title,
    icon,
    description,
    source: {
      file: filename,
      sha256: hash,
      bytes: buffer.length,
      observedModified: info.mtime.toISOString(),
    },
    counts: { ...counts, blocks: blocks.length, headings: headings.length, links: links.length },
    textLength: plain.length,
    language: { arabicChars, latinChars, arabicShare: Number(arabicShare.toFixed(3)) },
    headings,
    toc: context.toc,
    blocks,
    links,
    assets: [...new Set(figures.map((figure) => figure.link?.targetFile).filter(Boolean))],
  });
}

// Duplicate detection: identical bytes and identical titles.
const byHash = new Map();
for (const page of pages) {
  byHash.set(page.source.sha256, [...(byHash.get(page.source.sha256) ?? []), page.slug]);
}

const duplicates = [...byHash.entries()]
  .filter(([, slugs]) => slugs.length > 1)
  .map(([hash, slugs]) => ({ kind: "identical-bytes", hash, slugs }));

const titleGroups = new Map();
for (const page of pages) {
  const key = page.title.toLowerCase().replace(/\s+/g, " ").trim();
  titleGroups.set(key, [...(titleGroups.get(key) ?? []), page.slug]);
}
for (const [title, slugs] of titleGroups) {
  if (slugs.length > 1) duplicates.push({ kind: "identical-title", title, slugs });
}

// Figure processing: copy only local, script-free SVG/bitmap assets.
const figureSources = new Set();
walkBlocks(pages.flatMap((page) => page.blocks), (block) => {
  if (block.type === "figure" && block.link?.targetFile) figureSources.add(block.link.targetFile);
});

// Hash + sanitise figures.
const figureManifest = [];
for (const name of [...figureSources].sort()) {
  const sourcePath = path.join(SOURCE, name);
  if (!existsSync(sourcePath)) continue;
  const buffer = await readFile(sourcePath);
  const text = buffer.toString("utf8");
  if (/\.svg$/i.test(name)) {
    if (/<script/i.test(text) || /\son\w+\s*=/i.test(text) || /xlink:href\s*=\s*["'](?!#|data:)/i.test(text)) {
      console.warn(`Skipping unsafe SVG: ${name}`);
      continue;
    }
  }
  const hash = sha256(buffer);
  figureHasher.set(name, hash);
  const viewBox = /viewBox="([\d.\-\s]+)"/i.exec(text)?.[1]?.trim().split(/\s+/).map(Number);
  const attrWidth = Number(/<svg[^>]*\bwidth="([\d.]+)"/i.exec(text)?.[1]);
  const attrHeight = Number(/<svg[^>]*\bheight="([\d.]+)"/i.exec(text)?.[1]);
  const width = Number.isFinite(attrWidth) && attrWidth > 0 ? attrWidth : viewBox?.[2] ?? 900;
  const height = Number.isFinite(attrHeight) && attrHeight > 0 ? attrHeight : viewBox?.[3] ?? 360;
  // The export's figures are hand-authored SVGs with a headline <text> near the
  // top but no <title>/<desc>. Recover that headline so every figure can ship a
  // real accessible name instead of an empty alt attribute.
  const svgTitle = (() => {
    if (!/\.svg$/i.test(name)) return "";
    const root = parse(text, { lowerCaseTagName: false, comment: false });
    const explicit = root.querySelector("title")?.text ?? "";
    const first = root.querySelector("text")?.text ?? "";
    return (explicit || first)
      .replace(/\s+/g, " ")
      .replace(/&amp;/g, "&")
      .trim();
  })();
  figureManifest.push({
    file: name,
    publicPath: `/data-viz/figures/${name}`,
    sha256: hash,
    bytes: buffer.length,
    type: path.extname(name).slice(1).toLowerCase(),
    width,
    height,
    title: svgTitle,
  });
  if (!DRY && !CHECK) {
    await mkdir(PUBLIC_FIGURES, { recursive: true });
    await copyFile(sourcePath, path.join(PUBLIC_FIGURES, name));
  }
}

// Re-point figures at their hashed manifest entry now that hashes are known.
// Alt text resolution: an authored alt wins, then the SVG's own headline, then
// the visible caption, then a humanised filename. Nothing is left empty.
const humanise = (file) =>
  path
    .basename(file, path.extname(file))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

for (const page of pages) {
  const fix = (blocks) => {
    for (const block of blocks) {
      if (block.type === "figure" && block.link?.targetFile) {
        const name = path.basename(block.link.targetFile);
        const entry = figureManifest.find((item) => item.file === name);
        block.src = entry ? entry.publicPath : "";
        block.asset = entry ? { file: name, sha256: entry.sha256 } : null;
        block.width = entry?.width ?? 900;
        block.height = entry?.height ?? 360;
        const parts = [entry?.title, block.caption].map((part) => (part ?? "").trim()).filter(Boolean);
        block.alt = (block.alt ?? "").trim() || parts.join(" — ") || humanise(name);
        delete block.link;
      } else if (block.type === "callout" || block.type === "toggle") {
        fix(block.blocks);
      }
    }
  };
  fix(page.blocks);
}

// Link graph + inventory.
const slugByFile = new Map(pages.map((page) => [page.source.file, page.slug]));
for (const page of pages) {
  for (const link of page.links) {
    if (link.kind === "page" && link.targetFile) {
      link.targetSlug = slugByFile.get(link.targetFile) ?? null;
    }
  }
}
const linkGraph = pages.map((page) => ({
  slug: page.slug,
  file: page.source.file,
  outbound: [
    ...new Set(
      page.links
        .filter((link) => link.kind === "page" && link.targetFile)
        .map((link) => slugByFile.get(link.targetFile) ?? link.targetFile),
    ),
  ].sort(),
  external: [...new Set(page.links.filter((link) => link.kind === "external" || link.kind === "notion").map((link) => link.href))].sort(),
  missing: page.links.filter((link) => link.kind === "missing-page" || link.kind === "missing-asset"),
}));

const inbound = new Map();
for (const edge of linkGraph) {
  for (const target of edge.outbound) inbound.set(target, (inbound.get(target) ?? 0) + 1);
}

const inventory = {
  generatedBy: "scripts/import-notion-data-viz.mjs",
  inventoryVersion: 1,
  sourceRoot: path.basename(SOURCE),
  sourceRootAbsolute: SOURCE,
  observedExportRange: {
    earliest: pages.map((page) => page.source.observedModified).sort()[0] ?? null,
    latest: pages.map((page) => page.source.observedModified).sort().at(-1) ?? null,
  },
  totals: {
    htmlFiles: pages.length,
    figures: figureManifest.length,
    otherAssets: assets.length - figureManifest.length,
    bytes: pages.reduce((sum, page) => sum + page.source.bytes, 0),
    textCharacters: pages.reduce((sum, page) => sum + page.textLength, 0),
  },
  pages: pages
    .map((page) => ({
      slug: page.slug,
      title: page.title,
      lang: page.lang,
      icon: page.icon,
      notionId: page.notionId,
      canonicalUrl: page.canonicalUrl,
      relativePath: page.source.file,
      sha256: page.source.sha256,
      bytes: page.source.bytes,
      observedModified: page.source.observedModified,
      textLength: page.textLength,
      language: page.language,
      counts: page.counts,
      headings: page.headings,
      assets: page.assets,
      inboundLinks: inbound.get(page.slug) ?? 0,
      outboundPages: linkGraph.find((edge) => edge.slug === page.slug)?.outbound ?? [],
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug)),
  figures: figureManifest.sort((a, b) => a.file.localeCompare(b.file)),
  duplicates,
  unresolved: pages.flatMap((page) =>
    page.links
      .filter((link) => link.kind === "missing-page" || link.kind === "missing-asset")
      .map((link) => ({ slug: page.slug, kind: link.kind, href: link.href, target: link.targetFile })),
  ),
  linkGraph,
  classification: {
    note: "The root hub page was not part of this export. Parent/child edges below come from links actually present in the exported HTML, not from guesswork.",
    roots: linkGraph.filter((edge) => (inbound.get(edge.slug) ?? 0) === 0).map((edge) => edge.slug),
    leaves: linkGraph.filter((edge) => edge.outbound.length === 0).map((edge) => edge.slug),
  },
};

const manifest = pages
  .map((page) => ({
    slug: page.slug,
    title: page.title,
    lang: page.lang,
    icon: page.icon,
    description: page.description,
    notionId: page.notionId,
    canonicalUrl: page.canonicalUrl,
    sourceFile: page.source.file,
    textLength: page.textLength,
    language: page.language,
    headings: page.headings,
    counts: page.counts,
    toc: page.toc,
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug));

const pagesJson = pages
  .map((page) => ({
    slug: page.slug,
    title: page.title,
    lang: page.lang,
    direction: page.direction,
    icon: page.icon,
    description: page.description,
    notionId: page.notionId,
    canonicalUrl: page.canonicalUrl,
    source: page.source,
    counts: page.counts,
    textLength: page.textLength,
    headings: page.headings,
    blocks: page.blocks,
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug));

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const outputs = [
  [path.join(CONTENT_DIR, "pages.json"), json(pagesJson)],
  [path.join(CONTENT_DIR, "manifest.json"), json(manifest)],
  [path.join(DOCS_DIR, "html-export-inventory.json"), json(inventory)],
];

let changed = 0;
for (const [file, content] of outputs) {
  const existing = existsSync(file) ? await readFile(file, "utf8") : null;
  const same = existing === content;
  if (!same) changed += 1;
  if (VERBOSE || DRY || CHECK) {
    console.log(`${same ? "=" : "+"} ${path.relative(ROOT, file)}${same ? "" : " (would update)"}`);
  }
  if (!DRY && !CHECK && !same) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content, "utf8");
  }
}

// Human-readable audit.
const audit = buildAudit(inventory, pages, linkGraph);
const auditPath = path.join(DOCS_DIR, "local-source-audit.md");
const existingAudit = existsSync(auditPath) ? await readFile(auditPath, "utf8") : null;
if (existingAudit !== audit) {
  changed += 1;
  if (!DRY && !CHECK) {
    await mkdir(DOCS_DIR, { recursive: true });
    await writeFile(auditPath, audit, "utf8");
  }
}

console.log(
  `${DRY || CHECK ? "Checked" : "Imported"} ${pages.length} HTML page(s), ${figureManifest.length} figure(s); ` +
    `${inventory.totals.textCharacters.toLocaleString("en")} characters of source text; ` +
    `${changed} output file(s) ${DRY || CHECK ? "out of date" : "written"}.`,
);
if (inventory.unresolved.length) {
  console.warn(`Warnings: ${inventory.unresolved.length} unresolved link/asset reference(s).`);
  for (const item of inventory.unresolved.slice(0, 10)) {
    console.warn(`  ${item.slug}: ${item.kind} ${item.href}`);
  }
}
if (CHECK && changed > 0) process.exit(1);

function buildAudit(inv, pageList, graph) {
  const rows = inv.pages
    .map(
      (page) =>
        `| \`${page.relativePath}\` | ${page.title.replace(/\|/g, "\\|")} | ${page.notionId ? `\`${page.notionId}\`` : "—"} | ${page.lang.toUpperCase()} | ${page.counts.blocks} | ${page.textLength.toLocaleString("en")} | ${page.sha256.slice(0, 12)}… |`,
    )
    .join("\n");
  const unresolved = inv.unresolved.length
    ? inv.unresolved
        .map((item) => `- ${item.slug} → ${item.kind}: \`${item.href}\` (resolved as \`${item.target}\`)`)
        .join("\n")
    : "None. Every relative link and referenced asset resolved inside the export.";
  return `# Local source audit — Data Visualization HTML export

Generated by \`scripts/import-notion-data-viz.mjs\`. Do not edit by hand; rerun the importer.

## 1. What was read

- **Source root:** \`${inv.sourceRoot}\` (a local Notion HTML export; the raw folder is not shipped).
- **HTML pages:** ${inv.totals.htmlFiles}
- **Figures / media:** ${inv.totals.figures} (all referenced by the export; hashed and copied to \`public/data-viz/figures/\`)
- **Other sibling assets:** ${inv.totals.otherAssets}
- **Source text:** ${inv.totals.textCharacters.toLocaleString("en")} characters (plain-text extraction, before editorial additions)
- **Observed file timestamps:** ${inv.observedExportRange.earliest} → ${inv.observedExportRange.latest}

The export is flat: there are no subdirectories. The Notion hub page itself is **not** part of the export, so the hierarchy below is reconstructed from the canonical chapter map and the internal link graph, not invented from filenames.

## 2. Complete page inventory

| Relative HTML path | Title | Notion page ID | Lang | Blocks | Text chars | SHA-256 |
|---|---|---|---:|---:|---:|---|
${rows}

## 3. Duplicates and near-duplicates

${
  inv.duplicates.length
    ? inv.duplicates
        .map((dup) =>
          dup.kind === "identical-bytes"
            ? `- Identical bytes (\`${dup.hash.slice(0, 12)}…\`): ${dup.slugs.join(", ")}`
            : `- Identical title: “${dup.title}” → ${dup.slugs.join(", ")}`,
        )
        .join("\n")
    : "No two exported files have identical bytes or identical titles. English chapters and Arabic companion pages cover overlapping concepts in different languages, so both are published rather than deduplicated."
}

## 4. Link and asset resolution

${unresolved}

Internal page links discovered: ${graph.reduce((sum, edge) => sum + edge.outbound.length, 0)}.
Pages with no inbound link inside the export: ${inv.classification.roots.join(", ") || "none"}.
Pages with no outbound page link: ${inv.classification.leaves.join(", ") || "none"}.

## 5. Coverage status

Full coverage decisions live in \`docs/data-visualization/content-provenance.md\` and are enforced by \`npm run validate:data-viz\`. Every one of the ${inv.totals.htmlFiles} pages has an explicit destination or an explicit exclusion reason.

## 6. Asset notes

- All figures are original inline SVGs authored inside the export. The importer rejects any SVG containing \`<script>\`, inline event handlers, or external \`xlink:href\` references.
- Figures are served from \`/data-viz/figures/\` with no expiring Notion/S3 URLs.
- Arabic text is preserved as UTF-8 with \`dir="rtl"\` on the relevant lesson pages.
`;
}
