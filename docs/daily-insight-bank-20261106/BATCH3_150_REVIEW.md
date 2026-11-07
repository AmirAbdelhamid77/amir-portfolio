# الدفعة الثالثة — 150 Insight جديدة

من المصادر المحلية فقط. جميعها مسودات، لم تعتمد علميًا ولم تنشر. الأمثلة أسئلة تعليمية افتراضية وليست مشاهدات حقيقية.

## hansa-bank-074 — التقسيم يغير التخطيط لا الصفوف المنطقية

fabric / transform

**السؤال:** هل نقل البيانات إلى مجلدات partitions يخلق مجموعة صفوف جديدة؟

**الخلاصة:** في وصف Hive-style، يتغير توزيع الملفات حسب قيم المفاتيح، بينما تبقى مجموعة الصفوف المنطقية نفسها.

**القيد:** لا تخلط تحسين التخطيط بتحويل معنى السجلات.

**الدليل المحلي:** The logical row set is unchanged.

المصدر: `content/fabric/notes.json#/0/chapters/4/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-075 — كثرة مفاتيح التقسيم قد تصنع ملفات صغيرة

fabric / transform

**السؤال:** هل زيادة عدد partitions دائمًا أفضل؟

**الخلاصة:** القيم المميزة الكثيرة أو جمع مفاتيح كثيرة قد ينتج partitions صغيرة وكتابات ملفات صغيرة متكررة.

**القيد:** قدّر حجم البيانات في كل قسم وراجع المرشحات الفعلية.

**الدليل المحلي:** can create tiny partitions and frequent small-file writes.

المصدر: `content/fabric/notes.json#/0/chapters/4/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-076 — ACID لا تلغي تعارض الكتابة

fabric / transform

**السؤال:** هل ضمان الاتساق يعني أن كاتبين لن يتعارضا؟

**الخلاصة:** يحافظ ACID على الاتساق، لكن تعارضات الكتابة التفاؤلية قد تظل ممكنة.

**القيد:** صمم معالجة التعارض وفق العملية والمحرك.

**الدليل المحلي:** optimistic write conflicts can still occur.

المصدر: `content/fabric/notes.json#/0/chapters/2/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-077 — Time travel لا تعد بتاريخ غير محدود

fabric / transform

**السؤال:** هل القدرة على قراءة لقطة سابقة تعني حفظ كل التاريخ إلى الأبد؟

**الخلاصة:** قراءة اللقطات القديمة لا تتضمن وعدًا باحتفاظ غير محدود بالتاريخ.

**القيد:** راجع ما بقي من الملفات والسجلات وسياسات الاحتفاظ.

**الدليل المحلي:** Neither is a promise to keep unlimited history

المصدر: `content/fabric/notes.json#/0/chapters/2/points/2`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-078 — تطور المخطط ليس قبولًا صامتًا لكل شيء

fabric / transform

**السؤال:** هل schema evolution تعني أن أي مخطط وارد يُقبل تلقائيًا؟

**الخلاصة:** يصف المصدر تغيرات بنيوية مضبوطة، لا قبول كل مخطط وارد دون شروط.

**القيد:** راجع التفعيل والضوابط المطلوبة بدل تعطيل الحماية بلا قصد.

**الدليل المحلي:** silently accept every incoming schema.

المصدر: `content/fabric/notes.json#/0/chapters/2/points/2`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-079 — الاسترجاع يحتاج ملفات وسجلًا معًا

fabric / transform

**السؤال:** هل الاحتفاظ بالسجل وحده يكفي لقراءة حالة قديمة؟

**الخلاصة:** يشترط الاسترجاع وجود القدر الكافي من logs وملفات البيانات المحتفظ بها معًا.

**القيد:** مدة retention وحدها ليست ضمان خدمة للاسترجاع.

**الدليل المحلي:** Recovery requires sufficient retained logs AND files.

المصدر: `content/fabric/notes.json#/0/chapters/3/points/2`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-080 — صلاحية المصدر غير صلاحية الهدف

fabric / ingestion

**السؤال:** لديك صلاحية SQL على الهدف؛ هل هذا يثبت إمكان قراءة ملف المصدر؟

**الخلاصة:** المصدر يميز تفويض قراءة المصدر عن تفويض SQL للهدف.

**القيد:** راجع كلا الطرفين في مسار التحميل.

**الدليل المحلي:** Source authorization and target SQL authorization are separate.

المصدر: `content/fabric/notes.json#/1/chapters/10/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-081 — إعادة المحاولة قد تكرر الإضافة

fabric / ingestion

**السؤال:** وصلت البيانات لكن ضاع تأكيد النجاح؛ ماذا يحدث عند إعادة append؟

**الخلاصة:** يجب أن يعالج تصميم التحميل احتمال إعادة التشغيل حتى لا تتحول المحاولة المعادة إلى تكرار غير مقصود.

**القيد:** نجاح النقل مرة لا يثبت أمان replay.

**الدليل المحلي:** A repeated append must be made safe by the load design

المصدر: `content/fabric/notes.json#/1/chapters/10/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-082 — مرشح اختياري قد يسقط NULL دون قصد

fabric / query

**السؤال:** استخدمت COALESCE لتعيد العمود إلى نفسه عند غياب parameter؛ ما الذي تفحصه؟

**الخلاصة:** قد يسقط النمط صفوفًا قيمتها NULL في العمود؛ افحص IS NULL صراحة حسب المقصود.

**القيد:** اختبر البيانات المفقودة والتجميع المنطقي للشروط.

**الدليل المحلي:** COALESCE-to-the-same-column can silently drop rows whose column value is NULL.

المصدر: `content/fabric/notes.json#/1/chapters/9/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-083 — View تحفظ منطق قراءة

fabric / query

**السؤال:** هل ordinary view في هذا التقسيم كجدول يخزن الصفوف؟

**الخلاصة:** يميز المصدر الجدول الذي يحمل صفوفًا عن ordinary view التي تحفظ منطق القراءة.

**القيد:** لا تخلط الوصف بالـmaterialized views أو غيرها من أنواع الكائنات.

**الدليل المحلي:** ordinary views save read logic

المصدر: `content/fabric/notes.json#/1/chapters/1/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-084 — ثبات الحقل لا يعني استحالة تصحيحه

fabric / model

**السؤال:** هل سياسة SCD0 تعني أن تاريخ الميلاد لا يمكن أن يكون خطأ؟

**الخلاصة:** يميّز المصدر بين سياسة عدم تغيير القيمة في التحميل المعتاد وبين مسار تصحيح مصرح به للأخطاء.

**القيد:** لا تتعامل مع الحقل كأنه محصن من خطأ الإدخال.

**الدليل المحلي:** A birth date or calendar field is not intrinsically immune to data-entry errors.

المصدر: `content/fabric/notes.json#/3/chapters/6/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-085 — تغير التجميع دون تغير مبالغ الحقائق

fabric / model

**السؤال:** تغيرت منطقة العميل بالاستبدال؛ لماذا تغير تقرير المناطق رغم ثبات المبالغ؟

**الخلاصة:** قد تبقى قيم الحقائق كما هي بينما يتغير تصنيفها إلى مناطق بعد استبدال صفة البعد.

**القيد:** حدد هل التقرير يريد الوصف الحالي أم الوصف وقت الحدث.

**الدليل المحلي:** Fact amounts can stay unchanged while their region grouping changes.

المصدر: `content/fabric/notes.json#/3/chapters/7/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-086 — قيمة سابقة واحدة ليست تاريخًا كاملًا

fabric / model

**السؤال:** هل current وprevious يكفيان لكل استعلام as-of بعد تغييرات متكررة؟

**الخلاصة:** حفظ قيمة سابقة واحدة يوفر تاريخًا محدودًا، لا سلسلة غير محدودة من النسخ.

**القيد:** حدد أسئلة التاريخ المطلوبة قبل الاكتفاء بهذا الملخص.

**الدليل المحلي:** Keeping one previous value does not retain an unrestricted timeline.

المصدر: `content/fabric/notes.json#/3/chapters/9/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-087 — إعادة توليد Surrogate Keys قد تكسر الربط

fabric / model

**السؤال:** هل تعيد توليد مفاتيح الأبعاد من نسخة البيانات الحالية بلا أثر؟

**الخلاصة:** يجب الحفاظ على مراجع الحقائق؛ إعادة توليد المفاتيح قد تبطل ارتباطاتها القائمة.

**القيد:** راجع الاستقرار والترحيل قبل أي إعادة بناء.

**الدليل المحلي:** regenerating keys from today's data can invalidate them.

المصدر: `content/fabric/notes.json#/3/chapters/12/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-088 — نهاية الصلاحية تحتاج اتفاقًا

fabric / model

**السؤال:** هل تخلط NULL وتاريخًا بعيدًا للنهاية دون تحديد شروط الفلترة؟

**الخلاصة:** تمثيل النهاية اختيار نمذجة؛ حافظ على اتساقه مع حدود الفترة وعلامات current.

**القيد:** اكتب التمثيل صراحة قبل صياغة المرشح الزمني.

**الدليل المحلي:** A far-future end or a null end is a modeling choice.

المصدر: `content/fabric/notes.json#/3/chapters/12/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-089 — الاحتفاظ غير Hot cache

fabric / streaming

**السؤال:** إذا صغرت نافذة hot cache، هل اختفت تلقائيًا كل البيانات الأقدم المحتفظ بها؟

**الخلاصة:** سياسة الاحتفاظ تحدد مدة بقاء البيانات، بينما hot cache يركز التخزين الساخن على نافذة حديثة.

**القيد:** استعلام hotcache-only قد يغفل بيانات باردة ما زالت محتفظًا بها.

**الدليل المحلي:** A hotcache-only query can omit retained cold data.

المصدر: `content/fabric/notes.json#/4/chapters/5/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-090 — الدالة المحفوظة ليست Cache للنتائج

fabric / streaming

**السؤال:** هل تخزين function يعني أن نتيجتها محسوبة مسبقًا؟

**الخلاصة:** الدالة تحفظ منطق استعلام قابلًا لإعادة الاستخدام، وليست cache لنتيجة محسوبة تلقائيًا.

**القيد:** افصل إعادة استخدام الكود عن materialization للنتائج.

**الدليل المحلي:** A saved function is not a precomputed result cache.

المصدر: `content/fabric/notes.json#/4/chapters/4/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-091 — الجزء Materialized وحده له عقد حداثة مختلف

fabric / streaming

**السؤال:** هل نتيجة الجزء المحسوب مسبقًا تحتوي كل أحدث الصفوف بالضرورة؟

**الخلاصة:** الاستعلام الكامل عن view يضم الجزء materialized مع صفوف مصدر مؤهلة لم تُحسب بعد؛ الوصول للجزء المحسوب وحده يختلف.

**القيد:** راجع مسار الوصول وقواعد الاستعلام قبل ادعاء الحداثة.

**الدليل المحلي:** The full view query combines its materialized portion with applicable source rows not yet materialized

المصدر: `content/fabric/notes.json#/4/chapters/6/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-092 — وقت الإدخال غير وقت الحدث في Backfill

fabric / streaming

**السؤال:** هل effectiveDateTime يرشح عمود EventTime الذي تستخدمه في التجميع؟

**الخلاصة:** وفق الملاحظة المحلية، يرشح وقت الإدخال لأغراض backfill، لا timestamp الحدث المختار للتجميع.

**القيد:** إذا كان العمل يتطلب قيد وقت الحدث فأضفه صراحة؛ عقد المنتج يحتاج مراجعة قبل النشر.

**الدليل المحلي:** effectiveDateTime filters ingestion time for backfill

