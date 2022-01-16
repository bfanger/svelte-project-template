#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";

const projectDir = new URL(".", import.meta.url).pathname;

const packageJson = JSON.parse(
  await fs.readFile(path.resolve(projectDir, "package.json"), "utf-8")
);

const scripts = {
  test: "vitest --passWithNoTests run",
  "test:watch": "npm run test -- --watch",
  storybook: "start-storybook -p 6006",
  "build-storybook": "build-storybook",
};
for (const [task, command] of Object.entries(scripts)) {
  packageJson.scripts[task] = packageJson.scripts[task] || command;
}

const devDependencies = {
  "@storybook/addon-actions": "^6.4.13",
  "@storybook/addon-essentials": "^6.4.13",
  "@storybook/addon-links": "^6.4.13",
  "@storybook/addon-svelte-csf": "^1.1.0",
  "@storybook/svelte": "^6.4.13",
  "@testing-library/svelte": "^3.0.3",
  jsdom: "^19.0.0",
  "storybook-builder-vite": "^0.1.13",
  vitest: "^0.1.17",
};
for (const [dependency, version] of Object.entries(devDependencies)) {
  packageJson.devDependencies[dependency] =
    packageJson.devDependencies[dependency] || version;
}

await fs.stat(path.resolve(projectDir, ".storybook")).catch(() => {
  return fs.mkdir(path.resolve(projectDir, ".storybook"));
});

async function writeFile(filename, body) {
  await fs.writeFile(path.resolve(projectDir, filename), body);
  process.stdout.write(`created "${filename}" (${body.length} bytes)\n`);
}

await writeFile("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
await writeFile(
  "vitest.config.ts",
  `// eslint-disable-next-line import/no-extraneous-dependencies
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, UserConfigExport } from "vite";

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    global: true,
    environment: "jsdom",
  },
} as UserConfigExport);
`
);
await writeFile(
  ".storybook/main.cjs",
  `const preprocess = require("svelte-preprocess");

module.exports = {
  core: {
    builder: "storybook-builder-vite",
  },
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(ts|svelte)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-svelte-csf",
  ],
  svelteOptions: {
    preprocess: preprocess(),
  },
};
`
);

await writeFile(
  ".husky/pre-push",
  `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test
`
);
await fs.chmod(path.resolve(projectDir, ".husky/pre-push"), "755");

const helloComponentExists = await fs
  .stat(path.resolve(projectDir, "src/lib/Hello.svelte"))
  .catch(() => false);

if (helloComponentExists) {
  await writeFile(
    "src/lib/Hello.spec.ts",
    `import { expect, it, describe, vi } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import Hallo from "./Hello.svelte";

/**
 * Note! For demonstation purposes only. this is a terrible unittest:
 * - It doesn't test any complexity we wrote
 * - The components is trivial an unlikely to break/change
 */
describe("Hello component", () => {
  it("should render based on prop", async () => {
    const { getByText, component } = render(Hallo, { name: "world" });
    const el = getByText("Hello world");
    expect(el.textContent).toBe("Hello world");
    component.$set({ name: "you" });
    await tick();
    expect(el.textContent).toBe("Hello you");
  });

  it("should trigger handlers based on events", async () => {
    const { getByText, component } = render(Hallo, { name: "click" });
    const listener = vi.fn();
    component.$on("click", listener);
    fireEvent(getByText("Hello click"), new MouseEvent("click"));
    expect(listener).toBeCalledTimes(1);
  });
});
`
  );
  await writeFile(
    "src/lib/Hello.stories.svelte",
    `<script lang="ts">
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import Hello from "./Hello.svelte";
</script>

<Meta
  title="Example/Hello"
  component={Hello}
  argTypes={{
    name: { control: "text" },
    click: { action: "click" },
  }}
/>

<Template let:args>
  <Hello name={args.name} on:click={args.click} />
</Template>

<Story
  name="Wereld"
  args={{
    name: "wereld",
  }}
/>

<Story
  name="World"
  args={{
    name: "world",
  }}
/>
`
  );
}
process.stdout.write(
  "\n\nTo bring in the additional depencencies for Vitest & Storybook run:\n\nyarn install  # or npm install\n"
);
