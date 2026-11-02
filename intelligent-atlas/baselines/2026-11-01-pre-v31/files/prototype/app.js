/* Hansa Intelligent Atlas — standalone editorial-review prototype.
 *
 * No framework, no network, no build step. The page reads two generated
 * payloads:
 *   window.ATLAS_DATA   bounded candidate review data (59 concepts / 46 edges)
 *   window.ATLAS_PUBLIC fail-closed public projection (0 published concepts)
 *
 * Editorial review and public projection are deliberately separate. Public
 * mode never reads candidate concepts, mappings, assertions or goals from
 * ATLAS_DATA for the Atlas; only the editorial insight previews remain visible.
 */
(() => {
  "use strict";

  const DATA = window.ATLAS_DATA;
  const PUBLIC = window.ATLAS_PUBLIC;
  if (!DATA) {
    document.body.textContent =
      "The generated review payload is missing. Run intelligent-atlas/tools/build-prototype-data.mjs, then reload.";
    return;
  }

  const TODAY = "2026-10-31";
  const LATEST_FALLBACK = "2026-10-26";
  const DATE_START = "2026-10-18";
  const DATE_END = "2026-10-31";
  const STORAGE_KEY = "hansa-intelligent-atlas-prototype-state-v1";
  const SCROLL_KEY = "hansa-intelligent-atlas-prototype-scroll-v1";
  const THEME_KEY = "hansa-intelligent-atlas-theme-v1";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const NUMBER = new Intl.NumberFormat("en-US");

  const WEEKDAY_SHORT = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
  const WEEKDAY_LONG = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
  const MONTH_SHORT = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
  const MONTH_LONG = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });

  const RELATION_LABEL = {
    requires_understanding_of: "requires",
    part_of_mechanism: "part of",
    related_in_decision: "related in decision",
    contrasts_with: "contrasts",
    complements: "complements",
    enables: "enables",
    tradeoff_with: "trade-off",
  };

  const LENSES = [
    { id: "all", label: "All" },
    { id: "direct", label: "Direct" },
    { id: "inferred", label: "Inferred" },
    { id: "cross", label: "Cross-domain" },
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrowLayout = window.matchMedia("(max-width: 900px)");

  // ------------------------------------------------------------------ helpers

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function prefersReduced() {
    return reducedMotion.matches;
  }

  function isStacked() {
    return narrowLayout.matches || prefersReduced();
  }

  function parseDate(iso) {
    return new Date(`${iso}T00:00:00Z`);
  }

  function formatLong(iso) {
    const d = parseDate(iso);
    return `${WEEKDAY_LONG.format(d)} ${d.getUTCDate()} ${MONTH_LONG.format(d)} ${d.getUTCFullYear()}`;
  }

  function formatShort(iso) {
    const d = parseDate(iso);
    return `${d.getUTCDate()} ${MONTH_SHORT.format(d)} ${d.getUTCFullYear()}`;
  }

  function formatDay(iso) {
    return String(parseDate(iso).getUTCDate());
  }

  function weekdayShort(iso) {
    return WEEKDAY_SHORT.format(parseDate(iso));
  }

  function monthShort(iso) {
    return MONTH_SHORT.format(parseDate(iso));
  }

  function dateRange(startIso, endIso) {
    const out = [];
    const cursor = parseDate(startIso);
    const end = parseDate(endIso);
    while (cursor <= end) {
      out.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return out;
  }

  function humanizeToken(value) {
    return String(value || "")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function shortConceptId(id) {
    const parts = String(id || "").split(":");
    return parts.length > 1 ? parts.slice(1).join(":") : String(id || "");
  }

  function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value === undefined || value === null || value === false) continue;
        if (key === "class") {
          node.className = value;
        } else if (key === "text") {
          node.textContent = String(value);
        } else if (key === "html") {
          node.innerHTML = value;
        } else if (key === "style") {
          for (const [prop, val] of Object.entries(value)) {
            if (val === undefined || val === null) continue;
            if (prop.startsWith("--")) node.style.setProperty(prop, String(val));
            else node.style[prop] = String(val);
          }
        } else if (key === "dataset") {
          for (const [dataKey, dataValue] of Object.entries(value)) {
            if (dataValue === undefined || dataValue === null) continue;
            node.dataset[dataKey] = String(dataValue);
          }
        } else if (key === "attrs") {
          for (const [attr, attrValue] of Object.entries(value)) {
            if (attrValue === undefined || attrValue === null || attrValue === false) continue;
            node.setAttribute(attr, attrValue === true ? "" : String(attrValue));
          }
        } else if (key.startsWith("on") && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          node.setAttribute(key, value === true ? "" : String(value));
        }
      }
    }
    appendChildren(node, children);
    return node;
  }

  function appendChildren(node, children) {
    for (const child of children.flat(Infinity)) {
      if (child === undefined || child === null || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
  }

  function s(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      node.setAttribute(key, String(value));
    }
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function option(value, label) {
    return h("option", { attrs: { value }, text: label });
  }

  function button(label, className, onClick, attrs = {}) {
    return h("button", {
      class: className,
      text: label,
      attrs: { type: "button", ...attrs },
      onclick: onClick,
    });
  }

  function focusElement(node) {
    if (!node || typeof node.focus !== "function") return;
    requestAnimationFrame(() => {
      try {
        node.focus({ preventScroll: true });
      } catch {
        node.focus();
      }
    });
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      dom.toast.classList.remove("is-visible");
    }, 3200);
  }

  function copyText(value) {
    if (!value) return;
    const done = () => showToast("Route copied to the clipboard.");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy(value, done));
      return;
    }
    fallbackCopy(value, done);
  }

  function fallbackCopy(value, done) {
    const area = h("textarea", { style: { position: "fixed", opacity: "0", top: "0" } });
    area.value = value;
    document.body.append(area);
    area.focus();
    area.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      showToast("Copy is unavailable in this browser. The route is shown above.");
    }
    area.remove();
  }

  function readSession(key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeSession(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Private mode / quota. The prototype still works without persistence. */
    }
  }

  // -------------------------------------------------------------------- state

  const dates = dateRange(DATE_START, DATE_END);
  const editionDates = DATA.insights
    .map((insight) => insight.date)
    .slice()
    .sort();
  const latestEdition = editionDates[editionDates.length - 1] || LATEST_FALLBACK;

  const conceptById = new Map(DATA.concepts.map((concept) => [concept.id, concept]));
  const insightByDate = new Map(DATA.insights.map((insight) => [insight.date, insight]));
  const edgeById = new Map(DATA.edges.map((edge) => [edge.id, edge]));
  const goalById = new Map(DATA.goals.map((goal) => [goal.goalId, goal]));
  const constellationById = new Map(DATA.constellations.map((item) => [item.id, item]));

  const edgesByConcept = new Map();
  for (const concept of DATA.concepts) edgesByConcept.set(concept.id, []);
  for (const edge of DATA.edges) {
    if (edgesByConcept.has(edge.from)) edgesByConcept.get(edge.from).push(edge);
    if (edgesByConcept.has(edge.to)) edgesByConcept.get(edge.to).push(edge);
  }

  const seedConstellation = DATA.constellations[0]?.id || "A";
  const seedConcept =
    DATA.constellations[0]?.seedConceptId || DATA.concepts[0]?.id || null;

  const state = {
    mode: "review",
    selectedDate: TODAY,
    constellation: seedConstellation,
    selectedConceptId: seedConcept,
    showAll: false,
    lens: "all",
    view: "graph",
    goalId: null,
    goalStep: 0,
    detail: seedConcept ? { type: "concept", id: seedConcept } : null,
    activeEdgeId: null,
    returnContext: null,
    dealerDate: latestEdition,
    editionStates: {},
    registerTab: "ambiguities",
    activeScene: "timeline",
    progress: 0,
  };

  const dom = {};

  // ------------------------------------------------------------------ indexes

  function editionState(date) {
    if (!state.editionStates[date]) {
      state.editionStates[date] = { view: "card", cardIndex: 0 };
    }
    return state.editionStates[date];
  }

  function selectedConcept() {
    return conceptById.get(state.selectedConceptId) || null;
  }

  function selectedInsight() {
    return insightByDate.get(state.selectedDate) || null;
  }

  function conceptLabel(id) {
    return conceptById.get(id)?.label || shortConceptId(id);
  }

  function goalRoute(goalId) {
    return goalId ? goalById.get(goalId) || null : null;
  }

  function routeInfo(goal) {
    if (!goal) return { ids: new Set(), numbers: new Map() };
    const ids = new Set();
    const numbers = new Map();
    for (const step of goal.steps) {
      ids.add(step.conceptId);
      numbers.set(step.conceptId, step.step);
    }
    return { ids, numbers };
  }

  // --------------------------------------------------------------- region data

  const regionCache = new Map();

  function getRegion(regionId) {
    if (regionCache.has(regionId)) return regionCache.get(regionId);
    const constellation = constellationById.get(regionId) || DATA.constellations[0];
    const concepts = DATA.concepts.filter((concept) => concept.constellation === constellation.id);
    const ids = new Set(concepts.map((concept) => concept.id));
    const edges = DATA.edges.filter((edge) => ids.has(edge.from) && ids.has(edge.to));
    const byId = new Map(concepts.map((concept) => [concept.id, concept]));
    const adjacency = new Map(concepts.map((concept) => [concept.id, new Set()]));
    for (const edge of edges) {
      adjacency.get(edge.from)?.add(edge.to);
      adjacency.get(edge.to)?.add(edge.from);
    }
    const seen = new Set();
    const components = [];
    for (const concept of concepts) {
      if (seen.has(concept.id)) continue;
      const stack = [concept.id];
      const componentIds = [];
      seen.add(concept.id);
      while (stack.length) {
        const id = stack.pop();
        componentIds.push(id);
        for (const neighbour of adjacency.get(id) || []) {
          if (!seen.has(neighbour)) {
            seen.add(neighbour);
            stack.push(neighbour);
          }
        }
      }
      const componentIdSet = new Set(componentIds);
      const componentEdges = edges.filter(
        (edge) => componentIdSet.has(edge.from) && componentIdSet.has(edge.to),
      );
      const rootId = componentIds.includes(constellation.seedConceptId)
        ? constellation.seedConceptId
        : componentIds.reduce((best, id) => {
            const degree = adjacency.get(id)?.size || 0;
            const bestDegree = adjacency.get(best)?.size || 0;
            return degree > bestDegree ? id : best;
          }, componentIds[0]);
      components.push({
        id: `${constellation.id}:${components.length + 1}`,
        conceptIds: componentIds,
        edges: componentEdges,
        rootId,
        label: byId.get(rootId)?.label || `Island ${components.length + 1}`,
        size: componentIds.length,
      });
    }
    components.sort((a, b) => b.size - a.size || a.label.localeCompare(b.label));
    const data = {
      regionId: constellation.id,
      constellation,
      concepts,
      edges,
      byId,
      adjacency,
      components,
    };
    regionCache.set(regionId, data);
    return data;
  }

  function selectedComponent(region) {
    return (
      region.components.find((component) => component.conceptIds.includes(state.selectedConceptId)) ||
      region.components.find((component) => component.conceptIds.includes(region.constellation.seedConceptId)) ||
      region.components[0] ||
      null
    );
  }

  function edgeMatchesLens(edge) {
    if (state.lens === "direct") return edge.supportKind === "direct";
    if (state.lens === "inferred") return edge.supportKind === "inferred";
    if (state.lens === "cross") return Boolean(edge.crossDomain);
    return true;
  }

  // ------------------------------------------------------------- persistence

  let saveScrollTimer = 0;

  function saveState() {
    writeSession(STORAGE_KEY, {
      mode: state.mode,
      selectedDate: state.selectedDate,
      constellation: state.constellation,
      selectedConceptId: state.selectedConceptId,
      showAll: state.showAll,
      lens: state.lens,
      view: state.view,
      goalId: state.goalId,
      goalStep: state.goalStep,
      detail: state.detail,
      activeEdgeId: state.activeEdgeId,
      returnContext: state.returnContext,
      dealerDate: state.dealerDate,
      editionStates: state.editionStates,
      registerTab: state.registerTab,
    });
  }

  function restoreState() {
    const saved = readSession(STORAGE_KEY);
    if (saved && typeof saved === "object") {
      if (saved.mode === "public" || saved.mode === "review") state.mode = saved.mode;
      if (dates.includes(saved.selectedDate)) state.selectedDate = saved.selectedDate;
      if (constellationById.has(saved.constellation)) state.constellation = saved.constellation;
      if (conceptById.has(saved.selectedConceptId)) state.selectedConceptId = saved.selectedConceptId;
      if (typeof saved.showAll === "boolean") state.showAll = saved.showAll;
      if (LENSES.some((lens) => lens.id === saved.lens)) state.lens = saved.lens;
      if (saved.view === "graph" || saved.view === "list") state.view = saved.view;
      if (saved.goalId && goalById.has(saved.goalId)) state.goalId = saved.goalId;
      if (Number.isInteger(saved.goalStep)) state.goalStep = saved.goalStep;
      if (saved.detail && typeof saved.detail === "object") state.detail = saved.detail;
      if (saved.activeEdgeId && edgeById.has(saved.activeEdgeId)) state.activeEdgeId = saved.activeEdgeId;
      if (saved.returnContext && typeof saved.returnContext === "object") {
        state.returnContext = saved.returnContext;
        if (!state.returnContext.origin) state.returnContext.origin = "timeline";
        if (!state.returnContext.returnLabel && dates.includes(state.returnContext.date)) {
          state.returnContext.returnLabel = `Return to ${formatShort(state.returnContext.date)} edition`;
        }
      }
      if (editionDates.includes(saved.dealerDate)) state.dealerDate = saved.dealerDate;
      if (saved.editionStates && typeof saved.editionStates === "object") {
        state.editionStates = saved.editionStates;
      }
      if (saved.registerTab === "contradictions" || saved.registerTab === "ambiguities") {
        state.registerTab = saved.registerTab;
      }
    }

    const concept = selectedConcept();
    if (concept && concept.constellation !== state.constellation) {
      state.constellation = concept.constellation;
    }
    if (!concept && state.detail?.type === "concept") state.detail = null;
    if (state.detail?.type === "edge" && !edgeById.has(state.detail.id)) {
      state.detail = { type: "concept", id: state.selectedConceptId };
    }
    if (state.detail?.type === "goal" && !goalById.has(state.detail.id)) {
      state.detail = { type: "concept", id: state.selectedConceptId };
    }
    if (state.detail?.type === "resource" && !state.detail.resource) {
      state.detail = { type: "concept", id: state.selectedConceptId };
    }
    if (state.mode === "public" && state.view === "list") state.view = "graph";

    const theme = localStorage.getItem(THEME_KEY);
    const initialTheme =
      theme === "dark" || theme === "light"
        ? theme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.dataset.theme = initialTheme;
    document.body.dataset.mode = state.mode;
  }

  function saveScroll() {
    window.clearTimeout(saveScrollTimer);
    saveScrollTimer = window.setTimeout(() => {
      writeSession(SCROLL_KEY, {
        progress: state.progress,
        scrollY: window.scrollY,
        stacked: isStacked(),
      });
    }, 160);
  }

  // --------------------------------------------------------------- timeline UI

  const timeline = {
    cards: [],
    cableGroups: [],
    rulerTicks: [],
    position: Math.max(0, dates.indexOf(state.selectedDate)),
    raf: 0,
    geometry: null,
    drag: null,
    suppressClickUntil: 0,
  };

  function timelineGeometry(width) {
    const cardWidth = Math.min(190, width * (width < 640 ? 0.58 : 0.36));
    const gap = clamp(cardWidth * 0.22, 40, 72);
    const sideScale = 0.72;
    const step = cardWidth * sideScale + gap;
    const near = (cardWidth * (1 + sideScale)) / 2 + gap;
    const cardHeight = width < 640 ? 196 : 212;
    return { cardWidth, cardHeight, gap, step, near, sideScale };
  }

  function cardX(offset, geometry) {
    const a = Math.abs(offset);
    const value = a <= 1 ? a * geometry.near : geometry.near + (a - 1) * geometry.step;
    return Math.sign(offset) * value;
  }

  function cardScale(offset) {
    return 1 - (1 - 0.72) * Math.min(Math.abs(offset), 1);
  }

  function buildTimeline() {
    clear(dom.timelineTrack);
    timeline.cards = [];

    for (const [index, date] of dates.entries()) {
      const insight = insightByDate.get(date);
      const editionIndex = editionDates.indexOf(date) + 1;
      const latest = date === latestEdition;
      const today = date === TODAY;

      const card = h("li", {
        class: "timeline-card",
        dataset: {
          date,
          index: String(index),
          empty: insight ? "false" : "true",
          latest: latest ? "true" : "false",
          future: "false",
        },
      });
      card.style.transition = "none";

      const cardButton = h("button", {
        class: "timeline-card-button",
        attrs: { type: "button" },
        onclick: () => onTimelineCardActivate(index),
      });
      cardButton.addEventListener("keydown", (event) => onTimelineKeydown(event, index));

      cardButton.append(
        h(
          "span",
          { class: "card-date-row" },
          h("span", { class: "card-weekday", text: weekdayShort(date) }),
          h("span", { class: "card-index", text: insight ? `E${editionIndex}` : "—" }),
        ),
        h("span", { class: "card-day", text: formatDay(date) }),
        h("span", { class: "card-month", text: monthShort(date) }),
        h("span", { class: "card-title", text: insight ? insight.cardTitle : "No edition" }),
        h(
          "span",
          { class: "card-stack" },
          ...(insight ? [1] : [1, 2, 3]).map(() => h("span")),
        ),
        h(
          "span",
          { class: "card-status" },
          h("span", { class: "status-mark" }),
          h("span", { text: insight ? "1 card · technical review" : today ? "today · no edition" : "no edition" }),
        ),
      );

      card.append(cardButton);
      dom.timelineTrack.append(card);
      timeline.cards.push({ date, index, insight, latest, today, card, cardButton });
    }

    // Cables: four lines per card, exactly as the beUI timeline grammar.
    clear(dom.timelineCables);
    timeline.cableGroups = timeline.cards.map((entry) => {
      const group = s("g", { "data-card": String(entry.index) });
      const lines = [0, 1, 2, 3].map(() => s("line", { x1: 0, y1: 0, x2: 0, y2: 0 }));
      for (const line of lines) group.append(line);
      dom.timelineCables.append(group);
      return { group, lines };
    });

    // Ruler ticks: five per gap, middle one taller.
    clear(dom.timelineRuler);
    timeline.rulerTicks = [];
    for (let gapIndex = 0; gapIndex < dates.length - 1; gapIndex += 1) {
      for (let tick = 0; tick < 5; tick += 1) {
        const el = h("span", {
          class: `ruler-tick${tick === 2 ? " is-tall" : ""}`,
        });
        dom.timelineRuler.append(el);
        timeline.rulerTicks.push({ gapIndex, tick, el });
      }
    }
    dom.timelineRuler.append(
      h("span", { class: "ruler-caption start", text: `${formatDay(dates[0])} ${monthShort(dates[0])}` }),
      h("span", {
        class: "ruler-caption end",
        text: `${formatDay(dates[dates.length - 1])} ${monthShort(dates[dates.length - 1])}`,
      }),
    );

    updateTimelineSelection();
    resizeTimeline();
  }

  function resizeTimeline() {
    const width = dom.timelineStage.clientWidth || 800;
    const height = dom.timelineStage.clientHeight || 320;
    timeline.geometry = timelineGeometry(width);
    dom.timelineCables.setAttribute("viewBox", `0 0 ${width} ${height}`);
    dom.timelineCables.setAttribute("preserveAspectRatio", "none");
    renderTimelinePosition(timeline.position, { commit: false });
  }

  function renderTimelinePosition(position, options = {}) {
    const width = dom.timelineStage.clientWidth || 800;
    const height = dom.timelineStage.clientHeight || 320;
    const geometry = timeline.geometry || timelineGeometry(width);

    for (const entry of timeline.cards) {
      const offset = entry.index - position;
      const x = cardX(offset, geometry);
      const scale = cardScale(offset);
      const z = 100 - Math.round(Math.abs(offset) * 10);
      entry.card.style.setProperty("--x", `${x.toFixed(2)}px`);
      entry.card.style.setProperty("--s", scale.toFixed(3));
      entry.card.style.setProperty("--z", String(z));
      entry.card.style.setProperty("--card-w", `${geometry.cardWidth.toFixed(2)}px`);
      entry.card.style.setProperty("--card-h", `${geometry.cardHeight}px`);
      entry.card.style.opacity = String(
        clamp(1 - 0.42 * Math.min(Math.abs(offset), 1), 0.32, 1),
      );
    }

    // Cables only reach the centered card and its immediate neighbours.
    for (const [index, cable] of timeline.cableGroups.entries()) {
      const offset = index - position;
      const opacity = clamp((1.6 - Math.abs(offset)) / 0.6, 0, 1);
      cable.group.setAttribute("opacity", opacity.toFixed(3));
      if (opacity <= 0.001) continue;
      const x = width / 2 + cardX(offset, geometry);
      const reach = (geometry.cardWidth / 2) * cardScale(offset) * 0.8;
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

    // Gap ticks track the actual gap between two adjacent cards.
    for (const tick of timeline.rulerTicks) {
      const offsetA = tick.gapIndex - position;
      const offsetB = tick.gapIndex + 1 - position;
      const right = cardX(offsetA, geometry) + (geometry.cardWidth * cardScale(offsetA)) / 2;
      const left = cardX(offsetB, geometry) - (geometry.cardWidth * cardScale(offsetB)) / 2;
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

    if (options.commit !== false) {
      const nearest = clamp(Math.round(position), 0, dates.length - 1);
      if (dates[nearest] !== state.selectedDate) setSelectedDate(dates[nearest]);
    }
  }

  function setSelectedDate(date) {
    if (!dates.includes(date) || state.selectedDate === date) return;
    state.selectedDate = date;
    updateTimelineSelection();
    saveState();
  }

  function updateTimelineSelection() {
    const selectedIndex = Math.max(0, dates.indexOf(state.selectedDate));
    for (const entry of timeline.cards) {
      const active = entry.index === selectedIndex;
      entry.card.dataset.active = active ? "true" : "false";
      entry.cardButton.tabIndex = active ? 0 : -1;
      if (active) entry.cardButton.setAttribute("aria-current", "date");
      else entry.cardButton.removeAttribute("aria-current");
      entry.cardButton.setAttribute("aria-label", timelineCardLabel(entry, active));
    }

    dom.focusLabel.textContent =
      state.selectedDate === TODAY
        ? "TODAY"
        : state.selectedDate === latestEdition
          ? "LATEST EDITION"
          : insightByDate.has(state.selectedDate)
            ? "EDITION"
            : "NO EDITION";

    dom.timelinePrev.disabled = selectedIndex <= 0;
    dom.timelineNext.disabled = selectedIndex >= dates.length - 1;
    renderPeek();
    updateOpenEditionButton();
    renderTimelineStatus();
  }

  function timelineCardLabel(entry, active) {
    const parts = [formatLong(entry.date)];
    if (entry.today) parts.push("today");
    if (entry.latest) parts.push("latest edition");
    if (entry.insight) {
      parts.push(`1 card, ${entry.insight.cardTitle}`);
      if (active) parts.push("activate again to open the edition");
    } else {
      parts.push("no edition");
    }
    return parts.join(", ") + ".";
  }

  function updateOpenEditionButton() {
    const insight = selectedInsight();
    if (insight) {
      dom.openEdition.textContent = "Open edition";
      dom.openEdition.disabled = false;
      dom.openEdition.setAttribute(
        "aria-label",
        `Open the ${formatShort(state.selectedDate)} edition`,
      );
    } else {
      dom.openEdition.textContent = `Open ${formatShort(latestEdition)} edition`;
      dom.openEdition.disabled = false;
      dom.openEdition.setAttribute(
        "aria-label",
        `No edition on ${formatShort(state.selectedDate)}. Open the latest edition, ${formatShort(latestEdition)}.`,
      );
    }
  }

  function renderPeek() {
    clear(dom.editionPeek);
    const insight = selectedInsight();
    dom.editionPeek.append(
      h(
        "p",
        { class: "peek-label" },
        h("span", { text: "Selected moment" }),
        h("strong", { text: formatLong(state.selectedDate) }),
      ),
    );

    if (insight) {
      const cards = h("div", { class: "peek-cards" });
      cards.append(
        h(
          "div",
          { class: "peek-card" },
          h("span", { text: "01" }),
          h("strong", { text: insight.cardTitle }),
        ),
      );
      dom.editionPeek.append(
        cards,
        h(
          "p",
          { class: "peek-note" },
          `Source-checked ${formatShort(insight.checkedAt)} · `,
          h("strong", {
            text:
              state.mode === "public"
                ? "editorial preview, not published"
                : "human publication review pending",
          }),
          ".",
        ),
      );
      return;
    }

    dom.editionPeek.append(
      h(
        "p",
        { class: "peek-note" },
        "No edition on this date. ",
        h("strong", { text: `Latest edition ${formatShort(latestEdition)}.` }),
        " Choose it on the timeline, or use the button to open it explicitly.",
      ),
    );
  }

  function renderTimelineStatus() {
    dom.timelineStatusCount.textContent =
      state.mode === "public" ? "0 published editions" : `${editionDates.length} editions`;
    dom.timelineStatusSubset.textContent =
      state.mode === "public"
        ? "candidate insights shown as editorial previews"
        : `${DATA.concepts.length} concepts in the bounded review subset`;
    dom.timelineStatusPublic.textContent = "0 published semantic edges";
  }

  function updateTimelineCardStatuses() {
    for (const entry of timeline.cards) {
      const status = entry.card.querySelector(".card-status span:last-child");
      if (!status) continue;
      if (entry.insight) {
        status.textContent =
          state.mode === "public" ? "editorial preview · not published" : "1 card · technical review";
      } else {
        status.textContent = entry.today ? "today · no edition" : "no edition";
      }
    }
  }

  function animateTimelineTo(target, duration = 380) {
    window.cancelAnimationFrame(timeline.raf);
    const start = timeline.position;
    const destination = clamp(target, 0, dates.length - 1);
    if (prefersReduced() || Math.abs(destination - start) < 0.0001) {
      timeline.position = destination;
      renderTimelinePosition(destination, { commit: false });
      return;
    }
    const startTime = performance.now();
    const step = (now) => {
      const t = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      timeline.position = start + (destination - start) * eased;
      renderTimelinePosition(timeline.position, { commit: false });
      if (t < 1) timeline.raf = window.requestAnimationFrame(step);
      else {
        timeline.position = destination;
        renderTimelinePosition(destination, { commit: false });
      }
    };
    timeline.raf = window.requestAnimationFrame(step);
  }

  function selectTimelineIndex(index, options = {}) {
    const target = clamp(index, 0, dates.length - 1);
    setSelectedDate(dates[target]);
    animateTimelineTo(target);
    if (options.focus) {
      focusElement(timeline.cards[target].cardButton);
    }
  }

  function onTimelineCardActivate(index) {
    if (performance.now() < timeline.suppressClickUntil) return;
    const date = dates[index];
    if (state.selectedDate === date) {
      const insight = insightByDate.get(date);
      if (insight) {
        openDealer(date);
      } else {
        showToast(`No edition on ${formatShort(date)}. The latest edition is ${formatShort(latestEdition)}.`);
      }
      return;
    }
    selectTimelineIndex(index);
  }

  function onTimelineKeydown(event, index) {
    let next = null;
    if (event.key === "ArrowRight") next = index + 1;
    if (event.key === "ArrowLeft") next = index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = dates.length - 1;
    if (next === null) return;
    event.preventDefault();
    selectTimelineIndex(next, { focus: true });
  }

  function bindTimelineDrag() {
    const stage = dom.timelineStage;

    stage.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      window.cancelAnimationFrame(timeline.raf);
      const now = performance.now();
      timeline.drag = {
        id: event.pointerId,
        startX: event.clientX,
        startPosition: timeline.position,
        moved: false,
        lastX: event.clientX,
        lastTime: now,
        previousX: event.clientX,
        previousTime: now,
      };
    });

    stage.addEventListener("pointermove", (event) => {
      const drag = timeline.drag;
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
      const geometry = timeline.geometry || timelineGeometry(stage.clientWidth || 800);
      const raw = drag.startPosition - dx / geometry.step;
      const last = dates.length - 1;
      timeline.position =
        raw < 0 ? raw * 0.3 : raw > last ? last + (raw - last) * 0.3 : raw;
      renderTimelinePosition(timeline.position, { commit: true });
      drag.previousX = drag.lastX;
      drag.previousTime = drag.lastTime;
      drag.lastX = event.clientX;
      drag.lastTime = performance.now();
    });

    const endDrag = (event) => {
      const drag = timeline.drag;
      if (!drag || event.pointerId !== drag.id) return;
      timeline.drag = null;
      stage.classList.remove("is-dragging");
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch {
        /* no capture */
      }
      if (!drag.moved) return;
      timeline.suppressClickUntil = performance.now() + 260;
      const dt = drag.lastTime - drag.previousTime;
      const velocity = dt > 0 ? (drag.lastX - drag.previousX) / dt : 0;
      const geometry = timeline.geometry || timelineGeometry(stage.clientWidth || 800);
      const eventsPerSecond = (-velocity * 1000) / geometry.step;
      const projected = timeline.position + clamp(eventsPerSecond * 0.3, -4, 4);
      const target = clamp(Math.round(projected), 0, dates.length - 1);
      setSelectedDate(dates[target]);
      animateTimelineTo(target, 420);
    };

    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    stage.addEventListener(
      "click",
      (event) => {
        if (performance.now() >= timeline.suppressClickUntil) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );

    let wheelTimer = 0;
    stage.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        window.cancelAnimationFrame(timeline.raf);
        const geometry = timeline.geometry || timelineGeometry(stage.clientWidth || 800);
        const last = dates.length - 1;
        timeline.position = clamp(timeline.position + event.deltaX / geometry.step, -0.3, last + 0.3);
        renderTimelinePosition(timeline.position, { commit: true });
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          const target = clamp(Math.round(timeline.position), 0, last);
          setSelectedDate(dates[target]);
          animateTimelineTo(target, 300);
        }, 140);
      },
      { passive: false },
    );
  }

  // --------------------------------------------------------------- scene flow

  const SCENE_TARGET = { timeline: 0.02, atlas: 0.5, closing: 0.93 };

  function hashToScene(hash) {
    if (hash === "#today" || hash === "#timeline") return "timeline";
    if (hash === "#atlas") return "atlas";
    if (hash === "#closing") return "closing";
    return null;
  }

  function sceneProgress() {
    const journeyTop = window.scrollY + dom.journey.getBoundingClientRect().top;
    const max = Math.max(1, dom.journeyTrack.offsetHeight - dom.stage.offsetHeight);
    return clamp((window.scrollY - journeyTop) / max, 0, 1);
  }

  function goToProgress(progress, options = {}) {
    const journeyTop = window.scrollY + dom.journey.getBoundingClientRect().top;
    const max = Math.max(1, dom.journeyTrack.offsetHeight - dom.stage.offsetHeight);
    const top = journeyTop + clamp(progress, 0, 1) * max;
    window.scrollTo({
      top,
      behavior: options.instant || prefersReduced() ? "auto" : "smooth",
    });
  }

  function goToScene(scene, options = {}) {
    const sceneName = SCENE_TARGET[scene] ? scene : "timeline";
    if (options.push !== false && location.hash !== `#${sceneName}`) {
      history.pushState({ scene: sceneName }, "", `#${sceneName}`);
    }
    if (isStacked()) {
      const section = document.getElementById(`scene-${sceneName}`);
      if (section) {
        const topbar = dom.topbar.offsetHeight || 64;
        window.scrollTo({
          top: Math.max(0, window.scrollY + section.getBoundingClientRect().top - topbar),
          behavior: options.instant || prefersReduced() ? "auto" : "smooth",
        });
      }
    } else {
      goToProgress(SCENE_TARGET[sceneName], { instant: options.instant });
    }
    setActiveScene(sceneName);
    if (options.focus) {
      const heading = document.querySelector(`#scene-${sceneName} h1`);
      window.setTimeout(() => focusElement(heading), options.instant ? 0 : 480);
    }
  }

  function setActiveScene(sceneName) {
    state.activeScene = sceneName;
    for (const button of document.querySelectorAll("[data-scene-link]")) {
      const target = button.dataset.sceneLink;
      if (target === sceneName) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
    if (isStacked()) {
      for (const scene of dom.scenes) {
        scene.dataset.active = "true";
        scene.inert = false;
      }
      return;
    }
    for (const scene of dom.scenes) {
      const active = scene.dataset.scene === sceneName;
      scene.dataset.active = active ? "true" : "false";
      scene.inert = !active;
    }
  }

  let journeyRaf = 0;

  function updateJourney() {
    journeyRaf = 0;
    if (isStacked()) {
      setActiveScene(sceneFromViewport());
      saveScroll();
      return;
    }
    const progress = sceneProgress();
    state.progress = progress;
    const atlasRise = clamp((progress - 0.14) / 0.26, 0, 1);
    const closingRise = clamp((progress - 0.6) / 0.26, 0, 1);
    dom.journeyTrack.style.setProperty("--atlas-rise", atlasRise.toFixed(4));
    dom.journeyTrack.style.setProperty("--closing-rise", closingRise.toFixed(4));
    dom.journeyTrack.style.setProperty("--recede", closingRise.toFixed(4));
    dom.progressFill.style.height = `${(progress * 100).toFixed(2)}%`;
    dom.progressValue.textContent = progress.toFixed(2);
    dom.handoffMeta.textContent =
      state.mode === "public"
        ? `p ${progress.toFixed(2)} · public`
        : `p ${progress.toFixed(2)} · ${selectedConcept()?.label || "candidate"}`;
    dom.closingSeamMeta.textContent = `p ${progress.toFixed(2)}`;
    const active = progress < 0.34 ? "timeline" : progress < 0.78 ? "atlas" : "closing";
    setActiveScene(active);
    saveScroll();
  }

  function sceneFromViewport() {
    const topbar = dom.topbar.offsetHeight || 64;
    let current = "timeline";
    for (const scene of dom.scenes) {
      const rect = scene.getBoundingClientRect();
      if (rect.top <= topbar + window.innerHeight * 0.32) current = scene.dataset.scene;
    }
    return current;
  }

  function onScroll() {
    if (journeyRaf) return;
    journeyRaf = window.requestAnimationFrame(updateJourney);
  }

  function syncTopbarHeight() {
    if (!dom.topbar) return;
    const height = dom.topbar.offsetHeight;
    if (height > 0) {
      document.documentElement.style.setProperty("--topbar-h", `${height}px`);
    }
  }

  function syncLayoutMode() {
    syncTopbarHeight();
    if (isStacked()) {
      dom.journeyTrack.style.removeProperty("--atlas-rise");
      dom.journeyTrack.style.removeProperty("--closing-rise");
      dom.journeyTrack.style.removeProperty("--recede");
      for (const scene of dom.scenes) {
        scene.dataset.active = "true";
        scene.inert = false;
      }
      setActiveScene(sceneFromViewport());
    } else {
      updateJourney();
    }
    resizeTimeline();
    renderGraph();
  }

  // ---------------------------------------------------------------- theme/mode

  function updateModeButtons() {
    for (const buttonEl of document.querySelectorAll(".mode-switch [data-mode]")) {
      const active = buttonEl.dataset.mode === state.mode;
      buttonEl.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function setMode(mode) {
    if (mode !== "public" && mode !== "review") return;
    if (state.mode === mode) return;
    state.mode = mode;
    document.body.dataset.mode = mode;
    if (mode === "public" && state.view === "list") state.view = "graph";
    dom.searchInput.value = "";
    dom.searchResults.hidden = true;
    renderAll();
    saveState();
    showToast(
      mode === "public"
        ? "Public projection: 0 published concepts, 0 published relations."
        : "Editorial review: candidate concepts and relations are visible again.",
    );
  }

  function updateThemeButtons() {
    const dark = document.documentElement.dataset.theme === "dark";
    dom.themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
    dom.themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    dom.closingTheme.textContent = `Appearance · ${dark ? "dark" : "light"}`;
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* no persistence */
    }
    updateThemeButtons();
  }

  // ------------------------------------------------------------------- dealer

  let dealerOpener = null;
  let dealTimer = 0;

  function buildEditionRail() {
    clear(dom.dealerEditionRail);
    for (const date of editionDates) {
      const insight = insightByDate.get(date);
      const railButton = h("button", {
        type: "button",
        attrs: {
          "aria-pressed": "false",
          "aria-label": `${formatLong(date)} edition, ${insight ? "1 card" : "no cards"}`,
        },
        onclick: () => switchEdition(date),
      });
      railButton.append(
        h("span", { class: "rail-day", text: formatDay(date) }),
        h("span", {
          class: "rail-meta",
          text: `${weekdayShort(date)} · ${insight ? "1 card" : "no cards"}`,
        }),
      );
      dom.dealerEditionRail.append(railButton);
    }
  }

  function openDealer(date, view, options = {}) {
    const targetDate = editionDates.includes(date) ? date : latestEdition;
    const wasOpen = !dom.dealerBackdrop.hidden;
    if (!wasOpen) dealerOpener = document.activeElement;
    state.dealerDate = targetDate;
    const edition = editionState(targetDate);
    if (view && ["card", "evidence", "destination"].includes(view)) edition.view = view;

    dom.dealerBackdrop.hidden = false;
    syncBodyLock();
    renderDealer({ animate: true });

    if (!options.fromHistory) {
      const payload = { dealer: targetDate, view: edition.view, scene: state.activeScene };
      if (wasOpen) history.replaceState(payload, "", `#edition/${targetDate}`);
      else history.pushState(payload, "", `#edition/${targetDate}`);
    }

    if (!wasOpen) focusElement(dom.dealerDialog);
    saveState();
  }

  function closeDealer(options = {}) {
    if (dom.dealerBackdrop.hidden) return;
    dom.dealerBackdrop.hidden = true;
    dom.dealerHand.classList.remove("is-dealing");
    window.clearTimeout(dealTimer);
    syncBodyLock();
    const opener = dealerOpener;
    dealerOpener = null;

    if (!options.fromHistory) {
      if (history.state && history.state.dealer) {
        history.back();
      } else {
        history.replaceState(
          { scene: state.activeScene },
          "",
          `#${state.activeScene === "timeline" ? "today" : state.activeScene}`,
        );
      }
    }

    if (options.restoreFocus !== false && opener && opener.isConnected) {
      focusElement(opener);
    }
  }

  function switchEdition(date) {
    if (!editionDates.includes(date) || date === state.dealerDate) return;
    state.dealerDate = date;
    renderDealer({ animate: true });
    if (!dom.dealerBackdrop.hidden) {
      history.replaceState(
        { dealer: date, view: editionState(date).view, scene: state.activeScene },
        "",
        `#edition/${date}`,
      );
    }
    dom.dealerStatus.textContent = `Showing the ${formatLong(date)} edition.`;
    saveState();
  }

  function renderDealer(options = {}) {
    const insight = insightByDate.get(state.dealerDate) || DATA.insights[0];
    if (!insight) return;
    state.dealerDate = insight.date;
    const edition = editionState(insight.date);

    dom.dealerKickerDate.textContent = formatLong(insight.date);
    dom.dealerTitle.textContent = formatShort(insight.date);
    dom.dealerSummary.textContent =
      state.mode === "public"
        ? `${insight.title} Editorial preview; nothing here is a published semantic claim.`
        : `${insight.title} One card, source-checked; editorial review, not a published semantic claim.`;
    dom.dealerReviewBadge.textContent =
      state.mode === "public" ? "editorial preview · not published" : "technical review · human pending";
    dom.dealerFootNote.textContent = `Source-checked ${formatShort(insight.checkedAt)} · Human publication review pending`;

    for (const railButton of dom.dealerEditionRail.querySelectorAll("button")) {
      railButton.setAttribute(
        "aria-pressed",
        railButton.getAttribute("aria-label")?.startsWith(formatLong(state.dealerDate)) ? "true" : "false",
      );
    }

    clear(dom.handLabel);
    dom.handLabel.append("The hand ", h("span", { text: "1 card" }));

    clear(dom.dealerHand);
    const handItem = h("li", {
      class: "dealer-card",
      dataset: { active: "true", index: "0" },
      style: { "--x": "0px", "--y": "0px", "--rot": "0deg", "--z": "2", "--i": "0" },
    });
    const handButton = h("button", {
      class: "dealer-card-button",
      attrs: { type: "button", "aria-label": `Read the card: ${insight.cardTitle}` },
      onclick: () => {
        setDealerView("card");
        focusReaderTitle();
      },
    });
    handButton.append(
      h(
        "span",
        { class: "dealer-card-index" },
        h("span", { text: "01 / 01" }),
        h("span", { class: "dealer-card-topic", text: insight.topic }),
      ),
      h("span", { class: "dealer-card-title", text: insight.cardTitle }),
      h("span", { class: "dealer-card-takeaway", text: insight.takeaway }),
      h("span", { class: "dealer-card-mark" }, h("span"), h("span"), h("span")),
    );
    handItem.append(handButton);
    dom.dealerHand.append(handItem);

    dom.dealerHand.classList.remove("is-dealing");
    if (options.animate && !prefersReduced()) {
      void dom.dealerHand.offsetWidth;
      dom.dealerHand.classList.add("is-dealing");
      window.clearTimeout(dealTimer);
      dealTimer = window.setTimeout(() => dom.dealerHand.classList.remove("is-dealing"), 720);
    }

    renderReader(insight, edition);
  }

  function renderReader(insight, edition) {
    clear(dom.dealerReader);
    const view = edition.view || "card";
    if (view === "evidence") dom.dealerReader.append(renderReaderEvidence(insight));
    else if (view === "destination") dom.dealerReader.append(renderReaderDestination(insight));
    else dom.dealerReader.append(renderReaderCard(insight));

    const message =
      view === "evidence"
        ? `Evidence record for the ${formatShort(insight.date)} edition.`
        : view === "destination"
          ? `Destination preview for the ${formatShort(insight.date)} edition.`
          : `Reading the ${formatShort(insight.date)} edition card.`;
    if (dom.dealerStatus.textContent !== message) dom.dealerStatus.textContent = message;
  }

  function readerBackButton(label, onClick) {
    return h("button", {
      class: "reader-back",
      text: `← ${label}`,
      attrs: { type: "button" },
      onclick: onClick,
    });
  }

  function readerMetaRow(term, value) {
    return h(
      "div",
      {},
      h("dt", { text: term }),
      h("dd", { text: value }),
    );
  }

  function renderReaderCard(insight) {
    const view = h("article", { class: "reader-view" });
    const actions = h("div", { class: "reader-actions" });
    actions.append(
      button("Inspect evidence", "secondary-button", () => setDealerView("evidence")),
      button("Destination preview", "secondary-button", () => setDealerView("destination")),
      button("Locate in Atlas", "primary-button", () => locateInAtlas(insight)),
    );

    const meta = h(
      "dl",
      { class: "reader-meta" },
      readerMetaRow("Topic", insight.topic),
      readerMetaRow("Edition", formatShort(insight.date)),
      readerMetaRow("Source", `${insight.sourceId} · checked ${formatShort(insight.checkedAt)}`),
      readerMetaRow(
        "Review",
        state.mode === "public"
          ? "editorial preview · not published"
          : `${humanizeToken(insight.reviewStatus)} · human pending`,
      ),
      readerMetaRow(
        "Concept",
        state.mode === "public" ? "candidate concept withheld" : conceptLabel(insight.conceptId),
      ),
      readerMetaRow("Held questions", "None used as evidence"),
    );

    view.append(
      h(
        "div",
        { class: "reader-topline" },
        h("span", { text: "Card 01 / 01" }),
        h("span", { class: "reader-index", text: state.mode === "public" ? "editorial preview" : "technical review" }),
      ),
      h("h3", {
        class: "reader-title",
        text: insight.cardTitle,
        attrs: { tabindex: "-1" },
      }),
      h("p", { class: "reader-subtitle", text: insight.title }),
      h("p", { class: "reader-scenario", text: insight.scenario }),
      h(
        "div",
        { class: "reader-block is-quiet" },
        h("span", { class: "reader-block-label", text: "Before you read on" }),
        h("p", { text: insight.prediction }),
      ),
      h(
        "div",
        { class: "reader-block" },
        h("span", { class: "reader-block-label", text: "Takeaway" }),
        h("p", { text: insight.takeaway }),
      ),
      h(
        "div",
        { class: "reader-block is-caveat" },
        h("span", { class: "reader-block-label", text: "Caveat" }),
        h("p", { text: insight.caveat }),
      ),
      meta,
      actions,
      h(
        "p",
        { class: "evidence-note" },
        state.mode === "public"
          ? "Editorial preview only. Candidate concepts, mappings and graph assertions are withheld from the public projection."
          : "Candidate context. The card is source-checked, not human-approved for publication.",
      ),
    );
    return view;
  }

  function renderReaderEvidence(insight) {
    const view = h("article", { class: "reader-view" });
    view.append(
      readerBackButton("Back to card", () => {
        setDealerView("card");
        focusReaderTitle();
      }),
      h(
        "div",
        { class: "reader-topline" },
        h("span", { text: "Evidence record" }),
        h("span", { class: "reader-index", text: state.mode === "public" ? "editorial preview" : "candidate" }),
      ),
      h("h3", {
        class: "reader-title",
        text: "Source record",
        attrs: { tabindex: "-1" },
      }),
      h("p", {
        class: "reader-subtitle",
        text: `${insight.title} The edition and its locator are preserved from the corpus.`,
      }),
    );

    const record = h("dl", { class: "evidence-record" });
    const rows = [
      ["Source", insight.sourceId],
      ["Locator", insight.sourceLocator],
      ["URL", insight.sourceUrl],
      ["Checked", formatShort(insight.checkedAt)],
      [
        "Review",
        state.mode === "public"
          ? "editorial preview · not published"
          : `${humanizeToken(insight.reviewStatus)} · human pending`,
      ],
      [
        "Concept",
        state.mode === "public" ? "candidate concept withheld" : conceptLabel(insight.conceptId),
      ],
    ];
    for (const [term, value] of rows) {
      record.append(
        h(
          "div",
          { class: "evidence-row" },
          h("dt", { text: term }),
          h("dd", { text: value }),
        ),
      );
    }
    view.append(record);

    if (state.mode === "review") {
      const related = (edgesByConcept.get(insight.conceptId) || []).slice(0, 2);
      for (const edge of related) {
        const evidence = edge.evidence?.[0];
        const assertion = h("div", { class: "evidence-assertion" });
        assertion.append(
          h("h4", { text: `${edge.fromLabel} → ${edge.toLabel}` }),
          h("p", { class: "evidence-claim", text: edge.claim }),
        );
        if (evidence?.quote) {
          const quote = h("blockquote", {
            class: "evidence-quote",
            text: evidence.quote,
            attrs: { dir: "auto", lang: evidence.language || undefined },
          });
          assertion.append(quote);
        }
        if (evidence) {
          assertion.append(
            h("span", {
              class: "evidence-locator",
              text: `${evidence.unitId} · ${evidence.locator}`,
            }),
          );
        }
        view.append(assertion);
      }
      view.append(
        h(
          "p",
          { class: "evidence-note" },
          "The edition record is separate from the graph assertion. A source check is not human publication approval; the assertion remains a candidate.",
        ),
      );
    } else {
      view.append(
        h(
          "p",
          { class: "evidence-note" },
          "Public projection: only the edition's source record is shown. Candidate graph assertions are withheld.",
        ),
      );
    }

    view.append(
      h(
        "div",
        { class: "reader-actions" },
        button("Back to card", "secondary-button", () => setDealerView("card")),
        button("Locate in Atlas", "primary-button", () => locateInAtlas(insight)),
        h("a", {
          class: "text-button",
          text: "Primary source ↗",
          attrs: { href: insight.sourceUrl, target: "_blank", rel: "noreferrer" },
        }),
      ),
    );
    return view;
  }

  function renderReaderDestination(insight) {
    const view = h("article", { class: "reader-view" });
    view.append(
      readerBackButton("Back to card", () => {
        setDealerView("card");
        focusReaderTitle();
      }),
      h(
        "div",
        { class: "reader-topline" },
        h("span", { text: "Destination preview" }),
        h("span", { class: "reader-index", text: "not live" }),
      ),
      h("h3", {
        class: "reader-title",
        text: "Where this card can lead",
        attrs: { tabindex: "-1" },
      }),
      h("p", {
        class: "reader-subtitle",
        text: "Recorded lesson and practice routes from the corpus. The standalone prototype does not load them.",
      }),
    );

    const routeBox = h("div", { class: "destination-route" });
    for (const [label, href] of [
      ["Lesson route", insight.lessonHref],
      ["Practice route", insight.practiceHref],
    ]) {
      routeBox.append(
        h("div", { style: { marginBottom: "8px" } },
          h("span", { class: "reader-block-label", text: label }),
          h("span", { text: href }),
        ),
      );
    }
    view.append(
      routeBox,
      h(
        "p",
        { class: "destination-note" },
        "Standalone preview: selecting a route does not load the live application, change saved progress or submit an assessment. The route strings are preserved from the corpus.",
      ),
      h(
        "div",
        { class: "reader-actions" },
        button("Back to card", "secondary-button", () => setDealerView("card")),
        button("Copy lesson route", "ghost-button", () => copyText(insight.lessonHref)),
        button("Copy practice route", "ghost-button", () => copyText(insight.practiceHref)),
        h("a", {
          class: "text-button",
          text: "Primary source ↗",
          attrs: { href: insight.sourceUrl, target: "_blank", rel: "noreferrer" },
        }),
      ),
    );
    return view;
  }

  function setDealerView(view) {
    const edition = editionState(state.dealerDate);
    edition.view = view;
    renderDealer();
    saveState();
    requestAnimationFrame(() => {
      if (view === "card") focusReaderTitle();
      else focusReaderBack();
    });
  }

  function focusReaderTitle() {
    focusElement(dom.dealerReader.querySelector(".reader-title"));
  }

  function focusReaderBack() {
    focusElement(dom.dealerReader.querySelector(".reader-back"));
  }

  function locateInAtlas(insight) {
    if (state.mode === "public") {
      showToast(
        "No published concept to locate. Switch to editorial review to inspect the candidate context.",
      );
      return;
    }
    const concept = conceptById.get(insight.conceptId);
    if (!concept) {
      showToast("The card's concept is outside the bounded prototype subset.");
      return;
    }
    const edition = editionState(insight.date);
    state.returnContext = {
      date: insight.date,
      conceptId: insight.conceptId,
      view: edition.view,
      cardIndex: edition.cardIndex,
      origin: "timeline",
      returnLabel: `Return to ${formatShort(insight.date)} edition`,
    };
    state.constellation = concept.constellation;
    state.selectedConceptId = concept.id;
    state.showAll = false;
    state.activeEdgeId = null;
    state.detail = { type: "concept", id: concept.id };
    renderAll();
    saveState();
    closeDealer({ fromHistory: true, restoreFocus: false });
    history.replaceState({ scene: "atlas" }, "", "#atlas");
    goToScene("atlas", { push: false, focus: true });
    showToast(`Located ${concept.label} in the Atlas. Candidate context only.`);
  }

  // -------------------------------------------------------------------- atlas

  const layoutCache = new Map();
  const GRAPH_W = 1200;
  const GRAPH_H = 760;

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash);
  }

  function runForce(concepts, edges, box, rootId) {
    const positions = new Map();
    if (!concepts.length) return positions;
    const centerX = box.x + box.w / 2;
    const centerY = box.y + box.h / 2;
    const root = concepts.some((concept) => concept.id === rootId) ? rootId : concepts[0].id;

    concepts.forEach((concept, index) => {
      if (concept.id === root) {
        positions.set(concept.id, { x: centerX, y: centerY });
        return;
      }
      const jitter = (hashString(concept.id) % 1000) / 1000;
      const angle = (index / concepts.length) * Math.PI * 2 + jitter * 0.5;
      const radius = Math.min(box.w, box.h) * (0.2 + 0.14 * (index % 3));
      positions.set(concept.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * 0.78,
      });
    });

    let alpha = 1;
    for (let iteration = 0; iteration < 280; iteration += 1) {
      const list = [...positions.entries()];
      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const [, a] = list[i];
          const [, b] = list[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < 1) {
            dx = (i % 2 === 0 ? 1 : -1) * 0.7;
            dy = (j % 2 === 0 ? 1 : -1) * 0.7;
            distanceSquared = 1;
          }
          const distance = Math.sqrt(distanceSquared);
          let repulsion = 7200 / distanceSquared;
          if (distance < 78) repulsion += (78 - distance) * 0.13;
          const fx = (dx / distance) * repulsion * alpha;
          const fy = (dy / distance) * repulsion * alpha;
          a.x -= fx;
          a.y -= fy;
          b.x += fx;
          b.y += fy;
        }
      }

      for (const edge of edges) {
        const a = positions.get(edge.from);
        const b = positions.get(edge.to);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const spring = (distance - 118) * 0.012 * alpha;
        const fx = (dx / distance) * spring;
        const fy = (dy / distance) * spring;
        a.x += fx;
        a.y += fy;
        b.x -= fx;
        b.y -= fy;
      }

      for (const point of positions.values()) {
        point.x += (centerX - point.x) * 0.006 * alpha;
        point.y += (centerY - point.y) * 0.006 * alpha;
        point.x = clamp(point.x, box.x + 28, box.x + box.w - 28);
        point.y = clamp(point.y, box.y + 28, box.y + box.h - 28);
      }
      alpha *= 0.994;
    }

    const points = [...positions.values()];
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const pad = 46;
    const scaleX = maxX - minX > 1 ? (box.w - pad * 2) / (maxX - minX) : 0;
    const scaleY = maxY - minY > 1 ? (box.h - pad * 2) / (maxY - minY) : 0;
    for (const point of positions.values()) {
      point.x = scaleX ? box.x + pad + (point.x - minX) * scaleX : centerX;
      point.y = scaleY ? box.y + pad + (point.y - minY) * scaleY : centerY;
    }
    return positions;
  }

  function islandBounds(component, positions, focus) {
    const points = component.conceptIds.map((id) => positions.get(id)).filter(Boolean);
    if (!points.length) return null;
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const left = clamp((minX / GRAPH_W) * 100 - 4, 0, 94);
    const top = clamp((minY / GRAPH_H) * 100 - 6, 0, 90);
    const width = clamp(((maxX - minX) / GRAPH_W) * 100 + 8, 13, 100 - left);
    const height = clamp(((maxY - minY) / GRAPH_H) * 100 + 12, 15, 100 - top);
    return {
      componentId: component.id,
      label: component.label,
      focus,
      left,
      top,
      width,
      height,
    };
  }

  function layoutFocused(region, component) {
    const box = { x: 72, y: 58, w: GRAPH_W - 144, h: GRAPH_H - 220 };
    const concepts = component.conceptIds.map((id) => region.byId.get(id)).filter(Boolean);
    const positions = runForce(concepts, component.edges, box, component.rootId);
    const island = islandBounds(component, positions, true);
    return { positions, islands: island ? [island] : [] };
  }

  function layoutAll(region, focusComponent) {
    const components = region.components;
    const count = components.length;
    const columns = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(count))));
    const rows = Math.max(1, Math.ceil(count / columns));
    const marginX = 34;
    const marginY = 34;
    const cellWidth = (GRAPH_W - marginX * 2) / columns;
    const cellHeight = (GRAPH_H - marginY * 2) / rows;
    const positions = new Map();
    const islands = [];

    components.forEach((component, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const box = {
        x: marginX + column * cellWidth + 16,
        y: marginY + row * cellHeight + 16,
        w: cellWidth - 32,
        h: cellHeight - 32,
      };
      const concepts = component.conceptIds.map((id) => region.byId.get(id)).filter(Boolean);
      const local = runForce(concepts, component.edges, box, component.rootId);
      for (const [id, point] of local) positions.set(id, point);
      const island = islandBounds(component, positions, component.id === focusComponent?.id);
      if (island) islands.push(island);
    });

    return { positions, islands };
  }

  function getLayout(region, component, showAll) {
    const key = `${region.regionId}|${showAll ? "all" : "one"}|${component?.id || "none"}`;
    if (layoutCache.has(key)) return layoutCache.get(key);
    const layout = showAll ? layoutAll(region, component) : layoutFocused(region, component);
    layoutCache.set(key, layout);
    return layout;
  }

  function contextLine(...children) {
    return h("p", { class: "context-line" }, ...children);
  }

  function renderAtlasHeader() {
    const region = getRegion(state.constellation);
    clear(dom.atlasContext);

    if (state.mode === "public") {
      const projection = PUBLIC?.publicProjection;
      const coverage = PUBLIC?.coverage;
      dom.atlasModeLabel.textContent = "public projection · fail-closed";
      dom.atlasContext.append(
        contextLine(
          h("span", { text: "Projection" }),
          h("strong", { text: "Public" }),
          h("span", { class: "context-sep", text: "/" }),
          h("span", { text: `${projection?.publishedConcepts?.length ?? 0} published concepts` }),
          h("span", { class: "context-sep", text: "/" }),
          h("span", { text: `${projection?.publishedAssertions?.length ?? 0} published relations` }),
          h("span", { class: "context-chip is-review", text: "fail-closed" }),
        ),
        contextLine(
          h("span", { text: "Withheld" }),
          h("strong", { text: `${coverage?.withheld?.conceptCount ?? 0} candidate concepts` }),
          h("span", { class: "context-sep", text: "/" }),
          h("span", { text: `${coverage?.withheld?.assertionCount ?? 0} assertions` }),
          h("span", { class: "context-chip is-review", text: "human review blocked" }),
        ),
      );
      return;
    }

    dom.atlasModeLabel.textContent = "editorial review projection";
    const concept = selectedConcept();
    dom.atlasContext.append(
      contextLine(
        h("span", { text: "Projection" }),
        h("strong", { text: "Editorial review" }),
        h("span", { class: "context-sep", text: "/" }),
        h("span", { text: `${region.concepts.length} concepts` }),
        h("span", { class: "context-sep", text: "/" }),
        h("span", { text: `${region.edges.length} candidate relations` }),
        h("span", { class: "context-chip is-review", text: "0 published" }),
      ),
      contextLine(
        h("span", { text: "Region" }),
        h("strong", { text: `${region.constellation.id} · ${region.constellation.label}` }),
        h("span", { class: "context-sep", text: "/" }),
        h("span", { text: concept?.label || "No concept selected" }),
        state.returnContext
          ? h("span", { class: "context-chip", text: `from ${formatShort(state.returnContext.date)} edition` })
          : null,
      ),
    );
  }

  function buildConstellationSwitch() {
    clear(dom.constellationSwitch);
    for (const constellation of DATA.constellations) {
      const control = h("button", {
        type: "button",
        text: constellation.short,
        attrs: {
          "aria-pressed": "false",
          "aria-label": `Region ${constellation.id}: ${constellation.label}`,
          title: constellation.label,
        },
        onclick: () => setConstellation(constellation.id),
      });
      dom.constellationSwitch.append(control);
    }
  }

  function setConstellation(regionId) {
    if (!constellationById.has(regionId) || state.constellation === regionId) return;
    state.constellation = regionId;
    state.showAll = false;
    state.activeEdgeId = null;
    const region = getRegion(regionId);
    if (!region.concepts.some((concept) => concept.id === state.selectedConceptId)) {
      state.selectedConceptId = region.constellation.seedConceptId;
      state.detail = { type: "concept", id: state.selectedConceptId };
    }
    renderAll();
    saveState();
  }

  function buildLensSwitch() {
    clear(dom.lensSwitch);
    for (const lens of LENSES) {
      const control = h("button", {
        type: "button",
        text: lens.label,
        attrs: { "aria-pressed": "false" },
        onclick: () => setLens(lens.id),
      });
      dom.lensSwitch.append(control);
    }
  }

  function setLens(lensId) {
    if (!LENSES.some((lens) => lens.id === lensId) || state.lens === lensId) return;
    state.lens = lensId;
    renderGraph();
    renderAtlasControls();
    saveState();
  }

  function bindViewSwitch() {
    for (const control of dom.viewSwitch.querySelectorAll("[data-view]")) {
      control.addEventListener("click", () => setView(control.dataset.view));
    }
  }

  function setView(view) {
    if (view !== "graph" && view !== "list") return;
    state.view = view;
    renderAtlasControls();
    if (view === "list") renderList();
    saveState();
  }

  function renderAtlasControls() {
    const isPublic = state.mode === "public";
    const region = getRegion(state.constellation);
    const component = selectedComponent(region);

    for (const control of dom.constellationSwitch.querySelectorAll("button")) {
      const pressed = control.getAttribute("aria-label")?.startsWith(`Region ${state.constellation}:`);
      control.setAttribute("aria-pressed", pressed ? "true" : "false");
      control.disabled = isPublic;
    }
    for (const control of dom.lensSwitch.querySelectorAll("button")) {
      control.setAttribute(
        "aria-pressed",
        control.textContent === LENSES.find((lens) => lens.id === state.lens)?.label ? "true" : "false",
      );
      control.disabled = isPublic;
    }
    for (const control of dom.viewSwitch.querySelectorAll("[data-view]")) {
      control.setAttribute("aria-pressed", control.dataset.view === state.view ? "true" : "false");
      control.disabled = isPublic;
    }

    dom.searchInput.disabled = isPublic;
    dom.searchInput.placeholder = isPublic ? "No published concepts to search" : "Search this region";
    dom.reviewRegisterButton.hidden = isPublic;
    dom.reviewRegisterCount.textContent = String(
      DATA.reviewRegister.ambiguities.length + DATA.reviewRegister.contradictions.length,
    );

    dom.graphExpand.hidden = isPublic;
    dom.graphExpand.disabled = isPublic;
    dom.graphExpand.textContent = state.showAll ? "Focus selected island" : "Show all in this region";
    dom.graphLegend.hidden = isPublic;

    if (isPublic) {
      dom.graphFrame.hidden = false;
      dom.graphList.hidden = true;
    } else {
      dom.graphFrame.hidden = state.view === "list";
      dom.graphList.hidden = state.view !== "list";
    }

    if (!isPublic) {
      dom.graphExpand.setAttribute(
        "aria-label",
        state.showAll
          ? `Focus the island containing ${component?.label || "the selected concept"}`
          : `Show all ${region.concepts.length} concepts in region ${region.constellation.id}`,
      );
    }
  }

  function renderGraph() {
    const existingStrip = dom.graphCanvas.querySelector(".aggregate-strip");
    if (existingStrip) existingStrip.remove();
    const existingLabel = dom.graphCanvas.querySelector(".aggregate-strip-label");
    if (existingLabel) existingLabel.remove();

    if (state.mode === "public") {
      renderPublicGraph();
      return;
    }

    const region = getRegion(state.constellation);
    const component = selectedComponent(region);
    const showAll = state.showAll || !component;
    const layout = getLayout(region, component, showAll);
    const visibleIds = showAll
      ? new Set(region.concepts.map((concept) => concept.id))
      : new Set(component?.conceptIds || []);
    const visibleConcepts = region.concepts.filter((concept) => visibleIds.has(concept.id));
    const visibleEdges = region.edges.filter(
      (edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to) && edgeMatchesLens(edge),
    );

    dom.graphEmpty.hidden = true;
    clear(dom.graphEmpty);
    dom.graphCanvas.classList.toggle("is-compact", dom.graphCanvas.clientWidth < 560);

    if (!visibleConcepts.length) {
      dom.graphEmpty.hidden = false;
      dom.graphEmpty.append(
        h(
          "div",
          { class: "graph-empty-inner" },
          h("h3", { text: "No concepts in this view." }),
          h("p", { text: "The bounded review payload has no concept for this region and lens." }),
        ),
      );
    }

    renderIslands(layout.islands);
    renderGraphNodes(visibleConcepts, layout, visibleEdges, region);
    renderGraphEdges(visibleEdges, layout);
    if (!showAll) renderAggregates(region, component);

    const others = region.components.filter((item) => item !== component);
    const lensLabel = LENSES.find((lens) => lens.id === state.lens)?.label || "All";
    const compactCaption = dom.graphCanvas.clientWidth < 560;
    if (showAll) {
      dom.graphCaption.textContent = compactCaption
        ? `Region ${region.constellation.id} · ${visibleConcepts.length} concepts · ${visibleEdges.length} relations`
        : `Region ${region.constellation.id} · ${visibleConcepts.length} concepts · ${visibleEdges.length} relations · all components`;
    } else {
      dom.graphCaption.textContent = compactCaption
        ? `Island · ${component?.label || "selected"} · ${visibleConcepts.length} concepts · ${visibleEdges.length} relations`
        : `Island · ${component?.label || "selected"} · ${visibleConcepts.length} concepts · ${visibleEdges.length} relations · ${others.length} other components · ${lensLabel.toLowerCase()} lens`;
    }

    dom.graphSummary.textContent = showAll
      ? `Showing all ${visibleConcepts.length} concepts in region ${region.constellation.id}, with ${visibleEdges.length} candidate relations matching the ${lensLabel} lens. Every component is visible.`
      : `Showing the island containing ${component?.label || "the selected concept"}: ${visibleConcepts.length} concepts and ${visibleEdges.length} candidate relations matching the ${lensLabel} lens. ${others.length} other components are summarised below the graph.`;
    dom.graphSummary.textContent +=
      " Candidate concepts and relations only; none has human publication approval.";

    dom.graphLegend.hidden = false;
    dom.graphExpand.hidden = false;
    dom.graphExpand.textContent = state.showAll ? "Focus selected island" : "Show all in this region";
  }

  function renderPublicGraph() {
    const existingStrip = dom.graphCanvas.querySelector(".aggregate-strip");
    if (existingStrip) existingStrip.remove();
    const existingStripLabel = dom.graphCanvas.querySelector(".aggregate-strip-label");
    if (existingStripLabel) existingStripLabel.remove();
    clear(dom.graphEdges);
    clear(dom.graphIslands);
    clear(dom.graphNodes);
    dom.graphCanvas.classList.remove("is-compact");
    const projection = PUBLIC?.publicProjection;
    const coverage = PUBLIC?.coverage;
    dom.graphCaption.textContent = "public projection · fail-closed";
    dom.graphSummary.textContent =
      "The public projection contains zero published concepts, zero published mappings and zero published assertions. Candidate graph context is withheld.";
    dom.graphLegend.hidden = true;
    dom.graphExpand.hidden = true;
    dom.graphEmpty.hidden = false;
    clear(dom.graphEmpty);
    const inner = h("div", { class: "graph-empty-inner" });
    inner.append(
      h("h3", { text: "Nothing is published yet." }),
      h("p", {
        text: `This projection is fail-closed: ${projection?.publishedConcepts?.length ?? 0} published concepts and ${projection?.publishedAssertions?.length ?? 0} published relations. ${coverage?.withheld?.conceptCount ?? 0} candidate concepts and ${coverage?.withheld?.assertionCount ?? 0} assertions are withheld pending human publication review.`,
      }),
      h(
        "div",
        { class: "detail-actions" },
        button("Switch to editorial review", "primary-button", () => setMode("review")),
        button("Read the coverage note", "secondary-button", () => openAbout()),
      ),
    );
    dom.graphEmpty.append(inner);
  }

  function renderIslands(islands) {
    clear(dom.graphIslands);
    for (const island of islands) {
      const box = h("div", {
        class: `island-box${island.focus ? " is-focus" : ""}`,
        style: {
          left: `${island.left.toFixed(2)}%`,
          top: `${island.top.toFixed(2)}%`,
          width: `${island.width.toFixed(2)}%`,
          height: `${island.height.toFixed(2)}%`,
        },
      });
      box.append(h("span", { class: "island-label", text: island.label }));
      dom.graphIslands.append(box);
    }
  }

  function renderGraphNodes(concepts, layout, edges, region) {
    clear(dom.graphNodes);
    const selectedId = state.selectedConceptId;
    const route = routeInfo(goalRoute(state.goalId));
    const currentStepConcept = goalRoute(state.goalId)?.steps[state.goalStep]?.conceptId || null;
    const neighbors = new Set();
    for (const edge of edges) {
      if (edge.from === selectedId) neighbors.add(edge.to);
      if (edge.to === selectedId) neighbors.add(edge.from);
    }
    const maxUnits = Math.max(...region.concepts.map((concept) => concept.unitCount || 1), 1);

    for (const concept of concepts) {
      const point = layout.positions.get(concept.id);
      if (!point) continue;
      const radius = 11 + Math.sqrt((concept.unitCount || 1) / maxUnits) * 17;
      const isSelected = concept.id === selectedId;
      const isNeighbor = neighbors.has(concept.id) && !isSelected;
      const isRoute = route.ids.has(concept.id);
      const isCurrent = currentStepConcept === concept.id;

      const item = h("li", {
        class: "graph-node",
        dataset: {
          conceptId: concept.id,
          selected: isSelected ? "true" : "false",
          neighbor: isNeighbor ? "true" : "false",
          route: isRoute ? "true" : "false",
          routeCurrent: isCurrent ? "true" : "false",
          side: point.x > GRAPH_W * 0.72 ? "left" : "right",
        },
        style: {
          "--nx": `${((point.x / GRAPH_W) * 100).toFixed(3)}%`,
          "--ny": `${((point.y / GRAPH_H) * 100).toFixed(3)}%`,
          "--nr": `${radius.toFixed(1)}px`,
          "--nz": String(isSelected ? 30 : isNeighbor ? 20 : 10),
        },
      });
      const control = h("button", {
        class: "graph-node-button",
        attrs: {
          type: "button",
          "aria-pressed": isSelected ? "true" : "false",
          "aria-label": `${concept.label}. ${concept.domainLabel}. ${concept.unitCount} mapped units. ${concept.assertionCount} candidate relations.${isRoute ? ` Step ${route.numbers.get(concept.id)} of the active goal.` : ""}`,
        },
        onclick: () => selectConcept(concept.id, { fromGraph: true }),
      });
      const circle = h("span", { class: "node-circle" });
      if (isRoute) {
        circle.append(h("span", { class: "route-number", text: String(route.numbers.get(concept.id)) }));
      }
      control.append(circle, h("span", { class: "graph-node-label", text: concept.label }));
      item.append(control);
      dom.graphNodes.append(item);
    }
  }

  function quadraticPoint(from, control, to, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * from.x + 2 * mt * t * control.x + t * t * to.x,
      y: mt * mt * from.y + 2 * mt * t * control.y + t * t * to.y,
    };
  }

  function renderGraphEdges(edges, layout) {
    clear(dom.graphEdges);
    dom.graphEdges.setAttribute("viewBox", `0 0 ${GRAPH_W} ${GRAPH_H}`);
    const selectedId = state.selectedConceptId;
    const route = routeInfo(goalRoute(state.goalId));
    let labels = 0;

    for (const edge of edges) {
      const from = layout.positions.get(edge.from);
      const to = layout.positions.get(edge.to);
      if (!from || !to) continue;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const curve = Math.min(44, distance * 0.16) * (hashString(edge.id) % 2 === 0 ? 1 : -1);
      const control = {
        x: (from.x + to.x) / 2 - (dy / distance) * curve,
        y: (from.y + to.y) / 2 + (dx / distance) * curve,
      };
      const pathData = `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} Q ${control.x.toFixed(2)} ${control.y.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;

      const classes = ["graph-edge-path"];
      if (edge.supportKind === "inferred") classes.push("is-inferred");
      if (edge.crossDomain) classes.push("is-cross");
      if (state.activeEdgeId && edge.id !== state.activeEdgeId) classes.push("is-muted");
      if (state.activeEdgeId === edge.id) classes.push("is-focus");
      if (route.ids.has(edge.from) && route.ids.has(edge.to)) classes.push("is-route");

      const path = s("path", { class: classes.join(" "), d: pathData });
      path.style.pointerEvents = "stroke";
      path.style.cursor = "pointer";
      path.addEventListener("click", (event) => {
        event.stopPropagation();
        selectEdge(edge.id);
      });
      const title = s("title", {});
      title.textContent = `${edge.fromLabel} → ${edge.toLabel}: ${edge.claim}`;
      path.append(title);
      dom.graphEdges.append(path);

      const arrowPoint = quadraticPoint(from, control, to, 0.55);
      const tangent = {
        x: 2 * (1 - 0.55) * (control.x - from.x) + 2 * 0.55 * (to.x - control.x),
        y: 2 * (1 - 0.55) * (control.y - from.y) + 2 * 0.55 * (to.y - control.y),
      };
      const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;
      const arrow = s("polygon", {
        class: `edge-arrow${state.activeEdgeId === edge.id ? " is-focus" : ""}`,
        points: "-4,-3 5,0 -4,3",
        transform: `translate(${arrowPoint.x.toFixed(2)} ${arrowPoint.y.toFixed(2)}) rotate(${angle.toFixed(2)})`,
      });
      dom.graphEdges.append(arrow);

      const connected = edge.from === selectedId || edge.to === selectedId;
      if (connected && labels < 5) {
        const labelPoint = quadraticPoint(from, control, to, 0.47);
        const label = s("text", {
          class: `graph-edge-label${state.activeEdgeId === edge.id ? " is-focus" : ""}`,
          x: labelPoint.x.toFixed(2),
          y: (labelPoint.y - 4).toFixed(2),
          "text-anchor": "middle",
        });
        label.textContent = RELATION_LABEL[edge.relationType] || humanizeToken(edge.relationType);
        dom.graphEdges.append(label);
        labels += 1;
      }
    }
  }

  function renderAggregates(region, component) {
    const others = region.components.filter((item) => item !== component);
    if (!others.length) return;
    const compact = dom.graphCanvas.clientWidth < 560;
    const strip = h("div", { class: "aggregate-strip" });
    strip.append(h("span", { class: "aggregate-strip-label", text: "Other components in this region" }));

    if (compact) {
      const totalConcepts = others.reduce((sum, item) => sum + item.size, 0);
      const totalEdges = others.reduce((sum, item) => sum + item.edges.length, 0);
      const control = h("button", {
        type: "button",
        class: "aggregate-card",
        attrs: { "aria-label": `Show all components. ${others.length} other islands, ${totalConcepts} concepts and ${totalEdges} relations.` },
        onclick: () => {
          state.showAll = true;
          renderGraph();
          renderAtlasControls();
          saveState();
          showToast(`Showing all ${region.concepts.length} concepts in region ${region.constellation.id}.`);
        },
      });
      control.append(
        h("strong", { text: `Other islands · ${others.length}` }),
        h("span", { text: `${totalConcepts} concepts · ${totalEdges} relations` }),
      );
      strip.append(control);
    } else {
      for (const other of others) {
        const control = h("button", {
          type: "button",
          class: "aggregate-card",
          attrs: {
            "aria-label": `Focus the island ${other.label}: ${other.size} concepts and ${other.edges.length} relations.`,
          },
          onclick: () => focusComponent(other),
        });
        control.append(
          h("strong", { text: other.label }),
          h("span", { text: `${other.size} concepts · ${other.edges.length} relations` }),
        );
        strip.append(control);
      }
    }
    dom.graphCanvas.append(strip);
  }

  function focusComponent(component) {
    state.showAll = false;
    state.selectedConceptId = component.rootId;
    state.activeEdgeId = null;
    state.detail = { type: "concept", id: component.rootId };
    renderAll();
    saveState();
    focusDetailTitle();
  }

  function selectConcept(conceptId, options = {}) {
    const concept = conceptById.get(conceptId);
    if (!concept) return;
    if (concept.constellation !== state.constellation) {
      state.constellation = concept.constellation;
      state.showAll = false;
    }
    if (options.keepAll === false) state.showAll = false;
    state.selectedConceptId = conceptId;
    state.activeEdgeId = null;
    state.detail = { type: "concept", id: conceptId };
    renderAll();
    saveState();
    if (options.fromGraph) {
      requestAnimationFrame(() => {
        const node = [...dom.graphNodes.querySelectorAll(".graph-node")].find(
          (item) => item.dataset.conceptId === conceptId,
        );
        if (node) focusElement(node.querySelector("button"));
        else focusDetailTitle();
      });
    } else if (options.fromList) {
      requestAnimationFrame(() => {
        const item = [...dom.listGroups.querySelectorAll(".list-concept")].find(
          (control) => control.dataset.conceptId === conceptId,
        );
        if (item) focusElement(item);
        else focusDetailTitle();
      });
    } else {
      focusDetailTitle();
    }
  }

  function selectEdge(edgeId) {
    const edge = edgeById.get(edgeId);
    if (!edge) return;
    state.activeEdgeId = edgeId;
    state.detail = { type: "edge", id: edgeId };
    renderDetail();
    renderGraph();
    renderAtlasControls();
    saveState();
    focusDetailTitle();
  }

  function renderList() {
    clear(dom.listGroups);
    if (state.mode === "public") {
      dom.graphList.hidden = true;
      return;
    }
    const region = getRegion(state.constellation);
    dom.listIntro.textContent = `${region.constellation.label}: ${region.concepts.length} concepts across ${new Set(region.concepts.map((concept) => concept.domainLabel)).size} domains. This list is the complete alternative to the graph; it includes concepts outside the currently focused island.`;
    const groups = new Map();
    for (const concept of region.concepts) {
      if (!groups.has(concept.domainLabel)) groups.set(concept.domainLabel, []);
      groups.get(concept.domainLabel).push(concept);
    }
    const sorted = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
    for (const [domainLabel, concepts] of sorted) {
      const group = h("section", { class: "list-group" });
      group.append(
        h(
          "h3",
          {},
          h("span", { text: domainLabel }),
          h("span", { text: `${concepts.length} concepts` }),
        ),
      );
      for (const concept of concepts.sort((a, b) => a.label.localeCompare(b.label))) {
        const control = h("button", {
          type: "button",
          class: "list-concept",
          dataset: {
            conceptId: concept.id,
            selected: concept.id === state.selectedConceptId ? "true" : "false",
          },
          onclick: () => selectConcept(concept.id, { fromList: true }),
        });
        control.append(
          h("strong", { text: concept.label }),
          h("span", { text: `${concept.unitCount} units` }),
          h("small", { text: concept.definition }),
        );
        group.append(control);
      }
      dom.listGroups.append(group);
    }
    dom.graphList.hidden = state.view !== "list";
  }

  function renderAtlasReturn() {
    clear(dom.atlasReturn);
    if (state.returnContext) {
      const control = h("button", {
        type: "button",
        class: "text-button",
        text: `Return to ${formatShort(state.returnContext.date)} edition`,
        onclick: () => openDealer(state.returnContext.date, state.returnContext.view),
      });
      dom.atlasReturn.append(
        control,
        h("span", {
          class: "review-badge",
          text: state.mode === "public" ? "editorial preview" : "candidate context",
        }),
      );
      return;
    }
    dom.atlasReturn.append(
      h("button", {
        type: "button",
        class: "text-button",
        text: "Return to the timeline",
        onclick: () => goToScene("timeline", { push: true, focus: true }),
      }),
      h("span", {
        class: "review-badge",
        text: state.mode === "public" ? "public projection" : "review subset",
      }),
    );
  }

  function renderHandoffMeta() {
    dom.handoffMeta.textContent =
      state.mode === "public"
        ? "public · 0 published"
        : `p ${state.progress.toFixed(2)} · ${selectedConcept()?.label || "candidate"}`;
    dom.closingSeamMeta.textContent = `p ${state.progress.toFixed(2)}`;
  }

  // ------------------------------------------------------------------- search

  function searchRegion(query) {
    const region = getRegion(state.constellation);
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const scored = [];
    for (const concept of region.concepts) {
      const aliases = [...(concept.aliases?.en || []), ...(concept.aliases?.ar || [])];
      let score = 0;
      if (concept.label.toLowerCase().startsWith(needle)) score += 5;
      else if (concept.label.toLowerCase().includes(needle)) score += 3;
      if (aliases.some((alias) => alias.toLowerCase() === needle)) score += 4;
      else if (aliases.some((alias) => alias.toLowerCase().includes(needle))) score += 2;
      if (concept.definition.toLowerCase().includes(needle)) score += 1;
      if (score > 0) scored.push({ concept, score });
    }
    return scored.sort((a, b) => b.score - a.score || a.concept.label.localeCompare(b.concept.label)).slice(0, 8);
  }

  function renderSearch(query) {
    if (state.mode === "public" || !query.trim()) {
      dom.searchResults.hidden = true;
      dom.searchInput.setAttribute("aria-expanded", "false");
      clear(dom.searchResults);
      return;
    }
    const matches = searchRegion(query);
    clear(dom.searchResults);
    dom.searchResults.hidden = false;
    dom.searchInput.setAttribute("aria-expanded", "true");
    if (!matches.length) {
      dom.searchResults.append(
        h("p", {
          class: "search-empty",
          text: `No concept in region ${state.constellation} matches “${query.trim()}”. The Atlas is bounded to ${DATA.concepts.length} review concepts; the list view shows the complete region.`,
        }),
      );
      return;
    }
    for (const { concept } of matches) {
      const control = h("button", {
        type: "button",
        class: "search-result",
        attrs: {
          role: "option",
          "aria-selected": "false",
          "aria-label": `${concept.label}. ${concept.domainLabel}. ${concept.definition}`,
        },
        onclick: () => chooseSearchResult(concept.id),
      });
      control.append(
        h("strong", { text: concept.label }),
        h("span", { text: `${concept.domainLabel} · ${humanizeToken(concept.kind)}` }),
      );
      control.addEventListener("focus", () => {
        for (const item of dom.searchResults.querySelectorAll(".search-result")) {
          item.setAttribute("aria-selected", item === control ? "true" : "false");
        }
      });
      dom.searchResults.append(control);
    }
  }

  function chooseSearchResult(conceptId) {
    dom.searchInput.value = "";
    dom.searchResults.hidden = true;
    dom.searchInput.setAttribute("aria-expanded", "false");
    selectConcept(conceptId, { keepAll: false });
  }

  function closeSearch() {
    dom.searchResults.hidden = true;
    dom.searchInput.setAttribute("aria-expanded", "false");
    dom.searchInput.focus();
  }

  function bindSearch() {
    dom.searchInput.addEventListener("input", () => renderSearch(dom.searchInput.value));
    dom.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
        return;
      }
      if (event.key === "ArrowDown") {
        const first = dom.searchResults.querySelector(".search-result");
        if (first) {
          event.preventDefault();
          focusElement(first);
        }
      }
    });
    dom.searchResults.addEventListener("keydown", (event) => {
      const items = [...dom.searchResults.querySelectorAll(".search-result")];
      const index = items.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!items.length) return;
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const next = (index + direction + items.length) % items.length;
        focusElement(items[next]);
      }
    });
    dom.searchInput.addEventListener("focus", () => {
      if (dom.searchInput.value.trim()) renderSearch(dom.searchInput.value);
    });
    document.addEventListener("click", (event) => {
      if (!dom.searchResults.hidden && !dom.atlasTools.contains(event.target)) {
        dom.searchResults.hidden = true;
        dom.searchInput.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ------------------------------------------------------------------- detail

  function detailTitle(text) {
    return h("h2", { class: "detail-title", text, attrs: { tabindex: "-1" } });
  }

  function detailEyebrow(...children) {
    return h("p", { class: "detail-eyebrow" }, ...children);
  }

  function detailSection(title, count, ...children) {
    const section = h("section", { class: "detail-section" });
    section.append(
      h(
        "h3",
        {},
        h("span", { text: title }),
        count !== undefined && count !== null ? h("span", { text: String(count) }) : null,
      ),
      ...children,
    );
    return section;
  }

  function dlRow(term, value) {
    return h("div", {}, h("dt", { text: term }), h("dd", { text: value }));
  }

  function focusDetailTitle() {
    requestAnimationFrame(() => focusElement(dom.detailContent.querySelector(".detail-title")));
  }

  function renderDetail() {
    clear(dom.detailContent);
    dom.detailPanel.scrollTop = 0;

    if (state.mode === "public") {
      renderPublicDetail();
      return;
    }
    if (!state.detail) {
      state.detail = state.selectedConceptId
        ? { type: "concept", id: state.selectedConceptId }
        : null;
    }
    if (!state.detail) {
      dom.detailContent.append(
        h(
          "article",
          { class: "detail-view" },
          detailEyebrow(h("span", { text: "Atlas" }), h("span", { class: "context-sep", text: "/" }), h("span", { text: "bounded review" })),
          detailTitle("Choose a concept."),
          h("p", { class: "detail-definition", text: "Select a node in the graph or a row in the list to inspect its candidate context." }),
        ),
      );
      return;
    }

    if (state.detail.type === "edge") renderEdgeDetail(state.detail.id);
    else if (state.detail.type === "goal") renderGoalDetail(state.detail.id);
    else if (state.detail.type === "resource") renderResourceDetail();
    else renderConceptDetail(state.detail.id || state.selectedConceptId);
  }

  function renderPublicDetail() {
    const projection = PUBLIC?.publicProjection;
    const coverage = PUBLIC?.coverage;
    dom.detailContent.append(
      h(
        "article",
        { class: "detail-view" },
        detailEyebrow(
          h("span", { text: "Public projection" }),
          h("span", { class: "context-sep", text: "/" }),
          h("span", { text: "fail-closed" }),
        ),
        detailTitle("Nothing is published yet."),
        h("p", {
          class: "detail-definition",
          text: "The public projection contains zero published concepts, zero published mappings and zero published assertions.",
        }),
        h("p", {
          class: "detail-scope",
          text: `${coverage?.withheld?.conceptCount ?? 0} candidate concepts, ${coverage?.withheld?.mappingCount ?? 0} mappings and ${coverage?.withheld?.assertionCount ?? 0} assertions are withheld pending human publication review. Candidate detail is not available in this mode.`,
        }),
        detailSection(
          "Gates",
          null,
          h(
            "dl",
            { class: "detail-dl" },
            dlRow("Human publication", projection?.gates?.humanPublicationReview || "blocked"),
            dlRow("Scientific review", projection?.gates?.scientificReview || "pending"),
            dlRow("Rights review", projection?.gates?.rightsReview || "pending"),
            dlRow(
              "Assessment",
              humanizeToken(projection?.gates?.assessmentReview || "not applicable"),
            ),
          ),
        ),
        h(
          "div",
          { class: "detail-actions" },
          button("Switch to editorial review", "primary-button", () => setMode("review")),
          button("Read the coverage note", "secondary-button", () => openAbout()),
        ),
      ),
    );
  }

  function renderConceptDetail(conceptId) {
    const concept = conceptById.get(conceptId);
    if (!concept) {
      renderDetail();
      return;
    }
    const region = getRegion(concept.constellation);
    const relations = (edgesByConcept.get(concept.id) || []).slice().sort((a, b) => {
      const aOut = a.from === concept.id ? 0 : 1;
      const bOut = b.from === concept.id ? 0 : 1;
      return aOut - bOut || a.relationType.localeCompare(b.relationType);
    });
    const resources = concept.resources || [];
    const goals = DATA.goals.filter((goal) =>
      goal.steps.some((step) => step.conceptId === concept.id),
    );
    const component = selectedComponent(region);
    const inFocusedIsland = component?.conceptIds.includes(concept.id);
    const view = h("article", { class: "detail-view" });

    view.append(
      detailEyebrow(
        h("span", { text: "Concept" }),
        h("span", { class: "context-sep", text: "/" }),
        h("span", { text: "candidate" }),
        h("span", { class: "context-sep", text: "/" }),
        h("span", { text: concept.domainLabel }),
        h("span", { class: "context-chip is-review", text: "not published" }),
      ),
      detailTitle(concept.label),
      h("p", { class: "detail-definition", text: concept.definition }),
      h("p", { class: "detail-scope", text: concept.scope }),
    );

    const glance = h("dl", { class: "detail-dl" });
    glance.append(
      dlRow("Domain", concept.domainLabel),
      dlRow("Kind", humanizeToken(concept.kind)),
      dlRow("Mapped units", `${concept.unitCount} total · ${concept.primaryUnitCount} primary`),
      dlRow(
        "Candidate relations",
        `${concept.assertionCount}${concept.crossDomainAssertionCount ? ` · ${concept.crossDomainAssertionCount} cross-domain` : ""}`,
      ),
      dlRow("Region", `${concept.constellation} · ${region.constellation.label}`),
      dlRow("Review", "Candidate · human publication pending"),
    );
    view.append(detailSection("At a glance", null, glance));

    if (concept.discriminatingContext) {
      view.append(
        detailSection(
          "Discriminating context",
          null,
          h("p", { class: "detail-scope", text: concept.discriminatingContext }),
        ),
      );
    }

    if (relations.length) {
      const list = h("ul", { class: "relation-list" });
      for (const edge of relations) {
        const outgoing = edge.from === concept.id;
        const otherLabel = outgoing ? edge.toLabel : edge.fromLabel;
        const control = h("button", {
          type: "button",
          class: "relation-button",
          dataset: { selected: state.activeEdgeId === edge.id ? "true" : "false" },
          attrs: {
            "aria-label": `${humanizeToken(edge.relationType)} ${otherLabel}. ${outgoing ? "Outgoing" : "Incoming"} candidate relation.`,
            title: edge.claim,
          },
          onclick: () => selectEdge(edge.id),
        });
        control.append(
          h(
            "span",
            { class: "relation-top" },
            h("span", {
              class: "relation-type",
              text: RELATION_LABEL[edge.relationType] || humanizeToken(edge.relationType),
            }),
            h("span", {
              class: "relation-support",
              text: `${edge.supportKind}${edge.crossDomain ? " · cross" : ""}`,
            }),
          ),
          h("span", { class: "relation-target", text: otherLabel }),
          h("span", {
            class: "relation-direction",
            text: `${outgoing ? "outgoing" : "incoming"} · ${edge.claim}`,
          }),
        );
        list.append(h("li", {}, control));
      }
      view.append(detailSection("Relations", relations.length, list));
    } else {
      view.append(
        detailSection(
          "Relations",
          "0",
          h("p", { class: "empty-note", text: "No candidate relation in this bounded subset touches this concept." }),
        ),
      );
    }

    if (resources.length) {
      const list = h("ul", { class: "resource-list" });
      for (const resource of resources.slice(0, 6)) {
        const control = h("button", {
          type: "button",
          class: "resource-button",
          dataset: { action: "open" },
          attrs: { "aria-label": `Preview recorded destination ${resource.href}` },
          onclick: () => openResource(resource, concept.id),
        });
        control.append(
          h(
            "span",
            { class: "resource-top" },
            h("span", { class: "resource-role", text: resource.role }),
            h("span", { class: "resource-meta", text: resource.language || "en" }),
          ),
          h("span", { class: "resource-title", text: "Recorded destination" }),
          h("span", { class: "resource-locator", text: resource.href }),
        );
        list.append(h("li", {}, control));
      }
      view.append(
        detailSection(
          "Resources",
          `${Math.min(resources.length, 6)} / ${resources.length}`,
          list,
          resources.length > 6
            ? h("p", { class: "detail-scope", text: `${resources.length - 6} more recorded resources are in the full mapping ledger.` })
            : null,
        ),
      );
    } else {
      view.append(
        detailSection(
          "Resources",
          "0",
          h("p", { class: "empty-note", text: "No corpus destination is recorded for this concept in the bounded subset." }),
        ),
      );
    }

    if (goals.length) {
      const list = h("ul", { class: "next-step-list" });
      for (const goal of goals) {
        const control = h("button", {
          type: "button",
          class: "next-step-button",
          onclick: () => setGoal(goal.goalId),
        });
        control.append(
          h(
            "span",
            { class: "next-step-top" },
            h("span", { class: "next-step-code", text: "goal" }),
            h("span", {
              class: "relation-support",
              text: `${goal.coverage.stepCount} steps · ${goal.supported ? "supported" : "gap"}`,
            }),
          ),
          h("span", { class: "next-step-title", text: goal.title }),
          h("span", { class: "next-step-reason", text: goal.audience }),
        );
        list.append(h("li", {}, control));
      }
      view.append(detailSection("Goals using this concept", goals.length, list));
    }

    const actions = h("div", { class: "detail-actions" });
    if (concept.constellation !== state.constellation) {
      actions.append(
        button(`Switch to region ${concept.constellation}`, "secondary-button", () => {
          setConstellation(concept.constellation);
        }),
      );
    } else if (state.showAll || !inFocusedIsland) {
      actions.append(
        button("Focus this island", "secondary-button", () => {
          state.showAll = false;
          state.selectedConceptId = concept.id;
          state.detail = { type: "concept", id: concept.id };
          renderAll();
          saveState();
          focusDetailTitle();
        }),
      );
    } else {
      actions.append(
        button("Show in graph", "secondary-button", () => {
          setView("graph");
          selectConcept(concept.id, { fromGraph: true });
        }),
      );
    }
    if (state.goalId) {
      const goal = goalRoute(state.goalId);
      const stepIndex = goal?.steps.findIndex((step) => step.conceptId === concept.id) ?? -1;
      if (stepIndex >= 0) {
        actions.append(
          button("Show goal step", "ghost-button", () => setGoalStep(stepIndex)),
        );
      }
    }
    if (state.returnContext) {
      actions.append(
        button(`Return to ${formatShort(state.returnContext.date)} edition`, "ghost-button", () => {
          openDealer(state.returnContext.date, state.returnContext.view);
        }),
      );
    }
    view.append(actions);
    dom.detailContent.append(view);
  }

  function renderEdgeDetail(edgeId) {
    const edge = edgeById.get(edgeId);
    if (!edge) {
      renderConceptDetail(state.selectedConceptId);
      return;
    }
    const inRegion =
      conceptById.get(edge.from)?.constellation === state.constellation &&
      conceptById.get(edge.to)?.constellation === state.constellation;
    const view = h("article", { class: "detail-view" });
    view.append(
      detailEyebrow(
        h("span", { text: "Candidate relation" }),
        h("span", { class: "context-sep", text: "/" }),
        h("span", { text: edge.supportKind }),
        edge.crossDomain ? h("span", { class: "context-chip is-review", text: "cross-domain" }) : null,
        h("span", { class: "context-chip is-review", text: "not published" }),
      ),
      detailTitle(`${edge.fromLabel} → ${edge.toLabel}`),
      h("p", { class: "edge-claim", text: edge.claim }),
      edge.conditions ? h("p", { class: "edge-conditions", text: edge.conditions }) : null,
      h("p", { class: "detail-scope", text: edge.rationale }),
    );

    const dl = h("dl", { class: "detail-dl" });
    dl.append(
      dlRow("Relation", RELATION_LABEL[edge.relationType] || humanizeToken(edge.relationType)),
      dlRow("Direction", edge.direction),
      dlRow("Support", `${edge.supportKind}${edge.crossDomain ? " · cross-domain" : ""}`),
      dlRow("Review", "Candidate · human publication pending"),
      dlRow("Evidence", `${edge.evidence?.length || 0} source record(s)`),
    );
    view.append(detailSection("Relation record", null, dl));

    if (!inRegion) {
      view.append(
        h("p", {
          class: "empty-note",
          text: `This relation crosses the current region boundary. Region ${state.constellation} only draws relations whose two endpoints are inside the selected region.`,
        }),
      );
    }

    if (edge.evidence?.length) {
      const list = h("ul", { class: "evidence-list" });
      for (const evidence of edge.evidence) {
        const item = h("li", { class: "evidence-item" });
        item.append(
          h("blockquote", {
            text: evidence.quote,
            attrs: { dir: "auto", lang: evidence.language || undefined },
          }),
          h("span", {
            class: "evidence-locator",
            text: `${evidence.unitId} · ${evidence.locator} · ${evidence.canonicalHref}`,
          }),
        );
        list.append(item);
      }
      view.append(detailSection("Evidence", edge.evidence.length, list));
    }

    view.append(
      h(
        "p",
        { class: "evidence-note" },
        "Candidate assertion. Evidence is verbatim source text, not human publication approval. Conditions are part of the claim and must travel with it.",
      ),
    );

    view.append(
      h(
        "div",
        { class: "detail-actions" },
        button(`Focus ${edge.fromLabel}`, "secondary-button", () => selectConcept(edge.from)),
        button(`Focus ${edge.toLabel}`, "secondary-button", () => selectConcept(edge.to)),
        button("Back to selected concept", "ghost-button", () => {
          state.activeEdgeId = null;
          state.detail = { type: "concept", id: state.selectedConceptId };
          renderDetail();
          renderGraph();
          saveState();
          focusDetailTitle();
        }),
      ),
    );
    dom.detailContent.append(view);
  }

  function openResource(resource, conceptId) {
    state.detail = { type: "resource", resource, conceptId };
    renderDetail();
    saveState();
    focusDetailTitle();
  }

  function renderResourceDetail() {
    const resource = state.detail.resource;
    const concept = conceptById.get(state.detail.conceptId);
    if (!resource) {
      renderConceptDetail(state.selectedConceptId);
      return;
    }
    const view = h("article", { class: "detail-view" });
    view.append(
      detailEyebrow(
        h("span", { text: "Recorded resource" }),
        h("span", { class: "context-sep", text: "/" }),
        h("span", { text: "candidate" }),
        h("span", { class: "context-chip is-review", text: "not live" }),
      ),
      detailTitle(concept ? `Resource for ${concept.label}` : "Recorded resource"),
      h("p", {
        class: "detail-subtitle",
        text: "A destination preserved from the corpus mapping ledger. The prototype previews the route instead of loading the application.",
      }),
    );

    const dl = h("dl", { class: "detail-dl" });
    dl.append(
      dlRow("Role", resource.role || "recorded"),
      dlRow("Locator", resource.locator || "not recorded"),
      dlRow("Unit", resource.unitId || "not recorded"),
      dlRow("Source", resource.sourcePath || "not recorded"),
      dlRow("Language", resource.language || "en"),
      dlRow("Review", resource.reviewState || "candidate"),
    );
    view.append(detailSection("Resource record", null, dl));
    view.append(
      h("p", { class: "destination-route", text: resource.href || "No route recorded." }),
      h(
        "p",
        { class: "destination-note" },
        "Standalone preview only. The live route is not loaded, saved progress is not changed and no assessment is submitted.",
      ),
    );

    view.append(
      h(
        "div",
        { class: "detail-actions" },
        button("Back to concept", "secondary-button", () => {
          if (concept) selectConcept(concept.id);
          else {
            state.detail = { type: "concept", id: state.selectedConceptId };
            renderDetail();
            focusDetailTitle();
          }
        }),
        resource.href
          ? button("Copy route", "ghost-button", () => copyText(resource.href))
          : null,
        state.returnContext
          ? button(`Return to ${formatShort(state.returnContext.date)} edition`, "ghost-button", () => {
              openDealer(state.returnContext.date, state.returnContext.view);
            })
          : null,
      ),
    );
    dom.detailContent.append(view);
  }

  // --------------------------------------------------------------------- goals

  function buildGoalBar() {
    clear(dom.goalBar);
    const label = h("label", { attrs: { for: "goal-select" }, text: "Goal" });
    const select = h("select", { attrs: { id: "goal-select", "aria-label": "Choose a supported learning goal" } });
    select.append(option("", "Choose a supported goal"));
    for (const goal of DATA.goals) {
      select.append(option(goal.goalId, goal.title));
    }
    select.addEventListener("change", () => setGoal(select.value || null));
    const publicNote = h("span", {
      class: "coverage-summary",
      text: "Goals withheld until publication",
    });
    publicNote.hidden = true;
    const coverage = h("span", { class: "coverage-summary" });
    dom.goalBar.append(label, select, publicNote, coverage);
    dom.goalLabel = label;
    dom.goalSelect = select;
    dom.goalPublicNote = publicNote;
    dom.goalCoverage = coverage;
  }

  function renderGoalBar() {
    if (!dom.goalSelect) return;
    const isPublic = state.mode === "public";
    if (dom.goalLabel) dom.goalLabel.hidden = isPublic;
    dom.goalSelect.hidden = isPublic;
    dom.goalPublicNote.hidden = !isPublic;
    dom.goalSelect.disabled = isPublic;
    if (!isPublic) dom.goalSelect.value = state.goalId || "";

    if (isPublic) {
      const coverage = PUBLIC?.coverage;
      dom.goalCoverage.textContent = `${coverage?.withheld?.conceptCount ?? 0} candidate concepts withheld · 0 published goal routes`;
      return;
    }
    const goal = goalRoute(state.goalId);
    if (!goal) {
      dom.goalCoverage.textContent = `${DATA.goals.length} candidate goals · all route targets have a recorded resource`;
      return;
    }
    const gaps = goal.coverage.gapConceptIds?.length || 0;
    dom.goalCoverage.textContent = `${goal.coverage.stepCount} steps · ${goal.coverage.targetsWithResource}/${goal.coverage.targetCount} targets with a resource · ${gaps ? `${gaps} gap${gaps === 1 ? "" : "s"}` : "no gaps"}`;
  }

  function setGoal(goalId) {
    if (!goalId) {
      state.goalId = null;
      state.goalStep = 0;
      state.detail = { type: "concept", id: state.selectedConceptId };
      renderAll();
      saveState();
      return;
    }
    const goal = goalRoute(goalId);
    if (!goal) return;
    state.goalId = goalId;
    state.goalStep = 0;
    const first = goal.steps[0];
    if (first) {
      const concept = conceptById.get(first.conceptId);
      if (concept) {
        state.constellation = concept.constellation;
        state.selectedConceptId = concept.id;
        state.showAll = false;
        state.activeEdgeId = null;
      }
    }
    state.detail = { type: "goal", id: goalId };
    renderAll();
    saveState();
    focusDetailTitle();
    showToast(`Route highlighted: ${goal.title}.`);
  }

  function setGoalStep(index) {
    const goal = goalRoute(state.goalId);
    if (!goal) return;
    const clamped = clamp(index, 0, goal.steps.length - 1);
    const step = goal.steps[clamped];
    if (!step) return;
    state.goalStep = clamped;
    const concept = conceptById.get(step.conceptId);
    if (concept) {
      state.constellation = concept.constellation;
      state.selectedConceptId = concept.id;
      state.showAll = false;
      state.activeEdgeId = null;
    }
    state.detail = { type: "goal", id: goal.goalId };
    renderAll();
    saveState();
    focusDetailTitle();
    dom.dealerStatus.textContent = "";
    showToast(`Step ${step.step} of ${goal.steps.length}: ${step.conceptLabel}.`);
  }

  function renderGoalDetail(goalId) {
    const goal = goalRoute(goalId);
    if (!goal) {
      renderConceptDetail(state.selectedConceptId);
      return;
    }
    const coverage = goal.coverage || {};
    const gaps = coverage.gapConceptIds?.length || 0;
    const view = h("article", { class: "detail-view goal-view" });
    view.append(
      detailEyebrow(
        h("span", { text: "Supported route" }),
        h("span", { class: "context-sep", text: "/" }),
        h("span", { text: "candidate goal" }),
        h("span", {
          class: `context-chip ${goal.supported ? "is-review" : ""}`,
          text: goal.supported ? "route supported" : "route gap",
        }),
      ),
      detailTitle(goal.title),
      h("p", { class: "detail-definition", text: goal.audience }),
      h("p", { class: "detail-scope", text: goal.basis }),
    );

    const chips = h("div", { class: "goal-coverage" });
    chips.append(
      h("span", { class: "coverage-chip", text: `${coverage.stepCount ?? goal.steps.length} steps` }),
      h("span", {
        class: `coverage-chip ${gaps ? "is-gap" : "is-good"}`,
        text: `${coverage.targetsWithResource ?? 0}/${coverage.targetCount ?? 0} targets with a resource`,
      }),
      h("span", {
        class: `coverage-chip ${gaps ? "is-gap" : "is-good"}`,
        text: gaps ? `${gaps} gap${gaps === 1 ? "" : "s"}` : "no route gaps",
      }),
      h("span", { class: "coverage-chip", text: "not a mastery estimate" }),
    );
    view.append(chips);

    if (goal.limitations) {
      view.append(h("p", { class: "edge-conditions", text: goal.limitations }));
    }
    if (Array.isArray(goal.limitationsApplied) && goal.limitationsApplied.length) {
      view.append(
        h(
          "ul",
          { class: "evidence-list" },
          ...goal.limitationsApplied.map((limitation) =>
            h("li", { class: "empty-note", text: limitation }),
          ),
        ),
      );
    }

    const list = h("ol", { class: "goal-steps" });
    goal.steps.forEach((step, index) => {
      const item = h("li", {
        class: "goal-step",
        dataset: {
          target: step.isTarget ? "true" : "false",
          current: index === state.goalStep ? "true" : "false",
        },
      });
      const body = h("div", {});
      body.append(
        h(
          "div",
          { class: "goal-step-title" },
          h("span", { text: step.conceptLabel }),
          h("span", { text: step.isTarget ? "target" : step.domain }),
        ),
        h("p", { class: "goal-step-reason", text: step.reason?.text || "Supporting step." }),
      );
      if (step.resource) {
        body.append(
          h("button", {
            type: "button",
            class: "goal-step-resource",
            text: `Open resource · ${step.resource.href}`,
            attrs: {
              "aria-label": `Preview recorded resource for ${step.conceptLabel}: ${step.resource.href}`,
            },
            onclick: () => openResource(step.resource, step.conceptId),
          }),
        );
      } else {
        body.append(
          h("p", { class: "goal-step-reason", text: "No resource recorded for this step." }),
        );
      }
      item.append(h("span", { class: "goal-step-index", text: String(step.step) }), body);
      list.append(item);
    });
    view.append(list);

    const walk = h("div", { class: "goal-walk" });
    walk.append(
      button("Previous step", "ghost-button", () => setGoalStep(state.goalStep - 1), {
        disabled: state.goalStep <= 0,
      }),
      button(
        state.goalStep >= goal.steps.length - 1 ? "Restart route" : "Next step",
        "secondary-button",
        () => setGoalStep(state.goalStep >= goal.steps.length - 1 ? 0 : state.goalStep + 1),
      ),
      button("Open current concept", "ghost-button", () => {
        const step = goal.steps[state.goalStep];
        if (step) selectConcept(step.conceptId);
      }),
    );
    view.append(walk);
    view.append(
      h(
        "p",
        { class: "route-status" },
        `Step ${state.goalStep + 1} of ${goal.steps.length} · ${gaps ? `${gaps} target${gaps === 1 ? "" : "s"} without a resource` : "every step has a recorded resource"}. Route support is not a mastery estimate.`,
      ),
    );
    view.append(
      h(
        "p",
        { class: "evidence-note" },
        "Candidate route. No assessment result, progress store or learner record is read or written.",
      ),
    );
    dom.detailContent.append(view);
  }

  // ------------------------------------------------------- closing / about UI

  function insightForClosing() {
    const returnDate = state.returnContext?.date;
    return (
      (returnDate ? insightByDate.get(returnDate) : null) ||
      selectedInsight() ||
      insightByDate.get(latestEdition) ||
      DATA.insights[0] ||
      null
    );
  }

  function updateClosing() {
    const insight = insightForClosing();
    if (!insight) {
      dom.closingResumeTitle.textContent = "No edition is available";
      dom.closingResumeCopy.textContent =
        "The bounded prototype payload has no edition to return to.";
      dom.closingResume.disabled = true;
      dom.closingPractice.disabled = true;
      return;
    }
    const edition = editionState(insight.date);
    const viewLabel =
      edition.view === "evidence"
        ? "evidence record"
        : edition.view === "destination"
          ? "destination preview"
          : "card reader";
    dom.closingResumeTitle.textContent = `Return to the ${formatShort(insight.date)} edition`;
    dom.closingResumeCopy.textContent =
      state.mode === "public"
        ? `The ${formatShort(insight.date)} edition stays an editorial preview in the public projection. Your ${viewLabel} is kept for this visit; nothing here is a published semantic claim.`
        : `The ${viewLabel} for ${formatShort(insight.date)} is kept for this visit. Candidate concepts and relations stay in editorial review.`;
    dom.closingResume.disabled = false;
    dom.closingPractice.disabled = false;
    dom.closingPractice.setAttribute(
      "aria-label",
      `Preview the practice route recorded for the ${formatShort(insight.date)} edition`,
    );
  }

  // --------------------------------------------------------- review register

  let registerOpener = null;
  let aboutOpener = null;

  function sceneHash(scene) {
    return scene === "timeline" ? "#today" : `#${scene}`;
  }

  function registerConceptName(conceptId) {
    const concept = conceptById.get(conceptId);
    if (concept) return concept.label;
    const tail = shortConceptId(conceptId).split(":").pop() || conceptId;
    return humanizeToken(tail);
  }

  function inspectRegisterConcept(conceptId) {
    if (!conceptById.has(conceptId)) return;
    closeRegister({ fromHistory: true, restoreFocus: false });
    history.replaceState({ scene: "atlas" }, "", "#atlas");
    selectConcept(conceptId, { keepAll: false });
    goToScene("atlas", { push: false });
    showToast("Candidate concept opened. Human publication review is still pending.");
  }

  function registerEvidence(entry) {
    const box = h("div", { class: "register-evidence" });
    for (const item of entry.evidence || []) {
      box.append(
        h("span", {
          text: `${item.label} · ${(item.families || []).join(", ")}`,
          attrs: { title: item.pattern || item.label },
        }),
      );
    }
    return box;
  }

  function renderRegister() {
    const register = DATA.reviewRegister;
    if (!register) return;
    dom.ambiguityCount.textContent = String(register.ambiguities.length);
    dom.contradictionCount.textContent = String(register.contradictions.length);

    clear(dom.registerPanelAmbiguities);
    clear(dom.registerPanelContradictions);

    for (const entry of register.ambiguities) {
      const item = h("article", { class: "register-item" });
      item.append(
        h(
          "div",
          { class: "register-item-top" },
          h("h3", { text: entry.term, attrs: { dir: "auto" } }),
          h("span", {
            class: "register-item-kind",
            text: humanizeToken(entry.kind),
          }),
        ),
        h("p", {
          text: `Resolution: ${humanizeToken(entry.resolution)}. ${entry.decision}`,
        }),
      );

      const senses = h("ul", { class: "register-senses" });
      for (const sense of entry.senses || []) {
        const inSubset = conceptById.has(sense.conceptId);
        const row = h("li", { class: "register-sense" });
        const copy = h(
          "div",
          {},
          h("strong", { text: registerConceptName(sense.conceptId) }),
          h("span", { text: sense.scope, attrs: { dir: "auto" } }),
        );
        const inspect = h("button", {
          type: "button",
          text: inSubset ? "Inspect" : "Outside subset",
          attrs: {
            disabled: !inSubset,
            title: inSubset
              ? "Open this candidate concept in the Atlas."
              : "This concept is in the full analysis graph but outside the 59-concept prototype subset.",
          },
        });
        if (inSubset) {
          inspect.addEventListener("click", () => inspectRegisterConcept(sense.conceptId));
        }
        row.append(copy, inspect);
        senses.append(row);
      }
      item.append(senses, registerEvidence(entry));
      dom.registerPanelAmbiguities.append(item);
    }

    for (const entry of register.contradictions) {
      const item = h("article", { class: "register-item" });
      item.append(
        h(
          "div",
          { class: "register-item-top" },
          h("h3", { text: entry.topic }),
          h("span", {
            class: "register-item-kind",
            text: `${humanizeToken(entry.classification)} · ${entry.severity}`,
          }),
        ),
        h(
          "p",
          {},
          h("strong", { text: "Claim A. " }),
          entry.claimA,
        ),
        h(
          "p",
          {},
          h("strong", { text: "Claim B. " }),
          entry.claimB,
        ),
        h("p", { text: `Resolution: ${entry.resolution}` }),
        h("span", {
          class: "register-status",
          text: humanizeToken(entry.status),
        }),
        registerEvidence(entry),
      );
      dom.registerPanelContradictions.append(item);
    }
  }

  function setRegisterTab(tab, options = {}) {
    if (tab !== "ambiguities" && tab !== "contradictions") return;
    state.registerTab = tab;
    for (const control of dom.registerTabs) {
      const selected = control.dataset.registerTab === tab;
      control.setAttribute("aria-selected", selected ? "true" : "false");
      control.tabIndex = selected ? 0 : -1;
      if (selected && options.focus) focusElement(control);
    }
    dom.registerPanelAmbiguities.hidden = tab !== "ambiguities";
    dom.registerPanelContradictions.hidden = tab !== "contradictions";
    saveState();
  }

  function openRegister(options = {}) {
    if (state.mode === "public") {
      showToast("The review register is withheld in the public projection.");
      return;
    }
    const wasOpen = !dom.registerBackdrop.hidden;
    if (!wasOpen) registerOpener = document.activeElement;
    renderRegister();
    dom.registerBackdrop.hidden = false;
    setRegisterTab(state.registerTab);
    syncBodyLock();
    if (!wasOpen && !options.fromHistory) {
      history.pushState(
        { modal: "register", scene: state.activeScene },
        "",
        "#register",
      );
    }
    if (!wasOpen) focusElement(dom.registerDialog);
  }

  function closeRegister(options = {}) {
    if (dom.registerBackdrop.hidden) return;
    dom.registerBackdrop.hidden = true;
    syncBodyLock();
    const opener = registerOpener;
    registerOpener = null;
    if (!options.fromHistory) {
      if (history.state && history.state.modal === "register") {
        history.back();
      } else {
        history.replaceState(
          { scene: state.activeScene },
          "",
          sceneHash(state.activeScene),
        );
      }
    }
    if (options.restoreFocus !== false && opener && opener.isConnected) {
      focusElement(opener);
    }
  }

  // -------------------------------------------------------------------- about

  function aboutStat(value, label) {
    return h(
      "div",
      { class: "about-stat" },
      h("strong", { text: String(value) }),
      h("span", { text: label }),
    );
  }

  function renderAbout() {
    const coverage = DATA.coverage || {};
    const states = coverage.states || {};
    const projection = PUBLIC?.publicProjection || DATA.publicProjection || {};
    const publicCoverage = PUBLIC?.coverage || {};
    const gates = projection.gates || {};
    const reasons = Object.values(coverage.unmappedReasons || {}).sort(
      (a, b) => b.count - a.count,
    );
    const eligible = coverage.eligibleUnits || 0;
    const mapped = states["analyzed-mapped"] || 0;
    const mappedRate = eligible ? ((mapped / eligible) * 100).toFixed(1) : "0.0";
    const published = projection.publishedConcepts?.length || 0;
    const publishedEdges = projection.publishedAssertions?.length || 0;

    clear(dom.aboutBody);
    dom.aboutBody.append(
      h("p", {
        text: "This is a standalone visual-review artifact. It is not integrated into the live application and it was not deployed. Every semantic record it displays is a candidate unless the public projection says otherwise.",
      }),
      h(
        "div",
        { class: "about-stats" },
        aboutStat(NUMBER.format(coverage.units || 0), "extracted units"),
        aboutStat(NUMBER.format(eligible), "eligible units"),
        aboutStat(`${mappedRate}%`, "mapped to a concept"),
        aboutStat(String(coverage.concepts || 0), "canonical concepts"),
        aboutStat(String(coverage.assertions || 0), "candidate assertions"),
        aboutStat(String(published), "published concepts"),
      ),
      h("h3", { text: "Full-corpus analysis" }),
      h("p", {
        text: `The recursive extraction pass covers ${NUMBER.format(coverage.units || 0)} units across ${projection.structural?.sourceCount || 22} sources and ${projection.structural?.routeCount || 73} routes. ${NUMBER.format(eligible)} units are eligible for semantic mapping; ${NUMBER.format(mapped)} (${mappedRate}%) mapped to one of ${coverage.concepts || 0} canonical concepts. ${NUMBER.format(states["analyzed-unmapped"] || 0)} eligible units remain explicitly unmapped, ${NUMBER.format(states["excluded-metadata-only"] || 0)} link-only records are excluded as metadata, and ${NUMBER.format(states["excluded-nonlearning"] || 0)} professional pages are excluded as non-learning.`,
      }),
      h("p", {
        text: "Unmapped is a disposition, not a pending queue. Each unit carries a reason code so the gap is inspectable instead of being hidden inside a percentage.",
      }),
      h(
        "ul",
        {},
        ...reasons.map((reason) =>
          h(
            "li",
            {},
            h("strong", { text: `${reason.code} · ${reason.count}` }),
            ` — ${reason.detail}`,
          ),
        ),
      ),
      h("h3", { text: "Candidate semantic graph" }),
      h("p", {
        text: `${coverage.concepts || 0} canonical concepts, ${coverage.conceptsWithCorpusSupport || 0} with corpus support and ${coverage.registryOnlyConcepts?.length || 0} registry-only. The graph holds ${NUMBER.format(coverage.mappings || 0)} concept mappings and ${coverage.assertions || 0} typed assertions: ${coverage.directSupport || 0} direct, ${coverage.inferredSupport || 0} inferred and ${coverage.crossDomainAssertions || 0} cross-domain. All assertions are candidates. Zero are published.`,
      }),
      h("p", {
        text: `The review register keeps ${coverage.ambiguities || 0} ambiguities and ${coverage.contradictions || 0} contradictions separate from the graph. Homonyms remain split by scope; apparent contradictions are resolved by scope or kept open for editorial review.`,
      }),
      h("h3", { text: "Prototype subset is a rendering choice" }),
      h("p", {
        text: `The interactive prototype renders ${coverage.prototypeConcepts || 0} concepts, ${coverage.prototypeEdges || 0} candidate relations and ${coverage.prototypeResources || 0} recorded resources from three real editions and three supported goal routes. This bounded subset is not the analysis denominator. The full ledger and graph artifacts remain in intelligent-atlas/analysis/.`,
      }),
      h("h3", { text: "Publication gates" }),
      h(
        "ul",
        {},
        h("li", {
          text: `Human publication review: ${gates.humanPublicationReview || "blocked"}.`,
        }),
        h("li", {
          text: `Scientific review: ${gates.scientificReview || "pending"}.`,
        }),
        h("li", { text: `Rights review: ${gates.rightsReview || "pending"}.` }),
        h("li", {
          text: `Assessment review: ${humanizeToken(gates.assessmentReview || "not applicable to this projection")}.`,
        }),
        h("li", {
          text: `Public projection: ${published} published concepts and ${publishedEdges} published relations. ${NUMBER.format(publicCoverage.withheld?.conceptCount ?? coverage.concepts ?? 0)} candidate concepts and ${publicCoverage.withheld?.assertionCount ?? coverage.assertions ?? 0} assertions are withheld.`,
        }),
      ),
      h("h3", { text: "What this does not prove" }),
      h(
        "ul",
        {},
        h("li", {
          text: "It does not prove publication readiness, scientific correctness, rights clearance or assessment validity.",
        }),
        h("li", {
          text: "It does not prove mastery or learning gain. No assessment result, progress store or learner record is read or written.",
        }),
        h("li", {
          text: "Media references were treated as text through captions and alt text; the images and videos were not independently visually reviewed.",
        }),
        h("li", {
          text: "It does not load live routes, execute Fabric or SQL, or change saved application state.",
        }),
        h("li", {
          text: "Browser and visual QA are reported separately from analysis coverage; a passing build is not an accessibility or educational audit.",
        }),
      ),
      h("h3", { text: "Reproduce the artifacts" }),
      h("pre", {
        class: "about-code",
        text: "node intelligent-atlas/tools/build-corpus.mjs\nnode intelligent-atlas/tools/analyze-corpus.mjs\nnode intelligent-atlas/tools/build-prototype-data.mjs",
      }),
      h("h3", { text: "Determinism" }),
      h("pre", {
        class: "about-code",
        text: `graphBuildId   ${DATA.graphBuildId}\nledger SHA-256 ${DATA.ledgerFingerprint}\nregistry       ${DATA.registryVersion}\nprototype      ${coverage.prototypeConcepts || 0} concepts / ${coverage.prototypeEdges || 0} edges / ${coverage.prototypeResources || 0} resources`,
      }),
    );
  }

  function openAbout(options = {}) {
    const wasOpen = !dom.aboutBackdrop.hidden;
    if (!wasOpen) aboutOpener = document.activeElement;
    renderAbout();
    dom.aboutBackdrop.hidden = false;
    syncBodyLock();
    if (!wasOpen && !options.fromHistory) {
      history.pushState(
        { modal: "about", scene: state.activeScene },
        "",
        "#about",
      );
    }
    if (!wasOpen) focusElement(dom.aboutDialog);
  }

  function closeAbout(options = {}) {
    if (dom.aboutBackdrop.hidden) return;
    dom.aboutBackdrop.hidden = true;
    syncBodyLock();
    const opener = aboutOpener;
    aboutOpener = null;
    if (!options.fromHistory) {
      if (history.state && history.state.modal === "about") {
        history.back();
      } else {
        history.replaceState(
          { scene: state.activeScene },
          "",
          sceneHash(state.activeScene),
        );
      }
    }
    if (options.restoreFocus !== false && opener && opener.isConnected) {
      focusElement(opener);
    }
  }

  // ------------------------------------------------------------- modal mechanics

  function syncBodyLock() {
    const locked =
      !dom.dealerBackdrop.hidden ||
      !dom.registerBackdrop.hidden ||
      !dom.aboutBackdrop.hidden;
    document.body.classList.toggle("is-locked", locked);
    if (dom.topbar) dom.topbar.inert = locked;
    if (dom.journey) dom.journey.inert = locked;
  }

  function activeModal() {
    if (!dom.aboutBackdrop.hidden) {
      return { name: "about", dialog: dom.aboutDialog, close: closeAbout };
    }
    if (!dom.registerBackdrop.hidden) {
      return { name: "register", dialog: dom.registerDialog, close: closeRegister };
    }
    if (!dom.dealerBackdrop.hidden) {
      return { name: "dealer", dialog: dom.dealerDialog, close: closeDealer };
    }
    return null;
  }

  function focusableElements(root) {
    return [...root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter(
      (element) =>
        !element.hidden &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.getClientRects().length > 0,
    );
  }

  function onDocumentKeydown(event) {
    const modal = activeModal();
    if (!modal) return;

    if (event.key === "Escape") {
      event.preventDefault();
      if (modal.name === "dealer") {
        const edition = editionState(state.dealerDate);
        if (edition.view !== "card") {
          setDealerView("card");
          focusReaderTitle();
        } else {
          closeDealer();
        }
      } else {
        modal.close();
      }
      return;
    }

    if (event.key !== "Tab") return;
    const items = focusableElements(modal.dialog);
    if (!items.length) {
      event.preventDefault();
      focusElement(modal.dialog);
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    const inside = modal.dialog.contains(active);
    if (event.shiftKey) {
      if (!inside || active === first || active === modal.dialog) {
        event.preventDefault();
        focusElement(last);
      }
    } else if (!inside || active === last) {
      event.preventDefault();
      focusElement(first);
    }
  }

  function bindBackdrop(backdrop, close) {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) close();
    });
  }

  // ---------------------------------------------------------------- rendering

  function renderAll() {
    document.body.dataset.mode = state.mode;
    updateModeButtons();
    updateThemeButtons();
    updateTimelineSelection();
    updateTimelineCardStatuses();
    renderAtlasHeader();
    renderAtlasControls();
    if (state.mode === "public") renderPublicGraph();
    else if (state.view === "list") renderList();
    else renderGraph();
    renderDetail();
    renderGoalBar();
    renderAtlasReturn();
    updateClosing();
    renderHandoffMeta();
  }

  // ---------------------------------------------------------------- DOM cache

  function cacheDom() {
    const byId = (id) => document.getElementById(id);
    dom.topbar = byId("topbar");
    dom.journey = byId("journey");
    dom.journeyTrack = byId("journey-track");
    dom.stage = byId("stage");
    dom.scenes = [...document.querySelectorAll(".scene")];
    dom.themeToggle = byId("theme-toggle");
    dom.aboutOpen = byId("about-open");
    dom.modeButtons = [...document.querySelectorAll(".mode-switch [data-mode]")];

    dom.timelineStage = byId("timeline-stage");
    dom.timelineCables = byId("timeline-cables");
    dom.timelineTrack = byId("timeline-track");
    dom.timelineRuler = byId("timeline-ruler");
    dom.timelinePrev = byId("timeline-prev");
    dom.timelineNext = byId("timeline-next");
    dom.openEdition = byId("open-edition");
    dom.editionPeek = byId("edition-peek");
    dom.focusLabel = byId("focus-label");
    dom.timelineStatusCount = byId("timeline-status-count");
    dom.timelineStatusSubset = byId("timeline-status-subset");
    dom.timelineStatusPublic = byId("timeline-status-public");

    dom.atlasContext = byId("atlas-context");
    dom.atlasModeLabel = byId("atlas-mode-label");
    dom.atlasTools = document.querySelector(".atlas-tools");
    dom.constellationSwitch = byId("constellation-switch");
    dom.lensSwitch = byId("lens-switch");
    dom.viewSwitch = document.querySelector(".view-switch");
    dom.searchInput = byId("atlas-search");
    dom.searchResults = byId("search-results");
    dom.reviewRegisterButton = byId("review-register-open");
    dom.reviewRegisterCount = byId("review-register-count");
    dom.graphFrame = byId("graph-frame");
    dom.graphCaption = byId("graph-caption");
    dom.graphExpand = byId("graph-expand");
    dom.graphCanvas = byId("graph-canvas");
    dom.graphEdges = byId("graph-edges");
    dom.graphIslands = byId("graph-islands");
    dom.graphNodes = byId("graph-nodes");
    dom.graphEmpty = byId("graph-empty");
    dom.graphSummary = byId("graph-summary");
    dom.graphLegend = byId("graph-legend");
    dom.graphList = byId("graph-list");
    dom.listIntro = byId("list-intro");
    dom.listGroups = byId("list-groups");
    dom.detailPanel = byId("detail-panel");
    dom.detailContent = byId("detail-content");
    dom.goalBar = byId("goal-bar");
    dom.atlasReturn = byId("atlas-return");

    dom.dealerBackdrop = byId("dealer-backdrop");
    dom.dealerDialog = byId("dealer-dialog");
    dom.dealerClose = byId("dealer-close");
    dom.dealerKickerDate = byId("dealer-kicker-date");
    dom.dealerTitle = byId("dealer-title");
    dom.dealerSummary = byId("dealer-summary");
    dom.dealerReviewBadge = byId("dealer-review-badge");
    dom.dealerEditionRail = byId("dealer-edition-rail");
    dom.handLabel = byId("hand-label");
    dom.dealerHand = byId("dealer-hand");
    dom.dealerReader = byId("dealer-reader");
    dom.dealerFootNote = byId("dealer-foot-note");
    dom.dealerBackTimeline = byId("dealer-back-timeline");
    dom.dealerLocate = byId("dealer-locate");
    dom.dealerStatus = byId("dealer-status");

    dom.registerBackdrop = byId("register-backdrop");
    dom.registerDialog = byId("register-dialog");
    dom.registerClose = byId("register-close");
    dom.registerTabs = [...document.querySelectorAll("[data-register-tab]")];
    dom.registerPanelAmbiguities = byId("register-panel-ambiguities");
    dom.registerPanelContradictions = byId("register-panel-contradictions");
    dom.ambiguityCount = byId("ambiguity-count");
    dom.contradictionCount = byId("contradiction-count");

    dom.aboutBackdrop = byId("about-backdrop");
    dom.aboutDialog = byId("about-dialog");
    dom.aboutClose = byId("about-close");
    dom.aboutBody = byId("about-body");

    dom.closingPractice = byId("closing-practice");
    dom.closingResume = byId("closing-resume");
    dom.closingResumeTitle = byId("closing-resume-title");
    dom.closingResumeCopy = byId("closing-resume-copy");
    dom.closingAbout = byId("closing-about");
    dom.closingTheme = byId("closing-theme");
    dom.closingSeamMeta = byId("closing-seam-meta");

    dom.handoffMeta = byId("handoff-meta");
    dom.progressFill = byId("journey-progress-fill");
    dom.progressValue = byId("journey-progress-value");
    dom.toast = byId("toast");
  }

  // ------------------------------------------------------------ event binding

  function bindGlobalEvents() {
    dom.themeToggle.addEventListener("click", toggleTheme);
    dom.aboutOpen.addEventListener("click", () => openAbout());

    for (const control of dom.modeButtons) {
      control.addEventListener("click", () => setMode(control.dataset.mode));
    }

    for (const link of document.querySelectorAll("[data-scene-link]")) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        goToScene(link.dataset.sceneLink, { push: true, focus: true });
      });
    }

    dom.timelinePrev.addEventListener("click", () => {
      selectTimelineIndex(dates.indexOf(state.selectedDate) - 1);
    });
    dom.timelineNext.addEventListener("click", () => {
      selectTimelineIndex(dates.indexOf(state.selectedDate) + 1);
    });
    dom.openEdition.addEventListener("click", () => {
      const insight = selectedInsight();
      openDealer(insight ? insight.date : latestEdition);
    });

    dom.dealerClose.addEventListener("click", () => closeDealer());
    dom.dealerBackTimeline.addEventListener("click", () => {
      closeDealer({ fromHistory: true, restoreFocus: false });
      history.replaceState({ scene: "timeline" }, "", "#today");
      goToScene("timeline", { push: false, focus: true });
    });
    dom.dealerLocate.addEventListener("click", () => {
      const insight = insightByDate.get(state.dealerDate);
      if (insight) locateInAtlas(insight);
    });

    dom.reviewRegisterButton.addEventListener("click", () => openRegister());
    dom.registerClose.addEventListener("click", () => closeRegister());
    for (const tab of dom.registerTabs) {
      tab.addEventListener("click", () =>
        setRegisterTab(tab.dataset.registerTab, { focus: false }),
      );
      tab.addEventListener("keydown", (event) => {
        const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const index = dom.registerTabs.indexOf(tab);
        let next = index;
        if (event.key === "ArrowLeft") next = (index - 1 + dom.registerTabs.length) % dom.registerTabs.length;
        if (event.key === "ArrowRight") next = (index + 1) % dom.registerTabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = dom.registerTabs.length - 1;
        setRegisterTab(dom.registerTabs[next].dataset.registerTab, { focus: true });
      });
    }

    dom.aboutClose.addEventListener("click", () => closeAbout());
    dom.closingPractice.addEventListener("click", () => {
      const insight = insightForClosing();
      if (insight) openDealer(insight.date, "destination");
    });
    dom.closingResume.addEventListener("click", () => {
      const insight = insightForClosing();
      if (insight) openDealer(insight.date, editionState(insight.date).view);
    });
    dom.closingAbout.addEventListener("click", () => openAbout());
    dom.closingTheme.addEventListener("click", toggleTheme);

    dom.graphExpand.addEventListener("click", () => {
      if (state.mode === "public") return;
      state.showAll = !state.showAll;
      renderGraph();
      renderAtlasControls();
      saveState();
      showToast(
        state.showAll
          ? `Showing every component in region ${state.constellation}.`
          : "Focused on the selected island. Other components are summarised below the graph.",
      );
    });

    bindBackdrop(dom.dealerBackdrop, () => closeDealer());
    bindBackdrop(dom.registerBackdrop, () => closeRegister());
    bindBackdrop(dom.aboutBackdrop, () => closeAbout());

    window.addEventListener("scroll", onScroll, { passive: true });
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => syncLayoutMode(), 120);
    });
    reducedMotion.addEventListener("change", syncLayoutMode);
    narrowLayout.addEventListener("change", syncLayoutMode);
    document.addEventListener("keydown", onDocumentKeydown);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", saveState);
  }

  // -------------------------------------------------------------- history/init

  function closeOtherModals(name) {
    if (name !== "dealer" && !dom.dealerBackdrop.hidden) {
      closeDealer({ fromHistory: true, restoreFocus: false });
    }
    if (name !== "register" && !dom.registerBackdrop.hidden) {
      closeRegister({ fromHistory: true, restoreFocus: false });
    }
    if (name !== "about" && !dom.aboutBackdrop.hidden) {
      closeAbout({ fromHistory: true, restoreFocus: false });
    }
  }

  function handlePopState() {
    const hash = location.hash;
    const editionMatch = /^#edition\/(\d{4}-\d{2}-\d{2})$/.exec(hash);

    if (editionMatch && editionDates.includes(editionMatch[1])) {
      closeOtherModals("dealer");
      const view = history.state?.view;
      if (dom.dealerBackdrop.hidden) {
        openDealer(editionMatch[1], view, { fromHistory: true });
      } else {
        state.dealerDate = editionMatch[1];
        if (view && ["card", "evidence", "destination"].includes(view)) {
          editionState(state.dealerDate).view = view;
        }
        renderDealer();
      }
      return;
    }

    if (hash === "#register" && state.mode === "review") {
      closeOtherModals("register");
      if (dom.registerBackdrop.hidden) openRegister({ fromHistory: true });
      return;
    }

    if (hash === "#about") {
      closeOtherModals("about");
      if (dom.aboutBackdrop.hidden) openAbout({ fromHistory: true });
      return;
    }

    if (!dom.dealerBackdrop.hidden) closeDealer({ fromHistory: true });
    if (!dom.registerBackdrop.hidden) closeRegister({ fromHistory: true });
    if (!dom.aboutBackdrop.hidden) closeAbout({ fromHistory: true });

    const scene = hashToScene(hash);
    if (scene) goToScene(scene, { push: false, instant: true });
  }

  function restoreScroll() {
    const saved = readSession(SCROLL_KEY);
    if (!saved) return;
    if (saved.stacked === isStacked() && typeof saved.scrollY === "number") {
      window.scrollTo({ top: saved.scrollY, behavior: "auto" });
      return;
    }
    if (!isStacked() && typeof saved.progress === "number") {
      goToProgress(saved.progress, { instant: true });
    }
  }

  function restoreFromHash() {
    const hash = location.hash;
    const editionMatch = /^#edition\/(\d{4}-\d{2}-\d{2})$/.exec(hash);
    if (editionMatch && editionDates.includes(editionMatch[1])) {
      openDealer(editionMatch[1], history.state?.view, { fromHistory: true });
      return;
    }
    if (hash === "#register") {
      if (state.mode === "review") {
        openRegister({ fromHistory: true });
      } else {
        history.replaceState({ scene: "atlas" }, "", "#atlas");
        goToScene("atlas", { push: false, instant: true });
      }
      return;
    }
    if (hash === "#about") {
      openAbout({ fromHistory: true });
      return;
    }
    const scene = hashToScene(hash);
    if (scene) {
      goToScene(scene, { push: false, instant: true });
      return;
    }
    restoreScroll();
  }

  function init() {
    cacheDom();
    syncTopbarHeight();
    restoreState();
    timeline.position = Math.max(0, dates.indexOf(state.selectedDate));
    buildTimeline();
    buildEditionRail();
    buildConstellationSwitch();
    buildLensSwitch();
    buildGoalBar();
    bindViewSwitch();
    bindSearch();
    bindTimelineDrag();
    bindGlobalEvents();
    updateThemeButtons();
    updateModeButtons();
    document.body.dataset.mode = state.mode;
    renderAll();

    requestAnimationFrame(() => {
      resizeTimeline();
      renderGraph();
      restoreFromHash();
      updateJourney();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
