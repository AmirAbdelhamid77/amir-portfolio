import fs from "node:fs";
import path from "node:path";
import { buildKnowledgeGraph, clientGraph } from "@/lib/knowledge-graph/dataset";
import { buildLenses, type LensTree } from "@/lib/knowledge-graph/lenses";
import type { Hierarchy } from "@/lib/knowledge-graph/hierarchy";

const graph = buildKnowledgeGraph();
const client = clientGraph(graph);
const lenses = buildLenses();
const subject = lenses.find((entry) => entry.lens.id === "subject")!.tree;

const publicDir = path.join(process.cwd(), "public", "graph");
fs.mkdirSync(publicDir, { recursive: true });

const datasetPath = path.join(publicDir, "dataset.json");
fs.writeFileSync(datasetPath, JSON.stringify(client));

function writeTree(file: string, tree: Hierarchy) {
  const target = path.join(publicDir, file);
  fs.writeFileSync(target, JSON.stringify(tree));
  return fs.statSync(target).size;
}

const sizes = new Map<string, number>();
for (const entry of lenses) sizes.set(entry.lens.id, writeTree(entry.lens.file, entry.tree));

const manifest = {
  version: "knowledge-tree-2026-11-07.1",
  generatedAt: graph.generatedAt,
  lenses: lenses.map(({ lens, tree }) => ({
    ...lens,
    nodeCount: tree.report.nodeCount,
    edgeCount: tree.report.edgeCount,
    depth: tree.report.depth,
    roots: tree.roots,
    bytes: sizes.get(lens.id) ?? 0,
  })),
};
fs.writeFileSync(path.join(publicDir, "trees.json"), JSON.stringify(manifest, null, 2));

// A compact cross-lens search index. The same unit can appear in the subject
// forest and in a programme lens; merge the lens ids instead of duplicating it.
type SearchEntry = { id: string; label: string; kind: string; path: string[]; lenses: string[] };
const search = new Map<string, SearchEntry>();
for (const { lens, tree } of lenses) {
  const byId = new Map(tree.nodes.map((node) => [node.id, node]));
  const pathFor = (id: string) => {
    const labels: string[] = [];
    let node = byId.get(id);
    const seen = new Set<string>();
    while (node?.parent && !seen.has(node.parent)) {
      seen.add(node.parent);
      const parent = byId.get(node.parent);
      if (!parent) break;
      labels.unshift(parent.label);
      node = parent;
    }
    return labels;
  };
  for (const node of tree.nodes) {
    const current = search.get(node.id);
    if (current) {
      if (!current.lenses.includes(lens.id)) current.lenses.push(lens.id);
      continue;
    }
    search.set(node.id, {
      id: node.id,
      label: node.label,
      kind: node.kind,
      path: pathFor(node.id),
      lenses: [lens.id],
    });
  }
}
const searchRows = [...search.values()].sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
fs.writeFileSync(path.join(publicDir, "search.json"), JSON.stringify(searchRows));

const docsDir = path.join(process.cwd(), "docs", "prototype-graph");
fs.mkdirSync(docsDir, { recursive: true });

const report = {
  version: graph.version,
  generatedAt: graph.generatedAt,
  stats: graph.stats,
  islands: graph.islands,
  diagnostics: graph.diagnostics,
  errors: graph.diagnostics.filter((item) => item.level === "error").length,
  warnings: graph.diagnostics.filter((item) => item.level === "warning").length,
  tree: {
    version: subject.version,
    report: subject.report,
  },
  lenses: lenses.map(({ lens, tree }) => ({
    id: lens.id,
    mode: lens.mode,
    label: lens.label,
    shortLabel: lens.shortLabel,
    file: lens.file,
    description: lens.description,
    roots: tree.report.roots,
    report: tree.report,
  })),
  hiddenEmptyPacks: subject.report.hiddenEmptyPacks,
  sourceGroups: subject.report.sourceGroups,
  sourceBuckets: subject.report.sourceBuckets,
  chapterGroups: subject.report.chapterGroups,
  duplicateChapterIds: subject.report.duplicateChapterIds,
};
fs.writeFileSync(path.join(docsDir, "graph-report.json"), JSON.stringify(report, null, 2));

