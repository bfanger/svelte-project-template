/* eslint-disable import/prefer-default-export */
import dotenv from "dotenv";
import type { ExternalFetch, Handle } from "@sveltejs/kit";
import cache from "$lib/services/cache";

dotenv.config();

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  const body = await response.text();
  // Inject environment variables
  return new Response(
    body.replace(
      '<script type="env"></script>',
      `<script>window.env = ${JSON.stringify(
        { API_ENDPOINT: process.env.API_ENDPOINT },
        null,
        2
      )}</script>`
    ),
    response
  );
};

export const externalFetch: ExternalFetch = async (request) => {
  if (request.headers.has("SSR-Cache") === false) {
    return fetch(request);
  }
  const ttl = parseInt(request.headers.get("SSR-Cache") as string, 10);
  request.headers.delete("SSR-Cache");

  return cache(
    keyFromRequest(request),
    (response) => (response.ok ? ttl : 0),
    async () => reusableResponse(await fetch(request))
  );
};

function keyFromRequest(request: Request) {
  if (request.method !== "GET") {
    throw new Error(`SSR-Cache not supported for ${request.method} requests`);
  }
  const headers = Object.fromEntries(request.headers.entries());
  return `SSR-Cache_${request.url}_${JSON.stringify(headers)}`;
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
