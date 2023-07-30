<script lang="ts">
  export let data;

  $: ({ id, title, body } = data.post);
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="mx-auto w-[60rem] max-w-full p-4">
  <a class="inline-block mb-4" href="/">&lt; Home</a>
  <article class="mb-4">
    <h1>{title}</h1>
    <p>{body}</p>
  </article>
  <div class="flex justify-between">
    {#if id > 1}
      <a
        href="/posts/{id - 1}"
        class="bg-fuchsia-700 active:bg-fuchsia-8 py-3 px-5 font-bold rounded-l-full text-white hover:text-white hover:bg-fuchsia-600 transition-colors focus-visible:outline-white"
      >
        &lt; Previous
      </a>
    {/if}

    {#if id < 10}
      <a
        href="/posts/{id + 1}"
        class="bg-fuchsia-700 active:bg-fuchsia-800 py-3 px-5 font-bold rounded-r-full text-white hover:text-white hover:bg-fuchsia-600 transition-colors focus-visible:outline-white ml-auto"
      >
        Next &gt;
      </a>
    {/if}
  </div>
</div>
