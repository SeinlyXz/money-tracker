<script lang="ts">
	import { ChartNoAxesColumnIncreasing } from 'lucide-svelte';

	import { formatCurrency } from '$lib/shared/money';

	import type { TransactionSummary } from '$lib/server/db/transactions';

	let { summary, title = 'Kategori pengeluaran' }: { summary: TransactionSummary; title?: string } =
		$props();

	const maxCategorySpend = $derived(Math.max(...summary.byCategory.map((item) => item.total), 1));
</script>

<section class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-5">
	<div class="flex items-center justify-between">
		<h2 class="flex items-center gap-2 text-lg font-bold text-[#10231d]">
			<span
				class="flex size-8 items-center justify-center rounded-[8px] bg-emerald-100 text-emerald-700"
			>
				<ChartNoAxesColumnIncreasing size={17} aria-hidden="true" />
			</span>
			{title}
		</h2>
		<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
			>Top 6</span
		>
	</div>

	<div class="mt-5 grid gap-4">
		{#if summary.byCategory.length}
			{#each summary.byCategory as item (item.category)}
				<div class="grid gap-2">
					<div class="flex items-center justify-between gap-3 text-sm">
						<span class="font-semibold text-slate-700">{item.category}</span>
						<span class="font-bold text-[#10231d]">{formatCurrency(item.total)}</span>
					</div>
					<div class="h-2 overflow-hidden rounded-full bg-slate-100">
						<div
							class="h-2 rounded-full bg-emerald-600"
							style={`width: ${Math.max(5, Math.round((item.total / maxCategorySpend) * 100))}%`}
						></div>
					</div>
				</div>
			{/each}
		{:else}
			<p class="text-sm text-slate-500">Belum ada pengeluaran.</p>
		{/if}
	</div>
</section>
