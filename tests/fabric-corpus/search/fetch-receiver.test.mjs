// The default Fabric shard client must call the global fetch without turning it
// into a method of the client. Chromium rejects a bare `fetch` invoked with a
// foreign receiver ("Illegal invocation"), so `/search` made no manifest
// request at all while every injected-fetch test still passed.
//
// This test injects a fetch into `globalThis` (not into the client) and records
// the receiver. The old `this.fetchImpl = fetch` form called it as
// `client.fetchImpl(...)`, which is exactly the receiver Chromium rejects.
import { test } from "node:test";
import assert from "node:assert/strict";
import { FabricSearch } from "../../../lib/search/fabric-shards.ts";

test("the default fetch is called with the global receiver, not the client", async () => {
  const original = globalThis.fetch;
  let receiver = "not called";
  globalThis.fetch = function () {
    // The receiver is the assertion; capturing it is the point of this test.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    receiver = this;
    throw new Error("stop after the first request");
  };
  try {
    const client = new FabricSearch({ manifestUrl: "/fabric-search/manifest.json" });
    await assert.rejects(client.ensureLoaded(new AbortController().signal), /stop after the first request/);
  } finally {
    globalThis.fetch = original;
  }
  assert.ok(
    receiver === undefined || receiver === globalThis,
    "the default fetch must keep the global receiver; calling it as a client method is the browser bug",
  );
});
