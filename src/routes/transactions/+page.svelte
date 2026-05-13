<script lang="ts">
	import { Search, X } from 'lucide-svelte';

	import FlashMessage from '$lib/components/FlashMessage.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TransactionList from '$lib/components/TransactionList.svelte';

	let { data, form } = $props();

	let query = $state('');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.transactions;
		return data.transactions.filter((t) => {
			const haystack = [t.title, t.merchant, t.category, t.sourceText, t.note]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(q);
		});
	});
</script>

<svelte:head>
	<title>Transaksi - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pt-5 pb-2 sm:px-6 lg:px-8">
	<PageHeader
		title="Transaksi"
		description="Riwayat pemasukan dan pengeluaran terbaru. Data tersimpan lokal di SQLite."
	/>

	<FlashMessage {form} />

	<div class="relative">
		<span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
			<Search size={17} aria-hidden="true" />
		</span>
		<input
			type="search"
			bind:value={query}
			placeholder="Cari judul, merchant, kategori, catatan..."
			class="min-h-12 w-full rounded-[8px] border border-emerald-900/10 bg-white/90 pr-10 pl-10 text-sm text-[#10231d] shadow-sm transition outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
		/>
		{#if query}
			<button
				type="button"
				onclick={() => (query = '')}
				aria-label="Bersihkan pencarian"
				class="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
			>
				<X size={15} aria-hidden="true" />
			</button>
		{/if}
	</div>

	{#if query.trim()}
		<p class="text-xs text-slate-500">
			{filtered.length} hasil untuk
			<span class="font-semibold text-[#10231d]">"{query.trim()}"</span>
		</p>
	{/if}

	<TransactionList transactions={filtered} />
</main>
