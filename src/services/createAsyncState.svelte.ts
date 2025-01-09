import asError from "./asError";

export class AsyncState<T> {
  pending: boolean = $state.raw(true);
  error: Error | undefined = $state.raw<Error | undefined>(undefined);
  data: T | undefined = $state.raw<T | undefined>(undefined);
}

/**
 * Related to the {#await} block but allows using the results of the promise inside the script section.
 *
 * Usage:
 * ```ts
 *   const asyncPost = createAsyncState(() => loadPost(id));
 *   const { pending, error, data: post } = $derived(asyncPost);
 * ```
 */
export default function createAsyncState<T>(fn: () => Promise<T>) {
  const state = new AsyncState<T>();

  let latest: Promise<T> | undefined;

  $effect(() => {
    try {
      state.pending = true;
      state.error = undefined;
      state.data = undefined;

      const promise = fn();
      latest = promise;

      promise
        .then((result) => {
          if (promise === latest) {
            state.pending = false;
            state.data = result;
          }
        })
        .catch((err) => {
          if (promise === latest) {
            state.pending = false;
            state.error = asError(err);
          }
        });
    } catch (err) {
      state.pending = false;
      state.error = asError(err);
    }
  });

  return state;
}
