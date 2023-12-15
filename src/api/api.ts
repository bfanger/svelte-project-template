/**
 * Typed api wrapper with injectable fetch for SSR
 *
 * The responses of the api methods contain the data directly.
 * The corresponding Response object is available via the helper methods via lookup.
 * This allows access to the headers and http status code by passing the data to those helpers
 */
import { error, type NumericRange } from "@sveltejs/kit";
import buildUrl, { type Params } from "../utils/buildUrl";
import type { ApiGetResponse, ApiPostRequest, ApiPostResponse } from "./dto";

const endpoint = "https://jsonplaceholder.typicode.com/";

type Config = RequestInit & {
  params?: Params;
  fetch?: typeof fetch;
  ssrCache?: number;
};
const responses = new WeakMap<any, Response>();

async function wrapped(
  method: RequestInit["method"],
  path: string,
  config: Config,
): Promise<any> {
  // eslint-disable-next-line prefer-const
  let { ssrCache, fetch, params, ...init } = config;
  params = params || {};
  if (!fetch) {
    if (typeof window === "undefined") {
      throw new Error("Missing config.fetch");
    }
    fetch = window.fetch;
  }
  if (ssrCache && typeof window === "undefined") {
    init.headers = new Headers(init.headers);
    init.headers.append("SSR-Cache", `${ssrCache}`);
  }
  init.method = method;
  const url = endpoint + buildUrl(path, params);
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
  const duration = (Date.now() - start) / 1000;
  if (duration > 1) {
    console.info(
      `${method} ${url.substring(endpoint.length)} took ${duration.toFixed(
        3,
      )}s`,
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
  return data;
}

const api = {
  get<T extends keyof ApiGetResponse>(
    path: T,
    config?: Config,
  ): Promise<ApiGetResponse[T]> {
    return wrapped("GET", path, config || {});
  },
  async post<T extends keyof ApiPostRequest & keyof ApiPostResponse>(
    path: T,
    data: ApiPostRequest[T],
    config?: Config,
  ): Promise<ApiPostResponse[T]> {
    return wrapped("POST", path, {
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
