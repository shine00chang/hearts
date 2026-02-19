import { error } from '@sveltejs/kit';
import { API_ADDR } from '$lib/configs.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async _ => {
  console.log(API_ADDR + '/user');
  const user = await fetch(API_ADDR + '/user')
    .then(res => res.json());

  return { user };
};
