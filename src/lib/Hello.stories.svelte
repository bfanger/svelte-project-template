<script lang="ts">
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import Hello from "./Hello.svelte";
</script>

<Meta
  title="Example/Hello"
  component={Hello}
  argTypes={{
    name: { control: "text" },
    click: { action: "click" },
  }}
/>

<Template let:args>
  <Hello name={args.name} on:click={args.click} />
</Template>

<Story
  name="Wereld"
  args={{
    name: "wereld",
  }}
/>

<Story
  name="World"
  args={{
    name: "world",
  }}
/>
