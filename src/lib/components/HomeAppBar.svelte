<script lang="ts">
	import { goto } from '$app/navigation';
	import { Sparkles, TrendingDown, TrendingUp, UserRound, Wallet } from 'lucide-svelte';

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
		monthlyTransactionCount = 0
	}: {
		hasDeepSeekKey?: boolean;
		summary?: Summary;
		monthLabel?: string;
		monthlyTransactionCount?: number;
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

	const balancePositive = $derived(summary.monthlyBalance >= 0);
</script>

<header
	class="sticky top-0 z-20 -mx-4 bg-gradient-to-b from-[#eef5ee] via-[#eef5ee]/90 to-transparent px-4 pt-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
>
	<div
		class="rounded-[28px] border border-emerald-900/10 bg-white/85 px-4 py-4 shadow-[0_22px_55px_rgba(16,35,29,0.08)] backdrop-blur-xl sm:px-5"
	>
		<div class="flex items-center justify-between gap-3">
			<div class="min-w-0">
				<p class="text-[11px] font-semibold tracking-wider text-emerald-700/80 uppercase">
					{greeting}
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

		<button
			type="button"
			onclick={() => goto('/insights')}
			class="mt-3.5 flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-[#10231d] via-[#13362b] to-[#1d4d3c] px-4 py-3 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition active:scale-[0.99]"
		>
			<div class="min-w-0">
				<p class="text-[10px] font-semibold tracking-[0.18em] text-white/55 uppercase">
					Saldo {monthLabel}
				</p>
				<p
					class={[
						'mt-0.5 truncate text-2xl leading-tight font-black tracking-tight',
						balancePositive ? 'text-emerald-200' : 'text-rose-200'
					]}
				>
					{formatCurrency(summary.monthlyBalance)}
				</p>
				<p class="mt-1 text-[11px] font-medium text-white/55">
					{monthlyTransactionCount} transaksi bulan ini
				</p>
			</div>
			<span
				class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur"
			>
				<Wallet size={19} aria-hidden="true" />
			</span>
		</button>

		<div class="mt-2 grid grid-cols-2 gap-2">
			<div
				class="flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5"
			>
				<span
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
				>
					<TrendingUp size={14} aria-hidden="true" />
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-[10px] font-semibold tracking-wide text-emerald-700/80 uppercase">
						Pemasukan
					</p>
					<p class="truncate text-sm font-bold text-emerald-900">
						{formatCurrency(summary.monthlyIncome)}
					</p>
				</div>
			</div>
			<div
				class="flex items-center gap-2.5 rounded-2xl border border-rose-100 bg-rose-50/70 px-3 py-2.5"
			>
				<span
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm"
				>
					<TrendingDown size={14} aria-hidden="true" />
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-[10px] font-semibold tracking-wide text-rose-700/80 uppercase">
						Pengeluaran
					</p>
					<p class="truncate text-sm font-bold text-rose-900">
						{formatCurrency(summary.monthlyExpense)}
					</p>
				</div>
			</div>
		</div>
	</div>
</header>
