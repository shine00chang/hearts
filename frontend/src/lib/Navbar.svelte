<script lang="ts">
  import { userState } from '../state.svelte';

  let logoutOpen = false;
</script>

<nav class="flex w-full bg-base-200">
  <a href="/" class="px-4 py-3 text-2xl font-bold">❤️❤️❤️</a>
  <div class="flex flex-grow"></div>
  {#if userState.loggedIn}
    <button 
       class="px-4 py-2 text-2xl font-bold cursor-pointer" 
       onclick={() => (logoutOpen = !logoutOpen)}
       >
       Logged in as <span class="text-primary">{userState.name}</span>
    </button>
    {#if logoutOpen}
      <div class="absolute right-4 top-14 w-48 bg-base-200 rounded-md shadow-lg">
        <button 
          class="block w-full text-left px-4 py-2 text-sm text-error hover:bg-base-300" 
                 onclick={() => {
          userState.loggedIn = false;
          userState.name = null;
          logoutOpen = false;
          }}
          >
          Logout
        </button>
      </div>
    {/if}
  {:else}
    <a href="/login" class="px-4 py-2 text-2xl font-bold">Login</a>
  {/if}
</nav>
