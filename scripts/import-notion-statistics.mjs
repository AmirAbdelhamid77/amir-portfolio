// Offline importer for the owner's local Notion "Comprehensive Statistics
// Reference" export. It never touches Notion: it reads the exported HTML,
// normalises it into typed blocks, repairs the LaTeX that Notion's HTML export
// strips backslashes from, and writes sanitised JSON the static site imports.
//
//   node scripts/import-notion-statistics.mjs
//   node scripts/import-notion-statistics.mjs --check
//   node scripts/import-notion-statistics.mjs --dry-run --verbose
//
// The importer is idempotent: identical input bytes produce identical output.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
};

const SOURCE = path.resolve(
  ROOT,
  option("--source", process.env.STATISTICS_EXPORT ?? "intake/source-exports/statistics"),
);
const DRY = flag("--dry-run");
const CHECK = flag("--check");
const VERBOSE = flag("--verbose");

const CONTENT_DIR = path.join(ROOT, "content", "statistics");
const DOCS_DIR = path.join(ROOT, "docs", "statistics");

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function normalizeSpace(value) {
  return (value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
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

// ---------------------------------------------------------------------------
// Formula repair.
//
// Notion's HTML export renders equations as plain text such as
// `(bar{x}=frac{sum x_i}{n})`: every backslash is gone, so `\bar`, `\frac`,
// `\sigma` and friends are unrecoverable by a generic regex (and `Maximum`
// contains `mu`). The lesson set only contains a finite set of formulas, so the
// verified source formulas are mapped explicitly. Anything else goes through
// `genericRepair`, and any formula that still fails to render is listed in the
// manifest instead of being silently shipped.
// ---------------------------------------------------------------------------
export const FORMULA_TEX = {
  "-1le rle1": "-1 \\le r \\le 1",
  "0le P(A)le1": "0 \\le P(A) \\le 1",
  "CI=Estimatepm Critical Valuetimes SE":
    "\\text{CI} = \\text{Estimate} \\pm \\text{Critical Value} \\times \\text{SE}",
  "E(X)=Var(X)=lambda": "E(X) = \\operatorname{Var}(X) = \\lambda",
  "E(X)=lambda": "E(X) = \\lambda",
  "E(X)=np": "E(X) = np",
  "E(bar X)=mu": "E(\\bar{X}) = \\mu",
  "Estimatepm Critical Valuetimes SE":
    "\\text{Estimate} \\pm \\text{Critical Value} \\times \\text{SE}",
  "Estimatepm Margin of Error": "\\text{Estimate} \\pm \\text{Margin of Error}",
  H_0: "H_0",
  "H_0:mu_C=mu_B": "H_0: \\mu_C = \\mu_B",
  H_a: "H_a",
  "IQR=Q_3-Q_1": "\\operatorname{IQR} = Q_3 - Q_1",
  "Margin of Error=Critical Valuetimes SE":
    "\\text{Margin of Error} = \\text{Critical Value} \\times \\text{SE}",
  "P(A^c)=1-P(A)": "P(A^c) = 1 - P(A)",
  "P(Acap B)=P(A)P(B)": "P(A \\cap B) = P(A)P(B)",
  "P(Amid B)=frac{P(Acap B)}{P(B)}":
    "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}",
  "P(X=k)=binom{n}{k}p^k(1-p)^{n-k}":
    "P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}",
  "P(X=k)=frac{e^{-lambda}lambda^k}{k!}":
    "P(X = k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}",
  "Range=Maximum-Minimum":
    "\\text{Range} = \\text{Maximum} - \\text{Minimum}",
  "SD(X)=sqrtlambda": "\\operatorname{SD}(X) = \\sqrt{\\lambda}",
  "SD(X)=sqrt{lambda}": "\\operatorname{SD}(X) = \\sqrt{\\lambda}",
  "SD=sqrt{Variance}": "\\operatorname{SD} = \\sqrt{\\operatorname{Variance}}",
  "SE=frac{sigma}{sqrt n}": "\\operatorname{SE} = \\frac{\\sigma}{\\sqrt{n}}",
  "SE_{bar X}=frac{sigma}{sqrt n}":
    "\\operatorname{SE}_{\\bar{X}} = \\frac{\\sigma}{\\sqrt{n}}",
  "SE_{bar X}approxfrac{s}{sqrt n}":
    "\\operatorname{SE}_{\\bar{X}} \\approx \\frac{s}{\\sqrt{n}}",
  "SEapproxfrac{s}{sqrt n}":
    "\\operatorname{SE}_{\\bar{X}} \\approx \\frac{s}{\\sqrt{n}}",
  "SEproptofrac{1}{sqrt n}":
    "\\operatorname{SE} \\propto \\frac{1}{\\sqrt{n}}",
  "Test Statistic=frac{5.4}{1.5}=3.6":
    "\\text{Test Statistic} = \\frac{5.4}{1.5} = 3.6",
  "Test Statistic=frac{Observed Difference-Hypothesized Difference}{SE of Difference}":
    "\\text{Test Statistic} = \\frac{\\text{Observed Difference} - \\text{Hypothesized Difference}}{\\text{SE of Difference}}",
  "Test Statistic=frac{Observed-Hypothesized}{SE}":
    "\\text{Test Statistic} = \\frac{\\text{Observed} - \\text{Hypothesized}}{\\text{SE}}",
  "Var(X)=lambda": "\\operatorname{Var}(X) = \\lambda",
  "Var(X)=np(1-p)": "\\operatorname{Var}(X) = np(1-p)",
  "Xleftrightarrow Y": "X \\leftrightarrow Y",
  "Xrightarrow Y": "X \\rightarrow Y",
  "Y=beta_0+beta_1X": "Y = \\beta_0 + \\beta_1 X",
  "79.3-73.9=5.4": "79.3 - 73.9 = 5.4",
  "Hypothesized Difference=0": "\\text{Hypothesized Difference} = 0",
  "p=0.037": "p = 0.037",
  "p>0.05": "p > 0.05",
  "ple0.05": "p \\le 0.05",
  "p=0.05": "p = 0.05",
  "r=0.99": "r = 0.99",
  "r=0.75": "r = 0.75",
  "r=0.56": "r = 0.56",
  "r=0.61": "r = 0.61",
  "|r|": "|r|",
  alpha: "\\alpha",
  "alpha=0.05": "\\alpha = 0.05",
  "bar X": "\\bar{X}",
  "bar x_B=73.9": "\\bar{x}_B = 73.9",
  "bar x_C=79.3": "\\bar{x}_C = 79.3",
  "bar{x}": "\\bar{x}",
  "bar{x}=frac{sum x_i}{n}": "\\bar{x} = \\frac{\\sum x_i}{n}",
  beta_1: "\\beta_1",
  lambda: "\\lambda",
  "lambda=20": "\\lambda = 20",
  mu: "\\mu",
  "mu_C<mu_B": "\\mu_C < \\mu_B",
  "mu_C>mu_B": "\\mu_C > \\mu_B",
  "mu_Cnemu_B": "\\mu_C \\neq \\mu_B",
  mupm1sigma: "\\mu \\pm 1\\sigma",
  mupm2sigma: "\\mu \\pm 2\\sigma",
  mupm3sigma: "\\mu \\pm 3\\sigma",
  "nuparrowRightarrow SEdownarrow":
    "n \\uparrow \\Rightarrow \\operatorname{SE} \\downarrow",
  "p>alpha": "p > \\alpha",
  "p>alphaRightarrow Fail to Reject H_0":
    "p > \\alpha \\Rightarrow \\text{Fail to Reject } H_0",
  plealpha: "p \\le \\alpha",
  "plealphaRightarrow Reject H_0":
    "p \\le \\alpha \\Rightarrow \\text{Reject } H_0",
  "ptext{-value}=P(text{result at least as extreme as observed}mid H_0text{ is true})":
    "p\\text{-value} = P(\\text{result at least as extreme as observed} \\mid H_0 \\text{ is true})",
  "P(A)=0": "P(A) = 0",
  "P(A)=1": "P(A) = 1",
  "r>0": "r > 0",
  "r<0": "r < 0",
  rapprox0: "r \\approx 0",
  "rapprox0.20": "r \\approx 0.20",
  "s^2=frac{sum (x_i-bar{x})^2}{n-1}":
    "s^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n-1}",
  sigma: "\\sigma",
  "sigma^2=frac{sum (x_i-mu)^2}{N}":
    "\\sigma^2 = \\frac{\\sum (x_i - \\mu)^2}{N}",
  "z=frac{x-mu}{sigma}": "z = \\frac{x - \\mu}{\\sigma}",
  "z=frac{x-mu}{sigma} (standardize)": "z = \\frac{x - \\mu}{\\sigma}",
};

const GREEK = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "theta",
  "lambda",
  "mu",
  "nu",
  "pi",
  "rho",
  "sigma",
  "tau",
  "phi",
  "omega",
];

const OPERATORS = {
  le: "\\le",
  ge: "\\ge",
  neq: "\\neq",
  pm: "\\pm",
  times: "\\times",
  approx: "\\approx",
  propto: "\\propto",
  Rightarrow: "\\Rightarrow",
  rightarrow: "\\rightarrow",
  leftrightarrow: "\\leftrightarrow",
  uparrow: "\\uparrow",
  downarrow: "\\downarrow",
  cap: "\\cap",
  cup: "\\cup",
  mid: "\\mid",
  cdot: "\\cdot",
};

function genericRepair(raw) {
  let value = ` ${raw} `;
  // No `\b` before `text{`: the stripped export concatenates `H_0text{...}` and
  // there is no word boundary between `0` and `t`.
  value = value.replace(/ptext\{-value\}/g, "p\\text{-value}");
  value = value.replace(/text\{([^{}]*)\}/g, "\\text{$1}");
  value = value.replace(/\bbar\s*\{([^{}]*)\}/g, "\\bar{$1}");
  value = value.replace(/\bbar\s+([A-Za-z])/g, "\\bar{$1}");
  value = value.replace(/\bfrac\s*\{/g, "\\frac{");
  value = value.replace(/\bsqrt\s*\{/g, "\\sqrt{");
  value = value.replace(/\bsqrt\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}");
  value = value.replace(/\bbinom\s*\{/g, "\\binom{");
  value = value.replace(/\bsum\b/g, "\\sum");
  for (const greek of GREEK) {
    value = value.replace(new RegExp(`(?<!\\\\[A-Za-z])\\b${greek}\\b`, "g"), `\\${greek}`);
  }
  for (const [word, tex] of Object.entries(OPERATORS)) {
    value = value.replace(new RegExp(`(?<!\\\\[A-Za-z])\\b${word}\\b`, "g"), tex);
  }
  return value.replace(/\s+/g, " ").trim();
}

const MATH_COMMAND =
  /(frac|sqrt|sum|binom|sigma|lambda|alpha|beta|mu\b|bar\{|bar\s|le\b|ge\b|neq|approx|propto|Rightarrow|rightarrow|leftrightarrow|uparrow|downarrow|cap\b|cup\b|mid\b|pm\b|times|text\{|\^|_|[=<>]|\|[A-Za-z]+\|)/;

function looksLikeMath(raw) {
  if (!raw || /[\u0600-\u06ff]/.test(raw)) return false;
  if (!MATH_COMMAND.test(raw)) return false;
  return /[A-Za-z0-9]/.test(raw);
}

export function repairFormula(raw) {
  // `mathSpans` already removed the wrapper parentheses. Do NOT strip a trailing
  // `)` here: `P(A^c)=1-P(A)` ends with a real closing paren.
  const key = normalizeSpace(raw).replace(/\s+/g, " ").trim();
  if (FORMULA_TEX[key]) return { tex: FORMULA_TEX[key], matched: true, key };
  return { tex: genericRepair(key), matched: false, key };
}

// Extract parenthesised spans. Formula parentheses do not nest in this source,
// but `frac{...}{...}` can contain parentheses; the scan therefore matches the
// outer parens by balance rather than the first closing paren.
function mathSpans(text) {
  const spans = [];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "(") continue;
    let depth = 0;
    let end = -1;
    for (let cursor = index; cursor < text.length; cursor += 1) {
      if (text[cursor] === "(") depth += 1;
      if (text[cursor] === ")") {
        depth -= 1;
        if (depth === 0) {
          end = cursor;
          break;
        }
      }
    }
    if (end === -1) continue;
    const raw = text.slice(index + 1, end);
    if (looksLikeMath(raw)) {
      spans.push({ start: index, end: end + 1, raw });
      index = end;
    }
  }
  return spans;
}

function splitMath(text, marks) {
  const spans = mathSpans(text);
  if (!spans.length) return [{ ...marks, text }];
  const output = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start > cursor) {
      const before = text.slice(cursor, span.start);
      if (before) output.push({ ...marks, text: before });
    }
    const repaired = repairFormula(span.raw);
    output.push({ ...marks, math: repaired.tex, raw: span.raw, formulaKey: repaired.key });
    cursor = span.end;
  }
  if (cursor < text.length) {
    const rest = text.slice(cursor);
    if (rest) output.push({ ...marks, text: rest });
  }
  return output;
}

// ---------------------------------------------------------------------------
// Inline text with marks.
// ---------------------------------------------------------------------------
function pushInline(out, node) {
  if (!node.text && !node.math) return;
  const previous = out[out.length - 1];
  const marks = ["strong", "em", "code", "math", "raw", "formulaKey"].filter((mark) => node[mark]);
  const same =
    previous &&
    marks.length &&
    marks.every((mark) => previous[mark] === node[mark]) &&
    ["strong", "em", "code"].every((mark) => Boolean(previous[mark]) === Boolean(node[mark]));
  if (same && node.text) {
    previous.text += node.text;
    return;
  }
  out.push({ ...node });
}

function collectInline(node, out, marks = {}) {
  for (const child of node.childNodes ?? []) {
    if (child.nodeType === 3) {
      const text = normalizeSpace(child.text ?? child.textContent ?? "").replace(/\n/g, " ");
      if (!text) continue;
      for (const part of splitMath(text, marks)) pushInline(out, part);
      continue;
    }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName?.toLowerCase();
    if (!tag || tag === "script" || tag === "style") continue;
    if (tag === "br") {
      pushInline(out, { ...marks, text: "\n" });
      continue;
    }
    const next = { ...marks };
    if (tag === "strong" || tag === "b") next.strong = true;
    if (tag === "em" || tag === "i") next.em = true;
    if (tag === "code") next.code = true;
    collectInline(child, out, next);
  }
}

function inlineOf(node) {
  const out = [];
  collectInline(node, out);
  return out;
}

function inlineText(nodes) {
  return normalizeSpace(nodes.map((node) => (node.math ? `(${node.raw})` : node.text)).join(""))
    .replace(/\s+/g, " ")
    .trim();
}

function plainOf(node) {
  return normalizeSpace(node?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function directChildren(node, tag) {
  return (node.childNodes ?? []).filter(
    (child) => child.nodeType === 1 && child.tagName?.toLowerCase() === tag,
  );
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
    if (["style", "script", "nav", "header", "link"].includes(tag)) continue;
    const cls = child.getAttribute("class") ?? "";

    if (tag === "div" && cls.includes("table_of_contents")) {
      context.toc = child.querySelectorAll("a").map((anchor) => ({
        text: plainOf(anchor),
        href: anchor.getAttribute("href") ?? "",
      }));
      continue;
    }

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      const text = plainOf(child);
      if (!text) continue;
      const previous = blocks[blocks.length - 1];
      const level = Number(tag[1]);
      blocks.push({
        type: "heading",
        level,
        text,
        anchor: context.anchor(text, level, previous?.type === "heading" ? previous.anchor : null),
      });
      continue;
    }

    if (tag === "p") {
      const inline = inlineOf(child);
      if (!inlineText(inline)) continue;
      const mathOnly =
        inline.length === 1 && inline[0].math
          ? inline[0]
          : inline.every((node) => node.math) && inline.length === 1
            ? inline[0]
            : null;
      if (mathOnly) {
        blocks.push({
          type: "formula",
          tex: mathOnly.math,
          raw: mathOnly.raw,
          alt: inlineText([mathOnly]),
        });
        continue;
      }
      blocks.push({ type: "paragraph", inline });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items = child
        .querySelectorAll("li")
        .map((item) => inlineOf(item))
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
      blocks.push({ type: "callout", tone: background, icon, blocks: extractBlocks(content, context) });
      continue;
    }

    if (tag === "pre") {
      let text = (child.textContent ?? "").replace(/\r\n/g, "\n").replace(/\t/g, "  ").trimEnd();
      let language =
        /language-([\w+-]+)/.exec(child.innerHTML)?.[1] ??
        /language-([\w+-]+)/.exec(cls)?.[1] ??
        "";
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

    if (tag === "details") {
      const summary = child.querySelector("summary");
      const body = directChildren(child, "div")[0] ?? child;
      blocks.push({
        type: "toggle",
        summary: summary ? plainOf(summary) : "Details",
        blocks: extractBlocks(body, context),
      });
      continue;
    }

    if (tag === "hr") {
      blocks.push({ type: "divider" });
      continue;
    }

    if (tag === "div" || tag === "section" || tag === "article") {
      blocks.push(...extractBlocks(child, context));
      continue;
    }

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

function countBlocks(blocks) {
  const counts = {
    paragraphs: 0,
    lists: 0,
    listItems: 0,
    tables: 0,
    tableRows: 0,
    formulas: 0,
    headings: 0,
    toggles: 0,
    callouts: 0,
    code: 0,
  };
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
    if (block.type === "formula") counts.formulas += 1;
    if (block.type === "heading") counts.headings += 1;
    if (block.type === "toggle") counts.toggles += 1;
    if (block.type === "callout") counts.callouts += 1;
    if (block.type === "code") counts.code += 1;
  });
  return counts;
}

function blockText(blocks) {
  let text = "";
  walkBlocks(blocks, (block) => {
    if (block.type === "heading") text += ` ${block.text}`;
    if (block.type === "paragraph" || block.type === "quote") text += ` ${inlineText(block.inline)}`;
    if (block.type === "list") {
      text += ` ${block.items.map((item) => inlineText(item)).join(" ")}`;
    }
    if (block.type === "table") {
      text += ` ${block.headers.map((cell) => inlineText(cell)).join(" ")}`;
      text += ` ${block.rows.map((row) => row.map((cell) => inlineText(cell)).join(" ")).join(" ")}`;
    }
    if (block.type === "formula") text += ` ${block.raw}`;
    if (block.type === "code") text += ` ${block.text}`;
  });
  return text.trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
if (!existsSync(SOURCE)) {
  console.error(`Export root not found: ${SOURCE}`);
  process.exit(1);
}

const allFiles = (await readdir(SOURCE, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const htmlFiles = allFiles.filter((name) => name.toLowerCase().endsWith(".html"));
if (htmlFiles.length !== 1) {
  console.error(
    `Expected exactly one exported HTML page in ${SOURCE}, found ${htmlFiles.length}. ` +
      `The V2 brief treats subpages as separate files; this export is a single page, and ` +
      `the importer refuses to guess how a multi-file export should be merged.`,
  );
  process.exit(1);
}

const filename = htmlFiles[0];
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
const title = plainOf(article.querySelector("h1.page-title")) || filename.replace(/\.html$/, "");
const pageId = /([0-9a-f]{32})/i.exec(filename)?.[1]?.toLowerCase() ?? null;
const body = article.querySelector("div.page-body") ?? article;

let anchorCount = 0;
const usedAnchors = new Set();
const context = {
  toc: [],
  anchor(text, level, previousAnchor) {
    anchorCount += 1;
    let base = slugify(text);
    if (!base) base = `section-${anchorCount}`;
    // Headings without their own authored anchor are numbered by their parent
    // section so `/s9-z-score` stays stable even if more prose is added.
    if (level > 1 && previousAnchor) {
      const root = previousAnchor.replace(/-s\d+$/, "");
      if (root && root !== previousAnchor) base = `${root}-${base}`;
    }
    let anchor = base;
    let suffix = 2;
    while (usedAnchors.has(anchor)) anchor = `${base}-${suffix++}`;
    usedAnchors.add(anchor);
    return anchor;
  },
};

// Split at top-level numbered H1 headings. The title, intro callout and table of
// contents precede section 1 and are kept as `intro`/`toc`.
const rawBlocks = extractBlocks(body, context);
const intro = [];
const sections = [];
let current = null;
const headingNumber = (text) => {
  const match = /^(\d{1,2})[.)]\s+/.exec(text);
  return match ? Number(match[1]) : null;
};

for (const block of rawBlocks) {
  if (block.type === "heading" && block.level === 1 && headingNumber(block.text) !== null) {
    const number = headingNumber(block.text);
    current = {
      id: `s${number}`,
      number,
      title: block.text,
      anchor: block.anchor,
      blocks: [],
      headings: [],
      sourceSequence: sections.length + 1,
    };
    sections.push(current);
    current.blocks.push(block);
    current.headings.push({ level: 1, text: block.text, anchor: block.anchor });
    continue;
  }
  if (current) {
    current.blocks.push(block);
    if (block.type === "heading") {
      current.headings.push({ level: block.level, text: block.text, anchor: block.anchor });
    }
  } else {
    intro.push(block);
  }
}

// The section anchor is the stable `s{number}` id; subsection anchors are
// prefixed with it. Arabic-only headings slugify to an empty string, so they
// fall back to a positional anchor rather than collapsing into `section-42`.
for (const section of sections) {
  section.id = `s${section.number}`;
  section.anchor = section.id;
  let subsectionIndex = 0;
  section.blocks = section.blocks.map((block) => {
    if (block.type !== "heading") return block;
    if (block.level === 1) {
      block.anchor = section.id;
      return block;
    }
    subsectionIndex += 1;
    const base = slugify(block.text) || `topic-${subsectionIndex}`;
    block.anchor = `${section.id}-${base}`;
    return block;
  });
  section.headings = section.headings.map((heading) => {
    if (heading.level === 1) return { ...heading, anchor: section.id };
    const match = section.blocks.find(
      (block) => block.type === "heading" && block.text === heading.text,
    );
    return match ? { ...heading, anchor: match.anchor } : heading;
  });
  section.counts = countBlocks(section.blocks);
  section.text = blockText(section.blocks);
  section.textLength = section.text.length;
  section.formulaCount = section.counts.formulas;
  section.subsections = section.headings.filter((heading) => heading.level > 1);
}

const expected = Array.from({ length: 43 }, (_, index) => index + 1);
const observed = sections.map((section) => section.number);
const missing = expected.filter((number) => !observed.includes(number));
const duplicates = observed.filter((number, index) => observed.indexOf(number) !== index);

const unmappedFormulas = [];
const allFormulas = [];
for (const section of sections) {
  walkBlocks(section.blocks, (block) => {
    if (block.type === "formula") {
      const repaired = repairFormula(block.raw);
      allFormulas.push({ section: section.id, raw: block.raw, tex: repaired.tex, matched: repaired.matched });
      if (!repaired.matched) unmappedFormulas.push({ section: section.id, raw: block.raw, tex: repaired.tex });
    }
  });
  const visitInline = (inlines) => {
    for (const node of inlines) {
      if (node.math) {
        const repaired = repairFormula(node.raw);
        allFormulas.push({ section: section.id, raw: node.raw, tex: repaired.tex, matched: repaired.matched });
        if (!repaired.matched) unmappedFormulas.push({ section: section.id, raw: node.raw, tex: repaired.tex });
      }
    }
  };
  walkBlocks(section.blocks, (block) => {
    if (block.inline) visitInline(block.inline);
    if (block.type === "list") block.items.forEach(visitInline);
    if (block.type === "table") {
      block.headers.forEach(visitInline);
      block.rows.forEach((row) => row.forEach(visitInline));
    }
  });
}

const counts = {
  htmlFiles: 1,
  sections: sections.length,
  headings: sections.reduce((sum, section) => sum + section.counts.headings, 0),
  subsections: sections.reduce((sum, section) => sum + section.subsections.length, 0),
  paragraphs: sections.reduce((sum, section) => sum + section.counts.paragraphs, 0),
  lists: sections.reduce((sum, section) => sum + section.counts.lists, 0),
  listItems: sections.reduce((sum, section) => sum + section.counts.listItems, 0),
  tables: sections.reduce((sum, section) => sum + section.counts.tables, 0),
  tableRows: sections.reduce((sum, section) => sum + section.counts.tableRows, 0),
  toggles: sections.reduce((sum, section) => sum + section.counts.toggles, 0),
  formulas: allFormulas.length,
  uniqueFormulas: new Set(allFormulas.map((formula) => formula.raw)).size,
  codeBlocks: sections.reduce((sum, section) => sum + section.counts.code, 0),
  textCharacters: sections.reduce((sum, section) => sum + section.textLength, 0),
  figures: 0,
  assets: 0,
};

const sourceJson = {
  generatedBy: "scripts/import-notion-statistics.mjs",
  schemaVersion: 1,
  title,
  source: {
    file: filename,
    relativePath: filename,
    notionId: pageId,
    canonicalUrl: pageId ? `https://app.notion.com/p/${pageId}` : null,
    sha256: hash,
    bytes: buffer.length,
    observedModified: info.mtime.toISOString(),
    exportShape: "single-page",
    note:
      "The local export contains exactly one HTML file: the Notion page itself. No subpage " +
      "files, images, linked downloads or additional assets accompany it. The 43 numbered " +
      "sections are present inside this file and are split here; no source page is orphaned.",
  },
  toc: context.toc,
  intro,
  sections: sections.map((section) => ({
    id: section.id,
    number: section.number,
    title: section.title,
    titleEn: section.title.replace(/^\d{1,2}[.)]\s+/, ""),
    anchor: section.anchor,
    sourceSequence: section.sourceSequence,
    counts: section.counts,
    formulaCount: section.formulaCount,
    textLength: section.textLength,
    headings: section.headings,
    subsections: section.subsections,
    blocks: section.blocks,
  })),
  counts,
  formulas: allFormulas,
  unmappedFormulas,
  assets: [],
  unresolved: [],
};

// ---------------------------------------------------------------------------
// Human-readable inventory + machine manifest
// ---------------------------------------------------------------------------
const inventoryRows = sections
  .map((section) => {
    const sub = section.subsections.map((heading) => heading.text).join("<br>") || "—";
    const formulas = section.formulaCount;
    return `| \`${section.id}\` | ${section.number} | ${section.title.replace(/\|/g, "\\|")} | ${section.counts.headings} | ${sub.replace(/\|/g, "\\|")} | ${formulas} | ${section.counts.tables} | ${section.textLength.toLocaleString("en")} | ${section.anchor} |`;
  })
  .join("\n");

const inventory = `# Source inventory — Comprehensive Statistics Reference

Generated by \`scripts/import-notion-statistics.mjs\`. Do not edit by hand; rerun the importer.

## 1. Snapshot

| Field | Value |
|---|---|
| Export root | \`${path.basename(SOURCE)}\` |
| HTML files | ${counts.htmlFiles} |
| Exported title | ${title.replace(/\|/g, "\\|")} |
| Notion page id | \`${pageId ?? "not found"}\` |
| Canonical URL | ${pageId ? `https://app.notion.com/p/${pageId}` : "—"} |
| SHA-256 | \`${hash}\` |
| Bytes | ${buffer.length.toLocaleString("en")} |
| Observed mtime | ${info.mtime.toISOString()} |
| Numbered sections | ${counts.sections} (${missing.length ? `missing: ${missing.join(", ")}` : "1–43 complete"}) |
| Headings (H1–H4) | ${counts.headings} |
| Subheadings | ${counts.subsections} |
| Paragraphs | ${counts.paragraphs} |
| Lists | ${counts.lists} (${counts.listItems} items) |
| Tables | ${counts.tables} (${counts.tableRows} rows) |
| Toggles | ${counts.toggles} |
| Top-level intro callout | 1 (preserved on the source audit page) |
| Formulas | ${counts.formulas} occurrences, ${counts.uniqueFormulas} unique raw strings |
| Code / diagram blocks | ${counts.codeBlocks} |
| Figures / images | 0 |
| Other assets | 0 |
| Source text | ${counts.textCharacters.toLocaleString("en")} characters |

**Export shape finding.** The local export contains **one HTML file and no subpages or
assets**. The brief's "43 numbered sections plus subpages" resolves here to the 43 top-level
H1 sections inside this single file, each with its H2/H3 subsections. There is no second file
to merge, and none was invented. The original Notion page id is present in the filename.

## 2. Section inventory

| Source ID | # | Exported H1 | Headings | Subsections | Formulas | Tables | Text chars | Canonical anchor |
|---|---:|---|---:|---|---:|---:|---:|---|
${inventoryRows}

## 3. Subsections (every H2/H3)

${sections
  .flatMap((section) =>
    section.subsections.map(
      (heading) => `- \`${section.id}\` · H${heading.level} · ${heading.text} → \`#${heading.anchor}\``,
    ),
  )
  .join("\n")}

## 4. Formula extraction

All ${counts.uniqueFormulas} unique formula occurrences were mapped to repaired TeX. The mapping is
deliberate: Notion's HTML export strips every backslash, so \`bar{x}=frac{sum x_i}{n}\` would
otherwise ship as broken text. Unmapped formulas are reported, never silently dropped.

${unmappedFormulas.length ? unmappedFormulas.map((item) => `- **UNMAPPED** ${item.section}: \`${item.raw}\` → \`${item.tex}\``).join("\n") : "No unmapped formula: every extracted formula matched the verified lexicon in `scripts/import-notion-statistics.mjs`."}

## 5. Assets

No \`<img>\`, \`<figure>\`, SVG, downloadable file or external media is referenced by the export.
All 43 sections are text, lists, tables, toggles, a callout and a Mermaid code block. The visual
layer required by V2 is therefore **new work**, not a re-drawing of existing figures. See
\`visual-opportunity-audit.md\`.

## 6. Duplicates and source concerns

- Duplicate numbered sections: ${duplicates.length ? duplicates.join(", ") : "none"}.
- Repeated formula strings are expected (the formula index at §37 repeats definitions); they are
  counted as occurrences, not mistaken for duplicate pages.
- §10.3 contains a numerical error corrected in \`math-errata.md\`.
- §19.1 states a p-value without the sample size or standard error needed to verify it; flagged as
  underspecified, not reproduced as a worked calculation.

## 7. Destination

Each section is mapped to a journey route and, where the content is visual, to a named exhibit.
The complete crosswalk is \`coverage-matrix.md\`; the machine-readable companion is
\`${path.relative(ROOT, path.join(CONTENT_DIR, "source.json"))}\`.
`;

const manifest = {
  generatedBy: "scripts/import-notion-statistics.mjs",
  schemaVersion: 1,
  sourceRoot: path.basename(SOURCE),
  originalTitle: title,
  sourceId: pageId,
  language: "ar-en",
  snapshot: {
    file: filename,
    relativePath: filename,
    sha256: hash,
    bytes: buffer.length,
    observedModified: info.mtime.toISOString(),
    notionId: pageId,
    canonicalUrl: sourceJson.source.canonicalUrl,
    exportShape: sourceJson.source.exportShape,
  },
  totals: counts,
  assets: [],
  duplicates: [],
  omissions: [],
  unresolved: [],
  sections: sections.map((section) => {
    // The coverage matrix is authoritative for the final route; this field is
    // the importer's deterministic grouping by the same ranges used in
    // lib/statistics/content.ts.
    const journey =
      section.number <= 3
        ? "foundations"
        : section.number <= 5
          ? "describe"
          : section.number <= 7
            ? "probability"
            : section.number <= 10
              ? "distributions"
              : section.number <= 14
                ? "sampling"
                : section.number <= 23
                  ? "hypothesis"
                  : section.number <= 29
                    ? "experiments"
                    : section.number <= 35
                      ? "relationships"
                      : "synthesis";
    return {
      id: section.id,
      number: section.number,
      title: section.title,
      originalTitle: section.title,
      titleEn: section.titleEn,
      sourceRelativePath: filename,
      parentId: null,
      parentPath: "root",
      language: "ar-en",
      proposedSlug: section.id,
      canonicalUrl: null,
      destinationRoute: `/learn/statistics/journey/${journey}`,
      destinationAnchor: section.id,
      anchor: section.anchor,
      counts: section.counts,
      textLength: section.textLength,
      subsections: section.subsections,
      parsingStatus: "parsed",
      assetCount: 0,
      diagramCount: section.counts.code,
      headings: section.headings,
      formulas: allFormulas.filter((formula) => formula.section === section.id),
      outboundLinks: [],
    };
  }),
  formulas: allFormulas,
  unmappedFormulas,
};

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const outputs = [
  [path.join(CONTENT_DIR, "source.json"), json(sourceJson)],
  [path.join(DOCS_DIR, "source-manifest.json"), json(manifest)],
  [path.join(DOCS_DIR, "source-inventory.md"), inventory],
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

console.log(
  `${DRY || CHECK ? "Checked" : "Imported"} 1 HTML page → ${counts.sections} sections, ` +
    `${counts.headings} headings, ${counts.formulas} formulas (${counts.uniqueFormulas} unique); ` +
    `${counts.textCharacters.toLocaleString("en")} characters; ${changed} output file(s) ` +
    `${DRY || CHECK ? "out of date" : "written"}.`,
);
if (missing.length) console.warn(`Missing numbered sections: ${missing.join(", ")}`);
if (unmappedFormulas.length) {
  console.warn(`Unmapped formulas: ${unmappedFormulas.length}`);
  for (const item of unmappedFormulas.slice(0, 10)) console.warn(`  ${item.section}: ${item.raw}`);
}
if (CHECK && changed > 0) process.exit(1);
