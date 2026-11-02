# سياق Hansa وخريطة التعديل — 30 أكتوبر 2026

هذا مرجع للحالة المحلية الفعلية، أُعد استجابة لطلب فهم المشروع قبل التعديل. لا يحل محل `AGENTS.md` أو السياسات المتخصصة. لم يُعدّل كود التطبيق أو المحتوى التعليمي أو مفاتيح الإجابات أو التقدّم، ولم يحدث نشر. أُعيد توليد `.next/` و`out/` بالبناء المحلي.

**النتيجة:** المشروع قابل للبناء واختباراته الأساسية ناجحة، لكن توجد فروق توثيقية وروابط وتفاعل تحتاج معالجة. توجد طبقات مختلفة للتعلم والممارسة والمراجعة؛ توحيد شكلها لا يسمح بتوحيد حالات اعتمادها أو حذف سجلاتها.

**حدود كلمة «كامل»:** الحصر يغطي الملفات غير المستثناة، والمكونات والمسارات والاعتمادات والمحتوى المنظم والفحوص المبينة أدناه. جرت قراءة تفصيلية للأجزاء الحاكمة وتتبّع تدفقات العمل، واستخراج آلي لبقية الفهرس. لم تُراجع كل عبارة علميًا أو كل سجل تاريخي يدويًا، ولم تُنفّذ كل رحلة ممكنة في كل متصفح. توجد فروق واضحة بين الحصر، وفهم التنفيذ، والتحقق العلمي، والتحقق البصري؛ لا تُعامل كشيء واحد.

## 1. نقطة البداية والمرجعية

- المستودع: `D:/BeUI/amir-portfolio`، والفرع: `feat/dp600-academy-ingestion-20261025`.
- HEAD عند البداية: `45704b586237ae26a4c55be944d27147e84f491b`؛ الشجرة ليست نظيفة. التحليل يشمل التعديلات المحلية فوقه، لا الـ commit وحده.
- اقرأ أولًا [تعليمات المستودع](../../AGENTS.md)، ثم [مدخل المراجع](../agent-reference/START_HERE.md).
- الحفظ والتربية: [المرجع العام](../agent-reference/HANSA_MASTER_AGENT_REFERENCE_v1.0.md). الهيكل وتجربة الاستخدام: [خطة v2](../agent-reference/Hansa_Master_Audit_Reorganization_Plan_v2_2026-10-24.md). التمثيل والحركة: [السياسة التكيفية](../agent-reference/HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md).
- الأطلس: [مدخله](../knowledge-atlas/START_HERE.md). المكونات المرشحة: [سجل EasyUI](../design-system/easyui-v2/CONTEXTUAL_COMPONENT_REGISTRY.json).
- لعمل مرئي لاحق: اقرأ `.agents/skills/hansa-creative-intelligence/SKILL.md` قبل التنفيذ، ثم موجز الصفحة والسياسات ذات الصلة. لم يُنفّذ تصميم جديد في هذه المراجعة.
- التعليمات الحالية والكود الحالي مقدمان على أوصاف المراحل القديمة. في بعض الوثائق عبارة «documentation only» تتبعها تعديلات لاحقة تثبت تنفيذًا فعليًا. لا تنسخ الحالة الأولى وحدها.

## 2. ماهية المنتج وتجربة الزائر

Hansa منتج تعلم واستكشاف للبيانات، وله أيضًا صفحات خلفية مهنية وأعمال وخدمات. الصفحة الرئيسية الحالية تقدم فكرة مؤرخة وبطاقات وتفاعلًا مفاهيميًا، ومنها إلى مكتبة التعلم والممارسة وحالة الأطلس. الصفحات المهنية موجودة فعلًا، لكنها ليست محور التنقل الرئيسي.

التنقل الرئيسي الحالي، من `lib/site.ts`: **Today → Learn → Practice → Atlas → About**. Work وServices وExperience وContact موجودة في التنقل الثانوي والتذييل. أسماء وتوزيعات التنقل في تقارير 24 أكتوبر ليست وصفًا دقيقًا للحالة الحالية.

رحلة التعلم: مجال ← موضوع ← شرح أو تجربة أو سؤال أو مرجع. رحلة المسار: قراءة ← ممارسة ← تطبيق وتفسير، مع روابط عودة تحفظ سياق الدرس. Python وExcel وPower BI لا تماثل اكتمال مسار SQL أو الإحصاء؛ بعض نقاط الدخول قراءات خارجية أو أسئلة فقط، ولا يجوز عرضها على أنها دورات محلية كاملة.

## 3. البنية التقنية وحدودها

| الجزء | الحالة المثبتة محليًا | أثره عند التعديل |
|---|---|---|
| الإطار | Next.js 16.4.3، React وReact DOM 19.3.0 بحسب package.json | تطبيق App Router؛ تجنب نقل افتراضات مشروع خادم تقليدي إليه |
| الأنواع | TypeScript strict؛ alias `@/` لجذر المستودع | الأنواع والـ JSON مترابطة، والبناء يجري فحص TypeScript |
| الأسلوب | Tailwind 4، CSS محلي، Geist وGeist Mono | الرموز المشتركة في `app/globals.css` تؤثر على المنتج كله |
| الحركة | Motion؛ مساعدات محلية في `lib/motion` و`components/cinematic` | استخدم تقليل الحركة، ولا تعد الملفات المحذوفة دون فهم قرار الاستبدال |
| الحساب | وحدات TS نقية للإحصاء والرسوم وSQL التوضيحي | الرسم يعرض الحساب؛ لا يُنشئ تعريفًا رياضيًا مكررًا |
| الصيغ | KaTeX؛ مراجع المعادلات وإصلاحاتها ضمن الإحصاء | حفظ الصيغة الأصلية وتصحيحها الموثق، مع اتجاه LTR |
| التحميل | بناء ثابت، وتفاعلات React في المتصفح، وتحميل حزم أسئلة عند الحاجة | لا توجد API أو مصادقة أو قاعدة بيانات لتوفير ميزة جديدة تلقائيًا |
| التحقق | Node test، ESLint، فاحصات بصمات ومسارات، Playwright وaxe | كل طبقة تحقق لها نطاق مستقل |
| الاستضافة المهيأة | Worker باسم `hansa` يخدم `out/` كأصول فقط | الإعداد المحلي لا يثبت حالة الحساب أو النسخة المنشورة |

