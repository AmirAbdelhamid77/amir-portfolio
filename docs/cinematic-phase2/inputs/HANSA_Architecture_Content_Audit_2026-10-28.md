# HANSA — Complete Information Architecture, Naming & Content Audit

**تقرير تأسيسي لإعادة تصميم Hansa كتجربة معرفية وتطبيق تعلّم تفاعلي**  
**تاريخ التدقيق:** 28 أكتوبر 2026 — **الموقع:** https://hansa.amir-portfolio.workers.dev/  
**الحالة:** READ-ONLY — لم أعدّل أي صفحة أو شفرة أو نشر.  
**الغرض:** معرفة ما هو موجود فعلًا، وكيف تنتظم أجزاؤه، وما ينبغي تسميته ونقله ودمجه أو إبقاؤه قبل بدء تصميم تجربة Hansa الجديدة.

> **تنبيه جوهري حول الشمول:** أحصيت **117 مسار صفحة مختلفًا** من روابط الموقع الداخلي. استرجعت المحتوى المنشور مباشرةً لـ**104 صفحات** منها: 100 في الزحف الرئيسي، وصفحتا Fabric Review وProgress، وصفحة Applied Cases، وصفحة Arabic Bar Plot. أمّا **13 صفحة** (10 دروس عربية وثلاث صفحات مرجعية إحصائية) فقد حُصرت مساراتها وروابطها، لكن إعادة جلب متنها المباشر تعذّرت بسبب حدّ الطلبات في Cloudflare Browser Rendering. بعض هذه الصفحات مشمول في تقرير تاريخي بتاريخ 27 أكتوبر استعرض 115 صفحة. **هذه ليست شهادة بأن كل تفاعل أو سؤال منفرد خضع للفحص**. تفاصيل الحالات في CSV المرفق، وهو سجل تدقيق لا بيانات تسويقية.

## 0. معيار الأدلة وماذا فُحص

| المستوى | تعريفه | أين يُستخدم |
|---|---|---|
| **L1 — Directly observed live** | مسترجع من النسخة المنشورة في 28 أكتوبر | العناوين، المسارات، نصوص الصفحات، أرقام العدّ الظاهرة، روابط التنقل، التلميحات |
| **L2 — Earlier audited** | تقرير تفصيلي من 27 أكتوبر مع فحص شامل للـsitemap والـHTML والبيانات، وتقرير 24 أكتوبر | المقارنة التاريخية، قضايا الوصول، تفاصيل المصادر والروابط، الحالات التي لم أستطع إعادة جلبها |
| **L3 — Interpretation** | تحليل معماري/تحريري مستند إلى L1 أو L2 | تضارب المصطلحات، العبء المعرفي، وضوح رحلة التعلم، تداخل أنواع المحتوى |
| **L4 — Not tested** | يتطلب متصفحًا تفاعليًا/شفرة المصدر/بيانات الأسئلة | تشغيل جميع الأسئلة، كل حالات الحركة والموبايل، keyboard/screen reader، فحص 834 إجابة علميًا، أداء Web Vitals |

**منهج العمل:** استخراج روابط النصوص والعناوين من الموقع، تدقيق عيّنة معمقة من الصفحات المحورية، تنظيم 117 مسارًا بلا إسقاط، مراجعة تقرير 27 أكتوبر السابق، فصل المشكلات المُصلحة سابقًا عن المشكلات القائمة. الزحف الحالي كان نصيًا/Static في الأساس؛ لا يُعادل استخدام الموقع بالماوس في جلسات موقّتة مكتملة. لم أسمّ نصوص “Loading …” أخطاء تشغيلية بمجرد ظهورها في HTML المبدئي.

**مرجع تاريخي للمقارنة:** `Hansa Site Inspection and Enrichment Plan.md` (27 أكتوبر 2026)؛ `Hansa_Master_Audit_Reorganization_Plan_v2_2026-10-24.md`. قائمة المسارات الحالية موجودة كملف CSV مستقل لا كادعاء بأن أرقام ملف قديم تساوي الإنتاج الحالي.

---

## 1. الحكم المعماري الرئيسي

### 1.1 أي منتج يبدو أنه Hansa الآن؟

الموقع يجمع ثلاثة منتجات حقيقية وطبقة رابعة تربط بينها:

1. **Learning platform**: Data Visualization course، مرجع Statistics، DP-600 Academy، دروس بالعربية، وقوائم المصدر.
2. **Practice and assessment platform**: بنك محلل البيانات، Fabric question bank، وVisualization scenario drills.
3. **Exploration / reference tools**: charts، graph/atlas، formula workbench، chart chooser، integrity lab، knowledge relationships.
4. **Professional portfolio and services**: Work، Experience، About، Services، Contact.

الصفحة الرئيسية الجديدة تبرز **Atlas / Learn / Practice** وتقول `Hansa · Learn connected ideas`، بينما كثير من صفحات الموقع الداخلية تعرض الترويسة **Work / Learn / Practice / Services / About**. الهدفان ليسا متناقضين، لكن **لا توجد صياغة ثابتة لعلاقة المستويين**: هل Atlas منتج أساسي، أم أداة داخل Fabric، أم مدخل بديل إلى Learn؟ وهل Work قسم من Hansa أم وظيفة موازية؟

### 1.2 المشكلة الفعلية

المشكلة ليست كثرة الصفحات بحد ذاتها؛ بل **خلط أربع طبقات تصنيف مختلفة**:

- **Domain**: Fabric، Statistics، Visualization، SQL، Power BI.
- **Content type**: Course، Reference، Lesson، Experiment، Question bank، Case study.
- **Learning mode**: Guided، Explore، Practice، Mock، Review، Progress.
- **Visual experience / metaphor**: Atlas، Journey، Lab، Studio، Observatory، Detective، Theatre، Room، Shelf.

هذه ليست مرادفات. حين تصبح جميعها أسماء مستويات ملاحية متساوية، يفقد المستخدم الإحساس بما إذا كان يتجه إلى **مادة يتعلمها** أم **طريقة للتعامل معها** أم **مكان في الموقع**.

### 1.3 ما يجب ألا نضيعه أثناء إعادة التصميم

- التوثيق الصريح للمصدر ومصدر السؤال.
- 10 فصول Visualization، 43 قسم Statistics، التسع Journeys، 15 إحصائيات تفاعلية، ستة chart labs.
- التمييز بين Focused DP-600 وSupporting وDP-700-primary وUnmapped.
- الشرح المرحلي وإظهار سبب خطأ البدائل لكل سؤال عندما يكون متاحًا.
- التسميات الواضحة للوضع الموقّت مقابل وضع التعلم.
- إمكانية استئناف المحاولات وحفظ الحالة على جهاز المستخدم مع الإفصاح عن غياب حساب/مزامنة.
- المسار العربي المستقل، مع الحرص على RTL/LTR المختلط.
- بقاء الروابط القديمة والمعرّفات ومفاتيح التخزين صالحة أثناء أي انتقال.

---

## 2. خريطة معلومات الموقع — As-Is

### 2.1 نتائج الجرد المؤرخة

| المجموعة الحالية | عدد المسارات المحصورة | الوصف |
|---|---:|---|
| Home | 1 | هوية Hansa الجديدة وبوابات Atlas/Learn/Practice |
| Portfolio | 8 | Work، 3 cases، Experience، Services، About، Contact |
| Navigation, Catalogues & Search | 3 | Learn catalogue، Practice catalogue، Search |
| General analyst assessment | 7 | Data Lab وفروع SQL/Power BI/Excel/Python/Statistics/Fundamentals |
| Data Visualization learning | 28 | صفحة الكورس، 10 فصول، مواد/مرجع/حالات |
| Arabic learning | 12 | دليل المسار العربي و11 صفحة |
| Statistics reference | 32 | 9 Journeys، 15 labs، مراجع وأدوات |
| Fabric learning | 4 | Academy، Ingestion Lab، Atlas، Guided Journey |
| Fabric assessment | 9 | Hub، Explore، Study، Practice، Mock، Cases، Review، Progress، Resources |
| Visualization interactive labs | 12 | Explore، 6 charts، chooser، integrity، dashboards، specialty |
| Visualization assessment | 1 | 12 scenario questions |
| **الإجمالي** | **117** | **104 مُسترجعة + 13 محددة ولم يُسترجع متنها الآن** |

الـ115 صفحة الواردة في تقرير 27 أكتوبر **عدد تاريخي من الـsitemap وقتها** وليست إعادة عدّ مستقلة للإصدار الحالي. الجرد الحالي 117 مبني على روابط داخلية فريدة، ومن الممكن أن تتغير مجموعة الـsitemap عن مجموعة الصفحات الموصولة داخليًا.

### 2.2 الخريطة المنطقية As-Is (ملخص)

