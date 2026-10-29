// Fabric Real-Time Intelligence — the approved lesson lane for the
// 2026-10-27 authentic-source milestone.
//
// Why this module exists. The package arrived as a read-only source archive:
// 3,269 unchanged source files, 4,027 verbatim content units, 2,874 upstream
// step traces, seven unchanged UCI archives and two World Bank responses. It
// shipped with two review surfaces already staged behind /learn/drafts — the
// 17 lab blueprints (rti-labs.json) and the provenance registry
// (rti-sources.json). Those answer "what is the source and what was never
// run". They do not teach. This module is the teaching layer: every lesson
// below wraps one or more of those blueprints, keeps the blueprint's id, and
// never upgrades the blueprint's status.
//
// Rules that are load-bearing here:
//   * `labs` entries must exist in content/intake/rti-labs.json. A blueprint
//     withheld under a hold is never wrapped in a lesson; it is named in a
//     hold note instead.
//   * `datasets` entries must exist in content/intake/rti-sources.json. Origin
//     classes are copied from the registry, never reworded into something
//     stronger.
//   * `verification` is copied from the blueprint. PASS_DATA_PROFILE means the
//     archive was profiled — not that a model, notebook or Fabric run exists.
//   * No lesson claims native execution. Runtime status for the whole package
//     is NOT_RUN.
import labSet from "@/content/intake/rti-labs.json";
import sourceRegistry from "@/content/intake/rti-sources.json";

export const RTI_COURSE = {
  id: "fabric-rti",
  title: "Fabric Real-Time Intelligence",
  shortTitle: "Fabric RTI",
  href: "/learn/fabric-rti/",
  examHref: "/lab/fabric-rti/",
  domain: "Streaming ingestion, KQL, alerting and measured-data honesty",
  level: "Intermediate",
  languages: ["English"],
  package: labSet.package,
  packageSha256: labSet.packageSha256,
  status: labSet.status,
  statusLabel: labSet.statusLabel,
  runtimeStatus: labSet.runtimeStatus ?? "NOT_RUN",
  gradingEnabled: false,
  publicationApproved: true,
  purpose:
    "Follow real, pinned source steps for Microsoft Fabric real-time work, and learn to tell measured data from workshop samples and simulated telemetry before anyone builds on it.",
  lens: "The package proposes DP-700 as a lens for ingestion, transformation and monitoring. This course makes no exam-weight, objective-coverage or certification claim for any certification body.",
  counts: {
    blueprintsProposed: labSet.counts.proposed,
    blueprintsShipped: labSet.counts.shipped,
    repositoriesCleared: sourceRegistry.counts.repositoriesCleared,
    datasetsCleared: sourceRegistry.counts.datasetsCleared,
  },
  holds: labSet.holds.map((hold) => ({
    lab_id: hold.lab_id,
    reason: hold.reason,
  })),
  registryHolds: sourceRegistry.holds.map((hold) => ({
    id: hold.id,
    count: hold.count,
    reason: hold.reason,
  })),
} as const;

export type RtiOrigin =
  | "Published workshop sample"
  | "Published simulated telemetry"
  | "Published synthetic web events"
  | "Observed factory energy"
  | "Observed controlled test rig"
  | "Observed manufacturing"
  | "Observed manual factory records"
  | "Published aggregate — not a shipment trace"
  | "Published sample implementation"
  | "Published code examples"
  | "Published lab sample"
  | "Published instructional fixtures"
  | "Publisher fictional game";

export type RtiLesson = {
  id: string;
  slug: string;
  order: number;
  title: string;
  frame: string;
  /** Concept-graph frame label plus the domain the reader is working in. */
  domain: string;
  summary: string;
  objective: string;
  objectives: string[];
  prerequisites: string[];
  /** Source-anchored steps. Each entry names the blueprint it comes from. */
  walkthrough: string[];
  /** Misconceptions and trade-offs the package explicitly warns about. */
  misconceptions: string[];
  labs: string[];
  datasets: string[];
  origins: RtiOrigin[];
  /** Copied from the wrapped blueprints; never upgraded by this module. */
  verification: string;
  /** What this lesson still cannot show, in plain words. */
  limitation: string;
  /** Honest caveat shown on the card and at the top of the lesson. */
  caveat?: string;
};

