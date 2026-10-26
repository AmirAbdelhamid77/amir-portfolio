# Visual storyboards — Comprehensive Statistics Reference

Each CORE exhibit is specified here before it is accepted: the learner question, the two states a
learner must be able to distinguish, the controls, the default, the mathematical truth, the visual
semantics, responsive/fallback behaviour, code ownership and the acceptance test.

The storyboards describe what was built; they are not a separate design fiction. The implementation
lives in `components/statistics/labs/` and `components/statistics/exhibits/`.

## 1. Mean–median–outlier explorer — §4–§5 (P0)

- **Learner question:** “When one extreme value arrives, which summary still tells me what a typical
  value is?”
- **Before / after:** a symmetric 10-point strip with mean and median close together → toggle one
  extreme value; the mean line jumps toward the outlier while the median line barely moves.
- **Controls:** editable dataset; preset (symmetric/skewed/quiz); add-extreme toggle; extreme value
  slider (25–200); sample vs population SD; show box plot; reset.
- **Default:** `12,14,14,15,16,16,17,18,19,21`, no outlier, sample SD, box plot on.
- **Mathematical truth:** mean uses every value; median is positional; sample variance divides by
  n−1, population variance by N; quartiles use R type 7; outliers are beyond 1.5×IQR fences.
- **Labels/units:** “Observed value” on x; every readout names the statistic; the SD band is marked
  “mean ± 1 SD”; the box plot is labelled “Q₁–Q₃, median, 1.5×IQR fences”.
- **Responsive:** chart full width at all sizes; controls below/right; chart text uses user units
  scaled by a 480-wide viewBox; no horizontal page scroll at 390 px.
- **Fallback:** exact-value table with every value and its deviation from the mean; chart has an
  `aria-label` summary including the outlier list.
- **Owner:** `components/statistics/labs/center-spread-lab.tsx`, `charts/dot-strip.tsx`.
- **Acceptance:** add the extreme value → mean changes more than median; reset restores 16.20;
  browser e2e check `mean–median lab reacts and resets`.

## 2. Binomial machine — §8 (P0)

- **Learner question:** “What does exactly k successes mean when n is fixed?”
- **Before / after:** n=20, p=0.3, at-most 6 highlighted → switch to exact 6; only one bar is
  highlighted and the probability drops.
- **Controls:** n (1–60), p (0–1), k (0–n), event exact/≤/≥, presets; reset.
- **Default:** n=20, p=0.3, k=6, at-most.
- **Mathematical truth:** PMF \(\binom{n}{k}p^k(1-p)^{n-k}\); masses sum to 1; \(E=np\),
  \(\mathrm{Var}=np(1-p)\); k is an integer and 0≤k≤n.
- **Labels:** x is “k = number of successes”; y is probability; bars are faded outside the event;
  mean line is labelled; four assumptions are visible in a disclosure.
- **Responsive:** up to 61 bars; labels suppressed above 24 bars except the selected k; exact table
  lists every k and CDF.
- **Fallback:** table of PMF and CDF; chart `aria-label` states the event and probability.
- **Owner:** `binomial-lab.tsx`, `charts/pmf.tsx`.
- **Acceptance:** exact 0.1916 at n=20,p=0.3,k=6; at-most 0.6080; p=0 and p=1 collapse; tests assert
  normalisation and boundaries.

## 3. Bell curve and z lab — §9 (P0)

- **Learner question:** “Where does probability live under a normal curve?”
- **Before / after:** μ=100, σ=15, shaded 85–115 → narrow σ to 5; the same interval becomes almost
  the whole distribution while the total area stays 1.
- **Controls:** μ, σ>0, left/right/between/two-tail, x₁/x₂, empirical-rule bands; presets; reset.
- **Default:** μ=100, σ=15, between 85 and 115.
- **Mathematical truth:** \(f(x)=1/(\sigma\sqrt{2\pi})e^{-(x-\mu)^2/2\sigma^2}\), area via Φ;
  \(z=(x-\mu)/\sigma\); point probability zero; total area 1.
- **Labels:** x is the measured value; y is “Density (not probability)”; shaded area; μ line; z
  readout; band labels 68/95/99.7 are marked approximate.
- **Responsive:** chart scales; empirical band labels may be hidden at narrow width; numeric table
  remains.
- **Fallback:** CDF table at μ±σ, μ±2σ, μ±3σ; chart summary names the probability.
- **Owner:** `normal-lab.tsx`, `charts/density.tsx`.
- **Acceptance:** area checks match Φ; σ=0 rejected; 68/95/99.7 values within 1e-6; browser a11y
  control-name scan.

