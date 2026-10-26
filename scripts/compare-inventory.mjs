// Compares two route inventories produced by inventory-routes.mjs and fails on
// a regression: a route that disappeared, or a deep-link anchor that moved.
//
//   node scripts/compare-inventory.mjs <baseline.json> <current.json> [--allow-moved moved.json]
//
// `--allow-moved` takes a JSON object of `{ "/old/": "/new/" }` for routes that
// were intentionally renamed and are re-tested by the caller's redirect plan.
import { readFile } from "node:fs/promises";

const [baselinePath, currentPath, ...rest] = process.argv.slice(2);
if (!baselinePath || !currentPath) {
  console.error("usage: node scripts/compare-inventory.mjs <baseline.json> <current.json> [--allow-moved moved.json]");
  process.exit(2);
}

const movedFlag = rest.indexOf("--allow-moved");
const moved = movedFlag === -1 ? {} : JSON.parse(await readFile(rest[movedFlag + 1], "utf8"));

const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
const current = JSON.parse(await readFile(currentPath, "utf8"));

const currentByRoute = new Map(current.routes.map((entry) => [entry.route, entry]));
const baselineRoutes = new Set(baseline.routes.map((entry) => entry.route));
const currentRoutes = new Set(current.routes.map((entry) => entry.route));

const missingRoutes = [];
const redirectedRoutes = [];
for (const entry of baseline.routes) {
  if (currentByRoute.has(entry.route)) continue;
  if (moved[entry.route]) redirectedRoutes.push({ from: entry.route, to: moved[entry.route] });
  else missingRoutes.push(entry.route);
}

const missingAnchors = [];
for (const entry of baseline.routes) {
  const targetRoute = moved[entry.route] ?? entry.route;
  const now = currentByRoute.get(targetRoute);
  if (!now) continue;
  const nowAnchors = new Set(now.anchors);
  const lost = entry.anchors.filter((anchor) => !nowAnchors.has(anchor));
  if (lost.length) missingAnchors.push({ route: entry.route, anchors: lost });
}

const addedRoutes = [...currentRoutes].filter((route) => !baselineRoutes.has(route));
const addedAnchors = current.routes
  .map((entry) => {
    const before = baseline.routes.find((item) => item.route === entry.route);
    if (!before) return null;
    const beforeAnchors = new Set(before.anchors);
    const added = entry.anchors.filter((anchor) => !beforeAnchors.has(anchor));
    return added.length ? { route: entry.route, anchors: added } : null;
  })
  .filter(Boolean);

console.log(`Baseline routes: ${baseline.routeCount}`);
console.log(`Current routes:  ${current.routeCount}`);
console.log(`Added routes:    ${addedRoutes.length}`);
console.log(`Missing routes:  ${missingRoutes.length}`);
console.log(`Intentional moves recorded: ${redirectedRoutes.length}`);
console.log(`Routes with lost anchors: ${missingAnchors.length}`);

for (const route of missingRoutes) console.log(`  MISSING ROUTE ${route}`);
for (const item of missingAnchors) {
  console.log(`  LOST ANCHORS ${item.route}: ${item.anchors.slice(0, 8).join(", ")}${item.anchors.length > 8 ? ` (+${item.anchors.length - 8})` : ""}`);
}
if (addedRoutes.length) console.log(`  added: ${addedRoutes.slice(0, 20).join(", ")}${addedRoutes.length > 20 ? ` (+${addedRoutes.length - 20})` : ""}`);
if (addedAnchors.length) console.log(`  ${addedAnchors.length} route(s) gained anchors (informational)`);

if (missingRoutes.length || missingAnchors.length) {
  console.log("RESULT: FAIL — route/anchor regression");
  process.exitCode = 1;
} else {
  console.log("RESULT: PASS — every baseline route and deep-link anchor still exists");
}