```text
Hansa /
├── Entry points
│   ├── /learn/catalogue/             ← Learning catalogue
│   ├── /practice/catalogue/          ← Practice catalogue
│   ├── /search/                      ← Search
│   └── /learn/dp-600/atlas/         ← Main-home CTA; NOT publicly published
├── Portfolio /
│   ├── /work/ → hse-analytics, ibm-capstone, adas
│   ├── /experience/ → /about/ → /services/ → /contact/
├── Visualization learning /learn/
│   ├── /chapter/01/ ... /chapter/10/
│   ├── source/reference/topic pages (17 other pages including applied-cases)
│   ├── /ar/ → 11 Arabic companion pages
│   └── supporting interactive labs at /explore/
├── Statistics /learn/statistics/
│   ├── /journey/ → 9 journeys
│   ├── /labs/ → 15 individual labs
│   ├── /atlas/ → concept dependency map
│   └── /formulas/, /decision/, /glossary/, /cheatsheet/, /source/
├── Fabric learning /learn/dp-600/
│   ├── /ingestion/                  ← 1 complete lesson
│   ├── /atlas/                      ← Publication review pending
│   └── /atlas/journey/              ← 4-step journey, even while graph unpublished
├── Practice /lab/
│   ├── SQL / Power BI / Excel / Python / Statistics / Fundamentals
│   └── /dp-600/ → explore, study, practice, mock,
│                 cases, review, progress, resources
├── Visualization interactive gallery /explore/
│   ├── charts/ → six labs
│   ├── choose/, integrity/, dashboards/, specialty/
└── Visualization scenario bank /practice/
```

### 2.3 مشكلة المسارات أكثر أهمية من شكل URL

- `/learn/` ليس بوابة Learn الشاملة؛ هو **Data Visualization course**.
- `/learn/catalogue/` هو بوابة التعليم الشاملة الفعلية.
- `/practice/` ليس Practice catalogue؛ هو **Visualization scenarios**.
- `/practice/catalogue/` هو فهرس الممارسة الفعلي.
- `/lab/` ليس «المعامل» بالمعنى التجريبي؛ هو بنك 60 سؤالًا.
- `/lab/dp-600/` بنك 834 سؤالًا؛ تجربة أكبر بكثير من بقية `/lab/`.
- `/explore/` ليس Atlas؛ هو معرض visualization labs.
- `Statistics Atlas` و`Fabric Atlas` شيئان مختلفان على مسارين مختلفين.

**التوصية:** عالج الاسم المعروض وBreadcrumbs وContent-Type chips ونتائج البحث أولًا. **لا تغيّر الـURLs دفعة واحدة**؛ route aliases/redirects قابلة للاختبار تأتي لاحقًا.

---

## 3. Audit — الصفحة الرئيسية والهوية

### 3.1 عناصر الصفحة الرئيسية المُشاهدة

- Document title: `Hansa — Learn connected ideas`.
- Primary H1: `Data that makes decisions visible.`
- Narrative: `Learn the concepts behind data decisions`.
- ثلاثة مداخل `Atlas / Learn / Practice`.
- Featured: Data Visualization، Comprehensive Statistics، Microsoft Fabric / DP-600.
- خيارات جانبية: Six chart labs، Chart decision assistant، Integrity lab، Visualization scenarios، Analyst bank (60)، المسار العربي.
- CTA إلى Guided Journey وDP-600 Academy.
- أرقام `60 Analyst questions / 834 Fabric questions / 12 Scenarios`، وتجميع `906 questions · 3 banks`.

**ملاحظة حسابية:** 60 + 834 + 12 = 906؛ ليس خطأ جمع. الإشكال تسموي: الـ12 هي **scenario drills** وليست necessarily جلسات امتحان مثل الـ834، ولذلك ينبغي تمييز العدد قبل جمعه تحت كلمة واحدة.

### 3.2 التضارب في الظهور والهوية

- يظهر `Atlas` في الواجهة الرئيسية كأن التجربة تعمل، بينما صفحة `/learn/dp-600/atlas/` تقول نصًا `Publication review is pending` و`The reviewed public graph is not yet published`.
- صفحة `/learn/dp-600/` تقول الشيء نفسه، ومع ذلك تعرض `Explore the full Atlas` ورابط Guided Journey. هذه مشكلة **وعد/وجهة** وليست مجرد نقص محتوى.
- Footer في الصفحة الرئيسية يقول `Source-backed learning...`، بينما Footer للصفحات الداخلية غالبًا يصف `Power BI, SQL, Python, and Excel — turned into dashboards people actually use` ويبرز HSE case. التبديل بين هويتين يحتاج قرارًا موحدًا.
- وسم `og:title` و`twitter:title` في Home لا يزال `Amir Abdelhamid — Data Analyst & BI Developer`، و`og:description` القديم يركز على البورتفوليو، بينما H1 الحالي تعليمي. هذه **مفارقة Metadata مؤكدة** في المحتوى المسترجع.
- الـkeywords الافتراضية تكرر HSE وdata portfolio وpractice exams على صفحات غير مهنية وغير خاصة بها؛ الأفضل metadata مشتق من موضوع الصفحة.
- Home navigation `Atlas / Learn / Practice`، والصفحات الداخلية `Work / Learn / Practice / Services / About`. إن كان المقصود وضعًا مختلفًا للـHome، يجب إظهار خريطة العلاقة بوضوح؛ الوضع الحالي غير صريح.

### 3.3 نقد الـcopy

| العبارة الحالية | ملاحظتي | البديل/الاتجاه التحريري |
|---|---|---|
| `Hansa — Learn connected ideas` | يشرح الفلسفة لكن ليس المجال | ضع descriptor قصيرًا يذكر data/analytics learning في السياقات الخارجية |
| `Data that makes decisions visible` | مناسب لبورتفوليو تحليل البيانات، أقل دقة عند وصف بنك دراسي/أطلس | من الممكن الاحتفاظ به كسطر تحريري، مع تعريف وظيفي واضح في السطر التالي |
| `Three ways to use this site` | واضح كبوابات، لكن Atlas غير متاح | بوابات صالحة لكل المستخدمين، أو نشر Atlas قبل إبراز CTA |
| `Choose a concept. Follow its evidence` | فكرة قوية وخاضعة للتمكين | اربطها بعملية قابلة للاستخدام، لا بتجربة Pending |
| `A course, a reference, and an assessment bank` | تصنيف صحيح للـ3 featured، لكنه يستبعد أدوات أخرى من القصة | تعريف للـFeatured فقط لا claim ببنية الموقع بأكمله |
| `02 — Learn & practise` | تسلسل `02` بلا سياق واضح لمن يقرأ نص الصفحة | اجعله رقم فصل واضح في الـvisual narrative أو احذفه من النسخة النصية |

### 3.4 الأولوية التصميمية قبل الحركة

Prototype C وSpatial Experience يفقدان قيمتهما لو جرى تحسين الواجهة وحدها بينما CTA الرئيسي يذهب إلى رسم بياني غير منشور. **تسلسل الحل:** resolve content-state → canonical destination → storytelling hierarchy → animation choreography. التفاعل يجب أن يُظهر العلاقات الحقيقية لا أن يتظاهر بوجودها.

---

## 4. Audit — Learning catalogue

### 4.1 ما يسرده بالفعل

- `Read / Experiment / Test` بوصفها ثلاث طرق للعمل.
- Data Visualization course (10 chapters، 25 source pages، 6 charts، 12 scenarios).
- DP-600 Learning Academy pilot (درس كامل واحد وثلاث حالات نقل).
- المسار العربي companion (11 lessons) ويأتي داخل العرض بأسلوب شبيه بالكورسات.
- Statistics reference (43 sections، 9 journeys، 15 labs).
- Source/import method وFabric source credits.
- Chart chooser، six chart labs، Integrity lab، dashboard/specialty galleries.

### 4.2 التسمية والتصنيف

`Two courses` يظهر في مقدمة الفهرس؛ يمكن تفسيرهما بـVisualization وFabric Academy، لكن قسم `Courses` يعرض أيضًا `Arabic companion path` كبطاقة من نفس المستوى. المحتوى لا يفتقر إلى المعلومات؛ يحتاج **نوعًا واضحًا** لكل Card وشرح أن Arabic **مسار موازٍ** وليس منتجًا ثالثًا.

`Read / Experiment / Test` مفيد جدًا، لكن لا ينبغي وضعه بجانب `Course / Reference / Tool` كأنه تصنيف واحد. المقترح أن يحمل كل مورد على الأقل خاصيتين مستقلتين: `type=course/reference/tool/assessment` و`actions=[read,experiment,test]`.

كلمة `Inside` ومعها `Level / Prerequisites / Practice / Language` رائعة في المواصفة، لكن بطاقات طويلة متعددة الحقول تجعل الفهرس تبدو أحيانًا كصفحات تعريف برامج تدريبية؛ اعرض حقولًا قليلة واسمح بتفاصيل إضافية في وجهة المورد.

### 4.3 محاور التحسين

- خريطة مهارات مع Browse by domain (Fabric/Statistics/Visualization/SQL...) بدل الاكتفاء بـBrowse by content type.
- Start/Resume بين course and reference؛ «Continue» في المرجع قد تعني آخر موضع قراءة، لا نسبة mastery.
- فصل وجهات `I'm preparing for an exam` عن `I want to understand a concept`.
- في كل card: **اسم دقيق، نوع المورد، السؤال الذي سيجيب عنه، مستوى الدخول، وهل هناك نشاط بالفعل**.

---

## 5. Audit — Fabric Academy / Knowledge Atlas

### 5.1 البنية الحالية

`/learn/dp-600/` → `/learn/dp-600/ingestion/` (الدّرس الحالي المكتمل) → `/learn/dp-600/atlas/` (مؤجّل للنشر) → `/learn/dp-600/atlas/journey/` (4-step flow: Learn, Explore, Practice, Reflect).