## 4. Poisson event-arrival theatre — §10 (P0)

- **Learner question:** “How unusual is 25 arrivals when the rate is 20 per interval?”
- **Before / after:** λ=20, k≥25, tail probability 15.68% → change k to 13; exact probability 2.71%.
  Change the window to ×2; effective λ=40, and the counts axis changes.
- **Controls:** λ (0.1–60), k, exact/≤/≥, window ×0.5/×1/×2, seed, replay, presets; reset.
- **Default:** λ=20, k=25, at-least, window 1.
- **Mathematical truth:** \(P(X=k)=e^{-\lambda}\lambda^k/k!\); \(E=\mathrm{Var}=\lambda\);
  \(SD=\sqrt{\lambda}\); λ is per stated interval. Integer λ has two modes (λ−1, λ).
- **Labels:** “k = arrivals per interval”; effective λ displayed; dashed mean line; simulated
  arrival strip explicitly marked “simulated”; correction note for the source’s 11% claim.
- **Responsive:** bar labels suppressed beyond 24 bars; arrival strip scrolls horizontally inside
  its panel, not the page.
- **Fallback:** exact PMF/CDF table; arrival strip is `aria-hidden` and described in text; the
  probability readout does not depend on the simulation.
- **Owner:** `poisson-lab.tsx`, `charts/pmf.tsx`.
- **Acceptance:** λ=20, P(13)=0.027115648104; P(≥25)=0.156772621826; tests exact; e2e source preset.

## 5. Sampling factory — §11, §12, §17 (P0)

- **Learner question:** “Why does the distribution of sample means become normal while the
  population does not?”
- **Before / after:** right-skewed population, step/play draws → the third panel accumulates means
  and narrows toward a normal shape; the first panel stays skewed.
- **Controls:** shape (normal/uniform/skewed), n (2–100), draws (100–2000), seed, play/pause/step/
  skip, speed, presets; reset.
- **Default:** skewed population, n=30, 1200 draws, seed 42, one mean revealed.
- **Mathematical truth:** each observation is a draw from the stated generator; the third panel is
  the distribution of \(\bar X\), not of observations; theoretical SE \(=\sigma/\sqrt n\); CLT is
  an approximation whose adequacy depends on shape and n.
- **Labels:** panel 1 “Population distribution”; panel 2 “One sample”; panel 3 “Sampling distribution
  of the mean”; each axis names individual value vs sample mean; empirical and theoretical SE are
  separate readouts.
- **Responsive:** panels stack vertically (full-width charts) so labels are legible; no horizontal
  scroll.
- **Fallback:** comparison table of units/spreads; each chart has a summary; reduced motion makes
  Play jump to the result.
- **Owner:** `sampling-lab.tsx`, `charts/histogram.tsx`.
- **Acceptance:** seeded replay identical; empirical SE near σ/√n; e2e skip reaches 1200 means;
  reduced-motion e2e reaches the result immediately.

## 6. SD vs SE and CI rain — §13–§14 (P0)

- **Learner question:** “What exactly is 95% confident about?”
- **Before / after:** one interval around an estimate → repeated coverage; intervals miss the fixed
  μ and are marked; the counter reports the observed coverage, not a forced 95%.
- **Controls:** one interval/repeated coverage, n, confidence 80/90/95/99, mean, s, known vs
  estimated σ, trials 50–400, seed, redraw; reset.
- **Default:** single interval, n=25, 95%, mean=104, s=15, estimated σ; coverage trials=100.
- **Mathematical truth:** estimate ± critical×SE; SE=σ/√n or s/√n; t critical when σ is estimated;
  coverage is a long-run property of the procedure; the observed finite-run rate is random.
- **Labels:** “SE”, “critical”, “margin”, “lower”, “upper”; SD/SE ratio; coverage counter; legend
  distinguishes solid covered and dashed missed; the density curve is labelled as a normal
  approximation (t critical used for the interval).
- **Responsive:** interval rain shows the last 60 of N rows; chart does not force all hundreds into
  one viewport; tables expose exact intervals.
- **Fallback:** exact interval table; coverage arithmetic in text; chart summary states covered/N.
- **Owner:** `confidence-lab.tsx`, `charts/interval.tsx`, `charts/density.tsx`.
- **Acceptance:** CI [75.872,84.128] for 80/10/25/95; coverage seed 7 not exactly 95%; e2e loads
  and dark-mode screenshot.

## 7. p-value observatory — §15, §18–§21 (P0)

