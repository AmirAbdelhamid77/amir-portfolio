import type { UnitSeed } from "./build";
import type { GraphEdge, GraphNode } from "./types";

const STOPWORDS = new Set(
  (
    "the and for with that this from are was were you your our their its not but into than then them they " +
    "can could should would may might must have has had how what when where which who why all any each more most " +
    "some such only also just like use used using one two three first second next last over under between within " +
    "about above after before during while because both same other another these those there here " +
    "note notes chapter chapters lesson lessons point points source sources step steps work works working " +
    "make makes making take takes taken give gives given need needs needed say says said see seen " +
    "fabric microsoft learn docs doc data"
  ).split(/\s+/),
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^-+|-+$/g, ""))
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

interface CandidateOptions {
  threshold?: number;
  perUnit?: number;
  cap?: number;
}

/**
 * TF-IDF cosine over the registry's own objective/takeaway text. This is a
 * suggestion engine only: the result is a candidate layer, never a reviewed
 * relation, and it is stored with the terms that produced the score so a reader
 * can reject it.
 */
export function candidateEdges(units: UnitSeed[], options: CandidateOptions = {}): GraphEdge[] {
  const threshold = options.threshold ?? 0.2;
  const perUnit = options.perUnit ?? 3;
  const cap = options.cap ?? 500;
  const docs = units
    .filter((unit) => unit.text.trim().length > 40)
    .map((unit) => ({ unit, counts: new Map<string, number>() }));
  const documentFrequency = new Map<string, number>();
  for (const doc of docs) {
    for (const token of tokenize(doc.unit.text)) {
      doc.counts.set(token, (doc.counts.get(token) ?? 0) + 1);
    }
    for (const token of doc.counts.keys()) documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
  }
  const total = docs.length;
  const vectors = new Map<string, Map<string, number>>();
  for (const doc of docs) {
    const vector = new Map<string, number>();
    let norm = 0;
    for (const [token, count] of doc.counts) {
      const idf = Math.log((total + 1) / ((documentFrequency.get(token) ?? 0) + 1)) + 1;
      const weight = (1 + Math.log(count)) * idf;
      vector.set(token, weight);
      norm += weight * weight;
    }
    norm = Math.sqrt(norm);
    if (norm > 0) for (const [token, weight] of vector) vector.set(token, weight / norm);
    vectors.set(doc.unit.id, vector);
  }

  const containerOf = new Map(units.map((unit) => [unit.id, unit.container ?? `subject:${unit.subject}`]));
  const best = new Map<string, { other: string; score: number; terms: string[] }[]>();
  const ids = [...vectors.keys()].sort();
  for (let i = 0; i < ids.length; i += 1) {
    const a = ids[i];
    const vectorA = vectors.get(a)!;
    for (let j = i + 1; j < ids.length; j += 1) {
      const b = ids[j];
      // The same container is already connected structurally; similarity inside
      // it would restate membership. Cross-container pairs are the discovery.
      if (containerOf.get(a) === containerOf.get(b)) continue;
      const vectorB = vectors.get(b)!;
      const [small, large] = vectorA.size < vectorB.size ? [vectorA, vectorB] : [vectorB, vectorA];
      let dot = 0;
      const shared: { token: string; weight: number }[] = [];
      for (const [token, weight] of small) {
        const other = large.get(token);
        if (!other) continue;
        dot += weight * other;
        shared.push({ token, weight: weight * other });
      }
      if (dot < threshold) continue;
      shared.sort((x, y) => y.weight - x.weight || (x.token < y.token ? -1 : 1));
      const terms = shared.slice(0, 5).map((entry) => entry.token);
      for (const [from, to] of [
        [a, b],
        [b, a],
      ]) {
        const list = best.get(from) ?? [];
        list.push({ other: to, score: dot, terms });
        best.set(from, list);
      }
    }
  }

  const kept = new Map<string, { a: string; b: string; score: number; terms: string[] }>();
  for (const [unitId, list] of best) {
    list
      .sort((x, y) => y.score - x.score || (x.other < y.other ? -1 : 1))
      .slice(0, perUnit)
      .forEach((entry) => {
        const key = unitId < entry.other ? `${unitId}|${entry.other}` : `${entry.other}|${unitId}`;
        const [a, b] = key.split("|");
        kept.set(key, { a, b, score: entry.score, terms: entry.terms });
      });
  }

  return [...kept.values()]
    .sort((x, y) => y.score - x.score || (x.a < y.a ? -1 : 1))
    .slice(0, cap)
    .map((entry) => ({
      id: `lexical:${entry.a}<->${entry.b}`,
      from: entry.a,
      to: entry.b,
      kind: "lexical",
      layer: "candidate" as const,
      evidence: `Text similarity ${(entry.score * 100).toFixed(0)}% over shared terms (${entry.terms.join(", ")}). Inferred candidate, not a reviewed relation.`,
      score: Number(entry.score.toFixed(3)),
      terms: entry.terms,
    }));
}

