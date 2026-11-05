// FC06 — shared fixtures for the binding tests.
//
//   node --experimental-strip-types --test tests/fabric-corpus/bindings/
//
// The route registry is a read-only input produced by FC05's
// tools/fabric-corpus/route-registry build (frozen at commit e35724c); the
// binding artifacts are FC06's committed content. Both are loaded with fs —
// no JSON imports, no @/ aliases (repo test conventions).

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SUBJECTS } from "../../../lib/study/taxonomy.ts";
import * as bindings from "../../../lib/fabric/bindings.ts";

export { bindings };

export const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "..", "..", "..");

export const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");
export const registryPath = path.join(buildDir, "route-registry", "route-registry.json");
export const REGISTRY_AVAILABLE = existsSync(registryPath);
export const registry = REGISTRY_AVAILABLE ? JSON.parse(readFileSync(registryPath, "utf8")) : null;

export const contentFabricDir = path.join(repoRoot, "content", "fabric");
export const primaryPath = path.join(contentFabricDir, "bindings", "primary.json");
export const secondaryPath = path.join(contentFabricDir, "bindings", "secondary.json");
export const collectionsPath = path.join(contentFabricDir, "collections", "collections.json");

export const primary = JSON.parse(readFileSync(primaryPath, "utf8"));
export const secondary = JSON.parse(readFileSync(secondaryPath, "utf8"));
export const collections = JSON.parse(readFileSync(collectionsPath, "utf8"));

/** Published registry rows as a Map articleId → registry row. */
export function publishedArticles() {
  const map = new Map();
  for (const family of registry.families) {
    for (const article of family.articles) {
      if (article.published) map.set(article.articleId, article);
    }
  }
  return map;
}

/** Valid subject.topic pairs from the live taxonomy module. */
export function validTargets() {
  const targets = new Set();
  for (const subject of SUBJECTS) {
    for (const [topic] of subject.topics) targets.add(`${subject.id}.${topic}`);
  }
  return targets;
}

export function fabricTopicIds() {
  const fabric = SUBJECTS.find((subject) => subject.id === "fabric");
  return new Set(fabric.topics.map(([id]) => id));
}
