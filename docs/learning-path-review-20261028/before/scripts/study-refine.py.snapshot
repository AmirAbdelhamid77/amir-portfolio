from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'components/study/directory.tsx';s=p.read_text(encoding='utf8').replace('<ol className="study-topic-list">','{subject?<ol className="study-topic-list">').replace('})}</ol></section>','})}</ol>:<Link className="study-open" href={`/study/${s.id}/${practice?\'?mode=question\':\'\'}`}>Explore {s.topics.length} topics ↗</Link>}</section>');p.write_text(s,encoding='utf8')
p=r/'app/study/[subject]/page.tsx';p.write_text("import {StudyDirectory} from '@/components/study/directory';import {SUBJECTS} from '@/lib/study/taxonomy';\nexport const dynamicParams=false;export function generateStaticParams(){return SUBJECTS.map(s=>({subject:s.id}));}\nexport default async function Page({params}:{params:Promise<{subject:string}>}){return <StudyDirectory subject={(await params).subject}/>;}\n",encoding='utf8')
# Subject pages keep the intent in the browser, without making static pages depend on request search params.
p=r/'components/study/directory.tsx';s=p.read_text(encoding='utf8').replace("href={`/study/${s.id}/${practice?'?mode=question':''}`}" ,"href={`/study/${s.id}/`}");p.write_text(s,encoding='utf8')
