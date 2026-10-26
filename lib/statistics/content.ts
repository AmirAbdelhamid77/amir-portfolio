// Editorial architecture for the Comprehensive Statistics Reference.
//
// The exported Notion page is the source of truth for every section body; this
// module only adds the learning layer V2 requires: a journey grouping, a
// measurable objective, the misconception each visual is meant to remove, the
// visual/lab that does the work, and a destination anchor. Source wording lives
// in `content/statistics/source.json` and is rendered verbatim.
//
// Nothing here may be read as a replacement for the source. Sections are marked
// CORE, SUPPORTING or TEXT_ONLY with a pedagogical reason; the coverage matrix
// checks that every one of the 43 source sections has a destination.

export type JourneySlug =
  | "foundations"
  | "describe"
  | "probability"
  | "distributions"
  | "sampling"
  | "hypothesis"
  | "experiments"
  | "relationships"
  | "synthesis";

export interface Journey {
  slug: JourneySlug;
  number: number;
  title: string;
  arabic: string;
  question: string;
  summary: string;
  outcomes: string[];
  sections: number[];
  sourceRange: string;
  accent: string;
}

export type VisualKind = "lab" | "exhibit" | "diagram" | "none";

export interface SectionMeta {
  id: string;
  number: number;
  journey: JourneySlug;
  titleEn: string;
  titleAr?: string;
  objectives: string[];
  misconception: string;
  visual: {
    kind: VisualKind;
    id: string;
    title: string;
    priority: "CORE" | "SUPPORTING" | "OPTIONAL";
    placement: "before" | "after-intro" | "end";
  } | null;
  coverage: "CORE" | "SUPPORTING" | "TEXT_ONLY";
  coverageReason?: string;
  sourceNote?: string;
}

export const JOURNEYS: readonly Journey[] = [
  {
    slug: "foundations",
    number: 1,
    title: "Foundations: from a question to data",
    arabic: "الأساسيات",
    question: "What are we measuring, who is it about, and what can a number even claim?",
    summary:
      "Statistics starts before the first calculation: define the population, the sample, the variable type and the branch of analysis. This journey builds the vocabulary the other eight journeys depend on.",
    outcomes: [
      "Distinguish a population from a sample, and a parameter from a statistic.",
      "Classify an observation as numerical or categorical, and explain what that permits.",
      "Say whether a question is descriptive or inferential before choosing a method.",
    ],
    sections: [1, 2, 3],
    sourceRange: "§1–3",
    accent: "var(--chart-1)",
  },
  {
    slug: "describe",
    number: 2,
    title: "Describe the data you actually have",
    arabic: "وصف البيانات",
    question: "Where is the centre, how wide is the spread, and which summary survives an outlier?",
    summary:
      "Mean, median and mode answer different questions; variance, standard deviation and IQR measure different units. The visual layer lets you move one point and watch resistance and sensitivity diverge.",
    outcomes: [
      "Read mean, median and mode as different summaries, not interchangeable ones.",
      "Explain why the mean moves more than the median when an outlier is added.",
      "Use the n−1 denominator for a sample and say what the IQR's middle 50% means.",
    ],
    sections: [4, 5],
    sourceRange: "§4–5",
    accent: "var(--chart-2)",
  },
  {
    slug: "probability",
    number: 3,
    title: "Probability: the space of what could happen",
    arabic: "الاحتمالات",
    question: "Where does probability live, and how do events combine?",
    summary:
      "Probability is a measure over a sample space, not a feeling about a sentence. The lab makes complements, intersections, conditional probability, independence and mutual exclusivity visible in the same space.",
    outcomes: [
      "Compute a complement, an intersection and a conditional probability from the same event.",
      "Explain why mutually exclusive events are not independent.",
      "Distinguish a discrete probability mass from a continuous density.",
    ],
    sections: [6, 7],
    sourceRange: "§6–7",
    accent: "var(--chart-3)",
  },
  {
    slug: "distributions",
    number: 4,
    title: "Distributions: shapes with rules",
    arabic: "التوزيعات",
    question: "Which distribution matches the data-generating process, and what are its assumptions?",
    summary:
      "Binomial counts successes in fixed independent trials; Poisson counts events in a fixed interval; the normal describes a continuous symmetric bell. Each has a different support, parameter meaning and probability rule.",
    outcomes: [
      "Check the four binomial conditions before using a binomial model.",
      "Read a normal probability as area and a z-score as distance in standard deviations.",
      "Explain why λ is a rate per stated interval, not a probability.",
    ],
    sections: [8, 9, 10],
    sourceRange: "§8–10",
    accent: "var(--chart-4)",
  },
  {
    slug: "sampling",
    number: 5,
    title: "Sampling and estimation: from one sample to a range",
    arabic: "العينات والتقدير",
    question: "How variable is a statistic, and how do we express uncertainty without pretending it is certainty?",
    summary:
      "The central limit theorem is about the distribution of sample means, not about individual observations becoming normal. Standard error and confidence intervals turn that sampling distribution into a calibrated statement.",
    outcomes: [
      "Keep the population, one sample and the sampling distribution visually distinct.",
      "Compute and interpret SE = σ/√n and explain why n quadrupling halves it.",
      "Interpret a 95% interval as a property of the procedure, not a probability about a fixed parameter.",
    ],
    sections: [11, 12, 13, 14],
    sourceRange: "§11–14",
    accent: "var(--chart-5)",
  },
  {
    slug: "hypothesis",
    number: 6,
    title: "Hypothesis testing: evidence under a null model",
    arabic: "اختبار الفرضيات",
    question: "If the null were true, how unusual is what we observed — and what decision follows?",
    summary:
      "A test compares an observed statistic with the distribution it would have under H₀. The p-value is a tail area conditional on that model; α is chosen before the data; failing to reject is not accepting.",
    outcomes: [
      "Write H₀ and Hₐ and choose a sidedness before looking at the result.",
      "Read a p-value as P(statistic at least as extreme | H₀), never P(H₀ true).",
      "Distinguish Type I from Type II error and statistical from practical significance.",
    ],
    sections: [15, 16, 17, 18, 19, 20, 21, 22, 23],
    sourceRange: "§15–23",
    accent: "var(--chart-1)",
  },
  {
    slug: "experiments",
    number: 7,
    title: "Experimental design: earning a causal claim",
    arabic: "تصميم التجارب",
    question: "What has to be true about the design before a difference can support a causal sentence?",
    summary:
      "Randomization, control, blinding and a pre-specified outcome are the design features that make groups comparable. The A/B test is one randomized design, not the definition of all experiments.",
    outcomes: [
      "Identify treatment, control, response and the unit of assignment.",
      "Explain what randomization balances in expectation — and what it does not guarantee.",
      "Distinguish single-blind, double-blind and open-label designs without overclaiming.",
    ],
    sections: [24, 25, 26, 27, 28, 29],
    sourceRange: "§24–29",
    accent: "var(--chart-2)",
  },
  {
    slug: "relationships",
    number: 8,
    title: "Relationships and causality: what r can and cannot say",
    arabic: "العلاقات والسببية",
    question: "Is the association linear, could a third variable explain it, and what would a causal claim require?",
    summary:
      "Pearson r measures the strength and direction of a linear association. It is not a slope, it can be near zero under a strong curve, and observational co-movement is not a causal effect.",
    outcomes: [
      "Read a scatterplot before trusting a correlation coefficient.",
      "Explain why r ≈ 0 does not rule out a strong non-linear relationship.",
      "Separate correlation, regression slope and a causal effect in plain language.",
    ],
    sections: [30, 31, 32, 33, 34, 35],
    sourceRange: "§30–35",
    accent: "var(--chart-3)",
  },
  {
    slug: "synthesis",
    number: 9,
    title: "Synthesis: choose, check, decide, explain",
    arabic: "التركيب والتطبيق",
    question: "Given a new question, which tool applies — and what would make the answer irresponsible?",
    summary:
      "The final journey turns the reference into a decision aid: a connected mental model, a formula workbench, a tool navigator, misconception cards, the checkout case and a printable field guide.",
    outcomes: [
      "Route a new question to a defensible method and name its assumptions.",
      "Use the formula sheet without detaching a formula from its conditions.",
      "Tell the checkout story end to end with consistent denominators and honest uncertainty.",
    ],
    sections: [36, 37, 38, 39, 40, 41, 42, 43],
    sourceRange: "§36–43",
    accent: "var(--chart-4)",
  },
] as const;

export const JOURNEY_BY_SLUG = new Map(JOURNEYS.map((journey) => [journey.slug, journey]));

