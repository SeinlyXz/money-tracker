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

<section
	class={[
		'overflow-hidden border border-emerald-900/10 bg-white/90 shadow-sm',
		compact ? 'rounded-[20px]' : 'rounded-[28px]'
	]}
>
	{#if showTitle}
		<div
			class={[
				'flex items-center justify-between border-b border-emerald-900/10',
				compact ? 'px-3 py-2.5 sm:px-4' : 'px-4 py-4 sm:px-5'
			]}
		>
			<h2 class={['font-bold text-[#10231d]', compact ? 'text-sm' : 'text-lg']}>
				Transaksi terbaru
			</h2>
			<span
				class={[
					'rounded-full bg-slate-100 font-semibold text-slate-500',
					compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
				]}
			>
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
					class={[
						'grid sm:grid-cols-[1fr_auto] sm:items-center',
						compact ? 'gap-2 px-3 py-2 sm:px-4' : 'gap-3 px-4 py-4 sm:px-5'
					]}
				>
					<div class={['flex min-w-0', compact ? 'gap-2' : 'gap-3']}>
						<span
							class={[
								'shrink-0 items-center justify-center',
								compact ? 'mt-0 flex size-8 rounded-lg' : 'mt-0.5 flex size-10 rounded-xl',
								transaction.type === 'expense'
									? 'bg-rose-50 text-rose-600'
									: 'bg-emerald-50 text-emerald-700'
							]}
						>
							{#if transaction.type === 'expense'}
								<ArrowUpRight size={compact ? 15 : 19} aria-hidden="true" />
							{:else}
								<ArrowDownLeft size={compact ? 15 : 19} aria-hidden="true" />
							{/if}
						</span>

						<div class="min-w-0 flex-1">
							<div class={['flex flex-wrap items-center', compact ? 'gap-1.5' : 'gap-2']}>
								<h3
									class={[
										'truncate text-[#10231d]',
										compact ? 'text-sm font-semibold' : 'font-bold'
									]}
								>
									{transaction.title}
								</h3>
								<span
									class={[
										'rounded-full font-bold',
										compact ? 'px-1.5 py-0 text-[10px]' : 'px-2.5 py-1 text-xs',
										transaction.type === 'expense'
											? 'bg-rose-100 text-rose-800'
											: 'bg-emerald-100 text-emerald-800'
									]}
								>
									{transaction.type === 'expense' ? 'Keluar' : 'Masuk'}
								</span>
								<span
									class={[
										'rounded-full bg-slate-100 font-semibold text-slate-600',
										compact ? 'px-1.5 py-0 text-[10px]' : 'px-2.5 py-1 text-xs'
									]}
								>
									{transaction.category}
								</span>
							</div>
							<p
								class={[
									'truncate text-slate-500',
									compact ? 'mt-0.5 text-[11px]' : 'mt-1.5 text-sm'
								]}
							>
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

					<div
						class={[
							'flex items-center justify-between sm:justify-end',
							compact ? 'gap-2' : 'gap-3'
						]}
					>
						<p
							class={[
								'text-right font-bold',
								compact ? 'text-sm' : 'text-lg',
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
								class={[
									'inline-flex items-center justify-center border border-rose-100 bg-rose-50 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60',
									compact ? 'size-8 rounded-lg' : 'size-10 rounded-xl'
								]}
								aria-label={`Hapus ${transaction.title}`}
							>
								{#if isDeleting}
									<Loader2 size={compact ? 14 : 17} class="animate-spin" aria-hidden="true" />
								{:else}
									<Trash2 size={compact ? 14 : 17} aria-hidden="true" />
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
