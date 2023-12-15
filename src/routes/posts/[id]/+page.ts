import api from "../../../api/api";

export async function load({ fetch, params }) {
  return {
    post: await api.get("posts/[id]", {
      params: { id: params.id },
      ssrCache: 30,
      fetch,
    }),
  };
}
