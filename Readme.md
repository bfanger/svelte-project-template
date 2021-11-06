# Svelte Project Template

[Svelte](https://svelte.dev/) project preconfigured with:

- [SvelteKit](https://kit.svelte.dev/) ([Vite](https://vitejs.dev))
- [Typescript](http://typescriptlang.org)
- [Sass](https://sass-lang.com)
- [Prettier](https://prettier.io) & [Eslint](https://eslint.org)
- [Husky](https://typicode.github.io/husky/) & [Lint-staged](https://github.com/okonet/lint-staged)
- [Jest](https://jestjs.io)

## Initial setup

```sh
npx degit "github.com/bfanger/svelte-project-template#main" my-svelte-project
cd my-svelte-project
git init && git add .
yarn            # or  npm install
yarn dev --open # or  npm run dev
```

## Linting

```sh
yarn lint  # or  npm run lint
```

## Build

```sh
yarn build  # or  npm run build
npx serve -s build
```
