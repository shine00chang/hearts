<script lang='ts'>
  import { CARD } from '$lib/configs.ts';
  const { value, height } = $props();
  const symbol = $derived.by(_ => {
    if (value.charAt(0) == 'D') return '♦';
    if (value.charAt(0) == 'S') return '♠';
    if (value.charAt(0) == 'C') return '♣';
    if (value.charAt(0) == 'H') return '♥';
    return '?';
  });
  let number = $derived.by(_ => {
    return value.slice(1);
    // if (value.slice(1) == 'A') return 1;
    // if (value.slice(1) == 'J') return 11;
    // if (value.slice(1) == 'Q') return 12;
    // if (value.slice(1) == 'K') return 13;
    // return parseInt(value.slice(1));
  })
  const cardColor = $derived.by(_ => {
    if (value.charAt(0) == 'D') return '#F00';
    if (value.charAt(0) == 'S') return '#000';
    if (value.charAt(0) == 'C') return '#000';
    if (value.charAt(0) == 'H') return '#F00';
    return '#000';
  });
</script>

<style>
  .cardbox {
    position: fixed;
    position-anchor: --hand-box;
  }
</style>

<div class='border border-gray-200 rounded-xl bg-white p-1' style={`height:${height}px; width:${height * 5/7}px;color: ${cardColor};`}>
  <div class='flex flex-col w-full h-full place-content-between align-center items-center'>
    <div class='flex text-md w-full'>
      <div class='flex flex-col align-center items-center'>
        <span>{number}</span>
        {#if height > 100}
        <span>{symbol}</span>
        {/if}
      </div>
      <div class='flex-grow'></div>
    </div>
    <div class='text-3xl'>{symbol}</div>
    <div class='flex text-md w-full'>
      <div class='flex-grow'></div>
      <div class='flex flex-col align-center items-center rotate-180'>
        <span>{number}</span>
        {#if height > 100}
        <span>{symbol}</span>
        {/if}      
      </div>
    </div>
  </div>
</div>
