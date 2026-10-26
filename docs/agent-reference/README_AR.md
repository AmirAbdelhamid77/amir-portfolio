# حزمة Hansa المرجعية المدمجة للـ AI Agents — v1.1

**قرار الدمج:** الاحتفاظ بدليل v1.0 الرئيسي دون أي تعديل، وإضافة سياسة الـ Adaptive Visualization كملحق متخصص، مع تعديل نقطة الدخول (`AGENTS.md`) وتحديث Router كي لا ينحاز تلقائيًا لـ ECharts عند وجود Recharts أو Observable Plot أو غيرها.

## التوزيع

- `AGENTS.md` — ضع هذا الملف في جذر Repository. فيه ترتيب القراءة، أولوية التعليمات، وقواعد تقليل الـ Tokens.
- `docs/agent-reference/HANSA_MASTER_AGENT_REFERENCE_v1.0.md` — المرجع الشامل الأساسي (النص الأصلي كما هو).
- `docs/agent-reference/HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md` — سياسة دقيقة ومتخصصة لاختيار وتنفيذ الرسوم والمحاكاة والأدوات بشكل متكيف.
- `docs/agent-reference/CAPABILITY_ROUTER.yaml` — مرشح قدرات محدث؛ قوائم المكتبات مجرد احتمالات، وليست أوامر ثابتة.
- `docs/agent-reference/CONTENT_BRIEF_TEMPLATE.yaml` — قالب الصفحات الأصلي محفوظ دون تعديل.
- `docs/agent-reference/PACKAGE_MANIFEST.json` — محتويات وحجم وبصمات SHA256.

## الاستخدام
1. استخرج محتويات ZIP في جذر المشروع، مع الحفاظ على بنية المجلدات.
2. راجع أي `AGENTS.md` موجود سابقًا قبل استبداله، وادمج تعليماته المهمة بدل فقدها.
3. في بداية مهمة كبيرة أو مع Agent جديد: اقرأ `AGENTS.md` ثم الـ Master كاملاً، وملف Policy عند الحاجة للرسوم/المحاكاة، ثم ملفات المشروع الحقيقية.
4. في المهام اللاحقة الصغيرة: لا تعيد قراءة كل المراجع؛ اقرأ الأقسام ذات الصلة وملفات الكود/المحتوى المتأثرة.
5. أنشئ Content Brief ووثّق اختيار المكتبة ومصدر البيانات ونتائج الاختبارات لكل مكوّن تعليمي مهم.
6. لا تثبت جميع المكتبات. اختر بالمقارنة بين المنفعة والدقة والأداء والتكلفة والتكرار، وتأكد من التوافق والترخيص وقت التنفيذ.

## أولوية القواعد
طلب المستخدم > حقائق المشروع والمصادر المتحقق منها > القواعد الأساسية بالـ Master > تفاصيل الرسوم بالـ Adaptive Policy > اقتراحات Router > الأمثلة التوضيحية. المستندات المرجعية **ليست** تدقيقًا فعليًا للموقع أو ملفات Notion.

## برومبت التشغيل

```text
Use AGENTS.md as the Hansa agent entry point. Preserve its reference hierarchy.
Read the master guide on first onboarding. Read the adaptive visualization
policy when planning charts, simulations, interactive learning visuals or
library selection. Audit the actual repository and source exports first.
Keep source coverage and content correctness non-negotiable. Decide educational
representation before technology. Treat CAPABILITY_ROUTER.yaml as candidate
hints only and select the smallest fit-for-purpose solution after comparison.
Implement in testable increments, preserve Next.js static export and Cloudflare
Free compatibility, verify the actual UX and mathematics, and document evidence.
For small follow-up tasks, consult only affected files and relevant guide
sections, not the full reference pack again.
```

## ملحوظة حماية
إذا كان مشروعك يتضمن ملفات AGENTS.md أو Router معدّلة بالفعل، راجعها وادمج السلوك المفيد بدل نسخ الملف الجديد عليها بطريقة تُفقد تعليمات خاصة بالمشروع.
