<script lang="ts">

import Navbar from "$lib/Navbar.svelte";
import { API_ADDR } from '$lib/configs.ts';
let username = $state("");
let res = $state<any>(null);

async function getGames() {
  if (!username) return;
  const params = new URLSearchParams();
  params.append("username", username);
  const response = await fetch(API_ADDR + `/game/search?${params}`);
  res = await response.json();
}
</script>

<Navbar/>
<input type="text" placeholder="Search Username" class="input" bind:value={username}/>

<button class="btn" onclick={getGames}>Search</button>

{#if res === ""}
  {:else if res === null || res.length === 0}
  <div class="p-4 mt-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 max-w-2xl mx-auto border border-yellow-200">
    <p class="text-center font-medium">User either doesn't exist or hasn't played any games.</p>
  </div>
{:else}
  <div class="overflow-x-auto mt-6 shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left text-gray-500">
      <thead class="text-xs text-gray-700 uppercase bg-gray-100">
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
          <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
              #{game.game_id}
            </td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium
                {game.status === 'done' ? 'bg-green-100 text-green-800' : 
                 game.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                 'bg-gray-100 text-gray-800'}">
                {game.status}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {new Date(game.time_started).toLocaleDateString()} <br/>
              <span class="text-xs text-gray-400">{new Date(game.time_started).toLocaleTimeString()}</span>
            </td>
            <td class="px-6 py-4 text-center font-semibold">
              {game.my_seat}
            </td>
            <td class="px-6 py-4">
              {#if game.rounds && game.rounds.length > 0}
                <div class="space-y-3">
                  {#each game.rounds as round}
                    <div class="bg-gray-50 border border-gray-200 p-3 rounded-md">
                      <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Round {round.round_number} <span class="font-normal lowercase">at {new Date(round.time_started).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        {#each round.scores as score}
                          <div class="bg-white border border-gray-200 shadow-sm text-xs px-2 py-1 rounded flex items-center space-x-1">
                            <span class="font-medium text-gray-700">{score.username}</span>
                            <span class="text-gray-400">|</span>
                            <span class="font-bold {score.score > 0 ? 'text-red-600' : 'text-green-600'}">{score.score}</span>
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
