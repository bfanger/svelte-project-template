<script lang="ts">
  import Hello from "../components/Hello/Hello.svelte";

  let name = "world";

  function onClick() {
    name = "you";
  }
</script>

<svelte:head>
  <title>SvelteKit demo page</title>
</svelte:head>

<Hello {name} on:click={onClick} />

<div class="flex justify-center mt-10">
  <a href="/posts/1" data-sveltekit-preload-data="hover">Api Example</a>
</div>
