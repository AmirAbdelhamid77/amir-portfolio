/**
 * Fabric curriculum binding loaders (FC06). SERVER-ONLY: these read the
 * committed binding artifacts under content/fabric/ with fs at BUILD TIME
 * (static export) and must never be imported from a client component —
 * the same rule as lib/fabric/articles/registry.ts.
 *
 * Fail-closed contract:
 *  - an unknown articleId resolves to an explicit `null` (no silent empty row);
 *  - a missing, malformed or internally inconsistent binding file THROWS —
 *    the curriculum layer never silently empties itself;
 *  - unknown subject/topic arguments throw (they are contract violations,
 *    not empty results).
 *
 * File-level ownership: lib/fabric/bindings.ts is FC06's (see
 * docs/fabric-corpus/contracts/WORK_PACKAGE_OWNERSHIP.md). Data is produced
 * deterministically by content/fabric/bindings/build-bindings.mjs; this
 * module only reads and validates it. No JSON imports at module level —
 * everything is fs + JSON.parse inside a lazily cached reader, so node
 * --experimental-strip-types test processes can import this module.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { SUBJECTS, subjectById } from "../study/taxonomy.ts";

/* ------------------------------------------------------------------ */
/* Types (data produced by content/fabric/bindings/build-bindings.mjs) */
/* ------------------------------------------------------------------ */

export interface PrimaryBindingRow {
  bindingId: string;
  role: "primary";
  articleId: string;
  subject: "fabric";
  topic: string;
  confidence: "seeded" | "front-matter-refined";
  ruleId: string;
  kind: "concept" | "how-to" | "reference" | "tutorial";
  family: string;
  slug: string;
  title: string;
  description: string | null;
  sourcePath: string;
  logicalPath: string;
}

export interface SecondaryBindingRow {
  bindingId: string;
  role: "secondary";
  articleId: string;
  subject: string;
  topic: string;
  ruleId: string;
}

export interface ReadingCollection {
  id: string;
  topic: string;
  title: string;
  description: string;
  directory: string;
  class: "concepts" | "procedures" | "reference";
  families: string[];
  articleIds: string[];
  counts: { articles: number; byKind: Record<string, number> };
}

export interface HeldArticles {
  total: number;
  byTopic: Record<string, number>;
  articleIds: string[];
}

export interface FabricBindingCounts {
  primary: number;
  publishedArticles: number;
  byTopic: Record<string, number>;
  byConfidence: Record<string, number>;
  byRefinementRule: Record<string, number>;
  heldTotal: number;
  heldByTopic: Record<string, number>;
}

export interface FamilyTopicMapEntry {
  family: string;
  topic: string;
  ruleId: string;
  defaultConfidence: string;
  rationale: string;
}

export interface SecondaryRuleDoc {
  id: string;
  subject: string;
  description: string;
}

export interface FabricTopicReadingOverview {
  topic: string;
  primary: number;
  held: number;
  collections: number;
}

/* ------------------------------------------------------------------ */
/* Reader (one per content dir; default = repo content/fabric)         */
/* ------------------------------------------------------------------ */

interface PrimaryDoc {
  schema: string;
  corpusRevision: string;
  registryRevision: string;
  counts: FabricBindingCounts;
  held: HeldArticles;
  rows: PrimaryBindingRow[];
}

interface SecondaryDoc {
  schema: string;
  counts: { secondary: number; articlesWithSecondaries: number; byRule: Record<string, number> };
  rules: SecondaryRuleDoc[];
  rows: SecondaryBindingRow[];
}

interface CollectionsDoc {
  schema: string;
  counts: { collections: number; byTopic: Record<string, number>; byClass: Record<string, number>; heldTotal: number };
  collections: ReadingCollection[];
}

export interface FabricBindingsReader {
  getPrimaryBinding(articleId: string): PrimaryBindingRow | null;
  getSecondaryBindings(articleId: string): SecondaryBindingRow[];
  getSecondaryBindingsByRule(): Record<string, number>;
  getSecondaryRuleDocs(): SecondaryRuleDoc[];
  getBindingsForTopic(subject: string, topic: string): PrimaryBindingRow[];
  getCollectionsForTopic(topic: string): ReadingCollection[];
  getHeldCountForTopic(topic: string): number;
  getFabricBindingCounts(): FabricBindingCounts;
  getHeldArticles(): HeldArticles;
  getFamilyTopicMap(): FamilyTopicMapEntry[];
  getFabricTopicReadingOverview(): FabricTopicReadingOverview[];
  isBoundFabricTopic(topic: string): boolean;
}

