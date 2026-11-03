// Knowledge Dealer v2 resolver.
//
// Pure data in / pure data out: no DOM, viewport, animation or storage logic.
// A provider may return a ready deck, an empty result, an unavailable source,
// an unsupported request or an error. Zero cards is explicit; one and many are
// equally valid. v1 one-card editions are adapted, not reinterpreted.

export const DECK_REQUEST_SCHEMA = "intelligent-atlas-deck-request/2.0";
export const DECK_RESOLUTION_SCHEMA = "intelligent-atlas-deck-resolution/2.0";
export const RETURN_CONTEXT_VERSION = "return-context/1.0";
export const CARD_KINDS = new Set(["insight", "resource", "route-step", "evidence"]);
export const ORIGIN_TYPES = new Set(["daily-edition", "concept", "goal", "saved-selection"]);
export const MAX_CARDS = 12;
export const MAX_RETURN_EXPANSION = 20;

const SAFE_INTERNAL = /^\//;
const SAFE_SOURCE = /^https:\/\/learn\.microsoft\.com\//;

export function sanitizeHref(value) {
  if (typeof value !== "string" || value.length > 2048) return null;
  if (SAFE_INTERNAL.test(value) || SAFE_SOURCE.test(value)) return value;
  return null;
}

function text(value, max = 1200) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function id(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 200 ? value : null;
}

export function validateReturnContext(value) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, errors: ["Return context must be an object."], value: null };
  }
  if (value.version !== RETURN_CONTEXT_VERSION) errors.push("Unsupported return-context version.");
  if (!["timeline", "knowledge", "closing"].includes(value.scene)) errors.push("Unknown return scene.");
  if (value.date && !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) errors.push("Invalid return date.");
  for (const key of ["editionId", "conceptId", "goalId", "originFocusId"]) {
    if (value[key] != null && !id(value[key])) errors.push(`Invalid ${key}.`);
  }
  if (value.intent && !["understand", "compare", "apply", "goal"].includes(value.intent)) {
    errors.push("Unknown return intent.");
  }
  if (value.resource) {
    if (value.resource.unitId && !id(value.resource.unitId)) errors.push("Invalid resource unitId.");
    if (value.resource.href && !sanitizeHref(value.resource.href)) errors.push("Unsafe resource href.");
  }
  if (value.comparison) {
    for (const key of ["left", "right", "conditionId"]) {
      if (value.comparison[key] != null && !id(value.comparison[key])) errors.push(`Invalid comparison ${key}.`);
    }
  }
  if (value.expansion) {
    if (!Array.isArray(value.expansion.ids) || value.expansion.ids.length > MAX_RETURN_EXPANSION) {
      errors.push("Expansion must be a bounded array.");
    } else if (value.expansion.ids.some((entry) => !id(entry))) {
      errors.push("Expansion contains an invalid id.");
    }
    if (
      value.expansion.limit != null &&
      (!Number.isInteger(value.expansion.limit) || value.expansion.limit < 0 || value.expansion.limit > MAX_RETURN_EXPANSION)
    ) {
      errors.push("Expansion limit is out of range.");
    }
  }
  return { ok: errors.length === 0, errors, value: errors.length === 0 ? value : null };
}

function capability(overrides = {}) {
  return { discover: true, readFull: false, assess: false, relate: false, ...overrides };
}

function sourceRef(unitId, sourcePath, locator, extra = {}) {
  return {
    unitId: id(unitId) ?? "unknown-unit",
    sourcePath: text(sourcePath, 500),
    locator: text(locator, 500),
    ...extra,
  };
}

function card({
  cardId,
  kind,
  title,
  summary = "",
  contentRef,
  evidence = [],
  reader,
  capabilities,
  allowedActions = [],
  reviewState = "candidate",
  revision = 1,
}) {
  return {
    cardId,
    revision,
    kind,
    title: text(title, 240),
    summary: text(summary, 1200),
    contentRef,
    evidence: evidence.slice(0, 8),
    reader,
    capabilities,
    allowedActions: allowedActions.slice(0, 8),
    reviewState,
  };
}

function summarizeCapabilities(cards) {
  return cards.reduce(
    (summary, entry) => ({
      discover: summary.discover || entry.capabilities.discover,
      readFull: summary.readFull || entry.capabilities.readFull,
      assess: summary.assess || entry.capabilities.assess,
      relate: summary.relate || entry.capabilities.relate,
    }),
    capability({ discover: false }),
  );
}

