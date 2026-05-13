<script lang="ts">
	import { page } from '$app/state';

	import BottomNav from './BottomNav.svelte';

	let { children } = $props();

	const HIDDEN_NAV_PATHS = ['/login'];

	const hideNav = $derived(
		HIDDEN_NAV_PATHS.some(
			(path) => page.url.pathname === path || page.url.pathname.startsWith(`${path}/`)
		)
	);
</script>

<div
	class={['min-h-screen text-[#10231d]', hideNav ? 'pb-0' : 'pb-24 sm:pb-28']}
	style="padding-top: env(safe-area-inset-top);"
>
	{@render children()}
</div>

{#if !hideNav}
	<BottomNav />
{/if}
