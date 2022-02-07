/* eslint-disable import/prefer-default-export */
import cache from "$lib/services/cache";
import type { ExternalFetch } from "@sveltejs/kit";

export const externalFetch: ExternalFetch = async (request) => {
  const ttl = request.headers.get("Svelte-Cache");
  request.headers.delete("Svelte-Cache");
  if (ttl) {
    return cache(keyFromRequest(request), parseInt(ttl, 10), async () =>
      reusableResponse(await fetch(request))
    );
  }
  return fetch(request);
};

function keyFromRequest(request: Request) {
  if (request.method !== "GET") {
    throw new Error(
      `Svelte-Cache not supported for ${request.method} requests`
    );
  }
  const headers = Object.fromEntries(request.headers.entries());
  return `externalFetch_${request.url}_${JSON.stringify(headers)}`;
}

/**
 * Create a RequestLike object that can be reused for multiple requests.
 */
function reusableResponse(res: Response): Response {
  const textPromise = res.text();
  return {
    ok: res.ok,
    headers: res.headers,
    status: res.status,
    statusText: res.statusText,
    text: () => textPromise,
  } as Response;
}
