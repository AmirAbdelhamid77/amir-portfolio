import {sourceDocuments} from './source-documents';
import {sqlRecords,SQL_INDEX} from '@/lib/sql/registry';
import fabric from '@/content/fabric/index.json';
import additions from '@/content/fabric/additions/questions.json';
import notes from '@/content/fabric/notes.json';
import revisions from '@/content/fabric/r11/questions.json';
import {LESSON,TRANSFER} from '@/lib/academy/ingestion';
import feed from '@/content/knowledge/insights.json';
import {eligibleInsights} from '@/lib/knowledge/insights';
import {SUBJECTS,classify,type StudyRecord,type SubjectId} from './taxonomy';
import {CLASSIFICATION_REVIEW,reviewedNotePlacement} from './classification-review';
import {REFERENCE_RECORDS,HANDS_ON_RECORDS} from './curated';
import {ACADEMY_LESSONS,academyLessonHref} from '@/lib/academy/corpus';
function clean(s:string){return s.replace(/<[^>]*>/g,' ').replace(/\\n/g,' ').replace(/\s+/g,' ').trim();}
const PACK_CONTEXT:Record<string,string>={delta:'transform',warehouse:'query',pipelines:'ingestion',scd:'model',eventhouse:'streaming',video06:'security',video07:'security',video08:'security',video09:'delivery',video10:'delivery',video11:'streaming',video12:'delivery',video14:'ingestion',video15:'security',video16:'query',video19:'ingestion',video20:'transform',video21:'delivery'};
function fabricPlacement(text:string,pack:string){const m=classify('fabric',text);return m.topic==='overview'&&PACK_CONTEXT[pack]?{topic:PACK_CONTEXT[pack],basis:'Existing source pack context; no prerequisite or answer-validation claim'}:m;}
export function studyRecords():StudyRecord[]{
 const records:StudyRecord[]=[];
 for(const doc of sourceDocuments()){
  // The R11 search view reuses the existing addition IDs below, never a second question.
  // hands-on lab pages are added directly with their own subject/topic below.
  if(doc.id.startsWith('r11-')||doc.id.startsWith('sql-')||doc.id.startsWith('hands-on-')||doc.id.startsWith('academy-'))continue;
  const href=doc.url, path=href.split(/[?#]/)[0];
  if(!/^\/(learn|explore|practice|lab)\//.test(path)||/catalogue|drafts|atlas/.test(path))continue;
  let subject:SubjectId=path.includes('statistics')||href.includes('/lab/statistics')?'statistics':path.includes('dp-600')?'fabric':path.includes('/lab/power-bi')?'power-bi':path.includes('/lab/python')?'python':path.includes('/lab/excel')?'excel':path.includes('/lab/sql')?'sql':path.includes('/lab/fundamentals')?'analysis':path.includes('/lab/fabric-rti')?'fabric':path.includes('/learn/fabric-rti')?'fabric':'visualization';
  if(doc.id==='page-home')continue;
  if((subject==='visualization')&&doc.topic.some(t=>t.toLowerCase().includes('statistics')))subject='statistics';
  const sqlModule=subject==='sql'&&doc.sourceId?SQL_INDEX.legacyMap[doc.sourceId as keyof typeof SQL_INDEX.legacyMap]:undefined;
  const mapping=sqlModule!==undefined?{topic:SQL_INDEX.topics[sqlModule],basis:'Explicit existing question ID to canonical SQL module concept match; original answer retained'}:classify(subject,[doc.title,...doc.topic].join(' '),subject==='statistics'?doc.topic.find(t=>SUBJECTS[1].topics.some(a=>a[0]===t)):undefined);
  if(path.startsWith('/learn/fabric-rti/')){mapping.topic='streaming';mapping.basis='Course placement: part of the Fabric Real-Time Intelligence course. Organizational placement, not a prerequisite or execution claim.';}
  const destination=doc.id.startsWith('q-')&&doc.sourceId?`${href}?question=${encodeURIComponent(doc.sourceId)}`:href;
  records.push({id:doc.id,title:doc.title,href:destination,subject,...mapping,kind:doc.id.startsWith('exam-')?'reference':doc.kind==='question'?'question':doc.kind==='lab'?'experiment':doc.kind==='tool'?'reference':'read',context:doc.summary,language:doc.language,source:doc.sourceId??'Existing learning catalogue',status:doc.id.startsWith('q-')?'Start practice to open this question as an unscored drill; mock exams remain complete':'Existing published surface; review labels remain at source'});
 }
 for(const q of fabric){const mapping=fabricPlacement([q.topic,q.title,...q.subjects].join(' '),q.pack);records.push({id:q.id,title:q.title,href:`/lab/dp-600/explore/?question=${encodeURIComponent(q.id)}`,subject:'fabric',...mapping,kind:'question',context:q.prompt,language:'en',source:`${q.pack} / ${q.sourceId}`,status:'Existing bank; original source/answer status retained'});}
 for(const q of additions){const revision=revisions.find(r=>r.hansaId===q.id);const text=revision?.stem??clean(q.stemHtml);const status=revision?`${revision.scientificStatus} · ${revision.reviewNote}`:q.review;const subject=q.exam==='PL-300'?'power-bi':'fabric';const mapping=classify(subject,text);records.push({id:q.id,title:text.slice(0,170),href:`/lab/dp-600/explore/?question=${encodeURIComponent(q.id)}`,subject,...mapping,kind:'question',context:`${q.exam} · ${status}`,language:'en',source:q.sourceRecords.join(', ')+(revision?' · current R11 revision':''),status:q.blockers.length&&!revision?'Existing source with blockers — inspect before use':status});}
 for(const pack of notes)for(const chapter of pack.chapters){const mapping=reviewedNotePlacement(pack.pack,chapter.title)??fabricPlacement(chapter.title,pack.pack);records.push({id:`note-${pack.pack}-${chapter.id}`,title:chapter.title,href:`/lab/dp-600/resources/`,subject:'fabric',...mapping,kind:'read',context:chapter.points.join(' '),language:'en',source:`Learning notes / ${pack.pack} / ${chapter.id}`,status:'Existing note; open resources and choose the named pack/section'});}
 const base={subject:'fabric' as const,topic:'ingestion',basis:'Existing authored ingestion lesson / scenario metadata',language:'en',source:LESSON.id,status:LESSON.origin};
 records.push({...base,id:LESSON.id,title:LESSON.title,href:LESSON.href+'#understand',kind:'read',context:LESSON.objective+' Before starting: '+LESSON.prerequisites.join('; ')},{...base,id:LESSON.id+'-experiment',title:'Compare access and movement constraints',href:LESSON.href+'#experiment',kind:'experiment',context:LESSON.objective});
 for(const q of TRANSFER)records.push({...base,id:q.id,title:q.title,href:LESSON.href+'#'+q.id,kind:'question',context:q.prompt});
 for(const insight of eligibleInsights(feed.items,true))records.push({...base,id:insight.id,title:insight.title,href:'/?insight='+insight.id+'#today',kind:'experiment',context:insight.topic,source:'Dated Daily Insight / '+insight.date});
 // Curated corpus layers (scripts/build-study-catalogue.mjs): linked external
 // references (LINK_ONLY — link + gloss, never republished) and hands-on lab
 // scaffolds published at /lab/hands-on/. Placement arrives pre-validated from
 // lib/study/curated.ts.
 records.push(...HANDS_ON_RECORDS,...REFERENCE_RECORDS);
 for(const lesson of ACADEMY_LESSONS){const subject=lesson.track==='power-bi'?'power-bi':'fabric';const mapping=classify(subject,lesson.title+' '+(lesson.module??''));records.push({id:'academy-'+lesson.track+'-'+lesson.slug,title:lesson.title,href:academyLessonHref(lesson),subject,...mapping,kind:'read',context:(lesson.description??lesson.title)+' Mirrored MIT courseware lab from the MicrosoftLearning source repository; Microsoft-authored, reproduced with attribution.',language:'en',source:'MicrosoftLearning courseware (MIT) / '+lesson.sourcePath,status:'MIT-licensed courseware mirrored with attribution and source link. Microsoft authors and maintains the content; the source is authoritative. Review labels remain at source.'});}
 for(const r of records){const correction=CLASSIFICATION_REVIEW[r.id];if(correction){r.topic=correction.topic;r.basis=`Content-reviewed correction: ${correction.reason} Evidence: ${correction.evidence}`;}}
 records.push(...sqlRecords());
 const order={read:0,experiment:1,question:2,reference:3};return records.sort((a,b)=>order[a.kind]-order[b.kind]);
}
