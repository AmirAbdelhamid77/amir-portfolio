/** EXAMPLE CONTRACT ONLY — adapt to the actual Hansa canonical schemas. */
export type RelationKind =
  | 'contains'
  | 'depends_on'
  | 'contrasts_with'
  | 'related_to'
  | 'derived_from'
  | 'precedes';

export interface SourceBackedConcept {
  id: string;
  label: string;
  summary: string;
  sourceRefs: string[];
  scientificStatus?: 'approved' | 'review_pending' | 'not_applicable';
}

export interface SourceBackedRelation {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationKind;
  sourceRefs: string[];
}

export interface GraphModel {
  concepts: SourceBackedConcept[];
  relations: SourceBackedRelation[];
}

export interface SpatialViewState {
  selectedId: string | null;
  focusId: string | null;
  relationKinds: RelationKind[];
  view: 'spatial' | 'list';
  motion: 'full' | 'reduced';
}

/** Validation deliberately rejects dangling edges, duplicate IDs, and ungrounded relations. */
export function validateGraph(model: GraphModel): string[] {
  const errors: string[] = [];
  const known = new Set<string>();
  for (const c of model.concepts) {
    if (known.has(c.id)) errors.push(`Duplicate concept ${c.id}`);
    known.add(c.id);
    if (!c.sourceRefs.length) errors.push(`Missing source citation ${c.id}`);
  }
  const seenEdges = new Set<string>();
  for (const e of model.relations) {
    if (seenEdges.has(e.id)) errors.push(`Duplicate edge ${e.id}`);
    seenEdges.add(e.id);
    if (!known.has(e.sourceId) || !known.has(e.targetId)) errors.push(`Dangling edge ${e.id}`);
    if (!e.sourceRefs.length) errors.push(`Missing edge source ${e.id}`);
  }
  return errors;
}

/** Visual positions are LAYOUT conveniences, never fabricated source facts. */
export function seedPosition(id: string): [number, number, number] {
  let hash = 2166136261;
  for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  const a = (hash >>> 0) / 0xffffffff * 2 * Math.PI;
  const b = ((hash >>> 12) & 1023) / 1023;
  const radius = 2 + b * 2;
  return [Math.cos(a) * radius, Math.sin(a) * radius * 0.65, ((hash >>> 22) & 511)/511*2-1];
}
