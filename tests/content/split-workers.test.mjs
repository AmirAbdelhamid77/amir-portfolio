import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  DOCS_PREFIX,
  SHARED_PATHS,
  WORKERS_FREE_FILE_LIMIT,
  assertCounts,
  classify,
  fileCounts,
  planSplit,
  splitExport,
} from "../../scripts/prepare-split-workers.mjs";
import gateway from "../../workers/gateway.mjs";
import docsWorker from "../../workers/docs.mjs";

function write(root, path, body = path) {
  const absolute = join(root, ...path.split("/"));
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, body);
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "hansa-split-workers-"));
  const out = join(root, "out");
  write(out, "index.html");
  write(out, "404.html");
  write(out, "_headers");
  write(out, "_redirects");
  write(out, "learn/index.html");
  write(out, "learn/fabric/index.html");
  write(out, "learn/fabric/docs/security/overview/index.html");
  write(out, "learn/fabric-rti/index.html");
  write(out, "fabric-docs-assets/security/image.png", "png");
  return { root, out, docs: join(root, "out-docs"), main: join(root, "out-main") };
}

test("classification keeps the docs prefix exact and shares the 404/header files", () => {
  assert.equal(classify("learn/fabric/index.html"), "docs");
  assert.equal(classify("learn/fabric/docs/security/overview/index.html"), "docs");
  assert.equal(classify("learn/fabric-rti/index.html"), "main");
  assert.equal(classify("learn/index.html"), "main");
  assert.equal(classify("fabric-docs-assets/security/image.png"), "main");
  for (const path of SHARED_PATHS) assert.equal(classify(path), "shared");
  assert.ok(DOCS_PREFIX.endsWith("/"));
});

test("the plan assigns every source file exactly once and counts shared files on both sides", () => {
  const plan = planSplit(["b", "learn/fabric/a", "404.html", "c"]);
  assert.deepEqual(plan.docs, ["learn/fabric/a"]);
  assert.deepEqual(plan.main, ["b", "c"]);
  assert.deepEqual(plan.shared, ["404.html"]);
  assert.deepEqual(fileCounts(plan), { docs: 2, main: 3, shared: 1, source: 4 });
});

test("the Workers Free limit is enforced per tree", () => {
  assert.throws(
    () => assertCounts({ docs: WORKERS_FREE_FILE_LIMIT, main: 1 }),
    /docs Worker has 20000 files/,
  );
  assert.throws(
    () => assertCounts({ docs: 1, main: WORKERS_FREE_FILE_LIMIT }),
    /main Worker has 20000 files/,
  );
  assertCounts({ docs: WORKERS_FREE_FILE_LIMIT - 1, main: WORKERS_FREE_FILE_LIMIT - 1 });
});

