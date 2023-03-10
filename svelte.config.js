import { execSync } from "child_process";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    version: { name: execSync("git rev-parse HEAD || date").toString().trim() },
  },
  vitePlugin: {
    experimental: {
      inspector: { holdMode: true },
    },
  },
};
