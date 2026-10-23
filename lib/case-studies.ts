export type GalleryShot = {
  src: string;
  srcSet?: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  role: string;
  timeframe: string;
  status: string;
  tools: string[];
  summary: string;
  problem: string[];
  approach: { title: string; body: string }[];
  architecture?: { label: string; detail: string }[];
  metrics: { value: string; label: string; note?: string }[];
  sections: {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
  gallery?: GalleryShot[];
  outcome: string[];
  limitations: string;
  links?: { label: string; href: string; external?: boolean }[];
  featured?: boolean;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "hse-analytics",
    title: "HSE Analytics Dashboard",
    subtitle:
      "A safety and environmental control room for 24 upstream oil and gas sites.",
    role: "Data analyst & BI developer — end to end",
    timeframe: "2025 · synthetic 2-year dataset",
    status: "Portfolio build",
    tools: ["Power BI", "DAX", "Power Query (M)", "Star schema", "SQL"],
    summary:
      "Health, Safety and Environment reporting usually arrives as a stack of spreadsheets, one per site, one month late. I built the opposite: a single modelled warehouse and a five-view Power BI product that turns incident, observation, action, and emissions data into decisions.",
    problem: [
      "HSE reporting was split across site-level spreadsheets with different definitions of the same KPI, so two locations could report the same month and disagree.",
      "Leadership saw lagging indicators — incidents that had already happened — with no view of leading signals such as observation quality or overdue corrective actions.",
      "Environmental performance lived outside the safety conversation: emissions, spills, and recovery rates were tracked but never compared against operational output.",
      "Corrective actions had owners and due dates, but no ageing view, so overdue work was invisible until an audit.",
    ],
    approach: [
      {
        title: "Model the operation before the dashboard",
        body: "I started with a constellation schema rather than a visual: 15+ fact tables for incidents, observations, actions, emissions, spills, production, and workforce; 10+ dimensions for site, department, date, incident type, severity, and status. Every visual in the report resolves to that model.",
      },
      {
        title: "Generate data that behaves like operations",
        body: "The public version uses a synthetic dataset covering 2+ years across 24 anonymised locations. It is generated so that rates, seasonality, and follow-up delays are internally consistent — the point is to prove the model and the measures, not to publish real incidents.",
      },
      {
        title: "Build a measure library, not one-off cards",
        body: "229+ DAX measures cover rates normalised per million hours, running totals, weighted averages, time intelligence, and conditional status logic. Thresholds are centralised so a KPI can be reclassified without editing every page.",
      },
      {
        title: "Design for the decision, then the chart",
        body: "Each of the five views answers one recurring question: are we safe, what is about to go wrong, are we closing actions, are we compliant, and is the operation improving? Status colour is paired with labels and values so meaning never depends on colour alone.",
      },
      {
        title: "Validate and document the assumptions",
        body: "Power Query steps handle typing, hierarchy creation, and the date table. I documented numerator and denominator logic for every rate, plus the synthetic-data caveat, so the work can be reviewed instead of admired.",
      },
    ],
    architecture: [
      { label: "15+", detail: "fact tables across safety, environment, and production" },
      { label: "10+", detail: "dimension tables including site, department, date, severity" },
      { label: "50+", detail: "total tables in the constellation schema" },
      { label: "24", detail: "anonymised operating locations" },
      { label: "2+ yrs", detail: "synthetic history for trend and time intelligence" },
      { label: "229+", detail: "DAX measures with documented logic" },
      { label: "12+", detail: "departments represented in the model" },
      { label: "5", detail: "purpose-built report views" },
    ],
    metrics: [
      { value: "0.19", label: "TRIR", note: "per 1M hours · world-class band" },
      { value: "0.28", label: "LTIFR", note: "per 1M hours" },
      { value: "863", label: "Days since LTI", note: "current streak" },
      { value: "60", label: "Overdue actions", note: "surfaced for follow-up" },
    ],
    sections: [
      {
        heading: "Safety performance",
        paragraphs: [
          "The executive view tracks TRIR, LTIFR, days since a lost-time incident, and potential serious incident frequency (PSIF) on one screen. Rates are normalised by hours worked rather than headcount, which makes sites of different sizes comparable.",
          "The synthetic dataset lands at TRIR 0.19 and LTIFR 0.28 per million hours, with 863 days since the last lost-time incident. Those numbers are deliberately in the world-class band so the dashboard can be tested against a realistic best case — they are not a claim about a real operator.",
        ],
        bullets: [
          "PSIF tracking separates 14 critical near-misses from lower-consequence events.",
          "Status thresholds are data-driven; a KPI changes band without a manual edit.",
          "Every rate exposes its numerator and denominator in a tooltip.",
        ],
      },
      {
        heading: "Leading indicators and action hygiene",
        paragraphs: [
          "Lagging metrics tell you what already went wrong. The observations and actions view tracks what might: observation volume per site, the share that are proactive rather than reactive, observation quality, and the age of corrective actions.",
        ],
        bullets: [
          "85.82% of observations were proactive, with a 0.72 quality index.",
          "60 high-priority corrective actions were overdue at the snapshot date.",
          "Average investigation close time was 40 days against a 30-day target — a 10-day gap the executive view makes impossible to miss.",
        ],
      },
      {
        heading: "Environmental performance",
        paragraphs: [
          "Emissions, spill frequency, and spill recovery sit alongside production so intensity can be read rather than raw volume. Scope 1 emissions are broken down by source, and spill performance is expressed per million barrels of oil equivalent.",
          "The view aligns its structure with ISO 45001, OSHA, and EPA reporting expectations, without claiming certification or regulatory submission.",
        ],
        bullets: [
          "GHG intensity and Scope 1 breakdown by source.",
          "Spill frequency of 0.62 per MMBO with an 86.6% recovery rate.",
          "Environmental metrics share the same site and date dimensions as safety, so cross-domain comparison is possible.",
        ],
      },
      {
        heading: "Operational excellence",
        paragraphs: [
          "A production-adjusted safety score of 95.8% and a workforce stability index of 96.02 connect HSE outcomes to how the operation is actually running. HSE-related downtime totals 4,392 hours in the synthetic period.",
          "This is the view that stops HSE from being a parallel report: it shares the same production and workforce facts as the operational dashboard.",
        ],
      },
      {
        heading: "What I would do next",
        paragraphs: [
          "The natural next step is row-level security per site, incremental refresh against a real source, and a small set of leading-indicator alerts delivered where supervisors already work. None of that changes the model — which was the point of building it this way.",
        ],
      },
    ],
    gallery: [
      {
        src: "/images/hse/executive-overview-1200.webp",
        srcSet:
          "/images/hse/executive-overview-1200.webp 1200w, /images/hse/executive-overview-2000.webp 2000w",
        alt: "Executive overview dashboard with TRIR, LTIFR, days since LTI and status cards",
        caption:
          "Executive overview — rate KPIs, status bands, and the signals that need attention this week.",
        width: 1200,
        height: 681,
      },
      {
        src: "/images/hse/incident-tracking-1200.webp",
        srcSet:
          "/images/hse/incident-tracking-1200.webp 1200w, /images/hse/incident-tracking-2000.webp 2000w",
        alt: "Incident tracking dashboard with incident types, severity and trend",
        caption:
          "Incident tracking — type, severity, and trend, with drill-through to the underlying event.",
        width: 1200,
        height: 687,
      },
      {
        src: "/images/hse/observations-actions-1200.webp",
        srcSet:
          "/images/hse/observations-actions-1200.webp 1200w, /images/hse/observations-actions-2000.webp 2000w",
        alt: "Observations and corrective actions dashboard showing proactive share and overdue actions",
        caption:
          "Observations and actions — proactive share, quality index, and action ageing in one view.",
        width: 1200,
        height: 687,
      },
      {
        src: "/images/hse/environmental-performance-1200.webp",
        srcSet:
          "/images/hse/environmental-performance-1200.webp 1200w, /images/hse/environmental-performance-2000.webp 2000w",
        alt: "Environmental performance dashboard with GHG intensity and spill recovery",
        caption:
          "Environmental performance — GHG intensity, Scope 1 sources, spill frequency, and recovery.",
        width: 1200,
        height: 681,
      },
      {
        src: "/images/hse/operational-excellence-1200.webp",
        srcSet:
          "/images/hse/operational-excellence-1200.webp 1200w, /images/hse/operational-excellence-2000.webp 2000w",
        alt: "Operational excellence dashboard with production-adjusted safety score and downtime",
        caption:
          "Operational excellence — production-adjusted safety, HSE downtime, and workforce stability.",
        width: 1200,
        height: 687,
      },
    ],
    outcome: [
      "A single modelled source for safety, environment, and operational KPIs across 24 sites.",
      "60 overdue corrective actions made visible and prioritised in one view.",
      "A 10-day investigation backlog (40 vs 30 days) quantified and assigned an owner.",
      "A reusable measure library of 229+ DAX measures, documented for review.",
      "Environmental performance read as intensity, not isolated totals.",
    ],
    limitations:
      "All data is synthetically generated for demonstration. Locations are anonymised, rates are not audited, and the report has not been deployed into a production tenant. The architecture and measure logic are the deliverable; the numbers are a test fixture.",
    featured: true,
  },
  {
    slug: "ibm-capstone",
    title: "IBM Data Analyst Capstone",
    subtitle:
      "An end-to-end analysis workflow: question, extract, clean, visualise, present.",
    role: "Analyst — individual capstone",
    timeframe: "2025 · IBM Professional Certificate",
    status: "Certification project",
    tools: ["SQL", "Python", "Pandas", "Matplotlib", "Seaborn", "Excel"],
    summary:
      "The capstone is where the certificate stops being a list of tools. I took a survey dataset through the full analyst workflow — writing SQL to shape it, cleaning and exploring it in Pandas, visualising the distributions that mattered, and presenting findings to a non-technical audience.",
    problem: [
      "The raw survey export mixed categorical and numeric fields, contained inconsistent labels, and had missing values that would quietly distort any percentage.",
      "The interesting questions were comparative — which groups differ, and by how much — rather than simple totals.",
      "A dashboard is the wrong first artefact for exploratory work; the analysis had to earn its conclusions before any chart was designed.",
    ],
    approach: [
      {
        title: "Frame the question before touching the data",
        body: "I wrote the questions down first, then chose the columns and the aggregation level that could answer them. That kept the SQL focused and stopped the analysis from becoming a tour of everything the dataset contained.",
      },
      {
        title: "Shape with SQL, clean with Pandas",
        body: "Joins, aggregations, and subqueries produced an analysis-ready extract. Pandas handled type conversion, missing-value decisions, duplicate checks, and derived fields — with each decision recorded so the result could be reproduced.",
      },
      {
        title: "Visualise to test, not to decorate",
        body: "Matplotlib and Seaborn were used to check distributions and compare groups, then to communicate the two or three findings that survived scrutiny. Excel pivot tables were used for a quick cross-check on the aggregate numbers.",
      },
      {
        title: "Present the finding, then the method",
        body: "The final narrative leads with what changed and what it implies, with the method available underneath. That ordering is the part most analyst portfolios get backwards.",
      },
    ],
    metrics: [
      { value: "SQL", label: "Extraction", note: "joins, aggregates, subqueries" },
      { value: "Pandas", label: "Cleaning", note: "types, nulls, duplicates" },
      { value: "Seaborn", label: "Exploration", note: "distributions and comparisons" },
      { value: "Excel", label: "Cross-check", note: "pivots and lookups" },
    ],
    sections: [
      {
        heading: "What the project demonstrates",
        bullets: [
          "A reproducible path from raw extract to presented finding.",
          "Deliberate handling of missing data rather than dropping rows by default.",
          "SQL used for shaping, not just SELECT *.",
          "Charts chosen to answer a question, with a stated takeaway for each.",
        ],
      },
      {
        heading: "What I would add with more time",
        paragraphs: [
          "A written data dictionary, a notebook split into numbered analysis steps, and one interactive view so a reviewer can test the conclusion themselves. The current artefact is a report; the next version should be a small, inspectable product.",
        ],
      },
    ],
    limitations:
      "This page summarises the certificate capstone. The dataset is public survey data and the findings are not presented as original research.",
    outcome: [
      "A reproducible path from raw extract to a presented finding.",
      "A cleaning log that makes missing-value decisions reviewable.",
      "A narrative that leads with the finding rather than the tool list.",
      "A cross-check of aggregate numbers between SQL and Excel pivots.",
    ],
  },
  {
    slug: "adas",
    title: "ADAS Sensor Data Prototype",
    subtitle:
      "An engineering foundation for working with noisy, real-time sensor data.",
    role: "Team of four — data collection, validation, documentation",
    timeframe: "Graduation project · B.Sc. Electronics & Communication Engineering",
    status: "Academic project",
    tools: ["Sensor data", "Real-time constraints", "Validation", "Technical writing"],
    summary:
      "Before analytics, I studied electronics and communication engineering. Our graduation project was an advanced driver-assistance prototype: sensors, thresholds, and a system that had to react while the data was still arriving. It is where I learned that data quality is a physical property, not a spreadsheet cleanup step.",
    problem: [
      "Sensor streams arrive with noise, dropouts, and inconsistent timing; a threshold that works on a desk fails at speed.",
      "The system had to decide quickly, which ruled out heavy post-processing between reading and acting.",
      "Four people needed a shared definition of a valid reading and a reproducible way to test changes.",
    ],
    approach: [
      {
        title: "Collect, then question the collection",
        body: "We logged raw readings before filtering so that any downstream decision could be traced back to what the sensor actually produced.",
      },
      {
        title: "Validate at the boundary",
        body: "Range checks, timing checks, and simple consistency rules caught bad readings before they reached the decision logic. The same instinct later became data-quality rules in SQL and Power Query.",
      },
      {
        title: "Document for the next person",
        body: "I owned a large share of the technical documentation and the English presentation. Writing down assumptions exposed several that the team had been carrying silently.",
      },
    ],
    metrics: [
      { value: "4", label: "Team size", note: "shared validation contract" },
      { value: "Real-time", label: "Constraint", note: "bounded processing per reading" },
      { value: "Raw-first", label: "Logging", note: "traceable sensor input" },
      { value: "EN", label: "Documentation", note: "technical writing and defence" },
    ],
    sections: [
      {
        heading: "Why it belongs in a data portfolio",
        paragraphs: [
          "The tools are different, but the discipline is the same: define what a valid observation is, capture the raw record, validate before transforming, and write down the assumption you will otherwise forget. That is the through-line from an ADAS prototype to an HSE measure library.",
        ],
      },
    ],
    limitations:
      "Academic prototype, not a production ADAS system. This page describes the data-handling and documentation work, not vehicle-level safety certification.",
    outcome: [
      "A shared definition of a valid sensor reading across the team.",
      "Raw-first logging that made later debugging possible.",
      "Boundary validation before the decision layer, not after.",
      "Technical documentation and an English defence delivered on schedule.",
    ],
  },
];

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug);
}

export const FEATURED_CASE_STUDIES = CASE_STUDIES.filter(
  (study) => study.featured,
).concat(CASE_STUDIES.filter((study) => !study.featured));
