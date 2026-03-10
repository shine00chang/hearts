<script lang="ts">
	import { API_ADDR } from './configs';

  const { user } = $props();
  console.log(user);
  let logoutOpen = $state(false);
</script>

<nav class="flex w-full bg-base-200">
  <a href="/" class="px-4 py-3 text-2xl font-bold">❤️❤️❤️</a>
  <div class="flex flex-grow"></div>
  <a href="/search" class="inline-flex items-center px-4 py-2 text-2xl font-bold">Search</a>
  <a href="/profile" class="inline-flex items-center px-4 py-2 text-2xl font-bold">Profile</a>
  {#if user}
    <button 
       class="inline-flex items-center px-4 py-2 text-2xl font-bold cursor-pointer inline-block" 
       onclick={() => (logoutOpen = !logoutOpen)}
       >
       Logged in as<span class="text-primary">&nbsp;{user.username}</span>
    </button>
    {#if logoutOpen}
      <div class="absolute right-4 top-14 w-48 bg-base-200 rounded-md shadow-lg">
        <button 
          class="block w-full text-left px-4 py-2 text-sm text-error hover:bg-base-300" 
                 onclick={() => {
                  fetch(API_ADDR + '/user/logout', {
                    credentials: 'include',
                    method: "POST"
                  });
                  logoutOpen = false;
                
          location.reload();

          }}
          >
          Logout
        </button>
      </div>
    {/if}
  {:else}
    <a href="/login" class="inline-flex items-center px-4 py-2 text-2xl font-bold">Login</a>
  {/if}
</nav>
