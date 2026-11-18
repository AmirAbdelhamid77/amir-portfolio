// One declaration of where a page sits: its subject, activity, language and
// the page it returns to. The orientation strip, the structural breadcrumb and
// the subject tabs read this module instead of guessing from URL substrings.
//
// `null` means "no declared context": a catalogue, a multi-subject lab index or
// an unknown route. A neutral page renders no orientation strip and never
// inherits a wrong subject. Add a family here when a new route goes public.

import { SUBJECTS, type SubjectId } from "@/lib/study/taxonomy";

export type RouteActivity = "learn" | "practice" | "lab" | "reference";
export type RouteLanguage = "en" | "ar" | "mixed";
export type RouteBreadcrumbOwner = "page" | "orientation";

export interface RouteLink {
  readonly href: string;
  readonly label: string;
}

export interface RouteContext {
  readonly subject: SubjectId | null;
  readonly activity: RouteActivity;
  readonly language: RouteLanguage;
  /** The primary-nav destination this route belongs to. */
  readonly primary: RouteLink;
  /** The structural parent page, when it is not the subject home. */
  readonly parent: RouteLink | null;
  /** `page` means the destination renders its own breadcrumb (so the strip stays out). */
  readonly breadcrumb: RouteBreadcrumbOwner;
}

export type SubjectTabId = "overview" | "learn" | "practice" | "labs" | "reference";

export interface SubjectTab {
  readonly id: SubjectTabId;
  readonly label: string;
  readonly href: string;
}

const LEARN: RouteLink = { href: "/learn", label: "Learn" };
const PRACTICE: RouteLink = { href: "/practice/catalogue", label: "Practice" };

const ACTIVITY_LABEL: Record<RouteActivity, string> = {
  learn: "Learn",
  practice: "Practice",
  lab: "Lab",
  reference: "Reference",
};

/** The viz-lesson slugs served by `/learn/[slug]`. Mirrors the English curriculum. */
const VISUALIZATION_LESSONS = new Set([
  "overview",
  "foundations",
  "audience-story",
  "core-chart-types",
  "advanced-multivariate",
  "color-perception",
  "accessibility-color-qa",
  "visual-integrity",
  "statistical-traps",
  "visual-atlas",
  "chart-selection",
  "dashboard-design",
  "power-bi-playbook",
  "interview-bank",
  "quick-reference",
  "applied-cases",
]);

/** The subject-home route, independent of the heavier curriculum model. */
export function subjectHomeHref(id: SubjectId): string {
  return `/learn/${id}/`;
}

export function subjectTitle(id: SubjectId): string {
  return SUBJECTS.find((subject) => subject.id === id)!.title;
}

/** Strip a deployment base path and trailing slashes; keep exactly one leading slash. */
export function normalizeRoutePath(pathname: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  let path = pathname || "/";
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || "/";
  }
  return path.replace(/\/+$/, "") || "/";
}

function route(
  subject: SubjectId | null,
  activity: RouteActivity,
  language: RouteLanguage,
  primary: RouteLink,
  parent: RouteLink | null,
  breadcrumb: RouteBreadcrumbOwner = "orientation",
): RouteContext {
  return { subject, activity, language, primary, parent, breadcrumb };
}

/**
 * Resolve one pathname to its declared context. Rules are ordered from the most
 * specific family to the most general so a special activity (a reference page,
 * a lab inside a subject) is never flattened into the generic subject rule.
 */
