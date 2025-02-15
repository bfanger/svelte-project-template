import { type TypeOf, type ZodType } from "zod";
import { browser } from "$app/environment";
import asError from "./asError";

const namespace = "app_";

type StorageType = "localStorage" | "sessionStorage";
const signal: Record<
  StorageType,
  Record<string, string | null | undefined>
> = $state({
  localStorage: {},
  sessionStorage: {},
});

if (browser) {
  window.addEventListener("storage", ({ key, newValue }) => {
    if (key?.startsWith(namespace)) {
      signal.localStorage[key.substring(namespace.length)] = newValue;
    }
  });
}

/**
 * Typesafe reactive API using Signals for interacting with localStorage or sessionStorage
 *
 * - Automatic JSON serialization/deserialization
 * - Zod schema validation
 * - Fallback via Zod .catch
 * - Cross-tab synchronization
 *
 * Usage:
 *   const token = storage("token", z.string().catch(""));
 *
 *   // Read
 *   console.log(token.value);
 *   // Write
 *   token.value = "new value";
 *
 */
export default function storage<T extends ZodType<any, any, any>>(
  key: string,
  schema: T,
  type: StorageType = "localStorage",
) {
  const backend = init(type);
  let jsonValue: string | null | undefined = backend.getItem(namespace + key);
  if (signal[type][key] !== jsonValue) {
    signal[type][key] = jsonValue;
  }
  let value = $derived.by(() => {
    let parsed: unknown;
    try {
      jsonValue = signal[type][key];
      if (typeof jsonValue === "string") {
        parsed = JSON.parse(jsonValue);
      }
    } catch (err) {
      console.warn(
        `Invalid JSON in ${type} for key: ${key}\n${asError(err).message}`,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(parsed) as TypeOf<T>;
  });

  return {
    get value() {
      return value;
    },
    set value(update: TypeOf<T>) {
      jsonValue = JSON.stringify(update);
      signal[type][key] = jsonValue;
      backend.setItem(namespace + key, jsonValue);
    },
    reset() {
      signal[type][key] = null;
      backend.removeItem(namespace + key);
    },
  };
}

const dummyStorage: Storage = {
  length: 0,
  key: () => null,
  getItem: () => null,
  setItem: () => {
    console.warn("Storage::setItem() is not available in SSR");
  },
  removeItem: () => {
    console.warn("Storage::setItem() is not available in SSR");
  },
  clear() {
    console.warn("Storage::clear() is not available in SSR");
  },
};

function init(backend: "localStorage" | "sessionStorage"): Storage {
  if (browser) {
    return backend === "sessionStorage" ? sessionStorage : localStorage;
  }
  return dummyStorage;
}
