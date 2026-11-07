# Daily Insight — editorial review

All entries below are excluded from publication pending review. Source pointers refer to local JSON; question-derived entries need independent review.

## hansa-bank-001 — ابدأ بمعنى الصف

sql / overview · draft

**الموقف:** قبل كتابة الاستعلام، كيف تحدد شكل النتيجة؟

**الخلاصة:** أكمل جملة: الصف الواحد في النتيجة يمثل ماذا؟ ثم راجع أثر الربط والتجميع على هذا المستوى.

**القيد:** تحديد الأعمدة وحده لا يحدد مستوى تفصيل الصف.

Source: `content/sql/vault.json#/pages/0`

Lesson route: `/learn/sql/00/`

## hansa-bank-002 — الربط قد يضاعف الإجمالي

sql / joins · draft

**الموقف:** زاد الإجمالي بعد إضافة JOIN؛ ما الذي تراجعه؟

**الخلاصة:** قد يضاعف الربط الصفوف، فيرتفع مجموع القيم دون زيادة حقيقية في البيانات الأصلية.

**القيد:** راجع تعدد المطابقات قبل اعتبار الزيادة نتيجة صحيحة.

Source: `content/sql/vault.json#/pages/0`

Lesson route: `/learn/sql/00/`

## hansa-bank-003 — COUNT لا يجيب دائمًا عن السؤال نفسه

sql / aggregation · draft

**الموقف:** هل COUNT(*) وCOUNT(column) يعدان الشيء نفسه؟

**الخلاصة:** COUNT(*) يعد الصفوف؛ COUNT(expression) يتجاهل التعبيرات التي نتيجتها NULL.

**القيد:** اختلاف العدد قد يعكس قيمًا مفقودة، وليس صفوفًا مفقودة.

Source: `content/sql/vault.json#/pages/0`

Lesson route: `/learn/sql/00/`

## hansa-bank-004 — الصفر يغير المتوسط

sql / aggregation · draft

**الموقف:** تستخدم CASE لحساب متوسط فئة محددة؛ ماذا يفعل ELSE 0؟

**الخلاصة:** إدخال صفر لصفوف خارج الفئة قد يغير المتوسط والمقام بدل استبعاد تلك الصفوف.

**القيد:** اختر الصفر أو الاستبعاد بحسب تعريف المؤشر، لا بحسب شكل الكود.

Source: `content/sql/vault.json#/pages/0`

Lesson route: `/learn/sql/00/`

## hansa-bank-005 — احتفظ بالتفاصيل عند الحاجة

sql / windows · draft

**الموقف:** تريد إجمالي المجموعة بجوار كل صف تفصيلي؛ ما نوع النتيجة المطلوب؟

**الخلاصة:** Window functions تسمح بإضافة قيمة تحليلية مع الاحتفاظ بصفوف التفاصيل.

**القيد:** GROUP BY ينتج صفًا لكل مجموعة؛ حدّد شكل النتيجة أولًا.

Source: `content/sql/vault.json#/pages/0`

Lesson route: `/learn/sql/00/`

## hansa-bank-006 — وجود المطابقة سؤال مستقل

sql / subqueries · draft

**الموقف:** تحتاج معرفة هل توجد صفوف مرتبطة، دون إضافة أعمدتها؛ بماذا تبدأ؟

**الخلاصة:** EXISTS مرشح عندما يكون المطلوب التحقق من وجود صفوف مرتبطة.

**القيد:** هذا اختيار بحسب معنى السؤال، وليس ضمانًا بأنه الأسرع في كل استعلام.

Source: `content/sql/vault.json#/pages/0`

Lesson route: `/learn/sql/00/`

## hansa-bank-007 — متوسط المتوسطات ليس المتوسط العام

sql / aggregation · draft

**الموقف:** قارنت متوسط الصفوف بمتوسط نتائج مجموعات؛ هل يلزم أن يتساويا؟

**الخلاصة:** متوسط البيانات الخام ليس بالضرورة متوسط المتوسطات المحسوبة للمجموعات.

**القيد:** راجع وزن كل مجموعة والمقام المستخدم.

Source: `content/sql/vault.json#/pages/0`

Lesson route: `/learn/sql/00/`

## hansa-bank-008 — راجع المقام قبل النسبة

sql / quality · draft

**الموقف:** نسبة تبدو صحيحة حسابيًا؛ ما السؤال الذي يسبق اعتمادها؟

**الخلاصة:** حدّد الصفوف الداخلة في الحساب والمستبعدة ومعنى المقام والقيم التي تصبح NULL.

**القيد:** صحة عملية القسمة لا تثبت صحة تعريف المجتمع المحسوب.

Source: `content/sql/vault.json#/pages/0`

Lesson route: `/learn/sql/00/`

## hansa-bank-009 — العينة ليست المجتمع

statistics / foundations · draft

**الموقف:** هل الرقم الذي حسبته يصف العينة أم المجتمع كله؟

**الخلاصة:** Statistic قيمة محسوبة من العينة؛ Parameter قيمة تصف المجتمع.

**القيد:** الانتقال من وصف العينة إلى استنتاج عن المجتمع يحتاج استدلالًا.

Source: `content/statistics/source.json#/sections/0`

Lesson route: `/learn/statistics/source/`

Find source section: 1. الصورة الكبيرة: ما هو Statistics؟

## hansa-bank-010 — نوع البيانات يسبق التحليل

statistics / foundations · draft

**الموقف:** هل اختيار الرسم أو الاختبار يبدأ من شكله؟

**الخلاصة:** نوع البيانات يؤثر في التحليلات والرسوم والاختبارات الملائمة لها.

**القيد:** ميّز القيم العددية ذات المعنى الحسابي عن الفئات والتصنيفات.

Source: `content/statistics/source.json#/sections/1`

Lesson route: `/learn/statistics/source/`

Find source section: 2. Data Types

## hansa-bank-011 — الوصف والاستدلال سؤالان مختلفان

statistics / foundations · draft

**الموقف:** تلخص بياناتك ثم تعمم على المجتمع؛ هل ما زلت تصف فقط؟

**الخلاصة:** الإحصاء الوصفي يلخص البيانات الموجودة؛ الاستدلالي يستنتج عن المجتمع من عينة.

**القيد:** لا تمنح الملخص الوصفي وحده قوة تعميم لم يختبرها.

Source: `content/statistics/source.json#/sections/2`

Lesson route: `/learn/statistics/source/`

Find source section: 3. Branches of Statistics

## hansa-bank-012 — القيمة المتطرفة تغيّر المتوسط

statistics / describe · draft

**الموقف:** توجد قيم متطرفة؛ هل يكفي المتوسط لتمثيل القيمة النموذجية؟

**الخلاصة:** المتوسط يتأثر بالقيم المتطرفة؛ الوسيط أكثر مقاومة لها.

**القيد:** هذا لا يجعل الوسيط أفضل تلقائيًا لكل سؤال.

Source: `content/statistics/source.json#/sections/3`

Lesson route: `/learn/statistics/source/`

Find source section: 4. Measures of Center — مقاييس النزعة المركزية

## hansa-bank-013 — المركز لا يصف الانتشار

statistics / describe · draft

**الموقف:** مجموعتان لهما مركز متقارب؛ ما الذي تضيفه مقاييس التشتت؟

**الخلاصة:** مقاييس التشتت تصف مدى انتشار القيم؛ IQR يصف انتشار النصف الأوسط من البيانات.

**القيد:** اختيار مقياس المركز لا يغني عن فحص التشتت.

Source: `content/statistics/source.json#/sections/4`

Lesson route: `/learn/statistics/source/`

Find source section: 5. Measures of Spread — مقاييس التشتت

## hansa-bank-014 — SD وSE يصفان شيئين مختلفين

statistics / sampling · draft

**الموقف:** هل تشتت القيم هو نفسه تشتت متوسط العينة عبر عينات متكررة؟

**الخلاصة:** SD يصف تشتت البيانات، بينما SE يصف تشتت إحصائية العينة عبر العينات المتكررة.

**القيد:** لا تستخدم أحدهما مكان الآخر لمجرد أن كليهما يقيس تشتتًا.

Source: `content/statistics/source.json#/sections/4`

Lesson route: `/learn/statistics/source/`

Find source section: 5. Measures of Spread — مقاييس التشتت

## hansa-bank-015 — الاستقلال ليس التنافي

statistics / probability · draft

**الموقف:** حدثان لا يقعان معًا؛ هل هذا هو تعريف الاستقلال؟

**الخلاصة:** التنافي يعني عدم إمكان وقوع الحدثين معًا؛ الاستقلال يعني أن معرفة أحدهما لا تغير احتمال الآخر.

**القيد:** هما مفهومان مختلفان، فلا تستبدل أحد التعريفين بالآخر.

Source: `content/statistics/source.json#/sections/5`

Lesson route: `/learn/statistics/source/`

Find source section: 6. Probability — الاحتمالات

## hansa-bank-016 — الاحتمال مساحة في التوزيع المستمر

statistics / distributions · draft

**الموقف:** كيف تقرأ احتمال وقوع قيمة بين حدين؟

**الخلاصة:** في التوزيع المستمر، احتمال الفترة هو المساحة تحت المنحنى بين حديها.

**القيد:** احتمال نقطة واحدة بالضبط يساوي صفرًا في التوزيع المستمر.

Source: `content/statistics/source.json#/sections/6`

Lesson route: `/learn/statistics/source/`

Find source section: 7. Probability Distributions

## hansa-bank-017 — Binomial له شروط

statistics / distributions · draft

**الموقف:** هل كل عدّ للنجاحات يناسب التوزيع الثنائي؟

**الخلاصة:** يتطلب النموذج عددًا ثابتًا من التجارب المستقلة، نتيجتين لكل تجربة، واحتمال نجاح ثابتًا.

**القيد:** تحقق من الشروط قبل اختيار النموذج.

Source: `content/statistics/source.json#/sections/7`

Lesson route: `/learn/statistics/source/`

Find source section: 8. Binomial Distribution

## hansa-bank-018 — العشوائية تساعد المقارنة

statistics / experiments · draft

**الموقف:** لماذا لا نوزع المشاركين على المجموعات حسب خصائصهم؟

**الخلاصة:** التوزيع العشوائي يساعد على جعل المجموعات قابلة للمقارنة وتقليل التحيز والعوامل المربكة.

**القيد:** المقصود توزيع المشاركين على المعالجة والضبط.

Source: `content/statistics/source.json#/sections/25`

Lesson route: `/learn/statistics/source/`

Find source section: 26. Randomization

## hansa-bank-019 — Pearson يقيس العلاقة الخطية

statistics / relationships · draft

**الموقف:** قيمة r قريبة من صفر؛ هل انتهى فحص العلاقة؟

**الخلاصة:** معامل Pearson يقيس قوة العلاقة الخطية واتجاهها.

**القيد:** ضعف العلاقة الخطية لا يستبعد علاقة غير خطية.

Source: `content/statistics/source.json#/sections/29`

Lesson route: `/learn/statistics/source/`

Find source section: 30. Correlation

## hansa-bank-020 — عدم الرفض ليس إثباتًا

statistics / hypothesis · draft

**الموقف:** لم ترفض فرضية العدم؛ ما الذي لا يصح أن تقوله؟

**الخلاصة:** Fail to Reject لا تعني إثبات صحة فرضية العدم.

**القيد:** لا تفسر p-value على أنها احتمال صحة فرضية العدم.

Source: `content/statistics/source.json#/sections/38`

Lesson route: `/learn/statistics/source/`

Find source section: 39. أهم الأخطاء التي يجب تجنبها

## hansa-bank-021 — الدلالة ليست الأهمية العملية

statistics / hypothesis · draft

**الموقف:** ظهرت نتيجة ذات دلالة إحصائية؛ هل هذا كاف لاتخاذ قرار؟

**الخلاصة:** الدلالة الإحصائية تختلف عن الأهمية العملية.

**القيد:** لا تجعل وصف النتيجة بالدلالة بديلًا عن تقييم فائدتها العملية.

Source: `content/statistics/source.json#/sections/38`

Lesson route: `/learn/statistics/source/`

Find source section: 39. أهم الأخطاء التي يجب تجنبها

## hansa-bank-022 — لا تجعل اللون يحمل المعنى وحده

visualization / accessibility · draft

**الموقف:** لو اختفى اختلاف الأحمر والأخضر، هل تظل الحالة مفهومة؟

**الخلاصة:** أضف تسمية أو شكلًا أو موضعًا مناسبًا حتى لا يعتمد المعنى على اللون وحده.

**القيد:** اختبار التدرج الرمادي جزء من المراجعة، وليس تدقيق إتاحة كاملًا.

Source: `content/data-viz/pages.json#/0`

Lesson route: `/learn/accessibility-color-qa/`

## hansa-bank-023 — منتصف لوحة الألوان له معنى

visualization / accessibility · draft

**الموقف:** تختار لوحة Diverging؛ ماذا يمثل المنتصف؟

**الخلاصة:** اللوحة المتباعدة تناسب قيمًا حول منتصف ذي معنى تحليلي.

**القيد:** وجود لونين جميلين لا يكفي لتبرير الاختيار.

Source: `content/data-viz/pages.json#/0`

Lesson route: `/learn/accessibility-color-qa/`

## hansa-bank-024 — الفئات غير المرتبة ليست تدرجًا

visualization / accessibility · draft

**الموقف:** هل كل اختلاف بين الفئات يعني انتقالًا من منخفض إلى مرتفع؟

**الخلاصة:** Qualitative للفئات غير المرتبة؛ Sequential للتدرج من منخفض إلى مرتفع.

**القيد:** طابق دلالة اللون مع معنى البيانات.

Source: `content/data-viz/pages.json#/0`

Lesson route: `/learn/accessibility-color-qa/`

## hansa-bank-025 — التجميع يغير شكل النتيجة

python / overview · draft

**الموقف:** ماذا يضيف sum بعد groupby للمنطقة؟

**الخلاصة:** يجمع قيم المبيعات داخل كل منطقة، بدل إرجاع إجمالي واحد لكل الجدول.

**القيد:** راجع مستوى التفصيل المطلوب بعد التجميع.

Source: `content/exams/python.json#/questions/0`

Lesson route: `/lab/python/?question=py-01`

## hansa-bank-026 — التسمية ليست الموضع

python / overview · draft

**الموقف:** هل الرقم داخل loc يعني موضع الصف؟

**الخلاصة:** loc يختار بالتسميات؛ iloc يختار بالمواضع الصحيحة التي تبدأ من صفر.

**القيد:** لا تخلط تسمية رقمية للصف مع موضعه.

Source: `content/exams/python.json#/questions/3`

Lesson route: `/lab/python/?question=py-04`

## hansa-bank-027 — تحويل النوع ليس تنظيفًا

python / overview · draft

**الموقف:** هل astype(float) يحذف النصوص غير الصالحة تلقائيًا؟

**الخلاصة:** astype يحول نوع البيانات؛ النصوص غير القابلة للتحويل تحتاج معالجة.

**القيد:** لا تفترض أن التحويل يزيل الصفوف غير الرقمية.

Source: `content/exams/python.json#/questions/7`

Lesson route: `/lab/python/?question=py-08`

## hansa-bank-028 — ثبّت المرجع المقصود

excel / overview · draft

**الموقف:** تنسخ معادلة وتريد بقاء المرجع إلى A1؛ ماذا تعني علامات الدولار؟

**الخلاصة:** $A$1 يثبت الصف والعمود عند نسخ المعادلة.

**القيد:** هذا وصف للنسخ، لا ضمان لكل أنواع تعديل بنية الورقة.

Source: `content/exams/excel.json#/questions/1`

Lesson route: `/lab/excel/?question=xl-02`

## hansa-bank-029 — التلخيص لا ينظف الأصل

excel / overview · draft

**الموقف:** هل PivotTable يحذف سجلات المصدر غير الصالحة؟

**الخلاصة:** PivotTable يلخص البيانات ويرشحها ويحدث عرضه من المصدر؛ لا يحذف السجلات الأصلية لتنظيفها.

**القيد:** تنظيف المصدر مهمة منفصلة.

Source: `content/exams/excel.json#/questions/2`

Lesson route: `/lab/excel/?question=xl-03`

## hansa-bank-030 — شكل الجدول يؤثر في التحليل

excel / overview · draft

**الموقف:** ما الذي يجعل نطاق البيانات أسهل للتحليل الموثوق؟

**الخلاصة:** صف عناوين واحد بأسماء فريدة، وجدول منظم، وعدم دمج خلايا داخل البيانات.

**القيد:** الصفوف الفارغة للفصل قد تقطع النطاقات والفرز.

Source: `content/exams/excel.json#/questions/8`

Lesson route: `/lab/excel/?question=xl-09`

## hansa-bank-031 — المؤشر يحتاج قرارًا

analysis / overview · draft

**الموقف:** جمعت رقمًا بسهولة؛ هل يكفي ذلك ليصبح KPI؟

**الخلاصة:** المؤشر الجيد يرتبط بهدف، ويمكن قياسه، ويقود إلى فعل.

**القيد:** سهولة جمع الرقم وحدها ليست سببًا كافيًا لاختياره.

Source: `content/exams/fundamentals.json#/questions/3`

Lesson route: `/lab/fundamentals/?question=fun-04`

## hansa-bank-032 — الدقة الظاهرية ليست صحة

analysis / overview · draft

**الموقف:** هل إضافة منازل عشرية تجعل المؤشر أكثر مصداقية؟

**الخلاصة:** عدد المنازل العشرية لا يثبت صحة القياس؛ اختر دقة تخدم القرار.

**القيد:** لا تستخدم التنسيق لإخفاء عدم اليقين في البيانات.

Source: `content/exams/fundamentals.json#/questions/5`

Lesson route: `/lab/fundamentals/?question=fun-06`

## hansa-bank-033 — جودة البيانات أكثر من شكلها

analysis / overview · draft

**الموقف:** تبدو البيانات مرتبة؛ ماذا يجب فحصه؟

**الخلاصة:** تشمل جودة البيانات الدقة والاكتمال والحداثة والاتساق والصلاحية والتفرد.

**القيد:** جمال الألوان ليس بُعدًا لجودة البيانات.

Source: `content/exams/fundamentals.json#/questions/1`

Lesson route: `/lab/fundamentals/?question=fun-02`

## hansa-bank-034 — المقياس يستجيب للسياق

power-bi / model · draft

**الموقف:** لماذا يتغير المقياس عند تغير سياق المرئي؟

**الخلاصة:** المقياس يُقيّم وقت الاستعلام باستخدام سياق التصفية للمرئي.

**القيد:** لا تتعامل معه كقيمة ثابتة مخزنة مثل عمود محسوب في نموذج استيراد.

Source: `content/exams/power-bi.json#/questions/0`

Lesson route: `/lab/power-bi/?question=pbi-01`

## hansa-bank-035 — CALCULATE يغير سياق التصفية

power-bi / model · draft

**الموقف:** ما الفكرة الأساسية وراء CALCULATE؟

**الخلاصة:** يقيّم تعبيرًا في سياق تصفية معدل.

**القيد:** تفاصيل التعديل تعتمد على التعبير والمرشحات؛ لا تعمم نتيجة دون فحصهما.

Source: `content/exams/power-bi.json#/questions/1`

Lesson route: `/lab/power-bi/?question=pbi-02`

## hansa-bank-036 — SUMX يقيّم ثم يجمع

power-bi / model · draft

**الموقف:** تحتاج جمع نتائج تعبير لكل صف؛ ما الفرق عن جمع عمود؟

**الخلاصة:** SUMX يمر على جدول ويقيّم التعبير لكل صف ثم يجمع النتائج؛ SUM يجمع عمودًا موجودًا.

**القيد:** تحقق من الجدول الذي يجري التكرار عليه ومن سياق الحساب.

Source: `content/exams/power-bi.json#/questions/6`

Lesson route: `/lab/power-bi/?question=pbi-07`

## hansa-bank-037 — رفع ملف لا ينشئ جدولًا تلقائيًا

fabric / foundations · draft

**الموقف:** رفعت CSV إلى Files؛ هل أصبح جدول SQL؟

**الخلاصة:** الملفات تحفظ البيانات الخام؛ Tables تمثل بيانات قابلة للاستهلاك كجداول Delta. رفع CSV وحده لا يجعله جدول SQL.

**القيد:** راجع التحويل والتمثيل المطلوبين قبل توقع إمكان الاستعلام كجدول.

Source: `content/fabric/notes.json#/0/chapters/0`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Lakehouse, OneLake, and access layers

## hansa-bank-038 — Bronze وSilver وGold مراحل

fabric / foundations · draft

**الموقف:** هل أسماء الطبقات تعني منتجات تخزين مختلفة؟

**الخلاصة:** Bronze وSilver وGold تصف مراحل المعالجة، وليست منتجات تخزين مستقلة.

**القيد:** افصل مرحلة تجهيز البيانات عن المنتج الذي يخزنها.

Source: `content/fabric/notes.json#/0/chapters/0`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Lakehouse, OneLake, and access layers

## hansa-bank-039 — الملف الموجود ليس بالضرورة بيانات حالية

fabric / transform · draft

**الموقف:** رأيت ملفات كثيرة داخل جدول Delta؛ هل كلها جزء من حالته الحالية؟

**الخلاصة:** سجل المعاملات المعتمد يحدد الملفات التي تكوّن لقطة الجدول، وليس مجرد وجود الملف على التخزين.

**القيد:** قد تبقى ملفات تاريخية بعد التحديث أو الحذف.

Source: `content/fabric/notes.json#/0/chapters/2`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Delta files, transaction logs, and controlled changes

## hansa-bank-040 — التنظيف ليس دمج الملفات

fabric / transform · draft

**الموقف:** هل VACUUM وOPTIMIZE يؤديان المهمة نفسها؟

**الخلاصة:** VACUUM ينظف ملفات البيانات القديمة المؤهلة للحذف؛ OPTIMIZE يدمج الملفات الصغيرة النشطة.

**القيد:** الحذف يؤثر في إمكان الاسترجاع؛ لا تنفذ تنظيفًا اعتمادًا على هذه الخلاصة وحدها.

Source: `content/fabric/notes.json#/0/chapters/3`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section VACUUM, OPTIMIZE, and V-Order have different goals

## hansa-bank-041 — التفاصيل تحتاج مسار وصول

power-bi / report · draft

**الموقف:** كيف ينتقل القارئ من ملخص التقرير إلى تحليل تفصيلي؟

**الخلاصة:** درس تحسين التقارير يستخدم صفحات drill-through للتحليل التفصيلي، وbookmarks وأزرارًا لتحسين التنقل.

**القيد:** هذه خلاصة هدف الدرس؛ إعداد التفاعل يحتاج الرجوع إلى خطواته.

Source: `content/academy/lessons.json#/tracks/1/lessons/22`

Lesson route: `/learn/academy/power-bi/labs-09-enhance-power-bi-reports/`

## hansa-bank-042 — اختبر الدور الأمني

power-bi / govern · draft

**الموقف:** كيف تتحقق أن كل مندوب يرى المنطقة المخصصة له؟

**الخلاصة:** الدرس يبني ويختبر أدوار RLS ديناميكية اعتمادًا على هوية المستخدم لتقييد البيانات بالمنطقة.

**القيد:** مجرد وجود دور لا يثبت صحة نتيجة التصفية؛ الاختبار جزء من الدرس.

Source: `content/academy/lessons.json#/tracks/1/lessons/24`

Lesson route: `/learn/academy/power-bi/labs-11-secure-data-access/`

## hansa-bank-043 — اختر عقد الكائن قبل إعادة استخدامه

fabric / query · draft

**الموقف:** هل نتيجة procedure يمكن استدعاؤها كجدول داخل FROM؟

**الخلاصة:** الإجراء المخزن ينفذ سير عمل وقد يعيد نتائج، لكن مجموعة نتائجه لا تُستدعى كتعبير جدول في FROM.

**القيد:** راجع نوع الكائن ودعم المحرك؛ لا تخلط الإجراء بالدالة التي تعيد صفوفًا.

Source: `content/fabric/notes.json#/1/chapters/1`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Schemas, tables, views, functions, and procedures

**مقتطف الدليل:** A procedure result set is not invoked as a table expression in FROM.

Evidence pointer: `/1/chapters/1/points/1`

## hansa-bank-044 — هوية العميل ليست هوية نسخته

fabric / model · draft

**الموقف:** للعميل عدة نسخ تاريخية؛ إلى أي مفتاح تشير الحقيقة؟

**الخلاصة:** CustomerId يعرّف الكيان، بينما CustomerSK يعرّف نسخة مخزنة منه؛ يجب أن تشير الحقيقة إلى النسخة المقصودة.

**القيد:** الربط بالمفتاح الطبيعي عبر عدة نسخ قد يضاعف صفوف الحقائق.

Source: `content/fabric/notes.json#/3/chapters/2`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack scd, then section Customers, orders, and key semantics

**مقتطف الدليل:** CustomerId names an entity, while CustomerSK identifies one stored version.

Evidence pointer: `/3/chapters/2/points/1`

## hansa-bank-045 — راجع كل مسارات الوصول

fabric / security · draft

**الموقف:** طبقت أمان SQL؛ هل يكفي ذلك إذا كان الوصول المباشر إلى OneLake مفتوحًا؟

**الخلاصة:** أمان طبقة SQL وحده لا يتحكم في قراءة OneLake غير المقيدة؛ مسارات الوصول المختلفة تحتاج مراجعة.

**القيد:** احتفظ بقيود المحرك والسيناريو المذكورة في المصدر؛ ليست هذه مراجعة لصلاحيات بيئة فعلية.

Source: `content/fabric/notes.json#/5/chapters/15`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack video06, then section security changes and mode

**مقتطف الدليل:** SQL-layer security alone does not control unrestricted OneLake reads.

Evidence pointer: `/5/chapters/15/points/0`

## hansa-bank-046 — الترقية تمر بمراحل

fabric / delivery · draft

**الموقف:** كيف ينظم درس CI/CD نقل المحتوى بين البيئات؟

**الخلاصة:** يستخدم الدرس deployment pipeline متعددة المراحل لنقل المحتوى بين التطوير والاختبار والإنتاج.

**القيد:** هذه خلاصة سير العمل في النسخة المحلية للدرس، وليست إثباتًا بأن نشرًا أو اختبارًا قد تم.

Source: `content/academy/lessons.json#/tracks/0/lessons/32`

Lesson route: `/learn/academy/fabric-analytics/21-implement-cicd/`

**مقتطف الدليل:** deploy content across development, test, and production environments

Evidence pointer: `/tracks/0/lessons/32/description`

## hansa-bank-047 — حدد المصدر والوجهة في التدفق

fabric / streaming · draft

**الموقف:** كيف يربط مثال الدراجات التقاط الأحداث بتحليلها؟

**الخلاصة:** يلتقط eventstream بيانات المثال ويحملها إلى قاعدة eventhouse، ثم يقارن الدرس البيانات الخام والمحوّلة باستخدام KQL.

**القيد:** Eventstream وEventhouse يؤديان دورين مختلفين؛ المثال تدريبي ولم يُنفذ هنا.

Source: `content/academy/lessons.json#/tracks/0/lessons/17`

Lesson route: `/learn/academy/fabric-analytics/09-real-time-analytics-eventstream/`

**مقتطف الدليل:** an eventstream that captures sample bicycle data, loads it into an eventhouse database

Evidence pointer: `/tracks/0/lessons/17/description`

## hansa-bank-048 — النمط المعماري ليس قاعدة إلزامية

fabric / overview · draft

**الموقف:** هل وضع Warehouse في silver أو gold شرط لاستخدامه؟

**الخلاصة:** المصدر يعرض وضع Warehouse في silver أو gold كنمط معماري معتاد، وليس ربطًا إلزاميًا بطبقة محددة.

**القيد:** اختيار السطح يتبع عبء العمل؛ مألوفية SQL Server لا تثبت تطابق الميزات.

Source: `content/fabric/notes.json#/1/chapters/0`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Warehouse architecture and workload selection

**مقتطف الدليل:** usual silver/gold placement is a pattern, not a mandatory medallion mapping.

Evidence pointer: `/1/chapters/0/points/0`

## hansa-bank-049 — السؤال السببي يغير طريقة البحث

statistics / synthesis · draft

**الموقف:** وجدت ارتباطًا وتريد معرفة تأثير معالجة؛ هل يكفي معامل الارتباط؟

**الخلاصة:** دليل اختيار الطريقة يوجه السؤال عن تأثير المعالجة إلى تصميم تجربة وضبط وعشوائية، بدل استنتاج السببية من الارتباط مباشرة.

**القيد:** راجع العوامل المربكة ومدى ملاءمة التصميم للسؤال.

Source: `content/statistics/source.json#/sections/37`

Lesson route: `/learn/statistics/source/`

Find source section: 38. Decision Rules — إذا تغير السؤال، ماذا أفعل؟

**مقتطف الدليل:** لا تستنتج Causation مباشرة؛ ابحث عن Confounding Variables أو استخدم Experiment مناسبًا للسؤال السببي.

Evidence pointer: `/sections/37/blocks/14/blocks/0/inline/0/text`

## hansa-bank-050 — الإحصاءات المتشابهة قد تخفي أشكالًا مختلفة

visualization / foundations · draft

**الموقف:** هل تطابق المتوسط والتشتت والارتباط يعني تشابه شكل البيانات؟

**الخلاصة:** مثال Datasaurus في المرجع يوضح أن ملخصات متقاربة قد تصاحب أشكالًا مختلفة؛ افحص البيانات بصريًا.

**القيد:** الرسم يكمل الملخصات والنماذج، ولا يلغي دورها.

Source: `content/data-viz/pages.json#/18`

Lesson route: `/learn/foundations/`

**مقتطف الدليل:** Never assume that similar summary statistics imply similar data structure. Plot the data.

Evidence pointer: `/18/blocks/8/inline/0/text`

## hansa-bank-051 — الترتيب يجعل المقارنة أسهل

visualization / comparison · draft

**الموقف:** تعرض فئات للعثور على الأعلى والأدنى؛ كيف ترتبها؟

**الخلاصة:** عندما يكون الهدف ترتيب الفئات بحسب المقياس، يساعد فرز الأعمدة على اكتشاف الأعلى والأدنى والتعادلات.

**القيد:** اربط الترتيب بالمهمة، ولا تتجاهل ترتيبًا طبيعيًا مطلوبًا للفئات.

Source: `content/data-viz/pages.json#/2`

Lesson route: `/learn/ar/bar-plot/`

**مقتطف الدليل:** رتّب الفئات حسب المقياس عندما يكون الهدف هو Ranking.

Evidence pointer: `/2/blocks/12/inline/0/text`

## hansa-bank-052 — عرض الفئة يغير ما تراه

visualization / distribution · draft

**الموقف:** تغير شكل Histogram بعد تعديل عرض الـBin؛ هل تغيرت البيانات؟

**الخلاصة:** الفئات الضيقة جدًا قد تظهر ضوضاء، والواسعة جدًا قد تخفي بنية؛ جرّب تقسيمات منطقية.

**القيد:** لا تختَر التقسيم لمجرد جمال الشكل ولا تبالغ في تفسير تذبذب ناتج عنه.

Source: `content/data-viz/pages.json#/8`

Lesson route: `/learn/ar/histogram/`

**مقتطف الدليل:** إذا كان عرض الـBin صغيرًا جدًا، قد يصبح الرسم مليئًا بالضوضاء والتذبذبات.

Evidence pointer: `/8/blocks/9/inline/0/text`

## hansa-bank-053 — افحص الشكل قبل خط الاتجاه

visualization / relationships · draft

**الموقف:** هل يكفي خط مستقيم لوصف سحابة النقاط؟

**الخلاصة:** افحص الاتجاه والقوة والشكل والتجمعات والقيم الشاذة وتغير الانتشار، قبل اختزال العلاقة في خط واحد.

**القيد:** قد تخفي قيمة ارتباط خطي ضعيفة علاقة منحنية أو عنقودية.

Source: `content/data-viz/pages.json#/12`

Lesson route: `/learn/ar/scatter-plot/`

**مقتطف الدليل:** الشكل: خطي، منحنٍ، مجموعات، إلخ.

Evidence pointer: `/12/blocks/11/items/0`

## hansa-bank-054 — التاريخ وحده لا يبرر وصل النقاط

visualization / time · draft

**الموقف:** كل نقطة أغنية مختلفة وتاريخ إصدارها؛ هل يصلح وصل تقييماتها بخط؟

**الخلاصة:** الرسم الخطي يفترض ارتباطًا مفاهيميًا بين المشاهدات المتتالية؛ تاريخ الإصدار وحده لا يجعل أغنيات مختلفة سلسلة قياسات للعملية نفسها.

**القيد:** استخدم Scatter Plot عندما لا تكون المشاهدات مترابطة بهذا المعنى.

Source: `content/data-viz/pages.json#/9`

Lesson route: `/learn/ar/line-plot/`

**مقتطف الدليل:** وجود الوقت على X لا يعني تلقائيًا Line Plot

Evidence pointer: `/9/headings/4/text`

## hansa-bank-055 — بطاقة KPI تحتاج سياقًا

visualization / composition · draft

