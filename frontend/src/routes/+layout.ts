import { redirect } from '@sveltejs/kit';
import { API_ADDR } from '$lib/configs.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async _ => {
  const res = await fetch(API_ADDR + '/user')
  if (res.status !== 200) {
     return redirect(303, '/login');
  }
  
  const user = await res.json();

  return { user };
};
