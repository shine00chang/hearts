<script lang="ts">
  let { passing, pass, broken, turn } = $props();
  let passturn = $derived.by((_) => {
    if (pass == 'left') return 1;
    if (pass == 'across') return 2;
    if (pass == 'right') return 3;
    console.log(pass);
  });
</script>

<style>
  .spin {
    transition: transform 0.1s;
  }
</style>
<div
  style="transform: translate(-50%, -50%); position:absolute; top:40%; left:50%;"
  class="align-center flex h-24 w-24 flex-col place-content-center items-center rounded-lg bg-white"
>
  <div class="text-lg">
    {#if passing}
      pass
    {:else}
      {broken ? '💔' : '❤️'}
    {/if}
  </div>
  {#if passing}
    <div style="transform: rotate({0.25 * (passturn - 1)}turn)" class='spin'>➜</div>
  {:else}
    <div style="transform: rotate({0.25 * (turn - 1)}turn)" class='spin'>➜</div>
  {/if}
</div>
