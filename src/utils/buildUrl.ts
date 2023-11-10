/**
 * ExtractPathParams<"/page/home[postId]/comments/[commentId]"> resolves to ["postId", "commentId"]
 */
type ExtractPathParams<T> = T extends `${string}[${infer Match}]${infer Rest}`
  ? [Match, ...ExtractPathParams<Rest>]
  : [];

type ParamValue = string | number | string[] | undefined | null;
export type Params = Record<string, ParamValue>;
/**
 * PathParams<"/page/home[postId]"> resolves to { postId: string | number, [key:string]: string | number }
 */
type PathParams<T> = Record<ExtractPathParams<T>[number], string | number>;
/**
 * Inject the params into the url and add the remaining params as search/query params
 *
 * Usage:
 *   buildUrl("/users/[id]", { id: 123, tab: "settings" }); // returns "/users/123?tab=settings"
 */
export default function buildUrl<T extends string>(
  path: T,
  params: PathParams<T> & Params,
) {
  const searchParams = new URLSearchParams();
  let interpolatedPath = path as string;
  for (const [param, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const replaced = interpolatedPath.replace(`[${param}]`, value as string);
    if (replaced !== interpolatedPath) {
      interpolatedPath = replaced;
    } else if (Array.isArray(value)) {
      value.forEach((val) => searchParams.append(param, val));
    } else {
      searchParams.set(param, `${value}`);
    }
  }
  const search = searchParams.toString();
  if (!search) {
    return interpolatedPath;
  }
  if (interpolatedPath.includes("?")) {
    return `${interpolatedPath}&${search}`;
  }
  return `${interpolatedPath}?${search}`;
}
