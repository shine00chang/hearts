<script lang='ts>
  let { passing, pass, broken, turn } = $props();
  let passturn = $derived.by(_ => {
    if (pass == 'left') return 1;
    if (pass == 'across') return 2;
    if (pass == 'right') return 3;
    console.log(pass)
  });
</script>

<div style='transform: translate(-50%, -50%); position:absolute; top:40%; left:50%;' 
  class='w-24 h-24 rounded-lg bg-white flex flex-col place-content-center align-center items-center'>
  <div class='text-lg'>
    {#if passing}
      pass
    {:else}
      {broken ?  '💔' : '❤️' }
    {/if}
  </div>
  {#if passing}
    <div style='transform: rotate({0.25 * (passturn-1)}turn)'>
      ➜
    </div>
  {:else}
    <div style='transform: rotate({0.25 * (turn-1)}turn)'>
      ➜
    </div>
  {/if}
</div>
