# Mathematical errata and verification — Comprehensive Statistics Reference

This is the scientific review of the exported reference. It records what was checked, what was
wrong, what was underspecified and what was confirmed. A correction is only accepted when it can be
reproduced independently; otherwise the source claim is preserved with an explicit warning.

**Snapshot:** one local HTML export, SHA-256 `b16602340db52697bc7ed6ccab72eced7698c409594e3f8dac8e65b1aa04eaf7`,
43 numbered sections, 102 formula occurrences. No figures were present, so no plotted value in a
source image needed auditing.

**Reproduction:** `tests/statistics/math.test.mjs` (18 tests) and
`scripts/verify-statistics.mjs` (15 gate checks). The tests import the same pure functions that draw
the charts; no displayed number is typed into a component.

## Severity key

| Level | Meaning | Required response |
|---|---|---|
| **High** | A stated numeric result is materially wrong | Correct visibly next to the source; test the corrected value |
| **Medium** | A claim is underspecified or notation is invalid | Preserve with an explicit qualification; do not present as verified |
| **Low** | A convention or illustrative example is unstated | State the convention/label; no numeric change |

## 1. Corrections and qualifications

### E1 — Poisson tail probability is wrong (High)

- **Source:** §10.3, Arabic text: “واحتمال وصول **25 شخصًا أو أكثر** كان أكثر قليلًا من **11%**.”
  (The probability of 25 or more arrivals is “a little over 11%”.)
- **Concern:** The stated tail probability is materially wrong. Only the exact point probability
  (2.71%) is correct in that paragraph.
- **Independent calculation:** For \(X\sim\mathrm{Poisson}(\lambda=20)\):
  - \(P(X=13)=e^{-20}20^{13}/13! = 0.027115648104173072\) → **2.7115648104%**.
  - \(P(X\ge25)=\sum_{k=25}^{\infty} e^{-20}20^k/k! = 0.156772621826238\) → **15.6772621826%**.
  - The test uses a log-gamma PMF and a direct tail sum; tolerance \(10^{-10}\).
- **Decision:** Corrected figure shown in the §10 verification note and in the Poisson lab. The
  original sentence is preserved (source fidelity) and the correction is adjacent and visible; the
  wrong figure is not repeated in a tooltip or quiz answer.
- **Destination:** §10 header note; an inline correction immediately after the §10.3 paragraph;
  Poisson lab preset “Source λ=20, k≥25”; `math-errata` row in the source audit page.
- **Test:** `Poisson reproduces the brief's verified λ=20 values` and `verify:statistics` benchmark.

### E2 — p = 0.037 example is underspecified (Medium)

- **Source:** §19.1: “If the population mean is 79.3, and we ask for the probability of a sample mean
  ≥ 82 … \(p=0.037\).”
- **Concern:** No sample size, standard error, standard deviation or test statistic is supplied. The
  p-value cannot be independently checked, and the example mixes a population-mean statement with a
  sample-mean event.
- **Decision:** Preserve the source paragraph as an illustration. Add a source note saying it is
  underspecified and **not** presented as a verified calculation. It is not used as a quiz key.
  The p-value lab computes from user-entered \(z\), or from \(\bar{x}, \mu_0, s, n\).
- **Destination:** §19 header note; an inline qualification immediately after the §19.1 paragraph;
  p-value lab disclaimer; this errata page.
- **Test:** no numeric assertion is made for this example; the lab’s z→p function is tested instead.

### E3 — LaTeX backslashes lost in the export (Medium, notation only)

- **Source:** text such as `(bar{x}=frac{sum x_i}{n})`, `(sigma^2=frac{sum (x_i-mu)^2}{N})`,
  `(P(Amid B)=frac{P(Acap B)}{P(B)})`, `(SD(X)=sqrtlambda)`.
- **Concern:** The HTML export strips every backslash. The text is not valid TeX and some of it is
  ambiguous (`sqrtlambda`, `mupm1sigma`).
- **Decision:** Map all 102 occurrences (78 unique raw strings) to verified TeX through an explicit
  lexicon in `scripts/import-notion-statistics.mjs`. The semantic content is unchanged; only
  notation is repaired. Unmapped formulas are reported by the importer, never silently dropped.
- **Verification:** all unique TeX strings render with KaTeX `throwOnError:true`, `trust:false`,
  `strict:"ignore"`; all 102 occurrences are represented.
- **Destination:** every section; formula workbench; `.katex` output in the static export.
- **Test:** `all formulas render through KaTeX` in `verify:statistics`; importer fails on unmapped
  formulas.

### E4 — Quartile convention was unstated (Low)

- **Source:** §5.4 gives \(\mathrm{IQR}=Q_3-Q_1\) without defining \(Q_1/Q_3\).
- **Concern:** Tukey hinges, nearest-rank and linear interpolation can give different values on small
  samples. The source’s formula is correct but incomplete.
- **Decision:** State the convention explicitly: linear interpolation between order statistics
  (R type 7). The box plot’s 1.5×IQR fences are a convention for flagging, not a test for errors.
- **Destination:** §5 lab assumptions; formula workbench note.
- **Test:** `Descriptive statistics use n−1…` checks Q1=4, Q3=5.5 for `[2,4,4,4,5,5,7,9]` under
  type 7.

### E5 — Illustrative correlation examples are not measurements (Low)

- **Source:** §32: water cost and life expectancy with \(r=0.61\).
- **Concern:** No dataset accompanies the claim. Presenting it as measured evidence would be
  misleading, especially in a causation lesson.
- **Decision:** Label it “illustrative values from the source example, not a measured dataset” in the
  causation exhibit. It teaches the logical gap, not an empirical fact.