function normalizeDeck(deck, context, limitations) {
  if (!deck || typeof deck !== "object") return null;
  const cards = Array.isArray(deck.cards) ? deck.cards.filter((entry) => CARD_KINDS.has(entry?.kind)) : [];
  const capped = cards.slice(0, MAX_CARDS);
  if (cards.length > MAX_CARDS) {
    limitations.push(`Deck exceeded the operational cap of ${MAX_CARDS} cards; extra cards were not rendered.`);
  }
  const valid = capped.filter((entry) => id(entry.cardId) && id(entry.contentRef?.unitId));
  if (valid.length !== capped.length) {
    limitations.push("Some cards lacked a stable identity or content reference and were withheld.");
  }
  const normalized = {
    deckId: id(deck.deckId) ?? `${context.requestId}-deck`,
    revision: Number.isInteger(deck.revision) ? deck.revision : 1,
    title: text(deck.title, 240),
    provenance: {
      source: text(deck.provenance?.source, 500),
      reviewState: ["candidate", "technical_review", "published"].includes(deck.provenance?.reviewState)
        ? deck.provenance.reviewState
        : "candidate",
      checkedAt: text(deck.provenance?.checkedAt, 40),
      basis: text(deck.provenance?.basis, 500),
    },
    reason: text(deck.reason, 1000),
    cards: valid,
    cardCount: valid.length,
    capabilitySummary: summarizeCapabilities(valid),
    limitations: [...new Set([...(deck.limitations ?? []).map((entry) => text(entry, 500)), ...limitations])],
    allowedActions: (deck.allowedActions ?? []).slice(0, 8),
  };
  if (deck.cardCount != null && deck.cardCount !== normalized.cardCount) {
    normalized.limitations.push(
      `Derived cardCount ${normalized.cardCount} corrected a supplied value of ${deck.cardCount}.`,
    );
  }
  return normalized;
}

function emptyResolution(request, context, { reasonCode, explanation, nextAction, limitations = [] }) {
  const deck = {
    deckId: `${request.requestId}-empty`,
    revision: 1,
    title: "No cards available",
    provenance: { source: "deck resolver", reviewState: "candidate" },
    reason: explanation,
    cards: [],
    cardCount: 0,
    capabilitySummary: capability({ discover: false }),
    limitations,
    allowedActions: [],
  };
  return {
    schemaVersion: DECK_RESOLUTION_SCHEMA,
    status: "empty",
    requestId: request.requestId,
    graphBuildId: context.graphBuildId,
    sourceIndexBuildId: context.sourceIndexBuildId,
    reasonCode,
    explanation,
    limitations,
    nextAction,
    deck,
  };
}

function failure(request, context, status, reasonCode, explanation, nextAction) {
  return {
    schemaVersion: DECK_RESOLUTION_SCHEMA,
    status,
    requestId: request.requestId,
    graphBuildId: context.graphBuildId,
    sourceIndexBuildId: context.sourceIndexBuildId,
    reasonCode,
    explanation,
    limitations: [explanation],
    nextAction,
    deck: null,
  };
}

// ---------------------------------------------------------------- providers

