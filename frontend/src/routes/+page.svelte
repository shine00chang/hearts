<script lang="ts">
  import type { PageProps } from './$types';
  import Navbar from '$lib/Navbar.svelte';
  import { getUser } from '$lib/state.svelte.ts';
  import { onMount } from 'svelte';

  onMount((_) => (user = getUser()));

  let user;
  let rulesModal;
  let roomJoinModal;
  let roomCreateModal;
  let roomCodeInput = '';
</script>

<Navbar {user} />
<main class="px-48 pt-12">
  <!-- room join dialog -->
  <dialog bind:this={roomJoinModal} class="modal">
    <div class="modal-box">
      <h3 class="font-bold">Join Room</h3>
      <input bind:value={roomCodeInput} type="text" class="input my-4" placeholder="Room Code" />
      <div class="modal-action">
        <form method="dialog">
          <button
            on:click={(_) => (window.location.href = `/room?code=${roomCodeInput}`)}
            class="btn btn-sm">Join</button
          >
          <button class="btn btn-sm">Back</button>
        </form>
      </div>
    </div>
  </dialog>

  <!-- room create prompt -->
  <dialog bind:this={roomCreateModal} class="modal">
    <div class="modal-box">
      <h3 class="font-bold">Create Room</h3>
      <div class="text-xs">Configuration: 20-point games</div>
      <div class="modal-action">
        <form method="dialog">
          <button on:click={(_) => (window.location.href = `/room`)} class="btn btn-sm"
            >Create</button
          >
          <button class="btn btn-sm">Back</button>
        </form>
      </div>
    </div>
  </dialog>

  <!-- how to play prompt -->
  <dialog bind:this={rulesModal} class="modal">
    <div class="modal-box">
      <h3 class="font-bold">Create Room</h3>
      <div class="text-md">
        Hearts is a "trick-taking" card game where the goal is to have the <b>lowest</b> score at the end. You want to avoid winning "penalty cards" in each round.<br><br>

        <b>The Objective</b><br>
        Avoid taking any cards in the <b>Hearts</b> suit or the <b>Queen of Spades</b>.<br>

        <b>The Rules of Play</b><br>
        1. The Deal: All 52 cards are dealt (13 cards per player).<br>

        2. Passing: At the start of a round, players choose 3 cards to pass to an opponent (the direction changes each round: Left, Right, Across, then No Pass).<br>

        3. The Lead: The player holding the 2 of Clubs starts the first trick.<br>

        4. Following Suit: You must play a card of the same suit as the lead card if you have one. If you don't, you can play any card (this is when you "dump" your bad cards on others). <br>

        5. Winning a Trick: The highest card of the suit that was led wins the trick and leads the next one. There are no "trump" suits.<br>

        "Breaking" Hearts: You cannot lead a Heart until a Heart has been played on a previous trick (unless you have nothing else left to lead).<br>

        <b>Scoring</b><br>
        At the end of the round, players count their penalty points:<br>
        - Each Heart: 1 point<br>
        - Queen of Spades: 13 points<br>

        <b>The "Shoot the Moon" Exception:</b> If one player manages to take all 13 Hearts AND the Queen of Spades, they get 0 points while every other player is penalized 26 points.<br>

        <b>Ending the Game</b><br>
        The game ends when a player hits 20 points. The person with the lowest score at that moment is the winner.
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-sm">Close</button>
        </form>
      </div>
    </div>
  </dialog>

  <!-- page -->
  <h1 class="py-4 text-3xl font-bold">Hearts!</h1>

  <p class="py-4 text-gray-500">a great game to play with friends</p>

  <button on:click={(_) => rulesModal.showModal()} class="btn btn-sm mb-6">How To Play?</button><br>

  <button on:click={(_) => roomJoinModal.showModal()} class="btn btn-sm mr-2">Join Room</button>
  <button on:click={(_) => roomCreateModal.showModal()} class="btn btn-sm">Create Room</button>
</main>