المصدر: `content/fabric/notes.json#/4/chapters/7/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-093 — العنوان ليس تصريح وصول

fabric / security

**السؤال:** معك URI لاستعلام أو إدخال؛ هل يمنحك ذلك الإذن؟

**الخلاصة:** URI يحدد endpoint، ولا يمثل تصريحًا بالوصول.

**القيد:** راجع الهوية والصلاحيات المطلوبة بصورة مستقلة.

**الدليل المحلي:** A URI is an access endpoint, not permission.

المصدر: `content/fabric/notes.json#/4/chapters/11/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-094 — Left merge يحفظ الجانب الأيسر

python / overview

**السؤال:** ما الصفوف التي تريد الحفاظ عليها عند ضم العملاء إلى الطلبات؟

**الخلاصة:** في المثال، left merge يحتفظ بكل صفوف orders ويضيف المطابقات من customers.

**القيد:** تحقق من تعدد المطابقات؛ حفظ الصفوف لا يعني ضمان العدد نفسه بعد الربط.

**الدليل المحلي:** A left merge keeps every row from the left frame (orders)

المصدر: `content/exams/python.json#/questions/1/explanation`

مسار التعلم: `/lab/python/?question=py-02`

## hansa-bank-095 — الفقد له عدد ونسبة

python / overview

**السؤال:** كيف تفرق بين عدد القيم المفقودة وحصتها في العمود؟

**الخلاصة:** isna().sum() يعد القيم المفقودة، وisnull().mean() يحسب حصتها، بينما info يعرض الأعداد غير المفقودة والأنواع.

**القيد:** اختر المقياس المناسب للمقارنة بين أعمدة أو بيانات بأحجام مختلفة.

**الدليل المحلي:** isnull().mean() gives the null share

المصدر: `content/exams/python.json#/questions/2/explanation`

مسار التعلم: `/lab/python/?question=py-03`

## hansa-bank-096 — drop_duplicates لا تعدّل الأصل افتراضيًا

python / overview

**السؤال:** شغلت drop_duplicates ولم يتغير df؛ ما الافتراض الذي تراجعه؟

**الخلاصة:** تعيد الدالة DataFrame جديدة افتراضيًا؛ تحتاج إسناد النتيجة أو إعداد inplace المناسب لتحديث المقصود.

**القيد:** حدد قاعدة التكرار قبل إسقاط الصفوف.

**الدليل المحلي:** drop_duplicates returns a new dataframe

المصدر: `content/exams/python.json#/questions/5/explanation`

مسار التعلم: `/lab/python/?question=py-06`

## hansa-bank-097 — pivot_table تبدأ بالمتوسط

python / overview

**السؤال:** أنشأت جدولًا محوريًا وتوقعت sum؛ ما الإعداد الذي تفحصه؟

**الخلاصة:** التجميع الافتراضي في مثال Pandas هو mean؛ عيّن aggfunc إذا أردت دالة أخرى.

**القيد:** راجع نوع القيم ومستوى التجميع المطلوب.

**الدليل المحلي:** pivot_table aggregates with mean by default

المصدر: `content/exams/python.json#/questions/9/explanation`

مسار التعلم: `/lab/python/?question=py-10`

## hansa-bank-098 — XLOOKUP لا تقيد الإرجاع باليمين

excel / overview

**السؤال:** تحتاج إرجاع قيمة تقع يسار عمود البحث؛ ما الميزة المذكورة؟

**الخلاصة:** XLOOKUP تتجاوز قيد البحث لليسار في VLOOKUP وتتيح تحديد نتيجة عند غياب المطابقة.

**القيد:** راجع توفر الدالة وإعدادات المطابقة في ملفك.

**الدليل المحلي:** XLOOKUP removes VLOOKUP's left-lookup limitation

المصدر: `content/exams/excel.json#/questions/0/explanation`

مسار التعلم: `/lab/excel/?question=xl-01`

## hansa-bank-099 — التنظيف المتكرر يستفيد من خطوات محفوظة

excel / overview

**السؤال:** تنظف CSV بالطريقة نفسها كل أسبوع؛ ما فائدة Power Query هنا؟

**الخلاصة:** تحفظ خطوات التحويل لإعادة تطبيقها عند التحديث بدل إعادة التنظيف يدويًا.

**القيد:** تغير بنية المصدر قد يتطلب تعديل الخطوات.

**الدليل المحلي:** Power Query stores the transformation steps

المصدر: `content/exams/excel.json#/questions/3/explanation`

مسار التعلم: `/lab/excel/?question=xl-04`

## hansa-bank-100 — SUMIFS لعدة شروط

excel / overview

**السؤال:** تحتاج مجموعًا يحقق شرطين؛ ما الفرق عن SUMIF؟

**الخلاصة:** SUMIF تتعامل مع شرط واحد، وSUMIFS تدعم معايير متعددة عبر النطاقات.

**القيد:** راجع تطابق النطاقات ومعنى الشروط.

**الدليل المحلي:** SUMIFS handles multiple criteria across ranges.

المصدر: `content/exams/excel.json#/questions/4/explanation`

مسار التعلم: `/lab/excel/?question=xl-05`

## hansa-bank-101 — IFERROR تختار بديل الخطأ

excel / overview

**السؤال:** في IFERROR(A1/B1, 0)، ماذا تعني النتيجة صفر عند خطأ القسمة؟

**الخلاصة:** الصفر هنا هو البديل المحدد للخطأ، وليس بالضرورة نتيجة قسمة صحيحة.

**القيد:** لا تخلط معالجة الخطأ بإثبات أن القيمة الأصلية تساوي صفرًا.

**الدليل المحلي:** IFERROR returns its second argument when the first produces an error

المصدر: `content/exams/excel.json#/questions/7/explanation`

مسار التعلم: `/lab/excel/?question=xl-08`

## hansa-bank-102 — موضع التحويل يميز ETL وELT

analysis / overview

**السؤال:** هل التحويل يحدث قبل التحميل أم بعده في المثال؟

**الخلاصة:** ELT يحوّل بعد التحميل إلى المستودع، بينما ETL يحوّل قبل التحميل في الوصف المحلي.

**القيد:** سمِّ الترتيب الفعلي في نظامك بدل الاستدلال من اسم الأداة.

**الدليل المحلي:** ELT loads raw data first

المصدر: `content/exams/fundamentals.json#/questions/4/explanation`

مسار التعلم: `/lab/fundamentals/?question=fun-05`

## hansa-bank-103 — احسب حجم شبكة المؤشرات

analysis / overview

**السؤال:** لديك 24 موقعًا و24 شهرًا و4 مؤشرات؛ كم قيمة في شبكة كاملة؟

**الخلاصة:** عدد التركيبات 24 × 24 × 4 = 2304 قيم site-month-KPI في المثال.

**القيد:** هذا حجم الشبكة الكاملة، وليس إثبات وجود كل قيمة فعليًا.

**الدليل المحلي:** 24 sites × 24 months × 4 KPIs = 2,304 values.

المصدر: `content/exams/fundamentals.json#/questions/8/explanation`

مسار التعلم: `/lab/fundamentals/?question=fun-09`

## hansa-bank-104 — اتساق تعريف المؤشر بين الصفحات

analysis / overview

**السؤال:** هل مقارنة صفحتين عادلة إذا اختلفت تعريفات المؤشرات ومرشحاتها؟

**الخلاصة:** يوصي المصدر باتساق المرشحات والتعريفات بين صفحات dashboard مع وضوح الوحدات والحدود.

**القيد:** أظهر الاختلافات المقصودة بدل إخفائها داخل الحسابات.

**الدليل المحلي:** Consistent filters and definitions across pages

المصدر: `content/exams/fundamentals.json#/questions/7/options/3`

مسار التعلم: `/lab/fundamentals/?question=fun-08`

## hansa-bank-105 — DIVIDE تعطي عقدًا للمقام الصفري

power-bi / model

**السؤال:** ما النتيجة المقصودة عندما يكون مقام المقياس صفرًا؟

**الخلاصة:** في شرح السؤال، DIVIDE تعيد BLANK أو البديل المحدد عند المقام الصفري.

**القيد:** اختر البديل وفق معنى المؤشر؛ الفراغ والصفر ليسا معنى واحدًا.

**الدليل المحلي:** DIVIDE returns BLANK (or an alternate result) when the denominator is zero

المصدر: `content/exams/power-bi.json#/questions/3/explanation`

مسار التعلم: `/lab/power-bi/?question=pbi-04`

## hansa-bank-106 — دالة التجميع ليست Time intelligence

power-bi / model

**السؤال:** هل كل دالة DAX تعيد جدولًا أو تجمع بيانات تُعد زمنية؟

**الخلاصة:** يميز السؤال TOTALYTD وSAMEPERIODLASTYEAR وDATEADD عن SUMMARIZE التي تنشئ جدولًا مجمعًا.

**القيد:** اختيار الدالة يحتاج نموذج تواريخ وسياقًا مناسبين.

**الدليل المحلي:** SUMMARIZE creates a grouped table and is not time intelligence.

المصدر: `content/exams/power-bi.json#/questions/4/explanation`

مسار التعلم: `/lab/power-bi/?question=pbi-05`

## hansa-bank-107 — التصفية في الاتجاهين ليست افتراضًا عامًا

power-bi / model

**السؤال:** هل تجعل كل علاقة bidirectional تلقائيًا؟

**الخلاصة:** قد تنشئ التصفية ثنائية الاتجاه مسارات ملتبسة ونتائج غير متوقعة؛ يوصي السؤال بالاتجاه الواحد أساسًا.

**القيد:** استخدم الاستثناء عندما تتطلبه بنية النموذج مع اختبار أثره.

**الدليل المحلي:** Bidirectional filters can create ambiguous paths and unpredictable results.

المصدر: `content/exams/power-bi.json#/questions/9/explanation`

مسار التعلم: `/lab/power-bi/?question=pbi-10`

## hansa-bank-108 — ضع الصفات الوصفية في سياقها

power-bi / model

**السؤال:** في مثال star schema، أين تنتمي صفات مثل اسم العميل والمنطقة؟

**الخلاصة:** يميز السؤال الأبعاد التي تحمل الصفات الوصفية عن الحقائق التي تحمل الأحداث القابلة للقياس والمفاتيح المرتبطة بها.

**القيد:** هذا توصيف النموذج المعتاد في السؤال؛ راجع grain والمتطلبات قبل بناء الجداول.

**الدليل المحلي:** Descriptive attributes live in dimensions.

المصدر: `content/exams/power-bi.json#/questions/5/explanation`

مسار التعلم: `/lab/power-bi/?question=pbi-06`

## hansa-bank-109 — متغير ثالث لا يفرض رسمًا ثلاثي الأبعاد

visualization / relationships

**السؤال:** وصل عدد المتغيرات إلى ثلاثة؛ هل تقفز إلى 3D؟

**الخلاصة:** قد يضيف عرض مجسم على شاشة ثنائية الأبعاد منظورًا وحجبًا دون تحسين المقارنة.

**القيد:** اختر الترميز بحسب المهمة، لا عدد الأبعاد وحده.

**الدليل المحلي:** perspective and occlusion problems

المصدر: `content/data-viz/pages.json#/1/blocks/2/inline/2/text`

مسار التعلم: `/learn/advanced-multivariate/`

## hansa-bank-110 — الموضع أدق من المساحة في المقارنة

visualization / relationships

**السؤال:** تحتاج مقارنة دقيقة؛ هل تعتمد على حجم الفقاعة أو شفافيتها؟

**الخلاصة:** يحكم البشر عادة على الموضع بدقة أعلى من المساحة أو الشفافية؛ استخدمهما كترميزين ثانويين عند الحاجة.

**القيد:** لا تتوقع قراءة قيم دقيقة من ترميز إضافي ضعيف.

**الدليل المحلي:** Humans generally judge position more accurately than area or opacity.

المصدر: `content/data-viz/pages.json#/1/blocks/19/inline/0/text`

مسار التعلم: `/learn/advanced-multivariate/`

## hansa-bank-111 — Faceting تفصل المجموعات بصريًا

visualization / relationships

**السؤال:** متغيرك الثالث فئوي؛ كيف تفحصه دون تراكب كل النقاط؟

