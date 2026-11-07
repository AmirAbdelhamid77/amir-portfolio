# الدفعة الرابعة — 174 Insight جديدة

مصادر محلية فقط؛ مسودات تنتظر المراجعة العلمية والتحريرية. المواقف أسئلة تعليمية افتراضية وليست مشاهدات حقيقية.

## hansa-bank-224 — حدود الصندوق ليست أقل وأكبر قيمة

visualization / distribution

**السؤال:** هل طرفا الصندوق هما أصغر وأكبر مشاهدة؟

**الخلاصة:** يمتد الصندوق من Q1 إلى Q3 ويصف النصف الأوسط من المشاهدات.

**القيد:** الشوارب والنقاط الخارجية تحمل معلومات إضافية خارج الصندوق.

**الدليل المحلي:** الصندوق: من Q1 إلى Q3، ويحتوي على منتصف 50% من المشاهدات.

المصدر: `content/data-viz/pages.json#/3/blocks/11/items/0`

مسار التعلم: `/learn/ar/box-plot/`

## hansa-bank-225 — الشوارب تتبع قاعدة معلنة

visualization / distribution

**السؤال:** هل يصل الشارب دائمًا إلى أكبر قيمة؟

**الخلاصة:** في القاعدة الشائعة يصل الشارب لأبعد مشاهدة داخل حد 1.5 × IQR من الربيع، وقد تظهر قيم أبعد كنقاط منفصلة.

**القيد:** راجع إعداد الأداة؛ تعريف الشوارب قد يختلف بين التطبيقات.

**الدليل المحلي:** مع اختلافات ممكنة بين التطبيقات.

المصدر: `content/data-viz/pages.json#/3/blocks/12/items/0/1/text`

مسار التعلم: `/learn/ar/box-plot/`

## hansa-bank-226 — نقطة خارج الشارب تستحق الفحص

visualization / distribution

**السؤال:** هل تحذف نقطة لأنها خارج شوارب Box Plot؟

**الخلاصة:** النقاط خارج الشوارب مرشحات لقيم شاذة وفق قاعدة العرض، وليست حكمًا على صحة التسجيل.

**القيد:** افحص سياق المشاهدة قبل اتخاذ قرار بشأنها.

**الدليل المحلي:** النقاط بعد الشوارب: غالبًا تُعرض كقيم شاذة محتملة وفق القاعدة المستخدمة.

المصدر: `content/data-viz/pages.json#/3/blocks/13/items/0`

مسار التعلم: `/learn/ar/box-plot/`

## hansa-bank-227 — الربيعان لهما معنى مئيني

visualization / distribution

**السؤال:** ماذا يمثل Q1 وQ3 في ملخص التوزيع؟

**الخلاصة:** Q1 يمثل المئين 25 وQ3 يمثل المئين 75؛ حدود الصندوق مواقع في ترتيب القيم.

**القيد:** قد تختلف طرق حساب المئينات بين التطبيقات.

**الدليل المحلي:** Q1 — الربيع الأول: المئين الخامس والعشرون.

المصدر: `content/data-viz/pages.json#/3/blocks/7/items/0`

مسار التعلم: `/learn/ar/box-plot/`

## hansa-bank-228 — صندوق لكل مجموعة

visualization / distribution

**السؤال:** تريد مقارنة توزيع متغير مستمر بين عدة فئات؛ كيف تقلل تداخل الرسوم؟

**الخلاصة:** Box Plot يضغط توزيع كل مجموعة في ملخص صغير يسمح بالمقارنة بين الفئات.

**القيد:** الضغط يفقد بعض تفاصيل شكل التوزيع، فارجع للرسم التفصيلي عند الحاجة.

**الدليل المحلي:** التداخل بينها يصنع فوضى بصرية، بينما يضغط الـBox Plot توزيع كل مجموعة في ملخص إحصائي صغير.

المصدر: `content/data-viz/pages.json#/3/blocks/1/inline/0/text`

مسار التعلم: `/learn/ar/box-plot/`

## hansa-bank-229 — لون الشاشة ولون الطباعة

visualization / accessibility

**السؤال:** هل تمثيل اللون في الشاشة والطباعة واحد؟

**الخلاصة:** المصدر يميز RGB الشائع للشاشات عن CMYK الشائع للطباعة؛ وسيط العرض جزء من قرار اللون.

**القيد:** هذا تمييز بين تمثيلات اللون، وليس ضمانًا لتطابق المظهر بين الوسائط.

**الدليل المحلي:** CMYK: شائع في الطباعة ويتوافق مع قنوات الحبر.

المصدر: `content/data-viz/pages.json#/4/blocks/4/items/0`

مسار التعلم: `/learn/ar/color/`

## hansa-bank-230 — عائلة اللون غير شدته

visualization / accessibility

**السؤال:** هل تغيير Hue هو نفسه زيادة التشبع؟

**الخلاصة:** في HCL يصف Hue عائلة اللون، بينما Chroma يصف شدته أو تشبعه.

**القيد:** لا تخلط اختلاف الفئة اللونية بزيادة مقدار مرتب.

**الدليل المحلي:** Chroma: شدة أو تشبع اللون.

المصدر: `content/data-viz/pages.json#/4/blocks/8/items/0`

مسار التعلم: `/learn/ar/color/`

## hansa-bank-231 — السطوع بُعد مستقل في HCL

visualization / accessibility

**السؤال:** ما الخاصية التي تصف السطوع المدرك في HCL؟

**الخلاصة:** Luminance يصف السطوع المدرك، وهو مختلف عن عائلة اللون وشدة تشبعه.

**القيد:** وجود لون صحيح تقنيًا لا يثبت وضوح الرسالة البصرية.

**الدليل المحلي:** Luminance: درجة السطوع المدركة.

المصدر: `content/data-viz/pages.json#/4/blocks/9/items/0`

مسار التعلم: `/learn/ar/color/`

## hansa-bank-232 — صحة كود اللون لا تكفي

visualization / accessibility

**السؤال:** اخترت ألوانًا صالحة تقنيًا؛ هل انتهى تصميم الترميز؟

**الخلاصة:** صلاحية تمثيل اللون لا تضمن جودة الترميز؛ يجب أن تتوافق اللوحة مع معنى البيانات.

**القيد:** اختبر التمييز والترتيب كما يراهما القارئ.

**الدليل المحلي:** وجود تمثيل لوني صحيح تقنيًا لا يعني أنه ترميز بصري جيد.

المصدر: `content/data-viz/pages.json#/4/blocks/10/inline/0/text`

مسار التعلم: `/learn/ar/color/`

## hansa-bank-233 — الرسم والنموذج والملخص يكملون بعضهم

visualization / foundations

**السؤال:** هل تختار بين الرسم والإحصاء كبديلين متنافسين؟

**الخلاصة:** الملخص العددي والنموذج الإحصائي والرسم طرق متكاملة لفهم البيانات، ولكل منها ما يظهره.

**القيد:** لا تجعل أحدها يغطي وحده كل أسئلة التحليل.

**الدليل المحلي:** These approaches are complementary rather than competing.

المصدر: `content/data-viz/pages.json#/18/blocks/2/inline/0/text`

مسار التعلم: `/learn/foundations/`

## hansa-bank-234 — العمر قد يغيّر نوعه التحليلي

visualization / foundations

**السؤال:** تعرض العمر مرة كقيمة دقيقة ومرة كفئة؛ هل هذا تناقض؟

**الخلاصة:** يمكن التعامل مع العمر كمتغير مستمر أو تقسيمه إلى فئات عمرية بحسب السؤال.

**القيد:** حدد المعالجة المستخدمة قبل اختيار الرسم.

**الدليل المحلي:** Age: continuous as an exact number; categorical when grouped into age bands.

المصدر: `content/data-viz/pages.json#/18/blocks/29/items/0`

مسار التعلم: `/learn/foundations/`

## hansa-bank-235 — الشهور قد تكون فئات للمقارنة

visualization / foundations

**السؤال:** هل وجود حقل زمني يفرض معالجة مستمرة دائمًا؟

**الخلاصة:** قد يعالج الزمن كتتابع لدراسة سلسلة، أو كفترات مسماة عند مقارنة مجموعات منفصلة.

**القيد:** حدد هل السؤال عن التطور أم عن مقارنة فترات.

**الدليل المحلي:** Time: continuous/ordered when studying a time series; categorical when comparing named months or reporting periods as discrete groups.

المصدر: `content/data-viz/pages.json#/18/blocks/30/items/0`

مسار التعلم: `/learn/foundations/`

## hansa-bank-236 — اقرأ وحدة المحور الرأسي للهستوجرام

visualization / distribution

**السؤال:** هل ارتفاع عمود Histogram هو عدد المشاهدات دائمًا؟

**الخلاصة:** قد يعرض المحور الرأسي عددًا أو كثافة أو كمية مطبعة؛ تفسير الارتفاع يبدأ بقراءة وحدته.

**القيد:** لا تقارن ارتفاعات بوحدات مختلفة كأنها أعداد خام.

**الدليل المحلي:** Y-axis: usually count; depending on the implementation it can also represent density or another normalized quantity.

المصدر: `content/data-viz/pages.json#/16/blocks/8/items/0`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-237 — قمم متعددة تفتح سؤالًا عن المجموعات

visualization / distribution

**السؤال:** ماذا تفحص عندما ترى أكثر من قمة بارزة؟

**الخلاصة:** تعدد القمم قد يشير إلى مجموعات فرعية مختلفة أو مزيج من العمليات.

**القيد:** هذا احتمال للفحص وليس إثباتًا لسبب بعينه.

**الدليل المحلي:** Multiple modes can suggest heterogeneous subpopulations or a mixture of processes.

المصدر: `content/data-viz/pages.json#/16/blocks/20/inline/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-238 — ثبّت تعريف الصناديق عند المقارنة

visualization / distribution

**السؤال:** هل يكفي وضع Histogramين جنبًا إلى جنب؟

**الخلاصة:** اختلاف حدود الفترات أو المقاييس قد يجعل المقارنة مضللة؛ راجع اتساقهما قبل تفسير الفروق.

**القيد:** اذكر أي اختلاف مقصود في التطبيع أو المقياس.

**الدليل المحلي:** Comparing histograms with incompatible scales or bin definitions.

المصدر: `content/data-viz/pages.json#/16/blocks/38/items/0/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-239 — الفئات ليست فترات Histogram

visualization / distribution

**السؤال:** عند مقارنة أقسام الشركة، هل تجعل كل قسم bin؟

**الخلاصة:** Histogram يجمع قيمًا مستمرة في فترات عددية؛ الفئات المنفصلة مع مؤشر تلائم Bar Plot.

**القيد:** تشابه الأعمدة شكليًا لا يجعل السؤال التحليلي واحدًا.

**الدليل المحلي:** Histogram bins represent adjacent numeric intervals; bar categories are discrete groups.

المصدر: `content/data-viz/pages.json#/16/blocks/143/inline/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-240 — متوسط المجموعة لا يعرض توزيعها

visualization / distribution

**السؤال:** هل عمود متوسط الراتب يكشف اختلاف الرواتب داخل القسم؟

**الخلاصة:** Bar Plot يعرض عادة مؤشرًا ملخصًا، بينما Box Plot يعرض ملخص توزيع مشاهدات كل فئة.

**القيد:** اختر نوع العرض وفق سؤال المقارنة لا وفق التشابه البصري.

**الدليل المحلي:** Average salary by department → Bar plot. Distribution of salaries within each department → Box plot.

المصدر: `content/data-viz/pages.json#/16/blocks`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-241 — اتساع السحابة قد يتغير

visualization / relationships

**السؤال:** هل تفحص اتجاه العلاقة فقط في Scatter Plot؟

**الخلاصة:** افحص أيضًا هل الانتشار الرأسي يتغير مع X؛ تغير التشتت جزء من شكل العلاقة.

**القيد:** الانطباع البصري يحتاج فحصًا إضافيًا قبل استنتاج نموذج إحصائي.

**الدليل المحلي:** Changing variance: whether the vertical spread changes with X.

المصدر: `content/data-viz/pages.json#/16/blocks/78/items/0`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-242 — النقطة تمثل مشاهدة

visualization / relationships

**السؤال:** قبل تفسير Scatter Plot، ما وحدة النقطة؟

**الخلاصة:** في التوصيف الأساسي كل نقطة مشاهدة واحدة، وX متغير تفسيري وY متغير استجابة.

**القيد:** تسمية X تفسيريًا لا تثبت أنه سبب Y.

**الدليل المحلي:** Each point = one observation.