**Ingestion lesson:** `Shortcut, Mirroring or Copy?`، مع هدف، أمثلة، استكشاف شروط، 3 transfer cases، وسجل مراجعة محلي. هذا exemplar تربوي صالح لاستنساخ **النمط** إلى موضوعات أخرى بعد مراجعة علمية.

### 5.2 نقاط دقيقة

- اسم `DP-600 Learning Academy` يوحي ببنية منهجية أشمل من الواقع الحالي؛ الصفحة نفسها تفصح بصدق عن أنها **pilot with one complete lesson**، ولكن الاسم في الكتالوج والبوابات يحتاج ظهور هذه الصفة.
- Atlas منشور كعنوان ورابط، **ليس كأطلس تفاعلي متاح**؛ لا تُصمم hero visualization تعتمد عليه حتى يصبح حقيقيًا أو تستبدل CTA بدرس منشور.
- Journey تسير في 4 خطوات، لكن رابط الرجوع إلى Atlas يوصل حاليًا إلى صفحة Pending؛ هذه حالة Empty/Not-ready بحاجة تصميم.
- الروابط المضمّنة في رحلة Atlas تحمل query string طويلة مع concept/source/relation/hops/zoom/x/y/edge. الرابط صحيح كمحاولة استعادة سياق، لكن يستحق اختبار roundtrip، ونسخ الرابط، وback navigation، وعدم كسر التنقل لو لم يوجد graph.
- يجب فصل أسماء `Knowledge Atlas` (Fabric concept graph) عن `Statistics Atlas` (dependency map) و`Visual Atlas` (teaching figures). الاسم العام وحده غير كافٍ للتوجيه.

### 5.3 قرار مهم

احتفظ بـ`Atlas` كفكرة كبرى في الرؤية البصرية، لكن عرّفه على مستويين: **cross-topic Knowledge Atlas** (هدف منتجي مستقبلي) و**domain graph** (Fabric/Statistics). لا تعلن أن cross-topic graph منشور لمجرد وجود route جزئي.

---

## 6. Audit — Fabric practice / DP-600

### 6.1 المحتوى والأرقام في الإصدار المنشور

| مقياس | القيمة المعروضة | التفسير السليم |
|---|---:|---|
| Fabric practice questions | 834 | عدد السجلات في هذا البنك المنشور، لا 834 سؤالًا مرجّحًا كلها للـDP-600 |
| Source packs | 18 | حزم تنظيم/نسبة مصادر، ليست 18 مجالاً معرفياً |
| DP-600 focused | 480 | الأسئلة المعينة لمجالات DP-600 حسب metadata |
| With case context | 343 | سياقات تربط الأسئلة بحالات، لا 343 حالة مستقلة |
| Shared scenarios | 76 | السيناريوهات المشتركة بين هذه الأسئلة |
| Source references | 227 | عدد مراجع المصدر المعروضة، لا تلقائيًا 227 سؤالًا موثقًا |
| Semantic models | 13 / 480 (2.7%) | فجوة محتوى كبيرة مقابل الوزن المنشور 25–30% |

ويفصل التقرير التاريخي للبيانات بين **480 focused** و**251 supporting** و**90 DP-700-primary** و**13 unmapped**، مجموعها 834. يُحتفظ بهذه الطبقات منفصلة، ولا يُعلن عن «Mock exam DP-600 مطابق للمخطط» قبل ضبط توزيع مجالات الامتحان.

### 6.2 إصلاح تم بالفعل ولا يجب إعادته كـBug

تقرير 24 أكتوبر أشار إلى تضارب Domain vs Sub-objective counts. الصفحة الحالية تعرض **297 / 170 / 13 = 480** مع شرح أن بعض الأسئلة تُسند إلى domain-level دون sub-objective. فتُصنف القضية السابقة **Historical issue — now reconciled in visible production text**، ويبقى التحقق من correctness الخاص بمصدر mapping أمرًا مستقلًا.

### 6.3 تسعة مسارات داخل Hub

- `/lab/dp-600/` — Overview.
- `/lab/dp-600/explore/` — Explore the question bank.
- `/lab/dp-600/study/` — Guided study.
- `/lab/dp-600/practice/` — Topic practice.
- `/lab/dp-600/mock/` — Mock exam.
- `/lab/dp-600/cases/` — Case studies.
- `/lab/dp-600/review/` — Mistakes & bookmarks.
- `/lab/dp-600/progress/` — Progress & backup.
- `/lab/dp-600/resources/` — Sources & coverage.

التقسيم الحالي تحسن عن تسعة tabs متساوية: هناك مجموعات **Study / Assess / Improve / Trust**. ومع ذلك `Topic practice` موضوع ضمن Improve بينما هو نشاط **Practice** أصيل؛ الأفضل فصل *تعلم → مارس → قيّم → راجع* كتدفق، وليس وضعًا تعليميًا في خانة التحسين فقط.

### 6.4 مصطلحات يجب التمييز بينها

| الحاضر | الإشكال | تعريف label مقترح |
|---|---|---|
| Guided study | قد يختلط بـLearning Academy | `Guided Questions · Immediate feedback` |
| Topic practice | الاسم جيد لكنه لا يشرح حالة التصحيح | `Topic Drills · Choose a focus` |
| Mock exam | يتطلب تنبيهًا بارزًا أنه custom غير مطابق | `Timed Simulation · Custom, not official` |
| Case studies | يتداخل مع المشاريع المهنية في Work | `Scenario Sets · Shared context questions` |
| Explore the bank | بحث/قراءة أم جلسة اختبار؟ | `Question Explorer · Browse & filter` |
| Mistakes & bookmarks | يجمع خطأ وتحفيظًا وإشارات | `Review Queue · Missed / Saved / Untried` |
| Progress & backup | أداء المستخدم + تصدير جهاز | `Learning History & Backup` |
| Resources | مصطلح عام | `Sources, Coverage & Method` |

### 6.5 واجهة الاختيارات والأسئلة

السطر النصي المعروض في `/study/` يجمع أسماء حزم مصدر طويلة جدًا: `Security across Fabric engines — SQL OLS/CLS/RLS...`، `Choosing Data Stores & Ingestion/Transformation Tools ... Advanced DP-600...` إلخ. المصدر الطويل قد يناسب **Sources & coverage**، ولكنه مرهق كخيار filter. الأفضل:

- `packKey` داخلي ثابت، و`displayName` قصير، و`fullSourceTitle` ثانوي/tooltip.
- لا تجعل `Topic` يعرض الحل قبل عرض السيناريو؛ تجنب عنوان من قبيل `Storage / SQL DML` فوق سؤال يسأل تحديدًا أي عملية DML.
- `Question ID` للنسخ والتبليغ والتتبع؛ لا تحتاج أن تكون أول عنصر بصري يُقرأ.
- `Difficulty 1–5` لا يُفهم وحده؛ اعرض `Foundational / Applied / Advanced` بشرط وجود rubric ثابت، مع الإبقاء على الدرجة عددًا في metadata.
- `Objective` و`Topic` و`Source pack` و`Mode` حقول مختلفة؛ يجب أن تنعكس في الفلاتر منفصلة.
- لا تنقل option rationales إلى prompt أو metadata قبل الإجابة في timed mode.

### 6.6 نطاق تدقيق الأسئلة — ما الذي لم أثبته؟

لم أفتح أو أحل **834 سؤالًا فرديًا** في جلسات كاملة، ولم أشغّل verifiers للـJSON أو أقارن الإجابات الحالية بأحدث DP-600 official outline خلال هذا الفحص المعماري. لذلك لا يصح إعلان أنها كلها علميًا سليمة أو أنها تحتوي جميع الأسئلة المتوقع إدخالها من حزم منفصلة. عمل الـ222-question Scientific QA مشروع موازٍ؛ **لا يُفترض أنه منشور ضمن الـ834** دون فحص IDs/source manifests والإصدار الذي نشره agent.

### 6.7 بروتوكول التدقيق العلمي/التحريري الموصى به لاحقًا

لكل record بعد استخراج bank الأصلية: `question_id`, `source_pack`, `question_type`, `stem`, `context`, `options`, `answer_key`, `distractor_rationale`, `explanation`, `citation`, `objective_framework_version`, `objective_mapping`, `scientific_status`, `editorial_status`, `visual_requirement`, `release_status`.

المراجعات المطلوبة: صحة المفتاح، تعدد الإجابات، وضوح القيود، حذف hints غير المقصودة، معقولية distractors، الإجابة الصحيحة الأطول دائمًا، تكرار stems، توافق blueprint، تحديث API/product behavior، عدم الحاجة إلى رسم منسي، انعدام source text plagiarism، سلامة التفسير العلمي، وفحص تصدير/استئناف بعد migration. كل تصحيح علمي يجب أن يحفظ original + proposed + approval state؛ **تغيير أسماء الصفحات لا يخول تغيير المفاتيح**.

---

## 7. Audit — General Data Lab (60 questions)

توجد 6 مجموعات × 10 أسئلة: SQL، Power BI & DAX، Excel، Python & Pandas، Statistics، Analytics Fundamentals. يعلن الموقع `70% pass mark` مع Practice/Mock/Review، وحفظ النتائج بـlocalStorage.

