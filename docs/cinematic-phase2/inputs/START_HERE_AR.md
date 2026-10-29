# Hansa Prototype C — Cinematic Knowledge Experience
## Agent-ready execution blueprint · 28 October 2026

**نوع الحزمة:** تعليمات ومواصفات وخطة اختبار للـAgent — **وليست تعديلًا للموقع أو تنفيذًا للكود**.

## القرار المعتمد

- **Prototype C — Hybrid Knowledge Stage** هو اتجاه تجربة الصفحة الرئيسية المعتمد. لا ترجع إلى Prototype A كتصميم رئيسي.
- الصفحة ليست Portfolio/Directory؛ هي **Daily Insight → Timeline → Reveal/Experiment → Card Dealer → Atlas Peek → Learn/Practice**.
- المطلوب تشكيل بصري أصيل واضح العمق، موشن ذو معنى، وواجهة تعليمية صحيحة؛ **لا تكفي** Glow خلف العنوان أو CSS hover tilt أو Cards عادية.
- Work وExperience يظلان في الموقع لكن ليسا محتوى Landing Page.
- بيانات المسائل والعلاقات والحالة العلمية والأرشيف والروابط لا تتغير بلا تحقق وموافقة.

## النتيجة المرصودة التي يجب إصلاحها

عند تدقيق الصفحة العامة بتاريخ 28 أكتوبر (فحص سابق في المحادثة، وليس Audit جديد في هذه الحزمة): Hero بعنوان `Data that makes decisions visible.`, CTA للـAtlas/Learn/Practice، وصفوف Cards للوجهات التعليمية؛ لا يوجد Daily Insight / Timeline / Card Dealer داخل `main` على الصفحة الرئيسية؛ الـAtlas العام أظهر `Publication review is pending`. هذا مرجع **baseline يحتاج إعادة تأكيد داخل الريبو والمتصفح عند التنفيذ**، وليس إذنًا بتجاوز حالة نشر الـAtlas.

## الـSkills المرفقة والموجودة

1. `hansa-spatial-experience`: أصل الحزمة مُدرج حرفيًا في `skills/Hansa_Spatial_Experience_v2_original.zip`. فحص مستقل للحزمة في هذه الجلسة: `verify_package.py` = **PASS**، و`verify_skill.py` = **PASS**، وmanifest SHA-256 = **PASS** (53 entry). هذا **فحص ملفات فقط**.
2. `hansa-creative-intelligence`: يُفترض وجودها في `D:\BeUI\amir-portfolio\.agents\skills\hansa-creative-intelligence`. **لم تكن مضمنة في الحزمة المرفقة**، والوكيل ملزم بفحص وجودها وقراءة توجيهاتها من الريبو، وعدم إنشاء أو استبدال بديل مزيف.
3. اللاب المصاحب للـSpatial Skill يضم 3 مفاهيم 2.5D (Organic/Constellation/Architecture) وصورًا وتجربة تفاعلية محلية. **ليس تصميم Landing جاهزًا ولا WebGL 3D حقيقيًا**. لا تنسخ تخطيطه (Sidebar + Rectangles + Graph) إلى Hero.

## ترتيب القراءة

1. `docs/01_SKILLS_PROTOCOL.md` — إثبات التفعيل، حدود الـSkills، إعداد آمن دون تعديل المشروع.
2. `docs/02_CREATIVE_DIRECTION.md` — لغة التكوين البصري وanti-flat ومعايير المشهد.
3. `docs/03_DESKTOP_MOBILE_STORYBOARD.md` — Frame-by-frame، Timeline/Card Dealer/Atlas، والحالات على الأجهزة.
4. `docs/04_CONTENT_IA_STATE.md` — Schemas والـUX flows والـNavigation والفهرسة والـQA العلمي.
5. `docs/05_EXECUTION_MILESTONES.md` — مراحل مستقلة مع مهام مقيّدة ومسؤوليات وشروط إكمال.
6. `docs/06_VISUAL_QA_ACCEPTANCE.md` — اختبارات Pass/Fail وبوابة الموافقة، مع منع الخلط بين Build وVisual Approval.
7. `docs/07_SAFETY_INTEGRATION.md` — Git/worktree/ownership/preservation/rollback/deploy gates.
8. `docs/08_LAYOUT_WIREFRAMES.md` — أول شاشة Desktop وMobile وحدود التكوين والـResponsive.
9. `AGENT_MASTER_PROMPT.md` — برومبت تشغيل الـAgent **بعد الموافقة على المرحلة المراد تنفيذها**.
10. `templates/` — قوالب للاستخدام الفعلي أثناء العمل.

## من يبدأ تنفيذ الخطة؟

**المالك/المستخدم** هو من يرسل `AGENT_MASTER_PROMPT.md` للـAgent. يجب أن يبدأ الـAgent بالتحقق والـRead-only Audit والتصورات؛ وليس تغيير الموقع أو النشر تلقائيًا. لا تغيّر أي شيء في Hansa بمجرد قراءة هذه الحزمة.

## نقاط قرار ملزمة

- **Gate 0 — Evidence:** baseline/read-only audit + skills loaded; لا يغيّر كود المنتج.
- **Gate 1 — Creative:** مقارنة 4 مداخل تكوينية *داخل Prototype C* ثم اعتماد Signature واحدة؛ لا يبدأ التطبيق حتى يتضح silhouette والـStoryboard.
- **Gate 2 — Isolated Visual Proof:** بعد تفويض بناء النموذج المنفصل، مقارنة 2.5D متقن مع 3D عند جدواه؛ تسجيل فيديو وتقييم بصري فعلي.
- **Gate 3 — Integration:** بعد موافقة مستقلة، دمج بتغييرات محدودة، اختبارات وسجل رجوع.
- **Gate 4 — Deployment:** موافقة صريحة أخرى مستقلة للنشر؛ لا يكتفى بأن المشروع يبني بنجاح.

## معيار النجاح الرئيسي

لو فتحنا أول شاشة ووجدنا عنوانًا وأزرارًا ومجموعة بطاقات متشابهة، فهذا **FAIL** حتى لو كان الكود منظمًا والألوان جميلة. النجاح أن يُفهم دور كل حركة، وتعمل أحداث الـTimeline والـCard Dealer والـAtlas مع نفس Insight، وأن تكون التجربة واضحة وممتازة على الموبايل، وأن تتحقق صحة المصادر والـFallback.
