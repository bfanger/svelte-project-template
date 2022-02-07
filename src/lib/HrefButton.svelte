<script lang="ts">
  export let href = "";
  export let disabled = false;
  export let display = "inline-block";

  let focused = false;

  function onFocus() {
    focused = true;
  }
  function onBlur() {
    focused = false;
  }
</script>

{#if href && !disabled}
  <a {href} style:display on:click on:focus={onFocus} on:blur={onBlur}>
    <slot {focused} />
  </a>
{:else}
  <button {disabled} style:display on:click on:focus={onFocus} on:blur={onBlur}>
    <slot {focused} />
  </button>
{/if}

<style lang="scss">
  a,
  button {
    color: inherit;
    outline: none;
    cursor: pointer;
  }
  a {
    text-decoration: none;
  }
  button {
    appearance: none;
    background: transparent;
    border: 0;
    font: inherit;
  }
</style>
