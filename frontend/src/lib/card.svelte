<script lang="ts">
  import { CARD } from '$lib/configs.ts';
  const { value, height } = $props();
  const symbol = $derived.by((_) => {
    if (value.charAt(0) == 'D') return '♦';
    if (value.charAt(0) == 'S') return '♠';
    if (value.charAt(0) == 'C') return '♣';
    if (value.charAt(0) == 'H') return '♥';
    return '?';
  });
  let number = $derived.by((_) => value.slice(1));
  const cardColor = $derived.by((_) => {
    if (value.charAt(0) == 'D') return '#F00';
    if (value.charAt(0) == 'S') return '#000';
    if (value.charAt(0) == 'C') return '#000';
    if (value.charAt(0) == 'H') return '#F00';
    return '#000';
  });
</script>

<div
  class="rounded-xl border border-gray-200 bg-white p-1"
  style={`height:${height}px; width:${(height * 5) / 7}px;color: ${cardColor};`}
>
  <div class="align-center flex h-full w-full flex-col place-content-between items-center">
    <div class="text-md flex w-full">
      <div class="align-center flex flex-col items-center">
        <span>{number}</span>
        {#if height > 100}
          <span>{symbol}</span>
        {/if}
      </div>
      <div class="flex-grow"></div>
    </div>
    <div class="text-3xl">{symbol}</div>
    <div class="text-md flex w-full">
      <div class="flex-grow"></div>
      <div class="align-center flex rotate-180 flex-col items-center">
        <span>{number}</span>
        {#if height > 100}
          <span>{symbol}</span>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .cardbox {
    position: fixed;
    position-anchor: --hand-box;
  }
</style>
