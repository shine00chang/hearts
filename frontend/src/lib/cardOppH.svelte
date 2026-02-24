<script>
  import { CARDH } from '$lib/configs.ts';
  const { num, top, left } = $props();
</script>

<style>
  .oppcard {
    position: fixed;
    height: 100px;
    width: 70px;
  }
</style>

<div style="position: absolute; top: {top}%; left: {left}%; width: {CARDH.GAP*num+CARDH.WIDTH}px; transform: translate(-50%, 0%)">
  {#each { length: num }, i}
    <div 
      class='oppcard border-2 border-gray-200 rounded-xl bg-white' 
      style='left: {i*CARDH.GAP}px; height: {CARDH.HEIGHT}px; width: {CARDH.WIDTH}px'>
    </div>
  {/each}
</div>
