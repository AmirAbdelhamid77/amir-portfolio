// FC07 — client-safe Fabric shard loading: manifest, bounded routing, LRU
// cache, cancellation, partial status and version guard.
//
// Client-safe: no node:fs, no @/ imports. The only non-lib import is the pure
// base-path resolver (lib/fabric/paths.ts), so shard URLs get the base path
// applied EXACTLY ONCE at this output boundary (RELEASE_AND_STORAGE.md §
// "Delivery profiles"; the resolver's own docs name search shards explicitly).
//
// Fetch pattern: app/search fetches its metadata index with a relative URL at
// runtime (app/search/index.json/route.ts renders it once at build time). Shard
// assets live in `public/fabric-search/`, which static export copies verbatim
// into `out/` (same mechanism as the existing `public/fabric-docs-assets/`),
// so they are fetched by absolute logical URLs resolved through
// buildAssetUrl — the one place the base path is added for this feature.
//
// Contracts implemented (handover 03 §Search):
//   * manifest + shards are versioned together; shard files are content-hashed;
//   * version mismatch → refetch the manifest ONCE, then fail visible (the UI
//     must show the failure, never silently drop the band);
//   * failed shard → results from loaded shards are still returned with
//     `partial: true` and the failed shard names, so the UI can show a visible
//     "partial results" status;
//   * superseded fetches are aborted through the caller's AbortController;
//   * memory is capped by an LRU over parsed shards (byte and entry caps).
import { buildAssetUrl, validateProfile, type DeliveryProfile } from "../fabric/paths.ts";

import type { FabricHit, FabricShard } from "./fabric-scorer.ts";
import { FABRIC_RESULT_LIMIT, scoreShards } from "./fabric-scorer.ts";
import { tokenize } from "./query.ts";

export type FabricManifestFile = {
  name: string;
  role: "shard" | "routing";
  sha256: string;
  bytes: number;
  articleCount: number;
};

export type FabricManifest = {
  schema: string;
  version: string;
  corpusRevision: string;
  registryRevision: string;
  shardCount: number;
  articleCount: number;
  families: string[];
  files: FabricManifestFile[];
};

export type FabricRouting = {
  schema: string;
  version: string;
  wildcardThreshold: number;
  wildcardTokens: string[];
  tokens: Record<string, number[]>;
};

export type FabricSearchOutcome = {
  hits: FabricHit[];
  /** True when at least one candidate shard failed to load. */
  partial: boolean;
  failedShards: string[];
  loadedShards: number;
  candidateShards: number;
  /** ok | missing (no fabric corpus in this build, 404) | unavailable |
   *  version-drift — every non-ok state except `missing` is fail-visible. */
  status: "ok" | "missing" | "unavailable" | "version-drift";
};

export type FabricCollected = {
  tokens: string[];
  shards: FabricShard[];
  failedShards: string[];
  partial: boolean;
  loadedShards: number;
  candidateShards: number;
  status: FabricSearchOutcome["status"];
};

/** Manifest or routing could not be fetched at all (status code preserved). */
export class FabricUnavailableError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "FabricUnavailableError";
    this.status = status;
  }
}

/** Manifest pointers live at <public>/fabric-search/manifest.json (copy-shards.mjs). */
export const FABRIC_MANIFEST_LOGICAL_PATH = "/fabric-search/manifest.json";

/**
 * The delivery profile for this build, derived from NEXT_PUBLIC_BASE_PATH
 * exactly like next.config.ts and lib/fabric/articles/registry.ts derive
 * theirs. Client-safe: no fs. (registry.ts stays server-only; only this
 * derivation is mirrored, and both MUST stay in lockstep.)
 */
export function fabricDeliveryProfile(): DeliveryProfile {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return validateProfile({
    profile: basePath === "" ? "root" : "subpath",
    basePath,
    publicOrigin: "TO_BE_APPROVED",
    canonicalOrigin: "TO_BE_APPROVED",
    trailingSlash: true,
    assetOrigin: "",
    robotsPolicy: "canonical",
  });
}

/** Absolute URL for a fabric-search public asset (base path applied once). */
export function fabricAssetUrl(manifestRelative: string): string {
  const logical = `${FABRIC_MANIFEST_LOGICAL_PATH.replace(/manifest\.json$/, "")}${manifestRelative}`.replace(
    /\/+/g,
    "/",
  );
  return buildAssetUrl(logical, fabricDeliveryProfile());
}

/** Bounded-memory LRU over parsed shards. */
class ShardLru {
  private readonly entries = new Map<string, { shard: FabricShard; bytes: number }>();
  private totalBytes = 0;
  // Explicit fields (node --experimental-strip-types cannot parse TS
  // parameter properties, and this module is test-imported).
  private readonly maxBytes: number;
  private readonly maxEntries: number;

  constructor(maxBytes: number, maxEntries: number) {
    this.maxBytes = maxBytes;
    this.maxEntries = maxEntries;
  }