`next.config.ts`: `output: "export"` و`trailingSlash: true` و`images.unoptimized: true`، مع basePath/assetPrefix من `NEXT_PUBLIC_BASE_PATH`. المسارات الديناميكية تُحصَر أثناء البناء، وليست توليد صفحات عند كل زيارة. `postbuild` ينشئ aliases لحزم segments؛ هو جزء من سلسلة التسليم، فلا تتخطه عند بناء إصدار.

لا يوجد سكربت Worker تطبيقي في إعداد الاستضافة الحالي. لا تضف Server Actions أو جلسات خادمية أو اتصال قاعدة بيانات أو أسرارًا في كود المتصفح تحت افتراض أنها مدعومة. `npm run start` يشغّل `next start` بحسب package.json، بينما مسار المعاينة الموثق للتصدير هو `npm run preview`؛ لا تفترض أن start يختبر طريقة الاستضافة الثابتة.

## 4. خريطة المجلدات

| المسار | مسؤوليته | وضعه عند التعديل |
|---|---|---|
| `app/` | المسارات والـ layouts والـ metadata وملفات SEO | حافظ على العناوين والروابط القديمة والمعلمات |
| `components/` | العرض والتفاعل، موزع بحسب النطاق | 211 ملفًا في لقطة الحصر؛ ليست كلها مكونات مستخدمة أو مستقلة |
| `lib/` | البيانات المهيأة والأنواع والمنطق والحساب والربط | 81 ملفًا؛ أكثر مواقع الانتشار في خريطة الاستيراد |
| `content/` | الدروس والأسئلة والمراجع والطبقات التحريرية | 124 ملف JSON؛ بعضها مصدر مشتق أو مراجعة وليس محتوى معتمدًا |
| `intake/` | مصادر محفوظة وصادرات ولقطات registry | لا تُعدّل المصدر لاستيعاب تغيير عرض |
| `intake-private/` | مواد مراجعة محلية مستثناة من Git | لم يُقرأ محتواها ضمن هذا التحليل؛ لا تُنقل إلى public |
| `public/` | الصور والوسائط وملفات التحميل وheaders | ملفات هذا المجلد قابلة للخدمة للزائر |
| `scripts/` | استيراد وبناء وفحص ومعاينة وتسليم | ليست كل scripts فحوص قراءة؛ بعضها يعيد كتابة المحتوى |
| `tests/` | اختبارات منطق ومحتوى ومتصفح | اختبارات Academy ليست ضمن `test:all` الحالي |
| `docs/` | السياسات والتاريخ والبصمات والأدلة | 3267 ملفًا في اللقطة؛ السجلات التاريخية ليست مصدر السلوك الحالي |
| `.next/`, `out/`, `build/` | مخرجات ونسخ عمل مولدة | ليست المصدر الذي نصلح فيه المنطق |
| `graphify-out/` | مستخرجات معمارية داعمة | ليست بديلًا عن فحص الاستيراد والكود الحالي |

حصر البداية: **4531 ملفًا**، منها **551 ملف كود/أنماط/سكربت/اختبار** في الجذور المحددة. استُثنيت dependencies وGit ومخرجات البناء و`.scratch` و`intake-private`. أسماء ومساحات هذه الأرقام مختلفة؛ لا تجمعها باعتبارها مجموعات مستقلة.

## 5. مسار البيانات الأساسي

```text
Original exports / pinned courseware / curated corpus
             ↓ import/build scripts
content JSON + typed authored modules
             ↓
source-documents.ts ───────────→ site search index → browser search
             ↓
study/server.ts + taxonomy + classification corrections
             ↓
topic pages / topic-browser
             ↓
learning-path.ts → subject paths → path-units

Question JSON → Fabric loaders → engine → runner → local progress
R11/additions/drafts → separate review and grading policies
Atlas editorial data → validateDataset → projectAtlas → public views
Insight feed → eligibility filter → canonical landing → edition interactions
```

طبقة `source-documents.ts` مشتركة بين البحث واكتشاف التعلم، لكنها ليست فهرس كل المحتوى. `study/server.ts` يضيف سجلات أخرى مباشرة: البنك الحالي، الإضافات، الملاحظات، الدروس والروابط المنتقاة. لذلك **769 مستند بحث** لا تساوي **4859 سجل كتالوج**. البحث العام لا يستوعب تلقائيًا كل المراجع الخارجية أو كل بنك Fabric؛ التصفية داخل الموضوع ومساحة البنك تكمل الاكتشاف.

تصنيف الموضوع يجمع metadata ومطابقة عناوين وقواعد تحريرية وتصحيحات صريحة. هو تنظيم للمحتوى، لا اعتماد للإجابة ولا برهان متطلبات سابقة. `learning-path.ts` يحتوي ترتيبًا ومطابقات تعليمية ويفحص دورات المتطلبات السابقة؛ ذلك منفصل عن نشر حواف الأطلس.

## 6. الحصر الحالي للمحتوى

