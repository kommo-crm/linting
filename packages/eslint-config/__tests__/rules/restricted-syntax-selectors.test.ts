import tseslint from 'typescript-eslint';
import type { Linter, Rule } from 'eslint';

import { createRuleTester } from '../helpers/rule-tester';
import { rules } from '@kommo-crm/eslint-plugin';
import {
  OMIT_TYPE_REFERENCE_SELECTORS,
  PARAM_DESTRUCTURING_SELECTORS,
  TS_PRESET_SELECTORS,
  buildRestrictedSyntaxOptions,
} from '../../src/presets/selectors';

const noRestrictedSyntax = rules['no-restricted-syntax'] as Rule.RuleModule;

const jsTester = createRuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

const tsTester = createRuleTester({
  languageOptions: {
    parser: tseslint.parser as unknown as Linter.Parser,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

const DESTRUCTURING_OPTIONS = [...PARAM_DESTRUCTURING_SELECTORS];
const OMIT_OPTIONS = [
  ...PARAM_DESTRUCTURING_SELECTORS,
  ...OMIT_TYPE_REFERENCE_SELECTORS,
];

/**
 * Mirrors what `base` enables — severity dropped, RuleTester takes options only.
 */
const [, ...BASE_PRESET_OPTIONS] = buildRestrictedSyntaxOptions();

/**
 * The `typescript` preset call site itself, not a copy of it.
 */
const [, ...TS_PRESET_OPTIONS] =
  buildRestrictedSyntaxOptions(TS_PRESET_SELECTORS);

jsTester.run('selectors/param-destructuring', noRestrictedSyntax, {
  valid: [
    {
      code: 'function f(a) { const { b } = a; return b; }',
      options: DESTRUCTURING_OPTIONS,
    },
    {
      code: 'const f = (a) => { const { b } = a; return b; };',
      options: DESTRUCTURING_OPTIONS,
    },
  ],
  invalid: [
    {
      code: 'function f({ a }) { return a; }',
      options: DESTRUCTURING_OPTIONS,
      errors: [
        {
          message: 'Object destructuring in function parameters is prohibited.',
        },
      ],
    },
    {
      code: 'const f = function ({ a }) { return a; };',
      options: DESTRUCTURING_OPTIONS,
      errors: [
        {
          message: 'Object destructuring in function parameters is prohibited.',
        },
      ],
    },
    {
      code: 'const f = ({ a }) => a;',
      options: DESTRUCTURING_OPTIONS,
      errors: [
        {
          message: 'Object destructuring in function parameters is prohibited.',
        },
      ],
    },
  ],
});

const BREAK_IN_DEFAULT_MESSAGE =
  'Using break inside a default clause is prohibited.';

jsTester.run('selectors/switch-default-case', noRestrictedSyntax, {
  valid: [
    {
      code: 'function f(x) { switch (x) { default: return; } }',
      options: BASE_PRESET_OPTIONS,
    },
    {
      code: 'switch (x) { case 1: z(); break; default: y(); }',
      options: BASE_PRESET_OPTIONS,
    },
    /**
     * A non-last `default` is the core `default-case-last` rule's job now.
     */
    {
      code: 'switch (x) { default: y(); case 1: z(); }',
      options: BASE_PRESET_OPTIONS,
    },
  ],
  invalid: [
    {
      code: 'switch (x) { default: break; }',
      options: BASE_PRESET_OPTIONS,
      errors: [{ message: BREAK_IN_DEFAULT_MESSAGE }],
    },
    {
      code: 'switch (x) { default: { break; } }',
      options: BASE_PRESET_OPTIONS,
      errors: [{ message: BREAK_IN_DEFAULT_MESSAGE }],
    },
  ],
});

tsTester.run('selectors/switch-default-case-ts', noRestrictedSyntax, {
  valid: [
    {
      code: 'function f(x: number) { switch (x) { default: return; } }',
      options: TS_PRESET_OPTIONS,
    },
    {
      code: 'switch (x) { default: y(); case 1: z(); }',
      options: TS_PRESET_OPTIONS,
    },
  ],
  invalid: [
    {
      code: 'switch (x) { default: break; }',
      options: TS_PRESET_OPTIONS,
      errors: [{ message: BREAK_IN_DEFAULT_MESSAGE }],
    },
  ],
});

tsTester.run('selectors/definite-assignment', noRestrictedSyntax, {
  valid: [
    {
      code: "class A { b: string = ''; }",
      options: TS_PRESET_OPTIONS,
    },
    /**
     * TS-only selector: absent from the base option set.
     */
    {
      code: 'class A { b!: string; }',
      options: BASE_PRESET_OPTIONS,
    },
  ],
  invalid: [
    {
      code: 'class A { b!: string; }',
      options: TS_PRESET_OPTIONS,
      errors: [
        {
          message:
            'Definite assignment assertion is prohibited; initialise the property instead.',
        },
      ],
    },
  ],
});

const COMPONENT_TYPING_MESSAGE =
  'Type the component itself instead of annotating its props parameter.';

tsTester.run('selectors/component-typing', noRestrictedSyntax, {
  valid: [
    {
      code: 'const Foo: FC<Props> = (props) => null;',
      options: TS_PRESET_OPTIONS,
    },
    {
      code: 'const Foo: FC<Props> = (props): ReactElement => null;',
      options: TS_PRESET_OPTIONS,
    },
    /**
     * Lowercase identifier — not a component.
     */
    {
      code: 'const handler = (event: Event) => null;',
      options: TS_PRESET_OPTIONS,
    },
    /**
     * TS-only selector: absent from the base option set.
     */
    {
      code: 'const Foo = (props: Props) => null;',
      options: BASE_PRESET_OPTIONS,
    },
    /**
     * PascalCase, but the parameter is not props — not a component.
     */
    {
      code: 'const CreateStore = (config: Config) => config;',
      options: TS_PRESET_OPTIONS,
    },
  ],
  invalid: [
    {
      code: 'const Foo = (props: Props) => null;',
      options: TS_PRESET_OPTIONS,
      errors: [{ message: COMPONENT_TYPING_MESSAGE }],
    },
    {
      code: 'const Foo = (props: Props, ref: Ref) => null;',
      options: TS_PRESET_OPTIONS,
      errors: [{ message: COMPONENT_TYPING_MESSAGE }],
    },
    {
      code: 'function Foo(props: Props) { return null; }',
      options: TS_PRESET_OPTIONS,
      errors: [{ message: COMPONENT_TYPING_MESSAGE }],
    },
    {
      code: 'const Foo = function (props: Props) { return null; };',
      options: TS_PRESET_OPTIONS,
      errors: [{ message: COMPONENT_TYPING_MESSAGE }],
    },
  ],
});

tsTester.run('selectors/omit-type-reference', noRestrictedSyntax, {
  valid: [
    {
      code: 'type U = { id: number; name: string };\ntype V = DistributiveOmit<U, "name">;',
      options: OMIT_OPTIONS,
    },
  ],
  invalid: [
    {
      code: 'type U = { id: number; name: string };\ntype V = Omit<U, "name">;',
      options: OMIT_OPTIONS,
      errors: [
        {
          message:
            'Use DistributiveOmit utility type instead of the built-in Omit one.',
        },
      ],
    },
  ],
});
