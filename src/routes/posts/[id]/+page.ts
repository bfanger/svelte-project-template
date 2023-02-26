import type { PageLoad } from "./$types";
import api from "$lib/services/api";

export const load: PageLoad = ({ fetch, params }) => {
  return {
    post: api.get("posts/[id]", {
      params: { id: params.id },
      ssrCache: 30,
      fetch,
    }),
  };
};