const PRIMARY_SCHEMA = "hansa.fabric-bindings-primary/1";
const SECONDARY_SCHEMA = "hansa.fabric-bindings-secondary/1";
const COLLECTIONS_SCHEMA = "hansa.fabric-reading-collections/1";

function readJsonFile(file: string): unknown {
  if (!existsSync(file)) {
    throw new Error(
      `fabric bindings missing: ${file}. ` +
        "Run content/fabric/bindings/build-bindings.mjs to generate the committed binding artifacts.",
    );
  }
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(`fabric bindings unreadable: ${file} (${(error as Error).message})`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`fabric bindings malformed JSON: ${file} (${(error as Error).message})`);
  }
}

function expectObject(value: unknown, what: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`fabric bindings malformed: ${what} must be an object`);
  }
  return value as Record<string, unknown>;
}

function expectString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`fabric bindings malformed: ${what} must be a non-empty string`);
  }
  return value;
}

/** Fabric topic ids from the shared taxonomy (the binding target vocabulary). */
function fabricTopics(): string[] {
  const fabric = subjectById("fabric");
  if (!fabric) throw new Error("fabric bindings: the taxonomy has no 'fabric' subject");
  return fabric.topics.map(([id]) => id);
}

function allTaxonomyTargets(): Set<string> {
  const targets = new Set<string>();
  for (const subject of SUBJECTS) {
    for (const [topic] of subject.topics) targets.add(`${subject.id}.${topic}`);
  }
  return targets;
}

