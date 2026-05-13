<script lang="ts">
	import { onMount } from 'svelte';

	import ApiKeyNotice from '$lib/components/ApiKeyNotice.svelte';
	import HomeAppBar from '$lib/components/HomeAppBar.svelte';
	import QuickAddForm from '$lib/components/QuickAddForm.svelte';
	import TransactionList from '$lib/components/TransactionList.svelte';
	import { navVisibility } from '$lib/state/nav-visibility.svelte';

	let { data } = $props();

	onMount(() => {
		navVisibility.autoHide = true;
		navVisibility.visible = true;

		let lastY = window.scrollY;
		let ticking = false;

		const handle = () => {
			const y = window.scrollY;
			const delta = y - lastY;
			if (Math.abs(delta) > 8) {
				navVisibility.visible = delta < 0 || y < 16;
				lastY = y;
			}
			ticking = false;
		};

		const onScroll = () => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(handle);
			}
		};

		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			navVisibility.autoHide = false;
			navVisibility.visible = true;
		};
	});
</script>

<svelte:head>
	<title>Dashboard - Money Tracker</title>
</svelte:head>

<main
	class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:px-8"
	style="padding-bottom: calc(11rem + env(safe-area-inset-bottom));"
>
	<HomeAppBar
		hasDeepSeekKey={data.hasDeepSeekKey}
		summary={data.summary}
		monthLabel={data.monthLabel}
		monthlyTransactionCount={data.monthlyTransactionCount}
	/>
	<ApiKeyNotice hasDeepSeekKey={data.hasDeepSeekKey} />

	<TransactionList transactions={data.transactions} compact />
</main>

<div
	class="fixed inset-x-0 z-40 px-4 transition-[bottom] duration-300 ease-out sm:px-6 lg:px-8"
	style="bottom: calc({navVisibility.visible ? '6rem' : '1rem'} + env(safe-area-inset-bottom));"
>
	<div class="mx-auto w-full max-w-7xl">
		<QuickAddForm />
	</div>
</div>
