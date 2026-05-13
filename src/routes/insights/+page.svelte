<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		ArrowDownLeft,
		ArrowUpRight,
		Calculator,
		ChartNoAxesColumnIncreasing,
		MessageCircleQuestion,
		ReceiptText,
		Sparkles,
		Wallet
	} from 'lucide-svelte';

	import { formatCurrency } from '$lib/shared/money';

	let { data } = $props();

	const expenses = $derived(data.transactions.filter((t) => t.type === 'expense'));
	const incomes = $derived(data.transactions.filter((t) => t.type === 'income'));

	const averageExpense = $derived(
		expenses.length ? Math.round(expenses.reduce((a, t) => a + t.amount, 0) / expenses.length) : 0
	);

	const largestExpense = $derived(
		expenses.reduce((max, t) => (t.amount > max ? t.amount : max), 0)
	);

	const last30Days = $derived.by(() => {
		const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
		return expenses.filter((t) => t.occurredAt >= cutoff);
	});

	const last30DaysTotal = $derived(last30Days.reduce((sum, t) => sum + t.amount, 0));
	const dailyAvg30 = $derived(Math.round(last30DaysTotal / 30));

	const weekdayBreakdown = $derived.by(() => {
		const names = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
		const buckets = names.map(() => 0);
		for (const t of expenses) {
			buckets[new Date(t.occurredAt).getDay()] += t.amount;
		}
		const max = Math.max(...buckets, 1);
		return names.map((name, i) => ({
			name,
			total: buckets[i],
			percent: Math.round((buckets[i] / max) * 100)
		}));
	});

	const maxCategorySpend = $derived(Math.max(...data.summary.byCategory.map((c) => c.total), 1));

	const savingsRate = $derived.by(() => {
		if (!data.summary.totalIncome) return 0;
		return Math.max(
			0,
			Math.round(
				((data.summary.totalIncome - data.summary.totalExpense) / data.summary.totalIncome) * 100
			)
		);
	});
</script>