  get(name: string): FabricShard | undefined {
    const entry = this.entries.get(name);
    if (!entry) return undefined;
    // Refresh recency.
    this.entries.delete(name);
    this.entries.set(name, entry);
    return entry.shard;
  }

  set(name: string, shard: FabricShard, bytes: number): void {
    const existing = this.entries.get(name);
    if (existing) {
      this.totalBytes -= existing.bytes;
      this.entries.delete(name);
    }
    this.entries.set(name, { shard, bytes });
    this.totalBytes += bytes;
    this.evict();
  }

  get size(): number {
    return this.entries.size;
  }

  get bytes(): number {
    return this.totalBytes;
  }

  private evict(): void {
    while (this.entries.size > this.maxEntries || this.totalBytes > this.maxBytes) {
      const oldest = this.entries.keys().next();
      if (oldest.done) break;
      const entry = this.entries.get(oldest.value);
      this.totalBytes -= entry ? entry.bytes : 0;
      this.entries.delete(oldest.value);
    }
  }
}

export class FabricVersionDriftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FabricVersionDriftError";
  }
}

export type FabricSearchOptions = {
  /** Injectable fetch for tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** Override the manifest URL (tests); default: fabricAssetUrl("manifest.json"). */
  manifestUrl?: string;
  /** LRU caps. Defaults: 8 MiB and 48 entries (48 × ~250 KB shards). */
  maxCacheBytes?: number;
  maxCacheEntries?: number;
};

/**
 * One Fabric shard client per mounted search page.
 * Fetches the manifest on first use, routes query tokens to candidate shards
 * (bounded, over-approximating routing), loads shards on demand into the LRU
 * and scores via `scoreShards` when no worker is supplied.
 */
export class FabricSearch {
  private manifest: FabricManifest | null = null;
  private routing: FabricRouting | null = null;
  private cache: ShardLru;
  private readonly fetchImpl: typeof fetch;
  private readonly manifestUrl: string;
  /** One automatic manifest refetch after a version mismatch (never a loop). */
  private refetchedAfterDrift = false;

  constructor(options: FabricSearchOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.manifestUrl = options.manifestUrl ?? fabricAssetUrl("manifest.json");
    this.cache = new ShardLru(options.maxCacheBytes ?? 8 * 1024 * 1024, options.maxCacheEntries ?? 48);
  }

  get cacheSize(): number {
    return this.cache.size;
  }

  get cacheBytes(): number {
    return this.cache.bytes;
  }

  getManifest(): FabricManifest | null {
    return this.manifest;
  }

  async ensureLoaded(signal: AbortSignal): Promise<void> {
    if (this.manifest && this.routing) return;
    const response = await this.fetchImpl(this.manifestUrl, { signal });
    if (!response.ok) {
      throw new FabricUnavailableError(response.status, `fabric manifest ${response.status}`);
    }
    const manifest = (await response.json()) as FabricManifest;
    if (manifest.schema !== "hansa.fabric-search-manifest/1") {
      throw new FabricUnavailableError(response.status, `fabric manifest: unexpected schema ${manifest.schema}`);
    }
    const routingFile = manifest.files.find((file) => file.role === "routing");
    if (!routingFile) throw new FabricUnavailableError(500, "fabric manifest: routing file missing");
    const routingResponse = await this.fetchImpl(fabricAssetUrl(`${manifest.version}/${routingFile.name}`), { signal });
    if (!routingResponse.ok) {
      throw new Error(`fabric routing ${routingResponse.status}`);
    }
    const routing = (await routingResponse.json()) as FabricRouting;
    if (routing.version !== manifest.version) {
      throw new FabricVersionDriftError(
        `fabric routing version ${routing.version} does not match manifest ${manifest.version}`,
      );
    }
    this.manifest = manifest;
    this.routing = routing;
  }

  /**
   * Candidate shard indexes for a query token set. Over-approximating by
   * design: wildcard tokens (present in ≥70% of shards) select every shard;
   * a token absent from the routing map selects none (the token exists in no
   * shard, so no article can satisfy the all-tokens gate).
   */
  routeQuery(tokens: string[]): Set<number> {
    if (!this.manifest || !this.routing || tokens.length === 0) return new Set();
    let candidates: Set<number> | undefined;
    for (const token of tokens) {
      if (this.routing.wildcardTokens.includes(token)) continue;
      if (!Object.hasOwn(this.routing.tokens, token)) return new Set();
      const posting = this.routing.tokens[token];
      candidates = new Set(candidates ? posting.filter((index) => candidates!.has(index)) : posting);
      if (candidates.size === 0) {
        return candidates;
      }
    }
    return candidates ?? new Set(Array.from({ length: this.manifest.shardCount }, (_, index) => index));
  }

