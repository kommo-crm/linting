import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ESLint } from 'eslint';

import { base, typescript } from '../../src';
import { disablePrettier, lintFixture } from '../helpers/lint';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(here, '..', 'fixtures');

test('typescript preset: valid.ts — 0 problems', async () => {
  const result = await lintFixture(
    [...base(), ...typescript(), disablePrettier],
    resolve(fixturesDir, 'valid.ts')
  );

  assert.equal(
    result.errorCount,
    0,
    `got errors: ${result.ruleIds.join(', ')}`
  );
  /**
   * explicit-function-return-type is a warning; without this the strict option
   * set could false-positive on compliant code and no test would notice.
   */
  assert.equal(
    result.warningCount,
    0,
    `got warnings: ${result.ruleIds.join(', ')}`
  );
});

test('typescript preset: invalid.ts — naming-convention, no-explicit-any, no-non-null-assertion fire', async () => {
  const result = await lintFixture(
    [...base(), ...typescript(), disablePrettier],
    resolve(fixturesDir, 'invalid.ts')
  );
  const uniqueIds = new Set(result.ruleIds);

  assert.ok(uniqueIds.has('@typescript-eslint/naming-convention'));
  assert.ok(uniqueIds.has('@typescript-eslint/no-explicit-any'));
  assert.ok(uniqueIds.has('@typescript-eslint/no-non-null-assertion'));
});

test('typescript preset: invalid.ts — array-type fires', async () => {
  const result = await lintFixture(
    [...base(), ...typescript(), disablePrettier],
    resolve(fixturesDir, 'invalid.ts')
  );

  assert.ok(
    new Set(result.ruleIds).has('@typescript-eslint/array-type'),
    `got: ${result.ruleIds.join(', ')}`
  );
});

/**
 * array-type sits in the all-files block; it only matches TS type nodes, so it
 * must stay inert under espree. This pins that it never reaches .js consumers.
 */
test('typescript preset: array-type does not fire on invalid.js', async () => {
  const result = await lintFixture(
    [...base(), ...typescript(), disablePrettier],
    resolve(fixturesDir, 'invalid.js')
  );

  assert.ok(!new Set(result.ruleIds).has('@typescript-eslint/array-type'));
});

const TS_ONLY_IMPORT_RULES = [
  '@typescript-eslint/explicit-function-return-type',
  '@typescript-eslint/consistent-type-imports',
  'import/consistent-type-specifier-style',
] as const;

test('typescript preset: invalid.ts — TS-only import block fires', async () => {
  const result = await lintFixture(
    [...base(), ...typescript(), disablePrettier],
    resolve(fixturesDir, 'invalid.ts')
  );
  const uniqueIds = new Set(result.ruleIds);

  for (const ruleId of TS_ONLY_IMPORT_RULES) {
    assert.ok(uniqueIds.has(ruleId), `${ruleId} did not fire`);
  }
});

/**
 * explicit-function-return-type matches nodes espree also produces, so the
 * block is scoped to TS files — otherwise it floods every consumer .js file.
 */
test('typescript preset: TS-only import rules do not fire on invalid.js', async () => {
  const result = await lintFixture(
    [...base(), ...typescript(), disablePrettier],
    resolve(fixturesDir, 'invalid.js')
  );
  const uniqueIds = new Set(result.ruleIds);

  for (const ruleId of TS_ONLY_IMPORT_RULES) {
    assert.ok(!uniqueIds.has(ruleId), `${ruleId} leaked onto .js`);
  }
});

test('typescript preset: re-asserts severities that the eslint-recommended layer overrides on .ts', async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [...base(), ...typescript()],
  });
  const cfg = await eslint.calculateConfigForFile(
    resolve(fixturesDir, 'valid.ts')
  );

  /**
   * tseslint's eslint-recommended layer sets no-unreachable → off and
   * prefer-rest-params → error; the typescript preset restores the project's
   * severities. If someone drops the re-assert, these flip and the test fails.
   */
  assert.equal(
    cfg.rules['no-unreachable'][0],
    2,
    'no-unreachable must be error'
  );
  assert.equal(
    cfg.rules['prefer-rest-params'][0],
    1,
    'prefer-rest-params must be warn'
  );
});