**الخلاصة:** تقسم faceting البيانات إلى لوحات لفئات فرعية، فتتيح مقارنة أنماطها.

**القيد:** راجع اتساق المقاييس بين اللوحات.

**الدليل المحلي:** Faceting creates separate panels for subsets of the data.

المصدر: `content/data-viz/pages.json#/1/blocks/21/inline/0/text`

مسار التعلم: `/learn/advanced-multivariate/`

## hansa-bank-112 — عدد اللوحات له تكلفة قراءة

visualization / relationships

**السؤال:** هل زيادة اللوحات الصغيرة تحسن الفهم بلا حدود؟

**الخلاصة:** قد تزيد دقة المقارنة، لكنها تزيد حركة العين والحمل المعرفي أيضًا.

**القيد:** وازن دقة العرض مع تكلفة مسحه بصريًا.

**الدليل المحلي:** More/smaller panels can increase precision but also increase eye movement and cognitive load.

المصدر: `content/data-viz/pages.json#/1/blocks/24/inline/0/text`

مسار التعلم: `/learn/advanced-multivariate/`

## hansa-bank-113 — Heatmap أداة فرز أولي

visualization / relationships

**السؤال:** لديك عشرات المقاييس؛ ما دور خريطة الارتباط؟

**الخلاصة:** تساعد في فرز العلاقات القوية المرشحة للفحص، بدل رسم كل زوج فورًا.

**القيد:** خريطة Pearson لا تستبدل فحص العلاقات غير الخطية في scatter plots.

**الدليل المحلي:** find strongly related variables among tens of metrics.

المصدر: `content/data-viz/pages.json#/1/blocks/42/inline/2/text`

مسار التعلم: `/learn/advanced-multivariate/`

## hansa-bank-114 — كل خط في Parallel Coordinates مشاهدة

visualization / relationships

**السؤال:** ماذا تمثل الخطوط التي تعبر محاور عدة؟

**الخلاصة:** يمثل كل خط مشاهدة تمر بمحور رأسي لكل متغير، مما يسمح بفحص الملفات والأنماط متعددة المتغيرات.

**القيد:** انتبه إلى مقياس كل محور.

**الدليل المحلي:** Each observation becomes a line crossing one vertical axis per variable.

المصدر: `content/data-viz/pages.json#/1/blocks/49/inline/0/text`

مسار التعلم: `/learn/advanced-multivariate/`

## hansa-bank-115 — تقاطع الخطوط قد يخفي الملفات

visualization / relationships

**السؤال:** أصبحت Parallel Coordinates شديدة التشابك؛ ما الذي تجرب؟

**الخلاصة:** قد يساعد التجميع أو الترشيح أو الشفافية أو ترتيب المتغيرات أو إبراز مشاهدات محددة.

**القيد:** اختيار الحل يتبع المجموعة التي تريد فهمها، لا مجرد تقليل عدد الخطوط.

**الدليل المحلي:** line crossings create a visual "spaghetti" effect.

المصدر: `content/data-viz/pages.json#/1/blocks/58/inline/0/text`

مسار التعلم: `/learn/advanced-multivariate/`

## hansa-bank-116 — منتصف الليل يكشف فائدة العرض الدائري

visualization / relationships

**السؤال:** النشاط قبل منتصف الليل وبعده يبدو منفصلًا على طرفي الرسم؛ لماذا؟

**الخلاصة:** في ظاهرة دورية، بداية اليوم ونهايته متجاورتان، وقد يوضح التمثيل القطبي دفعة النشاط عبر منتصف الليل.

**القيد:** استخدم الدائرة عندما تعكس دورية حقيقية، لا كزخرفة.

**الدليل المحلي:** A polar representation joins the cycle

المصدر: `content/data-viz/pages.json#/1/blocks/72/inline/0/text`

مسار التعلم: `/learn/advanced-multivariate/`

## hansa-bank-117 — طول العمود يحتاج خط أساس أمين

visualization / accessibility

**السؤال:** فرق صغير يبدو هائلًا في أعمدة؛ ماذا تفحص أولًا؟

**الخلاصة:** قطع خط الأساس قد يضخم الفرق عندما يمثل طول العمود مقدار القيمة.

**القيد:** هذه قاعدة لترميز الطول، وليست منعًا عامًا لكل محور غير صفري في كل رسم.

**الدليل المحلي:** A truncated baseline can exaggerate small differences.

المصدر: `content/data-viz/pages.json#/24/blocks/26/inline/0/text`

مسار التعلم: `/learn/visual-integrity/`

## hansa-bank-118 — المحوران قد يصنعان علاقة ظاهرية

visualization / accessibility

**السؤال:** هل تقارب خطين بوحدتين مختلفتين دليل ارتباط قوي؟

**الخلاصة:** تغيير نطاق أي من المحورين قد يغير العلاقة البصرية الظاهرة؛ لوحات منفصلة بمحاور واضحة تقلل الالتباس.

**القيد:** الحركة المتشابهة في الرسم لا تثبت علاقة سببية.

**الدليل المحلي:** changing either scale can change the apparent visual relationship

المصدر: `content/data-viz/pages.json#/24/blocks/33/inline/0/text`

مسار التعلم: `/learn/visual-integrity/`

## hansa-bank-119 — التبسيط لا يعني حذف التفسير

visualization / accessibility

**السؤال:** هل تحذف labels والمحاور لتحقيق تصميم قليل الحبر؟

**الخلاصة:** احتفظ بكل ما يلزم لفهم البيانات؛ قد تقلل التسميات والمحاور والتعليقات الغموض.

**القيد:** المعيار فهم المعنى، وليس أقل عدد من العناصر.

**الدليل المحلي:** The objective is not minimum ink

المصدر: `content/data-viz/pages.json#/24/blocks/64/inline/0/text`

مسار التعلم: `/learn/visual-integrity/`

## hansa-bank-120 — الفئات الكثيرة قد تحتاج مهمة أخرى

visualization / accessibility

**السؤال:** امتلأ الرسم بألوان وأسماء غير مقروءة؛ ما البدائل؟

**الخلاصة:** قد يكون التجميع أو الترشيح أو الترتيب أو إعادة التصميم أنسب بحسب السؤال.

**القيد:** لا تخفِ فئات مهمة دون بيان ما تم تجميعه.

**الدليل المحلي:** Aggregate, filter, rank, or redesign when appropriate.

المصدر: `content/data-viz/pages.json#/24/blocks/16/inline/0/text`

مسار التعلم: `/learn/visual-integrity/`

## hansa-bank-121 — الزخرفة تقاس بأثرها على التفسير

visualization / accessibility

**السؤال:** متى يصبح العنصر البصري chartjunk؟

**الخلاصة:** عندما يصعّب التفسير دون إضافة معلومات ذات معنى.

**القيد:** ليس كل عنصر تجميلي خطأ؛ افحص وظيفته الفعلية.

**الدليل المحلي:** visual elements that make interpretation harder without adding meaningful information

المصدر: `content/data-viz/pages.json#/24/blocks/44/inline/1/text`

مسار التعلم: `/learn/visual-integrity/`

## hansa-bank-122 — فرق النسب له وحدة

visualization / accessibility

**السؤال:** في مثال 22.5% و21%، كم الفرق المباشر؟

**الخلاصة:** الفرق 1.5 نقطة مئوية، فلا تدع المقياس المرسوم يوحي بفارق أضخم.

**القيد:** النقاط المئوية تختلف عن نسبة التغير النسبي.

**الدليل المحلي:** a difference of only 1.5 percentage points

المصدر: `content/data-viz/pages.json#/24/blocks/28/inline/0/text`

مسار التعلم: `/learn/visual-integrity/`

## hansa-bank-123 — الأنماط المتزاحمة قد تصعب التمييز

visualization / accessibility

**السؤال:** هل إضافة خطوط وتهشير لكل فئة تحل دائمًا مشكلة التمييز؟

**الخلاصة:** قد يصعب تمييز الأنماط مع كثرة الفئات؛ يوصي المصدر بالتسميات المباشرة ولوحة مقيدة عندما يلائمان المهمة.

**القيد:** اختر بديلًا مفهومًا للون دون خلق ازدحام جديد.

**الدليل المحلي:** Patterns such as stripes and cross-hatching can be difficult to distinguish

المصدر: `content/data-viz/pages.json#/24/blocks/60/inline/0/text`

مسار التعلم: `/learn/visual-integrity/`

## hansa-bank-124 — الاتجاه المجمع قد ينعكس داخل المجموعات

visualization / overview

**السؤال:** القصة العامة واضحة؛ لماذا تفحص القطاعات أيضًا؟

**الخلاصة:** قد تختفي العلاقة المجمعة أو تنعكس بعد التقسيم بسبب اختلاف تركيب المجموعات.

**القيد:** افحص مزيج المجموعات قبل تعميم قصة عن الإجمالي.

**الدليل المحلي:** العلاقة المجمعة قد تختفي أو تنعكس بعد segmentation

المصدر: `content/data-viz/pages.json#/22/blocks/5/inline/0/text`

مسار التعلم: `/learn/statistical-traps/`

## hansa-bank-125 — مستوى التجميع يتبع مستوى القرار

visualization / overview

**السؤال:** هل متوسط شهري يكفي لقرار يخص تقلبًا يوميًا؟

**الخلاصة:** قد يخفي المتوسط الشهري التذبذب اليومي؛ يجب أن يتوافق مستوى التجميع مع القرار.

**القيد:** لا تجعل سهولة التلخيص سببًا لإخفاء التغير المهم.

**الدليل المحلي:** متوسط شهري قد يخفي التذبذب اليومي.

المصدر: `content/data-viz/pages.json#/22/blocks/8/inline/0/text`

مسار التعلم: `/learn/statistical-traps/`

## hansa-bank-126 — علاقة المجموعات لا تصف كل فرد

visualization / overview

**السؤال:** وجدت ارتباطًا بين متوسطات مناطق؛ هل ينطبق على أفرادها؟

**الخلاصة:** العلاقة على مستوى المجموعات ليست بالضرورة صحيحة على مستوى الأفراد.

**القيد:** تجنب الاستنتاج الفردي من ملخص تجميعي بلا دليل.

**الدليل المحلي:** العلاقة على مستوى المجموعات ليست بالضرورة صحيحة على مستوى الأفراد.

المصدر: `content/data-viz/pages.json#/22/blocks/10/inline/0/text`

مسار التعلم: `/learn/statistical-traps/`

## hansa-bank-127 — رسم نظيف لعينة منحازة يظل منحازًا

visualization / overview

**السؤال:** هل جودة التصميم تكفي إذا كانت البيانات غير ممثلة؟

**الخلاصة:** قد يكون الرسم واضحًا بصريًا لكنه منحاز بسبب اختيار العينة أو ارتباط الفقد بالنتيجة.

**القيد:** راجع من دخل البيانات ومن غاب عنها.

**الدليل المحلي:** العينة غير ممثلة أو missingness مرتبطة بالنتيجة.

المصدر: `content/data-viz/pages.json#/22/blocks/12/inline/0/text`

مسار التعلم: `/learn/statistical-traps/`

## hansa-bank-128 — كثرة الاستكشاف تزيد فرص الأنماط العرضية

visualization / overview

**السؤال:** بحثت في قطاعات كثيرة ووجدت نمطًا مثيرًا؛ ما الخطوة التالية؟

**الخلاصة:** كلما زاد الفحص زادت فرصة ظهور أنماط شاذة بالصدفة؛ تعامل معها كفرضيات تحتاج تحققًا.

**القيد:** لا تحول نتيجة استكشافية واحدة إلى حقيقة مؤكدة.

**الدليل المحلي:** زادت فرصة ظهور patterns شاذة بالصدفة.

المصدر: `content/data-viz/pages.json#/22/blocks/14/inline/0/text`

مسار التعلم: `/learn/statistical-traps/`

## hansa-bank-129 — اعرض عدم اليقين مع التقدير

