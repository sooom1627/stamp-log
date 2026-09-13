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
