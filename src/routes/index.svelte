<script lang="ts">
  import Hello from "../components/Hello.svelte";
  let name = "world";
  function onClick() {
    name = "you";
  }
</script>

<Hello {name} on:click={onClick} />