- **Learner question:** “If H₀ were true, how unusual is this result?”
- **Before / after:** z=2.4, two-sided, α=.05 → p=0.0164, reject → move z to 0.5; p=0.6171, fail to
  reject. Switch to right-tailed; the tail moves.
- **Controls:** z or sample input (\(\bar x,\mu_0,s,n\)), sidedness, α, presets; reset.
- **Default:** z=2.4, two-sided, α=.05.
- **Mathematical truth:** two-sided \(p=2(1-\Phi(|z|))\), right \(1-\Phi(z)\), left \(\Phi(z)\);
  reject iff p≤α; p is conditional on H₀. It is not P(H₀ true) and not an overlap.
- **Labels:** “Null density”; p-value region purple; α gate hatched; observed z vertical; decision
  text “reject”/“fail to reject”; critical value. The p and α annotations are separate.
- **Responsive:** chart full width; controls below; numeric table compares all three alternatives.
- **Fallback:** exact p for each sidedness; chart summary states z/p/α/decision; no hover-only info.
- **Owner:** `pvalue-lab.tsx`, `charts/two-dist.tsx`.
- **Acceptance:** test z=0.5 → fail to reject; z=2.4 → reject; e2e checks both; p-value formula test.

## 8. Correlation detective — §30, §31, §33, §35 (P0)

- **Learner question:** “What is r hiding?”
- **Before / after:** strong positive cloud → switch to U-shape; r≈0 while dependence is obvious →
  switch to third-variable preset; pooled r positive, within-group r negative. Change X units; slope
  changes, r does not.
- **Controls:** presets, X unit multiplier, group reveal, regression line toggle; reset.
- **Default:** strong positive, metres, regression on, groups off.
- **Mathematical truth:** sample Pearson r; least-squares slope \(=r s_y/s_x\); r unitless in
  [−1,1]; near-zero r does not imply independence; observational association is not causal.
- **Labels:** r on chart; slope and intercept; within-group r when groups revealed; group colours;
  axes name X units and Y outcome units.
- **Responsive:** scatter full width; legend text; table of exact points; no page overflow.
- **Fallback:** point table with groups; summary includes pooled and within-group r.
- **Owner:** `correlation-lab.tsx`, `charts/scatter.tsx`.
- **Acceptance:** perfect ±1; U-shape r≈0; e2e U-shape and third-variable presets; unit rescale
  leaves r unchanged (test).

## 9. Type I / II and power — §22 (P1)

- **Learner question:** “What does α actually trade against?”
- **Before / after:** α=.05, n=64, effect 3, σ=10 → β≈.734, power≈.266 → increase n; power rises.
  Increase α; β falls.
- **Controls:** α, effect, σ, n, two-sided toggle; reset.
- **Default:** α=.05, effect=3, σ=10, n=64, two-sided.
- **Mathematical truth:** \(ncp=(effect/\sigma)\sqrt n\); two-sided power \(=\Phi(ncp-z_{crit})+
  \Phi(-ncp-z_{crit})\); one-sided power \(\Phi(ncp-z_{1-\alpha})\); α and β are conditional on
  different models.
- **Labels:** H₀ solid, H₁ dashed, rejection region hatched, β red, power green; α/β/power readouts;
  critical value.
- **Responsive:** chart full width; table of error rates; the 2×2 truth table is native HTML.
- **Fallback:** numeric β/power table; chart summary; essential text always visible.
- **Owner:** `errors-lab.tsx`, `charts/two-dist.tsx`.
- **Acceptance:** power increases with n and effect; power+β=1; browser smoke; no causal claim.

## 10. Business decision room — §40, §23 (P1)

- **Learner question:** “Is the lift statistically detectable, and is it worth shipping?”
- **Before / after:** 320/4000 vs 376/4000 → 8.0% vs 9.4%, +1.4 pp, +17.5% relative, p=.0263,
  CI [0.17,2.63] pp → raise the meaningful threshold above the lift; the statistical decision
  stays reject, the practical decision changes.
- **Controls:** visitors/conversions per arm, confidence, MME, traffic, value per conversion,
  implementation cost, presets; reset.
- **Default:** source-like 4000/320/4000/376, 95%, MME=0.5 pp.
- **Mathematical truth:** independent proportions; pooled two-proportion z test; unpooled CI for
  \(p_B-p_A\); per-arm Wilson intervals; absolute vs relative lift; business arithmetic is an
  explicit illustration, not a forecast.
- **Labels:** counts and denominators on the bar chart; rates; absolute lift in pp; relative lift
  %; p-value; CI; “reject/fail to reject”; combined decision; warning for small expected counts.