| الطبقة | العدد الحالي | معنى العدد |
|---|---|---|
| المجالات / الموضوعات | 8 / 55 | Taxonomy؛ SQL له 21 موضوعًا حاليًا |
| سجلات الدراسة | 4859 | 1004 قراءة، 56 تجربة، 1897 سؤالًا، 1902 مرجعًا؛ ليست بالضرورة عناصر مستقلة دون تداخل مفاهيمي |
| خطوات المسارات | 816 | 89 درسًا، 720 ملاحظة، 7 قراءات تأسيسية خارجية؛ لا تشمل جميع دروس Academy كخطوات مستقلة |
| مكتبة المراجعة | 3165 سجلًا | 3128 سؤالًا +20 درسًا +17 تجربة؛ ليست ترقية للنشر أو التصحيح |
| التصوير البياني | 10 فصول /27 درسًا | 16 إنجليزيًا و11 عربيًا؛ 25 صفحة أصلية، و6 مختبرات رسوم و12 سيناريو |
| الإحصاء | 43 قسمًا /102 موضع صيغة | 9 رحلات و15 مختبرًا؛ لا يعني 102 معادلة فريدة مستقلة |
| SQL | 53 صفحة /18 وحدة أساسية | 35 مرجعًا مساندًا، 16 self-check و10 أسئلة البنك العام محفوظة |
| Fabric الأساسي | 1264 سؤالًا /27 حزمة | 623 سجل مصدر، 78 case study؛ لا تُجمع أعداد المصادر مع الأسئلة |
| إضافات الأسئلة | 532 سجلًا | 452 DP-600 و80 PL-300، محفوظة خارج البنك الأساسي |
| R11 | 222 سجلًا | overlay على جزء موجود من الإضافات، لا 222 سؤالًا إضافيًا؛ 11 تصحيحًا موثقًا و211 موقوف التصحيح |
| البنك العام | 70 سؤالًا /7 بنوك | 10 أسئلة لكل بنك، ومنها Fabric RTI |
| المراجع المنتقاة | 1859 | LINK_ONLY؛ عرض رابط ووصف، لا إعادة نشر كامل المصدر |
| مختبرات corpus | 29 | صفحات scaffold تتطلب بيئة خارجية؛ لا دليل تنفيذ Native من مجرد وجود الصفحة |
| Academy | 74 درسًا | 48 Fabric Analytics و26 Power BI من courseware مع attribution |
| RTI | 8 دروس /17 blueprint | الدرس المحلي لا يحوّل حالة تشغيل blueprint من NOT_RUN إلى PASS |
| Daily Insight | 3 إصدارات | جميعها technical_review، وتعرض بصفتها preview صراحة |
| Atlas العام | 0 مفهوم /0 حافة منشورة | حالة صحيحة بحسب بوابات النشر، وليست شبكة مفقودة ينبغي اختراعها |

المجالات بالترتيب: Fabric، Statistics، Visualization، Power BI، SQL، Python، Excel، Analytical foundations. عدد الخطوات: Fabric 721، Statistics 43، Visualization 27، Power BI 4، SQL 18، وباقي المجالات خطوة لكل مجال. هذا توزيع التنفيذ الحالي، وليس تقييمًا لجودة أو اكتمال التعليم.

البنك الموحد عند اختيار كلا الامتحانين يعرض **1796 سجلًا =1264+532**. أرقام 834 و60 في بعض النسخ ليست مرجعًا للحالة الحالية. لا تجمع R11 مرة ثانية، ولا تدمج مسودات R18 مع أسئلته لمجرد تشابه المصدر.

## 7. المسارات وعقود الروابط

جرت فهرسة **367 مسارًا مصدّرًا**، تشمل `/404.html` ونسخة not-found الخاصة بالإطار. الرقم 370 في تقدم البناء ليس تعداد صفحات المستخدم؛ توجد مخرجات metadata وغيرها. الفهرس التفصيلي يحفظ route وtitle وcanonical وanchors والروابط وحجم HTML وبصمته.

| عائلة المسار | المسؤولية | مالك التغيير الأساسي |
|---|---|---|
| `/` و`/prototype-c/` | الصفحة الرئيسية وalias قديم لنفس التنفيذ | `components/knowledge/hansa-landing.tsx` و`insight-stage.tsx`؛ route files للـ metadata |
| `/study/`, `/study/<subject>/`, `/<topic>/` | المجالات والموضوعات | taxonomy وserver وtopic-review وcomponents/study |
| `/study/<subject>/path/` | ترتيب تعلم مقترح وروابط أنشطة | learning-path وpath-units؛ ترتيب وليس قفل إتقان |
| `/learn/catalogue/`, `/practice/catalogue/` | بوابتا الكتالوج | StudyDirectory مع intent للممارسة؛ الأولى canonical إلى `/study/` عمدًا |
| `/learn/`, `/learn/<slug>/`, `/learn/ar/<slug>/`, `/learn/chapter/<number>/` | مسار التصوير البياني | data-viz curriculum/content والـ lesson renderer |
| `/explore/…` | مختبرات الرسوم والاختيار والنزاهة | components/data-viz وlib/data-viz |
| `/learn/statistics/…` | المرجع والرحلات والصيغ والمختبرات | lib/statistics وcomponents/statistics |
| `/learn/sql/00/`–`17/`, `/learn/sql/reference/<id>/` | SQL الأساسي والمراجع | content/sql وlib/sql وcomponents/sql |
| `/practice/sql/` | أسئلة المصدر المفتوحة غير المصححة | SQL drills؛ منفصلة عن امتحان `/lab/sql/` |
| `/lab/<slug>/` | امتحانات البنك العام | lib/exams وexam-player وlab-storage |
| `/lab/dp-600/…` | البنك والتدريب والمراجعة والمحاكاة والنتائج | fabric data/engine/storage/components |
| `/learn/dp-600/ingestion/` | درس ومقارنة قرارات وتطبيق محلي | lib/academy/ingestion وpattern-comparison |
| `/learn/dp-600/atlas/`, `/journey/` | Explorer/Peek/Guided Journey | lib/atlas وcomponents/atlas |
| `/learn/fabric-rti/…` | طبقة تعليم RTI | lib/rti/lessons مع سجلات provenance |
| `/learn/academy/<track>/<lesson>/` | courseware | lib/academy/corpus وlesson-blocks |
| `/lab/hands-on/<slug>/` | صفحات skeleton للمعمل الخارجي | study/curated وcontent/study/experiments |
| `/study/review/`, `/study/review/path/`, `/learn/drafts/`, `/practice/drafts/` | مراجعة منفصلة | study/review وdrafts وintake؛ ليست صفحات خاصة بمصادقة |
| `/work/…`, `/experience/`, `/about/`, `/services/`, `/contact/` | هوية وأعمال وخدمات | case-studies وexperience وservices وsite |

معلمات ينبغي حفظ معناها: `insight`, `question`, `exam`, `view=legacy`, `pack`, `session`, `atlasReturn`, `learningContext`, `learningUnit`, `learningReview`, `mode=question`, `q`، إضافة إلى anchors الخاصة بالدروس والأرشيف والمسارات. لكل شاشة قد توجد معلمات أخرى؛ افحص مالكها قبل التعديل.

الـ alias القديم يعرض نفس الصفحة، ولا يعيد التوجيه. هو noindex، ويعتمد canonical `/`. تغيير هذا العقد يتطلب فحص query/hash والعودة بالمتصفح، لا مجرد استبدال Link.

## 8. الصفحة الرئيسية الحالية

