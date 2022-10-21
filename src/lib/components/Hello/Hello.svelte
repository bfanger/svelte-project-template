<script lang="ts">
  export let name: string;
</script>

<h1 class="hello" on:click on:keydown>Hello {name}</h1>

<style lang="scss">
  .hello {
    background-color: #1d859e;
    color: white;
    padding: 4rem;
    margin: 0;
    font: bold 4rem sans-serif;
    text-align: center;
    transition: letter-spacing 200ms;
    cursor: pointer;

    &:hover {
      letter-spacing: 1px;
    }
  }
</style>
