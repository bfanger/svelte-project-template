#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";

const projectDir = new URL(".", import.meta.url).pathname;

const packageJson = JSON.parse(
  await fs.readFile(path.resolve(projectDir, "package.json"), "utf-8"),
);

const scripts = {
  "dev:vite": "vite dev",
  "dev:storybook": "storybook dev -p 6006 --no-open",
  "build:vite": "vite build",
  "build:storybook": "storybook build --output-dir build/styleguide-storybook",
  // test: 'concurrently -c "#fcc72a","#45ba4b" --kill-others-on-fail "npm:test:*"', // vitest interferes with playwright's reuseExistingServer
  test: "npm run test:vitest && npm run test:playwright",
  "test:vitest": "vitest run --passWithNoTests",
  "test:playwright": "playwright test",
  vitest: "vitest watch",
  playwright:
    'npx chokidar-cli "playwright/**/*.ts" --initial -c "npx playwright test"',
};
for (const [task, command] of Object.entries(scripts)) {
  packageJson.scripts[task] = packageJson.scripts[task] || command;
}
if (packageJson.scripts.dev === "vite dev") {
  packageJson.scripts.dev =
    'concurrently -c "#747bff","#990f3f" --kill-others-on-fail "npm:dev:*"';
}
if (packageJson.scripts.build === "vite build") {
  packageJson.scripts.build = "npm run build:vite && npm run build:storybook";
}

const devDependencies = {
  "@faker-js/faker": "^8.0.0",
  "@playwright/test": "^1.33.0",
  "@storybook/addon-essentials": "^7.0.10",
  "@storybook/addon-interactions": "^7.0.10",
  "@storybook/addon-links": "^7.0.10",
  "@storybook/blocks": "^7.0.10",
  "@storybook/svelte": "^7.0.10",
  "@storybook/sveltekit": "^7.0.10",
  "@storybook/testing-library": "^0.2.0",
  "@testing-library/svelte": "^4.0.3",
  "happy-dom": "^12.0.1",
  react: "^18.2.0",
  "react-dom": "^18.2.0",
  vitest: "^0.34.3",
  storybook: "^7.0.10",
};
for (const [dependency, version] of Object.entries(devDependencies)) {
  packageJson.devDependencies[dependency] =
    packageJson.devDependencies[dependency] || version;
}

for (const folder of [".storybook", "playwright", "playwright/tests"]) {
  // eslint-disable-next-line no-await-in-loop
  await fs
    .stat(path.resolve(projectDir, folder))
    .catch(() => fs.mkdir(path.resolve(projectDir, folder)));
}

async function writeFile(filename, body) {
  await fs.writeFile(path.resolve(projectDir, filename), body);
  process.stdout.write(`created "${filename}" (${body.length} bytes)\n`);
}

await writeFile("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
await writeFile(
  "vitest.config.ts",
  `import { sveltekit } from "@sveltejs/kit/vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "package", "playwright"],
  },
});
`,
);
await writeFile(
  "playwright.config.ts",
  `import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const CI = !!process.env.CI;

const config: PlaywrightTestConfig = {
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: CI,
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
  },
  webServer: {
    port: 5173,
    reuseExistingServer: true,
    command: \`\${
      process.platform === "darwin" ? "npm run build:vite && " : ""
    } npm run preview -- --port 5173\`,
  },
  ...(CI
    ? {
        projects: [
          { name: "Chrome", use: { ...devices["Desktop Chrome"] } },
          { name: "Firefox", use: { ...devices["Desktop Firefox"] } },
          // "iPhone" instead of "Desktop Safari" to also run the tests on a small screen.
          { name: "iPhone", use: { ...devices["iPhone 13 Pro"] } },
        ],
      }
    : {}),
};

export default config;
`,
);
await writeFile(
  "playwright/tests/hello-world.spec.ts",
  `import { test, expect } from "@playwright/test";

test("hello world", async ({ page }) => {
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page.locator("text=Hello world").click();
  await expect(page.locator("text=Hello you")).toBeVisible();
});
`,
);
await writeFile(
  ".storybook/main.ts",
  `import type { StorybookConfig } from "@storybook/sveltekit";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/sveltekit",
    options: {},
  },
};
export default config;
`,
);
await writeFile(
  ".storybook/preview-head.html",
  `<script>
  window.global = window;
</script>
`,
);
const appScssExists = await fs
  .stat(path.resolve(projectDir, "src/app.scss"))
  .catch(() => false);

if (appScssExists) {
  await writeFile(
    ".storybook/preview.ts",
    `import "../src/app.scss";
`,
  );
}

await writeFile(
  ".husky/pre-push",
  `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test
`,
);
await fs.chmod(path.resolve(projectDir, ".husky/pre-push"), "755");

const helloComponentExists = await fs
  .stat(path.resolve(projectDir, "src/components/Hello/Hello.svelte"))
  .catch(() => false);

if (helloComponentExists) {
  await writeFile(
    "src/components/Hello/Hello.spec.ts",
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
    const { getByText, component } = render(
      Hallo as any,
      { name: "world" } as any,
    );
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
`,
  );
  await writeFile(
    "src/components/Hello/Hello.stories.ts",
    `import { faker } from "@faker-js/faker/locale/nl";
import Hello from "./Hello.svelte";

export default {
  title: "Example/Hello",
  component: Hello,
  argTypes: {
    name: { control: "text" },
  },
};

export const Random = {
  args: {
    name: faker.name.firstName(),
  },
};
export const World = {
  args: {
    name: "world",
  },
};
`,
  );
}
process.stdout.write(
  "\n\nTo bring in the additional depencencies for Vitest & Storybook run:\n\npnpm install  # or npm install\n",
);