export function dailyEditionProvider(origin, data, context) {
  const insights = Array.isArray(data.insights) ? data.insights : [];
  const matches = insights.filter((entry) =>
    origin.editionId ? entry.id === origin.editionId : entry.date === origin.date,
  );
  const eligible = matches.filter((entry) => {
    if (entry.reviewStatus === "held" || entry.reviewStatus === "withdrawn") return false;
    if (context.mode === "public") return entry.publicationState === "published" && entry.publicEligible !== false;
    return entry.reviewStatus === "technical_review" || entry.reviewStatus === "published";
  });
  if (!matches.length) {
    return {
      status: "empty",
      reasonCode: "no-edition-for-date",
      explanation: "No daily edition is recorded for the requested date.",
    };
  }
  if (!eligible.length) {
    return {
      status: "unavailable",
      reasonCode: "edition-withheld",
      explanation:
        context.mode === "public"
          ? "This edition has not completed publication review, so it is not part of the public artifact."
          : "This edition is held or withdrawn and cannot be shown as an active deck.",
    };
  }
  const cards = eligible.map((insight) => {
    const conceptId = id(insight.conceptId);
    const held = insight.reviewStatus === "held";
    const actions = [];
    if (conceptId) actions.push({ type: "locate-in-knowledge", label: "Locate in knowledge", targetId: conceptId });
    if (sanitizeHref(insight.lessonHref)) actions.push({ type: "open-resource", label: "Open lesson", href: insight.lessonHref });
    if (sanitizeHref(insight.practiceHref)) actions.push({ type: "open-resource", label: "Open practice", href: insight.practiceHref });
    return card({
      cardId: `card-${insight.id}`,
      kind: "insight",
      title: insight.cardTitle || insight.title,
      summary: insight.takeaway || insight.scenario,
      contentRef: sourceRef(insight.id, "content/knowledge/insights.json", `items[id=${insight.id}]`, {
        sourceId: insight.sourceId,
        sourceUrl: sanitizeHref(insight.sourceUrl) ?? undefined,
        canonicalHref: sanitizeHref(insight.lessonHref) ?? undefined,
        language: "en",
        revision: 1,
      }),
      evidence: [
        {
          unitId: insight.id,
          locator: insight.sourceLocator ?? "",
          quote: insight.takeaway ?? "",
        },
      ],
      reader: {
        mode: "inline",
        payload: {
          scenario: text(insight.scenario, 2000),
          prediction: text(insight.prediction, 1000),
          takeaway: text(insight.takeaway, 2000),
          caveat: text(insight.caveat, 2000),
        },
      },
      capabilities: capability({
        readFull: !held && Boolean(insight.takeaway),
        assess: Array.isArray(insight.questionIds) && insight.questionIds.length > 0 && !held,
        relate: Boolean(conceptId),
      }),
      allowedActions: actions,
      reviewState: insight.reviewStatus === "published" ? "published" : "technical_review",
    });
  });
  return {
    status: "ready",
    deck: {
      deckId: `deck-daily-${origin.editionId ?? origin.date}`,
      revision: 1,
      title: eligible[0].topic ? `Daily edition — ${eligible[0].topic}` : `Daily edition — ${origin.date}`,
      provenance: {
        source: "content/knowledge/insights.json",
        reviewState: eligible.every((entry) => entry.reviewStatus === "published") ? "published" : "technical_review",
        checkedAt: eligible[0].checkedAt,
        basis: "Daily edition records with source locators",
      },
      reason: "Opened from the selected date. Cards are the actual edition cards, not inferred facets.",
      cards,
      cardCount: cards.length,
      capabilitySummary: summarizeCapabilities(cards),
      limitations: [
        "Technical review is not human publication approval.",
        "Counts are derived from the cards actually resolved.",
      ],
      allowedActions: [{ type: "open-timeline", label: "Back to the timeline" }],
    },
  };
}

export function conceptProvider(origin, data) {
  const concepts = Array.isArray(data.concepts) ? data.concepts : [];
  const concept = concepts.find((entry) => entry.id === origin.conceptId);
  if (!concept) {
    return {
      status: "unavailable",
      reasonCode: "concept-not-found",
      explanation: "The requested concept is not present in the eligible snapshot.",
    };
  }
  const resources = concept.resources ?? [];
  if (!resources.length) {
    return {
      status: "empty",
      reasonCode: "concept-without-resources",
      explanation: "This concept has no mapped local reading resource in the current snapshot.",
    };
  }
  const cards = resources.map((resource, index) =>
    card({
      cardId: `card-${concept.id}-${resource.unitId ?? index}`,
      kind: "resource",
      title: resource.title || `${concept.label} — ${resource.role || "reading"}`,
      summary: resource.locator || "",
      contentRef: sourceRef(resource.unitId ?? `${concept.id}-resource-${index}`, resource.sourcePath ?? "mapping", resource.locator ?? "", {
        canonicalHref: sanitizeHref(resource.href) ?? undefined,
        language: resource.language ?? "en",
        revision: 1,
      }),
      reader: {
        mode: "reference",
        href: sanitizeHref(resource.href) ?? undefined,
        payload: { role: text(resource.role, 100), locator: text(resource.locator, 500) },
      },
      capabilities: capability({
        readFull: resource.reviewState !== "link-only" && Boolean(sanitizeHref(resource.href)),
        relate: true,
      }),
      allowedActions: [
        { type: "locate-in-knowledge", label: "Back to concept", targetId: concept.id },
        ...(sanitizeHref(resource.href)
          ? [{ type: "open-resource", label: "Preview resource", href: resource.href }]
          : []),
      ],
      reviewState: resource.reviewState === "published" ? "published" : "candidate",
    }),
  );
  return {
    status: "ready",
    deck: {
      deckId: `deck-concept-${concept.id}`,
      revision: 1,
      title: `${concept.label} — reading options`,
      provenance: {
        source: "concept registry + resource mappings",
        reviewState: "candidate",
        basis: "Resource-backed concept adapter; no new daily idea is invented.",
      },
      reason: "A resource-backed concept deck independent of daily editions.",
      cards,
      cardCount: cards.length,
      capabilitySummary: summarizeCapabilities(cards),
      limitations: ["Mapped resources are candidates, not published semantic claims."],
      allowedActions: [{ type: "open-concept", label: "Return to concept", targetId: concept.id }],
    },
  };
}

