/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
const sveltePreprocess = require("svelte-preprocess");
const node = require("@sveltejs/adapter-node");
const pkg = require("./package.json");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  preprocess: sveltePreprocess(),
  kit: {
    adapter: node(),
    target: "svelte-app",
    vite: {
      ssr: {
        noExternal: Object.keys(pkg.dependencies || {}),
      },
    },
  },
};
