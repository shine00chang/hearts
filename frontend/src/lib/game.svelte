<script>
  import Card from '$lib/card.svelte';
  import CardOpponentLR from '$lib/cardOppLR.svelte';
  import CardOpponentH from '$lib/cardOppH.svelte';
  import Player from '$lib/player.svelte';
  import Me from '$lib/me.svelte';
  import Center from '$lib/center.svelte';
  import Trick from '$lib/trick.svelte';

  import { CARD } from '$lib/configs.ts';

  let hand_width = $state();

  let { roomState, emit, me } = $props();
  let gameState = $derived(roomState.gameState);

  // derived states
  let cards = $derived.by(_ => {
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

  // states
  let passbuffer = $state([]);
  let playbuffer = $state();
  let actions = $state([]);

  // TODO: need to dynamically generate this too. gotta make something for turn order
  let userLeft = roomState.users.find(o => o.id === 'bessie');
  let userRight = roomState.users.find(o => o.id === 'alice');
  let userUp = roomState.users.find(o => o.id === 'xyz');
  let userMe = roomState.users.find(o => o.id === me);

  const directionToNumber = d => {
    if (userUp.id == d) return 0;
    if (userRight.id == d) return 1;
    if (userMe.id == d) return 2;
    if (userLeft.id == d) return 3;
  }

  const cardclick = card => {
    // if in passing phase, toggle the pass buffer
    if (gameState.passing) {

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
    // check if its your turn
    if (gameState.turn !== me)
      return;

    // check if suite is right
    const lead = gameState.trick[gameState.leader].charAt(0);
    if (gameState.hands[me].some(card => card.charAt(0) == lead) && card.value.charAt(0) != lead)
      return;

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
  .cardbox {
    position: fixed;
    position-anchor: --hand-box;
  }
</style>

<div class='h-screen w-screen bg-slate-100'>
  <h1> big games </h1>

  <!-- center box -->
  <Center top={50} left={50} 
          passing={gameState.passing} 
          broken={gameState.heartsBroken} 
          turn={directionToNumber(gameState.turn)}
          pass={directionToNumber(gameState.passDirection)}/>

  <!-- trick box -->
  <Trick left={gameState.trick[userLeft.id]}
         right={gameState.trick[userRight.id]}
         up={gameState.trick[userUp.id]}
         down={gameState.trick[me]}/>

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
      <div on:click={_ => cardclick(card)} class='cardbox' style='left: {card.x}px; top: {card.y}px;'>
        <Card value={card.value} height={CARD.HEIGHT}/>
      </div>
    {/each}
  </div>
  <Me top={80} left={90} name={userMe.username} points={gameState.points[me]} round={gameState.roundPoints[me]}/>

  <!-- left box -->
  <CardOpponentLR top={40} left={10} num={gameState.hands[userLeft.id].length}/>
  <Player top={75} left={10} name={userLeft.username}
    points={gameState.points[userLeft.id]} round={gameState.roundPoints[userLeft.id]}/>

  <!-- right box -->
  <CardOpponentLR top={40} left={90} num={gameState.hands[userRight.id].length}/>
  <Player top={12} left={90} name={userRight.username}
    points={gameState.points[userRight.id]} round={gameState.roundPoints[userRight.id]}/>

  <!-- up box -->
  <CardOpponentH top={5} left={50} num={gameState.hands[userUp.id].length}/>
  <Player top={10} left={30} name={userUp.username}
    points={gameState.points[userUp.id]} round={gameState.roundPoints[userUp.id]}/>
</div>
