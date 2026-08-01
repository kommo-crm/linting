import type { RestrictedSyntaxSelector } from './selectors.types';

export const PARAM_DESTRUCTURING_SELECTORS: readonly RestrictedSyntaxSelector[] =
  [
    {
      selector:
        'FunctionDeclaration > ObjectPattern, FunctionExpression > ObjectPattern, ArrowFunctionExpression > ObjectPattern',
      message: 'Object destructuring in function parameters is prohibited.',
    },
  ];

export const OMIT_TYPE_REFERENCE_SELECTORS: readonly RestrictedSyntaxSelector[] =
  [
    {
      selector: 'TSTypeReference > Identifier[name="Omit"]',
      message:
        'Use DistributiveOmit utility type instead of the built-in Omit one.',
    },
  ];

const SWITCH_DEFAULT_CASE_SELECTORS: readonly RestrictedSyntaxSelector[] = [
  {
    selector:
      'SwitchCase[test=null] > BreakStatement, SwitchCase[test=null] > BlockStatement > BreakStatement',
    message: 'Using break inside a default clause is prohibited.',
  },
];

const DEFINITE_ASSIGNMENT_SELECTORS: readonly RestrictedSyntaxSelector[] = [
  {
    selector: 'PropertyDefinition[definite=true]',
    message:
      'Definite assignment assertion is prohibited; initialise the property instead.',
  },
];

const COMPONENT_TYPING_MESSAGE =
  'Type the component itself instead of annotating its props parameter.';

const COMPONENT_TYPING_SELECTORS: readonly RestrictedSyntaxSelector[] = [
  {
    selector:
      'VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression:not([typeParameters]) > Identifier[name=/^props?$/][typeAnnotation]:first-child',
    message: COMPONENT_TYPING_MESSAGE,
  },
  {
    selector:
      'FunctionDeclaration[id.name=/^[A-Z]/]:not([typeParameters]) > Identifier[name=/^props?$/][typeAnnotation]:first-child',
    message: COMPONENT_TYPING_MESSAGE,
  },
  {
    selector:
      'VariableDeclarator[id.name=/^[A-Z]/] > FunctionExpression:not([typeParameters]) > Identifier[name=/^props?$/][typeAnnotation]:first-child',
    message: COMPONENT_TYPING_MESSAGE,
  },
];

export const TS_PRESET_SELECTORS: readonly RestrictedSyntaxSelector[] = [
  ...OMIT_TYPE_REFERENCE_SELECTORS,
  ...DEFINITE_ASSIGNMENT_SELECTORS,
  ...COMPONENT_TYPING_SELECTORS,
];

/**
 * Single source of truth for `kommo/no-restricted-syntax` option lists.
 * Flat-config replaces (not merges) option arrays, so every preset that
 * enables this rule must emit the shared base set — this builder guards
 * against drift when presets add more selectors.
 */
export const buildRestrictedSyntaxOptions = (
  extra: readonly RestrictedSyntaxSelector[] = []
): ['error', ...RestrictedSyntaxSelector[]] => {
  return [
    'error',
    ...PARAM_DESTRUCTURING_SELECTORS,
    ...SWITCH_DEFAULT_CASE_SELECTORS,
    ...extra,
  ];
};
