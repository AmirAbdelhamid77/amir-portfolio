// Determinism: two independent compiles produce byte-identical output trees.
import test from 'node:test';
import { strict as assert } from 'node:assert';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { compileFixtures, freshDir, assertTreesIdentical } from './helpers.mjs';

test('compiling the fixture corpus twice is byte-identical', () => {
  const outA = freshDir(join(tmpdir(), 'hansa-fc03-det-a'));
  const outB = freshDir(join(tmpdir(), 'hansa-fc03-det-b'));
  compileFixtures(outA);
  compileFixtures(outB);
  assertTreesIdentical(join(outA, 'docs'), join(outB, 'docs'));
});

test('recompiling into the same output dir overwrites stale state cleanly', () => {
  const out = freshDir(join(tmpdir(), 'hansa-fc03-det-reuse'));
  compileFixtures(out);
  compileFixtures(out);
  const out2 = freshDir(join(tmpdir(), 'hansa-fc03-det-reuse2'));
  compileFixtures(out2);
  assertTreesIdentical(join(out, 'docs'), join(out2, 'docs'));
});

test('compiler version is a fixed constant (no runtime environment leakage)', async () => {
  const { COMPILER_VERSION } = await import('../../../tools/fabric-corpus/compiler/parse.mjs');
  assert.match(COMPILER_VERSION, /^\d+\.\d+\.\d+$/);
  // No Date.now / Date usage anywhere in the compiler sources.
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname } = await import('node:path');
  const compilerDir = fileURLToPath(new URL('../../../tools/fabric-corpus/compiler/', import.meta.url));
  void dirname;
  for (const name of ['parse.mjs', 'deps.mjs', 'sanitize.mjs', 'emit.mjs']) {
    const src = readFileSync(compilerDir + name, 'utf8');
    assert.ok(!/Date\.now|new Date\(|process\.env|Math\.random/.test(src), `${name} must not use clock/env/randomness`);
  }
});