المصدر: `content/data-viz/pages.json#/16/blocks/71/items/0/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-243 — الخط الملائم أداة تشخيص

visualization / relationships

**السؤال:** هل الخط المستقيم الملائم يثبت أن العلاقة خطية؟

**الخلاصة:** يساعد الخط على تقييم ملاءمة التقريب الخطي، وقد يكشف منحنى سلس نمطًا غير خطي منتظمًا.

**القيد:** الرسم الملائم وصف مساعد، وليس إثباتًا سببيًا.

**الدليل المحلي:** A fitted straight line can help diagnose whether a linear model is a reasonable approximation.

المصدر: `content/data-viz/pages.json#/16/blocks/88/inline/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-244 — اذكر أي محور حوّلته لوغاريتميًا

visualization / relationships

**السؤال:** هل نفس تفسير الخط المستقيم يصلح لكل رسم لوغاريتمي؟

**الخلاصة:** تفسير العلاقة يتغير بحسب تحويل Y وحده أو تحويل المتغيرين؛ اذكر المحاور المحولة بوضوح.

**القيد:** لا تستنتج نوع النمو من شكل الخط دون معرفة المقياس.

**الدليل المحلي:** If both variables are transformed, interpretation changes accordingly; always state which axes are logged.

المصدر: `content/data-viz/pages.json#/16/blocks/186/inline/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-245 — نقاط الفئات تختلف عن نقاط العلاقة

visualization / relationships

**السؤال:** هل كل رسم بالنقاط هو Scatter Plot؟

**الخلاصة:** Dot Plot يقارن مؤشرًا عدديًا عبر فئات؛ Scatter Plot يفحص علاقة بين متغيرين عدديين.

**القيد:** حدد دور كل محور قبل تسمية الرسم أو تفسيره.

**الدليل المحلي:** Dot plot: category + numeric metric; compare category-level values.

المصدر: `content/data-viz/pages.json#/16/blocks/160/items/0`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-246 — الأسماء الطويلة تستفيد من الأعمدة الأفقية

visualization / comparison

**السؤال:** تتزاحم أسماء الفئات أسفل الأعمدة؛ ما التعديل المناسب؟

**الخلاصة:** الأعمدة الأفقية غالبًا تسمح بقراءة أسماء الفئات الطويلة دون تدوير النص.

**القيد:** راجع المساحة وعدد الفئات في التصميم الفعلي.

**الدليل المحلي:** Horizontal bars are often preferable when category labels are long, because they remain readable without rotating text.

المصدر: `content/data-viz/pages.json#/16/blocks/125/inline/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-247 — أكثر من مؤشر في إطار نقطي واحد

visualization / comparison

**السؤال:** كيف تعرض قيم مؤشرات متعددة للفئة نفسها؟

**الخلاصة:** يمكن للعرض بالنقاط وضع قيم متعددة لكل فئة على إطار عددي مشترك.

**القيد:** يجب أن تكون المقارنة على الإطار المشترك ذات معنى وأن تظل هوية المؤشرات واضحة.

**الدليل المحلي:** Dot-based displays can place multiple metric values for the same category on the same numeric framework

المصدر: `content/data-viz/pages.json#/16/blocks/153/inline/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-248 — الصفر لا يظهر على محور لوغاريتمي عادي

visualization / comparison

**السؤال:** لماذا لا يبدأ المحور اللوغاريتمي من الصفر؟

**الخلاصة:** الصفر لا يملك موضعًا منتهيًا على محور لوغاريتمي؛ لذلك لا يمكن نقله إليه كما في محور خطي.

**القيد:** راجع طريقة الأداة في التعامل مع القيم غير القابلة للعرض.

**الدليل المحلي:** A logarithmic axis cannot represent zero

المصدر: `content/data-viz/pages.json#/16/blocks/148/inline/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-249 — التباين يشمل العلامات والحالات

visualization / accessibility

**السؤال:** هل اختبار لون النص وحده كافٍ؟

**الخلاصة:** اختبار التباين يشمل labels وgridlines وmarkers والحالات المهمة، وفي أكثر من وضع عرض.

**القيد:** وضوح النص لا يضمن وضوح باقي أجزاء الرسم.

**الدليل المحلي:** اختبر النصوص، labels، gridlines، markers، وstates المهمة في أكثر من حالة عرض.

المصدر: `content/data-viz/pages.json#/0/blocks/9/inline/0/text`

مسار التعلم: `/learn/accessibility-color-qa/`

## hansa-bank-250 — اختبار الرمادي يكشف فقدان المعنى

visualization / accessibility

**السؤال:** ماذا تختبر عند عرض الرسم بتدرج رمادي؟

**الخلاصة:** راجع بقاء الرسالة الأساسية واضحة؛ اختفاء الفروق يكشف اعتمادًا زائدًا على Hue وحده.

**القيد:** اختبار الرمادي جزء من المراجعة وليس اختبار إتاحة كاملًا.

**الدليل المحلي:** إذا اختفى الفرق بالكامل، فالاعتماد على hue وحده غالبًا مشكلة.

المصدر: `content/data-viz/pages.json#/0/blocks/11/inline/0/text`

مسار التعلم: `/learn/accessibility-color-qa/`

## hansa-bank-251 — الإتاحة تشمل طريق القراءة والتنقل

visualization / accessibility

**السؤال:** هل لوحة جميلة بصريًا تعني أنها متاحة؟

**الخلاصة:** تضم المراجعة ترتيب القراءة والتنقل بلوحة المفاتيح عندما ينطبق، مع وضوح التسميات والحالات.

**القيد:** اختبر سيناريوهات استخدام فعلية بدل الاكتفاء بانطباع الشكل.

**الدليل المحلي:** keyboard/navigation behavior عندما ينطبق، labels، عدم الاعتماد على اللون فقط، وضوح states، وترتيب القراءة

المصدر: `content/data-viz/pages.json#/0/blocks/14/inline/0/text`

مسار التعلم: `/learn/accessibility-color-qa/`

## hansa-bank-252 — قارن المسارات عبر السلاسل

visualization / time

**السؤال:** تريد رؤية اختلاف تطور مبيعات المناطق؛ ماذا تضيف السلاسل المتعددة؟

**الخلاصة:** يمكن لعدة خطوط إظهار مسارات مجموعات مختلفة عبر الزمن في رسم واحد.

**القيد:** يجب أن تظل هوية كل سلسلة واضحة وأن تكون المشاهدات متتابعة بمعنى حقيقي.

**الدليل المحلي:** Multiple series can be shown together to compare trajectories

المصدر: `content/data-viz/pages.json#/16/blocks/106/inline/0/text`

مسار التعلم: `/learn/core-chart-types/`

## hansa-bank-253 — تكرار الإجمالي قد يكشف علاقة مفقودة

power-bi / model

**السؤال:** كل فئة تعرض نفس إجمالي المبيعات؛ ما الذي تفحصه؟

**الخلاصة:** في تمرين النموذج، غياب العلاقة بين Product وSales منع مرشح الفئة من الوصول للمبيعات فظهر الإجمالي نفسه.

**القيد:** هذا تفسير الحالة في الدرس؛ افحص النموذج الفعلي قبل تعميم التشخيص.

**الدليل المحلي:** because there isn't a model relationship between these tables, the `Sales` table isn't filtered.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/20/text`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-254 — تفرد المفتاح يفسر جهة الواحد

power-bi / model

**السؤال:** كيف تعرف لماذا اختار النموذج علاقة واحد إلى متعدد؟

**الخلاصة:** في الدرس اكتشف Power BI تفرد ProductKey في جدول Product فاختار جهة الواحد لهذا الجدول.

**القيد:** راجع البيانات الفعلية ولا تعتمد على الاكتشاف التلقائي وحده.

**الدليل المحلي:** the `ProductKey` column from the `Product` table contains unique values.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/30/items/1`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-255 — العلاقة غير النشطة لا تمرر المرشح تلقائيًا

power-bi / model

**السؤال:** ترى علاقة مرسومة لكن التصفية لا تسلكها؛ ما حالتها؟

**الخلاصة:** العلاقة النشطة تمرر المرشحات؛ غير النشطة لا تمررها افتراضيًا ويمكن لحسابات خاصة استخدامها.

**القيد:** وجود خط بين جدولين وحده لا يكفي لوصف مسار التصفية.

**الدليل المحلي:** Active relationships propagate filters.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/30/items/3`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-256 — اقرأ خط العلاقة نفسه

power-bi / model

**السؤال:** ما الفرق بين الخط المتصل والمتقطع في مخطط النموذج؟

**الخلاصة:** الخط المتصل يمثل علاقة نشطة والمتقطع علاقة غير نشطة، والسهم يبين اتجاه التصفية.

**القيد:** راجع أيضًا رموز التعددية والأعمدة المرتبطة.

**الدليل المحلي:** A solid line represents an active relationship; a dotted line represents an inactive relationship.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/35/text`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-257 — مجلد العرض تنظيم منطقي

power-bi / model

**السؤال:** هل نقل الحقول إلى Display Folder يغير البيانات؟

**الخلاصة:** مجلدات العرض تنظم تقديم الحقول في النموذج، خصوصًا في الجداول كثيرة الأعمدة.

**القيد:** هي تنظيم للعرض وليست تحويلًا لقيم الجدول.

**الدليل المحلي:** They're logical presentation only.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/69/text`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-258 — تصنيف الموقع يساعد الخريطة

power-bi / model

**السؤال:** لماذا تحدد Data Category لحقل الدولة؟

**الخلاصة:** تصنيف الحقل كدولة أو منطقة يقدم معلومات أوضح للأداة عند رسم الخريطة.

**القيد:** تصنيف الحقل لا يغني عن مراجعة صحة قيم المواقع.

**الدليل المحلي:** categorizing the column as country or region provides more accurate information to Power BI when it renders a map visualization.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/77/text`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-259 — وصف الحقل يظهر أثناء التأليف

power-bi / model

**السؤال:** كيف توضح معنى مقياس التكلفة لمؤلف التقرير؟

**الخلاصة:** وصف الجدول أو العمود أو المقياس يظهر كتلميح عند المرور على الحقل في Data pane.

**القيد:** اكتب وصفًا يعبر عن تعريف الحساب لا مجرد تكرار اسمه.

**الدليل المحلي:** description text is revealed in a tooltip when a report author hovers their cursor over the field.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/90/text`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-260 — التلخيص الافتراضي قد لا يناسب السعر

power-bi / model

**السؤال:** ماذا تراجع إذا ظهر مجموع لأسعار الوحدات؟

**الخلاصة:** الدرس يغير Summarize By لسعر الوحدة من الجمع إلى المتوسط لأن الحقل يمثل سعرًا.

**القيد:** المتوسط البسيط ليس بالضرورة السعر المرجح المطلوب في كل تحليل.

**الدليل المحلي:** This default behavior isn't suitable for a column like `Unit Price`, which represents a rate.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/96/text`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-261 — إخفاء المفاتيح ينظّم واجهة النموذج

power-bi / model

**السؤال:** هل كل عمود مستخدم في العلاقات يجب أن يراه مؤلف التقرير؟

**الخلاصة:** يخفي التمرين مفاتيح وأعمدة مستخدمة في العلاقات والأمان والحسابات لتنظيم الحقول الظاهرة.

**القيد:** الإخفاء تنظيم للواجهة؛ لا تتعامل معه كبديل لضبط الوصول.

**الدليل المحلي:** The columns were hidden because they're either used by relationships or will be used in row-level security configuration or calculation logic.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/103/text`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-262 — التاريخ التلقائي قد لا يطابق السنة المالية

power-bi / model

**السؤال:** سنتك المالية تبدأ في يوليو؛ هل تعتمد على Date Hierarchy التلقائي؟

**الخلاصة:** في الدرس تبدأ السنة المالية في يوليو بينما تبدأ السنة في التسلسل التلقائي في يناير؛ يجب مواءمة تصميم التاريخ مع التقويم المطلوب.

**القيد:** راجع إعداد الملف وتقويم المؤسسة قبل بناء المقارنات.

**الدليل المحلي:** But, in these automatically created date hierarchies, the date hierarchy year commences on January 1 of each year.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/16/blocks/114/text`

مسار التعلم: `/learn/academy/power-bi/labs-03-configure-semantic-model/`

## hansa-bank-263 — تعويض التكلفة المفقودة له قاعدة محددة

power-bi / prepare

**السؤال:** كيف عالج التمرين TotalProductCost المفقودة؟

**الخلاصة:** استخدم عدد الوحدات مضروبًا في التكلفة القياسية عند غياب التكلفة، وأبقى القيمة الأصلية عندما كانت موجودة.

**القيد:** هذه قاعدة التمرين وليست مبررًا عامًا لتعويض كل قيمة مفقودة.

**الدليل المحلي:** If missing, it produces a value by multiplying the **OrderQuantity** value by the **StandardCost** value; otherwise, it uses the existing **TotalProductCost** value.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/15/blocks/113/text`

