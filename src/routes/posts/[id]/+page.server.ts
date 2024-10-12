import api from "../../../services/api.js";

export async function load({ fetch, params }) {
  return {
    post: await api.get("posts/{id}", {
      params: { id: params.id },
      ssrCache: { revalidate: 30, ttl: 3600 },
      fetch,
    }),
  };
}