function createReader(contentDir: string): FabricBindingsReader {
  const bindingsDir = path.join(contentDir, "bindings");
  const collectionsDir = path.join(contentDir, "collections");

  let primaryDoc: PrimaryDoc | null = null;
  let secondaryDoc: SecondaryDoc | null = null;
  let collectionsDoc: CollectionsDoc | null = null;
  let primaryIndex: Map<string, PrimaryBindingRow> | null = null;
  let familyTopicMap: FamilyTopicMapEntry[] | null = null;

  const loadPrimary = (): PrimaryDoc => {
    if (primaryDoc) return primaryDoc;
    const doc = expectObject(readJsonFile(path.join(bindingsDir, "primary.json")), "primary.json root");
    if (doc.schema !== PRIMARY_SCHEMA) {
      throw new Error(
        `fabric bindings malformed: primary.json schema '${String(doc.schema)}' expected '${PRIMARY_SCHEMA}' — regenerate with build-bindings.mjs`,
      );
    }
    const rawRows = doc.rows;
    if (!Array.isArray(rawRows)) throw new Error("fabric bindings malformed: primary.json rows must be an array");
    const rows: PrimaryBindingRow[] = rawRows.map((raw, index) => {
      const row = expectObject(raw, `primary.json rows[${index}]`);
      const topic = expectString(row.topic, `primary.json rows[${index}].topic`);
      if (!fabricTopics().includes(topic)) {
        throw new Error(`fabric bindings malformed: rows[${index}] targets unknown fabric topic '${topic}'`);
      }
      return {
        bindingId: expectString(row.bindingId, `primary.json rows[${index}].bindingId`),
        role: "primary",
        articleId: expectString(row.articleId, `primary.json rows[${index}].articleId`),
        subject: "fabric",
        topic,
        confidence: row.confidence === "front-matter-refined" ? "front-matter-refined" : "seeded",
        ruleId: expectString(row.ruleId, `primary.json rows[${index}].ruleId`),
        kind: (["concept", "how-to", "reference", "tutorial"].includes(String(row.kind))
          ? String(row.kind)
          : "concept") as PrimaryBindingRow["kind"],
        family: expectString(row.family, `primary.json rows[${index}].family`),
        slug: expectString(row.slug, `primary.json rows[${index}].slug`),
        title: expectString(row.title, `primary.json rows[${index}].title`),
        description: typeof row.description === "string" ? row.description : null,
        sourcePath: expectString(row.sourcePath, `primary.json rows[${index}].sourcePath`),
        logicalPath: expectString(row.logicalPath, `primary.json rows[${index}].logicalPath`),
      };
    });
    const counts = expectObject(doc.counts, "primary.json counts") as unknown as FabricBindingCounts;
    const held = expectObject(doc.held, "primary.json held") as unknown as HeldArticles;
    if (counts.primary !== rows.length) {
      throw new Error(
        `fabric bindings malformed: primary.json counts.primary (${counts.primary}) != rows.length (${rows.length})`,
      );
    }
    primaryIndex = new Map();
    for (const row of rows) {
      if (primaryIndex.has(row.articleId)) {
        throw new Error(`fabric bindings malformed: duplicate primary row for ${row.articleId}`);
      }
      primaryIndex.set(row.articleId, row);
    }
    primaryDoc = { schema: PRIMARY_SCHEMA, corpusRevision: String(doc.corpusRevision ?? ""), registryRevision: String(doc.registryRevision ?? ""), counts, held, rows };
    const rawFamilyMap = doc.familyTopicMap;
    if (!Array.isArray(rawFamilyMap)) {
      throw new Error("fabric bindings malformed: primary.json familyTopicMap must be an array");
    }
    familyTopicMap = rawFamilyMap as unknown as FamilyTopicMapEntry[];
    return primaryDoc;
  };

  const loadSecondary = (): SecondaryDoc => {
    if (secondaryDoc) return secondaryDoc;
    const doc = expectObject(readJsonFile(path.join(bindingsDir, "secondary.json")), "secondary.json root");
    if (doc.schema !== SECONDARY_SCHEMA) {
      throw new Error(
        `fabric bindings malformed: secondary.json schema '${String(doc.schema)}' expected '${SECONDARY_SCHEMA}' — regenerate with build-bindings.mjs`,
      );
    }
    const rawRows = doc.rows;
    if (!Array.isArray(rawRows)) throw new Error("fabric bindings malformed: secondary.json rows must be an array");
    const targets = allTaxonomyTargets();
    const rows: SecondaryBindingRow[] = rawRows.map((raw, index) => {
      const row = expectObject(raw, `secondary.json rows[${index}]`);
      const subject = expectString(row.subject, `secondary.json rows[${index}].subject`);
      const topic = expectString(row.topic, `secondary.json rows[${index}].topic`);
      if (!targets.has(`${subject}.${topic}`)) {
        throw new Error(
          `fabric bindings malformed: secondary rows[${index}] targets unknown subject.topic '${subject}.${topic}'`,
        );
      }
      if (subject === "fabric") {
        throw new Error(`fabric bindings malformed: secondary rows[${index}] must be cross-subject, got fabric`);
      }
      return {
        bindingId: expectString(row.bindingId, `secondary.json rows[${index}].bindingId`),
        role: "secondary",
        articleId: expectString(row.articleId, `secondary.json rows[${index}].articleId`),
        subject,
        topic,
        ruleId: expectString(row.ruleId, `secondary.json rows[${index}].ruleId`),
      };
    });
    const counts = expectObject(doc.counts, "secondary.json counts") as unknown as SecondaryDoc["counts"];
    const rules = (Array.isArray(doc.rules) ? doc.rules : []) as unknown as SecondaryRuleDoc[];
    secondaryDoc = { schema: SECONDARY_SCHEMA, counts, rules, rows };
    return secondaryDoc;
  };

  const loadCollections = (): CollectionsDoc => {
    if (collectionsDoc) return collectionsDoc;
    const doc = expectObject(readJsonFile(path.join(collectionsDir, "collections.json")), "collections.json root");
    if (doc.schema !== COLLECTIONS_SCHEMA) {
      throw new Error(
        `fabric bindings malformed: collections.json schema '${String(doc.schema)}' expected '${COLLECTIONS_SCHEMA}' — regenerate with build-bindings.mjs`,
      );
    }
    const rawCollections = doc.collections;
    if (!Array.isArray(rawCollections)) {
      throw new Error("fabric bindings malformed: collections.json collections must be an array");
    }
    const collections: ReadingCollection[] = rawCollections.map((raw, index) => {
      const collection = expectObject(raw, `collections.json collections[${index}]`);
      const topic = expectString(collection.topic, `collections.json collections[${index}].topic`);
      if (!fabricTopics().includes(topic)) {
        throw new Error(
          `fabric bindings malformed: collections[${index}] targets unknown fabric topic '${topic}'`,
        );
      }
      const articleIds = collection.articleIds;
      if (!Array.isArray(articleIds) || articleIds.some((id) => typeof id !== "string")) {
        throw new Error(
          `fabric bindings malformed: collections[${index}].articleIds must be an array of strings`,
        );
      }
      const counts = expectObject(collection.counts, `collections.json collections[${index}].counts`);
      const byKindRaw = expectObject(counts.byKind, `collections.json collections[${index}].counts.byKind`);
      const byKind: Record<string, number> = {};
      for (const [key, value] of Object.entries(byKindRaw)) {
        if (typeof value !== "number") {
          throw new Error(`fabric bindings malformed: collections[${index}].counts.byKind.${key} must be a number`);
        }
        byKind[key] = value;
      }
      const families = Array.isArray(collection.families)
        ? collection.families.map(String)
        : [];
      return {
        id: expectString(collection.id, `collections.json collections[${index}].id`),
        topic,
        title: expectString(collection.title, `collections.json collections[${index}].title`),
        description: expectString(collection.description, `collections.json collections[${index}].description`),
        directory: expectString(collection.directory, `collections.json collections[${index}].directory`),
        class: (["concepts", "procedures", "reference"].includes(String(collection.class))
          ? String(collection.class)
          : "concepts") as ReadingCollection["class"],
        families,
        articleIds: articleIds as string[],
        counts: { articles: typeof counts.articles === "number" ? counts.articles : (articleIds as string[]).length, byKind },
      };
    });
    const ids = new Set<string>();
    for (const collection of collections) {
      if (ids.has(collection.id)) {
        throw new Error(`fabric bindings malformed: duplicate collection id '${collection.id}'`);
      }
      ids.add(collection.id);
    }
    const counts = expectObject(doc.counts, "collections.json counts") as unknown as CollectionsDoc["counts"];
    if (counts.collections !== collections.length) {
      throw new Error(
        `fabric bindings malformed: collections.json counts.collections (${counts.collections}) != collections.length (${collections.length})`,
      );
    }
    collectionsDoc = { schema: COLLECTIONS_SCHEMA, counts, collections };
    return collectionsDoc;
  };

  const reader: FabricBindingsReader = {
    getPrimaryBinding(articleId: string): PrimaryBindingRow | null {
      if (!primaryIndex) loadPrimary();
      const row = (primaryIndex as Map<string, PrimaryBindingRow>).get(articleId);
      // Explicit null: the caller can distinguish "not bound" from a row.
      return row ?? null;
    },

    getSecondaryBindings(articleId: string): SecondaryBindingRow[] {
      const doc = loadSecondary();
      return doc.rows.filter((row) => row.articleId === articleId);
    },

    getSecondaryBindingsByRule(): Record<string, number> {
      const doc = loadSecondary();
      return { ...doc.counts.byRule };
    },

    getSecondaryRuleDocs(): SecondaryRuleDoc[] {
      const doc = loadSecondary();
      return doc.rules;
    },

    getBindingsForTopic(subject: string, topic: string): PrimaryBindingRow[] {
      if (!subjectById(subject)) {
        throw new Error(`fabric bindings: unknown subject '${subject}'`);
      }
      if (!subjectById(subject)!.topics.some(([id]) => id === topic)) {
        throw new Error(`fabric bindings: unknown topic '${topic}' for subject '${subject}'`);
      }
      // Bindings only exist for the fabric subject; other subjects have no
      // corpus bindings (their cross-placements are secondary rows).
      if (subject !== "fabric") return [];
      const doc = loadPrimary();
      return doc.rows.filter((row) => row.topic === topic);
    },

    getCollectionsForTopic(topic: string): ReadingCollection[] {
      if (!fabricTopics().includes(topic)) {
        throw new Error(`fabric bindings: unknown fabric topic '${topic}'`);
      }
      const doc = loadCollections();
      return doc.collections.filter((collection) => collection.topic === topic);
    },

    getHeldCountForTopic(topic: string): number {
      if (!fabricTopics().includes(topic)) {
        throw new Error(`fabric bindings: unknown fabric topic '${topic}'`);
      }
      const doc = loadPrimary();
      return doc.held.byTopic[topic] ?? 0;
    },

    getFabricBindingCounts(): FabricBindingCounts {
      const doc = loadPrimary();
      return doc.counts;
    },

    getHeldArticles(): HeldArticles {
      const doc = loadPrimary();
      return doc.held;
    },

    getFamilyTopicMap(): FamilyTopicMapEntry[] {
      if (!familyTopicMap) loadPrimary();
      return familyTopicMap as FamilyTopicMapEntry[];
    },

    getFabricTopicReadingOverview(): FabricTopicReadingOverview[] {
      const primary = loadPrimary();
      const collections = loadCollections();
      const overview: FabricTopicReadingOverview[] = [];
      for (const topic of fabricTopics()) {
        const bound = primary.rows.filter((row) => row.topic === topic).length;
        if (bound === 0) continue;
        overview.push({
          topic,
          primary: bound,
          held: primary.held.byTopic[topic] ?? 0,
          collections: collections.collections.filter((collection) => collection.topic === topic).length,
        });
      }
      return overview;
    },

    isBoundFabricTopic(topic: string): boolean {
      if (!fabricTopics().includes(topic)) return false;
      const doc = loadPrimary();
      return doc.rows.some((row) => row.topic === topic);
    },
  };

  return reader;
}

