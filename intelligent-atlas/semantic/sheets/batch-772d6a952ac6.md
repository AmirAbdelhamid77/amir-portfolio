# Review sheet batch-772d6a952ac6

State: **not-read**. 6 units, selected by ["thin-fragment"] from 0 remaining in pool.

A unit in this sheet is still `not-read`. Reading it means writing a decision with a verbatim evidence quote into `intelligent-atlas/semantic/review-decisions.json` and rebuilding the ledger.

## 1. `sql:15#section-16`

- family: `sql` | language: `en` | forms: lesson-section
- locator: `pages[id=3ce3906c5d6c8100ae78f45c42a0b5f1] > 12. Ownership` | href: `/learn/sql/15/#section-16`
- unmatched reason: `thin-fragment` — Heading or fragment without a complete proposition; too little context to identify a concept without guessing.
- candidates: none (unmatched)
- title: 12. Ownership
- nearest heading: 11. Interview Traps (`sql:15#section-15`)

**Text**

```text
15 — Database Design — Complete Reference Design keys, relationships, grain and historical dimensional meaning. 12. Ownership This page owns general database design and modeling concepts. Detailed DWH/BI implementation patterns belong to Module 17.
```

**Before**
- `sql:15#section-14`: 15 — Database Design — Complete Reference Design keys, relationships, grain and historical dimensional meaning. 10. Common Design Failures
- `sql:15#section-15`: 15 — Database Design — Complete Reference Design keys, relationships, grain and historical dimensional meaning. 11. Interview Traps

**After**
- `sql:16#section-1`: 16 — SQL Performance Engineering — Complete Reference Investigate execution plans and measure optimization without changing semantics. Purpose Canonical home for writing SQL that is not only correct, but efficient, predictable, and maintainable.
- `sql:16#section-2`: 16 — SQL Performance Engineering — Complete Reference Investigate execution plans and measure optimization without changing semantics. 1. Performance Mental Model Performance problems usually come from one or more of: Correctness comes before optimization.

**Decision to write**

```json
{
  "unitId": "sql:15#section-16",
  "scope": "batch-review",
  "batchId": "batch-772d6a952ac6",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 2. `sql:12#section-3`

- family: `sql` | language: `mixed` | forms: lesson-section
- locator: `pages[id=3cb3906c5d6c81cc82c7d721c2f0c0ea] > 3. فين تلاقي الشرح النظري (بدل التكرار)` | href: `/learn/sql/12/#section-3`
- unmatched reason: `thin-fragment` — Heading or fragment without a complete proposition; too little context to identify a concept without guessing.
- candidates: none (unmatched)
- title: 3. فين تلاقي الشرح النظري (بدل التكرار)
- nearest heading: 2. MovieNow — قاعدة البيانات المستخدمة في كل الأمثلة (`sql:12#section-2`)

**Text**

```text
📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 3. فين تلاقي الشرح النظري (بدل التكرار) لو حابب مراجعة القاعدة نفسها، روح للموديول الكانوني — هنا هتلاقي بس استخدامها جوه حالة بيزنس حقيقية.
```

**Before**
- `sql:12#section-1`: 📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 1. الفكرة الأساسية: SQL كأداة لاتخاذ القرار Data-driven decision making يعني استخدام البيانات لدعم قرارات تشغيلية واستراتيجية بدل الاعتماد على الحدس بس. قرارات قصيرة المدى: إيه الأفلام/
- `sql:12#section-2`: 📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 2. MovieNow — قاعدة البيانات المستخدمة في كل الأمثلة

**After**
- `sql:12#section-4`: 📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 4. تطبيق 1 — فلوس كل عميل السؤال: كل عميل صرف كام على استئجار الأفلام؟ SELECT r.customer id, SUM(m.renting price) AS total spent FROM renting AS r LEFT JOIN movies AS m ON r.movie id = 
- `sql:12#section-5`: 📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 5. تطبيق 2 — الممثل المفضل عند العملاء الرجالة (ومصيدة الـ grain) السؤال: مين الممثل المفضل عند العملاء الرجالة؟ لازم الأول تحدد "مفضل" يعني إيه: الأكتر مشاهدة؟ الأعلى تقييم؟ الأعلى تقي

**Decision to write**

```json
{
  "unitId": "sql:12#section-3",
  "scope": "batch-review",
  "batchId": "batch-772d6a952ac6",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 3. `fabric-note:eventhouse/syntax`

- family: `fabric-notes` | language: `en` | forms: note, timestamped-summary
- locator: `pack=eventhouse; chapter=syntax` | href: `/lab/dp-600/resources/?pack=eventhouse#study-notes`
- unmatched reason: `thin-fragment` — Heading or fragment without a complete proposition; too little context to identify a concept without guessing.
- candidates: none (unmatched)
- title: Creation syntax, asynchronous work, and readiness
- nearest heading: Backfill and the meaning of effectiveDateTime (`fabric-note:eventhouse/backfill`)

**Text**

```text
Creation syntax, asynchronous work, and readiness The example names the view, its source table, properties, descriptive docString, and the query defining its aggregate. The rigorous version uses the operation ID to monitor backfill completion before releasing dependent dashboard queries.
```

