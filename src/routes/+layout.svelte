<script lang="ts">
  import "../app.css";
  const { children } = $props();

  console.log("layout", children);
</script>

{@render children()}