interface WeightedEdge {
  a: string;
  b: string;
  weight: number;
}

interface LocalMove {
  label: Map<string, number>;
  moved: boolean;
  communities: number;
}

function localMoving(nodeIds: string[], edges: WeightedEdge[], resolution: number): LocalMove {
  const adjacency = new Map<string, Map<string, number>>();
  for (const id of nodeIds) adjacency.set(id, new Map());
  for (const edge of edges) {
    if (!adjacency.has(edge.a) || !adjacency.has(edge.b) || edge.a === edge.b) continue;
    adjacency.get(edge.a)!.set(edge.b, (adjacency.get(edge.a)!.get(edge.b) ?? 0) + edge.weight);
    adjacency.get(edge.b)!.set(edge.a, (adjacency.get(edge.b)!.get(edge.a) ?? 0) + edge.weight);
  }
  const degree = new Map<string, number>();
  let twoM = 0;
  for (const [id, neighbours] of adjacency) {
    let sum = 0;
    for (const weight of neighbours.values()) sum += weight;
    degree.set(id, sum);
    twoM += sum;
  }
  const label = new Map<string, number>();
  const totals = new Map<number, number>();
  nodeIds.forEach((id, index) => {
    label.set(id, index);
    totals.set(index, degree.get(id) ?? 0);
  });
  if (twoM === 0) return { label, moved: false, communities: nodeIds.length };

  let movedAny = false;
  const order = [...nodeIds].sort();
  for (let sweep = 0; sweep < 30; sweep += 1) {
    let moved = false;
    for (const id of order) {
      const current = label.get(id)!;
      const k = degree.get(id) ?? 0;
      const weights = new Map<number, number>();
      for (const [other, weight] of adjacency.get(id)!) {
        const target = label.get(other)!;
        weights.set(target, (weights.get(target) ?? 0) + weight);
      }
      totals.set(current, (totals.get(current) ?? 0) - k);
      let bestCommunity = current;
      let bestGain = (weights.get(current) ?? 0) - (resolution * (totals.get(current) ?? 0) * k) / twoM;
      for (const [target, weight] of [...weights.entries()].sort((x, y) => x[0] - y[0])) {
        if (target === current) continue;
        const gain = weight - (resolution * (totals.get(target) ?? 0) * k) / twoM;
        if (gain > bestGain + 1e-9) {
          bestGain = gain;
          bestCommunity = target;
        }
      }
      totals.set(bestCommunity, (totals.get(bestCommunity) ?? 0) + k);
      if (bestCommunity !== current) {
        label.set(id, bestCommunity);
        moved = true;
        movedAny = true;
      }
    }
    if (!moved) break;
  }
  const distinct = new Set(label.values());
  return { label, moved: movedAny, communities: distinct.size };
}

/**
 * Multi-level Louvain (local moving + aggregation). Deterministic: nodes are
 * visited in sorted order and ties go to the lowest community index, so the
 * same corpus always produces the same grouping.
 */
export function louvain(
  nodeIds: string[],
  edges: WeightedEdge[],
  options: { resolution?: number } = {},
): { community: Map<string, number>; modularity: number } {
  const resolution = options.resolution ?? 1;
  let membership = new Map<string, string>(nodeIds.map((id) => [id, id]));
  let currentNodes = [...nodeIds].sort();
  let currentEdges = edges.filter((edge) => edge.a !== edge.b);
  let levels = 0;

  while (levels < 8) {
    levels += 1;
    const result = localMoving(currentNodes, currentEdges, resolution);
    if (result.communities === currentNodes.length) break;

    const nextMembership = new Map<string, string>();
    for (const original of nodeIds) {
      const supernode = membership.get(original)!;
      nextMembership.set(original, `c:${result.label.get(supernode) ?? 0}`);
    }
    membership = nextMembership;

    const aggregated = new Map<string, number>();
    for (const edge of currentEdges) {
      const a = `c:${result.label.get(edge.a) ?? 0}`;
      const b = `c:${result.label.get(edge.b) ?? 0}`;
      if (a === b) continue;
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      aggregated.set(key, (aggregated.get(key) ?? 0) + edge.weight);
    }
    currentNodes = [...new Set([...membership.values()])].sort();
    currentEdges = [...aggregated.entries()].map(([key, weight]) => {
      const [a, b] = key.split("|");
      return { a, b, weight };
    });
  }

  // Renumber by size so the palette order is stable and meaningful.
  const sizes = new Map<string, number>();
  for (const value of membership.values()) sizes.set(value, (sizes.get(value) ?? 0) + 1);
  const ranked = [...sizes.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([id]) => id);
  const remap = new Map(ranked.map((id, index) => [id, index]));
  const community = new Map<string, number>();
  for (const [id, value] of membership) community.set(id, remap.get(value)!);

  // Newman modularity on the original graph.
  const adjacency = new Map<string, Map<string, number>>();
  for (const id of nodeIds) adjacency.set(id, new Map());
  for (const edge of edges) {
    if (!adjacency.has(edge.a) || !adjacency.has(edge.b) || edge.a === edge.b) continue;
    adjacency.get(edge.a)!.set(edge.b, (adjacency.get(edge.a)!.get(edge.b) ?? 0) + edge.weight);
    adjacency.get(edge.b)!.set(edge.a, (adjacency.get(edge.b)!.get(edge.a) ?? 0) + edge.weight);
  }
  let twoM = 0;
  const degree = new Map<string, number>();
  for (const [id, neighbours] of adjacency) {
    let sum = 0;
    for (const weight of neighbours.values()) sum += weight;
    degree.set(id, sum);
    twoM += sum;
  }
  let modularity = 0;
  if (twoM > 0) {
    for (const [id, neighbours] of adjacency) {
      const k = degree.get(id)!;
      for (const [other, weight] of neighbours) {
        if (community.get(id) !== community.get(other)) continue;
        modularity += weight - (k * (degree.get(other) ?? 0)) / twoM;
      }
    }
    modularity /= twoM;
  }
  return { community, modularity };
}

