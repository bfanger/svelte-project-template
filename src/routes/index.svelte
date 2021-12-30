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
  <a href="/posts/1">Api Example</a>
</div>

<style>
  .links {
    display: flex;
    justify-content: center;
    font-family: sans-serif;
  }
</style>