مسار التعلم: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

## hansa-bank-264 — أعمدة الشهور تتحول إلى صفوف

power-bi / prepare

**السؤال:** لديك M01 إلى M12 كأعمدة؛ كيف تصبح الشهور قابلة للتحليل كحقل؟

**الخلاصة:** يستخدم التمرين Unpivot Other Columns مع تثبيت السنة والموظف، فتنتقل أسماء الأعمدة إلى Attribute وقيمها إلى Value.

**القيد:** راجع أعمدة الهوية التي يجب تثبيتها قبل التحويل.

**الدليل المحلي:** Notice that the column names now appear in the **Attribute** column, and the values appear in the **Value** column.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/15/blocks/131/items/0`

مسار التعلم: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

## hansa-bank-265 — الإعداد الإقليمي يغير قراءة التاريخ

power-bi / prepare

**السؤال:** هل 7/1/2017 يعني أول يوليو دائمًا؟

**الخلاصة:** في بيئة التمرين الأمريكية يعني أول يوليو؛ قراءة النص كتاريخ تعتمد على الإعداد الإقليمي.

**القيد:** ثبت تفسير اليوم والشهر عند تحويل البيانات.

**الدليل المحلي:** The virtual machine uses US regional settings, so this date is in fact July 1, 2017.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/15/blocks/144/text`

مسار التعلم: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

## hansa-bank-266 — الأهداف بالألوف تحتاج تحويل الوحدة

power-bi / prepare

**السؤال:** لماذا ضُرب عمود Target في 1000؟

**الخلاصة:** لأن المصدر خزّن الأهداف بوحدة الآلاف؛ التحويل يعيدها للوحدة المطلوبة للمقارنة.

**القيد:** لا تضرب تلقائيًا دون التحقق من وحدة المصدر.

**الدليل المحلي:** You may recall that the target values were stored as thousands.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/15/blocks/155/text`

مسار التعلم: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

## hansa-bank-267 — استعلام مساعد لا يلزم تحميله كجدول

power-bi / prepare

**السؤال:** لماذا عُطّل تحميل ColorFormats بعد الدمج؟

**الخلاصة:** تم دمج بياناته في Product المحمل للنموذج، لذلك احتفظ التمرين بالاستعلام دون تحميل جدول مستقل له.

**القيد:** تعطيل التحميل لا يعني حذف الاستعلام المستخدم في التحويل.

**الدليل المحلي:** Disabling the load means it will not load as a table to the data model.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/15/blocks/189/text`

مسار التعلم: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

## hansa-bank-268 — خصوصية المصدر تخص تبادل البيانات بين المصادر

power-bi / prepare

**السؤال:** هل إعداد Private يعني أن التقرير نفسه ممنوع من المشاركة؟

**الخلاصة:** شرح Power Query يربط مستويات الخصوصية بإمكان مشاركة البيانات بين المصادر أثناء المعالجة.

**القيد:** هذا الإعداد لا يحل محل صلاحيات مشاركة التقرير أو الوصول إليه.

**الدليل المحلي:** it means that the Power Query engine can't share data between the sources.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/15/blocks/177/text`

مسار التعلم: `/learn/academy/power-bi/labs-02-transform-data-power-bi/`

## hansa-bank-269 — إجمالي المصفوفة له مستوى مختلف

power-bi / report

**السؤال:** لماذا كانت مقارنة Total Sales بأول قيمة تساوي صفرًا في المثال؟

**الخلاصة:** الدرس يوضح أن الإجمالي يقع على مستوى هرمي مختلف عن السنوات، ويعد أول عمود على مستواه في هذا الحساب.

**القيد:** لا تفترض أن حساب الإجمالي يكرر حساب خلايا السنوات بالطريقة نفسها.

**الدليل المحلي:** considered the first column on that level.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/20/blocks/63/text`

مسار التعلم: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

## hansa-bank-270 — المقارنة بالسابق تتبع ترتيب العرض

power-bi / report

**السؤال:** ما الذي يسبق حساب Profit versus previous في التمرين؟

**الخلاصة:** يرتب التمرين السنوات تصاعديًا ثم يقارن الربح بالقيمة السابقة؛ ترتيب الفترات جزء من معنى المقارنة.

**القيد:** راجع ترتيب المحور قبل تفسير السابق زمنيًا.

**الدليل المحلي:** Sort the resulting bar chart by **Year** ascending

المصدر: `content/academy/lessons.json#/tracks/1/lessons/20/blocks/19/items/0`

مسار التعلم: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

## hansa-bank-271 — متوسط نافذتين يجمع فترتين متتاليتين

power-bi / report

**السؤال:** ما معنى WindowSize بقيمة 2 في مثال الأرباح السنوية؟

**الخلاصة:** متوسط FY2019 المتحرك في المثال يحسب من أرباح FY2018 وFY2019.

**القيد:** هذا وصف لنافذة المثال؛ راجع سلوك الحدود والقيم المفقودة في التطبيق.

**الدليل المحلي:** the moving average for FY2019 is the average of the profits for FY2018 and FY2019.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/20/blocks/36/text`

مسار التعلم: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

## hansa-bank-272 — محور FIRST يحدد أول ماذا

power-bi / report

**السؤال:** لماذا تغيرت المقارنة بعد استبدال ROWS بـCOLUMNS؟

**الخلاصة:** في مصفوفة الفئات والسنوات، COLUMNS جعل المقارنة مقابل السنة المالية الأولى بدل الفئة الأولى.

**القيد:** حدد اتجاه الحساب بما يوافق تخطيط المصفوفة.

**الدليل المحلي:** Replace ROWS with COLUMNS and observe that the calculation now compares the sales amount per category against the first fiscal year

المصدر: `content/academy/lessons.json#/tracks/1/lessons/20/blocks/61/items/0`

مسار التعلم: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

## hansa-bank-273 — إعادة التراكم عند بداية السنة

power-bi / report

**السؤال:** كيف جعل التمرين المجموع الجاري يبدأ مجددًا كل سنة مالية؟

**الخلاصة:** أضاف HIGHESTPARENT كمعامل إعادة ضبط في RUNNINGSUM على محور السنة والربع.

**القيد:** المعنى يعتمد على مستويات المحور؛ اختبر حدود السنوات في الرسم.

**الدليل المحلي:** This sum will reset at the beginning of every fiscal year.

المصدر: `content/academy/lessons.json#/tracks/1/lessons/20/blocks/66/text`

مسار التعلم: `/learn/academy/power-bi/labs-07-create-visual-calculations/`

## hansa-bank-274 — إطار الماضي قد يستبعد الحالي

sql / windows

**السؤال:** ماذا تعني النهاية 1 PRECEDING بدل CURRENT ROW؟

**الخلاصة:** في مثال ROWS BETWEEN 5 PRECEDING AND 1 PRECEDING تدخل الصفوف الخمسة السابقة ويستبعد الحالي.

**القيد:** تقل الصفوف المتاحة عند بداية المجموعة.

**الدليل المحلي:** يشمل الخمسة صفوف السابقة، بدون current row.

المصدر: `content/sql/vault.json#/pages/48/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

## hansa-bank-275 — Pipeline تربط الأنشطة واعتمادياتها

fabric / ingestion

**السؤال:** هل canvas مجرد قائمة أوامر مستقلة؟

**الخلاصة:** تجمع الأنشطة والعلاقات التي تحدد اعتمادها، ويمكنها استدعاء دفاتر أو Dataflows وخدمات مدعومة.

**القيد:** وجود نشاط لا يثبت نجاح شروط تشغيله.

**الدليل المحلي:** The canvas combines activities and their dependencies.

المصدر: `content/fabric/notes.json#/2/chapters/1/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-276 — اسم فئة النشاط لا يوسع قدرته

fabric / ingestion

**السؤال:** هل تصنيف Copy ضمن التحويل يمنحها أي معالجة معقدة؟

**الخلاصة:** اختر المحرك بحسب العملية الفعلية، لا بحسب عنوان فئة النشاط.

**القيد:** افحص عقد التحويل المدعوم قبل تصميم الحل.

**الدليل المحلي:** Choose an engine by the actual operation, not a category label.

المصدر: `content/fabric/notes.json#/2/chapters/1/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-277 — Gateway تصل الشبكة ولا تمنح صلاحية قاعدة

fabric / ingestion

**السؤال:** هل اتصال gateway يكفي لقراءة الجداول؟

**الخلاصة:** الاتصال لا يمنح database permissions؛ التفويض يحتاج تحققًا مستقلًا.

**القيد:** افصل اختبار الوصول الشبكي عن اختبار الصلاحيات.

**الدليل المحلي:** Gateway connectivity does not grant database permissions.

المصدر: `content/fabric/notes.json#/2/chapters/3/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-278 — موصل المصدر قد يختلف عن موصل الهدف

fabric / ingestion

**السؤال:** هل دعم نظام كمصدر يعني دعمه كهدف لكل نشاط؟

**الخلاصة:** الدعم قد يختلف بحسب اتجاه المصدر والوجهة والنشاط؛ راجع المصفوفة الملائمة.

**القيد:** لا تعمم قدرة موصل على كل مسارات النقل.

**الدليل المحلي:** Support varies by source/destination direction and activity.

المصدر: `content/fabric/notes.json#/2/chapters/3/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-279 — Parameter مدخل وVariable حالة تنفيذ

fabric / ingestion

**السؤال:** كيف تميز مدخل تشغيل عن حالة داخلية تتغير؟

**الخلاصة:** Parameters تدخل قيم التشغيل إلى workflow، بينما variables تمثل حالته الداخلية.

**القيد:** حدد ما يجب تمريره من الأب للابن صراحة.

**الدليل المحلي:** Variables represent internal execution state

المصدر: `content/fabric/notes.json#/2/chapters/4/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-280 — الحالة المشتركة ليست مدخلًا محليًا لكل تكرار

fabric / ingestion

**السؤال:** هل تستخدم variable مشتركة كأن لكل iteration نسختها؟

**الخلاصة:** يحذر المصدر من افتراض عزل shared mutable state لكل تكرار.

**القيد:** حدّد عقد التوازي ومدخلات كل عنصر.

**الدليل المحلي:** Never assume shared mutable state is an iteration-local input.

المصدر: `content/fabric/notes.json#/2/chapters/4/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-281 — بدء التشغيل لا يعني جاهزية النتيجة

fabric / delivery

**السؤال:** وصل ملف فبدأ run؛ هل تنشر الناتج فورًا؟

**الخلاصة:** الوصول قد يبدأ التشغيل، بينما نجاح الاعتماديات وفحوص الجودة يحدد جاهزية الإصدار.

**القيد:** اربط الإتاحة بالجاهزية المطلوبة لا بمجرد trigger.

**الدليل المحلي:** arrival can start a run, while success/quality dependencies determine release.

المصدر: `content/fabric/notes.json#/2/chapters/5/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-282 — Secure input/output تخص السجلات

fabric / ingestion

**السؤال:** هل إخفاء المدخلات والمخرجات يجعل parser صحيحًا؟

**الخلاصة:** هذه الخيارات تغير التسجيل، ولا تصحح parsing أو تحقق جودة البيانات.

**القيد:** راجع التنسيق والتحقق بصورة مستقلة عن سرية السجل.

**الدليل المحلي:** Secure input/output changes logging, not parsing or data validation.

المصدر: `content/fabric/notes.json#/2/chapters/8/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-283 — Binary غير تفسير CSV كصفوف

fabric / ingestion

**السؤال:** لماذا يغير المثال المصدر إلى Delimited text؟

**الخلاصة:** ليفسر CSV كصفوف مع التعامل مع العنوان بدل معاملته كتدفق binary فقط.

**القيد:** حدد delimiter والاقتباس والعناوين وفق الملف الحقيقي.

**الدليل المحلي:** changes Binary to Delimited text.

المصدر: `content/fabric/notes.json#/2/chapters/8/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-284 — Mapping تشمل أنواع الأعمدة

fabric / ingestion

**السؤال:** لماذا يغير المثال year إلى integer وrating إلى double؟

**الخلاصة:** الربط إلى الهدف لا يقتصر على الأسماء؛ يتضمن ضبط أنواع الأعمدة المطلوبة.

**القيد:** تحقق من قابلية تحويل القيم الفعلية.

**الدليل المحلي:** changes year to integer and rating to double

