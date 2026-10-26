// Controlled installer for the BeUI registry items this project actually uses.
//
// It is deliberately not `npx shadcn add`: that command can rewrite project-wide
// configuration and `lib/utils.ts`. This script writes only the files listed by
// the live registry item, refuses to clobber a different existing file, and
// records the exact source hash so the adoption is reproducible.
//
//   node scripts/install-beui.mjs --dry-run
//   node scripts/install-beui.mjs
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");

// Verified against https://beui.dev/registry.json on 2026-10-23. Stable IDs use
// the `react-web:<install-slug>` convention from the BeUI operating manual.
const ITEMS = [
  {
    slug: "funnel-chart",
    stableId: "react-web:funnel-chart",
    title: "Funnel Chart",
    purpose: "Ordered conversion pipeline with step and total conversion tooltips.",
    // Keep the project's own helper; it already exports the same `cn` API.
    skip: ["lib/utils.ts"],
  },
  {
    slug: "treemap",
    stableId: "react-web:treemap",
    title: "Treemap",
    purpose: "Hierarchical parts-of-whole where tile area maps to a nonnegative value.",
    skip: ["lib/utils.ts"],
  },
  // ---- Live teaching figures (2026-10-25 rework) ---------------------------
  // Every item below is used by an implemented module; nothing is installed to
  // fill a catalogue. Shared helper files are byte-identical across items and
  // the project's own `lib/utils.ts` is never replaced.
  {
    slug: "composition-chart",
    stableId: "react-web:composition-chart",
    title: "Composition Chart",
    purpose: "Normalized stacked shares over ordered periods; period scrub and bar/area views.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "sankey-chart",
    stableId: "react-web:sankey-chart",
    title: "Sankey Chart",
    purpose: "Additive stage flows, used to separate converted from rejected candidates.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "donut-chart",
    stableId: "react-web:donut-chart",
    title: "Donut Chart",
    purpose: "Angle-encoded part-to-whole counterexample beside a length encoding.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "animated-number",
    stableId: "react-web:animated-number",
    title: "Animated Number",
    purpose: "KPI value transition that explains the state change; respects reduced motion.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "adaptive-stepper",
    stableId: "react-web:adaptive-stepper",
    title: "Adaptive Stepper",
    purpose: "Progressive stage control for the pipeline and dashboard scan-path figures.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "sortable-stack",
    stableId: "react-web:sortable-stack",
    title: "Sortable List",
    purpose: "Keyboard-operable ranking exercise for encoding strength.",
    skip: ["lib/utils.ts"],
  },
  // ---- AI-interface patterns (local deterministic engine, no model calls) --
  {
    slug: "prompt-input",
    stableId: "react-web:prompt-input",
    title: "Prompt Input",
    purpose: "Prompt surface for the deterministic chart-decision workspace.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "message",
    stableId: "react-web:message",
    title: "Message",
    purpose: "Conversation rows for the decision workspace.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "streaming-response",
    stableId: "react-web:streaming-response",
    title: "Streaming Response",
    purpose: "Locally generated response with completion actions and source disclosure.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "reasoning-text",
    stableId: "react-web:reasoning-text",
    title: "Reasoning Text",
    purpose: "Visible local rule evaluation instead of a fake model chain-of-thought.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "agent-activity",
    stableId: "react-web:agent-activity",
    title: "Agent Activity",
    purpose: "Trace of the deterministic steps the assistant actually ran.",
    skip: ["lib/utils.ts"],
  },
  {
    slug: "approval-card",
    stableId: "react-web:approval-card",
    title: "Approval Card",
    purpose: "Human decision on the recommendation: accept, request changes, or reject.",
    skip: ["lib/utils.ts"],
  },
];

const LICENSE = "MIT";
const SOURCE = "https://beui.dev/r";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const report = [];

for (const item of ITEMS) {
  const url = `${SOURCE}/${item.slug}.json`;
  const response = await fetch(url, { headers: { "user-agent": "hansa-beui-installer" } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const json = await response.json();
  if (!Array.isArray(json.files) || !json.files.length) {
    throw new Error(`${item.slug}: registry item has no files`);
  }

  const written = [];
  for (const file of json.files) {
    if (item.skip.includes(file.path)) continue;
    const target = path.join(ROOT, file.path);
    if (!file.content) throw new Error(`${item.slug}: ${file.path} has no inline content`);

    if (existsSync(target)) {
      const existing = await readFile(target, "utf8");
      if (existing !== file.content) {
        throw new Error(
          `Refusing to overwrite ${file.path}: it exists with different content. ` +
            `Review the diff, then delete it deliberately if the upgrade is wanted.`,
        );
      }
      written.push({ file: file.path, status: "unchanged" });
      continue;
    }

    if (!DRY) {
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content, "utf8");
    }
    written.push({ file: file.path, status: DRY ? "would-create" : "created" });
  }

  report.push({
    slug: item.slug,
    stableId: item.stableId,
    title: json.title ?? item.title,
    license: LICENSE,
    registryUrl: url,
    sourceHash: sha256(JSON.stringify(json.files)),
    dependencies: json.dependencies ?? [],
    registryDependencies: json.registryDependencies ?? [],
    files: written,
    fetchedAt: new Date().toISOString().slice(0, 10),
  });
  console.log(
    `${DRY ? "Would install" : "Installed"} ${item.stableId} — ${written.length} file(s), ${json.dependencies?.length ?? 0} dependency spec(s)`,
  );
}

const logPath = path.join(ROOT, "docs", "data-visualization", "beui-install-log.json");
if (!DRY) {
  await mkdir(path.dirname(logPath), { recursive: true });
  await writeFile(logPath, `${JSON.stringify({ generatedBy: "scripts/install-beui.mjs", items: report }, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(ROOT, logPath)}`);
}
