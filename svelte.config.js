import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: preprocess({ sourceMap: true }),
  kit: {
    prerender: { default: true },
    adapter: adapter(),
    vite: {
      css: {
        devSourcemap: true, // Experimental and usually the wrong line, but the filename info is very useful.
      },
    },
  },
};
