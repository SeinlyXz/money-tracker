<script lang="ts">
	import { ArrowDownLeft, ArrowUpRight, WalletCards } from 'lucide-svelte';

	import { formatCurrency } from '$lib/shared/money';

	import type { TransactionSummary } from '$lib/server/db/transactions';

	let { summary }: { summary: TransactionSummary } = $props();

	const monthlySpendPercent = $derived(
		summary.monthlyIncome > 0
			? Math.min(100, Math.round((summary.monthlyExpense / summary.monthlyIncome) * 100))
			: summary.monthlyExpense > 0
				? 100
				: 0
	);
</script>

<section class="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
	<div
		class="overflow-hidden rounded-[8px] border border-emerald-900/10 bg-[#10231d] p-5 text-white shadow-[0_24px_55px_rgba(16,35,29,0.22)]"
	>
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="text-sm font-medium text-emerald-100/85">Balance bulan ini</p>
				<p class="mt-2 text-3xl font-bold tracking-normal">
					{formatCurrency(summary.monthlyBalance)}
				</p>
			</div>
			<span
				class="flex size-11 items-center justify-center rounded-[8px] bg-white/12 text-emerald-100"
			>
				<WalletCards size={22} aria-hidden="true" />
			</span>
		</div>
		<div class="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
			<div class="h-2 rounded-full bg-emerald-300" style={`width: ${monthlySpendPercent}%`}></div>
		</div>
		<p class="mt-3 text-sm font-medium text-emerald-100/90">
			{monthlySpendPercent}% pemasukan bulan ini terpakai
		</p>
	</div>

	<div class="grid gap-3 sm:grid-cols-3">
		<div class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
			<span class="flex size-9 items-center justify-center rounded-[8px] bg-rose-50 text-rose-600">
				<ArrowUpRight size={18} aria-hidden="true" />
			</span>
			<p class="mt-3 text-sm font-medium text-slate-500">Pengeluaran bulan ini</p>
			<p class="mt-1 text-2xl font-bold text-rose-700">
				{formatCurrency(summary.monthlyExpense)}
			</p>
		</div>
		<div class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
			<span
				class="flex size-9 items-center justify-center rounded-[8px] bg-emerald-50 text-emerald-700"
			>
				<ArrowDownLeft size={18} aria-hidden="true" />
			</span>
			<p class="mt-3 text-sm font-medium text-slate-500">Pemasukan bulan ini</p>
			<p class="mt-1 text-2xl font-bold text-emerald-700">
				{formatCurrency(summary.monthlyIncome)}
			</p>
		</div>
		<div class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
			<span class="flex size-9 items-center justify-center rounded-[8px] bg-sky-50 text-sky-700">
				<WalletCards size={18} aria-hidden="true" />
			</span>
			<p class="mt-3 text-sm font-medium text-slate-500">Semua pengeluaran</p>
			<p class="mt-1 text-2xl font-bold text-[#10231d]">
				{formatCurrency(summary.totalExpense)}
			</p>
		</div>
	</div>
</section>
