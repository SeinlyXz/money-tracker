<script lang="ts">
	import ApiKeyNotice from '$lib/components/ApiKeyNotice.svelte';
	import FlashMessage from '$lib/components/FlashMessage.svelte';
	import ManualTransactionForm from '$lib/components/ManualTransactionForm.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import QuickAddForm from '$lib/components/QuickAddForm.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Tambah - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pt-5 pb-2 sm:px-6 lg:px-8">
	<PageHeader
		title="Tambah transaksi"
		description="Masukkan transaksi dengan kalimat cepat atau form manual saat butuh detail lebih rapi."
		hasDeepSeekKey={data.hasDeepSeekKey}
	/>

	<FlashMessage {form} />
	<QuickAddForm />
	<ManualTransactionForm today={data.today} />
</main>
