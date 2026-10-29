from pathlib import Path
r=Path(__file__).resolve().parents[1];p=r/'components/study/directory.tsx';s=p.read_text(encoding='utf8');s="import {StudyIntentLink} from './intent-link';\n"+s
s=s.replace('<Link href={`/study/${s.id}/`}>{s.title}</Link>','<StudyIntentLink practice={practice} href={`/study/${s.id}/`}>{s.title}</StudyIntentLink>')
s=s.replace('<Link href={topicHref(s.id,id)+(practice?\'?mode=question\':\'\')}>','<StudyIntentLink practice={practice} href={topicHref(s.id,id)}>').replace('<span aria-hidden="true">↗</span></Link></li>','<span aria-hidden="true">↗</span></StudyIntentLink></li>')
s=s.replace('<Link className="study-open" href={`/study/${s.id}/`}>Explore {s.topics.length} topics ↗</Link>','<StudyIntentLink practice={practice} className="study-open" href={`/study/${s.id}/`}>Explore {s.topics.length} topics ↗</StudyIntentLink>')
p.write_text(s,encoding='utf8')
