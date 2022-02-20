let values: Record<string, string>;

if (import.meta.env.SSR) {
  values = (process.env as any) || {};
} else {
  values = (window as any).env || {};
}
const reported: Record<string, true> = {};

/**
 * Retrieve an environment variable.
 *
 * Environment variables are *not* available in Storybook and clientside is restricted to the variables exposed in src/hooks.ts
 *
 * We're not using vite's import.meta.env because those ase staticly replaced at built time.
 * This approuch allows building a single deployment and inject variables at runtime
 */
export default function env(name: string): string | undefined {
  if (!values[name]) {
    if (!reported[name]) {
      console.warn(`Missing environment variable: ${name}`);
    }
    reported[name] = true;
  }
  return values[name];
}
