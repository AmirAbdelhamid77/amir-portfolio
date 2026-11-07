/**
 * Data model for the source-derived curriculum graph.
 *
 * Every edge carries the layer it belongs to, so verified structure can never be
 * confused with a computed suggestion:
 *
 * - `structure` — declared containment (programme → subject → pack/journey →
 *   note/lesson). Navigational; not a knowledge claim.
 * - `declared`  — the corpus itself names the relation (prerequisite chain,
 *   reading order, cited source document, source page a lesson was derived from).
 * - `derived`   — computed from declared data without interpretation (two notes
 *   citing the same document = co-citation).
 * - `candidate` — inferred similarity from text. Never shown by default and never
 *   counted as a reviewed relation.
 * - `review`    — reserved for Atlas editorial data. The public Atlas projection
 *   is empty today, so this layer contains nothing.
 */
export type GraphLayer = "structure" | "declared" | "derived" | "candidate" | "review";

export type NodeKind =
  | "programme"
  | "subject"
  | "pack"
  | "journey"
  | "chapter"
  | "course"
  | "unit"
  | "source"
  | "page";

export type UnitKind = "lesson" | "study-note" | "external-foundation" | "rti-lesson";

export type EdgeKind =
  | "contains"
  | "prerequisite"
  | "cites"
  | "derived-from"
  | "co-citation"
  | "lexical";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  /** Subject id (`fabric`, `statistics`, …), absent for sources. */
  subject?: string;
  /** Unit kind, when kind === "unit". */
  unitKind?: UnitKind;
  /** Declared position inside its container, 1-based. */
  position?: number;
  /** Container node id for units. */
  container?: string;
  href?: string;
  /** Searchable/analysis text; stripped from the client payload. */
  text?: string;
  /** Citation-island id (connected component of the source-backed graph). */
  island?: number;
  /** Degree in the currently verified graph. */
  degree?: number;
  /** Build-time layout position. */
  x?: number;
  y?: number;
  /** Coverage/stage labels copied from the source registry. */
  coverage?: string;
  stage?: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  layer: GraphLayer;
  /** Human-readable provenance sentence shown in the inspector. */
  evidence: string;
  /** Source pointer (file#id) that proves the edge exists. */
  pointer?: string;
  /** Co-citation strength: number of shared source documents. */
  weight?: number;
  /** For co-citation: the shared source ids. */
  via?: string[];
  /** Candidate lexical similarity score (0–1) and shared terms. */
  score?: number;
  terms?: string[];
}

export interface GraphDiagnostic {
  level: "error" | "warning" | "info";
  code: string;
  message: string;
}

export interface GraphStats {
  nodes: Record<string, number>;
  edges: Record<string, number>;
  edgeLayers: Record<string, number>;
  islands: { id: number; size: number; label: string; subjects: Record<string, number> }[];
  modularity: number;
  clusters: number;
  components: number;
  isolatedUnits: number;
  topHubs: { id: string; label: string; degree: number; kind: NodeKind }[];
  candidatePairs: number;
  candidateSubjects: Record<string, number>;
  subjectUnits: Record<string, number>;
  topSources: { id: string; label: string; citations: number; packs: number }[];
  atlas: {
    publishedConcepts: number;
    publishedEdges: number;
    reviewConcepts: number;
    reviewEdges: number;
  };
}

export interface KnowledgeGraph {
  version: string;
  generatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  diagnostics: GraphDiagnostic[];
  stats: GraphStats;
  islands: Record<number, { label: string; color: string; size: number; subjects: Record<string, number> }>;
}
