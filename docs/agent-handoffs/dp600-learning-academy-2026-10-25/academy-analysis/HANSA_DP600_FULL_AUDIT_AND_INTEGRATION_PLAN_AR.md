# Hansa × DP-600 — تقرير تحليل المصدر والخطة التنفيذية الشاملة

**نوع التسليم:** تحليل مصدر / تصميم خبرة تعلّم / مخطط تكامل جاهز للتنفيذ — **ليس تعديلًا منشورًا للموقع**  
**المصدر:** `DP-600-Study-Guide-EN.pdf` (67 صفحة؛ Exam DP-600 Study Guide؛ Skills outline 19 October 2026)  
**تاريخ الدراسة:** 25 أكتوبر 2026  
**نطاق الفحص:** النصوص والجداول والأشكال المتجهية والأمثلة البرمجية والأسئلة والإجابات والمعامل والروابط والملحقات.  
**حدّ التحقق:** تمت معاينة الصور المصغرة لجميع الصفحات الـ67، وحفظ النص المستخرج والمراجع ورابط الصفحة وفحص أمثلة عالية المخاطر مقابل مستندات Microsoft. لم يتم تشغيل SQL/DAX/KQL على Microsoft Fabric حقيقي، ولم تُفحص شجرة ملفات Hansa المحلية، ولم تُجرَ مراجعة بشرية حرفية ثانية لكل خانة/حرف في التنسيق البصري. لا تُفسَّر هذه المرحلة على أنها تصديق علمي كامل لكل عبارة في المصدر.

---

## أ — الجواب الإداري والتصميمي

### النتيجة

لا ندمج **PDF Reader** على Hansa، بل نطلق **Hansa DP-600 Learning Academy** داخل قسم التعليم، وتظل وثيقة الـPDF هي «المصدر الأرشيفي» مع رابط صفحة دقيق لكل وحدة. نتعامل مع **الفهم + القرار + الممارسة + اختبار الاستدعاء + علاج الخطأ** بوصفها النواة. لا نضع هذا المسار في صدارة Landing Page ولا نجعله يحوّل البورتفوليو الشخصي إلى منصة امتحانات متزاحمة. ونحافظ على بنك DP-600 القائم وأي Labs وVideos وشرح موجود دون استبداله أو تكراره.

### السياسة الذهبية

`Source preserved → scientific QA → atomic learning objects → interactive activities → questions/labs → spaced review → readiness dashboard`.

مصدر تعليمي غير متحقق علميًا بالكامل **لا يدخل Learning Mode في صورة إجابة جازمة**؛ يوضع في Evidence/QA backlog، ثم يعتمد بمصدر Microsoft مؤرخ أو اختبار عملي.

### ما يمكن إثباته من الملفات/الخدمة

- الملف به **67 صفحة**، قرابة **14,941 كلمة مستخرجة** و**109,642 حرفًا** موزعة على **2,724 سطرًا نصيًا** (مقاييس أداة PyMuPDF؛ تختلف عن فواصل الأسطر المنطقية في القالب).
- الرابط الداخلي والخارجي: **329 موضع ربط**؛ منها **243 رابط URL خارجي** و**158 عنوان URL خارجي فريد** والباقي أهداف داخلية/غير URL. هذه أعداد استخراج **وليست** إثبات أن كل رابط يعمل حاليًا.
- الرسوم والجداول في الغالب **vector/text PDF objects** وليست 67 صورة نقطية؛ تم عد **4,697 عنصر رسم متجهي**، وهو عدد أدوات رسم لا عدد الرسوم المستقلة. لا يجوز إعادة بناء جميع الرسوم من النص وحده.
- **3 مجالات رسمية**: Maintain 25–30%؛ Prepare 45–50%؛ Semantic Models 25–30%. المصدر مؤرخ على skills 19 Oct 2026؛ متوافق مع Microsoft Learn.
- **8 فصول تدريسية** مرقمة 1–8؛ قبلها Chapter 0؛ بعدها 22 Hands-on Labs في Chapter 9؛ و20 سؤال Practice في Chapter 10؛ و30 سؤال Self-check موزعة على الفصول 2/3/4/5/7/8؛ وقائمة المراجعة والغلاسوري، و4 جداول قرار، وفهرس روابط Appendix B.
- قاعدة الأسئلة الموجودة بموقع Hansa (المذكور في سياق المشروع أنه يحتوي 834 سؤالًا) **يجب إعادة جردها من المستودع المحلي قبل الربط**؛ الأرقام/الحالة الحالية للموقع ليست مثبتة هنا. تمت قراءة إعدادات ونشر Worker `hansa` من Cloudflare، لكن فشل جلب صفحات الموقع مباشرة عبر أداة الويب، فلا أدّعي فحص DOM أو مساراته الحالية.

---

## ب — خريطة الدليل الأصلية إلى وحدات التعليم