المصدر: `content/fabric/notes.json#/2/chapters/9/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-285 — Overwrite اختيار لعقد الكتابة

fabric / ingestion

**السؤال:** هل تنقل إعداد Overwrite من demo إلى تحميل تزايدي دون مراجعة؟

**الخلاصة:** المثال يختار Overwrite، بينما يفصل الشرح بين عقود snapshot والتحميل التزايدي.

**القيد:** حدد ما يجب الاحتفاظ به أو استبداله في الهدف.

**الدليل المحلي:** distinct snapshot/incremental contracts

المصدر: `content/fabric/notes.json#/2/chapters/9/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-286 — Succeeded دليل تنفيذ لا شهادة جودة

fabric / ingestion

**السؤال:** هل نجاح Copy يثبت التفرد وسلامة العلاقات والقواعد المالية؟

**الخلاصة:** هو دليل على تنفيذ النشاط، لا ضمان مرور جميع قواعد العمل.

**القيد:** أضف التحقق المطلوب قبل إتاحة الناتج.

**الدليل المحلي:** not a guarantee that uniqueness, referential completeness, or financial rules passed.

المصدر: `content/fabric/notes.json#/2/chapters/10/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-287 — Default ليست منعًا لقيمة المستدعي

fabric / ingestion

**السؤال:** هل القيمة الافتراضية للـparameter تمنع تمرير قيمة أخرى؟

**الخلاصة:** هي قيمة fallback، وليست قاعدة تمنع المستدعي من تحديد مدخل.

**القيد:** راجع المدخل الفعلي المسجل للنشاط.

**الدليل المحلي:** Defaults are fallback values

المصدر: `content/fabric/notes.json#/2/chapters/11/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-288 — Interpolation قد تحول النوع إلى نص

fabric / ingestion

**السؤال:** هل كل تعبير ديناميكي يعيد النوع العددي نفسه؟

**الخلاصة:** الاستيفاء يرجع نصًا، بينما قد يحتفظ تعبير الحقل الكامل بنوع عددي وفق الملاحظة.

**القيد:** افحص النوع المتوقع في المستهلك التالي.

**الدليل المحلي:** Interpolation returns text; whole-field expressions can retain numeric types.

المصدر: `content/fabric/notes.json#/2/chapters/11/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-289 — Completion ليست Success فقط

fabric / delivery

**السؤال:** متى يعمل مسار يعتمد على Completion في المثال؟

**الخلاصة:** يشمل النجاح أو الفشل، بينما يحتاج predecessor المتخطي شرط skip.

**القيد:** راجع الحالة الفعلية والشرط المحدد لكل وصلة.

**الدليل المحلي:** Completion covers success or failure

المصدر: `content/fabric/notes.json#/2/chapters/12/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-290 — اتبع السابق المباشر في السلسلة

fabric / delivery

**السؤال:** هل حالة أول نشاط تكفي لفهم كل الفروع التالية؟

**الخلاصة:** يطلب المصدر تتبع immediate predecessor عند كل edge؛ النشاط المتخطي ليس نشاطًا فاشلًا.

**القيد:** استنتج كل انتقال من علاقته المباشرة.

**الدليل المحلي:** Follow the immediate predecessor at each edge.

المصدر: `content/fabric/notes.json#/2/chapters/12/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-291 — Wait لا تختبر الجاهزية

fabric / delivery

**السؤال:** هل مرور تأخير ثابت يثبت اكتمال العمل السابق؟

**الخلاصة:** الانتظار الثابت ليس readiness check؛ يحتاج المسار شرط نجاح أو تحقق ملائم.

**القيد:** لا تعتمد على الوقت وحده لإطلاق استهلاك البيانات.

**الدليل المحلي:** a fixed Wait is not a readiness check.

المصدر: `content/fabric/notes.json#/2/chapters/12/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-292 — علامة النجاح قد تكون بلا نقل بيانات

fabric / delivery

**السؤال:** عطلت Copy وأعطيتها حالة نجاح؛ ماذا أثبتت؟

**الخلاصة:** الحالة المعيّنة قد توجه الفروع دون تنفيذ النقل.

**القيد:** لا تعتبر assigned success سجل تنفيذ Copy.

**الدليل المحلي:** assigned success does not show that data was copied.

المصدر: `content/fabric/notes.json#/2/chapters/13/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-293 — النشاط المعطل لا يملك مخرجات Copy العادية

fabric / delivery

**السؤال:** هل تعتمد الخطوة التالية على حقول output لنشاط غير منفذ؟

**الخلاصة:** placeholder غير النشط لا يملك حقول Copy العادية في وصف المصدر.

**القيد:** افحص عقود المخرجات عند تعطيل نشاط.

**الدليل المحلي:** An inactive placeholder has no normal Copy output fields

المصدر: `content/fabric/notes.json#/2/chapters/13/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-294 — حفظ تعريف Pipeline غير تشغيلها

fabric / delivery

**السؤال:** تم commit لتعريف JSON؛ هل run المقابلة نجحت؟

**الخلاصة:** تعريف الإعداد ونتيجة التنفيذ دليلان مختلفان؛ نجاح commit لا يثبت أن pipeline عملت.

**القيد:** راجع سجل التشغيل المناظر للإصدار.

**الدليل المحلي:** a successful source commit does not prove the corresponding pipeline ran.

المصدر: `content/fabric/notes.json#/2/chapters/7/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-295 — Lakehouse عنصر فوق أساس تخزين

fabric / foundations

**السؤال:** هل OneLake وLakehouse اسمان للكيان نفسه؟

**الخلاصة:** OneLake أساس التخزين على مستوى المستأجر، وLakehouse أحد عناصر Fabric التي تستخدمه.

**القيد:** افصل العنصر عن طبقة التخزين المشتركة.

**الدليل المحلي:** A lakehouse is one Fabric item using it.

المصدر: `content/fabric/notes.json#/0/chapters/0/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-296 — دعم Shortcut لا يساوي دعم Cache

fabric / ingestion

**السؤال:** هل كل مصدر shortcut مدعوم يدخل في قائمة caching نفسها؟

**الخلاصة:** قائمتا مصادر shortcuts ومصادر cache مختلفتان في الملاحظة المحلية.

**القيد:** راجع القائمتين عند تطبيق ميزة متغيرة.

**الدليل المحلي:** Supported shortcut sources and supported cache sources are different lists.

المصدر: `content/fabric/notes.json#/0/chapters/1/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-297 — Shortcut لا تستبدل النسخة الاحتياطية

fabric / ingestion

**السؤال:** هل الاعتماد على مرجع للمصدر يحفظ نسخة مستقلة للتعافي؟

**الخلاصة:** تظل shortcut معتمدة على المصدر وليست backup.

**القيد:** حدد متطلبات الاحتفاظ والتعافي منفصلة عن المشاركة.

**الدليل المحلي:** A shortcut remains a source dependency, not a backup.

المصدر: `content/fabric/notes.json#/0/chapters/1/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-298 — الحذف قد يمثَّل دون إعادة كتابة فورية

fabric / transform

**السؤال:** هل كل حذف Delta يعيد كتابة ملف Parquet الأصلي فورًا؟

**الخلاصة:** قد تمثل deletion vectors الصفوف المحذوفة دون إعادة كتابة مباشرة للملف.

**القيد:** راجع طريقة الجدول وخصائصه؛ لا تعمم copy-on-write على كل حالة.

**الدليل المحلي:** without immediately rewriting the original Parquet file.

المصدر: `content/fabric/notes.json#/0/chapters/2/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-299 — تحسين القراءة قد يضيف كلفة كتابة

fabric / transform

**السؤال:** هل V-Order مكسب مجاني ثابت لكل عبء؟

**الخلاصة:** يعيد تنظيم Parquet عند الكتابة أو إعادة الكتابة لاستهلاك كثيف القراءة، مع overhead يعتمد على workload.

**القيد:** لا تحول متوسطًا من المصدر إلى ضمان أداء عام.

**الدليل المحلي:** with workload-dependent write overhead.

المصدر: `content/fabric/notes.json#/0/chapters/3/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-300 — Pruning تحتاج شرطًا قابلًا للاستفادة

fabric / transform

**السؤال:** متى يساعد partition key في تخطي المجلدات؟

**الخلاصة:** عندما تسمح المرشحات المستخدمة على المفاتيح باستبعاد أقسام من القراءة.

**القيد:** اسم المفتاح وحده لا يثبت أن استعلامًا بعينه سيستفيد.

**الدليل المحلي:** Usable predicates on partition keys can skip directories.

المصدر: `content/fabric/notes.json#/0/chapters/4/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-301 — ملفات Delta ليست مستندات مستقلة للتعديل

fabric / transform

**السؤال:** هل تعدّل Parquet أو _delta_log مباشرة بأداة ملفات عامة؟

**الخلاصة:** قد يكسر ذلك الاتساق المعاملي خارج العمليات الواعية بـDelta.

**القيد:** استخدم مسار كتابة مصرحًا وملائمًا للجدول.

**الدليل المحلي:** can break transactional consistency.

المصدر: `content/fabric/notes.json#/0/chapters/5/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-302 — راحة إدارة الملفات لا تلغي الحوكمة

fabric / transform

**السؤال:** هل سهولة حذف ملف أو نقله تكفي لاعتماد العملية؟

**الخلاصة:** تبقى متطلبات الحوكمة والمعاملات والاعتماديات قائمة رغم سهولة الأداة.

**القيد:** راجع نوع العنصر وأثره قبل أي عملية.

**الدليل المحلي:** File-management convenience does not remove governance, transaction, or dependency requirements.

المصدر: `content/fabric/notes.json#/0/chapters/5/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-303 — Schema مساحة أسماء وليست Partition

fabric / foundations

**السؤال:** هل schema في Tables تعني مرحلة medallion أو مفتاح تقسيم؟

**الخلاصة:** تنظم schemas أسماء الكائنات، ولا تساوي مفاتيح partition أو مراحل المعالجة.

**القيد:** حدد وظيفة كل طبقة قبل رسم المعمارية.

**الدليل المحلي:** Schemas organize names; they are not partition keys or medallion stages.

المصدر: `content/fabric/notes.json#/0/chapters/6/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-304 — إعادة تسمية جدول تمتد إلى مراجع المستهلكين

fabric / foundations

**السؤال:** هل ينتهي التغيير عند نقل أو إعادة تسمية الجدول؟

**الخلاصة:** قد تحتاج مراجع notebooks وdataflows وSQL إلى التحديث.

**القيد:** احصر الاعتماديات قبل إجراء النقل.

**الدليل المحلي:** Renaming or moving a table requires updating dependent

المصدر: `content/fabric/notes.json#/0/chapters/6/points/2`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-305 — صورة المجلدات ليست اختبار أداء

fabric / transform

**السؤال:** هل مشاهدة hierarchy التقسيم تثبت أن التخطيط أسرع؟

**الخلاصة:** تعرض التنظيم الفيزيائي فقط؛ قارن الأداء على أحمال وتوزيعات ممثلة.

**القيد:** لا تنقل عدد مجلدات demo صغير كقرار إنتاج.

**الدليل المحلي:** not proof that one design is fastest.

المصدر: `content/fabric/notes.json#/0/chapters/7/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-306 — الصيانة واسعة النطاق تحتاج تشغيلًا مرصودًا

fabric / delivery

**السؤال:** كيف تتعامل مع آلاف الجداول بدل النقر المتكرر؟

**الخلاصة:** يقترح المصدر workflow صيانة مجدولة وقابلة للمراقبة مع اعتماديات نجاح واحتفاظ لكل جدول.

**القيد:** راجع توقيتها وتأثيرها على القراء والكتابات.

**الدليل المحلي:** scheduled, observable maintenance workflow

المصدر: `content/fabric/notes.json#/0/chapters/8/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-307 — لغة صيانة Spark ليست T-SQL endpoint

fabric / delivery

**السؤال:** هل تلصق أوامر صيانة Spark في محرر endpoint SQL؟

**الخلاصة:** المحركان ومسارات الإدارة مختلفان؛ استخدم السطح الداعم للأمر.

**القيد:** تشابه SQL الظاهري لا يعني توافق التنفيذ.

**الدليل المحلي:** do not paste Spark maintenance SQL into its T-SQL editor.

المصدر: `content/fabric/notes.json#/0/chapters/8/points/2`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-308 — قراءة البيانات فقط لا تمنع كل Metadata

fabric / query

**السؤال:** كيف ينجح CREATE VIEW بينما يرفض UPDATE في المثال؟

**الخلاصة:** يقيد endpoint كتابة بيانات Lakehouse، لكنه قد يدعم كائنات SQL للقراءة داخل حدوده.

**القيد:** افصل تعديل البيانات عن إنشاء كائن قراءة مدعوم.

**الدليل المحلي:** Read-only data does not mean no SQL metadata operations.

