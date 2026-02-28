<script>
  import Profile from '$lib/svgs/Profile.svelte';
  const { points, round, name, top, left } = $props();
</script>

<div 
  style="position: absolute; top: {top}%; left: {left}%; transform: translate(-50%, -50%)"
  class='shadow-sm rounded bg-white p-1'>
  <div class='flex gap-4 items-center'>
    <div>
      <div class="text-4xl font-thin opacity-30">{round}</div>
      <div>{points}</div>
    </div>
    <div class='w-10 h-10 opacity-50'>
      <Profile/>
    </div>
  </div>
  <div class='text-right'>{name}</div>
</div>