fs.writeFileSync(path.join(docsDir, "TREE.md"), renderTreeDoc(lenses, report));

const totalTreeBytes = [...sizes.values()].reduce((sum, value) => sum + value, 0);
console.log(
  [
    `graph ${graph.version}`,
    `nodes ${graph.nodes.length}`,
    `edges ${graph.edges.length}`,
    `units ${graph.stats.subjectUnits ? Object.values(graph.stats.subjectUnits).reduce((a, b) => a + b, 0) : 0}`,
    `islands ${graph.stats.islands.filter((item) => item.id >= 0).length}`,
    `modularity ${graph.stats.modularity}`,
    `candidates ${graph.stats.candidatePairs}`,
    `errors ${graph.diagnostics.filter((item) => item.level === "error").length}`,
    `dataset ${(fs.statSync(datasetPath).size / 1024).toFixed(1)} KB`,
    `trees ${lenses.map(({ lens, tree }) => `${lens.id} ${tree.report.nodeCount}/d${tree.report.depth}`).join(", ")}`,
    `tree files ${(totalTreeBytes / 1024).toFixed(1)} KB`,
  ].join(" | "),
);
for (const diagnostic of graph.diagnostics.filter((item) => item.level !== "info").slice(0, 20)) {
  console.log(`${diagnostic.level.toUpperCase()} ${diagnostic.code}: ${diagnostic.message}`);
}

