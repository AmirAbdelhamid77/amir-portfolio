// Local-source inventory and isolated editorial bank. Never changes the live feed.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { SUBJECTS, classify } from '../lib/study/taxonomy.ts';
import { batch2 } from './insight-bank-batch2.mjs';
import { batch3 } from './insight-bank-batch3.mjs';
import { batch4 } from './insight-bank-batch4.mjs';
import { locateEvidence } from './insight-source-evidence.mjs';
const dir = 'docs/daily-insight-bank-20261106';
fs.mkdirSync(dir, {recursive:true});
const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const units=[];
function headings(x, out=[]) {
 if(Array.isArray(x)) x.forEach(v=>headings(v,out));
 else if(x && typeof x==='object') {
  if(x.type==='heading'||/^h[1-6]$/.test(x.type??'')) out.push({title:x.text,anchor:x.anchor??null});
  for(const [k,v] of Object.entries(x)) if(k!=='headings'&&k!=='subsections'&&typeof v==='object') headings(v,out);
 } return out;
}
function add(key,subject,topic,title,path,pointer,data,kind='lesson',href=null) {
 units.push({key,subject,topic,title,path,pointer,kind,href,sha256:hash(data),subtopics:headings(data),review:'inventory_only',data});
}
const stats='content/statistics/source.json';
read(stats).sections.forEach((s,i)=>add('stats:'+s.id,'statistics',classify('statistics',s.title).topic,s.title,stats,'/sections/'+i,s,'lesson','/learn/statistics/source/'));
const sql='content/sql/vault.json';
const sqlIndex=read('content/sql/index.json');
read(sql).pages.forEach((p,i)=>add('sql:'+p.module+':'+p.role+':'+p.id,'sql',p.topic,p.title,sql,'/pages/'+i,p,'lesson',sqlIndex.pages.find(x=>x.id===p.id)?.href??null));
const viz='content/data-viz/pages.json';
const vizLessons=read('content/data-viz/curriculum.json').lessons;
read(viz).forEach((p,i)=>{const l=vizLessons.find(l=>l.source===p.slug);add('viz:'+p.slug,'visualization',classify('visualization',p.title).topic,p.title,viz,'/'+i,p,'lesson',l?`/learn/${l.section==='ar'?'ar/':''}${l.slug}/`:null);});
const notes='content/fabric/notes.json';
read(notes).forEach((p,i)=>p.chapters.forEach((c,j)=>add('note:'+p.pack+':'+c.id,'fabric',classify('fabric',c.title).topic,c.title,notes,`/${i}/chapters/${j}`,c,'note','/lab/dp-600/resources/')));
const academy='content/academy/lessons.json';
read(academy).tracks.forEach((t,i)=>t.lessons.forEach((l,j)=>{const subject=t.track==='power-bi'?'power-bi':'fabric';add('academy:'+t.track+':'+l.slug,subject,classify(subject,l.title).topic,l.title,academy,`/tracks/${i}/lessons/${j}`,l,'lesson',`/learn/academy/${t.track}/${l.slug}/`);}));
for(const slug of ['python','excel','fundamentals','power-bi','sql','statistics','fabric-rti']) {
 const path=`content/exams/${slug}.json`, subject=slug==='fundamentals'?'analysis':slug==='fabric-rti'?'fabric':slug;
 read(path).questions.forEach((q,i)=>add('question:'+q.id,subject,classify(subject,q.topic).topic,q.prompt,path,'/questions/'+i,q,'question','/lab/'+slug+'/?question='+q.id));
}
const live='content/knowledge/insights.json';
read(live).items.forEach((x,i)=>add('existing:'+x.id,'fabric','ingestion',x.title,live,'/items/'+i,x,'existing_insight',x.lessonHref));
// All wording below is authored from the local units above. Examples are hypothetical prompts.
// Tuple: source key/prefix, editorial topic, title, scenario, takeaway, caveat.
const drafts = [
 ['sql:0:canonical','overview','ابدأ بمعنى الصف','قبل كتابة الاستعلام، كيف تحدد شكل النتيجة؟','أكمل جملة: الصف الواحد في النتيجة يمثل ماذا؟ ثم راجع أثر الربط والتجميع على هذا المستوى.','تحديد الأعمدة وحده لا يحدد مستوى تفصيل الصف.'],
 ['sql:0:canonical','joins','الربط قد يضاعف الإجمالي','زاد الإجمالي بعد إضافة JOIN؛ ما الذي تراجعه؟','قد يضاعف الربط الصفوف، فيرتفع مجموع القيم دون زيادة حقيقية في البيانات الأصلية.','راجع تعدد المطابقات قبل اعتبار الزيادة نتيجة صحيحة.'],
 ['sql:0:canonical','aggregation','COUNT لا يجيب دائمًا عن السؤال نفسه','هل COUNT(*) وCOUNT(column) يعدان الشيء نفسه؟','COUNT(*) يعد الصفوف؛ COUNT(expression) يتجاهل التعبيرات التي نتيجتها NULL.','اختلاف العدد قد يعكس قيمًا مفقودة، وليس صفوفًا مفقودة.'],
 ['sql:0:canonical','aggregation','الصفر يغير المتوسط','تستخدم CASE لحساب متوسط فئة محددة؛ ماذا يفعل ELSE 0؟','إدخال صفر لصفوف خارج الفئة قد يغير المتوسط والمقام بدل استبعاد تلك الصفوف.','اختر الصفر أو الاستبعاد بحسب تعريف المؤشر، لا بحسب شكل الكود.'],
 ['sql:0:canonical','windows','احتفظ بالتفاصيل عند الحاجة','تريد إجمالي المجموعة بجوار كل صف تفصيلي؛ ما نوع النتيجة المطلوب؟','Window functions تسمح بإضافة قيمة تحليلية مع الاحتفاظ بصفوف التفاصيل.','GROUP BY ينتج صفًا لكل مجموعة؛ حدّد شكل النتيجة أولًا.'],
 ['sql:0:canonical','subqueries','وجود المطابقة سؤال مستقل','تحتاج معرفة هل توجد صفوف مرتبطة، دون إضافة أعمدتها؛ بماذا تبدأ؟','EXISTS مرشح عندما يكون المطلوب التحقق من وجود صفوف مرتبطة.','هذا اختيار بحسب معنى السؤال، وليس ضمانًا بأنه الأسرع في كل استعلام.'],
 ['sql:0:canonical','aggregation','متوسط المتوسطات ليس المتوسط العام','قارنت متوسط الصفوف بمتوسط نتائج مجموعات؛ هل يلزم أن يتساويا؟','متوسط البيانات الخام ليس بالضرورة متوسط المتوسطات المحسوبة للمجموعات.','راجع وزن كل مجموعة والمقام المستخدم.'],
 ['sql:0:canonical','quality','راجع المقام قبل النسبة','نسبة تبدو صحيحة حسابيًا؛ ما السؤال الذي يسبق اعتمادها؟','حدّد الصفوف الداخلة في الحساب والمستبعدة ومعنى المقام والقيم التي تصبح NULL.','صحة عملية القسمة لا تثبت صحة تعريف المجتمع المحسوب.'],
 ['stats:s1','foundations','العينة ليست المجتمع','هل الرقم الذي حسبته يصف العينة أم المجتمع كله؟','Statistic قيمة محسوبة من العينة؛ Parameter قيمة تصف المجتمع.','الانتقال من وصف العينة إلى استنتاج عن المجتمع يحتاج استدلالًا.'],
 ['stats:s2','foundations','نوع البيانات يسبق التحليل','هل اختيار الرسم أو الاختبار يبدأ من شكله؟','نوع البيانات يؤثر في التحليلات والرسوم والاختبارات الملائمة لها.','ميّز القيم العددية ذات المعنى الحسابي عن الفئات والتصنيفات.'],
 ['stats:s3','foundations','الوصف والاستدلال سؤالان مختلفان','تلخص بياناتك ثم تعمم على المجتمع؛ هل ما زلت تصف فقط؟','الإحصاء الوصفي يلخص البيانات الموجودة؛ الاستدلالي يستنتج عن المجتمع من عينة.','لا تمنح الملخص الوصفي وحده قوة تعميم لم يختبرها.'],
 ['stats:s4','describe','القيمة المتطرفة تغيّر المتوسط','توجد قيم متطرفة؛ هل يكفي المتوسط لتمثيل القيمة النموذجية؟','المتوسط يتأثر بالقيم المتطرفة؛ الوسيط أكثر مقاومة لها.','هذا لا يجعل الوسيط أفضل تلقائيًا لكل سؤال.'],
 ['stats:s5','describe','المركز لا يصف الانتشار','مجموعتان لهما مركز متقارب؛ ما الذي تضيفه مقاييس التشتت؟','مقاييس التشتت تصف مدى انتشار القيم؛ IQR يصف انتشار النصف الأوسط من البيانات.','اختيار مقياس المركز لا يغني عن فحص التشتت.'],
 ['stats:s5','sampling','SD وSE يصفان شيئين مختلفين','هل تشتت القيم هو نفسه تشتت متوسط العينة عبر عينات متكررة؟','SD يصف تشتت البيانات، بينما SE يصف تشتت إحصائية العينة عبر العينات المتكررة.','لا تستخدم أحدهما مكان الآخر لمجرد أن كليهما يقيس تشتتًا.'],
 ['stats:s6','probability','الاستقلال ليس التنافي','حدثان لا يقعان معًا؛ هل هذا هو تعريف الاستقلال؟','التنافي يعني عدم إمكان وقوع الحدثين معًا؛ الاستقلال يعني أن معرفة أحدهما لا تغير احتمال الآخر.','هما مفهومان مختلفان، فلا تستبدل أحد التعريفين بالآخر.'],
 ['stats:s7','distributions','الاحتمال مساحة في التوزيع المستمر','كيف تقرأ احتمال وقوع قيمة بين حدين؟','في التوزيع المستمر، احتمال الفترة هو المساحة تحت المنحنى بين حديها.','احتمال نقطة واحدة بالضبط يساوي صفرًا في التوزيع المستمر.'],
 ['stats:s8','distributions','Binomial له شروط','هل كل عدّ للنجاحات يناسب التوزيع الثنائي؟','يتطلب النموذج عددًا ثابتًا من التجارب المستقلة، نتيجتين لكل تجربة، واحتمال نجاح ثابتًا.','تحقق من الشروط قبل اختيار النموذج.'],
 ['stats:s26','experiments','العشوائية تساعد المقارنة','لماذا لا نوزع المشاركين على المجموعات حسب خصائصهم؟','التوزيع العشوائي يساعد على جعل المجموعات قابلة للمقارنة وتقليل التحيز والعوامل المربكة.','المقصود توزيع المشاركين على المعالجة والضبط.'],
 ['stats:s30','relationships','Pearson يقيس العلاقة الخطية','قيمة r قريبة من صفر؛ هل انتهى فحص العلاقة؟','معامل Pearson يقيس قوة العلاقة الخطية واتجاهها.','ضعف العلاقة الخطية لا يستبعد علاقة غير خطية.'],
 ['stats:s39','hypothesis','عدم الرفض ليس إثباتًا','لم ترفض فرضية العدم؛ ما الذي لا يصح أن تقوله؟','Fail to Reject لا تعني إثبات صحة فرضية العدم.','لا تفسر p-value على أنها احتمال صحة فرضية العدم.'],
 ['stats:s39','hypothesis','الدلالة ليست الأهمية العملية','ظهرت نتيجة ذات دلالة إحصائية؛ هل هذا كاف لاتخاذ قرار؟','الدلالة الإحصائية تختلف عن الأهمية العملية.','لا تجعل وصف النتيجة بالدلالة بديلًا عن تقييم فائدتها العملية.'],
 ['viz:accessibility-color-qa','accessibility','لا تجعل اللون يحمل المعنى وحده','لو اختفى اختلاف الأحمر والأخضر، هل تظل الحالة مفهومة؟','أضف تسمية أو شكلًا أو موضعًا مناسبًا حتى لا يعتمد المعنى على اللون وحده.','اختبار التدرج الرمادي جزء من المراجعة، وليس تدقيق إتاحة كاملًا.'],
 ['viz:accessibility-color-qa','accessibility','منتصف لوحة الألوان له معنى','تختار لوحة Diverging؛ ماذا يمثل المنتصف؟','اللوحة المتباعدة تناسب قيمًا حول منتصف ذي معنى تحليلي.','وجود لونين جميلين لا يكفي لتبرير الاختيار.'],
 ['viz:accessibility-color-qa','accessibility','الفئات غير المرتبة ليست تدرجًا','هل كل اختلاف بين الفئات يعني انتقالًا من منخفض إلى مرتفع؟','Qualitative للفئات غير المرتبة؛ Sequential للتدرج من منخفض إلى مرتفع.','طابق دلالة اللون مع معنى البيانات.'],
 ['question:py-01','overview','التجميع يغير شكل النتيجة','ماذا يضيف sum بعد groupby للمنطقة؟','يجمع قيم المبيعات داخل كل منطقة، بدل إرجاع إجمالي واحد لكل الجدول.','راجع مستوى التفصيل المطلوب بعد التجميع.'],
 ['question:py-04','overview','التسمية ليست الموضع','هل الرقم داخل loc يعني موضع الصف؟','loc يختار بالتسميات؛ iloc يختار بالمواضع الصحيحة التي تبدأ من صفر.','لا تخلط تسمية رقمية للصف مع موضعه.'],
 ['question:py-08','overview','تحويل النوع ليس تنظيفًا','هل astype(float) يحذف النصوص غير الصالحة تلقائيًا؟','astype يحول نوع البيانات؛ النصوص غير القابلة للتحويل تحتاج معالجة.','لا تفترض أن التحويل يزيل الصفوف غير الرقمية.'],
 ['question:xl-02','overview','ثبّت المرجع المقصود','تنسخ معادلة وتريد بقاء المرجع إلى A1؛ ماذا تعني علامات الدولار؟','$A$1 يثبت الصف والعمود عند نسخ المعادلة.','هذا وصف للنسخ، لا ضمان لكل أنواع تعديل بنية الورقة.'],
 ['question:xl-03','overview','التلخيص لا ينظف الأصل','هل PivotTable يحذف سجلات المصدر غير الصالحة؟','PivotTable يلخص البيانات ويرشحها ويحدث عرضه من المصدر؛ لا يحذف السجلات الأصلية لتنظيفها.','تنظيف المصدر مهمة منفصلة.'],
 ['question:xl-09','overview','شكل الجدول يؤثر في التحليل','ما الذي يجعل نطاق البيانات أسهل للتحليل الموثوق؟','صف عناوين واحد بأسماء فريدة، وجدول منظم، وعدم دمج خلايا داخل البيانات.','الصفوف الفارغة للفصل قد تقطع النطاقات والفرز.'],
 ['question:fun-04','overview','المؤشر يحتاج قرارًا','جمعت رقمًا بسهولة؛ هل يكفي ذلك ليصبح KPI؟','المؤشر الجيد يرتبط بهدف، ويمكن قياسه، ويقود إلى فعل.','سهولة جمع الرقم وحدها ليست سببًا كافيًا لاختياره.'],
 ['question:fun-06','overview','الدقة الظاهرية ليست صحة','هل إضافة منازل عشرية تجعل المؤشر أكثر مصداقية؟','عدد المنازل العشرية لا يثبت صحة القياس؛ اختر دقة تخدم القرار.','لا تستخدم التنسيق لإخفاء عدم اليقين في البيانات.'],
 ['question:fun-02','overview','جودة البيانات أكثر من شكلها','تبدو البيانات مرتبة؛ ماذا يجب فحصه؟','تشمل جودة البيانات الدقة والاكتمال والحداثة والاتساق والصلاحية والتفرد.','جمال الألوان ليس بُعدًا لجودة البيانات.'],
 ['question:pbi-01','model','المقياس يستجيب للسياق','لماذا يتغير المقياس عند تغير سياق المرئي؟','المقياس يُقيّم وقت الاستعلام باستخدام سياق التصفية للمرئي.','لا تتعامل معه كقيمة ثابتة مخزنة مثل عمود محسوب في نموذج استيراد.'],
 ['question:pbi-02','model','CALCULATE يغير سياق التصفية','ما الفكرة الأساسية وراء CALCULATE؟','يقيّم تعبيرًا في سياق تصفية معدل.','تفاصيل التعديل تعتمد على التعبير والمرشحات؛ لا تعمم نتيجة دون فحصهما.'],
 ['question:pbi-07','model','SUMX يقيّم ثم يجمع','تحتاج جمع نتائج تعبير لكل صف؛ ما الفرق عن جمع عمود؟','SUMX يمر على جدول ويقيّم التعبير لكل صف ثم يجمع النتائج؛ SUM يجمع عمودًا موجودًا.','تحقق من الجدول الذي يجري التكرار عليه ومن سياق الحساب.'],
];
drafts.push(
 ['note:delta:architecture','foundations','رفع ملف لا ينشئ جدولًا تلقائيًا','رفعت CSV إلى Files؛ هل أصبح جدول SQL؟','الملفات تحفظ البيانات الخام؛ Tables تمثل بيانات قابلة للاستهلاك كجداول Delta. رفع CSV وحده لا يجعله جدول SQL.','راجع التحويل والتمثيل المطلوبين قبل توقع إمكان الاستعلام كجدول.'],
 ['note:delta:architecture','foundations','Bronze وSilver وGold مراحل','هل أسماء الطبقات تعني منتجات تخزين مختلفة؟','Bronze وSilver وGold تصف مراحل المعالجة، وليست منتجات تخزين مستقلة.','افصل مرحلة تجهيز البيانات عن المنتج الذي يخزنها.'],
 ['note:delta:delta','transform','الملف الموجود ليس بالضرورة بيانات حالية','رأيت ملفات كثيرة داخل جدول Delta؛ هل كلها جزء من حالته الحالية؟','سجل المعاملات المعتمد يحدد الملفات التي تكوّن لقطة الجدول، وليس مجرد وجود الملف على التخزين.','قد تبقى ملفات تاريخية بعد التحديث أو الحذف.'],
 ['note:delta:maintenance','transform','التنظيف ليس دمج الملفات','هل VACUUM وOPTIMIZE يؤديان المهمة نفسها؟','VACUUM ينظف ملفات البيانات القديمة المؤهلة للحذف؛ OPTIMIZE يدمج الملفات الصغيرة النشطة.','الحذف يؤثر في إمكان الاسترجاع؛ لا تنفذ تنظيفًا اعتمادًا على هذه الخلاصة وحدها.'],
 ['academy:power-bi:labs-09-enhance-power-bi-reports','report','التفاصيل تحتاج مسار وصول','كيف ينتقل القارئ من ملخص التقرير إلى تحليل تفصيلي؟','درس تحسين التقارير يستخدم صفحات drill-through للتحليل التفصيلي، وbookmarks وأزرارًا لتحسين التنقل.','هذه خلاصة هدف الدرس؛ إعداد التفاعل يحتاج الرجوع إلى خطواته.'],
 ['academy:power-bi:labs-11-secure-data-access','govern','اختبر الدور الأمني','كيف تتحقق أن كل مندوب يرى المنطقة المخصصة له؟','الدرس يبني ويختبر أدوار RLS ديناميكية اعتمادًا على هوية المستخدم لتقييد البيانات بالمنطقة.','مجرد وجود دور لا يثبت صحة نتيجة التصفية؛ الاختبار جزء من الدرس.']
);
drafts.push(...batch2);
const beforeBatch3=drafts.length;
if(batch3.length!==150)throw Error('Batch 3 must contain exactly 150 new entries');
drafts.push(...batch3);
const beforeBatch4=drafts.length;
if(batch4.length!==174)throw Error('Batch 4 must contain exactly 174 new entries');
drafts.push(...batch4);
const items=drafts.map(([key,topic,title,scenario,takeaway,caveat,excerpt],i)=>{
 const matches=units.filter(u=>u.key===key||u.key.startsWith(key+':'));
 if(matches.length!==1) throw Error('Ambiguous source '+key);
 const u=matches[0];
 const evidence=excerpt?locateEvidence(u.data,excerpt,u.pointer):null;
 if(excerpt&&!evidence)throw Error('Evidence excerpt not found for '+key+': '+excerpt);
 return {id:'hansa-bank-'+String(i+1).padStart(3,'0'),subject:u.subject,topic,title,scenario,prediction:'فكّر في الفرق أو الافتراض الذي يغيّر الإجابة.',takeaway,caveat,language:'ar',scenarioBasis:'hypothetical teaching prompt',reviewStatus:'draft',sourceReviewed:true,scientificallyVerified:false,publicationApproved:false,reviewBlockers:[u.kind==='question'?'Question explanation requires independent domain review':'Independent domain/editorial review pending'],source:{key:u.key,path:u.path,pointer:u.pointer,sha256:u.sha256},evidence,lessonHref:u.href,sourceNavigation:u.kind==='note'?`Open resources, choose pack ${u.key.split(':')[1]}, then section ${u.title}`:u.subject==='statistics'?`Find source section: ${u.title}`:null};
});
for(const u of units.filter(u=>u.kind==='existing_insight'))items.push({...u.data,id:u.data.id,subject:u.subject,topic:u.topic,language:'en',reviewStatus:'technical_review',sourceReviewed:false,scientificallyVerified:false,publicationApproved:false,reviewBlockers:['Inherited technical review; no renewed verification'],source:{key:u.key,path:u.path,pointer:u.pointer,sha256:u.sha256}});
for(const u of units){u.candidateIds=items.filter(i=>i.source.key===u.key).map(i=>i.id);u.review=u.kind==='existing_insight'?'inherited_not_reverified':u.candidateIds.length?'candidate_source_read':'inventory_only';}
const outline=SUBJECTS.map(s=>({id:s.id,title:s.title,topics:s.topics.map(([id,title])=>({id,title,sourceKeys:units.filter(u=>u.subject===s.id&&u.topic===id).map(u=>u.key),candidateIds:items.filter(x=>x.subject===s.id&&x.topic===id).map(x=>x.id)}))}));
fs.writeFileSync(`${dir}/SOURCE_INVENTORY.json`,JSON.stringify({date:'2026-11-06',scope:'Selected local teaching corpora; not a complete raw-export or scientific audit. Classification rules are organizational candidates.',subjects:outline,units:units.map(({data,...u})=>u)},null,2)+'\n');
fs.writeFileSync(`${dir}/INSIGHT_BANK.json`,JSON.stringify({schemaVersion:1,status:'editorial_staging_only',sourcePolicy:'Local content only; no external retrieval; no automatic publication.',items},null,2)+'\n');
const newBatch=items.slice(beforeBatch3,beforeBatch3+batch3.length);
const fourthBatch=items.slice(beforeBatch4,beforeBatch4+batch4.length);
fs.writeFileSync(`${dir}/BATCH4_174_INSIGHTS.json`,JSON.stringify({schemaVersion:1,batch:'batch-4',count:174,status:'draft_not_published',items:fourthBatch},null,2)+'\n');
fs.writeFileSync(`${dir}/BATCH4_174_REVIEW.md`,'# الدفعة الرابعة — 174 Insight جديدة\n\nمصادر محلية فقط؛ مسودات تنتظر المراجعة العلمية والتحريرية. المواقف أسئلة تعليمية افتراضية وليست مشاهدات حقيقية.\n\n'+fourthBatch.map(x=>`## ${x.id} — ${x.title}\n\n${x.subject} / ${x.topic}\n\n**السؤال:** ${x.scenario}\n\n**الخلاصة:** ${x.takeaway}\n\n**القيد:** ${x.caveat}\n\n**الدليل المحلي:** ${x.evidence.excerpt}\n\nالمصدر: \`${x.source.path}#${x.evidence.pointer}\`\n\nمسار التعلم: \`${x.lessonHref}\`\n`).join('\n'));
fs.writeFileSync(`${dir}/BATCH3_150_INSIGHTS.json`,JSON.stringify({schemaVersion:1,batch:'batch-3',count:150,status:'draft_not_published',items:newBatch},null,2)+'\n');
fs.writeFileSync(`${dir}/BATCH3_150_REVIEW.md`,'# الدفعة الثالثة — 150 Insight جديدة\n\nمن المصادر المحلية فقط. جميعها مسودات، لم تعتمد علميًا ولم تنشر. الأمثلة أسئلة تعليمية افتراضية وليست مشاهدات حقيقية.\n\n'+newBatch.map(x=>`## ${x.id} — ${x.title}\n\n${x.subject} / ${x.topic}\n\n**السؤال:** ${x.scenario}\n\n**الخلاصة:** ${x.takeaway}\n\n**القيد:** ${x.caveat}\n\n**الدليل المحلي:** ${x.evidence.excerpt}\n\nالمصدر: \`${x.source.path}#${x.evidence.pointer}\`\n\nمسار التعلم: \`${x.lessonHref}\`\n`).join('\n'));
fs.writeFileSync(`${dir}/TOPIC_LIST.md`,'# Daily Insight — source/topic outline\n\nInventory is not full source review. Subtopics are extracted source headings, not invented syllabus.\n\n'+outline.map(s=>`## ${s.title}\n\n`+s.topics.map(t=>`### ${t.title}\n\nCandidates: ${t.candidateIds.length}; local source units: ${t.sourceKeys.length}.\n\n`+t.sourceKeys.map(k=>{const u=units.find(x=>x.key===k);return `- ${u.title} — \`${u.key}\` (${u.review})\n`+u.subtopics.map(h=>`  - ${h.title}\n`).join('');}).join('')).join('\n')).join('\n'));
fs.writeFileSync(`${dir}/BANK_REVIEW.md`,'# Daily Insight — editorial review\n\nAll entries below are excluded from publication pending review. Source pointers refer to local JSON; question-derived entries need independent review.\n\n'+items.map(x=>`## ${x.id} — ${x.title}\n\n${x.subject} / ${x.topic} · ${x.reviewStatus}\n\n**الموقف:** ${x.scenario}\n\n**الخلاصة:** ${x.takeaway}\n\n**القيد:** ${x.caveat}\n\nSource: \`${x.source.path}#${x.source.pointer}\`\n\nLesson route: \`${x.lessonHref??'pending'}\`\n${x.sourceNavigation?'\n'+x.sourceNavigation+'\n':''}${x.evidence?'\n**مقتطف الدليل:** '+x.evidence.excerpt+'\n\nEvidence pointer: `'+x.evidence.pointer+'`\n':''}`).join('\n'));
console.log(JSON.stringify({subjects:outline.length,topics:outline.reduce((n,s)=>n+s.topics.length,0),sourceUnits:units.length,subheadings:units.reduce((n,u)=>n+u.subtopics.length,0),candidates:items.length,bySubject:Object.fromEntries(SUBJECTS.map(s=>[s.id,items.filter(x=>x.subject===s.id).length]))}));
