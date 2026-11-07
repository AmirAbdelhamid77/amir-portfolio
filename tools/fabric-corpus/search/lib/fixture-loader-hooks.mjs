// Module-resolution hooks used ONLY by the FC07 fixture-generation script
// (tools/fabric-corpus/search/generate-merge-fixture.mjs).
//
// The site metadata index (lib/search/documents.ts → lib/study/**) uses the
// app's `@/` import alias, extensionless relative imports and JSON imports —
// all fine under Next, but none of them loadable by
// `node --experimental-strip-types` directly. These hooks bridge that gap for
// fixture generation only; tests themselves import pure modules (lib/search/
// query.ts) and never rely on these hooks (repo test convention: no @/
// aliases, no JSON imports in test-imported modules).
//
// Deterministic: pure path mapping, no I/O beyond existence checks.
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve as pathResolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
/** Repo root: tools/fabric-corpus/search/lib → repo root. */
export const REPO_ROOT = pathResolve(HERE, "..", "..", "..", "..");

const EXTENSION_CANDIDATES = [
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  "/index.ts",
  "/index.tsx",
  "/index.js",
];

function resolveWithExtensions(absNoExt) {
  // The mapped path may already carry a real extension (@/content/…/x.json).
  if (/\.(ts|tsx|js|mjs|json)$/.test(absNoExt) && existsSync(absNoExt) && statSync(absNoExt).isFile()) {
    return absNoExt;
  }
  for (const candidate of EXTENSION_CANDIDATES) {
    const full = absNoExt + candidate;
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

export async function initialize() {}

export function resolve(specifier, context, nextResolve) {
  let mapped = null;
  if (specifier.startsWith("@/")) {
    mapped = join(REPO_ROOT, specifier.slice(2));
  } else if (specifier.startsWith(".") || specifier.startsWith("/")) {
    // Relative specifiers: let Node resolve the directory first, then try
    // extension candidates against the parent dir + specifier.
    try {
      const parent = context.parentURL ? fileURLToPath(context.parentURL) : null;
      if (parent) {
        const base = pathResolve(dirname(parent), specifier);
        mapped = resolveWithExtensions(base);
      }
    } catch {
      mapped = null;
    }
    if (mapped) {
      const url = pathToFileURL(mapped).href;
      if (mapped.endsWith(".json")) {
        // JSON modules: the loaders import without `with { type: "json" }`.
        return { url, format: "json", shortCircuit: true };
      }
      return { url, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  } else {
    return nextResolve(specifier, context);
  }

  if (mapped) {
    const withExt = resolveWithExtensions(mapped);
    if (!withExt) {
      throw new Error(`fixture-loader-hooks: cannot resolve ${specifier} (looked under ${mapped})`);
    }
    const url = pathToFileURL(withExt).href;
    if (withExt.endsWith(".json")) {
      return { url, format: "json", shortCircuit: true };
    }
    return { url, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

/**
 * JSON modules load as `export default <literal>`: the app's loaders import
 * JSON without `with { type: "json" }` (webpack accepts that; Node does not),
 * so the load hook supplies the attribute-free form. Deterministic: raw file
 * bytes in, one ES module out.
 */
export function load(url, context, nextLoad) {
  if (url.startsWith("file://") && url.endsWith(".json")) {
    const abs = fileURLToPath(url);
    const source = `export default ${readFileSync(abs, "utf8")};`;
    return { format: "module", source, shortCircuit: true };
  }
  return nextLoad(url, context);
}
