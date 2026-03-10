<script lang="ts">
  import Profile from '$lib/svgs/Profile.svelte';
  const { points, round, name, top, left } = $props();
</script>

<div
  style="position: absolute; top: {top}%; left: {left}%; transform: translate(-50%, -50%)"
  class="rounded bg-white p-1 shadow-sm"
>
  <div class="flex items-center gap-4">
    <div>
      <div class="text-4xl font-thin opacity-30">{round}</div>
      <div>{points}</div>
    </div>
    <div class="h-10 w-10 opacity-50">
      <Profile />
    </div>
  </div>
  <div class="text-right">{name}</div>
</div>
