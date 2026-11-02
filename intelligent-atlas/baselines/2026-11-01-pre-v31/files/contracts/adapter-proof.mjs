#!/usr/bin/env node
/**
 * Development-only adapter proof for the KnowledgeDealer contract.
 *
 * This script does not integrate with the live application. It loads the
 * generated prototype payload in a Node VM, resolves the three real OneLake
 * editions to a DeckRequest, validates that request against the contract schema,
 * and simulates the Dealer state machine. It fails closed: candidate data can
 * never become public through this proof.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const CONTRACT_PATH = join(HERE, "contracts.schema.json");
const DATA_PATH = join(ROOT, "intelligent-atlas", "prototype", "data.js");
const PUBLIC_PATH = join(ROOT, "intelligent-atlas", "prototype", "public-data.js");
const PROVENANCE_PATH = join(
  ROOT,
  "intelligent-atlas",
  "prototype",
  "data-provenance.json",
);

const GATE_VALUES = new Set(["blocked", "pending", "passed", "not-applicable"]);
const VIEW_VALUES = new Set(["card", "evidence", "destination"]);
const REVIEW_VALUES = new Set([
  "technical_review",
  "human_review",
  "published",
  "withheld",
]);

// --------------------------------------------------------------- schema subset

function resolvePointer(root, pointer) {
  if (!pointer.startsWith("#/")) throw new Error(`Unsupported $ref: ${pointer}`);
  return pointer
    .slice(2)
    .split("/")
    .reduce((node, key) => {
      if (!node || typeof node !== "object" || !(key in node)) {
        throw new Error(`Unresolvable $ref: ${pointer}`);
      }
      return node[key];
    }, root);
}

function typeMatches(value, type) {
  switch (type) {
    case "object":
      return value !== null && typeof value === "object" && !Array.isArray(value);
    case "array":
      return Array.isArray(value);
    case "string":
      return typeof value === "string";
    case "integer":
      return Number.isInteger(value);
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "boolean":
      return typeof value === "boolean";
    case "null":
      return value === null;
    default:
      return true;
  }
}

/**
 * A small validator for the JSON Schema keywords used by the contract.
 * It is intentionally not a general JSON Schema implementation; unsupported
 * keywords are ignored so the proof stays dependency-free and reviewable.
 */
export function validateAgainstSchema(value, schema, root = schema, path = "$") {
  const errors = [];
  validateNode(value, schema, root, path, errors);
  return errors;
}

function validateNode(value, schema, root, path, errors) {
  if (!schema || typeof schema !== "object") return;

  if (schema.$ref) {
    validateNode(value, resolvePointer(root, schema.$ref), root, path, errors);
    return;
  }

  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf.filter((candidate) => {
      const candidateErrors = [];
      validateNode(value, candidate, root, path, candidateErrors);
      return candidateErrors.length === 0;
    });
    if (matches.length !== 1) {
      errors.push(`${path}: oneOf matched ${matches.length} branches`);
    }
    return;
  }

  if (Object.hasOwn(schema, "const") && value !== schema.const) {
    errors.push(`${path}: expected const ${JSON.stringify(schema.const)}`);
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(
      `${path}: expected one of ${schema.enum.map((item) => JSON.stringify(item)).join(", ")}`,
    );
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => typeMatches(value, type))) {
      errors.push(`${path}: expected ${types.join(" | ")}`);
      return;
    }
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path}: shorter than ${schema.minLength}`);
    }
    if (schema.pattern !== undefined) {
      let pattern;
      try {
        pattern = new RegExp(schema.pattern);
      } catch {
        errors.push(`${path}: invalid schema pattern`);
      }
      if (pattern && !pattern.test(value)) {
        errors.push(`${path}: does not match ${schema.pattern}`);
      }
    }
    if (schema.format === "uri") {
      try {
        const url = new URL(value);
        if (!url.protocol || !url.host) throw new Error("missing host");
      } catch {
        errors.push(`${path}: not a valid absolute URI`);
      }
    }
  }

  if (typeof value === "number" && schema.minimum !== undefined) {
    if (value < schema.minimum) errors.push(`${path}: below minimum ${schema.minimum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${path}: fewer than ${schema.minItems} items`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${path}: more than ${schema.maxItems} items`);
    }
    if (schema.uniqueItems === true) {
      const seen = new Set();
      value.forEach((item, index) => {
        const key = JSON.stringify(item);
        if (seen.has(key)) errors.push(`${path}[${index}]: duplicate item`);
        seen.add(key);
      });
    }
    if (schema.items) {
      value.forEach((item, index) => {
        validateNode(item, schema.items, root, `${path}[${index}]`, errors);
      });
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.hasOwn(value, key)) errors.push(`${path}: missing ${key}`);
      }
    }
    const properties = schema.properties || {};
    for (const [key, child] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) {
        validateNode(value[key], child, root, `${path}.${key}`, errors);
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) {
          errors.push(`${path}: unexpected property ${key}`);
        }
      }
    }
  }
}