المصدر: `content/fabric/notes.json#/0/chapters/10/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-309 — View الـendpoint ليست Delta table جديدة

fabric / query

**السؤال:** هل إنشاء view يجعلها جدولًا materialized يراه Spark بالطريقة نفسها؟

**الخلاصة:** هي كائن SQL في endpoint، وليست تلقائيًا managed Delta table جديدة.

**القيد:** راجع واجهة الاستهلاك التي تستهدفها.

**الدليل المحلي:** not a newly materialized managed Delta table

المصدر: `content/fabric/notes.json#/0/chapters/10/points/2`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-310 — خبرة SQL Server لا تثبت تطابق Fabric

fabric / query

**السؤال:** هل تنقل triggers وكائنات مألوفة كما هي؟

**الخلاصة:** المفاهيم المألوفة لا تضمن feature parity؛ راجع الدعم الفعلي للمحرك.

**القيد:** المصدر محلي؛ يحتاج عقد المنتج مراجعة قبل النشر.

**الدليل المحلي:** Familiar SQL Server concepts do not guarantee feature parity.

المصدر: `content/fabric/notes.json#/1/chapters/0/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-311 — افصل قرارات التحضير والنقل والتنسيق

fabric / ingestion

**السؤال:** هل تختار أداة واحدة لأن اسمها يغطي كل خط البيانات؟

**الخلاصة:** اعتبر preparation وmovement وorchestration وexecution target قرارات منفصلة.

**القيد:** قد تجمع أداة وظائف، لكن متطلبات كل وظيفة تظل مستقلة.

**الدليل المحلي:** Treat preparation, movement, orchestration, and execution target as separate decisions.

المصدر: `content/fabric/notes.json#/1/chapters/2/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-312 — TDS يحتاج اتصال SQL لا مسار ملف

fabric / query

**السؤال:** هل تعطي عميل SQL عنوان OneLake كأنه connection string؟

**الخلاصة:** استخدم معلومات اتصال SQL الفعلية لـTDS؛ مسار ملفات OneLake واجهة أخرى.

**القيد:** تحقق من العميل والبروتوكول والصلاحيات.

**الدليل المحلي:** OneLake file paths belong to a different interface.

المصدر: `content/fabric/notes.json#/1/chapters/3/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-313 — التقرير التاريخي يحتاج ساعة مشتركة

fabric / query

**السؤال:** هل تكفي عبارة نريد بيانات قديمة دون cutoff؟

**الخلاصة:** يحتاج التقرير المستقر cutoff UTC مقصودًا وتاريخًا متاحًا وصلاحية قراءة.

**القيد:** احتفاظ كل مصدر ومرجعه الزمني جزء من قابلية إعادة النتيجة.

**الدليل المحلي:** the intended shared UTC cutoff

المصدر: `content/fabric/notes.json#/1/chapters/4/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-314 — Zero-copy تبدأ بمراجع للملفات

fabric / delivery

**السؤال:** هل clone صفرية النسخ تعني نسخ كل ملف فورًا؟

**الخلاصة:** تبدأ بمراجع إلى الملفات القائمة عبر metadata منسوخة في وصف المصدر.

**القيد:** راجع نطاق دعم clone وشروطها قبل التنفيذ.

**الدليل المحلي:** initially references existing data files through copied metadata.

المصدر: `content/fabric/notes.json#/1/chapters/5/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-315 — Zero-copy لا تعد بتكلفة تخزين مستقبلية صفر

fabric / delivery

**السؤال:** ماذا يحدث مع تغير المصدر والنسخة لاحقًا؟

**الخلاصة:** قد تتباعد احتياجات تخزين المصدر والنسخة مع التغيرات.

**القيد:** قِس الأثر المستقبلي بدل تعميم كلفة الإنشاء الأولية.

**الدليل المحلي:** Initial zero-copy does not mean unlimited future storage is free.

المصدر: `content/fabric/notes.json#/1/chapters/5/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-316 — تغيير العميل لا يغير قدرات المحرك

fabric / query

**السؤال:** هل الانتقال إلى SSMS يتيح عملية غير مدعومة أصلًا؟

**الخلاصة:** تغيير تطبيق العميل لا يغير العمليات التي يدعمها المحرك.

**القيد:** راجع العقد على جهة الخدمة وليس اسم البرنامج المستخدم.

**الدليل المحلي:** Changing client applications does not change the engine's supported operations.

المصدر: `content/fabric/notes.json#/1/chapters/7/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-317 — الوقت الحالي يجعل القراءة التاريخية متحركة

fabric / query

**السؤال:** هل صفوف قديمة مع تعبير current-time تكفي لإعادة تقرير سابق؟

**الخلاصة:** التعبير يقيم وقت الاستعلام؛ استخدم as-of date صريحًا عندما تحتاج تكرار النتيجة.

**القيد:** افصل تاريخ البيانات عن ساعة التقرير.

**الدليل المحلي:** use an explicit as-of date when reproducibility matters.

المصدر: `content/fabric/notes.json#/1/chapters/8/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-318 — DATEDIFF(year) ليست سنوات مكتملة

fabric / query

**السؤال:** هل طرح حدود السنوات يعطي دائمًا عدد أعياد التعيين المكتملة؟

**الخلاصة:** يعد DATEDIFF(year) حدود السنوات، لا anniversaries المكتملة في تنبيه المصدر.

**القيد:** اختبر منطق المدة وفق تعريف العمل المطلوب.

**الدليل المحلي:** counts year boundaries, not completed hire anniversaries.

المصدر: `content/fabric/notes.json#/1/chapters/8/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-319 — إدارة Blob غير قراءة محتواها

fabric / security

**السؤال:** هل صلاحية management-plane تساوي تصريح data-plane read؟

**الخلاصة:** يميز المصدر بينهما، فلا تثبت الأولى القدرة على قراءة البيانات.

**القيد:** افحص الدور الذي يمنح العملية الفعلية المطلوبة.

**الدليل المحلي:** Blob data-plane read differs from management-plane access.

المصدر: `content/fabric/notes.json#/1/chapters/10/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-320 — البيانات التاريخية لا تعيد المخطط تلقائيًا

fabric / query

**السؤال:** هل توفر لقطة صفوف قديمة يثبت إعادة بناء schema القديمة؟

**الخلاصة:** قيود المخطط الحالي لا تساوي historical schema reconstruction.

**القيد:** راجع الأعمدة ووقت إنشاء view والتاريخ المتاح.

**الدليل المحلي:** Current schema constraints do not equal historical schema reconstruction.

المصدر: `content/fabric/notes.json#/1/chapters/11/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-321 — عمود المصدر قد يغير مقارنة UNION

fabric / query

**السؤال:** أضفت Source literal لتمييز الأصل؛ هل يظل تعريف الصف المكرر نفسه؟

**الخلاصة:** قد يؤثر العمود الجديد في مقارنة التكرار بين الصفوف لأنه أصبح جزءًا من النتيجة.

**القيد:** راجع ما تريد اعتباره مكررًا قبل إضافة أو إسقاط الحقول.

**الدليل المحلي:** An added Source literal identifies origin and can affect UNION duplicate comparison.

المصدر: `content/fabric/notes.json#/1/chapters/12/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-322 — الاسترجاع من Clone قد يفقد إدخالًا لاحقًا

fabric / delivery

**السؤال:** كانت clone عند11 صفًا ثم صار المصدر12؛ ماذا يعيد المثال؟

**الخلاصة:** إعادة التعبئة من النسخة تعيد11 وتغفل الإدخال الذي حدث بعدها.

**القيد:** حدد نقطة الاسترجاع المطلوبة وراجع الفروق قبل أي تنفيذ.

**الدليل المحلي:** restores eleven rows and omits the later insert.

المصدر: `content/fabric/notes.json#/1/chapters/13/points/1`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-323 — استرجاع المثال ليس عملية تعافٍ مكتملة

fabric / delivery

**السؤال:** ما الشروط التي يذكرها تمرين الاسترجاع قبل تغيير الإنتاج؟

**الخلاصة:** يفترض مخططًا ثابتًا وتاريخًا محتفظًا به وصلاحيات وتحققًا ونقطة مراجعة صريحة.

**القيد:** هذا تمرين قرارات محلي وليس إثبات تنفيذ تعافٍ حي.

**الدليل المحلي:** require unchanged schema, retained history, permissions, validation

المصدر: `content/fabric/notes.json#/1/chapters/13/caveat`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-324 — الدالة والإجراء لهما استخدامان مختلفان

fabric / query

**السؤال:** تحتاج منطقًا يرجع قيمة أو صفوفًا قابلة للتركيب؛ هل أي procedure بديل؟

**الخلاصة:** يميّز المصدر functions التي تعيد قيمًا أو صفوفًا قابلة للتركيب عن procedures التي تنفذ workflow.

**القيد:** اختر عقد الكائن الملائم لطريقة الاستدعاء.

**الدليل المحلي:** functions return values or composable rows

المصدر: `content/fabric/notes.json#/1/chapters/1/points/0`

مسار التعلم: `/lab/dp-600/resources/`

## hansa-bank-325 — عنصر Array غير المصفوفة كاملة

sql / postgresql

**السؤال:** تبحث عن قيمة مفردة داخل Array؛ هل تقارن العمود كله بنص؟

**الخلاصة:** استخدم الوصول إلى عنصر أو عملية بحث في العناصر بحسب السؤال، بدل مقارنة array كاملة بقيمة scalar.

**القيد:** راجع أبعاد المصفوفة ونوع عناصرها.

**الدليل المحلي:** Array وليس scalar value.

المصدر: `content/sql/vault.json#/pages/33/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

## hansa-bank-326 — ANY تبحث بين العناصر

sql / postgresql

**السؤال:** تريد معرفة هل توجد قيمة مطابقة داخل المصفوفة؛ ما الفكرة؟

**الخلاصة:** ANY تتيح اختبار المطابقة مع عنصر من عناصر المصفوفة.

**القيد:** راجع شكل التعبير والمصفوفة الممررة، خصوصًا مع الأبعاد المتعددة.

**الدليل المحلي:** هل توجد قيمة مطابقة في أي عنصر؟

المصدر: `content/sql/vault.json#/pages/33/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

## hansa-bank-327 — احتواء مجموعة داخل Array

sql / postgresql

**السؤال:** ماذا تعني @> بين مصفوفتين في المثال؟

**الخلاصة:** المصفوفة على اليسار تحتوي عناصر المصفوفة على اليمين.

**القيد:** هذا اختبار احتواء لا مقارنة مرتبة عنصرًا بعنصر.

**الدليل المحلي:** تحتوي عناصر الـ array على اليمين.

المصدر: `content/sql/vault.json#/pages/33/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

## hansa-bank-328 — الفهرس غير الموجود قد ينتج NULL

sql / postgresql

**السؤال:** طلبت عنصرًا خارج العناصر الموجودة؛ هل النتيجة قيمة فعلية؟

**الخلاصة:** قد تحصل على NULL عند طلب index غير موجود في مثال المصدر.

**القيد:** لا تفسرها كقيمة عادية أو تتجاهل حدود المصفوفة.

**الدليل المحلي:** إذا طلبت index غير موجود، يمكن أن تحصل على

المصدر: `content/sql/vault.json#/pages/33/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

## hansa-bank-329 — قائمة داخل صف أم جدول عناصر؟

sql / postgresql

**السؤال:** تكرر الاستعلام المعقد على عناصر arrays؛ ماذا تراجع في التصميم؟

**الخلاصة:** يقترح المصدر التفكير في جدول منفصل ومطبع للعناصر عند كثرة التحليل المعقد عليها.

**القيد:** الاختيار يتبع نمط الاستخدام، لا حظرًا عامًا للمصفوفات.

**الدليل المحلي:** فكّر في normalization لجدول منفصل

المصدر: `content/sql/vault.json#/pages/33/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81c3b161dd36ed52c9a9/`

## hansa-bank-330 — طول النص أداة تحقق

sql / text

**السؤال:** كيف تكتشف اسمًا طويلًا بشكل غير معتاد؟

**الخلاصة:** LENGTH وCHAR_LENGTH تعيدان عدد أحرف النص، ويمكن استخدامه لفحص القيم المشبوهة.

**القيد:** الطول غير المعتاد إشارة للفحص وليس إثبات خطأ.

**الدليل المحلي:** الاثنين يرجعان عدد الأحرف في النص.