مالك التنفيذ الواحد هو `hansa-landing.tsx` الذي يجلب الإصدارات وحالة الأطلس. `insight-stage.tsx` يملك الإصدار المختار وحالات الشرح والتجربة وأماكن البطاقات. الاختيار مبني على ID، لا رقم البطاقة أو موقعها.

التركيب الحالي v3: بوابة تاريخ Today ← فتح طاولة بطاقات في نفس البوابة ← مشهد الفكرة وأداتها المفاهيمية وشريط الإصدارات ← بوابة Learn ← بوابة التحضير للشهادات ← نبذة مختصرة وPeek للأطلس وروابط استمرار ← أرشيف نصي. CSS الحالي `observatory.css` و`stage-editorial.css`، مع scroll/reduced-motion helpers. نسخ spacetime السابقة محذوفة محليًا؛ وجود تقرير قديم عنها لا يعني استخدامها الآن.

`eligibleInsights(feed.items, true)` يسمح عمدًا بـ technical_review في عرض preview مع تنبيه. أما Atlas فهو projection مستقل. التعليق «لا يشغّل preview هنا» لا يمنع `getAtlas()` من قراءة متغير بيئة البناء؛ افصل بين preview الإصدارات وpreview الرسم.

تاريخ البوابة يتغير بعد hydration إلى تاريخ اليوم؛ تاريخ الإصدار يظل بيانات مستقلة. الدالة الحالية تستخدم UTC رغم أن تعليقها يصف تاريخ الزائر المحلي. هذا فرق سلوكي قرب منتصف الليل، ويحتاج قرارًا مقصودًا إذا عُدّل.

## 9. التقدّم والجلسات والتصحيح

| المفتاح | المسؤولية | العقد المحمي |
|---|---|---|
| `amir-theme`, `amir-accent` | اللون والثيم | shell script يطبق الاختيار قبل العرض؛ لا تخلط namespace جديدًا مع التقدّم |
| `amir-lab-v1` | نتائج الامتحانات العامة | best/attempts/lastAt؛ ليس نموذج جلسة Fabric |
| `amir-fabric-v1` | جلسات Fabric والأسئلة والإشارات والنتائج | version 1، ترتيب مستقر ومؤقت absolute deadline واستيراد/تصدير |
| `hansa-question-additions-v1` | إجابات الإضافات | مخطط منفصل؛ holds وقواعد مقارنة بإجابة المصدر |
| `hansa-dp600-r11-progress-v1` | R11 | version/revision محددان؛ لا تُرقِّ سؤالًا مصححًا دون r11Approved |
| `hansa-atlas-journey-v1` | مسار Atlas الموجّه | parseJourney يتحقق من شكل وتقييدات الحالة |
| `hansa-academy-ingestion-v1` | درس Ingestion | version/revision وإجابات TRANSFER وconfidence وjournal؛ parser لا يثق في completed flag محفوظ |

توجد مفاتيح أخرى تخص درس Ingestion وتُفهرس في `storage-map.json`؛ الجدول ليس ترخيصًا لإعادة تسمية أي مفتاح غير مذكور. كل تقدم محلي للمتصفح/الأصل، ولا يوجد مزامنة سحابية أو حساب مستخدم.

محرك Fabric نقي: ترشيح ← اختيار seeded ← manifest يحفظ question IDs وترتيب الخيارات ← تحميل الحزم المطلوبة ← grade/gradeSession ← حفظ. الإجابة المتعددة exact-match، والسلسلة تُقارن بالترتيب. المؤقت مشتق من deadline مطلق، لا من عداد يعاد من الصفر عند reload. تحقق من هذه العقود عند أي إعادة تصميم للمشغّل.

`storage.ts` يحتفظ حتى 3 جلسات active و30 completed و60 عنصر history؛ هذه سياسة retention فعلية، فلا تعد المستخدم بتاريخ غير محدود. يحاول حفظ نسخة احتياطية عند فساد الشكل/القراءة أو reset، ويتعامل مع منع التخزين. الاستيراد يدمج حسب IDs ويستخدم max لإحصاءات السؤال، ولا يساوي جمع جميع المحاولات من جهازين. الاختبارات البنيوية ليست شهادة لكل قيم JSON المحتملة أو كل سباق كتابة بين تبويبين.

R11 لا يصحح إلا `gradingEnabled === true` مع `scientificStatus === APPROVED_CORRECTED`. manifest الحالي يسجل 59 blocker علميًا أصليًا متبقيًا و152 مرشح اعتماد سابق لم يُعاد التحقق منه. لا تعتبر نجاح build تغييرًا لهذه الحالة.

## 10. المصادر والتمثيل وحقوق النشر

جرت معالجة بنيوية recursive لـ **50 HTML**: 25 للتصوير البياني، و1 للإحصاء، و24 في `D:/BeUI/storytelling`. سجل المصدر يحفظ البصمات وأعداد الجداول والصور وكتل الكود والعناوين والروابط. هذا استخراج شامل لتلك المجموعة المحددة، لا مراجعة علمية يدوية لكل جملة.

SQL له سجل حفظ أقدم يحدد 85 entry و76 Notion ID و53 صفحة عرض. فُحص سجل الحفظ والطبقة المستوردة واختباراتها؛ لم يُعد الاستيراد أثناء هذه المهمة حتى لا يعاد توليد المحتوى أو تحديث الأصل ضمنيًا. أصل السجل: `docs/sql-integration-20261028/SOURCE_COVERAGE.json`.

توجد حزم خارجية أخرى في جذر D:/BeUI، منها حزم Fabric وR18 وPL300 وRTI وcorpus. جرى التعامل معها بوصفها مصادر أو packages منفصلة حسب مواضع الدمج الفعلية؛ لم تُفتح وتُعتمد كل ملفات أرشيفاتها أو قواعدها الخاصة في هذه الجولة. نتائج تشغيل Fabric/Spark/Power BI غير مستنتجة من نسخ خطوات المصدر.

التصوير البياني يعرض typed blocks escaped عبر React، ويصل الدرس بأصله أو body تحريري موسوم. الإحصاء يفصل الحساب في `math.ts` والبيانات/المعاني في `content.ts` والرسم في المكونات؛ التصحيح السابق للصيغ يجب أن يبقى traceable. SQL يعرض code/tables والنص باتجاه مناسب، ويحتفظ بفقرة qualifications مثل خطأ إطار النافذة وإصلاحه، ولا يقدم grainTrace على أنه SQL interpreter.

