<script>
  import { CARD } from '$lib/configs.ts';
  let { value, height } = $props();
</script>

<style>
  .cardbox {
    position: fixed;
    position-anchor: --hand-box;
  }
</style>

<div class='border-2 border-gray-200 rounded-xl bg-white' style='height:{height}px; width:{height * 5/7}px;'>
  <div class='my-auto'>
    {value}
  </div>
</div>