المصدر: `content/sql/vault.json#/pages/34/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

## hansa-bank-331 — POSITION تحدد حد الاستخراج

sql / text

**السؤال:** قبل فصل username عن domain، ما الذي تحتاج تحديده؟

**الخلاصة:** ابحث عن موضع @ باستخدام POSITION أو STRPOS، ثم استخدمه كحد للاستخراج.

**القيد:** تحقق من صلاحية النص قبل افتراض وجود الفاصل.

**الدليل المحلي:** تحديد الحد الفاصل بين username وdomain في إيميل.

المصدر: `content/sql/vault.json#/pages/34/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

## hansa-bank-332 — LEFT وRIGHT تحددان طرف النص

sql / text

**السؤال:** تريد مقدمة وصف أو آخر أربعة أحرف من رقم؛ ما العملية المناسبة؟

**الخلاصة:** LEFT تستخرج من البداية وRIGHT من النهاية حسب عدد الأحرف المحدد.

**القيد:** الاستخراج ليس تحققًا من صحة الرقم أو النص.

**الدليل المحلي:** استخراج أحرف من البداية أو النهاية.

المصدر: `content/sql/vault.json#/pages/34/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

## hansa-bank-333 — SUBSTRING تجمع البداية والطول

sql / text

**السؤال:** ما المعلومات التي تحدد الجزء المقتطع من نص؟

**الخلاصة:** الصيغة المعروضة تستخدم النص وموضع البداية وطول الجزء المطلوب.

**القيد:** راجع صياغة اللهجة المستخدمة وحدود النص.

**الدليل المحلي:** SUBSTRING(source, start, length)

المصدر: `content/sql/vault.json#/pages/34/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

## hansa-bank-334 — ركّب دوال النص حول حد واضح

sql / text

**السؤال:** هل تحتاج معالجة يدوية لفصل domain بعد @؟

**الخلاصة:** يوضح المثال تركيب POSITION وCHAR_LENGTH وSUBSTRING لتحديد الحد والطول ثم الاستخراج.

**القيد:** تركيب الدوال لا يعوض التحقق من الحالات غير الصالحة.

**الدليل المحلي:** POSITION → find boundary

المصدر: `content/sql/vault.json#/pages/34/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

## hansa-bank-335 — جهة Padding تغير المخرَج

sql / text

**السؤال:** كيف تختلف إضافة أصفار لليسار عن إضافتها لليمين؟

**الخلاصة:** LPAD تضيف من اليسار وRPAD من اليمين للوصول للطول المطلوب في المثال.

**القيد:** حدد هل الأصفار للعرض فقط أم جزء من معرف فعلي.

**الدليل المحلي:** LPAD → add characters on the left

المصدر: `content/sql/vault.json#/pages/34/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

## hansa-bank-336 — Padding قد يقطع النص

sql / text

**السؤال:** حددت طولًا أصغر من الأصل؛ هل تقتصر العملية على الإضافة؟

**الخلاصة:** قد تُقطع النتيجة إذا كان الطول المستهدف أقصر من النص الأصلي.

**القيد:** افحص الحد الأقصى قبل توحيد طول المعرفات.

**الدليل المحلي:** لو الطول المستهدف أصغر من الأصلي، النتيجة تتقطع

المصدر: `content/sql/vault.json#/pages/34/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

## hansa-bank-337 — تنظيف طرف واحد له معنى

sql / text

**السؤال:** تريد إزالة أحرف البداية مع إبقاء النهاية؛ هل تستخدم الدالة نفسها لكل حالة؟

**الخلاصة:** LTRIM للبداية وRTRIM للنهاية، بينما TRIM يمكن أن يعالج الطرفين.

**القيد:** راجع الأحرف التي تعالجها الدالة؛ ليس كل whitespace مضمون الإزالة افتراضيًا.

**الدليل المحلي:** LTRIM → left side

المصدر: `content/sql/vault.json#/pages/34/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81f981e3cff58e8ce989/`

## hansa-bank-338 — علامتا LIKE لا تعنيان الشيء نفسه

sql / postgresql

**السؤال:** كيف تختلف % عن _ في نمط البحث؟

**الخلاصة:** % تطابق صفرًا أو أكثر من الأحرف، بينما _ تطابق حرفًا واحدًا في وصف المصدر.

**القيد:** انتبه إلى الأحرف الخاصة إذا كان المطلوب بحثًا حرفيًا عنها.

**الدليل المحلي:** % → zero or more characters

المصدر: `content/sql/vault.json#/pages/35/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

## hansa-bank-339 — موضع Wildcard يحدد موضع المطابقة

sql / postgresql

**السؤال:** كيف تفرق بين يبدأ بـELF وينتهي بها؟

**الخلاصة:** ELF% يبحث عن بداية، و%ELF عن نهاية، و%ELF% عن احتواء النمط.

**القيد:** هذا بحث نمطي، لا فهم لغوي للكلمة.

**الدليل المحلي:** -- Starts with ELF

المصدر: `content/sql/vault.json#/pages/35/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

## hansa-bank-340 — ILIKE لا تتطلب تطابق حالة الأحرف

sql / postgresql

**السؤال:** لماذا قد لا يطابق البحث عن elf كتابة Elf؟

**الخلاصة:** يقدم المرجع ILIKE للمطابقة غير الحساسة لحالة الأحرف في PostgreSQL، بدل LIKE في المثال.

**القيد:** راجع إعدادات النص واللهجة؛ لا تعمم الصياغة على كل المحركات.

**الدليل المحلي:** case-insensitive matching

المصدر: `content/sql/vault.json#/pages/35/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

## hansa-bank-341 — البحث اللغوي غير بحث الأحرف

sql / postgresql

**السؤال:** تبحث في مقالات طبيعية؛ ما الذي يضيفه Full-Text Search؟

**الخلاصة:** يعتمد على كلمات وتمثيل لغوي موحد وlexemes، بدل مطابقة سلسلة أحرف فقط.

**القيد:** حدد إعداد اللغة المناسب للمحتوى.

**الدليل المحلي:** words + normalization + lexemes + linguistic matching

المصدر: `content/sql/vault.json#/pages/35/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

## hansa-bank-342 — المستند والاستعلام لهما تمثيلان

sql / postgresql

**السؤال:** في Full-Text Search، ما دور tsvector وtsquery؟

**الخلاصة:** يمثل tsvector النص القابل للبحث، وتمثل tsquery طلب البحث، وتستخدم @@ للمطابقة.

**القيد:** تحقق من تكوين اللغة وصياغة الاستعلام.

**الدليل المحلي:** tsvector @@ tsquery

المصدر: `content/sql/vault.json#/pages/35/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

## hansa-bank-343 — Full-Text ليست تصحيحًا إملائيًا

sql / postgresql

**السؤال:** هل البحث اللغوي يعالج تلقائيًا كل typo؟

**الخلاصة:** يميز المصدر البحث النصي الكامل عن fuzzy matching المستخدمة للتشابه التقريبي والأخطاء الإملائية.

**القيد:** اختر التقنية بحسب نوع الاختلاف الذي تريد تحمله.

**الدليل المحلي:** Full-text search مش نفس حاجة typo correction.

المصدر: `content/sql/vault.json#/pages/35/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c810b8b67cbf8815ef577/`

## hansa-bank-344 — المتاح للتثبيت غير المفعّل

sql / postgresql

**السؤال:** وجدت extension في قائمة المتاح؛ هل يمكن افتراض تشغيل وظائفها؟

**الخلاصة:** pg_available_extensions تعرض المتاح، بينما pg_extension تعرض المفعّل بالفعل.

**القيد:** تحقق من حالة البيئة وصلاحياتها قبل استخدام دالة إضافية.

**الدليل المحلي:** pg_extension            → ما المفعّل بالفعل؟

المصدر: `content/sql/vault.json#/pages/36/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c817fb197f233646cda62/`

## hansa-bank-345 — Levenshtein تقيس كلفة التعديل

sql / postgresql

**السؤال:** كيف تقارن نصين بعدد عمليات التحويل؟

**الخلاصة:** تقيس الدالة التعديلات من إدراج وحذف واستبدال؛ المسافة الأقل تعني قربًا أكبر.

**القيد:** القرب النصي لا يثبت أن السجلين للكيان نفسه.

**الدليل المحلي:** أنواع التعديل: Insertion, Deletion, Substitution

المصدر: `content/sql/vault.json#/pages/36/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c817fb197f233646cda62/`

## hansa-bank-346 — اتجاه درجة التشابه مهم

sql / postgresql

**السؤال:** هل ترتب Levenshtein وsimilarity بالطريقة نفسها؟

**الخلاصة:** الأقل أفضل للمسافة، بينما الأعلى أفضل لدرجة trigram similarity.

**القيد:** لا تستخدم ترتيبًا تنازليًا لكل مقياس بلا فهم دلالته.

**الدليل المحلي:** Higher similarity = More similar

المصدر: `content/sql/vault.json#/pages/36/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c817fb197f233646cda62/`

## hansa-bank-347 — الدالة الإضافية تحتاج امتدادها

sql / postgresql

**السؤال:** قبل استعمال fuzzystrmatch أو pg_trgm، ماذا تتحقق؟

**الخلاصة:** تأكد أن الامتداد اللازم مفعّل قبل استدعاء الدالة المرتبطة به.

**القيد:** هذه معلومة إعداد، وليست تنفيذ تثبيت أو موافقة عليه.

**الدليل المحلي:** لا تنس تفعيل الـ extension قبل استخدام الدالة.

المصدر: `content/sql/vault.json#/pages/36/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c817fb197f233646cda62/`

## hansa-bank-348 — ENUM يربط النوع بقيم مضبوطة

sql / postgresql

**السؤال:** تحتاج حالات عمل محددة في نوع عمود؛ ما المثال المحلي؟

**الخلاصة:** يعرض المصدر CREATE TYPE لتعريف ENUM ثم استخدامه كنوع عمود.

**القيد:** اختره عندما تلائمك قيود وتغييرات مجموعة القيم.

**الدليل المحلي:** ENUM تتحكم قيمه القاعدة

المصدر: `content/sql/vault.json#/pages/37/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c8162bcafeddf74477d61/`

## hansa-bank-349 — اسم النوع المخصص جزء من الاستكشاف

sql / postgresql

**السؤال:** كيف تتعرف على نوع غير مألوف لعمود؟

**الخلاصة:** يمكن فحص data_type وudt_name ضمن information_schema.columns في المثال.

**القيد:** لا تستنتج معنى النوع من اسم العمود وحده.

**الدليل المحلي:** SELECT column_name, data_type, udt_name

المصدر: `content/sql/vault.json#/pages/37/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c8162bcafeddf74477d61/`

## hansa-bank-350 — الدالة المخصصة تحزم المنطق

sql / postgresql

**السؤال:** متى يفيد CREATE FUNCTION في المثال؟

**الخلاصة:** يحزم منطق قاعدة البيانات لإعادة استعماله بدل إعادة كتابة الحساب في كل موضع.

**القيد:** حدد عقد المدخلات والنتيجة قبل إعادة الاستخدام.

**الدليل المحلي:** package reusable database logic

المصدر: `content/sql/vault.json#/pages/37/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c8162bcafeddf74477d61/`

## hansa-bank-351 — القسمة الصحيحة قد تفقد الكسر

sql / types-null

**السؤال:** لماذا تختلف 10 / 4 عن 10 / 4.0 في مثال PostgreSQL؟

**الخلاصة:** المعاملان الصحيحان ينتجان 2، بينما إدخال معامل عشري يعطي 2.5 في المثال.

**القيد:** اضبط الأنواع قبل حساب النسب.

**الدليل المحلي:** مع integer operands، النتيجة تكون integer

المصدر: `content/sql/vault.json#/pages/18/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81ad85a0fc24bb55d32c/`

## hansa-bank-352 — CAST في SELECT لا يغير المخطط

sql / types-null

**السؤال:** حوّلت العمود في نتيجة استعلام؛ هل تغير تعريفه في الجدول؟

**الخلاصة:** التحويل هنا يغير نوع التمثيل في الاستعلام الحالي، وليس schema العمود الأصلي.

**القيد:** تغيير المخطط عملية مختلفة يجب تمييزها.

**الدليل المحلي:** لا يغير schema الأصلي للعمود.

المصدر: `content/sql/vault.json#/pages/18/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81ad85a0fc24bb55d32c/`

## hansa-bank-353 — المعرف الآلي ليس مرادفًا لـserial

sql / types-null

**السؤال:** هل كل عمود يولد ID تلقائيًا لا بد أن يكون serial؟

**الخلاصة:** يذكر المصدر serial التقليدي ووجود identity columns، ويطلب الفصل بين المفهوم والصياغة المحددة.

**القيد:** راجع آلية العمود الفعلية في مخططك.

**الدليل المحلي:** لا تخلط بين مفهوم auto-generated ID

المصدر: `content/sql/vault.json#/pages/18/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81ad85a0fc24bb55d32c/`