export const SECTIONS: readonly SectionMeta[] = [
  {
    id: "s1",
    number: 1,
    journey: "foundations",
    titleEn: "The big picture: what is statistics?",
    titleAr: "الصورة الكبيرة",
    objectives: [
      "Name the six stages from data to decision and say what each one produces.",
      "Use population, sample, parameter and statistic correctly in one sentence.",
    ],
    misconception:
      "“A statistic is the same thing as a parameter.” A statistic is computed from a sample and varies; a parameter describes the population and is usually unknown.",
    visual: { kind: "exhibit", id: "evidence-journey", title: "The evidence journey", priority: "CORE", placement: "before" },
    coverage: "CORE",
  },
  {
    id: "s2",
    number: 2,
    journey: "foundations",
    titleEn: "Data types and what they permit",
    objectives: [
      "Sort observations into numerical (discrete/continuous) and categorical (nominal/ordinal).",
      "Explain why a numeric-looking identifier is categorical and why ordinal ranks are not measurements.",
    ],
    misconception:
      "“If it is written with digits, it is numerical.” Customer IDs and phone numbers are labels; averaging them is meaningless.",
    visual: { kind: "exhibit", id: "type-sorter", title: "Type sorter", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s3",
    number: 3,
    journey: "foundations",
    titleEn: "Descriptive vs inferential statistics",
    objectives: [
      "Tell a statement about the observed sample from a claim about the wider population.",
      "Identify which branch a question belongs to before computing anything.",
    ],
    misconception:
      "“A sample summary is already a conclusion about the population.” Description stops at the data; inference adds a model, uncertainty and assumptions.",
    visual: { kind: "exhibit", id: "branch-compare", title: "Describe vs infer", priority: "SUPPORTING", placement: "after-intro" },
    coverage: "SUPPORTING",
  },
  {
    id: "s4",
    number: 4,
    journey: "describe",
    titleEn: "Measures of center",
    objectives: [
      "Compute mean, median and mode and explain when each is the better summary.",
      "Predict which of mean and median moves further when one extreme value is added.",
    ],
    misconception:
      "“The mean is always the best centre.” In a skewed distribution or with outliers, the mean is pulled toward the tail and may stop representing a typical value.",
    visual: { kind: "lab", id: "center-spread", title: "Mean–median–outlier explorer", priority: "CORE", placement: "end" },
    coverage: "CORE",
  },
  {
    id: "s5",
    number: 5,
    journey: "describe",
    titleEn: "Measures of spread",
    objectives: [
      "Distinguish range, variance, standard deviation and IQR by what they measure and their units.",
      "Explain the n−1 sample denominator and the 1.5×IQR outlier rule.",
    ],
    misconception:
      "“Standard deviation and standard error are interchangeable.” SD describes individual values; SE describes how a statistic varies across repeated samples.",
    visual: { kind: "lab", id: "center-spread", title: "Spread lens", priority: "CORE", placement: "end" },
    coverage: "CORE",
  },
  {
    id: "s6",
    number: 6,
    journey: "probability",
    titleEn: "Probability, complements, independence and conditionals",
    objectives: [
      "Compute P(Aᶜ), P(A∩B), P(A∪B) and P(A|B) from a sample space.",
      "Explain why two mutually exclusive events with positive probability cannot be independent.",
    ],
    misconception:
      "“Independent means the events cannot happen together.” Independence is about information: knowing B does not change P(A). Mutually exclusive events cannot occur together at all.",
    visual: { kind: "lab", id: "probability", title: "Probability space lab", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s7",
    number: 7,
    journey: "probability",
    titleEn: "Probability distributions: mass vs density",
    objectives: [
      "Read a PMF bar as a probability and a PDF area as a probability.",
      "State why the probability of one exact value under a continuous distribution is zero.",
    ],
    misconception:
      "“The height of the normal curve is the probability of that value.” Height is density; probability is area under the curve between two values.",
    visual: { kind: "lab", id: "distributions", title: "PMF vs PDF studio", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s8",
    number: 8,
    journey: "distributions",
    titleEn: "The binomial distribution",
    objectives: [
      "Check the fixed-n, independent-trial, constant-p, binary-outcome conditions.",
      "Compute P(X=k), a lower tail or an upper tail and read E(X)=np and Var(X)=np(1−p).",
    ],
    misconception:
      "“Binomial counts how many trials happen.” It counts successes among a fixed number of trials; the number of trials is an input, not the outcome.",
    visual: { kind: "lab", id: "binomial", title: "Binomial machine", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s9",
    number: 9,
    journey: "distributions",
    titleEn: "The normal distribution and z-scores",
    objectives: [
      "Locate a value on a normal curve and shade the corresponding area.",
      "Standardize with z=(x−μ)/σ and apply the 68–95–99.7 rule as an approximation.",
    ],
    misconception:
      "“Changing σ changes the total probability.” The total area stays 1; a larger σ flattens and widens the curve.",
    visual: { kind: "lab", id: "normal", title: "Bell curve & z lab", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s10",
    number: 10,
    journey: "distributions",
    titleEn: "The Poisson distribution",
    objectives: [
      "Define λ as the mean count per fixed interval and compute exact and tail probabilities.",
      "Verify E(X)=Var(X)=λ and explain the discrete support.",
    ],
    misconception:
      "“λ=20 means P(X=20) is high, so 20 is the mode.” λ is a mean count; at integer λ the mode is actually the pair λ−1 and λ.",
    visual: { kind: "lab", id: "poisson", title: "Event-arrival theatre", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
    sourceNote:
      "Source §10.3 reports P(X≥25) as “a little over 11%”. The correct value for λ=20 is 15.68%; see math-errata.md. The rendered section shows the corrected value next to the original claim.",
  },
  {
    id: "s11",
    number: 11,
    journey: "sampling",
    titleEn: "The central limit theorem",
    objectives: [
      "Explain that the distribution of sample means tends toward normality under stated conditions.",
      "Show that the mean of the sampling distribution equals μ.",
    ],
    misconception:
      "“The CLT says the data become normal once n is large.” It is the sampling distribution of the mean that approaches normality, not the population or a single sample.",
    visual: { kind: "lab", id: "sampling", title: "Sampling factory", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s12",
    number: 12,
    journey: "sampling",
    titleEn: "Sampling distribution",
    objectives: [
      "Distinguish the population distribution, one sample's distribution and the sampling distribution.",
      "Label each panel with its own unit and axis.",
    ],
    misconception:
      "“A sampling distribution is just a bigger sample.” It is the distribution of a statistic over repeated samples — a different object with a different axis.",
    visual: { kind: "lab", id: "sampling", title: "Three windows", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s13",
    number: 13,
    journey: "sampling",
    titleEn: "Standard error",
    objectives: [
      "Compute SE = σ/√n and its estimated form s/√n.",
      "Explain why SE shrinks as n grows while the SD of the values stays put.",
    ],
    misconception:
      "“SE is the SD of the data divided by √n because the data got narrower.” The data distribution did not change; the sampling distribution of the mean did.",
    visual: { kind: "lab", id: "confidence", title: "Precision dial", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s14",
    number: 14,
    journey: "sampling",
    titleEn: "Confidence intervals",
    objectives: [
      "Build estimate ± critical value × SE and explain each term.",
      "Interpret 95% coverage as a property of repeated procedures.",
    ],
    misconception:
      "“There is a 95% probability that the fixed parameter is inside this interval.” Once computed, the interval either covers the fixed parameter or does not; 95% is the long-run coverage of the method.",
    visual: { kind: "lab", id: "confidence", title: "Confidence interval rain", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s15",
    number: 15,
    journey: "hypothesis",
    titleEn: "Hypothesis testing and the two hypotheses",
    objectives: [
      "Write a null and an alternative for a comparison, including sidedness.",
      "Explain why the null is a model to test, not a belief to prove.",
    ],
    misconception:
      "“The test calculates the probability that H₀ is true.” It calculates the probability of data at least this extreme assuming H₀ is true.",
    visual: { kind: "lab", id: "p-value", title: "Evidence court", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s16",
    number: 16,
    journey: "hypothesis",
    titleEn: "The hypothesis-testing workflow",
    objectives: [
      "Order the seven stages from populations to a qualified conclusion.",
      "Identify the decision point where α enters.",
    ],
    misconception:
      "“The workflow starts with a p-value.” It starts with the question, the populations and the hypotheses; the statistic comes later.",
    visual: { kind: "exhibit", id: "decision-path", title: "Decision path", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s17",
    number: 17,
    journey: "hypothesis",
    titleEn: "Sampling variability inside a test",
    objectives: [
      "Show that two samples can differ even when the population means are equal.",
      "Reframe the question as whether the difference is larger than sampling noise.",
    ],
    misconception:
      "“A difference between sample means proves a difference between populations.” Samples vary; the test asks whether the observed difference is unusual under H₀.",
    visual: { kind: "lab", id: "sampling", title: "Repeat the comparison", priority: "SUPPORTING", placement: "after-intro" },
    coverage: "SUPPORTING",
  },
  {
    id: "s18",
    number: 18,
    journey: "hypothesis",
    titleEn: "Test statistic and standard error",
    objectives: [
      "Express a test statistic as a distance measured in standard errors.",
      "Reproduce (5.4 − 0)/1.5 = 3.6 and explain what the 3.6 means.",
    ],
    misconception:
      "“A test statistic of 3.6 is a 3.6% probability.” It is a distance in SE units; the probability comes from the null distribution, not from the number itself.",
    visual: { kind: "lab", id: "p-value", title: "Distance in standard errors", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s19",
    number: 19,
    journey: "hypothesis",
    titleEn: "The p-value",
    objectives: [
      "Define a p-value conditional on H₀ and the chosen sidedness.",
      "Distinguish the p-value area from an overlap between two distributions.",
    ],
    misconception:
      "“The p-value is the overlap between the null and alternative curves.” It is a tail area of the null sampling distribution, not an overlap.",
    visual: { kind: "lab", id: "p-value", title: "p-value observatory", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
    sourceNote:
      "Source §19.1 states p=0.037 without the sample size or standard error needed to verify it. The rendered section keeps the source example but marks it as illustrative and does not present it as a checked calculation.",
  },
  {
    id: "s20",
    number: 20,
    journey: "hypothesis",
    titleEn: "The significance level α",
    objectives: [
      "Explain α as a pre-declared Type I error rate and decision threshold.",
      "Show why moving α after seeing p changes the rule, not the evidence.",
    ],
    misconception:
      "“α is the probability that the result is wrong.” α is the long-run false-positive rate under H₀ for the chosen rule.",
    visual: { kind: "lab", id: "p-value", title: "Threshold gate", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s21",
    number: 21,
    journey: "hypothesis",
    titleEn: "The decision rule",
    objectives: [
      "Apply p ≤ α → reject H₀ and p > α → fail to reject H₀.",
      "Avoid the phrase “accept H₀” and explain the boundary case p = α.",
    ],
    misconception:
      "“Failing to reject proves H₀.” Absence of sufficient evidence against H₀ is not evidence that H₀ is exactly true.",
    visual: { kind: "lab", id: "p-value", title: "Decision boundary", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s22",
    number: 22,
    journey: "hypothesis",
    titleEn: "Type I and Type II errors",
    objectives: [
      "Map the four reality × decision cells and name the two errors.",
      "Relate α to Type I error and β to Type II error under a specified alternative.",
    ],
    misconception:
      "“Type I and Type II errors are complements.” They are conditional on different states of reality; α + β is not 1 in general.",
    visual: { kind: "lab", id: "errors", title: "Error trade-off & power", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s23",
    number: 23,
    journey: "hypothesis",
    titleEn: "Statistical vs practical significance",
    objectives: [
      "Separate evidence against H₀ from the size and business value of an effect.",
      "Explain how a huge sample can make a trivial difference significant.",
    ],
    misconception:
      "“Statistically significant means important.” Significance is about compatibility with H₀; importance depends on effect size, context and cost.",
    visual: { kind: "lab", id: "practical-significance", title: "Impact vs evidence", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s24",
    number: 24,
    journey: "experiments",
    titleEn: "Experiments",
    objectives: [
      "Identify the treatment and the response in a causal question.",
      "Explain what manipulating the treatment buys over observing it.",
    ],
    misconception:
      "“Any comparison is an experiment.” Without manipulation and a design that controls alternatives, it is an observational comparison.",
    visual: { kind: "exhibit", id: "cause-response", title: "Cause-and-response sketch", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s25",
    number: 25,
    journey: "experiments",
    titleEn: "Controlled experiments",
    objectives: [
      "Describe the role of a treatment group and a control group.",
      "Explain why imbalance on a covariate can create a misleading difference.",
    ],
    misconception:
      "“Control means do nothing.” A control can receive a placebo or the current standard, and the point is a comparable reference.",
    visual: { kind: "exhibit", id: "comparable-groups", title: "Comparable groups explorer", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s26",
    number: 26,
    journey: "experiments",
    titleEn: "Randomization",
    objectives: [
      "Explaining randomization as a design device, not a data-cleaning step.",
      "Show balance in expectation and finite-sample imbalance in a seeded shuffle.",
    ],
    misconception:
      "“Randomization guarantees the groups are balanced.” It balances in expectation; any one run can still be imbalanced.",
    visual: { kind: "lab", id: "experiments", title: "Assignment shuffle", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s27",
    number: 27,
    journey: "experiments",
    titleEn: "Blinding and placebo",
    objectives: [
      "Distinguish participant blinding, experimenter blinding and double blinding.",
      "Explain what a placebo controls and what blinding cannot fix.",
    ],
    misconception:
      "“Double-blind means the analyst also does not know the hypothesis.” It means participants and the people administering or assessing treatment do not know assignment.",
    visual: { kind: "exhibit", id: "bias-shields", title: "Bias shields", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s28",
    number: 28,
    journey: "experiments",
    titleEn: "RCT vs A/B testing",
    objectives: [
      "Explain that an A/B test is a two-arm randomized design, not the definition of an RCT.",
      "Distinguish two-arm from multi-arm experiments.",
    ],
    misconception:
      "“A/B testing and RCTs are unrelated.” An A/B test is a randomized controlled experiment applied to a product change.",
    visual: { kind: "exhibit", id: "experiment-blueprint", title: "Experiment blueprint", priority: "SUPPORTING", placement: "after-intro" },
    coverage: "SUPPORTING",
  },
  {
    id: "s29",
    number: 29,
    journey: "experiments",
    titleEn: "Independent and dependent variables",
    objectives: [
      "Map the predictor/treatment to X and the response to Y in a scenario.",
      "Explain why the role is defined by the question, not by the axis label.",
    ],
    misconception:
      "“Whatever is on the X axis causes the Y.” Axis placement is a convention; only the design supports a causal reading.",
    visual: { kind: "exhibit", id: "variable-switchboard", title: "Variable role switchboard", priority: "SUPPORTING", placement: "after-intro" },
    coverage: "SUPPORTING",
  },
  {
    id: "s30",
    number: 30,
    journey: "relationships",
    titleEn: "Correlation and Pearson r",
    objectives: [
      "Read direction and linear strength from r and from the scatterplot.",
      "Explain why r is unitless and bounded in [−1, 1].",
    ],
    misconception:
      "“r is the slope.” r is standardized covariance; the slope depends on the units of X and Y and is not bounded by 1.",
    visual: { kind: "lab", id: "correlation", title: "Scatter playground", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s31",
    number: 31,
    journey: "relationships",
    titleEn: "Pearson correlation and linear relationships",
    objectives: [
      "Show that a strong curved pattern can produce r near zero.",
      "Restrict Pearson interpretation to linear association.",
    ],
    misconception:
      "“r ≈ 0 means no relationship.” It means no *linear* relationship; a U-shape or cycle can be strongly dependent.",
    visual: { kind: "lab", id: "correlation", title: "Same r, different patterns", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s32",
    number: 32,
    journey: "relationships",
    titleEn: "Correlation is not causation",
    objectives: [
      "Separate co-movement from a causal effect.",
      "Name the alternative explanations that an observational r cannot exclude.",
    ],
    misconception:
      "“A high r proves X causes Y.” Association is compatible with reverse causation, confounding and coincidence.",
    visual: { kind: "exhibit", id: "causation-gap", title: "The evidence gap", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s33",
    number: 33,
    journey: "relationships",
    titleEn: "Confounding variables",
    objectives: [
      "Draw a third-variable structure Z→X, Z→Y and explain the induced association.",
      "Show what happens to a pooled correlation after within-group separation.",
    ],
    misconception:
      "“If the correlation is strong, a confounder cannot explain it.” A strong pooled association can be entirely produced or reversed by a third variable.",
    visual: { kind: "lab", id: "correlation", title: "Third-variable reveal", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s34",
    number: 34,
    journey: "relationships",
    titleEn: "Correlation vs experiment",
    objectives: [
      "Choose the tool based on the question's evidential target.",
      "Explain why a randomized experiment supports a stronger causal claim than an association.",
    ],
    misconception:
      "“A correlation study can establish causality if the sample is big enough.” Sample size narrows uncertainty; it does not remove confounding.",
    visual: { kind: "exhibit", id: "evidence-choice", title: "What can we conclude?", priority: "SUPPORTING", placement: "after-intro" },
    coverage: "SUPPORTING",
  },
  {
    id: "s35",
    number: 35,
    journey: "relationships",
    titleEn: "Correlation vs regression",
    objectives: [
      "Read a regression slope with units and compare it with r.",
      "Show that positive affine rescaling changes the slope but not r.",
    ],
    misconception:
      "“r=0.8 means Y rises 0.8 units per unit of X.” That is a slope statement; r has no units.",
    visual: { kind: "lab", id: "correlation", title: "Slope vs r", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s36",
    number: 36,
    journey: "synthesis",
    titleEn: "How the topics connect",
    objectives: [
      "Trace the prerequisite path from description to decision.",
      "Locate a concept in the atlas and open its source section.",
    ],
    misconception:
      "“The topics are independent chapters.” Each later method depends on the sampling and probability ideas built earlier.",
    visual: { kind: "exhibit", id: "concept-atlas", title: "Interactive concept atlas", priority: "CORE", placement: "before" },
    coverage: "CORE",
  },
  {
    id: "s37",
    number: 37,
    journey: "synthesis",
    titleEn: "The formula index",
    objectives: [
      "Match each formula to the question it answers and the conditions it requires.",
      "Read every symbol and unit without detaching it from its section.",
    ],
    misconception:
      "“The formula is the method.” A formula without its assumptions and data requirements is not a valid analysis.",
    visual: { kind: "exhibit", id: "formula-workbench", title: "Formula workbench", priority: "CORE", placement: "before" },
    coverage: "CORE",
  },
  {
    id: "s38",
    number: 38,
    journey: "synthesis",
    titleEn: "Decision rules: when the question changes",
    objectives: [
      "Route a new question to a starting method and name its alternatives.",
      "See which inputs and assumptions the method requires before it is used.",
    ],
    misconception:
      "“The most advanced method is the safest.” The right method is the one whose assumptions the data and design can support.",
    visual: { kind: "exhibit", id: "tool-navigator", title: "Statistical tool navigator", priority: "CORE", placement: "before" },
    coverage: "CORE",
  },
  {
    id: "s39",
    number: 39,
    journey: "synthesis",
    titleEn: "The mistakes to avoid",
    objectives: [
      "Recognise the ten misconceptions and the counterexample that defeats each.",
      "Use the correction without hiding the original claim.",
    ],
    misconception:
      "“Memorising the wrong sentence is enough to avoid it.” Each myth needs a concrete counterexample and a corrected sentence.",
    visual: { kind: "exhibit", id: "myth-cards", title: "Myth vs evidence", priority: "CORE", placement: "before" },
    coverage: "CORE",
  },
  {
    id: "s40",
    number: 40,
    journey: "synthesis",
    titleEn: "The end-to-end checkout case",
    objectives: [
      "Carry one scenario from question through assignment, data, test, decision and business interpretation.",
      "Keep denominators and uncertainty consistent across every panel.",
    ],
    misconception:
      "“A significant lift is automatically worth shipping.” The decision also needs effect size, cost, risk and a pre-specified meaningful threshold.",
    visual: { kind: "lab", id: "business-decision", title: "The business decision room", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s41",
    number: 41,
    journey: "synthesis",
    titleEn: "Final mental model",
    objectives: [
      "Describe the layered system from population to decision in one pass.",
      "Say where uncertainty, confounding and assumptions enter.",
    ],
    misconception:
      "“A decision is just the p-value.” The decision combines evidence, uncertainty, effect size, cost and context.",
    visual: { kind: "exhibit", id: "mental-model", title: "Layered systems diagram", priority: "CORE", placement: "after-intro" },
    coverage: "CORE",
  },
  {
    id: "s42",
    number: 42,
    journey: "synthesis",
    titleEn: "One-page cheat sheet",
    objectives: [
      "Use a compact, printable field guide without losing the conditions.",
      "Scan the formula, the question and the caution together.",
    ],
    misconception:
      "“A cheat sheet is a substitute for the lesson.” It is an index back to the lesson and its qualifications.",
    visual: { kind: "exhibit", id: "cheatsheet", title: "Visual field guide", priority: "SUPPORTING", placement: "before" },
    coverage: "SUPPORTING",
  },
  {
    id: "s43",
    number: 43,
    journey: "synthesis",
    titleEn: "Course conclusion",
    objectives: [
      "Run the transferable process: question → design → data → method → evidence → decision.",
      "Name the limitation that would change the conclusion.",
    ],
    misconception:
      "“The final answer is a number.” The final answer is a qualified decision with an explicit limitation.",
    visual: { kind: "exhibit", id: "capstone", title: "From question to decision", priority: "SUPPORTING", placement: "after-intro" },
    coverage: "SUPPORTING",
  },
] as const;

export const SECTION_BY_ID = new Map(SECTIONS.map((section) => [section.id, section]));

export function sectionsForJourney(slug: JourneySlug): SectionMeta[] {
  return SECTIONS.filter((section) => section.journey === slug);
}

export function journeyHref(slug: JourneySlug): string {
  return `/learn/statistics/journey/${slug}`;
}

export function sectionHref(section: SectionMeta): string {
  return `${journeyHref(section.journey)}#${section.id}`;
}

// ---------------------------------------------------------------------------
// Labs
// ---------------------------------------------------------------------------

export interface LabMeta {
  slug: string;
  title: string;
  tier: "P0" | "P1" | "SIGNATURE";
  journey: JourneySlug;
  question: string;
  description: string;
  controls: string[];
  math: string;
  provenance: string;
  sections: number[];
  duration: string;
}

export const LABS: readonly LabMeta[] = [
  {
    slug: "center-spread",
    title: "Mean, median & outlier explorer",
    tier: "P0",
    journey: "describe",
    question: "Which summary is telling the truth about a typical value?",
    description:
      "Edit a small dataset, add an extreme value, and watch the mean, median, SD and IQR react. The dot strip and box plot share one scale, so the change is visible rather than asserted.",
    controls: ["Dataset presets", "Outlier value", "Add / remove points", "Sample vs population SD", "Box plot toggle"],
    math: "x̄ = Σxᵢ/n; s² = Σ(xᵢ−x̄)²/(n−1); IQR = Q₃−Q₁; Tukey fences at 1.5×IQR",
    provenance:
      "Synthetic teaching values entered by the learner or loaded from a named preset. No real person or customer data is used.",
    sections: [4, 5],
    duration: "6–8 min",
  },
  {
    slug: "binomial",
    title: "Binomial distribution machine",
    tier: "P0",
    journey: "distributions",
    question: "What does '10 successes out of 20 trials' actually mean?",
    description:
      "Set n, p and k, switch between exact, at-most and at-least, and read the probability off the bars. The four assumptions are checked as conditions, not slogans.",
    controls: ["n trials", "p success probability", "k successes", "Exact / ≤ / ≥", "Presets"],
    math: "P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ; E(X)=np; Var(X)=np(1−p)",
    provenance: "Synthetic model parameters; every bar is computed from the closed-form PMF.",
    sections: [8],
    duration: "5–7 min",
  },
  {
    slug: "normal",
    title: "Bell curve & z-score lab",
    tier: "P0",
    journey: "distributions",
    question: "Where does probability live under a normal curve?",
    description:
      "Drag μ and σ, place x, and shade a left/right/between area. The standardized axis updates with the original axis; the 68–95–99.7 bands can be overlaid as an approximation.",
    controls: ["μ", "σ", "x (or interval)", "Tail / between", "Empirical-rule bands"],
    math: "f(x)=1/(σ√(2π))e^(−(x−μ)²/2σ²); z=(x−μ)/σ; area via Φ",
    provenance: "Mathematical model only; no observed data are implied.",
    sections: [9],
    duration: "5–7 min",
  },
  {
    slug: "poisson",
    title: "Poisson event-arrival theatre",
    tier: "P0",
    journey: "distributions",
    question: "How unusual is 25 arrivals when the rate is 20 per hour?",
    description:
      "Set λ and k, then switch between exact and tail probability. A seeded arrival strip shows the same rate as events over equal windows; the verified λ=20 example is a preset.",
    controls: ["λ per interval", "k events", "Exact / ≤ / ≥", "Interval length", "Arrival replay"],
    math: "P(X=k)=e^(−λ)λᵏ/k!; E(X)=Var(X)=λ; SD=√λ",
    provenance:
      "Arrival strips are seeded simulations, labelled as simulated. The λ=20 preset reproduces the source example with its corrected tail.",
    sections: [10],
    duration: "6–8 min",
  },
  {
    slug: "sampling",
    title: "The sampling factory",
    tier: "P0",
    journey: "sampling",
    question: "Why does the distribution of sample means become normal?",
    description:
      "Pick a population shape, set n and the number of draws, then step or play the conveyor. Three separately labelled panels show the population, one sample, and the accumulating sampling distribution.",
    controls: ["Population shape", "n per sample", "Draws", "Seed", "Play / pause / step / skip", "Speed"],
    math: "x̄ = Σxᵢ/n; E(x̄)=μ; SE=σ/√n (finite variance, independent draws)",
    provenance:
      "Seeded synthetic draws from a stated generator (normal, uniform or exponential). The generating parameters are printed, not hidden.",
    sections: [11, 12, 17],
    duration: "8–10 min",
  },
  {
    slug: "confidence",
    title: "SD vs SE & confidence-interval rain",
    tier: "P0",
    journey: "sampling",
    question: "What exactly is 95% confident about?",
    description:
      "Build one interval from a sample, then switch to repeated coverage. Hundreds of seeded intervals appear against a fixed μ; the counter reports how many actually covered it. The observed rate is never forced to 95%.",
    controls: ["n", "confidence level", "sample mean", "s or σ mode", "Known vs estimated σ", "Redraw coverage"],
    math: "estimate ± critical × SE; SE=σ/√n; t critical for estimated σ",
    provenance:
      "Single-interval inputs are user supplied. Coverage uses seeded synthetic normal samples; the true μ is fixed and shown.",
    sections: [13, 14],
    duration: "7–10 min",
  },
  {
    slug: "p-value",
    title: "The p-value observatory",
    tier: "P0",
    journey: "hypothesis",
    question: "If H₀ were true, how unusual is this result?",
    description:
      "Move an observed statistic along a null distribution, choose one- or two-sided, and watch the tail area fill. α is drawn as a separate gate so the p-value region and the rejection region never collapse into one picture.",
    controls: ["Test statistic", "One/two-sided", "α", "Sample input mode", "Null distribution"],
    math: "two-sided p=2(1−Φ(|z|)); one-sided p=1−Φ(z) or Φ(z); reject iff p≤α",
    provenance:
      "Model-based normal null distribution. Sample-input mode computes z from user-entered mean, null mean, s and n; it does not claim a real experiment.",
    sections: [15, 18, 19, 20, 21],
    duration: "8–10 min",
  },
  {
    slug: "correlation",
    title: "Correlation detective",
    tier: "P0",
    journey: "relationships",
    question: "What is r hiding?",
    description:
      "Switch between linear, curved, clustered and outlier-driven datasets. Reveal the third variable, colour by group, and compare the pooled r with the within-group r and the regression slope.",
    controls: ["Dataset presets", "Show groups", "Reveal confounder", "Show regression", "Add/remove point", "X/Y units"],
    math: "r = Σ(xᵢ−x̄)(yᵢ−ȳ)/√(Σ(xᵢ−x̄)²Σ(yᵢ−ȳ)²); slope = r·sᵧ/sₓ",
    provenance: "Fixed synthetic datasets generated for teaching and stored in the repository; r and slope are computed, never hard-coded.",
    sections: [30, 31, 33, 35],
    duration: "8–10 min",
  },
  {
    slug: "errors",
    title: "Type I, Type II & power",
    tier: "P1",
    journey: "hypothesis",
    question: "What does α actually trade against?",
    description:
      "Two sampling distributions under H₀ and a specified H₁, with α, effect size and n. The rejection region, β and power are separate, correctly labelled areas.",
    controls: ["α", "Effect size", "n", "σ", "Sidedness", "Show β / power"],
    math: "power = Φ(ncp−z_crit)+Φ(−ncp−z_crit); β=1−power; ncp=(δ/σ)√n",
    provenance: "Model-based normal distributions; the alternative is a stated, not inferred, effect.",
    sections: [22],
    duration: "7–9 min",
  },
  {
    slug: "business-decision",
    title: "The business decision room",
    tier: "P1",
    journey: "synthesis",
    question: "Is the lift statistically detectable, and is it worth shipping?",
    description:
      "A synthetic checkout A/B test with independent proportions. Change counts and traffic, then compare absolute lift, relative lift, the confidence interval, the test and the business threshold.",
    controls: ["Visitors per arm", "Conversions per arm", "Confidence", "Minimum meaningful effect", "Implementation cost", "Traffic"],
    math: "pooled two-proportion z test; unpooled CI for p_B−p_A; absolute vs relative lift",
    provenance:
      "Synthetic scenario. Denominators and conversions are explicit inputs; no live traffic or revenue is implied.",
    sections: [40, 23],
    duration: "8–12 min",
  },
  {
    slug: "probability",
    title: "Probability space lab",
    tier: "P1",
    journey: "probability",
    question: "What is the difference between independent and mutually exclusive?",
    description:
      "Choose a coin, one die or two dice; select events A and B; read the sample-space cells. Complements, intersections, unions and conditionals are computed from the same space.",
    controls: ["Scenario", "Event A", "Event B", "View: cells / table", "P(A|B) reveal"],
    math: "P(Aᶜ)=1−P(A); P(A∩B); P(A∪B); P(A|B)=P(A∩B)/P(B)",
    provenance: "Exact enumeration of a fair coin/die sample space; no simulation error.",
    sections: [6],
    duration: "6–8 min",
  },
  {
    slug: "distributions",
    title: "Distribution morph studio",
    tier: "SIGNATURE",
    journey: "probability",
    question: "Why is a PMF bar not a PDF curve?",
    description:
      "Switch between defined discrete and continuous distributions. The units, support and event query change with the family; the interface never morphs a density into a mass.",
    controls: ["Family: binomial / Poisson / normal", "Parameters", "Exact vs interval query", "CDF toggle"],
    math: "PMF sums to 1; PDF integrates to 1; P(X=x)=0 for continuous X",
    provenance: "Closed-form distributions; every plotted value is computed from the parameters.",
    sections: [7],
    duration: "6–8 min",
  },
  {
    slug: "dot-to-decision",
    title: "From dot to decision",
    tier: "SIGNATURE",
    journey: "sampling",
    question: "Can one dataset carry the whole statistical story?",
    description:
      "A guided six-stage narrative over one fixed dataset: describe it, draw samples, see uncertainty, build an interval, test a claim and make a qualified decision. The same observations stay on screen; each stage adds a layer rather than replacing the data.",
    controls: ["Stage stepper", "Sample size", "Number of resamples", "Confidence", "Claim to test", "Reset"],
    math: "Summary statistics → sampling distribution → SE → CI → test statistic → decision",
    provenance:
      "A fixed synthetic dataset of 40 session durations, printed in full with a seed. It is illustrative, not measured from a real product.",
    sections: [1, 11, 14, 19, 41],
    duration: "10–12 min",
  },
  {
    slug: "experiments",
    title: "Assignment shuffle & comparable groups",
    tier: "P1",
    journey: "experiments",
    question: "Does randomization make the groups identical?",
    description:
      "Shuffle participants with one covariate, watch balance move run to run, and compare random assignment with assignment by a covariate. Balance is a distribution, not a guarantee.",
    controls: ["Participants", "Covariate spread", "Seed", "Reshuffle", "Assign by covariate"],
    math: "Random assignment balances covariates in expectation; finite samples vary",
    provenance: "Seeded synthetic participants with an explicit age covariate; no real people.",
    sections: [25, 26],
    duration: "6–8 min",
  },
  {
    slug: "practical-significance",
    title: "Impact vs evidence",
    tier: "P1",
    journey: "hypothesis",
    question: "How can a result be precise and still not matter?",
    description:
      "Two panels share the same effect: one shows the confidence interval and p-value, the other shows the business threshold and cost. Shrink the effect while growing n and watch significance survive after relevance disappears.",
    controls: ["Effect size", "n", "Uncertainty", "Meaningful threshold", "Cost"],
    math: "p-value depends on effect/SE; practical relevance compares the interval with a decision threshold",
    provenance: "Illustrative model with explicit inputs. Currency values are user-entered, not claims about a real business.",
    sections: [23],
    duration: "5–7 min",
  },
] as const;

export const LAB_BY_SLUG = new Map(LABS.map((lab) => [lab.slug, lab]));

export function labHref(slug: string): string {
  return `/learn/statistics/labs/${slug}`;
}

// ---------------------------------------------------------------------------
// Formula index
// ---------------------------------------------------------------------------

export interface FormulaEntry {
  id: string;
  group: string;
  title: string;
  tex: string;
  alt: string;
  plain: string;
  section: number;
  origin: "source" | "extension";
  note: string;
}

export const FORMULAS: readonly FormulaEntry[] = [
  {
    id: "mean",
    group: "Describing data",
    title: "Sample mean",
    tex: "\\bar{x} = \\frac{\\sum_{i=1}^{n} x_i}{n}",
    alt: "x-bar equals the sum of x sub i from i equals one to n, divided by n.",
    plain: "x̄ = Σxᵢ / n",
    section: 4,
    origin: "source",
    note: "The balancing point of the values. Sensitive to outliers.",
  },
  {
    id: "sample-variance",
    group: "Describing data",
    title: "Sample variance",
    tex: "s^2 = \\frac{\\sum (x_i-\\bar{x})^2}{n-1}",
    alt: "s squared equals the sum of squared deviations from x-bar, divided by n minus one.",
    plain: "s² = Σ(xᵢ − x̄)² / (n − 1)",
    section: 5,
    origin: "source",
    note: "n−1 corrects the downward bias of squared deviations around the sample mean. Units are squared.",
  },
  {
    id: "population-variance",
    group: "Describing data",
    title: "Population variance",
    tex: "\\sigma^2 = \\frac{\\sum (x_i-\\mu)^2}{N}",
    alt: "sigma squared equals the sum of squared deviations from mu, divided by capital N.",
    plain: "σ² = Σ(xᵢ − μ)² / N",
    section: 5,
    origin: "source",
    note: "Divides by N because the parameter describes the whole population, not an estimate from a sample.",
  },
  {
    id: "sd",
    group: "Describing data",
    title: "Standard deviation",
    tex: "\\operatorname{SD} = \\sqrt{\\operatorname{Variance}}",
    alt: "Standard deviation is the square root of the variance.",
    plain: "SD = √Variance",
    section: 5,
    origin: "source",
    note: "Returns to the original units. Population and sample SD use their matching variances.",
  },
  {
    id: "iqr",
    group: "Describing data",
    title: "Interquartile range",
    tex: "\\operatorname{IQR} = Q_3 - Q_1",
    alt: "IQR equals the third quartile minus the first quartile.",
    plain: "IQR = Q₃ − Q₁",
    section: 5,
    origin: "source",
    note: "The middle 50% of the data; resistant to outliers. Quartile convention matters and is stated in the lab.",
  },
  {
    id: "complement",
    group: "Probability",
    title: "Complement rule",
    tex: "P(A^c) = 1 - P(A)",
    alt: "The probability of A complement equals one minus the probability of A.",
    plain: "P(Aᶜ) = 1 − P(A)",
    section: 6,
    origin: "source",
    note: "Holds for every event in a valid probability space.",
  },
  {
    id: "independence",
    group: "Probability",
    title: "Independence",
    tex: "P(A \\cap B) = P(A)P(B)",
    alt: "A and B are independent exactly when the probability of both equals the product of their probabilities.",
    plain: "P(A ∩ B) = P(A)·P(B)  (if independent)",
    section: 6,
    origin: "source",
    note: "A definition, not a universal rule. It fails for dependent events.",
  },
  {
    id: "conditional",
    group: "Probability",
    title: "Conditional probability",
    tex: "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}",
    alt: "The probability of A given B equals the probability of A and B divided by the probability of B.",
    plain: "P(A | B) = P(A ∩ B) / P(B)",
    section: 6,
    origin: "source",
    note: "Requires P(B) > 0; it re-scales the sample space to B.",
  },
  {
    id: "binomial-pmf",
    group: "Distributions",
    title: "Binomial PMF",
    tex: "P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}",
    alt: "The probability of exactly k successes in n trials is n choose k times p to the k times one minus p to the n minus k.",
    plain: "P(X=k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ",
    section: 8,
    origin: "source",
    note: "Requires fixed n, independent trials, constant p, and exactly two outcomes per trial.",
  },
  {
    id: "binomial-moments",
    group: "Distributions",
    title: "Binomial mean and variance",
    tex: "E(X)=np,\\quad \\operatorname{Var}(X)=np(1-p)",
    alt: "The expected number of successes is n p and its variance is n p times one minus p.",
    plain: "E(X)=np, Var(X)=np(1−p)",
    section: 8,
    origin: "source",
    note: "The variance is largest at p=0.5 for fixed n.",
  },
  {
    id: "normal-pdf",
    group: "Distributions",
    title: "Normal density",
    tex: "f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}",
    alt: "The normal density at x is one over sigma root two pi, times e to the negative x minus mu squared over two sigma squared.",
    plain: "f(x) = 1/(σ√(2π)) · e^(−(x−μ)²/(2σ²))",
    section: 9,
    origin: "source",
    note: "A density, not a probability. Probability is the area under this curve.",
  },
  {
    id: "z-score",
    group: "Distributions",
    title: "Z-score",
    tex: "z = \\frac{x-\\mu}{\\sigma}",
    alt: "z equals x minus mu, divided by sigma.",
    plain: "z = (x − μ) / σ",
    section: 9,
    origin: "source",
    note: "Signed distance from the mean in standard deviations; σ must be positive.",
  },
  {
    id: "poisson-pmf",
    group: "Distributions",
    title: "Poisson PMF",
    tex: "P(X=k)=\\frac{e^{-\\lambda}\\lambda^k}{k!}",
    alt: "The probability of k events is e to the negative lambda times lambda to the k, divided by k factorial.",
    plain: "P(X=k) = e^(−λ) λᵏ / k!",
    section: 10,
    origin: "source",
    note: "λ is the mean count per stated interval; k is a non-negative integer.",
  },
  {
    id: "poisson-moments",
    group: "Distributions",
    title: "Poisson mean, variance and SD",
    tex: "E(X)=\\operatorname{Var}(X)=\\lambda,\\quad \\operatorname{SD}(X)=\\sqrt{\\lambda}",
    alt: "The mean and variance are both lambda, and the standard deviation is the square root of lambda.",
    plain: "E(X)=Var(X)=λ, SD(X)=√λ",
    section: 10,
    origin: "source",
    note: "Mean equals variance is a property of the Poisson model, not of every count dataset.",
  },
  {
    id: "clt-mean",
    group: "Sampling",
    title: "Mean of the sampling distribution",
    tex: "E(\\bar{X}) = \\mu",
    alt: "The expected value of the sample mean is the population mean mu.",
    plain: "E(X̄) = μ",
    section: 11,
    origin: "source",
    note: "Holds for simple random sampling with finite mean; it is not a claim that every sample mean equals μ.",
  },
  {
    id: "se-mean",
    group: "Sampling",
    title: "Standard error of the mean",
    tex: "\\operatorname{SE}_{\\bar{X}}=\\frac{\\sigma}{\\sqrt{n}}",
    alt: "The standard error of the sample mean equals sigma divided by the square root of n.",
    plain: "SE(X̄) = σ/√n",
    section: 13,
    origin: "source",
    note: "σ known. With estimated σ, use s/√n and a t critical value when appropriate.",
  },
  {
    id: "se-estimated",
    group: "Sampling",
    title: "Estimated standard error",
    tex: "\\operatorname{SE}_{\\bar{X}} \\approx \\frac{s}{\\sqrt{n}}",
    alt: "The estimated standard error of the mean is approximately s divided by the square root of n.",
    plain: "SE(X̄) ≈ s/√n",
    section: 13,
    origin: "source",
    note: "Estimation adds uncertainty; the t distribution accounts for it under normality.",
  },
  {
    id: "ci",
    group: "Estimation",
    title: "Confidence interval",
    tex: "\\text{CI} = \\text{Estimate} \\pm \\text{Critical Value}\\times\\text{SE}",
    alt: "A confidence interval is the estimate plus or minus a critical value times the standard error.",
    plain: "CI = estimate ± critical value × SE",
    section: 14,
    origin: "source",
    note: "The interpretation is about the procedure's long-run coverage, not a probability for a fixed parameter.",
  },
  {
    id: "test-statistic",
    group: "Inference",
    title: "Test statistic",
    tex: "\\text{Test Statistic}=\\frac{\\text{Observed}-\\text{Hypothesized}}{\\text{SE}}",
    alt: "The test statistic is the observed value minus the hypothesized value, divided by the standard error.",
    plain: "test statistic = (observed − hypothesized) / SE",
    section: 18,
    origin: "source",
    note: "The null distribution and sidedness determine how this number becomes a p-value.",
  },
  {
    id: "p-value",
    group: "Inference",
    title: "p-value",
    tex: "p\\text{-value}=P(\\text{result at least as extreme as observed}\\mid H_0\\text{ is true})",
    alt: "The p-value is the probability of a result at least as extreme as the observed one, given that the null hypothesis is true.",
    plain: "p = P(result at least as extreme | H₀ true)",
    section: 19,
    origin: "source",
    note: "It is not P(H₀ true), not an overlap of two curves, and it depends on the test and sidedness.",
  },
  {
    id: "decision",
    group: "Inference",
    title: "Decision rule",
    tex: "p \\le \\alpha \\Rightarrow \\text{Reject } H_0,\\quad p > \\alpha \\Rightarrow \\text{Fail to Reject } H_0",
    alt: "Reject the null when p is less than or equal to alpha; fail to reject it when p is greater than alpha.",
    plain: "p ≤ α → reject H₀; p > α → fail to reject H₀",
    section: 21,
    origin: "source",
    note: "α is fixed before the data. “Fail to reject” is not “accept”.",
  },
  {
    id: "regression",
    group: "Relationships",
    title: "Simple linear regression",
    tex: "Y=\\beta_0+\\beta_1X",
    alt: "Y equals beta zero plus beta one times X.",
    plain: "Y = β₀ + β₁X",
    section: 35,
    origin: "source",
    note: "β₁ is the expected change in Y per one-unit increase in X, in the units of the data.",
  },
  {
    id: "pearson",
    group: "Relationships",
    title: "Pearson correlation (extension)",
    tex: "r=\\frac{\\sum (x_i-\\bar{x})(y_i-\\bar{y})}{\\sqrt{\\sum (x_i-\\bar{x})^2\\sum (y_i-\\bar{y})^2}}",
    alt: "r equals the sum of products of deviations, divided by the square root of the product of the sums of squares.",
    plain: "r = Σ(xᵢ−x̄)(yᵢ−ȳ) / √(Σ(xᵢ−x̄)²·Σ(yᵢ−ȳ)²)",
    section: 30,
    origin: "extension",
    note: "Supplemental definition, not present in the export. Standard sample Pearson r; measures linear association only.",
  },
  {
    id: "slope-r",
    group: "Relationships",
    title: "Slope and correlation (extension)",
    tex: "\\hat{\\beta}_1 = r\\,\\frac{s_y}{s_x}",
    alt: "The fitted slope equals r times the standard deviation of y divided by the standard deviation of x.",
    plain: "β̂₁ = r · sᵧ / sₓ",
    section: 35,
    origin: "extension",
    note: "Shows why r carries no units while the slope does. Supplemental.",
  },
] as const;

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export interface GlossaryEntry {
  term: string;
  arabic: string;
  definition: string;
  section: number;
  lab?: string;
  synonyms?: string[];
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  { term: "Population", arabic: "المجتمع", definition: "The complete set of units a question is about. Its summary is a parameter.", section: 1 },
  { term: "Sample", arabic: "العينة", definition: "A subset of the population that is actually observed. Its summary is a statistic.", section: 1 },
  { term: "Parameter", arabic: "المعلمة", definition: "A fixed, usually unknown population quantity such as μ or σ.", section: 1 },
  { term: "Statistic", arabic: "الإحصائية", definition: "A quantity computed from sample data, such as x̄ or s; it varies from sample to sample.", section: 1 },
  { term: "Descriptive statistics", arabic: "الإحصاء الوصفي", definition: "Summaries of the observed data, with no claim beyond those observations.", section: 3 },
  { term: "Inferential statistics", arabic: "الإحصاء الاستدلالي", definition: "Generalising from a sample to a population using a model and quantified uncertainty.", section: 3 },
  { term: "Mean", arabic: "المتوسط", definition: "The sum of values divided by n. Sensitive to outliers.", section: 4, lab: "center-spread" },
  { term: "Median", arabic: "الوسيط", definition: "The middle value after sorting; resistant to outliers.", section: 4, lab: "center-spread" },
  { term: "Mode", arabic: "المنوال", definition: "The most frequent value; there may be several modes or none.", section: 4, lab: "center-spread" },
  { term: "Standard deviation", arabic: "الانحراف المعياري", definition: "The square root of variance, in the original units; spread of individual values.", section: 5, lab: "center-spread" },
  { term: "IQR", arabic: "المدى الربيعي", definition: "Q₃ − Q₁, the range of the middle 50% of the data; resistant to outliers.", section: 5, lab: "center-spread" },
  { term: "Outlier", arabic: "القيمة المتطرفة", definition: "A value unusually far from the bulk of the data; in a box plot, beyond 1.5×IQR fences.", section: 5, lab: "center-spread" },
  { term: "Complement", arabic: "المتممة", definition: "The event that A does not occur: P(Aᶜ)=1−P(A).", section: 6, lab: "probability" },
  { term: "Conditional probability", arabic: "الاحتمال الشرطي", definition: "P(A|B), the probability of A after restricting the sample space to B.", section: 6, lab: "probability" },
  { term: "Independence", arabic: "الاستقلال", definition: "Knowing one event occurred does not change the probability of the other: P(A∩B)=P(A)P(B).", section: 6, lab: "probability" },
  { term: "Mutually exclusive", arabic: "متنافيان", definition: "Events that cannot occur together, so P(A∩B)=0. Not the same as independent.", section: 6, lab: "probability" },
  { term: "PMF", arabic: "دالة الكتلة الاحتمالية", definition: "A discrete probability mass function: each value has a probability, and the masses sum to 1.", section: 7, lab: "distributions" },
  { term: "PDF", arabic: "دالة الكثافة الاحتمالية", definition: "A continuous density: probability is area under the curve, and a single point has probability zero.", section: 7, lab: "distributions" },
  { term: "Binomial distribution", arabic: "التوزيع ذو الحدين", definition: "The count of successes in n independent trials with constant success probability p.", section: 8, lab: "binomial" },
  { term: "Normal distribution", arabic: "التوزيع الطبيعي", definition: "A symmetric continuous bell curve defined by μ and σ, with total area 1.", section: 9, lab: "normal" },
  { term: "Z-score", arabic: "الدرجة المعيارية", definition: "z=(x−μ)/σ, the signed number of standard deviations from the mean.", section: 9, lab: "normal" },
  { term: "Empirical rule", arabic: "القاعدة التجريبية", definition: "For a roughly normal distribution, about 68%, 95% and 99.7% of values lie within 1, 2 and 3 SD of the mean.", section: 9, lab: "normal" },
  { term: "Poisson distribution", arabic: "توزيع بواسون", definition: "A count distribution for events in a fixed interval with mean λ; mean equals variance.", section: 10, lab: "poisson" },
  { term: "Lambda (λ)", arabic: "لامبدا", definition: "The Poisson mean count per stated interval — a rate, not a probability.", section: 10, lab: "poisson" },
  { term: "Central limit theorem", arabic: "نظرية الحد المركزي", definition: "Under suitable conditions, the sampling distribution of the mean approaches normality as n grows.", section: 11, lab: "sampling" },
  { term: "Sampling distribution", arabic: "توزيع المعاينة", definition: "The distribution of a statistic over repeated samples of the same size from the same population.", section: 12, lab: "sampling" },
  { term: "Standard error", arabic: "الخطأ المعياري", definition: "The standard deviation of a statistic's sampling distribution; for the mean, σ/√n.", section: 13, lab: "confidence" },
  { term: "Confidence interval", arabic: "فترة الثقة", definition: "An interval produced by a procedure with a stated long-run coverage rate.", section: 14, lab: "confidence" },
  { term: "Coverage", arabic: "التغطية", definition: "The long-run proportion of intervals from a procedure that contain the fixed parameter.", section: 14, lab: "confidence" },
  { term: "Null hypothesis", arabic: "الفرضية الصفرية", definition: "The model of no difference or no effect used to derive the null sampling distribution.", section: 15, lab: "p-value" },
  { term: "Alternative hypothesis", arabic: "الفرضية البديلة", definition: "The claim being assessed; its direction determines what counts as more extreme.", section: 15, lab: "p-value" },
  { term: "Test statistic", arabic: "إحصائية الاختبار", definition: "A standardized distance between the observed result and the value expected under H₀.", section: 18, lab: "p-value" },
  { term: "p-value", arabic: "القيمة الاحتمالية", definition: "P(statistic at least as extreme as observed | H₀ true). Not P(H₀ true).", section: 19, lab: "p-value" },
  { term: "Alpha (α)", arabic: "مستوى الدلالة", definition: "The pre-declared Type I error threshold; reject H₀ when p≤α.", section: 20, lab: "p-value" },
  { term: "Type I error", arabic: "خطأ النوع الأول", definition: "Rejecting a true H₀ — a false positive, with rate α under the null.", section: 22, lab: "errors" },
  { term: "Type II error", arabic: "خطأ النوع الثاني", definition: "Failing to reject a false H₀ — a false negative, with rate β under a specified alternative.", section: 22, lab: "errors" },
  { term: "Power", arabic: "القدرة", definition: "1−β: the probability of rejecting H₀ when a specified alternative is true.", section: 22, lab: "errors" },
  { term: "Practical significance", arabic: "الدلالة العملية", definition: "Whether an effect is large enough to matter in context, independent of statistical detectability.", section: 23, lab: "practical-significance" },
  { term: "Randomization", arabic: "التوزيع العشوائي", definition: "Assigning units to conditions by a random mechanism so groups balance in expectation.", section: 26, lab: "experiments" },
  { term: "Blinding", arabic: "التعمية", definition: "Withholding treatment assignment from participants and/or assessors to reduce expectation effects.", section: 27 },
  { term: "RCT", arabic: "التجربة العشوائية المضبوطة", definition: "A controlled experiment that assigns units randomly to treatment conditions.", section: 28 },
  { term: "A/B test", arabic: "اختبار A/B", definition: "A two-arm randomized experiment comparing a control (A) with a treatment (B).", section: 28, lab: "business-decision" },
  { term: "Confounder", arabic: "المتغير المربك", definition: "A third variable that affects both X and Y and can create or distort an observed association.", section: 33, lab: "correlation" },
  { term: "Pearson r", arabic: "بيرسون", definition: "A unitless measure of the direction and strength of linear association, in [−1,1].", section: 30, lab: "correlation" },
  { term: "Regression slope", arabic: "ميل الانحدار", definition: "The expected change in Y per one-unit increase in X, in the units of the data.", section: 35, lab: "correlation" },
  { term: "Absolute lift", arabic: "الفرق المطلق", definition: "p_B−p_A in percentage points; the raw difference between two rates.", section: 40, lab: "business-decision" },
  { term: "Relative lift", arabic: "التحسن النسبي", definition: "(p_B−p_A)/p_A; the difference as a proportion of the baseline rate.", section: 40, lab: "business-decision" },
];

// ---------------------------------------------------------------------------
// Myths
// ---------------------------------------------------------------------------

export interface Myth {
  id: string;
  claim: string;
  verdict: string;
  evidence: string;
  correction: string;
  section: number;
  lab?: string;
}

export const MYTHS: readonly Myth[] = [
  {
    id: "mean-best",
    claim: "The mean is always the best measure of centre.",
    verdict: "False",
    evidence:
      "In [2,4,4,4,5,5,7,100] the mean jumps above 16 while the median stays at 4.5. One value changes the typical picture.",
    correction: "Use the median when the distribution is skewed or outliers matter to the question.",
    section: 4,
    lab: "center-spread",
  },
  {
    id: "sd-se",
    claim: "Standard deviation and standard error are the same thing.",
    verdict: "False",
    evidence:
      "The SD describes individual values and stays roughly fixed as n grows; SE=σ/√n shrinks because it describes the sample mean.",
    correction: "SD = spread of observations; SE = spread of a statistic across repeated samples.",
    section: 13,
    lab: "confidence",
  },
  {
    id: "p-h0",
    claim: "A p-value is the probability that H₀ is true.",
    verdict: "False",
    evidence:
      "The p-value is computed *assuming* H₀. It is P(data at least this extreme | H₀), not P(H₀ | data).",
    correction: "Read it as a compatibility check with the null model, never as the posterior probability of the null.",
    section: 19,
    lab: "p-value",
  },
  {
    id: "overlap",
    claim: "The p-value is the overlap between the null and alternative distributions.",
    verdict: "False",
    evidence:
      "Overlap involves both distributions; the p-value uses only the null sampling distribution and the observed statistic's tail.",
    correction: "Shade the equally-or-more-extreme region under H₀; do not shade the alternative.",
    section: 19,
    lab: "p-value",
  },
  {
    id: "accept",
    claim: "If p > α, we accept H₀.",
    verdict: "False",
    evidence:
      "A non-significant result means the data are compatible with H₀ at this threshold; it does not establish that H₀ is exactly true.",
    correction: "Say “fail to reject H₀” and describe the uncertainty and the alternative explanations.",
    section: 21,
    lab: "p-value",
  },
  {
    id: "alpha-after",
    claim: "You can choose α after seeing the p-value.",
    verdict: "False",
    evidence:
      "Choosing the threshold after the result changes the rule and inflates the false-positive rate. α is part of the design, fixed before analysis.",
    correction: "Declare α, the test and the sidedness before looking at the data.",
    section: 20,
    lab: "p-value",
  },
  {
    id: "sig-important",
    claim: "Statistically significant means practically important.",
    verdict: "False",
    evidence:
      "With a large enough n, a 0.01-percentage-point difference can produce p<0.05 while being commercially irrelevant.",
    correction: "Report the effect size and its interval against a pre-specified meaningful threshold.",
    section: 23,
    lab: "practical-significance",
  },
  {
    id: "r-zero",
    claim: "r ≈ 0 means X and Y are unrelated.",
    verdict: "False",
    evidence:
      "A symmetric U-shape has strong dependence but r near 0, because positive and negative linear contributions cancel.",
    correction: "Look at the scatterplot; r measures linear association only.",
    section: 31,
    lab: "correlation",
  },
  {
    id: "r-causes",
    claim: "A strong correlation proves causation.",
    verdict: "False",
    evidence:
      "Ice-cream sales and drowning correlate because both follow temperature. A third variable can create the association without either causing the other.",
    correction: "Causal claims need design — random assignment, control, or another credible identification strategy.",
    section: 32,
    lab: "correlation",
  },
  {
    id: "r-slope",
    claim: "r=0.8 means Y increases by 0.8 units when X increases by one unit.",
    verdict: "False",
    evidence:
      "r is unitless and bounded by ±1; the slope is r·sᵧ/sₓ and changes when the units of X or Y change.",
    correction: "Report the slope with units separately from r.",
    section: 35,
    lab: "correlation",
  },
  {
    id: "random-identical",
    claim: "Randomization makes the two groups identical.",
    verdict: "False",
    evidence:
      "Randomization balances covariates in expectation. A particular shuffle can still put more older participants in one arm.",
    correction: "Check baseline balance and pre-specify adjustments; report the assignment mechanism.",
    section: 26,
    lab: "experiments",
  },
  {
    id: "ci-probability",
    claim: "There is a 95% probability that this computed interval contains μ.",
    verdict: "False (frequentist reading)",
    evidence:
      "μ is fixed. The procedure covers μ in about 95% of repeated samples; this particular interval either covers it or does not.",
    correction: "Say “95% of intervals built this way would cover μ” and state the assumptions.",
    section: 14,
    lab: "confidence",
  },
];

// ---------------------------------------------------------------------------
// Decision navigator
// ---------------------------------------------------------------------------

export interface DecisionOption {
  label: string;
  next: string;
}

export interface DecisionNode {
  id: string;
  question: string;
  help?: string;
  options: DecisionOption[];
}

export interface DecisionResult {
  id: string;
  title: string;
  tool: string;
  why: string;
  assumptions: string[];
  avoid: string[];
  section: number;
  lab?: string;
}

export const DECISION_NODES: readonly DecisionNode[] = [
  {
    id: "goal",
    question: "What is the job in front of you?",
    help: "Choose the evidential target, not the chart or test name.",
    options: [
      { label: "Describe the data I have", next: "describe" },
      { label: "Quantify uncertainty around an estimate", next: "uncertainty" },
      { label: "Test a claim about a population", next: "claim" },
      { label: "Measure an association between two variables", next: "association" },
      { label: "Compare treatments causally", next: "causal" },
    ],
  },
  {
    id: "describe",
    question: "What are you describing?",
    options: [
      { label: "Centre / typical value", next: "result:center" },
      { label: "Spread / consistency", next: "result:spread" },
      { label: "Count or proportion in categories", next: "result:composition" },
    ],
  },
  {
    id: "uncertainty",
    question: "What quantity needs an interval?",
    options: [
      { label: "A mean", next: "result:ci-mean" },
      { label: "A proportion / conversion rate", next: "result:ci-prop" },
      { label: "A difference between two means", next: "result:ci-diff" },
    ],
  },
  {
    id: "claim",
    question: "What kind of outcome is being counted?",
    options: [
      { label: "Successes out of fixed trials", next: "result:binomial" },
      { label: "Events in a fixed time/space interval", next: "result:poisson" },
      { label: "A continuous mean compared with a value", next: "result:ztest" },
      { label: "Two independent proportions", next: "result:prop-test" },
    ],
  },
  {
    id: "association",
    question: "What kind of association are you testing?",
    options: [
      { label: "Linear association between two numeric variables", next: "result:correlation" },
      { label: "A possible non-linear pattern", next: "result:nonlinear" },
      { label: "A third variable may explain the association", next: "result:confounding" },
      { label: "Predict Y from X with a line", next: "result:regression" },
    ],
  },
  {
    id: "causal",
    question: "Can you randomly assign the treatment?",
    options: [
      { label: "Yes — I can run a randomized experiment", next: "result:rct" },
      { label: "No — only observe existing groups", next: "result:observational" },
    ],
  },
];

export const DECISION_RESULTS: readonly DecisionResult[] = [
  {
    id: "center",
    title: "Summarise the centre",
    tool: "Mean, median and mode together",
    why: "The mean uses every value; the median resists tail values; the mode describes repetition. Report at least two when the shape is not symmetric.",
    assumptions: ["The values are numerical and commensurable.", "The observation unit is clear."],
    avoid: ["Reporting the mean alone for a skewed distribution.", "Calling a numeric ID a measurement."],
    section: 4,
    lab: "center-spread",
  },
  {
    id: "spread",
    title: "Summarise the spread",
    tool: "SD (symmetric) or IQR (skewed / outliers)",
    why: "SD is in the original units and pairs with the mean; IQR describes the middle 50% and pairs with the median.",
    assumptions: ["Units are stated.", "Sample vs population denominator is explicit."],
    avoid: ["Comparing SDs across different units without comment.", "Calling SE the spread of the data."],
    section: 5,
    lab: "center-spread",
  },
  {
    id: "composition",
    title: "Describe a categorical composition",
    tool: "Counts and proportions with a visible denominator",
    why: "Part-to-whole claims need the total. Percentages without denominators cannot be audited.",
    assumptions: ["Categories are mutually exclusive and exhaustive for the question."],
    avoid: ["A pie/donut when there are many close categories.", "Ordering nominal categories as if they were ranks."],
    section: 2,
  },
  {
    id: "ci-mean",
    title: "Interval for a mean",
    tool: "One-sample t interval (or z when σ is known)",
    why: "The interval is estimate ± critical × SE. Use t when σ is estimated and the sampling distribution is approximately normal.",
    assumptions: ["Independent observations.", "Approximately normal sampling distribution, or large enough n by CLT.", "σ known only if genuinely known."],
    avoid: ["Saying the interval has a 95% probability of containing a fixed μ.", "Ignoring clustering or repeated measures."],
    section: 14,
    lab: "confidence",
  },
  {
    id: "ci-prop",
    title: "Interval for a proportion",
    tool: "Wilson score interval",
    why: "The Wilson interval behaves at 0% and 100%, where the Wald interval collapses or escapes [0,1].",
    assumptions: ["Independent trials.", "A binary outcome with a clear denominator.", "Enough events for the chosen method."],
    avoid: ["Wald intervals with tiny counts.", "Treating visitors as independent when one user contributes many sessions."],
    section: 40,
    lab: "business-decision",
  },
  {
    id: "ci-diff",
    title: "Interval for a difference in means",
    tool: "Two-sample t interval (Welch unless equal variances are justified)",
    why: "The estimate is the difference; the SE combines both groups' uncertainty.",
    assumptions: ["Independent groups.", "Approximate normality or adequate n.", "Correct assignment unit."],
    avoid: ["Reading non-overlapping CIs as a test of the difference.", "Pooling variances without justification."],
    section: 18,
  },
  {
    id: "binomial",
    title: "Counts of successes in fixed trials",
    tool: "Binomial model",
    why: "The support is 0…n, the parameters are n and p, and the PMF counts exactly k successes.",
    assumptions: ["Fixed n.", "Independent trials.", "Constant p.", "Two outcomes per trial."],
    avoid: ["Using it when n is not fixed in advance.", "Treating a Poisson count as a binomial proportion."],
    section: 8,
    lab: "binomial",
  },
  {
    id: "poisson",
    title: "Events in a fixed interval",
    tool: "Poisson model",
    why: "The support is non-negative counts; λ is the mean count per stated interval and equals the variance.",
    assumptions: ["A fixed exposure interval.", "Events independent in non-overlapping intervals.", "Constant rate within the interval."],
    avoid: ["Comparing λ across different interval lengths without converting.", "Using Poisson for a bounded count of fixed trials."],
    section: 10,
    lab: "poisson",
  },
  {
    id: "ztest",
    title: "Test a mean against a value",
    tool: "One-sample z or t test",
    why: "The test statistic is (x̄−μ₀)/SE; the p-value is the tail area of the null distribution.",
    assumptions: ["Independent observations.", "Correct sidedness declared in advance.", "Normality/CLT condition for the mean."],
    avoid: ["Using z when σ is estimated and n is small.", "Reporting p without the effect and interval."],
    section: 19,
    lab: "p-value",
  },
  {
    id: "prop-test",
    title: "Compare two independent proportions",
    tool: "Two-proportion z test + unpooled CI",
    why: "Conversions are proportions with denominators. The pooled SE tests H₀: pA=pB; the unpooled SE builds the interval for the difference.",
    assumptions: ["Independent observations and arms.", "Random assignment or comparable groups.", "Expected counts adequate for the normal approximation."],
    avoid: ["Using a means test on 0/1 data without recognising the proportion structure.", "Ignoring the assignment unit."],
    section: 40,
    lab: "business-decision",
  },
  {
    id: "correlation",
    title: "Linear association",
    tool: "Pearson r with a scatterplot",
    why: "r reports direction and linear strength on a unitless [−1,1] scale; the scatterplot reveals curves, clusters and outliers.",
    assumptions: ["Two numeric variables.", "Linear association is meaningful.", "No unexamined subgroup structure."],
    avoid: ["Treating r as a slope.", "Causal language from an observational r."],
    section: 30,
    lab: "correlation",
  },
  {
    id: "nonlinear",
    title: "Possible non-linear association",
    tool: "Scatterplot + non-linear summary or model",
    why: "Pearson r can be near zero under a strong U-shape or cycle. The picture comes before the coefficient.",
    assumptions: ["The shape is identified, not assumed.", "The chosen summary matches the pattern."],
    avoid: ["Concluding independence from r≈0.", "Fitting a line to an obvious curve without saying so."],
    section: 31,
    lab: "correlation",
  },
  {
    id: "confounding",
    title: "A third variable may explain the association",
    tool: "Stratified / adjusted analysis + a causal diagram",
    why: "Pooled and within-group associations can differ or reverse. Colour by the suspected confounder and compare.",
    assumptions: ["The confounder is measured or at least named.", "The adjustment model is justified."],
    avoid: ["Adjusting for a mediator as if it were a confounder.", "Claiming the confounder is the whole explanation without evidence."],
    section: 33,
    lab: "correlation",
  },
  {
    id: "regression",
    title: "Predict Y from X",
    tool: "Simple linear regression",
    why: "The slope is in Y-units per X-unit and depends on the scales; r does not.",
    assumptions: ["Linearity.", "Independent errors for inference.", "The range of X is relevant to the prediction."],
    avoid: ["Extrapolating far outside the observed X range.", "Reading the slope as a causal effect."],
    section: 35,
    lab: "correlation",
  },
  {
    id: "rct",
    title: "Causal comparison with random assignment",
    tool: "Randomized controlled experiment (A/B is one design)",
    why: "Randomization makes groups comparable in expectation and supports a causal interpretation under the design's assumptions.",
    assumptions: ["Random assignment executed correctly.", "Assignment unit matches the analysis unit.", "Outcome and analysis pre-specified."],
    avoid: ["Peeking and stopping on a favourable p-value.", "Ignoring non-compliance or missing outcomes."],
    section: 26,
    lab: "experiments",
  },
  {
    id: "observational",
    title: "Causal question without randomization",
    tool: "Observational design with explicit identification assumptions",
    why: "Without random assignment, a causal claim depends on untestable assumptions about confounding and selection.",
    assumptions: ["No unmeasured confounding (strong, usually unverifiable).", "Correct functional form and comparison groups."],
    avoid: ["Calling an adjusted regression “causal” by default.", "Hiding the identification assumption in a footnote."],
    section: 34,
  },
];

export const DECISION_RESULT_BY_ID = new Map(DECISION_RESULTS.map((result) => [result.id, result]));

// ---------------------------------------------------------------------------
// Search index
// ---------------------------------------------------------------------------

export interface SearchItem {
  id: string;
  label: string;
  group: string;
  href: string;
  keywords: string[];
}

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const journey of JOURNEYS) {
    items.push({
      id: `journey-${journey.slug}`,
      label: `Journey ${journey.number}: ${journey.title}`,
      group: "Journeys",
      href: journeyHref(journey.slug),
      keywords: [journey.arabic, journey.question, ...journey.outcomes],
    });
  }
  for (const section of SECTIONS) {
    items.push({
      id: `section-${section.id}`,
      label: `${section.number}. ${section.titleEn}`,
      group: `§${section.number} · ${JOURNEY_BY_SLUG.get(section.journey)?.title ?? ""}`,
      href: sectionHref(section),
      keywords: [section.titleAr ?? "", section.misconception, ...section.objectives],
    });
  }
  for (const lab of LABS) {
    items.push({
      id: `lab-${lab.slug}`,
      label: lab.title,
      group: "Interactive labs",
      href: labHref(lab.slug),
      keywords: [lab.question, lab.description, ...lab.controls],
    });
  }
  for (const formula of FORMULAS) {
    items.push({
      id: `formula-${formula.id}`,
      label: formula.title,
      group: "Formulas",
      href: `/learn/statistics/formulas#${formula.id}`,
      keywords: [formula.plain, formula.alt, formula.group],
    });
  }
  for (const entry of GLOSSARY) {
    items.push({
      id: `glossary-${entry.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label: entry.term,
      group: "Glossary",
      href: `/learn/statistics/glossary#${entry.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      keywords: [entry.arabic, entry.definition, ...(entry.synonyms ?? []), "اختبار الفرضيات", "hypothesis test", "p-value", "فترة الثقة"],
    });
  }
  for (const myth of MYTHS) {
    items.push({
      id: `myth-${myth.id}`,
      label: myth.claim,
      group: "Misconceptions",
      href: `/learn/statistics/journey/synthesis#s39`,
      keywords: [myth.verdict, myth.correction, myth.evidence],
    });
  }
  items.push(
    {
      id: "page-atlas",
      label: "Interactive concept atlas",
      group: "Tools",
      href: "/learn/statistics/atlas",
      keywords: ["concept map", "prerequisites", "topic connections", "خريطة المفاهيم"],
    },
    {
      id: "page-formulas",
      label: "Formula workbench",
      group: "Tools",
      href: "/learn/statistics/formulas",
      keywords: ["formula sheet", "equations", "المعادلات"],
    },
    {
      id: "page-decision",
      label: "Which statistical tool?",
      group: "Tools",
      href: "/learn/statistics/decision",
      keywords: ["decision tree", "tool chooser", "أي أداة إحصائية"],
    },
    {
      id: "page-glossary",
      label: "Bilingual glossary",
      group: "Tools",
      href: "/learn/statistics/glossary",
      keywords: ["مصطلحات", "definitions", "قاموس"],
    },
    {
      id: "page-cheatsheet",
      label: "One-page field guide",
      group: "Tools",
      href: "/learn/statistics/cheatsheet",
      keywords: ["cheat sheet", "print", "ملخص"],
    },
  );
  return items;
}
