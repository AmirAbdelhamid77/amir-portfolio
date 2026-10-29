// Search and the learning registry consume the same source adapter.
// Search never owns the learning taxonomy or controls publication eligibility.
import { sourceDocuments } from "@/lib/study/source-documents";
import { SUBJECTS, topicHref } from "@/lib/study/taxonomy";
import type { SearchDocument } from "./query";
export function buildSiteSearchIndex(): SearchDocument[] {
  const documents=sourceDocuments().map(doc=>doc.id==='page-home'?{...doc,url: "/",}:doc);
  for(const doc of documents)if(doc.id==='page-learn-catalogue'||doc.id==='page-practice-catalogue'){doc.summary='Subject-led learning: explanations, experiments, questions and sources grouped in their topic context. Unapproved intake remains isolated.';doc.title=doc.id==='page-learn-catalogue'?'Learn by subject and topic':'Practise by subject and topic';}
  for(const subject of SUBJECTS)for(const [topic,title] of subject.topics)documents.push({id:`topic-${subject.id}-${topic}`,title:`${title} — ${subject.title}`,url:topicHref(subject.id,topic),kind:'course',summary:subject.goal,topic:[subject.title,title],language:'en',keywords:['learning path','topic','practice','explanation']});
  return documents;
}
