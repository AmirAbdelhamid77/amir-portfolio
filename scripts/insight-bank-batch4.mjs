// Fourth editorial batch: local excerpts, no publication authority.
export const batch4=[];
group('viz:ar-box-plot','distribution',`
حدود الصندوق ليست أقل وأكبر قيمة|هل طرفا الصندوق هما أصغر وأكبر مشاهدة؟|يمتد الصندوق من Q1 إلى Q3 ويصف النصف الأوسط من المشاهدات.|الشوارب والنقاط الخارجية تحمل معلومات إضافية خارج الصندوق.|الصندوق: من Q1 إلى Q3، ويحتوي على منتصف 50% من المشاهدات.
الشوارب تتبع قاعدة معلنة|هل يصل الشارب دائمًا إلى أكبر قيمة؟|في القاعدة الشائعة يصل الشارب لأبعد مشاهدة داخل حد 1.5 × IQR من الربيع، وقد تظهر قيم أبعد كنقاط منفصلة.|راجع إعداد الأداة؛ تعريف الشوارب قد يختلف بين التطبيقات.|مع اختلافات ممكنة بين التطبيقات.
نقطة خارج الشارب تستحق الفحص|هل تحذف نقطة لأنها خارج شوارب Box Plot؟|النقاط خارج الشوارب مرشحات لقيم شاذة وفق قاعدة العرض، وليست حكمًا على صحة التسجيل.|افحص سياق المشاهدة قبل اتخاذ قرار بشأنها.|النقاط بعد الشوارب: غالبًا تُعرض كقيم شاذة محتملة وفق القاعدة المستخدمة.
الربيعان لهما معنى مئيني|ماذا يمثل Q1 وQ3 في ملخص التوزيع؟|Q1 يمثل المئين 25 وQ3 يمثل المئين 75؛ حدود الصندوق مواقع في ترتيب القيم.|قد تختلف طرق حساب المئينات بين التطبيقات.|Q1 — الربيع الأول: المئين الخامس والعشرون.
صندوق لكل مجموعة|تريد مقارنة توزيع متغير مستمر بين عدة فئات؛ كيف تقلل تداخل الرسوم؟|Box Plot يضغط توزيع كل مجموعة في ملخص صغير يسمح بالمقارنة بين الفئات.|الضغط يفقد بعض تفاصيل شكل التوزيع، فارجع للرسم التفصيلي عند الحاجة.|التداخل بينها يصنع فوضى بصرية، بينما يضغط الـBox Plot توزيع كل مجموعة في ملخص إحصائي صغير.
`);
group('viz:ar-color','accessibility',`
لون الشاشة ولون الطباعة|هل تمثيل اللون في الشاشة والطباعة واحد؟|المصدر يميز RGB الشائع للشاشات عن CMYK الشائع للطباعة؛ وسيط العرض جزء من قرار اللون.|هذا تمييز بين تمثيلات اللون، وليس ضمانًا لتطابق المظهر بين الوسائط.|CMYK: شائع في الطباعة ويتوافق مع قنوات الحبر.
عائلة اللون غير شدته|هل تغيير Hue هو نفسه زيادة التشبع؟|في HCL يصف Hue عائلة اللون، بينما Chroma يصف شدته أو تشبعه.|لا تخلط اختلاف الفئة اللونية بزيادة مقدار مرتب.|Chroma: شدة أو تشبع اللون.
السطوع بُعد مستقل في HCL|ما الخاصية التي تصف السطوع المدرك في HCL؟|Luminance يصف السطوع المدرك، وهو مختلف عن عائلة اللون وشدة تشبعه.|وجود لون صحيح تقنيًا لا يثبت وضوح الرسالة البصرية.|Luminance: درجة السطوع المدركة.
صحة كود اللون لا تكفي|اخترت ألوانًا صالحة تقنيًا؛ هل انتهى تصميم الترميز؟|صلاحية تمثيل اللون لا تضمن جودة الترميز؛ يجب أن تتوافق اللوحة مع معنى البيانات.|اختبر التمييز والترتيب كما يراهما القارئ.|وجود تمثيل لوني صحيح تقنيًا لا يعني أنه ترميز بصري جيد.
`);
group('viz:foundations','foundations',`
الرسم والنموذج والملخص يكملون بعضهم|هل تختار بين الرسم والإحصاء كبديلين متنافسين؟|الملخص العددي والنموذج الإحصائي والرسم طرق متكاملة لفهم البيانات، ولكل منها ما يظهره.|لا تجعل أحدها يغطي وحده كل أسئلة التحليل.|These approaches are complementary rather than competing.
العمر قد يغيّر نوعه التحليلي|تعرض العمر مرة كقيمة دقيقة ومرة كفئة؛ هل هذا تناقض؟|يمكن التعامل مع العمر كمتغير مستمر أو تقسيمه إلى فئات عمرية بحسب السؤال.|حدد المعالجة المستخدمة قبل اختيار الرسم.|Age: continuous as an exact number; categorical when grouped into age bands.
الشهور قد تكون فئات للمقارنة|هل وجود حقل زمني يفرض معالجة مستمرة دائمًا؟|قد يعالج الزمن كتتابع لدراسة سلسلة، أو كفترات مسماة عند مقارنة مجموعات منفصلة.|حدد هل السؤال عن التطور أم عن مقارنة فترات.|Time: continuous/ordered when studying a time series; categorical when comparing named months or reporting periods as discrete groups.
`);
group('viz:core-chart-types','distribution',`
اقرأ وحدة المحور الرأسي للهستوجرام|هل ارتفاع عمود Histogram هو عدد المشاهدات دائمًا؟|قد يعرض المحور الرأسي عددًا أو كثافة أو كمية مطبعة؛ تفسير الارتفاع يبدأ بقراءة وحدته.|لا تقارن ارتفاعات بوحدات مختلفة كأنها أعداد خام.|Y-axis: usually count; depending on the implementation it can also represent density or another normalized quantity.
قمم متعددة تفتح سؤالًا عن المجموعات|ماذا تفحص عندما ترى أكثر من قمة بارزة؟|تعدد القمم قد يشير إلى مجموعات فرعية مختلفة أو مزيج من العمليات.|هذا احتمال للفحص وليس إثباتًا لسبب بعينه.|Multiple modes can suggest heterogeneous subpopulations or a mixture of processes.
ثبّت تعريف الصناديق عند المقارنة|هل يكفي وضع Histogramين جنبًا إلى جنب؟|اختلاف حدود الفترات أو المقاييس قد يجعل المقارنة مضللة؛ راجع اتساقهما قبل تفسير الفروق.|اذكر أي اختلاف مقصود في التطبيع أو المقياس.|Comparing histograms with incompatible scales or bin definitions.
الفئات ليست فترات Histogram|عند مقارنة أقسام الشركة، هل تجعل كل قسم bin؟|Histogram يجمع قيمًا مستمرة في فترات عددية؛ الفئات المنفصلة مع مؤشر تلائم Bar Plot.|تشابه الأعمدة شكليًا لا يجعل السؤال التحليلي واحدًا.|Histogram bins represent adjacent numeric intervals; bar categories are discrete groups.
متوسط المجموعة لا يعرض توزيعها|هل عمود متوسط الراتب يكشف اختلاف الرواتب داخل القسم؟|Bar Plot يعرض عادة مؤشرًا ملخصًا، بينما Box Plot يعرض ملخص توزيع مشاهدات كل فئة.|اختر نوع العرض وفق سؤال المقارنة لا وفق التشابه البصري.|Average salary by department → Bar plot. Distribution of salaries within each department → Box plot.
`);
group('viz:core-chart-types','relationships',`
اتساع السحابة قد يتغير|هل تفحص اتجاه العلاقة فقط في Scatter Plot؟|افحص أيضًا هل الانتشار الرأسي يتغير مع X؛ تغير التشتت جزء من شكل العلاقة.|الانطباع البصري يحتاج فحصًا إضافيًا قبل استنتاج نموذج إحصائي.|Changing variance: whether the vertical spread changes with X.
النقطة تمثل مشاهدة|قبل تفسير Scatter Plot، ما وحدة النقطة؟|في التوصيف الأساسي كل نقطة مشاهدة واحدة، وX متغير تفسيري وY متغير استجابة.|تسمية X تفسيريًا لا تثبت أنه سبب Y.|Each point = one observation.
الخط الملائم أداة تشخيص|هل الخط المستقيم الملائم يثبت أن العلاقة خطية؟|يساعد الخط على تقييم ملاءمة التقريب الخطي، وقد يكشف منحنى سلس نمطًا غير خطي منتظمًا.|الرسم الملائم وصف مساعد، وليس إثباتًا سببيًا.|A fitted straight line can help diagnose whether a linear model is a reasonable approximation.
اذكر أي محور حوّلته لوغاريتميًا|هل نفس تفسير الخط المستقيم يصلح لكل رسم لوغاريتمي؟|تفسير العلاقة يتغير بحسب تحويل Y وحده أو تحويل المتغيرين؛ اذكر المحاور المحولة بوضوح.|لا تستنتج نوع النمو من شكل الخط دون معرفة المقياس.|If both variables are transformed, interpretation changes accordingly; always state which axes are logged.
نقاط الفئات تختلف عن نقاط العلاقة|هل كل رسم بالنقاط هو Scatter Plot؟|Dot Plot يقارن مؤشرًا عدديًا عبر فئات؛ Scatter Plot يفحص علاقة بين متغيرين عدديين.|حدد دور كل محور قبل تسمية الرسم أو تفسيره.|Dot plot: category + numeric metric; compare category-level values.
`);
group('viz:core-chart-types','comparison',`
الأسماء الطويلة تستفيد من الأعمدة الأفقية|تتزاحم أسماء الفئات أسفل الأعمدة؛ ما التعديل المناسب؟|الأعمدة الأفقية غالبًا تسمح بقراءة أسماء الفئات الطويلة دون تدوير النص.|راجع المساحة وعدد الفئات في التصميم الفعلي.|Horizontal bars are often preferable when category labels are long, because they remain readable without rotating text.
أكثر من مؤشر في إطار نقطي واحد|كيف تعرض قيم مؤشرات متعددة للفئة نفسها؟|يمكن للعرض بالنقاط وضع قيم متعددة لكل فئة على إطار عددي مشترك.|يجب أن تكون المقارنة على الإطار المشترك ذات معنى وأن تظل هوية المؤشرات واضحة.|Dot-based displays can place multiple metric values for the same category on the same numeric framework
الصفر لا يظهر على محور لوغاريتمي عادي|لماذا لا يبدأ المحور اللوغاريتمي من الصفر؟|الصفر لا يملك موضعًا منتهيًا على محور لوغاريتمي؛ لذلك لا يمكن نقله إليه كما في محور خطي.|راجع طريقة الأداة في التعامل مع القيم غير القابلة للعرض.|A logarithmic axis cannot represent zero
`);
group('viz:accessibility-color-qa','accessibility',`
التباين يشمل العلامات والحالات|هل اختبار لون النص وحده كافٍ؟|اختبار التباين يشمل labels وgridlines وmarkers والحالات المهمة، وفي أكثر من وضع عرض.|وضوح النص لا يضمن وضوح باقي أجزاء الرسم.|اختبر النصوص، labels، gridlines، markers، وstates المهمة في أكثر من حالة عرض.
اختبار الرمادي يكشف فقدان المعنى|ماذا تختبر عند عرض الرسم بتدرج رمادي؟|راجع بقاء الرسالة الأساسية واضحة؛ اختفاء الفروق يكشف اعتمادًا زائدًا على Hue وحده.|اختبار الرمادي جزء من المراجعة وليس اختبار إتاحة كاملًا.|إذا اختفى الفرق بالكامل، فالاعتماد على hue وحده غالبًا مشكلة.
الإتاحة تشمل طريق القراءة والتنقل|هل لوحة جميلة بصريًا تعني أنها متاحة؟|تضم المراجعة ترتيب القراءة والتنقل بلوحة المفاتيح عندما ينطبق، مع وضوح التسميات والحالات.|اختبر سيناريوهات استخدام فعلية بدل الاكتفاء بانطباع الشكل.|keyboard/navigation behavior عندما ينطبق، labels، عدم الاعتماد على اللون فقط، وضوح states، وترتيب القراءة
`);
group('viz:core-chart-types','time',`
قارن المسارات عبر السلاسل|تريد رؤية اختلاف تطور مبيعات المناطق؛ ماذا تضيف السلاسل المتعددة؟|يمكن لعدة خطوط إظهار مسارات مجموعات مختلفة عبر الزمن في رسم واحد.|يجب أن تظل هوية كل سلسلة واضحة وأن تكون المشاهدات متتابعة بمعنى حقيقي.|Multiple series can be shown together to compare trajectories
`);
group('academy:power-bi:labs-03-configure-semantic-model','model',`
تكرار الإجمالي قد يكشف علاقة مفقودة|كل فئة تعرض نفس إجمالي المبيعات؛ ما الذي تفحصه؟|في تمرين النموذج، غياب العلاقة بين Product وSales منع مرشح الفئة من الوصول للمبيعات فظهر الإجمالي نفسه.|هذا تفسير الحالة في الدرس؛ افحص النموذج الفعلي قبل تعميم التشخيص.|because there isn't a model relationship between these tables, the \`Sales\` table isn't filtered.
تفرد المفتاح يفسر جهة الواحد|كيف تعرف لماذا اختار النموذج علاقة واحد إلى متعدد؟|في الدرس اكتشف Power BI تفرد ProductKey في جدول Product فاختار جهة الواحد لهذا الجدول.|راجع البيانات الفعلية ولا تعتمد على الاكتشاف التلقائي وحده.|the \`ProductKey\` column from the \`Product\` table contains unique values.
العلاقة غير النشطة لا تمرر المرشح تلقائيًا|ترى علاقة مرسومة لكن التصفية لا تسلكها؛ ما حالتها؟|العلاقة النشطة تمرر المرشحات؛ غير النشطة لا تمررها افتراضيًا ويمكن لحسابات خاصة استخدامها.|وجود خط بين جدولين وحده لا يكفي لوصف مسار التصفية.|Active relationships propagate filters.
اقرأ خط العلاقة نفسه|ما الفرق بين الخط المتصل والمتقطع في مخطط النموذج؟|الخط المتصل يمثل علاقة نشطة والمتقطع علاقة غير نشطة، والسهم يبين اتجاه التصفية.|راجع أيضًا رموز التعددية والأعمدة المرتبطة.|A solid line represents an active relationship; a dotted line represents an inactive relationship.
مجلد العرض تنظيم منطقي|هل نقل الحقول إلى Display Folder يغير البيانات؟|مجلدات العرض تنظم تقديم الحقول في النموذج، خصوصًا في الجداول كثيرة الأعمدة.|هي تنظيم للعرض وليست تحويلًا لقيم الجدول.|They're logical presentation only.
تصنيف الموقع يساعد الخريطة|لماذا تحدد Data Category لحقل الدولة؟|تصنيف الحقل كدولة أو منطقة يقدم معلومات أوضح للأداة عند رسم الخريطة.|تصنيف الحقل لا يغني عن مراجعة صحة قيم المواقع.|categorizing the column as country or region provides more accurate information to Power BI when it renders a map visualization.
وصف الحقل يظهر أثناء التأليف|كيف توضح معنى مقياس التكلفة لمؤلف التقرير؟|وصف الجدول أو العمود أو المقياس يظهر كتلميح عند المرور على الحقل في Data pane.|اكتب وصفًا يعبر عن تعريف الحساب لا مجرد تكرار اسمه.|description text is revealed in a tooltip when a report author hovers their cursor over the field.
التلخيص الافتراضي قد لا يناسب السعر|ماذا تراجع إذا ظهر مجموع لأسعار الوحدات؟|الدرس يغير Summarize By لسعر الوحدة من الجمع إلى المتوسط لأن الحقل يمثل سعرًا.|المتوسط البسيط ليس بالضرورة السعر المرجح المطلوب في كل تحليل.|This default behavior isn't suitable for a column like \`Unit Price\`, which represents a rate.
إخفاء المفاتيح ينظّم واجهة النموذج|هل كل عمود مستخدم في العلاقات يجب أن يراه مؤلف التقرير؟|يخفي التمرين مفاتيح وأعمدة مستخدمة في العلاقات والأمان والحسابات لتنظيم الحقول الظاهرة.|الإخفاء تنظيم للواجهة؛ لا تتعامل معه كبديل لضبط الوصول.|The columns were hidden because they're either used by relationships or will be used in row-level security configuration or calculation logic.
التاريخ التلقائي قد لا يطابق السنة المالية|سنتك المالية تبدأ في يوليو؛ هل تعتمد على Date Hierarchy التلقائي؟|في الدرس تبدأ السنة المالية في يوليو بينما تبدأ السنة في التسلسل التلقائي في يناير؛ يجب مواءمة تصميم التاريخ مع التقويم المطلوب.|راجع إعداد الملف وتقويم المؤسسة قبل بناء المقارنات.|But, in these automatically created date hierarchies, the date hierarchy year commences on January 1 of each year.
`);
group('academy:power-bi:labs-02-transform-data-power-bi','prepare',`
تعويض التكلفة المفقودة له قاعدة محددة|كيف عالج التمرين TotalProductCost المفقودة؟|استخدم عدد الوحدات مضروبًا في التكلفة القياسية عند غياب التكلفة، وأبقى القيمة الأصلية عندما كانت موجودة.|هذه قاعدة التمرين وليست مبررًا عامًا لتعويض كل قيمة مفقودة.|If missing, it produces a value by multiplying the **OrderQuantity** value by the **StandardCost** value; otherwise, it uses the existing **TotalProductCost** value.
أعمدة الشهور تتحول إلى صفوف|لديك M01 إلى M12 كأعمدة؛ كيف تصبح الشهور قابلة للتحليل كحقل؟|يستخدم التمرين Unpivot Other Columns مع تثبيت السنة والموظف، فتنتقل أسماء الأعمدة إلى Attribute وقيمها إلى Value.|راجع أعمدة الهوية التي يجب تثبيتها قبل التحويل.|Notice that the column names now appear in the **Attribute** column, and the values appear in the **Value** column.
الإعداد الإقليمي يغير قراءة التاريخ|هل 7/1/2017 يعني أول يوليو دائمًا؟|في بيئة التمرين الأمريكية يعني أول يوليو؛ قراءة النص كتاريخ تعتمد على الإعداد الإقليمي.|ثبت تفسير اليوم والشهر عند تحويل البيانات.|The virtual machine uses US regional settings, so this date is in fact July 1, 2017.
الأهداف بالألوف تحتاج تحويل الوحدة|لماذا ضُرب عمود Target في 1000؟|لأن المصدر خزّن الأهداف بوحدة الآلاف؛ التحويل يعيدها للوحدة المطلوبة للمقارنة.|لا تضرب تلقائيًا دون التحقق من وحدة المصدر.|You may recall that the target values were stored as thousands.
استعلام مساعد لا يلزم تحميله كجدول|لماذا عُطّل تحميل ColorFormats بعد الدمج؟|تم دمج بياناته في Product المحمل للنموذج، لذلك احتفظ التمرين بالاستعلام دون تحميل جدول مستقل له.|تعطيل التحميل لا يعني حذف الاستعلام المستخدم في التحويل.|Disabling the load means it will not load as a table to the data model.
خصوصية المصدر تخص تبادل البيانات بين المصادر|هل إعداد Private يعني أن التقرير نفسه ممنوع من المشاركة؟|شرح Power Query يربط مستويات الخصوصية بإمكان مشاركة البيانات بين المصادر أثناء المعالجة.|هذا الإعداد لا يحل محل صلاحيات مشاركة التقرير أو الوصول إليه.|it means that the Power Query engine can't share data between the sources.
`);
group('academy:power-bi:labs-07-create-visual-calculations','report',`
إجمالي المصفوفة له مستوى مختلف|لماذا كانت مقارنة Total Sales بأول قيمة تساوي صفرًا في المثال؟|الدرس يوضح أن الإجمالي يقع على مستوى هرمي مختلف عن السنوات، ويعد أول عمود على مستواه في هذا الحساب.|لا تفترض أن حساب الإجمالي يكرر حساب خلايا السنوات بالطريقة نفسها.|considered the first column on that level.
المقارنة بالسابق تتبع ترتيب العرض|ما الذي يسبق حساب Profit versus previous في التمرين؟|يرتب التمرين السنوات تصاعديًا ثم يقارن الربح بالقيمة السابقة؛ ترتيب الفترات جزء من معنى المقارنة.|راجع ترتيب المحور قبل تفسير السابق زمنيًا.|Sort the resulting bar chart by **Year** ascending
متوسط نافذتين يجمع فترتين متتاليتين|ما معنى WindowSize بقيمة 2 في مثال الأرباح السنوية؟|متوسط FY2019 المتحرك في المثال يحسب من أرباح FY2018 وFY2019.|هذا وصف لنافذة المثال؛ راجع سلوك الحدود والقيم المفقودة في التطبيق.|the moving average for FY2019 is the average of the profits for FY2018 and FY2019.
محور FIRST يحدد أول ماذا|لماذا تغيرت المقارنة بعد استبدال ROWS بـCOLUMNS؟|في مصفوفة الفئات والسنوات، COLUMNS جعل المقارنة مقابل السنة المالية الأولى بدل الفئة الأولى.|حدد اتجاه الحساب بما يوافق تخطيط المصفوفة.|Replace ROWS with COLUMNS and observe that the calculation now compares the sales amount per category against the first fiscal year
إعادة التراكم عند بداية السنة|كيف جعل التمرين المجموع الجاري يبدأ مجددًا كل سنة مالية؟|أضاف HIGHESTPARENT كمعامل إعادة ضبط في RUNNINGSUM على محور السنة والربع.|المعنى يعتمد على مستويات المحور؛ اختبر حدود السنوات في الرسم.|This sum will reset at the beginning of every fiscal year.
`);
group('sql:null:window-chapter:3cb3906c5d6c81d88f2bd727b2001a91','windows',`
إطار الماضي قد يستبعد الحالي|ماذا تعني النهاية 1 PRECEDING بدل CURRENT ROW؟|في مثال ROWS BETWEEN 5 PRECEDING AND 1 PRECEDING تدخل الصفوف الخمسة السابقة ويستبعد الحالي.|تقل الصفوف المتاحة عند بداية المجموعة.|يشمل الخمسة صفوف السابقة، بدون current row.
`);
group('note:pipelines:role','ingestion',`
Pipeline تربط الأنشطة واعتمادياتها|هل canvas مجرد قائمة أوامر مستقلة؟|تجمع الأنشطة والعلاقات التي تحدد اعتمادها، ويمكنها استدعاء دفاتر أو Dataflows وخدمات مدعومة.|وجود نشاط لا يثبت نجاح شروط تشغيله.|The canvas combines activities and their dependencies.
اسم فئة النشاط لا يوسع قدرته|هل تصنيف Copy ضمن التحويل يمنحها أي معالجة معقدة؟|اختر المحرك بحسب العملية الفعلية، لا بحسب عنوان فئة النشاط.|افحص عقد التحويل المدعوم قبل تصميم الحل.|Choose an engine by the actual operation, not a category label.
`);
group('note:pipelines:connections','ingestion',`
Gateway تصل الشبكة ولا تمنح صلاحية قاعدة|هل اتصال gateway يكفي لقراءة الجداول؟|الاتصال لا يمنح database permissions؛ التفويض يحتاج تحققًا مستقلًا.|افصل اختبار الوصول الشبكي عن اختبار الصلاحيات.|Gateway connectivity does not grant database permissions.
موصل المصدر قد يختلف عن موصل الهدف|هل دعم نظام كمصدر يعني دعمه كهدف لكل نشاط؟|الدعم قد يختلف بحسب اتجاه المصدر والوجهة والنشاط؛ راجع المصفوفة الملائمة.|لا تعمم قدرة موصل على كل مسارات النقل.|Support varies by source/destination direction and activity.
`);
group('note:pipelines:parameters','ingestion',`
Parameter مدخل وVariable حالة تنفيذ|كيف تميز مدخل تشغيل عن حالة داخلية تتغير؟|Parameters تدخل قيم التشغيل إلى workflow، بينما variables تمثل حالته الداخلية.|حدد ما يجب تمريره من الأب للابن صراحة.|Variables represent internal execution state
الحالة المشتركة ليست مدخلًا محليًا لكل تكرار|هل تستخدم variable مشتركة كأن لكل iteration نسختها؟|يحذر المصدر من افتراض عزل shared mutable state لكل تكرار.|حدّد عقد التوازي ومدخلات كل عنصر.|Never assume shared mutable state is an iteration-local input.
`);
group('note:pipelines:schedule','delivery',`
بدء التشغيل لا يعني جاهزية النتيجة|وصل ملف فبدأ run؛ هل تنشر الناتج فورًا؟|الوصول قد يبدأ التشغيل، بينما نجاح الاعتماديات وفحوص الجودة يحدد جاهزية الإصدار.|اربط الإتاحة بالجاهزية المطلوبة لا بمجرد trigger.|arrival can start a run, while success/quality dependencies determine release.
`);
group('note:pipelines:source','ingestion',`
Secure input/output تخص السجلات|هل إخفاء المدخلات والمخرجات يجعل parser صحيحًا؟|هذه الخيارات تغير التسجيل، ولا تصحح parsing أو تحقق جودة البيانات.|راجع التنسيق والتحقق بصورة مستقلة عن سرية السجل.|Secure input/output changes logging, not parsing or data validation.
Binary غير تفسير CSV كصفوف|لماذا يغير المثال المصدر إلى Delimited text؟|ليفسر CSV كصفوف مع التعامل مع العنوان بدل معاملته كتدفق binary فقط.|حدد delimiter والاقتباس والعناوين وفق الملف الحقيقي.|changes Binary to Delimited text.
`);
group('note:pipelines:target','ingestion',`
Mapping تشمل أنواع الأعمدة|لماذا يغير المثال year إلى integer وrating إلى double؟|الربط إلى الهدف لا يقتصر على الأسماء؛ يتضمن ضبط أنواع الأعمدة المطلوبة.|تحقق من قابلية تحويل القيم الفعلية.|changes year to integer and rating to double
Overwrite اختيار لعقد الكتابة|هل تنقل إعداد Overwrite من demo إلى تحميل تزايدي دون مراجعة؟|المثال يختار Overwrite، بينما يفصل الشرح بين عقود snapshot والتحميل التزايدي.|حدد ما يجب الاحتفاظ به أو استبداله في الهدف.|distinct snapshot/incremental contracts
`);
group('note:pipelines:run','ingestion',`
Succeeded دليل تنفيذ لا شهادة جودة|هل نجاح Copy يثبت التفرد وسلامة العلاقات والقواعد المالية؟|هو دليل على تنفيذ النشاط، لا ضمان مرور جميع قواعد العمل.|أضف التحقق المطلوب قبل إتاحة الناتج.|not a guarantee that uniqueness, referential completeness, or financial rules passed.
`);
group('note:pipelines:dynamic-demo','ingestion',`
Default ليست منعًا لقيمة المستدعي|هل القيمة الافتراضية للـparameter تمنع تمرير قيمة أخرى؟|هي قيمة fallback، وليست قاعدة تمنع المستدعي من تحديد مدخل.|راجع المدخل الفعلي المسجل للنشاط.|Defaults are fallback values
Interpolation قد تحول النوع إلى نص|هل كل تعبير ديناميكي يعيد النوع العددي نفسه؟|الاستيفاء يرجع نصًا، بينما قد يحتفظ تعبير الحقل الكامل بنوع عددي وفق الملاحظة.|افحص النوع المتوقع في المستهلك التالي.|Interpolation returns text; whole-field expressions can retain numeric types.
`);
group('note:pipelines:dependencies','delivery',`
Completion ليست Success فقط|متى يعمل مسار يعتمد على Completion في المثال؟|يشمل النجاح أو الفشل، بينما يحتاج predecessor المتخطي شرط skip.|راجع الحالة الفعلية والشرط المحدد لكل وصلة.|Completion covers success or failure
اتبع السابق المباشر في السلسلة|هل حالة أول نشاط تكفي لفهم كل الفروع التالية؟|يطلب المصدر تتبع immediate predecessor عند كل edge؛ النشاط المتخطي ليس نشاطًا فاشلًا.|استنتج كل انتقال من علاقته المباشرة.|Follow the immediate predecessor at each edge.
Wait لا تختبر الجاهزية|هل مرور تأخير ثابت يثبت اكتمال العمل السابق؟|الانتظار الثابت ليس readiness check؛ يحتاج المسار شرط نجاح أو تحقق ملائم.|لا تعتمد على الوقت وحده لإطلاق استهلاك البيانات.|a fixed Wait is not a readiness check.
`);
group('note:pipelines:inactive','delivery',`
علامة النجاح قد تكون بلا نقل بيانات|عطلت Copy وأعطيتها حالة نجاح؛ ماذا أثبتت؟|الحالة المعيّنة قد توجه الفروع دون تنفيذ النقل.|لا تعتبر assigned success سجل تنفيذ Copy.|assigned success does not show that data was copied.
النشاط المعطل لا يملك مخرجات Copy العادية|هل تعتمد الخطوة التالية على حقول output لنشاط غير منفذ؟|placeholder غير النشط لا يملك حقول Copy العادية في وصف المصدر.|افحص عقود المخرجات عند تعطيل نشاط.|An inactive placeholder has no normal Copy output fields
`);
group('note:pipelines:canvas','delivery',`
حفظ تعريف Pipeline غير تشغيلها|تم commit لتعريف JSON؛ هل run المقابلة نجحت؟|تعريف الإعداد ونتيجة التنفيذ دليلان مختلفان؛ نجاح commit لا يثبت أن pipeline عملت.|راجع سجل التشغيل المناظر للإصدار.|a successful source commit does not prove the corresponding pipeline ran.
`);
group('note:delta:architecture','foundations',`
Lakehouse عنصر فوق أساس تخزين|هل OneLake وLakehouse اسمان للكيان نفسه؟|OneLake أساس التخزين على مستوى المستأجر، وLakehouse أحد عناصر Fabric التي تستخدمه.|افصل العنصر عن طبقة التخزين المشتركة.|A lakehouse is one Fabric item using it.
`);
group('note:delta:shortcuts','ingestion',`
دعم Shortcut لا يساوي دعم Cache|هل كل مصدر shortcut مدعوم يدخل في قائمة caching نفسها؟|قائمتا مصادر shortcuts ومصادر cache مختلفتان في الملاحظة المحلية.|راجع القائمتين عند تطبيق ميزة متغيرة.|Supported shortcut sources and supported cache sources are different lists.
Shortcut لا تستبدل النسخة الاحتياطية|هل الاعتماد على مرجع للمصدر يحفظ نسخة مستقلة للتعافي؟|تظل shortcut معتمدة على المصدر وليست backup.|حدد متطلبات الاحتفاظ والتعافي منفصلة عن المشاركة.|A shortcut remains a source dependency, not a backup.
`);
group('note:delta:delta','transform',`
الحذف قد يمثَّل دون إعادة كتابة فورية|هل كل حذف Delta يعيد كتابة ملف Parquet الأصلي فورًا؟|قد تمثل deletion vectors الصفوف المحذوفة دون إعادة كتابة مباشرة للملف.|راجع طريقة الجدول وخصائصه؛ لا تعمم copy-on-write على كل حالة.|without immediately rewriting the original Parquet file.
`);
group('note:delta:maintenance','transform',`
تحسين القراءة قد يضيف كلفة كتابة|هل V-Order مكسب مجاني ثابت لكل عبء؟|يعيد تنظيم Parquet عند الكتابة أو إعادة الكتابة لاستهلاك كثيف القراءة، مع overhead يعتمد على workload.|لا تحول متوسطًا من المصدر إلى ضمان أداء عام.|with workload-dependent write overhead.
`);
group('note:delta:partitioning','transform',`
Pruning تحتاج شرطًا قابلًا للاستفادة|متى يساعد partition key في تخطي المجلدات؟|عندما تسمح المرشحات المستخدمة على المفاتيح باستبعاد أقسام من القراءة.|اسم المفتاح وحده لا يثبت أن استعلامًا بعينه سيستفيد.|Usable predicates on partition keys can skip directories.
`);
group('note:delta:explorer','transform',`
ملفات Delta ليست مستندات مستقلة للتعديل|هل تعدّل Parquet أو _delta_log مباشرة بأداة ملفات عامة؟|قد يكسر ذلك الاتساق المعاملي خارج العمليات الواعية بـDelta.|استخدم مسار كتابة مصرحًا وملائمًا للجدول.|can break transactional consistency.
راحة إدارة الملفات لا تلغي الحوكمة|هل سهولة حذف ملف أو نقله تكفي لاعتماد العملية؟|تبقى متطلبات الحوكمة والمعاملات والاعتماديات قائمة رغم سهولة الأداة.|راجع نوع العنصر وأثره قبل أي عملية.|File-management convenience does not remove governance, transaction, or dependency requirements.
`);
group('note:delta:files-schemas','foundations',`
Schema مساحة أسماء وليست Partition|هل schema في Tables تعني مرحلة medallion أو مفتاح تقسيم؟|تنظم schemas أسماء الكائنات، ولا تساوي مفاتيح partition أو مراحل المعالجة.|حدد وظيفة كل طبقة قبل رسم المعمارية.|Schemas organize names; they are not partition keys or medallion stages.
إعادة تسمية جدول تمتد إلى مراجع المستهلكين|هل ينتهي التغيير عند نقل أو إعادة تسمية الجدول؟|قد تحتاج مراجع notebooks وdataflows وSQL إلى التحديث.|احصر الاعتماديات قبل إجراء النقل.|Renaming or moving a table requires updating dependent
`);
group('note:delta:partition-demo','transform',`
صورة المجلدات ليست اختبار أداء|هل مشاهدة hierarchy التقسيم تثبت أن التخطيط أسرع؟|تعرض التنظيم الفيزيائي فقط؛ قارن الأداء على أحمال وتوزيعات ممثلة.|لا تنقل عدد مجلدات demo صغير كقرار إنتاج.|not proof that one design is fastest.
`);
group('note:delta:maintenance-demo','delivery',`
الصيانة واسعة النطاق تحتاج تشغيلًا مرصودًا|كيف تتعامل مع آلاف الجداول بدل النقر المتكرر؟|يقترح المصدر workflow صيانة مجدولة وقابلة للمراقبة مع اعتماديات نجاح واحتفاظ لكل جدول.|راجع توقيتها وتأثيرها على القراء والكتابات.|scheduled, observable maintenance workflow
لغة صيانة Spark ليست T-SQL endpoint|هل تلصق أوامر صيانة Spark في محرر endpoint SQL؟|المحركان ومسارات الإدارة مختلفان؛ استخدم السطح الداعم للأمر.|تشابه SQL الظاهري لا يعني توافق التنفيذ.|do not paste Spark maintenance SQL into its T-SQL editor.
`);
group('note:delta:sql-demo','query',`
قراءة البيانات فقط لا تمنع كل Metadata|كيف ينجح CREATE VIEW بينما يرفض UPDATE في المثال؟|يقيد endpoint كتابة بيانات Lakehouse، لكنه قد يدعم كائنات SQL للقراءة داخل حدوده.|افصل تعديل البيانات عن إنشاء كائن قراءة مدعوم.|Read-only data does not mean no SQL metadata operations.
View الـendpoint ليست Delta table جديدة|هل إنشاء view يجعلها جدولًا materialized يراه Spark بالطريقة نفسها؟|هي كائن SQL في endpoint، وليست تلقائيًا managed Delta table جديدة.|راجع واجهة الاستهلاك التي تستهدفها.|not a newly materialized managed Delta table
`);
group('note:warehouse:intro','query',`
خبرة SQL Server لا تثبت تطابق Fabric|هل تنقل triggers وكائنات مألوفة كما هي؟|المفاهيم المألوفة لا تضمن feature parity؛ راجع الدعم الفعلي للمحرك.|المصدر محلي؛ يحتاج عقد المنتج مراجعة قبل النشر.|Familiar SQL Server concepts do not guarantee feature parity.
`);
group('note:warehouse:ingest','ingestion',`
افصل قرارات التحضير والنقل والتنسيق|هل تختار أداة واحدة لأن اسمها يغطي كل خط البيانات؟|اعتبر preparation وmovement وorchestration وexecution target قرارات منفصلة.|قد تجمع أداة وظائف، لكن متطلبات كل وظيفة تظل مستقلة.|Treat preparation, movement, orchestration, and execution target as separate decisions.
`);
group('note:warehouse:read','query',`
TDS يحتاج اتصال SQL لا مسار ملف|هل تعطي عميل SQL عنوان OneLake كأنه connection string؟|استخدم معلومات اتصال SQL الفعلية لـTDS؛ مسار ملفات OneLake واجهة أخرى.|تحقق من العميل والبروتوكول والصلاحيات.|OneLake file paths belong to a different interface.
`);
group('note:warehouse:historical-theory','query',`
التقرير التاريخي يحتاج ساعة مشتركة|هل تكفي عبارة نريد بيانات قديمة دون cutoff؟|يحتاج التقرير المستقر cutoff UTC مقصودًا وتاريخًا متاحًا وصلاحية قراءة.|احتفاظ كل مصدر ومرجعه الزمني جزء من قابلية إعادة النتيجة.|the intended shared UTC cutoff
`);
group('note:warehouse:clone-theory','delivery',`
Zero-copy تبدأ بمراجع للملفات|هل clone صفرية النسخ تعني نسخ كل ملف فورًا؟|تبدأ بمراجع إلى الملفات القائمة عبر metadata منسوخة في وصف المصدر.|راجع نطاق دعم clone وشروطها قبل التنفيذ.|initially references existing data files through copied metadata.
Zero-copy لا تعد بتكلفة تخزين مستقبلية صفر|ماذا يحدث مع تغير المصدر والنسخة لاحقًا؟|قد تتباعد احتياجات تخزين المصدر والنسخة مع التغيرات.|قِس الأثر المستقبلي بدل تعميم كلفة الإنشاء الأولية.|Initial zero-copy does not mean unlimited future storage is free.
`);
group('note:warehouse:sql-client-demo','query',`
تغيير العميل لا يغير قدرات المحرك|هل الانتقال إلى SSMS يتيح عملية غير مدعومة أصلًا؟|تغيير تطبيق العميل لا يغير العمليات التي يدعمها المحرك.|راجع العقد على جهة الخدمة وليس اسم البرنامج المستخدم.|Changing client applications does not change the engine's supported operations.
`);
group('note:warehouse:ddl-view-demo','query',`
الوقت الحالي يجعل القراءة التاريخية متحركة|هل صفوف قديمة مع تعبير current-time تكفي لإعادة تقرير سابق؟|التعبير يقيم وقت الاستعلام؛ استخدم as-of date صريحًا عندما تحتاج تكرار النتيجة.|افصل تاريخ البيانات عن ساعة التقرير.|use an explicit as-of date when reproducibility matters.
DATEDIFF(year) ليست سنوات مكتملة|هل طرح حدود السنوات يعطي دائمًا عدد أعياد التعيين المكتملة؟|يعد DATEDIFF(year) حدود السنوات، لا anniversaries المكتملة في تنبيه المصدر.|اختبر منطق المدة وفق تعريف العمل المطلوب.|counts year boundaries, not completed hire anniversaries.
`);
group('note:warehouse:copy-demo','security',`
إدارة Blob غير قراءة محتواها|هل صلاحية management-plane تساوي تصريح data-plane read؟|يميز المصدر بينهما، فلا تثبت الأولى القدرة على قراءة البيانات.|افحص الدور الذي يمنح العملية الفعلية المطلوبة.|Blob data-plane read differs from management-plane access.
`);
group('note:warehouse:time-demo','query',`
البيانات التاريخية لا تعيد المخطط تلقائيًا|هل توفر لقطة صفوف قديمة يثبت إعادة بناء schema القديمة؟|قيود المخطط الحالي لا تساوي historical schema reconstruction.|راجع الأعمدة ووقت إنشاء view والتاريخ المتاح.|Current schema constraints do not equal historical schema reconstruction.
`);
group('note:warehouse:cross-demo','query',`
عمود المصدر قد يغير مقارنة UNION|أضفت Source literal لتمييز الأصل؛ هل يظل تعريف الصف المكرر نفسه؟|قد يؤثر العمود الجديد في مقارنة التكرار بين الصفوف لأنه أصبح جزءًا من النتيجة.|راجع ما تريد اعتباره مكررًا قبل إضافة أو إسقاط الحقول.|An added Source literal identifies origin and can affect UNION duplicate comparison.
`);
group('note:warehouse:clone-demo','delivery',`
الاسترجاع من Clone قد يفقد إدخالًا لاحقًا|كانت clone عند11 صفًا ثم صار المصدر12؛ ماذا يعيد المثال؟|إعادة التعبئة من النسخة تعيد11 وتغفل الإدخال الذي حدث بعدها.|حدد نقطة الاسترجاع المطلوبة وراجع الفروق قبل أي تنفيذ.|restores eleven rows and omits the later insert.
استرجاع المثال ليس عملية تعافٍ مكتملة|ما الشروط التي يذكرها تمرين الاسترجاع قبل تغيير الإنتاج؟|يفترض مخططًا ثابتًا وتاريخًا محتفظًا به وصلاحيات وتحققًا ونقطة مراجعة صريحة.|هذا تمرين قرارات محلي وليس إثبات تنفيذ تعافٍ حي.|require unchanged schema, retained history, permissions, validation
`);
group('note:warehouse:objects','query',`
الدالة والإجراء لهما استخدامان مختلفان|تحتاج منطقًا يرجع قيمة أو صفوفًا قابلة للتركيب؛ هل أي procedure بديل؟|يميّز المصدر functions التي تعيد قيمًا أو صفوفًا قابلة للتركيب عن procedures التي تنفذ workflow.|اختر عقد الكائن الملائم لطريقة الاستدعاء.|functions return values or composable rows
`);
function group(source,topic,lines){for(const line of lines.trim().split('\n')){const row=line.split('|');if(row.length!==5)throw Error('Malformed row '+line);batch4.push([source,topic,...row]);}}
group('sql:null:dialect:3cb3906c5d6c81c3b161dd36ed52c9a9','postgresql',`
عنصر Array غير المصفوفة كاملة|تبحث عن قيمة مفردة داخل Array؛ هل تقارن العمود كله بنص؟|استخدم الوصول إلى عنصر أو عملية بحث في العناصر بحسب السؤال، بدل مقارنة array كاملة بقيمة scalar.|راجع أبعاد المصفوفة ونوع عناصرها.|Array وليس scalar value.
ANY تبحث بين العناصر|تريد معرفة هل توجد قيمة مطابقة داخل المصفوفة؛ ما الفكرة؟|ANY تتيح اختبار المطابقة مع عنصر من عناصر المصفوفة.|راجع شكل التعبير والمصفوفة الممررة، خصوصًا مع الأبعاد المتعددة.|هل توجد قيمة مطابقة في أي عنصر؟
احتواء مجموعة داخل Array|ماذا تعني @> بين مصفوفتين في المثال؟|المصفوفة على اليسار تحتوي عناصر المصفوفة على اليمين.|هذا اختبار احتواء لا مقارنة مرتبة عنصرًا بعنصر.|تحتوي عناصر الـ array على اليمين.
الفهرس غير الموجود قد ينتج NULL|طلبت عنصرًا خارج العناصر الموجودة؛ هل النتيجة قيمة فعلية؟|قد تحصل على NULL عند طلب index غير موجود في مثال المصدر.|لا تفسرها كقيمة عادية أو تتجاهل حدود المصفوفة.|إذا طلبت index غير موجود، يمكن أن تحصل على
قائمة داخل صف أم جدول عناصر؟|تكرر الاستعلام المعقد على عناصر arrays؛ ماذا تراجع في التصميم؟|يقترح المصدر التفكير في جدول منفصل ومطبع للعناصر عند كثرة التحليل المعقد عليها.|الاختيار يتبع نمط الاستخدام، لا حظرًا عامًا للمصفوفات.|فكّر في normalization لجدول منفصل
`);
group('sql:null:dialect:3cb3906c5d6c81f981e3cff58e8ce989','text',`
طول النص أداة تحقق|كيف تكتشف اسمًا طويلًا بشكل غير معتاد؟|LENGTH وCHAR_LENGTH تعيدان عدد أحرف النص، ويمكن استخدامه لفحص القيم المشبوهة.|الطول غير المعتاد إشارة للفحص وليس إثبات خطأ.|الاثنين يرجعان عدد الأحرف في النص.
POSITION تحدد حد الاستخراج|قبل فصل username عن domain، ما الذي تحتاج تحديده؟|ابحث عن موضع @ باستخدام POSITION أو STRPOS، ثم استخدمه كحد للاستخراج.|تحقق من صلاحية النص قبل افتراض وجود الفاصل.|تحديد الحد الفاصل بين username وdomain في إيميل.
LEFT وRIGHT تحددان طرف النص|تريد مقدمة وصف أو آخر أربعة أحرف من رقم؛ ما العملية المناسبة؟|LEFT تستخرج من البداية وRIGHT من النهاية حسب عدد الأحرف المحدد.|الاستخراج ليس تحققًا من صحة الرقم أو النص.|استخراج أحرف من البداية أو النهاية.
SUBSTRING تجمع البداية والطول|ما المعلومات التي تحدد الجزء المقتطع من نص؟|الصيغة المعروضة تستخدم النص وموضع البداية وطول الجزء المطلوب.|راجع صياغة اللهجة المستخدمة وحدود النص.|SUBSTRING(source, start, length)
ركّب دوال النص حول حد واضح|هل تحتاج معالجة يدوية لفصل domain بعد @؟|يوضح المثال تركيب POSITION وCHAR_LENGTH وSUBSTRING لتحديد الحد والطول ثم الاستخراج.|تركيب الدوال لا يعوض التحقق من الحالات غير الصالحة.|POSITION → find boundary
جهة Padding تغير المخرَج|كيف تختلف إضافة أصفار لليسار عن إضافتها لليمين؟|LPAD تضيف من اليسار وRPAD من اليمين للوصول للطول المطلوب في المثال.|حدد هل الأصفار للعرض فقط أم جزء من معرف فعلي.|LPAD → add characters on the left
Padding قد يقطع النص|حددت طولًا أصغر من الأصل؛ هل تقتصر العملية على الإضافة؟|قد تُقطع النتيجة إذا كان الطول المستهدف أقصر من النص الأصلي.|افحص الحد الأقصى قبل توحيد طول المعرفات.|لو الطول المستهدف أصغر من الأصلي، النتيجة تتقطع
تنظيف طرف واحد له معنى|تريد إزالة أحرف البداية مع إبقاء النهاية؛ هل تستخدم الدالة نفسها لكل حالة؟|LTRIM للبداية وRTRIM للنهاية، بينما TRIM يمكن أن يعالج الطرفين.|راجع الأحرف التي تعالجها الدالة؛ ليس كل whitespace مضمون الإزالة افتراضيًا.|LTRIM → left side
`);
group('sql:null:dialect:3cb3906c5d6c810b8b67cbf8815ef577','postgresql',`
علامتا LIKE لا تعنيان الشيء نفسه|كيف تختلف % عن _ في نمط البحث؟|% تطابق صفرًا أو أكثر من الأحرف، بينما _ تطابق حرفًا واحدًا في وصف المصدر.|انتبه إلى الأحرف الخاصة إذا كان المطلوب بحثًا حرفيًا عنها.|% → zero or more characters
موضع Wildcard يحدد موضع المطابقة|كيف تفرق بين يبدأ بـELF وينتهي بها؟|ELF% يبحث عن بداية، و%ELF عن نهاية، و%ELF% عن احتواء النمط.|هذا بحث نمطي، لا فهم لغوي للكلمة.|-- Starts with ELF
ILIKE لا تتطلب تطابق حالة الأحرف|لماذا قد لا يطابق البحث عن elf كتابة Elf؟|يقدم المرجع ILIKE للمطابقة غير الحساسة لحالة الأحرف في PostgreSQL، بدل LIKE في المثال.|راجع إعدادات النص واللهجة؛ لا تعمم الصياغة على كل المحركات.|case-insensitive matching
البحث اللغوي غير بحث الأحرف|تبحث في مقالات طبيعية؛ ما الذي يضيفه Full-Text Search؟|يعتمد على كلمات وتمثيل لغوي موحد وlexemes، بدل مطابقة سلسلة أحرف فقط.|حدد إعداد اللغة المناسب للمحتوى.|words + normalization + lexemes + linguistic matching
المستند والاستعلام لهما تمثيلان|في Full-Text Search، ما دور tsvector وtsquery؟|يمثل tsvector النص القابل للبحث، وتمثل tsquery طلب البحث، وتستخدم @@ للمطابقة.|تحقق من تكوين اللغة وصياغة الاستعلام.|tsvector @@ tsquery
Full-Text ليست تصحيحًا إملائيًا|هل البحث اللغوي يعالج تلقائيًا كل typo؟|يميز المصدر البحث النصي الكامل عن fuzzy matching المستخدمة للتشابه التقريبي والأخطاء الإملائية.|اختر التقنية بحسب نوع الاختلاف الذي تريد تحمله.|Full-text search مش نفس حاجة typo correction.
`);
group('sql:null:dialect:3cb3906c5d6c817fb197f233646cda62','postgresql',`
المتاح للتثبيت غير المفعّل|وجدت extension في قائمة المتاح؛ هل يمكن افتراض تشغيل وظائفها؟|pg_available_extensions تعرض المتاح، بينما pg_extension تعرض المفعّل بالفعل.|تحقق من حالة البيئة وصلاحياتها قبل استخدام دالة إضافية.|pg_extension            → ما المفعّل بالفعل؟
Levenshtein تقيس كلفة التعديل|كيف تقارن نصين بعدد عمليات التحويل؟|تقيس الدالة التعديلات من إدراج وحذف واستبدال؛ المسافة الأقل تعني قربًا أكبر.|القرب النصي لا يثبت أن السجلين للكيان نفسه.|أنواع التعديل: Insertion, Deletion, Substitution
اتجاه درجة التشابه مهم|هل ترتب Levenshtein وsimilarity بالطريقة نفسها؟|الأقل أفضل للمسافة، بينما الأعلى أفضل لدرجة trigram similarity.|لا تستخدم ترتيبًا تنازليًا لكل مقياس بلا فهم دلالته.|Higher similarity = More similar
الدالة الإضافية تحتاج امتدادها|قبل استعمال fuzzystrmatch أو pg_trgm، ماذا تتحقق؟|تأكد أن الامتداد اللازم مفعّل قبل استدعاء الدالة المرتبطة به.|هذه معلومة إعداد، وليست تنفيذ تثبيت أو موافقة عليه.|لا تنس تفعيل الـ extension قبل استخدام الدالة.
`);
group('sql:null:dialect:3cb3906c5d6c8162bcafeddf74477d61','postgresql',`
ENUM يربط النوع بقيم مضبوطة|تحتاج حالات عمل محددة في نوع عمود؛ ما المثال المحلي؟|يعرض المصدر CREATE TYPE لتعريف ENUM ثم استخدامه كنوع عمود.|اختره عندما تلائمك قيود وتغييرات مجموعة القيم.|ENUM تتحكم قيمه القاعدة
اسم النوع المخصص جزء من الاستكشاف|كيف تتعرف على نوع غير مألوف لعمود؟|يمكن فحص data_type وudt_name ضمن information_schema.columns في المثال.|لا تستنتج معنى النوع من اسم العمود وحده.|SELECT column_name, data_type, udt_name
الدالة المخصصة تحزم المنطق|متى يفيد CREATE FUNCTION في المثال؟|يحزم منطق قاعدة البيانات لإعادة استعماله بدل إعادة كتابة الحساب في كل موضع.|حدد عقد المدخلات والنتيجة قبل إعادة الاستخدام.|package reusable database logic
`);
group('sql:null:companion:3ce3906c5d6c81ad85a0fc24bb55d32c','types-null',`
القسمة الصحيحة قد تفقد الكسر|لماذا تختلف 10 / 4 عن 10 / 4.0 في مثال PostgreSQL؟|المعاملان الصحيحان ينتجان 2، بينما إدخال معامل عشري يعطي 2.5 في المثال.|اضبط الأنواع قبل حساب النسب.|مع integer operands، النتيجة تكون integer
CAST في SELECT لا يغير المخطط|حوّلت العمود في نتيجة استعلام؛ هل تغير تعريفه في الجدول؟|التحويل هنا يغير نوع التمثيل في الاستعلام الحالي، وليس schema العمود الأصلي.|تغيير المخطط عملية مختلفة يجب تمييزها.|لا يغير schema الأصلي للعمود.
المعرف الآلي ليس مرادفًا لـserial|هل كل عمود يولد ID تلقائيًا لا بد أن يكون serial؟|يذكر المصدر serial التقليدي ووجود identity columns، ويطلب الفصل بين المفهوم والصياغة المحددة.|راجع آلية العمود الفعلية في مخططك.|لا تخلط بين مفهوم auto-generated ID
`);
group('sql:null:companion:3ce3906c5d6c81d5b73dc71a90b87cfd','analytics',`
رقم مخزن لا يعني كمية قابلة للمتوسط|هل AVG لرمز منطقة أو قسم يعطي معلومة مفيدة؟|نوع INTEGER لا يمنح الرمز معنى كميًا؛ المعنى التحليلي يأتي من دلالة المتغير.|راجع قاموس البيانات قبل إجراء الحسابات.|INTEGER ≠ automatically measurable quantity
قرّب الناتج في المرحلة المقصودة|هل تقريب كل صف قبل التجميع يعادل تقريب الإجمالي؟|يوصي المرجع عادة بالتجميع أولًا ثم التقريب، ما لم تتطلب قاعدة العمل غير ذلك.|حدد قاعدة التقريب صراحة عندما تؤثر على النتيجة.|اعمل aggregation ثم round للناتج
تباين المجتمع غير تباين العينة|لماذا يعرض المرجع VAR_POP وVAR_SAMP منفصلتين؟|تختلف صيغة القسمة بين N للمجتمع وN−1 للعينة في وصف المصدر.|اختر الصيغة التي تطابق غرض البيانات، لا اسمًا مألوفًا فقط.|Sample variance: <code>Σ(x - x̄)² / (N - 1)</code>
Percentile قد تكون قيمة مستوفاة|هل يجب أن تكون نتيجة percentile موجودة حرفيًا ضمن المشاهدات؟|PERCENTILE_DISC تختار قيمة موجودة، بينما PERCENTILE_CONT قد تستخدم interpolation.|لا تفترض تطابق النتائج بين طرق حساب percentiles المختلفة.|ممكن تعمل interpolation وترجع value مش موجودة أصلًا.
الرقم الخاص قد يعني مفقودًا|رأيت 99 أو -99 في عمود قياس؛ هل تعتمدها كقياسات حقيقية؟|قد تمثل أكوادًا للقيم المفقودة أو غير المنطبقة؛ ارجع إلى قاموس البيانات.|لا تحذفها أو تعيد تفسيرها دون تعريف موثق.|Always check the data dictionary/documentation.
الفئة الخالية يجب ألا تختفي|أنشأت bins وتريد إظهار صفر للمجموعة الخالية؛ ما النمط؟|يحفظ LEFT JOIN قائمة الفئات، ويعد COUNT لعمود المشاهدة بدل COUNT(*) في المثال.|تأكد أن غياب المشاهدات يعني صفرًا في سياق القياس.|للحفاظ على كل الـ bins حتى لو لم يقع فيها أي observation
CORR يستخدم الأزواج المتاحة|هل الصف الذي يفتقد أحد المتغيرين يدخل الارتباط في المثال؟|يذكر المرجع استبعاد الصفوف ذات NULL في أي من المتغيرين من الحساب.|افحص أثر الفقد على المجتمع المتبقي قبل تفسير الارتباط.|الصفوف اللي فيها <code>NULL</code> في أي متغير بتتستبعد من الحساب.
TRUNC لا تقرّب لأقرب قيمة|كيف تختلف TRUNC عن ROUND عند تقليل المنازل؟|تحذف TRUNC الدقة في المنازل الأدنى بدل التقريب، كما يوضح المثال 42.1256 إلى 42.12.|راجع موضع القطع المطلوب واتجاه القيم.|TRUNC(42.1256, 2) → 42.12
`);
group('sql:null:window-chapter:3cb3906c5d6c81a79c56d4bb581dfc02','aggregation',`
ROLLUP ينتج تسلسل مجاميع|ماذا تضيف ROLLUP(A,B,C) إلى التجميع التفصيلي؟|تنتج مستويات ABC ثم AB ثم A ثم الإجمالي العام في التسلسل المعروض.|اختر ترتيبًا يعكس hierarchy المطلوبة.|A + B + C
تبديل ترتيب ROLLUP يبدل المجموع الفرعي|هل ROLLUP(country,medal) مثل عكس العمودين؟|الأولى تنتج مجموعًا فرعيًا للدولة في المثال، والثانية للميدالية.|ترتيب الحقول جزء من معنى النتيجة.|ترتيب الأعمدة مهم جدًا.
CUBE توسّع تركيبات التجميع|تحتاج إجماليات لكل بُعد وتركيباته؛ ماذا تختلف عن ROLLUP؟|CUBE تنتج كل تركيبات grouping المعنية، بدل تسلسل هرمي واحد.|تأكد أن المستويات المطلوبة مفيدة وقابلة للقراءة.|ويولد كل الـ grouping combinations.
NULL التجميع قد يمثل إجماليًا|ظهر NULL في عمود بمخرجات ROLLUP؛ هل هو دائمًا فقد في المصدر؟|قد يمثل صفًا للمجموع الفرعي أو الإجمالي في سياق التجميع المعروض.|ميّز صفوف الإجمالي عن NULL الأصلية قبل وضع تسمية بديلة.|Total for all medals within China.
ترتيب STRING_AGG داخلي|تحتاج قائمة أسماء بترتيب محدد داخل كل خلية؛ أين تصرح به؟|حدد ORDER BY داخل STRING_AGG بدل افتراض أن ترتيب النصوص سيأتي كما تريد.|راجع كسر التعادل إذا لزم ترتيب محدد تمامًا.|إذا كان ترتيب القيم مهمًا، حدده داخل
`);
group('sql:null:window-chapter:3cb3906c5d6c815a8811cf0645e13383','windows',`
حدود الصفحة تبدأ من حجمها ورقمها|حجم الصفحة 20 ورقمها 3؛ ما صفوفها في المثال؟|الحدان هما 41 و60 وفق صيغة بداية الصفحة ونهايتها.|يتطلب التطبيق ترتيبًا محددًا للصفوف.|إذن page 3 = rows
Pivot يغير توزيع العرض|عند تحويل السنوات إلى أعمدة، ماذا يبقى صفًا وماذا يصبح قيمة؟|في المثال تبقى الدولة مفتاح صف، وتصبح السنة عمودًا، وتوضع الجوائز داخل الخلايا.|حدد كيفية التعامل مع تكرار مفتاح الصف والسنة قبل pivot.|Pivoting = تحويل القيم الموجودة في Rows إلى Columns
CROSSTAB مرتبطة بامتداد|ما الاعتماد المذكور لعمل pivot بـcrosstab في PostgreSQL؟|يستخدم المثال crosstab من امتداد tablefunc.|تحقق من التفعيل وبنية الأعمدة المتوقعة قبل استخدام المثال.|extension اسمها <code>tablefunc</code>
`);
group('sql:null:window-chapter:3cb3906c5d6c81d88f2bd727b2001a91','windows',`
الإطار السابق يشمل الصف الحالي إذا طلبته|كم صفًا قد يشمل ROWS BETWEEN 3 PRECEDING AND CURRENT ROW؟|حتى أربعة صفوف: الحالي وثلاثة قبله عندما تتوفر.|لا تفترض اكتمال الإطار عند بداية المجموعة.|حتى 4 صفوف عندما تكون متاحة.
ROWS وRANGE يتعاملان مع التعادل بشكل مختلف|تكرر مفتاح الترتيب؛ هل كل نافذة تحسب الصفوف بالطريقة نفسها؟|ROWS تتعامل مع الصفوف منفصلة، بينما RANGE تتعامل مع قيم الترتيب المتساوية كـpeers في سياقها.|اختر الإطار بحسب عدد الصفوف أو قيم الترتيب المطلوبة.|يتعامل مع الصفوف كصفوف منفصلة
بداية Moving Average قد تحتوي صفوفًا أقل|لماذا يبدأ متوسط ثلاثي الصفوف في المثال بـ10 ثم15؟|عند البداية يحسب المتوسط من الصفوف المتاحة، قبل اكتمال ثلاثة صفوف في الإطار.|إذا احتجت نافذة مكتملة فحدد ذلك في منطق النتيجة.|الصف 2 → <code>(10+20)/2 = 15</code>
الإجمالي التراكمي يعاد داخل كل Partition|تتابع دولًا متعددة؛ هل يستمر running total من دولة لأخرى؟|مع PARTITION BY country يبدأ الحساب من جديد لكل دولة في المثال.|راجع أن مفتاح المجموعة يعكس الكيان المطلوب.|الـ running total يبدأ من جديد لكل
`);
group('sql:null:window-chapter:3cb3906c5d6c81aabba5cb36a17c548f','windows',`
ترتيب الحساب غير ترتيب العرض|هل ORDER BY داخل OVER يضمن ترتيب الصفوف النهائي؟|الداخلي يحدد حساب النافذة، والخارجي يحدد عرض النتيجة النهائية.|صرح بالترتيبين إذا كان لكل منهما غرض مختلف.|ترتيب ظهور النتيجة النهائية
`);
group('sql:10:canonical','time',`
ابدأ السلسلة الشهرية من بداية الفترة|لماذا يحذر المصدر من بدء توليد الشهور من يوم31؟|قد تنزلق الأيام عند الشهور الأقصر؛ ولّد بدايات ثابتة ثم اشتق النهايات.|اختبر حدود التقويم المستخدم.|ولّد من بدايات فترات ثابتة، واشتق نهايات الفترات بعد كده.
الفترة نصف المفتوحة تمنع ازدواج الحد|حدث يقع تمامًا عند حد فترتين؛ كيف تمنع عده مرتين؟|استخدم حدًا أدنى شاملًا وحدًا أعلى غير شامل في النمط المعروض.|استخدم الحدود نفسها في كل الفترات المجاورة.|بتمنع القيم على الحد الفاصل من إنها تتحسب في bin-ين.
احسب الفجوات ثم متوسطها|تحتاج متوسط الزمن بين الأحداث؛ لماذا تستخدم مرحلتين؟|احسب الفارق باستخدام LAG في نتيجة وسيطة ثم طبّق AVG عليها.|لا تنفذ window function داخل aggregate بالمستوى نفسه في النمط المحذر منه.|بدل من كده استخدم مرحلتين منطقيتين:
رقم يوم الأسبوع يحتاج تعريفًا|هل Sunday يساوي1 في كل حقول التاريخ؟|يوضح مصدر PostgreSQL أن DOW يستخدم Sunday=0 وSaturday=6.|لا تعمم التعريف على ISODOW أو لغات ومحركات أخرى.|Sunday = 0
الإزاحة عدد صفوف لا اسم فترة|ماذا تعني LAG(value,2) في المثال؟|تأتي بالقيمة من صفين سابقين وفق ترتيب النافذة.|لا تفترض أنهما يومان إذا كانت الصفوف متباعدة زمنيًا.|صفين للخلف:
LEAD ينظر إلى الحدث التالي|متى تحتاج LEAD بدل LAG؟|عندما يكون السؤال عن قيمة صف لاحق في التسلسل المرتب، لا السابق.|حدد ترتيب الأحداث والمجموعة قبل الحساب.|بترجع قيمة من الصف التالي.
مدة التذكرة فرق وقتين|كيف يصوغ مثال SLA مدة حل تذكرة؟|يطرح created_at من resolved_at ثم يمكن تلخيص مدد الحل.|راجع التذاكر غير المحلولة وأنواع التوقيت قبل التعميم.|resolved_at - created_at AS resolution_time
الرقم الشهري المتجمع قد يخلط السنوات عمدًا|عند GROUP BY EXTRACT(MONTH)، ما نوع المقارنة المعروضة؟|يجمع مبيعات الشهر نفسه عبر السنوات للإجابة عن مقارنة مثل يناير ومارس.|إذا أردت تسلسل كل شهر وسنته، فاحتفظ بهوية الفترة كاملة.|هل مبيعات يناير عادةً أعلى من مبيعات مارس؟
`);
group('sql:1:canonical','foundations',`
SQL تصف النتيجة للمحرك|هل تكتب في SQL الخطة الفيزيائية خطوة بخطوة؟|هي لغة declarative تصف النتيجة المطلوبة، ويختار optimizer كيفية تنفيذها.|يبقى فهم الخطة مهمًا عند تشخيص الأداء.|you describe the result you want
ترتيب التخزين ليس ضمان ترتيب النتيجة|ظهرت الصفوف مرتبة مرة؛ هل تضمن الترتيب في الاستعلام التالي؟|لا يضمن result set ترتيبًا ذا معنى دون ORDER BY.|لا تعتمد على ترتيب الإدخال أو التخزين كعقد عرض.|A result set is not guaranteed to have a meaningful order
Alias ليست عمودًا مخزنًا لحظيًا|هل تستخدم alias محسوبة في تعبير آخر بالقائمة نفسها بلا تحقق؟|الرؤية تعتمد على اللهجة والمرحلة؛ استخدم نتيجة وسيطة عندما يصبح الحساب مدخلًا لحساب آخر.|لا تفترض أن الاسم تحقق كعمود materialized.|as though it were an already-materialized column.
DISTINCT يعمل على الأعمدة المختارة|إذا غيرت SELECT، هل قد يتغير ما يعد صفًا مكررًا؟|DISTINCT يزيل التكرار من projection المختارة، لا يحدد تلقائيًا هوية كيان العمل.|لا تستخدمه لإخفاء ربط خاطئ.|removes duplicate rows from the selected projection.
Candidate key ليست بالضرورة عمودًا منفردًا|ما الذي يجعل مجموعة أعمدة مرشحة للتعريف الفريد؟|هي مجموعة دنيا من الأعمدة يمكن أن تقوم بدور معرف فريد.|افحص التفرد الفعلي ومعنى المجموعة قبل اعتمادها.|any minimal column set that could serve as a unique identifier.
`);
group('sql:8:canonical','sets',`
توافق UNION يشمل شكل الأعمدة|هل يمكن تكديس أي نتيجتين لهما أسماء متشابهة؟|يجب توافق عدد الأعمدة وأنواع الأعمدة المناظرة في عبارات SELECT.|توافق النوع وحده لا يضمن توافق المعنى.|compatible numbers and types of columns.
أسماء مخرجات Set operation لها مصدر|من أين تؤخذ أسماء الأعمدة في النمط المذكور؟|من الاستعلام الأول في عملية المجموعات.|رتب العرض والتسمية بوضوح في الاستعلام الأول.|Column names are taken from the first query
INTERSECT للمجتمع المشترك|تبحث عن سجلات موجودة في مجموعتين؛ ما العملية المباشرة؟|INTERSECT تعيد الصفوف الموجودة في النتيجتين.|حدد الأعمدة التي تمثل المطابقة المطلوبة.|Returns rows present in both result sets.
EXCEPT عملية اتجاهية|هل فرق A عنB مثل فرق B عنA؟|EXCEPT تعيد ما يوجد في النتيجة الأولى ويغيب من الثانية، فالترتيب يحدد السؤال.|سمِّ مصدر المقارنة والمرجع بوضوح.|present in the first result set but absent from the second.
الأعمدة المتوافقة قد تكون بمعانٍ مختلفة|عمودان رقميان يمران من فحص النوع؛ هل يكفي لتكديسهما؟|يحذر المرجع من اختلاف معنى الأعمدة رغم توافق أنواعها.|راجع الوحدات والتعريفات وترتيب الحقول.|mismatched column meaning despite compatible data types
`);
group('sql:6:canonical','aggregation',`
عد الكيانات غير عد المعاملات|تريد عدد العملاء الذين طلبوا؛ هل COUNT(*) على الطلبات يكفي؟|COUNT(DISTINCT customer_id) يجيب عن العملاء الفريدين بدل عدد صفوف الطلبات.|حدد هل المعرّف متاح وصحيح قبل العد.|Do not confuse row count with entity count.
بعض المقاييس لا تجمع عبر الزمن|هل تجمع رصيد المخزون اليومي كأن كل يوم معاملة جديدة؟|بعض الأرصدة semi-additive؛ تحتاج منطق snapshot أو نهاية فترة بدل جمعها عبر الزمن.|راجع قابلية الجمع لكل بُعد.|inventory balance often should use an end-of-period or snapshot logic
كل تعبير يحتاج معنى واحدًا داخل المجموعة|لماذا لا تختار صفة غير مجمعة عشوائيًا بجوار SUM؟|يجب أن تكون لكل صف ناتج قيمة غير ملتبسة لكل تعبير مختار.|قواعد الاعتماد الوظيفي تختلف حسب اللهجة.|Every output row must have an unambiguous value for every selected expression.
GROUPING SETS تختار المستويات صراحة|تحتاج مجموعات تجميع محددة دون كل التركيبات؛ ماذا يوفر المرجع؟|GROUPING SETS تصرح بمستويات التجميع المطلوبة.|راجع المستويات كي لا تحسب إجماليات غير مقصودة.|explicitly requested grouping levels.
`);
group('sql:3:canonical','types-null',`
NOT IN مع NULL يحتاج انتباهًا|لماذا قد يفاجئك استبعاد قيم باستعلام يعيد NULL؟|قد تنتج NOT IN نتائج غير متوقعة؛ عندما يكون السؤال عن غياب العلاقة يكون NOT EXISTS أوضح وأأمن في الحالات المشار إليها.|لا تبدل الصياغة دون مطابقة معنى المقارنة والـNULL.|NOT IN</code> can produce surprising results when its subquery contains NULL.
`);