- **Destination:** §32 “The evidence gap” exhibit.
- **Test:** visual text audit; no numeric computation is claimed for this example.

### E6 — §29 response wording is ambiguous (Low, transcription risk)

- **Source:** “Vitamin C supplementation = Independent Variable، وGender birth ratio/response المقاس
  = Dependent Variable في المثال التعليمي.”
- **Concern:** “Gender birth ratio/response” does not identify a single measured response clearly.
- **Decision:** Preserve the source wording verbatim. Do not invent a dataset or a numeric result.
  The variable-role switchboard uses separate, unambiguous scenarios for the teaching point.
- **Destination:** §29 source text; “Variable role switchboard” exhibit.
- **Test:** source transcription only; no numeric claim.

## 2. Confirmed claims (no change needed)

| Item | Source claim | Verification |
|---|---|---|
| Sample variance denominator | \(s^2=\sum(x_i-\bar{x})^2/(n-1)\) | Correct; test checks 32/7 for `[2,4,4,4,5,5,7,9]` |
| Population variance denominator | \(\sigma^2=\sum(x_i-\mu)^2/N\) | Correct; population variance of the same list is 4 |
| Standard deviation | \(\mathrm{SD}=\sqrt{\mathrm{Variance}}\) | Correct units argument; implemented as sqrt of the chosen variance |
| IQR | \(Q_3-Q_1\) | Correct once the quartile convention is stated |
| Complement | \(P(A^c)=1-P(A)\) | Correct for any event in the sample space; lab computes from enumeration |
| Independence | \(P(A\cap B)=P(A)P(B)\) | Correct definition; lab compares against the product |
| Conditional probability | \(P(A\mid B)=P(A\cap B)/P(B)\) | Correct; lab reports undefined when \(P(B)=0\) |
| Binomial PMF | \(P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}\) | Correct under fixed n, independent trials, constant p, binary outcomes |
| Binomial moments | \(E(X)=np,\ \mathrm{Var}(X)=np(1-p)\) | Correct |
| Normal z | \(z=(x-\mu)/\sigma\) | Correct; \(z=0\) at \(x=\mu\), negative/zero σ rejected |
| Poisson PMF | \(P(X=k)=e^{-\lambda}\lambda^k/k!\) | Correct for non-negative integer k and λ≥0 |
| Poisson moments | \(E(X)=\mathrm{Var}(X)=\lambda,\ \mathrm{SD}=\sqrt{\lambda}\) | Correct |
| CLT mean | \(E(\bar X)=\mu\) | Correct under suitable sampling/finite mean |
| Standard error | \(\mathrm{SE}_{\bar X}=\sigma/\sqrt n\) | Correct when σ is known; estimated form uses s and a t critical value |
| Test statistic | (observed − hypothesized)/SE | Correct generic form; 5.4/1.5 = 3.6 verified |
| Decision rule | \(p\le\alpha\) reject; \(p>\alpha\) fail to reject | Correct; never labelled “accept H₀” |
| Type I/II table | four reality × decision states | Correct; α and β are conditional on different models |
| Regression line | \(Y=\beta_0+\beta_1X\) | Correct; β₁ carries units, unlike r |
| Correlation scope | r measures linear strength/direction | Correct; nonlinear counterexamples included |

## 3. Mandatory checks from the brief — result

| Check | Result | Evidence |
|---|---|---|
| Poisson λ=20 exact/tail values | **PASS** (13: 2.7115648%; ≥25: 15.6772622%) | `math.test.mjs`; `verify-statistics` |
| Binomial PMF sums to 1; boundaries p=0/1 | **PASS** | n=10,p=0.3 sum=1; p=0 and p=1 collapse correctly |
| Normal density integrates to 1; 68/95/99.7 | **PASS** | Simpson integral 1.0000000000; areas 0.6826895/0.9544997/0.9973002 |
| Sample variance n−1; n<2 handling | **PASS** | variance test; sample variance of one value is NaN |
| Mean/median/SD/IQR recompute on outlier | **PASS** | outlier lab; test summary |
| CLT panels distinct and reproducible | **PASS** | sampling lab has three labelled panels; seeded replay; e2e smoke |
| CI known vs estimated σ | **PASS** | z vs t branch; t critical df=24 = 2.0638986 |
| CI coverage not forced to 95% | **PASS** | seed 7, n=25, 500 trials → 94.6%; test asserts not exactly 95% |
| Hypothesis tails and decision rule | **PASS** | PValueChart shades sided tails; e2e changes z to 0.5 and gets fail-to-reject |
| Pearson r in [−1,1] | **PASS** | perfect ±1; U-shape r≈0 with visible dependence |
| A/B proportions, denominators, lift | **PASS** | pooled z + unpooled CI; 320/4000 vs 376/4000; p=0.0263165 |
| No causal claim from r | **PASS** | correlation lab text and causation exhibit |
| RTL math / keyboard / reduced motion | **PASS (structural + browser)** | e2e keyboard command palette, reduced motion sampling, RTL `dir` attributes |
| Exact-value tables | **PASS** | all chart figures expose a `DataTableView` or labelled numeric readout |

## 4. Known numerical limitations (not corrections)

- The §19.1 p-value cannot be reproduced because its inputs are missing (E2).
- The Poisson arrival strip is a seeded simulation, not observed counts. It is labelled as simulated.
- The A/B example is synthetic. Its counts, traffic and currency values are inputs, not research data.
- Power is computed for a stated normal z-test model; it is not a universal property of a test.
- The CI coverage simulation uses normal samples; real clustered or dependent data need a different
  interval.
- The regression extension is ordinary least squares with no inference on the slope; it is a teaching
  slope, not a validated model for prediction.
