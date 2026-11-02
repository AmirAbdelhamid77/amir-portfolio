// Hansa Knowledge Stage — public projection renderer.
//
// This file is part of the public artifact. It must never read, infer or
// reconstruct candidate records. It renders exactly what the fail-closed
// projection contains: published counts, gate conditions, structural
// metadata and an honest empty semantic layer.
//
// If the projection is missing or malformed, the page fails closed instead of
// falling back to any other data source.
(function () {
  "use strict";

  const DATA = window.ATLAS_PUBLIC;
  const root = document.documentElement;
  const STORAGE_KEY = "hansa.knowledge-stage.public.v31";
  const number = new Intl.NumberFormat("en-GB");
  const fmt = (value) => number.format(Number(value) || 0);

  const el = (id) => document.getElementById(id);

  const failClosed = (reason) => {
    const main = el("main");
    if (!main) return;
    main.innerHTML = "";
    const section = document.createElement("section");
    section.className = "section";
    section.setAttribute("aria-labelledby", "fail-title");

    const kicker = document.createElement("p");
    kicker.className = "kicker";
    kicker.textContent = "Public projection unavailable";

    const heading = document.createElement("h2");
    heading.id = "fail-title";
    heading.textContent = "Nothing is shown without a verified projection.";

    const copy = document.createElement("p");
    copy.className = "section-note";
    copy.textContent =
      "The public data file did not load or did not match the expected schema. This page will not fall back to candidate data, a review payload or an inferred graph. " +
      String(reason || "");

    section.append(kicker, heading, copy);
    main.append(section);
    for (const id of ["gate-grid", "stats-grid", "coverage-note-body"]) {
      const node = el(id);
      if (node) node.textContent = "";
    }
    const foot = el("foot-build");
    if (foot) foot.textContent = "projection unavailable";
    document.body.dataset.publicState = "failed-closed";
  };

  const valid =
    DATA &&
    DATA.mode === "public" &&
    Array.isArray(DATA.publishedConcepts) &&
    Array.isArray(DATA.publishedAssertions) &&
    Array.isArray(DATA.publishedInsights) &&
    DATA.publicationGate &&
    Array.isArray(DATA.publicationGate.requiresAll) &&
    DATA.structural;

  if (!valid) {
    failClosed(DATA ? "Schema mismatch." : "window.ATLAS_PUBLIC is missing.");
    return;
  }

  const applyTheme = (theme, persist) => {
    const next = theme === "dark" ? "dark" : "light";
    root.dataset.theme = next;
    const toggle = el("theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(next === "dark"));
      toggle.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#090c11" : "#f4f1e9");
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: next }));
      } catch {
        /* storage can be blocked; the preset still applies for this view. */
      }
    }
  };

  const renderCounts = () => {
    el("published-concepts").textContent = fmt(DATA.publishedConcepts.length);
    el("published-assertions").textContent = fmt(DATA.publishedAssertions.length);
    el("published-insights").textContent = fmt(DATA.publishedInsights.length);
    const date = el("public-date");
    if (date) date.textContent = DATA.generatedAt || "—";
  };

  const renderGate = () => {
    const grid = el("gate-grid");
    if (!grid) return;
    const labels = [
      ["Publication state", "The record must be explicitly published, not candidate or technical review."],
      ["Public eligibility", "The record must carry public eligibility before projection."],
      ["Named reviewer", "A named human reviewer must be recorded on the record."],
      ["Review timestamp", "A recorded review date must accompany the approval."],
    ];
    grid.replaceChildren(
      ...DATA.publicationGate.requiresAll.map((condition, index) => {
        const [title, detail] = labels[index] || [condition, condition];
        const card = document.createElement("article");
        card.className = "gate-card";

        const count = document.createElement("span");
        count.className = "gate-index";
        count.textContent = String(index + 1).padStart(2, "0");

        const state = document.createElement("span");
        state.className = "gate-state";
        state.textContent = "not met";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const body = document.createElement("p");
        body.textContent = detail;

        card.append(count, state, heading, body);
        return card;
      }),
    );
    const note = el("gate-note");
    if (note) {
      note.textContent = `${DATA.publicationGate.note} The projection currently withholds ${fmt(
        DATA.withheld?.conceptCount,
      )} candidate concepts, ${fmt(DATA.withheld?.assertionCount)} candidate assertions and ${fmt(
        DATA.withheld?.insightCount,
      )} candidate insights.`;
    }
  };

  const renderStructure = () => {
    const structural = DATA.structural;
    el("stat-domains").textContent = fmt(structural.domainCount);
    el("stat-routes").textContent = fmt(structural.routeCount);
    el("stat-sources").textContent = fmt(structural.sourceCount);
    el("stat-units").textContent = fmt(structural.unitCount);
    const note = el("structure-note");
    if (note) note.textContent = structural.note || "";
  };

  const renderCoverage = () => {
    const body = el("coverage-note-body");
    if (!body) return;
    const withheld = DATA.withheld || {};
    body.innerHTML = `
      <h3>Projection</h3>
      <p>${escapeText(DATA.emptyState?.learnerMessage || "The semantic layer is not published yet.")}</p>
      <h3>Withheld</h3>
      <p>${fmt(withheld.conceptCount)} concepts, ${fmt(withheld.assertionCount)} assertions and ${fmt(
        withheld.insightCount,
      )} insights. ${escapeText(withheld.reason || "")}</p>
      <h3>Identifiers</h3>
      <p><code>${escapeText(DATA.graphBuildId || "no build id")}</code> · schema <code>${escapeText(
        DATA.schemaVersion || "unknown",
      )}</code></p>
      <h3>What is not claimed</h3>
      <p>No human publication review, scientific review, rights review or assessment review is recorded. Structural counts are navigation metadata; they do not imply semantic publication.</p>`;
  };

  const escapeText = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  const bind = () => {
    const toggle = el("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
      });
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "t" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
      }
    });
  };

  applyTheme(root.dataset.theme, false);
  renderCounts();
  renderGate();
  renderStructure();
  renderCoverage();
  bind();

  const foot = el("foot-build");
  if (foot) foot.textContent = `${DATA.graphBuildId || "no build id"} · ${DATA.generatedAt || "no date"} · public projection`;
  document.body.dataset.publicState = "empty-semantic-layer";

  window.__ATLAS_PUBLIC_STATE__ = {
    mode: "public",
    schemaVersion: DATA.schemaVersion,
    graphBuildId: DATA.graphBuildId,
    published: {
      concepts: DATA.publishedConcepts.length,
      assertions: DATA.publishedAssertions.length,
      insights: DATA.publishedInsights.length,
    },
    withheld: { ...DATA.withheld },
    theme: () => root.dataset.theme,
  };
})();
