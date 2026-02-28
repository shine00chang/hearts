<script>
  import { CARDLR } from '$lib/configs.ts';
  const { num, top, left } = $props();
</script>

<style>
  .oppcard {
    position: fixed;
    width: 100px;
    height: 70px;
  }
</style>

<div style="position: absolute; top: {top}%; left: {left}%; width: {CARDLR.WIDTH}px; height: {CARDLR.GAP*num+CARDLR.HEIGHT}px; transform: translate(-50%, -50%)">
  {#each { length: num }, i}
    <div 
      class='oppcard border-2 border-gray-200 rounded-xl bg-white' 
      style='top: {i*25}px; left: 0px; height: {CARDLR.HEIGHT}px; width: {CARDLR.WIDTH}px'>
    </div>
  {/each}
</div>
