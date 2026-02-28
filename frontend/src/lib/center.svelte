<script>
  let { passing, pass, broken, turn } = $props();
</script>

<div style='transform: translate(-50%, -50%); position:absolute; top:40%; left:50%;' 
  class='w-24 h-24 rounded-lg bg-white flex flex-col align-center items-center'>
  <div>
    {broken ? 'broken :(' : 'heart' }
  </div>
  {#if passing}
    <div style='transform: rotate({0.25 * pass}turn)'>
      A
    </div>
  {:else}
    <div style='transform: rotate({0.25 * turn}turn)'>
      ^
    </div>
  {/if}
</div>