const LESSONS: RtiLesson[] = [
  {
    id: "rti-ingest-typed-events",
    slug: "ingest-typed-events",
    order: 1,
    title: "Ingest raw events into a typed table",
    frame: "D · C",
    domain: "Real-time ingestion · KQL update policies",
    summary:
      "The first decision in any real-time project is where a payload stops being text and becomes a typed row. The FabCon workshop answers it twice: once with an XML shipment stream shaped by a DDL script and its update policy, and once with simulated factory energy and LoRaWAN telemetry moved through bronze and typed tables. Both paths are pinned to exact lines of one workshop document, so you can read the original step beside this lesson.",
    objective:
      "Explain why a typed table plus an update policy beats a text-only landing table for repeatable querying, and name the moment a schema decision becomes expensive to reverse.",
    objectives: [
      "Trace an XML payload from a stream source into a typed ShippingNotifications table using the workshop's own DDL and update-policy script.",
      "Compare a bronze/raw landing table with a typed table, and say what each one is actually good for.",
      "Label every value on screen as simulated when the source generator produced it, and never restate it as a measurement.",
    ],
    prerequisites: [
      "A Fabric capacity and workspace you are allowed to create items in.",
      "A permitted stream source; the workshop's own generators stay inert unless you start them deliberately.",
      "Basic KQL reading — the companion lesson is KQL series and anomalies.",
    ],
    walkthrough: [
      "Open the pinned workshop document at the Lab 01 shipping-events marker and read the step list before touching the UI; the blueprint pins it to a specific line so you can check the wording.",
      "Create the typed table with the original DDL and update-policy script rather than a retyped copy — the update policy is what turns arriving raw rows into typed ones.",
      "Send the workshop's sample XML and inspect the resulting schema: which fields parsed, which defaulted, and what happens to a malformed payload.",
      "Repeat with the energy and LoRaWAN steps: bronze first, typed second, then the temperature aggregation, so the two landing patterns are visible side by side.",
      "Record the field names and types you actually observed next to the source's own list; the blueprint's expected evidence is that comparison, not a screenshot.",
    ],
    misconceptions: [
      "The shipment stream is workshop data. It is not carrier telemetry and it never was, no matter how realistic the field names look.",
      "The energy and LoRaWAN generators are simulated by design. Every displayed value inherits that label, including values that look like plausible factory readings.",
      "A typed table is not automatically a correct table. Parsing succeeds before semantics do; a field that parses can still mean the wrong thing.",
    ],
    labs: ["L01", "L02"],
    datasets: [],
    origins: ["Published workshop sample", "Published simulated telemetry"],
    verification:
      "NOT_RUN; shipment source is workshop data, not real carrier telemetry. NOT_RUN; no generator was started and no upstream connection string was used.",
    limitation:
      "No eventstream, table or query in this lesson was created by Hansa. The walkthrough reproduces the source's instructions; it does not certify the current Fabric UI or the runtime result.",
    caveat:
      "Follow the pinned source steps. Nothing here has been executed against a Fabric tenant.",
  },
  {
    id: "rti-activator-rules",
    slug: "activator-rules",
    order: 2,
    title: "Write an alert rule without firing one",
    frame: "D",
    domain: "Activator · monitored alerts",
    summary:
      "An Activator rule is the shortest path from a stream to a human's inbox, which is exactly why it deserves the most care. The workshop's temperature rule is small on purpose: one condition, one trigger, and a set of external actions that stay disabled. This lesson treats the rule as a written contract — what is compared, over what window, and what happens on the far side.",
    objective:
      "Specify a monitoring rule precisely enough that a colleague can predict when it fires, and list every external action the rule would take before enabling any of them.",
    objectives: [
      "Reproduce the source's temperature condition and state its comparison, threshold and trigger in words rather than in UI labels.",
      "Separate the rule's detection step from its action step, and treat the action step as a deployment decision of its own.",
      "Check the current Activator conditions and limitations against the pinned source, because preview behaviour moves.",
    ],
    prerequisites: [
      "A Fabric tenant and an isolated test stream you are allowed to send noise into.",
      "The typed-table lesson, so the rule has something typed to read.",
    ],
    walkthrough: [
      "Read the pinned Lab 03.3 rule setup and write the condition out as a sentence with a subject, a comparison and a threshold.",
      "List every action the source offers — alert, email, Teams message, pipeline, flow — and mark which ones you would enable on day one. The package's answer is none.",
      "Check current Activator documentation for conditions and limitations that post-date the pinned commit, and note any difference rather than assuming the source is current.",
      "Configure the rule with external actions disabled and confirm it detects. Detection you can watch; delivery you have not tested.",
    ],
    misconceptions: [
      "Configuring a rule is not testing its action path. The package's recorded status is explicit: no alert, email, Teams message, pipeline or flow was triggered.",
      "A threshold copied from a workshop is not calibrated to your data. It is a demonstration value until you derive it from your own distribution.",
      "A rule that never fired is not evidence that nothing happened. It may be evidence that the rule never ran.",
    ],
    labs: ["L03"],
    datasets: [],
    origins: ["Published simulated telemetry"],
    verification:
      "NOT_RUN; no alert, email, Teams message, pipeline or flow was triggered.",
    limitation:
      "Action delivery — email, Teams, pipelines, flows — is entirely unexercised. Treat the delivery path as untested until you test it in your own tenant.",
  },
  {
    id: "rti-digital-twin-context",
    slug: "digital-twin-context",
    order: 3,
    title: "Model entities, context and relationships",
    frame: "D · C",
    domain: "Digital Twin Builder · OneLake events",
    summary:
      "A twin is a claim about how the world is wired, so the interesting part is not the entity you create — it is the relationship and the context you attach to it. The workshop's bonus lab adds production-line and operator entities with mapping and relationship steps. The OneLake events lab then adds the part people forget: history that has to be reconciled after the fact, carrier and month provenance kept intact, and raw-versus-loaded record counts compared rather than assumed.",
    objective:
      "Decide which entities a stream's events belong to, and prove a load actually happened by reconciling raw input against loaded output.",
    objectives: [
      "Follow the source's production-line and operator entity and mapping steps, and record which context CSV supplied each attribute.",
      "State a relationship as a typed edge with a cardinality, not as a shared column name.",
      "Reconcile a historical CSV load through OneLake events by comparing raw and loaded record counts and keeping carrier/month provenance.",
    ],
    prerequisites: [
      "Digital Twin Builder availability, capacity and permissions in your tenant.",
      "The typed-events lesson, so entities have typed streams to attach.",
    ],
    walkthrough: [
      "Read the pinned bonus-lab section and copy the source's entity list before designing your own; the source's answer trace is the context CSVs and the relationship steps.",
      "Add the relationships the source defines, and write each one down as a sentence with a cardinality before you model it.",
      "Move to the OneLake events lab: load the historical carrier CSVs with the supplied notebook, keeping carrier and month as provenance columns rather than folding them away.",
      "Compare raw record count against loaded record count. A mismatch is a finding; a match is a finding you can defend.",
    ],
    misconceptions: [
      "The historical carrier CSVs are sample inputs. They are not observed shipments, and a reconciled count does not make them real.",
      "A twin created in a preview feature is not portable. The blueprint requires reconciling with current preview docs rather than trusting the pinned snapshot.",
      "Relationships modelled as loose joins drift. If the relationship matters, name it, type it and constrain it.",
    ],
    labs: ["L04", "L05"],
    datasets: [],
    origins: ["Published workshop sample"],
    verification:
      "NOT_RUN; no twin/entity was created. NOT_RUN; historical carrier CSVs are sample inputs, not observed shipments.",
    limitation:
      "Digital Twin Builder is a preview surface. No twin, entity or mapping was created by Hansa, so nothing here is a working configuration.",
  },
  {
    id: "rti-kql-series-anomalies",
    slug: "kql-series-anomalies",
    order: 4,
    title: "Aggregate a stream and look for anomalies",
    frame: "D · G",
    domain: "KQL · make-series · anomaly decomposition",
    summary:
      "Real-time work lives or dies on how a stream is bucketed in time. Two pinned sources cover it: the FabCon e-commerce tutorial, which turns synthetic web events into series and then decomposes them for anomalies, and MustLearnKQL, which supplies the fundamentals, joins and window functions underneath. The tutorial is careful about one thing most write-ups are not: an anomaly count produced by a threshold is a property of the threshold, not of the world.",
    objective:
      "Build a time-series aggregate with an explicit grain, then explain what an anomaly chart can and cannot tell you before quoting any number from it.",
    objectives: [
      "Use the source's make-series block verbatim first, then change exactly one thing at a time and say what changed.",
      "Choose a bucket grain from the question being asked rather than from the default the UI offers.",
      "Separate a session window from a time window, and say which one your question actually needs.",
      "Treat anomaly thresholds as uncalibrated until they have been derived from the pinned stream's own distribution.",
    ],
    prerequisites: [
      "A KQL database whose tables you populated through the attributed source path.",
      "The typed-events lesson, or your own typed stream.",
    ],
    walkthrough: [
      "Read the pinned tutorial section around the page-load-time anomaly chart and copy the query block exactly, including its bin size.",
      "Run the fundamentals companion first if window functions are new: MustLearnKQL's table schemas, ingestion fixtures and example queries are pinned, and Sentinel-only tables must be mapped deliberately or held.",
      "Change the bin size and re-run. The series shape changes; the underlying events do not. That difference is the whole lesson.",
      "Move to anomaly decomposition only after the series reads correctly, and record the threshold you used alongside the result.",
    ],
    misconceptions: [
      "An anomaly count is not a measurement. The package refuses to supply a fixed count because thresholds and counts were never scientifically calibrated.",
      "Synthetic web events are synthetic. A decomposition over them describes the generator.",
      "KQL windows are not interchangeable. A session window and a time window answer different questions and produce different rows.",
      "MustLearnKQL fixtures include tables that only exist in Microsoft Sentinel. Mapping them into Fabric is a deliberate act, not a default.",
    ],
    labs: ["L06", "L17"],
    datasets: [],
    origins: ["Published synthetic web events", "Published instructional fixtures"],
    verification:
      "NOT_RUN; thresholds and anomaly counts not scientifically calibrated. NOT_RUN; external narratives are references only.",
    limitation:
      "No KQL was executed against a live database by Hansa. Queries are reproduced from pinned source blocks; their results on your data are yours to measure.",
  },
  {
    id: "rti-official-lab-sequence",
    slug: "official-lab-sequence",
    order: 5,
    title: "Follow the official RTI lab end to end",
    frame: "C · D",
    domain: "Eventstream · KQL query · dashboard · Activator",
    summary:
      "The mslearn-fabric snapshot in the package contains 48 lab instruction files, and its real-time intelligence lab is the closest thing to a canonical end-to-end path: create the eventstream, query it in KQL, build a dashboard, then attach an alert. Working through it in order matters, because each step is the previous step's dependency. It is also the honest place to learn that upstream saved outputs are upstream outputs.",
    objective:
      "Complete the pinned RTI lab sequence in order, keeping every upstream output labelled as the publisher's rather than as your own execution.",
    objectives: [
      "Work the pinned lab's steps in sequence: eventstream, KQL query, dashboard, Activator.",
      "Keep upstream notebook outputs and screenshots separate from anything you run yourself.",
      "Note where the pinned instructions and current documentation disagree, and treat current documentation as governing.",
    ],
    prerequisites: [
      "A Fabric tenant, capacity and permissions to create items.",
      "Comfort with the typed-events and Activator lessons before you start.",
    ],
    walkthrough: [
      "Open the pinned lab instruction file and read the whole sequence once before creating anything.",
      "Create each item in the order the source specifies; each later step reads the earlier one.",
      "Save your own outputs separately from the publisher's saved outputs. A screenshot in the source document is evidence about the source, not about your run.",
      "Where the pinned instructions and today's documentation differ, record the difference instead of silently picking one.",
    ],
    misconceptions: [
      "No account resources were created by Hansa during packaging. Completing this lab is your execution, not a continuation of ours.",
      "A saved upstream output is not a result you reproduced. The package's default content state is explicitly that upstream content is not automatically trusted.",
      "The snapshot's 48 lab files are an observed count for that snapshot, not a claim about how many exercises the publisher has ever published.",
    ],
    labs: ["L16"],
    datasets: [],
    origins: ["Published lab sample"],
    verification: "NOT_RUN; no account resources created.",
    limitation:
      "This lesson routes you to the pinned lab; it does not reproduce it. Nothing here substitutes for doing it in your own tenant.",
  },
  {
    id: "rti-measured-factory-data",
    slug: "measured-factory-data",
    order: 6,
    title: "Read measured factory data without inventing meaning",
    frame: "H · E · C",
    domain: "Observed datasets · grain, units and missingness",
    summary:
      "Four unchanged UCI archives anchor this lesson, and each one is a trap for a different reason. The steel-industry file has a clean 900-second step and a unit label that contradicts its own description. The hydraulic rig has 17 channels, two of which are computed rather than measured, and no wall-clock timestamps at all. The semiconductor file's feature count disagrees with its own landing page. The garment file records teams per department per day, so duplicate dates are expected rather than dirty. The work is reading, not modelling.",
    objective:
      "Profile an industrial dataset at its own grain, in its own units, and refuse every convenience the source does not support.",
    objectives: [
      "Steel: verify 35,040 rows × 11 columns with 35,039 consecutive 900-second differences, and keep the CO2 column's unit marked unresolved.",
      "Hydraulic: preserve cycle-to-column alignment across 2,205 cycles, and keep CE and CP identified as virtual channels rather than sensors.",
      "Semiconductor: align measurements to labels by original row number, keep all 41,951 NaN cells, and record the 590-versus-591 metadata discrepancy instead of resolving it.",
      "Garment: keep the publisher's department spellings and missing WIP, and never use actual_productivity as an input to predicting actual_productivity.",
    ],
    prerequisites: [
      "A CSV- or ZIP-capable local engine. No Fabric tenant is needed for this lesson.",
      "The publisher's column dictionary and description files for each archive.",
    ],
    walkthrough: [
      "Start with the steel archive. Check the row and column counts against the publisher's definitions, then verify the 900-second step rather than trusting it.",
      "Open the hydraulic archives and map each channel to its sampling rate — 100 Hz pressure and motor power, 10 Hz flow, 1 Hz temperature and vibration — before plotting anything.",
      "Load the semiconductor numeric file and its label file separately, then align by row index. Do not infer what sensor 247 measures.",
      "Open the garment file and check its grain first: one row per team, per department, per day. Duplicate dates are then expected.",
      "For each dataset, write one sentence about what the grain makes impossible, not just what it makes possible.",
    ],
    misconceptions: [
      "No timezone is filled in as UTC anywhere. The hydraulic cycles have positions, not timestamps, and inventing a wall clock makes the data unreproducible.",
      "Two of the hydraulic channels are derived, not measured. Counting 17 sensors overstates the instrument set.",
      "The semiconductor metadata says 591 features while the numeric file has 590 columns. The package flags the discrepancy; a learner must not silently resolve it.",
      "Post-outcome features are leakage. Using the productivity column to predict the productivity column produces a number that means nothing.",
      "PASS_DATA_PROFILE certifies the bytes you profiled. It does not certify representativeness, current factory conditions or deployment safety.",
    ],
    labs: ["L07", "L08", "L09", "L10"],
    datasets: ["UCI-851", "UCI-447", "UCI-179", "UCI-597"],
    origins: [
      "Observed factory energy",
      "Observed controlled test rig",
      "Observed manufacturing",
      "Observed manual factory records",
    ],
    verification:
      "PASS_DATA_PROFILE for each archive; no online twin mapping, model execution, invented OEE or causal productivity finding.",
    limitation:
      "These archives were profiled, not analysed. No anomaly model, replay, benchmark or prediction was trained, and none of them is a live event feed.",
    caveat:
      "Measured bytes are not the same as a measured conclusion. The profiles are verified; the interpretation is yours.",
  },
  {
    id: "rti-aggregates-are-not-events",
    slug: "aggregates-are-not-events",
    order: 7,
    title: "Published aggregates are context, not events",
    frame: "H · D",
    domain: "World Bank indicators · provenance classes · held sources",
    summary:
      "The most common failure in supply-chain analytics is borrowing a country-level indicator and treating it as if it described your shipments. This lesson uses two unchanged World Bank API responses to make the point concrete: the Logistics Performance Index is a perception survey on a 1–5 scale, and container port traffic is an annual TEU aggregate that includes empty containers and transshipment lifts. It also handles the holds honestly — what is blocked, what is held, and why a gap in the data is not a licence to fill it.",
    objective:
      "Classify a dataset by what it actually records, and defend the decision to leave a question unanswered when the right source is unavailable.",
    objectives: [
      "Port traffic: verify 2,802 non-null values across 17,556 API slots and keep the TEU, empty-container and transshipment definitions attached.",
      "LPI: keep the scale, the perception basis and the survey-derived nature visible whenever the index is shown.",
      "Separate region aggregates from member countries instead of summing both into one ranking.",
      "State why the blocked shipment-level dataset stays blocked rather than substituting a mirror.",
    ],
    prerequisites: [
      "The World Bank terms and attribution for the indicator responses.",
      "A JSON reader.",
    ],
    walkthrough: [
      "Load the pinned port-traffic response and count non-null values against the total slot count. The emptiness is part of the story.",
      "Read the indicator's own definition page and copy its unit sentence verbatim next to any chart you build.",
      "Do the same for the Logistics Perception index, and write down that it is a survey aggregate on a 1–5 scale before comparing any two countries.",
      "Open the package's holds: the Scania archive is held pending a licence reconciliation, two repositories have no root licence and stay reference-only, and the original shipment-level dataset is blocked because its endpoint was unreachable.",
      "Write the sentence you would tell a stakeholder: what the available data can support, and what it cannot.",
    ],
    misconceptions: [
      "A country-year TEU aggregate is not a container-event trace. You cannot derive a shipment's route from it.",
      "The LPI measures perceptions of logistics performance, not logistics performance itself.",
      "A mirror is not a provenance. When the original is blocked, the secondary catalogue's conflicting licence descriptions are not clearance.",
      "The Scania archive's landing page and its CSV headers disagree about licensing. That disagreement is the hold, and it has not been resolved.",
    ],
    labs: ["L12"],
    datasets: ["worldbank_port", "worldbank_lpi"],
    origins: ["Published aggregate — not a shipment trace"],
    verification:
      "PASS_RESPONSE_PROFILE; this does not replace blocked observed shipment microdata.",
    limitation:
      "Observed shipment-level microdata remains blocked in this package. No lesson here closes that gap, and none of them pretends to.",
    caveat:
      "Lab L11 — the Scania fleet exercise — is withheld under a licence hold and is deliberately absent from this course.",
  },
  {
    id: "rti-streaming-spark-internals",
    slug: "streaming-spark-internals",
    order: 8,
    title: "State, checkpoints and Spark performance",
    frame: "E · C · D",
    domain: "Structured Streaming · watermarks · benchmarks",
    summary:
      "Once a stream needs history, you are doing state management whether or not you called it that. Three pinned repositories cover the ground: Microsoft's stateful-streaming lakehouse sample at v0.1.1 for state, checkpoint and medallion decisions; the Spark performance-engineering sample at v0.1.0 for paired optimised and unoptimised jobs; and SQLFrame with its DuckDB compatibility caveat for running Spark-shaped SQL outside Spark. All three are study material first — every benchmark claim has to be generated by a run you control.",
    objective:
      "Trace a state, watermark or sink decision back to the exact source file that made it, and refuse to quote a performance number you did not measure.",
    objectives: [
      "Read the pinned stateful-streaming notebook, pipeline_config and Spark job, and name the checkpoint and sink guarantees each one provides.",
      "Diff the paired optimised and unoptimised jobs and record which source change caused which behaviour, before any timing exists.",
      "Pin the engine and SQLFrame versions, and respect the source's warning about DuckDB 2.0 compatibility.",
      "Design a benchmark you would trust: same runtime, same data size, stated measurement environment.",
    ],
    prerequisites: [
      "A matching Fabric Spark runtime and an isolated workspace for anything you intend to execute.",
      "Structured Streaming basics — watermarks, sinks and checkpoint directories.",
    ],
    walkthrough: [
      "Read the pinned stateful-streaming README at its tagged version, then open the notebook, pipeline_config and job, and write down the checkpoint and sink decisions in your own words.",
      "Compare those decisions against Spark's own Structured Streaming guarantees before running anything; the blueprint's expected evidence is that comparison.",
      "Open the performance-engineering sample's paired jobs and produce a diff of source changes. The diff is the finding; the timing comes later, if at all.",
      "If you want SQL outside Spark, read the SQLFrame guidance with engine versions pinned, and treat the DuckDB 2.0 warning as current until you check it.",
    ],
    misconceptions: [
      "No speedup, memory saving or distributed-equivalence claim exists in this package. Optimised-versus-unoptimised is a source diff until you benchmark it.",
      "A single-node speed result does not transfer to distributed Spark. The two are different measurement problems.",
      "Retrieving source code is not certifying parity. SQLFrame retrieval does not certify parity with PySpark or Structured Streaming.",
      "Installation and deployment scripts in these repositories stay inert. Reading a repository does not authorize running its installer.",
    ],
    labs: ["L13", "L14", "L15"],
    datasets: [],
    origins: ["Published sample implementation", "Published code examples"],
    verification:
      "NOT_RUN; no job, deployment script or benchmark was executed by Hansa.",
    limitation:
      "Every performance number in this lesson would be yours to produce. The package supplies source and method, never results.",
  },
];