**إيجابيات:** وصف موضوع كل مجموعة مفهوم، ووقت الجلسة وpassing rule مذكوران، وتوضيح التصحيح المتعدد (exact match) والعدد يقي من وهم الاختبار الكبير.

**المشكلات:**

- كلمة `exam sets` ترفع توقع الصعوبة والاتساع رغم أنها 10Q؛ يمكن استخدام `mini assessments / quick checks`، مع إبقاء Mock فقط لوضع مؤقت خاص.
- `/lab/` تسمية غير متطابقة مع `Data Lab` الداخلي و`Explore labs` التفاعلية: كلاهما Lab لكن مختلف الوظيفة.
- 10 أسئلة لكل مهارة ليست تجربة تأهيل شاملة؛ يجب إظهار `Quick diagnostic · 10 questions` بدل `Exam readiness` بدون سند.
- التبويبات `All SQL Power BI Excel Python Statistics Fundamentals` مفيدة وظيفيًا لكن تحتاج تسمية واضحة ومقروءة، ومقاييس filters في mobile.
- `Search exams` حقل محلي يختلف عن Global Search؛ الحقل ينبغي تسميته `Filter analyst quizzes` أو وصف النطاق.

---

## 8. Audit — Data Visualization course

### 8.1 فصول الكورس العشرة الحالية

| الفصل | العنوان المنشور | الحكم التحريري |
|---|---|---|
| 01 | Foundations | مفهوم |
| 02 | Audience & Story | مفهوم، يمكن تمييز audience goal vs narrative |
| 03 | Core Visual Grammar | مفهوم للمتخصص، opaque نسبيًا للمبتدئ |
| 04 | Advanced & Multivariate | واسع ويحتاج subtopics |
| 05 | Color & Perception | واضح |
| 06 | Accessibility & Color QA | `QA` مصطلح جودة، ليس نشاط تعلم وحده |
| 07 | Integrity, Uncertainty & Traps | ثلاثة مفاهيم منفصلة تحتاج أهدافًا |
| 08 | Decision Tools & Composition | مفهوم عام يحتاج أمثلة |
| 09 | Implementation | شديد الاتساع؛ Implementation في ماذا؟ |
| 10 | Practice, Assessment & Shelf | كلمة `Shelf` داخل العنوان غير مفسَّرة للمستخدم |

**المدرسة التحريرية:** عنوان الفصل يشرح *ما سيتقنه المتعلم* في سطر فرعي، وليس فقط أسماء تخصصات. مثال `Visual Grammar` يمكن إبقاؤه اسمًا ثانويًا إذا كان العنوان الرئيسي `Match a chart to a question`.

### 8.2 صفحات المصادر والـReference

بجانب الفصول توجد صفحات مستقلة مثل `/learn/method/`، `/learn/overview/`، `/learn/foundations/`، `/learn/visual-atlas/`، `/learn/chart-selection/`، `/learn/power-bi-playbook/`، `/learn/interview-bank/`، `/learn/quick-reference/`، `/learn/applied-cases/`. وجودها مفيد، لكن **الدرس + فصل الكتاب + نسخة المصدر + التوضيح المعملي** قد تقدم الفكرة نفسها على عدة روابط بلا تفريق ثابت بين status ووظيفة كل صفحة.

- `Library map & operating system` مصطلح مستورد من تنظيم المادة؛ لا يحتاجه المتعلم كعنوان أول.
- `How this library was built` عنصر Trust/Provenance وليس درسًا.
- `Interview Master Bank` بنية تمرين/أسئلة، لا ينبغي أن تنافس موضوعات التعلم في Course TOC.
- `Applied Cases (synthetic)` يوصف بالمصدر المصطنع بشكل مناسب؛ احتفظ بالإفصاح لكن وضح learning objective قبل provenance.

### 8.3 الرسومات والملفات

صفحات المصدر ترتبط برسومات SVG في `/data-viz/figures/`، ومجموعة charts interactive في `/explore/charts/`. العلاقة يجب أن تكون: **شرح → مثال ثابت مستند للبيانات → تجربة قابلة للتغيير → اختبار**، وليس عرض رسوم مكررة في 3 صفحات غير مترابطة.

---

## 9. Audit — Arabic companion

- دليل `/learn/ar/` يحمل العنوان `المسار العربي: من السؤال إلى الرسم`، ويجمع المسارات المرتبطة بالرسومات والقراءة والمراجع.
- توجد **11 صفحة**: bar-plot، box-plot، color، core-charts، dot-plot، histogram، line-plot، reading-paths، references، scatter-plot، tips.
- صفحة Bar Plot فُحصت مباشرة؛ باقي 10 صفحات حُصرت لكنها لم تُسحب من النسخة الحية الحالية بسبب rate limit.
- صفحة الدليل تستخدم صيغة مثل `الفصل 03 — Core Visual Grammar`، مع أسماء عربية وإنجليزية مختلطة، وهذا مقبول عندما يكون الهدف اصطلاحيًا، لكن لا بد من قواعد ثابتة: عنوان عربي أساسي ثم المصطلح الإنجليزي عند أول ذكر.

**قضايا مؤكدة تاريخيًا تستوجب إعادة اختبار:** `html lang=en` في الصفحات العربية، نصوص provenance المختلطة RTL/LTR، Notion links التي قد تكون خاصة، وأسبقية source/hash card على المحتوى. تقرير 27 أكتوبر وثّق مشكلة اتجاه نصوص provenance على الموبايل؛ لا أعطيها حكم “ما زالت قائمة في 28 أكتوبر” دون إعادة اختبار الصفحات المذكورة.

**قرار تسموي:** استخدم `Arabic companion` لوصف relationship وليس badge `Course` مستقل ما لم يكن curriculum قائمًا بذاته. أفصل اللغة `language=ar` عن `sourceLanguage=en` وعن `translationStatus=original/companion/equivalent`.

---

## 10. Audit — Comprehensive Statistics

### 10.1 بنية المحتوى

التجربة تضم 43 source section، 9 journeys، 15 interactive labs، Formula Workbench، Decision Assistant، Glossary، Cheatsheet، Concept Atlas وSource/Provenance. البنية الأساسية ثرية ولا تحتاج أن تتحول إلى عشرات منتجات منفصلة.

**الرحلات التسع:** Foundations → Describe → Probability → Distributions → Sampling → Hypothesis → Experiments → Relationships → Synthesis.

**المعامل الـ15:** center & spread، binomial، normal، Poisson، sampling، confidence intervals، p-value، correlation، errors/power، business decision، probability space، distribution morph، dot-to-decision، experiments/randomization، practical significance.

### 10.2 مشكلة المفردات الإبداعية

هناك أسماء مثل `Poisson event-arrival theatre` و`The sampling factory` و`The p-value observatory` و`Correlation detective` و`The business decision room` و`SD vs SE & confidence-interval rain` و`Distribution morph studio`. هذه **ليست كلها أخطاء**؛ قد تكون تسميات ممتازة **لتجربة بصرية Cinematic**؛ ولكنها لا تصلح دائمًا **كاسم البحث الأساسي للمفهوم**.

**القاعدة:** اسم علمي قابل للبحث + اسم التجربة المميز، مثال:

- `Poisson arrivals · Event Theatre`
- `Sampling distributions · Sampling Factory`
- `P-values · Null Distribution Observatory`
- `Correlation & outliers · Correlation Detective`
- `Confidence intervals · CI Rain`

هذا يحافظ على الإبداع دون التضحية بقابلية البحث أو المعنى.

### 10.3 تكرار التجارب في الرحلات الطويلة

Journey Hypothesis طويلة جدًا وتدمج نصوصًا ومكونات كثيرة؛ تحتاج TOC مثبت، anchors، تقدم محلي، وربما **Progressive disclosure** للتجارب الثقيلة. لا تحول كل شيء إلى Cards flat؛ استخدم spatial/zoom transitions فقط للانتقال بين relation/scale/context، مع توفر النص والجدول دائمًا.

### 10.4 المسميات التقنية المتقاربة

- `Formula Workbench`: جيد إذا كان يعرض المعادلة والافتراضات ونتيجة ديناميكية.
- `Which statistical tool?`: جيد كتوجيه قائم على المهمة.
- `Interactive concept atlas`: لا يخلط مع Fabric Knowledge Atlas؛ ضع اسم domain في breadcrumb والبحث.
- `Glossary / Cheatsheet / Source`: مراجع منفصلة؛ يمكن جمعها في `Reference` tab مع deep-links.

---

## 11. Audit — Visualization Explore & scenarios

القائمة الحالية تشمل ستة chart labs: Histogram, Box, Scatter, Line, Bar, Dot؛ إلى جانب Chart Decision Assistant، Integrity Lab، Dashboard Anatomy، Specialty Chart Audit، وVisualization Scenario Bank (12).

### 11.1 عبارات مفيدة وعبارات غامضة

| الاسم / H1 | الفائدة | التحسين |
|---|---|---|
| `Six charts, six questions` | يحدد تجربة واضحة | احتفظ به مع أسماء charts الدقيقة |
| `Choose the chart after the question` | يصحح ترتيب التفكير | قوي، يظل أفضل حين يرتبط بنوع البيانات |
| `Nothing here is a lie. That is the problem.` | جذاب | يحتاج سطرًا واضحًا `Chart Integrity: Misleading Axes, Dual Axes, Simpson's Paradox` |
| `Two audiences, one dataset, two different pages` | يشرح المثال | وصف ممتاز لـDashboard Anatomy |
| `A component is not evidence until it survives the table` | رسالة تربوية جيدة | اجعل page title متوقعًا `Specialty charts: when to use, when to avoid` |
| `The chart is easy. The defence is the skill.` | hook تربوي | وضّح أنها 12 سؤالًا بلا score ولا timer |

