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

<div class="mt-4 flex justify-center">
  <a
    class="text-sky-700 underline hover:text-sky-600 hover:no-underline"
    href="/posts/1"
    data-sveltekit-preload-data="hover">Api Example</a
  >
</div>
