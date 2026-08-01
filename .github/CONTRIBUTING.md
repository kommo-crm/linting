# How to contribute

We want to make it as easy and transparent as possible to contribute. If we are missing anything or can make the process easier in any way, [please let us know](mailto:npm@kommo.com).

## Code of conduct

We expect all participants to read our [code of conduct](./CODE_OF_CONDUCT.md) to understand which actions are and aren’t tolerated.

## Open development

`@kommo-crm/eslint-config` is the ESLint configuration package in the Kommo linting monorepo (more linters, e.g. a Stylelint config, will ship as separate packages). All work happens directly on GitHub. Both team members and external contributors send pull requests which go through the same review process.

## Semantic versioning

`@kommo-crm/eslint-config` follows semantic versioning, with a special policy for the `0.x` beta phase (see [Versioning during 0.x](#versioning-during-0x) below). After `1.0.0`, we release [patch versions for bug fixes](#patch), [minor versions for new features](#minor), and [major versions for breaking changes](#major). When we make breaking changes, we introduce deprecation warnings in a minor version along with the upgrade path so that our users learn about the upcoming changes and migrate their code in advance.

The following sections detail what kinds of changes result in each of major, minor, and patch version bumps **after 1.0.0**:

### Major

- Breaking change to the public API of a preset (signature, return shape)
- Removal of a preset or a public subpath export
- Removal of a built-in rule from a preset
- Bumping the minimum supported version of a peer dependency (`eslint`, `typescript`)
- Bumping the minimum supported Node.js version
- Breaking change to the public TypeScript types (`@kommo-crm/eslint-config/types`)
- Renaming or removing a preset option

### Minor

- New preset (e.g. `fsd`, `widget`, `stylelint`)
- New rule added to an existing preset
- New option for a preset
- Deprecation of a preset, rule, or option (ahead of its removal in the next major version)
- Non-breaking bump of a bundled plugin (`@typescript-eslint/*`, `eslint-plugin-react`, …) that does not change reported violations on existing fixtures

### Patch

- Bug fix in a custom rule under `packages/eslint-plugin/src/rules/`
- Loosening a rule severity (e.g. `error` → `warn`)
- Documentation, README, or CHANGELOG fixes
- Internal refactor that does not change the rule output (verified by snapshot tests)
- Non-breaking bump of a bundled plugin patch version
- Build/tooling change that does not affect `dist/`

### Versioning during 0.x

Until `1.0.0` the package is in beta and is being filled with rules from our core projects at a high cadence. To keep that flow practical, **breaking changes are allowed in minor releases during 0.x**, including:

- adding a new rule with `error` severity,
- tightening an existing rule from `warn` to `error`,
- changing a preset’s public API.

Bump policy in 0.x:

- `0.x.0` — new rules (`warn` or `error`), new presets, API changes (including breaking).
- `0.x.y` — bugfix, severity decrease (`error` → `warn`).

`1.0.0` is cut once the ESLint part stabilises — when the main consumers are migrated and `@kommo-crm/eslint-config` carries the full ruleset. Adding sibling packages such as `@kommo-crm/stylelint-config` after `1.0.0` does not affect ESLint consumers and ships independently.

> If you’re unsure which bump applies, prefer the more conservative commit type (`fix:` over `feat:`) — a reviewer will adjust it before merge. The maintainer derives the version bump from the Conventional Commits accumulated since the last tag: `feat:` → minor, `fix:`/`perf:` → patch, `feat!:` or a `BREAKING CHANGE:` footer → major (during 0.x — minor).

## Branch organization

We do our best to keep `main` releasable at all times, with work for major releases happening in separate branches. [Breaking changes](./CONTRIBUTING.md#major) should never be merged directly to `main`. Otherwise, if you send a pull request please do it against the `main` branch. Continue reading for more about pull requests and breaking changes.

## Bugs

### Where to find known issues

We track all of our issues in GitHub and [bugs](https://github.com/kommo-crm/linting/labels/Bug) are labeled accordingly. If you are planning to work on an issue, avoid ones which already have an assignee or where someone has commented within the last two weeks they are working on it. We will do our best to communicate when an issue is being worked on internally.

### Reporting new issues

To reduce duplicates, look through open issues before filing one. When [opening an issue](https://github.com/kommo-crm/linting/issues/new?template=ISSUE.yml), complete as much of the template as possible. The best way to get your bug fixed is to provide a minimal reproduction — ideally a snippet of source plus the relevant fragment of `eslint.config.mjs` (or `.eslintrc`) and the exact ESLint output.

## Feature requests

Before requesting a feature, search the [existing feature requests](https://github.com/kommo-crm/linting/issues). You can [👍 upvote](https://help.github.com/articles/about-conversations-on-github/) feature requests to help our team set priorities. If a feature request is closed, you can still upvote! A closed feature request means it’s not something we’re currently working on, but we take all your input into account when planning what to work on next.

Otherwise, [request a feature](https://github.com/kommo-crm/linting/issues/new?labels=Feature+request&template=FEATURE_REQUEST.yml).

## Proposing a change

If you intend to add a new preset, change the public API of an existing preset, add or remove a rule from a preset, or make any other non-trivial changes, [we recommend filing an issue](https://github.com/kommo-crm/linting/issues/new?labels=Feature+request&template=FEATURE_REQUEST.yml). This lets us all discuss and reach an agreement on the proposal before you put in significant time and effort.

If you’re only fixing a bug, it’s okay to submit a pull request right away but we still recommend you file an issue detailing what you’re fixing. This is helpful in case we don’t accept that specific fix but want to keep track of the issue.

## Requirements

- Node.js 24 (`nvm use`, see `.nvmrc`). The packages declare `engines: node >=22` for consumers, but CI only ever builds and tests the version in `.nvmrc` — nothing verifies Node 22, so treat that floor as a promise to consumers rather than a tested configuration. CI and publishing pin 24 because trusted publishing needs npm 11.5.1+ (shipped by recent 24.x; a runtime guard enforces it).
- pnpm 9.x (see `packageManager` in `package.json`) — enable via `corepack enable`.

## Quick start

```bash
nvm use
corepack enable
pnpm install
pnpm build
pnpm test
```

## Workflow

1. Fork this repository and branch off `main`: `feature/<issue-id>` or `hotfix/<issue-id>`.
2. Make your changes.
3. Use [Conventional Commits](https://www.conventionalcommits.org/) for every commit message:
   - `fix: …` — bug fix, severity downgrade
   - `feat: …` — new rule, new preset, new option
   - `feat!: …` or `BREAKING CHANGE:` footer — breaking change after 1.0.0
   - `docs:`, `chore:`, `refactor:`, `test:`, `build:`, `ci:` — non-release-bumping changes
4. Make sure CI is green — the required `verify` check (lint + knip + typecheck + build + coverage) plus the `Commit messages` check on PRs.

The `commitlint` CI job validates that every commit in your PR follows Conventional Commits — a husky `commit-msg` hook enforces it locally as well. Commits that don’t match a release-bumping type (`feat`/`fix`/`perf`) are still allowed; they simply don’t influence the next version bump and typically aren’t called out in `CHANGELOG.md`.

## Scripts

All scripts run from the repository root.

| Script                                                        | Purpose                                         |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `pnpm build`                                                  | Build all packages via turbo (tsup + assets)    |
| `pnpm dev`                                                    | tsup watch mode for the eslint-config package   |
| `pnpm lint`                                                   | Self-lint the repo with our own ESLint config   |
| `pnpm lint:fix`                                               | Same, with autofix                              |
| `pnpm typecheck`                                              | `tsc --noEmit` (via turbo)                      |
| `pnpm test`                                                   | Run tests via `node --test` + tsx (via turbo)   |
| `pnpm test:coverage`                                          | Same, under `c8` with 90/85/90 thresholds       |
| `pnpm --filter @kommo-crm/eslint-config test:snapshot:update` | Regenerate `*.errors.json` baseline             |
| `pnpm format`                                                 | Prettier across the repository                  |
| `pnpm commitlint`                                             | Validate commit messages (used by husky and CI) |

## Adding a rule

Rules are added test-first, one at a time, and snapshots are regenerated only at the very end. The order below is not a suggestion — steps 5 and 6 exist because we got both of them wrong at least once.

1. **Decide whether the rule belongs in this package at all.** It does **not** if its value depends on project paths, aliases, domain wrappers, or a specific component library — those belong in the consumer's own `eslint.config`, layered on top of our presets. Worked examples we rejected: `import/order` (almost all of its value comes from ~100 lines of project-specific alias `pathGroups`, and a groups-only version would just be overridden by every consumer), `no-restricted-globals` (its entries point at one project's `@shared/lib/regexp`), and the jQuery-selector and design-token rules (bound to one codebase's jQuery usage and to Kommo design tokens). A rule whose generic form is meaningless without project-specific values is not added, not even disabled.
2. **Pick the preset.** `base` for language-level rules that hold for plain JavaScript; `typescript` for anything that reads TS syntax; `react` for JSX.

   The `typescript` preset has **two** rule blocks, and choosing the wrong one is the most expensive mistake in this list. `@kommo-crm/eslint-config/typescript/rules` is unscoped and therefore applies to `.js` too; `@kommo-crm/eslint-config/typescript/ts-only` is scoped with `files: TS_FILES`. The test is: **does the rule listen to any node type espree emits?** If it only matches TS-only nodes (`TSTypeReference`, `PropertyDefinition[definite=true]`, …) it is inert on JavaScript and can live in the all-files block — `@typescript-eslint/array-type` is there for exactly that reason. If it matches nodes espree also produces — `@typescript-eslint/explicit-function-return-type` matches `FunctionDeclaration` and `ArrowFunctionExpression` — it **must** go in the `files: TS_FILES` block, or it fires on every function in every `.js` file the consumer owns.

3. **Write the failing test first.** Preset rules go in `packages/eslint-config/__tests__/presets/*.test.ts` (extend the matching `__tests__/fixtures/invalid.*` with a violation and assert `lintFixture` reports the rule id at the expected severity). `kommo/no-restricted-syntax` selectors go in `packages/eslint-config/__tests__/rules/restricted-syntax-selectors.test.ts` via the `RuleTester` helper. Run it and watch it fail for the right reason.
4. **Add the rule.** Ordinary rules go straight into the preset's `rules` block. Selectors for `kommo/no-restricted-syntax` go through `buildRestrictedSyntaxOptions` in `packages/eslint-config/src/presets/selectors.ts` and are **never** inlined into a preset: flat config _replaces_ per-rule option arrays instead of merging them, so a preset that spells out its own selector list silently drops every selector the base set contributed. The builder is the single source of truth.
5. **Guard against false positives.** Add a passing case to the relevant `valid.*` fixture (`valid.js`, `valid.ts`, `valid.tsx`) and assert **both** `errorCount === 0` **and** `warningCount === 0`. An errors-only assertion silently misses every `warn`-level rule.
6. **Regenerate snapshots last**, once, after every targeted test is already green:

   ```bash
   pnpm --filter @kommo-crm/eslint-config test:snapshot:update
   ```

   Then read the diff per rule id and account for every new entry: it must trace to a rule you deliberately added, on a fixture line you deliberately wrote. Regenerating early bakes a real regression into the baseline, and a large diff is easy to rubber-stamp.

7. **Update the docs and pick the right bump.** Add the rule to `packages/eslint-config/CHANGELOG.md`, then follow [Sending a pull request](#sending-a-pull-request) and the [semantic versioning](#semantic-versioning) rules above. Note that **a new rule at `error` severity is a breaking change for consumers** — under [Versioning during 0.x](#versioning-during-0x) it ships in a `0.x.0` minor rather than a patch.

One tooling detail: a dependency that is pulled in **by name** rather than by an `import` statement — `@types/react`, referenced only as `"types": ["react"]` in `__tests__/fixtures/tsconfig.json` — is invisible to knip and will be reported as unused. Add it to `ignoreDependencies` in `packages/eslint-config/knip.json`. A dependency you actually `import` should never need that entry; if knip complains about one of those, the import is wrong, not the config.

## Updating lint snapshots

`packages/eslint-config/__tests__/fixtures/invalid.js.errors.json` and `invalid.tsx.errors.json` are ground-truth snapshots of what ESLint reports when the full preset (`base + typescript + react`) runs against the broad fixtures ported from our core projects. `snapshot.test.ts` fails on any diff.

Regenerate them whenever you intentionally change a preset or bump a plugin version:

```bash
pnpm --filter @kommo-crm/eslint-config test:snapshot:update
```

Review the diff, commit it together with the preset change.

## Sending a pull request

We’ll review your pull request and either merge it, request changes to it, or close it with an explanation. We’ll do our best to provide updates and feedback throughout the process.

**Before submitting a pull request**, please:

1. Fork the repository and create your branch from `main`.
2. Run `pnpm install` in the repository root.
3. Make sure your code lints and types check: `pnpm lint && pnpm typecheck`.
4. Make sure tests pass, including snapshots: `pnpm test`.
5. Make sure your commits follow [Conventional Commits](https://www.conventionalcommits.org/) — husky and CI will reject anything else.

CI reports a single required status check, `verify`, which runs `make verify` (lint + knip + typecheck + build + coverage) — the same target the release workflow gates on. Pull requests additionally get a `Commit messages` check.

## Releasing

Releases are cut manually by maintainers. The full runbook lives in [`RELEASING.md`](../RELEASING.md). In short:

1. Maintainer updates `CHANGELOG.md` (`[Unreleased]` → `[X.Y.Z] - YYYY-MM-DD`), stages it, runs `npm version patch|minor|major --tag-version-prefix "$PKG@v"` in the target package (`PKG` being its directory name under `packages/`, e.g. `eslint-config`, so the tag is `<package>@vX.Y.Z`), and pushes the resulting commit and tag with `git push --follow-tags`.
2. The `Release` workflow (`.github/workflows/release.yml`) triggers on the `<package>@vX.Y.Z` tag, runs `make verify`, publishes the package to npm via trusted publishing (OIDC — no `NPM_TOKEN` secret involved), and creates a GitHub Release with auto-generated notes.

## Breaking changes

If your pull request contains breaking changes, please target the `next` branch for the next major release. Also, open a pull request against `main` that introduces the deprecation warnings and upgrade path.

If you are unsure if the changes are considered breaking or not, open your pull request against the `main` branch and let us know. We understand it can be uncomfortable asking for help and this is why we have a [code of conduct](./CODE_OF_CONDUCT.md) to ensure the community is positive, encouraging, and helpful.
