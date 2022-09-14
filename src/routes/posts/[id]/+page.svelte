<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
  $: id = data.id;
  $: title = data.title;
  $: body = data.body;
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
    user-select: none;

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
