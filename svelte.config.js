import { spawnSync } from "node:child_process";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    version: {
      name: `${
        spawnSync("git rev-parse HEAD", { encoding: "utf-8", shell: true })
          .stdout || Date.now()
      }`.trim(),
    },
  },
  vitePlugin: { inspector: true },
};