export function resolveRouteContext(pathname: string): RouteContext | null {
  const path = normalizeRoutePath(pathname);

  // The learning home, its catalogues and the isolated review inventory have
  // no single subject.
  if (
    path === "/learn" ||
    path === "/learn/catalogue" ||
    path === "/learn/drafts" ||
    path === "/learn/academy" ||
    path.startsWith("/learn/academy/") ||
    path === "/study" ||
    path === "/study/review" ||
    path.startsWith("/study/review/")
  ) {
    return null;
  }

  // --- SQL: one canonical path, one structural breadcrumb -----------------
  if (path === "/learn/sql" || path.startsWith("/learn/sql/")) {
    return route(
      "sql",
      path.startsWith("/learn/sql/reference/") ? "reference" : "learn",
      "mixed",
      LEARN,
      path === "/learn/sql" ? null : { href: "/learn/sql/", label: "SQL" },
      "page",
    );
  }

  // --- Fabric documentation mirror ----------------------------------------
  if (path === "/learn/fabric/docs" || path.startsWith("/learn/fabric/docs/")) {
    return route(
      "fabric",
      "reference",
      "en",
      LEARN,
      path === "/learn/fabric/docs"
        ? { href: "/learn/fabric/", label: "Microsoft Fabric" }
        : { href: "/learn/fabric/docs/", label: "Fabric documentation" },
    );
  }

  // --- Fabric RTI programme -----------------------------------------------
  if (path === "/learn/fabric-rti" || path.startsWith("/learn/fabric-rti/")) {
    return route(
      "fabric",
      "learn",
      "en",
      LEARN,
      path === "/learn/fabric-rti"
        ? { href: "/learn/fabric/", label: "Microsoft Fabric" }
        : { href: "/learn/fabric-rti/", label: "Fabric RTI" },
      "page",
    );
  }

  // --- DP-600 learning academy --------------------------------------------
  if (path === "/learn/dp-600" || path.startsWith("/learn/dp-600/")) {
    return route(
      "fabric",
      "learn",
      "en",
      LEARN,
      path === "/learn/dp-600"
        ? { href: "/learn/fabric/", label: "Microsoft Fabric" }
        : { href: "/learn/dp-600/", label: "DP-600 Learning Academy" },
    );
  }

  // --- Statistics: lessons, labs and reference shelves --------------------
  if (path === "/learn/statistics" || path.startsWith("/learn/statistics/")) {
    const rest = path.slice("/learn/statistics".length);
    const activity: RouteActivity = rest.startsWith("/labs")
      ? "lab"
      : /^\/(glossary|cheatsheet|formulas|source)(\/|$)/.test(rest)
        ? "reference"
        : "learn";
    return route(
      "statistics",
      activity,
      "en",
      LEARN,
      path === "/learn/statistics"
        ? null
        : { href: "/learn/statistics/", label: "Statistics & reasoning" },
      "page",
    );
  }

  // --- Visualization course and its chapters ------------------------------
  if (
    path === "/learn/visualization" ||
    path.startsWith("/learn/visualization/") ||
    path === "/learn/chapter" ||
    path.startsWith("/learn/chapter/")
  ) {
    return route(
      "visualization",
      "learn",
      "en",
      LEARN,
      path === "/learn/visualization"
        ? null
        : { href: "/learn/visualization/", label: "Data visualization" },
      "page",
    );
  }

  // --- Arabic visualization companion -------------------------------------
  if (path === "/learn/ar" || path.startsWith("/learn/ar/")) {
    return route(
      "visualization",
      "learn",
      "ar",
      LEARN,
      path === "/learn/ar"
        ? { href: "/learn/visualization/", label: "Data visualization" }
        : { href: "/learn/ar/", label: "المسار العربي" },
    );
  }

  // --- Every other subject home and its topic desks -----------------------
  for (const subject of SUBJECTS) {
    if (path === `/learn/${subject.id}` || path.startsWith(`/learn/${subject.id}/`)) {
      return route(
        subject.id,
        "learn",
        "en",
        LEARN,
        path === `/learn/${subject.id}`
          ? null
          : { href: `/learn/${subject.id}/`, label: subject.title },
        "page",
      );
    }
  }

  // --- Data-visualization lessons at /learn/<slug> ------------------------
  if (/^\/learn\/[^/]+$/.test(path)) {
    const slug = path.slice("/learn/".length);
    if (!VISUALIZATION_LESSONS.has(slug)) return null;
    return route(
      "visualization",
      "learn",
      "en",
      LEARN,
      { href: "/learn/visualization/", label: "Data visualization" },
    );
  }

  // --- /study aliases resolve to the canonical subject home ---------------
  if (path.startsWith("/study/")) {
    const [id] = path.slice("/study/".length).split("/");
    const subject = SUBJECTS.find((entry) => entry.id === id);
    if (!subject) return null;
    return route(
      subject.id,
      "learn",
      "en",
      LEARN,
      { href: `/learn/${subject.id}/`, label: subject.title },
    );
  }

  // --- DP-600 question bank -----------------------------------------------
  if (path === "/lab/dp-600" || path.startsWith("/lab/dp-600/")) {
    return route(
      "fabric",
      "lab",
      "en",
      PRACTICE,
      path === "/lab/dp-600"
        ? null
        : { href: "/lab/dp-600/", label: "DP-600 hub" },
    );
  }

  // --- Fabric RTI lab blueprints ------------------------------------------
  if (path === "/lab/rti" || path.startsWith("/lab/rti/")) {
    return route("fabric", "lab", "en", PRACTICE, {
      href: "/learn/fabric-rti/",
      label: "Fabric RTI",
    });
  }

  // --- SQL lab and exam pages ---------------------------------------------
  if (path === "/lab/sql" || path.startsWith("/lab/sql/")) {
    return route("sql", "lab", "mixed", PRACTICE, { href: "/lab/", label: "Data Lab" });
  }
  if (path === "/lab/power-bi" || path.startsWith("/lab/power-bi/")) {
    return route("power-bi", "lab", "en", PRACTICE, { href: "/lab/", label: "Data Lab" });
  }
  if (path === "/lab/excel" || path.startsWith("/lab/excel/")) {
    return route("excel", "lab", "en", PRACTICE, { href: "/lab/", label: "Data Lab" });
  }
  if (path === "/lab/python" || path.startsWith("/lab/python/")) {
    return route("python", "lab", "en", PRACTICE, { href: "/lab/", label: "Data Lab" });
  }
  if (path === "/lab/statistics" || path.startsWith("/lab/statistics/")) {
    return route("statistics", "lab", "en", PRACTICE, { href: "/lab/", label: "Data Lab" });
  }
  if (path === "/lab/fundamentals" || path.startsWith("/lab/fundamentals/")) {
    return route("analysis", "lab", "en", PRACTICE, { href: "/lab/", label: "Data Lab" });
  }
  if (path === "/lab/fabric-rti" || path.startsWith("/lab/fabric-rti/")) {
    return route("fabric", "lab", "en", PRACTICE, { href: "/lab/", label: "Data Lab" });
  }

  // The Data Lab gallery and the hands-on labs span several subjects; without
  // a declared page-level subject they stay neutral rather than guessing one.
  if (path === "/lab" || path === "/lab/hands-on" || path.startsWith("/lab/hands-on/")) {
    return null;
  }

  // --- Practice ------------------------------------------------------------
  if (path === "/practice/sql") {
    return route("sql", "practice", "mixed", PRACTICE, { href: "/learn/sql/", label: "SQL" }, "page");
  }
  if (path === "/practice") {
    return route(
      "visualization",
      "practice",
      "en",
      PRACTICE,
      { href: "/learn/visualization/", label: "Data visualization" },
      "page",
    );
  }
  if (path.startsWith("/practice/")) return null;

  // --- Explore: the visualization labs ------------------------------------
  if (path === "/explore" || path.startsWith("/explore/")) {
    return route(
      "visualization",
      "lab",
      "en",
      LEARN,
      { href: "/learn/visualization/", label: "Data visualization" },
      "page",
    );
  }

  return null;
}