**Before**
- `fabric-note:eventhouse/mv`: Materialized aggregation and the unprocessed delta Materialized views maintain aggregation results for repeated analytical queries. The narrated visits example groups counts by date. The full view query combines its materialized portion with applicable source rows not yet materialized; an explicitly materialized-only a
- `fabric-note:eventhouse/backfill`: Backfill and the meaning of effectiveDateTime Without backfill, a new view begins with subsequent ingestions. Backfill includes existing qualifying source records instead. The cases deliberately supply both EventTime and ingestion time, so eligibility and final time-bucket placement can be reasoned about separately.

**After**
- `fabric-note:eventhouse/availability`: OneLake availability: Delta representation and replication The video enables availability for a database or individual table so Spark and other supported engines can consume Delta without a manually managed export workflow. Database enablement automatically applies to new tables; existing tables require the Apply to ex
- `fabric-note:eventhouse/lifecycle`: Retention propagation, restrictions, and the promotion break Retention also applies to the exposed OneLake data. Turning availability off soft deletes that representation; re-enabling includes historic backfill. The video lists operations requiring a feature-state change, then transitions through a short channel promot

**Decision to write**

```json
{
  "unitId": "fabric-note:eventhouse/syntax",
  "scope": "batch-review",
  "batchId": "batch-772d6a952ac6",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 4. `sql:12#section-6`

- family: `sql` | language: `mixed` | forms: lesson-section, code
- locator: `pages[id=3cb3906c5d6c81cc82c7d721c2f0c0ea] > 6. حارس تحليلي: حجم العينة والموثوقية` | href: `/learn/sql/12/#section-6`
- unmatched reason: `thin-fragment` — Heading or fragment without a complete proposition; too little context to identify a concept without guessing.
- candidates: none (unmatched)
- title: 6. حارس تحليلي: حجم العينة والموثوقية
- nearest heading: 5. تطبيق 2 — الممثل المفضل عند العملاء الرجالة (ومصيدة الـ grain) (`sql:12#section-5`)

**Text**

```text
📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 6. حارس تحليلي: حجم العينة والموثوقية متوسط مبني على 3 تقييمات مش بنفس قوة متوسط مبني على 1000. مثال: الترتيب الساذج بيحط A الأول، لكن البيزنس غالبًا يفضّل B كإشارة أوثق. حل عملي: ضيف حارس جودة بيانات في الـ KPI: HAVING COUNT(r.rating) = 30
```

**Before**
- `sql:12#section-4`: 📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 4. تطبيق 1 — فلوس كل عميل السؤال: كل عميل صرف كام على استئجار الأفلام؟ SELECT r.customer id, SUM(m.renting price) AS total spent FROM renting AS r LEFT JOIN movies AS m ON r.movie id = 
- `sql:12#section-5`: 📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 5. تطبيق 2 — الممثل المفضل عند العملاء الرجالة (ومصيدة الـ grain) السؤال: مين الممثل المفضل عند العملاء الرجالة؟ لازم الأول تحدد "مفضل" يعني إيه: الأكتر مشاهدة؟ الأعلى تقييم؟ الأعلى تقي

**After**
- `sql:12#section-7`: 📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 7. تعريف الـ Metric قبل الـ SQL كلمة "مفضل" أو "أفضل" مش metric دقيقة بذاتها. قبل ما تكتب أي SQL حدد:
- `sql:12#section-8`: 📊 12 — Analytical SQL Patterns — Comprehensive Reference Translate the MovieNow business question into a grain-safe analytical query. 8. الحالة المتكاملة الختامية — قرار استثمار MovieNow هل العملاء بيدّوا تقييمات أحسن للأفلام الأحدث، وهل النمط بيختلف حسب دولة العميل؟ السياق MovieNow بتفكر تستثمر في أفلام جديدة، والأفل

**Decision to write**

```json
{
  "unitId": "sql:12#section-6",
  "scope": "batch-review",
  "batchId": "batch-772d6a952ac6",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 5. `dv:ar-references#foundational`

- family: `visualization` | language: `ar` | forms: lesson-section
- locator: `pages[slug=ar-references] > كتب (Foundational)` | href: `/learn/ar/references/`
- unmatched reason: `thin-fragment` — Heading or fragment without a complete proposition; too little context to identify a concept without guessing.
- candidates: none (unmatched)
- title: كتب (Foundational)
- nearest heading: 📚 أفضل المراجع العالمية (Curated References) (`dv:ar-references#curated-references`)

**Text**

```text
أفضل المراجع العالمية (Curated References) كتب (Foundational) Edward Tufte — The Visual Display of Quantitative Information مرجع كلاسيكي للتفكير في “الكثافة المعلوماتية” وتقليل الـChartjunk. Cleveland & McGill — مبادئ “دقة الترميزات” (Position vs Area vs Color).الفكرة الأساسية: الموضع أدق ترميز بصري. Wilkinson — The Grammar of Graphics أساس فكري مهم لفهم كيف تُبنى الرسوم كـ“قواعد” قابلة للتركيب. Hadley Wickham — ggplot2 (كمثال عملي على Grammar of Graphics).
```

