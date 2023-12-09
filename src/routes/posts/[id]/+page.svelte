<script lang="ts">
  export let data;

  $: ({ id, title, body } = data.post);
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="post">
  <a href="/" class="button">Home</a>
  <div class="content">
    <article class="prose">
      <h1>{title}</h1>
      <p>{body}</p>
    </article>
  </div>
  <div class="pager">
    {#if id > 1}
      <a href="/posts/{id - 1}" class="button">Previous </a>
    {/if}

    {#if id < 10}
      <a href="/posts/{id + 1}" class="button next">Next</a>
    {/if}
  </div>
</div>

<style lang="scss">
  .post {
    box-sizing: border-box;
    width: 70rem;
    max-width: 100%;
    margin-inline: auto;
    margin-left: auto;
    padding: 3rem;
  }
  .content {
    margin-block: 3rem;
  }

  .pager {
    display: flex;
  }

  .button {
    padding: 0.8rem 3.2rem;

    font-weight: bold;
    color: #1f1f34;

    background: #0df5e3;
    border-radius: 2rem;

    &:hover {
      background: #9afff7;
    }

    &:active {
      background: #0df5e3;
    }
  }

  .next {
    margin-left: auto;
  }
</style>
