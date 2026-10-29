# Hansa Creative Intelligence v1.0 — Skill جاهزة للـAgent

حزمة مستقلة لتفعيل التفكير البصري والإبداعي تلقائيًا أثناء تطوير Hansa. **لا تحتوي على تغييرات في تطبيق Hansa**، ولا تعدّ مراجعة مباشرة لأحدث نسخة من الريبو؛ تم إعدادها اعتمادًا على سياق المشروع ودليل `HANSA_MASTER_AGENT_REFERENCE_v1.0.md` و`AGENTS.md` السابقين.

## ماذا تفعل؟

- توسّع سلوك الـAgent من "نفّذ واجهة" إلى "اكتشف فرصة بصرية → اختَر تمثيلًا صحيحًا → اصنع تجربة متميزة → اختبرها → حسّنها".
- تجعل D3.js وMotion اختيارين ذكيين حسب نوع المعلومات، وليس إضافتين افتراضيتين.
- تعالج تكرار النتيجة الـflat، لكن بدون أن تفرض animations على كل فقرة أو charts بلا بيانات.
- تحفظ هوية Hansa وbeUI والـNext static export وسياسة التطوير بالتوازي مع Agent محلي.

## مكان التثبيت الموصى به (Codex وOpenCode)

انسخ المجلد التالي **بمحتوياته** إلى جذر المشروع:

```
D:\BeUI\amir-portfolio\.agents\skills\hansa-creative-intelligence\
    SKILL.md
    references\...
```

حزمة ZIP تبدأ بمجلد `.agents/skills`؛ استخرجها من مجلد البناء الحالي أو استخدم PowerShell المثبّت الآمن.

## تثبيت بدون الكتابة فوق ملف موجود

من PowerShell داخل مجلد الحزمة المستخرجة (استبدل المسار إذا تغير):

```powershell
# عرض التغييرات المتوقعة فقط (لا يغير شيئًا)
.\install_hansa_skill.ps1 -ProjectRoot 'D:\BeUI\amir-portfolio'

# تثبيت الـSkill وإضافة توجيه تفعيل تلقائي إلى AGENTS.md
.\install_hansa_skill.ps1 -ProjectRoot 'D:\BeUI\amir-portfolio' -Apply -UpdateAgents
```

المثبت **يرفض استبدال Skill موجودة** ويرفض عمل `AGENTS.md` من الصفر، ويضيف مقطعًا محددًا مرة واحدة فقط؛ لا ينفذ npm install، ولا deploy، ولا يعدّل أي كود تطبيقي. اعمل التثبيت فقط عندما يطمئن الـAgent إلى عدم تعارضه مع تحرير جارٍ لـAGENTS.md. لو في تعارض، خليه يراجع الـdiff ويدمج الإرشادات يدويًا.

## التفعيل المستمر

- **Codex:** `.agents/skills/...` مسار قياسي للاكتشاف. يمكن تفعيل Skill صراحةً بكتابة `$hansa-creative-intelligence` أو عبر اختيار Skills، ويستطيع Codex اختيارها ضمنيًا من وصفها. عند مشكلة اكتشاف، أعِد تشغيل جلسة Codex.
- **OpenCode:** يدعم نفس مسار `.agents/skills/...`، ويحمل الـSkill حسب الملاءمة. وصف المهارة صُمم ليشمل مهام page/UI/visual حتى لو المستخدم لم يذكر animation.
- وجود إشارة صريحة في `AGENTS.md` يجعل الاستدعاء قاعدة في كل UI task، مع الاحتفاظ بقدرة الـAgent على عدم استخدام charts إذا لم يكن لها مبرر علمي أو تعليمي.

## تجارب قبول مقترحة بعد التثبيت

1. "Improve the DP-600 Shortcut vs Mirroring learning module" → ينبغي أن يقترح مقارنة ذات حالة تفاعلية، لا لوحة cards فقط.
2. "Enhance the Knowledge Atlas layout" → ينبغي أن يفحص الـedges والـnodes الحقيقية، ويبني تفاعل دوائر وzoom أو list بديل على الموبايل.
3. "Make the Window Functions article easier to learn" → يفكر في row-level execution trace مطابق لحسابات معروفة.
4. "Fix a TypeScript compiler error in a data parser" → **لا** يضيف رسوم أو animations؛ الـSkill لا تُفرض على backend tasks.
5. "Add a statistics chart" → يبحث عن بيانات حقيقية أو simulation معلّم بوضوح، ويفحص precision وaccessibility قبل التزيين.

## أين التفاصيل؟

- `SKILL.md`: تعليمات التشغيل الفعلية.
- `references/`: قواعد الإبداع، اختيار charts/D3، motion، الأمثلة، QA وanti-patterns.
- `AGENTS_ADDENDUM.md`: بند صغير للإضافة دون استبدال `AGENTS.md` الحالي.
- `AGENT_INSTALL_PROMPT.md`: رسالة واحدة لإرسالها إلى الـAgent مع الحزمة.
- `scripts/verify_skill.py`: تحقق بنيوي سريع فقط، **وليس** اختبارًا للواجهة الفعلية.
- `MANIFEST_SHA256.txt`: بصمات الملفات لضبط سلامة الحزمة.

## تحذير عملي

بمجرد تثبيت Skill، لا يعني ذلك أن كل Agent سينفذ كل توجيه بدقة 100%. نجاحها يقاس على UI tasks حقيقية، browser QA وreview ثم تحسينات على الـSkill لو سلوك الـAgent بقي generic. لم يتم تعديل الـrepository الحقيقي أو إجراء smoke tests عليه أثناء إنشاء الحزمة.
