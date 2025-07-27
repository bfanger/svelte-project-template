<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    href: string;
    "data-sveltekit-preload-data"?: "hover" | "tap" | "off";
    children: Snippet;
  };

  let {
    href,
    "data-sveltekit-preload-data": preloadData,
    children,
  }: Props = $props();
</script>

<a
  {href}
  class="inline-block rounded-full bg-sky-500 px-6 py-2 font-bold text-sky-50 shadow hover:bg-sky-400 hover:shadow-md active:bg-sky-500 active:shadow-none"
  data-sveltekit-preload-data={preloadData}
>
  {@render children()}
</a>
