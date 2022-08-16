import api, { repeatCacheHeaders, withErrorStatus } from "$lib/services/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, setHeaders, params }) => {
  try {
    const { id } = params;
    const post = await api.get("posts/[id]", {
      params: { id },
      ssrCache: 30,
      fetch,
    });
    repeatCacheHeaders(post, setHeaders);
    return { id: post.id, title: post.title, body: post.body };
  } catch (err) {
    throw withErrorStatus(err);
  }
};
