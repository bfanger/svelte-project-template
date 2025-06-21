/**
 * ExtractPathParams<"/post{postId}/comments/{commentId}"> resolves to ["postId", "commentId"]
 */
type ExtractPathParams<T> = T extends `${string}{${infer Match}}${infer Rest}`
  ? [Match, ...ExtractPathParams<Rest>]
  : [];

/**
 * PathParams<"/post/{postId}"> resolves to { postId: string | number }
 */
export type PathParams<T> = T extends `${string}{${string}}${string}`
  ? Record<ExtractPathParams<T>[number], string | number>
  : Record<string, never>;

export type SearchParams = Record<
  string,
  string | (string | number)[] | undefined | number | null
>;

/**
 * Inject the pathParams into the path and apply searchParams as query params.
 *
 * Usage:
 *   buildUrl("/users/{id}", { id: 123}, { tab: "settings" }); // returns "/users/123?tab=settings"
 */
export default function buildUrl<T extends string>(
  path: T,
  pathParams: PathParams<T>,
  searchParams?: SearchParams,
) {
  // path can include query params, allows typing different responses based on fixed params.

  // Interpolate params into path
  let interpolated = path as string;
  for (const [param, value] of Object.entries<string | number>(
    pathParams ?? {},
  )) {
    const replaced = interpolated.replace(
      `{${param}}`,
      parseParam(param, value),
    );
    if (replaced === interpolated) {
      throw new Error(`Could not find-and-replace "{${param}}" in: ${path}`);
    }
    interpolated = replaced;
  }

  // Append search params
  const position = path.indexOf("?");
  const params =
    position !== -1
      ? new URLSearchParams(interpolated.substring(position))
      : new URLSearchParams();
  interpolated =
    position !== -1 ? interpolated.substring(0, position) : interpolated;
  if (searchParams) {
    for (const [param, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          params.append(param, parseParam(param, v));
        });
      } else if (typeof value === "string" || typeof value === "number") {
        params.set(param, parseParam(param, value));
      }
    }
  }
  const search = params.toString();

  // Return the interpolated path combined with search parameters
  if (!search) {
    return interpolated;
  } else if (interpolated.includes("?")) {
    return `${interpolated}&${search}`;
  } else {
    return `${interpolated}?${search}`;
  }
}

/**
 * Only allow strings and integer values for path and search parameters.
 *
 * Allows writing:
 *   buildUrl("/post/{id}/comments", { id: 1 }, { offset: 24, limit: 12 });
 */
function parseParam(parameter: string, value: string | number): string {
  if (typeof value === "string") {
    return value;
  }
  const numeric = value.toString();
  if (!/^[0-9]+$/.exec(numeric)) {
    throw new Error(`Only integer are allowed. ${parameter} was: ${numeric}`);
  }
  return numeric;
}