visualization / overview

**السؤال:** هل يكفي عرض رقم تقديري واحد شديد الدقة؟

**الخلاصة:** يمكن استخدام فترات أو أشرطة خطأ أو نطاقات أو توزيعات تقديرات لتوضيح عدم اليقين.

**القيد:** اختر تمثيلًا صحيحًا لما تم حسابه، لا نطاقًا زخرفيًا.

**الدليل المحلي:** بدل تقديم الرقم كحقيقة دقيقة.

المصدر: `content/data-viz/pages.json#/22/blocks/18/inline/0/text`

مسار التعلم: `/learn/statistical-traps/`

## hansa-bank-130 — ارتفاع التحويل لا يشرح السبب وحده

visualization / overview

**السؤال:** زاد conversion rate؛ هل تحسن الأداء بالضرورة؟

**الخلاصة:** راجع المقام ومزيج الجمهور والموسمية ومصدر الزيارات وعدم اليقين والقيمة العملية للزيادة.

**القيد:** النسبة وحدها لا تعزل سبب التحسن.

**الدليل المحلي:** افحص denominator، mix، seasonality، uncertainty، traffic source

المصدر: `content/data-viz/pages.json#/22/blocks/23/inline/0/text`

مسار التعلم: `/learn/statistical-traps/`

## hansa-bank-131 — الصناديق المتشابهة قد تخفي قممًا مختلفة

visualization / distribution

**السؤال:** هل تشابه Box Plots يثبت تشابه التوزيعين؟

**الخلاصة:** قد تخفي الصناديق توزيعات متعددة القمم ومختلفة، لأنها ملخص مضغوط.

**القيد:** أضف عرضًا يكشف الشكل عندما تكون القمم مهمة.

**الدليل المحلي:** توزيعاتهما متعددة القمم ومختلفة جدًا.

المصدر: `content/data-viz/pages.json#/3/blocks/21/inline/0/text`

مسار التعلم: `/learn/ar/box-plot/`

## hansa-bank-132 — العينة الصغيرة تستفيد من النقاط الخام

visualization / distribution

**السؤال:** هل تختصر مشاهدات قليلة إلى صندوق فقط؟

**الخلاصة:** عرض النقاط الخام بجانب Box Plot قد يكون أكثر إفادة مع العينات الصغيرة.

**القيد:** وازن إظهار التفاصيل مع الخصوصية والحاجة التعليمية في التطبيق الفعلي.

**الدليل المحلي:** مع العينات الصغيرة، قد يكون عرض النقاط الخام بجانب الصندوق أكثر إفادة.

المصدر: `content/data-viz/pages.json#/3/blocks/21/inline/0/text`

مسار التعلم: `/learn/ar/box-plot/`

## hansa-bank-133 — النقطة لا تحتاج عمودًا من الصفر

visualization / comparison

**السؤال:** لماذا قد يلائم Dot Plot مقارنة قيم على محور لوغاريتمي؟

**الخلاصة:** يمثل القيمة بموضع نقطة، فلا يحتاج إلى عمود يبدأ من صفر لا يمكن تمثيله على log.

**القيد:** يجب أن يكون استخدام المقياس اللوغاريتمي مناسبًا لمعنى المقارنة.

**الدليل المحلي:** يمكن استخدام محور Log.

المصدر: `content/data-viz/pages.json#/7/blocks/5/inline/0/text`

مسار التعلم: `/learn/ar/dot-plot/`

## hansa-bank-134 — الخطوة المتساوية على Log ليست إضافة ثابتة

visualization / comparison

**السؤال:** ما معنى خطوتين متساويتين على محور log أساسه 10؟

**الخلاصة:** كل خطوة متساوية تمثل ضربًا في 10، وليس إضافة مقدار ثابت.

**القيد:** وضح طبيعة المقياس للقارئ.

**الدليل المحلي:** على مقياس Log أساسه 10، كل خطوة متساوية تمثل ×10.

المصدر: `content/data-viz/pages.json#/7/blocks/12/inline/0/text`

مسار التعلم: `/learn/ar/dot-plot/`

## hansa-bank-135 — النمو النسبي الثابت يختلف عن الزيادة الثابتة

visualization / time

**السؤال:** كمية تزيد بمبلغ ثابت وأخرى بنسبة ثابتة؛ هل تتبعان النمط نفسه؟

**الخلاصة:** الزيادة المطلقة الثابتة قد تنتج مسارًا خطيًا، بينما الزيادة بنسبة أو معامل ثابت قد تنتج نموًا أسيًا.

**القيد:** افحص الفرضية والبيانات بدل الاستدلال من الشكل وحده.

**الدليل المحلي:** النمو الخطي مقابل النمو الأسي

المصدر: `content/data-viz/pages.json#/9/headings/3/text`

مسار التعلم: `/learn/ar/line-plot/`

## hansa-bank-136 — أجزاء Stacked Bar لا تتساوى في سهولة المقارنة

visualization / composition

**السؤال:** لماذا يصعب مقارنة بعض الأجزاء المكدسة أكثر من الجزء الأول؟

**الخلاصة:** الأجزاء التي لا تشترك في خط أساس تكون مقارنتها أقل دقة.

**القيد:** إذا كان الفرق بين الأجزاء هو السؤال الرئيسي، راجع طريقة العرض.

**الدليل المحلي:** المقارنة بين أجزاء لا تشترك في نفس خط الأساس تكون أقل دقة.

المصدر: `content/data-viz/pages.json#/2/blocks/17/inline/0/text`

مسار التعلم: `/learn/ar/bar-plot/`

## hansa-bank-137 — الذيل يحدد اتجاه الالتواء

visualization / distribution

**السؤال:** أين تنظر لتقرر هل التوزيع ملتوي لليمين أم اليسار؟

**الخلاصة:** اتجاه الذيل الأطول يشير إلى اتجاه الالتواء.

**القيد:** لا تحدد الاتجاه من موضع القمة وحده.

**الدليل المحلي:** الذيل يشير إلى اتجاه الالتواء.

المصدر: `content/data-viz/pages.json#/8/blocks/24/inline/1/text`

مسار التعلم: `/learn/ar/histogram/`

## hansa-bank-138 — Kurtosis ليست ارتفاع القمة فقط

visualization / distribution

**السؤال:** هل يكفي النظر إلى قمة حادة للحكم على kurtosis؟

**الخلاصة:** المفهوم مرتبط بسلوك الذيول والقيم المتطرفة والعزوم الإحصائية، ولا يختزل في ارتفاع القمة.

**القيد:** استخدم التعريف والتحليل المناسبين بدل الانطباع الشكلي.

**الدليل المحلي:** لا تختزل Kurtosis في "ارتفاع القمة" فقط

المصدر: `content/data-viz/pages.json#/8/blocks/30/inline/1/text`

مسار التعلم: `/learn/ar/histogram/`

## hansa-bank-139 — المال يحتاج نوعًا مناسبًا

sql / types-null

**السؤال:** هل تستخدم floating point لمبلغ يتطلب تمثيلًا عشريًا دقيقًا؟

**الخلاصة:** يوجه المرجع إلى numeric أو decimal عندما تكون الدقة العشرية مطلوبة، خصوصًا للمبالغ المالية.

**القيد:** اختيار النوع لا يغني عن تحديد قواعد التقريب المطلوبة.

**الدليل المحلي:** Floating-point types are approximate and can introduce representation differences.

المصدر: `content/sql/vault.json#/pages/3/body`

مسار التعلم: `/learn/sql/03/`

## hansa-bank-140 — NULLIF يحول حالة خاصة إلى NULL

sql / types-null

**السؤال:** تريد معالجة مقام يساوي صفرًا؛ ماذا يفعل NULLIF(quantity, 0)؟

**الخلاصة:** يعيد NULL عندما يتساوى التعبيران، فيمكن استخدامه في المقام بدل تنفيذ قسمة على صفر.

**القيد:** حدد معنى النتيجة المفقودة بدل تحويلها تلقائيًا إلى صفر.

**الدليل المحلي:** Returns NULL when two expressions are equal.

المصدر: `content/sql/vault.json#/pages/3/body`

مسار التعلم: `/learn/sql/03/`

## hansa-bank-141 — COALESCE يختار أول قيمة متاحة

sql / types-null

**السؤال:** عند وجود عدة بدائل لقيمة مفقودة، كيف تختار COALESCE؟

**الخلاصة:** تعيد أول تعبير غير NULL بحسب ترتيب الوسائط.

**القيد:** الترتيب يعبر عن أولوية العمل؛ وجود قيمة لا يثبت صحتها.

**الدليل المحلي:** Returns the first non-NULL expression.

المصدر: `content/sql/vault.json#/pages/3/body`

مسار التعلم: `/learn/sql/03/`

## hansa-bank-142 — المفتاحان المفقودان لا يتطابقان بالمساواة

sql / types-null

**السؤال:** هل NULL في مفتاحي جدولين يصنع تطابقًا في JOIN باستخدام =؟

**الخلاصة:** المساواة العادية لا تجعل NULL مساوية لـNULL، فلا تنشأ المطابقة بهذا الشرط.

**القيد:** إذا كان تطابق المفقود مطلوبًا، استخدم أسلوبًا ملائمًا للهجة ودوّن المقصود.

**الدليل المحلي:** NULL = NULL</code> is not TRUE.

المصدر: `content/sql/vault.json#/pages/3/body`

مسار التعلم: `/learn/sql/03/`

## hansa-bank-143 — غياب الصفوف ليس إجماليًا صفريًا

sql / types-null

**السؤال:** هل عدم وجود صفوف، أو وجود قيم كلها NULL، أو قيمة صفر، حالات متكافئة؟

**الخلاصة:** المرجع يطلب فصل الحالات الثلاث لأنها قد تحمل معاني عمل مختلفة.

**القيد:** لا تستبدلها جميعًا بصفر لمجرد توحيد شكل التقرير.

**الدليل المحلي:** Always distinguish <b>no rows</b>, <b>all NULL</b>, and <b>zero</b> as business states.

المصدر: `content/sql/vault.json#/pages/3/body`

مسار التعلم: `/learn/sql/03/`

## hansa-bank-144 — الأقواس توضح منطق الشروط

sql / filtering

**السؤال:** تجمع شرط دولة مع بديلين للحالة؛ كيف تمنع التباس AND وOR؟

**الخلاصة:** اكتب الأقواس حول البدائل التي تمثل وحدة منطقية، بدل الاعتماد على تذكر أولوية العمليات.

**القيد:** تحقق أن التجميع يعكس تعريف المجتمع المطلوب.

**الدليل المحلي:** Use parentheses whenever business logic could be ambiguous.

المصدر: `content/sql/vault.json#/pages/4/body`

مسار التعلم: `/learn/sql/04/`

## hansa-bank-145 — CASE البسيطة أم الشرطية؟

sql / filtering

**السؤال:** هل تقارن تعبيرًا واحدًا بقيم، أم تختبر شروطًا مستقلة؟

**الخلاصة:** Simple CASE تقارن تعبيرًا بقيم؛ Searched CASE تختبر شروطًا مستقلة.

**القيد:** اختر الشكل الذي يوضح قاعدة التصنيف.

**الدليل المحلي:** Simple CASE compares one expression against values.

المصدر: `content/sql/vault.json#/pages/4/body`

مسار التعلم: `/learn/sql/04/`

## hansa-bank-146 — CASE بلا ELSE لها نتيجة

sql / filtering

**السؤال:** لا يطابق الصف أي WHEN ولم تكتب ELSE؛ ماذا تتوقع؟

**الخلاصة:** تعيد CASE قيمة NULL في هذه الحالة، بدل قيمة افتراضية مخفية.

**القيد:** عالج الحالات غير المصنفة عمدًا إن كان العمل يتطلب ذلك.

**الدليل المحلي:** returns NULL if no ELSE is supplied.

المصدر: `content/sql/vault.json#/pages/4/body`

