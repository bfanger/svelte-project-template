/**
 * Typed api wrapper with injectable fetch for SSR
 *
 * The responses of the api methods contain the data directly.
 * The corresponding Response object is available via the helper methods via lookup.
 * This allows access to the headers and http status code by passing the data to those helpers
 */
import { error, type NumericRange } from "@sveltejs/kit";
import buildUrl, { type PathParams, type SearchParams } from "./buildUrl";
import type {
  ApiGetResponse,
  ApiGetSearchParams,
  ApiPostRequest,
  ApiPostResponse,
} from "./api-types";
/* @svelte/adapter-node start */
// import { env } from "$env/dynamic/public";
//
// const PUBLIC_API_ENDPOINT = env.PUBLIC_API_ENDPOINT;
/* @svelte/adapter-node end */

/* @svelte/adapter-static start */
import { PUBLIC_API_ENDPOINT } from "$env/static/public";
/* @svelte/adapter-static end */

const slowResponseThreshold = 1000;
type ParamsProperty<T> = T extends `${string}{${string}}${string}`
  ? { params: PathParams<T> }
  : { params?: never };

type Config<TParams, TSearchParams> = RequestInit &
  TParams & {
    searchParams?: TSearchParams;
    fetch?: typeof fetch;
    ssrCache?: { dedupe: number; revalidate?: number; ttl?: number };
  };
const responses = new WeakMap<any, Response>();

async function wrapped<T>(
  method: Exclude<RequestInit["method"], undefined>,
  path: string,
  config: Config<{ params?: unknown }, unknown>,
): Promise<T> {
  // eslint-disable-next-line prefer-const
  let { ssrCache, fetch, params, searchParams, ...init } = config;
  if (!fetch) {
    if (typeof window === "undefined") {
      throw new Error("Missing config.fetch");
    }
    fetch = window.fetch;
  }
  if (ssrCache && typeof window === "undefined") {
    init.headers = new Headers(init.headers);
    init.headers.append("SSR-Cache", `${JSON.stringify(ssrCache)}`);
  }
  init.method = method;
  const endpoint = PUBLIC_API_ENDPOINT;
  if (typeof endpoint !== "string" || endpoint === "") {
    throw new Error("Missing environment variable PUBLIC_API_ENDPOINT");
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
      throw new Error(`${method} ${url} failed: ${err.message}`);
    }
    throw err;
  }
  const duration = Date.now() - start;
  if (duration > slowResponseThreshold) {
    console.info(
      `${method} ${url.substring(endpoint.length)} took ${(
        duration / 1000
      ).toFixed(3)}s`,
    );
  }
  if (!response.ok) {
    try {
      error(
        response.status as NumericRange<400, 599>,
        `${method} ${url} failed: ${response.status} ${response.statusText}`,
      );
    } catch (err) {
      responses.set(err, response);
      throw err;
    }
  }

  // Note: If the api is allowed to return empty or non-json content, this check should be tweaked or removed.
  if (!response.headers.get("Content-Type")?.startsWith("application/json")) {
    const err = new Error(
      `${method} ${url} failed: Missing 'Content-Type: application/json' header`,
    );
    responses.set(err, response);
    throw err;
  }
  const data = await response.json();
  if (config.signal && config.signal.aborted) {
    throw new Error("Aborted");
  }
  if (typeof data === "object" && data !== null) {
    responses.set(data, response);
  }
  return data as T;
}

const api = {
  get<T extends keyof ApiGetResponse>(
    path: T,
    config: Config<ParamsProperty<T>, ApiGetSearchParams[T]>,
  ) {
    return wrapped<ApiGetResponse[T]>("GET", path, config);
  },
  async post<T extends keyof ApiPostRequest>(
    path: T,
    data: ApiPostRequest[T],
    config: Config<ParamsProperty<T>, never>,
  ) {
    return wrapped<ApiPostResponse[T]>("POST", path, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },
};
export default api;

function getResponse(dataOrError: unknown): Response | undefined {
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
