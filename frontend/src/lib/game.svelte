<script>
  import Card from '$lib/card.svelte';
  import { CARD } from '$lib/configs.ts';

  let hand_width = $state();

  let { roomState, emit, me } = $props();
  let passbuffer = $state([]);
  let actions = $state([]);
  let cards = $derived.by(_ => {
    const gameState = roomState.gameState;

    // const hand = gameState.hand[me];
    const hand = [
      'H4', 'D1', 'D10', 'S7', 'C10', 'H1', 'D8', 'H2', 'S9'
    ];

    const gap = (hand_width - CARD.WIDTH) / (hand.length-1);
    const cards = hand.map((card, i) => {
      return {
        x: gap * i,
        y: passbuffer.indexOf(card) === -1 ? 0 : -50,
        value: card,
      };
    });
    console.log('cards:', cards);

    return cards;
  });

  const cardclick = card => {
    const game = roomState.gameState;

    // if in passing phase, toggle the pass buffer
    if (game.passing) {

      if (passbuffer.indexOf(card.value) !== -1) {
        // if in buffer already
        passbuffer.splice(passbuffer.indexOf(card.value), 1);
      } else {
        // add to buffer
        if (passbuffer.length >= 3) return;

        passbuffer.push(card.value);
        card.y = -50;
      }

      // if buffer has 3, add pass action 
      if (passbuffer.length === 3)
        actions.push(actionPass)
      else
        actions = actions.filter(action => action.text != actionPass.text);

      return;
    }

    emit('play', card)
  }

  const actionPass = {
    text: "pass",
    handler: _ => {
      emit('pass', passbuffer)
      actions = actions.filter(action => action.text != actionPass.text);
    }
  }
</script>

<style>
  .handbox-pos {
    position: absolute;
    anchor-name: --hand-box;
    top: 70%;
    left: 50%;
    width: 50%;
    transform: translate(-50%, 0%);
  }
  .buttonbox-pos {
    position: absolute;
    top: 85%;
    left: 75%;
    transform: translate(-100%, 0%);
  }
</style>

<div class='h-screen w-screen bg-slate-100'>
  <h1> big games </h1>

  <!-- action button box-->
  <div class='buttonbox-pos p-4 w-48 h-24 flex flex-row-reverse'>
    {#each actions as action}
      <button class='btn btn-lg' on:click={action.handler}>
        {action.text}
      </button>
    {/each}
  </div>

  <!-- player box -->
  <div class='handbox-pos h-{CARD.HEIGHT}px' bind:clientWidth={hand_width}>
    {#each cards as card}
      <Card onclick={_ => cardclick(card)} {...card}/>
    {/each}
  </div>

</div>
