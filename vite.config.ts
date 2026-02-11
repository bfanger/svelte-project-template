import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [devtoolsJson(), sveltekit(), tailwindcss()],
  css: { devSourcemap: true },
});
