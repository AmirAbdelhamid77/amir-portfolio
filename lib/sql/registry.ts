import index from '@/content/sql/index.json';
import type {StudyRecord} from '@/lib/study/taxonomy';
import type {LearningUnit} from '@/lib/study/learning-path';
import type {SearchDocument} from '@/lib/search/query';

export const SQL_INDEX=index;
export const SQL_CANONICAL=index.pages.filter(p=>p.module!==null);
export const SQL_TOPICS=index.topics;
export function sqlRecords():StudyRecord[]{return [
 ...index.pages.map(p=>({id:'sql-page-'+p.id,title:p.title,href:p.href,subject:'sql' as const,topic:p.topic,kind:p.role==='canonical'||p.role==='window-chapter'?'read' as const:'reference' as const,context:p.objective,language:'mixed',source:p.id,basis:p.role==='canonical'?'Explicit canonical module ownership':'Source role and reviewed supporting placement; not a second syllabus',status:'Preserved Notion source; domain qualifications appear with the source'})),
 ...index.drills.map(q=>({id:q.id,title:q.prompt,href:q.href,subject:'sql' as const,topic:q.topic,kind:'question' as const,context:q.status,language:'mixed',source:q.sourceId,basis:'Question explicitly present in the source; canonical owner matched by concept',status:q.status})),
 {id:'sql-grain-lens',title:'Trace JOIN fan-out at the row grain',href:'/learn/sql/05/#grain-lens',subject:'sql',topic:'joins',kind:'experiment',context:'Compare the source fixture before and after pre-aggregation.',language:'en',source:SQL_CANONICAL[5].id,basis:'Module 05 teaching example: two orders and two payments',status:'Deterministic illustrative model; no database execution'},
 ];}
export function sqlDocuments():SearchDocument[]{return sqlRecords().map(r=>({id:r.id,title:r.title,url:r.href,kind:r.kind==='question'?'question':r.kind==='experiment'?'lab':r.kind==='reference'?'tool':'lesson',summary:r.context,topic:['SQL',r.topic],language:'mixed',sourceId:r.source,keywords:['SQL',r.topic,r.kind]}));}
export function sqlUnits():LearningUnit[]{return SQL_CANONICAL.map(p=>({
 id:'sql-module-'+String(p.module).padStart(2,'0'),title:p.title,subject:'sql',topics:[p.topic],stage:p.module!<2?'Foundation':p.module!<14?'Applied':'Advanced',kind:'lesson',href:p.href,objective:p.objective,sourcePointer:p.url,coverage:'Canonical source body preserved, with explicit source errata and review limits',prepare:[],
 lessonPrerequisites:p.module!>0?['sql-module-'+String(p.module!-1).padStart(2,'0')]:[],
 questions:[...index.drills.filter(q=>q.module===p.module).map(q=>({id:q.id,title:q.prompt,href:q.href,basis:'source-explicit' as const,reason:'This question appears in the canonical module or the linked interview layer; it is an unscored source self-check.'})),...index.legacyQuestions.filter(q=>q.module===p.module).map(q=>({id:q.id,title:q.prompt,href:q.href,basis:'reviewed-concept-match' as const,reason:'Existing question ID matched to this canonical concept. Its answer and grading remain unchanged; the link opens the existing single-question practice flow.'}))],
 applications:p.module===5?[{id:'sql-grain-lens',title:'Inspect row multiplication',href:p.href+'#grain-lens',basis:'source-explicit',reason:'Module 05 supplies the two-orders/two-payments fixture.'}]:[],reviewPoints:[p.objective],reflection:'State the input grain, output grain, NULL behavior and one edge case for a query in this module.',caveat:'The 00–17 order is the source-declared reading sequence, not a mastery lock. Source preservation does not establish that every SQL example was executed or independently validated.',
 }));}
