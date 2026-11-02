// Canonical-home gate: inspects the static export and then proves HTTP behaviour
// against it with the project's own static server.
//
//   node scripts/verify-canonical-home.mjs [--port 4311]
//
// Covers the acceptance items that can be proven without a browser:
//   ROOT02/H052  out/index.html is the selected knowledge landing
//   ROUTE01/2    the legacy address is an alias on the same implementation
//   SITE02/H053  a wrong path is a real 404, not a homepage 200
//   H054         `/prototype-c` without the slash redirects once, no loop
//   H063         every exported route answers 200
//   SEO01/H043-46 metadata, canonical, sitemap and robots agree on `/`
// Evidence is written to docs/canonical-home/evidence/.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const EVIDENCE = path.resolve("docs/canonical-home/evidence");
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const PORT = Number(portIndex === -1 ? 4311 : args[portIndex + 1]);
const BASE = `http://127.0.0.1:${PORT}`;

const checks = [];
function check(id, pass, detail) {
  checks.push({ id, status: pass ? "PASS" : "FAIL", detail });
  return pass;
}
const readOut = (rel) => readFileSync(path.join(OUT, rel), "utf8");

// ---------------------------------------------------------------- static audit

const rootHtml = existsSync(path.join(OUT, "index.html")) ? readOut("index.html") : null;
const aliasHtml = existsSync(path.join(OUT, "prototype-c/index.html"))
  ? readOut("prototype-c/index.html")
  : null;

// Updated with the v3 gate flow (2026-10-30): the full-screen date hero, the
// Learn Gate and the certificate gate are the landing's section identity. The
// markers are the gate kickers — contiguous text nodes, unlike the titles
// whose emphasis splits them across <em> elements.
const LANDING_MARKERS = [
  "Knowledge stage",
  "The Learn Gate",
  "Certificate preparation",
  "The insight archive",
  "Editions under editorial review",
];
const RETIRED_MARKERS = ["Three ways to use this site", "Data that makes", "02 — Learn & practise"];

check("ROOT02/H052", rootHtml !== null, "out/index.html exists");
if (rootHtml) {
  const missing = LANDING_MARKERS.filter((marker) => !rootHtml.includes(marker));
  check(
    "ROOT01",
    missing.length === 0,
    missing.length ? `missing landing markers: ${missing.join(", ")}` : "all landing markers present",
  );
  const leftovers = RETIRED_MARKERS.filter((marker) => rootHtml.includes(marker));
  check(
    "ROOT01b",
    leftovers.length === 0,
    leftovers.length
      ? `retired directory landing still exported: ${leftovers.join(", ")}`
      : "the retired gateway directory is gone",
  );
  check(
    "R4",
    !/Prototype C|local editorial preview/i.test(rootHtml),
    "no prototype framing in the exported root HTML",
  );
  // The important introduction must be in the static HTML, not only in JS.
  check(
    "NOJS01",
    /Think through a situation|Reveal the reasoning/i.test(rootHtml),
    "introductory copy is server-rendered",
  );
}

check("ROUTE01", aliasHtml !== null, "out/prototype-c/index.html exists (alias)");
if (rootHtml && aliasHtml) {
  const shared = LANDING_MARKERS.filter(
    (marker) => rootHtml.includes(marker) && aliasHtml.includes(marker),
  );
  check(
    "R3",
    shared.length === LANDING_MARKERS.length,
    `alias renders the same experience (${shared.length}/${LANDING_MARKERS.length} markers shared)`,
  );
  check(
    "R4b",
    !/Prototype C|local editorial preview/i.test(aliasHtml),
    "no prototype framing in the alias HTML",
  );
}

if (aliasHtml) {
  const robots = aliasHtml.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "";
  check("H045a", /noindex/.test(robots), `alias robots meta: ${robots || "absent"}`);
  const canonical = aliasHtml.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "";
  check("H045b", /workers\.dev\/?$/.test(canonical), `alias canonical: ${canonical || "absent"}`);
}

if (rootHtml) {
  const title = rootHtml.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  check(
    "H043",
    /Hansa/.test(title) && !/Data Analyst & BI Developer/.test(title),
    `root title: ${title}`,
  );
  const canonical = rootHtml.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "";
  check("H045c", /workers\.dev\/?$/.test(canonical), `root canonical: ${canonical || "absent"}`);
  const ogTitle = rootHtml.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? "";
  const twTitle = rootHtml.match(/<meta name="twitter:title" content="([^"]*)"/)?.[1] ?? "";
  check(
    "H044",
    /Hansa/.test(ogTitle) && /Hansa/.test(twTitle) && !/Data Analyst & BI Developer/.test(ogTitle),
    `og:title "${ogTitle}" · twitter:title "${twTitle}"`,
  );
  const ogImageAlt = rootHtml.match(/<meta property="og:image:alt" content="([^"]*)"/)?.[1] ?? "";
  check(
    "H044b",
    ogImageAlt.length > 0 && !/portfolio and Data Lab/i.test(ogImageAlt),
    `og:image:alt: ${ogImageAlt || "absent"}`,
  );
  // The author stays credited in its own field rather than the product title.
  check(
    "R9",
    /name="author" content="[^"]+"/.test(rootHtml) || /"@type":"Person"/.test(rootHtml),
    "author identity is still credited",
  );
}

