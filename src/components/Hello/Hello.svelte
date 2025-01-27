<script lang="ts">
  type Props = {
    name: string;
    onclick: () => void;
  };
  let { name, onclick }: Props = $props();
</script>

<button
  class="w-full bg-slate-200 p-5 text-center text-5xl leading-normal font-bold transition-[letter-spacing_200ms] hover:tracking-[1px]"
  {onclick}
>
  Hello {name}
</button>