export function goalProvider(origin, data) {
  const goals = Array.isArray(data.goals) ? data.goals : [];
  const goal = goals.find((entry) => (entry.goalId ?? entry.id) === origin.goalId);
  if (!goal) {
    return {
      status: "unavailable",
      reasonCode: "goal-not-found",
      explanation: "The requested goal is not present in the eligible snapshot.",
    };
  }
  if (goal.status === "unsupported") {
    return {
      status: "unsupported",
      reasonCode: "goal-unsupported",
      explanation: goal.explanation || "The goal route cannot be resolved from the available evidence.",
    };
  }
  const steps = Array.isArray(goal.steps) ? goal.steps : [];
  if (!steps.length) {
    return {
      status: "empty",
      reasonCode: "goal-without-steps",
      explanation: "This goal has no resolved route steps in the current snapshot.",
    };
  }
  const cards = steps.map((step) =>
    card({
      cardId: `card-${goal.goalId}-step-${step.step}`,
      kind: "route-step",
      title: `${step.step}. ${step.conceptLabel}`,
      summary: step.reason?.text ?? "",
      contentRef: sourceRef(
        step.resource?.unitId ?? `route-${goal.goalId}-${step.conceptId}`,
        step.resource?.sourcePath ?? "goal route",
        step.resource?.locator ?? `step=${step.step}`,
        {
          canonicalHref: sanitizeHref(step.resource?.href) ?? undefined,
          language: step.resource?.language ?? "en",
          revision: 1,
        },
      ),
      reader: {
        mode: "inline",
        payload: {
          step: String(step.step),
          concept: text(step.conceptLabel, 200),
          reason: text(step.reason?.text, 1000),
          conditions: text((step.conditions ?? []).map((entry) => entry.text).filter(Boolean).join(" "), 2000),
          gap: text(step.gap, 1000),
        },
      },
      capabilities: capability({
        readFull: Boolean(step.resource && sanitizeHref(step.resource.href)),
        relate: true,
      }),
      allowedActions: [
        { type: "open-concept", label: "Open concept", targetId: step.conceptId },
        ...(sanitizeHref(step.resource?.href)
          ? [{ type: "open-resource", label: "Preview resource", href: step.resource.href }]
          : []),
      ],
      reviewState: "candidate",
    }),
  );
  return {
    status: "ready",
    deck: {
      deckId: `deck-goal-${goal.goalId}`,
      revision: 1,
      title: `${goal.title} — route preview`,
      provenance: {
        source: "goal route resolver",
        reviewState: "candidate",
        basis: goal.basisKind ?? "candidate-review",
      },
      reason: "Route steps resolved by the dependency-correct prerequisite planner.",
      cards,
      cardCount: cards.length,
      capabilitySummary: summarizeCapabilities(cards),
      limitations: [goal.explanation ?? "Candidate route preview."],
      allowedActions: [{ type: "preview-goal", label: "Preview the route", targetId: goal.goalId }],
    },
  };
}

export const DEFAULT_PROVIDERS = {
  "daily-edition": dailyEditionProvider,
  concept: conceptProvider,
  goal: goalProvider,
};

// ------------------------------------------------------------------ resolver

