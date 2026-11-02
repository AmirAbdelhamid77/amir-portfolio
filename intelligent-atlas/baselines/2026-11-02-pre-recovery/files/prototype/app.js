/* Hansa Knowledge Stage — V3.1 review prototype behaviour.
 *
 * No framework, no build step, no network. Everything is rendered from the
 * generated review payload in data.js. The public artifact uses the same
 * renderer against a different, fail-closed payload.
 */
(() => {
  "use strict";

  const DATA = window.ATLAS_DATA;
  if (!DATA) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="margin:0;padding:24px;font:16px/1.5 system-ui">The review payload did not load. Regenerate it with <code>node intelligent-atlas/tools/build-prototype-data.mjs</code>.</p>',
    );
    return;
  }

  /* ------------------------------------------------------------------ helpers */
  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ESCAPES[character]);
  const number = new Intl.NumberFormat("en-GB");
  const fmt = (value) => number.format(Number(value) || 0);
  const pct = (value) => `${(Number(value) * 100).toFixed(2)}%`;
  const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
  const truncate = (value, length = 240) => {
    const text = String(value ?? "").trim();
    if (text.length <= length) return text;
    const cut = text.slice(0, length);
    const boundary = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
    return boundary > length * 0.45 ? cut.slice(0, boundary + 1) : `${cut.trimEnd()}…`;
  };
  const humanize = (value) => String(value ?? "").replace(/_/g, " ");
  const hashString = (value) => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
  const longDate = (date) =>
    new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = () => (reducedMotion.matches ? "auto" : "smooth");
  const isTyping = (target) =>
    target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));

  /* ------------------------------------------------------------------ indexes */
  const conceptById = new Map(DATA.concepts.map((concept) => [concept.id, concept]));
  const conceptByLabel = new Map(DATA.concepts.map((concept) => [concept.label, concept]));
  const edgeById = new Map(DATA.edges.map((edge) => [edge.id, edge]));
  const comparisonById = new Map(DATA.comparisons.map((board) => [board.id, board]));
  const goalById = new Map(DATA.goals.map((goal) => [goal.goalId, goal]));
  const editionById = new Map(DATA.editions.map((edition) => [edition.id, edition]));
  const editionByDate = new Map(DATA.editions.map((edition) => [edition.date, edition]));
  const dayByDate = new Map(DATA.timeline.days.map((day) => [day.date, day]));
  const domainById = new Map(DATA.domains.map((domain) => [domain.id, domain]));
  const latestEditionDate = DATA.timeline.latestEditionDate;
  const latestEdition = editionByDate.get(latestEditionDate);
  const latestDay = dayByDate.get(latestEditionDate);

  /* -------------------------------------------------------------------- state */
  const STORE_KEY = "hansa.knowledge-stage.v31";
  const INTENTS = ["understand", "compare", "apply", "goal"];
  const INTENT_LABEL = {
    understand: "Understand",
    compare: "Compare",
    apply: "Apply",
    goal: "Reach a goal",
  };

  const loadStored = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "null") || {};
    } catch {
      return {};
    }
  };

  const stored = loadStored();
  const initialDate = dayByDate.has(stored.date) ? stored.date : latestEditionDate || DATA.timeline.today;
  const initialEdition = editionByDate.get(initialDate) || latestEdition;

  const state = {
    theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    intent: INTENTS.includes(stored.intent) ? stored.intent : "understand",
    date: initialDate,
    conceptId: conceptById.has(stored.conceptId) ? stored.conceptId : initialEdition?.conceptId ?? null,
    comparisonId: comparisonById.has(stored.comparisonId) ? stored.comparisonId : null,
    goalId: goalById.has(stored.goalId) ? stored.goalId : null,
    pocket: Array.isArray(stored.pocket)
      ? stored.pocket.filter((entry) => entry && typeof entry.key === "string" && typeof entry.label === "string").slice(0, 24)
      : [],
    thread: Array.isArray(stored.thread) ? stored.thread.filter((id) => conceptById.has(id)).slice(-12) : [],
    selfReported:
      stored.selfReported && typeof stored.selfReported === "object"
        ? Object.fromEntries(Object.entries(stored.selfReported).filter(([id, value]) => conceptById.has(id) && value === true))
        : {},
  };

  const params = new URLSearchParams(location.search);
  if (params.get("date") && dayByDate.has(params.get("date"))) state.date = params.get("date");
  if (params.get("concept") && conceptById.has(params.get("concept"))) state.conceptId = params.get("concept");
  if (params.get("intent") && INTENTS.includes(params.get("intent"))) state.intent = params.get("intent");
  if (params.get("goal") && goalById.has(params.get("goal"))) state.goalId = params.get("goal");
  if (params.get("comparison") && comparisonById.has(params.get("comparison"))) state.comparisonId = params.get("comparison");
  if (params.get("theme") === "dark" || params.get("theme") === "light") state.theme = params.get("theme");

  if (!state.goalId) {
    state.goalId =
      DATA.goals.find((goal) => goal.steps.some((step) => step.conceptId === state.conceptId))?.goalId ??
      DATA.goals[0]?.goalId ??
      null;
  }
  if (!state.comparisonId) {
    state.comparisonId =
      DATA.comparisons.find((board) => board.leftId === state.conceptId || board.rightId === state.conceptId)?.id ??
      DATA.comparisons[0]?.id ??
      null;
  }
  if (!state.thread.length && state.conceptId) state.thread = [state.conceptId];

  const persist = () => {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          theme: state.theme,
          intent: state.intent,
          date: state.date,
          conceptId: state.conceptId,
          comparisonId: state.comparisonId,
          goalId: state.goalId,
          pocket: state.pocket,
          thread: state.thread,
          selfReported: state.selfReported,
        }),
      );
    } catch {
      /* file:// storage can be unavailable; the stage still works without it. */
    }
  };

  /* ----------------------------------------------------------------------- ui */
  const ui = {
    html: document.documentElement,
    topbar: $("topbar"),
    themeToggle: $("theme-toggle"),
    aboutOpen: $("about-open"),
    pocketToggle: $("pocket-toggle"),
    pocketCount: $("pocket-count"),
    todayLabel: $("today-label"),
    factEditions: $("fact-editions"),
    factConcepts: $("fact-concepts"),
    factRead: $("fact-read"),
    factPublished: $("fact-published"),
    railRange: $("rail-range"),
    railStatus: $("rail-status"),
    railDays: $("rail-days"),
    railProgress: $("rail-progress"),
    railCursor: $("rail-cursor"),
    railCursorLabel: $("rail-cursor-label"),
    editionBand: $("edition-band"),
    dayPrev: $("day-prev"),
    dayNext: $("day-next"),
    openEdition: $("open-edition"),
    handoff: $("handoff"),
    handoffConcept: $("handoff-concept"),
    handoffFill: $("handoff-fill"),
    handoffNote: $("handoff-note"),
    handoffToken: $("handoff-token"),
    fieldModeLabel: $("field-mode-label"),
    intentSwitch: $("intent-switch"),
    field: $("field"),
    fieldSearch: $("field-search"),
    fieldLegend: $("field-legend"),
    fieldZoomOut: $("field-zoom-out"),
    fieldZoomIn: $("field-zoom-in"),
    fieldReset: $("field-reset"),
    fieldCanvas: $("field-canvas"),
    fieldWorld: $("field-world"),
    fieldEdges: $("field-edges"),
    fieldEdgeLayer: $("field-edge-layer"),
    fieldNodes: $("field-nodes"),
    fieldEmpty: $("field-empty"),
    fieldZoomReadout: $("field-zoom-readout"),
    fieldSummary: $("field-summary"),
    fieldFallbackBody: $("field-fallback-body"),
    contextContent: $("context-content"),
    threadCount: $("thread-count"),
    threadList: $("thread-list"),
    threadClear: $("thread-clear"),
    closingIdea: $("closing-idea"),
    closingAction: $("closing-action"),
    closingPocket: $("closing-pocket"),
    closingLedger: $("closing-ledger"),
    closingLedgerNote: $("closing-ledger-note"),
    closingAbout: $("closing-about"),
    footBuild: $("foot-build"),
    footTheme: $("foot-theme"),
    pocketPanel: $("pocket-panel"),
    pocketClose: $("pocket-close"),
    pocketList: $("pocket-list"),
    pocketEmpty: $("pocket-empty"),
    dealerBackdrop: $("dealer-backdrop"),
    dealer: $("dealer"),
    dealerKickerKind: $("dealer-kicker-kind"),
    dealerKickerDate: $("dealer-kicker-date"),
    dealerTitle: $("dealer-title"),
    dealerSummary: $("dealer-summary"),
    dealerReviewBadge: $("dealer-review-badge"),
    dealerClose: $("dealer-close"),
    dealerRail: $("dealer-rail"),
    dealerHand: $("dealer-hand"),
    handLabel: $("hand-label"),
    handCount: $("hand-count"),
    handHint: $("hand-hint"),
    dealerReader: $("dealer-reader"),
    dealerFootNote: $("dealer-foot-note"),
    dealerBackTimeline: $("dealer-back-timeline"),
    dealerLocate: $("dealer-locate"),
    dealerStatus: $("dealer-status"),
    aboutBackdrop: $("about-backdrop"),
    about: $("about"),
    aboutClose: $("about-close"),
    aboutBody: $("about-body"),
    toast: $("toast"),
  };

  /* --------------------------------------------------------------------- theme */
  const applyTheme = () => {
    ui.html.dataset.theme = state.theme;
    ui.themeToggle.setAttribute("aria-pressed", String(state.theme === "dark"));
    ui.themeToggle.setAttribute("aria-label", state.theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", state.theme === "dark" ? "#090c11" : "#f4f1e9");
  };

  const toggleTheme = () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    persist();
    applyTheme();
  };

  /* ------------------------------------------------------------- field layout */
  const WORLD = { w: 1900, h: 1450 };
  const REGIONS = {
    fabric: { x: 60, y: 60, w: 1000, h: 860 },
    sql: { x: 60, y: 990, w: 1000, h: 400 },
    statistics: { x: 1140, y: 60, w: 700, h: 620 },
    visualization: { x: 1140, y: 730, w: 700, h: 400 },
    analysis: { x: 1140, y: 1190, w: 700, h: 200 },
  };

  const conceptScore = (concept) =>
    concept.assertionCount * 3 +
    concept.primaryUnitCount +
    (concept.reading ? 6 : 0) +
    concept.goals.length * 2 +
    (concept.contrasts.length ? 2 : 0);

  const buildLayout = () => {
    const positions = new Map();
    for (const domain of DATA.domains) {
      const list = DATA.concepts.filter((concept) => concept.domain === domain.id);
      const region = REGIONS[domain.id] || { x: 60, y: 60, w: 900, h: 600 };
      const sorted = [...list].sort((a, b) => conceptScore(b) - conceptScore(a) || a.id.localeCompare(b.id));
      const columns = Math.max(1, Math.floor(region.w / 160));
      const rows = Math.ceil(sorted.length / columns);
      const cellW = region.w / columns;
      const cellH = Math.min(84, region.h / Math.max(rows, 1));
      const startY = region.y + (region.h - rows * cellH) / 2 + cellH / 2;
      const cells = [];
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = region.x + cellW * (column + 0.5) + (row % 2 ? cellW * 0.25 : 0);
          const y = startY + row * cellH;
          cells.push({ x, y, distance: Math.hypot(x - (region.x + region.w / 2), y - (region.y + region.h / 2)) });
        }
      }
      cells.sort((a, b) => a.distance - b.distance);
      sorted.forEach((concept, index) => {
        const cell = cells[index];
        const jitterX = (hashString(`${concept.id}:x`) % 9) - 4;
        const jitterY = (hashString(`${concept.id}:y`) % 9) - 4;
        positions.set(concept.id, { x: cell.x + jitterX, y: cell.y + jitterY, concept });
      });
    }
    return positions;
  };

  const layout = buildLayout();

  const edgePath = (from, to, seed) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    const normalX = -dy / distance;
    const normalY = dx / distance;
    const bend = (hashString(seed) % 2 ? 1 : -1) * Math.min(90, distance * 0.12);
    const midX = (from.x + to.x) / 2 + normalX * bend;
    const midY = (from.y + to.y) / 2 + normalY * bend;
    return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
  };

  const nodeEls = new Map();
  const edgeEls = new Map();

  const renderField = () => {
    ui.fieldWorld.style.width = `${WORLD.w}px`;
    ui.fieldWorld.style.height = `${WORLD.h}px`;
    ui.fieldEdges.setAttribute("viewBox", `0 0 ${WORLD.w} ${WORLD.h}`);
    ui.fieldEdges.setAttribute("width", String(WORLD.w));
    ui.fieldEdges.setAttribute("height", String(WORLD.h));

    ui.fieldEdgeLayer.innerHTML = DATA.edges
      .map((edge) => {
        const from = layout.get(edge.from);
        const to = layout.get(edge.to);
        if (!from || !to) return "";
        const classes = [
          "edge",
          edge.relationType === "requires_understanding_of" ? "is-prereq" : "is-contrast",
          edge.crossDomain ? "is-cross" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<path class="${classes}" data-edge="${esc(edge.id)}" data-from="${esc(edge.from)}" data-to="${esc(edge.to)}" d="${edgePath(from, to, edge.id)}" />`;
      })
      .join("");
    edgeEls.clear();
    ui.fieldEdgeLayer.querySelectorAll(".edge").forEach((path) => edgeEls.set(path.dataset.edge, path));

    ui.fieldNodes.innerHTML = DATA.concepts
      .map((concept) => {
        const point = layout.get(concept.id);
        const reading = concept.reading ? ", read in context" : "";
        return `<button type="button" class="node" data-concept="${esc(concept.id)}" style="--x:${point.x.toFixed(1)}px;--y:${point.y.toFixed(1)}px;--domain-color:var(--domain-${esc(concept.domain)})" title="${esc(concept.label)} · ${esc(concept.domainLabel)}" aria-label="${esc(concept.label)}, ${esc(concept.domainLabel)}${reading}">
          <span class="node-dot" aria-hidden="true"></span><span class="node-label">${esc(concept.label)}</span>
        </button>`;
      })
      .join("");
    nodeEls.clear();
    ui.fieldNodes.querySelectorAll(".node").forEach((node) => nodeEls.set(node.dataset.concept, node));
  };

  /* ---------------------------------------------------------------- field view */
  const view = { x: 0, y: 0, s: 1, touched: false };
  let viewTimer = 0;

  const applyView = (animate = false) => {
    if (animate && !reducedMotion.matches) {
      ui.fieldWorld.classList.add("is-animating");
      window.clearTimeout(viewTimer);
      viewTimer = window.setTimeout(() => ui.fieldWorld.classList.remove("is-animating"), 520);
    } else {
      ui.fieldWorld.classList.remove("is-animating");
    }
    ui.fieldWorld.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`;
    ui.fieldWorld.classList.toggle("is-dense", view.s < 0.62);
    ui.fieldZoomReadout.textContent = `${Math.round(view.s * 100)}%${view.s < 0.62 ? " · overview" : ""}`;
  };

  const clampView = () => {
    const width = ui.fieldCanvas.clientWidth;
    const height = ui.fieldCanvas.clientHeight;
    const scaledW = WORLD.w * view.s;
    const scaledH = WORLD.h * view.s;
    const slack = 120;
    if (scaledW <= width - 16) view.x = (width - scaledW) / 2;
    else view.x = clamp(view.x, width - scaledW - slack, slack);
    if (scaledH <= height - 16) view.y = (height - scaledH) / 2;
    else view.y = clamp(view.y, height - scaledH - slack, slack);
  };

  const fitView = (animate = false) => {
    const width = ui.fieldCanvas.clientWidth;
    const height = ui.fieldCanvas.clientHeight;
    const scale = Math.min((width - 34) / WORLD.w, (height - 34) / WORLD.h);
    view.s = clamp(scale, 0.2, 1);
    view.x = (width - WORLD.w * view.s) / 2;
    view.y = (height - WORLD.h * view.s) / 2;
    view.touched = false;
    applyView(animate);
  };

  const focusConceptView = (concept) => {
    const point = layout.get(concept.id);
    if (!point) return;
    const width = ui.fieldCanvas.clientWidth;
    const height = ui.fieldCanvas.clientHeight;
    const scale = 0.95;
    view.s = scale;
    view.x = width / 2 - point.x * scale;
    view.y = height * 0.48 - point.y * scale;
    view.touched = true;
    clampView();
    applyView(true);
  };

  const zoomAt = (pixelX, pixelY, factor) => {
    const worldX = (pixelX - view.x) / view.s;
    const worldY = (pixelY - view.y) / view.s;
    view.s = clamp(view.s * factor, 0.22, 1.8);
    view.x = pixelX - worldX * view.s;
    view.y = pixelY - worldY * view.s;
    view.touched = true;
    clampView();
    applyView(false);
  };

  const focusDomain = (domain) => {
    const region = REGIONS[domain];
    if (!region) return;
    const width = ui.fieldCanvas.clientWidth;
    const height = ui.fieldCanvas.clientHeight;
    const scale = clamp(Math.min((width - 48) / region.w, (height - 48) / region.h, 1), 0.35, 1.2);
    const centerX = region.x + region.w / 2;
    const centerY = region.y + region.h / 2;
    view.s = scale;
    view.x = width / 2 - centerX * scale;
    view.y = height / 2 - centerY * scale;
    view.touched = true;
    clampView();
    applyView(true);
    announce(`Zoomed to ${domainById.get(domain)?.label ?? domain}.`);
  };

  /* --------------------------------------------------------------- field state */
  let searchQuery = "";
  let searchMatches = new Set();
  let searchOrder = [];

  const applyFieldState = () => {
    const active = conceptById.get(state.conceptId);
    const board = comparisonById.get(state.comparisonId);
    const goal = goalById.get(state.goalId);
    const focus = new Set();
    const route = new Set();
    const focusedEdges = new Set();
    const routeEdges = new Set();
    let leftId = null;
    let rightId = null;
    let dim = false;

    if (searchQuery) {
      dim = true;
      for (const id of searchMatches) focus.add(id);
    } else if (state.intent === "compare" && board) {
      dim = true;
      leftId = board.leftId;
      rightId = board.rightId;
      focus.add(leftId);
      focus.add(rightId);
      focusedEdges.add(board.id);
      for (const label of board.sharedPrerequisites) {
        const shared = conceptByLabel.get(label);
        if (shared) focus.add(shared.id);
      }
    } else if (state.intent === "goal" && goal) {
      dim = true;
      goal.steps.forEach((step) => route.add(step.conceptId));
      for (let index = 0; index < goal.steps.length - 1; index += 1) {
        const a = goal.steps[index].conceptId;
        const b = goal.steps[index + 1].conceptId;
        for (const edge of DATA.edges) {
          if (edge.relationType !== "requires_understanding_of") continue;
          if ((edge.from === a && edge.to === b) || (edge.from === b && edge.to === a)) routeEdges.add(edge.id);
        }
      }
    } else if (active) {
      dim = true;
      focus.add(active.id);
      active.prerequisites.forEach((entry) => focus.add(entry.id));
      active.dependents.forEach((entry) => focus.add(entry.id));
    }

    let firstTabbable = null;
    for (const [id, node] of nodeEls) {
      const isActive = id === active?.id;
      node.classList.toggle("is-active", isActive);
      node.classList.toggle("is-match", Boolean(searchQuery) && searchMatches.has(id));
      node.classList.toggle("is-left", id === leftId);
      node.classList.toggle("is-right", id === rightId);
      node.classList.toggle("is-route", route.has(id));
      const inFocus = !dim || focus.has(id) || route.has(id);
      node.classList.toggle("is-dim", !inFocus && !isActive);
      node.tabIndex = isActive ? 0 : -1;
      if (isActive) firstTabbable = node;
    }
    if (!firstTabbable && nodeEls.size) {
      firstTabbable = nodeEls.values().next().value;
      firstTabbable.tabIndex = 0;
    }

    for (const [id, path] of edgeEls) {
      const edge = edgeById.get(id);
      const focused = focusedEdges.has(id);
      const onRoute = routeEdges.has(id);
      path.classList.toggle("is-focus", focused);
      path.classList.toggle("is-route", onRoute);
      const inFocus = focus.has(edge.from) || focus.has(edge.to) || route.has(edge.from) || route.has(edge.to);
      path.classList.toggle("is-dim", dim && !inFocus && !focused && !onRoute);
    }
  };

  const renderLegend = () => {
    ui.fieldLegend.innerHTML = DATA.domains
      .map((domain) => {
        const count = DATA.concepts.filter((concept) => concept.domain === domain.id).length;
        return `<button type="button" class="legend-item" data-act="focus-domain" data-domain="${esc(domain.id)}" aria-label="Zoom to ${esc(domain.label)}, ${count} concepts"><span class="legend-swatch" style="--swatch:var(--domain-${esc(domain.id)})"></span>${esc(domain.short)} <span class="mono">${count}</span></button>`;
      })
      .join("");
  };

  const renderFallback = () => {
    const rows = DATA.concepts
      .filter((concept) => !searchQuery || searchMatches.has(concept.id))
      .sort((a, b) => a.domain.localeCompare(b.domain) || a.label.localeCompare(b.label))
      .map(
        (concept) =>
          `<tr><td>${esc(concept.label)}</td><td>${esc(domainById.get(concept.domain)?.short ?? concept.domain)}</td><td>${concept.prerequisites.length}</td><td>${concept.dependents.length}</td><td>${concept.goals.length}</td><td>${concept.reading ? "read" : "not read"}</td></tr>`,
      )
      .join("");
    ui.fieldFallbackBody.innerHTML = rows
      ? `<div class="fallback-scroll" tabindex="0" role="group" aria-label="Candidate concept table, scrollable"><table class="fallback-table"><caption class="sr-only">Candidate concepts and their recorded relationships</caption><thead><tr><th scope="col">Concept</th><th scope="col">Domain</th><th scope="col">Requires</th><th scope="col">Unlocks</th><th scope="col">Routes</th><th scope="col">Reading</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<p class="empty-copy">No concept matches “${esc(searchQuery)}”.</p>`;
  };

  const updateFieldSummary = () => {
    const concept = conceptById.get(state.conceptId);
    const board = comparisonById.get(state.comparisonId);
    const goal = goalById.get(state.goalId);
    let text;
    if (state.intent === "compare" && board) {
      text = `Comparing ${board.leftLabel} and ${board.rightLabel}. ${board.relationLabel}.`;
    } else if (state.intent === "goal" && goal) {
      text = `Route: ${goal.title}. ${plural(goal.steps.length, "step")}. ${goal.status}.`;
    } else if (state.intent === "apply" && concept) {
      text = `Applying ${concept.label}. ${plural((DATA.apply[concept.id] || []).length, "mapped destination")}.`;
    } else if (concept) {
      text = `${concept.label}. ${plural(concept.prerequisites.length, "prerequisite")}, ${plural(concept.dependents.length, "dependent")}. ${concept.reading ? "Read in context." : "Not read in context."}`;
    } else {
      text = `Overview. ${DATA.concepts.length} candidate concepts. ${DATA.coverage.semanticallyRead} read in context. 0 published.`;
    }
    ui.fieldSummary.textContent = text;
  };

  const runSearch = (value) => {
    searchQuery = value.trim();
    const needle = searchQuery.toLowerCase();
    searchMatches = new Set();
    searchOrder = [];
    if (searchQuery) {
      const ranked = [];
      for (const concept of DATA.concepts) {
        const label = concept.label.toLowerCase();
        const aliases = Object.values(concept.aliases || {}).flat().map((alias) => alias.toLowerCase());
        const definition = concept.definition.toLowerCase();
        const scope = concept.scope.toLowerCase();
        const haystack = `${label} ${definition} ${scope} ${aliases.join(" ")}`;
        if (!haystack.includes(needle)) continue;
        const rank = label === needle ? 0 : label.includes(needle) ? 1 : aliases.some((alias) => alias === needle) ? 2 : aliases.some((alias) => alias.includes(needle)) ? 3 : definition.includes(needle) ? 4 : 5;
        ranked.push({ concept, rank });
      }
      ranked.sort((a, b) => a.rank - b.rank || a.concept.label.localeCompare(b.concept.label));
      for (const entry of ranked) {
        searchMatches.add(entry.concept.id);
        searchOrder.push(entry.concept.id);
      }
    }
    ui.fieldEmpty.hidden = !searchQuery || searchMatches.size > 0;
    if (searchQuery && !searchMatches.size) {
      ui.fieldEmpty.innerHTML = `<div><h3>No concept matches “${esc(searchQuery)}”</h3><p>Try a shorter term or reset the view. The field only contains candidate concepts from the review payload.</p><button type="button" class="action-button" data-act="clear-search">Clear search</button></div>`;
    }
    renderFallback();
    applyFieldState();
    if (searchQuery) {
      ui.fieldSummary.textContent = `${plural(searchMatches.size, "concept")} match “${searchQuery}”. Press Enter to open the first.`;
    } else {
      updateFieldSummary();
    }
  };

  const clearSearch = () => {
    ui.fieldSearch.value = "";
    runSearch("");
    ui.fieldSearch.focus({ preventScroll: true });
  };

  /* -------------------------------------------------------------- panel parts */
  const sectionHead = (title, count) =>
    `<div class="section-head"><h3>${esc(title)}</h3>${count != null ? `<span class="count-badge">${count}</span>` : ""}</div>`;

  const savedConcept = (id) => state.pocket.some((entry) => entry.key === `concept:${id}`);
  const savedBoard = (id) => state.pocket.some((entry) => entry.key === `comparison:${id}`);
  const savedGoal = (id) => state.pocket.some((entry) => entry.key === `goal:${id}`);
  const savedCard = (deckKey, cardId) => state.pocket.some((entry) => entry.key === `card:${deckKey}:${cardId}`);

  const whyBlock = (reading) => `
    <div class="why">
      <p class="why-note" dir="auto">${esc(reading.parentContext)}</p>
      <p dir="auto">${esc(reading.reading)}</p>
      <blockquote dir="auto">"${esc(reading.evidenceQuote)}"</blockquote>
      <dl>
        <dt>Unit</dt><dd>${esc(reading.unitId)}</dd>
        <dt>Decision</dt><dd>${esc(reading.decision)} · ${esc(reading.code)}</dd>
        <dt>Meaning</dt><dd>${esc(reading.essentialMeaning)}</dd>
      </dl>
      ${reading.unresolved?.length ? `<p class="why-note">Open questions: ${esc(reading.unresolved.join(" · "))}</p>` : ""}
    </div>`;

  const branchChip = (entry, kind) => `
    <button type="button" class="branch-chip" data-act="open-concept" data-concept="${esc(entry.id)}">
      <span class="branch-top">
        <span class="branch-arrow">${kind === "prior" ? "prior" : "next"}</span>
        <span class="branch-label">${esc(entry.label)}</span>
        ${entry.crossDomain ? '<span class="branch-cross">cross-domain</span>' : ""}
      </span>
      <span class="branch-claim">${esc(entry.claim)}</span>
    </button>`;

  const resourceList = (resources) => `
    <div class="resource-list">
      ${resources
        .map(
          (resource) => `<div class="resource-item">
            <div><p class="resource-title">${esc(resource.title)}</p><p class="resource-meta">${esc(resource.role)} · ${esc(resource.language)}</p></div>
            <button type="button" class="resource-open" data-act="open-resource" data-href="${esc(resource.href)}" data-label="${esc(resource.title)}">Open</button>
          </div>`,
        )
        .join("")}
    </div>`;

  const renderStartPanel = () => `
    <div class="panel-pad">
      <div class="panel-kicker"><span>Understand</span><span>${fmt(DATA.concepts.length)} candidates</span></div>
      <h3 class="panel-title">Pick a thread, not a node.</h3>
      <p class="panel-def">The field holds candidate concepts and candidate prerequisite claims. Choose one of the three review threads, or search the field. Nothing here is published.</p>
      <section class="panel-section">
        ${sectionHead("Review threads", DATA.goals.length)}
        <div class="goal-picker">
          ${DATA.goals
            .map(
              (goal) => `<button type="button" class="goal-option" data-act="select-goal" data-goal="${esc(goal.goalId)}"><strong>${esc(goal.title)}</strong><span>${esc(goal.audience)}</span></button>`,
            )
            .join("")}
        </div>
      </section>
      ${
        latestEdition
          ? `<section class="panel-section">${sectionHead("From the latest edition")}
              <button type="button" class="branch-chip" data-act="open-concept" data-concept="${esc(latestEdition.conceptId)}">
                <span class="branch-top"><span class="branch-arrow">read</span><span class="branch-label">${esc(conceptById.get(latestEdition.conceptId)?.label ?? latestEdition.title)}</span></span>
                <span class="branch-claim">${esc(latestEdition.takeaway)}</span>
              </button>
            </section>`
          : ""
      }
      <p class="panel-note">Definitions and relations are candidate material. Semantic reading covers ${fmt(DATA.coverage.semanticallyRead)} of ${fmt(DATA.coverage.eligibleUnits)} eligible units (${pct(DATA.coverage.semanticallyReadShare)}).</p>
    </div>`;

  const renderUnderstandPanel = () => {
    const concept = conceptById.get(state.conceptId);
    if (!concept) return renderStartPanel();
    const reading = concept.reading;
    const saved = savedConcept(concept.id);
    return `
      <div class="panel-pad">
        <div class="panel-kicker">
          <span class="panel-domain" style="--domain-color:var(--domain-${esc(concept.domain)})">${esc(concept.domainLabel)}</span>
          <span>${reading ? "read in context" : "not read in context"}</span>
        </div>
        <h3 class="panel-title">${esc(concept.label)}</h3>
        <p class="panel-def">${esc(concept.definition)}</p>
        <p class="panel-scope">${esc(concept.scope)}</p>
        <div class="action-row">
          <button type="button" class="action-button is-primary" data-act="toggle-pocket-concept" data-concept="${esc(concept.id)}">${saved ? "Saved to pocket" : "Save to pocket"}</button>
          <button type="button" class="action-button" data-act="deal-concept" data-concept="${esc(concept.id)}">Reading deck</button>
          <button type="button" class="action-button" data-act="to-compare">Compare</button>
          <button type="button" class="action-button" data-act="to-goal">Route</button>
        </div>

        <section class="panel-section">
          ${sectionHead("Why this is here")}
          ${reading ? whyBlock(reading) : '<p class="empty-copy">No contextual reading was recorded for this concept in this phase. The definition and assertions are candidate material, not verified readings.</p>'}
        </section>

        <section class="panel-section">
          ${sectionHead("Requires first", concept.prerequisites.length)}
          ${
            concept.prerequisites.length
              ? `<div class="branch-list">${concept.prerequisites.map((entry) => branchChip(entry, "prior")).join("")}</div>`
              : '<p class="branch-empty">No prerequisite assertion is recorded. That is a gap in the candidate graph, not proof that none exists.</p>'
          }
        </section>

        <section class="panel-section">
          ${sectionHead("Unlocks", concept.dependents.length)}
          ${
            concept.dependents.length
              ? `<div class="branch-list">${concept.dependents.map((entry) => branchChip(entry, "next")).join("")}</div>`
              : '<p class="branch-empty">No dependent assertion is recorded for this concept.</p>'
          }
        </section>

        <section class="panel-section">
          ${sectionHead("Where to read it", concept.resources.length)}
          ${
            concept.resources.length
              ? resourceList(concept.resources.slice(0, 4))
              : '<p class="empty-copy">No canonical reading route is mapped to this concept yet.</p>'
          }
        </section>

        <section class="panel-section">
          ${sectionHead("Coverage")}
          <dl class="meta-grid">
            <div><dt>Mapped units</dt><dd>${fmt(concept.unitCount)}</dd></div>
            <div><dt>Primary units</dt><dd>${fmt(concept.primaryUnitCount)}</dd></div>
            <div><dt>Assertions</dt><dd>${fmt(concept.assertionCount)}</dd></div>
            <div><dt>Cross-domain</dt><dd>${fmt(concept.crossDomainAssertionCount)}</dd></div>
            <div><dt>Routes</dt><dd>${fmt(concept.goals.length)}</dd></div>
            <div><dt>Reading</dt><dd>${reading ? "contextual" : "not read"}</dd></div>
          </dl>
        </section>

        <p class="panel-note">Stored direction A → B means A requires B. This panel reverses it explicitly: “Requires first” lists what must come before. Candidate concept · technical review · human pending.</p>
      </div>`;
  };

  /* ------------------------------------------------------------ compare panel */
  const renderComparePanel = () => {
    const concept = conceptById.get(state.conceptId);
    let board = comparisonById.get(state.comparisonId);
    if (!board) {
      board =
        DATA.comparisons.find((entry) => entry.leftId === concept?.id || entry.rightId === concept?.id) ??
        DATA.comparisons[0];
    }
    if (!board) {
      return `<div class="panel-pad"><div class="panel-kicker"><span>Compare</span></div><h3 class="panel-title">No comparison boards yet.</h3><p class="panel-def">No contrast or trade-off assertion survived review into the candidate graph.</p></div>`;
    }
    if (board.id !== state.comparisonId) {
      state.comparisonId = board.id;
      persist();
    }
    const left = conceptById.get(board.leftId);
    const right = conceptById.get(board.rightId);
    const involves = concept && (board.leftId === concept.id || board.rightId === concept.id);
    const saved = savedBoard(board.id);
    const options = [...DATA.comparisons]
      .sort((a, b) => `${a.leftLabel} ${a.rightLabel}`.localeCompare(`${b.leftLabel} ${b.rightLabel}`))
      .map(
        (entry) =>
          `<option value="${esc(entry.id)}"${entry.id === board.id ? " selected" : ""}>${esc(entry.leftLabel)} ↔ ${esc(entry.rightLabel)} · ${esc(entry.relationLabel)}</option>`,
      )
      .join("");
    const prereqPills = [
      ...board.sharedPrerequisites.map((label) => `<span class="route-badge">shared: ${esc(label)}</span>`),
      ...board.leftOnlyPrerequisites.map((label) => `<span class="route-badge">A only: ${esc(label)}</span>`),
      ...board.rightOnlyPrerequisites.map((label) => `<span class="route-badge">B only: ${esc(label)}</span>`),
    ].join("");

    return `
      <div class="panel-pad">
        <div class="panel-kicker"><span>Compare</span><span>${esc(board.relationLabel)}</span></div>
        <h3 class="panel-title">${esc(board.leftLabel)} <span class="slash">↔</span> ${esc(board.rightLabel)}</h3>
        <p class="panel-def">${esc(board.claim)}</p>
        ${
          concept && !involves
            ? `<p class="panel-note">Selected concept: <strong>${esc(concept.label)}</strong>. No board includes it yet. <button type="button" class="text-button" data-act="to-understand">Return to Understand</button></p>`
            : ""
        }
        ${board.crossDomain ? '<p class="panel-note">This board crosses domains. The relation is drawn because the evidence asserts it, not because the words look alike.</p>' : ""}

        <div class="panel-section">
          <label class="mono" for="comparison-select">Comparison board</label>
          <select id="comparison-select" class="panel-select">${options}</select>
        </div>

        <div class="board">
          <div class="board-head">
            <div>Field</div>
            <div class="board-side">${esc(board.leftLabel)}<span>${esc(board.leftDomain)}</span></div>
            <div class="board-side">${esc(board.rightLabel)}<span>${esc(board.rightDomain)}</span></div>
          </div>
          ${board.rows
            .map(
              (row) =>
                `<div class="board-row"><div class="board-label">${esc(row.label)}</div><div>${esc(row.left)}</div><div>${esc(row.right)}</div></div>`,
            )
            .join("")}
          <div class="board-row"><div class="board-label">Claim</div><div class="board-wide board-quote">${esc(board.claim)}</div></div>
          <div class="board-row"><div class="board-label">Conditions</div><div class="board-wide">${esc(board.conditions || "None recorded.")}</div></div>
          <div class="board-row">
            <div class="board-label">Evidence</div>
            <div class="board-wide">
              <p class="board-quote">“${esc(truncate(board.evidence[0]?.quote, 260))}”</p>
              <p class="resource-meta">${esc(board.evidence[0]?.unitId ?? "No unit")} · ${esc(board.supportKind)}</p>
            </div>
          </div>
        </div>

        ${
          prereqPills
            ? `<section class="panel-section">${sectionHead("Prerequisite shape")}<div class="route-badges">${prereqPills}</div></section>`
            : ""
        }

        <section class="panel-section">
          ${sectionHead("Why this board")}
          <div class="why">
            <p>${esc(board.rationale)}</p>
            <dl><dt>Support</dt><dd>${esc(board.supportKind)}</dd><dt>Review</dt><dd>candidate · technical review</dd></dl>
          </div>
        </section>

        <div class="action-row">
          <button type="button" class="action-button is-primary" data-act="open-concept" data-concept="${esc(board.leftId)}">Open ${esc(left?.label ?? board.leftLabel)}</button>
          <button type="button" class="action-button" data-act="open-concept" data-concept="${esc(board.rightId)}">Open ${esc(right?.label ?? board.rightLabel)}</button>
          <button type="button" class="action-button" data-act="toggle-pocket-comparison" data-comparison="${esc(board.id)}">${saved ? "Saved to pocket" : "Save board"}</button>
        </div>
        <p class="panel-note">A board compares two candidate concepts. It is not a claim that one is better, and it is not published.</p>
      </div>`;
  };

  /* -------------------------------------------------------------- apply panel */
  const APPLY_KIND_LABEL = {
    "practice-question": "Practice questions",
    lab: "Labs",
    exercise: "Exercises",
  };

  const applyItem = (destination) => `
    <div class="apply-item">
      <div><p class="apply-title">${esc(destination.title)}</p><p class="apply-meta">${esc(destination.role)} · ${esc(destination.language)}</p></div>
      <button type="button" class="resource-open" data-act="open-resource" data-href="${esc(destination.href)}" data-label="${esc(destination.title)}">Open</button>
    </div>`;

  const renderApplyPanel = () => {
    const concept = conceptById.get(state.conceptId);
    if (!concept) return renderStartPanel();
    const destinations = DATA.apply[concept.id] || [];
    const groups = Object.keys(APPLY_KIND_LABEL)
      .map((kind) => ({ kind, items: destinations.filter((destination) => destination.kind === kind) }))
      .filter((group) => group.items.length);
    const goals = DATA.goals.filter((goal) => goal.steps.some((step) => step.conceptId === concept.id));
    const explanation = concept.resources[0];

    return `
      <div class="panel-pad">
        <div class="panel-kicker"><span class="panel-domain" style="--domain-color:var(--domain-${esc(concept.domain)})">${esc(concept.domainLabel)}</span><span>Apply</span></div>
        <h3 class="panel-title">Use ${esc(concept.label)}</h3>
        <p class="panel-def">${esc(concept.definition)}</p>

        ${
          groups.length
            ? groups
                .map(
                  (group) => `<section class="panel-section">${sectionHead(APPLY_KIND_LABEL[group.kind], group.items.length)}<div class="apply-list">${group.items.map(applyItem).join("")}</div></section>`,
                )
                .join("")
            : `<section class="panel-section">
                ${sectionHead("Mapped destinations", 0)}
                <p class="empty-copy">No application resource is mapped to this concept in the current index. That is a coverage gap, not evidence that no exercise exists.</p>
                <div class="action-row">
                  ${explanation ? `<button type="button" class="action-button" data-act="open-first-resource" data-concept="${esc(concept.id)}">Read the closest explanation</button>` : ""}
                  ${goals[0] ? `<button type="button" class="action-button" data-act="select-goal" data-goal="${esc(goals[0].goalId)}">Open the route</button>` : ""}
                </div>
              </section>`
        }

        <section class="panel-section">
          ${sectionHead("Routes that use it", goals.length)}
          ${
            goals.length
              ? `<div class="goal-picker">${goals
                  .map((goal) => {
                    const step = goal.steps.find((entry) => entry.conceptId === concept.id);
                    return `<button type="button" class="goal-option" data-act="select-goal" data-goal="${esc(goal.goalId)}"><strong>${esc(goal.title)}</strong><span>Step ${step.step} of ${goal.steps.length} · ${esc(goal.status)}</span></button>`;
                  })
                  .join("")}</div>`
              : '<p class="empty-copy">This concept is not a step in any of the three review routes yet.</p>'
          }
        </section>

        <p class="panel-note">Links point to application routes. This isolated prototype does not serve them; it shows where the concept is applied. Practice answers stay withheld.</p>
      </div>`;
  };

  /* --------------------------------------------------------------- goal panel */
  const routeStepMarkup = (step, goal, selectedId) => {
    const self = Boolean(state.selfReported[step.conceptId]);
    const conditions = Array.isArray(step.conditions) ? step.conditions : step.conditions ? [step.conditions] : [];
    const conditionText = conditions
      .map((condition) => (typeof condition === "string" ? condition : condition?.text ?? ""))
      .filter(Boolean)
      .join(" · ");
    const gapText = typeof step.gap === "string" ? step.gap : step.gap?.text ?? step.gap?.message ?? "";
    return `
      <li class="route-step ${step.isTarget ? "is-target" : ""} ${step.gap ? "is-gap" : ""} ${self ? "is-self-reported" : ""} ${step.conceptId === selectedId ? "is-active-step" : ""}">
        <button type="button" class="route-title-button" data-act="open-concept" data-concept="${esc(step.conceptId)}">${esc(step.conceptLabel)}</button>
        <p class="route-reason">${esc(step.reason?.text ?? "")}</p>
        <div class="route-badges">
          <span class="route-badge">step ${step.step}</span>
          <span class="route-badge">${esc(domainById.get(step.domain)?.short ?? step.domain)}</span>
          ${step.isTarget ? '<span class="route-badge is-target">target</span>' : ""}
          ${step.gap ? '<span class="route-badge is-gap">gap</span>' : ""}
          ${self ? '<span class="route-badge">self-reported</span>' : ""}
        </div>
        ${gapText ? `<p class="route-reason">${esc(gapText)}</p>` : ""}
        ${conditionText ? `<p class="route-reason">${esc(conditionText)}</p>` : ""}
        <div class="route-self">
          <button type="button" data-act="toggle-self" data-concept="${esc(step.conceptId)}" aria-pressed="${self}">${self ? "Mark as not yet" : "I already know this"}</button>
        </div>
      </li>`;
  };

  const renderGoalPanel = () => {
    const concept = conceptById.get(state.conceptId);
    let goal = goalById.get(state.goalId);
    if (!goal) {
      goal = DATA.goals.find((entry) => entry.steps.some((step) => step.conceptId === concept?.id)) ?? DATA.goals[0];
    }
    if (!goal) {
      return `<div class="panel-pad"><h3 class="panel-title">No routes yet.</h3><p class="panel-def">No goal route survived review into the candidate graph.</p></div>`;
    }
    if (goal.goalId !== state.goalId) {
      state.goalId = goal.goalId;
      persist();
    }
    const selectedStep = concept ? goal.steps.find((step) => step.conceptId === concept.id) : null;
    const gaps = goal.steps.filter((step) => step.gap).length;
    const saved = savedGoal(goal.goalId);

    return `
      <div class="panel-pad">
        <div class="panel-kicker"><span>Reach a goal</span><span>${esc(goal.status)}</span></div>
        <h3 class="panel-title">${esc(goal.title)}</h3>
        <p class="panel-def">${esc(goal.audience)}</p>

        <div class="goal-picker">
          ${DATA.goals
            .map(
              (entry) => `<button type="button" class="goal-option" data-act="select-goal" data-goal="${esc(entry.goalId)}" aria-pressed="${entry.goalId === goal.goalId}"><strong>${esc(entry.title)}</strong><span>${esc(entry.audience)}</span></button>`,
            )
            .join("")}
        </div>

        <section class="panel-section">
          ${sectionHead("Route", goal.steps.length)}
          <div class="route-summary">
            <span class="route-badge">${esc(goal.status)}</span>
            <span class="route-badge">${plural(goal.steps.length, "step")}</span>
            <span class="route-badge">${plural(goal.coverage.targetCount, "target")}</span>
            ${gaps ? `<span class="route-badge is-gap">${plural(gaps, "gap")}</span>` : ""}
          </div>
          <ol class="route-list">${goal.steps.map((step) => routeStepMarkup(step, goal, selectedStep?.conceptId)).join("")}</ol>
          <p class="panel-note">Prerequisite-before-dependent topological order. Hop count is not a learning-quality score. Self-report changes only your mark; it does not reorder the route or count as mastery.</p>
        </section>

        <section class="panel-section">
          ${sectionHead("Conditions and limits")}
          <p class="empty-copy">${esc(goal.limitations || "None recorded.")}</p>
          ${goal.limitationsApplied?.length ? `<p class="panel-note">${esc(goal.limitationsApplied.join(" "))}</p>` : ""}
          <p class="panel-note">${esc(goal.orderingPolicy)}</p>
        </section>

        <div class="action-row">
          <button type="button" class="action-button is-primary" data-act="start-route" data-goal="${esc(goal.goalId)}">Start this route</button>
          <button type="button" class="action-button" data-act="deal-goal" data-goal="${esc(goal.goalId)}">Route deck</button>
          <button type="button" class="action-button" data-act="toggle-pocket-goal" data-goal="${esc(goal.goalId)}">${saved ? "Saved to pocket" : "Save route"}</button>
        </div>
      </div>`;
  };

  const renderContext = () => {
    if (state.intent === "compare") ui.contextContent.innerHTML = renderComparePanel();
    else if (state.intent === "apply") ui.contextContent.innerHTML = renderApplyPanel();
    else if (state.intent === "goal") ui.contextContent.innerHTML = renderGoalPanel();
    else ui.contextContent.innerHTML = renderUnderstandPanel();
    updateFieldSummary();
  };

  /* ------------------------------------------------------------------ timeline */
  const monthName = (date) => new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

  const renderRail = () => {
    const first = DATA.timeline.days[0];
    const last = DATA.timeline.days[DATA.timeline.days.length - 1];
    ui.railRange.textContent = `${first.day} ${first.month} — ${last.day} ${last.month} ${last.date.slice(0, 4)}`;
    const quiet = DATA.timeline.days.length - DATA.editions.length;
    ui.railStatus.textContent = `${plural(DATA.editions.length, "edition")} · ${plural(quiet, "quiet day")}`;

    ui.railDays.innerHTML = DATA.timeline.days
      .map((day) => {
        const selected = day.date === state.date;
        const showWeekday = day.hasEdition || day.isToday || day.date === DATA.timeline.start;
        return `<li><button type="button" class="rail-day" role="option" data-date="${esc(day.date)}" data-has-edition="${day.hasEdition}" data-is-today="${day.isToday}" data-month-start="${day.day === 1}" aria-selected="${selected}" tabindex="${selected ? 0 : -1}" aria-label="${esc(longDate(day.date))}${day.hasEdition ? `, edition, ${plural(day.cardCount, "card")}` : ", no edition"}${day.isToday ? ", today" : ""}">
          <span class="rail-weekday">${showWeekday ? esc(day.weekdayShort) : ""}</span>
          <span class="rail-dot">${day.day}</span>
          <span class="rail-month">${esc(day.month)}</span>
        </button></li>`;
      })
      .join("");

    const index = DATA.timeline.days.findIndex((day) => day.date === state.date);
    const ratio = DATA.timeline.days.length > 1 ? index / (DATA.timeline.days.length - 1) : 0;
    ui.railProgress.style.width = `${ratio * 100}%`;
  };

  const renderBand = () => {
    const day = dayByDate.get(state.date);
    if (!day) {
      ui.editionBand.innerHTML = `<div class="band-empty"><div class="band-date"><span class="band-day">—</span><span class="band-month">No date</span></div><div class="band-copy"><p class="band-title">Pick a day on the line.</p><p class="band-empty-copy">The timeline holds one date per day. Editions exist only where the archive records one.</p></div><div class="band-side"><button type="button" class="action-button" data-act="jump-latest">Latest edition</button></div></div>`;
      return;
    }
    const edition = editionByDate.get(state.date);
    if (!edition) {
      const isToday = day.isToday;
      ui.editionBand.innerHTML = `
        <div class="band-empty">
          <div class="band-date"><span class="band-day">${day.day}</span><span class="band-month">${esc(day.month)}</span></div>
          <div class="band-copy">
            <p class="band-title">${isToday ? "Today has no edition — on purpose." : "No edition on this date."}</p>
            <p class="band-empty-copy">${
              isToday
                ? "The line is allowed to be quiet. Opening the Dealer here returns an empty hand rather than inventing cards from a date with no recorded edition."
                : "This day is part of the index but carries no recorded edition. The field still works from the last concept you opened."
            }</p>
            <div class="band-meta"><span class="pill">quiet day</span><span class="pill">0 cards</span>${isToday ? '<span class="pill">today</span>' : ""}</div>
          </div>
          <div class="band-side">
            <span class="band-cards">0 cards</span>
            <span class="mono">empty hand</span>
          </div>
        </div>`;
      return;
    }
    ui.editionBand.innerHTML = `
      <div class="band-inner">
        <div class="band-date"><span class="band-day">${day.day}</span><span class="band-month">${esc(day.month)}</span></div>
        <div class="band-copy">
          <p class="band-title">${esc(edition.title)}</p>
          <p class="band-takeaway">${esc(edition.takeaway)}</p>
          <div class="band-meta">
            <span class="pill">${esc(edition.topic)}</span>
            <span class="pill">${plural(day.cardCount, "card")}</span>
            <span class="pill">technical review</span>
          </div>
        </div>
        <div class="band-side">
          <span class="band-cards">${plural(day.cardCount, "card")}</span>
          <span class="mono">candidate deck</span>
        </div>
      </div>`;
  };

  const renderTimelineFacts = () => {
    ui.todayLabel.textContent = longDate(DATA.timeline.today);
    ui.factEditions.textContent = fmt(DATA.editions.length);
    ui.factConcepts.textContent = fmt(DATA.concepts.length);
    ui.factRead.textContent = fmt(DATA.coverage.semanticallyRead);
    ui.factPublished.textContent = fmt(DATA.coverage.publishedConcepts);
    const edition = editionByDate.get(state.date);
    ui.openEdition.textContent = edition ? "Deal this edition" : "Open the empty hand";
    ui.openEdition.dataset.date = state.date;
    ui.dayPrev.disabled = DATA.timeline.days.findIndex((day) => day.date === state.date) <= 0;
    ui.dayNext.disabled = DATA.timeline.days.findIndex((day) => day.date === state.date) >= DATA.timeline.days.length - 1;
  };

  const renderTimeline = () => {
    renderRail();
    renderBand();
    renderTimelineFacts();
  };

  const placeRailCursor = (button) => {
    if (!button) {
      ui.railCursor.classList.remove("is-visible");
      return;
    }
    const railRect = ui.railDays.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    ui.railCursor.style.left = `${rect.left - railRect.left + rect.width / 2}px`;
    ui.railCursorLabel.textContent = button.dataset.date.slice(5).replace("-", " ");
    ui.railCursor.classList.add("is-visible");
  };

  const selectDate = (date, options = {}) => {
    if (!dayByDate.has(date)) return false;
    const changed = state.date !== date;
    state.date = date;
    persist();
    syncUrl();
    renderTimeline();
    updateHandoff();
    renderClosing();
    if (options.open) openDealer(`daily:${date}`, options);
    if (options.focus) {
      const button = ui.railDays.querySelector(`[data-date="${date}"]`);
      button?.focus({ preventScroll: true });
    }
    if (changed) announce(`${longDate(date)} selected. ${editionByDate.has(date) ? "Edition available." : "No edition recorded."}`);
    return true;
  };

  const moveDate = (delta, options = {}) => {
    const index = DATA.timeline.days.findIndex((day) => day.date === state.date);
    const next = clamp(index + delta, 0, DATA.timeline.days.length - 1);
    return selectDate(DATA.timeline.days[next].date, options);
  };

  /* ------------------------------------------------------------------- handoff */
  const updateHandoff = () => {
    const edition = editionByDate.get(state.date) || latestEdition;
    const concept =
      conceptById.get(state.conceptId) ??
      (edition ? conceptById.get(edition.conceptId) : null) ??
      DATA.concepts[0];
    if (!concept) return;
    ui.handoffConcept.textContent = concept.label;
    const reading = concept.reading;
    ui.handoffToken.innerHTML = edition
      ? `<span class="token-kind">${esc(edition.topic)} · insight</span><span class="token-title">${esc(edition.cardTitle)}</span><span class="token-meta">${esc(longDate(edition.date))} · technical review</span>`
      : `<span class="token-kind">${esc(concept.domainLabel)}</span><span class="token-title">${esc(concept.label)}</span><span class="token-meta">${reading ? "read in context" : "candidate · not read"} · 0 published</span>`;
    ui.handoffNote.textContent = edition
      ? `The ${esc(edition.date.slice(8))} ${esc(monthName(edition.date))} card carries “${esc(edition.cardTitle)}” into the field. The concept is ${esc(concept.label)}; its prerequisites are shown as claims, not facts.`
      : `No edition is recorded for ${esc(longDate(state.date))}. The field opens from ${esc(concept.label)} instead, with the same candidate claims and the same honest gaps.`;
  };

  let handoffFrame = 0;
  const updateHandoffProgress = () => {
    handoffFrame = 0;
    const rect = ui.handoff.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / travel, 0, 1);
    ui.handoff.style.setProperty("--handoff", progress.toFixed(4));
  };

  const onScroll = () => {
    if (!handoffFrame) handoffFrame = window.requestAnimationFrame(updateHandoffProgress);
  };

  /* -------------------------------------------------------------------- dealer */
  const KIND_COLOR = {
    insight: "var(--teal)",
    resource: "var(--primary)",
    "route-step": "var(--magenta)",
  };
  const CAP_LABEL = { discover: "discover", readFull: "read", assess: "assess", relate: "relate" };
  const INLINE_LABEL = {
    scenario: "Scenario",
    prediction: "Prediction",
    takeaway: "Takeaway",
    caveat: "Caveat",
    step: "Step",
    concept: "Concept",
    reason: "Why this step",
    conditions: "Conditions",
    gap: "Gap",
  };

  const dealerState = {
    key: null,
    entry: null,
    cards: [],
    activeIndex: 0,
    date: null,
    conceptId: null,
    goalId: null,
  };

  const deckKeyForConcept = (conceptId) => `concept:${conceptId}`;
  const deckKeyForGoal = (goalId) => `goal:${goalId}`;

  const describeDeckKey = (key) => {
    if (!key) return { date: state.date, conceptId: state.conceptId, goalId: null };
    if (key.startsWith("daily:")) {
      const date = key.slice("daily:".length);
      const edition = editionByDate.get(date);
      return { date, conceptId: edition?.conceptId ?? state.conceptId, goalId: null };
    }
    if (key.startsWith("concept:")) {
      const conceptId = key.slice("concept:".length);
      return { date: state.date, conceptId, goalId: null };
    }
    if (key.startsWith("goal:")) {
      const goalId = key.slice("goal:".length);
      const goal = goalById.get(goalId);
      return { date: state.date, conceptId: goal?.steps[0]?.conceptId ?? state.conceptId, goalId };
    }
    return { date: state.date, conceptId: state.conceptId, goalId: null };
  };

  const activeCard = () => dealerState.cards[dealerState.activeIndex] ?? null;

  const renderDealerRail = () => {
    ui.dealerRail.innerHTML = DATA.timeline.days
      .map(
        (day) =>
          `<button type="button" class="dealer-day" data-act="dealer-date" data-date="${esc(day.date)}" data-has-edition="${day.hasEdition}" aria-current="${day.date === dealerState.date}" title="${esc(longDate(day.date))}${day.hasEdition ? `, ${plural(day.cardCount, "card")}` : ", no edition"}">
            <span>${day.day}</span><span class="dealer-day-dot" aria-hidden="true"></span>
          </button>`,
      )
      .join("");
  };

  const renderDealerHead = () => {
    const entry = dealerState.entry;
    const edition = dealerState.date ? editionByDate.get(dealerState.date) : null;
    const day = dealerState.date ? dayByDate.get(dealerState.date) : null;
    ui.dealerKickerKind.textContent = dealerState.key?.split(":")[0] ?? "deck";
    ui.dealerKickerDate.textContent = day ? `${day.weekday} ${day.day} ${day.month}` : "No date";
    ui.dealerTitle.textContent = entry?.deck?.title ?? "Edition";
    const summaryParts = entry ? [entry.explanation, entry.deck?.reason].filter(Boolean).map((part) => part.trim()) : [];
    ui.dealerSummary.textContent = summaryParts.length
      ? [...new Set(summaryParts)].join(" ")
      : "The resolver returned no deck for this request.";
    ui.dealerLocate.textContent = dealerState.cards.length ? "Locate in knowledge" : "Open the field";
    const review = entry?.deck?.provenance?.reviewState;
    ui.dealerReviewBadge.textContent =
      review === "technical_review" ? "technical review · human pending" : "candidate · technical review · human pending";
    ui.dealerFootNote.textContent = entry
      ? [entry.deck?.reason, ...(entry.limitations ?? [])].filter(Boolean).join(" ")
      : "No deck was resolved.";
  };

  const cardMarkup = (card, index) => {
    const current = index === dealerState.activeIndex;
    const caps = Object.entries(CAP_LABEL)
      .map(([key, label]) => `<span class="cap ${card.capabilities?.[key] ? "is-on" : ""}">${label}</span>`)
      .join("");
    return `<li>
      <button type="button" class="card card-select" data-act="dealer-card" data-index="${index}" aria-current="${current}" aria-label="${esc(card.kind)} card: ${esc(card.title)}">
        <span class="card-top">
          <span class="card-kind" style="--kind-color:${KIND_COLOR[card.kind] || "var(--primary)"}">${esc(card.kind)}</span>
          <span class="mono">${esc(humanize(card.reviewState ?? "candidate"))}</span>
        </span>
        <span class="card-title">${esc(card.title)}</span>
        <span class="card-summary">${esc(truncate(card.summary, 160))}</span>
        <span class="card-caps">${caps}</span>
      </button>
    </li>`;
  };

  const handMeta = () => {
    const entry = dealerState.entry;
    if (!entry) return "";
    const summary = entry.deck?.capabilitySummary ?? {};
    const caps = Object.entries(CAP_LABEL)
      .map(([key, label]) => `<span class="cap ${summary[key] ? "is-on" : ""}">${label}</span>`)
      .join("");
    const provenance = entry.deck?.provenance ?? {};
    return `<span class="hand-caps">${caps}</span>
      <span class="hand-provenance">${esc(provenance.source ?? "no source")} · ${esc(provenance.basis ?? entry.reasonCode ?? "no basis")}</span>`;
  };

  const renderHand = () => {
    ui.handCount.textContent = plural(dealerState.cards.length, "card");
    ui.handLabel.textContent = dealerState.entry?.status === "empty" ? "The empty hand" : "The hand";
    if (!dealerState.cards.length) {
      ui.dealerHand.innerHTML = `<li class="hand-empty">
        <h3>No cards to deal.</h3>
        <p>${esc(dealerState.entry?.explanation ?? "The resolver returned an empty deck.")} The Dealer does not invent a card to fill the space.</p>
        <div class="card-actions">
          <button type="button" class="action-button" data-act="dealer-jump-latest">Open the latest edition</button>
          <button type="button" class="action-button" data-act="dealer-close">Back to the timeline</button>
        </div>
      </li>`;
      ui.handHint.innerHTML = `<span>An empty hand is a real resolver result, not an error state.</span>${handMeta()}`;
      return;
    }
    ui.dealerHand.innerHTML = dealerState.cards.map(cardMarkup).join("");
    ui.handHint.innerHTML = `<span>Select a card to read it. Every card states what it can do: discover, read, assess or relate.</span>${handMeta()}`;
  };

  const readerField = (label, value, modifier = "") => `
    <div class="reader-field ${modifier}">
      <dt>${esc(label)}</dt>
      <dd dir="auto">${esc(value)}</dd>
    </div>`;

  const renderReader = () => {
    const card = activeCard();
    if (!card) {
      ui.dealerReader.innerHTML = `
        <div class="reader-kicker"><span>Empty deck</span><span>0 cards</span></div>
        <h3 class="reader-title">Nothing was resolved.</h3>
        <p class="reader-payload">The resolver returned zero cards. That is the honest result for a date with no recorded edition. Browse the timeline for a day that has one, or open the latest edition.</p>
        <div class="reader-ref"><div><p>Latest recorded edition</p><p class="mono">${esc(latestEditionDate ?? "none")}</p></div><button type="button" class="action-button is-primary" data-act="dealer-jump-latest">Open latest</button></div>`;
      return;
    }

    const payload = card.reader?.payload ?? {};
    const fields = [];
    if (card.reader?.mode === "inline") {
      for (const key of ["scenario", "prediction", "takeaway", "caveat", "step", "concept", "reason", "conditions", "gap"]) {
        const value = payload[key];
        if (value == null || value === "" || (Array.isArray(value) && !value.length)) continue;
        const text = Array.isArray(value) ? value.join(" · ") : String(value);
        const modifier = key === "takeaway" ? "is-takeaway" : key === "caveat" ? "is-caveat" : "";
        const label = INLINE_LABEL[key] ?? key;
        const rendered = key === "concept" ? conceptById.get(text)?.label ?? text : text;
        fields.push(readerField(label, rendered, modifier));
      }
    }

    const reference = card.reader?.mode === "reference"
      ? `<div class="reader-ref">
          <div><p>${esc(payload.role ?? "Reference")} · ${esc(payload.locator ?? "No locator")}</p><p class="mono">${esc(card.contentRef?.sourcePath ?? "unknown source")} · ${esc(card.contentRef?.language ?? "en")}</p></div>
          <button type="button" class="action-button" data-act="open-resource" data-href="${esc(card.reader?.href ?? "#")}" data-label="${esc(card.title)}">Preview resource</button>
        </div>`
      : "";

    const evidence = card.evidence?.length
      ? `<section class="reader-why"><p class="mono">Evidence</p>${card.evidence
          .map(
            (entry) =>
              `<blockquote class="board-quote" dir="auto">"${esc(truncate(entry.quote, 320))}"</blockquote><p class="resource-meta">${esc(entry.unitId)} · ${esc(entry.locator ?? "no locator")}</p>`,
          )
          .join("")}</section>`
      : "";

    const actions = (card.allowedActions ?? [])
      .map((action) => {
        if (action.type === "locate-in-knowledge") {
          return `<button type="button" class="action-button" data-act="dealer-locate" data-concept="${esc(action.targetId ?? "")}">${esc(action.label)}</button>`;
        }
        if (action.type === "open-resource") {
          return `<button type="button" class="action-button" data-act="open-resource" data-href="${esc(action.href ?? "#")}" data-label="${esc(card.title)}">${esc(action.label)}</button>`;
        }
        return `<button type="button" class="action-button" data-act="dealer-next">${esc(action.label)}</button>`;
      })
      .join("");
    const saved = savedCard(dealerState.key, card.cardId);

    ui.dealerReader.innerHTML = `
      <div class="reader-kicker"><span>${esc(card.kind)}</span><span>${esc(humanize(card.reviewState ?? "candidate"))}</span><span>card ${dealerState.activeIndex + 1} / ${dealerState.cards.length}</span></div>
      <h3 class="reader-title">${esc(card.title)}</h3>
      <p class="reader-payload">${esc(card.summary)}</p>
      ${fields.length ? `<dl class="reader-payload">${fields.join("")}</dl>` : ""}
      ${reference}
      ${evidence}
      <section class="reader-why">
        <p class="mono">Why this card</p>
        <p>${esc(card.contentRef?.sourcePath ?? "No source path recorded")} · ${esc(card.contentRef?.locator ?? "no locator")}</p>
        <p class="resource-meta">${esc(card.contentRef?.sourceId ?? "no source id")} · revision ${esc(card.revision ?? 1)} · ${esc(card.capabilities?.assess ? "assessment available" : "no assessment claim")}</p>
      </section>
      <div class="card-actions">
        <button type="button" class="action-button is-primary" data-act="dealer-save-card" data-card="${esc(card.cardId)}">${saved ? "Saved to pocket" : "Save this card"}</button>
        ${actions}
      </div>`;
  };

  const renderDealer = () => {
    renderDealerHead();
    renderDealerRail();
    renderHand();
    renderReader();
  };

  const openDealer = (key, options = {}) => {
    const entry = DATA.decks[key];
    if (!entry) {
      showToast("No deck is available for that request.");
      return false;
    }
    const context = describeDeckKey(key);
    dealerState.key = key;
    dealerState.entry = entry;
    dealerState.cards = entry.deck?.cards ?? [];
    dealerState.date = context.date;
    dealerState.conceptId = context.conceptId;
    dealerState.goalId = context.goalId;
    dealerState.activeIndex = 0;
    if (options.cardId) {
      const index = dealerState.cards.findIndex((card) => card.cardId === options.cardId);
      if (index >= 0) dealerState.activeIndex = index;
    }
    renderDealer();
    ui.dealerBackdrop.hidden = false;
    document.body.classList.add("is-dialog-open");
    syncUrl();
    window.requestAnimationFrame(() => {
      if (dealerState.cards.length) {
        ui.dealerHand.querySelector(`[data-index="${dealerState.activeIndex}"]`)?.focus({ preventScroll: true });
      } else {
        ui.dealerClose.focus({ preventScroll: true });
      }
    });
    announce(`Deck opened. ${plural(dealerState.cards.length, "card")}.`);
    return true;
  };

  const closeDealer = (options = {}) => {
    if (ui.dealerBackdrop.hidden) return;
    ui.dealerBackdrop.hidden = true;
    document.body.classList.remove("is-dialog-open");
    syncUrl();
    if (options.returnFocus !== false) {
      (options.returnFocus ?? ui.openEdition)?.focus({ preventScroll: true });
    }
  };

  const selectDealerCard = (index) => {
    if (!dealerState.cards[index]) return;
    dealerState.activeIndex = index;
    renderHand();
    renderReader();
    ui.dealerHand.querySelector(`[data-index="${index}"]`)?.focus({ preventScroll: true });
    announce(`Card ${index + 1} of ${dealerState.cards.length}: ${dealerState.cards[index].title}.`);
  };

  const dealerLocate = (conceptId) => {
    const target = conceptId || dealerState.conceptId;
    const goal = dealerState.goalId;
    closeDealer({ returnFocus: false });
    if (goal) setIntent("goal");
    else setIntent("understand");
    if (target && conceptById.has(target)) {
      selectConcept(target, { scroll: true, focusField: true });
    } else {
      document.getElementById("scene-knowledge")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    }
  };

  const saveActiveCard = (cardId) => {
    const card = dealerState.cards.find((entry) => entry.cardId === cardId) ?? activeCard();
    if (!card) return;
    togglePocket({
      key: `card:${dealerState.key}:${card.cardId}`,
      kind: "card",
      label: card.title,
      meta: `${card.kind} · ${dealerState.entry?.deck?.title ?? "deck"}`,
      deckKey: dealerState.key,
      cardId: card.cardId,
    });
    renderReader();
  };

  /* -------------------------------------------------------------------- thread */
  const renderThread = () => {
    ui.threadCount.textContent = String(state.thread.length);
    if (!state.thread.length) {
      ui.threadList.innerHTML = '<li class="thread-empty">Open a concept to start a thread.</li>';
      return;
    }
    ui.threadList.innerHTML = state.thread
      .map((id, index) => {
        const concept = conceptById.get(id);
        if (!concept) return "";
        return `<li class="thread-item"><button type="button" class="thread-chip" data-act="open-concept" data-concept="${esc(id)}" aria-current="${id === state.conceptId}" title="${esc(concept.label)}"><span class="node-dot" style="--domain-color:var(--domain-${esc(concept.domain)})" aria-hidden="true"></span><span class="mono">${index + 1}</span>${esc(concept.label)}</button></li>`;
      })
      .join("");
  };

  const pushThread = (conceptId) => {
    state.thread = [...state.thread.filter((id) => id !== conceptId), conceptId].slice(-12);
    persist();
    renderThread();
  };

  /* -------------------------------------------------------------------- pocket */
  const renderPocket = () => {
    ui.pocketCount.textContent = String(state.pocket.length);
    ui.pocketEmpty.hidden = state.pocket.length > 0;
    ui.pocketList.innerHTML = state.pocket
      .map(
        (entry) => `<li class="pocket-item">
          <button type="button" class="pocket-open" data-act="pocket-open" data-key="${esc(entry.key)}">
            <span class="pocket-kind">${esc(entry.kind)}</span>
            <span class="pocket-label">${esc(entry.label)}</span>
            <span class="pocket-meta">${esc(entry.meta ?? "")}</span>
          </button>
          <button type="button" class="pocket-remove" data-act="pocket-remove" data-key="${esc(entry.key)}" aria-label="Remove ${esc(entry.label)} from the pocket">remove</button>
        </li>`,
      )
      .join("");
  };

  const togglePocket = (entry) => {
    const index = state.pocket.findIndex((existing) => existing.key === entry.key);
    if (index >= 0) {
      state.pocket.splice(index, 1);
      showToast("Removed from the pocket.");
    } else {
      state.pocket.unshift(entry);
      state.pocket = state.pocket.slice(0, 24);
      showToast("Saved to the pocket.");
    }
    persist();
    renderPocket();
    renderContext();
    if (entry.kind === "card") renderReader();
    announce(index >= 0 ? "Removed from the pocket." : "Saved to the pocket.");
  };

  const openPocket = () => {
    renderPocket();
    ui.pocketPanel.hidden = false;
    ui.pocketToggle.setAttribute("aria-expanded", "true");
    ui.pocketClose.focus({ preventScroll: true });
  };

  const closePocket = (returnFocus = true) => {
    if (ui.pocketPanel.hidden) return;
    ui.pocketPanel.hidden = true;
    ui.pocketToggle.setAttribute("aria-expanded", "false");
    if (returnFocus) ui.pocketToggle.focus({ preventScroll: true });
  };

  const openPocketEntry = (key) => {
    const entry = state.pocket.find((candidate) => candidate.key === key);
    if (!entry) return;
    if (entry.kind === "concept" && conceptById.has(entry.conceptId)) {
      closePocket(false);
      selectConcept(entry.conceptId, { scroll: true, focusField: true });
    } else if (entry.kind === "comparison" && comparisonById.has(entry.comparisonId)) {
      const board = comparisonById.get(entry.comparisonId);
      state.comparisonId = board.id;
      state.conceptId = board.leftId;
      closePocket(false);
      setIntent("compare");
      selectConcept(board.leftId, { scroll: true, focusField: true });
    } else if (entry.kind === "goal" && goalById.has(entry.goalId)) {
      closePocket(false);
      state.goalId = entry.goalId;
      setIntent("goal", { scroll: true });
    } else if (entry.kind === "card" && DATA.decks[entry.deckKey]) {
      closePocket(false);
      openDealer(entry.deckKey, { cardId: entry.cardId });
    }
  };

  /* ------------------------------------------------------------------- closing */
  const renderClosing = () => {
    const concept = conceptById.get(state.conceptId) ?? (latestEdition ? conceptById.get(latestEdition.conceptId) : null);
    const reading = concept?.reading;
    if (concept && reading) {
      ui.closingIdea.textContent = `“${reading.evidenceQuote}” — ${concept.label}. ${reading.reading}`;
    } else if (concept) {
      ui.closingIdea.textContent = `${concept.label} is still candidate material. The field can show its definition, its claimed prerequisites and its coverage gaps, but it cannot turn an unread unit into a verified explanation.`;
    }
    ui.closingAction.textContent = latestEdition
      ? `Reopen the ${latestEdition.date.slice(8)} ${monthName(latestEdition.date)} edition`
      : "Browse the timeline";
    ui.closingAction.dataset.date = latestEditionDate ?? DATA.timeline.today;

    const rows = [
      ["Editions", fmt(DATA.editions.length)],
      ["Candidate concepts", fmt(DATA.concepts.length)],
      ["Candidate assertions", fmt(DATA.assertions ?? DATA.edges.length)],
      ["Comparison boards", fmt(DATA.comparisons.length)],
      ["Units read in context", `${fmt(DATA.coverage.semanticallyRead)} / ${fmt(DATA.coverage.eligibleUnits)}`],
      ["Published", fmt(DATA.coverage.publishedConcepts)],
      ["Media reviewed", `${fmt(DATA.coverage.mediaReviewed)} / ${fmt(DATA.coverage.mediaReferences)}`],
      ["Source files", `${fmt(DATA.coverage.sourceFilesTracked)} tracked · ${fmt(DATA.coverage.sourceFilesChanged)} changed`],
    ];
    ui.closingLedger.innerHTML = rows
      .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
      .join("");
    ui.closingLedgerNote.textContent = `${pct(DATA.coverage.semanticallyReadShare)} of eligible units were read in context. ${plural(DATA.coverage.decisions.unreviewed, "unit")} remain unreviewed. Denominators are not interchangeable: a unit is not a resource, and a revision overlay is not a new question.`;
  };

  /* --------------------------------------------------------------------- about */
  const renderAbout = () => {
    const coverage = DATA.coverage;
    const ambiguities = DATA.reviewRegister?.ambiguities?.length ?? 0;
    const contradictions = DATA.reviewRegister?.contradictions?.length ?? 0;
    const defects = [
      "Formula bodies are missing in three statistics units (stats:s11, stats:s13, stats:s14).",
      "Code asterisks were lost in extraction; for example COUNT( ) rather than COUNT(*).",
      "One academy lab survives as a heading with no body.",
      "Some fabric-notes summaries are templated rather than written.",
      "Emphasis markers can join words, as in “alinearassociation”.",
    ];
    const falsePositives = [
      "“select all that apply” matched concept:sql:select.",
      "“pipeline” in a visualization workflow matched concept:fabric:pipeline.",
      "“parameter” matched concept:fabric:pipeline-parameter.",
    ];
    ui.aboutBody.innerHTML = `
      <h3>What this artifact is</h3>
      <p>A standalone, no-build review prototype. It reads a generated candidate payload and renders a timeline, a daily Dealer, an intent-led knowledge field and a closing ledger. It is not integrated into the application, not deployed and not published.</p>
      <div class="about-grid">
        <div class="about-stat"><dt>Eligible units</dt><dd>${fmt(coverage.eligibleUnits)}</dd></div>
        <div class="about-stat"><dt>Read in context</dt><dd>${fmt(coverage.semanticallyRead)}</dd></div>
        <div class="about-stat"><dt>Published</dt><dd>${fmt(coverage.publishedConcepts)}</dd></div>
        <div class="about-stat"><dt>Concepts</dt><dd>${fmt(coverage.concepts)}</dd></div>
        <div class="about-stat"><dt>Assertions</dt><dd>${fmt(coverage.assertions)}</dd></div>
        <div class="about-stat"><dt>Comparisons</dt><dd>${fmt(coverage.comparisons)}</dd></div>
      </div>

      <h3>Reading coverage</h3>
      <ul>
        <li>${fmt(coverage.decisions.accepted)} accepted, ${fmt(coverage.decisions.revised)} revised, ${fmt(coverage.decisions.held)} held and ${fmt(coverage.decisions.unresolvedGap)} unresolved-gap decisions.</li>
        <li>${fmt(coverage.decisions.unreviewed)} eligible units are unreviewed; ${fmt(coverage.decisions.outOfScope)} units are out of scope for this phase.</li>
        <li>The quality sample selected ${fmt(coverage.qualitySample.selected)} units deterministically; ${fmt(coverage.qualitySample.decided)} received a decision.</li>
        <li>${pct(coverage.semanticallyReadShare)} of eligible units were read in context. That is a documented subset, not a complete semantic audit.</li>
      </ul>

      <h3>Denominators</h3>
      <p>${fmt(coverage.units)} units exist in the source index. ${fmt(coverage.eligibleUnits)} are eligible learning units, ${fmt(coverage.metadataOnlyUnits)} are metadata-only and ${fmt(coverage.nonLearningUnits)} are non-learning. ${fmt(coverage.candidateMatched)} units matched a candidate concept; ${fmt(coverage.candidateUnmatched)} did not. ${fmt(coverage.uniqueCanonicalResources)} unique canonical resources and ${fmt(coverage.mediaReferences)} media references are recorded. These numbers answer different questions and are not summed.</p>

      <h3>Known extraction defects</h3>
      <ul>${defects.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>

      <h3>Known matcher false positives</h3>
      <ul>${falsePositives.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>

      <h3>Review register</h3>
      <p>${plural(ambiguities, "ambiguity")} and ${plural(contradictions, "contradiction")} are recorded as corpus-level notes. They are not additional graph edges and they do not approve any candidate. ${esc(DATA.reviewRegister?.notice ?? "")}</p>

      <h3>What has not been done</h3>
      <ul>
        <li>No human publication, scientific, rights or assessment review.</li>
        <li>No visual review of media, figures or rendered pages.</li>
        <li>No canonical route or application integration; this artifact is isolated.</li>
        <li>No claim that the candidate graph is complete or that every relation is correct.</li>
      </ul>

      <h3>Explicit coverage gap</h3>
      <p>${coverage.explicitCoverageGaps?.length ? coverage.explicitCoverageGaps.map((gap) => `<code>${esc(gap)}</code>`).join(" ") : "None recorded."} The file is tracked as a gap rather than silently treated as empty.</p>

      <h3>Build</h3>
      <p><code>${esc(DATA.graphBuildId)}</code><br /><code>${esc(DATA.sourceIndexBuildId)}</code><br />Registry <code>${esc(DATA.registryVersion)}</code> · generated ${esc(DATA.generatedAt)} · ledger <code>${esc(String(DATA.ledgerFingerprint).slice(0, 16))}</code>.</p>
      <p>${esc(DATA.notice)}</p>`;
  };

  const openAbout = () => {
    renderAbout();
    ui.aboutBackdrop.hidden = false;
    document.body.classList.add("is-dialog-open");
    ui.aboutClose.focus({ preventScroll: true });
  };

  const closeAbout = (returnFocus = true) => {
    if (ui.aboutBackdrop.hidden) return;
    ui.aboutBackdrop.hidden = true;
    if (ui.dealerBackdrop.hidden) document.body.classList.remove("is-dialog-open");
    if (returnFocus) ui.aboutOpen.focus({ preventScroll: true });
  };

  /* --------------------------------------------------------------------- toast */
  let toastTimer = 0;
  const showToast = (message) => {
    ui.toast.textContent = message;
    ui.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => ui.toast.classList.remove("is-visible"), 2600);
  };

  const announce = (message) => {
    let region = document.getElementById("stage-status");
    if (!region) {
      region = document.createElement("p");
      region.id = "stage-status";
      region.className = "sr-only";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.append(region);
    }
    region.textContent = "";
    window.requestAnimationFrame(() => {
      region.textContent = message;
    });
  };

  /* -------------------------------------------------------------------- actions */
  const syncUrl = () => {
    try {
      const url = new URL(location.href);
      url.searchParams.set("date", state.date);
      url.searchParams.set("intent", state.intent);
      if (state.conceptId) url.searchParams.set("concept", state.conceptId);
      else url.searchParams.delete("concept");
      if (state.goalId) url.searchParams.set("goal", state.goalId);
      else url.searchParams.delete("goal");
      if (state.comparisonId) url.searchParams.set("comparison", state.comparisonId);
      else url.searchParams.delete("comparison");
      url.searchParams.set("theme", state.theme);
      if (!ui.dealerBackdrop.hidden && dealerState.key) url.searchParams.set("dealer", dealerState.key);
      else url.searchParams.delete("dealer");
      history.replaceState(null, "", url);
    } catch {
      /* file:// history can be restricted; URL state is a convenience, not a dependency. */
    }
  };

  const selectConcept = (conceptId, options = {}) => {
    const concept = conceptById.get(conceptId);
    if (!concept) return false;
    state.conceptId = conceptId;
    pushThread(conceptId);
    persist();
    syncUrl();
    renderContext();
    applyFieldState();
    updateHandoff();
    renderClosing();
    if (options.zoom !== false) focusConceptView(concept);
    if (options.scroll) {
      document.getElementById("scene-knowledge")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    }
    if (options.focusField) {
      window.setTimeout(() => nodeEls.get(conceptId)?.focus({ preventScroll: true }), options.scroll ? 320 : 0);
    }
    announce(`${concept.label}. ${concept.reading ? "Read in context." : "Not read in context."} ${plural(concept.prerequisites.length, "prerequisite")}, ${plural(concept.dependents.length, "dependent")}.`);
    return true;
  };

  const setIntent = (intent, options = {}) => {
    if (!INTENTS.includes(intent)) return false;
    state.intent = intent;
    if (options.persist !== false) persist();
    for (const button of ui.intentSwitch.querySelectorAll("[data-intent]")) {
      const selected = button.dataset.intent === intent;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    ui.field.setAttribute("aria-labelledby", `intent-${intent}`);
    ui.fieldModeLabel.textContent = `candidate graph · ${fmt(DATA.concepts.length)} concepts · ${INTENT_LABEL[intent]}`;
    renderContext();
    applyFieldState();
    syncUrl();
    if (options.scroll) {
      document.getElementById("scene-knowledge")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    }
    if (options.focus) ui.intentSwitch.querySelector(`[data-intent="${intent}"]`)?.focus({ preventScroll: true });
    if (options.announce !== false) announce(`${INTENT_LABEL[intent]} intention selected.`);
    return true;
  };

  const openResource = (href, label) => {
    if (!href) {
      showToast("No resource route is recorded for this card.");
      return;
    }
    showToast(`${label ?? "Resource"} · ${href} — application route, not served by this isolated prototype.`);
    announce(`Resource route ${href}. This isolated prototype does not serve application routes.`);
  };

  const openDealerDate = (date) => {
    if (!dayByDate.has(date)) return false;
    state.date = date;
    persist();
    renderTimeline();
    updateHandoff();
    renderClosing();
    return openDealer(`daily:${date}`);
  };

  const jumpToLatest = (options = {}) => {
    if (!latestEditionDate) return false;
    if (options.inDealer) return openDealerDate(latestEditionDate);
    return selectDate(latestEditionDate, { open: true, scroll: true });
  };

  const toggleSelfReport = (conceptId) => {
    if (!conceptById.has(conceptId)) return;
    if (state.selfReported[conceptId]) delete state.selfReported[conceptId];
    else state.selfReported[conceptId] = true;
    persist();
    renderContext();
    applyFieldState();
    announce(state.selfReported[conceptId] ? "Marked as already known. This is a self-report, not mastery." : "Self-report removed.");
  };

  const startRoute = (goalId) => {
    const goal = goalById.get(goalId);
    if (!goal?.steps.length) return;
    state.goalId = goalId;
    setIntent("goal");
    const first = goal.steps[0];
    selectConcept(first.conceptId, { scroll: true, focusField: true });
    announce(`Route started at step 1: ${first.conceptLabel}.`);
  };

  const pocketEntryForConcept = (concept) => ({
    key: `concept:${concept.id}`,
    kind: "concept",
    label: concept.label,
    meta: `${concept.domainLabel} · ${concept.reading ? "read in context" : "not read"}`,
    conceptId: concept.id,
  });

  const pocketEntryForComparison = (board) => ({
    key: `comparison:${board.id}`,
    kind: "comparison",
    label: `${board.leftLabel} ↔ ${board.rightLabel}`,
    meta: `${board.relationLabel} · ${board.crossDomain ? "cross-domain" : "same domain"}`,
    comparisonId: board.id,
    leftId: board.leftId,
  });

  const pocketEntryForGoal = (goal) => ({
    key: `goal:${goal.goalId}`,
    kind: "goal",
    label: goal.title,
    meta: `${plural(goal.steps.length, "step")} · ${goal.status}`,
    goalId: goal.goalId,
  });

  const handleAction = (trigger) => {
    const act = trigger.dataset.act;
    const conceptId = trigger.dataset.concept;
    switch (act) {
      case "focus-domain":
        focusDomain(trigger.dataset.domain);
        return;
      case "clear-search":
        clearSearch();
        return;
      case "open-concept":
        if (conceptId) selectConcept(conceptId, { scroll: false, focusField: false });
        return;
      case "toggle-pocket-concept": {
        const concept = conceptById.get(conceptId);
        if (concept) togglePocket(pocketEntryForConcept(concept));
        return;
      }
      case "deal-concept": {
        const concept = conceptById.get(conceptId);
        if (concept) openDealer(deckKeyForConcept(concept.id));
        return;
      }
      case "to-compare":
        setIntent("compare");
        return;
      case "to-understand":
        setIntent("understand");
        return;
      case "to-goal":
        setIntent("goal");
        return;
      case "open-resource":
        openResource(trigger.dataset.href, trigger.dataset.label);
        return;
      case "open-first-resource": {
        const concept = conceptById.get(conceptId);
        if (concept?.resources?.[0]) openResource(concept.resources[0].href, concept.resources[0].title);
        return;
      }
      case "toggle-pocket-comparison": {
        const board = comparisonById.get(trigger.dataset.comparison);
        if (board) togglePocket(pocketEntryForComparison(board));
        return;
      }
      case "toggle-pocket-goal": {
        const goal = goalById.get(trigger.dataset.goal);
        if (goal) togglePocket(pocketEntryForGoal(goal));
        return;
      }
      case "select-goal": {
        const goal = goalById.get(trigger.dataset.goal);
        if (!goal) return;
        state.goalId = goal.goalId;
        persist();
        if (state.intent === "goal") {
          renderContext();
          applyFieldState();
        } else {
          setIntent("goal");
        }
        announce(`${goal.title} selected.`);
        return;
      }
      case "toggle-self":
        toggleSelfReport(conceptId);
        return;
      case "start-route":
        startRoute(trigger.dataset.goal);
        return;
      case "deal-goal":
        if (trigger.dataset.goal) openDealer(deckKeyForGoal(trigger.dataset.goal));
        return;
      case "deal-date":
        if (trigger.dataset.date) openDealerDate(trigger.dataset.date);
        return;
      case "jump-latest":
        jumpToLatest();
        return;
      case "pocket-open":
        openPocketEntry(trigger.dataset.key);
        return;
      case "pocket-remove": {
        const index = state.pocket.findIndex((entry) => entry.key === trigger.dataset.key);
        if (index >= 0) {
          state.pocket.splice(index, 1);
          persist();
          renderPocket();
          renderContext();
          announce("Removed from the pocket.");
        }
        return;
      }
      case "dealer-card":
        selectDealerCard(Number(trigger.dataset.index));
        return;
      case "dealer-date":
        openDealerDate(trigger.dataset.date);
        return;
      case "dealer-save-card":
        saveActiveCard(trigger.dataset.card);
        return;
      case "dealer-locate":
        dealerLocate(trigger.dataset.concept);
        return;
      case "dealer-close":
        closeDealer();
        return;
      case "dealer-jump-latest":
        jumpToLatest({ inDealer: true });
        return;
      case "dealer-next":
        if (dealerState.activeIndex < dealerState.cards.length - 1) selectDealerCard(dealerState.activeIndex + 1);
        else closeDealer();
        return;
      default:
        return;
    }
  };

  /* ------------------------------------------------------------------- wiring */
  const trapFocus = (container, event) => {
    const focusables = [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(
      (element) => element.getClientRects().length > 0,
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const walkField = (fromId, dx, dy) => {
    const from = layout.get(fromId);
    if (!from) return null;
    let best = null;
    let bestScore = Infinity;
    for (const [id, point] of layout) {
      if (id === fromId) continue;
      const vx = point.x - from.x;
      const vy = point.y - from.y;
      const along = vx * dx + vy * dy;
      if (along <= 18) continue;
      const perpendicular = Math.abs(vx * dy - vy * dx);
      const score = along + perpendicular * 2.2;
      if (score < bestScore) {
        bestScore = score;
        best = id;
      }
    }
    return best;
  };

  const bindField = () => {
    ui.fieldNodes.addEventListener("click", (event) => {
      const node = event.target.closest(".node");
      if (!node) return;
      selectConcept(node.dataset.concept, { scroll: false, focusField: false });
    });

    ui.fieldNodes.addEventListener("keydown", (event) => {
      const node = event.target.closest(".node");
      if (!node) return;
      const directions = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const direction = directions[event.key];
      if (direction) {
        event.preventDefault();
        const next = walkField(node.dataset.concept, direction[0], direction[1]);
        if (next) selectConcept(next, { zoom: true, focusField: true });
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        fitView(true);
        announce("Field view reset.");
      }
    });

    let pan = null;
    ui.fieldCanvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest(".node, button, input, a, select")) return;
      pan = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: view.x, startY: view.y, moved: false };
      ui.fieldCanvas.setPointerCapture(event.pointerId);
      ui.fieldCanvas.classList.add("is-panning");
    });
    ui.fieldCanvas.addEventListener("pointermove", (event) => {
      if (!pan || pan.id !== event.pointerId) return;
      const dx = event.clientX - pan.x;
      const dy = event.clientY - pan.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) pan.moved = true;
      view.x = pan.startX + dx;
      view.y = pan.startY + dy;
      view.touched = true;
      clampView();
      applyView(false);
    });
    const endPan = (event) => {
      if (!pan || pan.id !== event.pointerId) return;
      ui.fieldCanvas.classList.remove("is-panning");
      if (ui.fieldCanvas.hasPointerCapture(event.pointerId)) ui.fieldCanvas.releasePointerCapture(event.pointerId);
      pan = null;
    };
    ui.fieldCanvas.addEventListener("pointerup", endPan);
    ui.fieldCanvas.addEventListener("pointercancel", endPan);

    ui.fieldCanvas.addEventListener(
      "wheel",
      (event) => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        const rect = ui.fieldCanvas.getBoundingClientRect();
        zoomAt(event.clientX - rect.left, event.clientY - rect.top, event.deltaY < 0 ? 1.12 : 0.89);
      },
      { passive: false },
    );

    ui.fieldCanvas.addEventListener("dblclick", (event) => {
      if (event.target.closest(".node, button")) return;
      const rect = ui.fieldCanvas.getBoundingClientRect();
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, 1.3);
    });

    ui.fieldZoomIn.addEventListener("click", () => zoomAt(ui.fieldCanvas.clientWidth / 2, ui.fieldCanvas.clientHeight / 2, 1.25));
    ui.fieldZoomOut.addEventListener("click", () => zoomAt(ui.fieldCanvas.clientWidth / 2, ui.fieldCanvas.clientHeight / 2, 0.8));
    ui.fieldReset.addEventListener("click", () => {
      fitView(true);
      announce("Field view reset to fit all candidate concepts.");
    });

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => {
        if (!view.touched) fitView(false);
        else {
          clampView();
          applyView(false);
        }
      });
      observer.observe(ui.fieldCanvas);
    }
  };

  const bindTimeline = () => {
    ui.railDays.addEventListener("click", (event) => {
      const button = event.target.closest(".rail-day");
      if (button) selectDate(button.dataset.date);
    });
    ui.railDays.addEventListener("mouseover", (event) => {
      const button = event.target.closest(".rail-day");
      if (button) placeRailCursor(button);
    });
    ui.railDays.addEventListener("focusin", (event) => {
      const button = event.target.closest(".rail-day");
      if (button) placeRailCursor(button);
    });
    ui.railDays.addEventListener("mouseleave", () => ui.railCursor.classList.remove("is-visible"));
    ui.railDays.addEventListener("keydown", (event) => {
      const button = event.target.closest(".rail-day");
      if (!button) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        moveDate(event.key === "ArrowLeft" ? -1 : 1, { focus: true });
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        selectDate(DATA.timeline.days[event.key === "Home" ? 0 : DATA.timeline.days.length - 1].date, { focus: true });
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectDate(button.dataset.date, { open: true });
      }
    });
    ui.dayPrev.addEventListener("click", () => moveDate(-1, { focus: true }));
    ui.dayNext.addEventListener("click", () => moveDate(1, { focus: true }));
    ui.openEdition.addEventListener("click", () => openDealerDate(state.date));
  };

  const bindIntent = () => {
    ui.intentSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-intent]");
      if (button) setIntent(button.dataset.intent);
    });
    ui.intentSwitch.addEventListener("keydown", (event) => {
      const index = INTENTS.indexOf(state.intent);
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const delta = event.key === "ArrowRight" ? 1 : -1;
        setIntent(INTENTS[(index + delta + INTENTS.length) % INTENTS.length], { focus: true });
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        setIntent(INTENTS[event.key === "Home" ? 0 : INTENTS.length - 1], { focus: true });
      }
    });
  };

  const bindChrome = () => {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-act]");
      if (!trigger) return;
      handleAction(trigger);
    });

    ui.themeToggle.addEventListener("click", () => {
      toggleTheme();
      syncUrl();
    });
    ui.footTheme.addEventListener("click", () => {
      toggleTheme();
      syncUrl();
    });
    ui.aboutOpen.addEventListener("click", openAbout);
    ui.closingAbout.addEventListener("click", openAbout);
    ui.aboutClose.addEventListener("click", () => closeAbout());
    ui.aboutBackdrop.addEventListener("click", (event) => {
      if (event.target === ui.aboutBackdrop) closeAbout();
    });
    ui.dealerClose.addEventListener("click", () => closeDealer());
    ui.dealerBackdrop.addEventListener("click", (event) => {
      if (event.target === ui.dealerBackdrop) closeDealer();
    });
    ui.pocketToggle.addEventListener("click", () => {
      if (ui.pocketPanel.hidden) openPocket();
      else closePocket();
    });
    ui.pocketClose.addEventListener("click", () => closePocket());
    ui.threadClear.addEventListener("click", () => {
      state.thread = state.conceptId ? [state.conceptId] : [];
      persist();
      renderThread();
      announce("Learning thread cleared.");
    });
    ui.closingPocket.addEventListener("click", openPocket);
    ui.closingAction.addEventListener("click", (event) => {
      event.preventDefault();
      const date = ui.closingAction.dataset.date || latestEditionDate || DATA.timeline.today;
      document.getElementById("scene-timeline")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      selectDate(date, { open: true });
    });

    ui.fieldSearch.addEventListener("input", () => runSearch(ui.fieldSearch.value));
    ui.fieldSearch.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const first = conceptById.get(searchOrder[0]);
        if (first) {
          event.preventDefault();
          selectConcept(first.id, { focusField: true });
          announce(`Opened ${first.label}, the first match for ${searchQuery}.`);
        }
      } else if (event.key === "Escape") {
        if (ui.fieldSearch.value) {
          event.preventDefault();
          clearSearch();
        } else {
          ui.fieldSearch.blur();
        }
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (!ui.dealerBackdrop.hidden) {
          event.preventDefault();
          closeDealer();
        } else if (!ui.aboutBackdrop.hidden) {
          event.preventDefault();
          closeAbout();
        } else if (!ui.pocketPanel.hidden) {
          event.preventDefault();
          closePocket();
        }
        return;
      }
      if (event.key === "Tab") {
        if (!ui.dealerBackdrop.hidden) trapFocus(ui.dealer, event);
        else if (!ui.aboutBackdrop.hidden) trapFocus(ui.about, event);
        return;
      }
      if (event.key === "/" && !isTyping(event.target) && ui.dealerBackdrop.hidden && ui.aboutBackdrop.hidden && ui.pocketPanel.hidden) {
        event.preventDefault();
        ui.fieldSearch.focus();
      }
    });
  };

  /* -------------------------------------------------------------------- boot */
  const sceneLinks = [...document.querySelectorAll("[data-scene-link]")];
  const updateSceneNav = () => {
    const marker = window.innerHeight * 0.38;
    let current = "timeline";
    for (const id of ["timeline", "knowledge", "closing"]) {
      const section = document.getElementById(`scene-${id}`);
      if (section && section.getBoundingClientRect().top <= marker) current = id;
    }
    for (const link of sceneLinks) {
      if (link.dataset.sceneLink === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  const onWindowScroll = () => {
    onScroll();
    window.requestAnimationFrame(updateSceneNav);
  };

  const init = () => {
    applyTheme();
    renderTimeline();
    renderField();
    renderLegend();
    renderFallback();
    renderThread();
    renderPocket();
    renderClosing();
    updateHandoff();
    setIntent(state.intent, { persist: false, announce: false });
    bindField();
    bindTimeline();
    bindIntent();
    bindChrome();
    ui.footBuild.textContent = `${DATA.graphBuildId} · ${DATA.registryVersion} · ${DATA.generatedAt}`;
    ui.fieldSearch.value = "";
    runSearch("");

    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("resize", onWindowScroll, { passive: true });

    window.requestAnimationFrame(() => {
      fitView(false);
      updateHandoffProgress();
      updateSceneNav();
      const requestedConcept = params.get("concept");
      if (requestedConcept && conceptById.has(requestedConcept)) {
        const concept = conceptById.get(requestedConcept);
        focusConceptView(concept);
        applyFieldState();
      }
      const requestedDealer = params.get("dealer");
      if (requestedDealer && DATA.decks[requestedDealer]) {
        openDealer(requestedDealer);
      }
    });

    if (params.get("date") && dayByDate.has(params.get("date"))) {
      announce(`${longDate(params.get("date"))} opened from the URL.`);
    }
  };

  window.__ATLAS_STAGE__ = {
    version: "3.1.0",
    data: DATA,
    getState: () => ({
      theme: state.theme,
      intent: state.intent,
      date: state.date,
      conceptId: state.conceptId,
      comparisonId: state.comparisonId,
      goalId: state.goalId,
      pocket: state.pocket.map((entry) => ({ ...entry })),
      thread: [...state.thread],
      selfReported: { ...state.selfReported },
      dealer: ui.dealerBackdrop.hidden ? null : dealerState.key,
    }),
    getView: () => ({ ...view, dense: view.s < 0.62 }),
    getLayout: () => Object.fromEntries([...layout].map(([id, point]) => [id, { x: Math.round(point.x), y: Math.round(point.y) }])),
    selectConcept,
    setIntent,
    selectDate,
    openDealer,
    closeDealer,
    openPocket,
    closePocket,
    openAbout,
    closeAbout,
    showToast,
  };

  init();
})();
