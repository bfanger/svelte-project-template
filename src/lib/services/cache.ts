let storage: Record<string, Promise<any>> = {};
const timers: {
  ttl: Record<string, ReturnType<typeof setTimeout>>;
  timedout: Record<string, ReturnType<typeof setTimeout>>;
} = { ttl: {}, timedout: {} };

/**
 * In memory caching helper
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
  timeout = 5
): Promise<T> {
  const cacheHit = storage[key] as Promise<T> | undefined;
  if (cacheHit) {
    return cacheHit;
  }
  const entry = factory();
  storage[key] = entry;
  timers.timedout[key] = setTimeout(() => {
    if (storage[key] === entry) {
      flush(key);
    }
  }, timeout * 1000);
  return entry
    .then((response) => {
      if (storage[key] === entry || typeof storage[key] === "undefined") {
        clearTimeout(timers.timedout[key]);
        const duration = typeof ttl === "number" ? ttl : ttl(response);
        delete timers.timedout[key];
        timers.ttl[key] = setTimeout(() => {
          if (storage[key] === entry) {
            flush(key);
          }
        }, duration * 1000);
      }
      return response;
    })
    .catch((err) => {
      if (storage[key] === entry) {
        flush(key);
      }
      throw err;
    });
}
/**
 * Clear the cached promise for a spefic key
 */
function flush(key: string) {
  delete storage[key];
  clearInterval(timers.timedout[key]);
  delete timers.timedout[key];
  clearInterval(timers.ttl[key]);
  delete timers.ttl[key];
}
/**
 * Clear all cached values
 */
function flushAll() {
  storage = {};
  Object.values(timers.timedout).forEach(clearTimeout);
  timers.timedout = {};
  Object.values(timers.ttl).forEach(clearTimeout);
  timers.ttl = {};
}
cache.flush = flush;
cache.flushAll = flushAll;