| الوحدة | المصدر | كل المفاهيم الداخلة | أفضل نشاط تفاعلي | الدليل المطلوب من الطالب |
|---|---:|---|---|---|
| Orientation | ص5–7 | المهارات، الأوزان، آلية الاختبار، خطة 6 أسابيع، أنواع التنبيهات | تقييم قبلي + Study-plan builder | خطة شخصية وBaseline نقاط الضعف |
| Fabric foundations | ص8–12 | Fabric Stack، Tenant/Capacity/Domain/Workspace/Item، OneLake، Shortcut/Mirroring/Copy، Medallion، كل Store وكل Item | مخطط استكشافي + Architecture Builder + Decision Tree | اختيار Store+Ingestion مع سبب |
| Security & Governance | ص13–18 | كل Workspace roles، Read/ReadData/ReadAll/Build، OneLake/SQL Security، RLS DAX/T-SQL/KQL، CLS/OLS/DDM، Labels، Promotion/Certification/Master Data | Access Decision Simulator ومصفوفة أدوار ببيانات مجهولة | قاعدة أقل صلاحية مع تفسير جميع الطبقات |
| ALM & Deployment | ص19–23 | Git integration، branch/PR، PBIP/PBIX/PBIT/TMDL، pipelines stages/rules، variable library، lineage/impact، XMLA، reusable assets وPBIDS | CI/CD Workflow Simulator + Impact Graph | خطة إطلاق Dev→Test→Prod مع binding |
| Get Data | ص24–27 | Connections، Gateway/VNet، Entra/auth، privacy، OneLake Catalog/Real-Time Hub، 7 routes، Eventhouse availability، model integration | Ingestion Wizard + Latency/Copy/Destination controls | قرار يتعامل مع تكلفة النسخ وFreshness |
| Transform | ص28–33 | Dataflow Gen2/Spark/Warehouse SQL، query folding، star schema، granularity، SCD/surrogate، SQL/PySpark code، CTAS، aggregates، data quality، dedup، TRY_CAST، views/functions/procedures/MERGE | Drag schema + Grain inspector + Fix-the-pipeline + Code review | جدول Gold صحيح وكود قابل للتفسير |
| Query & Analyze | ص34–37 | Visual query editor، T-SQL Window/CTE، KQL summarize/bin/top/arg_max، DAX CALCULATE/KEEPFILTERS/context، مقارنة المثال بين 3 لغات | Query Translator/Tutor + Code Sequencer + Data preview | اختيار الاستعلام الصحيح وتبرير الفروق |
| Semantic Design | ص38–43 | Import/DQ/Direct Lake/Dual، relationships/bridge/m2m/USERELATIONSHIP، DAX iterators/window/info، calculation groups، dynamic formats، field parameters، large model، composite models | Relationship Sandbox + DAX Context Lab + Storage selector | حل Business Case بلا relationships ملتبسة |
| Optimization | ص44–48 | Performance Analyzer، DAX/visual/CU/query bottleneck، storage vs formula engine، Direct Lake transcoding/framing/fallback/guardrails، OneLake vs SQL endpoint، incremental refresh/partition/folding | Performance Doctor + Direct Lake engine animation + Partition Simulator | تحديد الاختناق وتصحيحه في سيناريو عملي |
| Microsoft Labs | ص49 | **22 معملًا بأسمائها الدقيقة** (في Registry JSON) | Lab tracker + prerequisites + evidence + link back to theory | Proof of work؛ لا تفترض التشغيل من الموقع نفسه |
| Practice Questions | ص50–51 | **20 سؤالًا، إجابات وتفسير** | Close-book quiz engine؛ Feedback بعد التسليم | محاولات مخزنة مرتبطة بالمهارة |
| Exam Day & Glossary | ص52–55 | خطة الأسبوع الأخير، 60-second recall، تحليل الصياغات، glossary، ما بعد الشهادة | Flashcards + Exam readiness + mistake journal | جلسة مراجعة موجهة حسب أخطائه |
| Appendix A | ص56–57 | **4 جداول قرار**: store / ingestion / security / lifecycle | Decision Assistants بمدخلات وشروط | قرار + Rule explanation + counterexample |
| Appendix B | ص58–67 | سجل روابط Microsoft Learn من أوله لآخره | Resource Library مرتبطة بالمفهوم والصفحة والمراجعة | توثيق مرجع علمي أو تحقق عملي |

**ملاحظة مهمة:** Chapter 1 وChapter 6 لا يحتويان Self-check بالصيغة نفسها، ولا يجوز اختلاق أسئلة ونسبتها للكتاب. يمكن تأليف أنشطة إضافية جديدة واضحة المصدر/الهوية.

---

## ج — الترتيب المثالي للتعلم، من دون فقدان ترتيب الدليل

نحافظ على قائمتين مستقلتين ومترابطتين:

1. **Source Order**: الدليل الأصلي حرفيًا وفق Chapter 0 → Chapter 11 → Appendices، مع إظهار Page Reference. يفيد المراجعة والتدقيق.
2. **Learning Path** (افتراضي): Orientation → Platform → Get Data → Transform → Query → Semantic Design → Optimization → Security/Governance → Lifecycle → Integrated Capstone → Exam Readiness. لكن تسمح الـDependency graph بتقديم Security قبل الدخول في Lab يتطلب الصلاحيات، وGit قبل مشروع Capstone الذي يتطلب النشر.

ويظل في القائمة **Exam Objectives View** مطابقًا لثلاثة مجالات Microsoft الرسمية، و**Six-week Plan View** مطابقًا للأسابيع الستة بالدليل، ولا نخلط بينها وبين Navigation؛ الثلاثة مجرد Views لنفس Lesson IDs، وليسوا ثلاث نسخ محتوى.

### مثال مسار المتعلم في كل Lesson

`Why should I care? (30s) → Micro-explanation (2–4m) → Interactive model → Choose/diagnose → Immediate reasoning feedback → 1 scenario question → Lab handoff → 24h/7d review`.

يُمنع اعتبار «اقرأ الفقرة + اضغط Next» نشاطًا تفاعليًا. لا يُعتبر الدرس Completed إلا بأدلة تطبيقية محددة، وتكون إعادة المراجعة اختيارية دون إجبار القارئ على اختبار في كل تمريرة.

---

## د — تجربة Hansa المقترحة (UX / IA)

### شجرة الروابط (مقترحة؛ لا تُعتبر مسارات فعلية مُراجعة بالموقع)