// ------------------------------------------------------------------- loading

export function loadPayloads() {
  const dataScript = readFileSync(DATA_PATH, "utf8");
  const publicScript = readFileSync(PUBLIC_PATH, "utf8");
  const provenance = JSON.parse(readFileSync(PROVENANCE_PATH, "utf8"));
  const schema = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));

  const dataContext = vm.createContext({ window: {} });
  vm.runInContext(dataScript, dataContext, {
    filename: "intelligent-atlas/prototype/data.js",
    timeout: 10_000,
  });
  const publicContext = vm.createContext({ window: {} });
  vm.runInContext(publicScript, publicContext, {
    filename: "intelligent-atlas/prototype/public-data.js",
    timeout: 10_000,
  });

  const payload = JSON.parse(JSON.stringify(dataContext.window.ATLAS_DATA));
  const meta = JSON.parse(JSON.stringify(dataContext.window.ATLAS_DATA_META));
  const publicPayload = JSON.parse(JSON.stringify(publicContext.window.ATLAS_PUBLIC));

  if (!payload || !meta || !publicPayload) {
    throw new Error("Prototype payloads did not expose the expected window globals.");
  }

  return { payload, meta, publicPayload, provenance, schema };
}

export function fingerprint(value) {
  return createHash("sha256").update(JSON.stringify(value, null, 2)).digest("hex");
}

// ------------------------------------------------------------------ adapter

