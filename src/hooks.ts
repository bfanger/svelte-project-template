import dotenv from "dotenv";
import type { ExternalFetch, Handle } from "@sveltejs/kit";
import cache from "$lib/services/cache";

dotenv.config();

const envScript = `<script type="svelte/env">${JSON.stringify(
  Object.fromEntries(
    Object.entries(process.env).filter(([key]) =>
      key.startsWith("SVELTE_PUBLIC_")
    )
  )
)}</script>`;

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  const body = await response.text();
  return new Response(
    body.replace('<script type="svelte/env"></script>', envScript),
    response
  );
};

export const externalFetch: ExternalFetch = async (request) => {
  if (request.headers.has("Svelte-Cache") === false) {
    return fetch(request);
  }
  const ttl = parseInt(request.headers.get("Svelte-Cache") as string, 10);
  request.headers.delete("Svelte-Cache");

  return cache(
    keyFromRequest(request),
    (response) => (response.ok ? ttl : 0),
    async () => reusableResponse(await fetch(request))
  );
};

function keyFromRequest(request: Request) {
  if (request.method !== "GET") {
    throw new Error(
      `Svelte-Cache not supported for ${request.method} requests`
    );
  }
  return `Svelte-Cache_${request.url}`;
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
