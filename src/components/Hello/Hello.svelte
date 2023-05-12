<script lang="ts">
  export let name: string;
</script>

<h1 class="hello" on:click on:keydown>Hello {name}</h1>

<style lang="scss">
  .hello {
    cursor: pointer;

    margin: 0;
    padding: 4rem;

    font: bold 4rem sans-serif;
    color: white;
    text-align: center;

    background-color: #1d859e;

    transition: letter-spacing 200ms;

    &:hover {
      letter-spacing: 1px;
    }
  }
</style>
