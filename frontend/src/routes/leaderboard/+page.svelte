<script lang="ts">
  import Navbar from '$lib/Navbar.svelte';
  import type { PageProps } from './$types';
  import { onMount } from 'svelte';
  import { getUser } from '$lib/state.svelte.ts';
  let me;
  onMount((_) => (me = getUser()));

  let { data }: PageProps = $props();
</script>

<Navbar user={me} />
<ul class="list rounded-box bg-base-100 shadow-md mx-6 mt-6">
  <li class="p-4 pb-2 text-xs tracking-wide opacity-60">Leaderboard</li>
  {#each data.leaderboard as user, i}
    <li class="list-row">
      <div class="text-4xl font-thin tabular-nums opacity-30">{i + 1}</div>
      <div class="list-col-grow">
        <div>{user.username}</div>
        <div class="text-xs font-semibold uppercase opacity-60">Games Won: {user.games_won}</div>
      </div>
    </li>
  {/each}
</ul>
