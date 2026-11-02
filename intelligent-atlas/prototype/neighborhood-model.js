/* Hansa neighbourhood model — pure, testable local graph selection.
 *
 * The model reads only the candidate graph in the review payload. It never
 * invents an edge, never treats subject membership as a relation, and keeps the
 * stored direction explicit: A -> B means "A requires B".
 *
 * Classic-script UMD so the no-build prototype and Node tests share one source.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HansaNeighborhood = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const RELATED_TYPES = {
    related_in_decision: "Related in a decision",
    enables: "Enables",
    part_of_mechanism: "Part of a mechanism",
    complements: "Complements",
    tradeoff_with: "Trade-off with",
  };

  const GROUPS = [
    { key: "requires", label: "Requires first", relation: "requires" },
    { key: "unlocks", label: "Unlocks", relation: "unlocks" },
    { key: "contrasts", label: "Contrasts", relation: "contrasts" },
    { key: "related", label: "Related", relation: "related" },
  ];

  const GROUP_BY_KEY = new Map(GROUPS.map((group) => [group.key, group]));

  const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

  function conceptMap(data) {
    return new Map((data.concepts || []).map((concept) => [concept.id, concept]));
  }

  function degreeMap(data) {
    const degree = new Map((data.concepts || []).map((concept) => [concept.id, 0]));
    for (const edge of data.edges || []) {
      if (degree.has(edge.from)) degree.set(edge.from, degree.get(edge.from) + 1);
      if (degree.has(edge.to)) degree.set(edge.to, degree.get(edge.to) + 1);
    }
    return degree;
  }

  function starterRank(concept, degree) {
    return [
      concept.reading ? 0 : 1,
      -(degree.get(concept.id) || 0),
      concept.label.localeCompare(concept.label),
    ];
  }

  function compareStarters(a, b, degree) {
    const left = starterRank(a, degree);
    const right = starterRank(b, degree);
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] < right[index]) return -1;
      if (left[index] > right[index]) return 1;
    }
    return 0;
  }

  function buildSubjectEntrances(data, options = {}) {
    const limit = Math.max(1, Number(options.limit) || 3);
    const concepts = data.concepts || [];
    const degree = degreeMap(data);
    const domains = data.domains || [];

    return domains.map((domain) => {
      const members = concepts
        .filter((concept) => concept.domain === domain.id)
        .sort((a, b) => compareStarters(a, b, degree));
      return {
        id: domain.id,
        label: domain.label,
        short: domain.short,
        colorToken: domain.colorToken || domain.id,
        count: members.length,
        readCount: members.filter((concept) => concept.reading).length,
        starters: members.slice(0, limit).map((concept) => ({
          id: concept.id,
          label: concept.label,
          domain: concept.domain,
          domainLabel: concept.domainLabel,
          read: Boolean(concept.reading),
          degree: degree.get(concept.id) || 0,
        })),
      };
    });
  }

  function semanticEntries(data, concept) {
    const entries = [];

    for (const prerequisite of concept.prerequisites || []) {
      entries.push({
        ...prerequisite,
        relation: "requires",
        relationType: "requires_understanding_of",
        group: "requires",
        direction: "out",
        label: prerequisite.label,
      });
    }
    for (const dependent of concept.dependents || []) {
      entries.push({
        ...dependent,
        relation: "unlocks",
        relationType: "requires_understanding_of",
        group: "unlocks",
        direction: "in",
        label: dependent.label,
      });
    }
    for (const contrast of concept.contrasts || []) {
      entries.push({
        ...contrast,
        relation: "contrasts",
        relationType: contrast.relationType || "contrasts_with",
        group: "contrasts",
        direction: "neutral",
        label: contrast.label,
      });
    }

    const known = new Set(entries.map((entry) => entry.edgeId));
    const byId = conceptMap(data);
    for (const edge of data.edges || []) {
      if (!RELATED_TYPES[edge.relationType]) continue;
      if (edge.from !== concept.id && edge.to !== concept.id) continue;
      if (known.has(edge.id)) continue;
      const otherId = edge.from === concept.id ? edge.to : edge.from;
      const other = byId.get(otherId);
      if (!other) continue;
      entries.push({
        id: otherId,
        label: other.label,
        edgeId: edge.id,
        claim: edge.claim,
        conditions: edge.conditions,
        crossDomain: Boolean(edge.crossDomain),
        relation: "related",
        relationType: edge.relationType,
        relationLabel: RELATED_TYPES[edge.relationType],
        group: "related",
        direction: edge.from === concept.id ? "out" : "in",
      });
      known.add(edge.id);
    }

    return entries;
  }

  function buildNeighborhood(data, conceptId, options = {}) {
    const byId = conceptMap(data);
    const concept = byId.get(conceptId);
    if (!concept) {
      return {
        center: null,
        groups: [],
        shown: [],
        hidden: [],
        total: 0,
        hiddenCount: 0,
        limit: 0,
        sameSubject: { count: 0, starters: [], label: "" },
        candidate: true,
      };
    }

    const limit = Math.max(1, Number(options.limit) || 4);
    const degree = degreeMap(data);
    const all = semanticEntries(data, concept);
    const seen = new Set();
    const unique = all.filter((entry) => {
      if (!entry.edgeId || seen.has(entry.edgeId)) return false;
      seen.add(entry.edgeId);
      return true;
    });

    const ordered = [];
    for (const group of GROUPS) {
      const entries = unique
        .filter((entry) => entry.group === group.key)
        .sort((a, b) => a.label.localeCompare(b.label));
      for (const entry of entries) ordered.push(entry);
    }

    const shownIds = new Set(ordered.slice(0, limit).map((entry) => entry.edgeId));
    const groups = GROUPS.map((group) => {
      const entries = ordered.filter((entry) => entry.group === group.key);
      return {
        key: group.key,
        label: group.label,
        relation: group.relation,
        count: entries.length,
        entries: entries.map((entry) => ({
          ...entry,
          shown: shownIds.has(entry.edgeId),
        })),
      };
    });

    const shown = ordered.slice(0, limit);
    const hidden = ordered.slice(limit);
    const semanticNeighbors = new Set(ordered.map((entry) => entry.id));
    const sameSubjectMembers = (data.concepts || [])
      .filter(
        (candidate) =>
          candidate.domain === concept.domain &&
          candidate.id !== concept.id &&
          !semanticNeighbors.has(candidate.id),
      )
      .sort((a, b) => compareStarters(a, b, degree));

    return {
      center: {
        id: concept.id,
        label: concept.label,
        domain: concept.domain,
        domainLabel: concept.domainLabel,
        definition: concept.definition,
        scope: concept.scope,
        reading: Boolean(concept.reading),
        degree: degree.get(concept.id) || 0,
      },
      groups,
      shown,
      hidden,
      total: ordered.length,
      hiddenCount: hidden.length,
      limit,
      sameSubject: {
        label: concept.domainLabel,
        count: sameSubjectMembers.length,
        starters: sameSubjectMembers.slice(0, 3).map((candidate) => ({
          id: candidate.id,
          label: candidate.label,
          read: Boolean(candidate.reading),
        })),
      },
      candidate: true,
    };
  }

  function relationLabel(entry) {
    if (!entry) return "";
    if (entry.group === "related" && entry.relationLabel) return entry.relationLabel;
    return GROUP_BY_KEY.get(entry.group)?.label || "Related";
  }

  function directionLabel(entry) {
    if (!entry) return "";
    if (entry.group === "requires") return "This concept requires it first";
    if (entry.group === "unlocks") return "This concept is required by it";
    if (entry.group === "contrasts") return "Candidate contrast";
    return entry.direction === "out" ? "Candidate relation" : "Candidate relation";
  }

  return {
    buildNeighborhood,
    buildSubjectEntrances,
    relationLabel,
    directionLabel,
    semanticEntries,
    GROUPS,
    RELATED_TYPES,
    plural,
  };
});
