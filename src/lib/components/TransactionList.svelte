<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { ArrowDownLeft, ArrowUpRight, Loader2, Trash2 } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';

	import { formatCurrency, formatShortDate } from '$lib/shared/money';
	import { toast } from '$lib/state/toast.svelte';

	import type { Transaction } from '$lib/server/db/schema';

	let {
		transactions,
		showTitle = true,
		compact = false
	}: { transactions: Transaction[]; showTitle?: boolean; compact?: boolean } = $props();

	let mounted = $state(false);
	let deletingIds = $state<Set<string>>(new Set());

	onMount(() => {
		mounted = true;
	});

	function setDeleting(id: string, value: boolean) {
		const next = new Set(deletingIds);
		if (value) next.add(id);
		else next.delete(id);
		deletingIds = next;
	}
</script>

<section class="overflow-hidden rounded-[28px] border border-emerald-900/10 bg-white/90 shadow-sm">
	{#if showTitle}
		<div class="flex items-center justify-between border-b border-emerald-900/10 px-4 py-4 sm:px-5">
			<h2 class="text-lg font-bold text-[#10231d]">Transaksi terbaru</h2>
			<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
				{transactions.length} item
			</span>
		</div>
	{/if}

	<div class="divide-y divide-emerald-900/10">
		{#if transactions.length}
			{#each transactions as transaction (transaction.id)}
				{@const isDeleting = deletingIds.has(transaction.id)}
				<article
					in:fly|global={mounted ? { y: -12, duration: 320 } : { duration: 0 }}
					animate:flip={{ duration: 280 }}
					class="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5"
				>
					<div class="flex min-w-0 gap-3">
						<span
							class={[
								'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl',
								transaction.type === 'expense'
									? 'bg-rose-50 text-rose-600'
									: 'bg-emerald-50 text-emerald-700'
							]}
						>
							{#if transaction.type === 'expense'}
								<ArrowUpRight size={19} aria-hidden="true" />
							{:else}
								<ArrowDownLeft size={19} aria-hidden="true" />
							{/if}
						</span>

						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<h3 class="font-bold text-[#10231d]">{transaction.title}</h3>
								<span
									class={[
										'rounded-full px-2.5 py-1 text-xs font-bold',
										transaction.type === 'expense'
											? 'bg-rose-100 text-rose-800'
											: 'bg-emerald-100 text-emerald-800'
									]}
								>
									{transaction.type === 'expense' ? 'Keluar' : 'Masuk'}
								</span>
								<span
									class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
								>
									{transaction.category}
								</span>
							</div>
							<p class="mt-1.5 text-sm text-slate-500">
								{formatShortDate(transaction.occurredAt)}
								{#if transaction.merchant}
									<span> - {transaction.merchant}</span>
								{/if}
								{#if transaction.sourceText && !compact}
									<span> - AI: "{transaction.sourceText}"</span>
								{/if}
							</p>
						</div>
					</div>

					<div class="flex items-center justify-between gap-3 sm:justify-end">
						<p
							class={[
								'text-right text-lg font-bold',
								transaction.type === 'expense' ? 'text-rose-700' : 'text-emerald-700'
							]}
						>
							{transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
						</p>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								setDeleting(transaction.id, true);
								return async ({ result }) => {
									if (result.type === 'success') {
										toast.success('Transaksi dihapus.');
										await invalidate('app:transactions');
									} else if (result.type === 'failure') {
										const data = result.data as Record<string, unknown> | undefined;
										toast.error(
											typeof data?.message === 'string' ? data.message : 'Gagal menghapus.'
										);
									} else if (result.type === 'error') {
										toast.error(result.error?.message ?? 'Gagal menghapus.');
									}
									setDeleting(transaction.id, false);
								};
							}}
						>
							<input type="hidden" name="id" value={transaction.id} />
							<button
								type="submit"
								disabled={isDeleting}
								class="inline-flex size-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
								aria-label={`Hapus ${transaction.title}`}
							>
								{#if isDeleting}
									<Loader2 size={17} class="animate-spin" aria-hidden="true" />
								{:else}
									<Trash2 size={17} aria-hidden="true" />
								{/if}
							</button>
						</form>
					</div>
				</article>
			{/each}
		{:else}
			<p class="px-4 py-8 text-sm text-slate-500 sm:px-5">
				Belum ada transaksi. Tambahkan lewat input cepat atau form manual.
			</p>
		{/if}
	</div>
</section>
