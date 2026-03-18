import { safeParse, type BaseSchema, type InferOutput } from "valibot";
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
 * - Valibot validation
 * - Default values and fallback via Valibot .fallback
 * - Cross-tab synchronization
 *
 * Usage:
 *   const token = storage("token", v.fallback(v.string(), ""))
 *
 *   // Read
 *   console.log(token.value);
 *   // Write
 *   token.value = "new value";
 *
 */
export default function storage<T extends BaseSchema<any, any, any>>(
  key: string,
  schema: T,
  type: StorageType = "localStorage",
): InferOutput<T> {
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
        `[storage] Invalid JSON in ${type} for key: ${key}\n${asError(err).message}`,
      );
    }
    const result = safeParse<T>(schema, parsed);
    if (!result.success) {
      console.warn(
        `[storage] Invalid value for ${JSON.stringify(key)}:`,
        parsed,
        `\n\nAdd valibot fallback to the schema:\nconst ${key} = storage(${JSON.stringify(key)}, v.fallback(v.string(), ""))`,
      );
    }
    return result.output;
  });

  return {
    get value() {
      return value;
    },
    set value(update: InferOutput<T>) {
      jsonValue = JSON.stringify(update);
      signal[type][key] = jsonValue;
      backend.setItem(namespace + key, jsonValue);
      const result = safeParse(schema, JSON.parse(jsonValue));
      if (!result.success || JSON.stringify(result.output) !== jsonValue) {
        console.warn(
          `[storage] Invalid value for ${JSON.stringify(key)}:`,
          update,
        );
      }
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