/* ------------------------------------------------------------------ */
/* Default reader (repo content dir; env-overridable for tests)        */
/* ------------------------------------------------------------------ */

/** Content root holding bindings/ and collections/ (RELEASE_AND_STORAGE-style override for tests). */
export function fabricBindingsContentDir(): string {
  return path.resolve(process.env.FABRIC_BINDINGS_CONTENT_DIR ?? path.join(process.cwd(), "content", "fabric"));
}

const readerCache = new Map<string, FabricBindingsReader>();

/** Reader factory — also the injection point for malformed-file test fixtures. */
export function createFabricBindingsReader(contentDir?: string): FabricBindingsReader {
  const dir = path.resolve(contentDir ?? fabricBindingsContentDir());
  const cached = readerCache.get(dir);
  if (cached) return cached;
  const reader = createReader(dir);
  readerCache.set(dir, reader);
  return reader;
}

const defaultReader: FabricBindingsReader = createFabricBindingsReader();

/**
 * One primary binding for an article, or an explicit null when the articleId
 * is unknown (held/excluded articles are NOT bound — see getHeldArticles).
 */
export const getPrimaryBinding = (articleId: string): PrimaryBindingRow | null =>
  defaultReader.getPrimaryBinding(articleId);

/** Cross-subject secondary placements for an article (0..2 rows, each with its rule id). */
export const getSecondaryBindings = (articleId: string): SecondaryBindingRow[] =>
  defaultReader.getSecondaryBindings(articleId);

