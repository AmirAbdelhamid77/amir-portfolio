// Deterministic classification of an imported question.
//
// Two independent labels are produced and never mixed:
//
// 1. `objectiveId` / `domain` — alignment to the official DP-600 study guide.
//    When `importMetadata.exam_objective` exists, the source string decides.
//    When it does not, the subject rule decides and is marked low confidence.
// 2. `subject` — a browsable Fabric technology area, so a reader can find
//    "Direct Lake" without knowing which video covered it.
//
// Everything here is pure and rule-based, so the import script, the site, the
// reports and the tests share one implementation and cannot drift.

import {
  DOMAINS,
  OBJECTIVES,
  PACK_SUBJECT,
  SUBJECTS,
  SUBJECT_OBJECTIVE,
} from "./taxonomy.ts";
import type {
  Confidence,
  FabricCoverage,
  FabricIndexEntry,
  FabricQuestionType,
  ObjectiveId,
  Scope,
  SubjectId,
} from "./types";

export type FabricDomainId = "1" | "2" | "3";

/**
 * Where the objective label came from. Recorded so the coverage report can say
 * how many "focused" questions rest on the source's own objective statement
 * and how many rest on a topic rule.
 * - `declared`    — `exam_objective` names the sub-objective itself.
 * - `derived`     — the source names a domain; the sub-objective comes from the
 *                   question's topic, inside that domain.
 * - `domain-only` — only a domain is known; no sub-objective is claimed.
 * - `none`        — no defensible objective mapping.
 */
export type ObjectiveBasis = "declared" | "derived" | "domain-only" | "none";

export interface Classification {
  subject: SubjectId;
  subjects: SubjectId[];
  objectiveId: ObjectiveId | null;
  domain: FabricDomainId | null;
  scope: Scope;
  confidence: Confidence;
  objectiveBasis: ObjectiveBasis;
  /** Short, human-readable reason shown in the explorer's "why this label". */
  reason: string;
}

const MIN_SUBJECT_SCORE = 3;
const AMBIGUITY_MARGIN = 2;

const FIELD_WEIGHTS = {
  pack: 5,
  topic: 3,
  refs: 3,
  title: 2,
  prompt: 1,
} as const;

interface ClassifyInput {
  topic: string;
  title: string;
  prompt: string;
  pack: string;
  refs: string[];
  sourceObjective: string | null;
}

