import { browser } from "$app/environment";
import { type TypeOf, type ZodType } from "zod";

const namespace = "app:";

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
  type: "localStorage" | "sessionStorage" = "localStorage",
) {
  const backend = init(type);
  let raw: string | null = $state(backend.getItem(namespace + key));
  const value = $derived.by(() => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw as string);
    } catch {
      //
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(parsed) as TypeOf<T>;
  });

  if (browser && type === "localStorage") {
    $effect(() => {
      const listener = (event: StorageEvent) => {
        if (event.key === namespace + key) {
          raw = event.newValue;
        }
      };
      window.addEventListener("storage", listener);
      return () => {
        window.removeEventListener("storage", listener);
      };
    });
  }

  return {
    get value() {
      return value;
    },
    set value(update: TypeOf<T>) {
      raw = JSON.stringify(update);
      backend.setItem(namespace + key, raw);
    },
    reset() {
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
