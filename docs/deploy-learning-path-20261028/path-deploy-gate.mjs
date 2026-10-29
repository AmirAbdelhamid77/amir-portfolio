import {register} from 'node:module';import {writeFileSync,readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
register('file:///D:/BeUI/amir-portfolio/scripts/study-loader.mjs',import.meta.url);
const {getAtlas}=await import('file:///D:/BeUI/amir-portfolio/lib/atlas/server.ts');const atlas=getAtlas();if(atlas.preview||atlas.concepts.length||atlas.semanticEdges.length)throw new Error('Unapproved Atlas data must not enter this release');
const out='C:/Users/amira/Documents/Codex/2026-10-28/referenced-chatgpt-conversation-this-is-an/outputs/Hansa_Learning_Path_Deployment';const m=JSON.parse(readFileSync(out+'/RELEASE_MANIFEST.json','utf8'));
for(const f of m.files){if(createHash('sha256').update(readFileSync(m.assetsPath+'/'+f.path)).digest('hex')!==f.sha256)throw new Error('Frozen release drift '+f.path);}
const checks={checkedAt:new Date().toISOString(),publicAtlasPreview:atlas.preview,publishedConcepts:atlas.concepts.length,publishedEdges:atlas.semanticEdges.length,frozenFilesVerified:m.files.length,artifactGate:'PASS'};writeFileSync(out+'/PREFLIGHT.json',JSON.stringify(checks,null,2));console.log(checks);