**الموقف:** تعرض قيمة واحدة؛ ما الذي يساعد القارئ على تفسيرها؟

**الخلاصة:** أضف الهدف أو المرجع، والتغير أو الاتجاه، والنافذة الزمنية وسياق الحالة إلى القيمة الحالية.

**القيد:** اختر السياق الذي يخدم القرار بدل زيادة الزخرفة.

Source: `content/data-viz/pages.json#/17`

Lesson route: `/learn/dashboard-design/`

**مقتطف الدليل:** current value + target/benchmark + change/direction + time window + status/exception context.

Evidence pointer: `/17/blocks/15/inline/0/text`

## hansa-bank-056 — هدف التعلم يحدد مسار القراءة

visualization / overview · draft

**الموقف:** هل يبدأ تحضير المقابلة بنفس تسلسل استكشاف البيانات؟

**الخلاصة:** المرجع يقدم مسارات مختلفة لـBI وDashboards، ولاستكشاف البيانات، وللامتحانات والمقابلات؛ اختر المسار بحسب هدفك.

**القيد:** هذه مسارات قراءة مقترحة، وليست إثبات إتقان أو شرطًا لقفل الدروس.

Source: `content/data-viz/pages.json#/10`

Lesson route: `/learn/ar/reading-paths/`

**مقتطف الدليل:** المسار 3: Exam / Interview Prep (مصائد شائعة)

Evidence pointer: `/10/headings/3/text`

## hansa-bank-057 — التحويل يسبق تحميل النموذج

power-bi / prepare · draft

**الموقف:** أين يعيد الدرس تسمية الأعمدة ويرشح البيانات ويعيد تشكيل الجداول؟

**الخلاصة:** يطبق الدرس التحويلات في Power Query Editor ثم يحمل الاستعلامات المحولة كجداول في النموذج الدلالي.

**القيد:** هذه خطوات الدرس المحلي؛ لم يتم تشغيل Power Query هنا.

Source: `content/academy/lessons.json#/tracks/1/lessons/15`

Lesson route: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

**مقتطف الدليل:** then load the transformed queries as tables into the semantic model

Evidence pointer: `/tracks/1/lessons/15/description`

## hansa-bank-058 — قابلية الاستخدام جزء من إعداد النموذج

power-bi / overview · draft

**الموقف:** هل إعداد النموذج ينتهي عند إنشاء العلاقات؟

**الخلاصة:** يجمع درس إعداد النموذج بين العلاقات وخصائص الجداول والأعمدة لتحسين الاستخدام، ويضيف hierarchies للتحليل المتدرج.

**القيد:** راجع الحاجة إلى كل خاصية؛ لا تضف تعقيدًا لمجرد توفره في الدرس.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** configuring table and column properties to improve usability and user-friendliness

Evidence pointer: `/tracks/1/lessons/16/description`

## hansa-bank-059 — ترتيب المعنى غير خطة التنفيذ

sql / foundations · draft

**الموقف:** هل ترتيب معالجة SQL المنطقي يصف بالضرورة خطوات المحرك الفعلية؟

**الخلاصة:** المصدر يميز ترتيب معنى الاستعلام عن ترتيب تنفيذ المحرك؛ لا تستخدم الخريطة المنطقية كبديل لخطة التنفيذ.

**القيد:** توضح الخريطة توقيت المراحل منطقيًا، لا تكلفة الاستعلام أو الخطة المختارة.

Source: `content/sql/vault.json#/pages/1`

Lesson route: `/learn/sql/01/`

**مقتطف الدليل:** ده ترتيب المعنى، مش ترتيب تنفيذ المحرك.

Evidence pointer: `/pages/1/body`

## hansa-bank-060 — استكشف البنية قبل النتائج

sql / schema · draft

**الموقف:** استلمت قاعدة جديدة؛ هل تبدأ باستعلام شامل على كل جدول؟

**الخلاصة:** ابدأ باكتشاف الجداول والعلاقات، ثم المخطط والمفاتيح وأنواع البيانات والقيود، قبل أخذ العينات والتلخيص.

**القيد:** معرفة أسماء الأعمدة وحدها لا تكفي لفهم العلاقات.

Source: `content/sql/vault.json#/pages/2`

Lesson route: `/learn/sql/02/`

**مقتطف الدليل:** 1. Discover tables & relationships

Evidence pointer: `/pages/2/body`

## hansa-bank-061 — UNKNOWN لا يمر من WHERE

sql / types-null · draft

**الموقف:** ماذا يحدث عندما تكون نتيجة الشرط UNKNOWN بسبب NULL؟

**الخلاصة:** منطق الشروط في SQL يقبل TRUE وFALSE وUNKNOWN؛ WHERE يحتفظ فقط بالصفوف التي تحقق TRUE.

**القيد:** NULL ليس صفرًا أو نصًا فارغًا؛ استخدم فحص NULL المناسب.

Source: `content/sql/vault.json#/pages/3`

Lesson route: `/learn/sql/03/`

**مقتطف الدليل:** A <code>WHERE</code> clause retains only TRUE rows.

Evidence pointer: `/pages/3/body`

## hansa-bank-062 — فلتر الصفوف غير فلتر المجموعات

sql / filtering · draft

**الموقف:** تريد استبعاد مجموعات بناء على إجماليها؛ أين تضع الشرط؟

**الخلاصة:** WHERE يقلل الصفوف قبل التجميع؛ HAVING يرشح المجموعات بحسب نتائج التجميع.

**القيد:** نقل الشرط بين المرحلتين قد يغير المجتمع الداخل في الحساب.

Source: `content/sql/vault.json#/pages/4`

Lesson route: `/learn/sql/04/`

**مقتطف الدليل:** Use WHERE to reduce rows before grouping. Use HAVING to filter groups based on aggregate results.

Evidence pointer: `/pages/4/body`

## hansa-bank-063 — الجمع قد يحتفظ بالتكرار

sql / sets · draft

**الموقف:** تجمع صفوف نتيجتين متوافقتين؛ هل يجب إسقاط الصفوف المتطابقة؟

**الخلاصة:** UNION ALL يحتفظ بالتكرارات، بينما UNION يحذف الصفوف المكررة؛ اختر بحسب تعريف النتيجة.

**القيد:** لا تخلط تكديس الصفوف بربط أعمدة جداول مرتبطة.

Source: `content/sql/vault.json#/pages/8`

Lesson route: `/learn/sql/08/`

**مقتطف الدليل:** UNION ALL: keep duplicates

Evidence pointer: `/pages/8/body`

## hansa-bank-064 — اللحظة ليست مجرد نص وقت

sql / time · draft

**الموقف:** تقارن سجلات من مناطق مختلفة؛ ما الافتراض الذي يحتاج توضيحًا؟

**الخلاصة:** ميّز timestamp الذي يمثل لحظة مع سياق منطقة زمنية عن timestamp بلا معلومات منطقة زمنية.

**القيد:** لا تفترض أن تشابه شكل الساعة يعني تطابق اللحظة الزمنية.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** timestamp من غير معلومة timezone

Evidence pointer: `/pages/10/body`

## hansa-bank-065 — افحص تكرار الفئات وترتيب أسمائها

sql / text · draft

**الموقف:** تريد اكتشاف فئات نصية تبدو مكررة؛ لماذا لا يكفي ترتيبها بالتكرار؟

**الخلاصة:** الترتيب بالتكرار يبرز الشائع والنادر، والترتيب الأبجدي يساعد في اكتشاف اختلافات حالة الأحرف والمسافات.

**القيد:** راجع المعنى قبل توحيد قيم قد تكون مختلفة فعلًا.

Source: `content/sql/vault.json#/pages/11`

Lesson route: `/learn/sql/11/`

**مقتطف الدليل:** بيسهّل اكتشاف اختلافات الحالة (case)، المسافات، والقيم اللي شكلها مكرر.

Evidence pointer: `/pages/11/body`

## hansa-bank-066 — الجسر يشرح العلاقة المتعددة

sql / analytics · draft

**الموقف:** كيف يمثل مثال MovieNow وجود عدة ممثلين بالفيلم وعمل الممثل في عدة أفلام؟

**الخلاصة:** يستخدم المثال actsin كجدول ربط بين الأفلام والممثلين لأن العلاقة متعددة من الجانبين.

**القيد:** افهم دور جدول الربط قبل حساب المقاييس عبره لتجنب تعدد الصفوف غير المقصود.

Source: `content/sql/vault.json#/pages/12`

Lesson route: `/learn/sql/12/`

**مقتطف الدليل:** bridge/associative table لأن فيلم واحد ممكن يكون فيه ممثلين كتير، والممثل يكون في أفلام كتير.

Evidence pointer: `/pages/12/body`

## hansa-bank-067 — تحقق قبل COMMIT

sql / transactions · draft

**الموقف:** نفذت تحديثًا داخل معاملة؛ ما الخطوة قبل اعتماده؟

**الخلاصة:** افحص عدد الصفوف المتأثرة وقيود العمل، ثم اعتمد المعاملة عندما تكون النتيجة صحيحة.

**القيد:** المعاملة ليست نسخة احتياطية؛ تختلف تفاصيل سلوكها حسب المحرك.

Source: `content/sql/vault.json#/pages/14`

Lesson route: `/learn/sql/14/`

**مقتطف الدليل:** Validate affected row count and business constraints.

Evidence pointer: `/pages/14/body`

## hansa-bank-068 — حفظ التاريخ قرار تصميم

sql / design · draft

**الموقف:** هل تعديل صف بُعد يعني محو قيمته السابقة؟

**الخلاصة:** في وصف المصدر، SCD Type 1 يستبدل التاريخ، بينما Type 2 يحفظ نسخًا أو تواريخ سريان؛ اختر بحسب متطلبات التقرير.

**القيد:** حدد متطلبات التاريخ قبل اختيار استراتيجية التحديث.

Source: `content/sql/vault.json#/pages/15`

Lesson route: `/learn/sql/15/`

**مقتطف الدليل:** Type 2: preserve history with versions/effective dates

Evidence pointer: `/pages/15/body`

## hansa-bank-069 — قِس أثر التحسين

sql / performance · draft

**الموقف:** غيرت الاستعلام ليبدو أبسط؛ هل أثبت ذلك أنه أسرع؟

**الخلاصة:** قارن قبل وبعد باستخدام خطة التنفيذ والقراءات المنطقية ووقت المعالج والمدة وعدد الصفوف حيث تتوفر.

**القيد:** صحة النتيجة تسبق تحسين الأداء؛ شكل الكود وحده ليس قياسًا.

Source: `content/sql/vault.json#/pages/16`

Lesson route: `/learn/sql/16/`

**مقتطف الدليل:** Compare before/after using execution plans, logical reads, CPU time, duration, and row counts where available.

Evidence pointer: `/pages/16/body`

## hansa-bank-070 — نوع الحقيقة يتبع السؤال

sql / warehouse · draft

**الموقف:** هل تحتاج صفًا لكل حدث أم لكل كيان في فترة؟

**الخلاصة:** Transaction fact يمثل حدث عمل، وPeriodic snapshot يمثل كيانًا لكل فترة، وAccumulating snapshot يتابع مراحل عملية.

**القيد:** اختر بناء على العملية والأسئلة المطلوبة، ولا تخلط مستويات التفاصيل في الجدول نفسه.

Source: `content/sql/vault.json#/pages/17`

Lesson route: `/learn/sql/17/`

**مقتطف الدليل:** Periodic snapshot: one row per entity per period.

Evidence pointer: `/pages/17/body`

## hansa-bank-071 — افحص نوع العمود من الوصف البنيوي

sql / postgresql · draft

**الموقف:** قيمة تبدو نصية؛ هل هذا كاف لمعرفة نوع العمود في PostgreSQL؟

**الخلاصة:** استعلم عن metadata في information_schema.columns لمعرفة النوع؛ شكل القيمة وحده لا يكفي.

**القيد:** المصدر ينبه إلى أن special_features قد يكون ARRAY وليس TEXT.

Source: `content/sql/vault.json#/pages/31`

Lesson route: `/learn/sql/reference/3cb3906c5d6c8129b6ded3e8106785fb/`

**مقتطف الدليل:** شكل القيمة وحده لا يكفي لمعرفة نوعها.

Evidence pointer: `/pages/31/body`

## hansa-bank-072 — Nested لا تعني Correlated

sql / interview · draft

**الموقف:** يوجد استعلام داخل آخر؛ هل هو بالضرورة مترابط مع الصف الخارجي؟

**الخلاصة:** Nested تصف البنية؛ Correlated تعني الاعتماد على عمود من نطاق الاستعلام الخارجي.

**القيد:** ليست كل subquery متداخلة مترابطة.

Source: `content/sql/vault.json#/pages/26`

Lesson route: `/learn/sql/reference/3cd3906c5d6c8146b302e7948bf6db8e/`

**مقتطف الدليل:** not every nested subquery is correlated.

Evidence pointer: `/pages/26/body`

## hansa-bank-073 — الجدول المؤقت ليس رابطًا حيًا

sql / toolkit · draft

**الموقف:** أنشأت جدولًا مؤقتًا من SELECT ثم تغير المصدر؛ كيف تفكر في النتيجة؟

**الخلاصة:** النتيجة المخزنة في الجدول المؤقت مستقلة عن جدول المصدر وليست رابطًا حيًا إلى نتيجته.

**القيد:** راجع نطاق الجلسة ودورة الحياة في المحرك المستخدم.

Source: `content/sql/vault.json#/pages/30`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81a3adaeddff44170644/`

**مقتطف الدليل:** ليست live link إلى نتيجة الـ source.

Evidence pointer: `/pages/30/body`

## hansa-bank-074 — التقسيم يغير التخطيط لا الصفوف المنطقية

fabric / transform · draft

**الموقف:** هل نقل البيانات إلى مجلدات partitions يخلق مجموعة صفوف جديدة؟

**الخلاصة:** في وصف Hive-style، يتغير توزيع الملفات حسب قيم المفاتيح، بينما تبقى مجموعة الصفوف المنطقية نفسها.

**القيد:** لا تخلط تحسين التخطيط بتحويل معنى السجلات.

Source: `content/fabric/notes.json#/0/chapters/4`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Partition hierarchy, pruning, and cardinality

**مقتطف الدليل:** The logical row set is unchanged.

Evidence pointer: `/0/chapters/4/points/0`

## hansa-bank-075 — كثرة مفاتيح التقسيم قد تصنع ملفات صغيرة

fabric / transform · draft

**الموقف:** هل زيادة عدد partitions دائمًا أفضل؟

**الخلاصة:** القيم المميزة الكثيرة أو جمع مفاتيح كثيرة قد ينتج partitions صغيرة وكتابات ملفات صغيرة متكررة.

**القيد:** قدّر حجم البيانات في كل قسم وراجع المرشحات الفعلية.

Source: `content/fabric/notes.json#/0/chapters/4`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Partition hierarchy, pruning, and cardinality

**مقتطف الدليل:** can create tiny partitions and frequent small-file writes.

Evidence pointer: `/0/chapters/4/points/1`

## hansa-bank-076 — ACID لا تلغي تعارض الكتابة

fabric / transform · draft

**الموقف:** هل ضمان الاتساق يعني أن كاتبين لن يتعارضا؟

**الخلاصة:** يحافظ ACID على الاتساق، لكن تعارضات الكتابة التفاؤلية قد تظل ممكنة.

**القيد:** صمم معالجة التعارض وفق العملية والمحرك.

Source: `content/fabric/notes.json#/0/chapters/2`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Delta files, transaction logs, and controlled changes

**مقتطف الدليل:** optimistic write conflicts can still occur.

Evidence pointer: `/0/chapters/2/points/1`

## hansa-bank-077 — Time travel لا تعد بتاريخ غير محدود

fabric / transform · draft

**الموقف:** هل القدرة على قراءة لقطة سابقة تعني حفظ كل التاريخ إلى الأبد؟

**الخلاصة:** قراءة اللقطات القديمة لا تتضمن وعدًا باحتفاظ غير محدود بالتاريخ.

**القيد:** راجع ما بقي من الملفات والسجلات وسياسات الاحتفاظ.

Source: `content/fabric/notes.json#/0/chapters/2`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Delta files, transaction logs, and controlled changes

**مقتطف الدليل:** Neither is a promise to keep unlimited history

Evidence pointer: `/0/chapters/2/points/2`

## hansa-bank-078 — تطور المخطط ليس قبولًا صامتًا لكل شيء

fabric / transform · draft

**الموقف:** هل schema evolution تعني أن أي مخطط وارد يُقبل تلقائيًا؟

**الخلاصة:** يصف المصدر تغيرات بنيوية مضبوطة، لا قبول كل مخطط وارد دون شروط.

**القيد:** راجع التفعيل والضوابط المطلوبة بدل تعطيل الحماية بلا قصد.

Source: `content/fabric/notes.json#/0/chapters/2`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Delta files, transaction logs, and controlled changes

**مقتطف الدليل:** silently accept every incoming schema.

Evidence pointer: `/0/chapters/2/points/2`

## hansa-bank-079 — الاسترجاع يحتاج ملفات وسجلًا معًا

fabric / transform · draft

**الموقف:** هل الاحتفاظ بالسجل وحده يكفي لقراءة حالة قديمة؟

**الخلاصة:** يشترط الاسترجاع وجود القدر الكافي من logs وملفات البيانات المحتفظ بها معًا.

**القيد:** مدة retention وحدها ليست ضمان خدمة للاسترجاع.

Source: `content/fabric/notes.json#/0/chapters/3`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section VACUUM, OPTIMIZE, and V-Order have different goals

**مقتطف الدليل:** Recovery requires sufficient retained logs AND files.

Evidence pointer: `/0/chapters/3/points/2`

## hansa-bank-080 — صلاحية المصدر غير صلاحية الهدف

fabric / ingestion · draft

**الموقف:** لديك صلاحية SQL على الهدف؛ هل هذا يثبت إمكان قراءة ملف المصدر؟

**الخلاصة:** المصدر يميز تفويض قراءة المصدر عن تفويض SQL للهدف.

**القيد:** راجع كلا الطرفين في مسار التحميل.

Source: `content/fabric/notes.json#/1/chapters/10`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section COPY INTO: private CSV, header, permissions, and retry

**مقتطف الدليل:** Source authorization and target SQL authorization are separate.

Evidence pointer: `/1/chapters/10/points/1`

## hansa-bank-081 — إعادة المحاولة قد تكرر الإضافة

fabric / ingestion · draft

**الموقف:** وصلت البيانات لكن ضاع تأكيد النجاح؛ ماذا يحدث عند إعادة append؟

**الخلاصة:** يجب أن يعالج تصميم التحميل احتمال إعادة التشغيل حتى لا تتحول المحاولة المعادة إلى تكرار غير مقصود.

**القيد:** نجاح النقل مرة لا يثبت أمان replay.

Source: `content/fabric/notes.json#/1/chapters/10`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section COPY INTO: private CSV, header, permissions, and retry

**مقتطف الدليل:** A repeated append must be made safe by the load design

Evidence pointer: `/1/chapters/10/points/1`

## hansa-bank-082 — مرشح اختياري قد يسقط NULL دون قصد

fabric / query · draft

**الموقف:** استخدمت COALESCE لتعيد العمود إلى نفسه عند غياب parameter؛ ما الذي تفحصه؟

**الخلاصة:** قد يسقط النمط صفوفًا قيمتها NULL في العمود؛ افحص IS NULL صراحة حسب المقصود.

**القيد:** اختبر البيانات المفقودة والتجميع المنطقي للشروط.

Source: `content/fabric/notes.json#/1/chapters/9`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Parameterized employee procedure and optional department

**مقتطف الدليل:** COALESCE-to-the-same-column can silently drop rows whose column value is NULL.

Evidence pointer: `/1/chapters/9/caveat`

## hansa-bank-083 — View تحفظ منطق قراءة

fabric / query · draft

**الموقف:** هل ordinary view في هذا التقسيم كجدول يخزن الصفوف؟

**الخلاصة:** يميز المصدر الجدول الذي يحمل صفوفًا عن ordinary view التي تحفظ منطق القراءة.

**القيد:** لا تخلط الوصف بالـmaterialized views أو غيرها من أنواع الكائنات.

Source: `content/fabric/notes.json#/1/chapters/1`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Schemas, tables, views, functions, and procedures

**مقتطف الدليل:** ordinary views save read logic

Evidence pointer: `/1/chapters/1/points/0`

## hansa-bank-084 — ثبات الحقل لا يعني استحالة تصحيحه

fabric / model · draft

**الموقف:** هل سياسة SCD0 تعني أن تاريخ الميلاد لا يمكن أن يكون خطأ؟

**الخلاصة:** يميّز المصدر بين سياسة عدم تغيير القيمة في التحميل المعتاد وبين مسار تصحيح مصرح به للأخطاء.

**القيد:** لا تتعامل مع الحقل كأنه محصن من خطأ الإدخال.

Source: `content/fabric/notes.json#/3/chapters/6`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack scd, then section SCD0: deliberately retain the approved value

**مقتطف الدليل:** A birth date or calendar field is not intrinsically immune to data-entry errors.

Evidence pointer: `/3/chapters/6/caveat`

## hansa-bank-085 — تغير التجميع دون تغير مبالغ الحقائق

fabric / model · draft

**الموقف:** تغيرت منطقة العميل بالاستبدال؛ لماذا تغير تقرير المناطق رغم ثبات المبالغ؟

**الخلاصة:** قد تبقى قيم الحقائق كما هي بينما يتغير تصنيفها إلى مناطق بعد استبدال صفة البعد.

**القيد:** حدد هل التقرير يريد الوصف الحالي أم الوصف وقت الحدث.

Source: `content/fabric/notes.json#/3/chapters/7`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack scd, then section SCD1: current state and corrections

**مقتطف الدليل:** Fact amounts can stay unchanged while their region grouping changes.

Evidence pointer: `/3/chapters/7/points/1`

## hansa-bank-086 — قيمة سابقة واحدة ليست تاريخًا كاملًا

fabric / model · draft

**الموقف:** هل current وprevious يكفيان لكل استعلام as-of بعد تغييرات متكررة؟

**الخلاصة:** حفظ قيمة سابقة واحدة يوفر تاريخًا محدودًا، لا سلسلة غير محدودة من النسخ.

**القيد:** حدد أسئلة التاريخ المطلوبة قبل الاكتفاء بهذا الملخص.

Source: `content/fabric/notes.json#/3/chapters/9`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack scd, then section SCD3: current and one previous value

**مقتطف الدليل:** Keeping one previous value does not retain an unrestricted timeline.

Evidence pointer: `/3/chapters/9/caveat`

## hansa-bank-087 — إعادة توليد Surrogate Keys قد تكسر الربط

fabric / model · draft

**الموقف:** هل تعيد توليد مفاتيح الأبعاد من نسخة البيانات الحالية بلا أثر؟

**الخلاصة:** يجب الحفاظ على مراجع الحقائق؛ إعادة توليد المفاتيح قد تبطل ارتباطاتها القائمة.

**القيد:** راجع الاستقرار والترحيل قبل أي إعادة بناء.

Source: `content/fabric/notes.json#/3/chapters/12`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack scd, then section Warehouse SCD2 demonstration: table structure

**مقتطف الدليل:** regenerating keys from today's data can invalidate them.

Evidence pointer: `/3/chapters/12/caveat`

## hansa-bank-088 — نهاية الصلاحية تحتاج اتفاقًا

fabric / model · draft

**الموقف:** هل تخلط NULL وتاريخًا بعيدًا للنهاية دون تحديد شروط الفلترة؟

**الخلاصة:** تمثيل النهاية اختيار نمذجة؛ حافظ على اتساقه مع حدود الفترة وعلامات current.

**القيد:** اكتب التمثيل صراحة قبل صياغة المرشح الزمني.

Source: `content/fabric/notes.json#/3/chapters/12`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack scd, then section Warehouse SCD2 demonstration: table structure

**مقتطف الدليل:** A far-future end or a null end is a modeling choice.

Evidence pointer: `/3/chapters/12/points/1`

## hansa-bank-089 — الاحتفاظ غير Hot cache

fabric / streaming · draft

**الموقف:** إذا صغرت نافذة hot cache، هل اختفت تلقائيًا كل البيانات الأقدم المحتفظ بها؟

**الخلاصة:** سياسة الاحتفاظ تحدد مدة بقاء البيانات، بينما hot cache يركز التخزين الساخن على نافذة حديثة.

**القيد:** استعلام hotcache-only قد يغفل بيانات باردة ما زالت محتفظًا بها.

Source: `content/fabric/notes.json#/4/chapters/5`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack eventhouse, then section Retention versus hot cache

**مقتطف الدليل:** A hotcache-only query can omit retained cold data.

Evidence pointer: `/4/chapters/5/caveat`

## hansa-bank-090 — الدالة المحفوظة ليست Cache للنتائج

fabric / streaming · draft

**الموقف:** هل تخزين function يعني أن نتيجتها محسوبة مسبقًا؟

**الخلاصة:** الدالة تحفظ منطق استعلام قابلًا لإعادة الاستخدام، وليست cache لنتيجة محسوبة تلقائيًا.

**القيد:** افصل إعادة استخدام الكود عن materialization للنتائج.

Source: `content/fabric/notes.json#/4/chapters/4`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack eventhouse, then section Querysets, tables, functions, and shortcuts

**مقتطف الدليل:** A saved function is not a precomputed result cache.

Evidence pointer: `/4/chapters/4/caveat`

## hansa-bank-091 — الجزء Materialized وحده له عقد حداثة مختلف

fabric / streaming · draft

**الموقف:** هل نتيجة الجزء المحسوب مسبقًا تحتوي كل أحدث الصفوف بالضرورة؟

**الخلاصة:** الاستعلام الكامل عن view يضم الجزء materialized مع صفوف مصدر مؤهلة لم تُحسب بعد؛ الوصول للجزء المحسوب وحده يختلف.

**القيد:** راجع مسار الوصول وقواعد الاستعلام قبل ادعاء الحداثة.

Source: `content/fabric/notes.json#/4/chapters/6`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack eventhouse, then section Materialized aggregation and the unprocessed delta

**مقتطف الدليل:** The full view query combines its materialized portion with applicable source rows not yet materialized

Evidence pointer: `/4/chapters/6/points/1`

## hansa-bank-092 — وقت الإدخال غير وقت الحدث في Backfill

fabric / streaming · draft

**الموقف:** هل effectiveDateTime يرشح عمود EventTime الذي تستخدمه في التجميع؟

**الخلاصة:** وفق الملاحظة المحلية، يرشح وقت الإدخال لأغراض backfill، لا timestamp الحدث المختار للتجميع.

**القيد:** إذا كان العمل يتطلب قيد وقت الحدث فأضفه صراحة؛ عقد المنتج يحتاج مراجعة قبل النشر.

Source: `content/fabric/notes.json#/4/chapters/7`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack eventhouse, then section Backfill and the meaning of effectiveDateTime

**مقتطف الدليل:** effectiveDateTime filters ingestion time for backfill

Evidence pointer: `/4/chapters/7/caveat`

## hansa-bank-093 — العنوان ليس تصريح وصول

fabric / security · draft

**الموقف:** معك URI لاستعلام أو إدخال؛ هل يمنحك ذلك الإذن؟

**الخلاصة:** URI يحدد endpoint، ولا يمثل تصريحًا بالوصول.

**القيد:** راجع الهوية والصلاحيات المطلوبة بصورة مستقلة.

Source: `content/fabric/notes.json#/4/chapters/11`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack eventhouse, then section Eventhouse overview, resources, and endpoints

**مقتطف الدليل:** A URI is an access endpoint, not permission.

Evidence pointer: `/4/chapters/11/caveat`

## hansa-bank-094 — Left merge يحفظ الجانب الأيسر

python / overview · draft

**الموقف:** ما الصفوف التي تريد الحفاظ عليها عند ضم العملاء إلى الطلبات؟

**الخلاصة:** في المثال، left merge يحتفظ بكل صفوف orders ويضيف المطابقات من customers.

**القيد:** تحقق من تعدد المطابقات؛ حفظ الصفوف لا يعني ضمان العدد نفسه بعد الربط.

Source: `content/exams/python.json#/questions/1`

Lesson route: `/lab/python/?question=py-02`

**مقتطف الدليل:** A left merge keeps every row from the left frame (orders)

Evidence pointer: `/questions/1/explanation`

## hansa-bank-095 — الفقد له عدد ونسبة

python / overview · draft

**الموقف:** كيف تفرق بين عدد القيم المفقودة وحصتها في العمود؟

**الخلاصة:** isna().sum() يعد القيم المفقودة، وisnull().mean() يحسب حصتها، بينما info يعرض الأعداد غير المفقودة والأنواع.

**القيد:** اختر المقياس المناسب للمقارنة بين أعمدة أو بيانات بأحجام مختلفة.

Source: `content/exams/python.json#/questions/2`

Lesson route: `/lab/python/?question=py-03`

**مقتطف الدليل:** isnull().mean() gives the null share

Evidence pointer: `/questions/2/explanation`

## hansa-bank-096 — drop_duplicates لا تعدّل الأصل افتراضيًا

python / overview · draft

**الموقف:** شغلت drop_duplicates ولم يتغير df؛ ما الافتراض الذي تراجعه؟

**الخلاصة:** تعيد الدالة DataFrame جديدة افتراضيًا؛ تحتاج إسناد النتيجة أو إعداد inplace المناسب لتحديث المقصود.

**القيد:** حدد قاعدة التكرار قبل إسقاط الصفوف.

Source: `content/exams/python.json#/questions/5`

Lesson route: `/lab/python/?question=py-06`

**مقتطف الدليل:** drop_duplicates returns a new dataframe

Evidence pointer: `/questions/5/explanation`

## hansa-bank-097 — pivot_table تبدأ بالمتوسط

python / overview · draft

**الموقف:** أنشأت جدولًا محوريًا وتوقعت sum؛ ما الإعداد الذي تفحصه؟

**الخلاصة:** التجميع الافتراضي في مثال Pandas هو mean؛ عيّن aggfunc إذا أردت دالة أخرى.

**القيد:** راجع نوع القيم ومستوى التجميع المطلوب.

Source: `content/exams/python.json#/questions/9`

Lesson route: `/lab/python/?question=py-10`

**مقتطف الدليل:** pivot_table aggregates with mean by default

Evidence pointer: `/questions/9/explanation`

## hansa-bank-098 — XLOOKUP لا تقيد الإرجاع باليمين

excel / overview · draft

**الموقف:** تحتاج إرجاع قيمة تقع يسار عمود البحث؛ ما الميزة المذكورة؟

**الخلاصة:** XLOOKUP تتجاوز قيد البحث لليسار في VLOOKUP وتتيح تحديد نتيجة عند غياب المطابقة.

**القيد:** راجع توفر الدالة وإعدادات المطابقة في ملفك.

Source: `content/exams/excel.json#/questions/0`

Lesson route: `/lab/excel/?question=xl-01`

**مقتطف الدليل:** XLOOKUP removes VLOOKUP's left-lookup limitation

Evidence pointer: `/questions/0/explanation`

## hansa-bank-099 — التنظيف المتكرر يستفيد من خطوات محفوظة

excel / overview · draft

**الموقف:** تنظف CSV بالطريقة نفسها كل أسبوع؛ ما فائدة Power Query هنا؟

**الخلاصة:** تحفظ خطوات التحويل لإعادة تطبيقها عند التحديث بدل إعادة التنظيف يدويًا.

**القيد:** تغير بنية المصدر قد يتطلب تعديل الخطوات.

Source: `content/exams/excel.json#/questions/3`

Lesson route: `/lab/excel/?question=xl-04`

**مقتطف الدليل:** Power Query stores the transformation steps

Evidence pointer: `/questions/3/explanation`

## hansa-bank-100 — SUMIFS لعدة شروط

excel / overview · draft

**الموقف:** تحتاج مجموعًا يحقق شرطين؛ ما الفرق عن SUMIF؟

**الخلاصة:** SUMIF تتعامل مع شرط واحد، وSUMIFS تدعم معايير متعددة عبر النطاقات.

**القيد:** راجع تطابق النطاقات ومعنى الشروط.

Source: `content/exams/excel.json#/questions/4`

Lesson route: `/lab/excel/?question=xl-05`

**مقتطف الدليل:** SUMIFS handles multiple criteria across ranges.

Evidence pointer: `/questions/4/explanation`

## hansa-bank-101 — IFERROR تختار بديل الخطأ

excel / overview · draft

**الموقف:** في IFERROR(A1/B1, 0)، ماذا تعني النتيجة صفر عند خطأ القسمة؟

**الخلاصة:** الصفر هنا هو البديل المحدد للخطأ، وليس بالضرورة نتيجة قسمة صحيحة.

**القيد:** لا تخلط معالجة الخطأ بإثبات أن القيمة الأصلية تساوي صفرًا.

Source: `content/exams/excel.json#/questions/7`

Lesson route: `/lab/excel/?question=xl-08`

**مقتطف الدليل:** IFERROR returns its second argument when the first produces an error

Evidence pointer: `/questions/7/explanation`

## hansa-bank-102 — موضع التحويل يميز ETL وELT

analysis / overview · draft

**الموقف:** هل التحويل يحدث قبل التحميل أم بعده في المثال؟

