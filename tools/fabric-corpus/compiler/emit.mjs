// Hansa fabric-corpus compiler — deterministic emission (FC03).
//
// All compiler output is serialized with a canonical JSON writer: object
// keys are sorted recursively (arrays keep their order), no whitespace,
// trailing newline. Combined with sorted file walks and a fixed compiler
// version this makes the output byte-reproducible for the same inputs.
// No clocks, no absolute paths, no randomness in emitted artifacts.

import { createHash } from 'node:crypto';
import { COMPILER_NAME, COMPILER_VERSION } from './parse.mjs';

export const SCHEMA_COMPILED_NODE = 'hansa.fabric-compiler/compiled-node';
export const SCHEMA_FAMILY_MANIFEST = 'hansa.fabric-compiler/family-manifest';
export const SCHEMA_RECEIPT = 'hansa.fabric-compiler/receipt';
export const ARTIFACT_VERSION = 1;

export { COMPILER_NAME, COMPILER_VERSION };

// ---------------------------------------------------------------------------
// Hashing and canonical JSON
// ---------------------------------------------------------------------------

export function sha256Text(text) {
  return createHash('sha256').update(String(text), 'utf8').digest('hex');
}

export function sha256Buffer(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** Canonical JSON: recursively sorted object keys, arrays in order. */
export function canonicalStringify(value) {
  if (value === undefined) {
    throw new TypeError('canonicalStringify: undefined is not representable');
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(value[k])}`).join(',')}}`;
}

/** Canonical JSON document bytes (with trailing newline). */
export function emitJson(value) {
  return `${canonicalStringify(value)}\n`;
}

// ---------------------------------------------------------------------------
// Artifact builders
// ---------------------------------------------------------------------------

function countByType(nodes) {
  const byType = {};
  const walk = (list) => {
    for (const node of list) {
      byType[node.type] = (byType[node.type] ?? 0) + 1;
      if (Array.isArray(node.children)) walk(node.children);
      if (node.type === 'list') {
        for (const item of node.items) {
          if (Array.isArray(item.children)) walk(item.children);
        }
      }
    }
  };
  walk(nodes);
  return byType;
}

function collectUnsupported(nodes) {
  const out = [];
  const walk = (list) => {
    for (const node of list) {
      if (node.type === 'unsupported' || node.type === 'htmlRemoved' || node.type === 'inlineHtmlRemoved') {
        out.push(node);
      }
      if (Array.isArray(node.children)) walk(node.children);
      if (node.type === 'list') {
        for (const item of node.items) {
          if (Array.isArray(item.children)) walk(item.children);
        }
      }
    }
  };
  walk(nodes);
  return out;
}

function collectCommentedDirectives(nodes) {
  const out = [];
  const walk = (list) => {
    for (const node of list) {
      if (node.type === 'commentedDirective') out.push(node);
      if (Array.isArray(node.children)) walk(node.children);
      if (node.type === 'list') {
        for (const item of node.items) {
          if (Array.isArray(item.children)) walk(item.children);
        }
      }
    }
  };
  walk(nodes);
  return out;
}

/**
 * Build the compiled-node artifact for one source file.
 * All paths are corpus-relative posix; no absolute paths, no timestamps.
 */
export function buildCompiledNode({ sourcePath, sourceSha256, sourceSizeBytes, parsed, graph, sanitizeLog }) {
  const quarantineEntries = [...graph.quarantines];
  const blockedNodes = [];
  const markBlocked = (list) => {
    for (const node of list) {
      if (node.type === 'include' && node.blocked === true) {
        blockedNodes.push(node);
      }
      if (Array.isArray(node.children)) markBlocked(node.children);
      if (node.type === 'list') {
        for (const item of node.items) {
          if (Array.isArray(item.children)) markBlocked(item.children);
        }
      }
    }
  };
  markBlocked(parsed.nodes);

  const unsupported = collectUnsupported(parsed.nodes);
  const commented = collectCommentedDirectives(parsed.nodes);

  const frontMatter = parsed.frontMatter
    ? {
        present: true,
        data: parsed.frontMatter.data,
        raw: parsed.frontMatter.raw,
        comments: parsed.frontMatter.comments,
        yamlError: null,
        span: parsed.frontMatter.span,
      }
    : { present: false, data: null, raw: null, comments: [], yamlError: null, span: null };

  const byType = countByType(parsed.nodes);
  const blockCount = Object.values(byType).reduce((a, b) => a + b, 0);

  const artifact = {
    schema: SCHEMA_COMPILED_NODE,
    version: ARTIFACT_VERSION,
    compiler: { name: COMPILER_NAME, version: COMPILER_VERSION },
    source: { path: sourcePath, sha256: sourceSha256, sizeBytes: sourceSizeBytes },
    frontMatter,
    nodes: parsed.nodes,
    quarantine: {
      blocked: quarantineEntries.length > 0,
      reasons: [...new Set(quarantineEntries.map((q) => q.reason))].sort(),
      entries: quarantineEntries,
      blockedIncludeNodes: blockedNodes.map((n) => ({ target: n.target, reason: n.blockedReason, span: n.span })),
    },
    counts: {
      blocks: blockCount,
      byType,
      dependencyEdges: graph.edges.length,
      sanitizationActions: sanitizeLog.length,
      unsupported: unsupported.length,
      commentedDirectives: commented.length,
    },
  };
  // Auxiliary lists for the receipt (not part of the compiled-node schema).
  return { artifact, unsupported, commentedDirectives: commented };
}

/**
 * Build the family manifest. `files` entries carry per-file output checksums
 * (nodes/*.json) so downstream consumers can verify integrity without the
 * receipt.
 */
export function buildFamilyManifest({ family, corpusRevision, files, nodeChecksums }) {
  return {
    schema: SCHEMA_FAMILY_MANIFEST,
    version: ARTIFACT_VERSION,
    compiler: { name: COMPILER_NAME, version: COMPILER_VERSION },
    family,
    corpusRevision: corpusRevision ?? null,
    files: files.map((f) => ({
      path: f.path,
      sha256: f.sha256,
      sizeBytes: f.sizeBytes,
      nodeFile: f.nodeFile,
      nodeSha256: nodeChecksums[f.nodeFile],
      nodeCount: f.nodeCount,
      frontMatterKeys: f.frontMatterKeys,
      quarantined: f.quarantined,
      quarantineReasons: f.quarantineReasons,
    })),
    totals: {
      files: files.length,
      nodes: files.reduce((a, f) => a + f.nodeCount, 0),
      quarantinedFiles: files.filter((f) => f.quarantined).length,
      dependencyEdges: files.reduce((a, f) => a + f.edgeCount, 0),
    },
    checksums: Object.fromEntries(
      Object.entries(nodeChecksums).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    ),
  };
}

/**
 * Build the compile receipt. Includes per-file accounting: source sha256,
 * transforms applied, blocks removed, quarantine reasons, dependency edges,
 * unsupported constructs and commented directives.
 */
export function buildReceipt({ family, corpusRevision, fileEntries }) {
  const unsupportedCounts = new Map();
  const quarantineCounts = new Map();
  let sanitizationTotal = 0;
  let edgeTotal = 0;
  let commentedTotal = 0;
  for (const fe of fileEntries) {
    for (const u of fe.unsupported) {
      const key = `${u.type}:${u.reason ?? u.detail ?? 'n/a'}`;
      unsupportedCounts.set(key, (unsupportedCounts.get(key) ?? 0) + 1);
    }
    for (const q of fe.quarantineEntries) {
      quarantineCounts.set(q.reason, (quarantineCounts.get(q.reason) ?? 0) + 1);
    }
    sanitizationTotal += fe.sanitizationLog.length;
    edgeTotal += fe.edges.length;
    commentedTotal += fe.commentedDirectives.length;
  }
  const unsupportedSummary = [...unsupportedCounts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => (b.count - a.count) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const quarantineSummary = [...quarantineCounts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => (b.count - a.count) || (a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0));

  return {
    schema: SCHEMA_RECEIPT,
    version: ARTIFACT_VERSION,
    compiler: { name: COMPILER_NAME, version: COMPILER_VERSION },
    family,
    corpusRevision: corpusRevision ?? null,
    files: fileEntries.map((fe) => ({
      path: fe.path,
      sha256: fe.sha256,
      sizeBytes: fe.sizeBytes,
      parseWarnings: fe.parseWarnings,
      quarantined: fe.quarantined,
      quarantineEntries: fe.quarantineEntries,
      sanitizationLog: fe.sanitizationLog,
      edges: fe.edges,
      unsupported: fe.unsupported.map((u) => ({ type: u.type, reason: u.reason ?? null, detail: u.detail ?? null, snippet: u.snippet ?? null, span: u.span, removedSha256: u.removedRaw ? sha256Text(u.removedRaw) : null })),
      commentedDirectives: fe.commentedDirectives.map((cd) => ({
        span: cd.span,
        directiveText: cd.directiveText,
        ...(cd.viaInclude !== undefined ? { viaInclude: cd.viaInclude } : {}),
      })),
      counts: fe.counts,
    })),
    totals: {
      files: fileEntries.length,
      quarantinedFiles: fileEntries.filter((f) => f.quarantined).length,
      dependencyEdges: edgeTotal,
      sanitizationActions: sanitizationTotal,
      unsupported: fileEntries.reduce((a, f) => a + f.unsupported.length, 0),
      commentedDirectives: commentedTotal,
    },
    unsupportedSummary,
    quarantineSummary,
  };
}
