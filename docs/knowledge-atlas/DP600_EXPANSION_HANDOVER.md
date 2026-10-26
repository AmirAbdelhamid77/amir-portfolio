# DP-600 expansion — active handover, 26 October 2026

Owner: integrate four new question sources FIRST, then broaden Atlas to DP-600 topics with documented semantic relations and separate lesson/question associations. Preserve every existing change and saved session. No deployment. The owner confirmed the four exact D:/BeUI filenames and explicitly requested missing images be marked for later, not reconstructed.

## Current working state (in progress, not completion evidence)
- Starting git status was dirty. HEAD and 1,299 source file hashes captured in the projectless workspace `work/dp600-expansion/START_BASELINE.json`; exact starting bytes in `BEFORE.zip`. No reset/stash/staging/commit.
- New reproducible importer: `scripts/import-dp600-additions.py`. It copied originals, with hashes, to `intake/dp600-additions-2026-10-26/` and imported 532 source records (452 DP-600, 80 adjacent PL-300). Study Hub's internal categories are provenance only, not learner categories.
- `content/fabric/additions/manifest.json` records 101 matching-stem groups. They are NOT proven duplicates: source answers differ (e.g. QuickVisualize summary statement). All source assertions retained. Hub extra source repeats n=43; row suffix prevents collision.
- 98 JSON questions reference absent exhibits. Owner says mark for later. Preserve text/explanations, label `Images required later`, disable scoring. Two Litware images were supplied and retained exactly.
- New `lib/fabric/additions.ts`, `components/fabric/unified-bank.tsx`; existing explore route now uses unified catalogue. Advanced original explorer remains available through `?view=legacy`. Existing timed sessions remain on original validated bank; don't claim imports joined mock exams. New saved state uses `hansa-question-additions-v1`, bounded parser, corrupt/denied storage preservation; legacy keys untouched.
- Typecheck passed after initial UI additions. Full verification/build/browser still required at this checkpoint.

## Continue in this order
1. Finish/check unified question UI, counts, missing image flags, controlled input grading, saved-state reload and corrupt/denied storage; retain raw author material and official links. Don't adjudicate disputed answers silently.
2. Add sourced concepts/semantic edges across DP-600 domains in `content/atlas/editorial.json`, human approval pending and preview only. Existing public projection fail-closed remains binding.
3. Expand resource URL allowlist safely for real existing lesson anchors and exact question deep links. Preserve query strings when adding `atlasReturn`. Associations are catalog metadata, NEVER semantic edges. Explicit mappings must cite exact question text/context and primary-doc locators, rather than treating a regex hit as review.
4. Preserve historical manifests. Introduce an exact bound successor receipt for this task so prior guards resolve explicit before/after changes; do not refresh original baselines or weaken assertions. Starting Atlas implementation receipt verifies all its owned files; it will report drift until successor is sealed. Add independent new preservation/mapping tests.
5. Run lint, unit suites (baseline147), preservation/reference/Atlas/EasyUI guards, build review then normal export, browser mobile/dark/keyboard/no-JS/storage regression. Update actual status and limitations below. Open http://localhost:4191/learn/dp-600/atlas/ on SAME origin. Existing local review server serves `build/atlas-preview/out`.

## Prior implementation references
`implementation/REPORT.md`, `implementation/VALIDATION.md`, `implementation/INTEGRATION_MANIFEST.json`; Atlas model + explorer + Peek/Journey. Prior 147 tests and screenshots are historical, not evidence for the new task. Current usage at checkpoint: 88% of five-hour window consumed; user explicitly asks for this handover before limit exhaustion.

## Latest verified results
Pending final task checks. Do not present this checkpoint as finished integration.


## Final checkpoint (local implementation verified, coverage incomplete)
# توسيع DP-600 — تسليم قابل للاستكمال، 26 أكتوبر 2026

تم استيراد الملفات الأربع التي أكدها المستخدم: 532 سجل سؤال جديد، منها 452 DP-600 و80 PL-300. البنك الموحد يتيح البحث في 1,366 سجلًا إجمالًا؛ افتراضيًا يعرض 1,286 سجل DP-600. هذه أعداد سجلات مصادر وليست أسئلة فريدة مثبتة. توجد 101 مجموعة نصوص متشابهة؛ احتفظنا بكل رواياتها وإجاباتها المختلفة. لا توجد تصنيفات dump/quiz/extra في واجهة المتعلم. النسخ الأصلية وبصماتها محفوظة.

