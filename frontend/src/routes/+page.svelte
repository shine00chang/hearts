<script lang="ts">
  let roomJoinModal;
  let roomCreateModal;
  let roomCodeInput = '';
</script>

<main class='px-48 pt-12'>

  <!-- room join dialog -->
  <dialog bind:this={roomJoinModal} class="modal">
    <div class="modal-box">
      <h3 class="font-bold">Join Room</h3>
      <input bind:value={roomCodeInput} type="text" class='input my-4' placeholder="Room Code">
        <div class="modal-action">
        <form method="dialog">
          <button on:click={_=>window.location.href=`/room?code=${roomCodeInput}`} class="btn btn-sm">Join</button>
          <button class="btn btn-sm">Back</button>
        </form>
      </div>
    </div>
  </dialog>

  <!-- room create prompt -->
  <dialog bind:this={roomCreateModal} class="modal">
    <div class="modal-box">
      <h3 class="font-bold">Create Room</h3>
      <div class="text-xs">Configurations:</div>
        <div class="modal-action">
        <form method="dialog">
          <button on:click={_=>window.location.href=`/room`} class="btn btn-sm">Create</button>
          <button class="btn btn-sm">Back</button>
        </form>
      </div>
    </div>
  </dialog>

  <!-- page -->
  <h1 class='text-3xl py-4 font-bold'>Hearts!</h1>

  <p class='text-gray-500 py-4'>a great game to play with friends</p>

  <button on:click={_=>roomJoinModal.showModal()} class='btn btn-sm'>Join Room</button>
  <button on:click={_=>roomCreateModal.showModal()} class="btn btn-sm">Create Room</button>

</main>
