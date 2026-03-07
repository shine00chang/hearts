<script>
  import '$lib/card-back.css';
  import { CARDLR } from '$lib/configs.ts';
  const { num, top, left } = $props();
</script>

<style>
  .oppcard {
    position: fixed;
    width: 100px;
    height: 70px;
    padding: 0.2rem;
  }
</style>

<div style="position: absolute; top: {top}%; left: {left}%; width: {CARDLR.WIDTH}px; height: {CARDLR.GAP*num+CARDLR.HEIGHT}px; transform: translate(-50%, -50%)">
  {#each { length: num }, i}
    <div 
      class='oppcard border border-gray-200 rounded-xl bg-white' 
      style='top: {i*25}px; left: 0px; height: {CARDLR.HEIGHT}px; width: {CARDLR.WIDTH}px'>
      <div class='pattern border border-gray-200 rounded-lg'></div>
    </div>
  {/each}
</div>
