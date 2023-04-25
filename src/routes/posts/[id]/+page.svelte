<script lang="ts">
  export let data;

  $: ({ id, title, body } = data.post);
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
    box-sizing: border-box;
    width: 70rem;
    max-width: 100vw;
    margin-right: auto;
    margin-left: auto;
    padding: 4rem;
  }

  .pager {
    display: flex;
  }

  .button {
    user-select: none;

    display: inline-block;

    padding: 1rem 2rem;

    font-weight: bold;
    color: white;
    text-decoration: none;

    background: #9324b6;
    border-radius: 2rem;

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px #ffffffe6;
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
