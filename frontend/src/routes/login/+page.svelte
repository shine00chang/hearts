<script>
	import { goto } from "$app/navigation";
	import { userState } from "../../state.svelte";
    import Navbar from "$lib/Navbar.svelte";

    let username = $state('');
    let password = $state('');

	const login = () => {
        // mocking login for now
        userState.loggedIn = true;
        userState.name = username;

        if (username.length < 3 || password.length < 3) {
            alert('Username and password must be at least 3 characters long.');
            return;
        }
        
        // this should try to login, 
        // if no account, it should recommend signing up
        // if password wrong, it should give max 5 attempts or something, ratelimited on backend
        // if successful, it should redirect to the homepage
        
        goto('/');
	};

	const signup = () => {
        // this should send a request to backend to create account in db
        // then also log them in and redirect to homepage
		alert('signup todo');

        goto('/')
	};
</script>

<Navbar />
<div class="w-full flex items-center flex-col py-8 px-8 gap-4">
	<h1 class="text-2xl font-bold">Login</h1>

	<input type="text" id="username" placeholder="username" bind:value={username} class="input input-bordered w-full max-w-xs"/>
	<input type="password" id="password" placeholder="password" bind:value={password} class="input input-bordered w-full max-w-xs"/>
	<div>
        <button onclick={login} class="btn btn-primary">Log In</button>
        <button onclick={signup} class="btn btn-secondary">Sign Up</button>
    </div>
</div>
