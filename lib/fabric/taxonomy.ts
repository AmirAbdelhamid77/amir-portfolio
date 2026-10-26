// Reference taxonomy for the DP-600 hub: the official objective structure, and a
// browsable subject taxonomy that is independent of which video a question came
// from.
//
// Sources:
// - Objectives and weights: Microsoft Learn study guide for DP-600, "Skills
//   measured as of October 19, 2026" (checked 2026-10-24).
// - Subjects: derived from the supplied package's own topics, references and
//   question wording. They describe Fabric technology areas, not exam claims.

import type { ObjectiveId, SubjectId } from "./types";

export interface FabricDomain {
  id: "1" | "2" | "3";
  label: string;
  officialWeight: string;
  /** The exact wording Microsoft publishes for this domain. */
  officialTitle: string;
}

export const DOMAINS: FabricDomain[] = [
  {
    id: "1",
    label: "Maintain a data analytics solution",
    officialWeight: "25–30%",
    officialTitle: "Maintain a data analytics solution",
  },
  {
    id: "2",
    label: "Prepare data",
    officialWeight: "45–50%",
    officialTitle: "Prepare data",
  },
  {
    id: "3",
    label: "Implement and manage semantic models",
    officialWeight: "25–30%",
    officialTitle: "Implement and manage semantic models",
  },
];

export interface FabricObjective {
  id: ObjectiveId;
  domain: FabricDomain["id"];
  label: string;
  /** Verbatim sub-objective bullets from the study guide. */
  bullets: string[];
}

export const OBJECTIVES: FabricObjective[] = [
  {
    id: "1.1",
    domain: "1",
    label: "Implement security and governance",
    bullets: [
      "Implement workspace-level access controls",
      "Implement item-level access controls",
      "Implement row-level, column-level, object-level, and file-level access control",
      "Apply sensitivity labels to items",
      "Endorse items",
    ],
  },
  {
    id: "1.2",
    domain: "1",
    label: "Maintain the analytics development lifecycle",
    bullets: [
      "Configure version control for a workspace",
      "Create and manage a Power BI Desktop project (.pbip)",
      "Create and configure deployment pipelines",
      "Perform impact analysis of downstream dependencies from lakehouses, warehouses, dataflows, and semantic models",
      "Deploy and manage semantic models by using the XMLA endpoint",
      "Create and update reusable assets, including Power BI template (.pbit) files, Power BI data source (.pbids) files, and shared semantic models",
    ],
  },
  {
    id: "2.1",
    domain: "2",
    label: "Get data",
    bullets: [
      "Create a data connection",
      "Discover data by using OneLake catalog and Real-Time hub",
      "Ingest or access data as needed",
      "Choose between different data stores",
      "Implement OneLake integration for Eventhouse and semantic models",
    ],
  },
  {
    id: "2.2",
    domain: "2",
    label: "Transform data",
    bullets: [
      "Create views, functions, and stored procedures",
      "Enrich data by adding new columns or tables",
      "Implement a star schema for a lakehouse or warehouse",
      "Denormalize data",
      "Aggregate data",
      "Merge or join data",
      "Identify and resolve duplicate data, missing data, or null values",
      "Convert column data types",
      "Filter data",
    ],
  },
  {
    id: "2.3",
    domain: "2",
    label: "Query and analyze data",
    bullets: [
      "Select, filter, and aggregate data by using the Visual query editor",
      "Select, filter, and aggregate data by using SQL",
      "Select, filter, and aggregate data by using KQL",
      "Select, filter, and aggregate data by using DAX",
    ],
  },
  {
    id: "3.1",
    domain: "3",
    label: "Design and build semantic models",
    bullets: [
      "Choose a storage mode",
      "Implement a star schema for a semantic model",
      "Implement relationships, such as bridge tables and many-to-many relationships",
      "Write calculations that use DAX variables and functions, such as iterators, table filtering, windowing, and information functions",
      "Implement calculation groups, dynamic format strings, and field parameters",
      "Identify use cases for and configure large semantic model storage format",
      "Design and build composite models",
    ],
  },
  {
    id: "3.2",
    domain: "3",
    label: "Optimize enterprise-scale semantic models",
    bullets: [
      "Implement performance improvements in queries and report visuals",
      "Improve DAX performance",
      "Configure Direct Lake, including default fallback and refresh behavior",
      "Choose between Direct Lake on OneLake and Direct Lake on SQL analytics endpoint",
      "Implement incremental refresh for semantic models",
    ],
  },
];