المراجع المنتقاة LINK_ONLY. الـ Academy يحمل attribution وترخيص MIT في طبقة المصدر، والصور روابط إلى المصدر. مساحة drafts تتضمن مصادر موسومة NO LICENSE أو حالات غير نهائية؛ كونها review only لا يجعلها private ولا يزيل الحاجة لقرار حقوق نشر قبل التوسيع. مفاتيح إجابات المسودات مستبعدة من projection بحسب الاختبارات الحالية؛ لا تساوِ ذلك باعتماد نشر نصوص كل مصدر.

## 11. التصميم والمكونات وإتاحة الاستخدام

رموز الثيم والألوان والدلالات والتباين في `app/globals.css`؛ تغيير muted/primary أو focus ring هنا ينعكس على الكثير من الصفحات. إعداد scanner يقتصر على runtime templates/content حتى لا تصبح نسخ rollback مصدر CSS إضافيًا. الرسوم لها palette مستقل عن brand accents لتجنب تغيير معنى السلاسل مع الثيم.

المكونات المشتركة الأعلى ارتباطًا، بحسب الاستيراد النصي: `lib/utils.ts`، `components/ui.tsx`، `lib/ease.ts`، `lib/statistics/math.ts`، `components/data-viz/lab-ui.tsx`، `lib/study/taxonomy.ts`، `components/statistics/chart-kit.tsx`، و`components/fabric/ui.tsx`. خريطة الاستيراد تشمل type imports ولا تمثل قياس حجم bundle أو دليل أن كل import يعمل عند runtime.

لا توجد Recharts/ECharts/D3/Visx/Mafs معلنة في package.json الحالي. الرسوم تعتمد على مكونات محلية/SVG ومكونات beUI الموردة. هذا وصف لما هو مثبت، وليس حظرًا مستقبليًا على مكتبة أخرى. إعادة الاستخدام هي نقطة البداية؛ الاختيار الجديد يتطلب معنى وهدفًا ومقارنة ومرجعًا وترخيصًا وتحققًا حسب السياسة.

`components/statistics/visual-registry.tsx` يستورد المختبرات والمعروضات مباشرة. لا تفترض أن وجود registry يعني lazy loading؛ أي تحسين تحميل يحتاج قياس bundle ومسارات مستخدمة. بعض المكونات الموردة مستثناة من ESLint (`charts`, `motion`, `agents`) مع استمرار typecheck؛ لذا صفر lint errors لا يعني أن كل ملف vendor اجتاز قواعد lint.

دعم العربية موزع على blocks وlang/dir، وليس تبديلًا شاملًا للمنتج إلى RTL. root lang إنجليزي، وبعض المحتوى ثنائي اللغة؛ افحص code/formulas/tooltips والجداول عند تعديل صفحة عربية. عناصر skip-to-main وaria-live وتقليل الحركة موجودة، لكن فحص الشاشة الآلي لا يثبت سلامة كل مسار بلوحة المفاتيح أو قارئ الشاشة.

## 12. الاستضافة والخدمات والتكلفة

الإعداد المحلي assets-only. contact endpoint اختياري من `NEXT_PUBLIC_CONTACT_ENDPOINT`؛ إن غاب، النموذج يركب رسالة mailto، وإن ضبط قد يرسل اسمًا وإيميلًا ورسالة إلى الجهة المحددة. لم يُرسل النموذج أو أي رسالة في هذه المراجعة. لم تُقرأ أسرار أو متغيرات حساب سريّة.

متغيرات مهمة: `NEXT_PUBLIC_SITE_URL` و`NEXT_PUBLIC_BASE_PATH` و`NEXT_PUBLIC_CONTACT_ENDPOINT` تدخل في البناء/المتصفح. `HANSA_ATLAS_REVIEW_PREVIEW=1` يغير projection أثناء البناء؛ بيئة هذه المراجعة لم تضبطه. لا تستخدم build preview للرسم كإصدار عام دون فحص payload.

يوجد **workflowان** يعملان على push إلى main وworkflow_dispatch: GitHub Pages وCloudflare. كلاهما يجري install/lint/build ثم deploy، ولا يستدعي `test:all` أو اختبارات Academy أو فحوص الحفظ في الخطوات الحالية. الإعداد موجود محليًا؛ حالة تمكين workflows وأسرار المستودع وحماية الفرع لم تُراجع عبر الخدمة.

لا تعني «push main» مجرد حفظ كود؛ إذا كانت هذه الإعدادات مفعلة فقد يؤدي إلى نشر في الوجهتين. لم تحدث push/commit/deploy هنا. لم تُضف مكتبات أو خدمات أو تكلفة تشغيل. تسعير الحساب وفاتورته وخطته الحالية **NOT RUN**؛ تعليقات Free في الإعداد ليست فحصًا محاسبيًا.

## 13. نتائج التحقق الفعلية

