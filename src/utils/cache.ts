type Timer = ReturnType<typeof setTimeout>;
const promises = new Map<string, Promise<any>>();
const ttlTimers = new Map<string, Timer>();
const timedOutTimers = new Map<string, Timer>();

/**
 * An in-memory caching helper
 *
 * @param key globally unique key
 * @param ttl Time to Live in sec. Determines how long the promise remains in the cache after resolving
 * @param factory Creates the promise that will be cached
 * @param timeout in sec. Clear the cached promise if it didn't resolve within this timeout.
 *
 * Usage:
 *   const result = await cache('unique_key', 30, () => doStuff(())
 *
 * First call with the 'unique_key' calls the doStuff() and stores the promise for 30 seconds.
 * Additional calls with the 'unique_key' key will return that cached promise.
 * If the promise rejects, the cached promise is flushed.
 */
export default async function cache<T>(
  key: string,
  ttl: number | ((val: T) => number), // time to live in seconds
  factory: () => Promise<T>,
  timeout = 5,
): Promise<T> {
  const cacheHit = promises.get(key) as Promise<T> | undefined;
  if (cacheHit) {
    return cacheHit;
  }
  const entry = factory();
  promises.set(key, entry);
  clearTimeout(timedOutTimers.get(key));
  timedOutTimers.set(
    key,
    setTimeout(() => {
      if (promises.get(key) === entry) {
        flush(key);
      }
    }, timeout * 1000),
  );
  return entry
    .then((response) => {
      if (!promises.has(key) || promises.get(key) === entry) {
        clearTimeout(timedOutTimers.get(key));
        timedOutTimers.delete(key);
        const duration = typeof ttl === "number" ? ttl : ttl(response);
        clearTimeout(ttlTimers.get(key));
        ttlTimers.set(
          key,
          setTimeout(() => {
            if (promises.get(key) === entry) {
              flush(key);
            }
          }, duration * 1000),
        );
      }
      return response;
    })
    .catch((err) => {
      if (promises.get(key) === entry) {
        flush(key);
      }
      throw err;
    });
}
/**
 * Clear the cached promise for a specific key
 */
export function flush(key: string) {
  promises.delete(key);
  clearTimeout(timedOutTimers.get(key));
  timedOutTimers.delete(key);
  clearTimeout(ttlTimers.get(key));
  ttlTimers.delete(key);
}
/**
 * Clear all cached values
 */
export function flushAll() {
  promises.clear();
  timedOutTimers.forEach(clearTimeout);
  timedOutTimers.clear();
  ttlTimers.forEach(clearTimeout);
  ttlTimers.clear();
}
