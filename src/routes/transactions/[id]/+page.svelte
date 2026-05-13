<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		ArrowUpRight,
		ArrowDownLeft,
		Loader2,
		Pencil,
		Plus,
		Save,
		Sparkles,
		Trash2,
		X
	} from 'lucide-svelte';

	import FlashMessage from '$lib/components/FlashMessage.svelte';
	import { formatCurrency, formatShortDate } from '$lib/shared/money';
	import { toast } from '$lib/state/toast.svelte';
	import type { TransactionItem } from '$lib/server/db/transactions';

	let { data, form } = $props();

	const transaction = $derived(data.transaction);
	let items = $state<TransactionItem[]>([]);
	let noteDraft = $state('');
	let editing = $state(false);
	let saving = $state(false);

	$effect(() => {
		items = data.items.map((item) => ({ ...item }));
		noteDraft = data.transaction.note ?? '';
	});

	const itemsTotal = $derived(items.reduce((sum, item) => sum + item.price * item.qty, 0));
	const diff = $derived(transaction.amount - itemsTotal);

	function addItem() {
		items = [...items, { name: '', qty: 1, price: 0 }];
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function updateItem(index: number, key: keyof TransactionItem, value: string) {
		const next = [...items];
		const target = { ...next[index] };
		if (key === 'name') {
			target.name = value;
		} else {
			const num = Number(value.replace(/[^\d]/g, ''));
			target[key] = Number.isFinite(num) && num >= 0 ? num : 0;
		}
		next[index] = target;
		items = next;
	}

	function cancelEdit() {
		items = data.items.map((item) => ({ ...item }));
		noteDraft = transaction.note ?? '';
		editing = false;
	}

	const dateNice = $derived(
		new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(transaction.occurredAt))
	);

	const timeNice = $derived(
		new Intl.DateTimeFormat('id-ID', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(transaction.occurredAt))
	);

	const receiptId = $derived(`#${transaction.id.slice(0, 8).toUpperCase()}`);
</script>

