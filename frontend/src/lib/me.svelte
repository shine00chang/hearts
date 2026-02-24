<script>
  import Profile from '$lib/svgs/Profile.svelte';
  const { points, name, top, left } = $props();
</script>

<div 
  style="position: absolute; top: {top}%; left: {left}%; transform: translate(-50%, -50%)"
  class='shadow-sm rounded bg-white p-3'>
  <div class='flex gap-4 items-center'>
    <div class="text-6xl font-thin opacity-30">{points}</div>
    <div class='w-18 h-18 opacity-50'>
      <Profile/>
    </div>
  </div>
  <div class='text-right text-xl px-2 pt-2'>{name}</div>
</div>