- **Responsive:** charts stack; input grid two columns; no page overflow.
- **Fallback:** arm table, exact values, warnings as text; chart summary includes counts/rates.
- **Owner:** `business-lab.tsx`, `charts/bars.tsx`.
- **Acceptance:** source counts p=.0263165, CI excludes 0; small preset triggers warnings; e2e
  checks denominators and relative lift.

## 11. Probability space lab — §6 (P1)

- **Learner question:** “What is the difference between independent and mutually exclusive?”
- **Before / after:** two-dice sum≥9 vs first die=6; the grid shows A-only, B-only, intersection;
  switch to a die even/prime preset; the intersection is empty, so the events are mutually exclusive
  and cannot be independent.
- **Controls:** scenario (2 coins/1 die/2 dice), event A, event B, presets; reset.
- **Default:** two dice, sum≥9, first die=6.
- **Mathematical truth:** exact enumeration of a fair sample space; \(P(A|B)=P(A∩B)/P(B)\);
  independence iff \(P(A∩B)=P(A)P(B)\); mutual exclusivity is \(P(A∩B)=0\).
- **Labels:** grid cells labelled; legend A-only/B-only/both/neither; P(A), P(B), intersection,
  union, conditional; independence verdict.
- **Responsive:** 6×6 grid remains square and fits mobile; bars for probabilities; table fallback.
- **Fallback:** outcome table with A/B truth values; summary text.
- **Owner:** `probability-lab.tsx`.
- **Acceptance:** exact counts; mutual-exclusivity preset not independent; e2e page smoke.

## 12. PMF vs PDF studio — §7 (Signature)

- **Learner question:** “Why is a PMF bar not a PDF curve?”
- **Before / after:** binomial exact k → bars with mass → switch to normal exact point; the point
  probability is 0 and the chart asks for an interval instead.
- **Controls:** family binomial/Poisson/normal, parameter slider, exact/interval query, bounds.
- **Default:** binomial, n=20, p=.4, interval 2–5.
- **Mathematical truth:** discrete masses sum to 1; continuous density integrates to 1; a continuous
  point has probability 0; the event query changes with the support.
- **Labels:** x is k or a continuous value; y is probability mass or density; caption changes with
  the family; point probability readout says 0 for normal.
- **Responsive:** chart full width; controls below; table record.
- **Fallback:** exact computation table; family-specific captions.
- **Owner:** `distributions-lab.tsx`.
- **Acceptance:** normal point probability 0; PMF/PDF totals; browser smoke.

## 13. Assignment shuffle — §25–§26 (P1)

- **Learner question:** “Does randomization make the groups identical?”
- **Before / after:** one shuffled assignment has an age imbalance → 200 shuffles form a distribution
  of imbalances centred near zero; the current shuffle is marked.
- **Controls:** assignment mode random/age-balanced, participants, age spread, seed, reshuffle.
- **Default:** 60 participants, spread 10, seed 3, random.
- **Mathematical truth:** random assignment balances in expectation, not in every run; the
  histogram is a design-property distribution, not a p-value; participants stay fixed across
  reshuffles.
- **Labels:** group means, imbalance, n per group, “this shuffle” marker, histogram axis in years.
- **Responsive:** panels stack; group dots wrap; table of first 20 assignments.
- **Fallback:** group means and counts; table.
- **Owner:** `experiments-lab.tsx`.
- **Acceptance:** reshape seed changes assignment but not ages; browser smoke.

## 14. Impact vs evidence — §23 (P1)

- **Learner question:** “How can a result be precise and still not matter?”
- **Before / after:** tiny effect with huge n → p<.05, CI narrow, but the effect remains below the
  meaningful threshold; the decision cards disagree.
- **Controls:** effect, n, σ, threshold, value per point.
- **Default:** effect=.4 pp, n=4000, σ=8, threshold=.5 pp.
- **Mathematical truth:** \(z=effect/SE\), two-sided p; 95% CI; relevance compares the interval and
  threshold; significance and relevance are separate criteria.
- **Labels:** “Statistically detectable?”, “Point above threshold?”, “Confidently above threshold?”;
  interval chart with threshold line.
- **Responsive:** stacked panels; table.
- **Fallback:** numeric readouts and text decision.
- **Owner:** `practical-lab.tsx`.
- **Acceptance:** n increase can make p significant while effect stays below threshold; browser
  smoke.

## 15. From dot to decision — §1, §11, §14, §19, §41 (Signature)

- **Learner question:** “Can one dataset carry the whole statistical story?”
- **Before / after:** stage 1 describes 40 sessions; stage 2 resamples; stage 3 intervals; stage 4
  tests H₀: μ=7.5; stage 5 shows p=.0337 but effect .785 < 1.0 threshold, so the recommendation is
  not to ship on this evidence.
