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
	</div>
</header>
