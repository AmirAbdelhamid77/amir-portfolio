import fs from 'node:fs';
import crypto from 'node:crypto';
const dir='docs/prototype-c',baselinePath=dir+'/preservation/baseline.json';
const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const owned=[...baseline.owned,'scripts/atlas-circle-receipt.mjs','scripts/verify-preservation-history.mjs','scripts/prototype-c-preservation.mjs',
...walk('components/knowledge'),...walk('lib/knowledge'),...walk('content/knowledge'),...walk('app/prototype-c'),...walk('tests/knowledge'),
'scripts/prototype-c-receipt.mjs','scripts/prototype-c-finalize.mjs','scripts/prototype-c-live-snapshot.mjs','scripts/qa-prototype-c.mjs','scripts/verify-prototype-c.mjs'];
for(const p of owned)if(baseline.files[p] && hash(dir+'/preservation/originals/'+p)!==baseline.files[p])throw Error('Original backup mismatch: '+p);
const manifest={scope:'hansa-prototype-c-local-2026-10-26',baselinePath,baselineSha256:hash(baselinePath),noDeployment:true,files:[...new Set(owned)].map(p=>({path:p,beforeSha256:baseline.files[p]??null,sha256:hash(p)}))};
const basisPath='docs/knowledge-atlas/circular-nodes/INTEGRATION_MANIFEST.json';
manifest.generatedArtifacts=[{path:'tsconfig.tsbuildinfo',beforeSha256:JSON.parse(fs.readFileSync(basisPath,'utf8')).files.find(e=>e.path==='tsconfig.tsbuildinfo').sha256,sha256:hash('tsconfig.tsbuildinfo'),basisPath,basisSha256:hash(basisPath),reason:'Normal Next build regenerated ignored TypeScript cache; source rollback regenerates this cache rather than restoring old source.'}];
fs.writeFileSync(dir+'/INTEGRATION_MANIFEST.json',JSON.stringify(manifest,null,2));
// A separate document manifest avoids circular hashing of the runtime receipt.
const docs=walk(dir).filter(p=>!p.endsWith('/DOCUMENT_MANIFEST.json')&&!p.includes('/qa/')&&!p.endsWith('/preservation/verification.json'));
fs.writeFileSync(dir+'/DOCUMENT_MANIFEST.json',JSON.stringify({createdAt:new Date().toISOString(),files:docs.map(p=>({path:p,sha256:hash(p)}))},null,2));
console.log(`Sealed ${manifest.files.length} owned runtime/script paths and ${docs.length} documentation/original paths.`);
