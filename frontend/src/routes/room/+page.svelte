<script>
  import { onMount } from 'svelte';

  const WSPORT = 3000;

  let socket;

  onMount(() => {
    console.log('starting WS...');

    socket = io(window.location.hostname + ":" + WSPORT, {
      auth: {
        'session': 'superadmin',
      },
      query: {
        'roomId': 'ABCD'
      },
    });
    socket.emit('test', {'hello': 'world'})
  })
</script>

<h1>Game Room</h1>

Todo

