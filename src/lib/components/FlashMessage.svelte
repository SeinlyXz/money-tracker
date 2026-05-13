<script lang="ts">
	let { form }: { form?: Record<string, unknown> | null } = $props();
</script>

{#if form?.message}
	<section
		class={[
			'rounded-[8px] border px-4 py-3 text-sm shadow-sm',
			form.action === 'delete'
				? 'border-slate-200 bg-white text-slate-800'
				: form.action === 'quickAdd' || form.action === 'manualAdd'
					? 'border-emerald-200 bg-emerald-50 text-emerald-950'
					: 'border-rose-300 bg-rose-50 text-rose-950'
		]}
	>
		{form.message}
	</section>
{/if}
