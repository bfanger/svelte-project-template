<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";
  import api from "$lib/services/api";

  export const load: Load = async ({ fetch, page }) => {
    const { id } = page.params;
    const post = await api.get("posts/[id]", { params: { id }, fetch });
    return { props: { id: post.id, title: post.title, body: post.body } };
  };
</script>

<script lang="ts">
  export let id: number;
  export let title: string;
  export let body: string;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="post">
  <article>
    <h1>{title}</h1>
    <p>{body}</p>
  </article>
  <div class="pager">
    {#if id > 1}
      <a href="/posts/{id - 1}">&lt; Previous </a>
    {:else}
      <a href="/">&lt; Home </a>
    {/if}

    {#if id < 10}
      <a href="/posts/{id + 1}" class="next">Next &gt;</a>
    {/if}
  </div>
</div>

<style>
  .post {
    margin-left: auto;
    margin-right: auto;
    width: 700px;
    padding: 40px;
    box-sizing: border-box;
    max-width: 100vw;
  }
  .pager {
    display: flex;
    font-family: sans-serif;
  }
  .next {
    margin-left: auto;
  }
</style>
