import { spawnSync } from "node:child_process";
import adapter from "@sveltejs/adapter-static";
import runesMode from "./src/runesMode.js";

const commit = spawnSync("git rev-parse HEAD", {
  encoding: "utf-8",
  shell: true,
}).stdout.trim();

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: runesMode(),
  kit: {
    adapter: adapter(),
    ...(commit ? { version: { name: commit } } : {}),
  },
  vitePlugin: { inspector: true },
};