<svelte:head>
	<title>{transaction.title} - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 pt-3 pb-24 sm:px-6">
	<a
		href={resolve('/transactions')}
		class="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#10231d] shadow-sm transition active:scale-[0.98]"
	>
		<ArrowLeft size={13} aria-hidden="true" />
		Kembali
	</a>

	<FlashMessage {form} />

	<section
		class="receipt relative overflow-hidden rounded-[20px] border border-emerald-900/10 bg-white text-[#10231d] shadow-[0_24px_55px_rgba(16,35,29,0.10)]"
	>
		<div
			class="flex items-center justify-between gap-2 border-b border-dashed border-emerald-900/15 px-4 py-3"
		>
			<div class="flex items-center gap-2">
				<span
					class={[
						'flex size-9 items-center justify-center rounded-full',
						transaction.type === 'expense'
							? 'bg-rose-100 text-rose-600'
							: 'bg-emerald-100 text-emerald-700'
					]}
				>
					{#if transaction.type === 'expense'}
						<ArrowUpRight size={16} aria-hidden="true" />
					{:else}
						<ArrowDownLeft size={16} aria-hidden="true" />
					{/if}
				</span>
				<div>
					<p class="text-[10px] font-bold tracking-[0.2em] text-emerald-700/70 uppercase">
						Nota {transaction.type === 'expense' ? 'pengeluaran' : 'pemasukan'}
					</p>
					<p class="font-mono text-[10px] text-slate-400">{receiptId}</p>
				</div>
			</div>
			<Sparkles size={14} class="text-amber-400" aria-hidden="true" />
		</div>

		<div class="px-4 pt-4 pb-2 text-center">
			<p class="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
				{transaction.category}
			</p>
			<h1 class="mt-1 text-xl font-bold">{transaction.title}</h1>
			{#if transaction.merchant}
				<p class="mt-0.5 text-xs text-slate-500">{transaction.merchant}</p>
			{/if}
			<p class="mt-1 text-[11px] text-slate-400">
				{dateNice} · {timeNice}
			</p>
		</div>

		<div class="px-4 py-2">
			<div
				class="rounded-2xl border border-dashed border-emerald-900/15 bg-emerald-50/40 px-3 py-2.5"
			>
				<div class="flex items-center justify-between">
					<p class="text-[10px] font-bold tracking-wider text-emerald-700/80 uppercase">
						Total transaksi
					</p>
					<p
						class={[
							'text-xl font-bold',
							transaction.type === 'expense' ? 'text-rose-700' : 'text-emerald-700'
						]}
					>
						{transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
					</p>
				</div>
			</div>
		</div>

		<div class="border-t border-dashed border-emerald-900/15 px-4 py-3">
			<div class="flex items-center justify-between">
				<h2 class="text-xs font-bold tracking-wider text-slate-500 uppercase">Item dibeli</h2>
				{#if !editing}
					<button
						type="button"
						onclick={() => (editing = true)}
						class="inline-flex items-center gap-1 rounded-full bg-[#10231d] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm active:scale-[0.97]"
					>
						<Pencil size={10} aria-hidden="true" />
						{items.length ? 'Ubah' : 'Tambah item'}
					</button>
				{/if}
			</div>

			{#if !editing}
				{#if items.length}
					<div class="mt-3 space-y-1.5 font-mono text-[12.5px] text-[#10231d]">
						{#each items as item, i (i)}
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<p class="truncate font-semibold">{item.name}</p>
									<p class="text-[10px] text-slate-500">
										{item.qty} × {formatCurrency(item.price)}
									</p>
								</div>
								<p class="shrink-0 font-bold">
									{formatCurrency(item.qty * item.price)}
								</p>
							</div>
						{/each}
					</div>
					<div
						class="mt-3 flex items-center justify-between border-t border-dashed border-emerald-900/15 pt-2 font-mono text-[12px]"
					>
						<span class="font-semibold text-slate-600">Subtotal item</span>
						<span class="font-bold">{formatCurrency(itemsTotal)}</span>
					</div>
					{#if diff !== 0}
						<div class="mt-1 flex items-center justify-between font-mono text-[11px]">
							<span class="text-slate-500">Selisih</span>
							<span class={diff < 0 ? 'text-amber-700' : 'text-slate-600'}>
								{diff < 0 ? '−' : ''}{formatCurrency(Math.abs(diff))}
							</span>
						</div>
					{/if}
				{:else}
					<p class="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-500">
						Belum ada rincian item. Klik "Tambah item" buat catat barang yang dibeli.
					</p>
				{/if}
			{:else}
				<form
					method="POST"
					action="?/saveItems"
					class="mt-3 space-y-2"
					use:enhance={() => {
						saving = true;
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success('Detail tersimpan.');
								await invalidate('app:transactions');
								editing = false;
							} else if (result.type === 'failure') {
								const data = result.data as Record<string, unknown> | undefined;
								toast.error(typeof data?.message === 'string' ? data.message : 'Gagal menyimpan.');
							} else if (result.type === 'error') {
								toast.error(result.error?.message ?? 'Gagal menyimpan.');
							}
							saving = false;
						};
					}}
				>
					<input type="hidden" name="items" value={JSON.stringify(items)} />
					<input type="hidden" name="note" value={noteDraft} />

					<div class="space-y-2">
						{#each items as item, i (i)}
							<div class="grid grid-cols-[1fr_56px_90px_28px] gap-1.5">
								<input
									type="text"
									placeholder="Nama item"
									value={item.name}
									oninput={(event) => updateItem(i, 'name', event.currentTarget.value)}
									class="min-h-9 rounded-lg border border-emerald-900/10 bg-white px-2 text-xs outline-none focus:border-emerald-500"
								/>
								<input
									type="text"
									inputmode="numeric"
									placeholder="Qty"
									value={item.qty}
									oninput={(event) => updateItem(i, 'qty', event.currentTarget.value)}
									class="min-h-9 rounded-lg border border-emerald-900/10 bg-white px-2 text-center text-xs outline-none focus:border-emerald-500"
								/>
								<input
									type="text"
									inputmode="numeric"
									placeholder="Harga"
									value={item.price}
									oninput={(event) => updateItem(i, 'price', event.currentTarget.value)}
									class="min-h-9 rounded-lg border border-emerald-900/10 bg-white px-2 text-right text-xs outline-none focus:border-emerald-500"
								/>
								<button
									type="button"
									onclick={() => removeItem(i)}
									class="inline-flex size-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 active:scale-95"
									aria-label="Hapus item"
								>
									<X size={13} aria-hidden="true" />
								</button>
							</div>
						{/each}

						<button
							type="button"
							onclick={addItem}
							class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-emerald-900/15 bg-white py-2 text-[11px] font-semibold text-emerald-700 transition active:scale-[0.98]"
						>
							<Plus size={13} aria-hidden="true" />
							Tambah item
						</button>
					</div>

					<div>
						<label for="note" class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
							Catatan
						</label>
						<textarea
							id="note"
							rows="2"
							bind:value={noteDraft}
							placeholder="Catatan tambahan..."
							class="mt-1 w-full rounded-lg border border-emerald-900/10 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
						></textarea>
					</div>

					<div class="flex gap-1.5">
						<button
							type="button"
							onclick={cancelEdit}
							disabled={saving}
							class="flex-1 rounded-lg border border-emerald-900/10 bg-white py-2 text-[11px] font-bold text-slate-600 active:scale-[0.98] disabled:opacity-60"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={saving}
							class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#10231d] py-2 text-[11px] font-bold text-white active:scale-[0.98] disabled:opacity-60"
						>
							{#if saving}
								<Loader2 size={13} class="animate-spin" aria-hidden="true" />
							{:else}
								<Save size={13} aria-hidden="true" />
							{/if}
							Simpan
						</button>
					</div>
				</form>
			{/if}
		</div>

		{#if !editing && transaction.note}
			<div class="border-t border-dashed border-emerald-900/15 px-4 py-3">
				<div class="flex items-center justify-between gap-2">
					<p class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Catatan</p>
					<form
						method="POST"
						action="?/deleteNote"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									toast.success('Catatan dihapus.');
									await invalidate('app:transactions');
								} else if (result.type === 'failure' || result.type === 'error') {
									toast.error('Gagal menghapus catatan.');
								}
							};
						}}
					>
						<button
							type="submit"
							class="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 transition active:scale-[0.97]"
							aria-label="Hapus catatan"
						>
							<X size={10} aria-hidden="true" />
							Hapus
						</button>
					</form>
				</div>
				<p class="mt-1 text-xs whitespace-pre-wrap text-slate-700">{transaction.note}</p>
			</div>
		{/if}

		{#if !editing && transaction.sourceText}
			<div class="border-t border-dashed border-emerald-900/15 px-4 py-3">
				<p class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Input asli</p>
				<p class="mt-1 font-mono text-[11px] text-slate-500">"{transaction.sourceText}"</p>
			</div>
		{/if}

		<div
			class="flex items-center justify-between border-t border-dashed border-emerald-900/15 px-4 py-3"
		>
			<p class="text-[10px] text-slate-400">~ Terima kasih ~</p>
			<p class="font-mono text-[10px] text-slate-400">Money Tracker</p>
		</div>

		<div
			class="receipt-edge receipt-edge-top pointer-events-none absolute top-0 right-0 left-0 h-3"
		></div>
		<div
			class="receipt-edge receipt-edge-bottom pointer-events-none absolute right-0 bottom-0 left-0 h-3"
		></div>
	</section>

	{#if !editing}
		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'redirect') {
						toast.success('Transaksi dihapus.');
					} else if (result.type === 'failure' || result.type === 'error') {
						toast.error('Gagal menghapus.');
					}
				};
			}}
		>
			<button
				type="submit"
				class="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-rose-100 bg-white py-2.5 text-xs font-bold text-rose-600 shadow-sm transition active:scale-[0.98]"
			>
				<Trash2 size={13} aria-hidden="true" />
				Hapus transaksi
			</button>
		</form>
	{/if}
</main>

<style>
	.receipt-edge {
		background: radial-gradient(circle at 6px 0, transparent 5px, white 5.5px) repeat-x;
		background-size: 12px 12px;
	}
	.receipt-edge-top {
		transform: scaleY(-1);
		background-position: 0 -6px;
	}
	.receipt-edge-bottom {
		background-position: 0 6px;
	}
</style>
