/* Hansa Knowledge Stage — recovered review prototype behaviour.
 *
 * One sticky stage, one normalized scroll progress, one rAF. The timeline is a
 * real deck of date cards again; the knowledge scene opens as a local
 * neighbourhood, not a fit-all field. Everything is rendered from the generated
 * review payload in data.js. No framework, no build step, no network.
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
  if (!window.HansaTimeline || !window.HansaNeighborhood) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="margin:0;padding:24px;font:16px/1.5 system-ui">The timeline or neighbourhood model did not load. Both model scripts must load before app.js.</p>',
    );
    return;
  }

  const TL = window.HansaTimeline;
  const NB = window.HansaNeighborhood;

  /* ------------------------------------------------------------------ helpers */
  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const ramp = (value, from, to) => clamp((value - from) / Math.max(0.0001, to - from), 0, 1);
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
  const longDate = (date) =>
    new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  const shortDate = (date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  const monthName = (date) =>
    new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const staticLayout = window.matchMedia("(max-width: 900px), (prefers-reduced-motion: reduce)");
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
  const TIMELINE = TL.buildTimelineModel(DATA);
  const timelineIndexByDate = new Map(TIMELINE.map((entry, index) => [entry.date, index]));
  const timelineByDate = new Map(TIMELINE.map((entry) => [entry.date, entry]));
  const ENTRANCES = NB.buildSubjectEntrances(DATA, { limit: 3 });
  const prototypeClock = DATA.prototypeClock || DATA.timeline.today;

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
  const params = new URLSearchParams(location.search);
  const initialDate =
    params.get("date") && dayByDate.has(params.get("date"))
      ? params.get("date")
      : dayByDate.has(stored.date)
        ? stored.date
        : latestEditionDate || DATA.timeline.today;

  const state = {
    theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    intent: INTENTS.includes(stored.intent) ? stored.intent : "understand",
    date: initialDate,
    conceptId: conceptById.has(stored.conceptId) ? stored.conceptId : null,
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
    nbLimit: 3,
    origin: { source: null, editionDate: null, editionTitle: null, cardTitle: null },
  };

  if (params.get("concept") && conceptById.has(params.get("concept"))) state.conceptId = params.get("concept");
  if (params.get("intent") && INTENTS.includes(params.get("intent"))) state.intent = params.get("intent");
  if (params.get("goal") && goalById.has(params.get("goal"))) state.goalId = params.get("goal");
  if (params.get("comparison") && comparisonById.has(params.get("comparison"))) state.comparisonId = params.get("comparison");
  if (params.get("theme") === "dark" || params.get("theme") === "light") state.theme = params.get("theme");

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
    journeyTrack: $("journey-track"),
    stage: $("stage"),
    timelineScene: $("scene-timeline"),
    knowledgeScene: $("scene-knowledge"),
    closingScene: $("scene-closing"),
    timelineStage: $("timeline-stage"),
    timelineTrack: $("timeline-track"),
    timelineCables: $("timeline-cables"),
    timelineRuler: $("timeline-ruler"),
    focusLabel: $("focus-label"),
    editionPeek: $("edition-peek"),
    timelineStatusCount: $("timeline-status-count"),
    timelineStatusSubset: $("timeline-status-subset"),
    dayPrev: $("day-prev"),
    dayNext: $("day-next"),
    openEdition: $("open-edition"),
    fieldModeLabel: $("field-mode-label"),
    fieldBack: $("field-back"),
    fieldSearch: $("field-search"),
    field: $("field"),
    fieldCanvas: $("field-canvas"),
    nbEntrance: $("nb-entrance"),
    fieldEdges: $("field-edges"),
    fieldEdgeLayer: $("field-edge-layer"),
    fieldNodes: $("field-nodes"),
    fieldEmpty: $("field-empty"),
    nbMembers: $("nb-members"),
    fieldSummary: $("field-summary"),
    fieldFallback: $("field-fallback"),
    fieldFallbackBody: $("field-fallback-body"),
    searchResults: $("nb-search-results"),
    transitionFrom: $("transition-from"),
    transitionCurrent: $("transition-current"),
    branchPreview: $("branch-preview"),
    contextContent: $("context-content"),
    threadDrawer: $("thread-drawer"),
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

  /* ------------------------------------------------------------------- journey */
  const journey = {
    progress: 0,
    scene: null,
    frame: 0,
    locked: false,
    lockedY: 0,
  };
  const SCENE_TARGET = { timeline: 0.04, knowledge: 0.55, closing: 0.94 };
  const sceneEls = [ui.timelineScene, ui.knowledgeScene, ui.closingScene].filter(Boolean);

  const isStatic = () => staticLayout.matches;

  const computeProgress = () => {
    const rect = ui.journeyTrack.getBoundingClientRect();
    const travel = Math.max(1, ui.journeyTrack.offsetHeight - ui.stage.offsetHeight);
    return clamp(-rect.top / travel, 0, 1);
  };

  const setVar = (name, value) => ui.stage.style.setProperty(name, Number(value).toFixed(4));

  const applyProgress = (progress) => {
    setVar("--p", progress);
    setVar("--tl-content", 1 - ramp(progress, 0.15, 0.22));
    setVar("--tl-shift", -64 * ramp(progress, 0.15, 0.24));
    setVar("--kn-veil", ramp(progress, 0.15, 0.25));
    setVar("--kn-content", ramp(progress, 0.17, 0.36));
    setVar("--kn-shift", 32 * (1 - ramp(progress, 0.17, 0.36)));
    setVar("--kn-exit", 1 - ramp(progress, 0.68, 0.74));
    setVar("--kn-exit-shift", -64 * ramp(progress, 0.68, 0.78));
    setVar("--cl-veil", ramp(progress, 0.68, 0.75));
    setVar("--cl-content", ramp(progress, 0.69, 0.82));
    setVar("--cl-shift", 32 * (1 - ramp(progress, 0.69, 0.82)));
    ui.stage.dataset.zone =
      progress < 0.22 ? "timeline" : progress < 0.74 ? "knowledge" : "closing";
  };

  const setActiveScene = (scene) => {
    for (const element of sceneEls) {
      element.inert = isStatic() ? false : Boolean(scene) && element.dataset.scene !== scene;
      element.dataset.active = String(Boolean(scene) && element.dataset.scene === scene);
    }
  };

  const updateSceneNav = (scene) => {
    for (const link of document.querySelectorAll("[data-scene-link]")) {
      if (link.dataset.sceneLink === scene) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  const updateStaticNav = () => {
    const marker = window.innerHeight * 0.38;
    let current = "timeline";
    for (const id of ["timeline", "knowledge", "closing"]) {
      const section = document.getElementById(`scene-${id}`);
      if (section && section.getBoundingClientRect().top <= marker) current = id;
    }
    journey.scene = current;
    updateSceneNav(current);
  };

  const syncProgress = () => {
    journey.frame = 0;
    if (isStatic()) {
      journey.progress = 0;
      applyProgress(0);
      setActiveScene(null);
      updateStaticNav();
      return;
    }
    const progress = computeProgress();
    journey.progress = progress;
    applyProgress(progress);
    const scene = progress < 0.22 ? "timeline" : progress < 0.74 ? "knowledge" : "closing";
    if (scene !== journey.scene) {
      journey.scene = scene;
      setActiveScene(scene);
    }
    updateSceneNav(scene);
  };

  const requestProgress = () => {
    if (!journey.frame) journey.frame = window.requestAnimationFrame(syncProgress);
  };

  /* Focus can be requested before a smooth scene scroll finishes. Wait for the
   * scene to become active instead of silently focusing an inert section. */
  const focusWhenActive = (scene, getTarget, attempt = 0) => {
    window.requestAnimationFrame(() => {
      if (!isStatic() && journey.scene !== scene && attempt < 120) {
        focusWhenActive(scene, getTarget, attempt + 1);
        return;
      }
      getTarget()?.focus?.({ preventScroll: true });
    });
  };

  const goToScene = (scene, options = {}) => {
    const target = SCENE_TARGET[scene];
    if (target == null) return false;
    if (isStatic()) {
      document
        .getElementById(`scene-${scene}`)
        ?.scrollIntoView({ behavior: options.instant ? "auto" : scrollBehavior(), block: "start" });
      if (options.instant) updateStaticNav();
      return true;
    }
    const trackTop = ui.journeyTrack.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, ui.journeyTrack.offsetHeight - ui.stage.offsetHeight);
    window.scrollTo({
      top: Math.round(trackTop + target * travel),
      behavior: options.instant ? "auto" : scrollBehavior(),
    });
    if (options.instant) syncProgress();
    return true;
  };

  const lockStage = () => {
    if (journey.locked) return;
    journey.locked = true;
    journey.lockedY = window.scrollY;
    ui.html.classList.add("is-stage-locked");
  };

  const unlockStage = () => {
    if (!journey.locked) return;
    journey.locked = false;
    ui.html.classList.remove("is-stage-locked");
    window.scrollTo({ top: journey.lockedY, behavior: "auto" });
    syncProgress();
  };

  /* ------------------------------------------------------------------ timeline */
  const tl = {
    position: timelineIndexByDate.get(state.date) ?? 0,
    geometry: TL.geometry(1280),
    drag: null,
    frame: 0,
    suppressClick: false,
    cableGroups: [],
    rulerTicks: [],
  };

  const selectedTimelineIndex = () => timelineIndexByDate.get(state.date) ?? 0;
  const cardFor = (date) => ui.timelineTrack.querySelector(`[data-date="${date}"]`);

  const renderTimelineCards = () => {
    ui.timelineTrack.innerHTML = TIMELINE.map((entry) => {
      const stateLabel = entry.hasEdition
        ? entry.deckStatus === "ready"
          ? "technical review"
          : entry.deckStatus === "missing"
            ? "deck missing"
            : "deck unresolved"
        : entry.isToday
          ? "today"
          : "quiet day";
      const tag = entry.hasEdition ? `ED ${String(entry.editionIndex).padStart(2, "0")}` : entry.isToday ? "TODAY" : "QUIET";
      const title = entry.hasEdition ? entry.title : entry.isToday ? "No edition today" : "No edition";
      const foot = entry.hasEdition
        ? `${plural(entry.cardCount, "card")} · ${stateLabel}`
        : `0 cards · ${stateLabel}`;
      return `<li class="tl-item">
        <button type="button" class="tl-card ${entry.hasEdition ? "has-edition" : "is-empty"} ${entry.isToday ? "is-today" : ""}"
          data-date="${esc(entry.date)}" data-index="${entry.index}" data-has-edition="${entry.hasEdition}"
          data-latest="${entry.isLatest}" aria-label="${esc(entry.ariaLabel)}">
          <span class="tl-card-top"><span class="tl-weekday">${esc(entry.weekday)}</span><span class="tl-tag">${tag}</span></span>
          <span class="tl-date"><span class="tl-day">${entry.day}</span><span class="tl-month">${esc(entry.month)}</span></span>
          <span class="tl-card-title">${esc(title)}</span>
          <span class="tl-card-stack" aria-hidden="true"><span></span><span></span><span></span></span>
          <span class="tl-card-foot"><span class="status-mark" aria-hidden="true"></span><span>${esc(foot)}</span></span>
        </button>
      </li>`;
    }).join("");

    /* Four lines per card: the beUI timeline grammar. The fan reaches the
       focused card and its neighbours, then fades out. */
    ui.timelineCables.innerHTML = TIMELINE.map(
      (_, index) =>
        `<g class="tl-cable-group" data-index="${index}">${[0, 1, 2, 3]
          .map(() => '<line class="tl-cable-line" />')
          .join("")}</g>`,
    ).join("");
    tl.cableGroups = [...ui.timelineCables.querySelectorAll(".tl-cable-group")].map((group) => ({
      group,
      lines: [...group.querySelectorAll("line")],
    }));
  };

  const renderRuler = () => {
    /* Five ticks per gap, the middle one taller. This is the beUI ruler, not a
       calendar date axis: the ticks sit between cards and travel with them. */
    const ticks = [];
    for (let gapIndex = 0; gapIndex < TIMELINE.length - 1; gapIndex += 1) {
      for (let tick = 0; tick < 5; tick += 1) {
        ticks.push(
          `<span class="tl-tick${tick === 2 ? " is-tall" : ""}" data-gap="${gapIndex}" data-tick="${tick}"></span>`,
        );
      }
    }
    const first = TIMELINE[0];
    const last = TIMELINE[TIMELINE.length - 1];
    ui.timelineRuler.innerHTML =
      ticks.join("") +
      `<span class="tl-caption start">${first.day} ${esc(first.month)}</span>` +
      `<span class="tl-caption end">${last.day} ${esc(last.month)}</span>`;
    tl.rulerTicks = [...ui.timelineRuler.querySelectorAll(".tl-tick")].map((el) => ({
      el,
      gapIndex: Number(el.dataset.gap),
      tick: Number(el.dataset.tick),
    }));
  };

  const applyTimeline = () => {
    const g = tl.geometry;
    const width = ui.timelineStage.clientWidth || 1;
    const height = ui.timelineStage.clientHeight || 1;
    ui.timelineStage.style.setProperty("--card-w", `${g.cardWidth}px`);
    ui.timelineStage.style.setProperty("--card-h", `${g.cardHeight}px`);
    const selected = selectedTimelineIndex();

    for (const card of ui.timelineTrack.querySelectorAll(".tl-card")) {
      const index = Number(card.dataset.index);
      const pos = TL.positionAt(index, tl.position, g);
      card.style.setProperty("--x", `${pos.x.toFixed(2)}px`);
      card.style.setProperty("--scale", pos.scale.toFixed(3));
      card.style.setProperty("--z", String(pos.z));
      card.style.setProperty("--opacity", pos.opacity.toFixed(3));
      card.setAttribute("aria-current", String(index === selected));
      card.tabIndex = index === selected ? 0 : -1;
    }

    /* Cables attach to the card's near top and bottom corners. They are drawn
       to the card's vertical center and hidden behind its opaque surface, so
       the visible part stops exactly at the edge. */
    for (const [index, cable] of tl.cableGroups.entries()) {
      const offset = index - tl.position;
      const opacity = clamp((1.6 - Math.abs(offset)) / 0.6, 0, 1);
      cable.group.setAttribute("opacity", opacity.toFixed(3));
      cable.group.classList.toggle("is-active", index === selected);
      if (opacity <= 0.001) continue;
      const x = width / 2 + TL.cardX(offset, g);
      const reach = (g.cardWidth / 2) * TL.cardScale(offset) * 0.8;
      const y = height * 0.5;
      const coords = [
        [width / 2, 0, x - reach, y],
        [width / 2, 0, x + reach, y],
        [width / 2, height, x - reach, y],
        [width / 2, height, x + reach, y],
      ];
      cable.lines.forEach((line, lineIndex) => {
        const [x1, y1, x2, y2] = coords[lineIndex];
        line.setAttribute("x1", x1.toFixed(2));
        line.setAttribute("y1", y1.toFixed(2));
        line.setAttribute("x2", x2.toFixed(2));
        line.setAttribute("y2", y2.toFixed(2));
      });
    }

    /* The tick group sits midway in the gap between two cards and keeps one
       width while the cards move, so it only translates. */
    for (const tick of tl.rulerTicks) {
      const offsetA = tick.gapIndex - tl.position;
      const offsetB = tick.gapIndex + 1 - tl.position;
      const right = TL.cardX(offsetA, g) + (g.cardWidth * TL.cardScale(offsetA)) / 2;
      const left = TL.cardX(offsetB, g) - (g.cardWidth * TL.cardScale(offsetB)) / 2;
      const gapWidth = left - right;
      if (gapWidth < 10) {
        tick.el.hidden = true;
        continue;
      }
      const spacing = (gapWidth * 0.7) / 4;
      const x = width / 2 + (right + left) / 2 + (tick.tick - 2) * spacing;
      tick.el.hidden = x < -24 || x > width + 24;
      tick.el.style.left = `${x.toFixed(2)}px`;
    }
  };

  const layoutTimeline = () => {
    const width = ui.timelineStage.clientWidth || window.innerWidth;
    const height = ui.timelineStage.clientHeight || 320;
    tl.geometry = TL.geometry(width);
    ui.timelineCables.setAttribute("viewBox", `0 0 ${width} ${height}`);
    ui.timelineCables.setAttribute("preserveAspectRatio", "none");
    applyTimeline();
  };

  const renderPeek = () => {
    const entry = timelineByDate.get(state.date);
    const edition = editionByDate.get(state.date);
    if (!entry) {
      ui.editionPeek.innerHTML = "";
      return;
    }

    if (!edition) {
      const copy = entry.isToday
        ? "Today has no edition — on purpose. Opening the hand returns zero cards rather than borrowing a card from an older date."
        : "This date carries no recorded edition. The line is allowed to be quiet, and the Dealer returns an empty hand here.";
      ui.editionPeek.innerHTML = `
        <p class="peek-label"><span>Selected moment</span><strong>${longDate(entry.date)}</strong></p>
        <p class="peek-note">${entry.isToday ? "No edition today." : "No edition on this date."} <strong>0 cards.</strong> ${esc(copy)}</p>`;
      return;
    }

    const deck = DATA.decks[entry.deckKey];
    const cards = Array.isArray(deck?.deck?.cards) ? deck.deck.cards : [];
    const peekCards = (cards.length ? cards : [{ title: edition.cardTitle }])
      .slice(0, 3)
      .map(
        (card, index) =>
          `<div class="peek-card"><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(card.title || edition.cardTitle)}</strong></div>`,
      )
      .join("");
    const status =
      entry.deckStatus === "ready"
        ? "technical review"
        : entry.deckStatus === "missing"
          ? "deck missing"
          : "deck unresolved";

    ui.editionPeek.innerHTML = `
      <p class="peek-label"><span>Selected moment · Edition ${String(entry.editionIndex).padStart(2, "0")}</span><strong>${longDate(entry.date)}</strong></p>
      <div class="peek-cards">${peekCards}</div>
      <p class="peek-note">${esc(edition.topic)} · ${plural(entry.cardCount, "card")} · ${status} · <strong>human publication review pending</strong>.</p>`;
  };

  const renderTimelineFacts = () => {
    ui.todayLabel.textContent = `${longDate(prototypeClock)} · prototype clock`;
    const quiet = TIMELINE.length - DATA.editions.length;
    ui.timelineStatusCount.textContent = `${plural(DATA.editions.length, "edition")} · ${plural(quiet, "quiet day")}`;
    ui.timelineStatusSubset.textContent = `${TIMELINE.length} days in the review clock`;
    const entry = timelineByDate.get(state.date);
    ui.openEdition.textContent = entry?.hasEdition ? "Open edition" : "Open empty hand";
    ui.openEdition.dataset.date = state.date;
    const index = selectedTimelineIndex();
    ui.dayPrev.disabled = index <= 0;
    ui.dayNext.disabled = index >= TIMELINE.length - 1;
    ui.focusLabel.textContent = !entry
      ? "NO DATE"
      : entry.isToday
        ? "TODAY · NO EDITION"
        : entry.isLatest
          ? "LATEST EDITION"
          : entry.hasEdition
            ? `EDITION ${String(entry.editionIndex).padStart(2, "0")}`
            : "QUIET DAY";
    renderPeek();
  };

  const tweenTo = (target) => {
    window.cancelAnimationFrame(tl.frame);
    if (isStatic() || reducedMotion.matches) {
      tl.position = target;
      applyTimeline();
      return;
    }
    const start = tl.position;
    const delta = target - start;
    if (Math.abs(delta) < 0.001) return;
    const started = performance.now();
    const duration = 420;
    const step = (now) => {
      const t = clamp((now - started) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      tl.position = start + delta * eased;
      applyTimeline();
      if (t < 1) tl.frame = window.requestAnimationFrame(step);
      else {
        tl.position = target;
        applyTimeline();
      }
    };
    tl.frame = window.requestAnimationFrame(step);
  };

  const selectDate = (date, options = {}) => {
    if (!dayByDate.has(date)) return false;
    const changed = state.date !== date;
    state.date = date;
    persist();
    syncUrl();
    const index = timelineIndexByDate.get(date) ?? 0;
    if (options.tween === false) {
      tl.position = index;
      applyTimeline();
    } else {
      tweenTo(index);
    }
    renderTimelineFacts();
    renderClosing();
    if (changed) {
      announce(`${longDate(date)} selected. ${editionByDate.has(date) ? "Edition available." : "No edition recorded."}`);
    }
    if (options.focus) window.requestAnimationFrame(() => cardFor(date)?.focus({ preventScroll: true }));
    if (options.open) openDealer(`daily:${date}`);
    return true;
  };

  const moveDate = (delta, options = {}) => {
    const next = clamp(selectedTimelineIndex() + delta, 0, TIMELINE.length - 1);
    return selectDate(TIMELINE[next].date, options);
  };

  const bindTimeline = () => {
    const stage = ui.timelineStage;
    let settleTimer = 0;

    const onPointerDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (event.target.closest("input, textarea, select, a")) return;
      window.cancelAnimationFrame(tl.frame);
      const now = performance.now();
      tl.drag = {
        id: event.pointerId,
        startX: event.clientX,
        start: tl.position,
        moved: false,
        lastX: event.clientX,
        lastTime: now,
        previousX: event.clientX,
        previousTime: now,
      };
    };

    const onPointerMove = (event) => {
      const drag = tl.drag;
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.startX;
      if (!drag.moved) {
        if (Math.abs(dx) < 4) return;
        drag.moved = true;
        stage.classList.add("is-dragging");
        try {
          stage.setPointerCapture(event.pointerId);
        } catch {
          /* Pointer capture is an enhancement. */
        }
      }
      const g = tl.geometry || TL.geometry(stage.clientWidth || 800);
      const raw = drag.start - dx / g.step;
      const last = TIMELINE.length - 1;
      tl.position = raw < 0 ? raw * 0.3 : raw > last ? last + (raw - last) * 0.3 : raw;
      applyTimeline();
      drag.previousX = drag.lastX;
      drag.previousTime = drag.lastTime;
      drag.lastX = event.clientX;
      drag.lastTime = performance.now();
    };

    const endDrag = (event) => {
      const drag = tl.drag;
      if (!drag || event.pointerId !== drag.id) return;
      tl.drag = null;
      stage.classList.remove("is-dragging");
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch {
        /* no capture */
      }
      if (!drag.moved) return;
      tl.suppressClick = true;
      window.setTimeout(() => {
        tl.suppressClick = false;
      }, 260);
      const dt = drag.lastTime - drag.previousTime;
      const velocity = dt > 0 ? (drag.lastX - drag.previousX) / dt : 0;
      const g = tl.geometry || TL.geometry(stage.clientWidth || 800);
      const eventsPerSecond = (-velocity * 1000) / g.step;
      const projected = tl.position + clamp(eventsPerSecond * 0.3, -4, 4);
      const target = clamp(Math.round(projected), 0, TIMELINE.length - 1);
      selectDate(TIMELINE[target].date);
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    ui.timelineTrack.addEventListener("click", (event) => {
      const card = event.target.closest(".tl-card");
      if (!card) return;
      if (tl.suppressClick) {
        event.preventDefault();
        return;
      }
      const date = card.dataset.date;
      if (date === state.date) {
        if (card.dataset.hasEdition === "true") openDealer(`daily:${date}`);
        else announce(`No edition on ${longDate(date)}.`);
        return;
      }
      selectDate(date);
    });

    stage.addEventListener("keydown", (event) => {
      if (!event.target.closest(".tl-card")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        moveDate(event.key === "ArrowLeft" ? -1 : 1, { focus: true });
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        selectDate(TIMELINE[event.key === "Home" ? 0 : TIMELINE.length - 1].date, { focus: true });
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDealer(`daily:${state.date}`);
      }
    });

    /* Horizontal wheel and trackpad swipes move the deck; vertical wheel is
       left to the page. This mirrors the beUI component. */
    stage.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        window.cancelAnimationFrame(tl.frame);
        const g = tl.geometry || TL.geometry(stage.clientWidth || 800);
        tl.position = clamp(tl.position + event.deltaX / g.step, -0.3, TIMELINE.length - 1 + 0.3);
        applyTimeline();
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          const target = clamp(Math.round(tl.position), 0, TIMELINE.length - 1);
          selectDate(TIMELINE[target].date);
        }, 140);
      },
      { passive: false },
    );

    ui.dayPrev.addEventListener("click", () => moveDate(-1, { focus: true }));
    ui.dayNext.addEventListener("click", () => moveDate(1, { focus: true }));
    ui.openEdition.addEventListener("click", () => openDealer(`daily:${state.date}`));

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => layoutTimeline());
      observer.observe(stage);
    }
    document.fonts?.ready.then(layoutTimeline).catch(() => {});
  };

  /* -------------------------------------------------------------------- search */
  let searchQuery = "";
  let searchMatches = new Set();
  let searchOrder = [];
  let currentNeighborhood = null;
  let previewId = null;

  const updateModeLabel = () => {
    if (state.intent !== "understand") {
      ui.fieldModeLabel.textContent = INTENT_LABEL[state.intent].toLowerCase();
      return;
    }
    const concept = conceptById.get(state.conceptId);
    ui.fieldModeLabel.textContent = concept
      ? `neighbourhood · ${domainById.get(concept.domain)?.short ?? concept.domain}`
      : "subject entrances";
  };

  const renderSearchResults = () => {
    if (!searchQuery) {
      ui.searchResults.hidden = true;
      ui.searchResults.innerHTML = "";
      return;
    }
    const results = searchOrder.slice(0, 6).map((id) => {
      const concept = conceptById.get(id);
      return `<button type="button" class="search-result" data-act="open-concept" data-concept="${esc(id)}">
        <span class="search-result-label">${esc(concept.label)}</span>
        <span class="search-result-meta">${esc(concept.domainLabel)} · ${concept.reading ? "read" : "candidate"}</span>
      </button>`;
    });
    ui.searchResults.hidden = false;
    ui.searchResults.innerHTML = results.length
      ? `<p class="search-results-kicker mono">${plural(searchMatches.size, "match", "matches")}</p>${results.join("")}`
      : `<p class="search-results-empty">No concept matches “${esc(searchQuery)}”. Try a shorter term.</p>`;
  };

  const renderFallback = () => {
    const rows = DATA.concepts
      .filter((concept) => !searchQuery || searchMatches.has(concept.id))
      .sort((a, b) => a.domain.localeCompare(b.domain) || a.label.localeCompare(b.label))
      .map(
        (concept) =>
          `<tr><td>${esc(concept.label)}</td><td>${esc(domainById.get(concept.domain)?.short ?? concept.domain)}</td><td>${concept.prerequisites.length}</td><td>${concept.dependents.length}</td><td>${concept.reading ? "read" : "not read"}</td><td><button type="button" class="table-open" data-act="open-concept" data-concept="${esc(concept.id)}" aria-label="Open ${esc(concept.label)}">open</button></td></tr>`,
      )
      .join("");
    ui.fieldFallbackBody.innerHTML = rows
      ? `<div class="fallback-scroll" tabindex="0" role="group" aria-label="Candidate concept table, scrollable"><table class="fallback-table"><caption class="sr-only">All candidate concepts, their subject membership and recorded relationship counts</caption><thead><tr><th scope="col">Concept</th><th scope="col">Subject</th><th scope="col">Requires</th><th scope="col">Unlocks</th><th scope="col">Reading</th><th scope="col"><span class="sr-only">Open</span></th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<p class="empty-copy">No concept matches “${esc(searchQuery)}”.</p>`;
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
        const aliases = Object.values(concept.aliases || {}).flat().map((alias) => String(alias).toLowerCase());
        const definition = concept.definition.toLowerCase();
        const scope = concept.scope.toLowerCase();
        const haystack = `${label} ${definition} ${scope} ${aliases.join(" ")}`;
        if (!haystack.includes(needle)) continue;
        const rank =
          label === needle
            ? 0
            : label.includes(needle)
              ? 1
              : aliases.some((alias) => alias === needle)
                ? 2
                : aliases.some((alias) => alias.includes(needle))
                  ? 3
                  : definition.includes(needle)
                    ? 4
                    : 5;
        ranked.push({ concept, rank });
      }
      ranked.sort((a, b) => a.rank - b.rank || a.concept.label.localeCompare(b.concept.label));
      for (const entry of ranked) {
        searchMatches.add(entry.concept.id);
        searchOrder.push(entry.concept.id);
      }
    }
    renderFallback();
    renderSearchResults();
    if (searchQuery) {
      ui.fieldSummary.textContent = `${plural(searchMatches.size, "concept")} match “${searchQuery}”. Press Enter to open the first.`;
    }
  };

  const clearSearch = () => {
    ui.fieldSearch.value = "";
    runSearch("");
    ui.fieldSearch.focus({ preventScroll: true });
  };

  /* -------------------------------------------------------------- neighbourhood */
  const renderEntrances = () => {
    currentNeighborhood = null;
    ui.field.classList.remove("has-neighbourhood", "is-list-layout");
    ui.nbEntrance.hidden = false;
    ui.fieldEdges.style.display = "none";
    ui.fieldNodes.innerHTML = "";
    ui.fieldEmpty.hidden = true;
    ui.nbMembers.hidden = true;
    ui.nbMembers.innerHTML = "";
    ui.fieldBack.hidden = true;
    ui.field.setAttribute("aria-label", "Knowledge subject entrances");
    ui.nbEntrance.innerHTML = `
      <div class="nb-entrance-head">
        <p class="nb-entrance-title">Five subjects. ${fmt(DATA.concepts.length)} candidate concepts.</p>
        <p class="nb-entrance-sub">Subject membership is not a semantic relation. Choose a subject entrance to open a local neighbourhood; every concept also stays reachable through search and the complete table.</p>
      </div>
      <div class="nb-entrance-grid">
        ${ENTRANCES.map(
          (entrance) => `<section class="nb-domain" style="--domain-color:var(--domain-${esc(entrance.colorToken)})">
            <header class="nb-domain-head">
              <span class="nb-domain-name">${esc(entrance.short)}</span>
              <span class="nb-domain-count mono">${entrance.count}</span>
            </header>
            <p class="nb-domain-meta">${entrance.readCount} read in context · ${entrance.count - entrance.readCount} candidate</p>
            <div class="nb-starters">
              ${entrance.starters
                .map(
                  (starter) => `<button type="button" class="nb-starter" data-act="open-concept" data-concept="${esc(starter.id)}">
                    <span class="nb-starter-label">${esc(starter.label)}</span>
                    <span class="nb-starter-meta">${starter.read ? "read" : "candidate"}${starter.degree ? ` · ${plural(starter.degree, "link")}` : " · no recorded link"}</span>
                  </button>`,
                )
                .join("")}
            </div>
          </section>`,
        ).join("")}
      </div>`;
    ui.fieldSummary.textContent = `Subject entrances. ${fmt(DATA.concepts.length)} candidate concepts in ${DATA.domains.length} subjects. ${fmt(DATA.coverage.semanticallyRead)} read in context. 0 published.`;
  };

  const renderNeighbourhood = (model) => {
    currentNeighborhood = model;
    if (!model?.center) {
      renderEntrances();
      return;
    }
    ui.field.classList.add("has-neighbourhood");
    ui.nbEntrance.hidden = true;
    ui.fieldEdges.style.display = "";
    ui.fieldBack.hidden = false;
    ui.field.setAttribute("aria-label", `Knowledge neighbourhood for ${model.center.label}`);
    const center = model.center;
    const nodes = model.shown
      .map((entry) => {
        const nodeConcept = conceptById.get(entry.id);
        const relation = NB.relationLabel(entry);
        const direction = NB.directionLabel(entry);
        return `<button type="button" class="nb-node" data-act="open-concept" data-concept="${esc(entry.id)}" data-group="${esc(entry.group)}" style="--domain-color:var(--domain-${esc(nodeConcept?.domain ?? center.domain)})" aria-label="${esc(entry.label)}, ${esc(relation)}. ${esc(direction)}. ${esc(entry.claim)}">
          <span class="nb-node-rel">${esc(relation)}</span>
          <span class="nb-node-label">${esc(entry.label)}</span>
          <span class="nb-node-meta">${nodeConcept?.reading ? "read" : "candidate"}${entry.crossDomain ? " · cross-subject" : ""}</span>
        </button>`;
      })
      .join("");
    ui.fieldNodes.innerHTML = `
      <div class="nb-center" style="--domain-color:var(--domain-${esc(center.domain)})">
        <p class="nb-center-kicker">${esc(center.domainLabel)} · ${center.reading ? "read in context" : "candidate, not read"}</p>
        <h3 class="nb-center-title">${esc(center.label)}</h3>
        <p class="nb-center-def">${esc(truncate(center.definition, 170))}</p>
        <p class="nb-center-meta mono">${plural(model.total, "recorded relation")} · ${plural(model.sameSubject.count, "more")} in ${esc(domainById.get(center.domain)?.short ?? center.domain)}</p>
      </div>
      ${nodes}`;
    if (!model.total) {
      ui.fieldEmpty.hidden = false;
      ui.fieldEmpty.innerHTML = `<div class="nb-zero">
        <p class="nb-zero-title">No candidate relation is recorded for this concept.</p>
        <p>That is a coverage gap, not proof that none exists. The ${plural(model.sameSubject.count, "concept")} below share the subject; membership is not a relation.</p>
        <div class="nb-zero-list">${model.sameSubject.starters
          .map(
            (entry) => `<button type="button" class="nb-starter" data-act="open-concept" data-concept="${esc(entry.id)}"><span class="nb-starter-label">${esc(entry.label)}</span><span class="nb-starter-meta">${entry.read ? "read" : "candidate"}</span></button>`,
          )
          .join("")}</div>
      </div>`;
    } else {
      ui.fieldEmpty.hidden = true;
      ui.fieldEmpty.innerHTML = "";
    }
    const groups = model.groups
      .filter((group) => group.count)
      .map((group) => `${group.count} ${group.label.toLowerCase()}`)
      .join(" · ");
    const showMembers = model.total > 0 && model.total < 3 && model.sameSubject.starters.length > 0;
    ui.nbMembers.hidden = !showMembers;
    ui.nbMembers.innerHTML = showMembers
      ? `<p class="nb-members-label">Also in ${esc(model.sameSubject.label)} · membership, not a relation</p>
        <div class="nb-members-list">${model.sameSubject.starters
          .map(
            (entry) => `<button type="button" class="nb-member" data-act="open-concept" data-concept="${esc(entry.id)}">
              <span>${esc(entry.label)}</span><span class="mono">${entry.read ? "read" : "candidate"}</span>
            </button>`,
          )
          .join("")}</div>`
      : "";
    ui.fieldSummary.textContent = `${center.label}. ${plural(model.total, "recorded candidate relation")}${groups ? `: ${groups}` : ""}. ${model.shown.length} shown in the neighbourhood${model.hiddenCount ? `, ${model.hiddenCount} more available` : ""}. 0 published.`;
    window.requestAnimationFrame(placeNodes);
  };

  const placeNodes = () => {
    const nodes = [...ui.fieldNodes.querySelectorAll(".nb-node")];
    if (!nodes.length) {
      ui.fieldEdges.innerHTML = "";
      ui.field.classList.remove("is-list-layout");
      return;
    }
    const width = ui.fieldCanvas.clientWidth;
    const height = ui.fieldCanvas.clientHeight;
    const listMode = width < 720;
    ui.field.classList.toggle("is-list-layout", listMode);
    if (listMode) {
      ui.fieldEdges.style.display = "none";
      for (const node of nodes) {
        node.style.removeProperty("--nx");
        node.style.removeProperty("--ny");
      }
      return;
    }
    ui.fieldEdges.style.display = "";

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const pad = 8;
    const gap = 10;
    const center = { x: width / 2, y: height * 0.46 };
    const centerEl = ui.fieldNodes.querySelector(".nb-center");
    const fixed = centerEl
      ? {
          x: center.x,
          y: center.y,
          w: centerEl.offsetWidth,
          h: centerEl.offsetHeight,
          movable: false,
        }
      : null;
    const radiusX = Math.max(232, Math.min(width * 0.34, 340));
    const radiusY = Math.max(116, Math.min(height * 0.34, 160));
    const bases = { requires: 180, unlocks: 0, contrasts: 90, related: 270 };
    const totals = {};
    for (const node of nodes) totals[node.dataset.group] = (totals[node.dataset.group] || 0) + 1;
    const seen = {};
    const boxes = nodes.map((node) => {
      const group = node.dataset.group;
      const index = seen[group] || 0;
      seen[group] = index + 1;
      const count = totals[group] || 1;
      const spread = count > 1 ? Math.min(60, 32 + (count - 2) * 8) : 0;
      const angle = (bases[group] ?? 270) + (count > 1 ? (index - (count - 1) / 2) * spread : 0);
      const radians = (angle * Math.PI) / 180;
      const w = node.offsetWidth || 164;
      const h = node.offsetHeight || 64;
      return {
        node,
        w,
        h,
        movable: true,
        x: clamp(center.x + Math.cos(radians) * radiusX, w / 2 + pad, width - w / 2 - pad),
        y: clamp(center.y + Math.sin(radians) * radiusY, h / 2 + pad, height - h / 2 - pad),
      };
    });

    const all = fixed ? [fixed, ...boxes] : boxes;
    for (let pass = 0; pass < 28; pass += 1) {
      let moved = false;
      for (let i = 0; i < all.length; i += 1) {
        for (let j = i + 1; j < all.length; j += 1) {
          const a = all[i];
          const b = all[j];
          const overlapX = (a.w + b.w) / 2 + gap - Math.abs(b.x - a.x);
          const overlapY = (a.h + b.h) / 2 + gap - Math.abs(b.y - a.y);
          if (overlapX <= 0 || overlapY <= 0) continue;
          moved = true;
          if (overlapX < overlapY) {
            const direction = Math.sign(b.x - a.x) || 1;
            const push = overlapX / 2 + 0.5;
            if (a.movable) a.x -= direction * push * (b.movable ? 1 : 2);
            if (b.movable) b.x += direction * push * (a.movable ? 1 : 2);
          } else {
            const direction = Math.sign(b.y - a.y) || 1;
            const push = overlapY / 2 + 0.5;
            if (a.movable) a.y -= direction * push * (b.movable ? 1 : 2);
            if (b.movable) b.y += direction * push * (a.movable ? 1 : 2);
          }
        }
      }
      for (const box of boxes) {
        box.x = clamp(box.x, box.w / 2 + pad, width - box.w / 2 - pad);
        box.y = clamp(box.y, box.h / 2 + pad, height - box.h / 2 - pad);
      }
      if (!moved) break;
    }

    const positions = new Map();
    for (const box of boxes) {
      box.node.style.setProperty("--nx", `${(box.x - center.x).toFixed(1)}px`);
      box.node.style.setProperty("--ny", `${(box.y - center.y).toFixed(1)}px`);
      positions.set(box.node.dataset.concept, { x: box.x, y: box.y });
    }
    ui.fieldEdges.setAttribute("viewBox", `0 0 ${width} ${height}`);
    ui.fieldEdges.setAttribute("width", String(width));
    ui.fieldEdges.setAttribute("height", String(height));
    ui.fieldEdges.innerHTML = nodes
      .map((node) => {
        const point = positions.get(node.dataset.concept);
        const midX = (center.x + point.x) / 2;
        const midY = (center.y + point.y) / 2 - 16;
        return `<path class="nb-edge is-${esc(node.dataset.group)}" d="M ${center.x.toFixed(1)} ${center.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${point.x.toFixed(1)} ${point.y.toFixed(1)}" />`;
      })
      .join("");
  };

  const renderPreview = () => {
    const concept = conceptById.get(previewId);
    const entry = currentNeighborhood
      ? [...currentNeighborhood.shown, ...currentNeighborhood.hidden].find((candidate) => candidate.id === previewId)
      : null;
    if (!concept || !entry) {
      ui.branchPreview.innerHTML = `<p class="preview-hint">Hover or focus a branch to preview it. <strong>Explore connections</strong> moves the neighbourhood; <strong>Open content</strong> opens the concept’s reading deck.</p>`;
      return;
    }
    ui.branchPreview.innerHTML = `<div class="preview-card" style="--domain-color:var(--domain-${esc(concept.domain)})">
      <p class="preview-kicker">${esc(NB.relationLabel(entry))} · ${esc(NB.directionLabel(entry))}</p>
      <p class="preview-title">${esc(concept.label)}</p>
      <p class="preview-claim">${esc(entry.claim)}</p>
      <div class="preview-actions">
        <button type="button" class="action-button is-primary" data-act="explore-concept" data-concept="${esc(concept.id)}">Explore connections</button>
        <button type="button" class="action-button" data-act="deal-concept" data-concept="${esc(concept.id)}">Open content</button>
      </div>
    </div>`;
  };

  const setPreview = (id) => {
    if (previewId === id) return;
    previewId = id;
    renderPreview();
  };

  const renderField = () => {
    const concept = conceptById.get(state.conceptId);
    updateModeLabel();
    if (!concept) {
      renderEntrances();
    } else {
      const model = NB.buildNeighborhood(DATA, concept.id, { limit: state.nbLimit });
      renderNeighbourhood(model);
    }
    renderFallback();
    renderSearchResults();
  };

  /* -------------------------------------------------------------------- panels */
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
      <div class="panel-kicker"><span>Knowledge</span><span>0 published</span></div>
      <h3 class="panel-title">Start from a subject, not a node.</h3>
      <p class="panel-def">The graph is a local neighbourhood of recorded candidate relations, not a map of the whole corpus. Choose a subject entrance in the canvas, or search all ${fmt(DATA.concepts.length)} candidate concepts.</p>

      ${
        latestEdition
          ? `<section class="panel-section">${sectionHead("From the latest edition")}
              <button type="button" class="branch-chip" data-act="deal-date" data-date="${esc(latestEdition.date)}">
                <span class="branch-top"><span class="branch-arrow">latest</span><span class="branch-label">${esc(latestEdition.cardTitle)}</span></span>
                <span class="branch-claim">${esc(latestEdition.takeaway)}</span>
              </button>
            </section>`
          : ""
      }

      <section class="panel-section">
        ${sectionHead("Every concept stays reachable", DATA.concepts.length)}
        <p class="panel-note">A concept without a recorded relation is still reachable through its subject entrance, search and the complete table. No approved edge is required to open content.</p>
        <button type="button" class="action-button" data-act="open-table">Open the complete table</button>
      </section>

      <p class="panel-note">Semantic reading covers ${fmt(DATA.coverage.semanticallyRead)} of ${fmt(DATA.coverage.eligibleUnits)} eligible units (${pct(DATA.coverage.semanticallyReadShare)}). Candidate relations are visibly unreviewed; none are published.</p>
    </div>`;

  const renderConceptPanel = () => {
    const concept = conceptById.get(state.conceptId);
    if (!concept) return renderStartPanel();
    const model = currentNeighborhood ?? NB.buildNeighborhood(DATA, concept.id, { limit: state.nbLimit });
    const reading = concept.reading;
    const saved = savedConcept(concept.id);
    return `
      <div class="panel-pad panel-compact">
        <div class="panel-kicker">
          <span class="panel-domain" style="--domain-color:var(--domain-${esc(concept.domain)})">${esc(concept.domainLabel)}</span>
          <span>${reading ? "read in context" : "not read in context"}</span>
        </div>
        <h3 class="panel-title">${esc(concept.label)}</h3>
        <p class="panel-def">${esc(concept.definition)}</p>
        <p class="panel-scope">${esc(concept.scope)}</p>

        <div class="action-row">
          <button type="button" class="action-button is-primary" data-act="deal-concept" data-concept="${esc(concept.id)}">Open content</button>
          <button type="button" class="action-button" data-act="toggle-pocket-concept" data-concept="${esc(concept.id)}">${saved ? "Saved to pocket" : "Save"}</button>
        </div>

        <section class="panel-section">
          ${sectionHead("Connections", model.total)}
          ${
            model.total
              ? `<p class="panel-note">${model.shown.length} of ${plural(model.total, "recorded relation")} shown in the neighbourhood. ${model.hiddenCount ? `${model.hiddenCount} more can be expanded.` : "All recorded relations are shown."}</p>`
              : `<p class="empty-copy">No candidate relation is recorded. The ${plural(model.sameSubject.count, "same-subject concept")} below are membership, not relations.</p>`
          }
          ${
            model.hiddenCount
              ? `<button type="button" class="action-button" data-act="expand-neighbourhood">Show ${model.hiddenCount} more connection${model.hiddenCount === 1 ? "" : "s"}</button>`
              : ""
          }
          ${
            model.sameSubject.starters.length
              ? `<div class="same-subject"><p class="mono">Also in ${esc(model.sameSubject.label)}</p><div class="same-subject-list">${model.sameSubject.starters
                  .map(
                    (entry) => `<button type="button" class="branch-chip is-compact" data-act="open-concept" data-concept="${esc(entry.id)}"><span class="branch-top"><span class="branch-arrow">member</span><span class="branch-label">${esc(entry.label)}</span></span></button>`,
                  )
                  .join("")}</div></div>`
              : ""
          }
        </section>

        <details class="panel-details">
          <summary>Evidence and reading</summary>
          ${reading ? whyBlock(reading) : '<p class="empty-copy">No contextual reading was recorded for this concept in this phase. The definition and assertions are candidate material, not verified readings.</p>'}
          <section class="panel-section">${sectionHead("Where to read it", concept.resources.length)}${
            concept.resources.length
              ? resourceList(concept.resources.slice(0, 3))
              : '<p class="empty-copy">No canonical reading route is mapped to this concept yet.</p>'
          }</section>
        </details>

        <details class="panel-details">
          <summary>More ways to use this</summary>
          <div class="action-row">
            <button type="button" class="action-button" data-act="to-compare">Compare</button>
            <button type="button" class="action-button" data-act="to-apply">Apply</button>
            <button type="button" class="action-button" data-act="to-goal">Route</button>
          </div>
          <p class="panel-note">These advanced views keep the same candidate data. The neighbourhood remains the first view.</p>
        </details>

        <details class="panel-details">
          <summary>Coverage</summary>
          <dl class="meta-grid">
            <div><dt>Mapped units</dt><dd>${fmt(concept.unitCount)}</dd></div>
            <div><dt>Primary units</dt><dd>${fmt(concept.primaryUnitCount)}</dd></div>
            <div><dt>Assertions</dt><dd>${fmt(concept.assertionCount)}</dd></div>
            <div><dt>Cross-subject</dt><dd>${fmt(concept.crossDomainAssertionCount)}</dd></div>
            <div><dt>Routes</dt><dd>${fmt(concept.goals.length)}</dd></div>
            <div><dt>Reading</dt><dd>${reading ? "contextual" : "not read"}</dd></div>
          </dl>
        </details>

        <p class="panel-note">Stored direction A → B means A requires B. “Requires first” lists what must come before. Candidate concept · technical review · human pending.</p>
      </div>`;
  };

  const renderContext = () => {
    if (!state.conceptId) ui.contextContent.innerHTML = renderStartPanel();
    else if (state.intent === "compare") ui.contextContent.innerHTML = renderComparePanel();
    else if (state.intent === "apply") ui.contextContent.innerHTML = renderApplyPanel();
    else if (state.intent === "goal") ui.contextContent.innerHTML = renderGoalPanel();
    else ui.contextContent.innerHTML = renderConceptPanel();
    renderPreview();
  };

  /* ---------------------------------------------------------------- selection */
  const updateTransition = () => {
    const concept = conceptById.get(state.conceptId);
    const origin = state.origin;
    let from = "";
    if (origin.source === "card") {
      from = `${origin.editionDate ? shortDate(origin.editionDate) : "Edition"} edition · ${origin.cardTitle || origin.editionTitle || "candidate card"}`;
    } else if (origin.source === "content") {
      from = "From the candidate reading deck";
    } else if (origin.source === "empty") {
      from = `${origin.editionDate ? shortDate(origin.editionDate) : "This request"} · no edition, empty hand`;
    } else if (origin.source === "graph") {
      from = "From the candidate neighbourhood";
    }
    const current = concept
      ? `Your current selection · ${concept.label}`
      : origin.source === "empty"
        ? "No concept selected · subject entrances"
        : "No concept selected · choose a subject entrance";
    ui.transitionFrom.textContent = from;
    ui.transitionFrom.hidden = !from;
    ui.transitionCurrent.textContent = current;
    ui.transitionCurrent.hidden = false;
  };

  const pushThread = (conceptId) => {
    state.thread = [...state.thread.filter((id) => id !== conceptId), conceptId].slice(-12);
    persist();
    renderThread();
  };

  const selectConcept = (conceptId, options = {}) => {
    const concept = conceptById.get(conceptId);
    if (!concept) return false;
    state.conceptId = conceptId;
    if (!options.preserveOrigin && !state.origin.source) {
      state.origin = { source: "graph", editionDate: null, editionTitle: null, cardTitle: null };
    }
    state.nbLimit = options.limit ?? 3;
    previewId = null;
    pushThread(conceptId);
    persist();
    syncUrl();
    renderField();
    renderContext();
    updateTransition();
    renderClosing();
    if (options.scroll) goToScene("knowledge");
    if (options.focusField) {
      focusWhenActive("knowledge", () => {
        const node = ui.fieldNodes.querySelector(".nb-node");
        const primary = ui.contextContent.querySelector(".action-button.is-primary");
        return node ?? primary ?? ui.fieldBack;
      });
    }
    announce(
      `${concept.label}. ${concept.reading ? "Read in context." : "Not read in context."} ${plural(
        concept.prerequisites.length,
        "prerequisite",
      )}, ${plural(concept.dependents.length, "dependent")}.`,
    );
    return true;
  };

  const clearSelection = (options = {}) => {
    state.conceptId = null;
    state.nbLimit = 3;
    previewId = null;
    if (!options.preserveOrigin) {
      state.origin = { source: null, editionDate: null, editionTitle: null, cardTitle: null };
    }
    persist();
    syncUrl();
    renderField();
    renderContext();
    updateTransition();
    renderClosing();
    announce("Subject entrances. No concept selected.");
    if (options.focus) {
      focusWhenActive("knowledge", () => ui.nbEntrance.querySelector(".nb-starter"));
    }
  };

  const setIntent = (intent, options = {}) => {
    if (!INTENTS.includes(intent)) return false;
    state.intent = intent;
    if (options.persist !== false) persist();
    updateModeLabel();
    renderContext();
    syncUrl();
    if (options.scroll) goToScene("knowledge");
    if (options.announce !== false) announce(`${INTENT_LABEL[intent]} view selected.`);
    return true;
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
      return `<div class="panel-pad"><div class="panel-kicker"><span>Compare</span><button type="button" class="text-button" data-act="to-understand">Back</button></div><h3 class="panel-title">No comparison boards yet.</h3><p class="panel-def">No contrast or trade-off assertion survived review into the candidate graph.</p></div>`;
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
        <div class="panel-kicker"><span>Compare</span><button type="button" class="text-button" data-act="to-understand">Back to neighbourhood</button></div>
        <h3 class="panel-title">${esc(board.leftLabel)} <span class="slash">↔</span> ${esc(board.rightLabel)}</h3>
        <p class="panel-def">${esc(board.claim)}</p>
        ${
          concept && !involves
            ? `<p class="panel-note">Selected concept: <strong>${esc(concept.label)}</strong>. No board includes it yet.</p>`
            : ""
        }
        ${board.crossDomain ? '<p class="panel-note">This board crosses subjects. The relation is drawn because the evidence asserts it, not because the words look alike.</p>' : ""}

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
        <div class="panel-kicker"><span class="panel-domain" style="--domain-color:var(--domain-${esc(concept.domain)})">${esc(concept.domainLabel)}</span><button type="button" class="text-button" data-act="to-understand">Back to neighbourhood</button></div>
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
  const routeStepMarkup = (step, selectedId) => {
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
      return `<div class="panel-pad"><div class="panel-kicker"><span>Route</span><button type="button" class="text-button" data-act="to-understand">Back</button></div><h3 class="panel-title">No routes yet.</h3><p class="panel-def">No goal route survived review into the candidate graph.</p></div>`;
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
        <div class="panel-kicker"><span>Reach a goal</span><button type="button" class="text-button" data-act="to-understand">Back to neighbourhood</button></div>
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
          <ol class="route-list">${goal.steps.map((step) => routeStepMarkup(step, selectedStep?.conceptId)).join("")}</ol>
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
    returnFocus: null,
  };

  const deckKeyForConcept = (conceptId) => `concept:${conceptId}`;
  const deckKeyForGoal = (goalId) => `goal:${goalId}`;

  const resolveDeckEntry = (key) =>
    DATA.decks[key] || {
      status: "missing",
      reasonCode: "deck-not-resolved",
      explanation: "No resolved deck is recorded for this request. The Dealer does not invent cards.",
      limitations: ["A missing deck is shown as missing, not filled from a neighbouring date."],
      deck: {
        title: key?.startsWith("daily:") ? "Unresolved daily edition" : "Unresolved deck",
        provenance: { source: "deck resolver", reviewState: "candidate" },
        reason: "No resolved deck is recorded for this request.",
        cards: [],
        capabilitySummary: {},
      },
    };

  const describeDeckKey = (key) => {
    if (!key) return { date: state.date, conceptId: null, goalId: null };
    if (key.startsWith("daily:")) {
      const date = key.slice("daily:".length);
      const edition = editionByDate.get(date);
      return { date, conceptId: edition?.conceptId ?? null, goalId: null };
    }
    if (key.startsWith("concept:")) {
      return { date: state.date, conceptId: key.slice("concept:".length), goalId: null };
    }
    if (key.startsWith("goal:")) {
      const goalId = key.slice("goal:".length);
      const goal = goalById.get(goalId);
      return { date: state.date, conceptId: goal?.steps[0]?.conceptId ?? null, goalId };
    }
    return { date: state.date, conceptId: null, goalId: null };
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
    ui.dealerLocate.textContent = dealerState.cards.length ? "Locate in knowledge" : "Show subject entrances";
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
    const entry = resolveDeckEntry(key);
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
    dealerState.returnFocus = options.returnFocus ?? document.activeElement;
    if (options.cardId) {
      const index = dealerState.cards.findIndex((card) => card.cardId === options.cardId);
      if (index >= 0) dealerState.activeIndex = index;
    }
    renderDealer();
    lockStage();
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
    const returnFocus = options.returnFocus ?? dealerState.returnFocus;
    ui.dealerBackdrop.hidden = true;
    document.body.classList.remove("is-dialog-open");
    unlockStage();
    syncUrl();
    if (options.returnFocus !== false) {
      returnFocus?.focus?.({ preventScroll: true });
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

  const openDealerDate = (date) => {
    if (!dayByDate.has(date)) return false;
    selectDate(date, { tween: false });
    return openDealer(`daily:${date}`);
  };

  const jumpToLatest = (options = {}) => {
    if (!latestEditionDate) return false;
    if (options.inDealer) return openDealerDate(latestEditionDate);
    return selectDate(latestEditionDate, { open: true });
  };

  const dealerLocate = (conceptId) => {
    const key = dealerState.key;
    const card = activeCard();
    const actionTarget = card?.allowedActions?.find((action) => action.type === "locate-in-knowledge")?.targetId;
    const edition = key?.startsWith("daily:") ? editionByDate.get(key.slice("daily:".length)) : null;
    let target = conceptId || actionTarget || null;
    if (!target && key?.startsWith("concept:")) target = key.slice("concept:".length);
    if (!target && key?.startsWith("goal:")) target = goalById.get(key.slice("goal:".length))?.steps?.[0]?.conceptId ?? null;
    if (!target && edition && dealerState.cards.length) target = edition.conceptId;

    const origin = {
      source: target ? (edition ? "card" : "content") : "empty",
      editionDate: edition?.date ?? (key?.startsWith("daily:") ? key.slice("daily:".length) : null),
      editionTitle: edition?.title ?? null,
      cardTitle: dealerState.cards.length ? card?.title ?? edition?.cardTitle ?? null : null,
    };

    closeDealer({ returnFocus: false });
    state.origin = origin;
    if (target && conceptById.has(target)) {
      selectConcept(target, { scroll: false, focusField: true, preserveOrigin: true });
      announce(`Located ${conceptById.get(target).label} in the neighbourhood.`);
    } else {
      clearSelection({ focus: false, preserveOrigin: true });
      announce("This deck has no card to locate. Showing subject entrances; no unrelated concept was chosen.");
    }
    updateTransition();
    goToScene("knowledge");
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
      selectConcept(entry.conceptId, { scroll: false, focusField: true });
      goToScene("knowledge");
    } else if (entry.kind === "comparison" && comparisonById.has(entry.comparisonId)) {
      const board = comparisonById.get(entry.comparisonId);
      state.comparisonId = board.id;
      state.conceptId = board.leftId;
      closePocket(false);
      setIntent("compare");
      selectConcept(board.leftId, { scroll: false, focusField: true });
      goToScene("knowledge");
    } else if (entry.kind === "goal" && goalById.has(entry.goalId)) {
      closePocket(false);
      state.goalId = entry.goalId;
      setIntent("goal");
      goToScene("knowledge");
    } else if (entry.kind === "card" && (DATA.decks[entry.deckKey] || entry.deckKey)) {
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
      ui.closingIdea.textContent = `${concept.label} is still candidate material. The neighbourhood can show its definition, its claimed relations and its coverage gaps, but it cannot turn an unread unit into a verified explanation.`;
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
    ui.closingLedger.innerHTML = rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("");
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
      <p>A standalone, no-build review prototype. It reads a generated candidate payload and renders a daily-edition timeline, a daily Dealer, a local knowledge neighbourhood and a closing ledger. It is not integrated into the application, not deployed and not published.</p>
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

  /* ---------------------------------------------------------------- url + misc */
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

  const openResource = (href, label) => {
    if (!href) {
      showToast("No resource route is recorded for this card.");
      return;
    }
    showToast(`${label ?? "Resource"} · ${href} — application route, not served by this isolated prototype.`);
    announce(`Resource route ${href}. This isolated prototype does not serve application routes.`);
  };

  const toggleSelfReport = (conceptId) => {
    if (!conceptById.has(conceptId)) return;
    if (state.selfReported[conceptId]) delete state.selfReported[conceptId];
    else state.selfReported[conceptId] = true;
    persist();
    renderContext();
    announce(state.selfReported[conceptId] ? "Marked as already known. This is a self-report, not mastery." : "Self-report removed.");
  };

  const startRoute = (goalId) => {
    const goal = goalById.get(goalId);
    if (!goal?.steps.length) return;
    state.goalId = goalId;
    setIntent("goal");
    const first = goal.steps[0];
    selectConcept(first.conceptId, { scroll: false, focusField: true });
    goToScene("knowledge");
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
    meta: `${board.relationLabel} · ${board.crossDomain ? "cross-subject" : "same subject"}`,
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

  /* ------------------------------------------------------------------- actions */
  const handleAction = (trigger) => {
    const act = trigger.dataset.act;
    const conceptId = trigger.dataset.concept;
    switch (act) {
      case "clear-search":
        clearSearch();
        return;
      case "open-concept":
        if (conceptId) selectConcept(conceptId, { scroll: false, focusField: false });
        return;
      case "explore-concept":
        if (conceptId) selectConcept(conceptId, { scroll: false, focusField: true });
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
      case "deal-date":
        if (trigger.dataset.date) openDealerDate(trigger.dataset.date);
        return;
      case "deal-goal":
        if (trigger.dataset.goal) openDealer(deckKeyForGoal(trigger.dataset.goal));
        return;
      case "to-compare":
        setIntent("compare");
        return;
      case "to-apply":
        setIntent("apply");
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
        if (state.intent === "goal") renderContext();
        else setIntent("goal");
        announce(`${goal.title} selected.`);
        return;
      }
      case "toggle-self":
        toggleSelfReport(conceptId);
        return;
      case "start-route":
        startRoute(trigger.dataset.goal);
        return;
      case "expand-neighbourhood":
        state.nbLimit = Math.max(8, state.nbLimit);
        renderField();
        renderContext();
        announce("All recorded connections shown in the neighbourhood.");
        return;
      case "open-table":
        ui.fieldFallback.open = true;
        ui.fieldFallback.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
        ui.fieldFallback.querySelector("summary")?.focus({ preventScroll: true });
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

  /* -------------------------------------------------------------------- wiring */
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

  const bindField = () => {
    ui.fieldBack.addEventListener("click", () => clearSelection({ focus: true }));

    ui.fieldNodes.addEventListener("pointerover", (event) => {
      const node = event.target.closest(".nb-node");
      if (node) setPreview(node.dataset.concept);
    });
    const previewHolds = (target) => Boolean(target?.closest?.("#branch-preview"));
    ui.fieldNodes.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget?.closest?.(".nb-node") && !previewHolds(event.relatedTarget)) setPreview(null);
    });
    ui.fieldNodes.addEventListener("focusin", (event) => {
      const node = event.target.closest(".nb-node");
      if (node) setPreview(node.dataset.concept);
    });
    ui.fieldNodes.addEventListener("focusout", (event) => {
      if (!ui.fieldNodes.contains(event.relatedTarget) && !previewHolds(event.relatedTarget)) setPreview(null);
    });
    ui.branchPreview.addEventListener("pointerleave", (event) => {
      if (!event.relatedTarget?.closest?.(".nb-node")) setPreview(null);
    });
    ui.branchPreview.addEventListener("focusout", (event) => {
      if (!ui.fieldNodes.contains(event.relatedTarget) && !previewHolds(event.relatedTarget)) setPreview(null);
    });
    ui.fieldNodes.addEventListener("keydown", (event) => {
      const node = event.target.closest(".nb-node");
      if (!node) return;
      const nodes = [...ui.fieldNodes.querySelectorAll(".nb-node")];
      const index = nodes.indexOf(node);
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        nodes[(index + 1) % nodes.length]?.focus();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        nodes[(index - 1 + nodes.length) % nodes.length]?.focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        clearSelection({ focus: true });
      }
    });

    ui.fieldSearch.addEventListener("input", () => runSearch(ui.fieldSearch.value));
    ui.fieldSearch.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const first = conceptById.get(searchOrder[0]);
        if (first) {
          event.preventDefault();
          selectConcept(first.id, { scroll: false, focusField: true });
          ui.searchResults.hidden = true;
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

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => {
        if (state.conceptId) placeNodes();
      });
      observer.observe(ui.fieldCanvas);
    }
  };

  const bindChrome = () => {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-act]");
      if (trigger) handleAction(trigger);
    });

    for (const link of document.querySelectorAll("[data-scene-link]")) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        goToScene(link.dataset.sceneLink);
      });
    }

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
    ui.dealerBackTimeline.addEventListener("click", () => closeDealer());
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
      if (!dayByDate.has(date)) return;
      selectDate(date, { tween: false });
      openDealer(`daily:${date}`);
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
        } else if (ui.fieldSearch.value) {
          event.preventDefault();
          clearSearch();
        } else if (state.conceptId && journey.scene === "knowledge") {
          event.preventDefault();
          clearSelection({ focus: true });
        }
        return;
      }
      if (event.key === "Tab") {
        if (!ui.dealerBackdrop.hidden) trapFocus(ui.dealer, event);
        else if (!ui.aboutBackdrop.hidden) trapFocus(ui.about, event);
        return;
      }
      if (
        event.key === "/" &&
        !isTyping(event.target) &&
        ui.dealerBackdrop.hidden &&
        ui.aboutBackdrop.hidden &&
        ui.pocketPanel.hidden
      ) {
        event.preventDefault();
        if (journey.scene !== "knowledge" && !isStatic()) goToScene("knowledge");
        focusWhenActive("knowledge", () => ui.fieldSearch);
      }
    });
  };

  const onResize = () => {
    layoutTimeline();
    if (state.conceptId) window.requestAnimationFrame(placeNodes);
    requestProgress();
  };

  const onModeChange = () => {
    syncProgress();
    layoutTimeline();
    if (state.conceptId) window.requestAnimationFrame(placeNodes);
  };

  /* --------------------------------------------------------------------- boot */
  const init = () => {
    applyTheme();
    renderTimelineCards();
    renderRuler();
    renderTimelineFacts();
    layoutTimeline();
    renderField();
    renderContext();
    renderThread();
    renderPocket();
    renderClosing();
    updateTransition();
    bindTimeline();
    bindField();
    bindChrome();
    ui.footBuild.textContent = `${DATA.graphBuildId} · ${DATA.registryVersion} · ${DATA.generatedAt}`;
    ui.fieldSearch.value = "";
    runSearch("");

    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    staticLayout.addEventListener("change", onModeChange);

    syncProgress();

    window.requestAnimationFrame(() => {
      syncProgress();
      const requestedConcept = params.get("concept");
      if (requestedConcept && conceptById.has(requestedConcept)) {
        state.origin = { source: "graph", editionDate: null, editionTitle: null, cardTitle: null };
        updateTransition();
        goToScene("knowledge", { instant: true });
        ui.knowledgeScene.querySelector("#knowledge-title")?.focus({ preventScroll: true });
      } else if (location.hash === "#scene-knowledge") {
        goToScene("knowledge", { instant: true });
      } else if (location.hash === "#scene-closing") {
        goToScene("closing", { instant: true });
      }
      const requestedDealer = params.get("dealer");
      if (requestedDealer) openDealer(requestedDealer);
    });

    if (params.get("date") && dayByDate.has(params.get("date"))) {
      announce(`${longDate(params.get("date"))} opened from the URL.`);
    }
  };

  window.__ATLAS_STAGE__ = {
    version: "3.2.0-recovery",
    data: DATA,
    getState: () => ({
      theme: state.theme,
      intent: state.intent,
      date: state.date,
      conceptId: state.conceptId,
      comparisonId: state.comparisonId,
      goalId: state.goalId,
      nbLimit: state.nbLimit,
      origin: { ...state.origin },
      progress: journey.progress,
      scene: journey.scene,
      staticLayout: isStatic(),
      locked: journey.locked,
      pocket: state.pocket.map((entry) => ({ ...entry })),
      thread: [...state.thread],
      selfReported: { ...state.selfReported },
      dealer: ui.dealerBackdrop.hidden ? null : dealerState.key,
    }),
    getProgress: () => journey.progress,
    getScene: () => journey.scene,
    getTimeline: () => TIMELINE.map((entry) => ({ ...entry })),
    getTimelineState: () => ({
      position: tl.position,
      selected: state.date,
      cards: [...ui.timelineTrack.querySelectorAll(".tl-card")].map((card) => ({
        date: card.dataset.date,
        x: card.style.getPropertyValue("--x"),
        scale: card.style.getPropertyValue("--scale"),
        opacity: card.style.getPropertyValue("--opacity"),
        current: card.getAttribute("aria-current"),
      })),
    }),
    getNeighborhood: () => (currentNeighborhood ? JSON.parse(JSON.stringify(currentNeighborhood)) : null),
    getVisibleLabels: () => [...document.querySelectorAll(".nb-node-label")].map((node) => node.textContent),
    selectConcept,
    selectDate,
    setIntent,
    goToScene,
    clearSelection,
    openDealer,
    openDealerDate,
    closeDealer,
    openPocket,
    closePocket,
    openAbout,
    closeAbout,
    runSearch,
    showToast,
  };

  init();
})();