**الخلاصة:** ELT يحوّل بعد التحميل إلى المستودع، بينما ETL يحوّل قبل التحميل في الوصف المحلي.

**القيد:** سمِّ الترتيب الفعلي في نظامك بدل الاستدلال من اسم الأداة.

Source: `content/exams/fundamentals.json#/questions/4`

Lesson route: `/lab/fundamentals/?question=fun-05`

**مقتطف الدليل:** ELT loads raw data first

Evidence pointer: `/questions/4/explanation`

## hansa-bank-103 — احسب حجم شبكة المؤشرات

analysis / overview · draft

**الموقف:** لديك 24 موقعًا و24 شهرًا و4 مؤشرات؛ كم قيمة في شبكة كاملة؟

**الخلاصة:** عدد التركيبات 24 × 24 × 4 = 2304 قيم site-month-KPI في المثال.

**القيد:** هذا حجم الشبكة الكاملة، وليس إثبات وجود كل قيمة فعليًا.

Source: `content/exams/fundamentals.json#/questions/8`

Lesson route: `/lab/fundamentals/?question=fun-09`

**مقتطف الدليل:** 24 sites × 24 months × 4 KPIs = 2,304 values.

Evidence pointer: `/questions/8/explanation`

## hansa-bank-104 — اتساق تعريف المؤشر بين الصفحات

analysis / overview · draft

**الموقف:** هل مقارنة صفحتين عادلة إذا اختلفت تعريفات المؤشرات ومرشحاتها؟

**الخلاصة:** يوصي المصدر باتساق المرشحات والتعريفات بين صفحات dashboard مع وضوح الوحدات والحدود.

**القيد:** أظهر الاختلافات المقصودة بدل إخفائها داخل الحسابات.

Source: `content/exams/fundamentals.json#/questions/7`

Lesson route: `/lab/fundamentals/?question=fun-08`

**مقتطف الدليل:** Consistent filters and definitions across pages

Evidence pointer: `/questions/7/options/3`

## hansa-bank-105 — DIVIDE تعطي عقدًا للمقام الصفري

power-bi / model · draft

**الموقف:** ما النتيجة المقصودة عندما يكون مقام المقياس صفرًا؟

**الخلاصة:** في شرح السؤال، DIVIDE تعيد BLANK أو البديل المحدد عند المقام الصفري.

**القيد:** اختر البديل وفق معنى المؤشر؛ الفراغ والصفر ليسا معنى واحدًا.

Source: `content/exams/power-bi.json#/questions/3`

Lesson route: `/lab/power-bi/?question=pbi-04`

**مقتطف الدليل:** DIVIDE returns BLANK (or an alternate result) when the denominator is zero

Evidence pointer: `/questions/3/explanation`

## hansa-bank-106 — دالة التجميع ليست Time intelligence

power-bi / model · draft

**الموقف:** هل كل دالة DAX تعيد جدولًا أو تجمع بيانات تُعد زمنية؟

**الخلاصة:** يميز السؤال TOTALYTD وSAMEPERIODLASTYEAR وDATEADD عن SUMMARIZE التي تنشئ جدولًا مجمعًا.

**القيد:** اختيار الدالة يحتاج نموذج تواريخ وسياقًا مناسبين.

Source: `content/exams/power-bi.json#/questions/4`

Lesson route: `/lab/power-bi/?question=pbi-05`

**مقتطف الدليل:** SUMMARIZE creates a grouped table and is not time intelligence.

Evidence pointer: `/questions/4/explanation`

## hansa-bank-107 — التصفية في الاتجاهين ليست افتراضًا عامًا

power-bi / model · draft

**الموقف:** هل تجعل كل علاقة bidirectional تلقائيًا؟

**الخلاصة:** قد تنشئ التصفية ثنائية الاتجاه مسارات ملتبسة ونتائج غير متوقعة؛ يوصي السؤال بالاتجاه الواحد أساسًا.

**القيد:** استخدم الاستثناء عندما تتطلبه بنية النموذج مع اختبار أثره.

Source: `content/exams/power-bi.json#/questions/9`

Lesson route: `/lab/power-bi/?question=pbi-10`

**مقتطف الدليل:** Bidirectional filters can create ambiguous paths and unpredictable results.

Evidence pointer: `/questions/9/explanation`

## hansa-bank-108 — ضع الصفات الوصفية في سياقها

power-bi / model · draft

**الموقف:** في مثال star schema، أين تنتمي صفات مثل اسم العميل والمنطقة؟

**الخلاصة:** يميز السؤال الأبعاد التي تحمل الصفات الوصفية عن الحقائق التي تحمل الأحداث القابلة للقياس والمفاتيح المرتبطة بها.

**القيد:** هذا توصيف النموذج المعتاد في السؤال؛ راجع grain والمتطلبات قبل بناء الجداول.

Source: `content/exams/power-bi.json#/questions/5`

Lesson route: `/lab/power-bi/?question=pbi-06`

**مقتطف الدليل:** Descriptive attributes live in dimensions.

Evidence pointer: `/questions/5/explanation`

## hansa-bank-109 — متغير ثالث لا يفرض رسمًا ثلاثي الأبعاد

visualization / relationships · draft

**الموقف:** وصل عدد المتغيرات إلى ثلاثة؛ هل تقفز إلى 3D؟

**الخلاصة:** قد يضيف عرض مجسم على شاشة ثنائية الأبعاد منظورًا وحجبًا دون تحسين المقارنة.

**القيد:** اختر الترميز بحسب المهمة، لا عدد الأبعاد وحده.

Source: `content/data-viz/pages.json#/1`

Lesson route: `/learn/advanced-multivariate/`

**مقتطف الدليل:** perspective and occlusion problems

Evidence pointer: `/1/blocks/2/inline/2/text`

## hansa-bank-110 — الموضع أدق من المساحة في المقارنة

visualization / relationships · draft

**الموقف:** تحتاج مقارنة دقيقة؛ هل تعتمد على حجم الفقاعة أو شفافيتها؟

**الخلاصة:** يحكم البشر عادة على الموضع بدقة أعلى من المساحة أو الشفافية؛ استخدمهما كترميزين ثانويين عند الحاجة.

**القيد:** لا تتوقع قراءة قيم دقيقة من ترميز إضافي ضعيف.

Source: `content/data-viz/pages.json#/1`

Lesson route: `/learn/advanced-multivariate/`

**مقتطف الدليل:** Humans generally judge position more accurately than area or opacity.

Evidence pointer: `/1/blocks/19/inline/0/text`

## hansa-bank-111 — Faceting تفصل المجموعات بصريًا

visualization / relationships · draft

**الموقف:** متغيرك الثالث فئوي؛ كيف تفحصه دون تراكب كل النقاط؟

**الخلاصة:** تقسم faceting البيانات إلى لوحات لفئات فرعية، فتتيح مقارنة أنماطها.

**القيد:** راجع اتساق المقاييس بين اللوحات.

Source: `content/data-viz/pages.json#/1`

Lesson route: `/learn/advanced-multivariate/`

**مقتطف الدليل:** Faceting creates separate panels for subsets of the data.

Evidence pointer: `/1/blocks/21/inline/0/text`

## hansa-bank-112 — عدد اللوحات له تكلفة قراءة

visualization / relationships · draft

**الموقف:** هل زيادة اللوحات الصغيرة تحسن الفهم بلا حدود؟

**الخلاصة:** قد تزيد دقة المقارنة، لكنها تزيد حركة العين والحمل المعرفي أيضًا.

**القيد:** وازن دقة العرض مع تكلفة مسحه بصريًا.

Source: `content/data-viz/pages.json#/1`

Lesson route: `/learn/advanced-multivariate/`

**مقتطف الدليل:** More/smaller panels can increase precision but also increase eye movement and cognitive load.

Evidence pointer: `/1/blocks/24/inline/0/text`

## hansa-bank-113 — Heatmap أداة فرز أولي

visualization / relationships · draft

**الموقف:** لديك عشرات المقاييس؛ ما دور خريطة الارتباط؟

**الخلاصة:** تساعد في فرز العلاقات القوية المرشحة للفحص، بدل رسم كل زوج فورًا.

**القيد:** خريطة Pearson لا تستبدل فحص العلاقات غير الخطية في scatter plots.

Source: `content/data-viz/pages.json#/1`

Lesson route: `/learn/advanced-multivariate/`

**مقتطف الدليل:** find strongly related variables among tens of metrics.

Evidence pointer: `/1/blocks/42/inline/2/text`

## hansa-bank-114 — كل خط في Parallel Coordinates مشاهدة

visualization / relationships · draft

**الموقف:** ماذا تمثل الخطوط التي تعبر محاور عدة؟

**الخلاصة:** يمثل كل خط مشاهدة تمر بمحور رأسي لكل متغير، مما يسمح بفحص الملفات والأنماط متعددة المتغيرات.

**القيد:** انتبه إلى مقياس كل محور.

Source: `content/data-viz/pages.json#/1`

Lesson route: `/learn/advanced-multivariate/`

**مقتطف الدليل:** Each observation becomes a line crossing one vertical axis per variable.

Evidence pointer: `/1/blocks/49/inline/0/text`

## hansa-bank-115 — تقاطع الخطوط قد يخفي الملفات

visualization / relationships · draft

**الموقف:** أصبحت Parallel Coordinates شديدة التشابك؛ ما الذي تجرب؟

**الخلاصة:** قد يساعد التجميع أو الترشيح أو الشفافية أو ترتيب المتغيرات أو إبراز مشاهدات محددة.

**القيد:** اختيار الحل يتبع المجموعة التي تريد فهمها، لا مجرد تقليل عدد الخطوط.

Source: `content/data-viz/pages.json#/1`

Lesson route: `/learn/advanced-multivariate/`

**مقتطف الدليل:** line crossings create a visual "spaghetti" effect.

Evidence pointer: `/1/blocks/58/inline/0/text`

## hansa-bank-116 — منتصف الليل يكشف فائدة العرض الدائري

visualization / relationships · draft

**الموقف:** النشاط قبل منتصف الليل وبعده يبدو منفصلًا على طرفي الرسم؛ لماذا؟

**الخلاصة:** في ظاهرة دورية، بداية اليوم ونهايته متجاورتان، وقد يوضح التمثيل القطبي دفعة النشاط عبر منتصف الليل.

**القيد:** استخدم الدائرة عندما تعكس دورية حقيقية، لا كزخرفة.

Source: `content/data-viz/pages.json#/1`

Lesson route: `/learn/advanced-multivariate/`

**مقتطف الدليل:** A polar representation joins the cycle

Evidence pointer: `/1/blocks/72/inline/0/text`

## hansa-bank-117 — طول العمود يحتاج خط أساس أمين

visualization / accessibility · draft

**الموقف:** فرق صغير يبدو هائلًا في أعمدة؛ ماذا تفحص أولًا؟

**الخلاصة:** قطع خط الأساس قد يضخم الفرق عندما يمثل طول العمود مقدار القيمة.

**القيد:** هذه قاعدة لترميز الطول، وليست منعًا عامًا لكل محور غير صفري في كل رسم.

Source: `content/data-viz/pages.json#/24`

Lesson route: `/learn/visual-integrity/`

**مقتطف الدليل:** A truncated baseline can exaggerate small differences.

Evidence pointer: `/24/blocks/26/inline/0/text`

## hansa-bank-118 — المحوران قد يصنعان علاقة ظاهرية

visualization / accessibility · draft

**الموقف:** هل تقارب خطين بوحدتين مختلفتين دليل ارتباط قوي؟

**الخلاصة:** تغيير نطاق أي من المحورين قد يغير العلاقة البصرية الظاهرة؛ لوحات منفصلة بمحاور واضحة تقلل الالتباس.

**القيد:** الحركة المتشابهة في الرسم لا تثبت علاقة سببية.

Source: `content/data-viz/pages.json#/24`

Lesson route: `/learn/visual-integrity/`

**مقتطف الدليل:** changing either scale can change the apparent visual relationship

Evidence pointer: `/24/blocks/33/inline/0/text`

## hansa-bank-119 — التبسيط لا يعني حذف التفسير

visualization / accessibility · draft

**الموقف:** هل تحذف labels والمحاور لتحقيق تصميم قليل الحبر؟

**الخلاصة:** احتفظ بكل ما يلزم لفهم البيانات؛ قد تقلل التسميات والمحاور والتعليقات الغموض.

**القيد:** المعيار فهم المعنى، وليس أقل عدد من العناصر.

Source: `content/data-viz/pages.json#/24`

Lesson route: `/learn/visual-integrity/`

**مقتطف الدليل:** The objective is not minimum ink

Evidence pointer: `/24/blocks/64/inline/0/text`

## hansa-bank-120 — الفئات الكثيرة قد تحتاج مهمة أخرى

visualization / accessibility · draft

**الموقف:** امتلأ الرسم بألوان وأسماء غير مقروءة؛ ما البدائل؟

**الخلاصة:** قد يكون التجميع أو الترشيح أو الترتيب أو إعادة التصميم أنسب بحسب السؤال.

**القيد:** لا تخفِ فئات مهمة دون بيان ما تم تجميعه.

Source: `content/data-viz/pages.json#/24`

Lesson route: `/learn/visual-integrity/`

**مقتطف الدليل:** Aggregate, filter, rank, or redesign when appropriate.

Evidence pointer: `/24/blocks/16/inline/0/text`

## hansa-bank-121 — الزخرفة تقاس بأثرها على التفسير

visualization / accessibility · draft

**الموقف:** متى يصبح العنصر البصري chartjunk؟

**الخلاصة:** عندما يصعّب التفسير دون إضافة معلومات ذات معنى.

**القيد:** ليس كل عنصر تجميلي خطأ؛ افحص وظيفته الفعلية.

Source: `content/data-viz/pages.json#/24`

Lesson route: `/learn/visual-integrity/`

**مقتطف الدليل:** visual elements that make interpretation harder without adding meaningful information

Evidence pointer: `/24/blocks/44/inline/1/text`

## hansa-bank-122 — فرق النسب له وحدة

visualization / accessibility · draft

**الموقف:** في مثال 22.5% و21%، كم الفرق المباشر؟

**الخلاصة:** الفرق 1.5 نقطة مئوية، فلا تدع المقياس المرسوم يوحي بفارق أضخم.

**القيد:** النقاط المئوية تختلف عن نسبة التغير النسبي.

Source: `content/data-viz/pages.json#/24`

Lesson route: `/learn/visual-integrity/`

**مقتطف الدليل:** a difference of only 1.5 percentage points

Evidence pointer: `/24/blocks/28/inline/0/text`

## hansa-bank-123 — الأنماط المتزاحمة قد تصعب التمييز

visualization / accessibility · draft

**الموقف:** هل إضافة خطوط وتهشير لكل فئة تحل دائمًا مشكلة التمييز؟

**الخلاصة:** قد يصعب تمييز الأنماط مع كثرة الفئات؛ يوصي المصدر بالتسميات المباشرة ولوحة مقيدة عندما يلائمان المهمة.

**القيد:** اختر بديلًا مفهومًا للون دون خلق ازدحام جديد.

Source: `content/data-viz/pages.json#/24`

Lesson route: `/learn/visual-integrity/`

**مقتطف الدليل:** Patterns such as stripes and cross-hatching can be difficult to distinguish

Evidence pointer: `/24/blocks/60/inline/0/text`

## hansa-bank-124 — الاتجاه المجمع قد ينعكس داخل المجموعات

visualization / overview · draft

**الموقف:** القصة العامة واضحة؛ لماذا تفحص القطاعات أيضًا؟

**الخلاصة:** قد تختفي العلاقة المجمعة أو تنعكس بعد التقسيم بسبب اختلاف تركيب المجموعات.

**القيد:** افحص مزيج المجموعات قبل تعميم قصة عن الإجمالي.

Source: `content/data-viz/pages.json#/22`

Lesson route: `/learn/statistical-traps/`

**مقتطف الدليل:** العلاقة المجمعة قد تختفي أو تنعكس بعد segmentation

Evidence pointer: `/22/blocks/5/inline/0/text`

## hansa-bank-125 — مستوى التجميع يتبع مستوى القرار

visualization / overview · draft

**الموقف:** هل متوسط شهري يكفي لقرار يخص تقلبًا يوميًا؟

**الخلاصة:** قد يخفي المتوسط الشهري التذبذب اليومي؛ يجب أن يتوافق مستوى التجميع مع القرار.

**القيد:** لا تجعل سهولة التلخيص سببًا لإخفاء التغير المهم.

Source: `content/data-viz/pages.json#/22`

Lesson route: `/learn/statistical-traps/`

**مقتطف الدليل:** متوسط شهري قد يخفي التذبذب اليومي.

Evidence pointer: `/22/blocks/8/inline/0/text`

## hansa-bank-126 — علاقة المجموعات لا تصف كل فرد

visualization / overview · draft

**الموقف:** وجدت ارتباطًا بين متوسطات مناطق؛ هل ينطبق على أفرادها؟

**الخلاصة:** العلاقة على مستوى المجموعات ليست بالضرورة صحيحة على مستوى الأفراد.

**القيد:** تجنب الاستنتاج الفردي من ملخص تجميعي بلا دليل.

Source: `content/data-viz/pages.json#/22`

Lesson route: `/learn/statistical-traps/`

**مقتطف الدليل:** العلاقة على مستوى المجموعات ليست بالضرورة صحيحة على مستوى الأفراد.

Evidence pointer: `/22/blocks/10/inline/0/text`

## hansa-bank-127 — رسم نظيف لعينة منحازة يظل منحازًا

visualization / overview · draft

**الموقف:** هل جودة التصميم تكفي إذا كانت البيانات غير ممثلة؟

**الخلاصة:** قد يكون الرسم واضحًا بصريًا لكنه منحاز بسبب اختيار العينة أو ارتباط الفقد بالنتيجة.

**القيد:** راجع من دخل البيانات ومن غاب عنها.

Source: `content/data-viz/pages.json#/22`

Lesson route: `/learn/statistical-traps/`

**مقتطف الدليل:** العينة غير ممثلة أو missingness مرتبطة بالنتيجة.

Evidence pointer: `/22/blocks/12/inline/0/text`

## hansa-bank-128 — كثرة الاستكشاف تزيد فرص الأنماط العرضية

visualization / overview · draft

**الموقف:** بحثت في قطاعات كثيرة ووجدت نمطًا مثيرًا؛ ما الخطوة التالية؟

**الخلاصة:** كلما زاد الفحص زادت فرصة ظهور أنماط شاذة بالصدفة؛ تعامل معها كفرضيات تحتاج تحققًا.

**القيد:** لا تحول نتيجة استكشافية واحدة إلى حقيقة مؤكدة.

Source: `content/data-viz/pages.json#/22`

Lesson route: `/learn/statistical-traps/`

**مقتطف الدليل:** زادت فرصة ظهور patterns شاذة بالصدفة.

Evidence pointer: `/22/blocks/14/inline/0/text`

## hansa-bank-129 — اعرض عدم اليقين مع التقدير

visualization / overview · draft

**الموقف:** هل يكفي عرض رقم تقديري واحد شديد الدقة؟

**الخلاصة:** يمكن استخدام فترات أو أشرطة خطأ أو نطاقات أو توزيعات تقديرات لتوضيح عدم اليقين.

**القيد:** اختر تمثيلًا صحيحًا لما تم حسابه، لا نطاقًا زخرفيًا.

Source: `content/data-viz/pages.json#/22`

Lesson route: `/learn/statistical-traps/`

**مقتطف الدليل:** بدل تقديم الرقم كحقيقة دقيقة.

Evidence pointer: `/22/blocks/18/inline/0/text`

## hansa-bank-130 — ارتفاع التحويل لا يشرح السبب وحده

visualization / overview · draft

**الموقف:** زاد conversion rate؛ هل تحسن الأداء بالضرورة؟

**الخلاصة:** راجع المقام ومزيج الجمهور والموسمية ومصدر الزيارات وعدم اليقين والقيمة العملية للزيادة.

**القيد:** النسبة وحدها لا تعزل سبب التحسن.

Source: `content/data-viz/pages.json#/22`

Lesson route: `/learn/statistical-traps/`

**مقتطف الدليل:** افحص denominator، mix، seasonality، uncertainty، traffic source

Evidence pointer: `/22/blocks/23/inline/0/text`

## hansa-bank-131 — الصناديق المتشابهة قد تخفي قممًا مختلفة

visualization / distribution · draft

**الموقف:** هل تشابه Box Plots يثبت تشابه التوزيعين؟

**الخلاصة:** قد تخفي الصناديق توزيعات متعددة القمم ومختلفة، لأنها ملخص مضغوط.

**القيد:** أضف عرضًا يكشف الشكل عندما تكون القمم مهمة.

Source: `content/data-viz/pages.json#/3`

Lesson route: `/learn/ar/box-plot/`

**مقتطف الدليل:** توزيعاتهما متعددة القمم ومختلفة جدًا.

Evidence pointer: `/3/blocks/21/inline/0/text`

## hansa-bank-132 — العينة الصغيرة تستفيد من النقاط الخام

visualization / distribution · draft

**الموقف:** هل تختصر مشاهدات قليلة إلى صندوق فقط؟

**الخلاصة:** عرض النقاط الخام بجانب Box Plot قد يكون أكثر إفادة مع العينات الصغيرة.

**القيد:** وازن إظهار التفاصيل مع الخصوصية والحاجة التعليمية في التطبيق الفعلي.

Source: `content/data-viz/pages.json#/3`

Lesson route: `/learn/ar/box-plot/`

**مقتطف الدليل:** مع العينات الصغيرة، قد يكون عرض النقاط الخام بجانب الصندوق أكثر إفادة.

Evidence pointer: `/3/blocks/21/inline/0/text`

## hansa-bank-133 — النقطة لا تحتاج عمودًا من الصفر

visualization / comparison · draft

**الموقف:** لماذا قد يلائم Dot Plot مقارنة قيم على محور لوغاريتمي؟

**الخلاصة:** يمثل القيمة بموضع نقطة، فلا يحتاج إلى عمود يبدأ من صفر لا يمكن تمثيله على log.

**القيد:** يجب أن يكون استخدام المقياس اللوغاريتمي مناسبًا لمعنى المقارنة.

Source: `content/data-viz/pages.json#/7`

Lesson route: `/learn/ar/dot-plot/`

**مقتطف الدليل:** يمكن استخدام محور Log.

Evidence pointer: `/7/blocks/5/inline/0/text`

## hansa-bank-134 — الخطوة المتساوية على Log ليست إضافة ثابتة

visualization / comparison · draft

**الموقف:** ما معنى خطوتين متساويتين على محور log أساسه 10؟

**الخلاصة:** كل خطوة متساوية تمثل ضربًا في 10، وليس إضافة مقدار ثابت.

**القيد:** وضح طبيعة المقياس للقارئ.

Source: `content/data-viz/pages.json#/7`

Lesson route: `/learn/ar/dot-plot/`

**مقتطف الدليل:** على مقياس Log أساسه 10، كل خطوة متساوية تمثل ×10.

Evidence pointer: `/7/blocks/12/inline/0/text`

## hansa-bank-135 — النمو النسبي الثابت يختلف عن الزيادة الثابتة

visualization / time · draft

**الموقف:** كمية تزيد بمبلغ ثابت وأخرى بنسبة ثابتة؛ هل تتبعان النمط نفسه؟

**الخلاصة:** الزيادة المطلقة الثابتة قد تنتج مسارًا خطيًا، بينما الزيادة بنسبة أو معامل ثابت قد تنتج نموًا أسيًا.

**القيد:** افحص الفرضية والبيانات بدل الاستدلال من الشكل وحده.

Source: `content/data-viz/pages.json#/9`

Lesson route: `/learn/ar/line-plot/`

**مقتطف الدليل:** النمو الخطي مقابل النمو الأسي

Evidence pointer: `/9/headings/3/text`

## hansa-bank-136 — أجزاء Stacked Bar لا تتساوى في سهولة المقارنة

visualization / composition · draft

**الموقف:** لماذا يصعب مقارنة بعض الأجزاء المكدسة أكثر من الجزء الأول؟

**الخلاصة:** الأجزاء التي لا تشترك في خط أساس تكون مقارنتها أقل دقة.

**القيد:** إذا كان الفرق بين الأجزاء هو السؤال الرئيسي، راجع طريقة العرض.

Source: `content/data-viz/pages.json#/2`

Lesson route: `/learn/ar/bar-plot/`

**مقتطف الدليل:** المقارنة بين أجزاء لا تشترك في نفس خط الأساس تكون أقل دقة.

Evidence pointer: `/2/blocks/17/inline/0/text`

## hansa-bank-137 — الذيل يحدد اتجاه الالتواء

visualization / distribution · draft

**الموقف:** أين تنظر لتقرر هل التوزيع ملتوي لليمين أم اليسار؟

**الخلاصة:** اتجاه الذيل الأطول يشير إلى اتجاه الالتواء.

**القيد:** لا تحدد الاتجاه من موضع القمة وحده.

Source: `content/data-viz/pages.json#/8`

Lesson route: `/learn/ar/histogram/`

**مقتطف الدليل:** الذيل يشير إلى اتجاه الالتواء.

Evidence pointer: `/8/blocks/24/inline/1/text`

## hansa-bank-138 — Kurtosis ليست ارتفاع القمة فقط

visualization / distribution · draft

**الموقف:** هل يكفي النظر إلى قمة حادة للحكم على kurtosis؟

**الخلاصة:** المفهوم مرتبط بسلوك الذيول والقيم المتطرفة والعزوم الإحصائية، ولا يختزل في ارتفاع القمة.

**القيد:** استخدم التعريف والتحليل المناسبين بدل الانطباع الشكلي.

Source: `content/data-viz/pages.json#/8`

Lesson route: `/learn/ar/histogram/`

**مقتطف الدليل:** لا تختزل Kurtosis في "ارتفاع القمة" فقط

Evidence pointer: `/8/blocks/30/inline/1/text`

## hansa-bank-139 — المال يحتاج نوعًا مناسبًا

sql / types-null · draft

**الموقف:** هل تستخدم floating point لمبلغ يتطلب تمثيلًا عشريًا دقيقًا؟

**الخلاصة:** يوجه المرجع إلى numeric أو decimal عندما تكون الدقة العشرية مطلوبة، خصوصًا للمبالغ المالية.

**القيد:** اختيار النوع لا يغني عن تحديد قواعد التقريب المطلوبة.

Source: `content/sql/vault.json#/pages/3`

Lesson route: `/learn/sql/03/`

**مقتطف الدليل:** Floating-point types are approximate and can introduce representation differences.

Evidence pointer: `/pages/3/body`

## hansa-bank-140 — NULLIF يحول حالة خاصة إلى NULL

sql / types-null · draft

**الموقف:** تريد معالجة مقام يساوي صفرًا؛ ماذا يفعل NULLIF(quantity, 0)؟

**الخلاصة:** يعيد NULL عندما يتساوى التعبيران، فيمكن استخدامه في المقام بدل تنفيذ قسمة على صفر.

**القيد:** حدد معنى النتيجة المفقودة بدل تحويلها تلقائيًا إلى صفر.

Source: `content/sql/vault.json#/pages/3`

Lesson route: `/learn/sql/03/`

**مقتطف الدليل:** Returns NULL when two expressions are equal.

Evidence pointer: `/pages/3/body`

## hansa-bank-141 — COALESCE يختار أول قيمة متاحة

sql / types-null · draft

**الموقف:** عند وجود عدة بدائل لقيمة مفقودة، كيف تختار COALESCE؟

**الخلاصة:** تعيد أول تعبير غير NULL بحسب ترتيب الوسائط.

**القيد:** الترتيب يعبر عن أولوية العمل؛ وجود قيمة لا يثبت صحتها.

Source: `content/sql/vault.json#/pages/3`

Lesson route: `/learn/sql/03/`

**مقتطف الدليل:** Returns the first non-NULL expression.

Evidence pointer: `/pages/3/body`

## hansa-bank-142 — المفتاحان المفقودان لا يتطابقان بالمساواة

sql / types-null · draft

**الموقف:** هل NULL في مفتاحي جدولين يصنع تطابقًا في JOIN باستخدام =؟

**الخلاصة:** المساواة العادية لا تجعل NULL مساوية لـNULL، فلا تنشأ المطابقة بهذا الشرط.

**القيد:** إذا كان تطابق المفقود مطلوبًا، استخدم أسلوبًا ملائمًا للهجة ودوّن المقصود.

Source: `content/sql/vault.json#/pages/3`

Lesson route: `/learn/sql/03/`

**مقتطف الدليل:** NULL = NULL</code> is not TRUE.

Evidence pointer: `/pages/3/body`

## hansa-bank-143 — غياب الصفوف ليس إجماليًا صفريًا

sql / types-null · draft

**الموقف:** هل عدم وجود صفوف، أو وجود قيم كلها NULL، أو قيمة صفر، حالات متكافئة؟

**الخلاصة:** المرجع يطلب فصل الحالات الثلاث لأنها قد تحمل معاني عمل مختلفة.

**القيد:** لا تستبدلها جميعًا بصفر لمجرد توحيد شكل التقرير.

Source: `content/sql/vault.json#/pages/3`

Lesson route: `/learn/sql/03/`

**مقتطف الدليل:** Always distinguish <b>no rows</b>, <b>all NULL</b>, and <b>zero</b> as business states.

Evidence pointer: `/pages/3/body`

## hansa-bank-144 — الأقواس توضح منطق الشروط

sql / filtering · draft

**الموقف:** تجمع شرط دولة مع بديلين للحالة؛ كيف تمنع التباس AND وOR؟

**الخلاصة:** اكتب الأقواس حول البدائل التي تمثل وحدة منطقية، بدل الاعتماد على تذكر أولوية العمليات.

**القيد:** تحقق أن التجميع يعكس تعريف المجتمع المطلوب.

Source: `content/sql/vault.json#/pages/4`

Lesson route: `/learn/sql/04/`

**مقتطف الدليل:** Use parentheses whenever business logic could be ambiguous.

Evidence pointer: `/pages/4/body`

## hansa-bank-145 — CASE البسيطة أم الشرطية؟

sql / filtering · draft

**الموقف:** هل تقارن تعبيرًا واحدًا بقيم، أم تختبر شروطًا مستقلة؟

**الخلاصة:** Simple CASE تقارن تعبيرًا بقيم؛ Searched CASE تختبر شروطًا مستقلة.

**القيد:** اختر الشكل الذي يوضح قاعدة التصنيف.

Source: `content/sql/vault.json#/pages/4`

Lesson route: `/learn/sql/04/`

**مقتطف الدليل:** Simple CASE compares one expression against values.

Evidence pointer: `/pages/4/body`

## hansa-bank-146 — CASE بلا ELSE لها نتيجة

sql / filtering · draft

**الموقف:** لا يطابق الصف أي WHEN ولم تكتب ELSE؛ ماذا تتوقع؟

**الخلاصة:** تعيد CASE قيمة NULL في هذه الحالة، بدل قيمة افتراضية مخفية.

**القيد:** عالج الحالات غير المصنفة عمدًا إن كان العمل يتطلب ذلك.

Source: `content/sql/vault.json#/pages/4`

Lesson route: `/learn/sql/04/`

**مقتطف الدليل:** returns NULL if no ELSE is supplied.

Evidence pointer: `/pages/4/body`

## hansa-bank-147 — شرط اليمين قد يلغي أثر LEFT JOIN

sql / filtering · draft

**الموقف:** وضعت شرطًا على الجدول الأيمن في WHERE؛ لماذا اختفت الصفوف غير المطابقة؟

**الخلاصة:** الشرط قد يستبعد الصفوف الممتدة بـNULL؛ وضع شرط المطابقة في ON يساعد على حفظ الصفوف اليسرى غير المطابقة عندما يكون هذا هو المقصود.

**القيد:** ليس نقل أي شرط بين ON وWHERE تحويلًا محايدًا.

Source: `content/sql/vault.json#/pages/4`

Lesson route: `/learn/sql/04/`

**مقتطف الدليل:** putting a right-table condition in <code>WHERE</code> can remove NULL-extended rows.

Evidence pointer: `/pages/4/body`

## hansa-bank-148 — التصنيف يحتاج أولوية معلنة

sql / filtering · draft

**الموقف:** عميل يطابق أكثر من وصف تجاري؛ ما الذي يجب توثيقه؟

**الخلاصة:** حدد مجتمع التصنيف وقاعدة الأولوية بين الحالات، بدل ترك التداخل غير محسوم.

**القيد:** اختبر الحالات المتداخلة وحدود الشروط.

Source: `content/sql/vault.json#/pages/4`

Lesson route: `/learn/sql/04/`

**مقتطف الدليل:** Each classification should have an explicit population and precedence rule.

Evidence pointer: `/pages/4/body`

## hansa-bank-149 — FULL OUTER JOIN للمصالحة

sql / joins · draft

**الموقف:** تريد رؤية السجلات غير المطابقة في كلا المصدرين؛ أي سلوك تحتاج؟

**الخلاصة:** FULL OUTER JOIN يحفظ الصفوف غير المطابقة من الجانبين، مما يفيد المقارنة والمصالحة.

**القيد:** راجع مفاتيح المطابقة قبل تفسير كل اختلاف كفقد بيانات.

