<script lang="ts">
  import { WSPORT } from '$lib/configs.ts';
  import { onMount } from 'svelte';

  import NotReady from '$lib/svgs/NotReady.svelte';
  import Ready from '$lib/svgs/Ready.svelte';
  import Profile from '$lib/svgs/Profile.svelte';
  import Game from '$lib/game.svelte';

  import { getUser } from '$lib/state.svelte.ts';

  let me;
  onMount((_) => (me = getUser()));

  let socket;

  // display relevant states
  let gameStart = $state(false);
  let roomState = $state();

  // display elements
  let errorModal;
  let errorMsg = $state();

  let renderGameState; // bound function from game element
  let selfId;

  onMount(() => {
    console.log('i am: ', me);

    const queryParams = new URLSearchParams(window.location.search);
    let code = undefined;
    if (queryParams.has('code')) {
      code = queryParams.get('code');

      // sanitize code
      if (typeof code == 'string' && code.length == 4) code = code.toUpperCase();
      else code = undefined;
    }

    if (code) console.log(`code is ${code}, joining room...`);
    else console.log(`no code provided, creating room...`);

    const session = document.cookie.split('; ').find(row => row.startsWith('sessionid=')).split("=")[1];
    socket = io(window.location.hostname + ':' + WSPORT, {
      auth: {
        session
      },
      query: {
        roomId: code
      }
    });

    socket.on('error', ({ message }) => {
      errorModal.showModal();
      errorMsg = message;
    });
    socket.on('state', onState);
  });

  const onState = (state) => {
    roomState = state;

    if (roomState.gameState !== undefined) gameStart = true;
  };

  const toggleReady = (_) => {
    if (roomState.readyState[self.id] === true) socket.emit('unready');
    else socket.emit('ready');
  };

  const emit = (...args) => {
    socket.emit(...args);
  };
</script>

<!-- failed join dialog -->
<dialog bind:this={errorModal} class="modal">
  <div class="modal-box">
    <h3 class="font-bold">Error</h3>
    <div>{errorMsg}</div>
    <div class="modal-action">
      <form method="dialog">
        <button on:click={_=>{window.href='/';location.reload()}} class="btn btn-sm">Back</button>
      </form>
    </div>
  </div>
</dialog>

<div class="h-100dvh w-100dvw overflow-hidden">
  {#if !gameStart && roomState !== undefined}
    <div class="px-24 py-12">
      <h1 class="my-4">Room #{roomState.id}</h1>

      <!-- player list -->
      <ul class="list w-96 rounded-box bg-base-100 shadow-md">
        <li class="text-md p-4 pb-2 tracking-wide opacity-60">Players</li>

        {#each roomState.users as user, index}
          <li class="list-row items-center">
            <div class="text-4xl font-thin tabular-nums opacity-30">0{index + 1}</div>
            <div class="h-10 w-10">
              <Profile />
            </div>
            <div class="list-col-grow">
              <div>{user.username}</div>
              <div class="text-xs font-semibold uppercase opacity-60">
                probably good at the game
              </div>
            </div>
            <!-- ready state -->
            <div
              class="h-8 w-8"
              on:click={user.id === me.id ? toggleReady : (_) => console.log(user.id)}
            >
              {#if roomState.readyState[user.id]}
                <Ready />
              {:else}
                <NotReady />
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {:else if !gameStart}
    <p>Waiting on room state..</p>
  {/if}

  {#if gameStart}
    <Game {roomState} {emit} me={me.id} />
  {/if}
</div>