| الفحص | النتيجة | الدليل/الحد |
|---|---|---|
| البناء + TypeScript + postbuild | PASS | `checks/build.log`؛ نجاح التصدير لا يثبت نسخة production |
| data-viz | PASS: 62/62 | حساب ومحتوى واختيار وممارسة |
| statistics | PASS: 18/18 | وحدات حسابية؛ ليست مراجعة علمية كاملة |
| fabric | PASS: 35/35 | بنك ومحرك وR11 حسب الاختبارات المتاحة |
| content | PASS: 51/51 | مصدر وبحث وSQL وحفظ shape ومراجع |
| knowledge | PASS: 33/33 | هوم وinsights وعقود التركيب |
| atlas | PASS: 25/25 | projection وروابط وتخطيط وحدود نموذج |
| مجموع suites الأساسية | PASS: 224/224 | نفس مجموع أنماط ملفات test:all؛ شُغلت كل مجموعة منفصلة كي لا يخفي فشل مجموعة باقي النتائج |
| Academy الإضافية | FAIL: 10 PASS /1 FAIL | اختبار preservation فشل في سلسلة receipt؛ منطق الدرس/المقارنة نجح |
| lint | PASS مع 14 warning | صفر error؛ warnings مرفقة، لم تُصلح ضمن مهمة تحليل |
| site metrics | PASS | إعادة حساب القيم من طبقاتها |
| agent-reference / knowledge-atlas / easyui integrity | FAIL ×3 | أول توقف مشترك عند بصمة `lib/atlas/field.ts`؛ لا يعني فحص بقية السلسلة ونجاحها |
| فهرسة HTML والروابط | منفذة | 367 route؛ كسر رابط واحد، و14 مرشح anchor خضعوا لفحص إضافي |
| متصفح Edge آلي | PASS في 24 حالة | 12 route × سطح مكتب1280 light وموبايل390 dark، reduced motion، بدون pageerror/HTTP failure/overflow في العينة |
| axe الآلي | صفر violations في العينة | قواعد A/AA المحددة؛ ليس كل الصفحات أو كل WCAG checks |
| anchors بعد hydration | 12 PASS /2 FAIL | ملاحظات Fabric موجودة بعد hydration؛ alpha/lambda مفقودان |
| تفاعل إغلاق طاولة الهوم بـ Escape | FAIL | الواجهة تغلق، لكن focus لا يعود للزر كما يقصد الكود |
| الثيم بعد reload | PASS | amir-theme محفوظ وdark مستعاد في السياق التجريبي |
| hash عميق في مسار Fabric | PASS | إظهار خطوة بعد أول12؛ استعادة `note-warehouse-ingest` |
| no-JS للهوم | منفذ | نص الأرشيف محفوظ ولقطة مرفقة؛ لا ادعاء أن كل تفاعل يعمل بلا JS |
| production / أجهزة فعلية / screen reader / field CWV | NOT RUN | لم يستدع نطاق التحليل المحلي نشرًا أو حسابات خدمة |
| Native Fabric/SQL/DAX/Spark execution شامل | NOT RUN | صفحات المصدر والمحاكاة المحلية ليست دليله |

فحوص الوحدات كلها بما فيها Academy: **235 اختبارًا، 234 ناجحًا و1 فاشلًا**. نجاح 224 الأساسية منفصل عن فشل Academy، وكلاهما منفصل عن فشل فاحصات البصمات الثلاثة.

## 14. النتائج والمخاطر المادية

### CTX-01 — سلسلة الحفظ توقفت عند تعديلات محلية لاحقة

**الأولوية: مرتفعة لعملية التغيير.** `scripts/hansa-integration-receipt.mjs` يسجل الملفات observeOnly ويطلب مطابقة البصمة الحالية. `lib/atlas/field.ts` كان معدّلًا عند البداية، وبصمته الحالية تختلف عن السجل. ذلك يعطل ثلاثة فاحصات مرجعية واختبار حفظ Academy قبل استكمال فحص بقية العقود. لم نغيّر أي hash أو snapshot ليصبح الفحص أخضر. يجب فهم من يملك التعديلات، ومراجعة فرقها، وإضافة successor موثق؛ لا تعديل baseline قديم بلا نسب واضح.

### CTX-02 — رجوع focus في طاولة بطاقات Today لا يتحقق

**الأولوية: متوسطة.** `stage-today.tsx` يزيل CTA من DOM عند فتح الطاولة. عند الإغلاق، ينفذ `setOpen(false)` ثم `ctaRef.current?.focus()` قبل إعادة تركيب الزر. المتصفح أكد أن الإغلاق يحدث لكن التركيز لا يرجع إليه. ينطبق النمط على Escape وزر الإغلاق. الحل اللاحق يحتاج إرجاع focus بعد commit، مع اختبار keyboard واقعي؛ لم يُنفّذ الإصلاح هنا.

### CTX-03 — رابط DAX في Academy يذهب إلى مسار محلي غير موجود

**الأولوية: متوسطة.** من `/learn/academy/power-bi/labs-06-use-dax-time-intelligence/` توجد وجهة `/dax/time-intelligence-functions-dax/?azure-portal=true`، وهي غير موجودة في التصدير. أصل الرابط النسبي يحتاج resolved base للمصدر، لا افتراض أنه route داخل Hansa. افحص بقية relative links بالـ importer عند الإصلاح، مع حفظ النص والـ source provenance.

### CTX-04 — رابطا alpha وlambda لا يصلان للمصطلح

**الأولوية: متوسطة.** `/study/statistics/hypothesis/` يربط إلى glossary `#alpha-`، وdistributions إلى `#lambda-`. كلا الـ ID غير موجود بعد hydration. `lib/statistics/content.ts` يولد الرابط باستبدال الرموز بشرطة، بينما `components/statistics/glossary-search.tsx` يزيل أيضًا الشرطة الطرفية عند توليد ID. لذلك الوجهتان الفعليتان هما alpha وlambda دون الشرطة. وثّق helper واحدًا للحالتين ثم اختبر الروابط القديمة قبل استبدالها.

### CTX-05 — بعض الأرقام المعروضة أقدم من البيانات

**الأولوية: متوسطة.** `lib/site.ts` في التذييل يعرض 60 عامًا و834 Fabric؛ `components/fabric/unified-bank.tsx` يكرر 834، بينما actual results عند exam=all تعرض1796 سجلًا. `SITE_METRICS` الحالي نفسه صحيح وفاحصه ناجح، لكنه لا يغطي كل النصوص اليدوية. أولوية لاحقة: ربط نصوص العدادات بالمصدر الحالي دون تغيير IDs أو counts الأصلية. لا تفسر `packageQa.declaredCounts` التاريخي834 على أنه مقدار البنك الحالي.

### CTX-06 — IDs مكررة في صفحات إحصاء مركبة

**الأولوية: متوسطة؛ تأثير محدد يحتاج اختبارًا.** في HTML رحلة hypothesis تكرر SVG pattern `alpha-hatch`، وفي sampling تكرر `num-seed` و`num-seed-hint`. لأن عدة نسخ من نفس المعمل تلتقي في صفحة واحدة، ينبغي توليد IDs مرتبطة بنسخة المكون. فحص axe الموجه لم يسجل violation في هاتين الصفحتين؛ لا نحول ذلك إلى نفي للتكرار أو إثبات لعطل بصري لم نره.

### CTX-07 — حجم HTML كبير في صفحات الكتالوج والملاحظات

