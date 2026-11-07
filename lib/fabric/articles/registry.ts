/**
 * Fabric article route-registry loaders (FC05). SERVER-ONLY: these read the
 * build workspace with fs at BUILD TIME (static export) and must never be
 * imported from a client component — the compiled corpus data stays out of
 * client bundles (handover 03 §"Static routes"; RELEASE_AND_STORAGE.md
 * §"Build-dir contract").
 *
 * Fail-closed contract: a missing registry, a missing family manifest or a
 * missing compiled node THROWS. The docs namespace never silently empties
 * itself (RELEASE_AND_STORAGE.md: "The app build fails closed if the registry
 * or required article data is missing — never silently empties the
 * namespace.").
 *
 * Base path: every URL emitted here is an UNPREFIXED logical path resolved
 * through lib/fabric/paths.ts exactly once at this output boundary
 * (ROUTE_NAMESPACE.md; RELEASE_AND_STORAGE.md §"Delivery profiles").
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  ORIGIN_PLACEHOLDER,
  buildAssetUrl,
  buildPublicUrl,
  validateProfile,
  type DeliveryProfile,
} from "../paths.ts";

/** Registry JSON shape (written by tools/fabric-corpus/route-registry/build-registry.mjs). */
export interface RegistryArticle {
  articleId: string;
  family: string;
  slug: string;
  /** Intra-family route segments from the identity ledger, e.g.
   *  ["ai-functions", "pyspark", "analyze-sentiment"] (ledger
   *  plannedDestination is the authority — basenames collide across
   *  subdirectories). */
  articleSegments: string[];
  sourcePath: string;
  sha256: string;
  title: string;
  description: string | null;
  logicalPath: string;
  /** Compiled node JSON path relative to the build workspace compiler-output
   *  dir, e.g. "fundamentals/nodes/fundamentals/what-is-microsoft-fabric.json". */
  nodeFile: string;
  rightsState: string;
  published: true;
}

export interface RegistryFamily {
  family: string;
  articles: RegistryArticle[];
  counts: { published: number; excluded: number };
}

export interface RegistryExcludedRow {
  articleId: string;
  sourcePath: string;
  reason: string;
  logicalPathIfItWereEligible: string;
}

export interface RegistryAlias {
  from: string;
  to: string;
  kind: "direct" | "chain";
  targetKind: string;
  targetArticleId: string;
  redirectDocumentId: boolean;
}

export interface RouteRegistry {
  schema: string;
  corpusRevision: string;
  routeNamespace: string;
  registryRevision: string;
  families: RegistryFamily[];
  excluded: RegistryExcludedRow[];
  aliases: RegistryAlias[];
  aliasesSuppressed: { from: string; reason: string; targetKind: string }[];
  counts: {
    families: number;
    ledgerArticleRows: number;
    ledgerEligible: number;
    ledgerHolds: number;
    publishedArticles: number;
    excludedArticles: number;
    excludedByReason: Record<string, number>;
    aliases: {
      ledgerRows: number;
      wired: number;
      suppressed: number;
      suppressedByReason: Record<string, number>;
    };
  };
}

/** Per-family copied-asset entry (written by copy-assets.mjs). */
export interface AssetManifestFamily {
  family: string;
  copiedCount: number;
  copiedBytes: number;
  policy: "copied" | "not-copied";
  assets: Record<string, { bytes: number; width: number | null; height: number | null }>;
  suppressed: { sourcePath: string; article: string; reason: string }[];
}

export interface AssetManifest {
  schema: string;
  corpusRevision: string;
  families: Record<string, AssetManifestFamily>;
}

/** The build workspace location (RELEASE_AND_STORAGE.md §"Build-dir contract"). */
export function fabricCorpusBuildDir(): string {
  return path.resolve(
    process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(process.cwd(), "..", "fabric-corpus-build"),
  );
}

function registryPath(): string {
  return path.join(fabricCorpusBuildDir(), "route-registry", "route-registry.json");
}

const registryCache = new Map<string, RouteRegistry>();

/**
 * Load (and cache per process) the route registry. Throws when the registry
 * is missing or malformed — fail-closed, never an empty namespace.
 */
