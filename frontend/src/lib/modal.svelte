<script lang='ts>
	let { showModal = $bindable(), header, children, onclose } = $props();

	let dialog = $state(); // HTMLDialogElement

	$effect(() => {
		if (showModal) dialog.showModal();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
    onclose={_ => { showModal = false; onclose(); }}
	onclick={e => { if (e.target === dialog) dialog.close(); }}
>
	<div>
		{@render children?.()}
		<!-- svelte-ignore a11y_autofocus -->
        <div class="flex">
          <div class="flex-grow"></div>
          <button autofocus onclick={_ => dialog.close()} class="btn">return to home</button>
        </div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
        position:fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>

