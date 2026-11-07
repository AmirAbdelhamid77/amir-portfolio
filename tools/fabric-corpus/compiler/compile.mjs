#!/usr/bin/env node
// Hansa fabric-corpus compiler — CLI (FC03).
//
// Compiles ONE family directory of the pinned corpus end-to-end:
//   node tools/fabric-corpus/compiler/compile.mjs <corpusRoot> <outDir> <family> [--revision <sha>]
//
// Example (real batch proof):
//   node tools/fabric-corpus/compiler/compile.mjs D:/BeUI/fabric-docs-light/docs ^
//     D:/BeUI/fabric-corpus-build/compiler-output fundamentals --revision 774592ea...
//
// Outputs (deterministic, canonical JSON, no absolute paths, no clocks):
//   <outDir>/<family>/nodes/<path>.json   compiled typed nodes per source file
//   <outDir>/<family>/manifest.json       family manifest with checksums
//   <outDir>/<family>/receipt.json        compile receipt (accounting)
//
// Exit codes: 0 = clean; 1 = compiled but some nodes are quarantined
// (fail-closed: receipt and accounting are still written); 2 = usage error.
// Nothing is ever deployed or published by this command.

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { parseSource } from './parse.mjs';
import { buildDependencyGraph } from './deps.mjs';
import { sanitizeDocument } from './sanitize.mjs';
import {
  buildCompiledNode,
  buildFamilyManifest,
  buildReceipt,
  emitJson,
  sha256Buffer,
  COMPILER_NAME,
  COMPILER_VERSION,
} from './emit.mjs';

function usage() {
  process.stderr.write('usage: compile.mjs <corpusRoot> <outDir> <family> [--revision <sha>]\n');
}

/** Recursively collect *.md files under absDir, sorted by corpus-relative
 *  posix path. Sorting is codepoint order for determinism. */
