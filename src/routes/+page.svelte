<script lang="ts">
  import Hello from "../components/Hello/Hello.svelte";

  let name = $state("world");

  function swapName() {
    name = "you";
  }
</script>

<svelte:head>
  <title>SvelteKit demo page</title>
</svelte:head>

<Hello {name} onclick={swapName} />

<div class="mt-4 flex justify-center">
  <a
    class="text-sky-700 underline hover:text-sky-600 hover:no-underline"
    href="/post/1"
    data-sveltekit-preload-data="hover">Api Example</a
  >
</div>