- **Controls:** stage stepper, resample size, confidence, null mean, practical threshold; reset.
- **Default:** stage 1, n=10 resample, 95%, μ₀=7.5, threshold 1.
- **Mathematical truth:** same 40 synthetic values throughout; bootstrap with replacement; t
  interval; large-sample z test with s estimated; the decision combines evidence and relevance.
- **Labels:** “same 40 sessions”; each stage names its object (value vs sample mean); data ribbon;
  exact table; limitations.
- **Responsive:** stages stack; chart full width; controls in disclosure on the hub; no horizontal
  scroll.
- **Fallback:** full 40-value table; numeric readouts at each stage; chart summaries.
- **Owner:** `dot-to-decision.tsx`, `lib/statistics/flagship.ts`.
- **Acceptance:** p≈.0337 at μ₀=7.5; effect .785; 95% CI [7.537,9.032]; browser smoke; data table
  matches `FLAGSHIP_DATA`.

## 16. Supporting and structural exhibits

| Exhibit | Learner question | Before → after | Fallback | Owner | Acceptance |
|---|---|---|---|---|---|
| Evidence journey | Which questions belong to which stage? | Select a stage → its question/output and source link | Ordered buttons, text output | `exhibits/interactive.tsx` | e2e clicks Sampling |
| Type sorter | Is a numeric ID numerical? | Classify 8 examples → immediate explanation | Native buttons + aria-live | `exhibits/interactive.tsx` | a11y scan; correct answers in data |
| Describe vs infer | What does a sample summary claim? | Side-by-side sample histogram vs interval + fixed μ | Text labels for both panels | `exhibits/static.tsx` | rendered |
| Decision path | What is the hypothesis-testing workflow? | Click a stage → detail and p-value lab link | Ordered list | `exhibits/interactive.tsx` | rendered |
| Cause and response | What makes a comparison an experiment? | Static design → treatment/control → response | Text descriptions | `exhibits/static.tsx` | rendered |
| Comparable groups | Why can an age difference mislead? | Observed imbalance vs matched vs randomized | Three labelled bars | `exhibits/static.tsx` | rendered |
| Bias shields | What does double-blind actually mean? | Toggle participant/assessor/analyst/placebo | Checkboxes + knowledge text | `exhibits/interactive.tsx` | rendered |
| Experiment blueprint | Is an RCT always two arms? | Two-arm vs multi-arm layouts | Text labels | `exhibits/static.tsx` | rendered |
| Variable switchboard | What are X and Y here? | Choose scenario → predictor/response and design caveat | Select + text | `exhibits/interactive.tsx` | rendered |
| Evidence gap | Can co-movement license a causal arrow? | Association scatter and DAG with “NOT ESTABLISHED” | Text labels | `exhibits/static.tsx` | rendered |
| Evidence choice | Which tool matches the evidential target? | Three cards: association, experiment, not enough | Text cards | `exhibits/static.tsx` | rendered |
| Concept atlas | What must I understand first? | Select/search a node → definition + prerequisite links | Full list + search | `concept-atlas.tsx` | e2e selects Confounding |
| Formula workbench | What does the formula compute, and under what conditions? | Choose formula → edit inputs → substitution + plot | Plain formula + text | `formula-calculator.tsx` | e2e z=1.0000 |
| Myth vs evidence | Which confident sentence is false? | Open a card → counterexample + correction + section | Native details | `exhibits/static.tsx` | static + a11y |
| Mental model | Where does uncertainty enter? | Layered population→sample→statistic→SE→inference→decision | Ordered list | `exhibits/static.tsx` | rendered |
| Cheat sheet | What is the formula and its caution? | Table of concepts, quick form, links back | Printable native table | `exhibits/static.tsx` | print screenshot |
| Capstone | What is the transferable process? | Check steps → progress and tool links | Checklist | `exhibits/interactive.tsx` | rendered |

## Cross-cutting acceptance

- Stable axes during before/after comparisons; no hidden rescale.
- Every chart has `role="img"` + summary and an exact-value table or labelled readout.
- Controls are labelled; keyboard reachable; reset restores defaults.
- `prefers-reduced-motion` makes playback instant and removes non-essential transitions.
- Mobile: charts stack; no horizontal page overflow at 390 px.
- Dark/light: semantic tokens; no chart colour is hard-coded to a light background.
- Every number is computed in `lib/statistics/math.ts`; tests cover the shared arithmetic.
