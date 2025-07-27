import api from "../../../services/api.js";

export async function load({ fetch, params, setHeaders }) {
  const post = await api.get("/posts/{id}", {
    params: { id: params.id },
    ssrCache: { dedupe: 5, revalidate: 30, ttl: 3600 },
    fetch,
  });
  setHeaders({ "Cache-Control": "max-age=3600" });
  return { post };
}
