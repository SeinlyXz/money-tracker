<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Sparkles, Trash2 } from 'lucide-svelte';

	import { renderMarkdown } from '$lib/shared/markdown';
	import { toast } from '$lib/state/toast.svelte';

	let { data } = $props();

	let expanded = $state<Record<string, boolean>>({});
	let deletingIds = $state<Set<string>>(new Set());

	function setDeleting(id: string, value: boolean) {
		const next = new Set(deletingIds);
		if (value) next.add(id);
		else next.delete(id);
		deletingIds = next;
	}

	function toggle(id: string) {
		expanded = { ...expanded, [id]: !expanded[id] };
	}

	function formatDate(ts: number) {
		return new Intl.DateTimeFormat('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(ts));
	}
</script>

<svelte:head>
	<title>Riwayat AI - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pt-3 pb-24 sm:px-6">
	<a
		href={resolve('/consult')}
		class="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#10231d] shadow-sm transition active:scale-[0.98]"
	>
		<ArrowLeft size={13} aria-hidden="true" />
		Konsultasi
	</a>

	<header
		class="flex items-center gap-3 rounded-[20px] border border-emerald-900/10 bg-white/90 p-3 shadow-sm"
	>
		<span class="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
			<Sparkles size={17} aria-hidden="true" />
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-[10px] font-bold tracking-[0.18em] text-emerald-700/80 uppercase">
				Riwayat catatan AI
			</p>
			<h1 class="text-base font-bold text-[#10231d]">
				{data.notes.length} catatan tersimpan
			</h1>
		</div>
	</header>

	{#if !data.notes.length}
		<section
			class="rounded-[20px] border border-dashed border-emerald-900/15 bg-white/70 px-4 py-8 text-center"
		>
			<p class="text-sm font-semibold text-[#10231d]">Belum ada catatan AI</p>
			<p class="mt-1 text-xs text-slate-500">
				Simpan jawaban konsultasi di halaman Konsultasi untuk muncul di sini.
			</p>
			<a
				href={resolve('/consult')}
				class="mt-3 inline-flex items-center gap-1 rounded-full bg-[#10231d] px-3 py-1.5 text-[11px] font-bold text-white"
			>
				Mulai konsultasi
			</a>
		</section>
	{:else}
		<section class="space-y-2.5">
			{#each data.notes as note (note.id)}
				{@const isOpen = expanded[note.id]}
				{@const isDeleting = deletingIds.has(note.id)}
				<article
					class="overflow-hidden rounded-[20px] border border-emerald-900/10 bg-white/90 shadow-sm"
				>
					<button
						type="button"
						onclick={() => toggle(note.id)}
						class="flex w-full items-start gap-2 px-3 py-2.5 text-left transition active:bg-emerald-50/30"
					>
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-1.5">
								<span
									class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
								>
									{note.rangeLabel}
								</span>
								<span
									class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
								>
									{note.transactionCount} trx
								</span>
							</div>
							<p class="mt-1 text-sm font-semibold text-[#10231d]">
								{note.prompt || 'Konsultasi umum'}
							</p>
							<p class="mt-0.5 text-[10px] text-slate-500">{formatDate(note.createdAt)}</p>
						</div>
						<span class="mt-0.5 text-slate-400">
							{#if isOpen}
								<ChevronUp size={14} aria-hidden="true" />
							{:else}
								<ChevronDown size={14} aria-hidden="true" />
							{/if}
						</span>
					</button>

					{#if isOpen}
						<div class="border-t border-emerald-900/10 px-3 py-3">
							<article class="markdown space-y-2 text-sm">
								{@html renderMarkdown(note.answer)}
							</article>
							<form
								method="POST"
								action="?/delete"
								class="mt-3 flex justify-end"
								use:enhance={() => {
									setDeleting(note.id, true);
									return async ({ result }) => {
										if (result.type === 'success') {
											toast.success('Catatan dihapus.');
											await invalidate('app:consult-notes');
										} else if (result.type === 'failure' || result.type === 'error') {
											toast.error('Gagal menghapus.');
										}
										setDeleting(note.id, false);
									};
								}}
							>
								<input type="hidden" name="id" value={note.id} />
								<button
									type="submit"
									disabled={isDeleting}
									class="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 transition active:scale-[0.97] disabled:opacity-60"
								>
									{#if isDeleting}
										<Loader2 size={11} class="animate-spin" aria-hidden="true" />
									{:else}
										<Trash2 size={11} aria-hidden="true" />
									{/if}
									Hapus catatan
								</button>
							</form>
						</div>
					{/if}
				</article>
			{/each}
		</section>
	{/if}
</main>

<style>
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