### 11.2 تكرار «Lab»

توجد ثلاثة معانٍ مختلفة: `Data Lab` للاختبارات، `chart lab` لتعديل الرسم، و`Ingestion Decision Lab` للدروس التفاعلية. لا ينبغي أن تتحول إلى «Lab» عامة في الـnav؛ content-type الأدق **Assessment / Interactive Demo / Guided Decision Lesson**.

### 11.3 بيانات الأمثلة

الأمثلة في الرسومات تصرح غالبًا أنها synthetic/seeds، وهذا يجب أن يظل ظاهرًا. يُفضّل ربط كل visualization بـ`dataset`, `metric definition`, `visual decision`, `failure mode`, `table alternative`, `accessibility`, `source` بدل نسخ رسم ثابت إلى أداة جديدة فقط.

---

## 12. Audit — Portfolio, Services, About, Contact

**المحتوى المهني:** Work يعرض HSE Analytics، IBM Data Analyst Capstone، ADAS Prototype؛ Experience، About، Services، Contact موجودة على مسارات ثابتة. نصوص الصفحة المهنية كثيرًا ما تكون أسلوبية: `Three projects, three kinds of evidence`, `I build the boring parts first`, `Tell me the decision`, `Analytics that ends in a decision, not a folder of charts`.

هذه العناوين لها نبرة شخصية واضحة، لكنها ليست بديلًا عن تسميات الوجهات نفسها. **لا تعمّم أسلوب copy الخاص بصفحة About على وصف معمل تعليمي أو قائمة أسئلة**؛ يمكن وجود نبرة متماسكة مع vocabulary وظيفي دقيق.

**الأولوية بحسب المنتج الجديد:** هذه المنطقة ينبغي أن تظل مهنية وقابلة للعثور، **لكن لا تتصدر كل صفحة تعلم أو Footer باسم HSE**. يُنصح بفصل بيانات Work/Contact عن سياق Learning دون حذفها أو إخفاء نسبة العمل الحقيقية. قد تحتاج Homepage الجديد بوابة Portfolio ثانوية واضحة لمدير التوظيف.

**التواصل:** صفحة Contact تعتمد على إرسال عبر mail app؛ لا ينبغي أن يفهم المستخدم أن نموذجًا مرئيًا يعني إرسالًا داخل الموقع إذا كان الفعل يفتح تطبيق البريد. اعرض `Email` و`Copy email` و`Open email app` بتسميات دقيقة. لا تضف promises عن response time بدون قدرة فعلية. بعض صفحات العمل تعرض صور مشروع؛ تأكد من data sensitivity and source labeling.

---

## 13. Global navigation, search, metadata & accessibility

### 13.1 Navigation

**المسارات الموصوفة متداخلة:** Homepage يفضّل Atlas/Learn/Practice؛ باقي الصفحة يستخدم Work/Learn/Practice/Services/About. فهرس الكورس `/learn/catalogue/` مختلف عن `/learn/`. توجد جداول TOC خاصة لكل مجال وFooter عام. يجب بناء **واحد content router / site registry** يصف كل صفحة ومستوى breadcrumb والعنصر النشط في nav.

### 13.2 Search

`/search/` موجود بالفعل بعنوان `Find the page, not the folder.` لا ينبغي إعادة فتح finding 24 أكتوبر القديمة `No global search` بصيغتها المطلقة؛ المسار موجود. **التحقق التالي** هو محتوى الفهرس نفسه: هل يشمل كل 117 route؟ هل يبحث بالعربية وEnglish؟ هل يستطيع ربط سؤال DP-600 فردي برابط ثابت؟ هل النتائج تصنف type/domain/trust status؟ هذه فرضيات تحتاج تشغيل واختبار.

### 13.3 SEO / share metadata

فحص الصفحة الرئيسية والكتالوج وFabric أظهر استمرار `twitter:title`/`twitter:description` أو OG قديمة في صفحات منتجية، مع `keywords` افتراضية متكررة. في مخرجات Cloudflare لبعض صفحات charts/statistics، يعود `metadata.title` طويلًا ومُلحقًا بوصف الرسم الرقمي (مثل `Dot strip of 10 values…`)، **وهذا مؤشر يحتاج تحقق DOM** قبل اعتباره مشكلة فعليّة في HTML `<title>`؛ قد يكون ناتجًا عن أداة الاستخراج أو عنصر SVG في الصفحة.

### 13.4 Accessibility and motion

لا أؤكد Pass/Fail WCAG. يلزم اختبار interactive components عند 320/390/1280، 200% zoom، keyboard navigation، screen reader، RTL، reduced motion، tooltip dismissal، skip link، focus restoration، quiz correctness announcements، mouse-free slider alternatives. هدف التصميم السينمائي **حركة ذات معنى** لا hover-only كشف محتوى أو فقدان البدائل النصية.

### 13.5 Content provenance vs learner burden

SHA-256 والـsource text counts وأوصاف original export مفيدة للمراجع، لكن ليست أهم شيء يرغب المتعلم في رؤيته أعلى الدرس. تُعرض في expandable `Sources & verification`، بينما يبقى سؤال الدرس، المثال، والتفاعل في الصدارة.

---

## 14. Naming register — أمثلة عالية الأولوية

| ID | Where / current label | لماذا يحتاج إصلاحًا | Display name أو طريقة العرض المقترحة | الأولوية |
|---|---|---|---|---|
| N01 | Main `Atlas` → `/learn/dp-600/atlas/` | الرابط الأساسي ينتهي بصفحة Pending | `Atlas preview — not yet published` أو توجيه إلى Learning Journey المتاح | P0 |
| N02 | Homepage OG/Twitter portfolio text | هوية غير موحدة | `Hansa — Interactive data learning & knowledge` بعد قرار brand | P0 |
| N03 | `Data Lab` | يتداخل مع labs الفعلية | `Analyst Quick Assessments` | P1 |
| N04 | `/practice/` = Visual scenarios | يوحي بكتالوج عام | `Visualization Scenarios` | P1 |
| N05 | `/learn/` = Visualization course | يوحي بكل التعليم | `Data Visualization Course` | P1 |
| N06 | `Explore` كقسم مستقل | يتداخل مع Question Explorer/Atlas | `Visualization Experiments` | P1 |
| N07 | `Knowledge Atlas` vs `Statistics Atlas` vs `Visual Atlas` | الاسم قابل للاختلاط | domain-prefixed labels | P1 |
| N08 | `DP-600 Learning Academy` | حاليًا درس مكتمل واحد | `DP-600 Academy · Ingestion pilot` في catalogue | P1 |
| N09 | `Case studies` في Fabric | يتداخل مع portfolio cases | `Fabric Scenario Sets` | P1 |
| N10 | `Mock exam` | قد يُفهم مطابقة Microsoft | `Custom Timed Simulation` | P1 |
| N11 | source pack long video titles | filter غير قابل للمسح السريع | short canonical pack labels، long source title on detail | P1 |
| N12 | `Sources & coverage` | جيد لكن يخفي المنهج | `Sources, Mapping & Coverage` | P2 |
| N13 | `Practice, Assessment & Shelf` | `Shelf` غير معرف | `Practice, Assessment & Review` | P1 |
| N14 | `Implementation` chapter | غير محدد | `Build & Publish the Visualization` إذا صدّقه المحتوى | P2 |
| N15 | `Library map & operating system` | frame تنظيمي داخلي | `Visualization Learning Map` | P2 |
| N16 | `Interview Master Bank` under course | genre أقرب Practice | `Interview Scenarios & Questions` مع placement مناسب | P2 |
| N17 | `Poisson event-arrival theatre` | يصعب البحث باسمه | `Poisson arrivals · Event Theatre` | P2 |
| N18 | `SD vs SE & confidence-interval rain` | label طويل وغريب بمفرده | `Standard Error & Confidence Intervals · CI Rain` | P2 |
| N19 | `Correlation detective` | لا يقول موضوع المهارة | `Correlation & Outliers · Detective Lab` | P2 |
| N20 | `Distribution morph studio` | لا يصف قانون التوزيع | `Compare Probability Distributions · Morph Studio` | P2 |
| N21 | `Nothing here is a lie...` | H1 يحتاج وصف domain قريب | إبقاء tagline وإضافة `Chart Integrity Lab` واضح | P2 |
| N22 | `The chart is easy. The defence is the skill.` | tagline وليس شرح محتوى الصفحة | `Visualization Scenarios · 12 decisions` | P2 |
| N23 | `/search/` `Find the page, not the folder.` | جملة لطيفة لا تحدد الفئات | subtitle `Search lessons, tools, questions, references` | P2 |
| N24 | `Two courses` + Arabic course-style card | تنافر count/type | `2 guided courses + Arabic companion + references` حسب الحقيقة | P2 |
| N25 | `3 question banks / 906 questions` | مختلفة طبيعة assessments | `834 Fabric + 60 Analyst + 12 Visualization scenarios` مع النوع | P2 |
| N26 | `220+ source refs` style | يمكن فهمه إثباتًا لكل سؤال | `227 linked references across packs` | P2 |
| N27 | `Reading / Experimenting / Testing` | actions تُعرض أحيانًا كأنها types | fields مستقلة contentType + interactionMode | P1 |
| N28 | `Question ID` conspicuous | قيمة تدقيق لا تعليم | ID داخل Details/Report issue | P2 |
| N29 | `Progress & backup` | يتداخل الأداء مع تصدير localStorage | tabs `Progress`, `Saved sessions`, `Export/Import` | P2 |
| N30 | bilingual headings `الفصل 03 — Core Visual Grammar` | mixed-direction/translation | `الفصل 03 — قواعد التمثيل البصري (Visual Grammar)` وفق جودة الترجمة | P2 |

