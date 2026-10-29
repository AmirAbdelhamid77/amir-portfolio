import {readFileSync,readdirSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const dest='docs/dp600-academy';
const pack='docs/agent-handoffs/dp600-learning-academy-2026-10-25/web-content-pack/HANSA_DP600_WEB_CONTENT_PACK_v1';
const read=p=>readFileSync(p,'utf8');
const json=p=>JSON.parse(read(`${pack}/data/${p}.json`));
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const pages=json('page_index'), sections=json('sections'), lines=json('source_line_map');
const ids=new Set(sections.map(s=>s.id)), seen=new Set(), issues=[], ledger=[];
for(const l of lines){const key=`${l.page}:${l.line}`;if(seen.has(key))issues.push(`duplicate ${key}`);seen.add(key);if(!ids.has(l.section_id))issues.push(`unknown section ${l.section_id}`);}
for(const p of pages){
 const raw=`${pack}/source/pages/page-${String(p.page).padStart(3,'0')}.txt`;
 const sourceLines=read(raw).split(/\r?\n/).filter(s=>s.trim()),mapped=lines.filter(l=>l.page===p.page);
 if(sha(raw)!==p.sha256)issues.push(`page ${p.page} hash`);
 if(mapped.length!==p.line_count)issues.push(`page ${p.page} count`);
 for(const l of mapped)if(sourceLines[l.line-1]!==l.text)issues.push(`text ${p.page}:${l.line}`);
 ledger.push({source_id:`guide-page-${String(p.page).padStart(3,'0')}`,page:p.page,raw_path:raw,sha256:sha(raw),extracted_lines:p.line_count,mapped_lines:mapped.length,section_ids:[...new Set(mapped.map(l=>l.section_id))],vector_primitives:p.vector_primitives,preview_present:existsSync(`${pack}/qa/previews/page-${String(p.page).padStart(3,'0')}.webp`),editorial_status:[9,10,25,56].includes(p.page)?'pilot passages reviewed; remainder pending':'preserved; semantic and visual review pending',destination:[9,10,25,56].includes(p.page)?'/learn/dp-600/ingestion/':null,publish_status:'original internal only; rights unverified'});
}
const questions=readdirSync('content/fabric/questions').filter(p=>p.endsWith('.json')).flatMap(p=>JSON.parse(read(`content/fabric/questions/${p}`)));
const report={generated:'2026-10-25',pdf_sha256:sha(`${pack}/source/DP-600-Study-Guide-EN.pdf`),pages:pages.length,sections:sections.length,extracted_lines:pages.reduce((n,p)=>n+p.line_count,0),mapped_lines:lines.length,source_labs:json('hands_on_labs').length,source_practice:json('practice_questions').length,source_selfchecks:json('self_checks').length,link_annotations:json('source_links').length,existing_questions:questions.length,unique_existing_ids:new Set(questions.map(q=>q.id)).size,structural_issues:issues,full_semantic_review:false,ledger};
mkdirSync(dest,{recursive:true});writeFileSync(`${dest}/SOURCE_TRACEABILITY_MATRIX.json`,JSON.stringify(report,null,2)+'\n');
if(process.argv.includes('--freeze-baseline')){
 if(existsSync(`${dest}/PHASE_0_PRESERVATION_BASELINE.json`))throw Error('Preservation baseline already exists; refusing to overwrite.');
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name).replaceAll('\\','/')]);
 const files=['app','components','lib','content','public','tests'].flatMap(walk).map(p=>({path:p,sha256:sha(p)}));
 const config=['package.json','package-lock.json','next.config.ts','wrangler.jsonc'].map(p=>({path:p,sha256:sha(p)}));
 writeFileSync(`${dest}/PHASE_0_PRESERVATION_BASELINE.json`,JSON.stringify({status:execFileSync('git',['status','--short'],{encoding:'utf8'}),files,config},null,2)+'\n');
}
console.log(JSON.stringify({...report,ledger:`${ledger.length} entries`},null,2));if(issues.length)process.exitCode=1;