98 سؤالًا تشير إلى صور غير مرفقة؛ بناءً على طلب المستخدم تحمل علامة «Images required later» ويُوقَف تصحيحها، مع إتاحة النص والشرح. صور Litware الأصلية محفوظة. الاختيارات والقوائم ومناطق الإجابة متاحة؛ القوائم بديل للسحب باللمس ولوحة المفاتيح. إجابات المصادر ليست اعتمادًا علميًا مستقلًا، ولا تُحسم الخلافات تلقائيًا.

المجموعات الجديدة متاحة للتدريب غير المؤقت داخل البنك الموحد. الاختبارات المؤقتة القديمة تستخدم بنكها السابق؛ لم يُدّعَ إدماج الأنواع الجديدة في محرك الامتحان. فلاتر البنك القديم وسجلّه متاحان عبر رابط Advanced filters. حفظ المجموعات الجديدة مستقل عن مفاتيح التقدم السابقة، وبيانات التخزين غير المقروءة لا تُستبدل.

الأطلس الآن 28 مفهومًا و31 علاقة موثقة من Microsoft Learn، مع 12 ربطًا بأسئلة بعينها و11 ربطًا بملاحظات تعلم موجودة. علاقات المفاهيم لها شروط وتفسير ومصادر. روابط الأسئلة والدروس بيانات فهرسة منفصلة وليست خطوطًا دلالية. عولجت روابط الرجوع حتى لا تضيع معرّفات الأسئلة أو حزم الملاحظات. المصدر الرسمي لنطاق الاختبار: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600 — نسخة الأهداف بتاريخ 19 أكتوبر 2026. تعريفات المصادر ومواضع الاستدلال داخل dp600-extension.json. هذا توسيع ممثل للمجالات الثلاثة، وليس تغطية تفصيلية لكل هدف.

## التحقق
- PASS: 129 اختبارًا من الأجنحة المعتادة +23 للأكاديمية والأطلس، بما فيها 5 اختبارات جديدة. ملفات الاختبارات القديمة لم تتغير.
- PASS: lint والبناء الثابت للمعاينة ثم إعادة البناء العادي. التصدير المعتاد يستبعد العلاقات التي تنتظر الاعتماد البشري.
- PASS: تجربة متصفح على 1440 فاتح و390 داكن، بحث البنك وعدده، حفظ الإجابات وإعادة التحميل وإعادة ضبط السؤال، الحفاظ على أربعة مفاتيح تقدم سابقة، علامات الصور، القوائم، روابط السؤال والملاحظات والرجوع للأطلس، وعدم التجاوز الأفقي.
- PASS: فحوص الحفظ التاريخي ومراجع الوكلاء وAtlas وEasyUI والتكامل السابق. سجلات الفحص مرفقة. فحص المتصفح كشف اعتماد البحث على حقل غير مولّد؛ أُصلح باشتقاق النص من العنوان والسؤال والموضوع ثم نجحت الإعادة.
- NOT RUN لهذه الدفعة: قارئ شاشة بشري، جهاز لمس فعلي، فحص axe جديد، إعادة كامل رحلة Journey، قياسات CWV، مراجعة علمية مستقلة لكل إجابة.

## ما تبقى للوكيل التالي
التغطية التفصيلية لجميع أهداف DP-600 ما زالت قيد العمل، خصوصًا علاقات SQL/KQL، Calculation groups، Dynamic formats، Composite models، Incremental refresh، XMLA والأمان المتقدم. الربط المراجع لكل سؤال لم يكتمل؛ لا تُولَّد علاقات من التزامن اللفظي. استكمال الصور الـ98 لاحقًا. اعتماد بشري قبل نشر العلاقات. توسعة الرحلات الموجهة إلى مسارات موضوعية متعددة لم تنفذ في هذه الدفعة؛ الرحلة الحالية محفوظة. الوصول إلى حد الاستخدام هو سبب تثبيت هذه النقطة؛ لم يتم إعلان اكتمال التغطية.

المعاينة: http://localhost:4191/learn/dp-600/atlas/?concept=concept%3Afabric%3Adirect-lake&incoming=1
البنك: http://localhost:4191/lab/dp-600/explore/
التسليم الفني: docs/knowledge-atlas/DP600_EXPANSION_HANDOVER.md
لم يحدث نشر، أو تغيير حزم/استضافة، أو تعديل محركات الحفظ القديمة. الاحتفاظ بالعمل السابق مثبت ببصمات قبل/بعد ونسخ رجوع. يمنع الرجوع فوق عمل أحدث دون مطابقة البصمة الحالية.
