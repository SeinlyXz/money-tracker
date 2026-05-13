<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import Toaster from '$lib/components/Toaster.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/brand-mark.svg?v=2" />
	<link rel="alternate icon" type="image/png" href="/favicon-32.png?v=2" />
</svelte:head>
<AppShell>
	{@render children()}
</AppShell>
<Toaster />
