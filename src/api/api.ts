/**
 * Typed api wrapper with injectable fetch for SSR
 *
 * The responses of the api methods contain the data directly but also have a hidden property.
 * This allows access to the headers and http status of the response using the helper methods.
 */
import { error, type HttpError } from "@sveltejs/kit";
import buildUrl from "../utils/buildUrl";
import type { ApiGetResponse, ApiPostRequest, ApiPostResponse } from "./dto";
import { env } from "$env/dynamic/public";

const endpoint =
  env.PUBLIC_API_ENDPOINT ?? "https://jsonplaceholder.typicode.com/";

export type Fetch = (
  info: RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

type Config = RequestInit & {
  params?: Record<string, string | number>;
  fetch?: Fetch;
  ssrCache?: number;
};
const responseSymbol = Symbol("response");
type ApiResponse<T = unknown> = T & { [responseSymbol]: Response };

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
    const err = error(
      response.status,
      `${method} ${url} failed: ${response.status} ${response.statusText}`,
    ) as ApiResponse<HttpError>;
    err[responseSymbol] = response;
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw err;
  }
  let data = {
    __: "Missing `Content-Type: application/json`",
  } as ApiResponse<any>;
  if (response.headers.get("Content-Type")?.startsWith("application/json")) {
    data = await response.json();
  }
  if (config.signal && config.signal.aborted) {
    throw new Error("Aborted");
  }
  if (typeof data === "object" && data !== null) {
    data[responseSymbol] = response;
  }
  return data;
}

const api = {
  get<T extends keyof ApiGetResponse>(
    path: T,
    config?: Config,
  ): Promise<ApiResponse<ApiGetResponse[T]>> {
    return wrapped("GET", path, config || {});
  },
  async post<T extends keyof ApiPostRequest & keyof ApiPostResponse>(
    path: T,
    data: ApiPostRequest[T],
    config?: Config,
  ): Promise<ApiResponse<ApiPostResponse[T]>> {
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

function getResponse(dataOrError: ApiResponse | unknown): Response | undefined {
  if (typeof dataOrError === "object" && dataOrError !== null) {
    return (dataOrError as any)[responseSymbol];
  }
  return undefined;
}

export function getStatus(
  dataOrError: ApiResponse | unknown,
): number | undefined {
  const response = getResponse(dataOrError);
  if (response) {
    return response.status;
  }
  return undefined;
}

export function getStatusText(
  dataOrError: ApiResponse | unknown,
): string | undefined {
  const response = getResponse(dataOrError);
  if (response) {
    return response.statusText;
  }
  return undefined;
}

export function getHeader(
  dataOrError: ApiResponse | unknown,
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