<svelte:head>
	<title>Insight - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pt-3 pb-24 sm:px-6">
	<header class="flex items-center justify-between gap-2">
		<div>
			<p class="text-[10px] font-bold tracking-[0.18em] text-emerald-700/80 uppercase">Insight</p>
			<h1 class="text-xl font-bold text-[#10231d]">Pola keuanganmu</h1>
		</div>
		<a
			href={resolve('/consult')}
			class="inline-flex items-center gap-1.5 rounded-full bg-[#10231d] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm active:scale-[0.97]"
		>
			<Sparkles size={12} aria-hidden="true" />
			Konsul AI
		</a>
	</header>

	<section class="grid grid-cols-2 gap-2">
		<div class="rounded-[20px] border border-emerald-900/10 bg-white/90 p-3 shadow-sm">
			<span class="flex size-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
				<Calculator size={14} aria-hidden="true" />
			</span>
			<p class="mt-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
				Rata-rata
			</p>
			<p class="mt-0.5 text-base font-bold text-[#10231d]">{formatCurrency(averageExpense)}</p>
		</div>
		<div class="rounded-[20px] border border-emerald-900/10 bg-white/90 p-3 shadow-sm">
			<span class="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
				<ArrowUpRight size={14} aria-hidden="true" />
			</span>
			<p class="mt-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Terbesar</p>
			<p class="mt-0.5 text-base font-bold text-rose-700">{formatCurrency(largestExpense)}</p>
		</div>
		<div class="rounded-[20px] border border-emerald-900/10 bg-white/90 p-3 shadow-sm">
			<span
				class="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"
			>
				<ArrowDownLeft size={14} aria-hidden="true" />
			</span>
			<p class="mt-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
				Total masuk
			</p>
			<p class="mt-0.5 text-base font-bold text-emerald-700">
				{formatCurrency(data.summary.totalIncome)}
			</p>
		</div>
		<div class="rounded-[20px] border border-emerald-900/10 bg-white/90 p-3 shadow-sm">
			<span
				class="flex size-7 items-center justify-center rounded-lg bg-emerald-950/5 text-[#10231d]"
			>
				<ReceiptText size={14} aria-hidden="true" />
			</span>
			<p class="mt-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
				Transaksi
			</p>
			<p class="mt-0.5 text-base font-bold text-[#10231d]">
				{data.transactions.length}
				<span class="text-[10px] font-medium text-slate-500">
					({expenses.length}/{incomes.length})
				</span>
			</p>
		</div>
	</section>

	<section
		class="rounded-[20px] border border-emerald-900/10 bg-[#10231d] p-4 text-white shadow-[0_18px_45px_rgba(16,35,29,0.18)]"
	>
		<div class="flex items-center justify-between gap-2">
			<div>
				<p class="text-[10px] font-semibold tracking-wider text-emerald-100/80 uppercase">
					30 hari terakhir
				</p>
				<p class="mt-1 text-2xl font-bold">{formatCurrency(last30DaysTotal)}</p>
			</div>
			<span class="flex size-9 items-center justify-center rounded-full bg-white/12">
				<Wallet size={16} aria-hidden="true" />
			</span>
		</div>
		<div class="mt-3 grid grid-cols-2 gap-2">
			<div class="rounded-xl bg-white/8 px-2.5 py-2">
				<p class="text-[10px] text-emerald-100/70">Per hari</p>
				<p class="text-sm font-bold">{formatCurrency(dailyAvg30)}</p>
			</div>
			<div class="rounded-xl bg-white/8 px-2.5 py-2">
				<p class="text-[10px] text-emerald-100/70">Hemat rate</p>
				<p class="text-sm font-bold">{savingsRate}%</p>
			</div>
		</div>
	</section>

	<section class="rounded-[20px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
		<div class="flex items-center justify-between">
			<h2 class="flex items-center gap-1.5 text-sm font-bold text-[#10231d]">
				<ChartNoAxesColumnIncreasing size={15} class="text-emerald-700" aria-hidden="true" />
				Top kategori boros
			</h2>
			<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
				{data.summary.byCategory.length}
			</span>
		</div>
		<div class="mt-3 space-y-2">
			{#if data.summary.byCategory.length}
				{#each data.summary.byCategory as item (item.category)}
					<div>
						<div class="flex items-center justify-between text-[12px]">
							<span class="font-semibold text-slate-700">
								{item.category}
								<span class="text-[10px] font-medium text-slate-400">· {item.count}x</span>
							</span>
							<span class="font-bold text-[#10231d]">{formatCurrency(item.total)}</span>
						</div>
						<div class="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
							<div
								class="h-1.5 rounded-full bg-emerald-600"
								style={`width: ${Math.max(5, Math.round((item.total / maxCategorySpend) * 100))}%`}
							></div>
						</div>
					</div>
				{/each}
			{:else}
				<p class="text-xs text-slate-500">Belum ada pengeluaran.</p>
			{/if}
		</div>
	</section>

	<section class="rounded-[20px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
		<h2 class="text-sm font-bold text-[#10231d]">Boros per hari</h2>
		<p class="mt-0.5 text-[11px] text-slate-500">
			Total pengeluaran per hari minggu ini juga total.
		</p>
		<div class="mt-3 flex items-end justify-between gap-1.5">
			{#each weekdayBreakdown as day (day.name)}
				<div class="flex flex-1 flex-col items-center gap-1">
					<div class="flex h-20 w-full items-end">
						<div
							class={[
								'w-full rounded-t-md transition-all',
								day.total ? 'bg-emerald-600' : 'bg-slate-100'
							]}
							style={`height: ${Math.max(4, day.percent)}%`}
						></div>
					</div>
					<span class="text-[9px] font-semibold text-slate-500">{day.name}</span>
				</div>
			{/each}
		</div>
	</section>

	<a
		href={resolve('/consult')}
		class="flex items-center gap-3 rounded-[20px] border border-emerald-900/10 bg-gradient-to-br from-amber-50 to-rose-50 p-4 shadow-sm transition active:scale-[0.99]"
	>
		<span
			class="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"
		>
			<MessageCircleQuestion size={18} aria-hidden="true" />
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-sm font-bold text-[#10231d]">Konsultasi keuangan AI</p>
			<p class="text-[11px] text-slate-600">Rekomendasi, proyeksi, hal yang perlu dikurangi.</p>
		</div>
		<Sparkles size={14} class="text-amber-500" aria-hidden="true" />
	</a>
</main>
