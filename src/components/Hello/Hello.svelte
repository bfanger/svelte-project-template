<script lang="ts">
  type Props = {
    name: string;
    onclick: () => void;
  };
  const { name, onclick }: Props = $props();
</script>

<button
  class="w-full bg-slate-100 p-4 text-center text-[3rem] font-bold transition-[letter-spacing_200ms] hover:tracking-[1px]"
  {onclick}
>
  Hello {name}
</button>