export function getRouteRegistry(): RouteRegistry {
  const dir = fabricCorpusBuildDir();
  const cached = registryCache.get(dir);
  if (cached) return cached;
  const file = registryPath();
  if (!existsSync(file)) {
    throw new Error(
      `fabric route registry missing: ${file}. Run tools/fabric-corpus/route-registry/build-registry.mjs ` +
        "before building the app — the docs namespace fails closed (RELEASE_AND_STORAGE.md).",
    );
  }
  const registry = JSON.parse(readFileSync(file, "utf8")) as RouteRegistry;
  if (!registry || registry.schema !== "hansa.fabric-route-registry/1") {
    throw new Error(`fabric route registry at ${file} has an unknown schema — refusing to publish from it.`);
  }
  if (!Array.isArray(registry.families) || registry.counts?.publishedArticles == null) {
    throw new Error(`fabric route registry at ${file} is malformed — refusing to publish from it.`);
  }
  registryCache.set(dir, registry);
  return registry;
}

/** Every published article row (flat, registry order). */
export function getPublishedArticles(): RegistryArticle[] {
  return getRouteRegistry().families.flatMap((family) => family.articles);
}

/** Registry lookup by docs-relative source path, for the renderer's link
 *  rewriting ('docs/<family>/<path>.md' → local logical route or null). */
export function makeSourcePathLookup(): (corpusDocPath: string) => { logicalPath: string } | null {
  const registry = getRouteRegistry();
  const map = new Map<string, { logicalPath: string }>();
  for (const article of getPublishedArticles()) {
    map.set(article.sourcePath, { logicalPath: article.logicalPath });
  }
  void registry;
  return (corpusDocPath) => map.get(corpusDocPath) ?? null;
}

export function findPublishedArticle(
  family: string,
  segments: string[],
): RegistryArticle | undefined {
  return getPublishedArticles().find(
    (article) => article.family === family && sameSegments(article.articleSegments, segments),
  );
}

function sameSegments(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((part, index) => part === b[index]);
}

const assetManifestCache = new Map<string, AssetManifest | null>();

/**
 * Load the copied-asset manifest (cached per process). Returns null when the
 * manifest has not been generated yet — the renderer then suppresses every
 * image into its accessible fallback (no broken image requests).
 */
export function getAssetManifest(): AssetManifest | null {
  const dir = fabricCorpusBuildDir();
  if (assetManifestCache.has(dir)) return assetManifestCache.get(dir) ?? null;
  const file = path.join(dir, "route-registry", "asset-manifest.json");
  if (!existsSync(file)) {
    assetManifestCache.set(dir, null);
    return null;
  }
  const manifest = JSON.parse(readFileSync(file, "utf8")) as AssetManifest;
  assetManifestCache.set(dir, manifest);
  return manifest;
}

/** The asset manifest entry for one family, or null when the family was not
 *  processed / not copied. */
export function getFamilyAssets(family: string): AssetManifestFamily | null {
  return getAssetManifest()?.families[family] ?? null;
}

/**
 * The frozen-v1 delivery profile for this build, derived from
 * NEXT_PUBLIC_BASE_PATH exactly like next.config.ts derives its basePath.
 * Root profile when unset; subpath shape when a base path is configured.
 */
export function getDeliveryProfile(): DeliveryProfile {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return validateProfile({
    profile: basePath === "" ? "root" : "subpath",
    basePath,
    publicOrigin: ORIGIN_PLACEHOLDER,
    canonicalOrigin: ORIGIN_PLACEHOLDER,
    trailingSlash: true,
    assetOrigin: "",
    robotsPolicy: "canonical",
  });
}

/** Resolve an UNPREFIXED logical page URL for this build (base path once). */
export function publicUrl(logicalPath: string): string {
  return buildPublicUrl(logicalPath, getDeliveryProfile());
}

/** Resolve an UNPREFIXED logical asset URL for this build (base path once). */
export function assetUrl(assetPath: string): string {
  return buildAssetUrl(assetPath, getDeliveryProfile());
}
