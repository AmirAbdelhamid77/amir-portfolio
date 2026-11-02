// C04-C10: Knowledge Dealer v2 contract regressions.
import test from "node:test";
import assert from "node:assert/strict";
import {
  adaptLegacyEdition,
  resolveDeck,
  validateReturnContext,
  CARD_KINDS,
  DECK_REQUEST_SCHEMA,
  MAX_CARDS,
} from "./deck-resolver.mjs";

const GRAPH = "graph-test-1";
const SOURCE = "source-test-1";

function insight(overrides = {}) {
  return {
    id: "insight-1",
    date: "2026-10-26",
    topic: "OneLake",
    title: "A reference is a design decision.",
    cardTitle: "Reference ≠ retained result",
    scenario: "Two teams need the same table.",
    prediction: "Think about the source of truth.",
    takeaway: "Investigate a shortcut.",
    caveat: "Confirm access and compatibility.",
    conceptId: "concept:shortcut",
    lessonHref: "/learn/dp-600/ingestion/",
    practiceHref: "/lab/dp-600/explore/",
    sourceId: "ms-onelake",
    sourceUrl: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts",
    sourceLocator: "What are shortcuts?",
    checkedAt: "2026-10-26",
    reviewStatus: "technical_review",
    reviewer: "agent; human pending",
    questionIds: [],
    ...overrides,
  };
}

function concept(overrides = {}) {
  return {
    id: "concept:shortcut",
    label: "OneLake shortcut",
    definition: "A named path that references an existing target.",
    domain: "fabric",
    resources: [
      {
        unitId: "unit-a",
        href: "/lab/dp-600/resources/?pack=delta#shortcuts",
        role: "explains",
        locator: "chapter=shortcuts",
        sourcePath: "content/fabric/notes.json",
        language: "en",
        reviewState: "candidate",
      },
      {
        unitId: "unit-b",
        href: "/lab/dp-600/resources/?pack=video06#V6",
        role: "demonstrates",
        locator: "chapter=V6",
        sourcePath: "content/fabric/notes.json",
        language: "en",
        reviewState: "candidate",
      },
    ],
    ...overrides,
  };
}

function goal(overrides = {}) {
  return {
    goalId: "goal:test",
    title: "Read existing data without a copy",
    status: "complete",
    basisKind: "candidate-review",
    explanation: "All targets resolve.",
    steps: [
      {
        step: 1,
        conceptId: "concept:onelake",
        conceptLabel: "OneLake",
        reason: { code: "goal-target", text: "Named target." },
        resource: { unitId: "unit-c", href: "/lab/dp-600/resources/?pack=delta", role: "explains", sourcePath: "content/fabric/notes.json", locator: "chapter=architecture", language: "en" },
        conditions: [],
        gap: null,
      },
      {
        step: 2,
        conceptId: "concept:shortcut",
        conceptLabel: "OneLake shortcut",
        reason: { code: "goal-target", text: "Named target." },
        resource: { unitId: "unit-d", href: "/lab/dp-600/resources/?pack=delta#shortcuts", role: "explains", sourcePath: "content/fabric/notes.json", locator: "chapter=shortcuts", language: "en" },
        conditions: [],
        gap: null,
      },
    ],
    ...overrides,
  };
}

function data(overrides = {}) {
  return {
    insights: [insight()],
    concepts: [concept()],
    goals: [goal()],
    ...overrides,
  };
}

function request(origin, overrides = {}) {
  return {
    schemaVersion: DECK_REQUEST_SCHEMA,
    requestId: "req-1",
    origin,
    graphBuildId: GRAPH,
    sourceIndexBuildId: SOURCE,
    mode: "review",
    ...overrides,
  };
}

const options = (payload = data()) => ({
  data: payload,
  graphBuildId: GRAPH,
  sourceIndexBuildId: SOURCE,
});

test("C04: empty date returns an explicit empty resolution", () => {
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-31" }), options());
  assert.equal(result.status, "empty");
  assert.equal(result.deck.cardCount, 0);
  assert.deepEqual(result.deck.cards, []);
  assert.equal(result.reasonCode, "no-edition-for-date");
  assert.equal(result.nextAction.type, "open-timeline");
});

test("C04: one-card edition remains intentional and readable", () => {
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }), options());
  assert.equal(result.status, "ready");
  assert.equal(result.deck.cardCount, 1);
  assert.equal(result.deck.cards[0].kind, "insight");
  assert.equal(result.deck.cards[0].cardId, "card-insight-1");
});

test("C04: multi-card edition is a first-class ready result", () => {
  const payload = data({
    insights: [
      insight({ id: "i-1" }),
      insight({ id: "i-2", cardTitle: "Second card" }),
      insight({ id: "i-3", cardTitle: "Third card" }),
    ],
  });
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }), options(payload));
  assert.equal(result.status, "ready");
  assert.equal(result.deck.cardCount, 3);
  assert.deepEqual(result.deck.cards.map((card) => card.cardId), ["card-i-1", "card-i-2", "card-i-3"]);
});