function lower(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

/**
 * Score each subject against the question's own words. A keyword contributes
 * its field weight once per subject, so repeating a word cannot inflate a match.
 */
export function scoreSubjects(input: ClassifyInput): Map<SubjectId, number> {
  const fields: { weight: number; text: string }[] = [
    { weight: FIELD_WEIGHTS.topic, text: lower(input.topic) },
    { weight: FIELD_WEIGHTS.title, text: lower(input.title) },
    { weight: FIELD_WEIGHTS.prompt, text: lower(input.prompt) },
    { weight: FIELD_WEIGHTS.refs, text: input.refs.join(" ").toLowerCase() },
  ];

  const scores = new Map<SubjectId, number>();
  for (const subject of SUBJECTS) {
    let score = 0;
    for (const keyword of subject.keywords) {
      for (const field of fields) {
        if (field.text.includes(keyword)) {
          score += field.weight;
          break;
        }
      }
    }
    if (score > 0) scores.set(subject.id, score);
  }

  const prior = PACK_SUBJECT[input.pack];
  if (prior) scores.set(prior, (scores.get(prior) ?? 0) + FIELD_WEIGHTS.pack);

  return scores;
}

/** Domain markers in the exact wording the study guide uses. */
const DOMAIN_MARKERS: { domain: FabricDomainId; pattern: RegExp }[] = [
  { domain: "1", pattern: /maintain a data analytics solution/ },
  { domain: "2", pattern: /prepare data/ },
  { domain: "3", pattern: /semantic model/ },
];

const DOMAIN_ONLY_LABEL: Record<FabricDomainId, string> = {
  "1": "Maintain a data analytics solution",
  "2": "Prepare data",
  "3": "Implement and manage semantic models",
};

/**
 * Resolve the official objective from the source's own `exam_objective` text.
 * The first domain named in the string wins; the sub-objective is taken from
 * that domain's slice of the text only.
 */
export function objectiveFromSource(text: string): {
  domain: FabricDomainId | null;
  objectiveId: ObjectiveId | null;
} {
  const t = lower(text);
  let domain: FabricDomainId | null = null;
  let start = -1;
  for (const marker of DOMAIN_MARKERS) {
    const index = t.search(marker.pattern);
    if (index === -1) continue;
    if (start === -1 || index < start) {
      start = index;
      domain = marker.domain;
    }
  }
  if (!domain || start === -1) return { domain: null, objectiveId: null };

  // Slice from this domain until the next domain marker appears.
  let end = t.length;
  for (const marker of DOMAIN_MARKERS) {
    const index = t.slice(start + 1).search(marker.pattern);
    if (index === -1) continue;
    const absolute = start + 1 + index;
    if (absolute < end) end = absolute;
  }
  const slice = t.slice(start, end);

  if (domain === "1") {
    const security = slice.search(/security|governance/);
    const lifecycle = slice.search(
      /lifecycle|deployment pipeline|version control|impact analysis|git/,
    );
    if (security !== -1 && (lifecycle === -1 || security < lifecycle)) return { domain, objectiveId: "1.1" };
    if (lifecycle !== -1) return { domain, objectiveId: "1.2" };
    return { domain, objectiveId: null };
  }

  if (domain === "2") {
    const query = slice.search(/query and analyze|query with sql|query with kql/);
    const transform = slice.search(/transform data|create views/);
    const get = slice.search(
      /get data|data connection|choose between different data stores|discover data|ingest or access|design ingestion|ingestion scenarios/,
    );
    // "Get data, Transform data, or Query and analyze data" names all three, so
    // the sub-objective is genuinely unresolved.
    const mentions = [query, transform, get].filter((value) => value !== -1);
    if (mentions.length !== 1) return { domain, objectiveId: null };
    if (query !== -1) return { domain, objectiveId: "2.3" };
    if (transform !== -1) return { domain, objectiveId: "2.2" };
    return { domain, objectiveId: "2.1" };
  }

  const optimize = slice.search(
    /optimize|direct lake|storage mode|incremental refresh|dax performance|performance improvements|fallback/,
  );
  const design = slice.search(
    /design and build|star schema|relationships|dax variables|calculation group|composite model|large semantic model/,
  );
  if (optimize !== -1 && (design === -1 || optimize < design)) return { domain, objectiveId: "3.2" };
  if (design !== -1) return { domain, objectiveId: "3.1" };
  return { domain, objectiveId: null };
}

/**
 * How far the question can be trusted as DP-600 revision material.
 * The source's own qualifiers decide; nothing is promoted to `core` by wish.
 */
export function scopeFromSource(text: string | null): Scope {
  if (!text) return "support";
  const t = lower(text);
  if (/dp-700 primary/.test(t)) return "adjacent";
  if (/dp-700 (core|advanced|enrichment|orchestration|depth|mechanics)/.test(t)) return "support";
  if (/dp-600 supporting/.test(t)) return "support";
  if (/supporting|enrichment|adjacent/.test(t)) return "support";
  return "core";
}

/** Sub-objective within domain 3 when the source only says "semantic model". */
function refineSemanticObjective(
  subject: SubjectId,
  text: string,
  fallback: ObjectiveId,
): ObjectiveId {
  if (subject !== "semantic-models") return fallback;
  if (/direct lake|storage mode|incremental refresh|dax performance|optimi|fallback/.test(text)) {
    return "3.2";
  }
  return "3.1";
}

export function classify(input: ClassifyInput): Classification {
  const scores = scoreSubjects(input);
  const ranked = [...scores.entries()]
    .filter(([, score]) => score >= MIN_SUBJECT_SCORE)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const prior = PACK_SUBJECT[input.pack];
  const subject: SubjectId = ranked[0]?.[0] ?? prior ?? "onelake";
  const secondary = ranked
    .slice(1)
    .filter(([, score]) => score >= MIN_SUBJECT_SCORE + 1)
    .slice(0, 2)
    .map(([id]) => id);
  const subjects = [subject, ...secondary.filter((id) => id !== subject)];

  const margin = ranked.length > 1 ? ranked[0][1] - ranked[1][1] : (ranked[0]?.[1] ?? 0);
  const ambiguous = ranked.length > 1 && margin < AMBIGUITY_MARGIN;

  const haystack = `${lower(input.topic)} ${lower(input.title)} ${lower(input.prompt)}`;
  const derived = refineSemanticObjective(subject, haystack, SUBJECT_OBJECTIVE[subject]);

  if (input.sourceObjective) {
    const fromSource = objectiveFromSource(input.sourceObjective);
    const scope = scopeFromSource(input.sourceObjective);

    // The source's own domain claim is authoritative. A topic-derived
    // sub-objective may only refine it *inside* that domain: "Prepare data"
    // plus a security subject must not produce 1.1, because a question cannot
    // belong to domain 2 and sub-objective 1.1 at the same time. That single
    // inconsistency is what made the domain shares (297/170/13) disagree with
    // the sub-objective sums (347/125/8). When the subject's habitual
    // objective sits in another domain, the question stays at domain level.
    const derivedInDomain =
      fromSource.domain && derived && OBJECTIVE_DOMAIN.get(derived) === fromSource.domain
        ? derived
        : null;
    const objectiveId = fromSource.objectiveId ?? derivedInDomain;
    const domain =
      fromSource.domain ?? OBJECTIVE_DOMAIN.get(objectiveId ?? derived) ?? null;
    const objectiveBasis: ObjectiveBasis = fromSource.objectiveId
      ? "declared"
      : objectiveId
        ? "derived"
        : domain
          ? "domain-only"
          : "none";
    const confidence: Confidence =
      scope === "adjacent" ? "high" : fromSource.objectiveId ? "high" : "medium";

    let reason: string;
    if (fromSource.objectiveId) {
      reason = `Source declares “${input.sourceObjective}”.`;
    } else if (fromSource.domain && derivedInDomain) {
      reason = `Source names ${DOMAIN_ONLY_LABEL[fromSource.domain]} but not a sub-objective; ${objectiveId} derived from the question's topic, inside the declared domain.`;
    } else if (fromSource.domain) {
      reason =
        `Source names ${DOMAIN_ONLY_LABEL[fromSource.domain]} but not a sub-objective. ` +
        `The “${subject}” topic would default to ${derived}, which belongs to another domain, so the question is kept at domain level instead of being re-labelled.`;
    } else {
      reason = `Source text did not name a study-guide domain; the ${subject} subject maps to domain ${domain}, and no sub-objective is claimed.`;
    }

    return {
      subject,
      subjects,
      objectiveId,
      domain,
      scope,
      confidence,
      objectiveBasis,
      reason,
    };
  }

  // No declared objective: the mapping is a topic inference, never a claim.
  const objectiveId = ambiguous ? null : derived;
  const domain = ambiguous ? null : (OBJECTIVE_DOMAIN.get(objectiveId ?? derived) ?? null);
  const scope: Scope = ambiguous ? "review" : "support";
  return {
    subject,
    subjects,
    objectiveId,
    domain,
    scope,
    confidence: ambiguous ? "low" : "medium",
    objectiveBasis: ambiguous ? "none" : objectiveId ? "derived" : "domain-only",
    reason: ambiguous
      ? "No declared objective, and the topic rules scored two subjects equally — needs a human decision."
      : objectiveId
        ? `No declared objective in the source; the “${subject}” subject maps to sub-objective ${objectiveId}.`
        : `No declared objective in the source; the “${subject}” subject maps to domain ${domain} only.`,
  };
}

const OBJECTIVE_DOMAIN = new Map<ObjectiveId, FabricDomainId>(
  OBJECTIVES.map((item) => [item.id, item.domain]),
);

/** Empty coverage accumulator, shaped exactly like `FabricCoverage`. */
export function emptyCoverage(): FabricCoverage {
  return {
    byObjective: [],
    bySubject: [],
    byScope: [],
    byType: [],
    byPack: [],
    byDifficulty: [],
    byBasis: [],
    domainShares: [],
    totals: {
      questions: 0,
      core: 0,
      support: 0,
      adjacent: 0,
      review: 0,
      packs: 0,
      objectivesCovered: 0,
      objectivesMissing: 0,
      fiveOption: 0,
      withCaseStudy: 0,
      withCode: 0,
      multiSelect: 0,
      singleSelect: 0,
      sequence: 0,
      sources: 0,
    },
  };
}

interface CoverageExtras {
  packs: { key: string; label: string }[];
  sources: number;
}

/**
 * Aggregate coverage from the index. The same function produces the numbers
 * shipped in `content/fabric/meta.json` and the numbers the site displays, and
 * a test asserts they agree.
 */
export function buildCoverage(
  entries: FabricIndexEntry[],
  extras: CoverageExtras,
): FabricCoverage {
  const coverage = emptyCoverage();
  const scopeKeys: Scope[] = ["core", "support", "adjacent", "review"];
  const typeKeys: FabricQuestionType[] = ["single", "multi", "sequence"];

  const objectiveRows = new Map<string, FabricCoverage["byObjective"][number]>();
  for (const objective of OBJECTIVES) {
    objectiveRows.set(objective.id, {
      key: objective.id,
      label: `DP-600 ${objective.id} · ${objective.label}`,
      total: 0,
      core: 0,
      support: 0,
      adjacent: 0,
      review: 0,
    });
  }
  for (const domain of DOMAINS) {
    objectiveRows.set(domain.id, {
      key: domain.id,
      label: `DP-600 ${domain.id} · ${domain.label} (sub-objective not stated)`,
      total: 0,
      core: 0,
      support: 0,
      adjacent: 0,
      review: 0,
    });
  }
  objectiveRows.set("unmapped", {
    key: "unmapped",
    label: "No defensible objective mapping",
    total: 0,
    core: 0,
    support: 0,
    adjacent: 0,
    review: 0,
  });

  const subjectRows = new Map<SubjectId, FabricCoverage["bySubject"][number]>();
  for (const subject of SUBJECTS) {
    subjectRows.set(subject.id, {
      key: subject.id,
      label: subject.label,
      total: 0,
      core: 0,
      support: 0,
      adjacent: 0,
      review: 0,
    });
  }

  const scopeRows = new Map<Scope, number>();
  for (const scope of scopeKeys) scopeRows.set(scope, 0);
  const typeRows = new Map<FabricQuestionType, number>();
  for (const type of typeKeys) typeRows.set(type, 0);
  const packRows = new Map<string, { total: number; core: number }>();
  for (const pack of extras.packs) packRows.set(pack.key, { total: 0, core: 0 });
  const difficultyRows = new Map<number | null, number>();

  const basisKeys: ObjectiveBasis[] = ["declared", "derived", "domain-only", "none"];
  const basisRows = new Map<ObjectiveBasis, { total: number; core: number }>();
  for (const basis of basisKeys) basisRows.set(basis, { total: 0, core: 0 });

  for (const entry of entries) {
    const key = entry.objectiveId ?? entry.domain ?? "unmapped";
    const objectiveRow = objectiveRows.get(key) ?? objectiveRows.get("unmapped")!;
    objectiveRow.total += 1;
    objectiveRow[entry.scope] += 1;

    const subjectRow = subjectRows.get(entry.subject);
    if (subjectRow) {
      subjectRow.total += 1;
      subjectRow[entry.scope] += 1;
    }

    scopeRows.set(entry.scope, (scopeRows.get(entry.scope) ?? 0) + 1);
    typeRows.set(entry.type, (typeRows.get(entry.type) ?? 0) + 1);

    const packRow = packRows.get(entry.pack) ?? { total: 0, core: 0 };
    packRow.total += 1;
    if (entry.scope === "core") packRow.core += 1;
    packRows.set(entry.pack, packRow);

    difficultyRows.set(entry.difficulty, (difficultyRows.get(entry.difficulty) ?? 0) + 1);

    const basisRow = basisRows.get(entry.objectiveBasis ?? "none") ?? basisRows.get("none")!;
    basisRow.total += 1;
    if (entry.scope === "core") basisRow.core += 1;

    if (entry.optionCount === 5) coverage.totals.fiveOption += 1;
    if (entry.caseStudyId) coverage.totals.withCaseStudy += 1;
    if (entry.hasCode) coverage.totals.withCode += 1;
  }

  coverage.byObjective = [...objectiveRows.values()];
  coverage.bySubject = [...subjectRows.values()];
  coverage.byScope = scopeKeys.map((scope) => ({ scope, total: scopeRows.get(scope) ?? 0 }));
  coverage.byType = typeKeys.map((type) => ({ type, total: typeRows.get(type) ?? 0 }));
  coverage.byPack = extras.packs.map((pack) => ({
    pack: pack.key,
    label: pack.label,
    total: packRows.get(pack.key)?.total ?? 0,
    core: packRows.get(pack.key)?.core ?? 0,
  }));
  coverage.byDifficulty = [...difficultyRows.entries()]
    .map(([difficulty, total]) => ({ difficulty, total }))
    .sort((a, b) => (b.difficulty ?? 0) - (a.difficulty ?? 0));
  coverage.byBasis = basisKeys.map((basis) => ({
    basis,
    total: basisRows.get(basis)?.total ?? 0,
    core: basisRows.get(basis)?.core ?? 0,
  }));

  const coreTotal = coverage.byScope.find((row) => row.scope === "core")?.total ?? 0;
  // Domain shares are read from the same objective buckets the sub-objective
  // table renders, so the two can never tell different stories. A question
  // lands in exactly one bucket (`objectiveId ?? domain ?? unmapped`), so this
  // is a partition of the bank, not an overlapping multi-map.
  coverage.domainShares = DOMAINS.map((domain) => {
    const subObjectives = OBJECTIVES.filter((objective) => objective.domain === domain.id);
    const coreSubObjective = subObjectives.reduce(
      (sum, objective) => sum + (objectiveRows.get(objective.id)?.core ?? 0),
      0,
    );
    const coreDomainOnly = objectiveRows.get(domain.id)?.core ?? 0;
    const coreQuestions = coreSubObjective + coreDomainOnly;
    return {
      domain: domain.id,
      label: domain.label,
      officialWeight: domain.officialWeight,
      coreQuestions,
      coreShare: coreTotal ? Math.round((coreQuestions / coreTotal) * 1000) / 10 : 0,
      coreSubObjective,
      coreDomainOnly,
    };
  });

  coverage.totals.questions = entries.length;
  coverage.totals.core = coreTotal;
  coverage.totals.support = scopeRows.get("support") ?? 0;
  coverage.totals.adjacent = scopeRows.get("adjacent") ?? 0;
  coverage.totals.review = scopeRows.get("review") ?? 0;
  coverage.totals.packs = extras.packs.length;
  coverage.totals.multiSelect = typeRows.get("multi") ?? 0;
  coverage.totals.singleSelect = typeRows.get("single") ?? 0;
  coverage.totals.sequence = typeRows.get("sequence") ?? 0;
  coverage.totals.sources = extras.sources;
  coverage.totals.objectivesCovered = OBJECTIVES.filter(
    (objective) => (objectiveRows.get(objective.id)?.total ?? 0) > 0,
  ).length;
  coverage.totals.objectivesMissing = OBJECTIVES.length - coverage.totals.objectivesCovered;

  return coverage;
}
