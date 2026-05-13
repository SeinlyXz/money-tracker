<script lang="ts">
	let {
		kicker = 'Personal finance',
		title,
		description,
		hasDeepSeekKey
	}: {
		kicker?: string;
		title: string;
		description?: string;
		hasDeepSeekKey?: boolean;
	} = $props();
</script>

<header class="pb-2">
	<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
		<div>
			<p class="text-xs font-bold tracking-[0.14em] text-emerald-700 uppercase">{kicker}</p>
			<h1 class="mt-2 text-3xl font-bold tracking-normal text-[#10231d] sm:text-4xl">
				{title}
			</h1>
			{#if description}
				<p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
			{/if}
		</div>

		{#if hasDeepSeekKey !== undefined}
			<div class="grid grid-cols-2 gap-2 text-sm sm:flex">
				<div class="rounded-[8px] border border-emerald-900/10 bg-white/85 px-3 py-2 shadow-sm">
					<p class="text-slate-500">SQLite</p>
					<p class="font-semibold text-[#10231d]">Local</p>
				</div>
				<div class="rounded-[8px] border border-emerald-900/10 bg-white/85 px-3 py-2 shadow-sm">
					<p class="text-slate-500">DeepSeek</p>
					<p class="font-semibold text-[#10231d]">{hasDeepSeekKey ? 'Aktif' : 'Butuh API key'}</p>
				</div>
			</div>
		{/if}
	</div>
</header>