test("C04: derived cardCount corrects a supplied mismatch", () => {
  const payload = data({
    insights: [insight({ id: "i-1" }), insight({ id: "i-2" })],
  });
  const provider = () => ({
    status: "ready",
    deck: {
      deckId: "d",
      revision: 1,
      title: "t",
      provenance: { source: "test", reviewState: "candidate" },
      reason: "r",
      cards: [
        {
          cardId: "c1",
          revision: 1,
          kind: "insight",
          title: "c1",
          contentRef: { unitId: "u1", sourcePath: "test", locator: "x" },
          capabilities: { discover: true, readFull: true, assess: false, relate: false },
          allowedActions: [],
        },
      ],
      cardCount: 9,
      capabilitySummary: { discover: true, readFull: true, assess: false, relate: false },
      limitations: [],
      allowedActions: [],
    },
  });
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }), {
    ...options(payload),
    providers: { "daily-edition": provider },
  });
  assert.equal(result.deck.cardCount, 1);
  assert.match(result.limitations.join(" "), /Derived cardCount 1/);
});

test("C05: public mode withholds technical-review editions", () => {
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }, { mode: "public" }), options());
  assert.equal(result.status, "unavailable");
  assert.equal(result.reasonCode, "edition-withheld");
  assert.equal(result.deck, null);
});

test("C05: published public edition is admitted", () => {
  const payload = data({
    insights: [insight({ reviewStatus: "published", publicationState: "published", publicEligible: true })],
  });
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }, { mode: "public" }), options(payload));
  assert.equal(result.status, "ready");
  assert.equal(result.deck.cards[0].reviewState, "published");
});

test("C05: held or withdrawn editions are unavailable", () => {
  for (const reviewStatus of ["held", "withdrawn"]) {
    const payload = data({ insights: [insight({ reviewStatus })] });
    const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }), options(payload));
    assert.equal(result.status, "unavailable");
    assert.equal(result.reasonCode, "edition-withheld");
  }
});

test("C05: unknown origin is unsupported, not silently ignored", () => {
  const result = resolveDeck(request({ type: "telepathy" }), options());
  assert.equal(result.status, "unsupported");
  assert.equal(result.reasonCode, "unknown-origin");
});

test("C05: unknown card kinds are withheld, and all-unknown becomes empty", () => {
  const provider = () => ({
    status: "ready",
    deck: {
      deckId: "d",
      revision: 1,
      title: "t",
      provenance: { source: "test", reviewState: "candidate" },
      reason: "r",
      cards: [{ cardId: "c1", kind: "script", title: "x", contentRef: { unitId: "u", sourcePath: "s", locator: "l" } }],
      cardCount: 1,
      capabilitySummary: { discover: true, readFull: false, assess: false, relate: false },
      limitations: [],
      allowedActions: [],
    },
  });
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }), {
    ...options(),
    providers: { "daily-edition": provider },
  });
  assert.equal(result.status, "empty");
  assert.equal(result.reasonCode, "ready-deck-with-zero-cards");
  assert.ok(CARD_KINDS.has("insight"));
});

test("C05: LINK_ONLY keeps discover independent from readFull", () => {
  const payload = data({
    concepts: [
      concept({
        resources: [
          {
            unitId: "link-only",
            href: "/lab/dp-600/resources/?pack=delta",
            role: "references",
            locator: "chapter=x",
            sourcePath: "content/fabric/notes.json",
            reviewState: "link-only",
          },
        ],
      }),
    ],
  });
  const result = resolveDeck(request({ type: "concept", conceptId: "concept:shortcut" }), options(payload));
  assert.equal(result.status, "ready");
  assert.equal(result.deck.cards[0].capabilities.discover, true);
  assert.equal(result.deck.cards[0].capabilities.readFull, false);
});

test("C05: assessment capability follows the original policy, not StudyRecord.status", () => {
  const payload = data({
    insights: [insight({ questionIds: ["q-1"], reviewStatus: "held" })],
  });
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }), options(payload));
  assert.equal(result.status, "unavailable");
  const published = data({
    insights: [insight({ questionIds: ["q-1"], reviewStatus: "published", publicationState: "published", publicEligible: true })],
  });
  const ready = resolveDeck(
    request({ type: "daily-edition", date: "2026-10-26" }, { mode: "public" }),
    options(published),
  );
  assert.equal(ready.status, "ready");
  assert.equal(ready.deck.cards[0].capabilities.assess, true);
});

