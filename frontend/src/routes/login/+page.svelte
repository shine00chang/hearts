<script>
  const login = () => {
    alert('login todo');
  }

  const signup = () => {
    alert('signup todo');
  }
</script>

<h1>Login</h1>

<input type='text' id='username' placeholder='username'><br>
<input type='text' id='password' placeholder='password'><br>
<button on:click={login}>Log In</button>
<button on:click={signup}>Sign Up</button>
