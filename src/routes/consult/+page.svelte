<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import {
		ArrowUpRight,
		BadgeInfo,
		Bookmark,
		Brain,
		History,
		Loader2,
		Send,
		Sparkles,
		Wallet
	} from 'lucide-svelte';

	import { formatCurrency } from '$lib/shared/money';
	import { renderMarkdown } from '$lib/shared/markdown';
	import { toast } from '$lib/state/toast.svelte';

	let { data, form } = $props();

	const ranges = [
		{ value: 'week', label: '7 hari' },
		{ value: 'month', label: '30 hari' },
		{ value: 'quarter', label: '3 bulan' },
		{ value: 'year', label: '1 tahun' },
		{ value: 'all', label: 'Semua' }
	] as const;

	const quickPrompts = [
		'Apa yang paling perlu dikurangi?',
		'Buat proyeksi keuangan 3 bulan ke depan.',
		'Bagaimana cara saya bisa nabung 20% dari pemasukan?',
		'Kategori mana yang boros banget dan tips menahannya?'
	];

	let range = $state<(typeof ranges)[number]['value']>('month');
	let prompt = $state('');
	let submitting = $state(false);
	let saving = $state(false);
	let savedIdLocal = $state<string | null>(null);

	const answer = $derived(
		(form as Record<string, unknown> | null | undefined)?.answer as string | undefined
	);
	const answerRange = $derived(
		(form as Record<string, unknown> | null | undefined)?.rangeLabel as string | undefined
	);
	const answerCount = $derived(
		(form as Record<string, unknown> | null | undefined)?.transactionCount as number | undefined
	);
	const answerRangeKey = $derived(
		(form as Record<string, unknown> | null | undefined)?.range as string | undefined
	);
	const answerPrompt = $derived(
		(form as Record<string, unknown> | null | undefined)?.prompt as string | undefined
	);
	const savedNoteId = $derived(
		(form as Record<string, unknown> | null | undefined)?.savedNoteId as string | undefined
	);
	const isSaved = $derived(Boolean(savedNoteId) || Boolean(savedIdLocal));
</script>

