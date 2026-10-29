import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(), intake=path.join(root,'intake/sql-notion-2026-10-28');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const read=n=>JSON.parse(fs.readFileSync(path.join(intake,n),'utf8'));
const normalize=p=>String(p.text??p.content).replace(/\\n/g,'\n').replace(/\\"/g,'"');
const body=p=>{const t=normalize(p);return t.match(/<content>\n?([\s\S]*?)\n?<\/content>/)?.[1]??t;};
const plain=s=>s.replace(/<\/?(?:b|i|code|strong|em)>/g,'').replace(/\\([_*])/g,'$1').replace(/\*\*/g,'');
const files=fs.readdirSync(intake).filter(n=>n.endsWith('.json')&&n!=='assets.json').sort();
const exports=files.map(name=>({name,pages:read(name).pages}));
const canonical=[...read('Hansa_SQL_Canonical_00_08.json').pages,...read('Hansa_SQL_Canonical_09_17.json').pages];
const topics=['overview','foundations','schema','types-null','filtering','joins','aggregation','subqueries','sets','windows','time','text','analytics','quality','transactions','design','performance','warehouse'];
const objectives=[
 'Choose a SQL technique from the required population and output grain.',
 'Distinguish logical query meaning, physical execution, filtering and grouping.',
 'Inspect keys, relationships, constraints and missing values before querying.',
 'Reason about data types, casting and three-valued NULL logic.',
 'Define row populations and conditional classifications with explicit precedence.',
 'Predict JOIN cardinality and prevent duplicated measures.',
 'Choose the grouping grain and define a correct KPI denominator.',
 'Choose subqueries, EXISTS and CTEs from result shape and dependency.',
 'Combine compatible rows while controlling duplicates and set difference.',
 'Distinguish partition, order and frame while preserving row detail.',
 'Define time buckets, missing periods and independent event sequences.',
 'Clean and classify text without confusing NULL, empty strings and spaces.',
 'Translate the MovieNow business question into a grain-safe analytical query.',
 'Validate uniqueness, completeness, domains, freshness and reconciliation.',
 'Plan safe data changes with transactions and explicit validation.',
 'Design keys, relationships, grain and historical dimensional meaning.',
 'Investigate execution plans and measure optimization without changing semantics.',
 'Apply SQL to warehouse layers, snapshots, metrics and reliable incremental loads.'
];
const legacyMap={'sql-01':4,'sql-02':5,'sql-03':6,'sql-04':6,'sql-05':5,'sql-06':3,'sql-07':9,'sql-08':6,'sql-09':7,'sql-10':3};
const assets=read('assets.json');
export function blocksFor(text){
 const lines=text.split('\n'),blocks=[];let i=0,section=0;
 while(i<lines.length){const line=lines[i],s=line.trim();if(!s){i++;continue;}
  if(s.startsWith('```')){const language=s.slice(3).trim();const out=[];i++;while(i<lines.length&&!lines[i].trim().startsWith('```'))out.push(lines[i++]);i++;blocks.push({type:'code',language,text:out.join('\n')});continue;}
  const heading=s.match(/^(#{1,6})\s+(.+)$/);if(heading){blocks.push({type:'heading',level:Math.min(4,heading[1].length+1),text:heading[2],anchor:'section-'+(++section)});i++;continue;}
  if(/^<table-of-contents\s*\/>/.test(s)||/^<\/?callout\b[^>]*>$/.test(s)){i++;continue;}
  const image=s.match(/^<image[^>]*source="([^"]+)"[^>]*\/>/);if(image){blocks.push({type:'image',source:image[1],path:assets.find(a=>a.ref===image[1])?.path??null});i++;continue;}
  const page=s.match(/^<page\s+url="([^"]+)"/);if(page){let title=[];i++;while(i<lines.length&&!/^<\/page>/.test(lines[i]))title.push(lines[i++]);i++;blocks.push({type:'link',href:page[1],text:title.join(' ').trim()||'Related source'});continue;}
  const mention=s.match(/^<mention[^>]*url="([^"]+)"[^>]*\/>/);if(mention){blocks.push({type:'link',href:mention[1],text:'Related source'});i++;continue;}
  if(s.startsWith('|')&&lines[i+1]?.match(/^\s*\|\s*:?-+/)){const rows=[];while(i<lines.length&&lines[i].trim().startsWith('|')){const cells=lines[i++].trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(c=>c.trim());if(cells.every(c=>/^:?-+:?$/.test(c)))continue;rows.push(cells);}blocks.push({type:'table',rows});continue;}
  if(/^\\?<table\b/.test(s)){let table=s;i++;while(!table.includes('</table>')&&!table.includes('\\</table>')&&i<lines.length)table+='\n'+lines[i++];table=table.replace(/\\</g,'<');const rows=[...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(r=>[...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c=>c[1]));if(rows.length)blocks.push({type:'table',rows});else blocks.push({type:'paragraph',text:table});continue;}
  if(/^---+$/.test(s)){blocks.push({type:'rule'});i++;continue;}
  if(/^\s*(?:[-*] |\d+\. )/.test(line)){const ordered=/^\s*\d+\. /.test(line),items=[];while(i<lines.length&&/^\s*(?:[-*] |\d+\. )/.test(lines[i]))items.push(lines[i++].replace(/^\s*(?:[-*] |\d+\. )/,''));blocks.push({type:'list',ordered,items});continue;}
  if(s.startsWith('>')){blocks.push({type:'quote',text:s.replace(/^>\s*/,'' )});i++;continue;}
  const out=[line];i++;while(i<lines.length&&lines[i].trim()&&!/^(?:#{1,6} |```|<page |<image |<mention |<\/?callout|\||>\s|[-*] |\d+\. )/.test(lines[i]))out.push(lines[i++]);blocks.push({type:'paragraph',text:out.join('\n')});
 }
 const minHeading=Math.min(...blocks.filter(b=>b.type==='heading').map(b=>b.level));
 if(Number.isFinite(minHeading)&&minHeading>2)for(const b of blocks)if(b.type==='heading')b.level=Math.max(2,b.level-(minHeading-2));
 return blocks;
}
const pages=[],ledger=[],seen=new Map();
function add(p,role,topic,module=null){const text=body(p);const item={id:p.id,title:plain(p.title),url:p.url,lastEdited:p.last_edited,role,topic,module,objective:module!==null?objectives[module]:'Use this supporting source in the context of its canonical SQL module.',body:text,blocks:blocksFor(text),href:module!==null?`/learn/sql/${String(module).padStart(2,'0')}/`:`/learn/sql/reference/${p.id}/`};pages.push(item);seen.set(p.id,item);return item;}
canonical.forEach((p,n)=>add(p,'canonical',topics[n],n));
for(const f of exports){if(/Canonical_|canonical_00_17/.test(f.name))continue;f.pages.forEach((p,index)=>{
 // The source nests GROUP BY extensions under its window collection, but its
 // teaching home is aggregation. Retain the source parent link independently.
 if(f.name.includes('Window_Functions'))add(p,'window-chapter',index===6?'aggregation':'windows');
 else if(f.name.includes('PostgreSQL'))add(p,'dialect','postgresql');
 else if(f.name.includes('Deep_Companion'))add(p,'companion',topics[[3,4,7,7,7,7,7,13][index]]);
 else if(f.name.includes('Interview_Toolkit')&&index<5)add(p,index===4?'recipe':'interview',index===4?'toolkit':'interview');
 else if(f.name.includes('Root_Navigation')&&[2,3,4,6,7].includes(index))add(p,'navigation',index===2?'postgresql':index===3?'interview':index===4?'toolkit':'overview');
 });}
for(const f of exports)for(const p of f.pages){const selected=seen.get(p.id);ledger.push({export:f.name,id:p.id,title:p.title,sourceType:p.source_type,sha256:hash(body(p)),destination:selected?.href??null,status:selected?(body(p)===selected.body?'mapped-source-preserved':'superseded-snapshot-preserved'):'excluded-from-teaching-preserved',reason:selected?'Canonical 00–17 authority; supporting material remains secondary':'Archive, administration, historical syllabus or audit/crosswalk administration; not another teaching path',headings:body(p).split('\n').filter(l=>/^#{1,6} /.test(l)),codeBlocks:(body(p).match(/^```/gm)??[]).length/2});}
const drills=[];
for(const p of pages.filter(p=>p.role==='canonical'||p.id==='3cd3906c5d6c81d5835be46fca54ec8a')){
 const lines=p.body.split('\n');for(let i=0;i<lines.length;i++){
  const prompt=plain(lines[i]).replace(/^###\s*/, '');if(!/^(?:Q:|Q\d+\.)/.test(prompt))continue;
  let j=i+1,answer=[];while(j<lines.length&&!/^#{1,6} /.test(lines[j])&&!/^(?:Q:|Q\d+\.)/.test(plain(lines[j])))answer.push(lines[j++]);
  const response=answer.join('\n').trim();if(!response)continue;
  const qn=prompt.match(/^Q(\d+)\./);const ownerModule=p.module??[4,7,7,7,7,9,6][Number(qn?.[1])];if(ownerModule===undefined)throw Error('Unmapped question '+prompt);
  drills.push({id:'sql-source-'+p.id+'-'+hash(prompt).slice(0,10),prompt,answer:response,answerBlocks:blocksFor(response),sourceId:p.id,sourceLine:i+1,module:ownerModule,topic:topics[ownerModule],href:'/practice/sql/#sql-source-'+p.id+'-'+hash(prompt).slice(0,10),status:'Source-backed open-response self-check; unscored'});
 }
}
const legacyQuestions=JSON.parse(fs.readFileSync(path.join(root,'content/exams/sql.json'),'utf8')).questions.map(q=>({id:q.id,prompt:q.prompt,module:legacyMap[q.id],href:'/lab/sql/?question='+q.id}));
const output={schema:'hansa-sql-v1',vault:'https://app.notion.com/p/4063906c5d6c814d9c38e19fc5418891',pages,drills,legacyMap,legacyQuestions,topics,objectives};
fs.mkdirSync(path.join(root,'content/sql'),{recursive:true});fs.writeFileSync(path.join(root,'content/sql/vault.json'),JSON.stringify(output,null,2)+'\n');
fs.writeFileSync(path.join(root,'content/sql/index.json'),JSON.stringify({...output,pages:pages.map(({body,blocks,...metadata})=>metadata),drills:drills.map(({answer,answerBlocks,...metadata})=>metadata)},null,2)+'\n');
fs.mkdirSync(path.join(root,'docs/sql-integration-20261028'),{recursive:true});fs.writeFileSync(path.join(root,'docs/sql-integration-20261028/SOURCE_COVERAGE.json'),JSON.stringify({exportCount:files.length,sourceEntries:ledger.length,uniqueSourceIds:new Set(ledger.map(x=>x.id)).size,canonical:18,publishedSourcePages:pages.length,openResponseDrills:drills.length,ledger},null,2)+'\n');
console.log(JSON.stringify({exports:files.length,sourceEntries:ledger.length,uniqueSources:new Set(ledger.map(x=>x.id)).size,pages:pages.length,drills:drills.length}));
