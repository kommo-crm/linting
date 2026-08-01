# Changelog

All notable changes to this package are documented in this file. Format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New peer dependency `eslint-plugin-import` (`^2.29.0`). It is a peer, not a bundled dependency: the presets register the global `import` plugin namespace, so a consumer with its own copy would fail with `Cannot redefine plugin "import"`.
- `base` preset: `default-case` (`error`), `default-case-last` (`error`), `consistent-this` (`['error', 'self']`), and `import/no-default-export` (`warn`). `consistent-this` is bidirectional — a variable named `self` that is not assigned `this` (e.g. `const self = window.self`) is also reported. `import/no-default-export` ships with no file exclusions; the README shows how to silence it for config files and stories.
- `typescript` preset, all-files block: `@typescript-eslint/array-type` (`['error', { default: 'array' }]`). It matches TS-only nodes, so it stays inert on `.js`.
- `typescript` preset, new TS-only block (`**/*.{ts,tsx,mts,cts}`): `@typescript-eslint/explicit-function-return-type` (`warn`, with `allowExpressions` and `allowHigherOrderFunctions` disabled), `@typescript-eslint/consistent-type-imports` (`['warn', { fixStyle: 'inline-type-imports' }]`), and `import/consistent-type-specifier-style` (`['warn', 'prefer-inline']`). `explicit-function-return-type` stays at `warn` so adoption can be incremental: with the configured options it reports on every callback.
- `react` preset: `react/jsx-curly-brace-presence` (`['error', { props: 'never', children: 'ignore' }]`) and `react/jsx-no-leaked-render` (`error`, upstream rule with the default `['ternary', 'coerce']` strategies).
- `kommo/no-restricted-syntax`: three new selector groups — `break` inside a `default` clause (both presets), definite assignment assertions (`a!: string`) and `props`-parameter annotations on `PascalCase` components in all three function forms — arrow, function declaration, function expression (`typescript` preset only).
- README: notes on silencing `import/no-default-export`, the `consistent-this` bidirectionality, and the `explicit-function-return-type` severity.

### Fixed

- Peer-dependency ranges now match what the bundled plugins actually support. The previous `eslint: ">=9.0.0"` contradicted bundled `typescript-eslint@7` and `eslint-plugin-react-hooks@4` (both capped at ESLint 8), so npm consumers hit a hard `ERESOLVE` on every ESLint version. `eslint` is now `^8.57.0 || ^9.7.0`, and `typescript` is `>=4.8.4 <6.1.0` — the previous unbounded `>=5.0.0` allowed unsupported TypeScript (e.g. 7.x), which crashed ESLint at startup.

### Changed

- Bumped `typescript-eslint` 7.17.0 → 8.64.0 (ESLint 9 support). This renames `@typescript-eslint/ban-types` → `no-empty-object-type` and switches to the type-aware `@typescript-eslint/no-unused-expressions`.
- Bumped `eslint-plugin-react-hooks` 4.6.2 → 5.2.0 and `eslint-plugin-react` 7.35.0 → 7.37.5 for ESLint 9 / `typescript-eslint@8` parser compatibility (restores `react/boolean-prop-naming` on typed props).
- `react` preset: `react/boolean-prop-naming` now accepts `asChild` — the Radix/Slot escape hatch prop, whose name is dictated by the pattern ([#6](https://github.com/kommo-crm/linting/issues/6)).

### Deprecated

- The `./legacy` (`.eslintrc`) entry is deprecated and will be removed in a future release. Its plugins are resolved by name from the consumer's project root, which breaks whenever the consumer's tree conflicts on a bundled plugin (e.g. `eslint-plugin-prettier`). ESLint 8.57+ users should use flat config via `ESLINT_USE_FLAT_CONFIG` — see the README.

## [0.1.0] 16/07/26

### Added

- Initial release of `@kommo-crm/eslint-config` — shared ESLint flat-config for Kommo CRM, built with tsup and shipped from a turborepo monorepo under `packages/eslint-config`.
- `@kommo-crm/eslint-config` (root export) — flat-config presets (`base`, `typescript`, `react`). The custom rules are provided by `@kommo-crm/eslint-plugin` (registered under the `kommo` namespace) and are not re-exported from this package.
- `@kommo-crm/eslint-config/legacy` — ESLint 8 (`.eslintrc`) entry.
- `@kommo-crm/eslint-config/types` — ambient TypeScript types.
