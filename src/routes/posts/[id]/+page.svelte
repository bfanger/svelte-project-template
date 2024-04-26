<script lang="ts">
  import ButtonLink from "./ButtonLink.svelte";

  let { data } = $props();
  let { id, title, body } = $derived(data.post);
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="container mx-auto p-3">
  <ButtonLink href="/">Home</ButtonLink>
  <div class="my-4">
    <article class="prose">
      <h1>{title}</h1>
      <p>{body}</p>
    </article>
  </div>
  <div class="flex">
    {#if id > 1}
      <ButtonLink href="/posts/{id - 1}">Previous</ButtonLink>
    {/if}

    {#if id < 10}
      <span class="ml-auto">
        <ButtonLink href="/posts/{id + 1}">Next</ButtonLink>
      </span>
    {/if}
  </div>
</div>
