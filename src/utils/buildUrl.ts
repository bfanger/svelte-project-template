/**
 * Inject the params into the url and add the remaining params as search/query params
 *
 * Usage:
 *   buildUrl("/users/[id]", { id: 123, tab: "settings" }); // returns '/users/123?tab=settings
 */
export default function buildUrl(
  path: string,
  params: Record<string, string | number>
) {
  const search = new URLSearchParams();
  let hasSearch = false;
  let interpolatedPath = path;
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
