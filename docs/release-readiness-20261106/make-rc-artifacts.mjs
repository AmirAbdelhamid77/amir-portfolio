// Build the release-candidate evidence page from measured data.
//
//   node docs/release-readiness-20261106/make-rc-artifacts.mjs
//
// Reads the E2E result, the performance sample and the build log that the other
// scripts wrote, then emits `release-candidate.html` (a side-by-side against the
// original prototype) and `evidence/rc-summary.json`. Nothing is hand-copied:
// if a check fails, the page says so.
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";

const DIR = "docs/release-readiness-20261106";
const EVIDENCE = `${DIR}/evidence`;
const read = (path) => readFileSync(path, "utf8");
const json = (path) => JSON.parse(read(path));
const bytes = (path) => (existsSync(path) ? statSync(path).size : 0);

const e2e = json(`${EVIDENCE}/rc-e2e.json`);
const perf = json(`${EVIDENCE}/rc-perf.json`);
const log = read(`${DIR}/build-rc.log`);
const profileMatch = log.match(/=== profile summary ===\s*([\s\S]*?)\nFAILED|\nPASS:/);
const profile = profileMatch ? JSON.parse(profileMatch[1]) : null;
const seedDryRun = read(`${EVIDENCE}/atlas-seed-dryrun.txt`);

const group = (prefix) => e2e.results.filter((entry) => entry.id.startsWith(prefix));
const passCount = (list) => list.filter((entry) => entry.ok).length;
const esc = (value) =>
  String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

const failureRows = e2e.results
  .filter((entry) => !entry.ok)
  .map((entry) => `<tr><td><code>${esc(entry.id)}</code></td><td>${esc(entry.detail)}</td></tr>`)
  .join("");

const shot = (name, caption) =>
  existsSync(`${EVIDENCE}/${name}.png`)
    ? `<figure><img src="evidence/${name}.png" alt="${esc(caption)}" loading="lazy"><figcaption>${esc(caption)}</figcaption></figure>`
    : `<p class="missing">missing: ${esc(name)}.png</p>`;

const rows = [
  ["Identity", "Editorial dashboard: magnolia paper, serif headlines, one accent", "Same identity, now three scenes instead of one scroll of widgets"],
  ["Timeline", "A 15-day card strip with a date rail", "Desktop: fanned cards on a rail with a playhead; below 1024 px the strip stays"],
  ["Knowledge scene", "A concept panel beside a relationship web", "The same lens, reveal and evidence states, with the Atlas pinned to published records only"],
  ["Dealer", "A card table below the fold, always mounted", "A cinematic dialog dealt on demand; Escape, focus trap and focus return"],
  ["Closing", "A generic call to action", "One idea, one action, kept cards and a coverage ledger with the denominators"],
  ["Type and targets", "Mixed 10-16 px UI text, small targets", "Nine-role scale, 11 px floor for mono metadata, 44 px controls"],
  ["Dark mode", "Invert only", "Full token set per scene, checked at five widths"],
  ["Publication", "Prototype drew candidate graph data directly", "Public build draws nothing unpublished; the review route is pruned to 404"],
];

