// FC07 — Web Worker entry for Fabric shard scoring (bundled by Next).
//
// Loaded from the main thread with `new Worker(new URL("./fabric-worker.ts",
// import.meta.url))` (webpack 5 and Turbopack both bundle this pattern). The
// worker imports ONLY pure modules — lib/search/fabric-scorer.ts and
// lib/search/query.ts — so the bundle stays free of fs, fetch and DOM.
//
// Protocol (lib/search/fabric-worker-client.ts is the only peer):
//   main → worker: { type: "score", jobId, query, shards: FabricShard[], limit }
//   worker → main: { type: "ready" } | { type: "results", jobId, hits }
//            | { type: "error", jobId, message }
//
// Results are top-N FabricHit rows (articleId/logicalPath/title/snippet/…),
// scored with the same pure function the same-thread fallback uses, so the
// ranking contract is identical in both paths. Snippets are built from shard
// sections whose only sources are PUBLISHED registry articles (build-shards.mjs
// excludes everything else, hard-tested) — no private or review text can enter
// a snippet; tests/fabric-corpus/search/no-review-data.test.mjs asserts the
// marker strings stay absent from every shard.
import { scoreShards, type FabricShard } from "./fabric-scorer.ts";

type ScoreRequest = {
  type: "score";
  jobId: number;
  query: string;
  shards: FabricShard[];
  limit?: number;
};

type ScoreResponse =
  | { type: "ready" }
  | { type: "results"; jobId: number; hits: ReturnType<typeof scoreShards> }
  | { type: "error"; jobId: number; message: string };

function isScoreRequest(message: unknown): message is ScoreRequest {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as { type?: unknown }).type === "score" &&
    typeof (message as { jobId?: unknown }).jobId === "number" &&
    typeof (message as { query?: unknown }).query === "string" &&
    Array.isArray((message as { shards?: unknown }).shards)
  );
}

export function handleScoreRequest(message: unknown): ScoreResponse | null {
  if (!isScoreRequest(message)) return null;
  try {
    const hits = scoreShards(message.shards, message.query, message.limit);
    return { type: "results", jobId: message.jobId, hits };
  } catch (error) {
    return {
      type: "error",
      jobId: message.jobId,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

// Worker global scope: only inside a real Worker context does
// WorkerGlobalScope exist, so the guard keeps this module importable from the
// main thread (tests exercise handleScoreRequest directly) without touching
// `self` where it does not exist.
declare const self: unknown;
declare const WorkerGlobalScope: unknown;
const inWorker =
  typeof WorkerGlobalScope !== "undefined" &&
  typeof self === "object" &&
  self !== null &&
  self instanceof (WorkerGlobalScope as new () => object);
if (inWorker) {
  (self as {
    addEventListener: (type: string, listener: (event: MessageEvent) => void) => void;
    postMessage: (data: ScoreResponse) => void;
  }).addEventListener("message", (event) => {
    const response = handleScoreRequest(event.data);
    if (response) {
      (self as { postMessage: (data: ScoreResponse) => void }).postMessage(response);
    }
  });
  (self as { postMessage: (data: ScoreResponse) => void }).postMessage({ type: "ready" });
}
