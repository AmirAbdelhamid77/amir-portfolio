/** Original teaching content, independent of the preserved guide and existing bank. */
export const LESSON = {
    id: "dp600-ingestion-decisions", revision: 1, title: "Shortcut, Mirroring or Copy?",
    href: "/learn/dp-600/ingestion/", domain: "Prepare data for analytics",
    prerequisites: ["OneLake is storage; a Lakehouse is an item", "A reference is different from a replica"],
    objective: "Choose a data access or movement pattern from duplication, freshness, source support and transformation constraints, and explain when none fits.",
    sourcePages: [9, 10, 25, 56], sourceSections: ["dp600-1-intro", "dp600-c1-s03", "dp600-c4-s03", "dp600-appendix-a-s01", "dp600-appendix-a-s02"],
    origin: "Original Hansa teaching exercises; not official Microsoft exam questions",
} as const;
export const REFERENCES = [
    { id: "MS-SHORTCUT", title: "OneLake shortcuts and caching", url: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts" },
    { id: "MS-SECURITY", title: "Shortcut permissions and identity", url: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcut-security" },
    { id: "MS-MIRROR", title: "Mirroring types and supported sources", url: "https://learn.microsoft.com/en-us/fabric/mirroring/overview" },
    { id: "MS-COPY", title: "Copy jobs, incremental loads and CDC", url: "https://learn.microsoft.com/en-us/fabric/data-factory/what-is-copy-job" },
    { id: "MS-DECISION", title: "Microsoft data movement decision guide", url: "https://learn.microsoft.com/en-us/fabric/data-factory/decision-guide-data-movement" },
] as const;
export type Pattern = "shortcut" | "mirroring" | "copy";
export const PATTERNS: {
    id: Pattern;
    title: string;
    mechanism: string;
    freshness: string;
    limit: string;
}[] = [
    { id: "shortcut", title: "Shortcut", mechanism: "Reference existing accessible data instead of maintaining an ingestion replica.", freshness: "Reads through to the target; caching and the consuming engine affect what is observed.", limit: "Not a historical snapshot or a transformation pipeline. Access and connection rules still apply." },
    { id: "mirroring", title: "Database Mirroring", mechanism: "Maintain an analytical replica of supported operational tables in OneLake.", freshness: "Continuous replication with latency; near real time is not zero lag.", limit: "Check source-specific support and prerequisites. Reshape downstream; the mirrored replica is read-only." },
    { id: "copy", title: "Copy + orchestration", mechanism: "Materialize data in a destination you control, with an explicit load policy.", freshness: "Batch reflects successful loads. Supported Copy jobs can also use CDC.", limit: "A Copy activity moves/maps data; complex cleansing or joins need a separate transformation step." },
];
export type Constraints = {
    source: "gold" | "database" | "files";
    goal: "reference" | "replica" | "snapshot";
    access: boolean;
    mirrorSupported: boolean;
    transform: boolean;
};
export const DEFAULT_CONSTRAINTS: Constraints = { source: "gold", goal: "reference", access: true, mirrorSupported: true, transform: false };
export type Decision = {
    pattern: Pattern;
    fits: boolean;
    explanation: string;
};
export function evaluate(c: Constraints): {
    recommendation: Pattern | null;
    summary: string;
    decisions: Decision[];
} {
    const decisions: Decision[] = [
        { pattern: "shortcut", fits: c.access && c.source !== "database" && c.goal === "reference" && !c.transform,
            explanation: !c.access ? "Resolve source and shortcut-path access first." : c.source === "database" ? "This scenario supplies database tables, not a supported shortcut target or published mirror." : c.goal !== "reference" ? "A reference follows the target; it does not create the requested independent replica or retained snapshot." : c.transform ? "A shortcut does not perform the required cleansing. Materializing transformed output conflicts with this no-copy requirement." : "Reuse the accessible target without a separately managed ingestion copy; check caching and consumer refresh behavior." },
        { pattern: "mirroring", fits: c.access && c.source === "database" && c.mirrorSupported && c.goal === "replica" && !c.transform,
            explanation: !c.access ? "Replication also needs an authorized source connection." : c.source !== "database" ? "Database Mirroring is for a supported database source, not the supplied file/table reference." : !c.mirrorSupported ? "Source support and replication prerequisites have not been satisfied." : c.goal !== "replica" ? "Continuous database replication creates a replica; it is neither in-place reuse nor a retained point-in-time snapshot policy." : c.transform ? "The replica does not apply custom joins or cleansing. Add a downstream transformation stage and review freshness." : "Managed database replication fits continuous read-only analytics with minimal ingestion orchestration. Copy-job CDC can also fit some cases; verify its connector and operational needs." },
        { pattern: "copy", fits: c.access && c.goal === "snapshot",
            explanation: !c.access ? "Copy also requires a permitted source and destination connection." : c.goal === "reference" ? "Copy creates another materialized dataset, conflicting with the no-ingestion-copy requirement." : c.goal === "replica" ? "A batch Copy activity alone does not provide continuous replication. Investigate CDC Copy job support or replication plus downstream processing; no universal winner is assumed here." : c.transform ? "Orchestrate Copy plus a Dataflow Gen2, notebook or SQL transformation, then retain a dated result with an explicit append/version policy. Copy alone is not a cleansing engine." : "Use a scheduled load and an explicit append/version policy to retain a dated result. Overwriting a target alone does not preserve history." },
    ];
    const recommendation = decisions.find(d => d.fits)?.pattern ?? null;
    return { recommendation, decisions, summary: recommendation ? `${PATTERNS.find(p => p.id === recommendation)!.title} fits these stated constraints.` : "No single pattern in this bounded lab satisfies every constraint. Resolve access or change the architecture; do not force a choice." };
}
export const TRANSFER: {
    id: string;
    title: string;
    prompt: string;
    answer: Pattern;
    hint: string;
    rationales: Record<Pattern, string>;
}[] = [
    { id: "academy-ingest-reuse", title: "Reuse without a replica", prompt: "Finance publishes an accessible Delta Gold table in OneLake. A second workspace needs to read it, no separate ingestion copy is permitted, and no reshaping or historical snapshot is required. Which pattern fits?", answer: "shortcut", hint: "Does the consumer need a pointer or another materialized dataset?", rationales: { shortcut: "Correct. A shortcut references the existing table; confirm permissions at the shortcut and target paths.", mirroring: "Database Mirroring would create a replica and is unnecessary for this published OneLake target.", copy: "Copy materializes data and conflicts with the no-separate-ingestion-copy requirement." } },
    { id: "academy-ingest-replicate", title: "Operational replication", prompt: "A supported operational database has all required permissions and replication prerequisites configured. Analytics needs a read-only near-real-time replica in OneLake without custom cleansing or a team-managed ingestion schedule. Which is the most direct managed database replication pattern?", answer: "mirroring", hint: "The goal is a continuously maintained analytical replica, not data reuse in place.", rationales: { shortcut: "A database connection alone is not a shortcut target. No supported published shortcut target is supplied here.", mirroring: "Correct. Database Mirroring fits the stated managed replication goal. Near real time still has latency; supported CDC Copy jobs can be alternatives under different operational requirements.", copy: "Copy-job CDC can also replicate supported sources, but this case asks for the direct managed database mirroring pattern without custom load behavior." } },
    { id: "academy-ingest-history", title: "Retain a transformed daily result", prompt: "Shipment CSV files arrive daily. You must join reference data, correct types, and retain each day's transformed output for audit, even after the source changes. A daily schedule is sufficient. Choose the architecture that covers both movement and transformation.", answer: "copy", hint: "Separate the movement step, transformation step and history-retention policy.", rationales: { shortcut: "Referencing mutable source files does not retain a transformed historical result.", mirroring: "Database Mirroring is not a CSV cleansing pipeline or a daily retained-result policy.", copy: "Correct: orchestrate Copy plus a suitable transformation, then append or version the dated output. Neither Copy alone nor overwriting yesterday's target meets the requirement." } },
];
export const ACADEMY_KEY = "hansa-academy-ingestion-v1";
export type LessonState = {
    version: 1;
    revision: 1;
    answers: Record<string, Pattern>;
    checked: string[];
    confidence: "low" | "medium" | "high";
    journal: {
        id: string;
        answer: Pattern;
        confidence: string;
    }[];
};
export function emptyLessonState(): LessonState { return { version: 1, revision: 1, answers: {}, checked: [], confidence: "medium", journal: [] }; }
export function parseLessonState(raw: string | null): LessonState | null {
    if (raw === null)
        return emptyLessonState();
    if (raw.length > 50000)
        return null;
    try {
        const d = JSON.parse(raw);
        if (!d || d.version !== 1 || d.revision !== 1 || !d.answers || typeof d.answers !== "object" || Array.isArray(d.answers) || !Array.isArray(d.checked) || !Array.isArray(d.journal) || d.journal.length > 30 || !["low", "medium", "high"].includes(d.confidence))
            return null;
        const isId = (v: unknown) => typeof v === "string" && TRANSFER.some(q => q.id === v), isPattern = (v: unknown) => PATTERNS.some(p => p.id === v);
        if (!Object.entries(d.answers).every(([k, v]) => isId(k) && isPattern(v)) || !d.checked.every(isId) || new Set(d.checked).size !== d.checked.length || !d.checked.every((id: string) => d.answers[id]) || !d.journal.every((j: {
            id: unknown;
            answer: unknown;
            confidence: unknown;
        }) => j && isId(j.id) && isPattern(j.answer) && ["low", "medium", "high"].includes(String(j.confidence))))
            return null;
        return { version: 1, revision: 1, answers: d.answers, checked: d.checked, confidence: d.confidence, journal: d.journal };
    }
    catch {
        return null;
    }
}
export function completedCount(s: LessonState) { return TRANSFER.filter(q => s.checked.includes(q.id) && s.answers[q.id] === q.answer).length; }