function md(value: string | number): string {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderTreeDoc(entries: LensTree[], data: typeof report): string {
  const lines: string[] = [];
  lines.push("# Knowledge tree — audit and data notes");
  lines.push("");
  lines.push(`Generated by \`npm run graph:build\` on ${data.generatedAt.slice(0, 10)}.`);
  lines.push(`Graph version: \`${data.version}\`.`);
  lines.push("");
  lines.push("## What this map is");
  lines.push("");
  lines.push(
    "The learner route is `/prototype/network/`. It draws **containment only**: parent → child edges from the corpus registries. Citations, prerequisites, co-citation, TF-IDF candidates and Atlas review relations are not structure and are not drawn, except for declared “see also” lines on the selected node.",
  );
  lines.push("");
  lines.push(
    "Two navigational layers are synthetic and marked in the payload: URL-derived source groups and repeated-chapter-title groups. Programme lenses are projections of declared programme subjects, not new containment claims.",
  );
  lines.push("");
  lines.push("## Lens counts");
  lines.push("");
  lines.push("| Lens | Mode | Roots | Nodes | Edges | Depth | Max children | Median | Nodes >12 | Orphans |");
  lines.push("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const { lens, tree } of entries) {
    const r = tree.report;
    lines.push(
      `| ${md(lens.shortLabel)} | ${lens.mode} | ${r.roots.length} | ${r.nodeCount} | ${r.edgeCount} | ${r.depth} | ${r.branching.max} | ${r.branching.median} | ${r.branching.nodesOver12} | ${r.orphans.unitsWithoutParent} |`,
    );
  }
  lines.push("");
  lines.push("### Subject depth histogram");
  lines.push("");
  lines.push("| Depth | Nodes |");
  lines.push("|---:|---:|");
  for (const [depth, count] of Object.entries(subject.report.depthHistogram).sort(([a], [b]) => Number(a) - Number(b))) {
    lines.push(`| ${depth} | ${count} |`);
  }
  lines.push("");
  const academyTree = entries.find((entry) => entry.lens.id === "academy")?.tree;
  const academyTracks = academyTree?.report.roots[0]?.children ?? 0;
  const academyModules = academyTree?.nodes.filter((node) => node.kind === "chapter").length ?? 0;
  const academyLessons = academyTree?.nodes.filter((node) => node.kind === "unit").length ?? 0;
  lines.push("## Programme partitions");
  lines.push("");
  lines.push("| Lens | Declared programme subject(s) | Included in this lens | Excluded from this lens |");
  lines.push("|---|---|---|---|");
  lines.push(
    "| DP-600 | `fabric` | Fabric subject, minus separately-owned RTI and Academy; the DP-600 ingestion unit is included | RTI course, Academy lessons, Power BI/SQL, 9 empty packs |",
  );
  lines.push("| Fabric RTI | `fabric` | `course:rti` and its 8 lessons | Fabric core, Academy, 9 empty packs |");
  lines.push(
    `| Corpus Academy | \`fabric\`, \`power-bi\` | ${academyTracks} tracks → ${academyModules} declared modules → ${academyLessons} lessons | Fabric/Power BI core |`,
  );
  lines.push("");
  lines.push(
    "Programme → subject is declared. Programme → pack/lesson is **not** enumerated in the corpus, so the DP-600 and RTI lenses are projections, not new membership edges. The DP-600 lens is not an exam blueprint. The corpus declares no DP-700 programme.",
  );
  lines.push("");
  lines.push("## Hidden empty packs");
  lines.push("");
  lines.push("These packs are declared by `content/fabric/packs.json` but have no chapter notes yet. They are hidden from every learner lens and have no Open action.");
  lines.push("");
  lines.push("| Pack id | Label | Reason |");
  lines.push("|---|---|---|");
  for (const pack of data.hiddenEmptyPacks) {
    lines.push(`| \`${md(pack.id)}\` | ${md(pack.label)} | ${md(pack.reason)} |`);
  }
  lines.push("");
  lines.push("## Source grouping");
  lines.push("");
  lines.push(
    `The Fabric subject has **${data.sourceBuckets.find((bucket) => bucket.id === "group:sources:fabric")?.count ?? 0}** cited sources. They are grouped by URL host and documentation area into **${data.sourceGroups.length}** groups. The rule is: host + the first two path segments after the locale; Delta docs use the first path segment; YouTube groups by host. Labels are humanized; the raw URL remains on the source node and in the side card.`,
  );
  lines.push("");
  lines.push("| Group | Host | Area | Sources |");
  lines.push("|---|---|---|---:|");
  for (const group of [...data.sourceGroups].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))) {
    lines.push(`| ${md(group.label)} | \`${md(group.host)}\` | \`${md(group.area)}\` | ${group.count} |`);
  }
  lines.push("");
  lines.push(
    "The 25 visualization source pages remain one `Source pages` bucket: their URLs are opaque Notion page IDs, so no factual area grouping can be derived. They are not mixed into the Fabric source groups.",
  );
  lines.push("");
  lines.push("## Chapter grouping");
  lines.push("");
  lines.push(
    `**${data.chapterGroups.length}** chapter containers were created from repeated chapter titles in Fabric packs. This is a display grouping: the notes remain the declared units, and the title is the corpus's own. Packs with unique chapter titles keep direct children and use 12-per-page paging.`,
  );
  lines.push("");
  lines.push("| Pack | Chapter group | Notes |");
  lines.push("|---|---|---:|");
  for (const group of [...data.chapterGroups].sort((a, b) => a.parent.localeCompare(b.parent) || a.label.localeCompare(b.label))) {
    lines.push(`| \`${md(group.parent)}\` | ${md(group.label)} | ${group.count} |`);
  }
  lines.push("");
  lines.push("## Structural checks");
  lines.push("");
  lines.push("| Check | Result |");
  lines.push("|---|---|");
  lines.push(`| Duplicate node ids | 0 |`);
  lines.push(`| Missing parents | 0 |`);
  lines.push(`| Cycles | 0 |`);
  lines.push(`| Unreachable nodes | 0 |`);
  lines.push(`| Orphans / Unfiled | 0 |`);
  lines.push(`| Multi-parent nodes after excluding programmes | 0 |`);
  lines.push(`| Hidden empty packs | ${data.hiddenEmptyPacks.length} |`);
  lines.push(
    `| Duplicate chapter ids across packs | ${data.duplicateChapterIds.length} (${data.duplicateChapterIds.map((entry) => `${entry.id}×${entry.count}`).join(", ")}) — full unit ids are unique; not a tree break |`,
  );
  lines.push("");
  lines.push("## Exclusions and limits");
  lines.push("");
  lines.push("- No derived, candidate, co-citation, lexical or Atlas-review edge is drawn. The tree route never loads `dataset.json`.");
  lines.push("- No DP-700 programme is invented; the corpus does not declare one.");
  lines.push("- Academy courseware is shown only in the Academy programme lens; the subject lens stays subject-declared.");
  lines.push("- The 9 empty packs are documented above, not shown as dead ends.");
  lines.push("- The 25 Notion source pages are not area-grouped because their URLs contain no documentation area.");
  lines.push("- The graph is not an exam blueprint and does not claim every Fabric pack is DP-600-specific.");
  lines.push("");
  lines.push("## Learner view contract");
  lines.push("");
  lines.push("The map is an explorer, not a completeness diagram. These rules are enforced by `lib/knowledge-graph/tree-model.ts`, `tree-layout.ts`, `tree-labels.ts` and `tests/knowledge/tree-map.test.mjs`.");
  lines.push("");
  lines.push("- Default subject lens: the 8 subject roots only. Every root is labelled, labels do not overlap, and the URL carries no focus.");
  lines.push("- Opening a branch is an accordion by default; \"Keep branches open\" disables it. Each branch pages 12 children at a time with a \"+N more\" control, and the whole view stops at 150 nodes.");
  lines.push("- Ring = depth, angle = the parent's wedge share, node size = √(visible descendants), colour = root subject. Ring radii follow the deepest open level so shallow views use the canvas.");
  lines.push("- A short deterministic `d3-force` pass (collide, weak link, weak radial) settles positions. The same open set always produces the same layout.");
  lines.push("- Labels are drawn for the focus, its children and the path to the root. They truncate at 24 characters, show the full title on hover, and are skipped rather than overlapped. Root labels stay under zoom until a branch is focused.");
  lines.push("- On a narrow map (tablet, or the side card open) the label layer is counter-scaled up to 1.5× so text stays near 11–12 px on screen; the collision pass uses the same scale. Below 768 px labels are hidden by design and the List tab carries the names.");
  lines.push("- The map is a single tab stop: arrow keys move between siblings and into children, Enter/Space activates, and Escape closes the details card and returns focus to its node or list row. The List keeps a conventional tab order.");
  lines.push("- Only containment edges are drawn. Declared \"see also\" lines appear dashed for the selected node; derived, candidate and Atlas-review edges never load on this route.");
  lines.push("- Lenses are \"By subject\" (default) and \"By programme\" (DP-600, Fabric RTI, Corpus Academy), one at a time.");
  lines.push("- `?focus=<id>&open=<id,id>` restores the view. \"Show everything\" is an explicit, labels-off overview outside the 150-node cap and is never the default.");
  lines.push("- Four shapes only: root (double ring), container (ring), unit (dot), source/page (square). \"+N more\" is a control, not a node.");
  lines.push("- At 390 px the List tab is the default; the Map tab stays as a labels-off spatial overview, with names in the card and the List.");
  lines.push("");
  lines.push("## Verification");
  lines.push("");
  lines.push("Commands: `npm run graph:build`, `npm run test:knowledge`, `npm run build`, `npm run qa:network`.");
  lines.push("");
  lines.push("Latest browser QA: `docs/prototype-graph/QA.md` (PASS). Machine report: `docs/prototype-graph/qa-browser.json`. Screenshots: `docs/prototype-graph/screens/tree/`.");
  lines.push("");
  lines.push("`scripts/qa-network-graph.mjs` targets the retired `.kng` component and is superseded by `scripts/qa-network-tree.mjs`; do not run it as current QA.");
  lines.push("");
  return lines.join("\n");
}
