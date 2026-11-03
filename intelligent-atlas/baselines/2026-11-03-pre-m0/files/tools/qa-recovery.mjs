// Complete interaction and preservation QA for the recovered Knowledge Stage.
//
//   node intelligent-atlas/tools/qa-recovery.mjs
//
// Walks one real date -> edition -> card -> concept -> branch -> return path,
// then checks the separate public artifact, stable identifiers, deck contracts
// and saved progress. Receipt: analysis/qa-recovery.json.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {
  ANALYSIS,
  EVIDENCE,
  ROOT,
  Results,
  api,
  attachErrors,
  launchBrowser,
  layoutSnapshot,
  newContext,
  openPrototype,
  screenshot,
  settle,
  state,
  writeJson,
} from "./qa-lib.mjs";

const results = new Results("qa-recovery");
const errors = [];
const shots = path.join(EVIDENCE, "interaction");
const browser = await launchBrowser();
let data = null;

try {
  const context = await newContext(browser, { viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  attachErrors(page, errors);
  await openPrototype(page, "?theme=light");

  data = await page.evaluate(() => {
    const D = window.__ATLAS_STAGE__.data;
    return {
      concepts: D.concepts.length,
      edges: D.edges.length,
      domains: D.domains.length,
      days: D.timeline.days.length,
      editions: D.editions.length,
      decks: Object.keys(D.decks).length,
      latest: D.timeline.latestEditionDate,
      today: D.timeline.today,
      graphBuildId: D.graphBuildId,
      sourceIndexBuildId: D.sourceIndexBuildId,
      ledgerFingerprint: D.ledgerFingerprint,
      clock: D.prototypeClock,
      publishedAssertions: D.publicProjection.publishedAssertions.length,
      withheldAssertions: D.publicProjection.withheld.assertionCount,
      withheldConcepts: D.publicProjection.withheld.conceptCount,
      latestDeckCards: D.decks["daily:2026-10-26"].deck.cards.length,
      todayDeckCards: D.decks["daily:2026-11-01"].deck.cards.length,
      emptyDecks: Object.values(D.decks).filter((entry) => entry.deck?.cards?.length === 0).length,
      readyDecks: Object.values(D.decks).filter((entry) => entry.deck?.cards?.length > 0).length,
    };
  });
  results.add("data:132-concepts", data.concepts === 132, String(data.concepts));
  results.add("data:86-candidate-edges", data.edges === 86, String(data.edges));
  results.add("data:5-subjects", data.domains === 5, String(data.domains));
  results.add("data:15-days", data.days === 15, String(data.days));
  results.add("data:3-editions", data.editions === 3, String(data.editions));
  results.add("data:150-decks", data.decks === 150, String(data.decks));
  results.add("data:136-ready-14-empty", data.readyDecks === 136 && data.emptyDecks === 14, `${data.readyDecks}/${data.emptyDecks}`);
  results.add("data:latest-deck-one-card", data.latestDeckCards === 1, String(data.latestDeckCards));
  results.add("data:today-deck-empty", data.todayDeckCards === 0, String(data.todayDeckCards));
  results.add("data:graph-build-id", data.graphBuildId === "ia-graph-bed4e12d0986", data.graphBuildId);
  results.add("data:source-build-id", data.sourceIndexBuildId === "ia-source-e0f38b64d252", data.sourceIndexBuildId);
  results.add("data:prototype-clock", data.clock === "2026-11-01", data.clock);
  results.add("data:latest-is-26-oct", data.latest === "2026-10-26", data.latest);
  results.add("data:today-is-1-nov", data.today === "2026-11-01", data.today);
  results.add("data:zero-published", data.publishedAssertions === 0, String(data.publishedAssertions));
  results.add("data:withheld-86", data.withheldAssertions === 86, String(data.withheldAssertions));
  results.add("data:withheld-132", data.withheldConcepts === 132, String(data.withheldConcepts));

  await api(page, "selectDate", "2026-10-26", { tween: false });
  await page.waitForTimeout(200);
  await page.click("#open-edition");
  await page.waitForSelector("#dealer-backdrop:not([hidden])");
  results.add("flow:dealer-open", (await state(page)).dealer === "daily:2026-10-26", (await state(page)).dealer);
  results.add("flow:dealer-card", (await page.locator(".card-title").innerText()) === "Reference ≠ retained result", await page.locator(".card-title").innerText());
  await screenshot(page, shots, "01-dealer-26-oct.png");
  await page.click("#dealer-locate");
  await page.waitForTimeout(520);
  const located = await state(page);
  results.add("flow:concept-selected", located.conceptId === "concept:fabric:shortcut", String(located.conceptId));
  results.add("flow:origin-card", located.origin.source === "card", located.origin.source);
  results.add(
    "flow:edition-stated-separately",
    (await page.locator("#transition-from").innerText()).toLowerCase().includes("26 oct edition"),
    await page.locator("#transition-from").innerText(),
  );
  results.add(
    "flow:selection-stated-separately",
    (await page.locator("#transition-current").innerText()).toLowerCase().includes("onelake shortcut"),
    await page.locator("#transition-current").innerText(),
  );
  results.add("flow:center", (await page.locator(".nb-center-title").innerText()) === "OneLake shortcut", await page.locator(".nb-center-title").innerText());
  const shortcutLayout = await layoutSnapshot(page);
  results.add("flow:three-branches", shortcutLayout.nodes.length === 3, String(shortcutLayout.nodes.length));
  results.add(
    "flow:branch-labels",
    ["OneLake", "Copy job", "Database mirroring"].every((label) => shortcutLayout.nodes.some((node) => node.label === label)),
    shortcutLayout.nodes.map((node) => node.label).join(" | "),
  );
  results.add("flow:no-node-overlap", shortcutLayout.overlaps.length === 0, shortcutLayout.overlaps.join(", "));
  results.add("flow:nodes-inside-canvas", shortcutLayout.clipped.length === 0, shortcutLayout.clipped.join(", "));
  results.add("flow:no-unneeded-membership", (await page.locator(".nb-member").count()) === 0, String(await page.locator(".nb-member").count()));
  await screenshot(page, shots, "02-neighbourhood-shortcut.png");

  await page.locator(".nb-node").first().hover();
  await page.waitForTimeout(160);
  results.add("preview:visible", (await page.locator(".preview-card").count()) === 1, String(await page.locator(".preview-card").count()));
  results.add("preview:two-actions", (await page.locator(".preview-actions button").count()) === 2, String(await page.locator(".preview-actions button").count()));
  const previewLabels = await page.locator(".preview-actions button").allInnerTexts();
  results.add(
    "preview:actions-distinct",
    previewLabels.includes("Explore connections") && previewLabels.includes("Open content"),
    previewLabels.join(" | "),
  );
  const previewTitle = await page.locator(".preview-title").innerText();
  await screenshot(page, shots, "03-preview-two-actions.png");
  await page.click('.preview-actions button[data-act="deal-concept"]');
  await page.waitForSelector("#dealer-backdrop:not([hidden])");
  results.add("preview:open-content-opens-deck", (await state(page)).dealer?.startsWith("concept:"), (await state(page)).dealer);
  await screenshot(page, shots, "04-concept-deck.png");
  await page.click("#dealer-close");
  await page.waitForTimeout(180);
  await page.locator(".nb-node").first().hover();
  await page.click('.preview-actions button[data-act="explore-concept"]');
  await page.waitForTimeout(240);
  results.add("preview:explore-moves-neighbourhood", (await page.locator(".nb-center-title").innerText()) === previewTitle, `${previewTitle} -> ${await page.locator(".nb-center-title").innerText()}`);
  await screenshot(page, shots, "05-explored-branch.png");
  await page.click("#field-back");
  await page.waitForTimeout(220);
  results.add("flow:back-to-entrances", (await page.locator(".nb-domain").count()) === 5, String(await page.locator(".nb-domain").count()));

  await api(page, "selectConcept", "concept:analysis:data-quality", { scroll: false, limit: 3 });
  await page.waitForTimeout(240);
  results.add("membership:two-relations", (await page.locator(".nb-node").count()) === 2, String(await page.locator(".nb-node").count()));
  results.add("membership:three-chips", (await page.locator(".nb-member").count()) === 3, String(await page.locator(".nb-member").count()));
  results.add(
    "membership:explicitly-not-a-relation",
    (await page.locator("#nb-members").innerText()).toLowerCase().includes("membership, not a relation"),
    await page.locator("#nb-members").innerText(),
  );
  const memberLabel = await page.locator(".nb-member span:first-child").first().innerText();
  await screenshot(page, shots, "06-membership-rail.png");
  await page.locator(".nb-member").first().click();
  await page.waitForTimeout(220);
  results.add("membership:chip-opens-concept", (await page.locator(".nb-center-title").innerText()) === memberLabel, `${memberLabel} -> ${await page.locator(".nb-center-title").innerText()}`);
  await page.click("#field-back");
  await page.waitForTimeout(200);

  await page.fill("#field-search", "confidence");
  await page.waitForTimeout(180);
  results.add("search:results", (await page.locator(".search-result").count()) > 0, String(await page.locator(".search-result").count()));
  await screenshot(page, shots, "07-search.png");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(240);
  results.add("search:opens-first", (await state(page)).conceptId === "concept:stats:confidence-interval", String((await state(page)).conceptId));
  await page.click("#field-back");
  await page.fill("#field-search", "zzzz");
  await page.waitForTimeout(140);
  results.add("search:empty-state", (await page.locator(".search-results-empty").innerText()).toLowerCase().includes("no concept matches"), await page.locator(".search-results-empty").innerText());
  await page.keyboard.press("Escape");
  results.add("search:escape-clears", (await page.inputValue("#field-search")) === "", await page.inputValue("#field-search"));

  await page.locator("#field-fallback summary").click();
  results.add("table:132-rows", (await page.locator(".fallback-table tbody tr").count()) === 132, String(await page.locator(".fallback-table tbody tr").count()));
  const tableName = await page.locator(".fallback-table tbody tr").first().locator("td").first().innerText();
  await screenshot(page, shots, "08-complete-table.png");
  await page.locator(".fallback-table tbody tr").first().locator("button").click();
  await page.waitForTimeout(240);
  results.add("table:opens-concept", (await page.locator(".nb-center-title").innerText()) === tableName, `${tableName} -> ${await page.locator(".nb-center-title").innerText()}`);
  await page.locator("#field-fallback summary").click();
  await page.click("#field-back");
  await page.waitForTimeout(200);

  const busiest = await page.evaluate(() => {
    const D = window.__ATLAS_STAGE__.data;
    return [...D.concepts]
      .sort((a, b) => b.prerequisites.length + b.dependents.length + b.contrasts.length - (a.prerequisites.length + a.dependents.length + a.contrasts.length))
      .slice(0, 1)
      .map((concept) => ({ id: concept.id, label: concept.label, total: concept.prerequisites.length + concept.dependents.length + concept.contrasts.length }))[0];
  });
  await api(page, "selectConcept", busiest.id, { scroll: false, limit: 3 });
  await page.waitForTimeout(240);
  results.add("expand:limit-three", (await page.locator(".nb-node").count()) === 3, `${busiest.label} ${await page.locator(".nb-node").count()}`);
  if (await page.locator('[data-act="expand-neighbourhood"]').count()) {
    await page.locator('[data-act="expand-neighbourhood"]').click();
    await page.waitForTimeout(240);
    results.add("expand:more-than-three", (await page.locator(".nb-node").count()) > 3, String(await page.locator(".nb-node").count()));
    const expanded = await layoutSnapshot(page);
    results.add("expand:no-overlap", expanded.overlaps.length === 0, expanded.overlaps.join(", "));
    results.add("expand:inside-canvas", expanded.clipped.length === 0, expanded.clipped.join(", "));
  } else {
    results.add("expand:no-remainder", busiest.total <= 3, `${busiest.label} total=${busiest.total}`);
  }
  await screenshot(page, shots, "09-expanded-neighbourhood.png");

  await page.click("#field-back");
  await page.waitForTimeout(200);
  await page.click('[data-scene-link="timeline"]');
  await page.waitForTimeout(420);
  results.add("return:timeline", (await state(page)).scene === "timeline", (await state(page)).scene);
  results.add("return:no-concept", (await state(page)).conceptId === null, String((await state(page)).conceptId));
  await screenshot(page, shots, "10-return-timeline.png");

  await context.close();

  const savedContext = await newContext(browser, { viewport: { width: 1440, height: 960 } });
  const savedPage = await savedContext.newPage();
  attachErrors(savedPage, errors, "saved: ");
  await openPrototype(savedPage, "?theme=light");
  await api(savedPage, "selectConcept", "concept:stats:confidence-interval", { scroll: false });
  await savedPage.waitForTimeout(220);
  await savedPage.click('[data-act="toggle-pocket-concept"]');
  await api(savedPage, "selectDate", "2026-10-25", { tween: false });
  await savedPage.waitForTimeout(200);
  const beforeReload = await state(savedPage);
  results.add("saved:concept", beforeReload.conceptId === "concept:stats:confidence-interval", String(beforeReload.conceptId));
  results.add("saved:date", beforeReload.date === "2026-10-25", beforeReload.date);
  results.add("saved:pocket", beforeReload.pocket.length === 1, String(beforeReload.pocket.length));
  results.add("saved:thread", beforeReload.thread.includes("concept:stats:confidence-interval"), beforeReload.thread.join(","));
  await savedPage.reload({ waitUntil: "load" });
  await savedPage.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await savedPage.waitForTimeout(420);
  const afterReload = await state(savedPage);
  results.add("saved:concept-restored", afterReload.conceptId === "concept:stats:confidence-interval", String(afterReload.conceptId));
  results.add("saved:date-restored", afterReload.date === "2026-10-25", afterReload.date);
  results.add("saved:pocket-restored", afterReload.pocket.length === 1 && afterReload.pocket[0].label === "Confidence interval", JSON.stringify(afterReload.pocket));
  results.add("saved:thread-restored", afterReload.thread.includes("concept:stats:confidence-interval"), afterReload.thread.join(","));
  const stored = await savedPage.evaluate(() => JSON.parse(localStorage.getItem("hansa.knowledge-stage.v31") || "null"));
  results.add("saved:storage-key", Boolean(stored) && stored.date === "2026-10-25", JSON.stringify(stored?.date));
  await savedPage.evaluate(() => document.getElementById("theme-toggle").click());
  await savedPage.waitForTimeout(200);
  await savedPage.reload({ waitUntil: "load" });
  await savedPage.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await savedPage.waitForTimeout(300);
  results.add("saved:theme-restored", (await state(savedPage)).theme === "dark", (await state(savedPage)).theme);
  await savedContext.close();
} finally {
  await browser.close();
}

const provenance = JSON.parse(readFileSync(path.join(ROOT, "prototype", "data-provenance.json"), "utf8"));
const reviewText = readFileSync(path.join(ROOT, "prototype", "data.js"), "utf8");
const jsonStart = reviewText.indexOf("window.ATLAS_DATA = ") + "window.ATLAS_DATA = ".length;
const jsonEnd = reviewText.indexOf(";\nwindow.ATLAS_DATA_META");
const payloadJson = reviewText.slice(jsonStart, jsonEnd);
const payloadFingerprint = createHash("sha256").update(payloadJson).digest("hex");
const fileHash = createHash("sha256").update(reviewText).digest("hex");
results.add("preserve:payload-fingerprint", payloadFingerprint === provenance.payloadFingerprint, payloadFingerprint);
results.add("preserve:data-file-hash-recorded", fileHash.length === 64, fileHash);

const publicText = readFileSync(path.join(ROOT, "public", "public-data.js"), "utf8");
const publicContext = { window: {} };
vm.createContext(publicContext);
vm.runInContext(publicText, publicContext);
const publicData = publicContext.window.ATLAS_PUBLIC;
results.add("public:no-published-concepts", publicData.publishedConcepts.length === 0, String(publicData.publishedConcepts.length));
results.add("public:no-published-assertions", publicData.publishedAssertions.length === 0, String(publicData.publishedAssertions.length));
results.add("public:withheld-86", publicData.withheld.assertionCount === 86, String(publicData.withheld.assertionCount));
results.add("public:mode", publicData.mode === "public", publicData.mode);
results.add("public:no-candidate-edge-ids", !/assert:ia:/.test(publicText), "candidate edge id scan");
results.add("public:no-candidate-concept-ids", !/concept:(fabric|stats|sql|analysis|visualization):/.test(publicText), "candidate concept id scan");
const publicIndex = readFileSync(path.join(ROOT, "public", "index.html"), "utf8");
results.add("public:only-public-data", publicIndex.includes("public-data.js") && !publicIndex.includes("prototype/data.js"), "public script reference");

await writeJson(
  path.join(ANALYSIS, "qa-recovery.json"),
  results.receipt({
    errors,
    data,
    dataFileSha256: fileHash,
    payloadFingerprint,
    publicData: {
      mode: publicData.mode,
      publishedConcepts: publicData.publishedConcepts.length,
      publishedAssertions: publicData.publishedAssertions.length,
      withheld: publicData.withheld,
    },
  }),
);
console.log(JSON.stringify({ counts: results.counts, failures: results.failures, errors }, null, 1));
if (results.failures.length || errors.length) process.exitCode = 1;
