// Review audit: check what users actually see on every surface
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// 1. Academy lesson titles — check if frontmatter titles were extracted
const academy = readJson("content/academy/lessons.json");
console.log("=== ACADEMY LESSON TITLES (first 5 from each track) ===");
for (const track of academy.tracks) {
  console.log(`  Track: ${track.title} (${track.lessons.length} lessons)`);
  for (const lesson of track.lessons.slice(0, 5)) {
    console.log(`    slug: ${lesson.slug.padEnd(35)} title: ${(lesson.title || "MISSING").slice(0, 55)}`);
  }
}
const noTitle = academy.tracks.flatMap(t => t.lessons).filter(l => !l.title || l.title === l.slug);
console.log(`\nlessons with missing/fallback titles: ${noTitle.length}`);
if (noTitle.length) {
  noTitle.slice(0, 5).forEach(l => console.log(`  ${l.track}/${l.slug}: title="${l.title}"`));
}

// 2. Pack labels
console.log("\n=== PACK LABELS ON DP-600 HUB ===");
const packs = readJson("content/fabric/packs.json");
for (const p of packs) {
  const hasVideo = p.video ? "✓" : "✗ NO VIDEO";
  const labelOk = p.label.length > 3 && p.label !== p.key ? "✓" : "✗ LABEL=KEY";
  console.log(`  ${p.key.padEnd(25)} label:${labelOk} video:${hasVideo} "${p.label.slice(0, 55)}"`);
}

// 3. Study hub topic desks from built HTML
console.log("\n=== STUDY HUB TOPIC DESKS (from built HTML) ===");
const outDir = "out/study";
if (existsSync(outDir)) {
  const subjects = readdirSync(outDir).filter(f => {
    try { return statSync(path.join(outDir, f)).isDirectory(); } catch { return false; }
  });
  for (const subject of subjects) {
    const subjectDir = path.join(outDir, subject);
    const topics = readdirSync(subjectDir).filter(f => {
      try { return statSync(path.join(subjectDir, f)).isDirectory(); } catch { return false; }
    });
    const counts = [];
    for (const topic of topics) {
      const htmlPath = path.join(subjectDir, topic, "index.html");
      if (existsSync(htmlPath)) {
        const html = readFileSync(htmlPath, "utf8");
        const match = html.match(/(\d+) matching records/);
        if (match) counts.push({ topic, count: Number(match[1]) });
      }
    }
    const total = counts.reduce((s, t) => s + t.count, 0);
    console.log(`  /study/${subject}/: ${topics.length} topics, ~${total} records`);
    counts.sort((a, b) => b.count - a.count).slice(0, 3).forEach(t =>
      console.log(`    ${t.topic}: ${t.count}`)
    );
  }
}

// 4. DP-600 hub — what pack names appear
console.log("\n=== DP-600 HUB: pack names in built HTML ===");
const hubPath = "out/lab/dp-600/index.html";
if (existsSync(hubPath)) {
  const hubHtml = readFileSync(hubPath, "utf8");
  for (const [label, regex] of [
    ["Howard Ginsburg visible", /Howard Ginsburg/],
    ["Patrick Wiloak visible", /Patrick Wiloak/],
    ["Semantic Models & DAX", /Semantic Models & DAX/],
    ["Video 6 label", /Video 6/],
    ["'No single source video' text", /No single source video/],
    ["Community bank note", /community|MIT|CC BY/i],
  ]) {
    console.log(`  ${label}: ${regex.test(hubHtml) ? "VISIBLE ✓" : "not found"}`);
  }
}

// 5. Academy index page
console.log("\n=== ACADEMY INDEX PAGE ===");
const academyPath = "out/learn/academy/index.html";
if (existsSync(academyPath)) {
  const html = readFileSync(academyPath, "utf8");
  console.log(`  exists ✓`);
  console.log(`  has MIT notice: ${/MIT/.test(html) ? "✓" : "✗"}`);
  console.log(`  has track titles: ${/Fabric analytics labs/.test(html) ? "✓" : "✗"}`);
  const lessonCount = (html.match(/Fabric analytics labs/g) ?? []).length;
  console.log(`  track mentions: ${lessonCount}`);
} else {
  console.log("  NOT FOUND — check build");
}

// 6. Hands-on labs
console.log("\n=== HANDS-ON LABS ===");
const handsOnPath = "out/lab/hands-on/index.html";
if (existsSync(handsOnPath)) {
  const html = readFileSync(handsOnPath, "utf8");
  const labLinks = [...html.matchAll(/href="\/lab\/hands-on\/([^/"]+)\/"/g)].map(m => m[1]);
  console.log(`  lab links: ${labLinks.length}`);
  labLinks.slice(0, 3).forEach(l => console.log(`    ${l}`));
}

// 7. Draft banks — labels users see
console.log("\n=== DRAFT BANKS (user-facing labels) ===");
for (const bank of ["dp600-r18", "pl300-v88", "kengio-dp700", "corpus-candidates", "chaturcr48-dp600", "warren-dp600", "stark-v2-dp600"]) {
  try {
    const data = readJson(`content/drafts/${bank}.json`);
    const statusLabel = data.statusLabel || data.status || "?";
    console.log(`  ${bank.padEnd(25)} ${String(data.questions?.length ?? 0).padStart(5)} Q  "${statusLabel.slice(0, 60)}"`);
  } catch { console.log(`  ${bank}: not found`); }
}

// 8. Irrelevant topics check
console.log("\n=== FABRIC DESK: TOPIC DISTRIBUTION ===");
const idx = readJson("content/fabric/index.json");
const fabricTopics = {};
for (const q of idx.filter(q => q.subject === "fabric")) {
  fabricTopics[q.topic] = (fabricTopics[q.topic] ?? 0) + 1;
}
const sorted = Object.entries(fabricTopics).sort((a, b) => b[1] - a[1]);
console.log(`  ${sorted.length} unique topics on fabric desk`);
for (const [topic, count] of sorted.slice(0, 15)) {
  console.log(`    ${topic.padEnd(40)} ${count}`);
}
console.log(`    ... and ${sorted.length - 15} more with 1-2 questions each`);
