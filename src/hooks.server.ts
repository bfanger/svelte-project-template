import type { Handle, HandleFetch } from "@sveltejs/kit";
import cache from "./services/cache";

const headerWhitelist = ["content-type", "access-control-allow-origin"];
export const handle: Handle = async (input) => {
  const response = await input.resolve(input.event, {
    filterSerializedResponseHeaders: (name) => headerWhitelist.includes(name),
  });
  response.headers.set("X-Frame-Options", "sameorigin");
  return response;
};

export const handleFetch: HandleFetch = async ({ request, fetch, event }) => {
  request.headers.set("origin", event.url.origin);
  if (request.headers.has("SSR-Cache") === false) {
    return fetch(request);
  }
  const config = JSON.parse(request.headers.get("SSR-Cache") as string) as {
    dedupe: number;
    revalidate?: number;
    ttl?: number;
  };
  request.headers.delete("SSR-Cache");
  return cache(
    keyFromRequest(request),
    async () => reusableResponse(await fetch(request)),
    {
      ...config,
      validate: (response) => {
        return response.ok;
      },
    },
  );
};

function keyFromRequest(request: Request) {
  if (request.method !== "GET") {
    throw new Error(`SSR-Cache not supported for ${request.method} requests`);
  }
  return `SSR-Cache_${request.url}\t${request.headers.get("origin")}`;
}

/**
 * Create a RequestLike object that can be reused for multiple requests.
 */
function reusableResponse(res: Response): Response {
  const textPromise = res.text();
  const jsonPromise = textPromise.then((text) => JSON.parse(text) as unknown);
  return {
    ok: res.ok,
    headers: res.headers,
    status: res.status,
    statusText: res.statusText,
    text: () => textPromise,
    json: () => jsonPromise,
  } as Response;
}
