# Svelte Project Template

[Svelte](https://svelte.dev/) project preconfigured with:

- [SvelteKit](https://kit.svelte.dev/) ([Vite](https://vitejs.dev/))
- [Typescript](http://typescriptlang.org/)
- [Sass](https://sass-lang.com/) & [PostCSS Preset Env](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env) ( which includes [Autoprefixer](https://github.com/postcss/autoprefixer))
- [Prettier](https://prettier.io/) & [Eslint](https://eslint.org/)
- [Husky](https://typicode.github.io/husky/) & [Lint-staged](https://github.com/okonet/lint-staged)
- [Vitest](https://vitest.dev/) \*1
- [Playwright](https://playwright.dev/) \*1
- [Storybook](https://storybook.js.org/docs/svelte/writing-stories/introduction) \*1

\*1: To keep the installation speedy Vitest, Playwright and Storybook are disabled by default.

## Initial setup

```sh
npx degit "github.com/bfanger/svelte-project-template#main" my-svelte-project
cd my-svelte-project
git init && git add .
pnpm install     # or  npm install
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
- Number of folders inside node_modules grows from ~347 to ~967.

## Linting

```sh
pnpm lint  # or  npm run lint
```

## Build

```sh
pnpm build             # or  npm run build
npx serve@latest build # or  npm run preview
```
