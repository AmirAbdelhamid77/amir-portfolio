/**
 * Compiled article data loader (FC05). SERVER-ONLY, build-time fs — never
 * import from a client component (see ./registry.ts for the contract).
 *
 * Reads the compiled typed-node JSON for ONE published article from the build
 * workspace compiler output, addressed through the route registry row (never
 * by reconstructing file paths from slugs, because intra-family paths carry
 * the disambiguating subdirectories).
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  fabricCorpusBuildDir,
  findPublishedArticle,
  type RegistryArticle,
} from "./registry.ts";

/** Front matter of a compiled node (subset the pages consume). */
export interface ArticleFrontMatter {
  title: string;
  description: string | null;
  /** Free-form front matter keys are preserved for provenance but only the
   *  two above are published into metadata. */
  raw: Record<string, unknown>;
}

/** One compiled typed node (block). Shape per hansa.fabric-compiler/compiled-node. */
export interface CompiledBlock {
  type: string;
  [field: string]: unknown;
}

export interface ArticleData {
  row: RegistryArticle;
  frontMatter: ArticleFrontMatter;
  blocks: CompiledBlock[];
  /** Resolved [!INCLUDE] fragment bodies, keyed by the include's resolved
   *  docs-relative path ('docs/<family>/<path>.md'). The renderer inlines
   *  these so published articles keep their full content (handover 03:
   *  render complete article bodies). */
  includes: Map<string, IncludeFragment>;
  /** Heading slug set for same-page anchor validation. */
  headingSlugs: string[];
  quarantine: { blocked: boolean; reasons: string[] };
  compiler: { name: string; version: string };
}

export interface IncludeFragment {
  sourcePath: string;
  sha256: string;
  blocks: CompiledBlock[];
  blocked: boolean;
  blockedReason: string | null;
}

/** Thrown when a route's article data cannot be loaded. Pages convert this
 *  into a 404; nothing ever falls back to an empty body. */
export class MissingArticleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingArticleError";
  }
}

/**
 * Load the compiled node for a published route: `family` + intra-family
 * article segments (as Next hands catch-all params over: string[] or a
 * single string for top-level articles).
 */
export function getArticleData(
  family: string,
  article: string | string[],
): ArticleData {
  const segments = Array.isArray(article) ? article : [article];
  const row = findPublishedArticle(family, segments);
  if (!row) {
    throw new MissingArticleError(
      `no published fabric article for /learn/fabric/docs/${family}/${segments.join("/")}/ — ` +
        "the route registry is the only publication source (fail-closed).",
    );
  }
  return loadCompiledNode(row);
}

function loadCompiledNode(row: RegistryArticle): ArticleData {
  const abs = path.join(fabricCorpusBuildDir(), "compiler-output", ...row.nodeFile.split("/"));
  if (!existsSync(abs)) {
    throw new MissingArticleError(
      `compiled node missing for ${row.articleId}: ${abs}. Re-run ` +
        "tools/fabric-corpus/route-registry/compile-all-families.mjs before building.",
    );
  }
  const node = JSON.parse(readFileSync(abs, "utf8")) as {
    frontMatter?: { data?: Record<string, unknown> };
    nodes?: CompiledBlock[];
    quarantine?: { blocked?: boolean; reasons?: string[] };
    compiler?: { name?: string; version?: string };
  };

  if (node.quarantine?.blocked) {
    // The registry excludes quarantined articles; a blocked node reaching the
    // loader means the registry and the compiler output disagree — fail.
    throw new MissingArticleError(
      `compiled node for ${row.articleId} is quarantined but its registry row is published — regenerate the registry.`,
    );
  }

  const data = node.frontMatter?.data ?? {};
  const rawTitle = typeof data.title === "string" && data.title.trim() !== "" ? data.title.trim() : null;
  const rawDescription =
    typeof data.description === "string" && data.description.trim() !== ""
      ? data.description.trim()
      : null;

  const headingSlugs: string[] = [];
  for (const block of node.nodes ?? []) {
    if (block.type === "heading" && typeof block.slug === "string") {
      headingSlugs.push(block.slug);
    }
  }

  const includes = resolveIncludes(node.nodes ?? [], new Set(), 0);

  return {
    row,
    frontMatter: {
      title: rawTitle ?? row.title,
      description: rawDescription,
      raw: data,
    },
    blocks: node.nodes ?? [],
    includes,
    headingSlugs,
    quarantine: { blocked: false, reasons: [] },
    compiler: { name: node.compiler?.name ?? "hansa-fabric-compiler", version: node.compiler?.version ?? "0" },
  };
}

const MAX_INCLUDE_DEPTH = 5;

/**
 * Resolve [!INCLUDE] markers against the compiled fragment nodes in the
 * build workspace. Every resolved fragment is loaded recursively (bounded
 * depth, sha-guarded against cycles); blocked markers are kept so the
 * renderer can show an honest notice instead of content.
 */
function resolveIncludes(
  blocks: CompiledBlock[],
  seenSha: Set<string>,
  depth: number,
): Map<string, IncludeFragment> {
  const map = new Map<string, IncludeFragment>();
  if (depth > MAX_INCLUDE_DEPTH) return map;
  for (const block of blocks) {
    if (block.type !== "include") {
      const nested = (block.children ?? block.items) as CompiledBlock[] | undefined;
      if (Array.isArray(nested)) {
        for (const [key, fragment] of resolveIncludes(nested, seenSha, depth + 1)) {
          if (!map.has(key)) map.set(key, fragment);
        }
      }
      continue;
    }
    const resolved = typeof block.resolved === "string" ? block.resolved : null;
    const key = resolved ? `docs/${resolved}` : null;
    if (key === null || map.has(key)) continue;
    if (block.blocked === true) {
      map.set(key, {
        sourcePath: key,
        sha256: "",
        blocks: [],
        blocked: true,
        blockedReason:
          typeof block.blockedReason === "string" ? block.blockedReason : "include-blocked",
      });
      continue;
    }
    // Compiled fragment nodes live at
    // compiler-output/<family>/nodes/<docs-relative path>.json.
    const resolvedPath = typeof resolved === "string" ? resolved.replace(/\.md$/i, ".json").split("/") : null;
    const fragmentAbs =
      resolvedPath && resolvedPath.length >= 2
        ? path.join(fabricCorpusBuildDir(), "compiler-output", resolvedPath[0], "nodes", ...resolvedPath)
        : null;
    if (fragmentAbs === null || !existsSync(fragmentAbs)) {
      // Registry load would have failed for a missing article node; fragment
      // nodes are supplementary — an honest notice, never a silent drop.
      map.set(key, {
        sourcePath: key,
        sha256: "",
        blocks: [],
        blocked: true,
        blockedReason: "fragment-node-missing",
      });
      continue;
    }
    const raw = readFileSync(fragmentAbs, "utf8");
    const fragment = JSON.parse(raw) as { nodes?: CompiledBlock[] };
    const sha =
      typeof block.fragmentSha256 === "string" ? block.fragmentSha256 : createHash("sha256").update(raw).digest("hex");
    if (seenSha.has(sha)) continue; // cycle guard on content identity
    seenSha.add(sha);
    map.set(key, {
      sourcePath: key,
      sha256: sha,
      blocks: fragment.nodes ?? [],
      blocked: false,
      blockedReason: null,
    });
    const nested = resolveIncludes(fragment.nodes ?? [], seenSha, depth + 1);
    for (const [nestedKey, nestedFragment] of nested) {
      if (!map.has(nestedKey)) map.set(nestedKey, nestedFragment);
    }
  }
  return map;
}
