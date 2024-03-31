<script lang="ts">
  export let href: string;
</script>

<a
  {href}
  class="inline-block rounded-full bg-sky-500 px-5 py-2 font-bold text-sky-50 shadow hover:bg-sky-400 hover:shadow-md"
>
  <slot />
</a>