/**
 * The orientation strip's structural links and activity marker. The subject
 * home is linked only when it is not the current page; the parent is linked
 * only when it adds a level between the subject and the page.
 */
export function orientationTrail(
  context: RouteContext,
  pathname: string,
): { links: RouteLink[]; marker: string | null } {
  const path = normalizeRoutePath(pathname);
  const links: RouteLink[] = [{ ...context.primary }];
  const add = (link: RouteLink) => {
    if (links.some((item) => normalizeRoutePath(item.href) === normalizeRoutePath(link.href))) return;
    if (path === normalizeRoutePath(link.href)) return;
    links.push({ ...link });
  };

  if (context.subject) {
    const home = subjectHomeHref(context.subject);
    if (home !== context.primary.href) {
      add({ href: home, label: subjectTitle(context.subject) });
    }
  }
  if (context.parent) add(context.parent);

  const label = ACTIVITY_LABEL[context.activity];
  return { links, marker: label === context.primary.label ? null : label };
}

/** A breadcrumb that always starts at a primary-nav destination. */
export function routeCrumbs(
  context: RouteContext,
  current: string,
): { href?: string; label: string }[] {
  const items: { href?: string; label: string }[] = [
    { href: context.primary.href, label: context.primary.label },
  ];
  const home = context.subject ? subjectHomeHref(context.subject) : null;
  const title = context.subject ? subjectTitle(context.subject) : null;

  if (home && title && current !== title && home !== context.primary.href) {
    items.push({ href: home, label: title });
  }
  if (
    context.parent &&
    context.parent.href !== context.primary.href &&
    context.parent.href !== home &&
    context.parent.label !== current
  ) {
    items.push({ href: context.parent.href, label: context.parent.label });
  }
  items.push({ label: current });

  // Collapse any accidental repetition (for example "SQL / SQL").
  return items.filter((item, index) => index === 0 || item.label !== items[index - 1].label);
}