Source: `content/sql/vault.json#/pages/5`

Lesson route: `/learn/sql/05/`

**مقتطف الدليل:** preserves unmatched rows from both sides

Evidence pointer: `/pages/5/body`

## hansa-bank-150 — المفتاح المركب لا يحتمل نصف شرط

sql / joins · draft

**الموقف:** العلاقة تعتمد على الطالب والفصل؛ ماذا يحدث عند الربط بالطالب فقط؟

**الخلاصة:** حذف جزء من شرط العلاقة المركبة قد ينتج مطابقات زائفة عبر الفصول.

**القيد:** اكتب الشرط وفق هوية العلاقة الفعلية.

Source: `content/sql/vault.json#/pages/5`

Lesson route: `/learn/sql/05/`

**مقتطف الدليل:** Joining on only one component can create false matches.

Evidence pointer: `/pages/5/body`

## hansa-bank-151 — جدول واحد ودوران في Self JOIN

sql / joins · draft

**الموقف:** كيف تعرض اسم الموظف واسم مديره من جدول الموظفين نفسه؟

**الخلاصة:** يمكن ربط الجدول بنفسه باستخدام أسماء مستعارة تميز دور الموظف عن دور المدير.

**القيد:** حدد العلاقة واتجاهها؛ وجود الجدول مرة واحدة في المصدر لا يمنع تعدد أدواره.

Source: `content/sql/vault.json#/pages/5`

Lesson route: `/learn/sql/05/`

**مقتطف الدليل:** A table can be joined to itself.

Evidence pointer: `/pages/5/body`

## hansa-bank-152 — التجميع قبل ربط جدولين تفصيليين

sql / joins · draft

**الموقف:** تريد إجمالي طلبات ومدفوعات لكل عميل من جدولين متعددَي الصفوف؛ كيف تحد من fan-out؟

**الخلاصة:** جمّع كل جانب متعدد إلى مستوى العميل أولًا، ثم اربط الملخصين إذا كان هذا مستوى النتيجة المطلوبة.

**القيد:** لا تستخدم التجميع المسبق إذا كانت النتيجة تحتاج تفاصيل فقدتها.

Source: `content/sql/vault.json#/pages/5`

Lesson route: `/learn/sql/05/`

**مقتطف الدليل:** Aggregate each many-side independently before joining when the business grain requires it.

Evidence pointer: `/pages/5/body`

## hansa-bank-153 — Scalar subquery لها عقد قيمة واحدة

sql / subqueries · draft

**الموقف:** تحتاج آخر تاريخ طلب بجوار كل عميل؛ ما شكل نتيجة الاستعلام الداخلي؟

**الخلاصة:** الـscalar subquery تعيد قيمة واحدة لكل صف خارجي في هذا النمط.

**القيد:** إذا تعقد الحساب أو ارتفعت كلفته، راجع الربط أو التجميع المسبق.

Source: `content/sql/vault.json#/pages/7`

Lesson route: `/learn/sql/07/`

**مقتطف الدليل:** A scalar subquery returns one value per outer row.

Evidence pointer: `/pages/7/body`

## hansa-bank-154 — CTE تنظّم الكود ولا تضمن السرعة

sql / subqueries · draft

**الموقف:** أعدت كتابة الاستعلام باستخدام WITH؛ هل صار أسرع تلقائيًا؟

**الخلاصة:** CTE آلية لتنظيم الاستعلام وتسميه مراحله، ولا تضمن materialization أو تحسن الأداء في كل محرك.

**القيد:** افحص خطة التنفيذ عند تقييم الأداء.

Source: `content/sql/vault.json#/pages/7`

Lesson route: `/learn/sql/07/`

**مقتطف الدليل:** do not assume a CTE automatically materializes or improves performance in every database.

Evidence pointer: `/pages/7/body`

## hansa-bank-155 — التجميع الداخلي يسبق مرشح النتيجة

sql / subqueries · draft

**الموقف:** تحتاج فلترة العملاء حسب مجموع طلباتهم؛ لماذا تستخدم derived table؟

**الخلاصة:** يمكن للتعبير داخل FROM أن يجمع أولًا، ثم يستخدم الاستعلام الخارجي النتيجة للترشيح أو الربط.

**القيد:** راجع مستوى تفصيل النتيجة الوسيطة.

Source: `content/sql/vault.json#/pages/7`

Lesson route: `/learn/sql/07/`

**مقتطف الدليل:** aggregate first, then filter or join

Evidence pointer: `/pages/7/body`

## hansa-bank-156 — سمِّ مراحل السؤال المعقد

sql / subqueries · draft

**الموقف:** أصبح التداخل يخفي هدف كل خطوة؛ كيف تحسن قابلية المراجعة؟

**الخلاصة:** قسّم المنطق إلى مراحل مسماة باستخدام CTE عندما تستحق كل خطوة اسمًا واضحًا.

**القيد:** التسمية تحسن الفهم ولا تثبت صحة النتائج وحدها.

Source: `content/sql/vault.json#/pages/7`

Lesson route: `/learn/sql/07/`

**مقتطف الدليل:** Prefer a CTE or staged transformation when each logical step deserves a name.

Evidence pointer: `/pages/7/body`

## hansa-bank-157 — كسر التعادل يجعل ROW_NUMBER محددًا

sql / windows · draft

**الموقف:** تساوت قيم ORDER BY وتحتاج اختيار صف محدد؛ ما الناقص؟

**الخلاصة:** أضف معيار ترتيب إضافيًا يكسر التعادل بدل افتراض ثبات الصف الذي يحصل على الرقم الأصغر.

**القيد:** اجعل معايير الترتيب كافية لتمييز الصفوف المطلوبة.

Source: `content/sql/vault.json#/pages/46`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810298facf8975c21394/`

**مقتطف الدليل:** أضف عمودًا لكسر التعادل

Evidence pointer: `/pages/46/body`

## hansa-bank-158 — RANK يترك فجوات بعد التعادل

sql / windows · draft

**الموقف:** القيم 100 و90 و90 و80؛ كيف تختلف الرتب الكثيفة؟

**الخلاصة:** RANK يعطي 1،2،2،4، بينما DENSE_RANK يعطي 1،2،2،3 في مثال المصدر.

**القيد:** اختر معنى الرتبة قبل استخدام حد مثل أعلى ثلاث رتب.

Source: `content/sql/vault.json#/pages/46`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810298facf8975c21394/`

**مقتطف الدليل:** القيم المتساوية لها نفس rank، وبعد التعادل يحدث

Evidence pointer: `/pages/46/body`

## hansa-bank-159 — NTILE يقسم الصفوف لا حدود القيم

sql / windows · draft

**الموقف:** هل NTILE(4) يعني أن كل من يتجاوز قيمة ثابتة يدخل الربع الأول؟

**الخلاصة:** يرتب NTILE الصفوف ثم يقسمها إلى مجموعات متقاربة العدد، لا إلى حدود قيم تجارية ثابتة.

**القيد:** قد تختلف أحجام المجموعات عندما لا يقبل العدد القسمة.

Source: `content/sql/vault.json#/pages/46`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810298facf8975c21394/`

**مقتطف الدليل:** approximately equal in size

Evidence pointer: `/pages/46/body`

## hansa-bank-160 — LAG يحترم حدود المجموعة

sql / windows · draft

**الموقف:** أول صف في مجموعة جديدة له صف سابق في الجدول؛ هل LAG تعبر إليه؟

**الخلاصة:** LAG لا تعبر إلى partition أخرى؛ معنى السابق تحدده المجموعة وترتيبها.

**القيد:** تأكد أن partition يمثل الكيان الذي تقارن تاريخه.

Source: `content/sql/vault.json#/pages/47`

Lesson route: `/learn/sql/reference/3cb3906c5d6c8163b26ae203d48a5518/`

**مقتطف الدليل:** لا تعبر إلى partition أخرى.

Evidence pointer: `/pages/47/body`

## hansa-bank-161 — LAST_VALUE تحتاج مراجعة الإطار

sql / windows · draft

**الموقف:** طلبت آخر قيمة فحصلت على قيمة قريبة من الصف الحالي؛ ما الذي تفحصه؟

**الخلاصة:** راجع default frame؛ قد ينتهي عند الصف الحالي بدل نهاية المجموعة، فوسّع الإطار إذا أردت آخر قيمة في المجموعة كاملة.

**القيد:** تختلف التفاصيل حسب المحرك ومعايير الترتيب.

Source: `content/sql/vault.json#/pages/47`

Lesson route: `/learn/sql/reference/3cb3906c5d6c8163b26ae203d48a5518/`

**مقتطف الدليل:** لذلك قد تصبح <code>LAST_VALUE</code> مساوية لقيمة الصف الحالي بدل آخر قيمة في الجدول.

Evidence pointer: `/pages/47/body`

## hansa-bank-162 — رقم الشهر غير بداية الشهر

sql / time · draft

**الموقف:** هل EXTRACT(MONTH) يعطي نفس هوية الفترة التي تعطيها DATE_TRUNC؟

**الخلاصة:** EXTRACT يعيد مكوّنًا مثل 7؛ DATE_TRUNC للشهر يعيد قيمة زمنية تمثل بداية الشهر.

**القيد:** رقم الشهر وحده لا يميز سنة عن أخرى.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** بترجع timestamp يمثل بداية الشهر ده.

Evidence pointer: `/pages/10/body`

## hansa-bank-163 — أضف مدة إلى timestamp بوضوح

sql / time · draft

**الموقف:** تريد إضافة أيام إلى timestamp في PostgreSQL؛ هل تفترض سلوك DATE مع integer؟

**الخلاصة:** المصدر يوصي باستخدام INTERVAL للحساب على timestamp بدل افتراض أن إضافة عدد صحيح تعمل كما في DATE.

**القيد:** صياغة الحساب مرتبطة باللهجة المذكورة.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** إضافة integer لـtimestamp مش زي إضافته لـdate

Evidence pointer: `/pages/10/body`

## hansa-bank-164 — أنشئ تقويمًا بدل انتظار صفوف الأحداث

sql / time · draft

**الموقف:** تحتاج سلسلة أيام في PostgreSQL؛ ما وظيفة GENERATE_SERIES؟

**الخلاصة:** تولّد سلسلة timestamps من بداية إلى نهاية بخطوة زمنية محددة.

**القيد:** توليد يوم لا يعني أن حدثًا وقع فيه؛ تظل بيانات الأحداث منفصلة.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** تقدر تولّد بيها سلسلة من الـtimestamps.

Evidence pointer: `/pages/10/body`

## hansa-bank-165 — بحث الجزء لا يعني تطابق الكلمة

sql / text · draft

**الموقف:** هل LIKE '%apple%' يقتصر على القيمة apple؟

**الخلاصة:** قد يطابق pineapple أيضًا؛ إذا أردت قيمة كاملة فحدد المقارنة بعد التطبيع الملائم.

**القيد:** قواعد التطبيع تعتمد على معنى النص المطلوب.

Source: `content/sql/vault.json#/pages/11`

Lesson route: `/learn/sql/11/`

**مقتطف الدليل:** بتطابق كمان <code>pineapple</code>.

Evidence pointer: `/pages/11/body`

## hansa-bank-166 — LOWER لا ينظف المسافات

sql / text · draft

**الموقف:** وحّدت حالة الأحرف وما زالت الفئات مختلفة؛ ماذا بقي؟

**الخلاصة:** LOWER يعالج اختلاف الحالة، لكنه لا يعالج المسافات الزائدة أو صيغة الجمع.

**القيد:** لا تساوِ توحيد الحالة بتنظيف النص كله.

Source: `content/sql/vault.json#/pages/11`

Lesson route: `/learn/sql/11/`

**مقتطف الدليل:** ده بيحل مشكلة اختلاف الحالة بس <b>مش</b> المسافات الزايدة أو صيغة الجمع.

Evidence pointer: `/pages/11/body`

## hansa-bank-167 — TRIM الافتراضي ليس لكل whitespace

sql / text · draft

**الموقف:** بقي tab أو newline بعد التنظيف؛ هل هذا يناقض TRIM؟

**الخلاصة:** المصدر يوضح أن الدوال المذكورة تزيل space العادي افتراضيًا، وليس كل أنواع whitespace.

**القيد:** حدد الأحرف المقصودة واختبر بياناتك الفعلية.

Source: `content/sql/vault.json#/pages/11`

Lesson route: `/learn/sql/11/`

**مقتطف الدليل:** مش كل أنواع الـwhitespace زي الـtabs/newlines.

Evidence pointer: `/pages/11/body`

## hansa-bank-168 — غياب التكرار الآن ليس ضمانًا دائمًا

sql / quality · draft

**الموقف:** أعاد اختبار التفرد صفر صفوف؛ ماذا أثبت؟

**الخلاصة:** أثبت أن قاعدة التفرد صمدت على البيانات المختبرة، لا أنها ستصمد دائمًا.

**القيد:** أعد الفحص عند وصول بيانات جديدة أو استخدم قيودًا مناسبة.

Source: `content/sql/vault.json#/pages/13`

Lesson route: `/learn/sql/13/`

**مقتطف الدليل:** not proof that the rule will always hold.

Evidence pointer: `/pages/13/body`

## hansa-bank-169 — القيمة الشاذة إشارة للتحقيق

sql / quality · draft

**الموقف:** اكتشفت ارتفاعًا غير معتاد؛ هل تحذفه باعتباره خطأ؟

**الخلاصة:** وجود outlier يستدعي التحقيق ولا يثبت تلقائيًا فساد البيانات.

**القيد:** افحص المصدر والسياق قبل التصحيح أو الحذف.

Source: `content/sql/vault.json#/pages/13`

Lesson route: `/learn/sql/13/`

**مقتطف الدليل:** not automatic proof of bad data.

Evidence pointer: `/pages/13/body`

## hansa-bank-170 — المجال المسموح مرجع مشترك

sql / quality · draft

**الموقف:** تكرر قائمة status المسموحة في استعلامات عديدة؛ كيف تقلل اختلافها؟

**الخلاصة:** يفضل المرجع جداول مرجعية أو قيودًا عند الإمكان بدل تكرار قوائم العمل ثابتة في كل استعلام.

**القيد:** القائمة نفسها تحتاج مالكًا وتعريفًا معتمدًا.

Source: `content/sql/vault.json#/pages/13`

Lesson route: `/learn/sql/13/`

**مقتطف الدليل:** prefer reference tables or constraints where possible

Evidence pointer: `/pages/13/body`

## hansa-bank-171 — آخر تحديث يحتاج موعدًا متوقعًا

sql / quality · draft

**الموقف:** وجدت MAX(last_updated_date)؛ هل عرفت أن البيانات حديثة كفاية؟

**الخلاصة:** قارن آخر تاريخ متاح بموعد أو اتفاق التحديث المتوقع.

**القيد:** وجود timestamp وحده لا يثبت ملاءمة البيانات للقرار.

Source: `content/sql/vault.json#/pages/13`

Lesson route: `/learn/sql/13/`

**مقتطف الدليل:** Compare the result against the expected refresh SLA.

Evidence pointer: `/pages/13/body`

## hansa-bank-172 — UPDATE بلا WHERE قد يشمل الجميع

sql / transactions · draft

**الموقف:** تراجع تعديلًا يستهدف مجموعة محددة؛ ما الخطر المباشر لغياب WHERE؟

**الخلاصة:** قد يعدّل الأمر كل صف في الجدول، لذا افحص المجتمع المستهدف قبل التنفيذ.

**القيد:** هذه ملاحظة تعليمية؛ لم يُنفذ أي تعديل قاعدة بيانات.

Source: `content/sql/vault.json#/pages/14`

Lesson route: `/learn/sql/14/`

**مقتطف الدليل:** A missing WHERE clause can modify every row.

Evidence pointer: `/pages/14/body`

## hansa-bank-173 — المعاملة تجمع وحدة منطقية

sql / transactions · draft

**الموقف:** تتطلب المهمة عدة عمليات مترابطة؛ ماذا تضيف transaction؟

**الخلاصة:** تجمع العمليات في وحدة منطقية بدل التعامل معها كخطوات منفصلة دون حدود اعتماد.

**القيد:** حدد سلوك الفشل والاعتماد وفق المحرك.

Source: `content/sql/vault.json#/pages/14`

Lesson route: `/learn/sql/14/`

**مقتطف الدليل:** A transaction groups operations into one logical unit.

Evidence pointer: `/pages/14/body`

## hansa-bank-174 — العزل ليس موحدًا بين المحركات

sql / transactions · draft

**الموقف:** هل تفترض أن القراءات المتزامنة تتصرف بالطريقة نفسها في كل قاعدة؟

**الخلاصة:** ظواهر مثل dirty reads وnon-repeatable reads تعتمد على مستوى العزل والمحرك.

**القيد:** افحص الإعداد الافتراضي بدل تعميم خبرة من محرك آخر.

Source: `content/sql/vault.json#/pages/14`

Lesson route: `/learn/sql/14/`

**مقتطف الدليل:** Understand the database's default isolation behavior

Evidence pointer: `/pages/14/body`

## hansa-bank-175 — التطبيع يعالج مشكلات التحديث

sql / design · draft

**الموقف:** لماذا تفصل الكيانات والتبعيات في التصميم العلاقي؟

**الخلاصة:** التطبيع يقلل التكرار ومشكلات تحديث بيانات مترابطة في أماكن متعددة.

**القيد:** قد تختار النماذج التحليلية denormalization عمدًا لاحتياجات مختلفة.

Source: `content/sql/vault.json#/pages/15`

Lesson route: `/learn/sql/15/`

**مقتطف الدليل:** Normalization reduces redundancy and update anomalies

Evidence pointer: `/pages/15/body`

## hansa-bank-176 — المفتاح الطبيعي والمولد يؤديان دورين

sql / design · draft

**الموقف:** هل معرف من العمل هو نفسه معرف يولده النظام؟

**الخلاصة:** Natural key يأتي من مجال العمل؛ surrogate key معرف مولد من النظام ويشيع في النماذج البعدية.

**القيد:** لا تفترض أن تغيير نوع المفتاح يحل تلقائيًا قواعد التفرد.

Source: `content/sql/vault.json#/pages/15`

Lesson route: `/learn/sql/15/`

**مقتطف الدليل:** Natural keys come from the business domain.

Evidence pointer: `/pages/15/body`

## hansa-bank-177 — OLTP وBI لهما أولويات مختلفة

sql / design · draft

**الموقف:** هل تصميم سريع للكتابة هو تلقائيًا أسهل للتحليل؟

**الخلاصة:** OLTP يركز على سلامة المعاملات وكفاءة الكتابة؛ BI يركز على الوصول التحليلي وثبات مستوى التفاصيل والتجميع.

**القيد:** اختيار التصميم يتبع عبء العمل.

Source: `content/sql/vault.json#/pages/15`

Lesson route: `/learn/sql/15/`

**مقتطف الدليل:** OLTP prioritizes transaction integrity, write efficiency, and normalized entities.

Evidence pointer: `/pages/15/body`

## hansa-bank-178 — الفهرس له تكلفة كتابة

sql / performance · draft

**الموقف:** هل إضافة فهارس أكثر تحسين مجاني؟

**الخلاصة:** قد تسرّع الفهارس القراءة لكنها تضيف تخزينًا وتكلفة كتابة وصيانة.

**القيد:** صممها حول الاستخدام الفعلي وقِس أثرها.

Source: `content/sql/vault.json#/pages/16`

Lesson route: `/learn/sql/16/`

**مقتطف الدليل:** Indexes can accelerate reads but add storage and write/maintenance cost.

Evidence pointer: `/pages/16/body`

## hansa-bank-179 — الدالة حول عمود المرشح قد تعوق الفهرس

sql / performance · draft

**الموقف:** هل يمكن استخدام نطاق بدل تحويل العمود داخل الشرط؟

**الخلاصة:** المرشح يكون عادة أقرب للاستفادة من الفهرس إذا لم يغلّف العمود بدالة أو تعبير.

**القيد:** هذه قاعدة عامة وليست ضمانًا لخطة معينة.

Source: `content/sql/vault.json#/pages/16`

Lesson route: `/learn/sql/16/`

**مقتطف الدليل:** Prefer a range predicate over transforming the indexed column when possible.

Evidence pointer: `/pages/16/body`

## hansa-bank-180 — الأعمدة غير المستخدمة عبء محتمل

sql / performance · draft

**الموقف:** تسحب SELECT * من جدول عريض ولا تعرض إلا أعمدة قليلة؛ ماذا تراجع؟

**الخلاصة:** حدد الأعمدة المطلوبة بدل جلب كل الأعمدة في الاستعلام التحليلي الإنتاجي.

**القيد:** حافظ على الأعمدة التي يحتاجها المعنى؛ لا تقللها عشوائيًا.

Source: `content/sql/vault.json#/pages/16`

Lesson route: `/learn/sql/16/`

**مقتطف الدليل:** Avoid <code>SELECT *</code> in production analytical queries when the table is wide.

Evidence pointer: `/pages/16/body`

## hansa-bank-181 — الإزالة تحتاج تعريفًا للسجل الصحيح

sql / warehouse · draft

**الموقف:** هل DISTINCT يكفي لتنظيف تكرار سجلات العمل؟

**الخلاصة:** عرّف قاعدة التفرد أولًا، ثم احتفظ بالسجل المقصود باستخدام ترتيب محدد أو تجميع ملائم.

**القيد:** قد يمثل التكرار نسخًا تاريخية مشروعة.

Source: `content/sql/vault.json#/pages/17`

Lesson route: `/learn/sql/17/`

**مقتطف الدليل:** Define the business uniqueness rule first

Evidence pointer: `/pages/17/body`

## hansa-bank-182 — التحميل التزايدي يحتاج إشارة تغير

sql / warehouse · draft

**الموقف:** كيف تعرف أن صفًا جديد أو تغير منذ التحميل السابق؟

**الخلاصة:** تحتاج آلية موثوقة مثل watermark أو رقم تسلسلي أو تتبع تغير، حسب دعم المصدر والهدف.

**القيد:** تقليل حجم المعالجة لا يبرر تفويت تغيرات أو حذف.

Source: `content/sql/vault.json#/pages/17`

Lesson route: `/learn/sql/17/`

**مقتطف الدليل:** when the source and target support reliable change detection.

Evidence pointer: `/pages/17/body`

## hansa-bank-183 — الأبعاد المشتركة توحّد تعريف العمل

sql / warehouse · draft

**الموقف:** عمليتا حقائق تحتاجان المعنى نفسه للعميل أو التاريخ؛ ماذا يفيد؟

**الخلاصة:** استخدم conformed dimensions عندما تتطلب العمليات تعريف عمل مشتركًا.

**القيد:** لا تفترض تطابق التعريف لمجرد تشابه اسم العمود.

Source: `content/sql/vault.json#/pages/17`

Lesson route: `/learn/sql/17/`

**مقتطف الدليل:** Use conformed dimensions when multiple fact processes need the same business definition.

Evidence pointer: `/pages/17/body`

## hansa-bank-184 — الفئة المرتبة ليست اسمًا فقط

statistics / foundations · draft

**الموقف:** هل Low وMedium وHigh مثل أسماء المدن بلا ترتيب؟

**الخلاصة:** Ordinal فئات ذات ترتيب، بينما Nominal فئات بلا ترتيب طبيعي.

**القيد:** وجود ترتيب لا يحدد تلقائيًا مسافات عددية متساوية بين الفئات.

Source: `content/statistics/source.json#/sections/1`

Lesson route: `/learn/statistics/source/`

Find source section: 2. Data Types

**مقتطف الدليل:** فئات لها ترتيب، مثل Low / Medium / High.

Evidence pointer: `/sections/1/blocks/9/items/0/1/text`

## hansa-bank-185 — العد غير القياس المستمر

statistics / foundations · draft

**الموقف:** كيف تختلف أعداد العملاء عن أطوالهم؟

**الخلاصة:** عدد العملاء مثال لقيم discrete معدودة، بينما الطول مثال لقياس continuous على نطاق مستمر.

**القيد:** صنّف المتغير بحسب معناه لا مجرد عرضه كرقم.

Source: `content/statistics/source.json#/sections/1`

Lesson route: `/learn/statistics/source/`

Find source section: 2. Data Types

**مقتطف الدليل:** قيم معدودة، مثل عدد العملاء.

Evidence pointer: `/sections/1/blocks/4/items/0/1/text`

## hansa-bank-186 — المنوال قد لا يكون واحدًا

statistics / describe · draft

**الموقف:** هل يجب أن تنتج البيانات قيمة منوال وحيدة؟

**الخلاصة:** المنوال هو الأكثر تكرارًا، وقد توجد أكثر من قيمة منوال أو لا توجد قيمة متكررة بوضوح.

**القيد:** لا تفرض ملخصًا وحيدًا إذا لم تدعمه التكرارات.

Source: `content/statistics/source.json#/sections/3`

Lesson route: `/learn/statistics/source/`

Find source section: 4. Measures of Center — مقاييس النزعة المركزية

**مقتطف الدليل:** يمكن أن توجد أكثر من Mode أو لا توجد قيمة متكررة بوضوح.

Evidence pointer: `/sections/3/blocks/8/inline/0/text`

## hansa-bank-187 — المدى حساس للطرفين

statistics / describe · draft

**الموقف:** لماذا يتغير Range كثيرًا بسبب قيمة بعيدة واحدة؟

**الخلاصة:** المدى يعتمد على أطراف البيانات، ولذلك يتأثر بقوة بالقيم المتطرفة.

**القيد:** استخدمه مع فهم لبقية التوزيع، لا كملخص وحيد للتشتت.

Source: `content/statistics/source.json#/sections/4`

Lesson route: `/learn/statistics/source/`

Find source section: 5. Measures of Spread — مقاييس التشتت

**مقتطف الدليل:** بسيط لكنه يعتمد بشدة على القيم المتطرفة.

Evidence pointer: `/sections/4/blocks/4/inline/0/text`

## hansa-bank-188 — وحدة الانحراف المعياري مفهومة

statistics / describe · draft

**الموقف:** تقيس زمنًا بالدقائق؛ كيف تقرأ وحدة SD؟

**الخلاصة:** الانحراف المعياري يقيس التشتت حول المتوسط وبنفس وحدة البيانات.

**القيد:** لا تفسره على أنه وحدة مربعة مثل التباين.

Source: `content/statistics/source.json#/sections/4`

Lesson route: `/learn/statistics/source/`

Find source section: 5. Measures of Spread — مقاييس التشتت

**مقتطف الدليل:** وهو مقياس للتشتت حول المتوسط وبنفس وحدة البيانات.

Evidence pointer: `/sections/4/blocks/13/inline/0/text`

## hansa-bank-189 — المتمم يكمل الاحتمال إلى واحد

statistics / probability · draft

**الموقف:** إذا عرفت احتمال الحدث، كيف تحسب احتمال عدم حدوثه؟

**الخلاصة:** احتمال المتمم يساوي 1 ناقص احتمال الحدث.

**القيد:** يجب أن يكون الحدث والمتمم محددين في فضاء الاحتمال نفسه.

Source: `content/statistics/source.json#/sections/5`

Lesson route: `/learn/statistics/source/`

Find source section: 6. Probability — الاحتمالات

**مقتطف الدليل:** P(A^c) = 1 - P(A)

Evidence pointer: `/sections/5/blocks/7/tex`

## hansa-bank-190 — الاحتمال المشروط يستخدم معلومة

statistics / probability · draft

**الموقف:** وصلتك معلومة أن B حدث؛ ماذا يعني احتمال A بشرط B؟

**الخلاصة:** هو احتمال وقوع A مع العلم بأن B حدث بالفعل، وليس تجاهل المعلومة الجديدة.

**القيد:** في الأحداث المعتمدة قد تغير المعلومة الاحتمال؛ لا تفترض الاستقلال.

Source: `content/statistics/source.json#/sections/5`

Lesson route: `/learn/statistics/source/`

Find source section: 6. Probability — الاحتمالات

**مقتطف الدليل:** احتمال وقوع A بشرط أن B حدث بالفعل:

Evidence pointer: `/sections/5/blocks/13/inline/0/text`

## hansa-bank-191 — حدد ما تعدّه في Binomial

statistics / distributions · draft

**الموقف:** هل X تمثل ترتيب التجربة أم عدد نجاحاتها؟

**الخلاصة:** في صياغة الدرس، X هي عدد النجاحات من n تجارب.

**القيد:** تعريف النجاح يجب أن يظل واضحًا وثابتًا، مع تحقق شروط النموذج.

Source: `content/statistics/source.json#/sections/7`

Lesson route: `/learn/statistics/source/`

Find source section: 8. Binomial Distribution

**مقتطف الدليل:** عدد النجاحات

Evidence pointer: `/sections/7/blocks/5/items/0/0/text`

## hansa-bank-192 — تساوي مقاييس المركز له شرط

statistics / distributions · draft

**الموقف:** متى يتساوى Mean وMedian وMode في المثال النظري؟

**الخلاصة:** تتساوى في التوزيع الطبيعي المثالي المتماثل.

**القيد:** لا تحول خاصية النموذج إلى افتراض عن كل بيانات حقيقية.

Source: `content/statistics/source.json#/sections/8`

Lesson route: `/learn/statistics/source/`

Find source section: 9. Normal Distribution

**مقتطف الدليل:** Mean = Median = Mode في الحالة الطبيعية المثالية.

Evidence pointer: `/sections/8/blocks/7/items/0/0/text`

## hansa-bank-193 — Z-score يغير وحدة القراءة

statistics / distributions · draft

**الموقف:** ماذا يخبرك Z-score عن موضع قيمة؟

**الخلاصة:** يوضح عدد الانحرافات المعيارية التي تبعدها القيمة عن المتوسط.

**القيد:** تفسيره يحتاج المتوسط والتشتت المناسبين للبيانات.

Source: `content/statistics/source.json#/sections/8`

Lesson route: `/learn/statistics/source/`

Find source section: 9. Normal Distribution

**مقتطف الدليل:** يوضح كم Standard Deviations تبعد القيمة عن المتوسط.

Evidence pointer: `/sections/8/blocks/17/inline/0/text`

## hansa-bank-194 — Lambda تحتاج فترة محددة

statistics / distributions · draft

**الموقف:** هل متوسط الأحداث بلا ذكر الساعة أو اليوم وصف مكتمل؟

**الخلاصة:** Lambda في مثال Poisson تمثل متوسط عدد الأحداث لكل فترة زمنية أو نطاق مكاني محدد.

**القيد:** ثبت النطاق قبل استخدام القيمة في حساب الاحتمالات.

Source: `content/statistics/source.json#/sections/9`

Lesson route: `/learn/statistics/source/`

Find source section: 10. Poisson Distribution

**مقتطف الدليل:** Average number of events per time/space period

Evidence pointer: `/sections/9/blocks/18/inline/2/text`

## hansa-bank-195 — قمة Poisson ليست شعارًا مطلقًا

statistics / distributions · draft

**الموقف:** هل تحفظ أن القمة دائمًا عند lambda وحدها؟

**الخلاصة:** المصدر ينبه إلى إمكان وجود منوالين متجاورين في بعض الحالات عندما تكون lambda عددًا صحيحًا.

**القيد:** راجع شروط الحالة بدل تعميم عبارة عن موضع القمة.

Source: `content/statistics/source.json#/sections/9`

Lesson route: `/learn/statistics/source/`

Find source section: 10. Poisson Distribution

**مقتطف الدليل:** لا ينبغي حفظ عبارة "peak is always exactly lambda" كقاعدة رياضية مطلقة.

Evidence pointer: `/sections/9/blocks/24/inline/6/text`

## hansa-bank-196 — CLT تتحدث عن المتوسطات

statistics / sampling · draft

**الموقف:** هل اقتراب توزيع المتوسطات من الطبيعي يعني أن المجتمع نفسه طبيعي؟

**الخلاصة:** توزيع متوسطات عينات ذات حجم مناسب قد يقترب من الطبيعي تحت الشروط الملائمة، حتى إن لم يكن المجتمع طبيعيًا.

**القيد:** النتيجة تخص توزيع المتوسطات؛ الشروط وحجم العينة مهمان.

Source: `content/statistics/source.json#/sections/10`

Lesson route: `/learn/statistics/source/`

Find source section: 11. Central Limit Theorem — CLT

**مقتطف الدليل:** حتى لو لم تكن Population نفسها Normal.

Evidence pointer: `/sections/10/blocks/2/inline/2/text`

## hansa-bank-197 — عينة واحدة ليست Sampling Distribution

statistics / sampling · draft

**الموقف:** رسمت قيم عينة واحدة؛ هل رسمت توزيع متوسطها عبر العينات؟

**الخلاصة:** Sample Distribution يصف القيم داخل عينة، بينما Sampling Distribution يصف إحصائية عبر عينات كثيرة.

**القيد:** حدد هل المحور يمثل مشاهدات أم إحصاءات عينات.

Source: `content/statistics/source.json#/sections/11`

Lesson route: `/learn/statistics/source/`

Find source section: 12. Sampling Distribution

**مقتطف الدليل:** توزيع القيم داخل عينة واحدة.

Evidence pointer: `/sections/11/blocks/4/items/0/1/text`

