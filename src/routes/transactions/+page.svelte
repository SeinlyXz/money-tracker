<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Search, X } from 'lucide-svelte';

	import FlashMessage from '$lib/components/FlashMessage.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TransactionList from '$lib/components/TransactionList.svelte';
	import { isTransactionType } from '$lib/shared/money';

	let { data, form } = $props();

	let query = $state('');

	const typeFilter = $derived.by(() => {
		const t = page.url.searchParams.get('type');
		return isTransactionType(t) ? t : null;
	});

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		let list = data.transactions;
		if (typeFilter) {
			list = list.filter((t) => t.type === typeFilter);
		}
		if (q) {
			list = list.filter((t) => {
				const haystack = [t.title, t.merchant, t.category, t.sourceText, t.note]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				return haystack.includes(q);
			});
		}
		return list;
	});

	const headerTitle = $derived(
		typeFilter === 'income'
			? 'Pemasukan'
			: typeFilter === 'expense'
				? 'Pengeluaran'
				: 'Semua Transaksi'
	);
</script>

<svelte:head>
	<title>Transaksi - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pt-5 pb-2 sm:px-6 lg:px-8">
	<PageHeader
		title="Transaksi"
		description="Riwayat pemasukan dan pengeluaran terbaru. Data tersimpan lokal di SQLite."
	/>

	<FlashMessage {form} />

	<div class="flex flex-wrap items-center gap-2">
		<a
			href={resolve('/transactions')}
			class={[
				'rounded-full border px-3 py-1.5 text-xs transition',
				!typeFilter
					? 'border-[#10231d] bg-[#10231d] font-bold text-white shadow-sm'
					: 'border-emerald-900/10 bg-white/80 font-semibold text-slate-600 hover:bg-white'
			]}
		>
			Semua
		</a>
		<a
			href={resolve('/transactions') + '?type=income'}
			class={[
				'rounded-full border px-3 py-1.5 text-xs transition',
				typeFilter === 'income'
					? 'border-emerald-700 bg-emerald-700 font-bold text-white shadow-sm'
					: 'border-emerald-900/10 bg-white/80 font-semibold text-slate-600 hover:bg-white'
			]}
		>
			Pemasukan
		</a>
		<a
			href={resolve('/transactions') + '?type=expense'}
			class={[
				'rounded-full border px-3 py-1.5 text-xs transition',
				typeFilter === 'expense'
					? 'border-rose-700 bg-rose-700 font-bold text-white shadow-sm'
					: 'border-emerald-900/10 bg-white/80 font-semibold text-slate-600 hover:bg-white'
			]}
		>
			Pengeluaran
		</a>
	</div>

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

	<TransactionList transactions={filtered} title={headerTitle} />
</main>
