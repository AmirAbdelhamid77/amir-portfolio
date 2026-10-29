import {sqlIntegrationReceipt} from './sql-integration-receipt.mjs';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,mkdtempSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(process.cwd()),receipt=sqlIntegrationReceipt(root);
assert.ok(receipt.paths().includes('lib/sql/grain.ts'));
const manifest=JSON.parse(readFileSync('docs/sql-integration-20261028/MANIFEST.json','utf8'));
mkdirSync('.scratch',{recursive:true});const temporary=mkdtempSync(resolve('.scratch/sql-receipt-negative-'));
const copy=p=>{const target=resolve(temporary,p);mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(root,p),target);};
copy('docs/sql-integration-20261028/MANIFEST.json');copy(manifest.previous);
for(const e of manifest.files){copy(e.path);if(e.rollbackPath)copy(e.rollbackPath);}
sqlIntegrationReceipt(temporary);
writeFileSync(resolve(temporary,'lib/sql/grain.ts'),'unauthorized mutation');
assert.throws(()=>sqlIntegrationReceipt(temporary),/SQL integration drift lib\/sql\/grain.ts/);
assert.ok(existsSync(resolve(temporary,'docs/sql-integration-20261028/MANIFEST.json')));
console.log('PASS SQL exact-hash receipt, rollback snapshots, predecessor binding and negative mutation control');
