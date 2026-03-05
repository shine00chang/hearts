import { redirect } from '@sveltejs/kit';
import { API_ADDR } from '$lib/configs.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {

  if (url.pathname === '/login')
    return;

  return { user: { username: 'turtle', id: 'turtles' } }

  const res = await fetch(API_ADDR + '/user')
  if (res.status !== 200) {
     return redirect(303, '/login');
  }
  
  const user = await res.json();

  return { user };
};