**الأولوية: متوسطة؛ الأداء الفعلي غير مقاس.** ملفات HTML غير مضغوطة: review حوالي2.03MB، resources حوالي1.27MB، Fabric path حوالي1.06MB، search حوالي570KB. إظهار12 أو30 سجلًا بصريًا لا يعني إرسال12 أو30 سجلًا فقط؛ props الكاملة قد تدخل في export. هذه أحجام bytes على القرص، وليست network transfer بعد الضغط أو LCP/INP. ابدأ بقياس payload/parse/interaction ثم قرر التقسيم أو lazy boundaries مع الحفاظ على البحث والـ deep links وno-JS حيث مطلوب.

### CTX-08 — اختبارات مهمة ليست بوابة النشر الحالية

**الأولوية: متوسطة.** `test:all` لا يشمل Academy، والـ CI لا يشغّل حتى المجموع الأساسي أو فاحصات الحفظ. لا تغير آلية النشر ضمن تحليل السياق، لكن أي عمل لاحق لتحسين release gate يجب أن يحدد أنواع الفحوص ويوثق لماذا تتوقف ولماذا يسمح تجاوزها إن وُجد.

### CTX-09 — حدود علمية وحقوقية يجب أن تبقى صريحة

**قيد تصميم حالي.** Atlas العام فارغ، R11 holds باقية، وreview routes يمكن زيارتها دون حساب. labeling ليس ACL. لا ترفع draft/technical_review إلى published، ولا تصف كل الأسئلة بأنها مصدقة علميًا بناءً على اختبار بنيوي. نص StageCertGate الحالي يقول reviewed questions؛ افحص ما تقصده كل حزمة بتلك المراجعة قبل تقوية الوعد أو تكراره في أجزاء أخرى.

### CTX-10 — renderer Academy يحتاج تقوية قبل قبول مصادر أوسع

**ملاحظة صيانة أمنية، لا دليل استغلال حالي.** `lesson-blocks.tsx` يحوّل inline markdown إلى HTML بعد escaping لـ & و< و>، ثم يبني href بواسطة regex دون سياسة URL واضحة أو escaping لعلامة الاقتباس داخل attribute. المحتوى الحالي مصدر محلي courseware وليس input مباشرًا من زائر، ولم نجد javascript/data href في HTML المصدّر أثناء الفحص. قبل توسيع المدخلات استخدم typed rendering أو تحقق URL/attribute موحدًا؛ لم يحدث اختبار اختراق شامل.

الـ canonical المختلف لـ `/learn/catalogue/` **ليس عيبًا مؤكدًا**: الملف يعلن `/study/` عمدًا، والمكون ذاته يعرض المكتبة. كذلك 12 anchor لملاحظات Fabric غابت من HTML الأولي لكنها ظهرت بعد hydration، فليست روابط مكسورة مثبتة. فصل الحالات المؤكدة عن إنذارات الفهرسة جزء من هذا التقرير.

## 15. خريطة «عايز أغيّر إيه؟»

| نوع التغيير | ابدأ من | التبعيات التي لا تنساها | أقل تحقق مناسب |
|---|---|---|---|
| شكل/نص الهوم | knowledge/hansa-landing، insight-stage، stage-*، CSS | eligibleInsights، URL، alias، source notice، الثيم | knowledge tests + بناء + تفاعل البطاقات/rail/Back/Escape + mobile/no-JS |
| القوائم والهوية | lib/site، header/footer، layout | canonical والبحث والصفحات المهنية | روابط ومسارات وعناوين وkeyboard/mobile |
| مجال أو موضوع | study/taxonomy وtopic-review | server/classification/curated/search/sitemap | صلاحية كل placement وIDs وdeep links وبناء |
| ترتيب درس وربطه بتدريب | learning-path وevidence | مصدر كل association وreturn context وSQL/stat prerequisite maps | دورة المتطلبات وروابط questions وhash بعد pagination |
| نص درس Visualization | content/data-viz، importer عند تغيير المصدر | الأصل وcoverage واللغة والمعادلات والروابط | source parity + tests data-viz + route/theme/RTL |
| معمل/صيغة إحصاء | statistics/math ثم renderer المعني | seed/input/units/assumptions وformula provenance | اختبار أرقام مستقل وedge cases وreset/accessibility |
| درس SQL | intake ثم importer وcontent/sql وqualifications | وحدة مالكة واحدة، drills، legacy IDs، مصدر الشكل | SQL content tests وروابط ونتيجة fixture مستقلة بلا ادعاء execution |
| أسئلة Fabric الحالية | pack JSON/authoring pipeline وloaders/meta | source/ID map/taxonomy/notes/cases والتقدّم | bank/scoring tests وcounts وحفظ IDs/keys وتجربة جلسة |
| تصحيح R11 | R11 source ledger وmanifest وmodel | original/approved/held وrevision-progress | negative grading gates وround-trip وعدم مضاعفة222 |
| اعتماد مسودة | content/drafts/intake وبوابات الاعتماد | حقوق المصدر والمفاتيح والدليل العلمي والنشر | قرار اعتماد مستقل؛ لا تكفي إعادة تسمية status |
| Academy/hands-on | corpus وcurated وrenderers وbuild scripts | attribution وrelative URLs وimages/license/source commit | content/academy tests + روابط + no-native-execution labels |
| علاقات الأطلس | atlas editorial/model/server | canonical concepts/evidence/human publication والتفريق عن TOC | Atlas tests وpublic payload gate وURL/reduced-motion |
| persistence أو المؤقت | fabric/storage/engine/runner أو lab-storage | schema versions وIDs ومفاتيح موجودة وimport/export | resume/reload/deadline/corrupt/blocked storage/idempotent import |
| الألوان والحركة | globals، ease، cinematic helpers، scoped CSS | كل الثيمات والـ charts والـ contrast وreduced-motion | قياس تباين وkeyboard وRTL والموبايل قبل/بعد |
| الاستضافة أو النطاق | next.config، wrangler، workflows، site URL | out aliases/headers/canonical/old-origin progress | طلب مستقل للنشر، build وعينات host وروابط وrollback |

لا تشغّل importer لمجرد تحديث وصف أو زر؛ بعض importers يعيد بناء outputs كثيرة. حدد الملف المولد والمصدر المالك أولًا، وافحص help/source للسكربت. لا تعدّل output ثم تتوقع بقاءه بعد الاستيراد التالي.

