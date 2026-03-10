<script lang="ts">
  import '$lib/card-back.css';
  import { CARDLR } from '$lib/configs.ts';
  const { num, top, left } = $props();
</script>

<div
  style="position: absolute; top: {top}%; left: {left}%; width: {CARDLR.WIDTH}px; height: {CARDLR.GAP *
    num +
    CARDLR.HEIGHT}px; transform: translate(-50%, -50%)"
>
  {#each { length: num }, i}
    <div
      class="oppcard rounded-xl border border-gray-200 bg-white"
      style="top: {i * 25}px; left: 0px; height: {CARDLR.HEIGHT}px; width: {CARDLR.WIDTH}px"
    >
      <div class="pattern rounded-lg border border-gray-200"></div>
    </div>
  {/each}
</div>

<style>
  .oppcard {
    position: fixed;
    width: 100px;
    height: 70px;
    padding: 0.2rem;
    transition: top 0.1s;
  }
</style>
