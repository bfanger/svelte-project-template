module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions:{project:"./tsconfig.json"},
  extends: [
    "airbnb-base",
    "eslint-config-airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["only-warn"],
  rules: {
    "import/extensions": ["error", "ignorePackages", { ts: "never" }],
    "no-restricted-syntax": "off",
  },
  overrides: [
    {
      files: ["*.ts"],
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
      },
    },
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