**تنبيه:** البدائل أعلاه **Proposed labels وليست نصوصًا حاليًا على الموقع**. يجب الموافقة على نظام أسماء واحد قبل تطبيق 30 تعديلًا منفصلًا.

---

## 15. المحتوى الذي يحتاج مراجعة معنى وليس مجرد إعادة تسمية

**A. Purpose mismatch:** عنوان يدل على `lab` بينما الصفحة اختبار؛ عنوان يدل على `course` بينما يوجد pilot واحد؛ CTA يدل على Atlas جاهز بينما الصفحة Pending.

**B. Evidence mismatch:** `DP-600` لا يعني أن كل محتوى Fabric يتبع كل المجالات؛ 480 focused لا تعني أن 480 Approved scientifically. عناصر validation status من المصدر يجب عرض معناها الصحيح.

**C. Instructional mismatch:** كتل provenance والتصريحات العلمية فوق مثال المستخدم؛ long mode selection before first value؛ مسار catalog يضغط 5+ حقول في البطاقة.

**D. Visual metaphor mismatch:** أسماء مثل Studio/Detective/Theatre تزيد الحضور البصري، لكن بدون mapping واضح للمفهوم تتحول إلى UX debt؛ يُفضّل `topic → experience name`, لا العكس.

**E. Navigation mismatch:** من Learn إلى /lab/dp-600/ ثم إلى Source packs، ومن Preview Atlas إلى صفحة Pending، ومن Work إلى HSE المتكرر في learning footer. أصلح graph روابط المعنى قبل تحديث الشكل.

**F. Question-level red flags to check, not confirmed per-item findings:** answer leakage من العنوان/التصنيف، دلالات غامضة، سياق ناقص، خيار صحيح أطول، شرح distractor generic، غياب صورة لازمة، مصادر قديمة، وخلط DP-600/700. هذه Checklist لاحق، لا حكم أن جميع الحالات موجودة.

---

## 16. Target information architecture — توصية غير تنفيذية

تصميم Hansa القادم ينبغي أن يختار **Object taxonomy واحدة** ثم يسمح بطرق استكشاف متعددة دون إعادة تسمية البيانات نفسها:

```text
Hansa
├── Discover                  ← Hero storytelling, concept links, contextual exploration
│   ├── Knowledge Atlas        ← when published; real graph + provenance
│   ├── Guided Journeys        ← topic-based flows
│   └── Interactive Demos      ← charts, statistics, fabric decisions
├── Learn                     ← browse by domain AND by learning format
│   ├── Fabric
│   │   ├── Academy lessons
│   │   ├── Concept reference
│   │   └── Related experiments
│   ├── Data Visualization
│   │   ├── 10-chapter course
│   │   ├── Reference pages
│   │   ├── Arabic companion
│   │   └── Chart experiments
│   └── Statistics
│       ├── 9 journeys / 43 source sections
│       ├── 15 interactive labs
│       └── Formulas / glossary / decision tools
├── Practice                  ← all true assessments, separate from demos
│   ├── Fabric questions
│   │   ├── Guided questions / Topic drills / Scenario sets / Timed simulations
│   │   └── Review / Progress / Sources / Coverage
│   ├── Analyst quick assessments (6 × 10)
│   └── Visualization scenarios (12)
├── Work                      ← 3 selected cases, Experience, About, Services, Contact
└── Search                    ← cross-domain and type-aware
```

**هذا نموذج مفاهيمي، لا أمر فوري بتغيير الروابط.** حافظ في مرحلة أولى على `/learn/`, `/practice/`, `/lab/dp-600/` وكل anchors ومعرّفات الأسئلة؛ الطبقة المرئية والـbreadcrumbs يمكن أن تتغير مع مسارات قديمة ثابتة.

### 16.1 Content object model

```ts
type HansaItem = {
  id: string;                    // immutable
  title: string;                 // scientific/searchable name
  displayTitle?: string;         // editorial / dramatic label
  domain: 'fabric'|'visualization'|'statistics'|'sql'|'powerbi'|'python'|'excel'|'career';
  kind: 'course'|'chapter'|'lesson'|'reference'|'lab'|'question'|'scenario'|'case-study'|'tool';
  availableActions: ('read'|'explore'|'practise'|'assess'|'review')[];
  availability: 'published'|'preview'|'planned'|'internal-review';
  audience: string[]; level?: string; language: 'en'|'ar'|'mixed';
  sourceRefs: string[]; objectiveRefs?: string[];
  prerequisites?: string[]; relatedIds?: string[];
  legacyRoutes: string[]; canonicalRoute: string;
  scientificStatus?: 'unreviewed'|'draft-review'|'independent-review'|'approved';
};
```

### 16.2 Navigation principles

- `Discover` تجربة استكشاف وليست اختصارًا لكل `Explore` الحالية.
- `Learn` هو وجهة المحتوى: course/reference/lab مع domain filters.
- `Practice` هو الاختبار/التمرين المرصود، لا محاكاة تفاعلية بلا grading.
- `Work` موجود لكنه أقل هيمنة على Learning Hub، ويُبرز الهوية المهنية عند الحاجة.
- Search وContent progress عالميان مع حدود استقلال bank states المعلنة.
- **No false affordances:** أي CTA غير جاهز يصنف `Preview` ولا يُقدَّم كـ`Launch full Atlas`.

---

## 17. سيناريوهات استخدام واختبارات قبول

### U1 — متعلم يريد فهم Shortcut/Mirroring

Home → Discover concept → Learning lesson → explore constraints → transfer case → related Fabric question → review. يجب ألا يضطر المستخدم لدخول صفحة Graph غير منشورة، وألا يضيع السياق أو الشروط عند العودة.

### U2 — متقدم DP-600 يحتاج دراسة حسب objective

Practice → Fabric → official objective / focus status → guided drill → save attempt → mistake explanation → independent sources → timed custom simulation. أي نسبة coverage تمثل **bank distribution** لا user mastery، والعكس في Progress.

### U3 — طالب يريد معرفة p-value

Search → `p-value` scientific topic → source explanation → Observatory lab → related misconception → next step. العبارة `Observatory` يجب ألا تمنع نتيجة البحث على `p-value`.

### U4 — مستخدم عربي يبحث عن رسم Scatter

Search/Visualization → language=Arabic → المصطلح العربي + Scatter Plot → التمرين والجدول → الرجوع للكورس. تتحقق اتجاهات النص/الأرقام تلقائيًا ولا تصبح Source hashes عائقًا.

### U5 — مسؤول توظيف

Home → Work → one evidence-backed case → role/context/artifact/result/limitations → CV/Experience/Contact. لا يُجبر على المرور بـAtlas أو الأكاديمية، ولا يُعاد عرض HSE بوصفه محورًا عامًا في كل صفحة تعلم.

### U6 — عودة مستخدم للمذاكرة

Practice → Progress → Resume exact session. يجب ألا يستأنف timer جديدًا بلا قصد أو يفقد IDs/bookmarks عند تغيّر label أو URL. يجب أن تظهر `device-only storage` والتصدير بوضوح.

---

## 18. خارطة المشكلات وأولويات العمل — قبل التصميم

### P0 — Product integrity (لا تبدأ الواجهة الجديدة قبل حسمها)

1. حل تناقض Main Atlas CTA مع صفحة `Publication review is pending` والـjourney backlinks.
2. توحيد positioning metadata الرئيسية وSocial cards مع هوية Hansa التعليمية الحقيقية.
3. تعريف الفرق بين Learning/Assessment/Experiment/Reference في registry واحد.
4. منع أي Claim بأن كامل 834 question bank معتمد علميًا أو يمثل توزيع DP-600 الصحيح دون سند.

### P1 — Architecture and information scent

5. تثبيت nav contract واحد يشرح Homepage vs internal header.
6. تسمية `/learn/`, `/practice/`, `/lab/`, `/explore/` في UI بما تفعله الآن.
7. إعادة تعريف مسارات DP-600 modes (study/practice/mock/review) وحالة السؤال.
8. تحويل video/pack technical long titles إلى أسماء topic قصيرة وفصل source metadata.
9. تنظيم Statistical labs بمصطلحات علمية وفنية معًا.
10. ربط lesson↔lab↔question↔reference بروابط relation واضحة ذات معنى.
11. تحديد أن `Arabic companion` مسار مكمل وليس full translation.
12. إبقاء HSE/portfolio أدنى من Learning في الصفحة الرئيسية الجديدة وفق قرار المنتج.
13. خطة عدم كسر legacy routes/localStorage/bookmarks/anchor links.