function walkMarkdownFiles(absDir, relBase = '') {
  const out = [];
  const entries = readdirSync(absDir, { withFileTypes: true });
  const sorted = entries
    .map((e) => ({ name: e.name, isDir: e.isDirectory(), isFile: e.isFile() }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of sorted) {
    const abs = join(absDir, entry.name);
    const rel = relBase === '' ? entry.name : `${relBase}/${entry.name}`;
    if (entry.isDir) out.push(...walkMarkdownFiles(abs, rel));
    else if (entry.isFile && entry.name.toLowerCase().endsWith('.md')) out.push({ abs, rel });
  }
  return out;
}

function collectFrontMatterKeys(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return [];
  return Object.keys(data).sort();
}

/**
 * Compile one family. Pure with respect to inputs: same corpus bytes and
 * revision produce byte-identical returned artifacts.
 */
export function compileFamily({ corpusRootAbs, family, corpusRevision = null }) {
  if (statSync(corpusRootAbs, { throwIfNoEntry: false })?.isDirectory() !== true) {
    throw new Error(`corpus root not found: ${corpusRootAbs}`);
  }
  const familyDirAbs = join(corpusRootAbs, family);
  if (statSync(familyDirAbs, { throwIfNoEntry: false })?.isDirectory() !== true) {
    throw new Error(`family directory not found under corpus root: ${family}`);
  }

  const io = {
    exists: (relPath) => existsSync(join(corpusRootAbs, relPath)),
    readText: (relPath) => readFileSync(join(corpusRootAbs, relPath), 'utf8'),
    joinRoot: (relPath) => join(corpusRootAbs, relPath),
  };

  const files = walkMarkdownFiles(familyDirAbs, family);
  const fileEntries = [];
  const manifestFiles = [];
  const nodeChecksums = {};
  const nodeJsonByName = new Map();

  for (const file of files) {
    const bytes = readFileSync(file.abs);
    const sourceSha256 = sha256Buffer(bytes);
    const text = bytes.toString('utf8');
    const parsed = parseSource(text);

    const graph = buildDependencyGraph({
      sourceRelPath: file.rel,
      nodes: parsed.nodes,
      parserWarnings: parsed.warnings,
      io,
      allowedRoots: [''],
    });

    const { log: sanitizationLog } = sanitizeDocument(parsed.nodes);

    const { artifact: compiled, unsupported, orphanConstructEnds } = buildCompiledNode({
      sourcePath: file.rel,
      sourceSha256,
      sourceSizeBytes: bytes.length,
      parsed,
      graph,
      sanitizeLog: sanitizationLog,
    });

    const nodeFile = `nodes/${file.rel.replace(/\.md$/i, '.json')}`;
    const json = emitJson(compiled);
    nodeJsonByName.set(nodeFile, json);
    nodeChecksums[nodeFile] = sha256Buffer(Buffer.from(json, 'utf8'));

    fileEntries.push({
      path: file.rel,
      sha256: sourceSha256,
      sizeBytes: bytes.length,
      parseWarnings: parsed.warnings,
      quarantined: compiled.quarantine.blocked,
      quarantineEntries: compiled.quarantine.entries,
      sanitizationLog,
      edges: graph.edges,
      unsupported,
      // Chain accounting: the graph list contains this file's commented
      // directives plus ones discovered inside resolved include fragments
      // (viaInclude) — regex-only scanning cannot certify closure.
      commentedDirectives: graph.commentedDirectives,
      dependencyHolds: graph.dependencyHolds,
      orphanConstructEnds,
      counts: compiled.counts,
    });

    manifestFiles.push({
      path: file.rel,
      sha256: sourceSha256,
      sizeBytes: bytes.length,
      nodeFile,
      nodeCount: parsed.nodes.length,
      frontMatterKeys: collectFrontMatterKeys(parsed.frontMatter?.data ?? null),
      quarantined: compiled.quarantine.blocked,
      quarantineReasons: compiled.quarantine.reasons,
      edgeCount: graph.edges.length,
    });
  }

  const manifest = buildFamilyManifest({ family, corpusRevision, files: manifestFiles, nodeChecksums });
  const receipt = buildReceipt({ family, corpusRevision, fileEntries });

  return {
    nodeJsonByName,
    manifestJson: emitJson(manifest),
    receiptJson: emitJson(receipt),
    manifest,
    receipt,
  };
}

/** Write artifacts into outDirAbs (family output dir is cleared first). */
export function writeOutputs({ result, outDirAbs, family }) {
  const familyOutDir = join(outDirAbs, family);
  rmSync(familyOutDir, { recursive: true, force: true });
  mkdirSync(join(familyOutDir, 'nodes'), { recursive: true });
  for (const [nodeFile, json] of result.nodeJsonByName) {
    const absTarget = join(familyOutDir, ...nodeFile.split('/'));
    mkdirSync(dirname(absTarget), { recursive: true });
    writeFileSync(absTarget, json, 'utf8');
  }
  writeFileSync(join(familyOutDir, 'manifest.json'), result.manifestJson, 'utf8');
  writeFileSync(join(familyOutDir, 'receipt.json'), result.receiptJson, 'utf8');
  return familyOutDir;
}

function main(argv) {
  const args = [...argv];
  let revision = null;
  const positional = [];
  while (args.length > 0) {
    const a = args.shift();
    if (a === '--revision') {
      revision = args.shift() ?? null;
      if (revision === null) {
        usage();
        process.stderr.write('--revision requires a value\n');
        process.exit(2);
        return;
      }
    } else if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
      return;
    } else {
      positional.push(a);
    }
  }
  const [corpusRoot, outDir, family] = positional;
  if (!corpusRoot || !outDir || !family) {
    usage();
    process.exit(2);
    return;
  }

  const corpusRootAbs = resolve(process.cwd(), corpusRoot);
  const outDirAbs = resolve(process.cwd(), outDir);

  let result;
  try {
    result = compileFamily({ corpusRootAbs, family, corpusRevision: revision });
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n`);
    process.exit(2);
    return;
  }

  const familyOutDir = writeOutputs({ result, outDirAbs, family });

  const t = result.receipt.totals;
  process.stdout.write(
    `compiler=${COMPILER_NAME}@${COMPILER_VERSION} family="${family}" ` +
    `files=${t.files} quarantinedFiles=${t.quarantinedFiles} ` +
    `edges=${t.dependencyEdges} sanitizations=${t.sanitizationActions} ` +
    `unsupported=${t.unsupported} commentedDirectives=${t.commentedDirectives}\n` +
    `output: ${[outDirAbs, family].join('/')}\n`,
  );
  process.exit(t.quarantinedFiles > 0 ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