## 16. خطة العمل الآمنة للتعديلات اللاحقة

1. احفظ status وبصمات الملفات المستهدفة وافحص أي تعديل محلي من عمل آخر. هذه اللقطة ليست حجزًا للملفات أو تصريحًا بالكتابة عليها مستقبلًا.
2. صغ السلوك المطلوب بوضوح: فعل المستخدم ← النتيجة ← شروط المصدر والـ state التي يجب حفظها.
3. افتح المالك من الخريطة ثم من يستورده ومن يولده والاختبارات المرتبطة؛ افصل changes التعليمية عن changes التجميلية.
4. عند عمل مرئي، طبق موجز الصفحة والهدف العلمي والسياسة والمهارة المحلية، وقارن الحل المحلي/الأبسط مع البديل قبل إضافة حزمة.
5. نفّذ نطاقًا صغيرًا قابلًا للمراجعة، واحفظ IDs وqueries وanchors ومفاتيح التخزين. أي migration تحتاج سيناريو استعادة فعليًا.
6. شغّل الفحص المناسب للتغيير ثم البناء إذا تغير التنفيذ. لا تعتبر نتيجة واحدة PASS عامًا. ثبّت الأدلة والقيود عند تاريخها.
7. راجع diff، ثم أضف successor موثقًا إذا كان التغيير يخضع للبصمات. لا تسوِّ receipts تلقائيًا مع أي bytes تظهر على القرص.
8. النشر خطوة منفصلة بتفويض صريح. تجنب push إلى main قبل فهم workflow المفعّل.

**المهمة الذرية التالية المقترحة:** مراجعة فرق `lib/atlas/field.ts` المحلي مع مالك تحديث الهوم، وتحديد طبقة successor التي تسجله مع ملفات v3، ثم إعادة فاحصات المراجع وAcademy. إذا كان المطلوب تعديلًا مرئيًا عاجلًا، ابدأ بتذكرة focus صغيرة بدل فتح إعادة تنظيم شاملة. هذه توصيات ترتيب، وليست تنفيذًا أو تفويضًا لتغيير الحالة العلمية.

## 17. التغطية وما لم نُثبته

- **مغطى بالحصر والبصمة:** كل الملفات غير المستثناة في لقطة `file-inventory.json`، و551 ملفًا في code-map، و124 JSON في content schema، وكل367 مخرج route HTML، وكل50 HTML في source-html-coverage المحدد.
- **مغطى بالقراءة التفصيلية:** تعليمات وسياسات البداية، إعدادات الإطار والاستضافة وCI، layout/identity/navigation، الهوم الحالي وstate/model، دراسة taxonomy/server/path/review/evidence، search، loader/engine/storage/R11/additions، المحتوى وrenderers للتصوير البياني والإحصاء وSQL وAcademy وRTI، خرائط المصدر وسلاسل receipts، وملفات الاختبارات والفحوص ذات الصلة.
- **مغطى جزئيًا:** بقية المكونات والـ scripts باستخراج imports/exports/line counts ونقاط مراجعة HTML/network/storage، وقراءة الأجزاء ذات الصلة بالنتائج؛ لم يقرأ إنسان بديل كل سطر من كل551 ملفًا معنىً بمعنىً.
- **غير مثبت:** الحقيقة الحالية لكل ادعاء Microsoft، دقة كل إجابة، اكتمال كل مصدر خارجي، توافق كل جهاز، سلامة كل journey بالكيبورد، صلاحية كل رابط خارجي حي، current cloud billing/deployment، private intake contents، penetration/security certification، أو field performance.
- النتيجة تصلح كخريطة سياق ونقطة انطلاق هندسية ومصدر لتذاكر محددة. كل تعديل مستقبلي يحتاج إعادة فحص affected sources، لأن snapshot بتاريخ30 أكتوبر2026 قابل للتقادم.

## 18. الأدلة والملحق القابل للبحث

افتح [التقرير التفاعلي المحلي](report.html) للبحث في المسارات وملفات التنفيذ ومخططات JSON والنتائج. هو ملف محلي بلا CDN أو analytics أو اتصال خارجي تلقائي. يتضمن جداول المالك والمسارات والملفات، وروابط للبيانات والأدلة داخل هذا المجلد.

- `evidence/file-inventory.json`: paths/bytes/SHA256 قبل إضافة هذا التقرير.
- `evidence/code-map.json`, `import-graph.json`: imports/exports/client boundaries؛ خريطة نصية وليست تحليل bundler.
- `evidence/runtime-inventory.json`, `study-records.json`, `learning-units.json`, `search-documents.json`: الحساب من الوحدات الفعلية.
- `evidence/route-patterns.json`, `exported-routes.json`: فرق ملفات routes عن concrete URLs.
- `evidence/content-schema-inventory.json`, `source-html-coverage.json`: schema وأصول المصدر وحدود المعالجة.
- `evidence/storage-map.json`, `external-and-html-review-points.json`: مواقع state وnetwork وHTML للمراجعة؛ ليست نتائج تدقيق أمني بذاتها.
- `evidence/browser-and-routes.json`, `focused-browser.json`, `screenshots/`: نتائج المتصفح والملاحظات المؤكدة والمرشحة.
- `checks/`: أوامر الفحوص والـ exit codes والسجلات الكاملة.
- `evidence/git-status-before.txt` و`preservation-after.json`: فصل تعديلات البداية عن هذه المهمة.

## 19. التغييرات والتراجع

إضافات هذه المهمة فقط: مجلد `docs/project-context-20261030/` وهذا المرجع وHTML ونسخ الأدلة، ومجلد أدوات/مخرجات تحليل مستقل `D:/BeUI/project-analysis-20261030/`. لم نُعدّل إعدادات أو محتوى أو كود runtime. البناء أعاد توليد الملفات المشتقة غير المصدرية. لا توجد dependency أو خدمة جديدة.

لإزالة حزمة التحليل مستقبلًا، راجع قائمة ملفاتها ثم أزل مجلديها المحددين فقط. لا تستخدم reset/clean لاسترجاع baseline، لأنهما قد يمسان تعديلات الهوم والأطلس الموجودة قبل المهمة. لا يلزم rollback تطبيقي لهذا التحليل.
