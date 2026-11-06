// Shared helpers for the fabric-corpus compiler tests (FC03).
// Test-imported module: no @/ aliases, no JSON imports, plain ESM.

import { readFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';

import { compileFamily, writeOutputs } from '../../../tools/fabric-corpus/compiler/compile.mjs';
import { canonicalStringify } from '../../../tools/fabric-corpus/compiler/emit.mjs';

export const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
export const FIXTURE_CORPUS = join(REPO_ROOT, 'tools', 'fabric-corpus', 'fixtures', 'fixture-corpus');
export const SCHEMAS_DIR = join(REPO_ROOT, 'tools', 'fabric-corpus', 'schemas');
export const EXPECTED_DIR = join(REPO_ROOT, 'tools', 'fabric-corpus', 'fixtures', 'expected');
export const FIXTURE_FAMILY = 'docs';

/** Compile the fixture corpus family into a temp dir; returns the parsed
 *  receipt, manifest and a readNode(corpusRelPath) accessor. */
export function compileFixtures(outDir, corpusRevision = null) {
  const result = compileFamily({ corpusRootAbs: FIXTURE_CORPUS, family: FIXTURE_FAMILY, corpusRevision });
  writeOutputs({ result, outDirAbs: outDir, family: FIXTURE_FAMILY });
  const familyDir = join(outDir, FIXTURE_FAMILY);
  return {
    result,
    familyDir,
    receipt: JSON.parse(readFileSync(join(familyDir, 'receipt.json'), 'utf8')),
    manifest: JSON.parse(readFileSync(join(familyDir, 'manifest.json'), 'utf8')),
    readNode: (corpusRelPath) => JSON.parse(readFileSync(join(familyDir, 'nodes', corpusRelPath.replace(/\.md$/i, '.json')), 'utf8')),
  };
}

export function freshDir(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
  return path;
}

/** Recursively walk a directory, returning sorted posix rel paths of files. */
export function walkFiles(dir, relBase = '') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const rel = relBase === '' ? entry.name : `${relBase}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walkFiles(join(dir, entry.name), rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

/** Byte-compare two output trees; throws with the first differing file. */
export function assertTreesIdentical(dirA, dirB) {
  const filesA = walkFiles(dirA);
  const filesB = walkFiles(dirB);
  assert.deepStrictEqual(filesA, filesB, 'output file lists differ');
  for (const rel of filesA) {
    const a = readFileSync(join(dirA, rel));
    const b = readFileSync(join(dirB, rel));
    if (!a.equals(b)) {
      assert.fail(`byte difference in ${rel}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Minimal JSON Schema (draft 2020-12) validator — covers the keywords used by
// the compiler schemas: $ref, $defs, type, const, enum, required, properties,
// additionalProperties, items, propertyNames, pattern, minLength, minimum,
// maximum, oneOf. This is a self-conformance check; the schema documents
// remain the contract.
// ---------------------------------------------------------------------------

function resolveRef(rootSchema, ref) {
  if (!ref.startsWith('#/')) throw new Error(`unsupported ref: ${ref}`);
  let node = rootSchema;
  for (const part of ref.slice(2).split('/')) {
    node = node[part.replace(/~1/g, '/').replace(/~0/g, '~')];
    if (node === undefined) throw new Error(`unresolvable ref: ${ref}`);
  }
  return node;
}

function typeMatches(value, type) {
  switch (type) {
    case 'object': return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'array': return Array.isArray(value);
    case 'string': return typeof value === 'string';
    case 'boolean': return typeof value === 'boolean';
    case 'null': return value === null;
    case 'integer': return typeof value === 'number' && Number.isInteger(value);
    case 'number': return typeof value === 'number';
    default: return false;
  }
}

function validateInto(value, schema, rootSchema, path, errors) {
  if (schema === true || schema === undefined) return;
  if (schema === false) { errors.push(`${path}: schema false`); return; }
  if (typeof schema.$ref === 'string') {
    validateInto(value, resolveRef(rootSchema, schema.$ref), rootSchema, path, errors);
    return;
  }
  if (Array.isArray(schema.oneOf)) {
    const okCount = schema.oneOf.filter((sub) => {
      const subErrors = [];
      validateInto(value, sub, rootSchema, path, subErrors);
      return subErrors.length === 0;
    }).length;
    if (okCount !== 1) errors.push(`${path}: oneOf matched ${okCount} branches (expected exactly 1)`);
    return;
  }
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeMatches(value, t))) {
      errors.push(`${path}: expected type ${types.join('|')}, got ${value === null ? 'null' : typeof value}`);
      return;
    }
  }
  if (schema.const !== undefined && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push(`${path}: const mismatch`);
  }
  if (schema.enum !== undefined && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) {
    errors.push(`${path}: value not in enum`);
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: shorter than minLength ${schema.minLength}`);
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: pattern ${schema.pattern} failed`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: below minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: above maximum ${schema.maximum}`);
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, i) => validateInto(item, schema.items, rootSchema, `${path}[${i}]`, errors));
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const req of schema.required ?? []) {
      if (!(req in value)) errors.push(`${path}: missing required '${req}'`);
    }
    const props = schema.properties ?? {};
    for (const [key, val] of Object.entries(value)) {
      if (props[key] !== undefined) {
        validateInto(val, props[key], rootSchema, `${path}.${key}`, errors);
      } else if (schema.propertyNames !== undefined) {
        validateInto(key, schema.propertyNames, rootSchema, `${path}<key:${key}>`, errors);
      }
      if (props[key] === undefined && schema.additionalProperties === false) {
        errors.push(`${path}: unexpected property '${key}'`);
      } else if (props[key] === undefined && typeof schema.additionalProperties === 'object') {
        validateInto(val, schema.additionalProperties, rootSchema, `${path}.${key}`, errors);
      }
    }
  }
}

export function validateAgainstSchema(value, schema) {
  const errors = [];
  validateInto(value, schema, schema, '$', errors);
  return errors;
}

export function assertSchemaConforms(value, schemaName) {
  const schema = JSON.parse(readFileSync(join(SCHEMAS_DIR, schemaName), 'utf8'));
  const errors = validateAgainstSchema(value, schema);
  assert.deepStrictEqual(errors, [], `schema conformance for ${schemaName}`);
}

/** Assert a JSON text is canonical (sorted keys, no whitespace, trailing \n). */
export function assertCanonicalJson(jsonText, label) {
  const value = JSON.parse(jsonText);
  assert.strictEqual(
    canonicalStringify(value) + '\n',
    jsonText,
    `${label}: not canonical JSON (expected sorted keys, no whitespace, trailing newline)`,
  );
}
