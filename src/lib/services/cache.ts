let storage: Record<string, Promise<any>> = {};
const timers: {
  ttl: Record<string, ReturnType<typeof setTimeout>>;
  timeout: Record<string, ReturnType<typeof setTimeout>>;
} = { ttl: {}, timeout: {} };

/**
 * In memory caching helper
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
  ttl: number,
  factory: () => Promise<T>,
  timeout = 5
): Promise<T> {
  const cacheHit = storage[key] as Promise<T> | undefined;
  if (cacheHit) {
    return cacheHit;
  }
  const entry = factory();
  storage[key] = entry;
  timers.timeout[key] = setTimeout(() => {
    if (storage[key] === entry) {
      flush(key);
    }
  }, timeout * 1000);
  return entry
    .then((result) => {
      if (storage[key] === entry || typeof storage[key] === "undefined") {
        clearTimeout(timers.timeout[key]);
        delete timers.timeout[key];
        timers.ttl[key] = setTimeout(() => {
          if (storage[key] === entry) {
            flush(key);
          }
        }, timeout * 1000);
      }
      return result;
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
  clearInterval(timers.timeout[key]);
  delete timers.timeout[key];
  clearInterval(timers.ttl[key]);
  delete timers.ttl[key];
}
/**
 * Clear all cached values
 */
function flushAll() {
  storage = {};
  Object.values(timers.timeout).forEach(clearTimeout);
  timers.timeout = {};
  Object.values(timers.ttl).forEach(clearTimeout);
  timers.ttl = {};
}
cache.flush = flush;
cache.flushAll = flushAll;
