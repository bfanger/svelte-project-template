/* eslint-disable @typescript-eslint/no-unsafe-argument */
import "eslint-plugin-only-warn";
// @ts-ignore
import js from "@eslint/js";
import ts from "typescript-eslint";
// @ts-ignore
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  // @ts-ignore
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
      parser: svelteParser,
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: [".svelte"],
        project: `tsconfig.eslint.json`,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_+$" },
      ],
      eqeqeq: "warn",
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],
      "no-useless-rename": "warn",
      "object-shorthand": "warn",
      "prefer-template": "warn",
      "svelte/block-lang": ["warn", { script: "ts" }],
      "svelte/no-at-html-tags": "off",
    },
  },
  {
    files: ["src/routes/**/*.ts", "src/routes/**/*.svelte"],
    rules: {
      // ESLint is not aware of the generated ./$types and reports false positives
      "@typescript-eslint/no-unsafe-argument": 0,
      "@typescript-eslint/no-unsafe-call": 0,
    },
  },
  {
    ignores: [
      ".svelte-kit",
      ".vercel",
      "build",
      "node_modules",
      "package",
      "vite.config.ts.timestamp-*.mjs",
    ],
  },
);