```text
Hansa
├── Portfolio / Projects                      [احتفظ بتركيزها المستقل]
└── Learn
    └── Microsoft Fabric
        └── DP-600 Learning Academy           /learn/dp-600
            ├── Overview + Choose your goal   /learn/dp-600/overview
            ├── Learning Path                 /learn/dp-600/path
            ├── Skills Explorer               /learn/dp-600/skills
            ├── Module                        /learn/dp-600/module/[slug]
            │   └── Lesson                    /learn/dp-600/lesson/[slug]
            ├── Labs                          /learn/dp-600/labs
            │   └── Lab                       /learn/dp-600/labs/[id]
            ├── Decision Lab                  /learn/dp-600/decisions
            ├── Questions (existing bank)     /learn/dp-600/questions
            ├── Exam Simulator                /learn/dp-600/exam
            ├── Review mistakes              /learn/dp-600/review
            ├── Glossary                      /learn/dp-600/glossary
            ├── Source & References           /learn/dp-600/resources
            └── My Progress                   /learn/dp-600/progress
```

**حُكم IA:** لا نضع Overview وPath وSkills وLabs وQuestions كلها في Global Navigation. واجهة Hansa العليا تحتوي `Learn` فقط، وداخل الأكاديمية شريط مصغر/Sidebar وسلة Breadcrumbs، وقائمة هاتف قابلة للطي. أسماء الموقع الدقيقة تُحسم بعد Repo reconnaissance لا من التخمين.

### الشاشة الأولى للمسار

- عنوان واضح «DP-600: Learn by Doing»؛ شهادة Microsoft والدليل *مصدر مستقل* لا اعتماد رسمي.
- **اختيار هدف**: Start from zero / Fill gaps / Practice only. يحدد أنسب مدخل بدون تغيير بيانات المستخدم.
- 3 Domain cards بتوزيع الوزن الصحيح، مع «وقت مذاكرة تقديري» لا يوحي بضمان النجاح.
- Resume activity، Weakest topics، Next lab، Readiness (علمي ومتحفظ).
- رابط واضح للدليل الأصلي، ومؤشر «Content updated / Needs review»، وزر Reset للتقدم المحلي.

### الشاشة الداخلية للدرس

شبكة desktop مبدئية `sidebar 240px + reading main max-width 760px + optional right rail 240px`. على Mobile تظهر فقط العناوين القابلة للتوسع والنشاط الأساسي. كل درس يحوي Context/Decision/Practice/Source وليس كل شيء في Accordion طويل.

تفاعلات Canvas ولوحات المقارنة تظهر فقط عندما تزيد الفهم، لا لأن مكتبة BeUI أو Recharts قادرة على رسمها. لا رسوم بيانية زخرفية لنصوص صلاحيات أو فروق ثابتة.

### سيناريوهات تطبيقية أساسية (شاشات حقيقية مطلوبة)

**Scenario 1 — Shortcut vs Mirroring vs Copy:** المستخدم يختار مصدر البيانات، حاجة تحويل، نقل مسموح؟، زمن تأخير مقبول، حجم، صلاحيات. المحرك يقترح أداة ويفسّر حدودها، ويختبر حالة مقابلة تغير القرار. يأتي من ص9–10 وص25 وص56.

**Scenario 2 — Security Access Matrix:** الطالب يحدد نوع الوصول المطلوب (`SQL query` أو `Spark files` أو `Create report`)، دوره والصلاحية، ونوع Data Lake/SQL/Direct Lake. تعرض النتيجة «مسار التفويض» بوضع الخطأ قرب الـgate الصحيح لا رسالة عامة. يأتي من ص13–18 وص56.

**Scenario 3 — Star Schema Studio:** بطاقات `FactSales`, `DimDate`, `DimProduct`, `DimCustomer`, `DimStore`؛ يختار grain، العلاقات، مفاتيح Surrogate، اتجاه التصفية، ثم يحصل على نتائج DAX المتوقع وتلميحات SCD. يأتي من ص28–30.

**Scenario 4 — Query Surface:** نفس الطلب الإداري (أفضل خمس فئات مبيعات في 2026) يُنفذ ذهنيًا على SQL وKQL وDAX؛ بيانات تدريب صغيرة مشتركة للتصور. المستخدم يختار الترتيب الصحيح، ويقارن output متوقعًا؛ لا ندّعي أن الموقع يقوم بتنفيذ Fabric T-SQL/KQL فعلًا من دون محرك متصل. يأتي من ص34–37.

**Scenario 5 — Direct Lake Doctor:** slider لتغير ملفات Delta، حجم row groups، اختيار OneLake vs SQL، views/RLS/fallback، مع animation metadata framing vs transcoding vs DirectQuery fallback. P47 يجب احترام أن Direct Lake on OneLake **لا يقبل fallback**. يأتي من ص38 وص44–48.

**Scenario 6 — ALM Dependency Graph:** المستخدم يغيّر table/schema أو Deploy Test→Prod مع variable library، ثم يرى التقارير المتأثرة والحل؛ لا يحاكي صلاحيات الإدارة اختصارًا. يأتي من ص19–23.

**Scenario 7 — Performance Clinic:** حالة فيها time breakdown Visual rendering / DAX / network / capacity؛ المستخدم يختار root-cause لا مجرد «أفضل DAX». يأتي من ص44–48.

---

## هـ — قواعد التحويل من PDF إلى محتوى ذكي بدون فقد

### مصدر مرجعي غير قابل للمس

الاحتفاظ بمخرجات متوازية:

- `original_pdf`: ملف البايت الأصلي كما هو + SHA-256 + ترخيص/مصدر.
- `source_text`: صفحة/فقرة بنصها الأصلي دون تصحيح خفي.
- `source_links`: موضع الـURL واسم المورد وURL دلالي أصلي؛ لاحقًا `last_checked_at`, `http_status`, `redirect_target`.
- `source_diagrams`: شكل vector rendered/cropped وبجانبه شرح بنيوي بشري وعناصر SVG دلالية عند اللزوم.
- `learning_content`: مفاهيم ونشاطات ومصطلحات وروابط مصادر وأمثلة، مع `qa_status` و`version`.
- `scientific_correction`: النص الأصلي، البديل، الرابط الرسمي، تاريخ التحقق، سبب التصحيح والنسخة التي طبّقته.

