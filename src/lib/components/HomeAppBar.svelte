<script lang="ts">
	import { goto } from '$app/navigation';
	import { Sparkles, TrendingDown, TrendingUp, UserRound } from 'lucide-svelte';

	import { formatCurrency } from '$lib/shared/money';

	type Summary = {
		monthlyExpense: number;
		monthlyIncome: number;
		monthlyBalance: number;
	};

	let {
		hasDeepSeekKey = false,
		summary = { monthlyExpense: 0, monthlyIncome: 0, monthlyBalance: 0 },
		monthLabel = '',
		userName = null
	}: {
		hasDeepSeekKey?: boolean;
		summary?: Summary;
		monthLabel?: string;
		monthlyTransactionCount?: number;
		userName?: string | null;
	} = $props();

	const now = new Date();
	const hour = now.getHours();
	const greeting =
		hour < 11
			? 'Selamat pagi'
			: hour < 15
				? 'Selamat siang'
				: hour < 18
					? 'Selamat sore'
					: 'Selamat malam';
	const dateLabel = new Intl.DateTimeFormat('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	}).format(now);
</script>

<header
	class="sticky z-20 -mx-4 bg-gradient-to-b from-[#eef5ee] via-[#eef5ee]/90 to-transparent px-4 pt-2 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
	style="top: env(safe-area-inset-top);"
>
	<div
		class="rounded-[24px] border border-emerald-900/10 bg-white/85 px-4 py-3 shadow-[0_22px_55px_rgba(16,35,29,0.08)] backdrop-blur-xl sm:px-5"
	>
		<div class="flex items-center justify-between gap-3">
			<div class="min-w-0">
				<p class="text-[11px] font-semibold tracking-wider text-emerald-700/80 uppercase">
					{greeting}{userName ? `, ${userName}` : ''}
				</p>
				<p class="truncate text-base font-bold text-[#10231d]">{dateLabel}</p>
			</div>

			<div class="flex shrink-0 items-center gap-2">
				<span
					class={[
						'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
						hasDeepSeekKey
							? 'border-emerald-200 bg-emerald-50 text-emerald-700'
							: 'border-amber-200 bg-amber-50 text-amber-700'
					]}
				>
					<Sparkles size={11} aria-hidden="true" />
					AI {hasDeepSeekKey ? 'aktif' : 'mati'}
				</span>
				<button
					aria-label="Profil"
					class="inline-flex size-10 items-center justify-center rounded-full border border-emerald-900/10 bg-white text-[#10231d] shadow-sm transition active:scale-[0.96]"
					onclick={() => goto('/profile')}
				>
					<UserRound size={17} aria-hidden="true" />
				</button>
			</div>
		</div>

		{#if monthLabel}
			<p class="mt-3 text-[10px] font-semibold tracking-[0.18em] text-emerald-700/70 uppercase">
				Ringkasan {monthLabel}
			</p>
		{/if}

		<div class="mt-1.5 grid w-full grid-cols-2 gap-2">
			<a
				href="/transactions?type=income"
				class="flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 transition active:scale-[0.99]"
			>
				<span
					class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
				>
					<TrendingUp size={16} aria-hidden="true" />
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-[10px] font-semibold tracking-wide text-emerald-700/80 uppercase">
						Pemasukan
					</p>
					<p class="truncate text-base font-bold text-emerald-900">
						{formatCurrency(summary.monthlyIncome)}
					</p>
				</div>
			</a>
			<a
				href="/transactions?type=expense"
				class="flex items-center gap-2.5 rounded-2xl border border-rose-100 bg-rose-50/70 px-3 py-2.5 transition active:scale-[0.99]"
			>
				<span
					class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm"
				>
					<TrendingDown size={16} aria-hidden="true" />
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-[10px] font-semibold tracking-wide text-rose-700/80 uppercase">
						Pengeluaran
					</p>
					<p class="truncate text-base font-bold text-rose-900">
						{formatCurrency(summary.monthlyExpense)}
					</p>
				</div>
			</a>
		</div>
	</div>
</header>