const SUBJECT_TAB_HREFS: Record<
  SubjectId,
  { learn: string; practice?: string; labs?: string; reference?: string }
> = {
  analysis: { learn: "/learn/analysis/path/", practice: "/lab/fundamentals/" },
  excel: { learn: "/learn/excel/path/", practice: "/lab/excel/" },
  fabric: {
    learn: "/learn/fabric/path/",
    practice: "/lab/dp-600/",
    labs: "/lab/hands-on/",
    reference: "/learn/fabric/docs/",
  },
  "power-bi": {
    learn: "/learn/power-bi/path/",
    practice: "/lab/power-bi/",
    labs: "/lab/hands-on/",
  },
  python: { learn: "/learn/python/path/", practice: "/lab/python/" },
  sql: { learn: "/learn/sql/path/", practice: "/practice/sql/", labs: "/lab/sql/" },
  statistics: {
    learn: "/learn/statistics/path/",
    practice: "/lab/statistics/",
    labs: "/learn/statistics/labs/",
    reference: "/learn/statistics/glossary/",
  },
  visualization: {
    learn: "/learn/visualization/path/",
    practice: "/practice/",
    labs: "/explore/",
  },
};

/** One tab bar per subject; a destination that does not exist is omitted. */
export function subjectTabs(subject: SubjectId): SubjectTab[] {
  const destinations = SUBJECT_TAB_HREFS[subject];
  const tabs: SubjectTab[] = [
    { id: "overview", label: "Overview", href: subjectHomeHref(subject) },
    { id: "learn", label: "Learn", href: destinations.learn },
  ];
  if (destinations.practice) {
    tabs.push({ id: "practice", label: "Practice", href: destinations.practice });
  }
  if (destinations.labs) {
    tabs.push({ id: "labs", label: "Labs", href: destinations.labs });
  }
  if (destinations.reference) {
    tabs.push({ id: "reference", label: "Reference", href: destinations.reference });
  }
  return tabs;
}

/** Which tab a page belongs to. */
export function subjectTabForContext(context: RouteContext, pathname: string): SubjectTabId {
  if (!context.subject) return "learn";
  const path = normalizeRoutePath(pathname);
  if (path === normalizeRoutePath(subjectHomeHref(context.subject))) return "overview";

  const tabs = subjectTabs(context.subject);
  // A tab destination matches the page itself or anything below it. The
  // longest destination wins, so a nested reference shelf is not flattened
  // into the subject home.
  const destination = tabs
    .filter((tab) => tab.id !== "overview")
    .sort(
      (left, right) =>
        normalizeRoutePath(right.href).length - normalizeRoutePath(left.href).length,
    )
    .find((tab) => {
      const target = normalizeRoutePath(tab.href);
      return path === target || path.startsWith(`${target}/`);
    });
  if (destination) return destination.id;

  // Fall back to the declared activity; a subject without that destination
  // (SQL has no separate reference index) marks its learning tab instead.
  const preferred: SubjectTabId =
    context.activity === "practice"
      ? "practice"
      : context.activity === "lab"
        ? "labs"
        : context.activity === "reference"
          ? "reference"
          : "learn";
  return tabs.some((tab) => tab.id === preferred) ? preferred : "learn";
}
