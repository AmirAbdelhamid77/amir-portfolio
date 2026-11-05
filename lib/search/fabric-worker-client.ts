// FC07 — main-thread bridge to the Fabric scoring worker.
//
// Prefers a real Web Worker (`new Worker(new URL("./fabric-worker.ts",
// import.meta.url))` — webpack 5 and Turbopack bundle this). If Worker
// construction throws (e.g. a CSP or an environment without Worker support),
// the SAME pure scoring function runs on the main thread instead: the
// fallback is the identical code path, just not off-thread, and it is
// observable in telemetry through `usesWorker`. Documented deviation: a
// same-thread fallback is acceptable per the work-package brief ("prefer real
// Worker"), gated here to construction failures only — scoring volume per
// query is one pass over ≤ ~250 KB × candidate shards, measured later.
//
// Stale-result suppression: every query gets a jobId; responses for jobs
// older than the current one are dropped, and a new query aborts superseded
// shard fetches through the FabricSearch AbortController (fabric-shards.ts).
import { scoreShards } from "./fabric-scorer.ts";
import type { FabricHit, FabricShard } from "./fabric-scorer.ts";

export type FabricWorkerClient = {
  /** True when a real Worker was constructed; false = same-thread fallback. */
  readonly usesWorker: boolean;
  score(query: string, shards: FabricShard[], limit?: number): Promise<FabricHit[]>;
  dispose(): void;
};

type PendingEntry = {
  resolve: (hits: FabricHit[]) => void;
  reject: (error: Error) => void;
};

export function createFabricWorkerClient(): FabricWorkerClient {
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL("./fabric-worker.ts", import.meta.url));
  } catch {
    worker = null;
  }

  if (!worker) {
    // Same-thread fallback: identical scoring function, synchronous resolution.
    return {
      usesWorker: false,
      async score(query, shards, limit) {
        return scoreShards(shards, query, limit);
      },
      dispose() {},
    };
  }

  const pending = new Map<number, PendingEntry>();
  let nextJobId = 1;

  worker.addEventListener("message", (event: MessageEvent) => {
    const data = event.data as
      | { type: "ready" }
      | { type: "results"; jobId: number; hits: FabricHit[] }
      | { type: "error"; jobId: number; message: string }
      | { type?: undefined };
    if (!data || typeof data !== "object") return;
    if (data.type === "ready") return;
    if (data.type === "results" || data.type === "error") {
      const entry = pending.get(data.jobId);
      pending.delete(data.jobId);
      if (!entry) return;
      if (data.type === "results") entry.resolve(data.hits ?? []);
      else entry.reject(new Error(data.message));
    }
  });

  worker.addEventListener("error", () => {
    // A crashed worker rejects every pending job; later jobs re-create it.
    for (const [, entry] of pending) entry.reject(new Error("fabric scoring worker crashed"));
    pending.clear();
    worker = null;
  });

  return {
    usesWorker: true,
    score(query, shards, limit) {
      // Stale-result suppression: every job carries an id; the caller drops
      // responses for superseded queries (fabric-worker ids monotonically
      // increase), while older promises still settle so nothing leaks.
      const jobId = nextJobId++;
      return new Promise<FabricHit[]>((resolve, reject) => {
        pending.set(jobId, { resolve, reject });
        try {
          if (!worker) {
            pending.delete(jobId);
            resolve(scoreShards(shards, query, limit));
            return;
          }
          worker.postMessage({ type: "score", jobId, query, shards, limit });
        } catch (error) {
          pending.delete(jobId);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
    dispose() {
      if (worker) {
        worker.terminate();
        worker = null;
      }
      for (const [, entry] of pending) entry.reject(new Error("fabric scoring worker disposed"));
      pending.clear();
    },
  };
}
