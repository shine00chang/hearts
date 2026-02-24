<script>
  import Card from '$lib/card.svelte';
  import CardOpponentLR from '$lib/cardOppLR.svelte';
  import CardOpponentH from '$lib/cardOppH.svelte';
  import Player from '$lib/player.svelte';
  import Me from '$lib/me.svelte';
  import { CARD } from '$lib/configs.ts';

  let hand_width = $state();

  let { roomState, emit, me } = $props();
  let passbuffer = $state([]);
  let playbuffer = $state();
  let actions = $state([]);
  let cards = $derived.by(_ => {
    const gameState = roomState.gameState;

    console.log(gameState);

    const hand = gameState.hands[me];

    const gap = (hand_width - CARD.WIDTH) / (hand.length-1);
    const cards = hand.map((card, i) => {
      const holding = passbuffer.indexOf(card) !== -1 || playbuffer === card;
      return {
        x: gap * i,
        y: holding ? -50 : 0,
        value: card,
      };
    });
    console.log('cards:', cards);

    return cards;
  });
  // TODO: need to dynamically generate this too. gotta make something for turn order
  let userLeft = roomState.users.find(o => o.id === 'bessie');
  let userRight = roomState.users.find(o => o.id === 'alice');
  let userUp = roomState.users.find(o => o.id === 'xyz');
  let userMe = roomState.users.find(o => o.id === me);

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

      // if buffer has 3, add p/meass action 
      if (passbuffer.length === 3)
        actions.push(actionPass)
      else
        actions = actions.filter(action => action.text != actionPass.text);

      return;
    }

    // if in playing phase, store in play buffer
    if (!playbuffer) actions.push(actionPlay);
    if (card.value == playbuffer) {
      actions = actions.filter(action => action.text != actionPlay.text);
      playbuffer = undefined;
    } else {
      playbuffer = card.value;
    }

  }

  const actionPass = {
    text: "pass",
    handler: _ => {
      emit('pass', passbuffer)
      passbuffer = [];
      actions = actions.filter(action => action.text != actionPass.text);
    }
  }
  const actionPlay = {
    text: "play",
    handler: _ => {
      emit('play', playbuffer);
      playbuffer = undefined;
      actions = actions.filter(action => action.text != actionPlay.text);
    }
  }
</script>

<style>
  .handbox-pos {
    position: absolute;
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
  <Me top={80} left={85} name={userMe.username} points={38}/>

  <!-- left box -->
  <CardOpponentLR top={40} left={10} num={roomState.gameState.hands[userLeft.id].length}/>
  <Player top={75} left={10} name={userLeft.username}/>

  <!-- right box -->
  <CardOpponentLR top={40} left={90} num={roomState.gameState.hands[userRight.id].length}/>
  <Player top={12} left={90} name={userRight.username}/>

  <!-- up box -->
  <CardOpponentH top={10} left={50} num={roomState.gameState.hands[userUp.id].length}/>
  <Player top={10} left={15} name={userUp.username}/>
</div>
