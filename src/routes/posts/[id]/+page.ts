import api from "$lib/services/api";

export function load({ fetch, params }) {
  return {
    post: api.get("posts/[id]", {
      params: { id: params.id },
      ssrCache: 30,
      fetch,
    }),
  };
}
