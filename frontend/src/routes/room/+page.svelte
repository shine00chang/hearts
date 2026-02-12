<script>
  import { onMount } from 'svelte';

  import NotReady from '$lib/svgs/NotReady.svelte';
  import Ready from '$lib/svgs/Ready.svelte';
  import Profile from '$lib/svgs/Profile.svelte';

  const WSPORT = 3000;

  let socket;

  // display relevant states
  let gameStart = false;
  let roomState;

  // display elements
  let noJoinModal;

  let renderGameState; // bound function from game element
  let emitMove; // sent to game element 

  onMount(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let code=undefined;
    if (queryParams.has('code')) {
      code = queryParams.get('code');

      // sanitize code
      if (typeof code == 'string' && code.length == 4) code=code.toUpperCase();
      else code=undefined;
    }

    if (code)
      console.log(`code is ${code}, joining room...`);
    else
      console.log(`no code provided, creating room...`);

    socket = io(window.location.hostname + ":" + WSPORT, {
      auth: {
        'session': 'superadmin',
      },
      query: {
        'roomId': code
      },
    });


    socket.on('nojoin', _=>noJoinModal.showModal())
    socket.on('state', renderState);
    socket.on('start', _=>gameStart=true)

    emitMove = (move) => {
      // socket emit move
    }
  })

  // NOTE: these render functions don't 'render' perse, 
  // it really just puts the state somewhere and does some simple logic 
  const renderState = (state) => {

    roomState = state;

    if (gameStart)
      renderGameState(state.gameState);
  }

</script>

<!-- failed join dialog -->
<dialog bind:this={noJoinModal} class="modal">
  <div class="modal-box">
    <h3 class="font-bold">Could Not Join Room</h3>
    <div>the room might not exist, or the room is full</div>
      <div class="modal-action">
      <form method="dialog">
        <a href="/" class="btn btn-sm">Back</a>
      </form>
    </div>
  </div>
</dialog>

{#if !gameStart && roomState !== undefined}
<div class='px-24 py-12'>
  <h1 class='my-4'>Room #{roomState.id}</h1>

  <!-- player list -->
  <ul class="list w-96 bg-base-100 rounded-box shadow-md">
    <li class="p-4 pb-2 text-md opacity-60 tracking-wide">Players</li>

    {#each roomState.users as user, index}
      <li class="list-row items-center">
        <div class="text-4xl font-thin opacity-30 tabular-nums">0{index+1}</div>
        <div class='w-10 h-10'>
          <Profile/>
        </div>
        <div class="list-col-grow">
          <div>{user.username}</div>
          <div class="text-xs uppercase font-semibold opacity-60">probably good at the game</div>
        </div>
        <!-- ready state -->
        <div class='w-8 h-8'>
          {#if roomState.readyState[user.id]}
            <Ready/>
          {:else}
            <NotReady/>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div>

{/if}

{#if gameStart}
<Game bind:render={renderGameState} emitMove={emitMove}/>
{/if}

