# Svelte Project Template

[Svelte](https://svelte.dev/) project preconfigured with:

- [SvelteKit](https://kit.svelte.dev/) ([Vite](https://vitejs.dev/))
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/), [PostCSS Preset Env](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env) ( which includes [Autoprefixer](https://github.com/postcss/autoprefixer))
- [Prettier](https://prettier.io/), [ESLint](https://eslint.org/) & [Stylelint](https://stylelint.io/)
- [Husky](https://typicode.github.io/husky/) & [Lint-staged](https://github.com/okonet/lint-staged)
- [Vitest](https://vitest.dev/) \*1
- [Playwright](https://playwright.dev/) \*1
- [Storybook](https://storybook.js.org/docs/svelte/writing-stories/introduction) \*1

\*1: To keep the installation speedy Vitest, Playwright and Storybook are disabled by default.

## Initial setup

```sh
npx tiged "github.com/bfanger/svelte-project-template#main" my-svelte-project
cd my-svelte-project
git init --initial-branch main
git add .
pnpm install     # or  npm install
cp -n env.example .env
pnpm dev --open  # or  npm run dev -- --open
```

## Enabling Testing & Storybook

```sh
node ./enable-testing.js
pnpm install  # or  npm install
```

- Creates the configuration files
- Creates an example unittest
- Creates an example e2e test
- Creates an example storybook story
- node_modules grows from ~166M to ~288M.

## Linting

```sh
pnpm lint  # or  npm run lint
```

I'd recommend enabling format-on-save in your editor, but to apply all auto fixes manually:

```sh
pnpm format  # or  npm run format
```

## Build

```sh
pnpm build             # or  npm run build
npx serve@latest build # or  npm run preview
```
