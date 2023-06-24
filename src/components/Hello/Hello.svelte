<script lang="ts">
  export let name: string;
</script>

<button class="hello" on:click>Hello {name}</button>

<style lang="scss">
  .hello {
    cursor: pointer;

    display: block;

    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 4rem;

    font: bold 4rem sans-serif;
    color: white;
    text-align: center;

    background-color: #1d859e;
    border: 0;

    transition: letter-spacing 200ms;

    &:hover {
      letter-spacing: 1px;
    }
  }
</style>
