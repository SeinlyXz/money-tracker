<script lang="ts">
	import { Pencil, PlusCircle, Sparkles, Zap } from 'lucide-svelte';

	import FlashMessage from '$lib/components/FlashMessage.svelte';
	import ManualTransactionForm from '$lib/components/ManualTransactionForm.svelte';
	import QuickAddForm from '$lib/components/QuickAddForm.svelte';

	let { data, form } = $props();

	let mode = $state<'quick' | 'manual'>('quick');

	$effect(() => {
		if (!data.hasDeepSeekKey && mode === 'quick') {
			mode = 'manual';
		}
	});

	const tips = [
		'"nasi padang 35k siang ini"',
		'"gaji freelance 2.5jt kemarin"',
		'"beli ATK & sabun cuci 150rb"'
	];
</script>

<svelte:head>
	<title>Tambah - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pt-3 pb-24 sm:px-6">
	<header
		class="relative flex items-start gap-3 rounded-[20px] border border-emerald-900/10 bg-[#10231d] p-4 text-white shadow-[0_18px_45px_rgba(16,35,29,0.18)]"
	>
		<span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12">
			<PlusCircle size={18} aria-hidden="true" />
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-[10px] font-bold tracking-[0.18em] text-emerald-100/80 uppercase">
				Catat transaksi
			</p>
			<h1 class="text-lg leading-tight font-bold">Tambah baru</h1>
			<p class="mt-1 text-[11px] text-emerald-100/85">
				Pakai bahasa santai atau isi manual — pilih yang paling enak.
			</p>
		</div>
	</header>

	<FlashMessage {form} />

	<div
		class="grid grid-cols-2 gap-1 rounded-[16px] border border-emerald-900/10 bg-white/80 p-1 shadow-sm"
	>
		<button
			type="button"
			onclick={() => (mode = 'quick')}
			disabled={!data.hasDeepSeekKey}
			class={[
				'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[12px] px-3 text-xs font-bold transition active:scale-[0.98]',
				mode === 'quick'
					? 'bg-[#10231d] text-white shadow-sm'
					: 'text-slate-600 hover:bg-emerald-50/60 disabled:opacity-40 disabled:hover:bg-transparent'
			]}
		>
			<Zap size={13} aria-hidden="true" />
			Cepat
			<span
				class={[
					'rounded-full px-1.5 py-0.5 text-[9px] font-bold',
					mode === 'quick' ? 'bg-amber-200 text-[#10231d]' : 'bg-emerald-100 text-emerald-700'
				]}
			>
				AI
			</span>
		</button>
		<button
			type="button"
			onclick={() => (mode = 'manual')}
			class={[
				'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[12px] px-3 text-xs font-bold transition active:scale-[0.98]',
				mode === 'manual'
					? 'bg-[#10231d] text-white shadow-sm'
					: 'text-slate-600 hover:bg-emerald-50/60'
			]}
		>
			<Pencil size={13} aria-hidden="true" />
			Manual
		</button>
	</div>

	{#if mode === 'quick'}
		<section class="flex flex-col gap-2">
			{#if data.hasDeepSeekKey}
				<QuickAddForm />
				<div
					class="flex items-start gap-2 rounded-[16px] border border-amber-200/60 bg-amber-50/70 px-3.5 py-2.5"
				>
					<Sparkles size={13} class="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
					<div class="min-w-0 flex-1">
						<p class="text-[10px] font-bold tracking-[0.16em] text-amber-800 uppercase">
							Contoh prompt
						</p>
						<ul class="mt-1 space-y-0.5 text-[11px] text-amber-900/90">
							{#each tips as tip (tip)}
								<li>• {tip}</li>
							{/each}
						</ul>
					</div>
				</div>
			{:else}
				<div
					class="rounded-[20px] border border-dashed border-amber-300/70 bg-amber-50/60 px-4 py-5 text-center"
				>
					<p class="text-sm font-bold text-amber-900">DeepSeek belum diset</p>
					<p class="mt-1 text-[11px] text-amber-800/80">
						Tambahkan <code class="rounded bg-amber-100 px-1 py-0.5 text-[10px]">DEEPSEEK_API_KEY</code> di .env untuk pakai mode cepat.
					</p>
				</div>
			{/if}
		</section>
	{:else}
		<ManualTransactionForm today={data.today} />
	{/if}
</main>