function slugifyTopic(topic) {
  return String(topic)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function gateValue(value) {
  if (!GATE_VALUES.has(value)) {
    throw new Error(`Unknown publication gate value: ${JSON.stringify(value)}`);
  }
  return value;
}

function editionFromInsight(insight) {
  const reviewState = insight.reviewStatus;
  if (!REVIEW_VALUES.has(reviewState)) {
    throw new Error(`Unknown insight review state: ${JSON.stringify(reviewState)}`);
  }

  const card = {
    cardId: insight.id,
    editionDate: insight.date,
    title: insight.cardTitle,
    takeaway: insight.takeaway,
    scenario: insight.scenario,
    caveat: insight.caveat,
    conceptId: insight.conceptId,
    lessonHref: insight.lessonHref,
    practiceHref: insight.practiceHref,
    reviewState,
    evidence: {
      sourceId: insight.sourceId,
      sourceUrl: insight.sourceUrl,
      locator: insight.sourceLocator,
      checkedAt: insight.checkedAt,
      language: "en",
    },
    questionIds: insight.questionIds ?? [],
  };

  return {
    date: insight.date,
    title: insight.title,
    cards: [card],
    cardCount: 1,
    reviewState,
    sourceId: insight.sourceId,
    checkedAt: insight.checkedAt,
  };
}

/**
 * Resolve one topic to a DeckRequest. Only real editions are selected; the
 * adapter never invents a card or fills an empty date.
 */
export function buildDeckRequest(payload, options = {}) {
  const topic = options.topic || "OneLake";
  const conceptId = options.conceptId || "concept:fabric:shortcut";
  const origin = options.origin || "adapter-proof";
  const requestedDate = options.date || null;

  const matching = payload.insights
    .filter((insight) => insight.conceptId === conceptId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!matching.length) {
    throw new Error(`No real edition carries concept ${conceptId}.`);
  }

  const editionDates = matching.map((insight) => insight.date);
  const initialEdition = requestedDate || editionDates[editionDates.length - 1];
  if (!editionDates.includes(initialEdition)) {
    throw new Error(`No real edition for ${conceptId} on ${initialEdition}.`);
  }

  const editions = matching.map(editionFromInsight);
  const gates = {
    humanPublicationReview: gateValue(payload.publicProjection.gates.humanPublicationReview),
    scientificReview: gateValue(payload.publicProjection.gates.scientificReview),
    rightsReview: gateValue(payload.publicProjection.gates.rightsReview),
    assessmentReview: gateValue(payload.publicProjection.gates.assessmentReview),
  };

  const reviewStates = new Set(editions.map((edition) => edition.reviewState));
  const reviewState =
    reviewStates.has("published") && reviewStates.size === 1
      ? "published"
      : reviewStates.has("human_review")
        ? "human_review"
        : reviewStates.has("technical_review")
          ? "technical_review"
          : "withheld";

  const returnContext =
    options.returnContext === null
      ? null
      : {
          date: initialEdition,
          conceptId,
          view: "card",
          cardIndex: 0,
          origin,
          returnLabel: `Return to ${initialEdition} edition`,
          ...(options.returnContext || {}),
        };

  return {
    schemaVersion: 1,
    requestId: `deck:${slugifyTopic(topic)}:${initialEdition}`,
    topic,
    conceptId,
    mode: "editorial-review",
    editionDates,
    initialEdition,
    editions,
    reviewState,
    publicEligible: false,
    gates,
    returnContext,
    source: {
      kind: "generated-artifact",
      path: "intelligent-atlas/prototype/data.js",
      graphBuildId: payload.graphBuildId,
      ledgerFingerprint: payload.ledgerFingerprint,
    },
    adapter: {
      id: "development-topic-adapter",
      version: "0.1.0-development",
      developmentOnly: true,
    },
  };
}

// -------------------------------------------------------------- state machine

export function createDealerState(request) {
  return {
    open: false,
    requestId: request.requestId,
    editionDate: request.initialEdition,
    view: "card",
    cardIndex: 0,
    focusRegion: "dialog",
    returnContext: request.returnContext ? { ...request.returnContext } : null,
    historyEntry: `#edition/${request.initialEdition}`,
    bodyLocked: false,
  };
}

function event(type, state) {
  return {
    type,
    requestId: state.requestId,
    editionDate: state.editionDate,
    view: state.view,
    returnContext: state.returnContext ? { ...state.returnContext } : null,
  };
}

/**
 * Simulate the Dealer. Each command returns a new state and the events emitted.
 * Per-edition reader state is kept outside the serialisable state, mirroring the
 * prototype's editionStates map.
 */
export function simulateDealer(request) {
  const editionViews = new Map(
    request.editionDates.map((date) => [date, { view: "card", cardIndex: 0 }]),
  );
  if (request.returnContext) {
    editionViews.set(request.returnContext.date, {
      view: request.returnContext.view,
      cardIndex: request.returnContext.cardIndex,
    });
  }

  const states = [];
  const events = [];
  let state = createDealerState(request);

  const commit = (next, emitted) => {
    state = next;
    states.push(state);
    events.push(...emitted);
  };

  const apply = (command) => {
    if (command.type === "open") {
      const reader = editionViews.get(state.editionDate);
      const next = {
        ...state,
        open: true,
        view: reader.view,
        cardIndex: reader.cardIndex,
        focusRegion: "dialog",
        bodyLocked: true,
      };
      commit(next, [event("dealer.opened", next)]);
      return;
    }

    if (command.type === "view") {
      if (!VIEW_VALUES.has(command.view)) throw new Error(`Unknown view ${command.view}`);
      if (!state.open) throw new Error("Cannot change view while the Dealer is closed.");
      if (state.view === command.view) return;
      const reader = editionViews.get(state.editionDate);
      reader.view = command.view;
      reader.cardIndex = state.cardIndex;
      const next = { ...state, view: command.view, focusRegion: "reader" };
      commit(next, [
        event(command.view === "evidence" ? "evidence.opened" : "view.changed", next),
      ]);
      return;
    }

    if (command.type === "edition") {
      if (!request.editionDates.includes(command.date)) {
        throw new Error(`Unknown edition ${command.date}`);
      }
      if (!state.open) throw new Error("Cannot change edition while the Dealer is closed.");
      const reader = editionViews.get(command.date);
      const next = {
        ...state,
        editionDate: command.date,
        view: reader.view,
        cardIndex: reader.cardIndex,
        focusRegion: "edition-rail",
        historyEntry: `#edition/${command.date}`,
      };
      commit(next, [event("edition.changed", next)]);
      return;
    }

    if (command.type === "escape") {
      if (!state.open) return;
      if (state.view !== "card") {
        const reader = editionViews.get(state.editionDate);
        reader.view = "card";
        const next = { ...state, view: "card", focusRegion: "reader" };
        commit(next, [event("view.changed", next)]);
        return;
      }
      apply({ type: "close" });
      return;
    }

    if (command.type === "close") {
      if (!state.open) return;
      const next = {
        ...state,
        open: false,
        focusRegion: "dialog",
        bodyLocked: false,
      };
      commit(next, [event("dealer.closed", next)]);
      return;
    }

    if (command.type === "return") {
      if (!state.returnContext) throw new Error("No return context to reopen.");
      const reader = editionViews.get(state.returnContext.date);
      const next = {
        ...state,
        open: true,
        editionDate: state.returnContext.date,
        view: state.returnContext.view,
        cardIndex: state.returnContext.cardIndex,
        focusRegion: "dialog",
        historyEntry: `#edition/${state.returnContext.date}`,
        bodyLocked: true,
      };
      reader.view = state.returnContext.view;
      reader.cardIndex = state.returnContext.cardIndex;
      commit(next, [
        event("return.requested", next),
        event("dealer.opened", next),
      ]);
      return;
    }

    throw new Error(`Unknown Dealer command: ${command.type}`);
  };

  states.push(state);
  apply({ type: "open" });
  apply({ type: "view", view: "evidence" });
  apply({ type: "edition", date: request.editionDates[0] });
  apply({ type: "edition", date: request.initialEdition });
  apply({ type: "view", view: "destination" });
  apply({ type: "escape" });
  apply({ type: "close" });
  apply({ type: "return" });
  apply({ type: "escape" });
  apply({ type: "escape" });

  return { states, events, editionViews };
}

// ---------------------------------------------------------------- validation

export function contractSemanticErrors(request) {
  const errors = [];

  if (!request.editionDates.includes(request.initialEdition)) {
    errors.push("$.initialEdition: not present in editionDates");
  }
  if (request.requestId !== `deck:${slugifyTopic(request.topic)}:${request.initialEdition}`) {
    errors.push("$.requestId: does not match topic and initialEdition");
  }

  const editionDates = request.editions.map((edition) => edition.date);
  if (new Set(editionDates).size !== editionDates.length) {
    errors.push("$.editions: duplicate edition dates");
  }
  for (const date of request.editionDates) {
    if (!editionDates.includes(date)) {
      errors.push(`$.editions: missing edition ${date}`);
    }
  }
  for (const date of editionDates) {
    if (!request.editionDates.includes(date)) {
      errors.push(`$.editionDates: ${date} is not declared`);
    }
  }

  for (const edition of request.editions) {
    if (edition.cards.length !== 1 || edition.cardCount !== 1) {
      errors.push(`$.editions[${edition.date}]: must contain exactly one card`);
    }
    for (const card of edition.cards) {
      if (card.editionDate !== edition.date) {
        errors.push(`$.editions[${edition.date}]: card editionDate mismatch`);
      }
      if (card.conceptId !== request.conceptId) {
        errors.push(`$.editions[${edition.date}]: card conceptId mismatch`);
      }
      if (card.reviewState !== "published" && request.publicEligible) {
        errors.push(`$.editions[${edition.date}]: unpublished card in a public request`);
      }
    }
  }

  if (request.publicEligible) {
    if (request.reviewState !== "published") {
      errors.push("$.publicEligible: request reviewState is not published");
    }
    for (const [gate, value] of Object.entries(request.gates)) {
      if (value !== "passed" && value !== "not-applicable") {
        errors.push(`$.gates.${gate}: ${value} blocks a public request`);
      }
    }
  }

  if (request.returnContext) {
    if (!request.editionDates.includes(request.returnContext.date)) {
      errors.push("$.returnContext.date: no matching edition");
    }
    if (request.returnContext.cardIndex !== 0) {
      errors.push("$.returnContext.cardIndex: single-card editions use index 0");
    }
  }

  if (!request.adapter.developmentOnly) {
    errors.push("$.adapter.developmentOnly: proof adapter must be development-only");
  }

  return errors;
}

export function validateDeckRequest(request, schema) {
  return [
    ...validateAgainstSchema(request, schema.$defs.DeckRequest, schema),
    ...contractSemanticErrors(request),
  ];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function invalidCases(request) {
  const cases = [];

  const twoCards = clone(request);
  twoCards.editions[0].cards.push(clone(twoCards.editions[0].cards[0]));
  twoCards.editions[0].cardCount = 2;
  cases.push({ name: "two-card edition", value: twoCards });

  const publicCandidate = clone(request);
  publicCandidate.publicEligible = true;
  cases.push({ name: "public candidate", value: publicCandidate });

  const badGate = clone(request);
  badGate.gates.rightsReview = "maybe";
  cases.push({ name: "unknown gate", value: badGate });

  const badDate = clone(request);
  badDate.initialEdition = "2026-10-30";
  cases.push({ name: "missing initial edition", value: badDate });

  const badReturn = clone(request);
  badReturn.returnContext.date = "2026-10-30";
  cases.push({ name: "return context outside editions", value: badReturn });

  const extraField = clone(request);
  extraField.published = true;
  cases.push({ name: "unknown top-level field", value: extraField });

  return cases;
}

// --------------------------------------------------------------------- proof

export function runAdapterProof() {
  const { payload, meta, publicPayload, provenance, schema } = loadPayloads();
  const checks = [];
  const check = (name, pass, detail = null) => {
    checks.push({ name, pass: Boolean(pass), detail });
    if (!pass) throw new Error(`Check failed: ${name}${detail ? ` (${detail})` : ""}`);
  };

  const dataFingerprint = fingerprint(payload);
  const publicFingerprint = fingerprint(publicPayload);
  check(
    "prototype payload fingerprint matches its generated metadata",
    dataFingerprint === meta.payloadFingerprint,
    dataFingerprint,
  );
  check(
    "prototype payload fingerprint matches provenance",
    dataFingerprint === provenance.payloadFingerprint,
    dataFingerprint,
  );
  check(
    "public payload fingerprint matches provenance",
    publicFingerprint === provenance.publicPayloadFingerprint,
    publicFingerprint,
  );

  const request = buildDeckRequest(payload, {
    topic: "OneLake",
    conceptId: "concept:fabric:shortcut",
    date: "2026-10-26",
    origin: "adapter-proof",
  });
  const requestErrors = validateDeckRequest(request, schema);
  check("DeckRequest validates against the contract", requestErrors.length === 0, requestErrors.join("; "));
  check("request is development-only", request.adapter.developmentOnly === true);
  check("request is not public-eligible", request.publicEligible === false);
  check("request has three real edition dates", request.editionDates.length === 3);
  check(
    "every edition has exactly one card",
    request.editions.every((edition) => edition.cards.length === 1 && edition.cardCount === 1),
  );
  check(
    "every card uses the resolved concept",
    request.editions.every((edition) =>
      edition.cards.every((card) => card.conceptId === "concept:fabric:shortcut"),
    ),
  );
  check(
    "every card has a source locator",
    request.editions.every((edition) => edition.cards[0].evidence.locator.length > 0),
  );
  check(
    "no question answer is present",
    request.editions.every((edition) => edition.cards[0].questionIds.length === 0),
  );

  const simulation = simulateDealer(request);
  const stateErrors = simulation.states.flatMap((state, index) =>
    validateAgainstSchema(state, schema.$defs.DealerState, schema).map(
      (error) => `state[${index}] ${error}`,
    ),
  );
  check("all Dealer states validate", stateErrors.length === 0, stateErrors.join("; "));
  check("state simulation opens and closes", simulation.states.some((s) => s.open) && simulation.states.some((s) => !s.open));
  check(
    "edition switching preserves reader state",
    simulation.states.some((state) => state.view === "evidence" && state.editionDate === "2026-10-26"),
  );
  check(
    "escape returns to the card before closing",
    simulation.events.some((event) => event.type === "view.changed") &&
      simulation.events.some((event) => event.type === "dealer.closed"),
  );
  check(
    "return reopens the originating edition",
    simulation.events.some(
      (event) => event.type === "return.requested" && event.editionDate === "2026-10-26",
    ),
  );
  check(
    "no event implies publication",
    simulation.events.every((event) => !("published" in event)),
  );

  const rejected = invalidCases(request).map((testCase) => {
    const errors = validateDeckRequest(testCase.value, schema);
    return { name: testCase.name, rejected: errors.length > 0, errors };
  });
  check(
    "invalid requests are rejected",
    rejected.every((testCase) => testCase.rejected),
    rejected.filter((testCase) => !testCase.rejected).map((testCase) => testCase.name).join(", "),
  );

  const projection = publicPayload.publicProjection;
  check("public projection publishes no concepts", projection.publishedConcepts.length === 0);
  check("public projection publishes no mappings", projection.publishedMappings.length === 0);
  check("public projection publishes no assertions", projection.publishedAssertions.length === 0);
  check(
    "public projection gate values are contract values",
    Object.values(projection.gates).every((value) => GATE_VALUES.has(value)),
  );
  check(
    "candidate payload contains no published concept",
    payload.concepts.every((concept) => concept.reviewState !== "published"),
  );
  check(
    "candidate payload contains no published edge",
    payload.edges.every((edge) => edge.reviewState !== "published"),
  );
  check(
    "every insight remains in technical review",
    payload.insights.every((insight) => insight.reviewStatus === "technical_review"),
  );
  check(
    "public payload is the same graph build",
    publicPayload.graphBuildId === payload.graphBuildId,
  );

  return {
    ok: true,
    generatedAt: payload.generatedAt,
    graphBuildId: payload.graphBuildId,
    dataFingerprint,
    publicFingerprint,
    request,
    requestErrors,
    invalidCases: rejected,
    states: simulation.states,
    events: simulation.events,
    checks,
  };
}

// ----------------------------------------------------------------------- CLI

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  try {
    const result = runAdapterProof();
    console.log(
      JSON.stringify(
        {
          ok: result.ok,
          graphBuildId: result.graphBuildId,
          dataFingerprint: result.dataFingerprint,
          publicFingerprint: result.publicFingerprint,
          requestId: result.request.requestId,
          editionDates: result.request.editionDates,
          editions: result.request.editions.length,
          cardsPerEdition: result.request.editions.map((edition) => edition.cards.length),
          publicEligible: result.request.publicEligible,
          adapter: result.request.adapter,
          states: result.states.length,
          events: result.events.map((event) => event.type),
          invalidCases: result.invalidCases.map((testCase) => ({
            name: testCase.name,
            rejected: testCase.rejected,
          })),
          checks: result.checks.length,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(`adapter-proof: FAIL\n${error.stack || error.message}`);
    process.exitCode = 1;
  }
}
