/**
 * Typed api wrapper with injectable fetch for SSR
 */
import type { CommentDto, PostDto, TodoDto } from "./api-types-jsonplaceholder";

const ENDPOINT =
  <string>import.meta.env.VITE_API_ENDPOINT ??
  "https://jsonplaceholder.typicode.com/";

type GetResponse = {
  "posts/[id]": PostDto;
  "posts/[id]/comments": CommentDto[];
  "user/[id]/todos": TodoDto[];
};
type PostResponse = {
  posts: PostDto;
};
/**
 * Inject the params into the url and add the remaining params as search/query params and prefix the  endpoint.
 */
function buildUrl(path: string, params: Record<string, string>) {
  const query = { ...params };
  let interpolatedPath = path;
  for (const [param, value] of Object.entries(params)) {
    const replaced = interpolatedPath.replace(`[${param}]`, value as string);
    if (replaced !== interpolatedPath) {
      interpolatedPath = replaced;
      delete query[param];
    }
  }
  const search = new URLSearchParams(query).toString();
  return `${ENDPOINT}${interpolatedPath}${search ? `?${search}` : ""}`;
}

export type Fetch = (
  info: RequestInfo,
  init?: RequestInit
) => Promise<Response>;

type Config = RequestInit & {
  params?: Record<string, string>;
  fetch?: Fetch;
};
async function wrapped(
  method: RequestInit["method"],
  path: string,
  config: Config
): Promise<any> {
  const init = { ...config };
  const params = init.params || {};
  delete init.params;
  let { fetch } = init;
  if (!fetch) {
    if (typeof window === "undefined") {
      throw new Error("Missing config.fetch");
    }
    fetch = window.fetch;
  }
  init.method = method;
  const url = buildUrl(path, params);
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(
      `${method} ${url} failed: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}
const api = {
  get<T extends keyof GetResponse>(
    path: T,
    config?: Config
  ): Promise<GetResponse[T]> {
    return wrapped("GET", path, config || {});
  },
  async post<T extends keyof PostResponse>(
    path: T,
    data: unknown,
    config?: Config
  ): Promise<PostResponse[T]> {
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
