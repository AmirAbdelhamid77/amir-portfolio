#!/usr/bin/env node
// Split the verified static export into the two Workers asset trees.
//
// `out-main` keeps every file except `/learn/fabric/**`; `out-docs` keeps the
// documentation subtree plus the shared 404/header files. The public hostname
// stays on `hansa`; `workers/gateway.mjs` forwards docs paths to `hansa-docs`.
//
// The trees are hardlinked where the filesystem allows it, so the split does
// not duplicate the 3.1 GB export on disk. A copy fallback keeps the script
// working across filesystems. Both trees are generated and gitignored.
//
// Usage:
//   node scripts/prepare-split-workers.mjs [--from=out] [--docs=out-docs]
//     [--main=out-main] [--report=.wrangler-split-report.json]
import {
  copyFileSync,
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const DOCS_PREFIX = "learn/fabric/";
export const SHARED_PATHS = ["404.html", "_headers", "_redirects"];
export const WORKERS_FREE_FILE_LIMIT = 20_000;

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function classify(relPath) {
  const path = relPath.split(sep).join("/");
  if (path.startsWith(DOCS_PREFIX)) return "docs";
  if (SHARED_PATHS.includes(path)) return "shared";
  return "main";
}

export function planSplit(paths) {
  const plan = { docs: [], main: [], shared: [] };
  for (const path of [...paths].sort()) plan[classify(path)].push(path);
  return plan;
}

export function fileCounts(plan) {
  return {
    docs: plan.docs.length + plan.shared.length,
    main: plan.main.length + plan.shared.length,
    shared: plan.shared.length,
    source: plan.docs.length + plan.main.length + plan.shared.length,
  };
}

export function assertCounts(counts, limit = WORKERS_FREE_FILE_LIMIT) {
  if (counts.docs >= limit) {
    throw new Error(`docs Worker has ${counts.docs} files; the Free limit is ${limit}`);
  }
  if (counts.main >= limit) {
    throw new Error(`main Worker has ${counts.main} files; the Free limit is ${limit}`);
  }
}

function walk(root, dir = root) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(root, absolute));
    else if (entry.isFile()) files.push(relative(root, absolute).split(sep).join("/"));
    else throw new Error(`unsupported export entry: ${absolute}`);
  }
  return files;
}

function assertSafeOutput(from, target, label) {
  const source = resolve(from);
  const output = resolve(target);
  const outputPrefix = output.endsWith(sep) ? output : output + sep;
  if (output === dirname(output)) throw new Error(`${label} output cannot be a filesystem root`);
  if (output === source) throw new Error(`${label} output cannot be the export root`);
  if (output.startsWith(source + sep)) throw new Error(`${label} output cannot be inside the export`);
  if (source.startsWith(outputPrefix)) throw new Error(`export cannot be inside the ${label} output`);
}

function linkOrCopy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  try {
    linkSync(from, to);
    return "link";
  } catch (error) {
    if (!["EXDEV", "EPERM", "EACCES", "EMLINK"].includes(error.code)) throw error;
    copyFileSync(from, to);
    return "copy";
  }
}

export function splitExport({
  from = join(REPO_ROOT, "out"),
  docs = join(REPO_ROOT, "out-docs"),
  main = join(REPO_ROOT, "out-main"),
  limit = WORKERS_FREE_FILE_LIMIT,
} = {}) {
  if (!existsSync(from)) throw new Error(`static export is missing at ${from}; run the build first`);
  assertSafeOutput(from, docs, "docs");
  assertSafeOutput(from, main, "main");

  const paths = walk(from);
  const plan = planSplit(paths);
  const counts = fileCounts(plan);
  assertCounts(counts, limit);

  for (const [target, entries] of [
    [docs, [...plan.docs, ...plan.shared]],
    [main, [...plan.main, ...plan.shared]],
  ]) {
    rmSync(target, { recursive: true, force: true });
    mkdirSync(target, { recursive: true });
    for (const path of entries) {
      const source = join(from, ...path.split("/"));
      const destination = join(target, ...path.split("/"));
      linkOrCopy(source, destination);
      const before = statSync(source);
      const after = statSync(destination);
      if (before.size !== after.size) throw new Error(`size mismatch after split: ${path}`);
      if (after.ino !== 0 && before.ino !== 0 && after.ino !== before.ino) {
        // A copy fallback cannot share an inode; verify the bytes instead.
        const digest = file => createHash("sha256").update(readFileSync(file)).digest("hex");
        if (digest(source) !== digest(destination)) throw new Error(`content mismatch after split: ${path}`);
      }
    }
  }

  return { from, docs, main, counts, plan };
}

function parseArgs(argv) {
  const args = {
    from: join(REPO_ROOT, "out"),
    docs: join(REPO_ROOT, "out-docs"),
    main: join(REPO_ROOT, "out-main"),
    report: null,
  };
  for (const raw of argv) {
    const match = /^--(from|docs|main|report)=(.*)$/.exec(raw);
    if (!match) throw new Error(`prepare-split-workers: unsupported argument ${raw}`);
    args[match[1]] = resolve(match[2]);
  }
  return args;
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const args = parseArgs(process.argv.slice(2));
  const result = splitExport(args);
  const report = {
    source: relative(REPO_ROOT, result.from).split(sep).join("/"),
    docs: relative(REPO_ROOT, result.docs).split(sep).join("/"),
    main: relative(REPO_ROOT, result.main).split(sep).join("/"),
    docsPrefix: DOCS_PREFIX,
    shared: SHARED_PATHS.filter(path => result.plan.shared.includes(path)),
    files: result.counts,
    workersFreeLimit: WORKERS_FREE_FILE_LIMIT,
  };
  if (args.report) writeFileSync(args.report, JSON.stringify(report, null, 2) + "\n");
  console.log(
    `PASS split export: docs=${report.files.docs} main=${report.files.main} ` +
      `shared=${report.files.shared} source=${report.files.source} ` +
      `limit=${report.workersFreeLimit}`,
  );
}