test("C06: concept and goal adapters share the same resolver boundary", () => {
  const conceptResult = resolveDeck(request({ type: "concept", conceptId: "concept:shortcut" }), options());
  const goalResult = resolveDeck(request({ type: "goal", goalId: "goal:test" }), options());
  assert.equal(conceptResult.status, "ready");
  assert.equal(goalResult.status, "ready");
  assert.equal(conceptResult.deck.cards[0].kind, "resource");
  assert.equal(goalResult.deck.cards[0].kind, "route-step");
  assert.equal(conceptResult.deck.cardCount, 2);
  assert.equal(goalResult.deck.cardCount, 2);
});

test("C06: concept with no resources returns empty, not a fabricated card", () => {
  const payload = data({ concepts: [concept({ resources: [] })] });
  const result = resolveDeck(request({ type: "concept", conceptId: "concept:shortcut" }), options(payload));
  assert.equal(result.status, "empty");
  assert.equal(result.reasonCode, "concept-without-resources");
});

test("C06: unsupported goal route is surfaced honestly", () => {
  const payload = data({ goals: [goal({ status: "unsupported", explanation: "Prerequisite cycle." })] });
  const result = resolveDeck(request({ type: "goal", goalId: "goal:test" }), options(payload));
  assert.equal(result.status, "unsupported");
  assert.equal(result.reasonCode, "goal-unsupported");
});

test("C07: legacy v1 one-card request is adapted explicitly", () => {
  const result = resolveDeck(
    {
      schemaVersion: "intelligent-atlas-deck-request/1.0",
      requestId: "legacy-1",
      date: "2026-10-26",
      graphBuildId: GRAPH,
    },
    options(),
  );
  assert.equal(result.status, "ready");
  assert.equal(result.deck.cardCount, 1);
  assert.match(result.limitations.join(" "), /Legacy v1 request adapted/);
});

test("C07: legacy edition adapter preserves the single card", () => {
  const deck = adaptLegacyEdition(insight());
  assert.equal(deck.cardCount, 1);
  assert.equal(deck.cards[0].kind, "insight");
  assert.equal(deck.cards[0].cardId, "legacy-insight-1");
});

test("C08: mixed graph revision is rejected", () => {
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }, { graphBuildId: "old-graph" }), options());
  assert.equal(result.status, "error");
  assert.equal(result.reasonCode, "stale-snapshot");
});

test("C08: mixed source index is rejected", () => {
  const result = resolveDeck(
    request({ type: "daily-edition", date: "2026-10-26" }, { sourceIndexBuildId: "old-source" }),
    options(),
  );
  assert.equal(result.status, "error");
  assert.equal(result.reasonCode, "mixed-source-index");
});

test("C10: external or script return hrefs are rejected", () => {
  for (const href of ["javascript:alert(1)", "https://evil.example/x", "data:text/html,hi"]) {
    const validation = validateReturnContext({
      version: "return-context/1.0",
      scene: "knowledge",
      resource: { href },
    });
    assert.equal(validation.ok, false);
  }
});

test("C10: oversized expansion is rejected", () => {
  const validation = validateReturnContext({
    version: "return-context/1.0",
    scene: "knowledge",
    expansion: { ids: Array.from({ length: 21 }, (_, index) => `id-${index}`), limit: 21 },
  });
  assert.equal(validation.ok, false);
});

test("C10: invalid return context stops deck resolution", () => {
  const result = resolveDeck(
    request(
      { type: "daily-edition", date: "2026-10-26" },
      { returnContext: { version: "return-context/1.0", scene: "knowledge", resource: { href: "https://evil.example" } } },
    ),
    options(),
  );
  assert.equal(result.status, "error");
  assert.equal(result.reasonCode, "invalid-return-context");
});

test("C04: operational card cap is enforced with an explicit limitation", () => {
  const many = Array.from({ length: MAX_CARDS + 3 }, (_, index) =>
    insight({ id: `i-${index}`, cardTitle: `Card ${index}` }),
  );
  const result = resolveDeck(request({ type: "daily-edition", date: "2026-10-26" }), options(data({ insights: many })));
  assert.equal(result.status, "ready");
  assert.equal(result.deck.cardCount, MAX_CARDS);
  assert.match(result.limitations.join(" "), /operational cap/);
});

test("deterministic resolution: identical request and snapshot produce identical output", () => {
  const first = resolveDeck(request({ type: "goal", goalId: "goal:test" }), options());
  const second = resolveDeck(request({ type: "goal", goalId: "goal:test" }), options());
  assert.deepEqual(first, second);
});

test("unsafe resource hrefs are stripped from actions and reader", () => {
  const payload = data({
    concepts: [
      concept({
        resources: [
          {
            unitId: "bad",
            href: "javascript:alert(1)",
            role: "explains",
            locator: "x",
            sourcePath: "test",
          },
        ],
      }),
    ],
  });
  const result = resolveDeck(request({ type: "concept", conceptId: "concept:shortcut" }), options(payload));
  assert.equal(result.status, "ready");
  assert.equal(result.deck.cards[0].reader.href, undefined);
  assert.ok(!result.deck.cards[0].allowedActions.some((action) => action.href));
});