### Schema المحتوى المقترح

```ts
type SourceRef = {
  documentId: 'dp600-study-guide-en-2026-10';
  page: number; section?: string;
  originalQuote?: string; verifiedSourceUrl?: string;
};
type LearningUnit = {
  id: string; slug: string; title: string;
  domain: 'foundation' | 'prepare' | 'semantic' | 'maintain' | 'review';
  objectiveIds: string[]; prerequisites: string[];
  sourceRefs: SourceRef[];
  activityIds: string[]; labIds: string[]; questionIds: string[];
  difficulty: 'foundation' | 'applied' | 'exam';
  qaStatus: 'source-only' | 'review-needed' | 'verified' | 'runtime-validated';
  publicationStatus: 'draft' | 'approved' | 'published';
  contentVersion: string;
};
type Attempt = {
  questionId: string; answer: string[]; correctness?: boolean;
  misconceptionId?: string; attemptedAt: string; contentVersion: string;
};
```

**لا تعتمد على page number كـlesson ID**: الصفحة الواحدة تضم أكثر من مفهوم، والمفهوم قد يعبر صفحتين. استخدم canonical stable IDs، وروابط المصدر `SourceRef` متعدد-to-متعدد.

### قواعد المحتوى

- حفظ كل Code block حرفيًا في طبقة Source، ثم نسخة **Corrected and verified** منفصلة للتعلم؛ لا تعيد كتابة مثال خاطئ وكأنه اقتباس.
- استخراج بنية كل جدول ورسم *بعد فحصه بصريًا*. العدّ الآلي للعناصر المتجهية لا يعادل عدّ الرسومات.
- كل تعريف يحتوي `What / When / Why / When NOT / Limitation / Exam trap / Example / Source` حسب الحاجة.
- كل Quiz question فيه `source_page`, `correct answer`, `why`, `why not other options`, `confidence`, `skill ID`, `origin: original/enhanced`, `reviewed_at`.
- لا تدخل نصوص أسئلة أصلية في بنك الموقع الحالي قبل فحص canonicalization والازدواج؛ الأفضل ربطها بمنتقى الأسئلة الموجود وتوفير Original Guide Mode للـ50 سؤالًا فقط.
- روابط المصدر الأصلية تتضمن contributor tracking parameter. احتفظ بها في الأرشيف وقرّر صراحةً سياسة Attribution/حقوق إعادة النشر قبل إظهار الدليل كاملًا للزوار.

---

## و — التخصيص والمراجعة الفعالة

### Activity-based mastery وليس نسبة قراءة

`Progress`: عدد أنشطة learning objectives المكتملة؛ ليس scrolling أو وقت الصفحة.  
`Mastery`: تقدير متحفظ مبني على أداء أسئلة **غير مكررة** وتطبيقات قصيرة، مع خصم الأخطاء المتكررة، بدون اعتبار 700 scaled exam score = 70% correct.  
`Readiness`: قياس تغطية الـofficial objectives والمهارات الأساسية؛ أوزان المجالات نطاقات، فلا تجمع midpoints مباشرة كأنها تساوي 100؛ اختَر توزيعًا مجموعُه 100 وصرّح بأنه heuristic.  
`Review`: Wrong/Guessed/Slow/Expired items في spaced repetition (إعادة تذكير عند 1/3/7/14 يوم كإعداد أولي قابل للتعديل، وليس قاعدة طبية/علمية قاطعة).

### أمثلة تطبيق التخصيص

- أخطأ في السؤال عن SQL `GRANT` مقابل OneLake: يعرض مقارنة Scope ثم Access Matrix ثم Retry بصياغة جديدة.
- أخطأ في `Dual` مقابل `Direct Lake`: يعرض prerequisites حول storage modes ثم نموذج Composite ثم سؤالين مختلفين.
- عرف الإجابة لكنه اختارها بالتخمين: يُحتسب Success with low confidence ولا ينتقل فورًا إلى mastered.
- لديه خبرة SQL جيدة: يمكنه تخطي الشرح الأساسي بعد diagnostic، لكن يبقى سؤال scenario صعب ومهمة KQL.

### حالات التقدم التي تُعرض للطالب

`Not started → Exploring → Practising → Proficient → Needs review`؛ ليست نسبًا زائفة بالضرورة. الممارسة العملية خارج الموقع يثبتها الطالب يدويًا أو عبر رفع إثبات (ميزة لاحقة، مع مراجعة الخصوصية)، ولا ندّعي فحص tenant خارجيًا دون تكامل موثق.

---

## ز — الهندسة التقنية المقترحة مع BeUI / Next.js / Cloudflare

### قيود يجب احترامها

Hansa سبق أن شُغّل ضمن سير عمل Next.js static export إلى Cloudflare Worker assets-only. لا تتصرف على أساس أن الموقع يمتلك SSR/API/قاعدة بيانات أو مصادقة؛ اقرأ `package.json`, `next.config.*`, `app/`, `src/`, `public/`, `wrangler.*`, محتوى question bank، والـcomponents الموجودة أولًا.

**المرحلة الأولى على الخطة المجانية:** أنشطة client-side، محتوى typed JSON/TS/MDX موقّع/مراجع، Search محلي، progress على localStorage/IndexedDB مع Import/Export JSON؛ التقدم **لا ينتقل تلقائيًا بين أجهزة مختلفة**. لا تضع الـanswers داخل شكل يشجع التسريب غير المقصود إذا كان الهدف محاكاة امتحان، مع إدراك أن static bundle قابل للقراءة.

**مرحلة لاحقة إذا لزم sync فعلي:** Cloudflare Workers API + D1 مع Authentication مناسبة، consent/privacy، rate limits، per-user scoping، backup/migrations. لا تقدّم server storage أو Workers AI كجزء مفترض من البنية الحالية.

