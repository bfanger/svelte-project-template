type Options<T> = {
  /** Number of seconds before calls to cache() will stop reusing the same promise, provide the expected pessimistic duration of the task */
  dedupe: number;
  /** Number of seconds before the result is considered stale and a revalidate is triggered, the stale data is still used as result */
  revalidate?: number;
  /** Number of seconds to wait before cached value removed from the cache */
  ttl?: number;
  /** Check if the resolved value is allow to be cached */
  validate?: (result: T) => boolean;
};
type Timer = ReturnType<typeof setTimeout>;
type SWR<T> = { result: T; till: number };

const promises = new Map<unknown, Promise<unknown>>();
const results = new Map<unknown, SWR<unknown>>();
const dedupeTimers = new Map<unknown, Timer>();
const ttlTimers = new Map<unknown, Timer>();

const debug = false;
const log = debug
  ? function (message: string, key: unknown) {
      console.info(`[cache] ${message}:`, key);
    }
  : // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {};

/**
 * An in-memory caching helper
 *
 * @param key globally unique key
 * @param task Creates the promise that will be cached
 *
 * Usage:
 *   const result = await cache('unique_key', () => doStuff((), { timeout: 10, ttl: 30 })
 *
 * First call with the 'unique_key' calls the doStuff() and stores the promise for 30 seconds.
 * Additional calls with the 'unique_key' key will return that cached promise.
 * If the promise rejects, the cached promise is flushed.
 */
export default async function cache<T>(
  key: unknown,
  task: () => Promise<T>,
  options: Options<T>,
): Promise<T> {
  const cacheHit = promises.get(key) as Promise<T> | undefined;
  if (cacheHit) {
    log("hit", key);
    return cacheHit;
  }
  const swr = results.get(key) as SWR<T> | undefined;
  if (swr) {
    if (swr.till > Date.now()) {
      log("fresh", key);
      return swr.result;
    }
    log("stale-while-revalidate", key);
    void revalidate(key, swr, task, options);
    return swr.result;
  }
  log("miss", key);
  const entry = task();
  promises.set(key, entry);
  clearTimeout(dedupeTimers.get(key));
  dedupeTimers.set(
    key,
    setTimeout(() => {
      log("timeout", key);
      promises.delete(key);
    }, options.dedupe * 1000),
  );
  return entry
    .then((result) => {
      if (promises.get(key) === entry) {
        clearTimeout(dedupeTimers.get(key));
        dedupeTimers.delete(key);
        const valid = options.validate ? options.validate(result) : true;
        if (!valid) {
          log("invalid", key);
          promises.delete(key);
          return result;
        }
        if (options.revalidate) {
          log("store", key);
          results.set(key, {
            result,
            till: Date.now() + options.revalidate * 1000,
          });
          promises.delete(key);
        }
        if (options.ttl) {
          clearTimeout(ttlTimers.get(key));
          ttlTimers.set(
            key,
            setTimeout(() => {
              flush(key);
            }, options.ttl * 1000),
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
}
/**
 * Clear the cache for a specific key
 */
export function flush(key: unknown) {
  log("flush", key);
  promises.delete(key);
  results.delete(key);
  clearTimeout(dedupeTimers.get(key));
  dedupeTimers.delete(key);
  clearTimeout(ttlTimers.get(key));
  ttlTimers.delete(key);
}
/**
 * Clear all cached results.
 */
export function flushAll() {
  log("flushAll", "");
  promises.clear();
  results.clear();
  dedupeTimers.forEach(clearTimeout);
  dedupeTimers.clear();
  ttlTimers.forEach(clearTimeout);
  ttlTimers.clear();
}

async function revalidate<T>(
  key: unknown,
  current: SWR<T>,
  task: () => Promise<T>,
  options: Options<T>,
) {
  if (!options.revalidate || options.revalidate <= 0) {
    results.delete(key);
    throw new Error("Invalid config.revalidate value");
  }
  // Prevent multiple revalidation in parallel
  const intermediate: SWR<T> = {
    result: current.result,
    till: Date.now() + options.dedupe * 1000,
  };
  results.set(key, intermediate);
  let result: T;
  try {
    result = await task();
  } catch (err) {
    if (results.get(key) === intermediate) {
      results.set(key, current);
    }
    console.warn(err);
    return;
  }
  const invalid = options.validate ? !options.validate(result) : false;
  if (invalid) {
    console.warn("Revalidation result was invalid for", key);
    if (results.get(key) === intermediate) {
      results.set(key, current);
    }
    return;
  }
  const revalidated: SWR<T> = {
    result,
    till: Date.now() + options.revalidate * 1000,
  };
  log("update", key);
  results.set(key, revalidated);
  if (options.ttl) {
    clearTimeout(ttlTimers.get(key));
    ttlTimers.set(
      key,
      setTimeout(() => {
        if (results.get(key) === revalidated) {
          flush(key);
        }
      }, options.ttl * 1000),
    );
  }
}
