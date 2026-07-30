import { existsSync } from "node:fs";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [varlockVitePlugin(), devtoolsJson(), sveltekit(), tailwindcss()],
  css: { devSourcemap: true },
  server: existsSync("/.dockerenv")
    ? { host: true, watch: { usePolling: true, interval: 1000 } }
    : undefined,
});
