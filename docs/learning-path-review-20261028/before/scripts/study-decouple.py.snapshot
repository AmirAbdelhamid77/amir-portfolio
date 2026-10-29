from pathlib import Path
import re
r=Path(__file__).resolve().parents[1];p=r/'lib/search/documents.ts';s=p.read_text(encoding='utf8');s=s.replace('import { SUBJECTS, topicHref } from "@/lib/study/taxonomy";\n','');s=re.sub(r'  for\(const subject of SUBJECTS\)for\(const \[topic,title\] of subject.topics\)documents.push\(.*?\);\n','',s);s=s.replace('export function buildSiteSearchIndex()', 'export function sourceDocuments()');(r/'lib/study/source-documents.ts').write_text(s,encoding='utf8')
p.write_text('''// Search and the learning registry consume the same source adapter.
// Search never owns the learning taxonomy or controls publication eligibility.
import { sourceDocuments } from "@/lib/study/source-documents";
import { SUBJECTS, topicHref } from "@/lib/study/taxonomy";
import type { SearchDocument } from "./query";
export function buildSiteSearchIndex(): SearchDocument[] {
  const documents=sourceDocuments().map(doc=>doc.id==='page-home'?{...doc,url: "/",}:doc);
  for(const subject of SUBJECTS)for(const [topic,title] of subject.topics)documents.push({id:`topic-${subject.id}-${topic}`,title:`${title} — ${subject.title}`,url:topicHref(subject.id,topic),kind:'course',summary:subject.goal,topic:[subject.title,title],language:'en',keywords:['learning path','topic','practice','explanation']});
  return documents;
}
''',encoding='utf8')
p=r/'lib/study/server.ts';s=p.read_text(encoding='utf8').replace("import {buildSiteSearchIndex} from '@/lib/search/documents';","import {sourceDocuments} from './source-documents';").replace('buildSiteSearchIndex()','sourceDocuments()');p.write_text(s,encoding='utf8')
