#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(
  await fs.readFile(path.resolve(projectDir, "package.json"), "utf-8"),
);

const scripts = {
  "dev:vite": "vite dev",
  "dev:storybook": "storybook dev -p 6006 --no-open --disable-telemetry",
  "build:vite": "vite build",
  "build:storybook":
    "storybook build --output-dir build/client/styleguide-storybook",
  test: 'concurrently -c "#fcc72a","#45ba4b" --kill-others-on-fail "npm:test:*"',
  "test:vitest": "vitest run --passWithNoTests",
  "test:playwright": "playwright test",
  "vitest:watch": "vitest watch",
  "playwright:ui": "playwright test --ui",
};
for (const [task, command] of Object.entries(scripts)) {
  packageJson.scripts[task] = packageJson.scripts[task] || command;
}
if (packageJson.scripts.dev === "vite dev") {
  packageJson.scripts.dev =
    'concurrently -c "#747bff","#d6577d" --kill-others-on-fail "npm:dev:*"';
}
if (packageJson.scripts.build === "vite build") {
  packageJson.scripts.build = "npm run build:vite && npm run build:storybook";
}

const devDependencies = {
  "@faker-js/faker": "^9.7.0",
  "@playwright/test": "^1.52.0",
  "@storybook/addon-essentials": "^8.6.12",
  "@storybook/addon-interactions": "^8.6.12",
  "@storybook/addon-links": "^8.6.12",
  "@storybook/blocks": "^8.6.12",
  "@storybook/svelte": "^8.6.12",
  "@storybook/sveltekit": "^8.6.12",
  "@storybook/test": "^8.6.12",
  "@testing-library/svelte": "^5.2.7",
  "@testing-library/user-event": "^14.6.1",
  "happy-dom": "^17.4.7",
  react: "^19.1.0",
  "react-dom": "^19.1.0",
  storybook: "^8.6.12",
  vitest: "^3.1.3",
};
for (const [dependency, version] of Object.entries(devDependencies)) {
  packageJson.devDependencies[dependency] =
    packageJson.devDependencies[dependency] || version;
}

for (const folder of [".storybook", "playwright", "playwright/tests"]) {
  await fs
    .stat(path.resolve(projectDir, folder))
    .catch(() => fs.mkdir(path.resolve(projectDir, folder)));
}

async function writeFile(filename, body) {
  await fs.writeFile(path.resolve(projectDir, filename), body);
  process.stdout.write(`created "${filename}" (${body.length} bytes)\n`);
}

await writeFile("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
const viteConfig = await fs.readFile("vite.config.ts", "utf-8");
if (viteConfig.indexOf("test: {") === -1) {
  await writeFile(
    "vite.config.ts",
    viteConfig
      .replace(
        'import { defineConfig } from "vite";',
        'import { configDefaults, defineConfig } from "vitest/config";',
      )
      .replace(
        "\n});",
        `
  test: {
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "package", "playwright"],
  },
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
});`,
      ),
  );
}
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
  const response = await page.goto("http://localhost:5173/", {
    waitUntil: "networkidle",
  });
  expect(response?.status()).toBe(200);
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
  staticDirs: ["../static"],
};
export default config;
`,
);
await writeFile(
  ".storybook/preview.ts",
  `import "../src/app.css";
`,
);
const appCssExists = await fs
  .stat(path.resolve(projectDir, "src/app.css"))
  .catch(() => false);

if (appCssExists) {
  await writeFile(
    ".storybook/preview.ts",
    `import "../src/app.css";
`,
  );
}

await writeFile(
  ".husky/pre-push",
  `npm run test
`,
);
await fs.chmod(path.resolve(projectDir, ".husky/pre-push"), "755");

const helloComponentExists = await fs
  .stat(path.resolve(projectDir, "src/components/Hello/Hello.svelte"))
  .catch(() => false);

if (helloComponentExists) {
  await writeFile(
    "src/components/Hello/Hello.svelte.spec.ts",
    `import { expect, vi, test } from "vitest";
import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { flushSync } from "svelte";
import Hello from "./Hello.svelte";

/**
 * Note! For demonstration purposes only. this is a terrible unittest:
 * - It doesn't test any complexity we wrote
 * - The components is trivial an unlikely to break/change
 */

test("Hello should render content based on props", () => {
  const props = $state({ name: "world", onclick: () => {} });
  const { getByText } = render(Hello, { props });
  const el = getByText("Hello world");
  expect(el.textContent).toBe("Hello world");
  props.name = "you";
  flushSync();
  expect(el.textContent).toBe("Hello you");
});

test("Hello should trigger handlers based on events", async () => {
  const user = userEvent.setup();
  const onclick = vi.fn();
  const { getByText } = render(Hello, { props: { name: "click", onclick } });
  const button = getByText("Hello click");

  await user.click(button);
  expect(onclick).toBeCalledTimes(1);
});
`,
  );
  await writeFile(
    "src/components/Hello/Hello.stories.ts",
    `import { type Meta } from "@storybook/svelte";
import { faker } from "@faker-js/faker/locale/nl";
import Hello from "./Hello.svelte";

export default {
  title: "Example/Hello",
  component: Hello as any,
  argTypes: {
    name: { control: "text" },
  },
} as Meta<typeof Hello>;

export const Random = {
  args: {
    name: faker.person.firstName(),
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
  "\n\nTo bring in the additional dependencies for Vitest, Playwright and Storybook run:\n\npnpm install  # or npm install\n\n",
);
