<script lang="ts">
	import { page } from '$app/state';

	import BottomNav from './BottomNav.svelte';

	let { children } = $props();

	const HIDDEN_NAV_PATHS = ['/login'];

	const hideNav = $derived.by(() => {
		const pathname = page.url.pathname;
		if (HIDDEN_NAV_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
			return true;
		}
		return page.data.passwordConfigured === false;
	});
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
