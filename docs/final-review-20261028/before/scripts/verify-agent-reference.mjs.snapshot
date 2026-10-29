// Reference integrity only; does not build or deploy the application.
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ref = resolve(root, 'docs/agent-reference');
const read = path => readFileSync(path, 'utf8');
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const manifest = JSON.parse(read(resolve(ref, 'PACKAGE_MANIFEST.json')));
assert.equal(manifest.version, '1.2-local-integration');
for (const entry of manifest.files) {
  const path = resolve(root, entry.path);
  assert.ok(path.startsWith(root + sep), 'Path outside repository: ' + entry.path);
  assert.equal(readFileSync(path).length, entry.bytes, 'Size drift: ' + entry.path);
  assert.equal(hash(path), entry.sha256, 'Hash drift: ' + entry.path);
}
const required = ['START_HERE.md', 'HANSA_MASTER_AGENT_REFERENCE_v1.0.md',
  'CONTENT_BRIEF_TEMPLATE.yaml', 'CAPABILITY_ROUTER.yaml',
  'HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md',
  'Hansa_Master_Audit_Reorganization_Plan_v2_2026-10-24.md'];
const agents = read(resolve(root, 'AGENTS.md'));
for (const name of required) {
  assert.ok(existsSync(resolve(ref, name)), 'Missing reference: ' + name);
  assert.ok(agents.includes('docs/agent-reference/' + name), 'Missing entry link: ' + name);
}
const router = read(resolve(ref, 'CAPABILITY_ROUTER.yaml'));
assert.match(router, /version: '1[.]1'/);
assert.match(router, /preferred_entries_are_nonbinding_candidates: true/);
assert.ok(router.includes('standard_dashboard: [recharts,'));
for (const key of ['selection_policy', 'master_reference']) {
  const path = router.split('\n').find(line => line.startsWith(key + ': '))?.slice(key.length + 2).trim();
  assert.ok(path && existsSync(resolve(root, path)), 'Broken router path: ' + key);
}
const weights = [...router.matchAll(/^  (?:correctness|teaching_clarity|essential_interaction|performance_mobile|accessibility|maintenance_reuse): (\d+)$/gm)];
assert.equal(weights.length, 6);
assert.equal(weights.reduce((sum, match) => sum + Number(match[1]), 0), 100);
let originals = 0;
for (const entry of manifest.files.filter(item => item.source)) {
  const original = resolve(root, entry.source);
  if (!existsSync(original)) continue; // Repository-only checkouts need no intake folder.
  assert.equal(hash(original), entry.sha256, 'Intake changed; reconcile: ' + entry.source);
  originals++;
}
const workspaceEntry = resolve(root, '../AGENTS.md');
if (existsSync(workspaceEntry) && existsSync(resolve(root, '../new design guide'))) {
  const text = read(workspaceEntry);
  assert.ok(text.includes('amir-portfolio/AGENTS.md'));
  assert.ok(text.includes('amir-portfolio/docs/agent-reference/START_HERE.md'));
}
console.log('PASS: ' + manifest.files.length + ' active hashes; entry paths; router v1.1; rubric weights; ' + originals + ' available intake hashes.');