مسار التعلم: `/learn/sql/04/`

## hansa-bank-147 — شرط اليمين قد يلغي أثر LEFT JOIN

sql / filtering

**السؤال:** وضعت شرطًا على الجدول الأيمن في WHERE؛ لماذا اختفت الصفوف غير المطابقة؟

**الخلاصة:** الشرط قد يستبعد الصفوف الممتدة بـNULL؛ وضع شرط المطابقة في ON يساعد على حفظ الصفوف اليسرى غير المطابقة عندما يكون هذا هو المقصود.

**القيد:** ليس نقل أي شرط بين ON وWHERE تحويلًا محايدًا.

**الدليل المحلي:** putting a right-table condition in <code>WHERE</code> can remove NULL-extended rows.

المصدر: `content/sql/vault.json#/pages/4/body`

مسار التعلم: `/learn/sql/04/`

## hansa-bank-148 — التصنيف يحتاج أولوية معلنة

sql / filtering

**السؤال:** عميل يطابق أكثر من وصف تجاري؛ ما الذي يجب توثيقه؟

**الخلاصة:** حدد مجتمع التصنيف وقاعدة الأولوية بين الحالات، بدل ترك التداخل غير محسوم.

**القيد:** اختبر الحالات المتداخلة وحدود الشروط.

**الدليل المحلي:** Each classification should have an explicit population and precedence rule.

المصدر: `content/sql/vault.json#/pages/4/body`

مسار التعلم: `/learn/sql/04/`

## hansa-bank-149 — FULL OUTER JOIN للمصالحة

sql / joins

**السؤال:** تريد رؤية السجلات غير المطابقة في كلا المصدرين؛ أي سلوك تحتاج؟

**الخلاصة:** FULL OUTER JOIN يحفظ الصفوف غير المطابقة من الجانبين، مما يفيد المقارنة والمصالحة.

**القيد:** راجع مفاتيح المطابقة قبل تفسير كل اختلاف كفقد بيانات.

**الدليل المحلي:** preserves unmatched rows from both sides

المصدر: `content/sql/vault.json#/pages/5/body`

مسار التعلم: `/learn/sql/05/`

## hansa-bank-150 — المفتاح المركب لا يحتمل نصف شرط

sql / joins

**السؤال:** العلاقة تعتمد على الطالب والفصل؛ ماذا يحدث عند الربط بالطالب فقط؟

**الخلاصة:** حذف جزء من شرط العلاقة المركبة قد ينتج مطابقات زائفة عبر الفصول.

**القيد:** اكتب الشرط وفق هوية العلاقة الفعلية.

**الدليل المحلي:** Joining on only one component can create false matches.

المصدر: `content/sql/vault.json#/pages/5/body`

مسار التعلم: `/learn/sql/05/`

## hansa-bank-151 — جدول واحد ودوران في Self JOIN

sql / joins

**السؤال:** كيف تعرض اسم الموظف واسم مديره من جدول الموظفين نفسه؟

**الخلاصة:** يمكن ربط الجدول بنفسه باستخدام أسماء مستعارة تميز دور الموظف عن دور المدير.

**القيد:** حدد العلاقة واتجاهها؛ وجود الجدول مرة واحدة في المصدر لا يمنع تعدد أدواره.

**الدليل المحلي:** A table can be joined to itself.

المصدر: `content/sql/vault.json#/pages/5/body`

مسار التعلم: `/learn/sql/05/`

## hansa-bank-152 — التجميع قبل ربط جدولين تفصيليين

sql / joins

**السؤال:** تريد إجمالي طلبات ومدفوعات لكل عميل من جدولين متعددَي الصفوف؛ كيف تحد من fan-out؟

**الخلاصة:** جمّع كل جانب متعدد إلى مستوى العميل أولًا، ثم اربط الملخصين إذا كان هذا مستوى النتيجة المطلوبة.

**القيد:** لا تستخدم التجميع المسبق إذا كانت النتيجة تحتاج تفاصيل فقدتها.

**الدليل المحلي:** Aggregate each many-side independently before joining when the business grain requires it.

المصدر: `content/sql/vault.json#/pages/5/body`

مسار التعلم: `/learn/sql/05/`

## hansa-bank-153 — Scalar subquery لها عقد قيمة واحدة

sql / subqueries

**السؤال:** تحتاج آخر تاريخ طلب بجوار كل عميل؛ ما شكل نتيجة الاستعلام الداخلي؟

**الخلاصة:** الـscalar subquery تعيد قيمة واحدة لكل صف خارجي في هذا النمط.

**القيد:** إذا تعقد الحساب أو ارتفعت كلفته، راجع الربط أو التجميع المسبق.

**الدليل المحلي:** A scalar subquery returns one value per outer row.

المصدر: `content/sql/vault.json#/pages/7/body`

مسار التعلم: `/learn/sql/07/`

## hansa-bank-154 — CTE تنظّم الكود ولا تضمن السرعة

sql / subqueries

**السؤال:** أعدت كتابة الاستعلام باستخدام WITH؛ هل صار أسرع تلقائيًا؟

**الخلاصة:** CTE آلية لتنظيم الاستعلام وتسميه مراحله، ولا تضمن materialization أو تحسن الأداء في كل محرك.

**القيد:** افحص خطة التنفيذ عند تقييم الأداء.

**الدليل المحلي:** do not assume a CTE automatically materializes or improves performance in every database.

المصدر: `content/sql/vault.json#/pages/7/body`

مسار التعلم: `/learn/sql/07/`

## hansa-bank-155 — التجميع الداخلي يسبق مرشح النتيجة

sql / subqueries

**السؤال:** تحتاج فلترة العملاء حسب مجموع طلباتهم؛ لماذا تستخدم derived table؟

**الخلاصة:** يمكن للتعبير داخل FROM أن يجمع أولًا، ثم يستخدم الاستعلام الخارجي النتيجة للترشيح أو الربط.

**القيد:** راجع مستوى تفصيل النتيجة الوسيطة.

**الدليل المحلي:** aggregate first, then filter or join

المصدر: `content/sql/vault.json#/pages/7/body`

مسار التعلم: `/learn/sql/07/`

## hansa-bank-156 — سمِّ مراحل السؤال المعقد

sql / subqueries

**السؤال:** أصبح التداخل يخفي هدف كل خطوة؛ كيف تحسن قابلية المراجعة؟

**الخلاصة:** قسّم المنطق إلى مراحل مسماة باستخدام CTE عندما تستحق كل خطوة اسمًا واضحًا.

**القيد:** التسمية تحسن الفهم ولا تثبت صحة النتائج وحدها.

**الدليل المحلي:** Prefer a CTE or staged transformation when each logical step deserves a name.

المصدر: `content/sql/vault.json#/pages/7/body`

مسار التعلم: `/learn/sql/07/`

## hansa-bank-157 — كسر التعادل يجعل ROW_NUMBER محددًا

sql / windows

**السؤال:** تساوت قيم ORDER BY وتحتاج اختيار صف محدد؛ ما الناقص؟

**الخلاصة:** أضف معيار ترتيب إضافيًا يكسر التعادل بدل افتراض ثبات الصف الذي يحصل على الرقم الأصغر.

**القيد:** اجعل معايير الترتيب كافية لتمييز الصفوف المطلوبة.

**الدليل المحلي:** أضف عمودًا لكسر التعادل

المصدر: `content/sql/vault.json#/pages/46/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810298facf8975c21394/`

## hansa-bank-158 — RANK يترك فجوات بعد التعادل

sql / windows

**السؤال:** القيم 100 و90 و90 و80؛ كيف تختلف الرتب الكثيفة؟

**الخلاصة:** RANK يعطي 1،2،2،4، بينما DENSE_RANK يعطي 1،2،2،3 في مثال المصدر.

**القيد:** اختر معنى الرتبة قبل استخدام حد مثل أعلى ثلاث رتب.

**الدليل المحلي:** القيم المتساوية لها نفس rank، وبعد التعادل يحدث

المصدر: `content/sql/vault.json#/pages/46/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810298facf8975c21394/`

## hansa-bank-159 — NTILE يقسم الصفوف لا حدود القيم

sql / windows

**السؤال:** هل NTILE(4) يعني أن كل من يتجاوز قيمة ثابتة يدخل الربع الأول؟

**الخلاصة:** يرتب NTILE الصفوف ثم يقسمها إلى مجموعات متقاربة العدد، لا إلى حدود قيم تجارية ثابتة.

**القيد:** قد تختلف أحجام المجموعات عندما لا يقبل العدد القسمة.

**الدليل المحلي:** approximately equal in size

المصدر: `content/sql/vault.json#/pages/46/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810298facf8975c21394/`

## hansa-bank-160 — LAG يحترم حدود المجموعة

sql / windows

**السؤال:** أول صف في مجموعة جديدة له صف سابق في الجدول؛ هل LAG تعبر إليه؟

**الخلاصة:** LAG لا تعبر إلى partition أخرى؛ معنى السابق تحدده المجموعة وترتيبها.

**القيد:** تأكد أن partition يمثل الكيان الذي تقارن تاريخه.

**الدليل المحلي:** لا تعبر إلى partition أخرى.

المصدر: `content/sql/vault.json#/pages/47/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c8163b26ae203d48a5518/`

## hansa-bank-161 — LAST_VALUE تحتاج مراجعة الإطار

sql / windows

**السؤال:** طلبت آخر قيمة فحصلت على قيمة قريبة من الصف الحالي؛ ما الذي تفحصه؟

**الخلاصة:** راجع default frame؛ قد ينتهي عند الصف الحالي بدل نهاية المجموعة، فوسّع الإطار إذا أردت آخر قيمة في المجموعة كاملة.

**القيد:** تختلف التفاصيل حسب المحرك ومعايير الترتيب.

**الدليل المحلي:** لذلك قد تصبح <code>LAST_VALUE</code> مساوية لقيمة الصف الحالي بدل آخر قيمة في الجدول.

المصدر: `content/sql/vault.json#/pages/47/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c8163b26ae203d48a5518/`

## hansa-bank-162 — رقم الشهر غير بداية الشهر

sql / time

**السؤال:** هل EXTRACT(MONTH) يعطي نفس هوية الفترة التي تعطيها DATE_TRUNC؟

**الخلاصة:** EXTRACT يعيد مكوّنًا مثل 7؛ DATE_TRUNC للشهر يعيد قيمة زمنية تمثل بداية الشهر.

**القيد:** رقم الشهر وحده لا يميز سنة عن أخرى.

**الدليل المحلي:** بترجع timestamp يمثل بداية الشهر ده.

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-163 — أضف مدة إلى timestamp بوضوح

sql / time

**السؤال:** تريد إضافة أيام إلى timestamp في PostgreSQL؛ هل تفترض سلوك DATE مع integer؟

**الخلاصة:** المصدر يوصي باستخدام INTERVAL للحساب على timestamp بدل افتراض أن إضافة عدد صحيح تعمل كما في DATE.

**القيد:** صياغة الحساب مرتبطة باللهجة المذكورة.

**الدليل المحلي:** إضافة integer لـtimestamp مش زي إضافته لـdate

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-164 — أنشئ تقويمًا بدل انتظار صفوف الأحداث

sql / time

**السؤال:** تحتاج سلسلة أيام في PostgreSQL؛ ما وظيفة GENERATE_SERIES؟

**الخلاصة:** تولّد سلسلة timestamps من بداية إلى نهاية بخطوة زمنية محددة.

**القيد:** توليد يوم لا يعني أن حدثًا وقع فيه؛ تظل بيانات الأحداث منفصلة.

**الدليل المحلي:** تقدر تولّد بيها سلسلة من الـtimestamps.

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-165 — بحث الجزء لا يعني تطابق الكلمة

sql / text

**السؤال:** هل LIKE '%apple%' يقتصر على القيمة apple؟

**الخلاصة:** قد يطابق pineapple أيضًا؛ إذا أردت قيمة كاملة فحدد المقارنة بعد التطبيع الملائم.