<svelte:head>
	<title>Konsultasi AI - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pt-3 pb-24 sm:px-6">
	<header
		class="relative flex items-start gap-3 rounded-[20px] border border-emerald-900/10 bg-[#10231d] p-4 text-white shadow-[0_18px_45px_rgba(16,35,29,0.18)]"
	>
		<span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12">
			<Brain size={18} aria-hidden="true" />
		</span>
		<div class="min-w-0 flex-1 pr-12">
			<p class="text-[10px] font-bold tracking-[0.18em] text-emerald-100/80 uppercase">
				Konsultan AI
			</p>
			<h1 class="text-lg leading-tight font-bold">Tanya soal keuanganmu</h1>
			<p class="mt-1 text-[11px] text-emerald-100/85">
				Pilih rentang, tulis pertanyaan, dapat rekomendasi & proyeksi yang useful.
			</p>
		</div>
		<a
			href={resolve('/consult/history')}
			class="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold text-white transition active:scale-[0.95]"
			aria-label="Riwayat catatan AI"
		>
			<History size={11} aria-hidden="true" />
			Riwayat
		</a>
	</header>

	{#if !data.hasDeepSeekKey}
		<div
			class="flex items-center gap-2 rounded-[20px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-900"
		>
			<BadgeInfo size={15} aria-hidden="true" />
			<p class="text-[11px]">
				<b>DEEPSEEK_API_KEY</b> belum diisi. Set di file <code>.env</code> dulu.
			</p>
		</div>
	{/if}

	<section class="rounded-[20px] border border-emerald-900/10 bg-white/90 p-3 shadow-sm">
		<form
			method="POST"
			action="?/consult"
			class="space-y-3"
			use:enhance={() => {
				submitting = true;
				savedIdLocal = null;
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<div>
				<p class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Rentang waktu</p>
				<div class="mt-2 grid grid-cols-5 gap-1.5">
					{#each ranges as item (item.value)}
						<label
							class={[
								'cursor-pointer rounded-xl border px-1 py-1.5 text-center text-[11px] font-semibold transition',
								range === item.value
									? 'border-[#10231d] bg-[#10231d] text-white'
									: 'border-emerald-900/10 bg-white text-slate-600 active:bg-slate-50'
							]}
						>
							<input
								type="radio"
								name="range"
								value={item.value}
								bind:group={range}
								class="sr-only"
							/>
							{item.label}
						</label>
					{/each}
				</div>
			</div>

			<div>
				<label for="prompt" class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
					Pertanyaan
				</label>
				<textarea
					id="prompt"
					name="prompt"
					rows="3"
					bind:value={prompt}
					placeholder="Contoh: aku boros di mana? kasih plan hemat dong."
					class="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
				></textarea>
				<div class="mt-1.5 flex flex-wrap gap-1.5">
					{#each quickPrompts as qp (qp)}
						<button
							type="button"
							onclick={() => (prompt = qp)}
							class="rounded-full border border-emerald-900/10 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition active:bg-slate-50"
						>
							{qp}
						</button>
					{/each}
				</div>
			</div>

			<button
				type="submit"
				disabled={submitting || !data.hasDeepSeekKey}
				class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#10231d] py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if submitting}
					<Loader2 size={15} class="animate-spin" aria-hidden="true" />
					Memproses...
				{:else}
					<Send size={15} aria-hidden="true" />
					Konsultasikan
				{/if}
			</button>
		</form>
	</section>

	<section class="rounded-[20px] border border-emerald-900/10 bg-white/90 p-3 shadow-sm">
		<div class="flex items-center justify-between">
			<h2 class="flex items-center gap-1.5 text-sm font-bold text-[#10231d]">
				<Wallet size={14} class="text-emerald-700" aria-hidden="true" />
				Ringkasan ({data.preview.rangeLabel})
			</h2>
			<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
				{data.preview.transactionCount} trx
			</span>
		</div>
		<div class="mt-2 grid grid-cols-2 gap-2">
			<div class="rounded-xl bg-rose-50 px-2.5 py-2">
				<p class="text-[10px] font-semibold text-rose-700/80">Pengeluaran</p>
				<p class="text-sm font-bold text-rose-800">
					{formatCurrency(data.preview.summary.totalExpense)}
				</p>
			</div>
			<div class="rounded-xl bg-emerald-50 px-2.5 py-2">
				<p class="text-[10px] font-semibold text-emerald-700/80">Pemasukan</p>
				<p class="text-sm font-bold text-emerald-800">
					{formatCurrency(data.preview.summary.totalIncome)}
				</p>
			</div>
		</div>
		{#if data.preview.summary.byCategory.length}
			<div class="mt-2 space-y-1.5">
				{#each data.preview.summary.byCategory.slice(0, 4) as cat (cat.category)}
					<div class="flex items-center justify-between text-[11px]">
						<span class="font-semibold text-slate-700">{cat.category}</span>
						<span class="font-bold text-[#10231d]">{formatCurrency(cat.total)}</span>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	{#if submitting}
		<section
			class="rounded-[20px] border border-emerald-900/10 bg-white p-4 shadow-[0_18px_45px_rgba(16,35,29,0.10)]"
		>
			<div class="flex items-center gap-2">
				<span class="flex size-8 items-center justify-center rounded-full bg-amber-100">
					<Sparkles size={14} class="text-amber-700" aria-hidden="true" />
				</span>
				<div class="flex-1 space-y-1.5">
					<div class="skeleton h-2.5 w-24 rounded"></div>
					<div class="skeleton h-2 w-40 rounded"></div>
				</div>
			</div>
			<div class="mt-4 space-y-3">
				<div class="skeleton h-3 w-32 rounded"></div>
				<div class="space-y-1.5">
					<div class="skeleton h-2.5 w-full rounded"></div>
					<div class="skeleton h-2.5 w-11/12 rounded"></div>
					<div class="skeleton h-2.5 w-9/12 rounded"></div>
				</div>
				<div class="skeleton h-3 w-28 rounded"></div>
				<div class="space-y-1.5">
					<div class="skeleton h-2.5 w-full rounded"></div>
					<div class="skeleton h-2.5 w-10/12 rounded"></div>
					<div class="skeleton h-2.5 w-8/12 rounded"></div>
				</div>
				<div class="skeleton h-3 w-32 rounded"></div>
				<div class="space-y-1.5">
					<div class="skeleton h-2.5 w-full rounded"></div>
					<div class="skeleton h-2.5 w-9/12 rounded"></div>
				</div>
			</div>
			<p class="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
				<Loader2 size={11} class="animate-spin" aria-hidden="true" />
				AI sedang menganalisis pola keuanganmu...
			</p>
		</section>
	{/if}

	{#if !submitting && form?.message && form?.action === 'consult' && !answer}
		<div class="rounded-[20px] border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-900">
			{form.message}
		</div>
	{/if}

	{#if !submitting && answer}
		<section
			class="rounded-[20px] border border-emerald-900/10 bg-white p-4 shadow-[0_18px_45px_rgba(16,35,29,0.10)]"
		>
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-2">
					<span
						class="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700"
					>
						<Sparkles size={14} aria-hidden="true" />
					</span>
					<div>
						<p class="text-[10px] font-bold tracking-wider text-emerald-700/80 uppercase">
							Saran AI
						</p>
						<p class="text-[11px] text-slate-500">
							{answerRange ?? ''}
							{#if typeof answerCount === 'number'}
								· {answerCount} transaksi
							{/if}
						</p>
					</div>
				</div>

				{#if !isSaved}
					<form
						method="POST"
						action="?/saveNote"
						use:enhance={() => {
							saving = true;
							return async ({ result, update }) => {
								if (result.type === 'success') {
									const data = result.data as Record<string, unknown> | undefined;
									savedIdLocal = (data?.savedNoteId as string | undefined) ?? 'saved';
									toast.success('Catatan AI disimpan.');
								} else if (result.type === 'failure') {
									const data = result.data as Record<string, unknown> | undefined;
									toast.error(
										typeof data?.message === 'string' ? data.message : 'Gagal menyimpan.'
									);
								} else if (result.type === 'error') {
									toast.error(result.error?.message ?? 'Gagal menyimpan.');
								}
								await update({ reset: false });
								saving = false;
							};
						}}
					>
						<input type="hidden" name="answer" value={answer} />
						<input type="hidden" name="prompt" value={answerPrompt ?? ''} />
						<input type="hidden" name="range" value={answerRangeKey ?? range} />
						<input type="hidden" name="rangeLabel" value={answerRange ?? ''} />
						<input type="hidden" name="transactionCount" value={String(answerCount ?? 0)} />
						<button
							type="submit"
							disabled={saving}
							class="inline-flex items-center gap-1 rounded-full bg-[#10231d] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm transition active:scale-[0.97] disabled:opacity-60"
						>
							{#if saving}
								<Loader2 size={11} class="animate-spin" aria-hidden="true" />
							{:else}
								<Bookmark size={11} aria-hidden="true" />
							{/if}
							Simpan
						</button>
					</form>
				{:else}
					<a
						href={resolve('/consult/history')}
						class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 transition active:scale-[0.97]"
					>
						<Bookmark size={11} aria-hidden="true" />
						Tersimpan
					</a>
				{/if}
			</div>

			<article class="markdown mt-3 space-y-2 text-sm">
				{@html renderMarkdown(answer)}
			</article>
			<div class="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
				<ArrowUpRight size={11} aria-hidden="true" />
				Saran AI, tetap pakai akal sehatmu.
			</div>
		</section>
	{/if}
</main>

<style>
	.skeleton {
		background: linear-gradient(90deg, #eef2ee 0%, #f6faf6 50%, #eef2ee 100%);
		background-size: 200% 100%;
		animation: shimmer 1.4s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	:global(.markdown h2),
	:global(.markdown h3),
	:global(.markdown h4) {
		margin-top: 0.85rem;
	}

	:global(.markdown ul li),
	:global(.markdown ol li) {
		margin-bottom: 0.1rem;
	}
</style>
