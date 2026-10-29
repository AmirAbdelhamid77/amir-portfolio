// Three-way route census: owner audit baseline ↔ source routes ↔ static export.
//
//   node scripts/census-canonical-home.mjs
//
// Writes docs/canonical-home/ROUTE_CENSUS.csv reconciling:
//   A. the 117 internal URLs in the owner's 2026-10-28 audit,
//   B. the route files under app/ (including dynamic generateStaticParams),
//   C. the routes actually exported to out/ (plus sitemap and canonical tags).
// It reports differences rather than assuming any list is complete; the audit
// list is a discovery baseline, not a census.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = "out";
const SEED = "docs/canonical-home/audit-baseline/ROUTE_INVENTORY_SEED_117.csv";
const TARGET = "docs/canonical-home/ROUTE_CENSUS.csv";

// --- A. audit baseline ------------------------------------------------------
const seed = existsSync(SEED)
  ? readFileSync(SEED, "utf8")
      .split(/\r?\n/)
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        // route is the third column and never contains a comma in this file.
        const columns = line.split(",");
        return { route: columns[2], status: columns[1], group: columns[0] };
      })
  : [];

// --- B. source routes -------------------------------------------------------
const sourceRoutes = new Set();
(function walk(dir, prefix) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || entry.name.startsWith("(")) {
        // Route groups do not add a URL segment; keep descending.
      }
      walk(path.join(dir, entry.name), entry.name.startsWith("(") ? prefix : `${prefix}/${entry.name}`);
    } else if (/^page\.tsx$/.test(entry.name)) {
      const withTrailing = `${prefix}/`.replace(/\/+/g, "/");
      sourceRoutes.add(withTrailing === "/" ? "/" : withTrailing);
    }
    void sourceRoutes;
  }
})("app", "");

function sourceFileFor(route) {
  const clean = route.replace(/^\/|\/$/g, "");
  const direct = clean ? `app/${clean}/page.tsx` : "app/page.tsx";
  if (existsSync(direct)) return direct;
  // Dynamic segment: /learn/chapter/01/ ← app/learn/chapter/[number]/page.tsx
  const parts = clean.split("/").filter(Boolean);
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const candidate = [...parts.slice(0, index), "[", ...[]].join("/");
    void candidate;
  }
  const segments = clean.split("/").filter(Boolean);
  for (let depth = segments.length - 1; depth >= 0; depth -= 1) {
    const guess = [
      ...segments.slice(0, depth),
      `[${segments[depth] ? "slug" : "slug"}]`,
      ...segments.slice(depth + 1),
    ].join("/");
    if (existsSync(`app/${guess}/page.tsx`)) return `app/${guess}/page.tsx`;
  }
  const dynamic = ["[slug]", "[number]", "[type]", "[id]"];
  for (const name of dynamic) {
    for (let depth = segments.length - 1; depth >= 0; depth -= 1) {
      const guess = [...segments.slice(0, depth), name, ...segments.slice(depth + 1)].join("/");
      if (existsSync(`app/${guess}/page.tsx`)) return `app/${guess}/page.tsx`;
    }
    if (existsSync(`app/${name}/page.tsx`)) return `app/${name}/page.tsx`;
  }
  return "(dynamic or absent)";
}

// --- C. exported static output ---------------------------------------------
const exported = new Map(); // route -> {file, canonical, robots}
(function walk(dir, prefix) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const nextPrefix = `${prefix}/${entry.name}`;
    if (["_next", "images", "data-viz", "fabric-additions"].includes(entry.name)) continue;
    if (entry.name.startsWith("__next")) continue;
    // Framework error output is not a user route.
    if (entry.name === "404" || entry.name === "_not-found") continue;
    const indexFile = path.join(dir, entry.name, "index.html");
    if (existsSync(indexFile)) {
      const html = readFileSync(indexFile, "utf8");
      exported.set(`${nextPrefix}/`, {
        file: indexFile,
        canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "",
        robots: html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "",
      });
    }
    // Always descend: a parent directory without its own index.html still holds
    // child routes (e.g. out/learn/chapter/01/index.html).
    walk(path.join(dir, entry.name), nextPrefix);
  }
})(OUT, "");

const sitemap = existsSync(`${OUT}/sitemap.xml`)
  ? new Set(
      [...readFileSync(`${OUT}/sitemap.xml`, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
        match[1].replace(/^https?:\/\/[^/]+/, "") || "/",
      ),
    )
  : new Set();

// --- reconcile --------------------------------------------------------------
const allRoutes = new Set([...sourceRoutes, ...exported.keys(), ...seed.map((row) => row.route)]);
const rows = [...allRoutes].sort().map((route) => {
  const fromAudit = seed.find((row) => row.route === route);
  const output = exported.get(route);
  const isDynamic = sourceFileFor(route).includes("[");
  return {
    route,
    source_path: sourceFileFor(route),
    exported_html: output ? "yes" : "no",
    audit_baseline: fromAudit ? fromAudit.status : "not-in-audit",
    audit_group: fromAudit ? fromAudit.group : "",
    sitemap_present: sitemap.has(route) ? "yes" : "no",
    canonical: output?.canonical.replace(/^https?:\/\/[^/]+/, "") || "",
    robots: output?.robots || "",
    dynamic: isDynamic ? "yes" : "no",
    notes:
      route === "/prototype-c/"
        ? "Legacy landing: thin alias of the canonical module, noindex, canonical /"
        : route === "/"
          ? "Canonical Hansa landing"
          : "",
  };
});

const header = [
  "route",
  "source_path",
  "exported_html",
  "audit_baseline",
  "audit_group",
  "sitemap_present",
  "canonical",
  "robots",
  "dynamic",
  "notes",
];
const csv = [
  header.join(","),
  ...rows.map((row) =>
    header
      .map((key) => {
        const value = String(row[key] ?? "");
        return /[",]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
      })
      .join(","),
  ),
].join("\n");

writeFileSync(TARGET, `${csv}\n`);

const auditOnly = seed.filter((row) => !exported.has(row.route) && !sourceRoutes.has(row.route));
const exportedNotInAudit = [...exported.keys()].filter(
  (route) => !seed.some((row) => row.route === route),
);
const summary = {
  writtenAt: new Date().toISOString(),
  target: TARGET,
  auditBaseline: seed.length,
  sourceRouteFiles: sourceRoutes.size,
  exportedRoutes: exported.size,
  sitemapEntries: sitemap.size,
  union: rows.length,
  auditRowsWithoutExportOrSource: auditOnly.map((row) => row.route),
  exportedRoutesNotInAudit: exportedNotInAudit.sort(),
};
writeFileSync(
  "docs/canonical-home/evidence/route-census-summary.json",
  `${JSON.stringify(summary, null, 2)}\n`,
);
console.log(JSON.stringify(summary, null, 2));
