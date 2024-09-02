import { createConfigForNuxt } from "@nuxt/eslint-config/flat";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import prettierConfig from "eslint-config-prettier";

console.log(prettierConfig);
export default createConfigForNuxt({}).append(
  ...[
    {
      plugins: {
        "unused-imports": pluginUnusedImports,
      },
    },
    {
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "warn",
        "unused-imports/no-unused-vars": [
          "warn",
          {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
          },
        ],
      },
    },
    prettierConfig,

    // {files: ["**/*.{js,mjs,cjs,ts,vue}"]},
    // pluginJs.configs.recommended,
    // ...tseslint.configs.recommended,
    // ...pluginVue.configs["flat/essential"],
    // {files: ["**/*.vue"], languageOptions: {parserOptions: {parser: tseslint.parser}}},
  ],
);
