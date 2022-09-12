import api from "$lib/services/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
  return api.get("posts/[id]", {
    params: { id: params.id },
    ssrCache: 30,
    fetch,
  });
};
