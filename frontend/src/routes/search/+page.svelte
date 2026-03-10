<script lang="ts">
  import Navbar from '$lib/Navbar.svelte';
  import { API_ADDR } from '$lib/configs.ts';
  import { getUser } from '$lib/state.svelte.ts';
  import { onMount } from 'svelte';

  let user;
  onMount((_) => (user = getUser()));

  let username = $state('');
  let res = $state<any>(null);

  async function getGames() {
    if (!username) return;
    const params = new URLSearchParams();
    params.append('username', username);
    const response = await fetch(API_ADDR + `/game/search?${params}`);
    res = await response.json();
  }
</script>

<Navbar {user} />
<input type="text" placeholder="Search Username" class="input" bind:value={username} />

<button class="btn" onclick={getGames}>Search</button>

{#if res === ''}{:else if res === null || res.length === 0}
  <div
    class="mx-auto mt-4 max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
  >
    <p class="text-center font-medium">User either doesn't exist or hasn't played any games.</p>
  </div>
{:else}
  <div class="mt-6 overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-left text-sm text-gray-500">
      <thead class="bg-gray-100 text-xs text-gray-700 uppercase">
        <tr>
          <th scope="col" class="px-6 py-3">Game ID</th>
          <th scope="col" class="px-6 py-3">Status</th>
          <th scope="col" class="px-6 py-3">Started On</th>
          <th scope="col" class="px-6 py-3">Seat</th>
          <th scope="col" class="px-6 py-3">Rounds/Scores</th>
        </tr>
      </thead>
      <tbody>
        {#each res as game}
          <tr class="border-b bg-white hover:bg-gray-50">
            <td class="px-6 py-4 font-medium whitespace-nowrap text-gray-900">
              #{game.game_id}
            </td>
            <td class="px-6 py-4">
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium
                {game.status === 'done'
                  ? 'bg-green-100 text-green-800'
                  : game.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'}"
              >
                {game.status}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {new Date(game.time_started).toLocaleDateString()} <br />
              <span class="text-xs text-gray-400"
                >{new Date(game.time_started).toLocaleTimeString()}</span
              >
            </td>
            <td class="px-6 py-4 text-center font-semibold">
              {game.my_seat}
            </td>
            <td class="px-6 py-4">
              {#if game.rounds && game.rounds.length > 0}
                <div class="space-y-3">
                  {#each game.rounds as round}
                    <div class="rounded-md border border-gray-200 bg-gray-50 p-3">
                      <div class="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Round {round.round_number}
                        <span class="font-normal lowercase"
                          >at {new Date(round.time_started).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span
                        >
                      </div>
                      <div class="flex flex-wrap gap-2">
                        {#each round.scores as score}
                          <div
                            class="flex items-center space-x-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm"
                          >
                            <span class="font-medium text-gray-700">{score.username}</span>
                            <span class="text-gray-400">|</span>
                            <span
                              class="font-bold {score.score > 0
                                ? 'text-red-600'
                                : 'text-green-600'}">{score.score}</span
                            >
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <span class="text-gray-400 italic">No rounds played yet.</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
