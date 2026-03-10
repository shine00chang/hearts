<script lang="ts">
import { API_ADDR } from '$lib/configs.ts';
import { onMount } from "svelte"
import Navbar from "$lib/Navbar.svelte";
import { getUser } from '$lib/state.svelte.ts';
let user;
onMount(_ => user = getUser());

let username = $state("");
let res = $state<any>(null);

async function getGames() {
  console.log("hello world!");
  const response = await fetch(API_ADDR + `/game/own`, {
    credentials: 'include'  //send cookies
  });
  const data = await response.json();
  username = data.username;
  res = data.games;
  console.log(username);
  console.log(res);
}

onMount(() => { getGames(); });

let stats = $derived.by(() => {
    if (!res || !Array.isArray(res) || res.length === 0) return null;

    let scoreSum = 0;
    let rankSum = 0;
    let games = 0;
    let placements = { 1: 0, 2: 0, 3: 0, 4: 0 };

    for (const game of res) {
      if (game.status !== 'done' || !game.rounds || game.rounds.length === 0) continue;
      //skip non finished games

      const totals: Record<string, number> = {};
      for (const round of game.rounds) {
        for (const score of round.scores) {
          if (totals[score.username] === undefined) {
            totals[score.username] = 0;
          }
          totals[score.username] += score.score;
        }
      }

      const sorted = Object.entries(totals).sort((a, b) => a[1] - b[1]);

      let rank = sorted.findIndex(p => p[0] === username);
      
      if (rank !== -1) {
        scoreSum += sorted[rank][1];
        rank++;  //zero indxed to one indexed

        rankSum += rank;
        placements[rank as keyof typeof placements]++;
        games++;
      }
    }

    if (!games) return null;

    return {
      games: games,
      avgScore: (scoreSum / games).toFixed(2),
      avgRank: (rankSum / games).toFixed(2),
      placements
    };
  });

</script>

<Navbar {user}/>
{#if stats}
  <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
    
    <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col justify-center">
      <h3 class="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Player Averages</h3>
      <div class="grid grid-cols-2 gap-4 text-center">
        <div>
          <p class="text-3xl font-bold text-gray-800">{stats.avgRank}</p>
          <p class="text-xs text-gray-500 mt-1">Average Rank</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-800">{stats.avgScore}</p>
          <p class="text-xs text-gray-500 mt-1">Average Score</p>
        </div>
      </div>
      <p class="text-center text-xs text-gray-400 mt-4">Out of {stats.games} total completed games</p>
    </div>

    <div class="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 class="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Placement Distribution</h3>
      
      <div class="flex items-end justify-around h-32 mt-2 border-b border-gray-200 pb-2">
        {#each [1, 2, 3, 4] as place}
          <div class="flex flex-col items-center justify-end w-1/5 group h-full">
            <span class="text-xs font-bold text-gray-600 mb-1">
              {stats.placements[place]}
            </span>
            <div 
              class="w-full rounded-t-sm transition-all duration-500 ease-in-out
                {place === 1 ? 'bg-yellow-400' : place === 2 ? 'bg-gray-300' : place === 3 ? 'bg-orange-400' : 'bg-red-400'}
                group-hover:opacity-80"
              style="height: {(stats.placements[place] / stats.games) * 100}%; min-height: 4px;"
            ></div>
          </div>
        {/each}
      </div>
      
      <div class="flex justify-around mt-2 text-xs font-medium text-gray-500">
        <div class="w-1/5 text-center">1st</div>
        <div class="w-1/5 text-center">2nd</div>
        <div class="w-1/5 text-center">3rd</div>
        <div class="w-1/5 text-center">4th</div>
      </div>
    </div>
  </div>
{:else}
  <div class="mb-8 bg-white p-8 rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center text-center">
    <h3 class="text-gray-600 font-semibold text-lg">No Stats Available</h3>
    <p class="text-gray-400 text-sm mt-1">You might not be logged in, or you haven't completed any games yet.</p>
  </div>
{/if}
