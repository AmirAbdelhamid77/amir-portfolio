// Contracts for the declared route context that the orientation strip, the
// structural breadcrumb and the subject tabs read. These are resolution checks:
// a direct visit must get the right subject, parent and activity, and a route
// with no declaration must stay neutral rather than inherit a neighbouring
// subject from URL text.
//
//   npm run test:content
import assert from "node:assert/strict";
import { register } from "node:module";
import { test } from "node:test";

// Resolves `@/` aliases and `.ts` modules the same way the curriculum test does.
register("../../scripts/study-loader.mjs", import.meta.url);

const {
  normalizeRoutePath,
  orientationTrail,
  resolveRouteContext,
  routeCrumbs,
  subjectHomeHref,
  subjectTabForContext,
  subjectTabs,
} = await import("../../lib/navigation/route-context.ts");
const { SUBJECTS } = await import("../../lib/study/taxonomy.ts");

const crumbLabels = items => items.map(item => item.label);

test("a direct RTI visit resolves to Fabric and names its programme parent", () => {
  const context = resolveRouteContext("/learn/fabric-rti/streaming");
  assert.ok(context, "the RTI programme must have a declared context");
  assert.equal(context.subject, "fabric");
  assert.equal(context.activity, "learn");
  assert.equal(context.language, "en");
  assert.equal(context.parent.href, "/learn/fabric-rti/");
  assert.equal(context.parent.label, "Fabric RTI");
  assert.equal(context.breadcrumb, "page", "the RTI pages render their own trail");

  const { links, marker } = orientationTrail(context, "/learn/fabric-rti/streaming");
  assert.deepEqual(
    links.map(link => link.label),
    ["Learn", "Microsoft Fabric", "Fabric RTI"],
    "the strip links the primary destination, the subject and the programme",
  );
  assert.equal(marker, null, "the Learn destination is already the first link");

  const home = resolveRouteContext("/learn/fabric-rti");
  assert.equal(home.parent.href, "/learn/fabric/", "the programme home returns to Fabric");
});

test("the SQL canonical path owns exactly one breadcrumb trail", () => {
  const lesson = resolveRouteContext("/learn/sql/05");
  assert.ok(lesson);
  assert.equal(lesson.subject, "sql");
  assert.equal(lesson.activity, "learn");
  assert.equal(lesson.breadcrumb, "page", "the SQL shell renders its own breadcrumb");
  assert.deepEqual(crumbLabels(routeCrumbs(lesson, "Canonical path")), [
    "Learn",
    "SQL",
    "Canonical path",
  ]);

  const reference = resolveRouteContext("/learn/sql/reference/interview");
  assert.equal(reference.activity, "reference");
  assert.deepEqual(crumbLabels(routeCrumbs(reference, "Reference")), [
    "Learn",
    "SQL",
    "Reference",
  ]);

  const index = resolveRouteContext("/learn/sql");
  assert.equal(index.activity, "learn");
  assert.equal(index.parent, null);
  assert.deepEqual(crumbLabels(routeCrumbs(index, "SQL")), ["Learn", "SQL"]);
});

test("practice SQL keeps its Practice origin and names the self-checks", () => {
  const context = resolveRouteContext("/practice/sql");
  assert.ok(context);
  assert.equal(context.subject, "sql");
  assert.equal(context.activity, "practice");
  assert.equal(context.breadcrumb, "page");
  assert.deepEqual(crumbLabels(routeCrumbs(context, "Self-checks")), [
    "Practice",
    "SQL",
    "Self-checks",
  ]);
});

test("pages that own a breadcrumb suppress the orientation strip", () => {
  for (const path of [
    "/learn/statistics/foundations",
    "/learn/statistics/labs/outliers",
    "/learn/power-bi/model",
    "/learn/fabric/foundations",
    "/learn/visualization/foundations",
    "/learn/chapter/03",
    "/learn/visualization",
    "/practice",
    "/explore/charts",
    "/learn/fabric-rti/streaming",
    "/learn/fabric-rti",
  ]) {
    const context = resolveRouteContext(path);
    assert.ok(context, `${path}: no declared context`);
    assert.equal(context.breadcrumb, "page", `${path}: must own its breadcrumb`);
  }

  for (const path of [
    "/learn/chart-selection",
    "/learn/ar/foundations",
    "/learn/fabric/docs/onelake",
    "/learn/dp-600",
  ]) {
    const context = resolveRouteContext(path);
    assert.ok(context, `${path}: no declared context`);
    assert.equal(context.breadcrumb, "orientation", `${path}: the strip is the only trail`);
  }
});

test("a route without a declaration stays neutral", () => {
  for (const path of [
    "/",
    "/work/hansa",
    "/contact",
    "/learn",
    "/learn/catalogue",
    "/learn/drafts",
    "/lab",
    "/lab/hands-on",
    "/practice/data-viz",
    "/learn/not-a-real-slug",
    "/lab/not-a-real-lab",
  ]) {
    assert.equal(resolveRouteContext(path), null, `${path} must not inherit a subject`);
  }
});

test("normalization strips the deployment base path and trailing slashes", () => {
  assert.equal(normalizeRoutePath("/learn/sql/05/"), "/learn/sql/05");
  assert.equal(normalizeRoutePath(""), "/");
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  process.env.NEXT_PUBLIC_BASE_PATH = "/hansa";
  try {
    assert.equal(normalizeRoutePath("/hansa/learn/sql/"), "/learn/sql");
    assert.equal(resolveRouteContext("/hansa/learn/sql/05").subject, "sql");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("the current tab follows the declared destination, not URL text", () => {
  const cases = [
    ["/lab/power-bi", "practice"],
    ["/lab/excel", "practice"],
    ["/lab/statistics", "practice"],
    ["/lab/dp-600", "practice"],
    ["/lab/sql", "labs"],
    ["/lab/sql/mock", "labs"],
    ["/explore/distribution-lab", "labs"],
    ["/learn/statistics/labs/outliers", "labs"],
    ["/learn/statistics/glossary", "reference"],
    ["/learn/fabric/docs/onelake", "reference"],
    ["/learn/sql/reference/interview", "learn"],
    ["/practice/sql", "practice"],
    ["/practice", "practice"],
  ];
  for (const [path, expected] of cases) {
    const context = resolveRouteContext(path);
    assert.ok(context, `${path}: no declared context`);
    assert.equal(subjectTabForContext(context, path), expected, path);
  }
});

test("every subject home resolves and every declared tab stays inside its subject", () => {
  for (const subject of SUBJECTS) {
    const home = resolveRouteContext(subjectHomeHref(subject.id));
    assert.ok(home, `${subject.id}: subject home has no context`);
    assert.equal(home.subject, subject.id);
    assert.equal(subjectTabForContext(home, subjectHomeHref(subject.id)), "overview");

    const tabs = subjectTabs(subject.id);
    assert.equal(tabs[0].id, "overview");
    assert.equal(tabs[0].href, subjectHomeHref(subject.id));
    assert.ok(tabs.length >= 2, `${subject.id}: a subject needs a learning destination`);
    for (const tab of tabs) {
      assert.match(tab.href, /^\/(learn|lab|practice|explore)\//, `${subject.id}: ${tab.id} href`);
    }

    const destination = tabs.find(tab => tab.id === "learn");
    assert.ok(destination, `${subject.id}: missing Learn tab`);
    const learn = resolveRouteContext(destination.href);
    assert.ok(learn, `${subject.id}: Learn tab does not resolve`);
    assert.equal(learn.subject, subject.id, `${subject.id}: Learn tab leaves the subject`);
  }
});
