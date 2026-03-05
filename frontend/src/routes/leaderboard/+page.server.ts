import type { PageServerLoad } from './$types';
import { API_ADDR } from '$lib/configs.ts';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const res = await fetch(API_ADDR + '/board/get')
    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }
    const leaderboard = await res.json();
    return { leaderboard };
  } catch (err) {
    console.error(err);
    return {
      leaderboard: [] 
    };
  }
};
