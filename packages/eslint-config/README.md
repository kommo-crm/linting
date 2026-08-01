# @kommo-crm/eslint-config

Shared ESLint configuration for Kommo projects, widgets, and open-source repositories.

> **Status: 0.x (beta).** Package layout, build, and release pipeline are ready, and the presets carry a working rule set — see [Rules](#rules). Rules are still being ported from our core projects, so minor releases may add rules (including at `error` severity) during 0.x.

## Contents

The package ships the following exports:

| Subpath                           | Purpose                                                    | Status     |
| --------------------------------- | ---------------------------------------------------------- | ---------- |
| `@kommo-crm/eslint-config`        | ESLint flat-config presets (`base`, `typescript`, `react`) | beta       |
| `@kommo-crm/eslint-config/legacy` | Legacy entry for `.eslintrc` (ESLint 8)                    | deprecated |
| `@kommo-crm/eslint-config/types`  | Global TypeScript types (`DistributiveOmit` etc.)          | beta       |

## Installation

```bash
pnpm add -D @kommo-crm/eslint-config eslint typescript eslint-plugin-import
```

`eslint`, `typescript`, and `eslint-plugin-import` are peer dependencies — the package does not pull them in.

### Requirements

| Peer                   | Supported range       | Notes                                             |
| ---------------------- | --------------------- | ------------------------------------------------- |
| `eslint`               | `^8.57.0 \|\| ^9.7.0` | 8.57+ needs `ESLINT_USE_FLAT_CONFIG`; 9.7+ native |
| `typescript`           | `>=4.8.4 <6.1.0`      | Upper bound follows bundled `typescript-eslint`   |
| `eslint-plugin-import` | `^2.29.0`             | Peer, not bundled — see below                     |

These ranges are the intersection of what the bundled plugins (`typescript-eslint`,
`eslint-plugin-react`, `eslint-plugin-react-hooks`, …) actually support.

`eslint-plugin-import` stays a peer because the presets claim the global `import`
plugin namespace; a second bundled copy would fail with
`Cannot redefine plugin "import"`.

## Usage — ESLint 9 (flat config)

```js
// eslint.config.mjs
import { base, typescript, react } from '@kommo-crm/eslint-config';

export default [
  ...base(),
  ...typescript(),
  ...react(),

  // project-specific overrides
  {
    rules: {
      'no-restricted-globals': ['error', 'RegExp', 'MutationObserver'],
    },
  },
];
```

Every preset accepts an options object with rule overrides:

```js
...base({ rules: { 'no-console': 'off' } }),
```

### TypeScript types

To pull in `DistributiveOmit` and other ambient types, add the `types` subpath to your `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "types": ["@kommo-crm/eslint-config/types"],
  },
}
```

## Usage — ESLint 8

> **⚠️ On ESLint 8, use flat config, not `.eslintrc`.** ESLint 8.57+ supports flat
> config, and it is the only reliable way to consume this package on ESLint 8.

ESLint 8.57 can load a flat config via the `ESLINT_USE_FLAT_CONFIG` flag — same
config as ESLint 9:

```js
// eslint.config.mjs
import { base, typescript, react } from '@kommo-crm/eslint-config';

export default [...base(), ...typescript(), ...react()];
```

```bash
ESLINT_USE_FLAT_CONFIG=true eslint 'src/**/*.{ts,tsx}'
```

### `.eslintrc` (legacy, deprecated)

```js
// .eslintrc.js
module.exports = {
  extends: ['@kommo-crm/eslint-config/legacy'],
};
```

> **Known limitation.** The `/legacy` entry references its plugins by name, and
> ESLint's eslintrc engine resolves them from _your_ project root — not from
> inside this package. If your dependency tree conflicts on any bundled plugin
> (commonly `prettier` / `eslint-plugin-prettier`), the package manager nests our
> copy and ESLint fails with `couldn't find the plugin "..."`. This is fragile by
> design and not reliably fixable from your side — prefer the flat config above.
> The `/legacy` entry is deprecated and will be removed in a future release.

## Rules

Each preset spreads an upstream shareable config, then sets its own rules on top:

- `base` — `@eslint/js` `recommended`, then `eslint-config-prettier`, which turns
  off every formatting rule prettier owns
- `typescript` — `typescript-eslint` `recommended`, which pulls in its
  `eslint-recommended` layer
- `react` — `eslint-plugin-react` flat `recommended` and
  `eslint-plugin-react-you-might-not-need-an-effect` `recommended`

Compose them as `[...base(), ...typescript(), ...react()]` — order matters, later
blocks re-assert severities the earlier ones changed.

For the full effective rule set, ask ESLint:

```bash
npx eslint --print-config src/index.ts
```

What that output will not tell you is _why_ — that is what follows.

### Choices worth knowing

**`base`**

- **`consistent-this` cuts both ways.** It is not only "name your `this` alias
  `self`" — it also reports `const self = window.self`. See
  [the note](#consistent-this-is-bidirectional).
- **`import/no-default-export` is a `warn` with no exclusions.** Config files and
  stories will warn until you exclude them yourself. See
  [the note](#importno-default-export-has-no-exclusions).
- **Formatting is a lint error.** `prettier/prettier` is `error`, so a
  misformatted file fails `eslint` — no separate `prettier --check` step needed.
- **Arrow functions always carry a braced body** (`arrow-body-style: 'always'`).
- `no-unused-vars`, `no-use-before-define` and `no-redeclare` are `off` here,
  replaced by their `@typescript-eslint` twins (which ignore `_`-prefixed
  parameters).
- The custom `kommo/no-export-all`, `kommo/no-incorrect-jsdoc-comments` and
  `kommo/no-restricted-syntax` rules come from
  [`@kommo-crm/eslint-plugin`](../eslint-plugin).

**`typescript`**

- **The main rule block is unscoped**, so `@typescript-eslint` rules also run on
  your `.js` files — the parser there stays espree. This mirrors the historical
  Kommo setup. Only the type-annotation rules are scoped to
  `**/*.{ts,tsx,mts,cts}`.
- **`explicit-function-return-type` is `warn`, not `error`** — deliberate, see
  [the note](#explicit-function-return-type-is-a-warning-on-purpose).
- **Type imports are a matched pair.** `@typescript-eslint/consistent-type-imports`
  and `import/consistent-type-specifier-style` both aim at `import { type A }`;
  change one without the other and the two autofixers undo each other.
- `jsdoc/require-jsdoc` is `error` on `TSPropertySignature`, `TSIndexSignature`,
  `TSMethodSignature` and `TSEnumMember` — functions and methods are exempt.

**`react`**

- **Hook rules are off.** Both `react-hooks/rules-of-hooks` and
  `react-hooks/exhaustive-deps` are `off`. Turn them on yourself if you want them.
- **Naming is enforced**, and will flag existing code on adoption: `on` for prop
  callbacks and `handle` for local handlers, boolean props prefixed with
  `is`/`has`/`should`/… (`asChild` is exempt).
- The `react-you-might-not-need-an-effect` rules are all `warn`, except
  `no-empty-effect` (`error`).

### Restricted syntax selectors

`kommo/no-restricted-syntax` is configured through a single builder, so every
preset that enables the rule emits the shared base set — flat config **replaces**
per-rule option arrays instead of merging them. The exact selectors live in
[`src/presets/selectors.ts`](./src/presets/selectors.ts); what they forbid:

`base` and `typescript`:

- Object destructuring in function parameters
- `break` inside a `default` clause

`typescript` only:

- `Omit` — use the `DistributiveOmit` utility type instead
- Definite assignment assertions (`prop!: T`) — initialise the property instead
- Annotating a component's `props` parameter — type the component itself

## Notes and gotchas

### `import/no-default-export` has no exclusions

The rule is a `warn` and ships with **no** built-in file exclusions. Config files
and Storybook stories legitimately need a default export, but which of those
exist is your call. Silence it for the globs you actually have:

```js
{
  files: ['**/*.config.{js,cjs,mjs,ts}', '**/*.stories.{ts,tsx}'],
  rules: { 'import/no-default-export': 'off' },
}
```

### `consistent-this` is bidirectional

`consistent-this: ['error', 'self']` is not only "name your `this` alias `self`".
It also reports **any variable named `self` that is not assigned `this`**:

```js
const self = window.self; // error: Designated alias 'self' is not assigned to 'this'
```

`self` is a browser global, so this bites real code. Rename the variable, or turn
the rule off for the file. An accepted trade-off, not a bug — but worth knowing
before you adopt the preset.

### `explicit-function-return-type` is a warning on purpose

With `allowExpressions: false` and `allowHigherOrderFunctions: false` the rule
demands a return type on _every_ callback, including inline JSX handlers — on one
of this package's own test fixtures that is 65 reports in a single file.

Adoption is meant to be incremental: fix the warnings as you touch the files, and
raise the severity in your own config once the count is manageable.

```js
{ rules: { '@typescript-eslint/explicit-function-return-type': 'error' } }
```

## Development

This package lives in a [turborepo](https://turbo.build/) monorepo. Run commands from the
repository root (they fan out via turbo) or scope them to this package with
`pnpm --filter @kommo-crm/eslint-config <script>`.

```bash
pnpm install
pnpm build       # tsup → dist/ (+ copy-assets + build-legacy)
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint .
pnpm test        # node --test with tsx loader
pnpm dev         # tsup --watch
```

### Releases

Releases are cut manually by maintainers and triggered by pushing an annotated `eslint-config@vX.Y.Z` tag. Each package in the monorepo is versioned and released independently, so the tag is namespaced with the package directory name. The release workflow resolves the package from the tag prefix, then runs `make verify`, publishes to npm via trusted publishing (OIDC), and creates a GitHub Release.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `feat!:` (breaking), etc. — enforced by commitlint locally and in CI. The maintainer uses these types to choose the `patch`/`minor`/`major` bump and to hand-curate `CHANGELOG.md`, which is the source of truth for what shipped in each version.

The full runbook lives in [`RELEASING.md`](../../RELEASING.md).

## Structure

```text
src/
├── index.ts           # public API: base, typescript, react
├── presets/
│   ├── base.ts
│   ├── typescript.ts
│   └── react.ts
└── types/
    └── global.d.ts    # DistributiveOmit
```

The custom ESLint rules consumed by these presets live in a separate package,
[`@kommo-crm/eslint-plugin`](../eslint-plugin), and are registered under the
`kommo` namespace.

`dist/legacy.cjs` (the ESLint 8 entry) is generated at build time by `scripts/build-legacy.mjs`.

Planned follow-up iterations:

1. Port the remaining custom rules from `core_backend/frontend/eslint.config.mjs` (`function-style`, `switch-case-blank-line-between-clauses`, `jsx-newline`, `const-enum-member-naming`, etc.)
2. `fsd` / `widget` presets with `import` pathGroups
3. A separate `@kommo-crm/stylelint-config` package

## License

MIT — see [LICENSE](./LICENSE).