export function resolveDeck(request, options = {}) {
  const context = {
    graphBuildId: options.graphBuildId ?? request?.graphBuildId ?? "unknown-graph",
    sourceIndexBuildId: options.sourceIndexBuildId ?? request?.sourceIndexBuildId ?? "unknown-source-index",
    mode: request?.mode === "public" ? "public" : "review",
  };
  const requestId = id(request?.requestId) ?? "invalid-request";
  if (!request || typeof request !== "object") {
    return failure({ requestId }, context, "error", "invalid-request", "The deck request is not an object.", {
      type: "close",
      label: "Close",
    });
  }
  const limitations = [];
  let normalizedRequest = request;
  if (request.schemaVersion === "intelligent-atlas-deck-request/1.0") {
    normalizedRequest = {
      ...request,
      schemaVersion: DECK_REQUEST_SCHEMA,
      origin: { type: "daily-edition", date: request.date ?? request.origin?.date },
      compatibility: "legacy-v1-adapter",
    };
    limitations.push("Legacy v1 request adapted to the v2 origin shape; no silent field reinterpretation.");
  } else if (request.schemaVersion !== DECK_REQUEST_SCHEMA) {
    return failure(request, context, "unsupported", "unknown-request-version", "Unsupported deck request schema version.", {
      type: "close",
      label: "Close",
    });
  }
  if (!id(normalizedRequest.requestId)) {
    return failure(normalizedRequest, context, "error", "missing-request-id", "The deck request has no stable identity.", {
      type: "close",
      label: "Close",
    });
  }
  if (normalizedRequest.graphBuildId && normalizedRequest.graphBuildId !== context.graphBuildId) {
    return failure(
      normalizedRequest,
      context,
      "error",
      "stale-snapshot",
      "The request references a different graph build. Re-resolve the current snapshot before opening a deck.",
      { type: "retry", label: "Reload the current edition" },
    );
  }
  if (
    normalizedRequest.sourceIndexBuildId &&
    normalizedRequest.sourceIndexBuildId !== context.sourceIndexBuildId
  ) {
    return failure(
      normalizedRequest,
      context,
      "error",
      "mixed-source-index",
      "The request mixes graph and source-index revisions. The deck was not resolved.",
      { type: "retry", label: "Reload the current source index" },
    );
  }
  if (normalizedRequest.returnContext) {
    const validation = validateReturnContext(normalizedRequest.returnContext);
    if (!validation.ok) {
      return failure(
        normalizedRequest,
        context,
        "error",
        "invalid-return-context",
        `The return context is invalid: ${validation.errors.join(" ")}`,
        { type: "close", label: "Return to the timeline" },
      );
    }
  }
  const origin = normalizedRequest.origin;
  if (!origin || !ORIGIN_TYPES.has(origin.type)) {
    return failure(normalizedRequest, context, "unsupported", "unknown-origin", "This deck origin is not registered.", {
      type: "open-timeline",
      label: "Browse the timeline",
    });
  }
  if (origin.type === "daily-edition" && !origin.date && !origin.editionId) {
    return failure(normalizedRequest, context, "error", "missing-origin-key", "A daily edition deck needs a date or edition id.", {
      type: "open-timeline",
      label: "Choose a date",
    });
  }
  if (origin.type === "concept" && !id(origin.conceptId)) {
    return failure(normalizedRequest, context, "error", "missing-origin-key", "A concept deck needs a concept id.", {
      type: "open-search",
      label: "Search concepts",
    });
  }
  if (origin.type === "goal" && !id(origin.goalId)) {
    return failure(normalizedRequest, context, "error", "missing-origin-key", "A goal deck needs a goal id.", {
      type: "open-goal",
      label: "Choose a goal",
    });
  }
  if (origin.type === "saved-selection") {
    return failure(
      normalizedRequest,
      context,
      "unsupported",
      "saved-selection-not-implemented",
      "Saved-selection decks are a registered future origin; no provider is implemented in this phase.",
      { type: "open-timeline", label: "Browse the timeline" },
    );
  }
  const provider = options.providers?.[origin.type] ?? DEFAULT_PROVIDERS[origin.type];
  if (typeof provider !== "function") {
    return failure(
      normalizedRequest,
      context,
      "unsupported",
      "provider-not-registered",
      "No provider is registered for this deck origin.",
      { type: "open-timeline", label: "Browse the timeline" },
    );
  }
  let result;
  try {
    result = provider(origin, options.data ?? {}, context);
  } catch (error) {
    return failure(
      normalizedRequest,
      context,
      "error",
      "provider-error",
      `The deck provider failed safely: ${error instanceof Error ? error.message : "unknown error"}.`,
      { type: "retry", label: "Retry" },
    );
  }
  if (!result || typeof result !== "object") {
    return failure(normalizedRequest, context, "error", "provider-empty-result", "The deck provider returned no result.", {
      type: "retry",
      label: "Retry",
    });
  }
  if (result.status === "ready") {
    const deck = normalizeDeck(result.deck, { requestId: normalizedRequest.requestId }, limitations);
    if (!deck) {
      return failure(normalizedRequest, context, "error", "invalid-deck", "The provider returned an invalid deck.", {
        type: "retry",
        label: "Retry",
      });
    }
    if (!deck.cards.length) {
      return emptyResolution(normalizedRequest, context, {
        reasonCode: "ready-deck-with-zero-cards",
        explanation: "The provider returned no usable cards. This is an explicit empty result.",
        nextAction: { type: "open-timeline", label: "Browse the timeline" },
        limitations: deck.limitations,
      });
    }
    return {
      schemaVersion: DECK_RESOLUTION_SCHEMA,
      status: "ready",
      requestId: normalizedRequest.requestId,
      graphBuildId: context.graphBuildId,
      sourceIndexBuildId: context.sourceIndexBuildId,
      reasonCode: result.reasonCode ?? "deck-ready",
      explanation: result.explanation ?? "The deck resolved to real cards.",
      limitations: deck.limitations,
      nextAction: { type: "close", label: "Close the deck" },
      deck,
    };
  }
  if (result.status === "empty") {
    return emptyResolution(normalizedRequest, context, {
      reasonCode: result.reasonCode ?? "empty-deck",
      explanation: result.explanation ?? "No cards are available for this request.",
      nextAction: result.nextAction ?? { type: "open-timeline", label: "Browse the timeline" },
      limitations: result.limitations ?? [],
    });
  }
  if (["unavailable", "unsupported", "error"].includes(result.status)) {
    return failure(
      normalizedRequest,
      context,
      result.status,
      result.reasonCode ?? result.status,
      result.explanation ?? "The deck could not be resolved.",
      result.nextAction ?? { type: "retry", label: "Retry" },
    );
  }
  return failure(normalizedRequest, context, "error", "unknown-provider-status", "The provider returned an unknown status.", {
    type: "retry",
    label: "Retry",
  });
}

