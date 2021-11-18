module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.eslint.json",
    extraFileExtensions: [".cjs", ".svelte"],
  },
  env: {
    browser: true,
    jest: true,
  },
  extends: [
    "airbnb-base",
    "eslint-config-airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["only-warn", "svelte3"],
  settings: {
    "svelte3/typescript": true,
    "svelte3/ignore-styles": ({ lang }) => !!lang,
  },
  overrides: [
    {
      files: ["*.js", "*.cjs"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-var-requires": "off",
        "import/no-extraneous-dependencies": "off",
      },
    },
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
      // Interactions with other plugins: https://github.com/sveltejs/eslint-plugin-svelte3/blob/master/OTHER_PLUGINS.md
      rules: {
        "@typescript-eslint/no-unused-vars": "off", // is unable to detect $store as usage of store.
        "import/first": "off",
        "import/no-duplicates": "off",
        "import/no-mutable-exports": "off", // this is how props are defined
        "import/no-unresolved": "off", // didn't detect the $lib & $app aliases
        "import/order": "off", // autofix breaks code
        "import/prefer-default-export": "off", // the default export is implicit (it's the component)
        "no-undef-init": "off", // `needed to specify an prop with a defauft value of undefined
        "prettier/prettier": "off", // incompatible, luckily the vscode extension already applies prettier formatting
      },
    },
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-use-before-define": [
      "warn",
      { functions: false, classes: true, variables: true },
    ],
    "class-methods-use-this": "off",
    "import/extensions": "off",
    "import/no-extraneous-dependencies": ["warn", {}],
    "no-console": ["warn", { allow: ["warn", "error", "debug", "info"] }],
    "no-restricted-syntax": "off",
    "no-use-before-define": "off",
  },
};
