# Svelte Project Template

[Svelte](https://svelte.dev/) project preconfigured with:

- [SvelteKit](https://kit.svelte.dev/) ([Vite](https://vitejs.dev))
- [Typescript](http://typescriptlang.org)
- [Sass](https://sass-lang.com)
- [Eslint](https://eslint.org) & [Prettier](https://prettier.io)
- [Husky](https://typicode.github.io/husky/) & [Lint-staged](https://github.com/okonet/lint-staged)

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

To automaticly run linting before a git commit:

```sh
touch .git/hooks/pre-commit
chmod a+x .git/hooks/pre-commit
```

Creates the `.git/hooks/pre-commit` and makes it executable.

Edit the `pre-commit` file and replace the contents with:

```sh
#!/bin/sh
npm run precommit
```

## Build

```sh
yarn build  # or  npm run build
npx serve -s build
```

# Dependencies caveats

`typescript` is locked a v4.3.x because of [@typescript-eslint/typescript-estree](https://github.com/typescript-eslint/typescript-eslint/pull/3730)
