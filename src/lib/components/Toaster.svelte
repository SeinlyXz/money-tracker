<script lang="ts">
	import { CheckCircle2, Info, X, XCircle } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';

	import { toast, type ToastType } from '$lib/state/toast.svelte';

	const iconMap = {
		success: CheckCircle2,
		error: XCircle,
		info: Info
	} as const;

	const toneMap: Record<ToastType, string> = {
		success: 'border-emerald-200 bg-white text-[#10231d]',
		error: 'border-rose-200 bg-white text-[#10231d]',
		info: 'border-slate-200 bg-white text-[#10231d]'
	};

	const accentMap: Record<ToastType, string> = {
		success: 'text-emerald-600',
		error: 'text-rose-600',
		info: 'text-slate-500'
	};
</script>

<div
	class="pointer-events-none fixed top-4 right-4 left-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:max-w-sm"
	aria-live="polite"
	aria-atomic="true"
>
	{#each toast.items as t (t.id)}
		{@const Icon = iconMap[t.type]}
		<div
			in:fly={{ x: 32, duration: 240 }}
			out:fly={{ x: 32, duration: 200 }}
			animate:flip={{ duration: 220 }}
			class={[
				'pointer-events-auto flex w-full items-start gap-3 rounded-[12px] border px-4 py-3 shadow-[0_18px_45px_rgba(16,35,29,0.18)] backdrop-blur-md',
				toneMap[t.type]
			]}
			role={t.type === 'error' ? 'alert' : 'status'}
		>
			<span class={['mt-0.5 shrink-0', accentMap[t.type]]}>
				<Icon size={18} aria-hidden="true" />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-sm leading-snug font-bold">{t.message}</p>
				{#if t.description}
					<p class="mt-0.5 text-xs leading-snug text-slate-500">{t.description}</p>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => toast.dismiss(t.id)}
				aria-label="Tutup notifikasi"
				class="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
			>
				<X size={14} aria-hidden="true" />
			</button>
		</div>
	{/each}
</div>
