<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowUpRight, BadgeInfo, Brain, Loader2, Send, Sparkles, Wallet } from 'lucide-svelte';

	import { formatCurrency } from '$lib/shared/money';

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

	const answer = $derived(
		(form as Record<string, unknown> | null | undefined)?.answer as string | undefined
	);
	const answerRange = $derived(
		(form as Record<string, unknown> | null | undefined)?.rangeLabel as string | undefined
	);
	const answerCount = $derived(
		(form as Record<string, unknown> | null | undefined)?.transactionCount as number | undefined
	);

	function renderMarkdown(md: string) {
		const escape = (input: string) =>
			input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

		const blocks = md.split(/\n{2,}/);
		const html: string[] = [];
		for (const block of blocks) {
			const lines = block.split('\n').map((line) => line.trimEnd());
			if (!lines.length) continue;

			const isList = lines.every((line) => /^\s*[-*]\s+/.test(line));
			const isNumbered = lines.every((line) => /^\s*\d+\.\s+/.test(line));

			if (isList) {
				html.push(
					'<ul class="list-disc space-y-1 pl-5">' +
						lines
							.map(
								(line) => '<li>' + applyInline(escape(line.replace(/^\s*[-*]\s+/, ''))) + '</li>'
							)
							.join('') +
						'</ul>'
				);
				continue;
			}

			if (isNumbered) {
				html.push(
					'<ol class="list-decimal space-y-1 pl-5">' +
						lines
							.map(
								(line) => '<li>' + applyInline(escape(line.replace(/^\s*\d+\.\s+/, ''))) + '</li>'
							)
							.join('') +
						'</ol>'
				);
				continue;
			}

			if (lines[0].startsWith('## ')) {
				html.push(
					`<h3 class="text-sm font-bold text-[#10231d]">${applyInline(escape(lines[0].slice(3)))}</h3>`
				);
				continue;
			}

			if (lines[0].startsWith('# ')) {
				html.push(
					`<h2 class="text-base font-bold text-[#10231d]">${applyInline(escape(lines[0].slice(2)))}</h2>`
				);
				continue;
			}

			html.push('<p>' + applyInline(escape(lines.join(' '))) + '</p>');
		}
		return html.join('\n');
	}

	function applyInline(input: string) {
		return input
			.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[#10231d]">$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(
				/`([^`]+)`/g,
				'<code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">$1</code>'
			);
	}
</script>

<svelte:head>
	<title>Konsultasi AI - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pt-3 pb-24 sm:px-6">
	<header
		class="flex items-start gap-3 rounded-[20px] border border-emerald-900/10 bg-[#10231d] p-4 text-white shadow-[0_18px_45px_rgba(16,35,29,0.18)]"
	>
		<span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12">
			<Brain size={18} aria-hidden="true" />
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-[10px] font-bold tracking-[0.18em] text-emerald-100/80 uppercase">
				Konsultan AI
			</p>
			<h1 class="text-lg leading-tight font-bold">Tanya soal keuanganmu</h1>
			<p class="mt-1 text-[11px] text-emerald-100/85">
				Pilih rentang, tulis pertanyaan, dapat rekomendasi & proyeksi yang useful.
			</p>
		</div>
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

	{#if form?.message && form?.action === 'consult' && !answer}
		<div class="rounded-[20px] border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-900">
			{form.message}
		</div>
	{/if}

	{#if answer}
		<section
			class="rounded-[20px] border border-emerald-900/10 bg-white p-4 shadow-[0_18px_45px_rgba(16,35,29,0.10)]"
		>
			<div class="flex items-center gap-2">
				<span
					class="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700"
				>
					<Sparkles size={14} aria-hidden="true" />
				</span>
				<div>
					<p class="text-[10px] font-bold tracking-wider text-emerald-700/80 uppercase">Saran AI</p>
					<p class="text-[11px] text-slate-500">
						{answerRange ?? ''}
						{#if typeof answerCount === 'number'}
							· {answerCount} transaksi
						{/if}
					</p>
				</div>
			</div>
			<article class="prose prose-sm mt-3 max-w-none space-y-2 text-sm leading-6 text-slate-700">
				{@html renderMarkdown(answer)}
			</article>
			<div class="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
				<ArrowUpRight size={11} aria-hidden="true" />
				Saran AI, tetap pakai akal sehatmu.
			</div>
		</section>
	{/if}
</main>
