export type CacheConfig<T> = {
  revalidate?: number; // number of seconds to wait before revalidating the task
  ttl?: number; // number of seconds to wait before clearing the cached data
  reuse?: number; // number of seconds to wait before retying the task, default 10 seconds
  validate?: (result: T) => boolean; // check if the
};
type Timer = ReturnType<typeof setTimeout>;
type SWR<T> = { stale: T; while: number };

const promises = new Map<string, Promise<unknown>>();
const swr = new Map<string, SWR<unknown>>();
const ttlTimers = new Map<string, Timer>();
const reuseTimers = new Map<string, Timer>();

/**
 * An in-memory caching helper
 *
 * @param key globally unique key
 * @param factory Creates the promise that will be cached
 * @param config Cache configuration
 *
 * Usage:
 *   const result = await cache('unique_key', () => doStuff((), { ttl:30 })
 *
 * First call with the 'unique_key' calls the doStuff() and stores the promise for 30 seconds.
 * Additional calls with the 'unique_key' key will return that cached promise.
 * If the promise rejects, the cached promise is flushed.
 */
export default async function cache<T>(
  key: string,
  factory: () => Promise<T>,
  config: CacheConfig<T>,
): Promise<T> {
  const cacheHit = promises.get(key) as Promise<T> | undefined;
  if (cacheHit) {
    return cacheHit;
  }
  const swrHit = swr.get(key) as SWR<T> | undefined;
  if (swrHit) {
    if (swrHit.while > Date.now()) {
      return swrHit.stale;
    }

    void revalidate(key, swrHit, factory, config);
    return swrHit.stale;
  }

  const entry = factory();
  promises.set(key, entry);
  clearTimeout(reuseTimers.get(key));
  reuseTimers.set(
    key,
    setTimeout(
      () => {
        if (promises.get(key) === entry) {
          flush(key);
        }
      },
      config.reuse ?? 10 * 1000,
    ),
  );
  const promise = entry
    .then((result) => {
      if (!promises.has(key) || promises.get(key) === entry) {
        clearTimeout(reuseTimers.get(key));
        reuseTimers.delete(key);
        const invalid = config.validate ? !config.validate(result) : false;
        if (invalid) {
          flush(key);
          return result;
        }
        if (config.revalidate) {
          swr.set(key, {
            stale: result,
            while: Date.now() + config.revalidate * 1000,
          });
          promises.delete(key);
        }
        if (config.ttl) {
          clearTimeout(ttlTimers.get(key));
          ttlTimers.set(
            key,
            setTimeout(() => {
              if (promises.get(key) === entry) {
                flush(key);
              }
            }, config.ttl * 1000),
          );
        }
      }
      return result;
    })
    .catch((err) => {
      if (promises.get(key) === entry) {
        flush(key);
      }
      throw err;
    });

  return promise;
}
/**
 * Clear the cached promise for a specific key
 */
export function flush(key: string) {
  promises.delete(key);
  swr.delete(key);
  clearTimeout(reuseTimers.get(key));
  reuseTimers.delete(key);
  clearTimeout(ttlTimers.get(key));
  ttlTimers.delete(key);
}
/**
 * Clear all cached values
 */
export function flushAll() {
  promises.clear();
  swr.clear();
  reuseTimers.forEach(clearTimeout);
  reuseTimers.clear();
  ttlTimers.forEach(clearTimeout);
  ttlTimers.clear();
}

async function revalidate<T>(
  key: string,
  start: SWR<T>,
  factory: () => Promise<T>,
  config: CacheConfig<T>,
) {
  if (!config.revalidate || config.revalidate <= 0) {
    swr.delete(key);
    throw new Error("Invalid config.revalidate value");
  }
  const entry: SWR<T> = {
    ...start,
    while:
      Date.now() + (config.reuse ? config.reuse : config.revalidate) * 1000,
  };
  swr.set(key, entry);
  try {
    const result = await factory();
    const invalid = config.validate ? !config.validate(result) : false;
    if (invalid) {
      if (swr.get(key) === entry) {
        swr.set(key, start);
      }
      return;
    }
    const current = {
      stale: result,
      while: Date.now() + config.revalidate * 1000,
    };
    swr.set(key, current);
    if (config.ttl) {
      clearTimeout(ttlTimers.get(key));
      ttlTimers.set(
        key,
        setTimeout(() => {
          if (swr.get(key) === current) {
            flush(key);
          }
        }, config.ttl * 1000),
      );
    }
  } catch (err) {
    if (swr.get(key) === entry) {
      swr.set(key, start);
    }
    throw err;
  }
}
