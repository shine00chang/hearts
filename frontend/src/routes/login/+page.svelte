<script lang='ts''>
	import { goto } from "$app/navigation";
	import { userState } from "../../state.svelte";
    import Navbar from "$lib/Navbar.svelte";
    import { API_ADDR } from "$lib/configs";
    
    const post = async (route: string, body: any) => {
        const res = await fetch(API_ADDR + route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(body),
        });
        let data = {};
        try {
            data = await res.text();
            data = await res.json();
        } catch {
        }
        return [data, res.status];
    }

    let username = $state('');
    let password = $state('');

	const login = async () => {
        if (username.length < 3 || password.length < 3) {
            alert('Username and password must be at least 3 characters long.');
            return;
        }
        
        const [data, status] = await post('/user/login', {
            username,
            password,
        })
        if (status !== 200) {
            alert(data);
            return;
        }
        
        userState.loggedIn = true;
        userState.name = username;
        goto('/');
	};

	const signup = async () => {
        if (username.length < 3 || password.length < 3) {
            alert('Username and password must be at least 3 characters long.');
            return;
        }
        
        const [data, status] = await post('/user/create', {
            username,
            password,
        })
        if (status !== 200) {
            alert(data);
            return;
        }

        await login();
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
