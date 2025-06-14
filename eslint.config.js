import "eslint-plugin-only-warn";
import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
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
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_+$" },
      ],
      curly: "warn",
      eqeqeq: "warn",
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],
      "no-useless-rename": "warn",
      "object-shorthand": "warn",
      "prefer-const": "off",
      "prefer-template": "warn",
      "svelte/block-lang": ["warn", { script: "ts" }],
      "svelte/no-at-html-tags": "off",
      "svelte/prefer-const": ["warn", { destructuring: "all" }],
      "svelte/require-each-key": "off",
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
    files: ["**/*.cjs"],
    rules: {
      // Allow require() in CommonJS modules.
      "@typescript-eslint/no-require-imports": "off",
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