**القيد:** قواعد التطبيع تعتمد على معنى النص المطلوب.

**الدليل المحلي:** بتطابق كمان <code>pineapple</code>.

المصدر: `content/sql/vault.json#/pages/11/body`

مسار التعلم: `/learn/sql/11/`

## hansa-bank-166 — LOWER لا ينظف المسافات

sql / text

**السؤال:** وحّدت حالة الأحرف وما زالت الفئات مختلفة؛ ماذا بقي؟

**الخلاصة:** LOWER يعالج اختلاف الحالة، لكنه لا يعالج المسافات الزائدة أو صيغة الجمع.

**القيد:** لا تساوِ توحيد الحالة بتنظيف النص كله.

**الدليل المحلي:** ده بيحل مشكلة اختلاف الحالة بس <b>مش</b> المسافات الزايدة أو صيغة الجمع.

المصدر: `content/sql/vault.json#/pages/11/body`

مسار التعلم: `/learn/sql/11/`

## hansa-bank-167 — TRIM الافتراضي ليس لكل whitespace

sql / text

**السؤال:** بقي tab أو newline بعد التنظيف؛ هل هذا يناقض TRIM؟

**الخلاصة:** المصدر يوضح أن الدوال المذكورة تزيل space العادي افتراضيًا، وليس كل أنواع whitespace.

**القيد:** حدد الأحرف المقصودة واختبر بياناتك الفعلية.

**الدليل المحلي:** مش كل أنواع الـwhitespace زي الـtabs/newlines.

المصدر: `content/sql/vault.json#/pages/11/body`

مسار التعلم: `/learn/sql/11/`

## hansa-bank-168 — غياب التكرار الآن ليس ضمانًا دائمًا

sql / quality

**السؤال:** أعاد اختبار التفرد صفر صفوف؛ ماذا أثبت؟

**الخلاصة:** أثبت أن قاعدة التفرد صمدت على البيانات المختبرة، لا أنها ستصمد دائمًا.

**القيد:** أعد الفحص عند وصول بيانات جديدة أو استخدم قيودًا مناسبة.

**الدليل المحلي:** not proof that the rule will always hold.

المصدر: `content/sql/vault.json#/pages/13/body`

مسار التعلم: `/learn/sql/13/`

## hansa-bank-169 — القيمة الشاذة إشارة للتحقيق

sql / quality

**السؤال:** اكتشفت ارتفاعًا غير معتاد؛ هل تحذفه باعتباره خطأ؟

**الخلاصة:** وجود outlier يستدعي التحقيق ولا يثبت تلقائيًا فساد البيانات.

**القيد:** افحص المصدر والسياق قبل التصحيح أو الحذف.

**الدليل المحلي:** not automatic proof of bad data.

المصدر: `content/sql/vault.json#/pages/13/body`

مسار التعلم: `/learn/sql/13/`

## hansa-bank-170 — المجال المسموح مرجع مشترك

sql / quality

**السؤال:** تكرر قائمة status المسموحة في استعلامات عديدة؛ كيف تقلل اختلافها؟

**الخلاصة:** يفضل المرجع جداول مرجعية أو قيودًا عند الإمكان بدل تكرار قوائم العمل ثابتة في كل استعلام.

**القيد:** القائمة نفسها تحتاج مالكًا وتعريفًا معتمدًا.

**الدليل المحلي:** prefer reference tables or constraints where possible

المصدر: `content/sql/vault.json#/pages/13/body`

مسار التعلم: `/learn/sql/13/`

## hansa-bank-171 — آخر تحديث يحتاج موعدًا متوقعًا

sql / quality

**السؤال:** وجدت MAX(last_updated_date)؛ هل عرفت أن البيانات حديثة كفاية؟

**الخلاصة:** قارن آخر تاريخ متاح بموعد أو اتفاق التحديث المتوقع.

**القيد:** وجود timestamp وحده لا يثبت ملاءمة البيانات للقرار.

**الدليل المحلي:** Compare the result against the expected refresh SLA.

المصدر: `content/sql/vault.json#/pages/13/body`

مسار التعلم: `/learn/sql/13/`

## hansa-bank-172 — UPDATE بلا WHERE قد يشمل الجميع

sql / transactions

**السؤال:** تراجع تعديلًا يستهدف مجموعة محددة؛ ما الخطر المباشر لغياب WHERE؟

**الخلاصة:** قد يعدّل الأمر كل صف في الجدول، لذا افحص المجتمع المستهدف قبل التنفيذ.

**القيد:** هذه ملاحظة تعليمية؛ لم يُنفذ أي تعديل قاعدة بيانات.

**الدليل المحلي:** A missing WHERE clause can modify every row.

المصدر: `content/sql/vault.json#/pages/14/body`

مسار التعلم: `/learn/sql/14/`

## hansa-bank-173 — المعاملة تجمع وحدة منطقية

sql / transactions

**السؤال:** تتطلب المهمة عدة عمليات مترابطة؛ ماذا تضيف transaction؟

**الخلاصة:** تجمع العمليات في وحدة منطقية بدل التعامل معها كخطوات منفصلة دون حدود اعتماد.

**القيد:** حدد سلوك الفشل والاعتماد وفق المحرك.

**الدليل المحلي:** A transaction groups operations into one logical unit.

المصدر: `content/sql/vault.json#/pages/14/body`

مسار التعلم: `/learn/sql/14/`

## hansa-bank-174 — العزل ليس موحدًا بين المحركات

sql / transactions

**السؤال:** هل تفترض أن القراءات المتزامنة تتصرف بالطريقة نفسها في كل قاعدة؟

**الخلاصة:** ظواهر مثل dirty reads وnon-repeatable reads تعتمد على مستوى العزل والمحرك.

**القيد:** افحص الإعداد الافتراضي بدل تعميم خبرة من محرك آخر.

**الدليل المحلي:** Understand the database's default isolation behavior

المصدر: `content/sql/vault.json#/pages/14/body`

مسار التعلم: `/learn/sql/14/`

## hansa-bank-175 — التطبيع يعالج مشكلات التحديث

sql / design

**السؤال:** لماذا تفصل الكيانات والتبعيات في التصميم العلاقي؟

**الخلاصة:** التطبيع يقلل التكرار ومشكلات تحديث بيانات مترابطة في أماكن متعددة.

**القيد:** قد تختار النماذج التحليلية denormalization عمدًا لاحتياجات مختلفة.

**الدليل المحلي:** Normalization reduces redundancy and update anomalies

المصدر: `content/sql/vault.json#/pages/15/body`

مسار التعلم: `/learn/sql/15/`

## hansa-bank-176 — المفتاح الطبيعي والمولد يؤديان دورين

sql / design

**السؤال:** هل معرف من العمل هو نفسه معرف يولده النظام؟

**الخلاصة:** Natural key يأتي من مجال العمل؛ surrogate key معرف مولد من النظام ويشيع في النماذج البعدية.

**القيد:** لا تفترض أن تغيير نوع المفتاح يحل تلقائيًا قواعد التفرد.

**الدليل المحلي:** Natural keys come from the business domain.

المصدر: `content/sql/vault.json#/pages/15/body`

مسار التعلم: `/learn/sql/15/`

## hansa-bank-177 — OLTP وBI لهما أولويات مختلفة

sql / design

**السؤال:** هل تصميم سريع للكتابة هو تلقائيًا أسهل للتحليل؟

**الخلاصة:** OLTP يركز على سلامة المعاملات وكفاءة الكتابة؛ BI يركز على الوصول التحليلي وثبات مستوى التفاصيل والتجميع.

**القيد:** اختيار التصميم يتبع عبء العمل.

**الدليل المحلي:** OLTP prioritizes transaction integrity, write efficiency, and normalized entities.

المصدر: `content/sql/vault.json#/pages/15/body`

مسار التعلم: `/learn/sql/15/`

## hansa-bank-178 — الفهرس له تكلفة كتابة

sql / performance

**السؤال:** هل إضافة فهارس أكثر تحسين مجاني؟

**الخلاصة:** قد تسرّع الفهارس القراءة لكنها تضيف تخزينًا وتكلفة كتابة وصيانة.

**القيد:** صممها حول الاستخدام الفعلي وقِس أثرها.

**الدليل المحلي:** Indexes can accelerate reads but add storage and write/maintenance cost.

المصدر: `content/sql/vault.json#/pages/16/body`

مسار التعلم: `/learn/sql/16/`

## hansa-bank-179 — الدالة حول عمود المرشح قد تعوق الفهرس

sql / performance

**السؤال:** هل يمكن استخدام نطاق بدل تحويل العمود داخل الشرط؟

**الخلاصة:** المرشح يكون عادة أقرب للاستفادة من الفهرس إذا لم يغلّف العمود بدالة أو تعبير.

**القيد:** هذه قاعدة عامة وليست ضمانًا لخطة معينة.

**الدليل المحلي:** Prefer a range predicate over transforming the indexed column when possible.

المصدر: `content/sql/vault.json#/pages/16/body`

مسار التعلم: `/learn/sql/16/`

## hansa-bank-180 — الأعمدة غير المستخدمة عبء محتمل

sql / performance

**السؤال:** تسحب SELECT * من جدول عريض ولا تعرض إلا أعمدة قليلة؛ ماذا تراجع؟

**الخلاصة:** حدد الأعمدة المطلوبة بدل جلب كل الأعمدة في الاستعلام التحليلي الإنتاجي.

**القيد:** حافظ على الأعمدة التي يحتاجها المعنى؛ لا تقللها عشوائيًا.

**الدليل المحلي:** Avoid <code>SELECT *</code> in production analytical queries when the table is wide.

المصدر: `content/sql/vault.json#/pages/16/body`

مسار التعلم: `/learn/sql/16/`

## hansa-bank-181 — الإزالة تحتاج تعريفًا للسجل الصحيح

sql / warehouse

**السؤال:** هل DISTINCT يكفي لتنظيف تكرار سجلات العمل؟

**الخلاصة:** عرّف قاعدة التفرد أولًا، ثم احتفظ بالسجل المقصود باستخدام ترتيب محدد أو تجميع ملائم.

**القيد:** قد يمثل التكرار نسخًا تاريخية مشروعة.

**الدليل المحلي:** Define the business uniqueness rule first

المصدر: `content/sql/vault.json#/pages/17/body`

مسار التعلم: `/learn/sql/17/`

## hansa-bank-182 — التحميل التزايدي يحتاج إشارة تغير

sql / warehouse

**السؤال:** كيف تعرف أن صفًا جديد أو تغير منذ التحميل السابق؟

**الخلاصة:** تحتاج آلية موثوقة مثل watermark أو رقم تسلسلي أو تتبع تغير، حسب دعم المصدر والهدف.

**القيد:** تقليل حجم المعالجة لا يبرر تفويت تغيرات أو حذف.

**الدليل المحلي:** when the source and target support reliable change detection.

المصدر: `content/sql/vault.json#/pages/17/body`

مسار التعلم: `/learn/sql/17/`

## hansa-bank-183 — الأبعاد المشتركة توحّد تعريف العمل

sql / warehouse

**السؤال:** عمليتا حقائق تحتاجان المعنى نفسه للعميل أو التاريخ؛ ماذا يفيد؟

**الخلاصة:** استخدم conformed dimensions عندما تتطلب العمليات تعريف عمل مشتركًا.

**القيد:** لا تفترض تطابق التعريف لمجرد تشابه اسم العمود.

**الدليل المحلي:** Use conformed dimensions when multiple fact processes need the same business definition.

المصدر: `content/sql/vault.json#/pages/17/body`

مسار التعلم: `/learn/sql/17/`

## hansa-bank-184 — الفئة المرتبة ليست اسمًا فقط

statistics / foundations

**السؤال:** هل Low وMedium وHigh مثل أسماء المدن بلا ترتيب؟