## hansa-bank-198 — حجم العينة واستقرار المتوسط

statistics / sampling · draft

**الموقف:** مع ثبات بقية الظروف، لماذا يفيد تكبير العينة في تقدير المتوسط؟

**الخلاصة:** ينخفض الخطأ المعياري ويصبح تقدير متوسط المجتمع أكثر استقرارًا مع زيادة حجم العينة في الإطار الذي يشرحه الدرس.

**القيد:** زيادة العدد لا تعالج تلقائيًا تحيز طريقة أخذ العينة.

Source: `content/statistics/source.json#/sections/12`

Lesson route: `/learn/statistics/source/`

Find source section: 13. Standard Error — SE

**مقتطف الدليل:** تقديرنا للـ Population Mean يصبح أكثر استقرارًا مع زيادة حجم العينة.

Evidence pointer: `/sections/12/blocks/13/inline/0/text`

## hansa-bank-199 — 95% تصف طريقة بناء الفترة

statistics / sampling · draft

**الموقف:** هل فترة الثقة المحسوبة تعني احتمالًا 95% لمعلمة ثابتة داخلها؟

**الخلاصة:** في التفسير المتكرر، طريقة البناء تحتوي المعلمة في نحو 95% من العينات المتكررة عند تحقق الشروط.

**القيد:** لا تنقل هذا التفسير إلى احتمال بعدي للمعلمة الثابتة في الفترة المحسوبة.

Source: `content/statistics/source.json#/sections/13`

Lesson route: `/learn/statistics/source/`

Find source section: 14. Confidence Intervals

**مقتطف الدليل:** طريقة بناء 95% CI ستحتوي على Population Parameter في حوالي 95% من العينات المتكررة

Evidence pointer: `/sections/13/blocks/11/inline/1/text`

## hansa-bank-200 — ثقة أعلى قد تعني نطاقًا أوسع

statistics / sampling · draft

**الموقف:** رفعت مستوى الثقة مع تثبيت الباقي؛ ماذا تتوقع للفترة؟

**الخلاصة:** الفترة تصبح أوسع عادة عند رفع مستوى الثقة في الطريقة نفسها.

**القيد:** قارن فترات مبنية على الإعدادات نفسها عدا التغير المقصود.

Source: `content/statistics/source.json#/sections/13`

Lesson route: `/learn/statistics/source/`

Find source section: 14. Confidence Intervals

**مقتطف الدليل:** Confidence Level أعلى → Interval أوسع.

Evidence pointer: `/sections/13/blocks/13/items/0/0/text`

## hansa-bank-201 — خطأ معياري أكبر يوسع الفترة

statistics / sampling · draft

**الموقف:** لماذا تختلف عروض فترات الثقة لتقديرات متشابهة؟

**الخلاصة:** زيادة SE توسع الفترة عند تثبيت بقية عناصر الحساب.

**القيد:** قيمة التقدير وحدها لا تصف عدم اليقين حوله.

Source: `content/statistics/source.json#/sections/13`

Lesson route: `/learn/statistics/source/`

Find source section: 14. Confidence Intervals

**مقتطف الدليل:** SE أكبر → Interval أوسع.

Evidence pointer: `/sections/13/blocks/14/items/0/0/text`

## hansa-bank-202 — فرضية العدم تحدد المقارنة

statistics / hypothesis · draft

**الموقف:** في مثال مقارنة متوسطين، ما نقطة الانطلاق المرجعية؟

**الخلاصة:** يبدأ المثال بفرضية عدم وجود فرق بين المتوسطين، ثم يقيم الأدلة بالنسبة لها.

**القيد:** هذه صياغة المثال؛ صغ الفرضية وفق السؤال الفعلي.

Source: `content/statistics/source.json#/sections/14`

Lesson route: `/learn/statistics/source/`

Find source section: 15. Hypothesis Testing

**مقتطف الدليل:** نبدأ عادةً بافتراض عدم وجود فرق أو تأثير

Evidence pointer: `/sections/14/blocks/4/inline/0/text`

## hansa-bank-203 — البديل يحدد معنى التطرف

statistics / hypothesis · draft

**الموقف:** لماذا يهم اختيار بديل أحادي أو ثنائي الجانب؟

**الخلاصة:** شكل الفرضية البديلة يحدد معنى النتيجة الأكثر تطرفًا عند حساب p-value.

**القيد:** اختر البديل بحسب السؤال قبل رؤية النتيجة.

Source: `content/statistics/source.json#/sections/14`

Lesson route: `/learn/statistics/source/`

Find source section: 15. Hypothesis Testing

**مقتطف الدليل:** اختيار شكل Alternative يحدد ما معنى "more extreme" عند حساب p-value.

Evidence pointer: `/sections/14/blocks/14/inline/0/text`

## hansa-bank-204 — اختلاف عينتين ليس السؤال الأخير

statistics / hypothesis · draft

**الموقف:** وجدت فرقًا بين متوسطَي عينتين؛ ما السؤال التالي؟

**الخلاصة:** اسأل هل يصعب تفسير مقدار الفرق بتقلب العينات وحده إذا كانت فرضية العدم صحيحة.

**القيد:** وجود فرق عددي لا يثبت أثرًا بمفرده.

Source: `content/statistics/source.json#/sections/16`

Lesson route: `/learn/statistics/source/`

Find source section: 17. Sampling Variability داخل Hypothesis Testing

**مقتطف الدليل:** Sampling Variation وحدها إذا كانت H₀ صحيحة

Evidence pointer: `/sections/16/blocks/6/inline/3/text`

## hansa-bank-205 — قِس الفرق بوحدة خطئه المعياري

statistics / hypothesis · draft

**الموقف:** في المثال المفاهيمي، فرق 5.4 وخطأ معياري 1.5 للفرق؛ كيف تقرأ النسبة؟

**الخلاصة:** النسبة 3.6 تعني أن الفرق المرصود يبعد 3.6 أخطاء معيارية عن الفرق المفترض صفرًا في المثال.

**القيد:** هذه نسبة توضيحية؛ نوع الاختبار وتوزيعه يحددان الاستدلال التالي.

Source: `content/statistics/source.json#/sections/17`

Lesson route: `/learn/statistics/source/`

Find source section: 18. Test Statistic وSE

**مقتطف الدليل:** الفرق المرصود يبعد 3.6 Standard Errors

Evidence pointer: `/sections/17/blocks/8/inline/0/text`

## hansa-bank-206 — p-value ليست تداخل توزيعين

statistics / hypothesis · draft

**الموقف:** رأيت منطقتين متداخلتين في رسم توضيحي؛ هل مساحة التداخل تعريف p-value؟

**الخلاصة:** لا؛ التعريف يتعلق بنتائج لا تقل تطرفًا عن المرصود تحت توزيع الاختبار في فرضية العدم.

**القيد:** الرسم التشبيهي لا يستبدل تعريف الاختبار.

Source: `content/statistics/source.json#/sections/18`

Lesson route: `/learn/statistics/source/`

Find source section: 19. p-value

**مقتطف الدليل:** التعريف الصحيح ليس "مساحة التداخل بين توزيعين".

Evidence pointer: `/sections/18/blocks/11/inline/0/text`

## hansa-bank-207 — ذيل واحد أم طرفان؟

statistics / hypothesis · draft

**الموقف:** كيف يختلف تجميع الاحتمال بين الاختبار الأحادي والثنائي؟

**الخلاصة:** الأحادي يستخدم التطرف في اتجاه البديل، والثنائي يحسب النتائج المتطرفة في الطرفين وفق تعريف الاختبار.

**القيد:** لا تضاعف احتمالًا بلا مراجعة شكل الاختبار والتوزيع.

Source: `content/statistics/source.json#/sections/18`

Lesson route: `/learn/statistics/source/`

Find source section: 19. p-value

**مقتطف الدليل:** وفي Two-tailed test تُحسب مساحة النتائج المتطرفة في الطرفين وفق تعريف الاختبار.

Evidence pointer: `/sections/18/blocks/12/inline/0/text`

## hansa-bank-208 — ثبت معيار القرار قبل النتيجة

statistics / hypothesis · draft

**الموقف:** هل تغير alpha بعد ظهور p-value لتوافق الاستنتاج المطلوب؟

**الخلاصة:** يحدد مستوى الدلالة مسبقًا لتقليل التحيز وعدم تبديل معيار القرار بعد رؤية النتائج.

**القيد:** توثيق الاختيار جزء من خطة التحليل.

Source: `content/statistics/source.json#/sections/19`

Lesson route: `/learn/statistics/source/`

Find source section: 20. Significance Level — α

**مقتطف الدليل:** يجب تحديده مسبقًا لتقليل التحيز وعدم تغيير معيار القرار بعد رؤية النتائج.

Evidence pointer: `/sections/19/blocks/4/inline/0/text`

## hansa-bank-209 — Type I هو رفض خاطئ

statistics / hypothesis · draft

**الموقف:** رفض الاختبار فرضية عدم صحيحة؛ ماذا يسمى الخطأ؟

**الخلاصة:** هذا Type I Error، ويسمى أيضًا False Positive.

**القيد:** تعريف الخطأ يجمع حالة الواقع وقرار الاختبار.

Source: `content/statistics/source.json#/sections/21`

Lesson route: `/learn/statistics/source/`

Find source section: 22. Type I and Type II Errors

**مقتطف الدليل:** نرفض H₀ وهي صحيحة فعلًا.

Evidence pointer: `/sections/21/blocks/4/inline/0/text`

## hansa-bank-210 — Type II هو عدم رفض خاطئ

statistics / hypothesis · draft

**الموقف:** فشل الاختبار في رفض فرضية عدم خاطئة؛ ما الحالة؟

**الخلاصة:** هذا Type II Error، ويسمى أيضًا False Negative.

**القيد:** عدم الرفض ليس ضمانًا بأن الاختبار التقط كل أثر موجود.

Source: `content/statistics/source.json#/sections/21`

Lesson route: `/learn/statistics/source/`

Find source section: 22. Type I and Type II Errors

**مقتطف الدليل:** نفشل في رفض H₀ وهي خاطئة فعلًا.

Evidence pointer: `/sections/21/blocks/7/inline/0/text`

## hansa-bank-211 — العينة الضخمة قد تكشف أثرًا ضئيلًا

statistics / hypothesis · draft

**الموقف:** لماذا قد تكون نتيجة صغيرة جدًا دالة إحصائيًا؟

**الخلاصة:** مع عينات ضخمة قد يصبح فرق صغير جدًا قابلًا للكشف إحصائيًا؛ لذلك افحص حجم الأثر.

**القيد:** لا تجعل الدلالة وحدها مبررًا لقرار مكلف.

Source: `content/statistics/source.json#/sections/22`

Lesson route: `/learn/statistics/source/`

Find source section: 23. Statistical Significance vs Practical Significance

**مقتطف الدليل:** مع عينات ضخمة قد يصبح فرق صغير جدًا Statistically Significant.

Evidence pointer: `/sections/22/blocks/3/inline/0/text`

## hansa-bank-212 — سمِّ المعالجة والاستجابة

statistics / experiments · draft

**الموقف:** في اختبار إعلان، ماذا تغير وماذا تقيس؟

**الخلاصة:** الإعلان هو المعالجة في مثال الدرس، وعدد المنتجات المباعة هو الاستجابة.

**القيد:** اختر مقياس الاستجابة الذي يجيب عن سؤال التجربة.

Source: `content/statistics/source.json#/sections/23`

Lesson route: `/learn/statistics/source/`

Find source section: 24. Experiments

**مقتطف الدليل:** الإعلان Treatment، وعدد المنتجات المباعة Response.

Evidence pointer: `/sections/23/blocks/5/inline/0/text`

## hansa-bank-213 — فرق العمر قد يربك أثر الإعلان

statistics / experiments · draft

**الموقف:** اختلف عمر مجموعتي التجربة بشدة؛ هل تنسب فرق المبيعات كله للإعلان؟

**الخلاصة:** إذا كان العمر يؤثر في الشراء فقد يفسر جزءًا من الفرق بدل المعالجة.

**القيد:** المثال يحذر من عدم قابلية المجموعتين للمقارنة.

Source: `content/statistics/source.json#/sections/24`

Lesson route: `/learn/statistics/source/`

Find source section: 25. Controlled Experiments

**مقتطف الدليل:** فقد يكون الفرق في المبيعات بسبب العمر وليس الإعلان.

Evidence pointer: `/sections/24/blocks/6/inline/0/text`

## hansa-bank-214 — التعمية تقلل أثر التوقعات

statistics / experiments · draft

**الموقف:** لماذا لا يعرف المشارك مجموعته في تجربة معماة؟

**الخلاصة:** يساعد ذلك على تقليل أثر توقعات المشاركين على النتائج.

**القيد:** التعمية إجراء لتقليل التحيز وليست بديلًا لبقية التصميم.

Source: `content/statistics/source.json#/sections/26`

Lesson route: `/learn/statistics/source/`

Find source section: 27. Blinding وPlacebo

**مقتطف الدليل:** هذا يقلل تأثير توقعات المشاركين على النتائج.

Evidence pointer: `/sections/26/blocks/3/inline/0/text`

## hansa-bank-215 — Placebo يفصل التشابه الظاهري

statistics / experiments · draft

**الموقف:** ما دور بديل يشبه المعالجة دون تأثيرها العلاجي الحقيقي؟

**الخلاصة:** هذا وصف placebo في الدرس، ويستخدم للمقارنة في سياقات تجريبية مناسبة.

**القيد:** المثال يشرح تصميمًا إحصائيًا ولا يقدم توجيهًا علاجيًا.

Source: `content/statistics/source.json#/sections/26`

Lesson route: `/learn/statistics/source/`

Find source section: 27. Blinding وPlacebo

**مقتطف الدليل:** بديل يشبه Treatment لكنه لا يحمل التأثير العلاجي الحقيقي

Evidence pointer: `/sections/26/blocks/5/inline/0/text`

## hansa-bank-216 — التعمية المزدوجة تشمل القائم على الإجراء

statistics / experiments · draft

**الموقف:** هل جهل المشارك وحده يحقق التعمية المزدوجة؟

**الخلاصة:** في وصف الدرس، لا يعرف المشارك ولا الشخص الذي يعطي المعالجة أو يدير التجربة المجموعة الفعلية.

**القيد:** الهدف تقليل التحيز في الاستجابة وإدارة التجربة.

Source: `content/statistics/source.json#/sections/26`

Lesson route: `/learn/statistics/source/`

Find source section: 27. Blinding وPlacebo

**مقتطف الدليل:** وكذلك الشخص الذي يعطي Treatment أو يدير التجربة لا يعرف

Evidence pointer: `/sections/26/blocks/7/inline/0/text`

## hansa-bank-217 — التجربة العشوائية قد تضم عدة معالجات

statistics / experiments · draft

**الموقف:** هل RCT يجب أن تتكون من مجموعتي A وB فقط؟

**الخلاصة:** يمكن أن تتضمن أكثر من مجموعة معالجة، كما في مقارنة مستويات مختلفة.

**القيد:** عدد المجموعات يحدده السؤال والتصميم.

Source: `content/statistics/source.json#/sections/27`

Lesson route: `/learn/statistics/source/`

Find source section: 28. RCT vs A/B Testing

**مقتطف الدليل:** يمكن أن تحتوي RCT على أكثر من Treatment Group

Evidence pointer: `/sections/27/blocks/1/inline/0/text`

## hansa-bank-218 — نسختان في أبسط A/B

statistics / experiments · draft

**الموقف:** ما وحدة المقارنة في المثال الأساسي لاختبار A/B؟

**الخلاصة:** يقارن نسختين مثل زر جديد وقديم أو صفحتين، ويقسم المشاركين في أبسط صورة إلى مجموعتين.

**القيد:** لا يكفي تسمية المقارنة A/B لإثبات جودة تصميمها.

Source: `content/statistics/source.json#/sections/27`

Lesson route: `/learn/statistics/source/`

Find source section: 28. RCT vs A/B Testing

**مقتطف الدليل:** والـ A/B Testing في أبسط صوره يقسم المشاركين إلى مجموعتين فقط.

Evidence pointer: `/sections/27/blocks/5/inline/0/text`

## hansa-bank-219 — الإشارة اتجاه وليست ضعفًا

statistics / relationships · draft

**الموقف:** هل ارتباط سالب يعني بالضرورة علاقة أضعف من ارتباط موجب؟

**الخلاصة:** الإشارة تصف الاتجاه، بينما قوة العلاقة الخطية ترتبط بالقيمة المطلقة للمعامل.

**القيد:** قارن المقدار مع فحص شكل البيانات، لا الإشارة وحدها.

Source: `content/statistics/source.json#/sections/29`

Lesson route: `/learn/statistics/source/`

Find source section: 30. Correlation

**مقتطف الدليل:** قوة العلاقة ترتبط بالقيمة المطلقة:

Evidence pointer: `/sections/29/blocks/12/inline/0/text`

## hansa-bank-220 — قوي ومتوسط أوصاف مرتبطة بالمجال

statistics / relationships · draft

**الموقف:** هل حدود قوة الارتباط في مثال تدريبي معيار عالمي؟

**الخلاصة:** المصدر يصفها كتقريبات لا حدود ثابتة صالحة لكل مجال.

**القيد:** استعن بسياق السؤال بدل تصنيف آلي منفصل عن المجال.

Source: `content/statistics/source.json#/sections/29`

Lesson route: `/learn/statistics/source/`

Find source section: 30. Correlation

**مقتطف الدليل:** هذه أوصاف تقريبية وليست حدودًا عالمية ثابتة لكل مجال.

Evidence pointer: `/sections/29/blocks/21/inline/0/text`

## hansa-bank-221 — فتش عن عامل مشترك

statistics / relationships · draft

**الموقف:** كيف يمكن أن ترتبط تكلفة المياه بمتوسط العمر دون أن تكون السبب؟

**الخلاصة:** يعرض الدرس الاقتصاد كعامل قد يرتبط بتكلفة المياه وبالرعاية الصحية ومتوسط العمر.

**القيد:** هذا تفسير لعامل مربك محتمل، لا إثبات سببي جديد.

Source: `content/statistics/source.json#/sections/32`

Lesson route: `/learn/statistics/source/`

Find source section: 33. Confounding Variables

**مقتطف الدليل:** بينما قد يكون الاقتصاد عاملًا مشتركًا مهمًا.

Evidence pointer: `/sections/32/blocks/6/inline/0/text`

## hansa-bank-222 — الميل يصف تغيرًا بوحدات المتغير

statistics / relationships · draft

**الموقف:** هل r = 0.8 يعني زيادة Y بمقدار 0.8 لكل وحدة X؟

**الخلاصة:** لا؛ هذا تفسير للميل في نموذج الانحدار، وليس لمعامل الارتباط.

**القيد:** اربط تفسير الميل بالنموذج ووحدات المتغيرين.

Source: `content/statistics/source.json#/sections/34`

Lesson route: `/learn/statistics/source/`

Find source section: 35. Correlation vs Regression

**مقتطف الدليل:** لا تقل إن r = 0.8 يعني أن Y يزيد 0.8 وحدة عندما يزيد X بوحدة.

Evidence pointer: `/sections/34/blocks/8/inline/0/text`

## hansa-bank-223 — الاختبار يبدأ بتحديد من نقارن

statistics / hypothesis · draft

**الموقف:** هل تبدأ مسار الاختبار بحساب p-value قبل تحديد المجموعات؟

**الخلاصة:** يبدأ سير العمل بتحديد المجتمعات أو المجموعات، ثم الفرضيات والبيانات والإحصائية المناسبة.

**القيد:** الاستنتاج النهائي يظل مقيدًا بحدود الاختبار.

Source: `content/statistics/source.json#/sections/15`

Lesson route: `/learn/statistics/source/`

Find source section: 16. Hypothesis Testing Workflow

**مقتطف الدليل:** تحديد الـ Populations أو المجموعات محل المقارنة.

Evidence pointer: `/sections/15/blocks/1/items/0/0/text`

## hansa-bank-224 — حدود الصندوق ليست أقل وأكبر قيمة

visualization / distribution · draft

**الموقف:** هل طرفا الصندوق هما أصغر وأكبر مشاهدة؟

**الخلاصة:** يمتد الصندوق من Q1 إلى Q3 ويصف النصف الأوسط من المشاهدات.

**القيد:** الشوارب والنقاط الخارجية تحمل معلومات إضافية خارج الصندوق.

Source: `content/data-viz/pages.json#/3`

Lesson route: `/learn/ar/box-plot/`

**مقتطف الدليل:** الصندوق: من Q1 إلى Q3، ويحتوي على منتصف 50% من المشاهدات.

Evidence pointer: `/3/blocks/11/items/0`

## hansa-bank-225 — الشوارب تتبع قاعدة معلنة

visualization / distribution · draft

**الموقف:** هل يصل الشارب دائمًا إلى أكبر قيمة؟

**الخلاصة:** في القاعدة الشائعة يصل الشارب لأبعد مشاهدة داخل حد 1.5 × IQR من الربيع، وقد تظهر قيم أبعد كنقاط منفصلة.

**القيد:** راجع إعداد الأداة؛ تعريف الشوارب قد يختلف بين التطبيقات.

Source: `content/data-viz/pages.json#/3`

Lesson route: `/learn/ar/box-plot/`

**مقتطف الدليل:** مع اختلافات ممكنة بين التطبيقات.

Evidence pointer: `/3/blocks/12/items/0/1/text`

## hansa-bank-226 — نقطة خارج الشارب تستحق الفحص

visualization / distribution · draft

**الموقف:** هل تحذف نقطة لأنها خارج شوارب Box Plot؟

**الخلاصة:** النقاط خارج الشوارب مرشحات لقيم شاذة وفق قاعدة العرض، وليست حكمًا على صحة التسجيل.

**القيد:** افحص سياق المشاهدة قبل اتخاذ قرار بشأنها.

Source: `content/data-viz/pages.json#/3`

Lesson route: `/learn/ar/box-plot/`

**مقتطف الدليل:** النقاط بعد الشوارب: غالبًا تُعرض كقيم شاذة محتملة وفق القاعدة المستخدمة.

Evidence pointer: `/3/blocks/13/items/0`

## hansa-bank-227 — الربيعان لهما معنى مئيني

visualization / distribution · draft

**الموقف:** ماذا يمثل Q1 وQ3 في ملخص التوزيع؟

**الخلاصة:** Q1 يمثل المئين 25 وQ3 يمثل المئين 75؛ حدود الصندوق مواقع في ترتيب القيم.

**القيد:** قد تختلف طرق حساب المئينات بين التطبيقات.

Source: `content/data-viz/pages.json#/3`

Lesson route: `/learn/ar/box-plot/`

**مقتطف الدليل:** Q1 — الربيع الأول: المئين الخامس والعشرون.

Evidence pointer: `/3/blocks/7/items/0`

## hansa-bank-228 — صندوق لكل مجموعة

visualization / distribution · draft

**الموقف:** تريد مقارنة توزيع متغير مستمر بين عدة فئات؛ كيف تقلل تداخل الرسوم؟

**الخلاصة:** Box Plot يضغط توزيع كل مجموعة في ملخص صغير يسمح بالمقارنة بين الفئات.

**القيد:** الضغط يفقد بعض تفاصيل شكل التوزيع، فارجع للرسم التفصيلي عند الحاجة.

Source: `content/data-viz/pages.json#/3`

Lesson route: `/learn/ar/box-plot/`

**مقتطف الدليل:** التداخل بينها يصنع فوضى بصرية، بينما يضغط الـBox Plot توزيع كل مجموعة في ملخص إحصائي صغير.

Evidence pointer: `/3/blocks/1/inline/0/text`

## hansa-bank-229 — لون الشاشة ولون الطباعة

visualization / accessibility · draft

**الموقف:** هل تمثيل اللون في الشاشة والطباعة واحد؟

**الخلاصة:** المصدر يميز RGB الشائع للشاشات عن CMYK الشائع للطباعة؛ وسيط العرض جزء من قرار اللون.

**القيد:** هذا تمييز بين تمثيلات اللون، وليس ضمانًا لتطابق المظهر بين الوسائط.

Source: `content/data-viz/pages.json#/4`

Lesson route: `/learn/ar/color/`

**مقتطف الدليل:** CMYK: شائع في الطباعة ويتوافق مع قنوات الحبر.

Evidence pointer: `/4/blocks/4/items/0`

## hansa-bank-230 — عائلة اللون غير شدته

visualization / accessibility · draft

**الموقف:** هل تغيير Hue هو نفسه زيادة التشبع؟

**الخلاصة:** في HCL يصف Hue عائلة اللون، بينما Chroma يصف شدته أو تشبعه.

**القيد:** لا تخلط اختلاف الفئة اللونية بزيادة مقدار مرتب.

Source: `content/data-viz/pages.json#/4`

Lesson route: `/learn/ar/color/`

**مقتطف الدليل:** Chroma: شدة أو تشبع اللون.

Evidence pointer: `/4/blocks/8/items/0`

## hansa-bank-231 — السطوع بُعد مستقل في HCL

visualization / accessibility · draft

**الموقف:** ما الخاصية التي تصف السطوع المدرك في HCL؟

**الخلاصة:** Luminance يصف السطوع المدرك، وهو مختلف عن عائلة اللون وشدة تشبعه.

**القيد:** وجود لون صحيح تقنيًا لا يثبت وضوح الرسالة البصرية.

Source: `content/data-viz/pages.json#/4`

Lesson route: `/learn/ar/color/`

**مقتطف الدليل:** Luminance: درجة السطوع المدركة.

Evidence pointer: `/4/blocks/9/items/0`

## hansa-bank-232 — صحة كود اللون لا تكفي

visualization / accessibility · draft

**الموقف:** اخترت ألوانًا صالحة تقنيًا؛ هل انتهى تصميم الترميز؟

**الخلاصة:** صلاحية تمثيل اللون لا تضمن جودة الترميز؛ يجب أن تتوافق اللوحة مع معنى البيانات.

**القيد:** اختبر التمييز والترتيب كما يراهما القارئ.

Source: `content/data-viz/pages.json#/4`

Lesson route: `/learn/ar/color/`

**مقتطف الدليل:** وجود تمثيل لوني صحيح تقنيًا لا يعني أنه ترميز بصري جيد.

Evidence pointer: `/4/blocks/10/inline/0/text`

## hansa-bank-233 — الرسم والنموذج والملخص يكملون بعضهم

visualization / foundations · draft

**الموقف:** هل تختار بين الرسم والإحصاء كبديلين متنافسين؟

**الخلاصة:** الملخص العددي والنموذج الإحصائي والرسم طرق متكاملة لفهم البيانات، ولكل منها ما يظهره.

**القيد:** لا تجعل أحدها يغطي وحده كل أسئلة التحليل.

Source: `content/data-viz/pages.json#/18`

Lesson route: `/learn/foundations/`

**مقتطف الدليل:** These approaches are complementary rather than competing.

Evidence pointer: `/18/blocks/2/inline/0/text`

## hansa-bank-234 — العمر قد يغيّر نوعه التحليلي

visualization / foundations · draft

**الموقف:** تعرض العمر مرة كقيمة دقيقة ومرة كفئة؛ هل هذا تناقض؟

**الخلاصة:** يمكن التعامل مع العمر كمتغير مستمر أو تقسيمه إلى فئات عمرية بحسب السؤال.

**القيد:** حدد المعالجة المستخدمة قبل اختيار الرسم.

Source: `content/data-viz/pages.json#/18`

Lesson route: `/learn/foundations/`

**مقتطف الدليل:** Age: continuous as an exact number; categorical when grouped into age bands.

Evidence pointer: `/18/blocks/29/items/0`

## hansa-bank-235 — الشهور قد تكون فئات للمقارنة

visualization / foundations · draft

**الموقف:** هل وجود حقل زمني يفرض معالجة مستمرة دائمًا؟

**الخلاصة:** قد يعالج الزمن كتتابع لدراسة سلسلة، أو كفترات مسماة عند مقارنة مجموعات منفصلة.

**القيد:** حدد هل السؤال عن التطور أم عن مقارنة فترات.

Source: `content/data-viz/pages.json#/18`

Lesson route: `/learn/foundations/`

**مقتطف الدليل:** Time: continuous/ordered when studying a time series; categorical when comparing named months or reporting periods as discrete groups.

Evidence pointer: `/18/blocks/30/items/0`

## hansa-bank-236 — اقرأ وحدة المحور الرأسي للهستوجرام

visualization / distribution · draft

**الموقف:** هل ارتفاع عمود Histogram هو عدد المشاهدات دائمًا؟

**الخلاصة:** قد يعرض المحور الرأسي عددًا أو كثافة أو كمية مطبعة؛ تفسير الارتفاع يبدأ بقراءة وحدته.

**القيد:** لا تقارن ارتفاعات بوحدات مختلفة كأنها أعداد خام.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Y-axis: usually count; depending on the implementation it can also represent density or another normalized quantity.

Evidence pointer: `/16/blocks/8/items/0`

## hansa-bank-237 — قمم متعددة تفتح سؤالًا عن المجموعات

visualization / distribution · draft

**الموقف:** ماذا تفحص عندما ترى أكثر من قمة بارزة؟

**الخلاصة:** تعدد القمم قد يشير إلى مجموعات فرعية مختلفة أو مزيج من العمليات.

**القيد:** هذا احتمال للفحص وليس إثباتًا لسبب بعينه.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Multiple modes can suggest heterogeneous subpopulations or a mixture of processes.

Evidence pointer: `/16/blocks/20/inline/0/text`

## hansa-bank-238 — ثبّت تعريف الصناديق عند المقارنة

visualization / distribution · draft

**الموقف:** هل يكفي وضع Histogramين جنبًا إلى جنب؟

**الخلاصة:** اختلاف حدود الفترات أو المقاييس قد يجعل المقارنة مضللة؛ راجع اتساقهما قبل تفسير الفروق.

**القيد:** اذكر أي اختلاف مقصود في التطبيع أو المقياس.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Comparing histograms with incompatible scales or bin definitions.

Evidence pointer: `/16/blocks/38/items/0/0/text`

## hansa-bank-239 — الفئات ليست فترات Histogram

visualization / distribution · draft

**الموقف:** عند مقارنة أقسام الشركة، هل تجعل كل قسم bin؟

**الخلاصة:** Histogram يجمع قيمًا مستمرة في فترات عددية؛ الفئات المنفصلة مع مؤشر تلائم Bar Plot.

**القيد:** تشابه الأعمدة شكليًا لا يجعل السؤال التحليلي واحدًا.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Histogram bins represent adjacent numeric intervals; bar categories are discrete groups.

Evidence pointer: `/16/blocks/143/inline/0/text`

## hansa-bank-240 — متوسط المجموعة لا يعرض توزيعها

visualization / distribution · draft

**الموقف:** هل عمود متوسط الراتب يكشف اختلاف الرواتب داخل القسم؟

**الخلاصة:** Bar Plot يعرض عادة مؤشرًا ملخصًا، بينما Box Plot يعرض ملخص توزيع مشاهدات كل فئة.

**القيد:** اختر نوع العرض وفق سؤال المقارنة لا وفق التشابه البصري.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Average salary by department → Bar plot. Distribution of salaries within each department → Box plot.

Evidence pointer: `/16/blocks`

## hansa-bank-241 — اتساع السحابة قد يتغير

visualization / relationships · draft

**الموقف:** هل تفحص اتجاه العلاقة فقط في Scatter Plot؟

**الخلاصة:** افحص أيضًا هل الانتشار الرأسي يتغير مع X؛ تغير التشتت جزء من شكل العلاقة.

**القيد:** الانطباع البصري يحتاج فحصًا إضافيًا قبل استنتاج نموذج إحصائي.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Changing variance: whether the vertical spread changes with X.

Evidence pointer: `/16/blocks/78/items/0`

## hansa-bank-242 — النقطة تمثل مشاهدة

visualization / relationships · draft

**الموقف:** قبل تفسير Scatter Plot، ما وحدة النقطة؟

**الخلاصة:** في التوصيف الأساسي كل نقطة مشاهدة واحدة، وX متغير تفسيري وY متغير استجابة.

**القيد:** تسمية X تفسيريًا لا تثبت أنه سبب Y.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Each point = one observation.

Evidence pointer: `/16/blocks/71/items/0/0/text`

## hansa-bank-243 — الخط الملائم أداة تشخيص

visualization / relationships · draft

**الموقف:** هل الخط المستقيم الملائم يثبت أن العلاقة خطية؟

**الخلاصة:** يساعد الخط على تقييم ملاءمة التقريب الخطي، وقد يكشف منحنى سلس نمطًا غير خطي منتظمًا.

**القيد:** الرسم الملائم وصف مساعد، وليس إثباتًا سببيًا.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** A fitted straight line can help diagnose whether a linear model is a reasonable approximation.

Evidence pointer: `/16/blocks/88/inline/0/text`

## hansa-bank-244 — اذكر أي محور حوّلته لوغاريتميًا

visualization / relationships · draft

**الموقف:** هل نفس تفسير الخط المستقيم يصلح لكل رسم لوغاريتمي؟

**الخلاصة:** تفسير العلاقة يتغير بحسب تحويل Y وحده أو تحويل المتغيرين؛ اذكر المحاور المحولة بوضوح.

