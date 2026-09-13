---
name: expo-quality-checks
description: Documents this Expo project's quality gates—husky pre-commit (`pnpm run check`), TypeScript, ESLint 9 flat config, Prettier, unused lint-staged, and GitHub Actions CI. Use when setting up or changing commit hooks, lint/format/typecheck, ESLint, Prettier, husky, lint-staged, or GitHub Actions quality CI.
---

# Expo Quality Checks

Source of truth is **this repo's files**, not generic Expo tutorials. Always **pnpm** (never npm).

Read [configs.md](configs.md) only when copying file contents for a greenfield setup.

## When to use

- Adding or changing husky / pre-commit / CI quality steps
- Editing `typecheck`, `lint`, `format`, `check` scripts
- ESLint, Prettier, TypeScript, or VS Code quality tooling
- Reproducing this stack in a new Expo app

Uniwind / Tailwind install itself is the `uniwind` skill. This skill only covers the quality-tool side (`prettier-plugin-tailwindcss`, `eslint-plugin-tailwindcss`).

## What actually runs

```
git commit
  └── .husky/pre-commit → pnpm run check
        ├── prettier --write   (format:fix, whole repo)
        ├── expo lint
        ├── tsc --noEmit
        └── jest
```

`package.json`:

```json
{
  "typecheck": "tsc --noEmit",
  "format": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
  "format:fix": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
  "lint": "expo lint",
  "lint:fix": "expo lint --fix",
  "test": "jest",
  "check": "pnpm format:fix && pnpm lint && pnpm typecheck && pnpm test",
  "prepare": "husky"
}
```

| Gate | Trigger | Scope | Format | Passes if |
| --- | --- | --- | --- | --- |
| Local verify | `pnpm run check` (also STEP completion / PR-before) | Whole repo | **Writes** via `format:fix` | All four steps exit 0 |
| Pre-commit | husky `.husky/pre-commit` | Same as `check` | **Writes** | Same as `check` |
| CI | `.github/workflows/continuous-integration.yml` on every `push` | Whole repo | **Check only** (`pnpm run format`) | lint + format + typecheck + test |

`prepare: husky` installs hooks on `pnpm install`. Do not skip hooks (`--no-verify`) unless the user explicitly asks.

### lint-staged is installed but unused

`.lintstagedrc` exists (`eslint --fix` then `prettier --write` on staged files). **`.husky/pre-commit` does not call it.** Commits run the full-repo `check`, not staged-only lint.

Do not wire lint-staged into the hook unless the user asks. If they do, use `pnpm exec lint-staged --concurrent false` (not `npm`).

### Format write vs check

Pre-commit / `check` **rewrites** files. CI **fails** if working tree is unformatted. After `format:fix` in a hook, leftover unstaged prettier diffs can remain because husky does not re-`git add`. Prefer formatting before `git add`, or expect a dirty tree after commit.

## Agent rules

1. Package manager is **pnpm**. CI uses `pnpm install --frozen-lockfile`.
2. After changing ESLint / Prettier / tsconfig / scripts / hooks, run `pnpm run check`.
3. At each feature STEP, run `pnpm run check` (see `.cursor/rules/cursor-rules.mdc`).
4. ESLint is **flat config** (`eslint.config.js`, ESLint 9). Do not recreate `.eslintrc.*`.
5. Import order is Prettier's job (`import/order` is `off`). Do not re-enable ESLint import sorting.
6. Tailwind class order is Prettier's job (`tailwindcss/classnames-order` is `off`).

## Greenfield setup (match this repo)

Use this order. Copy file bodies from [configs.md](configs.md).

### 1. App

```bash
pnpm create expo-app@latest <project-name>
cd <project-name>
pnpm dlx expo reset-project
```

Keep `"packageManager": "pnpm@9.15.4"` (or the repo's current pnpm).

### 2. TypeScript

`tsconfig.json` extends `expo/tsconfig.base`. Required extras in this repo:

- `strict`, `isolatedModules`, `verbatimModuleSyntax`, `allowImportingTsExtensions`
- `module` / `moduleResolution`: `ESNext` / `bundler` (not `"node"`)
- `lib`: `["ESNext"]` only (no `DOM` unless web APIs are a first-class target)
- paths: `"@/*": ["./*"]`
- include Uniwind-generated `uniwind-types.d.ts` once Uniwind exists
- exclude `node_modules`, `app-example`, `.cursor`, `.claude`

Script: `"typecheck": "tsc --noEmit"`

### 3. ESLint

```bash
pnpm dlx expo lint
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-import eslint-plugin-react eslint-plugin-jest eslint-plugin-tailwindcss eslint-import-resolver-typescript
```

Use **flat config** (`eslint.config.js`). Scripts: `"lint": "expo lint"`, `"lint:fix": "expo lint --fix"`.

Keep these rule intents:

- `react/react-in-jsx-scope`: off
- unused vars warn; ignore `_` prefix
- `consistent-type-imports` with `inline-type-imports`
- `no-misused-promises` with `checksVoidReturn.attributes: false`
- Expo Router `app/**`: allow default export
- tests: jest plugin; relax `any` / unsafe; forbid `test.only` and `console`

### 4. Prettier

```bash
pnpm add -D prettier @ianvs/prettier-plugin-sort-imports prettier-plugin-tailwindcss
```

Plugin order: sort-imports **then** tailwindcss. Ignore `.cursor/` and `.claude/` in `.prettierignore`.

### 5. husky

```bash
pnpm add -D husky
pnpm exec husky init
```

Ensure `"prepare": "husky"`. Replace `.husky/pre-commit` with:

```
pnpm run check
```

### 6. GitHub Actions

`.github/workflows/continuous-integration.yml`:

- `on.push.branches: ["**"]`
- `pnpm/action-setup@v4` + `actions/setup-node@v4` with `cache: "pnpm"`
- `pnpm install --frozen-lockfile`
- `pnpm run lint` → `format` → `typecheck` → `test`

Do not use npm cache or `npm install`.

### 7. VS Code (optional)

This repo only recommends `expo.vscode-expo-tools` and a small `settings.json` (source.fixAll / organizeImports). Do not paste large generic editor configs unless asked.

## File map

| File | Role |
| --- | --- |
| `package.json` `scripts` | Commands above + `prepare` |
| `tsconfig.json` | Typecheck surface |
| `eslint.config.js` | Lint rules |
| `.prettierrc.mjs` | Format + import order |
| `.prettierignore` | Skip AI tool dirs |
| `.husky/pre-commit` | Commit gate → `pnpm run check` |
| `.lintstagedrc` | Present, **not hooked** |
| `.github/workflows/continuous-integration.yml` | Push gate |
| `.vscode/extensions.json`, `.vscode/settings.json` | Editor hints |
