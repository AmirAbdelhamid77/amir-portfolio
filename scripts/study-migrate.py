import pathlib,re
r=pathlib.Path(__file__).resolve().parents[1]
for rel,title,props in [('app/learn/catalogue/page.tsx','Learn',''),('app/practice/catalogue/page.tsx','Practise','practice')]:
 (r/rel).write_text("import {StudyDirectory} from '@/components/study/directory';\nexport const metadata={title:'"+title+" — subjects, topics and activities'};\nexport default function Page(){return <StudyDirectory "+props+"/>;}\n",encoding='utf8')
p=r/'lib/site.ts';s=p.read_text(encoding='utf8');s=re.sub(r'export const NAV = \[.*?\] as const;', '''export const NAV = [
  { href: "/", label: "Today", description: "Daily insight and editions" },
  { href: "/learn/catalogue", label: "Learn", description: "Subjects, topics and explanations" },
  { href: "/practice/catalogue", label: "Practice", description: "Questions in their learning context" },
  { href: "/learn/dp-600/atlas/", label: "Atlas", description: "Evidence and publication state" },
  { href: "/about", label: "About", description: "Background and professional work" },
] as const;''',s,count=1,flags=re.S)
s=re.sub(r'export const LANDING_NAV = \[.*?\] as const;', 'export const LANDING_NAV = NAV;',s,count=1,flags=re.S)
s=s.replace('export const SECONDARY_NAV = [','export const SECONDARY_NAV = [\n  { href: "/work", label: "Work & case studies" },\n  { href: "/services", label: "Services" },')
p.write_text(s,encoding='utf8')
