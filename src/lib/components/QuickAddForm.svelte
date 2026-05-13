<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { SendHorizontal } from 'lucide-svelte';

	import { toast } from '$lib/state/toast.svelte';

	let quickPrompt = $state('');
	let pending = $state(false);
</script>

<form
	method="POST"
	action="?/quickAdd"
	class="flex flex-col gap-2 rounded-[28px] border border-emerald-900/10 bg-white/95 px-3 py-3 shadow-[0_18px_45px_rgba(16,35,29,0.08)] sm:px-4"
	use:enhance={({ cancel }) => {
		const promptText = quickPrompt.trim();
		if (!promptText) {
			cancel();
			return;
		}
		pending = true;

		return async ({ result }) => {
			pending = false;
			if (result.type === 'success') {
				const data = result.data as Record<string, unknown> | undefined;
				const message = typeof data?.message === 'string' ? data.message : 'Tersimpan';
				toast.success(message);
				quickPrompt = '';
				await invalidate('app:transactions');
			} else if (result.type === 'failure') {
				const data = result.data as Record<string, unknown> | undefined;
				const message = typeof data?.message === 'string' ? data.message : 'Gagal memproses.';
				toast.error(message);
			} else if (result.type === 'error') {
				toast.error(result.error?.message ?? 'Terjadi kesalahan.');
			}
		};
	}}
>
	<div class="flex items-center gap-2">
		<input
			id="prompt"
			name="prompt"
			bind:value={quickPrompt}
			placeholder="contoh: nasi padang 35k siang ini"
			autocomplete="off"
			disabled={pending}
			class="min-h-11 flex-1 rounded-[20px] border border-emerald-900/10 bg-[#f7fbf7] px-4 text-sm text-[#10231d] transition outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 disabled:opacity-60"
		/>
		<button
			type="submit"
			disabled={pending || !quickPrompt.trim()}
			aria-label="Kirim"
			class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-emerald-700/50"
		>
			{#if pending}
				<span class="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
				></span>
			{:else}
				<SendHorizontal size={17} aria-hidden="true" />
			{/if}
		</button>
	</div>
</form>
