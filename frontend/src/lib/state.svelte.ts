let user: any = $state();

export function getUser () {
  return $state.snapshot(user);
}

export function setUser (nuser: any) {
  user = nuser;
}
