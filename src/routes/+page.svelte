<script lang="ts">
	import ApiKeyNotice from '$lib/components/ApiKeyNotice.svelte';
	import HomeAppBar from '$lib/components/HomeAppBar.svelte';
	import QuickAddForm from '$lib/components/QuickAddForm.svelte';
	import TransactionList from '$lib/components/TransactionList.svelte';

	let { data } = $props();
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
		userName={data.userName}
	/>
	<ApiKeyNotice hasDeepSeekKey={data.hasDeepSeekKey} />

	<TransactionList transactions={data.transactions} />
</main>

<QuickAddForm />
