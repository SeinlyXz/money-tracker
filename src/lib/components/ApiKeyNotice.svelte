<script lang="ts">
	let { hasDeepSeekKey }: { hasDeepSeekKey: boolean } = $props();
</script>

{#if !hasDeepSeekKey}
	<section
		class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm"
	>
		Set `DEEPSEEK_API_KEY` di `.env` agar input cepat AI aktif. Form manual tetap bisa dipakai.
	</section>
{/if}