### أنماط مكونات واجهة الاستخدام

| فكرة | مكونات/تقنية مناسبة | تنبيه |
|---|---|---|
| Concept cards، progressive disclosure، steps | BeUI حيث توجد ملائمة وظيفية | لا تتحول لسلسلة كروت طويلة |
| رسم السكيما / الرسم البياني للعلاقات | React Flow أو SVG تفاعلي | Accessible table/outline بديل عن canvas |
| Graph العلاقات/Impact analysis | React Flow | تجنب تخطيط force يربك التعلم |
| توزيع أوزان المجالات والـprogress | BeUI chart أو Recharts إذا يحتاج مقارنة فعلية | ليس Pie لمجرد الزينة |
| SQL/KQL/DAX أمثلة | Shiki code panels / Monaco *اختياري* | لا تصف syntax highlighting بأنه Execution |
| Decision trees | Stateful React components داخل design system | يختار القرار ويفسر ثمن البدائل |
| Flashcards وQuiz | موجود Hansa Question Engine بعد تدقيقه | استعمل نفس tracking model أو adapter واضح |
| المراجعة والنتائج | Recharts sparingly، Plain tables، Text feedback | WCAG high contrast وأزرار بالحجم المناسب |

### UI requirements

- WCAG 2.2 AA: تنقل keyboard، focus مرئي، مسميات قارئ شاشة، aria-live محدود للإجابات، non-color-only feedback، reduced-motion، touch targets، RTL shell عربي مع `dir=ltr` للأمثلة الإنجليزية/الكود، خطوط قابلة للتكبير، لا drag-and-drop حصري.
- لا تدخل «سيموليتر» يعطي تقييمًا اختباريًا خاطئًا؛ deterministic fixtures اختبرها أولًا على أمثلة معروفة.
- كل نشاط له `Reset / Hint / Explain / Check answer / Source page / Report an error` حيث المناسب.
- دعم deep-link to lesson/activity، ومسارات Android/iOS والخروج/العودة والـrefresh وoffline state recovery.
- تحميل Lazy للرسوم وأدوات محرر الكود مع عدم تضخيم الـJS الأساسي.

---

## ح — مراجعة علمية: سجل أولويات قبل النشر

**قاعدة:** كل صف أدناه يحدد **نص المصدر** ثم **ملاحظتنا**. `VERIFIED-CONFLICT` يعني تعارض مباشر مثبت بمصدر Microsoft؛ `REQUIRES-REVIEW` يعني يجب التحقق عمليًا/تفصيليًا قبل اعتماده. لا يدّعي هذا السجل فحص كل حقيقة من الـ67 صفحة اختبارًا مستقلًا.

| ID | صفحات | الخطورة/الحالة | المسألة | القرار التنفيذي |
|---|---|---|---|---|
| QA-01 | 12، 47 | **P0 VERIFIED-CONFLICT** | الادعاء بأن Lakehouse يُنشئ default semantic model تلقائيًا، والإشارة إلى default model في Direct Lake. توقفت النماذج الافتراضية الآلية في 5 سبتمبر 2025. | تحديث Learning text وإظهار الخطوات الصحيحة لإنشاء model جديد، حفظ الأصل في Source view. |
| QA-02 | 29–30، 33، 53 | **P0 VERIFIED-CONFLICT** | عبارة `Fabric Warehouse has no IDENTITY` و`Use ROW_NUMBER()` كتعويض إلزامي أصبحت غير صحيحة؛ Microsoft توثق `BIGINT IDENTITY` مع قيود فريدة (بلا seed/increment مضمون). | تصحيح Star Schema lesson وجداول قرار والـSelf-check #2 وكل flashcard تشير للقاعدة القديمة. |
| QA-03 | 29، 32 | **P0 CODE-INCONSISTENCY** | تعريف `DimProduct.ProductKey INT NOT NULL` بينما `MERGE ... WHEN NOT MATCHED THEN INSERT (ProductId, ProductName, ListPrice)` لا يولد/يعطي قيمة `ProductKey`. | تعديل المثال عبر Schema متحقق و`BIGINT IDENTITY` أو توليد قيمة key مضبوط؛ اختباره على Warehouse runtime. |
| QA-04 | 7 | **P1 VERIFIED-CONFLICT** | نص تجربة Fabric يوحي بأن 60 يومًا تعني دائمًا F64 وأن PPU يتضمن سعة Fabric مجانية؛ التوثيق يذكر F4 أو F64 مع شروط trial. | إعادة صياغة شروط الإتاحة وعدم وعد الطالب بموارد غير مضمونة. |
| QA-05 | 8، 11 | **P1 OVERGENERALIZATION** | «كل Workloads persist to OneLake» وأن «لا نسخة» على الإطلاق؛ Eventhouse يُنشر إلى OneLake باختيار availability، وMirroring ينسخ. | إضافة Store-by-store data location and availability، وبيان أين توجد نسخة/اتساق. |
| QA-06 | 17 | **P1 VERIFIED-NUANCE** | «Sensitivity labels flow automatically» دون استثناءات. Microsoft تذكر mode وقيود inheritance والتصدير. | Quiz يعتمد Source/Target/Mode/Supported path بدل «دائمًا». |
| QA-07 | 29 | **P1 VERIFIED-NUANCE** | «mark date table mandatory» بشكل عام؛ Microsoft تستثني كثيرًا من Calendar-based time intelligence الجديد من Mark as Date Table. | اعرض Classic vs Calendar-based والقيود الرسمية مع مثال. |
| QA-08 | 13–16، 47 | **P1 REQUIRES-REVIEW** | تداخل OneLake security وworkspace permissions وSQL endpoint delegated identity وDirect Lake SSO معقد، وبعض القواعد صيغت مطلقة. | رسم Security policy matrix للمسارات/identity mode، وتجربة حسابات ذات أقل صلاحية قبل أسئلة قطعية. |
| QA-09 | 30–32 | **P1 CODE-VALIDATION** | مثال PySpark overwrite وSpark `MERGE INSERT *` يحتاج اختبار schema/key وidempotence وSCD مقابل مجرد syntax. | Fixtures + expected output + repeated run test؛ لا يقدم كحل enterprise مكتمل. |
| QA-10 | 45–48 | **P1 RUNTIME-REVIEW** | Direct Lake fallback وGuardrails وmodel flavor تعتمد إعدادات وسعة/تحديثات متغيرة؛ بعض الأمثلة تحتاج مقارنة دقيقة. | Rule engine بجدول مصدر وتاريخ تحقق؛ اختبار runtime بمرجع docs و`TABLETRAITS()`. |
| QA-11 | 49 | **P2 PEDAGOGY** | «Reading gets you to about 500 points; last 200 come from labs» تقسيم دعائي لا تدعمه آلية scaled scoring. | استبداله بتوجيه مهاري غير رقمي مع تأكيد أن 700 ليس نسبة 70%. |
| QA-12 | 6، 44 | **P2 PRESENTATION** | نطاق 40–60 سؤالًا و«8 visuals or fewer» إرشادان تقريبيان، لا قانونا امتحان أو أداء ثابتان. | وضع `heuristic / not guaranteed` بجوارها. |

