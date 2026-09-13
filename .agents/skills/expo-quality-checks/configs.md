# Config snapshots

Copy these when reproducing this repo's quality stack. Prefer reading the live files if they have drifted.

## `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "allowJs": true,
    "esModuleInterop": true,
    "jsx": "react-native",
    "lib": ["ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "target": "ESNext",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "uniwind-types.d.ts"
  ],
  "exclude": ["node_modules", "app-example", ".cursor", ".claude"]
}
```

## `.prettierrc.mjs`

Plugin order is required: sort-imports then tailwindcss.

```js
/** @typedef  {import("prettier").Config} PrettierConfig */
/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */
/** @type { PrettierConfig | SortImportsConfig } */
const config = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "",
    "^(react-native/(.*)$)|^(react-native$)",
    "",
    "^(expo(.*)$)|^(expo$)",
    "^@expo/(.*)$",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/(.*)$",
    "",
    "^[.][.]",
    "",
    "^[.]",
    "",
    "^.+\\.(css|scss|sass|less)$",
    "^.+\\.(jpg|jpeg|png|gif|svg|webp)$",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  singleQuote: false,
  semi: true,
  trailingComma: "all",
  tabWidth: 2,
  arrowParens: "always",
  printWidth: 80,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  proseWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
  endOfLine: "lf",
  jsxSingleQuote: false,
  embeddedLanguageFormatting: "auto",
};

export default config;
```

## `.prettierignore`

```
.cursor/
.claude/
```

## `.lintstagedrc` (not invoked by husky)

```json
{
  "**/*.{ts,tsx,js,jsx,cjs,mjs,md}": ["eslint --fix"],
  "**/*.{ts,tsx,js,jsx,cjs,mjs,md,json,lintstagedrc}": ["prettier --write"]
}
```

## `.husky/pre-commit`

```
pnpm run check
```

## GitHub Actions

```yaml
name: Continuous Integration
on:
  push:
    branches:
      - "**"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.0.0
          cache: "pnpm"

      - name: Install dependencies
        shell: bash
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Format
        run: pnpm run format

      - name: Typecheck
        run: pnpm run typecheck

      - name: Test
        run: pnpm run test
```

## ESLint

Do not paste a second copy here. The live file is `eslint.config.js` (ESLint 9 flat config, ~330 lines). When scaffolding, copy that file and keep:

- `ignores`: build artifacts, `*.config.*`, `*.d.ts`, `app-example/**`, `.cursor/**`, `.claude/**`
- typed lint via `parserOptions.project: "./tsconfig.json"`
- plugins: `@typescript-eslint`, `react`, `import`, `tailwindcss`; `jest` on `**/*.test.ts(x)`
- `import/order` off; `tailwindcss/classnames-order` off

## VS Code (this repo)

`.vscode/extensions.json`:

```json
{ "recommendations": ["expo.vscode-expo-tools"] }
```

`.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.organizeImports": "explicit",
    "source.sortMembers": "explicit"
  },
  "css.customData": [".vscode/css-custom-data.json"],
  "css.lint.unknownAtRules": "ignore"
}
```