test("splitExport links the docs subtree, keeps the rest on main and duplicates shared files", () => {
  const { root, out, docs, main } = fixture();
  try {
    const result = splitExport({ from: out, docs, main });
    assert.deepEqual(result.counts, { docs: 5, main: 7, shared: 3, source: 9 });

    assert.equal(readFileSync(join(docs, "learn/fabric/index.html"), "utf8"), "learn/fabric/index.html");
    assert.equal(readFileSync(join(docs, "learn/fabric/docs/security/overview/index.html"), "utf8"), "learn/fabric/docs/security/overview/index.html");
    assert.equal(existsSync(join(docs, "learn/fabric-rti/index.html")), false);
    assert.equal(existsSync(join(docs, "index.html")), false);

    assert.equal(readFileSync(join(main, "index.html"), "utf8"), "index.html");
    assert.equal(readFileSync(join(main, "learn/fabric-rti/index.html"), "utf8"), "learn/fabric-rti/index.html");
    assert.equal(existsSync(join(main, "learn/fabric/index.html")), false);
    assert.equal(readFileSync(join(main, "fabric-docs-assets/security/image.png"), "utf8"), "png");

    for (const path of SHARED_PATHS) {
      assert.equal(readFileSync(join(docs, path), "utf8"), path);
      assert.equal(readFileSync(join(main, path), "utf8"), path);
    }

    writeFileSync(join(docs, "stale.html"), "stale");
    splitExport({ from: out, docs, main });
    assert.equal(existsSync(join(docs, "stale.html")), false, "a rerun removes stale output");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("splitExport refuses unsafe output locations and a missing export", () => {
  const { root, out, docs } = fixture();
  try {
    assert.throws(() => splitExport({ from: out, docs: join(out, "nested"), main: join(root, "main") }), /inside the export/);
    assert.throws(() => splitExport({ from: out, docs: join(root, "parent"), main: root }), /export cannot be inside/);
    assert.throws(() => splitExport({ from: join(root, "missing"), docs, main: join(root, "main") }), /static export is missing/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the gateway forwards only the docs prefix and canonicalises its bare path", async () => {
  const calls = [];
  const env = {
    DOCS: {
      fetch(request) {
        calls.push(new URL(request.url).pathname);
        return new Response("docs");
      },
    },
    ASSETS: {
      fetch(request) {
        calls.push(new URL(request.url).pathname);
        return new Response("asset");
      },
    },
  };

  assert.equal(await (await gateway.fetch(new Request("https://hansa.invalid/learn/fabric/docs/x/"), env)).text(), "docs");
  assert.equal(await (await gateway.fetch(new Request("https://hansa.invalid/learn/fabric/"), env)).text(), "docs");
  assert.equal(await (await gateway.fetch(new Request("https://hansa.invalid/learn/fabric-rti/"), env)).text(), "asset");
  assert.equal(await (await gateway.fetch(new Request("https://hansa.invalid/learn/fabrication/"), env)).text(), "asset");
  assert.equal(await (await gateway.fetch(new Request("https://hansa.invalid/about/"), env)).text(), "asset");
  assert.deepEqual(calls, ["/learn/fabric/docs/x/", "/learn/fabric/", "/learn/fabric-rti/", "/learn/fabrication/", "/about/"]);

  const redirect = await gateway.fetch(new Request("https://hansa.invalid/learn/fabric"), env);
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get("location"), "https://hansa.invalid/learn/fabric/");
});

test("the docs Worker serves its own asset binding", async () => {
  let seen = null;
  const response = await docsWorker.fetch(new Request("https://hansa.invalid/learn/fabric/"), {
    ASSETS: {
      fetch(request) {
        seen = new URL(request.url).pathname;
        return new Response("docs asset");
      },
    },
  });
  assert.equal(await response.text(), "docs asset");
  assert.equal(seen, "/learn/fabric/");
});

test("the checked-in Wrangler configs describe the intended split", () => {
  const root = resolve(join(import.meta.dirname, "../.."));
  const parse = path => JSON.parse(readFileSync(join(root, path), "utf8").replace(/^\s*\/\/.*$/gm, ""));
  const main = parse("wrangler.gateway.jsonc");
  const docs = parse("wrangler.docs.jsonc");

  // wrangler.jsonc is frozen byte-for-byte in both preservation baselines, so
  // the split lives in new files and the historical config stays untouched.
  const frozen = readFileSync(join(root, "wrangler.jsonc"), "utf8");
  assert.equal(/wrangler\.gateway/.test(frozen), false, "the frozen config must not reference the split");
  assert.equal(/"main"\s*:/.test(frozen), false, "the frozen config must stay static-assets only");

  assert.equal(main.name, "hansa");
  assert.equal(main.main, "./workers/gateway.mjs");
  assert.equal(main.assets.directory, "./out-main");
  assert.equal(main.assets.binding, "ASSETS");
  assert.deepEqual(main.assets.run_worker_first, ["/learn/fabric", "/learn/fabric/*"]);
  assert.deepEqual(main.services, [{ binding: "DOCS", service: "hansa-docs" }]);

  assert.equal(docs.name, "hansa-docs");
  assert.equal(docs.main, "./workers/docs.mjs");
  assert.equal(docs.assets.directory, "./out-docs");
  assert.equal(docs.assets.binding, "ASSETS");
  assert.equal(docs.assets.run_worker_first, true);
  assert.equal(docs.assets.html_handling, main.assets.html_handling);
  assert.equal(docs.assets.not_found_handling, main.assets.not_found_handling);
});