**الخلاصة:** Ordinal فئات ذات ترتيب، بينما Nominal فئات بلا ترتيب طبيعي.

**القيد:** وجود ترتيب لا يحدد تلقائيًا مسافات عددية متساوية بين الفئات.

**الدليل المحلي:** فئات لها ترتيب، مثل Low / Medium / High.

المصدر: `content/statistics/source.json#/sections/1/blocks/9/items/0/1/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-185 — العد غير القياس المستمر

statistics / foundations

**السؤال:** كيف تختلف أعداد العملاء عن أطوالهم؟

**الخلاصة:** عدد العملاء مثال لقيم discrete معدودة، بينما الطول مثال لقياس continuous على نطاق مستمر.

**القيد:** صنّف المتغير بحسب معناه لا مجرد عرضه كرقم.

**الدليل المحلي:** قيم معدودة، مثل عدد العملاء.

المصدر: `content/statistics/source.json#/sections/1/blocks/4/items/0/1/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-186 — المنوال قد لا يكون واحدًا

statistics / describe

**السؤال:** هل يجب أن تنتج البيانات قيمة منوال وحيدة؟

**الخلاصة:** المنوال هو الأكثر تكرارًا، وقد توجد أكثر من قيمة منوال أو لا توجد قيمة متكررة بوضوح.

**القيد:** لا تفرض ملخصًا وحيدًا إذا لم تدعمه التكرارات.

**الدليل المحلي:** يمكن أن توجد أكثر من Mode أو لا توجد قيمة متكررة بوضوح.

المصدر: `content/statistics/source.json#/sections/3/blocks/8/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-187 — المدى حساس للطرفين

statistics / describe

**السؤال:** لماذا يتغير Range كثيرًا بسبب قيمة بعيدة واحدة؟

**الخلاصة:** المدى يعتمد على أطراف البيانات، ولذلك يتأثر بقوة بالقيم المتطرفة.

**القيد:** استخدمه مع فهم لبقية التوزيع، لا كملخص وحيد للتشتت.

**الدليل المحلي:** بسيط لكنه يعتمد بشدة على القيم المتطرفة.

المصدر: `content/statistics/source.json#/sections/4/blocks/4/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-188 — وحدة الانحراف المعياري مفهومة

statistics / describe

**السؤال:** تقيس زمنًا بالدقائق؛ كيف تقرأ وحدة SD؟

**الخلاصة:** الانحراف المعياري يقيس التشتت حول المتوسط وبنفس وحدة البيانات.

**القيد:** لا تفسره على أنه وحدة مربعة مثل التباين.

**الدليل المحلي:** وهو مقياس للتشتت حول المتوسط وبنفس وحدة البيانات.

المصدر: `content/statistics/source.json#/sections/4/blocks/13/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-189 — المتمم يكمل الاحتمال إلى واحد

statistics / probability

**السؤال:** إذا عرفت احتمال الحدث، كيف تحسب احتمال عدم حدوثه؟

**الخلاصة:** احتمال المتمم يساوي 1 ناقص احتمال الحدث.

**القيد:** يجب أن يكون الحدث والمتمم محددين في فضاء الاحتمال نفسه.

**الدليل المحلي:** P(A^c) = 1 - P(A)

المصدر: `content/statistics/source.json#/sections/5/blocks/7/tex`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-190 — الاحتمال المشروط يستخدم معلومة

statistics / probability

**السؤال:** وصلتك معلومة أن B حدث؛ ماذا يعني احتمال A بشرط B؟

**الخلاصة:** هو احتمال وقوع A مع العلم بأن B حدث بالفعل، وليس تجاهل المعلومة الجديدة.

**القيد:** في الأحداث المعتمدة قد تغير المعلومة الاحتمال؛ لا تفترض الاستقلال.

**الدليل المحلي:** احتمال وقوع A بشرط أن B حدث بالفعل:

المصدر: `content/statistics/source.json#/sections/5/blocks/13/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-191 — حدد ما تعدّه في Binomial

statistics / distributions

**السؤال:** هل X تمثل ترتيب التجربة أم عدد نجاحاتها؟

**الخلاصة:** في صياغة الدرس، X هي عدد النجاحات من n تجارب.

**القيد:** تعريف النجاح يجب أن يظل واضحًا وثابتًا، مع تحقق شروط النموذج.

**الدليل المحلي:** عدد النجاحات

المصدر: `content/statistics/source.json#/sections/7/blocks/5/items/0/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-192 — تساوي مقاييس المركز له شرط

statistics / distributions

**السؤال:** متى يتساوى Mean وMedian وMode في المثال النظري؟

**الخلاصة:** تتساوى في التوزيع الطبيعي المثالي المتماثل.

**القيد:** لا تحول خاصية النموذج إلى افتراض عن كل بيانات حقيقية.

**الدليل المحلي:** Mean = Median = Mode في الحالة الطبيعية المثالية.

المصدر: `content/statistics/source.json#/sections/8/blocks/7/items/0/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-193 — Z-score يغير وحدة القراءة

statistics / distributions

**السؤال:** ماذا يخبرك Z-score عن موضع قيمة؟

**الخلاصة:** يوضح عدد الانحرافات المعيارية التي تبعدها القيمة عن المتوسط.

**القيد:** تفسيره يحتاج المتوسط والتشتت المناسبين للبيانات.

**الدليل المحلي:** يوضح كم Standard Deviations تبعد القيمة عن المتوسط.

المصدر: `content/statistics/source.json#/sections/8/blocks/17/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-194 — Lambda تحتاج فترة محددة

statistics / distributions

**السؤال:** هل متوسط الأحداث بلا ذكر الساعة أو اليوم وصف مكتمل؟

**الخلاصة:** Lambda في مثال Poisson تمثل متوسط عدد الأحداث لكل فترة زمنية أو نطاق مكاني محدد.

**القيد:** ثبت النطاق قبل استخدام القيمة في حساب الاحتمالات.

**الدليل المحلي:** Average number of events per time/space period

المصدر: `content/statistics/source.json#/sections/9/blocks/18/inline/2/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-195 — قمة Poisson ليست شعارًا مطلقًا

statistics / distributions

**السؤال:** هل تحفظ أن القمة دائمًا عند lambda وحدها؟

**الخلاصة:** المصدر ينبه إلى إمكان وجود منوالين متجاورين في بعض الحالات عندما تكون lambda عددًا صحيحًا.

**القيد:** راجع شروط الحالة بدل تعميم عبارة عن موضع القمة.

**الدليل المحلي:** لا ينبغي حفظ عبارة "peak is always exactly lambda" كقاعدة رياضية مطلقة.

المصدر: `content/statistics/source.json#/sections/9/blocks/24/inline/6/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-196 — CLT تتحدث عن المتوسطات

statistics / sampling

**السؤال:** هل اقتراب توزيع المتوسطات من الطبيعي يعني أن المجتمع نفسه طبيعي؟

**الخلاصة:** توزيع متوسطات عينات ذات حجم مناسب قد يقترب من الطبيعي تحت الشروط الملائمة، حتى إن لم يكن المجتمع طبيعيًا.

**القيد:** النتيجة تخص توزيع المتوسطات؛ الشروط وحجم العينة مهمان.

**الدليل المحلي:** حتى لو لم تكن Population نفسها Normal.

المصدر: `content/statistics/source.json#/sections/10/blocks/2/inline/2/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-197 — عينة واحدة ليست Sampling Distribution

statistics / sampling

**السؤال:** رسمت قيم عينة واحدة؛ هل رسمت توزيع متوسطها عبر العينات؟

**الخلاصة:** Sample Distribution يصف القيم داخل عينة، بينما Sampling Distribution يصف إحصائية عبر عينات كثيرة.

**القيد:** حدد هل المحور يمثل مشاهدات أم إحصاءات عينات.

**الدليل المحلي:** توزيع القيم داخل عينة واحدة.

المصدر: `content/statistics/source.json#/sections/11/blocks/4/items/0/1/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-198 — حجم العينة واستقرار المتوسط

statistics / sampling

**السؤال:** مع ثبات بقية الظروف، لماذا يفيد تكبير العينة في تقدير المتوسط؟

**الخلاصة:** ينخفض الخطأ المعياري ويصبح تقدير متوسط المجتمع أكثر استقرارًا مع زيادة حجم العينة في الإطار الذي يشرحه الدرس.

**القيد:** زيادة العدد لا تعالج تلقائيًا تحيز طريقة أخذ العينة.

**الدليل المحلي:** تقديرنا للـ Population Mean يصبح أكثر استقرارًا مع زيادة حجم العينة.

المصدر: `content/statistics/source.json#/sections/12/blocks/13/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-199 — 95% تصف طريقة بناء الفترة

statistics / sampling

**السؤال:** هل فترة الثقة المحسوبة تعني احتمالًا 95% لمعلمة ثابتة داخلها؟

**الخلاصة:** في التفسير المتكرر، طريقة البناء تحتوي المعلمة في نحو 95% من العينات المتكررة عند تحقق الشروط.

**القيد:** لا تنقل هذا التفسير إلى احتمال بعدي للمعلمة الثابتة في الفترة المحسوبة.

**الدليل المحلي:** طريقة بناء 95% CI ستحتوي على Population Parameter في حوالي 95% من العينات المتكررة

المصدر: `content/statistics/source.json#/sections/13/blocks/11/inline/1/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-200 — ثقة أعلى قد تعني نطاقًا أوسع

statistics / sampling

**السؤال:** رفعت مستوى الثقة مع تثبيت الباقي؛ ماذا تتوقع للفترة؟

**الخلاصة:** الفترة تصبح أوسع عادة عند رفع مستوى الثقة في الطريقة نفسها.

**القيد:** قارن فترات مبنية على الإعدادات نفسها عدا التغير المقصود.

**الدليل المحلي:** Confidence Level أعلى → Interval أوسع.

المصدر: `content/statistics/source.json#/sections/13/blocks/13/items/0/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-201 — خطأ معياري أكبر يوسع الفترة

statistics / sampling

**السؤال:** لماذا تختلف عروض فترات الثقة لتقديرات متشابهة؟

**الخلاصة:** زيادة SE توسع الفترة عند تثبيت بقية عناصر الحساب.

**القيد:** قيمة التقدير وحدها لا تصف عدم اليقين حوله.

**الدليل المحلي:** SE أكبر → Interval أوسع.

المصدر: `content/statistics/source.json#/sections/13/blocks/14/items/0/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-202 — فرضية العدم تحدد المقارنة

statistics / hypothesis

**السؤال:** في مثال مقارنة متوسطين، ما نقطة الانطلاق المرجعية؟

**الخلاصة:** يبدأ المثال بفرضية عدم وجود فرق بين المتوسطين، ثم يقيم الأدلة بالنسبة لها.

**القيد:** هذه صياغة المثال؛ صغ الفرضية وفق السؤال الفعلي.

**الدليل المحلي:** نبدأ عادةً بافتراض عدم وجود فرق أو تأثير

المصدر: `content/statistics/source.json#/sections/14/blocks/4/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-203 — البديل يحدد معنى التطرف

statistics / hypothesis

**السؤال:** لماذا يهم اختيار بديل أحادي أو ثنائي الجانب؟

**الخلاصة:** شكل الفرضية البديلة يحدد معنى النتيجة الأكثر تطرفًا عند حساب p-value.

**القيد:** اختر البديل بحسب السؤال قبل رؤية النتيجة.

**الدليل المحلي:** اختيار شكل Alternative يحدد ما معنى "more extreme" عند حساب p-value.

المصدر: `content/statistics/source.json#/sections/14/blocks/14/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-204 — اختلاف عينتين ليس السؤال الأخير

statistics / hypothesis

**السؤال:** وجدت فرقًا بين متوسطَي عينتين؛ ما السؤال التالي؟

**الخلاصة:** اسأل هل يصعب تفسير مقدار الفرق بتقلب العينات وحده إذا كانت فرضية العدم صحيحة.

