<script lang="ts">
	import { onMount } from 'svelte';

	import ApiKeyNotice from '$lib/components/ApiKeyNotice.svelte';
	import HomeAppBar from '$lib/components/HomeAppBar.svelte';
	import QuickAddForm from '$lib/components/QuickAddForm.svelte';
	import TransactionList from '$lib/components/TransactionList.svelte';
	import { navVisibility } from '$lib/state/nav-visibility.svelte';

	let { data } = $props();

	let scrollEl: HTMLDivElement | null = $state(null);

	onMount(() => {
		navVisibility.autoHide = true;
		navVisibility.visible = true;

		let lastWinY = window.scrollY;
		let lastBoxY = scrollEl?.scrollTop ?? 0;
		let ticking = false;

		const handle = () => {
			const winY = window.scrollY;
			const boxY = scrollEl?.scrollTop ?? 0;
			const winDelta = winY - lastWinY;
			const boxDelta = boxY - lastBoxY;
			const delta = Math.abs(winDelta) > Math.abs(boxDelta) ? winDelta : boxDelta;
			const y = Math.max(winY, boxY);
			if (Math.abs(delta) > 6) {
				navVisibility.visible = delta < 0 || y < 12;
				lastWinY = winY;
				lastBoxY = boxY;
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
		scrollEl?.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			scrollEl?.removeEventListener('scroll', onScroll);
			navVisibility.autoHide = false;
			navVisibility.visible = true;
		};
	});
</script>

<svelte:head>
	<title>Dashboard - Money Tracker</title>
</svelte:head>

<main
	class="mx-auto flex h-[100dvh] w-full max-w-7xl flex-col gap-4 px-4 pt-4 sm:px-6 lg:px-8"
	style="padding-bottom: calc(11rem + env(safe-area-inset-bottom));"
>
	<HomeAppBar
		hasDeepSeekKey={data.hasDeepSeekKey}
		summary={data.summary}
		monthLabel={data.monthLabel}
		monthlyTransactionCount={data.monthlyTransactionCount}
	/>
	<ApiKeyNotice hasDeepSeekKey={data.hasDeepSeekKey} />

	<div bind:this={scrollEl} class="max-h-[calc(100dvh-30rem)] overflow-y-auto rounded-[28px]">
		<TransactionList transactions={data.transactions} compact />
	</div>
</main>

<div
	class="fixed inset-x-0 z-40 px-4 transition-[bottom] duration-300 ease-out sm:px-6 lg:px-8"
	style="bottom: calc({navVisibility.visible ? '6rem' : '1rem'} + env(safe-area-inset-bottom));"
>
	<div class="mx-auto w-full max-w-7xl">
		<QuickAddForm />
	</div>
</div>