### P2 — Editorial clarity and usability

14. مراجعة عنوان الفصل 10 `Shelf`، الفصل 09 `Implementation`، Library operating-system metaphor، Interview Master Bank placement.
15. تقليل duplicated stats/KPI strips وrepeat link lists داخل صفحات التعلم.
16. تقليل قوالب provenance الظاهرة أعلى الشرح وتحويلها إلى details قابلة للفتح.
17. توحيد القوائم العربية/الإنجليزية وتسميات lab source.
18. Meta descriptions وOG/Twitter على مستوى كل صفحة لا global portfolio defaults.
19. Semantic search index ومسارات shareable results/individual questions.
20. تدقيق `metadata.title` anomaly في interactive pages من DOM الأصلي.
21. مراجعة نبرة copy: فنية، واضحة، لا مجازات مبهمة دون descriptor.

### P3 — Release quality gates

22. Browser QA multi-viewport + axe/WCAG 2.2 AA؛ keyboard/focus/RTL/reduced-motion.
23. E2E questions: guided, timed, cases, flags, review, refresh/resume/export/import.
24. 117-route link check + sitemap comparison + canonical tests + status report.
25. Scientific per-question audit for 834 deployed items **separately** from architecture redesign.
26. 13 unverified route body fetches؛ كان سبب التعثر browser-rendering rate limit، لا 404 مثبت.

---

## 19. Design-readiness guardrails — ربط المراجعة بالرؤية Spatial/Prototype C

**لا تكرر نسخة Flat مع تأثيرات سطحية.** واجهة Spatial يجب أن تعبّر عن طبقات حقيقية: topic, relationship, confidence, evidence, action, progress. ليست الدائرة الجرافيكية بديلًا عن وجود relation data موثقة.

- **Depth**: foreground concept → connected nodes → source/evidence layer; progressive zoom لا يخفي النص.
- **Motion**: reveal relationship, transition modes, communicate state and choice; avoid decorative constant motion.
- **Narrative**: Home كـentry/knowledge stage، domain hubs كبوابات، lesson كرحلة، tool كلوحة تحكم، bank كمنظومة قرار وتقييم.
- **Typography**: scientific title + emotional one-line hook بدل استعارة غير مفهومة بمفردها.
- **Label system**: ثابت بين cards, graph nodes, breadcrumbs, question filters, search, sitemap.
- **Accessibility**: keyboard alternative, real semantic elements, text/table fallback, reduced-motion, contrast.
- **Engineering**: تفاعل واجهة Next.js static export ممكن، لكن لا تفرض release جديدة ولا migration قبل اعتماد taxonomy.

**شرط الاستعداد لتصميم الواجهة:** يجب أن تصدر نسخة `IA_Approved` تشمل أسماء الموارد والـcanonical IDs وAvailability states وواجبات كل CTA، ويتبعها prototype بوجود data source موثق. ليس المطلوب ملاحقة عدد من الأنيميشنات على صفحات غير متسقة.

---

## 20. What this audit does NOT certify

- لم أزر كل **حالة تفاعلية** داخل كل Lab أو أختبر كل خيار مرئي.
- لم أراجع مضمون الـ834 سؤالًا سؤالًا ولا كل تفسير/مفتاح.
- لم أعدّل source code المحلي ولا أجريت build، deploy، performance trace أو screenshot comparison.
- 13 صفحة مرتبطة وحاضرة في الجرد لم أستطع جلب متنها مباشرة الآن؛ سبق تناول البنية العربية والإحصائية في تقرير 27 أكتوبر، لكنه ليس دليل إصدار 28 أكتوبر.
- `Cloudflare Browser Rendering 429` منع إكمال بعض طلبات القراءة؛ لا يعني أن هذه الصفحات غير موجودة على الموقع.
- لا يوجد تأكيد بأن كل 117 route موجود داخل `sitemap.xml` الحالي؛ قائمة الجرد هي **discoverable internal routes** لا output رسمي للـsitemap.
- لا تؤخذ أرقام Questions/QA من مشاريع علمية منفصلة على أنها جزء منشور بالفعل دون مقارنة immutable IDs.

---

## 21. Required next artefacts before any UI implementation

| المخرج | المحتوى | معيار القبول |
|---|---|---|
| Canonical content registry | جميع الـ117 route، الاسم، النوع، domain، availability، source | لا صفحة بلا موقع في الشجرة ولا نوع غير معرّف |
| Naming dictionary | الأسماء الحالية + المقترحة + owner approval | أسماء علمية قابلة للبحث + creative display titles |
| Link graph | علاقة كل lesson/tool/question/source وCTA | لا CTA يذهب إلى Pending دون إفصاح |
| Question audit ledger | 834 deployed IDs مع content-science review منفصل | لا تغيير سؤال بلا original vs proposed |
| UX requirements | status, loading, empty, progress, error, focus, mobile, motion | لا تصميم يعتمد على الحركة وحدها |
| Approved IA and Release Plan | مراحل تغيير UI دون كسر aliases | E2E tests للروابط والـlocalStorage والـtimers |

**المرفقات:** `Hansa_Route_Inventory_2026-10-28.csv`، `Hansa_Issues_and_Renames_2026-10-28.csv`، وملف JSON للجرد، وحزمة ZIP للتسليم للـagent.

---

## Appendix A — جميع مسارات الصفحات المكتشفة (117)

*تحمل السطور علامة [LIVE] لمن جُلب متنها في 28 أكتوبر، و[LINKED] لمن جرى حصره دون إعادة جلب المتن. التفاصيل الدقيقة في CSV.*


### Home (1)

