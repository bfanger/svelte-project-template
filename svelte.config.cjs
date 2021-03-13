/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
const sveltePreprocess = require("svelte-preprocess");
/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  preprocess: sveltePreprocess(),
  kit: {
    adapter: "@sveltejs/adapter-node",
    target: "#app",
  },
};