## hansa-bank-354 — رقم مخزن لا يعني كمية قابلة للمتوسط

sql / analytics

**السؤال:** هل AVG لرمز منطقة أو قسم يعطي معلومة مفيدة؟

**الخلاصة:** نوع INTEGER لا يمنح الرمز معنى كميًا؛ المعنى التحليلي يأتي من دلالة المتغير.

**القيد:** راجع قاموس البيانات قبل إجراء الحسابات.

**الدليل المحلي:** INTEGER ≠ automatically measurable quantity

المصدر: `content/sql/vault.json#/pages/25/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

## hansa-bank-355 — قرّب الناتج في المرحلة المقصودة

sql / analytics

**السؤال:** هل تقريب كل صف قبل التجميع يعادل تقريب الإجمالي؟

**الخلاصة:** يوصي المرجع عادة بالتجميع أولًا ثم التقريب، ما لم تتطلب قاعدة العمل غير ذلك.

**القيد:** حدد قاعدة التقريب صراحة عندما تؤثر على النتيجة.

**الدليل المحلي:** اعمل aggregation ثم round للناتج

المصدر: `content/sql/vault.json#/pages/25/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

## hansa-bank-356 — تباين المجتمع غير تباين العينة

sql / analytics

**السؤال:** لماذا يعرض المرجع VAR_POP وVAR_SAMP منفصلتين؟

**الخلاصة:** تختلف صيغة القسمة بين N للمجتمع وN−1 للعينة في وصف المصدر.

**القيد:** اختر الصيغة التي تطابق غرض البيانات، لا اسمًا مألوفًا فقط.

**الدليل المحلي:** Sample variance: <code>Σ(x - x̄)² / (N - 1)</code>

المصدر: `content/sql/vault.json#/pages/25/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

## hansa-bank-357 — Percentile قد تكون قيمة مستوفاة

sql / analytics

**السؤال:** هل يجب أن تكون نتيجة percentile موجودة حرفيًا ضمن المشاهدات؟

**الخلاصة:** PERCENTILE_DISC تختار قيمة موجودة، بينما PERCENTILE_CONT قد تستخدم interpolation.

**القيد:** لا تفترض تطابق النتائج بين طرق حساب percentiles المختلفة.

**الدليل المحلي:** ممكن تعمل interpolation وترجع value مش موجودة أصلًا.

المصدر: `content/sql/vault.json#/pages/25/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

## hansa-bank-358 — الرقم الخاص قد يعني مفقودًا

sql / analytics

**السؤال:** رأيت 99 أو -99 في عمود قياس؛ هل تعتمدها كقياسات حقيقية؟

**الخلاصة:** قد تمثل أكوادًا للقيم المفقودة أو غير المنطبقة؛ ارجع إلى قاموس البيانات.

**القيد:** لا تحذفها أو تعيد تفسيرها دون تعريف موثق.

**الدليل المحلي:** Always check the data dictionary/documentation.

المصدر: `content/sql/vault.json#/pages/25/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

## hansa-bank-359 — الفئة الخالية يجب ألا تختفي

sql / analytics

**السؤال:** أنشأت bins وتريد إظهار صفر للمجموعة الخالية؛ ما النمط؟

**الخلاصة:** يحفظ LEFT JOIN قائمة الفئات، ويعد COUNT لعمود المشاهدة بدل COUNT(*) في المثال.

**القيد:** تأكد أن غياب المشاهدات يعني صفرًا في سياق القياس.

**الدليل المحلي:** للحفاظ على كل الـ bins حتى لو لم يقع فيها أي observation

المصدر: `content/sql/vault.json#/pages/25/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

## hansa-bank-360 — CORR يستخدم الأزواج المتاحة

sql / analytics

**السؤال:** هل الصف الذي يفتقد أحد المتغيرين يدخل الارتباط في المثال؟

**الخلاصة:** يذكر المرجع استبعاد الصفوف ذات NULL في أي من المتغيرين من الحساب.

**القيد:** افحص أثر الفقد على المجتمع المتبقي قبل تفسير الارتباط.

**الدليل المحلي:** الصفوف اللي فيها <code>NULL</code> في أي متغير بتتستبعد من الحساب.

المصدر: `content/sql/vault.json#/pages/25/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

## hansa-bank-361 — TRUNC لا تقرّب لأقرب قيمة

sql / analytics

**السؤال:** كيف تختلف TRUNC عن ROUND عند تقليل المنازل؟

**الخلاصة:** تحذف TRUNC الدقة في المنازل الأدنى بدل التقريب، كما يوضح المثال 42.1256 إلى 42.12.

**القيد:** راجع موضع القطع المطلوب واتجاه القيم.

**الدليل المحلي:** TRUNC(42.1256, 2) → 42.12

المصدر: `content/sql/vault.json#/pages/25/body`

مسار التعلم: `/learn/sql/reference/3ce3906c5d6c81d5b73dc71a90b87cfd/`

## hansa-bank-362 — ROLLUP ينتج تسلسل مجاميع

sql / aggregation

**السؤال:** ماذا تضيف ROLLUP(A,B,C) إلى التجميع التفصيلي؟

**الخلاصة:** تنتج مستويات ABC ثم AB ثم A ثم الإجمالي العام في التسلسل المعروض.

**القيد:** اختر ترتيبًا يعكس hierarchy المطلوبة.

**الدليل المحلي:** A + B + C

المصدر: `content/sql/vault.json#/pages/51/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

## hansa-bank-363 — تبديل ترتيب ROLLUP يبدل المجموع الفرعي

sql / aggregation

**السؤال:** هل ROLLUP(country,medal) مثل عكس العمودين؟

**الخلاصة:** الأولى تنتج مجموعًا فرعيًا للدولة في المثال، والثانية للميدالية.

**القيد:** ترتيب الحقول جزء من معنى النتيجة.

**الدليل المحلي:** ترتيب الأعمدة مهم جدًا.

المصدر: `content/sql/vault.json#/pages/51/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

## hansa-bank-364 — CUBE توسّع تركيبات التجميع

sql / aggregation

**السؤال:** تحتاج إجماليات لكل بُعد وتركيباته؛ ماذا تختلف عن ROLLUP؟

**الخلاصة:** CUBE تنتج كل تركيبات grouping المعنية، بدل تسلسل هرمي واحد.

**القيد:** تأكد أن المستويات المطلوبة مفيدة وقابلة للقراءة.

**الدليل المحلي:** ويولد كل الـ grouping combinations.

المصدر: `content/sql/vault.json#/pages/51/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

## hansa-bank-365 — NULL التجميع قد يمثل إجماليًا

sql / aggregation

**السؤال:** ظهر NULL في عمود بمخرجات ROLLUP؛ هل هو دائمًا فقد في المصدر؟

**الخلاصة:** قد يمثل صفًا للمجموع الفرعي أو الإجمالي في سياق التجميع المعروض.

**القيد:** ميّز صفوف الإجمالي عن NULL الأصلية قبل وضع تسمية بديلة.

**الدليل المحلي:** Total for all medals within China.

المصدر: `content/sql/vault.json#/pages/51/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

## hansa-bank-366 — ترتيب STRING_AGG داخلي

sql / aggregation

**السؤال:** تحتاج قائمة أسماء بترتيب محدد داخل كل خلية؛ أين تصرح به؟

**الخلاصة:** حدد ORDER BY داخل STRING_AGG بدل افتراض أن ترتيب النصوص سيأتي كما تريد.

**القيد:** راجع كسر التعادل إذا لزم ترتيب محدد تمامًا.

**الدليل المحلي:** إذا كان ترتيب القيم مهمًا، حدده داخل

المصدر: `content/sql/vault.json#/pages/51/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81a79c56d4bb581dfc02/`

## hansa-bank-367 — حدود الصفحة تبدأ من حجمها ورقمها

sql / windows

**السؤال:** حجم الصفحة 20 ورقمها 3؛ ما صفوفها في المثال؟

**الخلاصة:** الحدان هما 41 و60 وفق صيغة بداية الصفحة ونهايتها.

**القيد:** يتطلب التطبيق ترتيبًا محددًا للصفوف.

**الدليل المحلي:** إذن page 3 = rows

المصدر: `content/sql/vault.json#/pages/50/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c815a8811cf0645e13383/`

## hansa-bank-368 — Pivot يغير توزيع العرض

sql / windows

**السؤال:** عند تحويل السنوات إلى أعمدة، ماذا يبقى صفًا وماذا يصبح قيمة؟

**الخلاصة:** في المثال تبقى الدولة مفتاح صف، وتصبح السنة عمودًا، وتوضع الجوائز داخل الخلايا.

**القيد:** حدد كيفية التعامل مع تكرار مفتاح الصف والسنة قبل pivot.

**الدليل المحلي:** Pivoting = تحويل القيم الموجودة في Rows إلى Columns

المصدر: `content/sql/vault.json#/pages/50/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c815a8811cf0645e13383/`

## hansa-bank-369 — CROSSTAB مرتبطة بامتداد

sql / windows

**السؤال:** ما الاعتماد المذكور لعمل pivot بـcrosstab في PostgreSQL؟

**الخلاصة:** يستخدم المثال crosstab من امتداد tablefunc.

**القيد:** تحقق من التفعيل وبنية الأعمدة المتوقعة قبل استخدام المثال.

**الدليل المحلي:** extension اسمها <code>tablefunc</code>

المصدر: `content/sql/vault.json#/pages/50/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c815a8811cf0645e13383/`

## hansa-bank-370 — الإطار السابق يشمل الصف الحالي إذا طلبته

sql / windows

**السؤال:** كم صفًا قد يشمل ROWS BETWEEN 3 PRECEDING AND CURRENT ROW؟

**الخلاصة:** حتى أربعة صفوف: الحالي وثلاثة قبله عندما تتوفر.

**القيد:** لا تفترض اكتمال الإطار عند بداية المجموعة.

**الدليل المحلي:** حتى 4 صفوف عندما تكون متاحة.

المصدر: `content/sql/vault.json#/pages/48/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

## hansa-bank-371 — ROWS وRANGE يتعاملان مع التعادل بشكل مختلف

sql / windows

**السؤال:** تكرر مفتاح الترتيب؛ هل كل نافذة تحسب الصفوف بالطريقة نفسها؟

**الخلاصة:** ROWS تتعامل مع الصفوف منفصلة، بينما RANGE تتعامل مع قيم الترتيب المتساوية كـpeers في سياقها.

**القيد:** اختر الإطار بحسب عدد الصفوف أو قيم الترتيب المطلوبة.

**الدليل المحلي:** يتعامل مع الصفوف كصفوف منفصلة

المصدر: `content/sql/vault.json#/pages/48/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

## hansa-bank-372 — بداية Moving Average قد تحتوي صفوفًا أقل

sql / windows

**السؤال:** لماذا يبدأ متوسط ثلاثي الصفوف في المثال بـ10 ثم15؟

**الخلاصة:** عند البداية يحسب المتوسط من الصفوف المتاحة، قبل اكتمال ثلاثة صفوف في الإطار.

**القيد:** إذا احتجت نافذة مكتملة فحدد ذلك في منطق النتيجة.

**الدليل المحلي:** الصف 2 → <code>(10+20)/2 = 15</code>

المصدر: `content/sql/vault.json#/pages/48/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

## hansa-bank-373 — الإجمالي التراكمي يعاد داخل كل Partition

sql / windows

**السؤال:** تتابع دولًا متعددة؛ هل يستمر running total من دولة لأخرى؟

**الخلاصة:** مع PARTITION BY country يبدأ الحساب من جديد لكل دولة في المثال.

**القيد:** راجع أن مفتاح المجموعة يعكس الكيان المطلوب.

**الدليل المحلي:** الـ running total يبدأ من جديد لكل

المصدر: `content/sql/vault.json#/pages/48/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81d88f2bd727b2001a91/`

## hansa-bank-374 — ترتيب الحساب غير ترتيب العرض

sql / windows

**السؤال:** هل ORDER BY داخل OVER يضمن ترتيب الصفوف النهائي؟

**الخلاصة:** الداخلي يحدد حساب النافذة، والخارجي يحدد عرض النتيجة النهائية.

**القيد:** صرح بالترتيبين إذا كان لكل منهما غرض مختلف.

**الدليل المحلي:** ترتيب ظهور النتيجة النهائية

المصدر: `content/sql/vault.json#/pages/45/body`

مسار التعلم: `/learn/sql/reference/3cb3906c5d6c81aabba5cb36a17c548f/`

## hansa-bank-375 — ابدأ السلسلة الشهرية من بداية الفترة

sql / time