**المراجع الرسمية المؤيدة:**  
[Microsoft Learn — Official DP-600 exam outline](https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-600)  
[Microsoft Learn — Default semantic model change](https://learn.microsoft.com/en-us/fabric/data-warehouse/manage-semantic-model)  
[Microsoft Learn — IDENTITY in Fabric Warehouse](https://learn.microsoft.com/en-us/fabric/data-warehouse/identity)  
[Microsoft Learn — Fabric Trial](https://learn.microsoft.com/en-us/fabric/get-started/fabric-trial)  
[Microsoft Learn — Direct Lake behavior](https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-how-it-works)  
[Microsoft Learn — Direct Lake Security](https://learn.microsoft.com/en-us/fabric/get-started/direct-lake-manage)  
[Microsoft Learn — Sensitivity Label Inheritance](https://learn.microsoft.com/fabric/governance/service-security-sensitivity-label-downstream-inheritance)  
[Microsoft Learn — Date tables](https://learn.microsoft.com/en-us/power-bi/guidance/model-date-tables)  
[Microsoft Learn — Eventhouse OneLake availability](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-house-onelake-availability).

---

## ط — مراحل التنفيذ، التسليمات، واختبارات القبول

### Phase 0 — Repo Reconnaissance / No edits

**P0:** تثبيت snapshot للموقع والـbranch؛ جرد routes، components (BeUI ومكتبات رسوم)، أسماء lesson/bank IDs، السؤال الموجود (المذكور سابقًا 834)، المراجعات السابقة وsource files، Cloudflare static deployment constraints، قياس bundle baseline، تسجيل routes ومسارات المحتوى والتعليم في Hansa.

**Gate:** تقرير inventory مثبت يوضح ما نعيد استخدامه وما نضيفه؛ لا تبدأ في landing page أو تغيّر أولويات Projects.

### Phase 1 — Source preservation + parsing

استيراد الـ67 صفحة مع checksums، تقسيم sections/components من الصور/النص بعد مراجعة، حفظ الروابط ومعانيها؛ نسخ الأكواد الأصلية دون «تصحيح صامت». مفاتيح لكل مفهوم وجدول وشكل وكود وسؤال ومعمل.

**Gate:** `67/67 pages covered`, `329/329 link annotations catalogued`, `22/22 labs`, `20/20 practice Q`, `30/30 self checks`, `4/4 decision tables`; كل عنصر له source refs؛ لا output مجهول المصدر.

### Phase 2 — Scientific QA and fixes

أغلق P0 أعلاه وأضف scientific QA per-topic، مع تمييز official docs vs source vs inference و test actual code. كل مثال قابل للتنفيذ يجب تشغيله في بيئة مرجعية أو يحمل Badge واضح `Not runtime verified`. محتوى يحتاج مراجعة يبقى Visible as source only دون منح حالة Verified.

**Gate:** 0 high-severity incorrect published claims, 0 broken canonical code examples, 100% decisions have sources and exception cases.

### Phase 3 — Learning content model + design system

بناء schemas/validators (Zod أو TypeScript)، ترتيب prerequisites، أهداف من Microsoft outline، cards، source viewer، glossary، decision engine، 2 layouts دسكتوب/موبايل؛ معماريات تفاعلية accessibility-first.

**Gate:** يمكن عرض مفهوم مع source/QA status وNext/Previous وRTL/LTR بشكل صحيح؛ لا تسبب layout shift.

### Phase 4 — Vertical Slice / Proof of learning

طبّق 3 دروس عميقة وليس 30 صفحات سطحية: `Shortcut vs Mirroring`, `Warehouse IDENTITY and Surrogate Keys`, `Direct Lake fallback`. لكل واحد شرح، تفاعل، سؤال، تفسير خطأ، source، ربط بالمعمل.

**Gate:** مستخدم جديد يجيب سؤالًا تطبيقيًا غير حرفي؛ يميّز حالتين متشابهتين؛ يعود من refresh دون فقد التقدم.

### Phase 5 — Full Curriculum

إكمال modules 1–8 بحسب المسار، ثم 22 lab links، 4 decision assistants، 50 source questions، glossary، exam checklist، Appendix B resource library. لا نكرر السؤال الموجود في Hansa دون canonical crosslink.

**Gate:** كل Lesson/Question/Lab يعيد الارتباط بمصدر صحيح؛ 100% coverage من الـpage-to-learning matrix باستثناء العناصر غير الصالحة للنشر الموثقة في QA backlog.

### Phase 6 — Learning Intelligence / Analytics

Diagnosis baseline، mastery model مع uncertainty، next best action، review scheduler، question analytics، wrong-reason notebook، view progress، export/import progress. Analytics احترام privacy by default؛ لا تعتمد on-page time بوصفه mastery.

**Gate:** اختبارات completeness، أسئلة مُعاد خلطها، حالات inaccurate confidence، offline/local state وmigration بعد تحديث IDs.

### Phase 7 — QA/A11y/Performance

Unit/E2E/visual regression، WCAG 2.2 AA على الهاتف واللوحة، keyboard navigation لكل graph/drag interaction، CI check للأكواد والروابط، Lighthouse performance؛ اختبارات Browser back، anchor، 404، static export، loading large question bank، reduced motion.

**Gate:** 0 critical keyboard blockers، 0 incorrect answer keys، 0 source ID lost، 0 critical route regression. Performance budgets تُحدد من baseline الواقعي ثم تُقارن.

### Phase 8 — Staging and controlled deploy

اعمل branch وpreview، لا تلمس Production قبل gate sign-off، احفظ version الحالي، اختبر static artifact مع `wrangler` وخطة rollback، ثم deploy بعد موافقة المستخدم. لا تستخدم بنية backend غير متاحة دون قرار معماري مستقل.

**Gate:** صلاحية كل URL أساسي، ملفات HTML/JS/CSS سليمة، بيانات Progress migration سليمة، fallback route واضح، logs، rollback version محددة.

---

## ي — معايير قبول هامة للمستخدم النهائي

1. طالب يدخل الأكاديمية يفهم على الأكثر من 3 اختيارات «إبدأ/كمل/راجع» دون أن يحتاج فهم شجرة محتويات الدليل.
2. من أي Scenario يصل إلى الشرح ثم سؤال مرتبط ثم معمل ثم المصدر الأصلي في ≤3 خطوات.
3. يستطيع اختيار بديل تقني ويعرف **لماذا البدائل الأخرى خاطئة** في سيناريو واقعي.
4. لا تنقل أي صفحة كاملة في هيئة حائط نص طويل؛ الافتراضي Micro-lessons، مع زر Show original source للتدقيق.
5. جميع **صفحات المصدر الـ67** لها سجل mapping؛ لا توجد تفاصيل مفقودة أو مصححة دون audit trail.
6. الأسئلة الأصلية الـ50 موجودة بصيغة منفصلة أو مدمجة إداريًا عبر canonical IDs بعد dedup.
7. Core learning architecture لا تغير Hansa Landing Page، ولا تعيد رفع مشروع HSE Analytics كأولوية.
8. قبل النشر يُراجع حقوق إعادة توزيع نص الدليل والشعارات وعناصر Microsoft؛ تصميم تمرين جديد من المفاهيم يختلف عن نسخ المستند بالكامل للعموم.

---

## ك — الأصول المرفقة

- `DP600_COMPLETE_SOURCE_TEXT_page_by_page.md`: نص مصدر **كامل مستخرج** مقسم إلى الصفحات الـ67؛ ليس rendering مطابقًا لأن الجداول والرسوم المتجهية والتنسيق يُرجع لها بالـPDF الأصلي.
- `DP600_SOURCE_LINKS.json`: مواضع الـ329 رابطًا بما فيها الـURL الأصلي وإحداثياته.
- `HANSA_DP600_SOURCE_REGISTRY.json`: **67 entries للصفحات**، و14 وحدة منطقية (المصدر يتضمن الفصل 0-11 + Appendix A/B)، و**22 Lab**، و**20 Practice Q**، و**30 Self-check** و329 link annotation مع checksums.
- `DP600_PAGE_INDEX.csv`: عدد الأحرف والكلمات والسطور وURL/raster/vector indicators وبصمة كل صفحة.
- `HANSA_DP600_AGENT_IMPLEMENTATION_PROMPT_EN.md`: برومبت تسليم مضبوط لمنفذ Hansa، يعمل على الفروع ويحمي الموقع والأسئلة والـQA.
- `DP-600-Study-Guide-EN.pdf`: الأصل من المستخدم؛ يُرفق كمرجع ولا يُعدّل.

---

## ل — ملحق تغطية كل صفحة (لا توجد صفحة متروكة بلا تعيين)

| الصفحة | المحتوى المحدد | الكلمات المستخرجة | روابط PDF |
|---:|---|---:|---:|
| 01 | الغلاف، بيانات الامتحان، تاريخ المخطط، اعتماد الروابط | 127 | 1 |
| 02 | الفهرس للفصول 0-4 | 226 | 40 |
| 03 | الفهرس للفصول 5-11 والملحق A | 238 | 42 |
| 04 | استكمال عناصر الملحق A في الفهرس | 18 | 4 |
| 05 | 0.1 تعريف الشهادة و0.2 المجالات والأوزان | 259 | 3 |
| 06 | 0.3 إجراءات الامتحان و0.4 الخطة المصورة | 244 | 9 |
| 07 | 0.4 الخطة الأسبوعية و0.5 تصنيف التنبيهات | 227 | 13 |
| 08 | 1.1 معمارية Fabric والموارد المشتركة | 242 | 1 |
| 09 | 1.2 Tenant/Capacity/Domain/Workspace/Item و1.3 OneLake | 343 | 10 |
| 10 | 1.3 Shortcut/Mirroring/Copy و1.4 Medallion | 320 | 2 |
| 11 | 1.5 اختيار Lakehouse/Warehouse/Eventhouse/SQL database | 244 | 2 |
| 12 | 1.6 أنواع عناصر Fabric | 153 | 9 |
| 13 | 2.1 طبقات الأمان و2.2 Workspace roles | 264 | 1 |
| 14 | 2.2 مصفوفة الأدوار و2.3 صلاحيات العناصر | 297 | 2 |
| 15 | 2.3 Build و2.4 OneLake security و2.5 DAX RLS | 331 | 5 |
| 16 | 2.5 Warehouse SQL RLS وKQL RLS و2.6 CLS/OLS | 243 | 2 |
| 17 | 2.6 OLS و2.7 Sensitivity labels و2.8 Endorsement | 302 | 5 |
| 18 | 2.9 خمسة أسئلة وإجابات و2.10 المراجع | 208 | 13 |
| 19 | 3.1 Git وخرائط Dev/Test/Prod | 275 | 1 |
| 20 | 3.1 القيود و3.2 PBIP/PBIX/PBIT و3.3 النشر | 318 | 2 |
| 21 | 3.3 Deployment rules/Variable library و3.4 Lineage | 342 | 6 |
| 22 | 3.5 XMLA و3.6 reusable assets | 275 | 1 |
| 23 | 3.6 مثال PBIDS و3.7 خمسة أسئلة و3.8 المراجع | 233 | 11 |
| 24 | 4.1 Connectors/Gateways و4.2 Catalog/Real-Time hub | 321 | 3 |
| 25 | 4.2 Catalog مقابل Hub و4.3 سبع آليات للوصول/النقل | 282 | 10 |
| 26 | 4.4 OneLake integration و4.5 خمسة أسئلة و4.6 المراجع | 353 | 13 |
| 27 | استكمال روابط التدريب Chapter 4 | 20 | 4 |
| 28 | 5.1 Transform engines مقارنة و5.2 Star Schema | 254 | 5 |
| 29 | 5.2 رسم Star Schema ومثال SQL لتوليد surrogate key | 255 | 0 |
| 30 | 5.2 PySpark example و5.3 Denormalize/Aggregate SQL | 246 | 0 |
| 31 | 5.4 مشاكل جودة البيانات و5.5 SQL objects | 228 | 0 |
| 32 | 5.5 SQL View/Stored Procedure/Spark MERGE و5.6 خمسة أسئلة | 290 | 1 |
| 33 | 5.6 الإجابات و5.7 المراجع | 111 | 14 |
| 34 | 6.1 Visual Query و6.2 T-SQL sample | 295 | 2 |
| 35 | 6.3 KQL sample ومقارنة KQL/T-SQL | 187 | 4 |
| 36 | 6.4 DAX measures وسياق التصفية و6.5 مقارنة ثلاث لغات | 258 | 0 |
| 37 | 6.5 ثلاثة أمثلة SQL/KQL/DAX و6.6 المراجع | 127 | 10 |
| 38 | 7.1 Import/DirectQuery/Direct Lake/Dual | 250 | 2 |
| 39 | 7.2 Relationships/USERELATIONSHIP/M2M و7.3 DAX | 288 | 2 |
| 40 | 7.3 DAX VAR/Iterators/Tables/Window/Info و7.4 Calculation groups | 302 | 1 |
| 41 | 7.4 Dynamic formatting/Field parameters و7.5 Large model | 254 | 5 |
| 42 | 7.6 Composite models و7.7 خمسة أسئلة و7.8 مراجع | 318 | 12 |
| 43 | استكمال مراجع Chapter 7 | 22 | 4 |
| 44 | 8.1 تحليل الأداء وأدواته و8.2 Report optimizations | 333 | 3 |
| 45 | 8.3 DAX performance و8.4 Direct Lake مخطط | 281 | 0 |
| 46 | 8.4 Framing/Fallback/DirectLakeBehavior | 259 | 0 |
| 47 | 8.5 Direct Lake on OneLake vs SQL و8.6 Incremental refresh | 327 | 5 |
| 48 | 8.6 خيارات incremental refresh و8.7 خمسة أسئلة و8.8 المراجع | 317 | 8 |
| 49 | 9 قائمة 22 معمل Microsoft Learn | 275 | 27 |
| 50 | 10 أسئلة التدريب Q1–Q20 وإجابات 1-2 | 436 | 0 |
| 51 | 10 إجابات وتفسيرات الأسئلة 3-20 | 336 | 0 |
| 52 | 11.1 أسبوع الامتحان و11.2 60-second memory dump | 117 | 3 |
| 53 | 11.2 جدول التذكر السريع و11.3 قراءة الأسئلة | 331 | 0 |
| 54 | 11.4 Glossary و11.5 ما بعد DP-600 | 331 | 2 |
| 55 | 11.5 استمرار المراجعة والخلاصة | 85 | 4 |
| 56 | Appendix A.1 قرار مخزن البيانات، A.2 النقل، A.3 الأمان | 170 | 0 |
| 57 | Appendix A.4 قرار Git/Deployment/XMLA/Lineage | 49 | 0 |
| 58 | Appendix B عنوان فهرس روابط Microsoft Learn | 27 | 0 |
| 59 | Appendix B روابط الموارد — صفحة 1 | 119 | 0 |
| 60 | Appendix B روابط الموارد — صفحة 2 | 91 | 0 |
| 61 | Appendix B روابط الموارد — صفحة 3 | 93 | 0 |
| 62 | Appendix B روابط الموارد — صفحة 4 | 106 | 0 |
| 63 | Appendix B روابط الموارد — صفحة 5 | 111 | 0 |
| 64 | Appendix B روابط الموارد — صفحة 6 | 98 | 0 |
| 65 | Appendix B روابط الموارد — صفحة 7 | 102 | 0 |
| 66 | Appendix B روابط الموارد — صفحة 8 | 127 | 0 |
| 67 | Appendix B روابط الموارد — صفحة 9 | 30 | 0 |

**التحقق من التغطية:** هذا الملحق يطابق 67 صفحة من أصل 67؛ تبقى محتويات كل صفحة الكاملة في ملف النص المصدر وفي PDF الأصلي، والجزء الملحق هو خريطة تفسيرية لا بديل عن المرجع.
