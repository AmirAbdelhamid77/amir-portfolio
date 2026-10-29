// Documentation-only Atlas integrity gate; no build/export/deploy.
import {readFileSync,readdirSync,existsSync,statSync} from "node:fs";
import {resolve,dirname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import {createRequire} from "node:module";
import assert from "node:assert/strict";
import {loadPreservationHistory,loadRepairReceipt} from "./preservation-history.mjs";
import {implementationReceipt} from "./atlas-implementation-receipt.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const implementation=implementationReceipt(root);
const local="docs/knowledge-atlas", handoff="docs/agent-handoffs/hansa-knowledge-atlas-2026-10-25";
const read=p=>readFileSync(resolve(root,p),"utf8").replace(/^\uFEFF/,"");
const json=p=>JSON.parse(read(p));
const hash=p=>createHash("sha256").update(readFileSync(resolve(root,p))).digest("hex");
const require=createRequire(import.meta.url);
// Existing ESLint dependency. Starter uses compatible keywords only.
// This is NOT complete Draft2020-12 meta-schema certification.
const Ajv=require("ajv"), starter=json(handoff+"/schemas/atlas-content.schema.json");
const compat=structuredClone(starter); delete compat.$schema;
const ajv=new Ajv({allErrors:true,schemaId:"auto"}), shape=ajv.compile(compat);
const directions={requires_understanding_of:["directed"],enables:["directed"],contrasts_with:["symmetric"],tradeoff_with:["symmetric"],complements:["symmetric"],related_in_decision:["directed","symmetric"],part_of_mechanism:["directed"]};
export function validateDataset(data,{publicExport=false}={}) {
 assert.ok(shape(data),"Starter shape: "+ajv.errorsText(shape.errors));
 const unique=(items,label)=>{const ids=items.map(x=>x.id);assert.equal(new Set(ids).size,ids.length,"Duplicate "+label);return new Map(items.map(x=>[x.id,x]));};
 const concepts=unique(data.concepts,"concept"),sources=unique(data.sourceRefs,"source"),content=unique(data.contentEntities,"content"); unique(data.semanticEdges,"edge");
 const evidence=(refs,published)=>{assert.ok(!published||refs.length>0,"Public record lacks evidence");for(const ref of refs){assert.ok(sources.has(ref.sourceId),"Unknown evidence source");if(published){assert.equal(sources.get(ref.sourceId).verificationState,"verified");assert.ok(["direct","inference"].includes(ref.supportKind),"Pending/disputed/unspecified evidence");assert.ok(ref.checkedAt,"Missing source check date");}}};
 const aliases=new Set();
 for(const c of data.concepts){evidence(c.sourceRefs??[],c.editorialState==="published");for(const alias of c.redirectAliases??[]){assert.ok(!concepts.has(alias)&&!aliases.has(alias),"Redirect collision");aliases.add(alias);}}
 const assertions=new Set();
 for(const e of data.semanticEdges){
  assert.ok(concepts.has(e.from)&&concepts.has(e.to),"Unknown endpoint");assert.notEqual(e.from,e.to,"Self relation");
  assert.ok(directions[e.relationType]?.includes(e.direction),"Wrong direction");
  const pair=e.direction==="symmetric"?[e.from,e.to].sort():[e.from,e.to];
  const key=JSON.stringify([...pair,e.relationType,e.claim.trim().toLowerCase()]);
  assert.ok(!assertions.has(key),"Duplicate assertion");assertions.add(key);
  evidence(e.evidenceRefs,e.editorialState==="published");
  if(e.editorialState==="published"){assert.equal(concepts.get(e.from).editorialState,"published");assert.equal(concepts.get(e.to).editorialState,"published");if(["enables","tradeoff_with","related_in_decision","part_of_mechanism"].includes(e.relationType))assert.ok(e.conditions.trim(),"Missing conditions");}
 }
 for(const c of data.contentEntities){
  assert.ok(sources.has(c.sourceId),"Unknown content source");for(const id of c.conceptIds)assert.ok(concepts.has(id),"Unknown mapped concept");
  const parents=new Set([c.id]);let parent=c.parentId;while(parent){assert.ok(content.has(parent),"Unknown TOC parent");assert.ok(!parents.has(parent),"TOC cycle");parents.add(parent);parent=content.get(parent).parentId;}
  if(c.route){assert.ok(!c.route.startsWith("//")&&!c.route.includes(".."),"Unsafe route");const route=c.route.split(/[?#]/)[0].replace(/\/$/,"");assert.ok(existsSync(resolve(root,"app","."+route,"page.tsx")),"Unresolved sample route");}
 }
 for(const row of data.coverage){assert.ok(sources.has(row.sourceId)&&content.has(row.contentId),"Unknown coverage ref");assert.equal(content.get(row.contentId).sourceId,row.sourceId);if(row.publishStatus==="published"){assert.equal(row.scientificReviewStatus,"approved");assert.equal(row.mappingStatus,"reviewed");assert.equal(row.extractionStatus,"extracted");assert.equal(content.get(row.contentId).editorialState,"published");}}
 if(publicExport||data.datasetStatus==="public-export"){assert.equal(data.datasetStatus,"public-export","Fixture cannot publish");assert.ok(data.concepts.every(c=>c.editorialState==="published"),"Candidate concept leak");assert.ok(data.semanticEdges.every(e=>e.editorialState==="published"),"Candidate edge leak");assert.ok(data.contentEntities.every(c=>c.editorialState==="published"),"Unreviewed content leak");assert.ok(data.coverage.every(c=>c.publishStatus==="published"),"Unreviewed coverage leak");}
}
const fixture=json(handoff+"/examples/atlas-candidate-fixture.json");
validateDataset(fixture);assert.equal(fixture.datasetStatus,"test-fixture");assert.equal(fixture.semanticEdges.filter(e=>e.editorialState==="published").length,0);
let negatives=0;const reject=fn=>{const d=structuredClone(fixture);fn(d);assert.throws(()=>validateDataset(d));negatives++;};
reject(d=>d.concepts.push(d.concepts[0]));
reject(d=>d.semanticEdges[0].from="concept:missing");
reject(d=>d.semanticEdges[0].relationType="contains");
reject(d=>d.semanticEdges[0].direction="directed");
reject(d=>d.semanticEdges[0].from=d.semanticEdges[0].to);
reject(d=>d.semanticEdges[0].evidenceRefs.push({sourceId:"missing",locator:"x",supportsClaim:"test support"}));
reject(d=>d.contentEntities[0].parentId=d.contentEntities[0].id);
reject(d=>d.contentEntities[0].parentId="content:missing");
reject(d=>d.coverage[0].sourceId="missing");
reject(d=>d.contentEntities[0].conceptIds=["concept:missing"]);
reject(d=>d.datasetStatus="public-export");
reject(d=>d.semanticEdges[0].editorialState="published");
reject(d=>d.semanticEdges.push({...d.semanticEdges[0],id:"edge:duplicate"}));
reject(d=>d.concepts[0].redirectAliases=[d.concepts[1].id]);
reject(d=>d.contentEntities[0].route="//unsafe.invalid/");
assert.throws(()=>validateDataset(fixture,{publicExport:true}));negatives++;
// Synthetic structural test only: second source references the same concept IDs.
const growth=structuredClone(fixture);
growth.contentEntities.push({...growth.contentEntities[0],id:"content:book:synthetic-second-source",sourceId:"source:synthetic-second-source",title:"Synthetic second-book test",route:"/learn/dp-600/ingestion/"});
growth.sourceRefs.push({id:"source:synthetic-second-source",title:"Synthetic structural test",sourceType:"other",verificationState:"unverified"});
validateDataset(growth);assert.equal(growth.concepts.length,fixture.concepts.length);
console.log("PASS: starter compatible-keyword shape; cross-record/publication gate; "+negatives+" rejection cases; second-book canonical reuse. Full Draft2020-12 certification NOT RUN.");
const upstream=json(handoff+"/HANDOFF_MANIFEST.json");
for(const f of upstream.files){assert.equal(statSync(resolve(root,handoff,f.path)).size,f.bytes);assert.equal(hash(handoff+"/"+f.path),f.sha256,"Upstream drift "+f.path);}
const manifest=json(local+"/INTEGRATION_MANIFEST.json");
for(const f of manifest.files)assert.equal(hash(f.path),implementation.expected(f.path,f.sha256),"Integration drift "+f.path);
const baseline=json(local+"/PRESERVATION_BASELINE.json");
const history=loadPreservationHistory(root);
loadRepairReceipt(root);
// A later owner-authorized feature may succeed this documentation-only freeze.
// Accept only its explicitly hashed runtime changes, preserving the old baseline.
const successorPath="docs/design-system/easyui-v2/INTEGRATION_MANIFEST.json";
const successor=existsSync(resolve(root,successorPath))?json(successorPath):null;
if(successor)assert.equal(successor.scope,"easyui-v2-native-ingestion-comparison");
const successorCovers=(p,before)=>{
 const entry=successor?.runtimeChanges?.find(f=>f.path===p);
 return !!entry&&entry.beforeSha256===before&&implementation.expected(p,entry.sha256)===hash(p);
};
for(const [p,h] of Object.entries(baseline.files)){
 if(manifest.modifiedExisting.includes(p)||successorCovers(p,h))continue;
 const relocation=!existsSync(resolve(root,p))&&history.relocatedPath(p,h);
 if(relocation)assert.equal(hash(relocation),h,"Relocated original drift "+p);
 else assert.equal(hash(p),implementation.expected(p,history.expectedCurrentHash(p,h)),"Unrelated pre-existing change "+p);
}
const walk=d=>readdirSync(resolve(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+"/"+e.name):[d+"/"+e.name]);
for(const dir of ["app","lib","components","content","public","tests"]){for(const p of walk(dir))assert.ok(Object.hasOwn(baseline.files,p)||successorCovers(p,null)||implementation.covers(p,null),"Unexpected runtime addition "+p);}
let links=0;
for(const name of readdirSync(resolve(root,local)).filter(n=>n.endsWith(".md"))){
 const file=local+"/"+name,body=read(file).replace(/[\x60][^\x60]*[\x60]/g,"");
 for(const m of body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){const target=m[1].split("#")[0];if(!target||/^(https?:|mailto:)/.test(target))continue;const absolute=resolve(root,dirname(file),target);assert.ok(absolute.startsWith(root+sep));assert.ok(existsSync(absolute),"Broken local link "+file+" -> "+target);links++;}
}
for(const f of ["AGENTS.md","docs/agent-reference/START_HERE.md","README.md"])assert.ok(read(f).includes("docs/knowledge-atlas/START_HERE.md"),"Missing Atlas entry "+f);
console.log("PASS: "+upstream.files.length+" upstream payload hashes; "+manifest.files.length+" integration hashes; "+links+" documentation links; historical sources verified with 90 exact relocations and proof-bound source-path evolution; original baseline retained.");
console.log("Atlas payload remains preparation-only. Hashed successor runtime changes: "+(successor?.runtimeChanges?.length??0)+". Atlas renderer/domain/manual a11y QA NOT RUN; no deploy.");
