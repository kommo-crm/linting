import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import tseslint from 'typescript-eslint';
import type { Linter } from 'eslint';
import { base, react, typescript } from '../../src';
import { disablePrettier, lintFixture } from '../helpers/lint';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(here, '..', 'fixtures');

const tsxConfig: Linter.Config[] = [
  ...base(),
  ...typescript(),
  ...react(),
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser as unknown as Linter.Parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: fixturesDir,
        ecmaFeatures: { jsx: true },
      },
    },
  },
  disablePrettier,
];

test('react preset: valid.tsx — 0 problems', async () => {
  const result = await lintFixture(
    tsxConfig,
    resolve(fixturesDir, 'valid.tsx')
  );

  assert.equal(
    result.errorCount,
    0,
    `got errors: ${JSON.stringify(result.messages, null, 2)}`
  );
  /**
   * Warnings count too: explicit-function-return-type and the
   * consistent-type-* pair only ever report at warn level, so an
   * errors-only assertion would miss a false positive entirely.
   */
  assert.equal(
    result.warningCount,
    0,
    `got warnings: ${JSON.stringify(result.messages, null, 2)}`
  );
});

test('react preset: invalid.tsx — boolean-prop-naming fires', async () => {
  const result = await lintFixture(
    tsxConfig,
    resolve(fixturesDir, 'invalid.tsx')
  );
  const uniqueIds = new Set(result.ruleIds);

  assert.ok(
    uniqueIds.has('react/boolean-prop-naming'),
    'boolean-prop-naming must fire on `enabled: boolean`'
  );
});

test('react preset: invalid.tsx — jsx-curly-brace-presence fires', async () => {
  const result = await lintFixture(
    tsxConfig,
    resolve(fixturesDir, 'invalid.tsx')
  );
  const uniqueIds = new Set(result.ruleIds);

  assert.ok(
    uniqueIds.has('react/jsx-curly-brace-presence'),
    `jsx-curly-brace-presence must fire on \`bar={'baz'}\`; got: ${JSON.stringify(result.ruleIds)}`
  );
});

test('react preset: invalid.tsx — jsx-no-leaked-render fires', async () => {
  const result = await lintFixture(
    tsxConfig,
    resolve(fixturesDir, 'invalid.tsx')
  );
  const uniqueIds = new Set(result.ruleIds);

  assert.ok(
    uniqueIds.has('react/jsx-no-leaked-render'),
    `jsx-no-leaked-render must fire on \`{items.length && <List />}\`; got: ${JSON.stringify(result.ruleIds)}`
  );
});

/**
 * Upstream `react/jsx-no-leaked-render` replaces core_backend's
 * `custom/jsx-no-leaked-render` fork; the forks may diverge, so the boundary we
 * rely on is pinned here rather than assumed.
 */
test('react preset: valid.tsx — ternary and coerce guards are not reported', async () => {
  const result = await lintFixture(
    tsxConfig,
    resolve(fixturesDir, 'valid.tsx')
  );
  const leaked = result.messages.filter((message) => {
    return message.ruleId === 'react/jsx-no-leaked-render';
  });

  assert.deepEqual(
    leaked,
    [],
    'ternary and Boolean() coercion are valid under the default validStrategies'
  );
});
