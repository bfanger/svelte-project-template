/**
 * Typed api with injectable fetch for SSR
 *
 * Instead of returning a response object the methods resolve the data directly.
 * Access to the corresponding Response object is still available via helper methods.
 * This allows access to the headers and http status code by passing the data or error to those helpers
 */
import { error, type NumericRange } from "@sveltejs/kit";
import buildUrl, { type PathParams, type SearchParams } from "./buildUrl";
import type { paths } from "./api-types.gen";

/* @svelte/adapter-node start */
// import { env } from "$env/dynamic/public";
//
// const PUBLIC_API_ENDPOINT = env.PUBLIC_API_ENDPOINT;
/* @svelte/adapter-node end */

/* @svelte/adapter-static start */
import { PUBLIC_API_ENDPOINT } from "$env/static/public";
/* @svelte/adapter-static end */

const slowResponseThreshold = 1000;
const responses = new WeakMap<any, Response>();

async function wrapped<T>(
  path: string,
  config: Config<{ params?: unknown }, unknown>,
  body?: unknown,
): Promise<T> {
  let { ssrCache, fetch, params, searchParams, ...init } = config;
  if (!fetch) {
    if (typeof window === "undefined") {
      throw new Error("Missing config.fetch");
    }
    fetch = window.fetch;
  }
  const headers = new Headers(init.headers);
  if (ssrCache && typeof window === "undefined") {
    headers.append("SSR-Cache", JSON.stringify(ssrCache));
  }
  const endpoint = PUBLIC_API_ENDPOINT;
  if (typeof endpoint !== "string" || endpoint === "") {
    throw new Error("Missing environment variable PUBLIC_API_ENDPOINT");
  }
  if (body !== undefined) {
    headers.append("Content-Type", "application/json; charset=utf-8");
    init.body = JSON.stringify(body);
  }
  const url =
    endpoint +
    buildUrl(path, params as PathParams<string>, searchParams as SearchParams);
  const start = Date.now();
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err: any) {
    if (err.message) {
      throw new Error(`${config.method} ${url} failed: ${err.message}`);
    }
    throw err;
  }
  const duration = Date.now() - start;
  if (duration > slowResponseThreshold) {
    console.info(
      `${config.method} ${url.substring(endpoint.length)} took ${(
        duration / 1000
      ).toFixed(3)}s`,
    );
  }
  if (!response.ok) {
    try {
      error(
        response.status as NumericRange<400, 599>,
        `${config.method} ${url} failed: ${response.status} ${response.statusText}`,
      );
    } catch (err) {
      responses.set(err, response);
      throw err;
    }
  }

  // Note: If the api is allowed to return empty or non-json content, this check should be tweaked or removed.
  if (!response.headers.get("Content-Type")?.startsWith("application/json")) {
    const err = new Error(
      `${config.method} ${url} failed: Missing 'Content-Type: application/json' header`,
    );
    responses.set(err, response);
    throw err;
  }
  const data = await response.json();
  if (config.signal?.aborted) {
    throw new Error("Aborted");
  }
  if (typeof data === "object" && data !== null) {
    responses.set(data, response);
  }
  return data as T;
}

export const api = {
  get: <T extends keyof Responses<"get">>(
    path: T,
    config: Config<ParamsProperty<T>, RequestSearchParams<"get">[T]>,
  ) => wrapped<Responses<"get">[T]>(path, { ...config, method: "GET" }),

  post: <T extends keyof Requests<"post">>(
    path: T,
    data: Requests<"post">[T],
    config: Config<ParamsProperty<T>, RequestSearchParams<"post">[T]>,
  ) => wrapped<Responses<"post">[T]>(path, { ...config, method: "POST" }, data),

  put: <T extends keyof Requests<"put">>(
    path: T,
    data: Requests<"put">[T],
    config: Config<ParamsProperty<T>, RequestSearchParams<"put">[T]>,
  ) => wrapped<Responses<"put">[T]>(path, { ...config, method: "PUT" }, data),

  patch: <T extends keyof Requests<"patch">>(
    path: T,
    data: Requests<"patch">[T],
    config: Config<ParamsProperty<T>, RequestSearchParams<"patch">[T]>,
  ) =>
    wrapped<Responses<"patch">[T]>(path, { ...config, method: "PATCH" }, data),

  delete: <T extends keyof Responses<"delete">>(
    path: T,
    config: Config<ParamsProperty<T>, RequestSearchParams<"delete">[T]>,
  ) => wrapped<Responses<"delete">[T]>(path, { ...config, method: "DELETE" }),
};

export default api;

export function getResponse(dataOrError: unknown): Response | undefined {
  return responses.get(dataOrError);
}

export function getStatus(dataOrError: unknown): number | undefined {
  const response = getResponse(dataOrError);
  if (response) {
    return response.status;
  }
  return undefined;
}

export function getStatusText(dataOrError: unknown): string | undefined {
  const response = getResponse(dataOrError);
  if (response) {
    return response.statusText;
  }
  return undefined;
}

export function getHeader(
  dataOrError: unknown,
  name: string,
): string | undefined {
  const response = getResponse(dataOrError);
  if (response) {
    const value = response.headers.get(name);
    if (value !== null) {
      return value;
    }
  }
  return undefined;
}

type ParamsProperty<T> = T extends `${string}{${string}}${string}`
  ? { params: PathParams<T> }
  : { params?: never };

type Config<TParams, TSearchParams> = RequestInit &
  TParams & {
    fetch?: typeof fetch;
    ssrCache?: { dedupe: number; revalidate?: number; ttl?: number };
    searchParams?: TSearchParams;
  };

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

/**
 * Union of strings with routes for a specific HTTP config.method.
 */
type Routes<TMethod extends HttpMethod> = {
  [KPath in keyof paths]: paths[KPath] extends Record<TMethod, unknown>
    ? KPath
    : never;
}[keyof paths];

/**
 * Extract the json response(s) from a operation based on a union of status codes.
 */
type JsonContent<TStatus extends number | "default", TOperation> = {
  [KStatus in TStatus]: TOperation extends {
    responses: Record<KStatus, { content: { "application/json": unknown } }>;
  }
    ? TOperation["responses"][KStatus]["content"]["application/json"]
    : never;
}[TStatus];

/**
 * Create a map-type of requestBodies for each route.
 */
type Requests<TMethod extends HttpMethod> = {
  [P in Routes<TMethod>]: paths[P][TMethod] extends {
    requestBody: { content: { "application/json": unknown } };
  }
    ? paths[P][TMethod]["requestBody"]["content"]["application/json"]
    : undefined;
};

/**
 * Create a map-type of responses for each route.
 */
type Responses<TMethod extends HttpMethod> = {
  [K in Routes<TMethod>]: JsonContent<200 | 201, paths[K][TMethod]>;
};

/**
 * Create a map-type of searchParams for each route.
 */
type RequestSearchParams<TMethod extends HttpMethod> = {
  [K in Routes<TMethod>]?: paths[K][TMethod] extends {
    parameters: { query?: unknown };
  }
    ? paths[K][TMethod]["parameters"]["query"]
    : never;
};
