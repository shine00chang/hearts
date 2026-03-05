<script lang="ts">
  import Navbar from "$lib/Navbar.svelte";
  import type { PageProps } from './$types';
  import { onMount } from 'svelte'
  let { data }: PageProps = $props();
</script>

<Navbar />
<ul class="list bg-base-100 rounded-box shadow-md">
  <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Leaderboard</li>
  {#each data.leaderboard as user, i}
    <li class="list-row">
      <div class="text-4xl font-thin opacity-30 tabular-nums">{i + 1}</div>
      <div class="list-col-grow">
        <div>{user.username}</div>
        <div class="text-xs uppercase font-semibold opacity-60">Games Won: {user.games_won}</div>
      </div>
  </li>
  {/each}
</ul>