  private async loadShardFile(name: string, signal: AbortSignal): Promise<FabricShard> {
    const version = this.manifest!.version;
    const cacheKey = `${version}/${name}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    const response = await this.fetchImpl(fabricAssetUrl(cacheKey), { signal });
    if (!response.ok) throw new Error(`fabric shard ${name}: ${response.status}`);
    const shard = (await response.json()) as FabricShard;
    if (shard.schema !== "hansa.fabric-search-shard/1") {
      throw new Error(`fabric shard ${name}: unexpected schema ${shard.schema}`);
    }
    // Version guard: shards and manifest ship together; a shard that answers
    // with a different version means a stale manifest or a torn deployment.
    if (shard.version !== version) {
      throw new FabricVersionDriftError(
        `fabric shard ${name} reports version ${shard.version}, manifest is ${version}`,
      );
    }
    this.cache.set(cacheKey, shard, estimateShardBytes(shard));
    return shard;
  }

  /**
   * Load one named shard through the cache and version guard. Public so the
   * parity tests route tokens through the deployed routing file and load
   * exactly the routed subset (the same path `collect` uses internally).
   */
  async loadShardByName(name: string, signal: AbortSignal): Promise<FabricShard> {
    return this.loadShardFile(name, signal);
  }

  /** Load every candidate shard; stops at the first version drift. */
  private async loadCandidates(
    tokens: string[],
    signal: AbortSignal,
  ): Promise<{ shards: FabricShard[]; failed: string[]; drift: boolean; candidates: Set<number> }> {
    const candidates = this.routeQuery(tokens);
    const files = this.manifest!.files.filter((file) => file.role === "shard");
    const shards: FabricShard[] = [];
    const failed: string[] = [];
    for (const index of [...candidates].sort((a, b) => a - b)) {
      const file = files[index];
      if (!file) continue;
      try {
        shards.push(await this.loadShardFile(file.name, signal));
      } catch (error) {
        if (isAbort(error)) throw error;
        if (error instanceof FabricVersionDriftError) {
          return { shards, failed, drift: true, candidates };
        }
        failed.push(file.name);
      }
    }
    return { shards, failed, drift: false, candidates };
  }

  /**
   * Manifest → routing → candidate shards, WITHOUT scoring. The app/search
   * fabric band feeds `shards` to the worker (lib/search/fabric-worker.ts),
   * keeping scoring off the main thread; `search()` is the same-thread
   * convenience path around the identical pieces.
   *
   * `missing` (HTTP 404 on the manifest) means this build ships no fabric
   * corpus at all — the band is hidden, matching pre-fabric builds. Every
   * other manifest failure is fail-visible ("unavailable").
   *
   * Version drift triggers ONE automatic manifest refetch (guarded by
   * `refetchedAfterDrift`), then either a clean retry or a visible
   * "version-drift" status — never a loop, never a silent drop.
   */
  async collect(query: string, signal: AbortSignal): Promise<FabricCollected> {
    const tokens = tokenize(query).slice(0, 8);
    if (tokens.length === 0) {
      return { tokens, shards: [], failedShards: [], partial: false, loadedShards: 0, candidateShards: 0, status: "ok" };
    }
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await this.ensureLoaded(signal);
      } catch (error) {
        if (isAbort(error)) throw error;
        if (error instanceof FabricVersionDriftError && attempt === 0 && !this.refetchedAfterDrift) {
          this.refetchedAfterDrift = true;
          continue;
        }
        const missing = error instanceof FabricUnavailableError && error.status === 404;
        return {
          tokens,
          shards: [],
          failedShards: [],
          partial: false,
          loadedShards: 0,
          candidateShards: 0,
          status: missing ? "missing" : error instanceof FabricVersionDriftError || attempt > 0 ? "version-drift" : "unavailable",
        };
      }
      const { shards, failed, drift, candidates } = await this.loadCandidates(tokens, signal);
      if (drift && attempt === 0 && !this.refetchedAfterDrift) {
        this.refetchedAfterDrift = true;
        this.manifest = null;
        this.routing = null;
        continue;
      }
      return {
        tokens,
        shards,
        failedShards: failed,
        partial: failed.length > 0,
        loadedShards: shards.length,
        candidateShards: candidates.size,
        status: drift ? "version-drift" : "ok",
      };
    }
    // Unreachable (loop returns on both attempts); kept for exhaustiveness.
    return {
      tokens,
      shards: [],
      failedShards: [],
      partial: true,
      loadedShards: 0,
      candidateShards: 0,
      status: "version-drift",
    };
  }

  /** Same-thread variant of the band pipeline: collect + pure scoring. */
  async search(query: string, signal: AbortSignal, limit = FABRIC_RESULT_LIMIT): Promise<FabricSearchOutcome> {
    const collected = await this.collect(query, signal);
    return {
      hits: scoreShards(collected.shards, query, limit),
      partial: collected.partial,
      failedShards: collected.failedShards,
      loadedShards: collected.loadedShards,
      candidateShards: collected.candidateShards,
      status: collected.status,
    };
  }
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : typeof error === "object" && error !== null && (error as { name?: string }).name === "AbortError";
}

/** Estimated resident bytes for a parsed shard (JSON text length, UTF-16 count). */
function estimateShardBytes(shard: FabricShard): number {
  try {
    return JSON.stringify(shard).length;
  } catch {
    return 0;
  }
}