**القيد:** لا تستنتج نوع النمو من شكل الخط دون معرفة المقياس.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** If both variables are transformed, interpretation changes accordingly; always state which axes are logged.

Evidence pointer: `/16/blocks/186/inline/0/text`

## hansa-bank-245 — نقاط الفئات تختلف عن نقاط العلاقة

visualization / relationships · draft

**الموقف:** هل كل رسم بالنقاط هو Scatter Plot؟

**الخلاصة:** Dot Plot يقارن مؤشرًا عدديًا عبر فئات؛ Scatter Plot يفحص علاقة بين متغيرين عدديين.

**القيد:** حدد دور كل محور قبل تسمية الرسم أو تفسيره.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Dot plot: category + numeric metric; compare category-level values.

Evidence pointer: `/16/blocks/160/items/0`

## hansa-bank-246 — الأسماء الطويلة تستفيد من الأعمدة الأفقية

visualization / comparison · draft

**الموقف:** تتزاحم أسماء الفئات أسفل الأعمدة؛ ما التعديل المناسب؟

**الخلاصة:** الأعمدة الأفقية غالبًا تسمح بقراءة أسماء الفئات الطويلة دون تدوير النص.

**القيد:** راجع المساحة وعدد الفئات في التصميم الفعلي.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Horizontal bars are often preferable when category labels are long, because they remain readable without rotating text.

Evidence pointer: `/16/blocks/125/inline/0/text`

## hansa-bank-247 — أكثر من مؤشر في إطار نقطي واحد

visualization / comparison · draft

**الموقف:** كيف تعرض قيم مؤشرات متعددة للفئة نفسها؟

**الخلاصة:** يمكن للعرض بالنقاط وضع قيم متعددة لكل فئة على إطار عددي مشترك.

**القيد:** يجب أن تكون المقارنة على الإطار المشترك ذات معنى وأن تظل هوية المؤشرات واضحة.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Dot-based displays can place multiple metric values for the same category on the same numeric framework

Evidence pointer: `/16/blocks/153/inline/0/text`

## hansa-bank-248 — الصفر لا يظهر على محور لوغاريتمي عادي

visualization / comparison · draft

**الموقف:** لماذا لا يبدأ المحور اللوغاريتمي من الصفر؟

**الخلاصة:** الصفر لا يملك موضعًا منتهيًا على محور لوغاريتمي؛ لذلك لا يمكن نقله إليه كما في محور خطي.

**القيد:** راجع طريقة الأداة في التعامل مع القيم غير القابلة للعرض.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** A logarithmic axis cannot represent zero

Evidence pointer: `/16/blocks/148/inline/0/text`

## hansa-bank-249 — التباين يشمل العلامات والحالات

visualization / accessibility · draft

**الموقف:** هل اختبار لون النص وحده كافٍ؟

**الخلاصة:** اختبار التباين يشمل labels وgridlines وmarkers والحالات المهمة، وفي أكثر من وضع عرض.

**القيد:** وضوح النص لا يضمن وضوح باقي أجزاء الرسم.

Source: `content/data-viz/pages.json#/0`

Lesson route: `/learn/accessibility-color-qa/`

**مقتطف الدليل:** اختبر النصوص، labels، gridlines، markers، وstates المهمة في أكثر من حالة عرض.

Evidence pointer: `/0/blocks/9/inline/0/text`

## hansa-bank-250 — اختبار الرمادي يكشف فقدان المعنى

visualization / accessibility · draft

**الموقف:** ماذا تختبر عند عرض الرسم بتدرج رمادي؟

**الخلاصة:** راجع بقاء الرسالة الأساسية واضحة؛ اختفاء الفروق يكشف اعتمادًا زائدًا على Hue وحده.

**القيد:** اختبار الرمادي جزء من المراجعة وليس اختبار إتاحة كاملًا.

Source: `content/data-viz/pages.json#/0`

Lesson route: `/learn/accessibility-color-qa/`

**مقتطف الدليل:** إذا اختفى الفرق بالكامل، فالاعتماد على hue وحده غالبًا مشكلة.

Evidence pointer: `/0/blocks/11/inline/0/text`

## hansa-bank-251 — الإتاحة تشمل طريق القراءة والتنقل

visualization / accessibility · draft

**الموقف:** هل لوحة جميلة بصريًا تعني أنها متاحة؟

**الخلاصة:** تضم المراجعة ترتيب القراءة والتنقل بلوحة المفاتيح عندما ينطبق، مع وضوح التسميات والحالات.

**القيد:** اختبر سيناريوهات استخدام فعلية بدل الاكتفاء بانطباع الشكل.

Source: `content/data-viz/pages.json#/0`

Lesson route: `/learn/accessibility-color-qa/`

**مقتطف الدليل:** keyboard/navigation behavior عندما ينطبق، labels، عدم الاعتماد على اللون فقط، وضوح states، وترتيب القراءة

Evidence pointer: `/0/blocks/14/inline/0/text`

## hansa-bank-252 — قارن المسارات عبر السلاسل

visualization / time · draft

**الموقف:** تريد رؤية اختلاف تطور مبيعات المناطق؛ ماذا تضيف السلاسل المتعددة؟

**الخلاصة:** يمكن لعدة خطوط إظهار مسارات مجموعات مختلفة عبر الزمن في رسم واحد.

**القيد:** يجب أن تظل هوية كل سلسلة واضحة وأن تكون المشاهدات متتابعة بمعنى حقيقي.

Source: `content/data-viz/pages.json#/16`

Lesson route: `/learn/core-chart-types/`

**مقتطف الدليل:** Multiple series can be shown together to compare trajectories

Evidence pointer: `/16/blocks/106/inline/0/text`

## hansa-bank-253 — تكرار الإجمالي قد يكشف علاقة مفقودة

power-bi / model · draft

**الموقف:** كل فئة تعرض نفس إجمالي المبيعات؛ ما الذي تفحصه؟

**الخلاصة:** في تمرين النموذج، غياب العلاقة بين Product وSales منع مرشح الفئة من الوصول للمبيعات فظهر الإجمالي نفسه.

**القيد:** هذا تفسير الحالة في الدرس؛ افحص النموذج الفعلي قبل تعميم التشخيص.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** because there isn't a model relationship between these tables, the `Sales` table isn't filtered.

Evidence pointer: `/tracks/1/lessons/16/blocks/20/text`

## hansa-bank-254 — تفرد المفتاح يفسر جهة الواحد

power-bi / model · draft

**الموقف:** كيف تعرف لماذا اختار النموذج علاقة واحد إلى متعدد؟

**الخلاصة:** في الدرس اكتشف Power BI تفرد ProductKey في جدول Product فاختار جهة الواحد لهذا الجدول.

**القيد:** راجع البيانات الفعلية ولا تعتمد على الاكتشاف التلقائي وحده.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** the `ProductKey` column from the `Product` table contains unique values.

Evidence pointer: `/tracks/1/lessons/16/blocks/30/items/1`

## hansa-bank-255 — العلاقة غير النشطة لا تمرر المرشح تلقائيًا

power-bi / model · draft

**الموقف:** ترى علاقة مرسومة لكن التصفية لا تسلكها؛ ما حالتها؟

**الخلاصة:** العلاقة النشطة تمرر المرشحات؛ غير النشطة لا تمررها افتراضيًا ويمكن لحسابات خاصة استخدامها.

**القيد:** وجود خط بين جدولين وحده لا يكفي لوصف مسار التصفية.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** Active relationships propagate filters.

Evidence pointer: `/tracks/1/lessons/16/blocks/30/items/3`

## hansa-bank-256 — اقرأ خط العلاقة نفسه

power-bi / model · draft

**الموقف:** ما الفرق بين الخط المتصل والمتقطع في مخطط النموذج؟

**الخلاصة:** الخط المتصل يمثل علاقة نشطة والمتقطع علاقة غير نشطة، والسهم يبين اتجاه التصفية.

**القيد:** راجع أيضًا رموز التعددية والأعمدة المرتبطة.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** A solid line represents an active relationship; a dotted line represents an inactive relationship.

Evidence pointer: `/tracks/1/lessons/16/blocks/35/text`

## hansa-bank-257 — مجلد العرض تنظيم منطقي

power-bi / model · draft

**الموقف:** هل نقل الحقول إلى Display Folder يغير البيانات؟

**الخلاصة:** مجلدات العرض تنظم تقديم الحقول في النموذج، خصوصًا في الجداول كثيرة الأعمدة.

**القيد:** هي تنظيم للعرض وليست تحويلًا لقيم الجدول.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** They're logical presentation only.

Evidence pointer: `/tracks/1/lessons/16/blocks/69/text`

## hansa-bank-258 — تصنيف الموقع يساعد الخريطة

power-bi / model · draft

**الموقف:** لماذا تحدد Data Category لحقل الدولة؟

**الخلاصة:** تصنيف الحقل كدولة أو منطقة يقدم معلومات أوضح للأداة عند رسم الخريطة.

**القيد:** تصنيف الحقل لا يغني عن مراجعة صحة قيم المواقع.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** categorizing the column as country or region provides more accurate information to Power BI when it renders a map visualization.

Evidence pointer: `/tracks/1/lessons/16/blocks/77/text`

## hansa-bank-259 — وصف الحقل يظهر أثناء التأليف

power-bi / model · draft

**الموقف:** كيف توضح معنى مقياس التكلفة لمؤلف التقرير؟

**الخلاصة:** وصف الجدول أو العمود أو المقياس يظهر كتلميح عند المرور على الحقل في Data pane.

**القيد:** اكتب وصفًا يعبر عن تعريف الحساب لا مجرد تكرار اسمه.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** description text is revealed in a tooltip when a report author hovers their cursor over the field.

Evidence pointer: `/tracks/1/lessons/16/blocks/90/text`

## hansa-bank-260 — التلخيص الافتراضي قد لا يناسب السعر

power-bi / model · draft

**الموقف:** ماذا تراجع إذا ظهر مجموع لأسعار الوحدات؟

**الخلاصة:** الدرس يغير Summarize By لسعر الوحدة من الجمع إلى المتوسط لأن الحقل يمثل سعرًا.

**القيد:** المتوسط البسيط ليس بالضرورة السعر المرجح المطلوب في كل تحليل.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** This default behavior isn't suitable for a column like `Unit Price`, which represents a rate.

Evidence pointer: `/tracks/1/lessons/16/blocks/96/text`

## hansa-bank-261 — إخفاء المفاتيح ينظّم واجهة النموذج

power-bi / model · draft

**الموقف:** هل كل عمود مستخدم في العلاقات يجب أن يراه مؤلف التقرير؟

**الخلاصة:** يخفي التمرين مفاتيح وأعمدة مستخدمة في العلاقات والأمان والحسابات لتنظيم الحقول الظاهرة.

**القيد:** الإخفاء تنظيم للواجهة؛ لا تتعامل معه كبديل لضبط الوصول.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** The columns were hidden because they're either used by relationships or will be used in row-level security configuration or calculation logic.

Evidence pointer: `/tracks/1/lessons/16/blocks/103/text`

## hansa-bank-262 — التاريخ التلقائي قد لا يطابق السنة المالية

power-bi / model · draft

**الموقف:** سنتك المالية تبدأ في يوليو؛ هل تعتمد على Date Hierarchy التلقائي؟

**الخلاصة:** في الدرس تبدأ السنة المالية في يوليو بينما تبدأ السنة في التسلسل التلقائي في يناير؛ يجب مواءمة تصميم التاريخ مع التقويم المطلوب.

**القيد:** راجع إعداد الملف وتقويم المؤسسة قبل بناء المقارنات.

Source: `content/academy/lessons.json#/tracks/1/lessons/16`

Lesson route: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

**مقتطف الدليل:** But, in these automatically created date hierarchies, the date hierarchy year commences on January 1 of each year.

Evidence pointer: `/tracks/1/lessons/16/blocks/114/text`

## hansa-bank-263 — تعويض التكلفة المفقودة له قاعدة محددة

power-bi / prepare · draft

**الموقف:** كيف عالج التمرين TotalProductCost المفقودة؟

**الخلاصة:** استخدم عدد الوحدات مضروبًا في التكلفة القياسية عند غياب التكلفة، وأبقى القيمة الأصلية عندما كانت موجودة.

**القيد:** هذه قاعدة التمرين وليست مبررًا عامًا لتعويض كل قيمة مفقودة.

Source: `content/academy/lessons.json#/tracks/1/lessons/15`

Lesson route: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

**مقتطف الدليل:** If missing, it produces a value by multiplying the **OrderQuantity** value by the **StandardCost** value; otherwise, it uses the existing **TotalProductCost** value.

Evidence pointer: `/tracks/1/lessons/15/blocks/113/text`

## hansa-bank-264 — أعمدة الشهور تتحول إلى صفوف

power-bi / prepare · draft

**الموقف:** لديك M01 إلى M12 كأعمدة؛ كيف تصبح الشهور قابلة للتحليل كحقل؟

**الخلاصة:** يستخدم التمرين Unpivot Other Columns مع تثبيت السنة والموظف، فتنتقل أسماء الأعمدة إلى Attribute وقيمها إلى Value.

**القيد:** راجع أعمدة الهوية التي يجب تثبيتها قبل التحويل.

Source: `content/academy/lessons.json#/tracks/1/lessons/15`

Lesson route: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

**مقتطف الدليل:** Notice that the column names now appear in the **Attribute** column, and the values appear in the **Value** column.

Evidence pointer: `/tracks/1/lessons/15/blocks/131/items/0`

## hansa-bank-265 — الإعداد الإقليمي يغير قراءة التاريخ

power-bi / prepare · draft

**الموقف:** هل 7/1/2017 يعني أول يوليو دائمًا؟

**الخلاصة:** في بيئة التمرين الأمريكية يعني أول يوليو؛ قراءة النص كتاريخ تعتمد على الإعداد الإقليمي.

**القيد:** ثبت تفسير اليوم والشهر عند تحويل البيانات.

Source: `content/academy/lessons.json#/tracks/1/lessons/15`

Lesson route: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

**مقتطف الدليل:** The virtual machine uses US regional settings, so this date is in fact July 1, 2017.

Evidence pointer: `/tracks/1/lessons/15/blocks/144/text`

## hansa-bank-266 — الأهداف بالألوف تحتاج تحويل الوحدة

power-bi / prepare · draft

**الموقف:** لماذا ضُرب عمود Target في 1000؟

**الخلاصة:** لأن المصدر خزّن الأهداف بوحدة الآلاف؛ التحويل يعيدها للوحدة المطلوبة للمقارنة.

**القيد:** لا تضرب تلقائيًا دون التحقق من وحدة المصدر.

Source: `content/academy/lessons.json#/tracks/1/lessons/15`

Lesson route: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

**مقتطف الدليل:** You may recall that the target values were stored as thousands.

Evidence pointer: `/tracks/1/lessons/15/blocks/155/text`

## hansa-bank-267 — استعلام مساعد لا يلزم تحميله كجدول

power-bi / prepare · draft

**الموقف:** لماذا عُطّل تحميل ColorFormats بعد الدمج؟

**الخلاصة:** تم دمج بياناته في Product المحمل للنموذج، لذلك احتفظ التمرين بالاستعلام دون تحميل جدول مستقل له.

**القيد:** تعطيل التحميل لا يعني حذف الاستعلام المستخدم في التحويل.

Source: `content/academy/lessons.json#/tracks/1/lessons/15`

Lesson route: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

**مقتطف الدليل:** Disabling the load means it will not load as a table to the data model.

Evidence pointer: `/tracks/1/lessons/15/blocks/189/text`

## hansa-bank-268 — خصوصية المصدر تخص تبادل البيانات بين المصادر

power-bi / prepare · draft

**الموقف:** هل إعداد Private يعني أن التقرير نفسه ممنوع من المشاركة؟

**الخلاصة:** شرح Power Query يربط مستويات الخصوصية بإمكان مشاركة البيانات بين المصادر أثناء المعالجة.

**القيد:** هذا الإعداد لا يحل محل صلاحيات مشاركة التقرير أو الوصول إليه.

Source: `content/academy/lessons.json#/tracks/1/lessons/15`

Lesson route: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

**مقتطف الدليل:** it means that the Power Query engine can't share data between the sources.

Evidence pointer: `/tracks/1/lessons/15/blocks/177/text`

## hansa-bank-269 — إجمالي المصفوفة له مستوى مختلف

power-bi / report · draft

**الموقف:** لماذا كانت مقارنة Total Sales بأول قيمة تساوي صفرًا في المثال؟

**الخلاصة:** الدرس يوضح أن الإجمالي يقع على مستوى هرمي مختلف عن السنوات، ويعد أول عمود على مستواه في هذا الحساب.

**القيد:** لا تفترض أن حساب الإجمالي يكرر حساب خلايا السنوات بالطريقة نفسها.

Source: `content/academy/lessons.json#/tracks/1/lessons/20`

Lesson route: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

**مقتطف الدليل:** considered the first column on that level.

Evidence pointer: `/tracks/1/lessons/20/blocks/63/text`

## hansa-bank-270 — المقارنة بالسابق تتبع ترتيب العرض

power-bi / report · draft

**الموقف:** ما الذي يسبق حساب Profit versus previous في التمرين؟

**الخلاصة:** يرتب التمرين السنوات تصاعديًا ثم يقارن الربح بالقيمة السابقة؛ ترتيب الفترات جزء من معنى المقارنة.

**القيد:** راجع ترتيب المحور قبل تفسير السابق زمنيًا.

Source: `content/academy/lessons.json#/tracks/1/lessons/20`

Lesson route: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

**مقتطف الدليل:** Sort the resulting bar chart by **Year** ascending

Evidence pointer: `/tracks/1/lessons/20/blocks/19/items/0`

## hansa-bank-271 — متوسط نافذتين يجمع فترتين متتاليتين

power-bi / report · draft

**الموقف:** ما معنى WindowSize بقيمة 2 في مثال الأرباح السنوية؟

**الخلاصة:** متوسط FY2019 المتحرك في المثال يحسب من أرباح FY2018 وFY2019.

**القيد:** هذا وصف لنافذة المثال؛ راجع سلوك الحدود والقيم المفقودة في التطبيق.

Source: `content/academy/lessons.json#/tracks/1/lessons/20`

Lesson route: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

**مقتطف الدليل:** the moving average for FY2019 is the average of the profits for FY2018 and FY2019.

Evidence pointer: `/tracks/1/lessons/20/blocks/36/text`

## hansa-bank-272 — محور FIRST يحدد أول ماذا

power-bi / report · draft

**الموقف:** لماذا تغيرت المقارنة بعد استبدال ROWS بـCOLUMNS؟

**الخلاصة:** في مصفوفة الفئات والسنوات، COLUMNS جعل المقارنة مقابل السنة المالية الأولى بدل الفئة الأولى.

**القيد:** حدد اتجاه الحساب بما يوافق تخطيط المصفوفة.

Source: `content/academy/lessons.json#/tracks/1/lessons/20`

Lesson route: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

**مقتطف الدليل:** Replace ROWS with COLUMNS and observe that the calculation now compares the sales amount per category against the first fiscal year

Evidence pointer: `/tracks/1/lessons/20/blocks/61/items/0`

## hansa-bank-273 — إعادة التراكم عند بداية السنة

power-bi / report · draft

**الموقف:** كيف جعل التمرين المجموع الجاري يبدأ مجددًا كل سنة مالية؟

**الخلاصة:** أضاف HIGHESTPARENT كمعامل إعادة ضبط في RUNNINGSUM على محور السنة والربع.

**القيد:** المعنى يعتمد على مستويات المحور؛ اختبر حدود السنوات في الرسم.

Source: `content/academy/lessons.json#/tracks/1/lessons/20`

Lesson route: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

**مقتطف الدليل:** This sum will reset at the beginning of every fiscal year.

Evidence pointer: `/tracks/1/lessons/20/blocks/66/text`

## hansa-bank-274 — إطار الماضي قد يستبعد الحالي

sql / windows · draft

**الموقف:** ماذا تعني النهاية 1 PRECEDING بدل CURRENT ROW؟

**الخلاصة:** في مثال ROWS BETWEEN 5 PRECEDING AND 1 PRECEDING تدخل الصفوف الخمسة السابقة ويستبعد الحالي.

**القيد:** تقل الصفوف المتاحة عند بداية المجموعة.

Source: `content/sql/vault.json#/pages/48`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

**مقتطف الدليل:** يشمل الخمسة صفوف السابقة، بدون current row.

Evidence pointer: `/pages/48/body`

## hansa-bank-275 — Pipeline تربط الأنشطة واعتمادياتها

fabric / ingestion · draft

**الموقف:** هل canvas مجرد قائمة أوامر مستقلة؟

**الخلاصة:** تجمع الأنشطة والعلاقات التي تحدد اعتمادها، ويمكنها استدعاء دفاتر أو Dataflows وخدمات مدعومة.

**القيد:** وجود نشاط لا يثبت نجاح شروط تشغيله.

Source: `content/fabric/notes.json#/2/chapters/1`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Movement, orchestration, and transformation

**مقتطف الدليل:** The canvas combines activities and their dependencies.

Evidence pointer: `/2/chapters/1/points/0`

## hansa-bank-276 — اسم فئة النشاط لا يوسع قدرته

fabric / ingestion · draft

**الموقف:** هل تصنيف Copy ضمن التحويل يمنحها أي معالجة معقدة؟

**الخلاصة:** اختر المحرك بحسب العملية الفعلية، لا بحسب عنوان فئة النشاط.

**القيد:** افحص عقد التحويل المدعوم قبل تصميم الحل.

Source: `content/fabric/notes.json#/2/chapters/1`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Movement, orchestration, and transformation

**مقتطف الدليل:** Choose an engine by the actual operation, not a category label.

Evidence pointer: `/2/chapters/1/caveat`

## hansa-bank-277 — Gateway تصل الشبكة ولا تمنح صلاحية قاعدة

fabric / ingestion · draft

**الموقف:** هل اتصال gateway يكفي لقراءة الجداول؟

**الخلاصة:** الاتصال لا يمنح database permissions؛ التفويض يحتاج تحققًا مستقلًا.

**القيد:** افصل اختبار الوصول الشبكي عن اختبار الصلاحيات.

Source: `content/fabric/notes.json#/2/chapters/3`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Connections, gateways, and directional support

**مقتطف الدليل:** Gateway connectivity does not grant database permissions.

Evidence pointer: `/2/chapters/3/caveat`

## hansa-bank-278 — موصل المصدر قد يختلف عن موصل الهدف

fabric / ingestion · draft

**الموقف:** هل دعم نظام كمصدر يعني دعمه كهدف لكل نشاط؟

**الخلاصة:** الدعم قد يختلف بحسب اتجاه المصدر والوجهة والنشاط؛ راجع المصفوفة الملائمة.

**القيد:** لا تعمم قدرة موصل على كل مسارات النقل.

Source: `content/fabric/notes.json#/2/chapters/3`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Connections, gateways, and directional support

**مقتطف الدليل:** Support varies by source/destination direction and activity.

Evidence pointer: `/2/chapters/3/points/0`

## hansa-bank-279 — Parameter مدخل وVariable حالة تنفيذ

fabric / ingestion · draft

**الموقف:** كيف تميز مدخل تشغيل عن حالة داخلية تتغير؟

**الخلاصة:** Parameters تدخل قيم التشغيل إلى workflow، بينما variables تمثل حالته الداخلية.

**القيد:** حدد ما يجب تمريره من الأب للابن صراحة.

Source: `content/fabric/notes.json#/2/chapters/4`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Parameters, variables, expressions, and child inputs

**مقتطف الدليل:** Variables represent internal execution state

Evidence pointer: `/2/chapters/4/points/0`

## hansa-bank-280 — الحالة المشتركة ليست مدخلًا محليًا لكل تكرار

fabric / ingestion · draft

**الموقف:** هل تستخدم variable مشتركة كأن لكل iteration نسختها؟

**الخلاصة:** يحذر المصدر من افتراض عزل shared mutable state لكل تكرار.

**القيد:** حدّد عقد التوازي ومدخلات كل عنصر.

Source: `content/fabric/notes.json#/2/chapters/4`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Parameters, variables, expressions, and child inputs

**مقتطف الدليل:** Never assume shared mutable state is an iteration-local input.

Evidence pointer: `/2/chapters/4/caveat`

## hansa-bank-281 — بدء التشغيل لا يعني جاهزية النتيجة

fabric / delivery · draft

**الموقف:** وصل ملف فبدأ run؛ هل تنشر الناتج فورًا؟

**الخلاصة:** الوصول قد يبدأ التشغيل، بينما نجاح الاعتماديات وفحوص الجودة يحدد جاهزية الإصدار.

**القيد:** اربط الإتاحة بالجاهزية المطلوبة لا بمجرد trigger.

Source: `content/fabric/notes.json#/2/chapters/5`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Schedules, time zones, triggers, and monitoring

**مقتطف الدليل:** arrival can start a run, while success/quality dependencies determine release.

Evidence pointer: `/2/chapters/5/points/1`

## hansa-bank-282 — Secure input/output تخص السجلات

fabric / ingestion · draft

**الموقف:** هل إخفاء المدخلات والمخرجات يجعل parser صحيحًا؟

**الخلاصة:** هذه الخيارات تغير التسجيل، ولا تصحح parsing أو تحقق جودة البيانات.

**القيد:** راجع التنسيق والتحقق بصورة مستقلة عن سرية السجل.

Source: `content/fabric/notes.json#/2/chapters/8`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section General policy and parsed Files source

**مقتطف الدليل:** Secure input/output changes logging, not parsing or data validation.

Evidence pointer: `/2/chapters/8/caveat`

## hansa-bank-283 — Binary غير تفسير CSV كصفوف

fabric / ingestion · draft

**الموقف:** لماذا يغير المثال المصدر إلى Delimited text؟

**الخلاصة:** ليفسر CSV كصفوف مع التعامل مع العنوان بدل معاملته كتدفق binary فقط.

**القيد:** حدد delimiter والاقتباس والعناوين وفق الملف الحقيقي.

Source: `content/fabric/notes.json#/2/chapters/8`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section General policy and parsed Files source

**مقتطف الدليل:** changes Binary to Delimited text.

Evidence pointer: `/2/chapters/8/points/0`

## hansa-bank-284 — Mapping تشمل أنواع الأعمدة

fabric / ingestion · draft

**الموقف:** لماذا يغير المثال year إلى integer وrating إلى double؟

**الخلاصة:** الربط إلى الهدف لا يقتصر على الأسماء؛ يتضمن ضبط أنواع الأعمدة المطلوبة.

**القيد:** تحقق من قابلية تحويل القيم الفعلية.

Source: `content/fabric/notes.json#/2/chapters/9`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Delta destination, replacement, mapping, and parallel copy

**مقتطف الدليل:** changes year to integer and rating to double

Evidence pointer: `/2/chapters/9/points/0`

## hansa-bank-285 — Overwrite اختيار لعقد الكتابة

fabric / ingestion · draft

**الموقف:** هل تنقل إعداد Overwrite من demo إلى تحميل تزايدي دون مراجعة؟

**الخلاصة:** المثال يختار Overwrite، بينما يفصل الشرح بين عقود snapshot والتحميل التزايدي.

**القيد:** حدد ما يجب الاحتفاظ به أو استبداله في الهدف.

Source: `content/fabric/notes.json#/2/chapters/9`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Delta destination, replacement, mapping, and parallel copy

**مقتطف الدليل:** distinct snapshot/incremental contracts

Evidence pointer: `/2/chapters/9/points/1`

## hansa-bank-286 — Succeeded دليل تنفيذ لا شهادة جودة

fabric / ingestion · draft

**الموقف:** هل نجاح Copy يثبت التفرد وسلامة العلاقات والقواعد المالية؟

**الخلاصة:** هو دليل على تنفيذ النشاط، لا ضمان مرور جميع قواعد العمل.

**القيد:** أضف التحقق المطلوب قبل إتاحة الناتج.

Source: `content/fabric/notes.json#/2/chapters/10`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Execution, metrics, and table verification

**مقتطف الدليل:** not a guarantee that uniqueness, referential completeness, or financial rules passed.

Evidence pointer: `/2/chapters/10/caveat`

## hansa-bank-287 — Default ليست منعًا لقيمة المستدعي

fabric / ingestion · draft

**الموقف:** هل القيمة الافتراضية للـparameter تمنع تمرير قيمة أخرى؟

**الخلاصة:** هي قيمة fallback، وليست قاعدة تمنع المستدعي من تحديد مدخل.

**القيد:** راجع المدخل الفعلي المسجل للنشاط.

Source: `content/fabric/notes.json#/2/chapters/11`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Parameterize source and destination

**مقتطف الدليل:** Defaults are fallback values

Evidence pointer: `/2/chapters/11/caveat`

## hansa-bank-288 — Interpolation قد تحول النوع إلى نص

fabric / ingestion · draft

**الموقف:** هل كل تعبير ديناميكي يعيد النوع العددي نفسه؟

**الخلاصة:** الاستيفاء يرجع نصًا، بينما قد يحتفظ تعبير الحقل الكامل بنوع عددي وفق الملاحظة.

**القيد:** افحص النوع المتوقع في المستهلك التالي.

Source: `content/fabric/notes.json#/2/chapters/11`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Parameterize source and destination

**مقتطف الدليل:** Interpolation returns text; whole-field expressions can retain numeric types.

Evidence pointer: `/2/chapters/11/caveat`

## hansa-bank-289 — Completion ليست Success فقط

fabric / delivery · draft

**الموقف:** متى يعمل مسار يعتمد على Completion في المثال؟

**الخلاصة:** يشمل النجاح أو الفشل، بينما يحتاج predecessor المتخطي شرط skip.

**القيد:** راجع الحالة الفعلية والشرط المحدد لكل وصلة.

Source: `content/fabric/notes.json#/2/chapters/12`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Success, failure, skipped, and completion traces

**مقتطف الدليل:** Completion covers success or failure

Evidence pointer: `/2/chapters/12/points/1`

## hansa-bank-290 — اتبع السابق المباشر في السلسلة

fabric / delivery · draft

**الموقف:** هل حالة أول نشاط تكفي لفهم كل الفروع التالية؟

**الخلاصة:** يطلب المصدر تتبع immediate predecessor عند كل edge؛ النشاط المتخطي ليس نشاطًا فاشلًا.

**القيد:** استنتج كل انتقال من علاقته المباشرة.

Source: `content/fabric/notes.json#/2/chapters/12`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Success, failure, skipped, and completion traces

**مقتطف الدليل:** Follow the immediate predecessor at each edge.

Evidence pointer: `/2/chapters/12/caveat`

## hansa-bank-291 — Wait لا تختبر الجاهزية

fabric / delivery · draft

**الموقف:** هل مرور تأخير ثابت يثبت اكتمال العمل السابق؟

**الخلاصة:** الانتظار الثابت ليس readiness check؛ يحتاج المسار شرط نجاح أو تحقق ملائم.

**القيد:** لا تعتمد على الوقت وحده لإطلاق استهلاك البيانات.

Source: `content/fabric/notes.json#/2/chapters/12`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Success, failure, skipped, and completion traces

**مقتطف الدليل:** a fixed Wait is not a readiness check.

Evidence pointer: `/2/chapters/12/caveat`

## hansa-bank-292 — علامة النجاح قد تكون بلا نقل بيانات

fabric / delivery · draft

**الموقف:** عطلت Copy وأعطيتها حالة نجاح؛ ماذا أثبتت؟

**الخلاصة:** الحالة المعيّنة قد توجه الفروع دون تنفيذ النقل.

**القيد:** لا تعتبر assigned success سجل تنفيذ Copy.

Source: `content/fabric/notes.json#/2/chapters/13`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Inactive activities and the old configuration workaround

**مقتطف الدليل:** assigned success does not show that data was copied.

Evidence pointer: `/2/chapters/13/caveat`

## hansa-bank-293 — النشاط المعطل لا يملك مخرجات Copy العادية

fabric / delivery · draft

**الموقف:** هل تعتمد الخطوة التالية على حقول output لنشاط غير منفذ؟

**الخلاصة:** placeholder غير النشط لا يملك حقول Copy العادية في وصف المصدر.

**القيد:** افحص عقود المخرجات عند تعطيل نشاط.

Source: `content/fabric/notes.json#/2/chapters/13`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Inactive activities and the old configuration workaround

**مقتطف الدليل:** An inactive placeholder has no normal Copy output fields

Evidence pointer: `/2/chapters/13/caveat`

## hansa-bank-294 — حفظ تعريف Pipeline غير تشغيلها

fabric / delivery · draft

**الموقف:** تم commit لتعريف JSON؛ هل run المقابلة نجحت؟

**الخلاصة:** تعريف الإعداد ونتيجة التنفيذ دليلان مختلفان؛ نجاح commit لا يثبت أن pipeline عملت.

**القيد:** راجع سجل التشغيل المناظر للإصدار.

Source: `content/fabric/notes.json#/2/chapters/7`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack pipelines, then section Canvas dependencies, Wait, schedule UI, and JSON

**مقتطف الدليل:** a successful source commit does not prove the corresponding pipeline ran.

Evidence pointer: `/2/chapters/7/caveat`

## hansa-bank-295 — Lakehouse عنصر فوق أساس تخزين

