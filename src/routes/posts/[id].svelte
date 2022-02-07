<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";
  import api from "$lib/services/api";

  export const load: Load = async ({ fetch, params }) => {
    const { id } = params;
    const post = await api.get("posts/[id]", {
      params: { id },
      headers: { "Svelte-Cache": "30" },
      fetch,
    });
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
  <a href="/">&lt; Home</a>
  <article>
    <h1>{title}</h1>
    <p>{body}</p>
  </article>
  <div class="pager">
    {#if id > 1}
      <a href="/posts/{id - 1}" class="button"> &lt; Previous </a>
    {/if}

    {#if id < 10}
      <a href="/posts/{id + 1}" class="button next"> Next &gt; </a>
    {/if}
  </div>
</div>

<style lang="scss">
  .post {
    margin-left: auto;
    margin-right: auto;
    width: 70rem;
    padding: 4rem;
    box-sizing: border-box;
    max-width: 100vw;
  }
  .pager {
    display: flex;
  }

  .button {
    display: inline-block;
    padding: 1rem 2rem;
    border-radius: 2rem;
    background: #9324b6;
    font-weight: bold;
    color: white;
    text-decoration: none;

    &:focus-visible {
      box-shadow: 0px 0px 0px 2px rgba(white, 0.9);
      outline: none;
    }
    &:hover {
      background: #ab48c9;
    }
    &:active {
      background: #722988;
    }
  }

  .next {
    margin-left: auto;
  }
</style>
