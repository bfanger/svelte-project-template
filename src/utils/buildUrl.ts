/**
 * ExtractPathParams<"/posts/[postId]/comments/[commentId]"> resolves to ["postId", "commentId"]
 */
type ExtractPathParams<T> = T extends `${string}[${infer Match}]${infer Rest}`
  ? [Match, ...ExtractPathParams<Rest>]
  : [];

/**
 * PathParams<"/posts/[postId]"> resolves to { postId: string | number, [key:string]: string | number }
 */
type Params<T> = Record<ExtractPathParams<T>[number], string | number> & {
  [key: string]: string | number;
};

/**
 * Inject the params into the url and add the remaining params as search/query params
 *
 * Usage:
 *   buildUrl("/users/[id]", { id: 123, tab: "settings" }); // returns "/users/123?tab=settings"
 */
export default function buildUrl<T extends string>(path: T, params: Params<T>) {
  const search = new URLSearchParams();
  let hasSearch = false;
  let interpolatedPath = path as string;
  for (const [param, value] of Object.entries(params)) {
    const replaced = interpolatedPath.replace(`[${param}]`, value as string);
    if (replaced !== interpolatedPath) {
      interpolatedPath = replaced;
    } else {
      search.set(param, `${value}`);
      hasSearch = true;
    }
  }
  return `${interpolatedPath}${hasSearch ? `?${search.toString()}` : ""}`;
}
