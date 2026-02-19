<script>

  let show = false;

  export const render = (state) => {
    show = true;

    //from the state object, extract and update own local state and let svelte render.
    console.log('game re-render!', state);
  }
</script>

{#if show}
<h1> big games </h1>
{/if}
