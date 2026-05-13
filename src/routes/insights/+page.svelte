<script lang="ts">
	import { Calculator, Landmark, ReceiptText } from 'lucide-svelte';

	import CategoryBreakdown from '$lib/components/CategoryBreakdown.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import SummaryCards from '$lib/components/SummaryCards.svelte';

	import { formatCurrency } from '$lib/shared/money';

	let { data } = $props();

	const averageExpense = $derived(() => {
		const expenses = data.transactions.filter((transaction) => transaction.type === 'expense');
		if (!expenses.length) {
			return 0;
		}

		return Math.round(
			expenses.reduce((total, transaction) => total + transaction.amount, 0) / expenses.length
		);
	});
</script>

<svelte:head>
	<title>Insight - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pt-5 pb-2 sm:px-6 lg:px-8">
	<PageHeader
		title="Insight"
		description="Lihat pola pengeluaran supaya keputusan harian lebih cepat dan jelas."
	/>

	<SummaryCards summary={data.summary} />

	<section class="grid gap-3 sm:grid-cols-3">
		<div class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
			<span class="flex size-9 items-center justify-center rounded-[8px] bg-sky-50 text-sky-700">
				<Calculator size={18} aria-hidden="true" />
			</span>
			<p class="mt-3 text-sm font-medium text-slate-500">Rata-rata pengeluaran</p>
			<p class="mt-1 text-2xl font-bold text-[#10231d]">{formatCurrency(averageExpense())}</p>
		</div>
		<div class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
			<span
				class="flex size-9 items-center justify-center rounded-[8px] bg-emerald-50 text-emerald-700"
			>
				<Landmark size={18} aria-hidden="true" />
			</span>
			<p class="mt-3 text-sm font-medium text-slate-500">Total pemasukan</p>
			<p class="mt-1 text-2xl font-bold text-emerald-700">
				{formatCurrency(data.summary.totalIncome)}
			</p>
		</div>
		<div class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
			<span
				class="flex size-9 items-center justify-center rounded-[8px] bg-emerald-950/5 text-[#10231d]"
			>
				<ReceiptText size={18} aria-hidden="true" />
			</span>
			<p class="mt-3 text-sm font-medium text-slate-500">Total transaksi</p>
			<p class="mt-1 text-2xl font-bold text-[#10231d]">{data.transactions.length}</p>
		</div>
	</section>

	<CategoryBreakdown summary={data.summary} title="Kategori paling boros" />
</main>