fabric / foundations · draft

**الموقف:** هل OneLake وLakehouse اسمان للكيان نفسه؟

**الخلاصة:** OneLake أساس التخزين على مستوى المستأجر، وLakehouse أحد عناصر Fabric التي تستخدمه.

**القيد:** افصل العنصر عن طبقة التخزين المشتركة.

Source: `content/fabric/notes.json#/0/chapters/0`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Lakehouse, OneLake, and access layers

**مقتطف الدليل:** A lakehouse is one Fabric item using it.

Evidence pointer: `/0/chapters/0/points/1`

## hansa-bank-296 — دعم Shortcut لا يساوي دعم Cache

fabric / ingestion · draft

**الموقف:** هل كل مصدر shortcut مدعوم يدخل في قائمة caching نفسها؟

**الخلاصة:** قائمتا مصادر shortcuts ومصادر cache مختلفتان في الملاحظة المحلية.

**القيد:** راجع القائمتين عند تطبيق ميزة متغيرة.

Source: `content/fabric/notes.json#/0/chapters/1`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Internal/external shortcuts and caching

**مقتطف الدليل:** Supported shortcut sources and supported cache sources are different lists.

Evidence pointer: `/0/chapters/1/caveat`

## hansa-bank-297 — Shortcut لا تستبدل النسخة الاحتياطية

fabric / ingestion · draft

**الموقف:** هل الاعتماد على مرجع للمصدر يحفظ نسخة مستقلة للتعافي؟

**الخلاصة:** تظل shortcut معتمدة على المصدر وليست backup.

**القيد:** حدد متطلبات الاحتفاظ والتعافي منفصلة عن المشاركة.

Source: `content/fabric/notes.json#/0/chapters/1`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Internal/external shortcuts and caching

**مقتطف الدليل:** A shortcut remains a source dependency, not a backup.

Evidence pointer: `/0/chapters/1/caveat`

## hansa-bank-298 — الحذف قد يمثَّل دون إعادة كتابة فورية

fabric / transform · draft

**الموقف:** هل كل حذف Delta يعيد كتابة ملف Parquet الأصلي فورًا؟

**الخلاصة:** قد تمثل deletion vectors الصفوف المحذوفة دون إعادة كتابة مباشرة للملف.

**القيد:** راجع طريقة الجدول وخصائصه؛ لا تعمم copy-on-write على كل حالة.

Source: `content/fabric/notes.json#/0/chapters/2`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Delta files, transaction logs, and controlled changes

**مقتطف الدليل:** without immediately rewriting the original Parquet file.

Evidence pointer: `/0/chapters/2/caveat`

## hansa-bank-299 — تحسين القراءة قد يضيف كلفة كتابة

fabric / transform · draft

**الموقف:** هل V-Order مكسب مجاني ثابت لكل عبء؟

**الخلاصة:** يعيد تنظيم Parquet عند الكتابة أو إعادة الكتابة لاستهلاك كثيف القراءة، مع overhead يعتمد على workload.

**القيد:** لا تحول متوسطًا من المصدر إلى ضمان أداء عام.

Source: `content/fabric/notes.json#/0/chapters/3`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section VACUUM, OPTIMIZE, and V-Order have different goals

**مقتطف الدليل:** with workload-dependent write overhead.

Evidence pointer: `/0/chapters/3/points/1`

## hansa-bank-300 — Pruning تحتاج شرطًا قابلًا للاستفادة

fabric / transform · draft

**الموقف:** متى يساعد partition key في تخطي المجلدات؟

**الخلاصة:** عندما تسمح المرشحات المستخدمة على المفاتيح باستبعاد أقسام من القراءة.

**القيد:** اسم المفتاح وحده لا يثبت أن استعلامًا بعينه سيستفيد.

Source: `content/fabric/notes.json#/0/chapters/4`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Partition hierarchy, pruning, and cardinality

**مقتطف الدليل:** Usable predicates on partition keys can skip directories.

Evidence pointer: `/0/chapters/4/points/1`

## hansa-bank-301 — ملفات Delta ليست مستندات مستقلة للتعديل

fabric / transform · draft

**الموقف:** هل تعدّل Parquet أو _delta_log مباشرة بأداة ملفات عامة؟

**الخلاصة:** قد يكسر ذلك الاتساق المعاملي خارج العمليات الواعية بـDelta.

**القيد:** استخدم مسار كتابة مصرحًا وملائمًا للجدول.

Source: `content/fabric/notes.json#/0/chapters/5`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section OneLake file explorer: safe abstraction boundaries

**مقتطف الدليل:** can break transactional consistency.

Evidence pointer: `/0/chapters/5/points/1`

## hansa-bank-302 — راحة إدارة الملفات لا تلغي الحوكمة

fabric / transform · draft

**الموقف:** هل سهولة حذف ملف أو نقله تكفي لاعتماد العملية؟

**الخلاصة:** تبقى متطلبات الحوكمة والمعاملات والاعتماديات قائمة رغم سهولة الأداة.

**القيد:** راجع نوع العنصر وأثره قبل أي عملية.

Source: `content/fabric/notes.json#/0/chapters/5`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section OneLake file explorer: safe abstraction boundaries

**مقتطف الدليل:** File-management convenience does not remove governance, transaction, or dependency requirements.

Evidence pointer: `/0/chapters/5/caveat`

## hansa-bank-303 — Schema مساحة أسماء وليست Partition

fabric / foundations · draft

**الموقف:** هل schema في Tables تعني مرحلة medallion أو مفتاح تقسيم؟

**الخلاصة:** تنظم schemas أسماء الكائنات، ولا تساوي مفاتيح partition أو مراحل المعالجة.

**القيد:** حدد وظيفة كل طبقة قبل رسم المعمارية.

Source: `content/fabric/notes.json#/0/chapters/6`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Demo: raw uploads and lakehouse schemas

**مقتطف الدليل:** Schemas organize names; they are not partition keys or medallion stages.

Evidence pointer: `/0/chapters/6/points/1`

## hansa-bank-304 — إعادة تسمية جدول تمتد إلى مراجع المستهلكين

fabric / foundations · draft

**الموقف:** هل ينتهي التغيير عند نقل أو إعادة تسمية الجدول؟

**الخلاصة:** قد تحتاج مراجع notebooks وdataflows وSQL إلى التحديث.

**القيد:** احصر الاعتماديات قبل إجراء النقل.

Source: `content/fabric/notes.json#/0/chapters/6`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Demo: raw uploads and lakehouse schemas

**مقتطف الدليل:** Renaming or moving a table requires updating dependent

Evidence pointer: `/0/chapters/6/points/2`

## hansa-bank-305 — صورة المجلدات ليست اختبار أداء

fabric / transform · draft

**الموقف:** هل مشاهدة hierarchy التقسيم تثبت أن التخطيط أسرع؟

**الخلاصة:** تعرض التنظيم الفيزيائي فقط؛ قارن الأداء على أحمال وتوزيعات ممثلة.

**القيد:** لا تنقل عدد مجلدات demo صغير كقرار إنتاج.

Source: `content/fabric/notes.json#/0/chapters/7`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Demo: one logical dataset, three physical layouts

**مقتطف الدليل:** not proof that one design is fastest.

Evidence pointer: `/0/chapters/7/points/1`

## hansa-bank-306 — الصيانة واسعة النطاق تحتاج تشغيلًا مرصودًا

fabric / delivery · draft

**الموقف:** كيف تتعامل مع آلاف الجداول بدل النقر المتكرر؟

**الخلاصة:** يقترح المصدر workflow صيانة مجدولة وقابلة للمراقبة مع اعتماديات نجاح واحتفاظ لكل جدول.

**القيد:** راجع توقيتها وتأثيرها على القراء والكتابات.

Source: `content/fabric/notes.json#/0/chapters/8`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Demo: portal maintenance and scheduled automation

**مقتطف الدليل:** scheduled, observable maintenance workflow

Evidence pointer: `/0/chapters/8/points/1`

## hansa-bank-307 — لغة صيانة Spark ليست T-SQL endpoint

fabric / delivery · draft

**الموقف:** هل تلصق أوامر صيانة Spark في محرر endpoint SQL؟

**الخلاصة:** المحركان ومسارات الإدارة مختلفان؛ استخدم السطح الداعم للأمر.

**القيد:** تشابه SQL الظاهري لا يعني توافق التنفيذ.

Source: `content/fabric/notes.json#/0/chapters/8`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Demo: portal maintenance and scheduled automation

**مقتطف الدليل:** do not paste Spark maintenance SQL into its T-SQL editor.

Evidence pointer: `/0/chapters/8/points/2`

## hansa-bank-308 — قراءة البيانات فقط لا تمنع كل Metadata

fabric / query · draft

**الموقف:** كيف ينجح CREATE VIEW بينما يرفض UPDATE في المثال؟

**الخلاصة:** يقيد endpoint كتابة بيانات Lakehouse، لكنه قد يدعم كائنات SQL للقراءة داخل حدوده.

**القيد:** افصل تعديل البيانات عن إنشاء كائن قراءة مدعوم.

Source: `content/fabric/notes.json#/0/chapters/10`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Demo: SQL analytics, SSMS, read-only data, and views

**مقتطف الدليل:** Read-only data does not mean no SQL metadata operations.

Evidence pointer: `/0/chapters/10/caveat`

## hansa-bank-309 — View الـendpoint ليست Delta table جديدة

fabric / query · draft

**الموقف:** هل إنشاء view يجعلها جدولًا materialized يراه Spark بالطريقة نفسها؟

**الخلاصة:** هي كائن SQL في endpoint، وليست تلقائيًا managed Delta table جديدة.

**القيد:** راجع واجهة الاستهلاك التي تستهدفها.

Source: `content/fabric/notes.json#/0/chapters/10`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack delta, then section Demo: SQL analytics, SSMS, read-only data, and views

**مقتطف الدليل:** not a newly materialized managed Delta table

Evidence pointer: `/0/chapters/10/points/2`

## hansa-bank-310 — خبرة SQL Server لا تثبت تطابق Fabric

fabric / query · draft

**الموقف:** هل تنقل triggers وكائنات مألوفة كما هي؟

**الخلاصة:** المفاهيم المألوفة لا تضمن feature parity؛ راجع الدعم الفعلي للمحرك.

**القيد:** المصدر محلي؛ يحتاج عقد المنتج مراجعة قبل النشر.

Source: `content/fabric/notes.json#/1/chapters/0`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Warehouse architecture and workload selection

**مقتطف الدليل:** Familiar SQL Server concepts do not guarantee feature parity.

Evidence pointer: `/1/chapters/0/caveat`

## hansa-bank-311 — افصل قرارات التحضير والنقل والتنسيق

fabric / ingestion · draft

**الموقف:** هل تختار أداة واحدة لأن اسمها يغطي كل خط البيانات؟

**الخلاصة:** اعتبر preparation وmovement وorchestration وexecution target قرارات منفصلة.

**القيد:** قد تجمع أداة وظائف، لكن متطلبات كل وظيفة تظل مستقلة.

Source: `content/fabric/notes.json#/1/chapters/2`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Pipelines, Dataflow Gen2, notebooks, and connectors

**مقتطف الدليل:** Treat preparation, movement, orchestration, and execution target as separate decisions.

Evidence pointer: `/1/chapters/2/points/1`

## hansa-bank-312 — TDS يحتاج اتصال SQL لا مسار ملف

fabric / query · draft

**الموقف:** هل تعطي عميل SQL عنوان OneLake كأنه connection string؟

**الخلاصة:** استخدم معلومات اتصال SQL الفعلية لـTDS؛ مسار ملفات OneLake واجهة أخرى.

**القيد:** تحقق من العميل والبروتوكول والصلاحيات.

Source: `content/fabric/notes.json#/1/chapters/3`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Reading data through SQL, Power BI, and clients

**مقتطف الدليل:** OneLake file paths belong to a different interface.

Evidence pointer: `/1/chapters/3/points/1`

## hansa-bank-313 — التقرير التاريخي يحتاج ساعة مشتركة

fabric / query · draft

**الموقف:** هل تكفي عبارة نريد بيانات قديمة دون cutoff؟

**الخلاصة:** يحتاج التقرير المستقر cutoff UTC مقصودًا وتاريخًا متاحًا وصلاحية قراءة.

**القيد:** احتفاظ كل مصدر ومرجعه الزمني جزء من قابلية إعادة النتيجة.

Source: `content/fabric/notes.json#/1/chapters/4`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Historical states and reporting cutoffs

**مقتطف الدليل:** the intended shared UTC cutoff

Evidence pointer: `/1/chapters/4/points/1`

## hansa-bank-314 — Zero-copy تبدأ بمراجع للملفات

fabric / delivery · draft

**الموقف:** هل clone صفرية النسخ تعني نسخ كل ملف فورًا؟

**الخلاصة:** تبدأ بمراجع إلى الملفات القائمة عبر metadata منسوخة في وصف المصدر.

**القيد:** راجع نطاق دعم clone وشروطها قبل التنفيذ.

Source: `content/fabric/notes.json#/1/chapters/5`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Clones: shared initial files, independent table state

**مقتطف الدليل:** initially references existing data files through copied metadata.

Evidence pointer: `/1/chapters/5/points/0`

## hansa-bank-315 — Zero-copy لا تعد بتكلفة تخزين مستقبلية صفر

fabric / delivery · draft

**الموقف:** ماذا يحدث مع تغير المصدر والنسخة لاحقًا؟

**الخلاصة:** قد تتباعد احتياجات تخزين المصدر والنسخة مع التغيرات.

**القيد:** قِس الأثر المستقبلي بدل تعميم كلفة الإنشاء الأولية.

Source: `content/fabric/notes.json#/1/chapters/5`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Clones: shared initial files, independent table state

**مقتطف الدليل:** Initial zero-copy does not mean unlimited future storage is free.

Evidence pointer: `/1/chapters/5/points/1`

## hansa-bank-316 — تغيير العميل لا يغير قدرات المحرك

fabric / query · draft

**الموقف:** هل الانتقال إلى SSMS يتيح عملية غير مدعومة أصلًا؟

**الخلاصة:** تغيير تطبيق العميل لا يغير العمليات التي يدعمها المحرك.

**القيد:** راجع العقد على جهة الخدمة وليس اسم البرنامج المستخدم.

Source: `content/fabric/notes.json#/1/chapters/7`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section SQL templates, Copilot, and SSMS connection

**مقتطف الدليل:** Changing client applications does not change the engine's supported operations.

Evidence pointer: `/1/chapters/7/points/1`

## hansa-bank-317 — الوقت الحالي يجعل القراءة التاريخية متحركة

fabric / query · draft

**الموقف:** هل صفوف قديمة مع تعبير current-time تكفي لإعادة تقرير سابق؟

**الخلاصة:** التعبير يقيم وقت الاستعلام؛ استخدم as-of date صريحًا عندما تحتاج تكرار النتيجة.

**القيد:** افصل تاريخ البيانات عن ساعة التقرير.

Source: `content/fabric/notes.json#/1/chapters/8`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Employee table and a query-time tenure view

**مقتطف الدليل:** use an explicit as-of date when reproducibility matters.

Evidence pointer: `/1/chapters/8/points/1`

## hansa-bank-318 — DATEDIFF(year) ليست سنوات مكتملة

fabric / query · draft

**الموقف:** هل طرح حدود السنوات يعطي دائمًا عدد أعياد التعيين المكتملة؟

**الخلاصة:** يعد DATEDIFF(year) حدود السنوات، لا anniversaries المكتملة في تنبيه المصدر.

**القيد:** اختبر منطق المدة وفق تعريف العمل المطلوب.

Source: `content/fabric/notes.json#/1/chapters/8`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Employee table and a query-time tenure view

**مقتطف الدليل:** counts year boundaries, not completed hire anniversaries.

Evidence pointer: `/1/chapters/8/caveat`

## hansa-bank-319 — إدارة Blob غير قراءة محتواها

fabric / security · draft

**الموقف:** هل صلاحية management-plane تساوي تصريح data-plane read؟

**الخلاصة:** يميز المصدر بينهما، فلا تثبت الأولى القدرة على قراءة البيانات.

**القيد:** افحص الدور الذي يمنح العملية الفعلية المطلوبة.

Source: `content/fabric/notes.json#/1/chapters/10`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section COPY INTO: private CSV, header, permissions, and retry

**مقتطف الدليل:** Blob data-plane read differs from management-plane access.

Evidence pointer: `/1/chapters/10/caveat`

## hansa-bank-320 — البيانات التاريخية لا تعيد المخطط تلقائيًا

fabric / query · draft

**الموقف:** هل توفر لقطة صفوف قديمة يثبت إعادة بناء schema القديمة؟

**الخلاصة:** قيود المخطط الحالي لا تساوي historical schema reconstruction.

**القيد:** راجع الأعمدة ووقت إنشاء view والتاريخ المتاح.

Source: `content/fabric/notes.json#/1/chapters/11`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Time-travel demo: six rows before the three-row load

**مقتطف الدليل:** Current schema constraints do not equal historical schema reconstruction.

Evidence pointer: `/1/chapters/11/points/1`

## hansa-bank-321 — عمود المصدر قد يغير مقارنة UNION

fabric / query · draft

**الموقف:** أضفت Source literal لتمييز الأصل؛ هل يظل تعريف الصف المكرر نفسه؟

**الخلاصة:** قد يؤثر العمود الجديد في مقارنة التكرار بين الصفوف لأنه أصبح جزءًا من النتيجة.

**القيد:** راجع ما تريد اعتباره مكررًا قبل إضافة أو إسقاط الحقول.

Source: `content/fabric/notes.json#/1/chapters/12`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Cross-database demo and one-way SQL materialization

**مقتطف الدليل:** An added Source literal identifies origin and can affect UNION duplicate comparison.

Evidence pointer: `/1/chapters/12/points/1`

## hansa-bank-322 — الاسترجاع من Clone قد يفقد إدخالًا لاحقًا

fabric / delivery · draft

**الموقف:** كانت clone عند11 صفًا ثم صار المصدر12؛ ماذا يعيد المثال؟

**الخلاصة:** إعادة التعبئة من النسخة تعيد11 وتغفل الإدخال الذي حدث بعدها.

**القيد:** حدد نقطة الاسترجاع المطلوبة وراجع الفروق قبل أي تنفيذ.

Source: `content/fabric/notes.json#/1/chapters/13`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Clone demo: insert, truncate, recover, and clone a prior state

**مقتطف الدليل:** restores eleven rows and omits the later insert.

Evidence pointer: `/1/chapters/13/points/1`

## hansa-bank-323 — استرجاع المثال ليس عملية تعافٍ مكتملة

fabric / delivery · draft

**الموقف:** ما الشروط التي يذكرها تمرين الاسترجاع قبل تغيير الإنتاج؟

**الخلاصة:** يفترض مخططًا ثابتًا وتاريخًا محتفظًا به وصلاحيات وتحققًا ونقطة مراجعة صريحة.

**القيد:** هذا تمرين قرارات محلي وليس إثبات تنفيذ تعافٍ حي.

Source: `content/fabric/notes.json#/1/chapters/13`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Clone demo: insert, truncate, recover, and clone a prior state

**مقتطف الدليل:** require unchanged schema, retained history, permissions, validation

Evidence pointer: `/1/chapters/13/caveat`

## hansa-bank-324 — الدالة والإجراء لهما استخدامان مختلفان

fabric / query · draft

**الموقف:** تحتاج منطقًا يرجع قيمة أو صفوفًا قابلة للتركيب؛ هل أي procedure بديل؟

**الخلاصة:** يميّز المصدر functions التي تعيد قيمًا أو صفوفًا قابلة للتركيب عن procedures التي تنفذ workflow.

**القيد:** اختر عقد الكائن الملائم لطريقة الاستدعاء.

Source: `content/fabric/notes.json#/1/chapters/1`

Lesson route: `/lab/dp-600/resources/`

Open resources, choose pack warehouse, then section Schemas, tables, views, functions, and procedures

**مقتطف الدليل:** functions return values or composable rows

Evidence pointer: `/1/chapters/1/points/0`

## hansa-bank-325 — عنصر Array غير المصفوفة كاملة

sql / postgresql · draft

**الموقف:** تبحث عن قيمة مفردة داخل Array؛ هل تقارن العمود كله بنص؟

**الخلاصة:** استخدم الوصول إلى عنصر أو عملية بحث في العناصر بحسب السؤال، بدل مقارنة array كاملة بقيمة scalar.

**القيد:** راجع أبعاد المصفوفة ونوع عناصرها.

Source: `content/sql/vault.json#/pages/33`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

**مقتطف الدليل:** Array وليس scalar value.

Evidence pointer: `/pages/33/body`

## hansa-bank-326 — ANY تبحث بين العناصر

sql / postgresql · draft

**الموقف:** تريد معرفة هل توجد قيمة مطابقة داخل المصفوفة؛ ما الفكرة؟

**الخلاصة:** ANY تتيح اختبار المطابقة مع عنصر من عناصر المصفوفة.

**القيد:** راجع شكل التعبير والمصفوفة الممررة، خصوصًا مع الأبعاد المتعددة.

Source: `content/sql/vault.json#/pages/33`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

**مقتطف الدليل:** هل توجد قيمة مطابقة في أي عنصر؟

Evidence pointer: `/pages/33/body`

## hansa-bank-327 — احتواء مجموعة داخل Array

sql / postgresql · draft

**الموقف:** ماذا تعني @> بين مصفوفتين في المثال؟

**الخلاصة:** المصفوفة على اليسار تحتوي عناصر المصفوفة على اليمين.

**القيد:** هذا اختبار احتواء لا مقارنة مرتبة عنصرًا بعنصر.

Source: `content/sql/vault.json#/pages/33`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

**مقتطف الدليل:** تحتوي عناصر الـ array على اليمين.

Evidence pointer: `/pages/33/body`

## hansa-bank-328 — الفهرس غير الموجود قد ينتج NULL

sql / postgresql · draft

**الموقف:** طلبت عنصرًا خارج العناصر الموجودة؛ هل النتيجة قيمة فعلية؟

**الخلاصة:** قد تحصل على NULL عند طلب index غير موجود في مثال المصدر.

**القيد:** لا تفسرها كقيمة عادية أو تتجاهل حدود المصفوفة.

Source: `content/sql/vault.json#/pages/33`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

**مقتطف الدليل:** إذا طلبت index غير موجود، يمكن أن تحصل على

Evidence pointer: `/pages/33/body`

## hansa-bank-329 — قائمة داخل صف أم جدول عناصر؟

sql / postgresql · draft

**الموقف:** تكرر الاستعلام المعقد على عناصر arrays؛ ماذا تراجع في التصميم؟

**الخلاصة:** يقترح المصدر التفكير في جدول منفصل ومطبع للعناصر عند كثرة التحليل المعقد عليها.

**القيد:** الاختيار يتبع نمط الاستخدام، لا حظرًا عامًا للمصفوفات.

Source: `content/sql/vault.json#/pages/33`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

**مقتطف الدليل:** فكّر في normalization لجدول منفصل

Evidence pointer: `/pages/33/body`

## hansa-bank-330 — طول النص أداة تحقق

sql / text · draft

**الموقف:** كيف تكتشف اسمًا طويلًا بشكل غير معتاد؟

**الخلاصة:** LENGTH وCHAR_LENGTH تعيدان عدد أحرف النص، ويمكن استخدامه لفحص القيم المشبوهة.

**القيد:** الطول غير المعتاد إشارة للفحص وليس إثبات خطأ.

Source: `content/sql/vault.json#/pages/34`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

**مقتطف الدليل:** الاثنين يرجعان عدد الأحرف في النص.

Evidence pointer: `/pages/34/body`

## hansa-bank-331 — POSITION تحدد حد الاستخراج

sql / text · draft

**الموقف:** قبل فصل username عن domain، ما الذي تحتاج تحديده؟

**الخلاصة:** ابحث عن موضع @ باستخدام POSITION أو STRPOS، ثم استخدمه كحد للاستخراج.

**القيد:** تحقق من صلاحية النص قبل افتراض وجود الفاصل.

Source: `content/sql/vault.json#/pages/34`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

**مقتطف الدليل:** تحديد الحد الفاصل بين username وdomain في إيميل.

Evidence pointer: `/pages/34/body`

## hansa-bank-332 — LEFT وRIGHT تحددان طرف النص

sql / text · draft

**الموقف:** تريد مقدمة وصف أو آخر أربعة أحرف من رقم؛ ما العملية المناسبة؟

**الخلاصة:** LEFT تستخرج من البداية وRIGHT من النهاية حسب عدد الأحرف المحدد.

**القيد:** الاستخراج ليس تحققًا من صحة الرقم أو النص.

Source: `content/sql/vault.json#/pages/34`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

**مقتطف الدليل:** استخراج أحرف من البداية أو النهاية.

Evidence pointer: `/pages/34/body`

## hansa-bank-333 — SUBSTRING تجمع البداية والطول

sql / text · draft

**الموقف:** ما المعلومات التي تحدد الجزء المقتطع من نص؟

**الخلاصة:** الصيغة المعروضة تستخدم النص وموضع البداية وطول الجزء المطلوب.

**القيد:** راجع صياغة اللهجة المستخدمة وحدود النص.

Source: `content/sql/vault.json#/pages/34`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

**مقتطف الدليل:** SUBSTRING(source, start, length)

Evidence pointer: `/pages/34/body`

## hansa-bank-334 — ركّب دوال النص حول حد واضح

sql / text · draft

**الموقف:** هل تحتاج معالجة يدوية لفصل domain بعد @؟

**الخلاصة:** يوضح المثال تركيب POSITION وCHAR_LENGTH وSUBSTRING لتحديد الحد والطول ثم الاستخراج.

**القيد:** تركيب الدوال لا يعوض التحقق من الحالات غير الصالحة.

Source: `content/sql/vault.json#/pages/34`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

**مقتطف الدليل:** POSITION → find boundary

Evidence pointer: `/pages/34/body`

## hansa-bank-335 — جهة Padding تغير المخرَج

sql / text · draft

**الموقف:** كيف تختلف إضافة أصفار لليسار عن إضافتها لليمين؟

**الخلاصة:** LPAD تضيف من اليسار وRPAD من اليمين للوصول للطول المطلوب في المثال.

**القيد:** حدد هل الأصفار للعرض فقط أم جزء من معرف فعلي.

Source: `content/sql/vault.json#/pages/34`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

**مقتطف الدليل:** LPAD → add characters on the left

Evidence pointer: `/pages/34/body`

## hansa-bank-336 — Padding قد يقطع النص

sql / text · draft

**الموقف:** حددت طولًا أصغر من الأصل؛ هل تقتصر العملية على الإضافة؟

**الخلاصة:** قد تُقطع النتيجة إذا كان الطول المستهدف أقصر من النص الأصلي.

**القيد:** افحص الحد الأقصى قبل توحيد طول المعرفات.

Source: `content/sql/vault.json#/pages/34`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

**مقتطف الدليل:** لو الطول المستهدف أصغر من الأصلي، النتيجة تتقطع

Evidence pointer: `/pages/34/body`

## hansa-bank-337 — تنظيف طرف واحد له معنى

sql / text · draft

**الموقف:** تريد إزالة أحرف البداية مع إبقاء النهاية؛ هل تستخدم الدالة نفسها لكل حالة؟

**الخلاصة:** LTRIM للبداية وRTRIM للنهاية، بينما TRIM يمكن أن يعالج الطرفين.

**القيد:** راجع الأحرف التي تعالجها الدالة؛ ليس كل whitespace مضمون الإزالة افتراضيًا.

Source: `content/sql/vault.json#/pages/34`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

**مقتطف الدليل:** LTRIM → left side

Evidence pointer: `/pages/34/body`

## hansa-bank-338 — علامتا LIKE لا تعنيان الشيء نفسه

sql / postgresql · draft

**الموقف:** كيف تختلف % عن _ في نمط البحث؟

**الخلاصة:** % تطابق صفرًا أو أكثر من الأحرف، بينما _ تطابق حرفًا واحدًا في وصف المصدر.

**القيد:** انتبه إلى الأحرف الخاصة إذا كان المطلوب بحثًا حرفيًا عنها.

Source: `content/sql/vault.json#/pages/35`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

**مقتطف الدليل:** % → zero or more characters

Evidence pointer: `/pages/35/body`

## hansa-bank-339 — موضع Wildcard يحدد موضع المطابقة

sql / postgresql · draft

**الموقف:** كيف تفرق بين يبدأ بـELF وينتهي بها؟

**الخلاصة:** ELF% يبحث عن بداية، و%ELF عن نهاية، و%ELF% عن احتواء النمط.

**القيد:** هذا بحث نمطي، لا فهم لغوي للكلمة.

Source: `content/sql/vault.json#/pages/35`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

**مقتطف الدليل:** -- Starts with ELF

Evidence pointer: `/pages/35/body`

## hansa-bank-340 — ILIKE لا تتطلب تطابق حالة الأحرف

sql / postgresql · draft

**الموقف:** لماذا قد لا يطابق البحث عن elf كتابة Elf؟

**الخلاصة:** يقدم المرجع ILIKE للمطابقة غير الحساسة لحالة الأحرف في PostgreSQL، بدل LIKE في المثال.

**القيد:** راجع إعدادات النص واللهجة؛ لا تعمم الصياغة على كل المحركات.

Source: `content/sql/vault.json#/pages/35`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

**مقتطف الدليل:** case-insensitive matching

Evidence pointer: `/pages/35/body`

## hansa-bank-341 — البحث اللغوي غير بحث الأحرف

sql / postgresql · draft

**الموقف:** تبحث في مقالات طبيعية؛ ما الذي يضيفه Full-Text Search؟

**الخلاصة:** يعتمد على كلمات وتمثيل لغوي موحد وlexemes، بدل مطابقة سلسلة أحرف فقط.

**القيد:** حدد إعداد اللغة المناسب للمحتوى.

Source: `content/sql/vault.json#/pages/35`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

**مقتطف الدليل:** words + normalization + lexemes + linguistic matching

Evidence pointer: `/pages/35/body`

## hansa-bank-342 — المستند والاستعلام لهما تمثيلان

sql / postgresql · draft

**الموقف:** في Full-Text Search، ما دور tsvector وtsquery؟

**الخلاصة:** يمثل tsvector النص القابل للبحث، وتمثل tsquery طلب البحث، وتستخدم @@ للمطابقة.

**القيد:** تحقق من تكوين اللغة وصياغة الاستعلام.

Source: `content/sql/vault.json#/pages/35`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

**مقتطف الدليل:** tsvector @@ tsquery

Evidence pointer: `/pages/35/body`

## hansa-bank-343 — Full-Text ليست تصحيحًا إملائيًا

sql / postgresql · draft

**الموقف:** هل البحث اللغوي يعالج تلقائيًا كل typo؟

**الخلاصة:** يميز المصدر البحث النصي الكامل عن fuzzy matching المستخدمة للتشابه التقريبي والأخطاء الإملائية.

**القيد:** اختر التقنية بحسب نوع الاختلاف الذي تريد تحمله.

Source: `content/sql/vault.json#/pages/35`

Lesson route: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

**مقتطف الدليل:** Full-text search مش نفس حاجة typo correction.

Evidence pointer: `/pages/35/body`

## hansa-bank-344 — المتاح للتثبيت غير المفعّل

sql / postgresql · draft

**الموقف:** وجدت extension في قائمة المتاح؛ هل يمكن افتراض تشغيل وظائفها؟

**الخلاصة:** pg_available_extensions تعرض المتاح، بينما pg_extension تعرض المفعّل بالفعل.

**القيد:** تحقق من حالة البيئة وصلاحياتها قبل استخدام دالة إضافية.

Source: `content/sql/vault.json#/pages/36`

Lesson route: `/learn/sql/reference/3cb3906c5d6c817fb197f233646cda62/`

**مقتطف الدليل:** pg_extension            → ما المفعّل بالفعل؟

Evidence pointer: `/pages/36/body`

## hansa-bank-345 — Levenshtein تقيس كلفة التعديل

sql / postgresql · draft

**الموقف:** كيف تقارن نصين بعدد عمليات التحويل؟

**الخلاصة:** تقيس الدالة التعديلات من إدراج وحذف واستبدال؛ المسافة الأقل تعني قربًا أكبر.

**القيد:** القرب النصي لا يثبت أن السجلين للكيان نفسه.

Source: `content/sql/vault.json#/pages/36`

Lesson route: `/learn/sql/reference/3cb3906c5d6c817fb197f233646cda62/`

**مقتطف الدليل:** أنواع التعديل: Insertion, Deletion, Substitution

Evidence pointer: `/pages/36/body`

## hansa-bank-346 — اتجاه درجة التشابه مهم

sql / postgresql · draft

**الموقف:** هل ترتب Levenshtein وsimilarity بالطريقة نفسها؟

**الخلاصة:** الأقل أفضل للمسافة، بينما الأعلى أفضل لدرجة trigram similarity.

**القيد:** لا تستخدم ترتيبًا تنازليًا لكل مقياس بلا فهم دلالته.

Source: `content/sql/vault.json#/pages/36`

Lesson route: `/learn/sql/reference/3cb3906c5d6c817fb197f233646cda62/`