export const OBJECTIVE_BY_ID = new Map(OBJECTIVES.map((item) => [item.id, item]));
export const DOMAIN_BY_ID = new Map(DOMAINS.map((item) => [item.id, item]));

export interface FabricSubject {
  id: SubjectId;
  label: string;
  description: string;
  /** Lowercase fragments matched against pack, topic, title, prompt and refs. */
  keywords: string[];
}

/**
 * Ordered so that a tie in score resolves toward the more specific subject.
 * `description` is shown in the hub's topic explorer, so it states what the
 * subject covers rather than promoting it.
 */
export const SUBJECTS: FabricSubject[] = [
  {
    id: "security",
    label: "Security & access control",
    description:
      "Workspace and item roles, row/column/object-level security, OneLake data access roles, dynamic data masking, least privilege.",
    keywords: [
      "security",
      "rls",
      "row-level",
      "row level",
      "column-level",
      "column level",
      "object-level",
      "object level",
      "masking",
      "masked",
      "unmask",
      "permission",
      "least privilege",
      "grant",
      "revoke",
      "access control",
      "data access role",
      "defaultreader",
      "entra",
    ],
  },
  {
    id: "governance",
    label: "Governance & discovery",
    description:
      "Endorsement (promotion, certification), sensitivity labels, tags, lineage, impact analysis, OneLake catalog.",
    keywords: [
      "endorsement",
      "endorse",
      "certified",
      "certification",
      "sensitivity label",
      "lineage",
      "impact analysis",
      "tag",
      "purview",
      "governance",
      "catalog",
      "promotion",
      "metadata",
    ],
  },
  {
    id: "lifecycle",
    label: "Lifecycle, Git & deployment",
    description:
      "Git integration, branches and commits, deployment pipelines and rules, .pbip projects, release engineering, rollback.",
    keywords: [
      "git",
      "version control",
      "deployment pipeline",
      "deploy",
      "branch",
      "commit",
      "workspace branch",
      "cicd",
      "ci/cd",
      "pbip",
      "xmla",
      "release",
      "rollback",
      "repository",
      "azure repos",
    ],
  },
  {
    id: "semantic-models",
    label: "Semantic models & Direct Lake",
    description:
      "Storage modes, Direct Lake and its fallback, relationships, DAX measures, calculation groups, incremental refresh, composite models.",
    keywords: [
      "semantic model",
      "direct lake",
      "directlake",
      "dax",
      "measure",
      "storage mode",
      "incremental refresh",
      "composite model",
      "calculation group",
      "field parameter",
      "power bi",
      "report visual",
      "fallback",
    ],
  },
  {
    id: "modeling",
    label: "Dimensional modelling & SCD",
    description:
      "Fact grain, dimensions, slowly changing dimensions, surrogate keys, temporal matching, star schema for lakehouse or warehouse.",
    keywords: [
      "slowly changing",
      "scd",
      "dimension",
      "fact table",
      "fact grain",
      "star schema",
      "surrogate key",
      "historical assignment",
      "grain",
      "temporal",
      "denormaliz",
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring & capacity",
    description:
      "Monitoring hub, pipeline run diagnostics, query insights and DMVs, capacity units, throttling, workspace monitoring.",
    keywords: [
      "monitoring",
      "monitor hub",
      "monitor",
      "dmv",
      "query insights",
      "capacity",
      "throttl",
      "metrics app",
      "telemetry",
      "troubleshoot",
      "diagnos",
      "observability",
      "cu ",
    ],
  },
  {
    id: "sql-endpoint",
    label: "SQL analytics endpoint",
    description:
      "The read-only T-SQL surface over lakehouse Delta tables: metadata sync, views and functions, cross-database queries, limitations.",
    keywords: [
      "sql analytics endpoint",
      "sql endpoint",
      "metadata sync",
      "metadata synchronization",
      "sql analytics",
      "two-door",
    ],
  },
  {
    id: "warehouse",
    label: "Warehouse & T-SQL",
    description:
      "Fabric Warehouse architecture, T-SQL surface area, COPY INTO, clones, transactions, cross-database queries, connectivity.",
    keywords: [
      "warehouse",
      "t-sql",
      "tsql",
      "copy into",
      "cross-database",
      "clone",
      "stored procedure",
      "transaction",
      "sql connectivity",
      "entra",
    ],
  },
  {
    id: "eventhouse",
    label: "Eventhouse & KQL",
    description:
      "Real-Time Intelligence: Eventhouse and KQL databases, query grain, materialized views, retention and caching policies, OneLake availability.",
    keywords: [
      "eventhouse",
      "kql",
      "kusto",
      "materialized view",
      "eventstream",
      "real-time",
      "realtime",
      "event time",
      "retention policy",
      "cache policy",
      "summarize",
    ],
  },
  {
    id: "pipelines",
    label: "Data pipelines",
    description:
      "Copy, Lookup, ForEach, Get Metadata, expressions, parameters, dependencies, retries, scheduling and metadata-driven orchestration.",
    keywords: [
      "pipeline",
      "copy activity",
      "foreach",
      "lookup",
      "get metadata",
      "expression",
      "notebook activity",
      "data factory",
      "orchestrat",
      "activity",
      "parameter",
      "schedule",
    ],
  },
  {
    id: "ingestion",
    label: "Ingestion & data stores",
    description:
      "Choosing a store, mirroring, shortcuts versus copies, Dataflow Gen2, connectors and gateways, incremental and CDC ingestion.",
    keywords: [
      "mirroring",
      "mirror",
      "ingest",
      "dataflow",
      "connector",
      "gateway",
      "copy job",
      "cdc",
      "watermark",
      "shortcut",
      "data store",
      "choose between",
    ],
  },
  {
    id: "optimization",
    label: "Delta maintenance & performance",
    description:
      "OPTIMIZE and compaction, VACUUM and retention, V-Order, deletion vectors, partitioning, small-file problems, time travel.",
    keywords: [
      "optimize",
      "vacuum",
      "v-order",
      "vorder",
      "compaction",
      "deletion vector",
      "small file",
      "partition",
      "z-order",
      "time travel",
      "retention",
      "file layout",
      "dry run",
    ],
  },
  {
    id: "lakehouse",
    label: "Lakehouse & Delta tables",
    description:
      "Lakehouse Files and Tables, Delta transaction logs, schemas, materialized lake views, shortcuts inside a lakehouse.",
    keywords: [
      "lakehouse",
      "delta table",
      "delta log",
      "delta lake",
      "schema evolution",
      "materialized lake view",
      "mlv",
      "files/",
      "tables/",
    ],
  },
  {
    id: "onelake",
    label: "OneLake & storage foundation",
    description:
      "The tenant-wide storage layer: workspace and capacity containment, ABFSS and APIs, shortcuts, capacity consumption, file explorer.",
    keywords: [
      "onelake",
      "one lake",
      "abfss",
      "capacity consumption",
      "workspace identity",
      "storage foundation",
      "workspace",
    ],
  },
];

export const SUBJECT_BY_ID = new Map(SUBJECTS.map((item) => [item.id, item]));

/** The dominant subject of each source pack, used as a low-weight prior. */
export const PACK_SUBJECT: Record<string, SubjectId> = {
  delta: "lakehouse",
  warehouse: "warehouse",
  pipelines: "pipelines",
  scd: "modeling",
  eventhouse: "eventhouse",
  video06: "security",
  video07: "security",
  video08: "governance",
  video09: "lifecycle",
  video10: "lifecycle",
  video11: "ingestion",
  video12: "monitoring",
  video14: "pipelines",
  video15: "security",
  video16: "sql-endpoint",
  video19: "lakehouse",
  video20: "optimization",
  video21: "lakehouse",
};

/**
 * Fallback objective for a question whose source declares no DP-600 objective.
 * These are advisory, always reported with `confidence: "medium"` at best.
 */
export const SUBJECT_OBJECTIVE: Record<SubjectId, ObjectiveId> = {
  security: "1.1",
  governance: "1.1",
  lifecycle: "1.2",
  "semantic-models": "3.1",
  modeling: "2.2",
  monitoring: "1.2",
  "sql-endpoint": "2.3",
  warehouse: "2.2",
  eventhouse: "2.3",
  pipelines: "2.1",
  ingestion: "2.1",
  optimization: "2.2",
  lakehouse: "2.2",
  onelake: "2.1",
};

export const STUDY_GUIDE_URL =
  "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600";

/** Microsoft's publicly listed DP-600 assessment duration, used as context only. */
export const OFFICIAL_EXAM_MINUTES = 100;