const sitemapPath = path.join(OUT, "sitemap.xml");
if (check("H046", existsSync(sitemapPath), "out/sitemap.xml exists")) {
  const sitemap = readFileSync(sitemapPath, "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  check("H046a", !urls.some((url) => url.includes("/prototype-c")), "prototype alias is absent from the sitemap");
  const homeHits = urls.filter((url) => /workers\.dev\/?$/.test(url));
  check("H046b", homeHits.length === 1, `canonical homepage appears ${homeHits.length}× in the sitemap`);
  check("H046c", urls.length > 100, `${urls.length} routes in the sitemap`);
}

if (check("H045d", existsSync(path.join(OUT, "robots.txt")), "out/robots.txt exists")) {
  const robots = readOut("robots.txt");
  check(
    "H045e",
    /^Sitemap:\s*\S+sitemap\.xml$/m.test(robots),
    "robots.txt points at the sitemap",
  );
}

check(
  "SITE02b",
  existsSync(path.join(OUT, "404.html")),
  "out/404.html exists so unknown paths are a real 404",
);

// ------------------------------------------------------------------ HTTP audit

const exportedRoutes = [];
(function walk(dir, prefix) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const rel = `${prefix}${entry.name}`;
    if (existsSync(path.join(dir, entry.name, "index.html"))) exportedRoutes.push(`/${rel}/`);
    if (entry.name === "_next" || entry.name.startsWith("__next")) continue;
    if (entry.name === "data-viz" || entry.name === "images" || entry.name === "fabric-additions") continue;
    walk(path.join(dir, entry.name), `${rel}/`);
  }
})(OUT, "");

const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
});
const serverLog = [];
server.stdout.on("data", (chunk) => serverLog.push(String(chunk)));
server.stderr.on("data", (chunk) => serverLog.push(String(chunk)));

async function fetchStatus(url) {
  try {
    const response = await fetch(url, { redirect: "manual" });
    return { status: response.status, location: response.headers.get("location"), body: await response.text() };
  } catch (error) {
    return { status: 0, error: String(error) };
  }
}

const results = [];
try {
  const deadline = Date.now() + 15_000;
  let ready = false;
  while (Date.now() < deadline) {
    const probe = await fetchStatus(`${BASE}/`);
    if (probe.status === 200) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  check("server", ready, ready ? `static server answered on :${PORT}` : `server never answered: ${serverLog.join(" ")}`);

  if (ready) {
    const root = await fetchStatus(`${BASE}/`);
    check("ROOT02", root.status === 200, `GET / → ${root.status}`);

    const alias = await fetchStatus(`${BASE}/prototype-c/`);
    check("ROUTE01b", alias.status === 200, `GET /prototype-c/ → ${alias.status}`);

    const noSlash = await fetchStatus(`${BASE}/prototype-c`);
    check(
      "H054a",
      noSlash.status === 301 && (noSlash.location ?? "").replace(BASE, "").startsWith("/prototype-c/"),
      `GET /prototype-c → ${noSlash.status} ${noSlash.location ?? ""}`,
    );

    // The alias must not bounce anywhere: it serves the same implementation.
    check(
      "H054b",
      alias.status === 200 && !/prototype-c\/$/.test(alias.location ?? ""),
      "the alias does not redirect (no loop, no lost query)",
    );

    for (const deepLink of [
      "/?insight=hansa-insight-shortcut-reference-v1",
      "/?insight=hansa-insight-shortcut-delete-v1#archive",
      "/?insight=hansa-insight-shortcut-discovery-v1",
      "/?insight=not-a-real-edition",
      "/prototype-c/?insight=hansa-insight-shortcut-delete-v1#archive",
    ]) {
      const response = await fetchStatus(`${BASE}${deepLink}`);
      check("URL01-05", response.status === 200, `GET ${deepLink} → ${response.status}`);
    }

    const missing = await fetchStatus(`${BASE}/intentionally-nonexistent-qa/`);
    check("SITE02", missing.status === 404, `GET /intentionally-nonexistent-qa/ → ${missing.status}`);

    const failures = [];
    for (const route of exportedRoutes) {
      const response = await fetchStatus(`${BASE}${route}`);
      if (response.status !== 200) failures.push(`${route} → ${response.status}`);
    }
    check(
      "H063",
      failures.length === 0,
      failures.length
        ? `${failures.length}/${exportedRoutes.length} exported routes failed: ${failures.slice(0, 8).join(", ")}`
        : `${exportedRoutes.length} exported routes answered 200`,
    );
    results.push({ exportedRoutes: exportedRoutes.length, failures });
  }
} finally {
  server.kill();
}

// -------------------------------------------------------------------- evidence

mkdirSync(EVIDENCE, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  command: `node scripts/verify-canonical-home.mjs --port ${PORT}`,
  head: (() => {
    try {
      return readFileSync(".git/HEAD", "utf8").trim();
    } catch {
      return "unavailable";
    }
  })(),
  exportedRoutes: exportedRoutes.length,
  checks,
  failed: checks.filter((entry) => entry.status === "FAIL").map((entry) => entry.id),
  routeCrawlFailures: results[0]?.failures ?? [],
};
writeFileSync(path.join(EVIDENCE, "verify-canonical-home.json"), `${JSON.stringify(report, null, 2)}\n`);

for (const entry of checks) console.log(`${entry.status} ${entry.id} — ${entry.detail}`);
console.log(`\n${checks.length - report.failed.length}/${checks.length} checks passed`);
if (report.failed.length) {
  console.error(`FAIL: ${report.failed.join(", ")}`);
  process.exitCode = 1;
}