export const RTI_LESSONS: RtiLesson[] = [...LESSONS].sort((a, b) => a.order - b.order);

/** Derived, so the catalogue never prints a hand-typed lesson count. */
export const RTI_LESSON_COUNT = RTI_LESSONS.length;

export function rtiLessonHref(lesson: RtiLesson): string {
  return `${RTI_COURSE.href}${lesson.slug}/`;
}

export function getRtiLesson(slug: string): RtiLesson | undefined {
  return RTI_LESSONS.find((lesson) => lesson.slug === slug);
}

export function rtiLabsFor(lesson: RtiLesson) {
  return lesson.labs
    .map((id) => labSet.labs.find((lab) => lab.lab_id === id))
    .filter((lab): lab is (typeof labSet.labs)[number] => Boolean(lab));
}

export function rtiDatasetsFor(lesson: RtiLesson) {
  return lesson.datasets
    .map((id) => sourceRegistry.datasets.find((dataset) => dataset.dataset_id === id))
    .filter((dataset): dataset is (typeof sourceRegistry.datasets)[number] => Boolean(dataset));
}

/** Lab ids the course withholds, with the reason, so a page can show the gap. */
export const RTI_WITHHELD_LABS = labSet.holds;

/**
 * Every shipped blueprint must be wrapped by exactly one lesson. This is the
 * guard that keeps a future package upgrade from quietly adding a blueprint
 * that no lesson covers.
 */
const covered = new Set(RTI_LESSONS.flatMap((lesson) => lesson.labs));
const shippedIds = labSet.labs.map((lab) => lab.lab_id);
export const RTI_UNCOVERED_LABS = shippedIds.filter((id) => !covered.has(id));
export const RTI_UNKNOWN_LABS = [...covered].filter((id) => !shippedIds.includes(id));