**القيد:** وجود فرق عددي لا يثبت أثرًا بمفرده.

**الدليل المحلي:** Sampling Variation وحدها إذا كانت H₀ صحيحة

المصدر: `content/statistics/source.json#/sections/16/blocks/6/inline/3/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-205 — قِس الفرق بوحدة خطئه المعياري

statistics / hypothesis

**السؤال:** في المثال المفاهيمي، فرق 5.4 وخطأ معياري 1.5 للفرق؛ كيف تقرأ النسبة؟

**الخلاصة:** النسبة 3.6 تعني أن الفرق المرصود يبعد 3.6 أخطاء معيارية عن الفرق المفترض صفرًا في المثال.

**القيد:** هذه نسبة توضيحية؛ نوع الاختبار وتوزيعه يحددان الاستدلال التالي.

**الدليل المحلي:** الفرق المرصود يبعد 3.6 Standard Errors

المصدر: `content/statistics/source.json#/sections/17/blocks/8/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-206 — p-value ليست تداخل توزيعين

statistics / hypothesis

**السؤال:** رأيت منطقتين متداخلتين في رسم توضيحي؛ هل مساحة التداخل تعريف p-value؟

**الخلاصة:** لا؛ التعريف يتعلق بنتائج لا تقل تطرفًا عن المرصود تحت توزيع الاختبار في فرضية العدم.

**القيد:** الرسم التشبيهي لا يستبدل تعريف الاختبار.

**الدليل المحلي:** التعريف الصحيح ليس "مساحة التداخل بين توزيعين".

المصدر: `content/statistics/source.json#/sections/18/blocks/11/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-207 — ذيل واحد أم طرفان؟

statistics / hypothesis

**السؤال:** كيف يختلف تجميع الاحتمال بين الاختبار الأحادي والثنائي؟

**الخلاصة:** الأحادي يستخدم التطرف في اتجاه البديل، والثنائي يحسب النتائج المتطرفة في الطرفين وفق تعريف الاختبار.

**القيد:** لا تضاعف احتمالًا بلا مراجعة شكل الاختبار والتوزيع.

**الدليل المحلي:** وفي Two-tailed test تُحسب مساحة النتائج المتطرفة في الطرفين وفق تعريف الاختبار.

المصدر: `content/statistics/source.json#/sections/18/blocks/12/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-208 — ثبت معيار القرار قبل النتيجة

statistics / hypothesis

**السؤال:** هل تغير alpha بعد ظهور p-value لتوافق الاستنتاج المطلوب؟

**الخلاصة:** يحدد مستوى الدلالة مسبقًا لتقليل التحيز وعدم تبديل معيار القرار بعد رؤية النتائج.

**القيد:** توثيق الاختيار جزء من خطة التحليل.

**الدليل المحلي:** يجب تحديده مسبقًا لتقليل التحيز وعدم تغيير معيار القرار بعد رؤية النتائج.

المصدر: `content/statistics/source.json#/sections/19/blocks/4/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-209 — Type I هو رفض خاطئ

statistics / hypothesis

**السؤال:** رفض الاختبار فرضية عدم صحيحة؛ ماذا يسمى الخطأ؟

**الخلاصة:** هذا Type I Error، ويسمى أيضًا False Positive.

**القيد:** تعريف الخطأ يجمع حالة الواقع وقرار الاختبار.

**الدليل المحلي:** نرفض H₀ وهي صحيحة فعلًا.

المصدر: `content/statistics/source.json#/sections/21/blocks/4/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-210 — Type II هو عدم رفض خاطئ

statistics / hypothesis

**السؤال:** فشل الاختبار في رفض فرضية عدم خاطئة؛ ما الحالة؟

**الخلاصة:** هذا Type II Error، ويسمى أيضًا False Negative.

**القيد:** عدم الرفض ليس ضمانًا بأن الاختبار التقط كل أثر موجود.

**الدليل المحلي:** نفشل في رفض H₀ وهي خاطئة فعلًا.

المصدر: `content/statistics/source.json#/sections/21/blocks/7/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-211 — العينة الضخمة قد تكشف أثرًا ضئيلًا

statistics / hypothesis

**السؤال:** لماذا قد تكون نتيجة صغيرة جدًا دالة إحصائيًا؟

**الخلاصة:** مع عينات ضخمة قد يصبح فرق صغير جدًا قابلًا للكشف إحصائيًا؛ لذلك افحص حجم الأثر.

**القيد:** لا تجعل الدلالة وحدها مبررًا لقرار مكلف.

**الدليل المحلي:** مع عينات ضخمة قد يصبح فرق صغير جدًا Statistically Significant.

المصدر: `content/statistics/source.json#/sections/22/blocks/3/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-212 — سمِّ المعالجة والاستجابة

statistics / experiments

**السؤال:** في اختبار إعلان، ماذا تغير وماذا تقيس؟

**الخلاصة:** الإعلان هو المعالجة في مثال الدرس، وعدد المنتجات المباعة هو الاستجابة.

**القيد:** اختر مقياس الاستجابة الذي يجيب عن سؤال التجربة.

**الدليل المحلي:** الإعلان Treatment، وعدد المنتجات المباعة Response.

المصدر: `content/statistics/source.json#/sections/23/blocks/5/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-213 — فرق العمر قد يربك أثر الإعلان

statistics / experiments

**السؤال:** اختلف عمر مجموعتي التجربة بشدة؛ هل تنسب فرق المبيعات كله للإعلان؟

**الخلاصة:** إذا كان العمر يؤثر في الشراء فقد يفسر جزءًا من الفرق بدل المعالجة.

**القيد:** المثال يحذر من عدم قابلية المجموعتين للمقارنة.

**الدليل المحلي:** فقد يكون الفرق في المبيعات بسبب العمر وليس الإعلان.

المصدر: `content/statistics/source.json#/sections/24/blocks/6/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-214 — التعمية تقلل أثر التوقعات

statistics / experiments

**السؤال:** لماذا لا يعرف المشارك مجموعته في تجربة معماة؟

**الخلاصة:** يساعد ذلك على تقليل أثر توقعات المشاركين على النتائج.

**القيد:** التعمية إجراء لتقليل التحيز وليست بديلًا لبقية التصميم.

**الدليل المحلي:** هذا يقلل تأثير توقعات المشاركين على النتائج.

المصدر: `content/statistics/source.json#/sections/26/blocks/3/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-215 — Placebo يفصل التشابه الظاهري

statistics / experiments

**السؤال:** ما دور بديل يشبه المعالجة دون تأثيرها العلاجي الحقيقي؟

**الخلاصة:** هذا وصف placebo في الدرس، ويستخدم للمقارنة في سياقات تجريبية مناسبة.

**القيد:** المثال يشرح تصميمًا إحصائيًا ولا يقدم توجيهًا علاجيًا.

**الدليل المحلي:** بديل يشبه Treatment لكنه لا يحمل التأثير العلاجي الحقيقي

المصدر: `content/statistics/source.json#/sections/26/blocks/5/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-216 — التعمية المزدوجة تشمل القائم على الإجراء

statistics / experiments

**السؤال:** هل جهل المشارك وحده يحقق التعمية المزدوجة؟

**الخلاصة:** في وصف الدرس، لا يعرف المشارك ولا الشخص الذي يعطي المعالجة أو يدير التجربة المجموعة الفعلية.

**القيد:** الهدف تقليل التحيز في الاستجابة وإدارة التجربة.

**الدليل المحلي:** وكذلك الشخص الذي يعطي Treatment أو يدير التجربة لا يعرف

المصدر: `content/statistics/source.json#/sections/26/blocks/7/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-217 — التجربة العشوائية قد تضم عدة معالجات

statistics / experiments

**السؤال:** هل RCT يجب أن تتكون من مجموعتي A وB فقط؟

**الخلاصة:** يمكن أن تتضمن أكثر من مجموعة معالجة، كما في مقارنة مستويات مختلفة.

**القيد:** عدد المجموعات يحدده السؤال والتصميم.

**الدليل المحلي:** يمكن أن تحتوي RCT على أكثر من Treatment Group

المصدر: `content/statistics/source.json#/sections/27/blocks/1/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-218 — نسختان في أبسط A/B

statistics / experiments

**السؤال:** ما وحدة المقارنة في المثال الأساسي لاختبار A/B؟

**الخلاصة:** يقارن نسختين مثل زر جديد وقديم أو صفحتين، ويقسم المشاركين في أبسط صورة إلى مجموعتين.

**القيد:** لا يكفي تسمية المقارنة A/B لإثبات جودة تصميمها.

**الدليل المحلي:** والـ A/B Testing في أبسط صوره يقسم المشاركين إلى مجموعتين فقط.

المصدر: `content/statistics/source.json#/sections/27/blocks/5/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-219 — الإشارة اتجاه وليست ضعفًا

statistics / relationships

**السؤال:** هل ارتباط سالب يعني بالضرورة علاقة أضعف من ارتباط موجب؟

**الخلاصة:** الإشارة تصف الاتجاه، بينما قوة العلاقة الخطية ترتبط بالقيمة المطلقة للمعامل.

**القيد:** قارن المقدار مع فحص شكل البيانات، لا الإشارة وحدها.

**الدليل المحلي:** قوة العلاقة ترتبط بالقيمة المطلقة:

المصدر: `content/statistics/source.json#/sections/29/blocks/12/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-220 — قوي ومتوسط أوصاف مرتبطة بالمجال

statistics / relationships

**السؤال:** هل حدود قوة الارتباط في مثال تدريبي معيار عالمي؟

**الخلاصة:** المصدر يصفها كتقريبات لا حدود ثابتة صالحة لكل مجال.

**القيد:** استعن بسياق السؤال بدل تصنيف آلي منفصل عن المجال.

**الدليل المحلي:** هذه أوصاف تقريبية وليست حدودًا عالمية ثابتة لكل مجال.

المصدر: `content/statistics/source.json#/sections/29/blocks/21/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-221 — فتش عن عامل مشترك

statistics / relationships

**السؤال:** كيف يمكن أن ترتبط تكلفة المياه بمتوسط العمر دون أن تكون السبب؟

**الخلاصة:** يعرض الدرس الاقتصاد كعامل قد يرتبط بتكلفة المياه وبالرعاية الصحية ومتوسط العمر.

**القيد:** هذا تفسير لعامل مربك محتمل، لا إثبات سببي جديد.

**الدليل المحلي:** بينما قد يكون الاقتصاد عاملًا مشتركًا مهمًا.

المصدر: `content/statistics/source.json#/sections/32/blocks/6/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-222 — الميل يصف تغيرًا بوحدات المتغير

statistics / relationships

**السؤال:** هل r = 0.8 يعني زيادة Y بمقدار 0.8 لكل وحدة X؟

**الخلاصة:** لا؛ هذا تفسير للميل في نموذج الانحدار، وليس لمعامل الارتباط.

**القيد:** اربط تفسير الميل بالنموذج ووحدات المتغيرين.

**الدليل المحلي:** لا تقل إن r = 0.8 يعني أن Y يزيد 0.8 وحدة عندما يزيد X بوحدة.

المصدر: `content/statistics/source.json#/sections/34/blocks/8/inline/0/text`

مسار التعلم: `/learn/statistics/source/`

## hansa-bank-223 — الاختبار يبدأ بتحديد من نقارن

statistics / hypothesis

**السؤال:** هل تبدأ مسار الاختبار بحساب p-value قبل تحديد المجموعات؟

**الخلاصة:** يبدأ سير العمل بتحديد المجتمعات أو المجموعات، ثم الفرضيات والبيانات والإحصائية المناسبة.

**القيد:** الاستنتاج النهائي يظل مقيدًا بحدود الاختبار.

**الدليل المحلي:** تحديد الـ Populations أو المجموعات محل المقارنة.

المصدر: `content/statistics/source.json#/sections/15/blocks/1/items/0/0/text`

مسار التعلم: `/learn/statistics/source/`