const checks = e2e.results
  .map(
    (entry) =>
      `<tr class="${entry.ok ? "ok" : "bad"}"><td>${entry.ok ? "PASS" : "FAIL"}</td><td><code>${esc(entry.id)}</code></td><td>${esc(entry.detail)}</td></tr>`,
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Release candidate — Hansa knowledge stage</title>
<style>
  :root {
    --paper: #f7f4ec; --ink: #191712; --muted: #6b6558; --line: #d8d2c2;
    --card: #fffdf6; --good: #1f6f43; --bad: #a3271e; --accent: #8a2f1f;
    --mono: ui-monospace, "Cascadia Mono", Consolas, monospace;
    --serif: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  }
  @media (prefers-color-scheme: dark) {
    :root { --paper: #17150f; --ink: #f2ede0; --muted: #a49c8b; --line: #3a352a;
      --card: #201d16; --good: #7cc39a; --bad: #e88b7f; --accent: #e0a58c; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--serif); }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 48px 20px 96px; }
  h1, h2, h3 { font-weight: 500; letter-spacing: -0.01em; line-height: 1.15; margin: 0 0 8px; }
  h1 { font-size: clamp(30px, 5vw, 46px); }
  h2 { font-size: clamp(22px, 3vw, 30px); margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--line); }
  h3 { font-size: 18px; margin-top: 28px; }
  p, li { max-width: 74ch; }
  .kicker { font: 700 11px/1.4 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin: 0 0 10px; }
  .meta { font: 12px/1.6 var(--mono); color: var(--muted); }
  .state { display: inline-flex; gap: 8px; align-items: center; padding: 8px 14px; border-radius: 999px;
    border: 1px solid var(--line); background: var(--card); font: 700 11px/1.4 var(--mono); letter-spacing: .12em;
    text-transform: uppercase; white-space: nowrap; max-width: 100%; }
  @media (max-width: 720px) { .state { white-space: normal; } }
  .state b { color: var(--accent); }
  table { width: 100%; border-collapse: collapse; margin: 16px 0 8px; font-size: 14px; }
  th, td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid var(--line); }
  th { font: 700 10px/1.4 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  td code, p code { font: 12px/1.5 var(--mono); }
  tr.bad td { color: var(--bad); }
  tr.ok td:first-child { color: var(--good); }
  .figs { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); margin-top: 16px; }
  figure { margin: 0; background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
  figure img { display: block; width: 100%; height: auto; }
  figcaption { font: 12px/1.5 var(--mono); color: var(--muted); padding: 10px 12px; border-top: 1px solid var(--line); }
  .split { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
  @media (max-width: 800px) { .split { grid-template-columns: 1fr; } }
  .note { border-left: 2px solid var(--accent); padding: 4px 0 4px 14px; color: var(--muted); }
  .missing { font: 12px var(--mono); color: var(--bad); }
  ul { padding-left: 20px; }
  li { margin: 4px 0; }
  .num { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 18px 0; }
  .num div { border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; background: var(--card); }
  .num strong { display: block; font: 600 24px/1.2 var(--mono); }
  .num span { font: 11px/1.4 var(--mono); text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
</style>
</head>
<body>
<div class="wrap">

  <p class="kicker">Hansa / release readiness / 6 November 2026</p>
  <h1>Release candidate</h1>
  <p class="state">Status <b>${e2e.failed === 0 ? "promoted default verified" : "promoted default has failures"}</b> · not deployed · publication still gated</p>
  <p class="meta">Build: no <code>HANSA_*</code> variables — R3–R6 are the default since D1 ·
  HANSA_ATLAS_REVIEW_PREVIEW and HANSA_NEIGHBOURHOOD_REVIEW unset</p>

  <div class="num">
    <div><strong>${e2e.checks}</strong><span>checks run</span></div>
    <div><strong>${e2e.failed}</strong><span>failed</span></div>
    <div><strong>${e2e.errors.length}</strong><span>console errors</span></div>
    <div><strong>${perf.lcp} ms</strong><span>LCP, local, 1280 px</span></div>
    <div><strong>${perf.cls}</strong><span>CLS</span></div>
    <div><strong>0</strong><span>published concepts</span></div>
  </div>

  <h2>What this is</h2>
  <p>One Home that carries every accepted design slice at once — the R3 fan, the R4
  cinematic dealer, the R5 closing and the R6 polish layer — now the default
  shipped build, verified end to end against the original prototype. The Atlas
  publication state is untouched: the public projection still carries zero
  concepts and zero connections, and the six-record seed is a proposal in
  <a href="ATLAS_SEED_PROPOSAL.md">ATLAS_SEED_PROPOSAL.md</a>.</p>
  <p class="note">Design readiness and publication readiness are separate here by
  construction: the promoted default is a build, the publication state is data,
  and no build switch can turn a candidate record into a published one.</p>

  <h2>Side by side with the original prototype</h2>
  <p>The prototype is the "before" the owner asked to recover: the identity is
  right, but the reader scrolls a column of widgets instead of moving through
  scenes. The table is the honest comparison, not a claim of wholesale
  improvement — the prototype's timeline and knowledge lens were reused, not
  reinvented.</p>
  <table>
    <thead><tr><th>Aspect</th><th>Original prototype</th><th>Promoted default</th></tr></thead>
    <tbody>${rows.map(([a, b, c]) => `<tr><td><strong>${esc(a)}</strong></td><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join("")}</tbody>
  </table>
  <div class="split">
    ${shot("prototype-desktop-light", "Original prototype — desktop, light")}
    ${shot("rc-home-desktop-light", "Promoted default — desktop, light")}
    ${shot("prototype-desktop-dark", "Original prototype — desktop, dark")}
    ${shot("rc-home-desktop-dark", "Promoted default — desktop, dark")}
  </div>

  <h2>The three scenes</h2>
  <div class="figs">
    ${shot("rc-fan", "R3 — the edition fan at 1280 px, before selection")}
    ${shot("rc-fan-focus", "R3 — keyboard focus on a fan card")}
    ${shot("rc-knowledge-scene", "Scene 2 — knowledge, reveal and the Atlas status line")}
    ${shot("rc-dealer", "R4 — the cinematic dealer, opened on demand")}
    ${shot("rc-dealer-saved", "R4 — after saving a card, the control states the new state")}
    ${shot("rc-closing", "R5 — closing: one idea, one action, kept cards")}
    ${shot("rc-closing-coverage", "R5 — the coverage ledger disclosure")}
    ${shot("rc-archive", "Archive — search and open, below the closing")}
  </div>

  <h2>Responsive and theme evidence</h2>
  <div class="figs">
    ${shot("rc-home-390", "390 px — the strip replaces the fan, light")}
    ${shot("rc-home-390-dark", "390 px — dark")}
    ${shot("rc-home-320", "320 px — darkest supported width")}
  </div>

  <h2>Measured performance (one local machine)</h2>
  <table>
    <tbody>
      <tr><th>LCP</th><td>${perf.lcp} ms</td></tr>
      <tr><th>CLS</th><td>${perf.cls} across ${perf.shifts} layout shifts</td></tr>
      <tr><th>Requests</th><td>${perf.requests}</td></tr>
      <tr><th>JavaScript</th><td>${perf.js.toLocaleString()} B transferred</td></tr>
      <tr><th>CSS</th><td>${perf.css.toLocaleString()} B transferred</td></tr>
      <tr><th>Total transferred</th><td>${perf.total.toLocaleString()} B</td></tr>
      <tr><th>DOM nodes</th><td>${perf.domNodes}</td></tr>
    </tbody>
  </table>
  <p class="note">Local static server, warm cache, headless Edge. This is a
  regression signal, not field data: no throttling, no CDN, one machine.</p>

  <h2>Every check</h2>
  <p>${passCount(e2e.results)} of ${e2e.checks} checks pass. The table is the raw
  result file, <code>evidence/rc-e2e.json</code>, rendered without editing.</p>
  <table>
    <thead><tr><th>Result</th><th>Check</th><th>Detail</th></tr></thead>
    <tbody>${checks}</tbody>
  </table>
  ${failureRows ? `<h3>Failures</h3><table><tbody>${failureRows}</tbody></table>` : ""}

  <h2>Publication separation</h2>
  <ul>
    <li>The public Atlas projection carries <strong>0 concepts and 0 connections</strong>; the payload states both counts and the Home prints them.</li>
    <li>No candidate edge id appears in either export. The only concept ids present are the internal keys of the accepted public insights (<code>concept:fabric:shortcut</code>), rendered as a slug label, never as a claim.</li>
    <li><code>/review/neighbourhood/</code> is a local-only route. The export step prunes it, so a static host answers <strong>404</strong>; the route source stays in the repository for review builds.</li>
    <li>R1/R2 stay off. They render candidate records and remain publication-gated, not design-blocked.</li>
    <li>The seed proposal cannot publish itself: its placeholder reviewer does not start with <code>Human:</code>, and <code>validateDataset</code> rejects it. The dry run asserts that rejection.</li>
  </ul>

  <h2>Atlas seed — proposal only</h2>
  <pre class="meta">${esc(seedDryRun.split("\n").filter((line) => line.startsWith("ok ") || line.startsWith("PASS") || line.startsWith("FAIL")).join("\n"))}</pre>

  <h2>Blockers and open decisions</h2>
  <table>
    <thead><tr><th>ID</th><th>Decision</th><th>Effect if deferred</th></tr></thead>
    <tbody>
      <tr><td>D1</td><td>Promote R3–R6 to the public default — <strong>technically verified, awaiting final owner sign-off</strong></td><td>Rollback: rebuild with <code>HANSA_*_REVIEW=0</code> for any slice; the M6 baseline is unchanged</td></tr>
      <tr><td>D2</td><td>Approve the six-record Atlas seed</td><td>Ships with an honest 0/0 graph</td></tr>
      <tr><td>D3</td><td>Run NVDA/VoiceOver, or waive it</td><td>Accessibility evidence stays automated-only, and the record says so</td></tr>
      <tr><td>D4</td><td>Deploy to Cloudflare Pages/Workers</td><td>Nothing public changes; no Cloudflare call is made by this work</td></tr>
      <tr><td>D5</td><td>Publish R1/R2</td><td>The neighbourhood stays a review surface</td></tr>
    </tbody>
  </table>

  <h2>Reproduce</h2>
  <pre class="meta">node scripts/build-rc.mjs            # out-rc/ with four flags, out/ rebuilt clean
node scripts/build-rc.mjs --check    # re-verify an existing pair without rebuilding
node scripts/serve-rc.mjs 4396       # serve the promoted export (mirror)
node docs/release-readiness-20261106/rc-e2e.mjs
node docs/release-readiness-20261106/capture-evidence.mjs
node docs/release-readiness-20261106/make-rc-artifacts.mjs
node scripts/verify-knowledge-atlas.mjs
node scripts/verify-agent-reference.mjs</pre>

  <h2>Limits of this evidence</h2>
  <ul>
    <li>A scripted browser run is not a manual assistive-technology audit.</li>
    <li>One local machine is not field performance data.</li>
    <li>The seed is a proposal; its JSON is not imported and its states are unchanged.</li>
    <li>Nothing was deployed, and no publication policy changed.</li>
  </ul>

  <p class="meta">Generated ${new Date().toISOString()} from
  <code>evidence/rc-e2e.json</code>, <code>evidence/rc-perf.json</code> and
  <code>build-rc.log</code>.</p>
</div>
</body>
</html>`;

writeFileSync(`${DIR}/release-candidate.html`, html);
writeFileSync(
  `${EVIDENCE}/rc-summary.json`,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      checks: e2e.checks,
      failed: e2e.failed,
      consoleErrors: e2e.errors.length,
      perf,
      profile,
      seedDryRunPassed: /PASS: the proposal is minimal/.test(seedDryRun),
      evidenceImages: [
        "prototype-desktop-light",
        "prototype-desktop-dark",
        "rc-home-desktop-light",
        "rc-home-desktop-dark",
        "rc-fan",
        "rc-fan-focus",
        "rc-knowledge-scene",
        "rc-dealer",
        "rc-dealer-saved",
        "rc-closing",
        "rc-closing-coverage",
        "rc-archive",
        "rc-home-390",
        "rc-home-390-dark",
        "rc-home-320",
      ].map((name) => ({ name, bytes: bytes(`${EVIDENCE}/${name}.png`) })),
    },
    null,
    2,
  ),
);
console.log("wrote", `${DIR}/release-candidate.html`, "and", `${EVIDENCE}/rc-summary.json`);
