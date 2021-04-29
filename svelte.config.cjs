const preprocess = require("svelte-preprocess");
const adapter = require("@sveltejs/adapter-static");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  preprocess: preprocess(),

  kit: {
    target: "svelte-app",
    adapter: adapter(),
  },
};
