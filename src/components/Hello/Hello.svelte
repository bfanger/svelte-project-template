<script lang="ts">
  export let name: string;
</script>

<button class="hello" on:click>Hello {name}</button>

<style lang="scss">
  .hello {
    width: 100%;
    padding: 4rem;

    font-size: 4rem;
    font-weight: bold;
    color: #fff;
    text-align: center;

    background-color: #38304c;

    transition: letter-spacing 200ms;

    &:hover {
      letter-spacing: 1px;
    }
  }
</style>
