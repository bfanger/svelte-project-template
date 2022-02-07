<script lang="ts">
  import Hello from "$lib/Hello.svelte";

  let name = "world";

  function onClick() {
    name = "you";
  }
</script>

<svelte:head>
  <title>SvelteKit demo page</title>
</svelte:head>

<Hello {name} on:click={onClick} />

<div class="links">
  <a href="/posts/1" sveltekit:prefetch>Api Example</a>
</div>

<style>
  .links {
    display: flex;
    justify-content: center;
    margin-top: 4rem;
  }
</style>