export interface GraphAnalysis {
  componentOf: Map<string, number>;
  componentCount: number;
  clusters: number;
  modularity: number;
  degree: Map<string, number>;
  isolated: string[];
}

/**
 * Connected components, degrees and a Louvain partition over the source-backed
 * graph (units, their cited documents and declared prerequisites). Components are
 * the grouping the UI uses; the Louvain partition is reported so the claim "the
 * citation graph has no partition beyond its islands" can be checked.
 */
export function analyseGraph(nodeIds: string[], edges: GraphEdge[]): GraphAnalysis {
  const allowed = new Set(nodeIds);
  const graphEdges = edges
    .filter(
      (edge) =>
        (edge.kind === "cites" || edge.kind === "derived-from" || edge.kind === "prerequisite") &&
        allowed.has(edge.from) &&
        allowed.has(edge.to),
    )
    .map((edge) => ({ a: edge.from, b: edge.to, weight: 1 }));

  const adjacency = new Map<string, Set<string>>(nodeIds.map((id) => [id, new Set()]));
  const degree = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  for (const edge of graphEdges) {
    adjacency.get(edge.a)!.add(edge.b);
    adjacency.get(edge.b)!.add(edge.a);
    degree.set(edge.a, (degree.get(edge.a) ?? 0) + 1);
    degree.set(edge.b, (degree.get(edge.b) ?? 0) + 1);
  }

  const componentOf = new Map<string, number>();
  let componentCount = 0;
  for (const start of [...nodeIds].sort()) {
    if (componentOf.has(start)) continue;
    const stack = [start];
    componentOf.set(start, componentCount);
    while (stack.length) {
      const current = stack.pop()!;
      for (const next of adjacency.get(current) ?? []) {
        if (componentOf.has(next)) continue;
        componentOf.set(next, componentCount);
        stack.push(next);
      }
    }
    componentCount += 1;
  }

  const { community, modularity } = louvain([...nodeIds], graphEdges);

  return {
    componentOf,
    componentCount,
    clusters: new Set(community.values()).size,
    modularity,
    degree,
    isolated: nodeIds.filter((id) => (adjacency.get(id)?.size ?? 0) === 0),
  };
}

export function islandLabel(
  members: GraphNode[],
  containerLabel: (id: string) => string,
  subjectLabel: (id: string) => string,
) {
  const containers = new Map<string, number>();
  const subjects = new Map<string, number>();
  for (const node of members) {
    if (node.container) containers.set(node.container, (containers.get(node.container) ?? 0) + 1);
    if (node.subject) subjects.set(node.subject, (subjects.get(node.subject) ?? 0) + 1);
  }
  const rankedContainers = [...containers.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const rankedSubjects = [...subjects.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const topContainer = rankedContainers[0];
  const topSubject = rankedSubjects[0];
  let base: string;
  if (topContainer && topContainer[1] / members.length >= 0.7) base = containerLabel(topContainer[0]);
  else if (topSubject && topSubject[1] / members.length >= 0.9) base = `${subjectLabel(topSubject[0])} · ${members.length} units`;
  else base = `${rankedContainers.length} containers · ${members.length} units`;
  return { label: base, subjects: Object.fromEntries(rankedSubjects) };
}