/** Compatibility adapter for the existing one-card prototype payload. */
export function adaptLegacyEdition(insight) {
  const cards = [
    card({
      cardId: `legacy-${insight.id}`,
      kind: "insight",
      title: insight.cardTitle || insight.title,
      summary: insight.takeaway ?? "",
      contentRef: sourceRef(insight.id, "content/knowledge/insights.json", `items[id=${insight.id}]`, {
        sourceUrl: sanitizeHref(insight.sourceUrl) ?? undefined,
        canonicalHref: sanitizeHref(insight.lessonHref) ?? undefined,
        language: "en",
      }),
      evidence: [{ unitId: insight.id, locator: insight.sourceLocator ?? "", quote: insight.takeaway ?? "" }],
      reader: {
        mode: "inline",
        payload: {
          scenario: text(insight.scenario, 2000),
          takeaway: text(insight.takeaway, 2000),
          caveat: text(insight.caveat, 2000),
        },
      },
      capabilities: capability({ readFull: true, relate: Boolean(insight.conceptId) }),
      allowedActions: [
        ...(insight.conceptId
          ? [{ type: "locate-in-knowledge", label: "Locate in knowledge", targetId: insight.conceptId }]
          : []),
      ],
      reviewState: "technical_review",
    }),
  ];
  return {
    deckId: `legacy-deck-${insight.id}`,
    revision: 1,
    title: insight.title,
    provenance: {
      source: "content/knowledge/insights.json",
      reviewState: "technical_review",
      checkedAt: insight.checkedAt,
      basis: "v1 one-card edition compatibility adapter",
    },
    reason: "The existing one-card edition remains readable through the v2 contract.",
    cards,
    cardCount: cards.length,
    capabilitySummary: summarizeCapabilities(cards),
    limitations: ["Adapted from the v1 one-card shape; no card was invented or merged."],
    allowedActions: [{ type: "close", label: "Close" }],
  };
}
