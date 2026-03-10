import { redirect } from '@sveltejs/kit';
import { API_ADDR } from '$lib/configs.ts';
import { setUser } from '$lib/state.svelte.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {

  const res = await fetch(API_ADDR + '/user', { credentials: "include" });
  if (res.status !== 200) {
    console.log('no good');
    console.log(await res.text());

    if (url.pathname !== '/login')
        return redirect(303, '/login');
    return {}
  }
  
  const user = await res.json();
  setUser(user);
  console.log('i am: ', user.username);
};
export const ssr = false;