**مقتطف الدليل:** Higher similarity = More similar

Evidence pointer: `/pages/36/body`

## hansa-bank-347 — الدالة الإضافية تحتاج امتدادها

sql / postgresql · draft

**الموقف:** قبل استعمال fuzzystrmatch أو pg_trgm، ماذا تتحقق؟

**الخلاصة:** تأكد أن الامتداد اللازم مفعّل قبل استدعاء الدالة المرتبطة به.

**القيد:** هذه معلومة إعداد، وليست تنفيذ تثبيت أو موافقة عليه.

Source: `content/sql/vault.json#/pages/36`

Lesson route: `/learn/sql/reference/3cb3906c5d6c817fb197f233646cda62/`

**مقتطف الدليل:** لا تنس تفعيل الـ extension قبل استخدام الدالة.

Evidence pointer: `/pages/36/body`

## hansa-bank-348 — ENUM يربط النوع بقيم مضبوطة

sql / postgresql · draft

**الموقف:** تحتاج حالات عمل محددة في نوع عمود؛ ما المثال المحلي؟

**الخلاصة:** يعرض المصدر CREATE TYPE لتعريف ENUM ثم استخدامه كنوع عمود.

**القيد:** اختره عندما تلائمك قيود وتغييرات مجموعة القيم.

Source: `content/sql/vault.json#/pages/37`

Lesson route: `/learn/sql/reference/3cb3906c5d6c8162bcafeddf74477d61/`

**مقتطف الدليل:** ENUM تتحكم قيمه القاعدة

Evidence pointer: `/pages/37/body`

## hansa-bank-349 — اسم النوع المخصص جزء من الاستكشاف

sql / postgresql · draft

**الموقف:** كيف تتعرف على نوع غير مألوف لعمود؟

**الخلاصة:** يمكن فحص data_type وudt_name ضمن information_schema.columns في المثال.

**القيد:** لا تستنتج معنى النوع من اسم العمود وحده.

Source: `content/sql/vault.json#/pages/37`

Lesson route: `/learn/sql/reference/3cb3906c5d6c8162bcafeddf74477d61/`

**مقتطف الدليل:** SELECT column_name, data_type, udt_name

Evidence pointer: `/pages/37/body`

## hansa-bank-350 — الدالة المخصصة تحزم المنطق

sql / postgresql · draft

**الموقف:** متى يفيد CREATE FUNCTION في المثال؟

**الخلاصة:** يحزم منطق قاعدة البيانات لإعادة استعماله بدل إعادة كتابة الحساب في كل موضع.

**القيد:** حدد عقد المدخلات والنتيجة قبل إعادة الاستخدام.

Source: `content/sql/vault.json#/pages/37`

Lesson route: `/learn/sql/reference/3cb3906c5d6c8162bcafeddf74477d61/`

**مقتطف الدليل:** package reusable database logic

Evidence pointer: `/pages/37/body`

## hansa-bank-351 — القسمة الصحيحة قد تفقد الكسر

sql / types-null · draft

**الموقف:** لماذا تختلف 10 / 4 عن 10 / 4.0 في مثال PostgreSQL؟

**الخلاصة:** المعاملان الصحيحان ينتجان 2، بينما إدخال معامل عشري يعطي 2.5 في المثال.

**القيد:** اضبط الأنواع قبل حساب النسب.

Source: `content/sql/vault.json#/pages/18`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81ad85a0fc24bb55d32c/`

**مقتطف الدليل:** مع integer operands، النتيجة تكون integer

Evidence pointer: `/pages/18/body`

## hansa-bank-352 — CAST في SELECT لا يغير المخطط

sql / types-null · draft

**الموقف:** حوّلت العمود في نتيجة استعلام؛ هل تغير تعريفه في الجدول؟

**الخلاصة:** التحويل هنا يغير نوع التمثيل في الاستعلام الحالي، وليس schema العمود الأصلي.

**القيد:** تغيير المخطط عملية مختلفة يجب تمييزها.

Source: `content/sql/vault.json#/pages/18`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81ad85a0fc24bb55d32c/`

**مقتطف الدليل:** لا يغير schema الأصلي للعمود.

Evidence pointer: `/pages/18/body`

## hansa-bank-353 — المعرف الآلي ليس مرادفًا لـserial

sql / types-null · draft

**الموقف:** هل كل عمود يولد ID تلقائيًا لا بد أن يكون serial؟

**الخلاصة:** يذكر المصدر serial التقليدي ووجود identity columns، ويطلب الفصل بين المفهوم والصياغة المحددة.

**القيد:** راجع آلية العمود الفعلية في مخططك.

Source: `content/sql/vault.json#/pages/18`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81ad85a0fc24bb55d32c/`

**مقتطف الدليل:** لا تخلط بين مفهوم auto-generated ID

Evidence pointer: `/pages/18/body`

## hansa-bank-354 — رقم مخزن لا يعني كمية قابلة للمتوسط

sql / analytics · draft

**الموقف:** هل AVG لرمز منطقة أو قسم يعطي معلومة مفيدة؟

**الخلاصة:** نوع INTEGER لا يمنح الرمز معنى كميًا؛ المعنى التحليلي يأتي من دلالة المتغير.

**القيد:** راجع قاموس البيانات قبل إجراء الحسابات.

Source: `content/sql/vault.json#/pages/25`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

**مقتطف الدليل:** INTEGER ≠ automatically measurable quantity

Evidence pointer: `/pages/25/body`

## hansa-bank-355 — قرّب الناتج في المرحلة المقصودة

sql / analytics · draft

**الموقف:** هل تقريب كل صف قبل التجميع يعادل تقريب الإجمالي؟

**الخلاصة:** يوصي المرجع عادة بالتجميع أولًا ثم التقريب، ما لم تتطلب قاعدة العمل غير ذلك.

**القيد:** حدد قاعدة التقريب صراحة عندما تؤثر على النتيجة.

Source: `content/sql/vault.json#/pages/25`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

**مقتطف الدليل:** اعمل aggregation ثم round للناتج

Evidence pointer: `/pages/25/body`

## hansa-bank-356 — تباين المجتمع غير تباين العينة

sql / analytics · draft

**الموقف:** لماذا يعرض المرجع VAR_POP وVAR_SAMP منفصلتين؟

**الخلاصة:** تختلف صيغة القسمة بين N للمجتمع وN−1 للعينة في وصف المصدر.

**القيد:** اختر الصيغة التي تطابق غرض البيانات، لا اسمًا مألوفًا فقط.

Source: `content/sql/vault.json#/pages/25`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

**مقتطف الدليل:** Sample variance: <code>Σ(x - x̄)² / (N - 1)</code>

Evidence pointer: `/pages/25/body`

## hansa-bank-357 — Percentile قد تكون قيمة مستوفاة

sql / analytics · draft

**الموقف:** هل يجب أن تكون نتيجة percentile موجودة حرفيًا ضمن المشاهدات؟

**الخلاصة:** PERCENTILE_DISC تختار قيمة موجودة، بينما PERCENTILE_CONT قد تستخدم interpolation.

**القيد:** لا تفترض تطابق النتائج بين طرق حساب percentiles المختلفة.

Source: `content/sql/vault.json#/pages/25`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

**مقتطف الدليل:** ممكن تعمل interpolation وترجع value مش موجودة أصلًا.

Evidence pointer: `/pages/25/body`

## hansa-bank-358 — الرقم الخاص قد يعني مفقودًا

sql / analytics · draft

**الموقف:** رأيت 99 أو -99 في عمود قياس؛ هل تعتمدها كقياسات حقيقية؟

**الخلاصة:** قد تمثل أكوادًا للقيم المفقودة أو غير المنطبقة؛ ارجع إلى قاموس البيانات.

**القيد:** لا تحذفها أو تعيد تفسيرها دون تعريف موثق.

Source: `content/sql/vault.json#/pages/25`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

**مقتطف الدليل:** Always check the data dictionary/documentation.

Evidence pointer: `/pages/25/body`

## hansa-bank-359 — الفئة الخالية يجب ألا تختفي

sql / analytics · draft

**الموقف:** أنشأت bins وتريد إظهار صفر للمجموعة الخالية؛ ما النمط؟

**الخلاصة:** يحفظ LEFT JOIN قائمة الفئات، ويعد COUNT لعمود المشاهدة بدل COUNT(*) في المثال.

**القيد:** تأكد أن غياب المشاهدات يعني صفرًا في سياق القياس.

Source: `content/sql/vault.json#/pages/25`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

**مقتطف الدليل:** للحفاظ على كل الـ bins حتى لو لم يقع فيها أي observation

Evidence pointer: `/pages/25/body`

## hansa-bank-360 — CORR يستخدم الأزواج المتاحة

sql / analytics · draft

**الموقف:** هل الصف الذي يفتقد أحد المتغيرين يدخل الارتباط في المثال؟

**الخلاصة:** يذكر المرجع استبعاد الصفوف ذات NULL في أي من المتغيرين من الحساب.

**القيد:** افحص أثر الفقد على المجتمع المتبقي قبل تفسير الارتباط.

Source: `content/sql/vault.json#/pages/25`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

**مقتطف الدليل:** الصفوف اللي فيها <code>NULL</code> في أي متغير بتتستبعد من الحساب.

Evidence pointer: `/pages/25/body`

## hansa-bank-361 — TRUNC لا تقرّب لأقرب قيمة

sql / analytics · draft

**الموقف:** كيف تختلف TRUNC عن ROUND عند تقليل المنازل؟

**الخلاصة:** تحذف TRUNC الدقة في المنازل الأدنى بدل التقريب، كما يوضح المثال 42.1256 إلى 42.12.

**القيد:** راجع موضع القطع المطلوب واتجاه القيم.

Source: `content/sql/vault.json#/pages/25`

Lesson route: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

**مقتطف الدليل:** TRUNC(42.1256, 2) → 42.12

Evidence pointer: `/pages/25/body`

## hansa-bank-362 — ROLLUP ينتج تسلسل مجاميع

sql / aggregation · draft

**الموقف:** ماذا تضيف ROLLUP(A,B,C) إلى التجميع التفصيلي؟

**الخلاصة:** تنتج مستويات ABC ثم AB ثم A ثم الإجمالي العام في التسلسل المعروض.

**القيد:** اختر ترتيبًا يعكس hierarchy المطلوبة.

Source: `content/sql/vault.json#/pages/51`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

**مقتطف الدليل:** A + B + C

Evidence pointer: `/pages/51/body`

## hansa-bank-363 — تبديل ترتيب ROLLUP يبدل المجموع الفرعي

sql / aggregation · draft

**الموقف:** هل ROLLUP(country,medal) مثل عكس العمودين؟

**الخلاصة:** الأولى تنتج مجموعًا فرعيًا للدولة في المثال، والثانية للميدالية.

**القيد:** ترتيب الحقول جزء من معنى النتيجة.

Source: `content/sql/vault.json#/pages/51`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

**مقتطف الدليل:** ترتيب الأعمدة مهم جدًا.

Evidence pointer: `/pages/51/body`

## hansa-bank-364 — CUBE توسّع تركيبات التجميع

sql / aggregation · draft

**الموقف:** تحتاج إجماليات لكل بُعد وتركيباته؛ ماذا تختلف عن ROLLUP؟

**الخلاصة:** CUBE تنتج كل تركيبات grouping المعنية، بدل تسلسل هرمي واحد.

**القيد:** تأكد أن المستويات المطلوبة مفيدة وقابلة للقراءة.

Source: `content/sql/vault.json#/pages/51`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

**مقتطف الدليل:** ويولد كل الـ grouping combinations.

Evidence pointer: `/pages/51/body`

## hansa-bank-365 — NULL التجميع قد يمثل إجماليًا

sql / aggregation · draft

**الموقف:** ظهر NULL في عمود بمخرجات ROLLUP؛ هل هو دائمًا فقد في المصدر؟

**الخلاصة:** قد يمثل صفًا للمجموع الفرعي أو الإجمالي في سياق التجميع المعروض.

**القيد:** ميّز صفوف الإجمالي عن NULL الأصلية قبل وضع تسمية بديلة.

Source: `content/sql/vault.json#/pages/51`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

**مقتطف الدليل:** Total for all medals within China.

Evidence pointer: `/pages/51/body`

## hansa-bank-366 — ترتيب STRING_AGG داخلي

sql / aggregation · draft

**الموقف:** تحتاج قائمة أسماء بترتيب محدد داخل كل خلية؛ أين تصرح به؟

**الخلاصة:** حدد ORDER BY داخل STRING_AGG بدل افتراض أن ترتيب النصوص سيأتي كما تريد.

**القيد:** راجع كسر التعادل إذا لزم ترتيب محدد تمامًا.

Source: `content/sql/vault.json#/pages/51`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

**مقتطف الدليل:** إذا كان ترتيب القيم مهمًا، حدده داخل

Evidence pointer: `/pages/51/body`

## hansa-bank-367 — حدود الصفحة تبدأ من حجمها ورقمها

sql / windows · draft

**الموقف:** حجم الصفحة 20 ورقمها 3؛ ما صفوفها في المثال؟

**الخلاصة:** الحدان هما 41 و60 وفق صيغة بداية الصفحة ونهايتها.

**القيد:** يتطلب التطبيق ترتيبًا محددًا للصفوف.

Source: `content/sql/vault.json#/pages/50`

Lesson route: `/learn/sql/reference/3cb3906c5d6c815a8811cf0645e13383/`

**مقتطف الدليل:** إذن page 3 = rows

Evidence pointer: `/pages/50/body`

## hansa-bank-368 — Pivot يغير توزيع العرض

sql / windows · draft

**الموقف:** عند تحويل السنوات إلى أعمدة، ماذا يبقى صفًا وماذا يصبح قيمة؟

**الخلاصة:** في المثال تبقى الدولة مفتاح صف، وتصبح السنة عمودًا، وتوضع الجوائز داخل الخلايا.

**القيد:** حدد كيفية التعامل مع تكرار مفتاح الصف والسنة قبل pivot.

Source: `content/sql/vault.json#/pages/50`

Lesson route: `/learn/sql/reference/3cb3906c5d6c815a8811cf0645e13383/`

**مقتطف الدليل:** Pivoting = تحويل القيم الموجودة في Rows إلى Columns

Evidence pointer: `/pages/50/body`

## hansa-bank-369 — CROSSTAB مرتبطة بامتداد

sql / windows · draft

**الموقف:** ما الاعتماد المذكور لعمل pivot بـcrosstab في PostgreSQL؟

**الخلاصة:** يستخدم المثال crosstab من امتداد tablefunc.

**القيد:** تحقق من التفعيل وبنية الأعمدة المتوقعة قبل استخدام المثال.

Source: `content/sql/vault.json#/pages/50`

Lesson route: `/learn/sql/reference/3cb3906c5d6c815a8811cf0645e13383/`

**مقتطف الدليل:** extension اسمها <code>tablefunc</code>

Evidence pointer: `/pages/50/body`

## hansa-bank-370 — الإطار السابق يشمل الصف الحالي إذا طلبته

sql / windows · draft

**الموقف:** كم صفًا قد يشمل ROWS BETWEEN 3 PRECEDING AND CURRENT ROW؟

**الخلاصة:** حتى أربعة صفوف: الحالي وثلاثة قبله عندما تتوفر.

**القيد:** لا تفترض اكتمال الإطار عند بداية المجموعة.

Source: `content/sql/vault.json#/pages/48`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

**مقتطف الدليل:** حتى 4 صفوف عندما تكون متاحة.

Evidence pointer: `/pages/48/body`

## hansa-bank-371 — ROWS وRANGE يتعاملان مع التعادل بشكل مختلف

sql / windows · draft

**الموقف:** تكرر مفتاح الترتيب؛ هل كل نافذة تحسب الصفوف بالطريقة نفسها؟

**الخلاصة:** ROWS تتعامل مع الصفوف منفصلة، بينما RANGE تتعامل مع قيم الترتيب المتساوية كـpeers في سياقها.

**القيد:** اختر الإطار بحسب عدد الصفوف أو قيم الترتيب المطلوبة.

Source: `content/sql/vault.json#/pages/48`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

**مقتطف الدليل:** يتعامل مع الصفوف كصفوف منفصلة

Evidence pointer: `/pages/48/body`

## hansa-bank-372 — بداية Moving Average قد تحتوي صفوفًا أقل

sql / windows · draft

**الموقف:** لماذا يبدأ متوسط ثلاثي الصفوف في المثال بـ10 ثم15؟

**الخلاصة:** عند البداية يحسب المتوسط من الصفوف المتاحة، قبل اكتمال ثلاثة صفوف في الإطار.

**القيد:** إذا احتجت نافذة مكتملة فحدد ذلك في منطق النتيجة.

Source: `content/sql/vault.json#/pages/48`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

**مقتطف الدليل:** الصف 2 → <code>(10+20)/2 = 15</code>

Evidence pointer: `/pages/48/body`

## hansa-bank-373 — الإجمالي التراكمي يعاد داخل كل Partition

sql / windows · draft

**الموقف:** تتابع دولًا متعددة؛ هل يستمر running total من دولة لأخرى؟

**الخلاصة:** مع PARTITION BY country يبدأ الحساب من جديد لكل دولة في المثال.

**القيد:** راجع أن مفتاح المجموعة يعكس الكيان المطلوب.

Source: `content/sql/vault.json#/pages/48`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

**مقتطف الدليل:** الـ running total يبدأ من جديد لكل

Evidence pointer: `/pages/48/body`

## hansa-bank-374 — ترتيب الحساب غير ترتيب العرض

sql / windows · draft

**الموقف:** هل ORDER BY داخل OVER يضمن ترتيب الصفوف النهائي؟

**الخلاصة:** الداخلي يحدد حساب النافذة، والخارجي يحدد عرض النتيجة النهائية.

**القيد:** صرح بالترتيبين إذا كان لكل منهما غرض مختلف.

Source: `content/sql/vault.json#/pages/45`

Lesson route: `/learn/sql/reference/3cb3906c5d6c81aabba5cb36a17c548f/`

**مقتطف الدليل:** ترتيب ظهور النتيجة النهائية

Evidence pointer: `/pages/45/body`

## hansa-bank-375 — ابدأ السلسلة الشهرية من بداية الفترة

sql / time · draft

**الموقف:** لماذا يحذر المصدر من بدء توليد الشهور من يوم31؟

**الخلاصة:** قد تنزلق الأيام عند الشهور الأقصر؛ ولّد بدايات ثابتة ثم اشتق النهايات.

**القيد:** اختبر حدود التقويم المستخدم.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** ولّد من بدايات فترات ثابتة، واشتق نهايات الفترات بعد كده.

Evidence pointer: `/pages/10/body`

## hansa-bank-376 — الفترة نصف المفتوحة تمنع ازدواج الحد

sql / time · draft

**الموقف:** حدث يقع تمامًا عند حد فترتين؛ كيف تمنع عده مرتين؟

**الخلاصة:** استخدم حدًا أدنى شاملًا وحدًا أعلى غير شامل في النمط المعروض.

**القيد:** استخدم الحدود نفسها في كل الفترات المجاورة.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** بتمنع القيم على الحد الفاصل من إنها تتحسب في bin-ين.

Evidence pointer: `/pages/10/body`

## hansa-bank-377 — احسب الفجوات ثم متوسطها

sql / time · draft

**الموقف:** تحتاج متوسط الزمن بين الأحداث؛ لماذا تستخدم مرحلتين؟

**الخلاصة:** احسب الفارق باستخدام LAG في نتيجة وسيطة ثم طبّق AVG عليها.

**القيد:** لا تنفذ window function داخل aggregate بالمستوى نفسه في النمط المحذر منه.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** بدل من كده استخدم مرحلتين منطقيتين:

Evidence pointer: `/pages/10/body`

## hansa-bank-378 — رقم يوم الأسبوع يحتاج تعريفًا

sql / time · draft

**الموقف:** هل Sunday يساوي1 في كل حقول التاريخ؟

**الخلاصة:** يوضح مصدر PostgreSQL أن DOW يستخدم Sunday=0 وSaturday=6.

**القيد:** لا تعمم التعريف على ISODOW أو لغات ومحركات أخرى.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** Sunday = 0

Evidence pointer: `/pages/10/body`

## hansa-bank-379 — الإزاحة عدد صفوف لا اسم فترة

sql / time · draft

**الموقف:** ماذا تعني LAG(value,2) في المثال؟

**الخلاصة:** تأتي بالقيمة من صفين سابقين وفق ترتيب النافذة.

**القيد:** لا تفترض أنهما يومان إذا كانت الصفوف متباعدة زمنيًا.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** صفين للخلف:

Evidence pointer: `/pages/10/body`

## hansa-bank-380 — LEAD ينظر إلى الحدث التالي

sql / time · draft

**الموقف:** متى تحتاج LEAD بدل LAG؟

**الخلاصة:** عندما يكون السؤال عن قيمة صف لاحق في التسلسل المرتب، لا السابق.

**القيد:** حدد ترتيب الأحداث والمجموعة قبل الحساب.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** بترجع قيمة من الصف التالي.

Evidence pointer: `/pages/10/body`

## hansa-bank-381 — مدة التذكرة فرق وقتين

sql / time · draft

**الموقف:** كيف يصوغ مثال SLA مدة حل تذكرة؟

**الخلاصة:** يطرح created_at من resolved_at ثم يمكن تلخيص مدد الحل.

**القيد:** راجع التذاكر غير المحلولة وأنواع التوقيت قبل التعميم.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** resolved_at - created_at AS resolution_time

Evidence pointer: `/pages/10/body`

## hansa-bank-382 — الرقم الشهري المتجمع قد يخلط السنوات عمدًا

sql / time · draft

**الموقف:** عند GROUP BY EXTRACT(MONTH)، ما نوع المقارنة المعروضة؟

**الخلاصة:** يجمع مبيعات الشهر نفسه عبر السنوات للإجابة عن مقارنة مثل يناير ومارس.

**القيد:** إذا أردت تسلسل كل شهر وسنته، فاحتفظ بهوية الفترة كاملة.

Source: `content/sql/vault.json#/pages/10`

Lesson route: `/learn/sql/10/`

**مقتطف الدليل:** هل مبيعات يناير عادةً أعلى من مبيعات مارس؟

Evidence pointer: `/pages/10/body`

## hansa-bank-383 — SQL تصف النتيجة للمحرك

sql / foundations · draft

**الموقف:** هل تكتب في SQL الخطة الفيزيائية خطوة بخطوة؟

**الخلاصة:** هي لغة declarative تصف النتيجة المطلوبة، ويختار optimizer كيفية تنفيذها.

**القيد:** يبقى فهم الخطة مهمًا عند تشخيص الأداء.

Source: `content/sql/vault.json#/pages/1`

Lesson route: `/learn/sql/01/`

**مقتطف الدليل:** you describe the result you want

Evidence pointer: `/pages/1/body`

## hansa-bank-384 — ترتيب التخزين ليس ضمان ترتيب النتيجة

sql / foundations · draft

**الموقف:** ظهرت الصفوف مرتبة مرة؛ هل تضمن الترتيب في الاستعلام التالي؟

**الخلاصة:** لا يضمن result set ترتيبًا ذا معنى دون ORDER BY.

**القيد:** لا تعتمد على ترتيب الإدخال أو التخزين كعقد عرض.

Source: `content/sql/vault.json#/pages/1`

Lesson route: `/learn/sql/01/`

**مقتطف الدليل:** A result set is not guaranteed to have a meaningful order

Evidence pointer: `/pages/1/body`

## hansa-bank-385 — Alias ليست عمودًا مخزنًا لحظيًا

sql / foundations · draft

**الموقف:** هل تستخدم alias محسوبة في تعبير آخر بالقائمة نفسها بلا تحقق؟

**الخلاصة:** الرؤية تعتمد على اللهجة والمرحلة؛ استخدم نتيجة وسيطة عندما يصبح الحساب مدخلًا لحساب آخر.

**القيد:** لا تفترض أن الاسم تحقق كعمود materialized.

Source: `content/sql/vault.json#/pages/1`

Lesson route: `/learn/sql/01/`

**مقتطف الدليل:** as though it were an already-materialized column.

Evidence pointer: `/pages/1/body`

## hansa-bank-386 — DISTINCT يعمل على الأعمدة المختارة

sql / foundations · draft

**الموقف:** إذا غيرت SELECT، هل قد يتغير ما يعد صفًا مكررًا؟

**الخلاصة:** DISTINCT يزيل التكرار من projection المختارة، لا يحدد تلقائيًا هوية كيان العمل.

**القيد:** لا تستخدمه لإخفاء ربط خاطئ.

Source: `content/sql/vault.json#/pages/1`

Lesson route: `/learn/sql/01/`

**مقتطف الدليل:** removes duplicate rows from the selected projection.

Evidence pointer: `/pages/1/body`

## hansa-bank-387 — Candidate key ليست بالضرورة عمودًا منفردًا

sql / foundations · draft

**الموقف:** ما الذي يجعل مجموعة أعمدة مرشحة للتعريف الفريد؟

**الخلاصة:** هي مجموعة دنيا من الأعمدة يمكن أن تقوم بدور معرف فريد.

**القيد:** افحص التفرد الفعلي ومعنى المجموعة قبل اعتمادها.

Source: `content/sql/vault.json#/pages/1`

Lesson route: `/learn/sql/01/`

**مقتطف الدليل:** any minimal column set that could serve as a unique identifier.

Evidence pointer: `/pages/1/body`

## hansa-bank-388 — توافق UNION يشمل شكل الأعمدة

sql / sets · draft

**الموقف:** هل يمكن تكديس أي نتيجتين لهما أسماء متشابهة؟

**الخلاصة:** يجب توافق عدد الأعمدة وأنواع الأعمدة المناظرة في عبارات SELECT.

**القيد:** توافق النوع وحده لا يضمن توافق المعنى.

Source: `content/sql/vault.json#/pages/8`

Lesson route: `/learn/sql/08/`

**مقتطف الدليل:** compatible numbers and types of columns.

Evidence pointer: `/pages/8/body`

## hansa-bank-389 — أسماء مخرجات Set operation لها مصدر

sql / sets · draft

**الموقف:** من أين تؤخذ أسماء الأعمدة في النمط المذكور؟

**الخلاصة:** من الاستعلام الأول في عملية المجموعات.

**القيد:** رتب العرض والتسمية بوضوح في الاستعلام الأول.

Source: `content/sql/vault.json#/pages/8`

Lesson route: `/learn/sql/08/`

**مقتطف الدليل:** Column names are taken from the first query

Evidence pointer: `/pages/8/body`

## hansa-bank-390 — INTERSECT للمجتمع المشترك

sql / sets · draft

**الموقف:** تبحث عن سجلات موجودة في مجموعتين؛ ما العملية المباشرة؟

**الخلاصة:** INTERSECT تعيد الصفوف الموجودة في النتيجتين.

**القيد:** حدد الأعمدة التي تمثل المطابقة المطلوبة.

Source: `content/sql/vault.json#/pages/8`

Lesson route: `/learn/sql/08/`

**مقتطف الدليل:** Returns rows present in both result sets.

Evidence pointer: `/pages/8/body`

## hansa-bank-391 — EXCEPT عملية اتجاهية

sql / sets · draft

**الموقف:** هل فرق A عنB مثل فرق B عنA؟

**الخلاصة:** EXCEPT تعيد ما يوجد في النتيجة الأولى ويغيب من الثانية، فالترتيب يحدد السؤال.

**القيد:** سمِّ مصدر المقارنة والمرجع بوضوح.

Source: `content/sql/vault.json#/pages/8`

Lesson route: `/learn/sql/08/`

**مقتطف الدليل:** present in the first result set but absent from the second.

Evidence pointer: `/pages/8/body`

## hansa-bank-392 — الأعمدة المتوافقة قد تكون بمعانٍ مختلفة

sql / sets · draft

**الموقف:** عمودان رقميان يمران من فحص النوع؛ هل يكفي لتكديسهما؟

**الخلاصة:** يحذر المرجع من اختلاف معنى الأعمدة رغم توافق أنواعها.

**القيد:** راجع الوحدات والتعريفات وترتيب الحقول.

Source: `content/sql/vault.json#/pages/8`

Lesson route: `/learn/sql/08/`

**مقتطف الدليل:** mismatched column meaning despite compatible data types

Evidence pointer: `/pages/8/body`

## hansa-bank-393 — عد الكيانات غير عد المعاملات

sql / aggregation · draft

**الموقف:** تريد عدد العملاء الذين طلبوا؛ هل COUNT(*) على الطلبات يكفي؟

**الخلاصة:** COUNT(DISTINCT customer_id) يجيب عن العملاء الفريدين بدل عدد صفوف الطلبات.

**القيد:** حدد هل المعرّف متاح وصحيح قبل العد.

Source: `content/sql/vault.json#/pages/6`

Lesson route: `/learn/sql/06/`

**مقتطف الدليل:** Do not confuse row count with entity count.

Evidence pointer: `/pages/6/body`

## hansa-bank-394 — بعض المقاييس لا تجمع عبر الزمن

sql / aggregation · draft

**الموقف:** هل تجمع رصيد المخزون اليومي كأن كل يوم معاملة جديدة؟

**الخلاصة:** بعض الأرصدة semi-additive؛ تحتاج منطق snapshot أو نهاية فترة بدل جمعها عبر الزمن.

**القيد:** راجع قابلية الجمع لكل بُعد.

Source: `content/sql/vault.json#/pages/6`

Lesson route: `/learn/sql/06/`

**مقتطف الدليل:** inventory balance often should use an end-of-period or snapshot logic

Evidence pointer: `/pages/6/body`

## hansa-bank-395 — كل تعبير يحتاج معنى واحدًا داخل المجموعة

sql / aggregation · draft

**الموقف:** لماذا لا تختار صفة غير مجمعة عشوائيًا بجوار SUM؟

**الخلاصة:** يجب أن تكون لكل صف ناتج قيمة غير ملتبسة لكل تعبير مختار.

**القيد:** قواعد الاعتماد الوظيفي تختلف حسب اللهجة.

Source: `content/sql/vault.json#/pages/6`

Lesson route: `/learn/sql/06/`

**مقتطف الدليل:** Every output row must have an unambiguous value for every selected expression.

Evidence pointer: `/pages/6/body`

## hansa-bank-396 — GROUPING SETS تختار المستويات صراحة

sql / aggregation · draft

**الموقف:** تحتاج مجموعات تجميع محددة دون كل التركيبات؛ ماذا يوفر المرجع؟

**الخلاصة:** GROUPING SETS تصرح بمستويات التجميع المطلوبة.

**القيد:** راجع المستويات كي لا تحسب إجماليات غير مقصودة.

Source: `content/sql/vault.json#/pages/6`

Lesson route: `/learn/sql/06/`

**مقتطف الدليل:** explicitly requested grouping levels.

Evidence pointer: `/pages/6/body`

## hansa-bank-397 — NOT IN مع NULL يحتاج انتباهًا

sql / types-null · draft

**الموقف:** لماذا قد يفاجئك استبعاد قيم باستعلام يعيد NULL؟

**الخلاصة:** قد تنتج NOT IN نتائج غير متوقعة؛ عندما يكون السؤال عن غياب العلاقة يكون NOT EXISTS أوضح وأأمن في الحالات المشار إليها.

**القيد:** لا تبدل الصياغة دون مطابقة معنى المقارنة والـNULL.

Source: `content/sql/vault.json#/pages/3`

Lesson route: `/learn/sql/03/`

**مقتطف الدليل:** NOT IN</code> can produce surprising results when its subquery contains NULL.

Evidence pointer: `/pages/3/body`

## hansa-insight-shortcut-reference-v1 — A reference is a design decision.

fabric / ingestion · technical_review

**الموقف:** Two teams need to read the same existing Delta table in OneLake. They do not need a separately retained result. What would you investigate before building another copy pipeline?

**الخلاصة:** Investigate an internal OneLake shortcut: it points to an existing location rather than requiring a separate copy pipeline.

**القيد:** Confirm target access and table compatibility. A shortcut alone is not a retained, transformed snapshot; external shortcut caching is a separate consideration.

Source: `content/knowledge/insights.json#/items/0`

Lesson route: `/learn/dp-600/ingestion/`

## hansa-insight-shortcut-delete-v1 — Name the object you are deleting.

fabric / ingestion · technical_review

**الموقف:** You are removing a shortcut from a lakehouse. Is deleting the shortcut object the same operation as deleting a file through that shortcut?

**الخلاصة:** Deleting the shortcut object leaves its target intact.

**القيد:** Deleting a file or folder inside a shortcut can delete the target data when the caller has the required write permissions.

Source: `content/knowledge/insights.json#/items/1`

Lesson route: `/learn/dp-600/ingestion/`

## hansa-insight-shortcut-discovery-v1 — Location changes discovery.

fabric / ingestion · technical_review

**الموقف:** A learner puts a shortcut to a data folder under Files and expects it to appear automatically as a lakehouse table. Which assumption needs checking?

**الخلاصة:** Table discovery does not happen in Files.

**القيد:** Tables shortcuts require supported table data and the documented placement rules. A folder of arbitrary files is not automatically a Delta table.

Source: `content/knowledge/insights.json#/items/2`

Lesson route: `/learn/dp-600/ingestion/`
