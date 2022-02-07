<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";
  import api from "$lib/services/api";
  import HrefButton from "$lib/HrefButton.svelte";

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
      <HrefButton href="/posts/{id - 1}" let:focused>
        <div class="button" class:focused>&lt; Previous</div>
      </HrefButton>
    {/if}

    {#if id < 10}
      <span class="next">
        <HrefButton href="/posts/{id + 1}" let:focused>
          <div class="button" class:focused>Next &gt;</div>
        </HrefButton>
      </span>
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
  .next {
    margin-left: auto;
  }

  .button {
    display: inline-block;
    background: #9324b6;
    font-weight: bold;
    padding: 1rem 2rem;
    border-radius: 2rem;

    &.focused {
      box-shadow: 0px 0px 0px 2px rgba(white, 0.9);
    }
    &:hover {
      background: #ab48c9;
    }
    &:active {
      background: #722988;
    }
  }
</style>