- [LIVE] [/](https://hansa.amir-portfolio.workers.dev/)

### Navigation & catalogues (3)

- [LIVE] [/learn/catalogue/](https://hansa.amir-portfolio.workers.dev/learn/catalogue/)
- [LIVE] [/practice/catalogue/](https://hansa.amir-portfolio.workers.dev/practice/catalogue/)
- [LIVE] [/search/](https://hansa.amir-portfolio.workers.dev/search/)

### Portfolio (8)

- [LIVE] [/about/](https://hansa.amir-portfolio.workers.dev/about/)
- [LIVE] [/contact/](https://hansa.amir-portfolio.workers.dev/contact/)
- [LIVE] [/experience/](https://hansa.amir-portfolio.workers.dev/experience/)
- [LIVE] [/services/](https://hansa.amir-portfolio.workers.dev/services/)
- [LIVE] [/work/](https://hansa.amir-portfolio.workers.dev/work/)
- [LIVE] [/work/adas/](https://hansa.amir-portfolio.workers.dev/work/adas/)
- [LIVE] [/work/hse-analytics/](https://hansa.amir-portfolio.workers.dev/work/hse-analytics/)
- [LIVE] [/work/ibm-capstone/](https://hansa.amir-portfolio.workers.dev/work/ibm-capstone/)

### Fabric learning (4)

- [LIVE] [/learn/dp-600/](https://hansa.amir-portfolio.workers.dev/learn/dp-600/)
- [LIVE] [/learn/dp-600/atlas/](https://hansa.amir-portfolio.workers.dev/learn/dp-600/atlas/)
- [LIVE] [/learn/dp-600/atlas/journey/](https://hansa.amir-portfolio.workers.dev/learn/dp-600/atlas/journey/)
- [LIVE] [/learn/dp-600/ingestion/](https://hansa.amir-portfolio.workers.dev/learn/dp-600/ingestion/)

### Fabric assessment (9)

- [LIVE] [/lab/dp-600/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/)
- [LIVE] [/lab/dp-600/cases/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/cases/)
- [LIVE] [/lab/dp-600/explore/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/explore/)
- [LIVE] [/lab/dp-600/mock/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/mock/)
- [LIVE] [/lab/dp-600/practice/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/practice/)
- [LIVE] [/lab/dp-600/progress/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/progress/)
- [LIVE] [/lab/dp-600/resources/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/resources/)
- [LIVE] [/lab/dp-600/review/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/review/)
- [LIVE] [/lab/dp-600/study/](https://hansa.amir-portfolio.workers.dev/lab/dp-600/study/)

### General analyst assessment (7)

- [LIVE] [/lab/](https://hansa.amir-portfolio.workers.dev/lab/)
- [LIVE] [/lab/excel/](https://hansa.amir-portfolio.workers.dev/lab/excel/)
- [LIVE] [/lab/fundamentals/](https://hansa.amir-portfolio.workers.dev/lab/fundamentals/)
- [LIVE] [/lab/power-bi/](https://hansa.amir-portfolio.workers.dev/lab/power-bi/)
- [LIVE] [/lab/python/](https://hansa.amir-portfolio.workers.dev/lab/python/)
- [LIVE] [/lab/sql/](https://hansa.amir-portfolio.workers.dev/lab/sql/)
- [LIVE] [/lab/statistics/](https://hansa.amir-portfolio.workers.dev/lab/statistics/)

### Data Visualization learning (28)

- [LIVE] [/learn/](https://hansa.amir-portfolio.workers.dev/learn/)
- [LIVE] [/learn/accessibility-color-qa/](https://hansa.amir-portfolio.workers.dev/learn/accessibility-color-qa/)
- [LIVE] [/learn/advanced-multivariate/](https://hansa.amir-portfolio.workers.dev/learn/advanced-multivariate/)
- [LIVE] [/learn/applied-cases/](https://hansa.amir-portfolio.workers.dev/learn/applied-cases/)
- [LIVE] [/learn/audience-story/](https://hansa.amir-portfolio.workers.dev/learn/audience-story/)
- [LIVE] [/learn/chapter/01/](https://hansa.amir-portfolio.workers.dev/learn/chapter/01/)
- [LIVE] [/learn/chapter/02/](https://hansa.amir-portfolio.workers.dev/learn/chapter/02/)
- [LIVE] [/learn/chapter/03/](https://hansa.amir-portfolio.workers.dev/learn/chapter/03/)
- [LIVE] [/learn/chapter/04/](https://hansa.amir-portfolio.workers.dev/learn/chapter/04/)
- [LIVE] [/learn/chapter/05/](https://hansa.amir-portfolio.workers.dev/learn/chapter/05/)
- [LIVE] [/learn/chapter/06/](https://hansa.amir-portfolio.workers.dev/learn/chapter/06/)
- [LIVE] [/learn/chapter/07/](https://hansa.amir-portfolio.workers.dev/learn/chapter/07/)
- [LIVE] [/learn/chapter/08/](https://hansa.amir-portfolio.workers.dev/learn/chapter/08/)
- [LIVE] [/learn/chapter/09/](https://hansa.amir-portfolio.workers.dev/learn/chapter/09/)
- [LIVE] [/learn/chapter/10/](https://hansa.amir-portfolio.workers.dev/learn/chapter/10/)
- [LIVE] [/learn/chart-selection/](https://hansa.amir-portfolio.workers.dev/learn/chart-selection/)
- [LIVE] [/learn/color-perception/](https://hansa.amir-portfolio.workers.dev/learn/color-perception/)
- [LIVE] [/learn/core-chart-types/](https://hansa.amir-portfolio.workers.dev/learn/core-chart-types/)
- [LIVE] [/learn/dashboard-design/](https://hansa.amir-portfolio.workers.dev/learn/dashboard-design/)
- [LIVE] [/learn/foundations/](https://hansa.amir-portfolio.workers.dev/learn/foundations/)
- [LIVE] [/learn/interview-bank/](https://hansa.amir-portfolio.workers.dev/learn/interview-bank/)
- [LIVE] [/learn/method/](https://hansa.amir-portfolio.workers.dev/learn/method/)
- [LIVE] [/learn/overview/](https://hansa.amir-portfolio.workers.dev/learn/overview/)
- [LIVE] [/learn/power-bi-playbook/](https://hansa.amir-portfolio.workers.dev/learn/power-bi-playbook/)
- [LIVE] [/learn/quick-reference/](https://hansa.amir-portfolio.workers.dev/learn/quick-reference/)
- [LIVE] [/learn/statistical-traps/](https://hansa.amir-portfolio.workers.dev/learn/statistical-traps/)
- [LIVE] [/learn/visual-atlas/](https://hansa.amir-portfolio.workers.dev/learn/visual-atlas/)
- [LIVE] [/learn/visual-integrity/](https://hansa.amir-portfolio.workers.dev/learn/visual-integrity/)

### Arabic learning (12)

- [LIVE] [/learn/ar/](https://hansa.amir-portfolio.workers.dev/learn/ar/)
- [LIVE] [/learn/ar/bar-plot/](https://hansa.amir-portfolio.workers.dev/learn/ar/bar-plot/)
- [LINKED] [/learn/ar/box-plot/](https://hansa.amir-portfolio.workers.dev/learn/ar/box-plot/)
- [LINKED] [/learn/ar/color/](https://hansa.amir-portfolio.workers.dev/learn/ar/color/)
- [LINKED] [/learn/ar/core-charts/](https://hansa.amir-portfolio.workers.dev/learn/ar/core-charts/)
- [LINKED] [/learn/ar/dot-plot/](https://hansa.amir-portfolio.workers.dev/learn/ar/dot-plot/)
- [LINKED] [/learn/ar/histogram/](https://hansa.amir-portfolio.workers.dev/learn/ar/histogram/)
- [LINKED] [/learn/ar/line-plot/](https://hansa.amir-portfolio.workers.dev/learn/ar/line-plot/)
- [LINKED] [/learn/ar/reading-paths/](https://hansa.amir-portfolio.workers.dev/learn/ar/reading-paths/)
- [LINKED] [/learn/ar/references/](https://hansa.amir-portfolio.workers.dev/learn/ar/references/)
- [LINKED] [/learn/ar/scatter-plot/](https://hansa.amir-portfolio.workers.dev/learn/ar/scatter-plot/)
- [LINKED] [/learn/ar/tips/](https://hansa.amir-portfolio.workers.dev/learn/ar/tips/)

### Statistics reference (32)

- [LIVE] [/learn/statistics/](https://hansa.amir-portfolio.workers.dev/learn/statistics/)
- [LIVE] [/learn/statistics/atlas/](https://hansa.amir-portfolio.workers.dev/learn/statistics/atlas/)
- [LINKED] [/learn/statistics/cheatsheet/](https://hansa.amir-portfolio.workers.dev/learn/statistics/cheatsheet/)
- [LIVE] [/learn/statistics/decision/](https://hansa.amir-portfolio.workers.dev/learn/statistics/decision/)
- [LIVE] [/learn/statistics/formulas/](https://hansa.amir-portfolio.workers.dev/learn/statistics/formulas/)
- [LINKED] [/learn/statistics/glossary/](https://hansa.amir-portfolio.workers.dev/learn/statistics/glossary/)
- [LIVE] [/learn/statistics/journey/describe/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/describe/)
- [LIVE] [/learn/statistics/journey/distributions/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/distributions/)
- [LIVE] [/learn/statistics/journey/experiments/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/experiments/)
- [LIVE] [/learn/statistics/journey/foundations/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/foundations/)
- [LIVE] [/learn/statistics/journey/hypothesis/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/hypothesis/)
- [LIVE] [/learn/statistics/journey/probability/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/probability/)
- [LIVE] [/learn/statistics/journey/relationships/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/relationships/)
- [LIVE] [/learn/statistics/journey/sampling/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/sampling/)
- [LIVE] [/learn/statistics/journey/synthesis/](https://hansa.amir-portfolio.workers.dev/learn/statistics/journey/synthesis/)
- [LIVE] [/learn/statistics/labs/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/)
- [LIVE] [/learn/statistics/labs/binomial/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/binomial/)
- [LIVE] [/learn/statistics/labs/business-decision/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/business-decision/)
- [LIVE] [/learn/statistics/labs/center-spread/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/center-spread/)
- [LIVE] [/learn/statistics/labs/confidence/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/confidence/)
- [LIVE] [/learn/statistics/labs/correlation/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/correlation/)
- [LIVE] [/learn/statistics/labs/distributions/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/distributions/)
- [LIVE] [/learn/statistics/labs/dot-to-decision/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/dot-to-decision/)
- [LIVE] [/learn/statistics/labs/errors/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/errors/)
- [LIVE] [/learn/statistics/labs/experiments/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/experiments/)
- [LIVE] [/learn/statistics/labs/normal/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/normal/)
- [LIVE] [/learn/statistics/labs/p-value/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/p-value/)
- [LIVE] [/learn/statistics/labs/poisson/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/poisson/)
- [LIVE] [/learn/statistics/labs/practical-significance/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/practical-significance/)
- [LIVE] [/learn/statistics/labs/probability/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/probability/)
- [LIVE] [/learn/statistics/labs/sampling/](https://hansa.amir-portfolio.workers.dev/learn/statistics/labs/sampling/)
- [LINKED] [/learn/statistics/source/](https://hansa.amir-portfolio.workers.dev/learn/statistics/source/)

### Visualization interactive labs (12)

- [LIVE] [/explore/](https://hansa.amir-portfolio.workers.dev/explore/)
- [LIVE] [/explore/charts/](https://hansa.amir-portfolio.workers.dev/explore/charts/)
- [LIVE] [/explore/charts/bar/](https://hansa.amir-portfolio.workers.dev/explore/charts/bar/)
- [LIVE] [/explore/charts/box/](https://hansa.amir-portfolio.workers.dev/explore/charts/box/)
- [LIVE] [/explore/charts/dot/](https://hansa.amir-portfolio.workers.dev/explore/charts/dot/)
- [LIVE] [/explore/charts/histogram/](https://hansa.amir-portfolio.workers.dev/explore/charts/histogram/)
- [LIVE] [/explore/charts/line/](https://hansa.amir-portfolio.workers.dev/explore/charts/line/)
- [LIVE] [/explore/charts/scatter/](https://hansa.amir-portfolio.workers.dev/explore/charts/scatter/)
- [LIVE] [/explore/choose/](https://hansa.amir-portfolio.workers.dev/explore/choose/)
- [LIVE] [/explore/dashboards/](https://hansa.amir-portfolio.workers.dev/explore/dashboards/)
- [LIVE] [/explore/integrity/](https://hansa.amir-portfolio.workers.dev/explore/integrity/)
- [LIVE] [/explore/specialty/](https://hansa.amir-portfolio.workers.dev/explore/specialty/)

### Visualization assessment (1)

- [LIVE] [/practice/](https://hansa.amir-portfolio.workers.dev/practice/)

**End of evidence-bounded, read-only audit.**
