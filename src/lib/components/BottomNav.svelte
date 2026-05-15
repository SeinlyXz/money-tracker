<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		ChartNoAxesColumnIncreasing,
		CirclePlus,
		Home,
		ReceiptText,
		UserRound
	} from 'lucide-svelte';

	const items = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/add', label: 'Tambah', icon: CirclePlus },
		{ href: '/transactions', label: 'Transaksi', icon: ReceiptText },
		{ href: '/insights', label: 'Insight', icon: ChartNoAxesColumnIncreasing },
		{ href: '/profile', label: 'Profil', icon: UserRound }
	] as const;

	const isActive = (href: (typeof items)[number]['href']) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);

	const activeIndex = $derived(
		Math.max(
			0,
			items.findIndex((item) => isActive(item.href))
		)
	);

	const showLabels = $derived(page.data.showNavLabels !== false);
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-r border-l border-emerald-900/10 bg-white/95 shadow-[0_-8px_24px_rgba(16,35,29,0.08)] backdrop-blur-xl"
	style="padding-bottom: env(safe-area-inset-bottom);"
	aria-label="Navigasi utama"
>
	<div class="relative mx-auto grid max-w-md grid-cols-5 px-3 py-2">
		<span
			class="pointer-events-none absolute top-2 size-10 rounded-full bg-[#10231d] transition-[left] duration-300 ease-out"
			style="left: calc(0.75rem + {activeIndex} * ((100% - 1.5rem) / 5) + ((100% - 1.5rem) / 10) - 1.25rem);"
		></span>
		{#each items as item (item.href)}
			{@const Icon = item.icon}
			{@const active = isActive(item.href)}
			<a
				href={resolve(item.href)}
				aria-current={active ? 'page' : undefined}
				class="relative z-10 flex flex-col items-center gap-0.5"
			>
				<span
					class={[
						'flex size-10 items-center justify-center transition-colors duration-200',
						active ? 'text-white' : 'text-neutral-400'
					]}
				>
					<Icon size={19} strokeWidth={2} aria-hidden="true" />
				</span>
				<span
					class={[
						'overflow-hidden text-[10px] font-semibold transition-[max-height,opacity,margin] duration-300 ease-out',
						active ? 'text-[#10231d]' : 'text-neutral-400',
						showLabels ? 'mt-0 max-h-4 opacity-100' : '-mt-0.5 max-h-0 opacity-0'
					]}
					aria-hidden={!showLabels}
				>
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>