/** Secondary row counts per rule id. */
export const getSecondaryBindingsByRule = (): Record<string, number> =>
  defaultReader.getSecondaryBindingsByRule();

/** The documented secondary rule set (ids + descriptions). */
export const getSecondaryRuleDocs = (): SecondaryRuleDoc[] => defaultReader.getSecondaryRuleDocs();

/**
 * All primary bindings for one subject.topic. Throws on unknown subject/topic
 * (contract violation); returns [] only for valid non-fabric subjects.
 */
export const getBindingsForTopic = (subject: string, topic: string): PrimaryBindingRow[] =>
  defaultReader.getBindingsForTopic(subject, topic);

/** Reading collections for one fabric topic (sorted deterministically in the artifact). */
export const getCollectionsForTopic = (topic: string): ReadingCollection[] =>
  defaultReader.getCollectionsForTopic(topic);

/** Held (fail-closed excluded) article count for a fabric topic. */
export const getHeldCountForTopic = (topic: string): number => defaultReader.getHeldCountForTopic(topic);

/** Binding count summaries from the primary artifact. */
export const getFabricBindingCounts = (): FabricBindingCounts => defaultReader.getFabricBindingCounts();

/** Held article ids + per-topic counts (traceability; held articles are never bound). */
export const getHeldArticles = (): HeldArticles => defaultReader.getHeldArticles();

/** The documented family→topic map (rule ids + rationales). */
export const getFamilyTopicMap = (): FamilyTopicMapEntry[] => defaultReader.getFamilyTopicMap();

/** Per-topic reading overview for bound topics only. */
export const getFabricTopicReadingOverview = (): FabricTopicReadingOverview[] =>
  defaultReader.getFabricTopicReadingOverview();

/** True when the fabric topic has at least one bound article. */
export const isBoundFabricTopic = (topic: string): boolean => defaultReader.isBoundFabricTopic(topic);
