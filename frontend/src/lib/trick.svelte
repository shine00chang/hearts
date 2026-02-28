<script>
  import Card from '$lib/card.svelte';

  let { left, right, up, down } = $props();
</script>

<style>
  .box { 
    position:absolute;
    top: 40%;
    left:50%;
    height: 100px;
    transform: translate(-50%, -50%);
  }
</style>

<div class='box'>
  {#if left}
    <div style='position:fixed; left: {-100}px; transform: translate(-50%, 0) rotate(0.25turn)'>
      <Card value={left} height={100}/>
    </div>
  {/if}
  {#if right}
    <div style='position:fixed; left: {100}px; transform: translate(-50%, 0) rotate(-0.25turn)'>
      <Card value={right} height={100}/>
    </div>
  {/if}
  {#if up}
    <div style='position:fixed; top: {-100}px; transform: translate(-50%, 0) rotate(0.5turn)'>
      <Card value={up} height={100}/>
    </div>
  {/if}
  {#if down}
    <div style='position:fixed; top: {100}px; transform: translate(-50%, 0)'>
      <Card value={down} height={100}/>
    </div>
  {/if}
</div>