**Before**
- `dv:ar-reading-paths#3-exam-interview-prep`: مسارات قراءة مقترحة (Beginner → Advanced) المسار 3: Exam / Interview Prep (مصائد شائعة) ⚠️ الجزء 11: الأخطاء الشائعة وفخاخ الامتحانات Quick Reference & Exam Prep رجوع سريع إلى 🧭 الجزء 2: إطار اختيار الرسم البياني (أساسي ومتقدم) إذا قلت لي جمهورك (Executive / فريق تقني / طلاب) ونوع بياناتك (زمنية/فئات كثيرة/قيم تمتد عب
- `dv:ar-references#curated-references`: أفضل المراجع العالمية (Curated References) 📚 أفضل المراجع العالمية (Curated References)

**After**
- `dv:ar-references#section-3`: أفضل المراجع العالمية (Curated References) ألوان وإدراك بصري Cynthia Brewer (ColorBrewer) — مرجع عملي لاختيار Palettes. Viridis (Perceptually uniform palettes) — خيار آمن ومتوافق مع عمى الألوان غالبًا.
- `dv:ar-references#applied`: أفضل المراجع العالمية (Curated References) أفضل ممارسات عملية (Applied) Storytelling with Data (Cole Nussbaumer Knaflic) ممتاز لتحسين الوضوح التنفيذي والـAnnotation. Information Dashboard Design (Stephen Few) قوي جدًا لبيئات الـBI والـDashboards.

**Decision to write**

```json
{
  "unitId": "dv:ar-references#foundational",
  "scope": "batch-review",
  "batchId": "batch-772d6a952ac6",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 6. `stats:s29`

- family: `statistics` | language: `en` | forms: lesson-section, formula, table
- locator: `sections[id=s29]` | href: `/learn/statistics/source/#s29`
- unmatched reason: `thin-fragment` — Heading or fragment without a complete proposition; too little context to identify a concept without guessing.
- candidates: none (unmatched)
- title: Independent and Dependent Variables
- nearest heading: RCT vs A/B Testing (`stats:s28`)

**Text**

```text
Independent and Dependent Variables 29. Independent and Dependent Variables 29. Independent and Dependent Variables Independent Variable : المتغير الذي نتوقع أنه ليس متأثرًا بالـ Response في صياغة الفرضية، وغالبًا يمثل Treatment أو Predictor. Dependent Variable : النتيجة التي نتوقع أن تتأثر بالـ Independent Variable. في الرسوم مثل Scatter Plot: Independent Variable عادةً على X-axis . Dependent Variable عادةً على Y-axis . مثال: Vitamin C supplementation = Independent Variable، وGender birth ratio/response المقاس = Dependent Variable في المثال التعليمي.
```

**Before**
- `stats:s27`: Blinding وPlacebo 27. Blinding وPlacebo 27. Blinding وPlacebo Blind Trial المشاركون لا يعرفون هل هم في Treatment أم Control. هذا يقلل تأثير توقعات المشاركين على النتائج. Placebo بديل يشبه Treatment لكنه لا يحمل التأثير العلاجي الحقيقي، ويُستخدم كثيرًا في التجارب السريرية. Double-Blind Randomized Controlled Trial المشار
- `stats:s28`: RCT vs A/B Testing 28. RCT vs A/B Testing 28. RCT vs A/B Testing يمكن أن تحتوي RCT على أكثر من Treatment Group، مثل مقارنة جرعات مختلفة من دواء. في الصناعة، يُستخدم مصطلحA/B Testingغالبًا لتجربة نسختين: A = Control B = Treatment والـ A/B Testing في أبسط صوره يقسم المشاركين إلى مجموعتين فقط. أمثلة: زر جديد مقابل زر قديم

**After**
- `stats:s30`: Correlation 30. Correlation 30. Correlation Correlation طريقة لقياس العلاقة بين متغيرين. نبدأ غالبًا بـScatter Plotلرؤية شكل العلاقة بصريًا. 30.1 Pearson Correlation Coefficient يرمز له بـ (r)، ويتراوح بين: وهو يقيسStrength and Direction of a Linear Relationship. Direction : Positive relationship؛ عندما يزيد X يميل Y إ
- `stats:s31`: Pearson Correlation وLinear Relationships 31. Pearson Correlation وLinear Relationships 31. Pearson Correlation وLinear Relationships Pearson correlation يقيسLinear Relationship. إذا كانت العلاقة قوية لكنها Curved / Non-linear، فقد يكون Pearson (r) منخفضًا رغم وجود علاقة واضحة. إذن: r ≈ 0 لا يعني بالضرورة عدم وجود أي ع

**Decision to write**

```json
{
  "unitId": "stats:s29",
  "scope": "batch-review",
  "batchId": "batch-772d6a952ac6",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## After the batch

1. Append the decisions to `intelligent-atlas/semantic/review-decisions.json`.
2. Run `node intelligent-atlas/tools/review-workbench.mjs check`.
3. Run `node intelligent-atlas/tools/build-semantic-ledger.mjs`.
4. Run `node intelligent-atlas/tools/review-workbench.mjs coverage`.
