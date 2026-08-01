import type { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import importPlugin from 'eslint-plugin-import';
import type { PresetOptions } from '../index';
import { PLUGIN_NAME } from '@kommo-crm/eslint-plugin';
import { applyOverrides } from './shared';
import { TS_PRESET_SELECTORS, buildRestrictedSyntaxOptions } from './selectors';

const TS_FILES = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

export const typescript = (options?: PresetOptions): Linter.Config[] => [
  ...(tseslint.configs.recommended as Linter.Config[]),
  {
    name: '@kommo-crm/eslint-config/typescript/parser',
    files: TS_FILES,
    languageOptions: {
      parser: tseslint.parser as Linter.Parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  },
  {
    /**
     * @typescript-eslint rules are applied to all files, not only TypeScript.
     * This mirrors the historical Kommo setup: rules such as no-shadow,
     * no-redeclare, and no-unused-vars with argsIgnorePattern are expected
     * to run on .js files too. The parser for .js stays espree (see the
     * /parser block above) — every rule listed here is compatible with it.
     */
    name: '@kommo-crm/eslint-config/typescript/rules',
    rules: {
      /**
       * `tseslint.configs.recommended` pulls in the eslint-recommended layer,
       * which re-sets several base rules on TS files: `no-unreachable` → off
       * (tsc catches it) and `prefer-rest-params` → error, among others. Those
       * tseslint blocks are spread before this one in the composition
       * `[...base(), ...typescript()]`, so without re-asserting here `.ts`
       * files would inherit tseslint's severities instead of the project's.
       * We restore the severities Kommo has historically used —
       * `no-unreachable` back to error and `prefer-rest-params` down to warn.
       * The regression test in __tests__/presets/typescript.test.ts pins this.
       */
      'no-unreachable': 'error',
      'no-const-assign': 'error',
      'no-redeclare': 'off',
      'prefer-rest-params': 'warn',

      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-this-alias': 'off',

      '@typescript-eslint/no-shadow': ['error', { allow: ['require'] }],
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'] },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase', 'UPPER_CASE'] },
      ],

      /**
       * Re-declares base's `kommo/no-restricted-syntax` because flat-config
       * replaces (not merges) option lists per rule. Must include the
       * param-destructuring selector so it keeps firing on TS files.
       */
      [`${PLUGIN_NAME}/no-restricted-syntax`]:
        buildRestrictedSyntaxOptions(TS_PRESET_SELECTORS),
    },
  },
  {
    /**
     * Scoped to TS files, unlike the block above: these rules match nodes
     * espree also produces, so on .js they would fire on every function and
     * every import a consumer owns.
     */
    name: '@kommo-crm/eslint-config/typescript/ts-only',
    files: TS_FILES,
    /**
     * `base` registers `import` too, but this block must carry it as well:
     * `typescript()` is exported on its own, so a TS-only consumer may compose
     * it without `base()`, and `import/consistent-type-specifier-style` below
     * would then have no plugin to resolve against. Composing both is safe —
     * ESLint only rejects a redefinition when the two values are different
     * references, and both files import the same module.
     */
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowTypedFunctionExpressions: false,
          allowIIFEs: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          allowHigherOrderFunctions: false,
          allowExpressions: false,
          allowFunctionsWithoutTypeParameters: false,
        },
      ],
      /**
       * Matched pair with `import/consistent-type-specifier-style` below:
       * split the styles and the two autofixers undo each other.
       */
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { fixStyle: 'inline-type-imports' },
      ],
      'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
    },
  },
  {
    name: '@kommo-crm/eslint-config/typescript/jsdoc',
    files: TS_FILES,
    plugins: {
      jsdoc,
    },
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          contexts: [
            'TSPropertySignature',
            'TSIndexSignature',
            'TSMethodSignature',
            'TSEnumMember',
          ],
          require: {
            FunctionDeclaration: false,
            MethodDefinition: false,
          },
        },
      ],
    },
  },
  ...applyOverrides(options),
];