**السؤال:** لماذا يحذر المصدر من بدء توليد الشهور من يوم31؟

**الخلاصة:** قد تنزلق الأيام عند الشهور الأقصر؛ ولّد بدايات ثابتة ثم اشتق النهايات.

**القيد:** اختبر حدود التقويم المستخدم.

**الدليل المحلي:** ولّد من بدايات فترات ثابتة، واشتق نهايات الفترات بعد كده.

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-376 — الفترة نصف المفتوحة تمنع ازدواج الحد

sql / time

**السؤال:** حدث يقع تمامًا عند حد فترتين؛ كيف تمنع عده مرتين؟

**الخلاصة:** استخدم حدًا أدنى شاملًا وحدًا أعلى غير شامل في النمط المعروض.

**القيد:** استخدم الحدود نفسها في كل الفترات المجاورة.

**الدليل المحلي:** بتمنع القيم على الحد الفاصل من إنها تتحسب في bin-ين.

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-377 — احسب الفجوات ثم متوسطها

sql / time

**السؤال:** تحتاج متوسط الزمن بين الأحداث؛ لماذا تستخدم مرحلتين؟

**الخلاصة:** احسب الفارق باستخدام LAG في نتيجة وسيطة ثم طبّق AVG عليها.

**القيد:** لا تنفذ window function داخل aggregate بالمستوى نفسه في النمط المحذر منه.

**الدليل المحلي:** بدل من كده استخدم مرحلتين منطقيتين:

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-378 — رقم يوم الأسبوع يحتاج تعريفًا

sql / time

**السؤال:** هل Sunday يساوي1 في كل حقول التاريخ؟

**الخلاصة:** يوضح مصدر PostgreSQL أن DOW يستخدم Sunday=0 وSaturday=6.

**القيد:** لا تعمم التعريف على ISODOW أو لغات ومحركات أخرى.

**الدليل المحلي:** Sunday = 0

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-379 — الإزاحة عدد صفوف لا اسم فترة

sql / time

**السؤال:** ماذا تعني LAG(value,2) في المثال؟

**الخلاصة:** تأتي بالقيمة من صفين سابقين وفق ترتيب النافذة.

**القيد:** لا تفترض أنهما يومان إذا كانت الصفوف متباعدة زمنيًا.

**الدليل المحلي:** صفين للخلف:

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-380 — LEAD ينظر إلى الحدث التالي

sql / time

**السؤال:** متى تحتاج LEAD بدل LAG؟

**الخلاصة:** عندما يكون السؤال عن قيمة صف لاحق في التسلسل المرتب، لا السابق.

**القيد:** حدد ترتيب الأحداث والمجموعة قبل الحساب.

**الدليل المحلي:** بترجع قيمة من الصف التالي.

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-381 — مدة التذكرة فرق وقتين

sql / time

**السؤال:** كيف يصوغ مثال SLA مدة حل تذكرة؟

**الخلاصة:** يطرح created_at من resolved_at ثم يمكن تلخيص مدد الحل.

**القيد:** راجع التذاكر غير المحلولة وأنواع التوقيت قبل التعميم.

**الدليل المحلي:** resolved_at - created_at AS resolution_time

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-382 — الرقم الشهري المتجمع قد يخلط السنوات عمدًا

sql / time

**السؤال:** عند GROUP BY EXTRACT(MONTH)، ما نوع المقارنة المعروضة؟

**الخلاصة:** يجمع مبيعات الشهر نفسه عبر السنوات للإجابة عن مقارنة مثل يناير ومارس.

**القيد:** إذا أردت تسلسل كل شهر وسنته، فاحتفظ بهوية الفترة كاملة.

**الدليل المحلي:** هل مبيعات يناير عادةً أعلى من مبيعات مارس؟

المصدر: `content/sql/vault.json#/pages/10/body`

مسار التعلم: `/learn/sql/10/`

## hansa-bank-383 — SQL تصف النتيجة للمحرك

sql / foundations

**السؤال:** هل تكتب في SQL الخطة الفيزيائية خطوة بخطوة؟

**الخلاصة:** هي لغة declarative تصف النتيجة المطلوبة، ويختار optimizer كيفية تنفيذها.

**القيد:** يبقى فهم الخطة مهمًا عند تشخيص الأداء.

**الدليل المحلي:** you describe the result you want

المصدر: `content/sql/vault.json#/pages/1/body`

مسار التعلم: `/learn/sql/01/`

## hansa-bank-384 — ترتيب التخزين ليس ضمان ترتيب النتيجة

sql / foundations

**السؤال:** ظهرت الصفوف مرتبة مرة؛ هل تضمن الترتيب في الاستعلام التالي؟

**الخلاصة:** لا يضمن result set ترتيبًا ذا معنى دون ORDER BY.

**القيد:** لا تعتمد على ترتيب الإدخال أو التخزين كعقد عرض.

**الدليل المحلي:** A result set is not guaranteed to have a meaningful order

المصدر: `content/sql/vault.json#/pages/1/body`

مسار التعلم: `/learn/sql/01/`

## hansa-bank-385 — Alias ليست عمودًا مخزنًا لحظيًا

sql / foundations

**السؤال:** هل تستخدم alias محسوبة في تعبير آخر بالقائمة نفسها بلا تحقق؟

**الخلاصة:** الرؤية تعتمد على اللهجة والمرحلة؛ استخدم نتيجة وسيطة عندما يصبح الحساب مدخلًا لحساب آخر.

**القيد:** لا تفترض أن الاسم تحقق كعمود materialized.

**الدليل المحلي:** as though it were an already-materialized column.

المصدر: `content/sql/vault.json#/pages/1/body`

مسار التعلم: `/learn/sql/01/`

## hansa-bank-386 — DISTINCT يعمل على الأعمدة المختارة

sql / foundations

**السؤال:** إذا غيرت SELECT، هل قد يتغير ما يعد صفًا مكررًا؟

**الخلاصة:** DISTINCT يزيل التكرار من projection المختارة، لا يحدد تلقائيًا هوية كيان العمل.

**القيد:** لا تستخدمه لإخفاء ربط خاطئ.

**الدليل المحلي:** removes duplicate rows from the selected projection.

المصدر: `content/sql/vault.json#/pages/1/body`

مسار التعلم: `/learn/sql/01/`

## hansa-bank-387 — Candidate key ليست بالضرورة عمودًا منفردًا

sql / foundations

**السؤال:** ما الذي يجعل مجموعة أعمدة مرشحة للتعريف الفريد؟

**الخلاصة:** هي مجموعة دنيا من الأعمدة يمكن أن تقوم بدور معرف فريد.

**القيد:** افحص التفرد الفعلي ومعنى المجموعة قبل اعتمادها.

**الدليل المحلي:** any minimal column set that could serve as a unique identifier.

المصدر: `content/sql/vault.json#/pages/1/body`

مسار التعلم: `/learn/sql/01/`

## hansa-bank-388 — توافق UNION يشمل شكل الأعمدة

sql / sets

**السؤال:** هل يمكن تكديس أي نتيجتين لهما أسماء متشابهة؟

**الخلاصة:** يجب توافق عدد الأعمدة وأنواع الأعمدة المناظرة في عبارات SELECT.

**القيد:** توافق النوع وحده لا يضمن توافق المعنى.

**الدليل المحلي:** compatible numbers and types of columns.

المصدر: `content/sql/vault.json#/pages/8/body`

مسار التعلم: `/learn/sql/08/`

## hansa-bank-389 — أسماء مخرجات Set operation لها مصدر

sql / sets

**السؤال:** من أين تؤخذ أسماء الأعمدة في النمط المذكور؟

**الخلاصة:** من الاستعلام الأول في عملية المجموعات.

**القيد:** رتب العرض والتسمية بوضوح في الاستعلام الأول.

**الدليل المحلي:** Column names are taken from the first query

المصدر: `content/sql/vault.json#/pages/8/body`

مسار التعلم: `/learn/sql/08/`

## hansa-bank-390 — INTERSECT للمجتمع المشترك

sql / sets

**السؤال:** تبحث عن سجلات موجودة في مجموعتين؛ ما العملية المباشرة؟

**الخلاصة:** INTERSECT تعيد الصفوف الموجودة في النتيجتين.

**القيد:** حدد الأعمدة التي تمثل المطابقة المطلوبة.

**الدليل المحلي:** Returns rows present in both result sets.

المصدر: `content/sql/vault.json#/pages/8/body`

مسار التعلم: `/learn/sql/08/`

## hansa-bank-391 — EXCEPT عملية اتجاهية

sql / sets

**السؤال:** هل فرق A عنB مثل فرق B عنA؟

**الخلاصة:** EXCEPT تعيد ما يوجد في النتيجة الأولى ويغيب من الثانية، فالترتيب يحدد السؤال.

**القيد:** سمِّ مصدر المقارنة والمرجع بوضوح.

**الدليل المحلي:** present in the first result set but absent from the second.

المصدر: `content/sql/vault.json#/pages/8/body`

مسار التعلم: `/learn/sql/08/`

## hansa-bank-392 — الأعمدة المتوافقة قد تكون بمعانٍ مختلفة

sql / sets

**السؤال:** عمودان رقميان يمران من فحص النوع؛ هل يكفي لتكديسهما؟

**الخلاصة:** يحذر المرجع من اختلاف معنى الأعمدة رغم توافق أنواعها.

**القيد:** راجع الوحدات والتعريفات وترتيب الحقول.

**الدليل المحلي:** mismatched column meaning despite compatible data types

المصدر: `content/sql/vault.json#/pages/8/body`

مسار التعلم: `/learn/sql/08/`

## hansa-bank-393 — عد الكيانات غير عد المعاملات

sql / aggregation

**السؤال:** تريد عدد العملاء الذين طلبوا؛ هل COUNT(*) على الطلبات يكفي؟

**الخلاصة:** COUNT(DISTINCT customer_id) يجيب عن العملاء الفريدين بدل عدد صفوف الطلبات.

**القيد:** حدد هل المعرّف متاح وصحيح قبل العد.

**الدليل المحلي:** Do not confuse row count with entity count.

المصدر: `content/sql/vault.json#/pages/6/body`

مسار التعلم: `/learn/sql/06/`

## hansa-bank-394 — بعض المقاييس لا تجمع عبر الزمن

sql / aggregation

**السؤال:** هل تجمع رصيد المخزون اليومي كأن كل يوم معاملة جديدة؟

**الخلاصة:** بعض الأرصدة semi-additive؛ تحتاج منطق snapshot أو نهاية فترة بدل جمعها عبر الزمن.

**القيد:** راجع قابلية الجمع لكل بُعد.

**الدليل المحلي:** inventory balance often should use an end-of-period or snapshot logic

المصدر: `content/sql/vault.json#/pages/6/body`

مسار التعلم: `/learn/sql/06/`

## hansa-bank-395 — كل تعبير يحتاج معنى واحدًا داخل المجموعة

sql / aggregation

**السؤال:** لماذا لا تختار صفة غير مجمعة عشوائيًا بجوار SUM؟

**الخلاصة:** يجب أن تكون لكل صف ناتج قيمة غير ملتبسة لكل تعبير مختار.

**القيد:** قواعد الاعتماد الوظيفي تختلف حسب اللهجة.

**الدليل المحلي:** Every output row must have an unambiguous value for every selected expression.

المصدر: `content/sql/vault.json#/pages/6/body`

مسار التعلم: `/learn/sql/06/`

## hansa-bank-396 — GROUPING SETS تختار المستويات صراحة

sql / aggregation

**السؤال:** تحتاج مجموعات تجميع محددة دون كل التركيبات؛ ماذا يوفر المرجع؟

**الخلاصة:** GROUPING SETS تصرح بمستويات التجميع المطلوبة.

**القيد:** راجع المستويات كي لا تحسب إجماليات غير مقصودة.

**الدليل المحلي:** explicitly requested grouping levels.

المصدر: `content/sql/vault.json#/pages/6/body`

مسار التعلم: `/learn/sql/06/`

## hansa-bank-397 — NOT IN مع NULL يحتاج انتباهًا

sql / types-null

**السؤال:** لماذا قد يفاجئك استبعاد قيم باستعلام يعيد NULL؟

**الخلاصة:** قد تنتج NOT IN نتائج غير متوقعة؛ عندما يكون السؤال عن غياب العلاقة يكون NOT EXISTS أوضح وأأمن في الحالات المشار إليها.

**القيد:** لا تبدل الصياغة دون مطابقة معنى المقارنة والـNULL.

**الدليل المحلي:** NOT IN</code> can produce surprising results when its subquery contains NULL.

المصدر: `content/sql/vault.json#/pages/3/body`

مسار التعلم: `/learn/sql/03/`
