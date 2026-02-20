<script>
  import { CARD } from '$lib/configs.ts';
  let { onclick, value, x, y } = $props();
</script>

<style>
  .cardbox {
    position: fixed;
    position-anchor: --hand-box;
  }
</style>

<div on:click={onclick} class='cardbox border-2 border-gray-200 rounded-xl bg-white'
     style='left: {x}px; top: {y}px; height: {CARD.HEIGHT}px; width: {CARD.WIDTH}px'>
  <div class='my-auto'>
    {value}
  </div>
</div>
