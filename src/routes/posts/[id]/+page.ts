import type { PageLoad } from "./$types";
import api from "$lib/services/api";

export const load: PageLoad = async ({ fetch, params }) => {
  return api.get("posts/[id]", {
    params: { id: params.id },
    ssrCache: 30,
    fetch,
  });
};
