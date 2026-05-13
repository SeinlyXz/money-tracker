<script lang="ts">
	import { ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ClipboardList } from 'lucide-svelte';

	import { CATEGORIES } from '$lib/shared/money';

	let { today }: { today: string } = $props();

	let type = $state<'expense' | 'income'>('expense');
</script>

<form
	method="POST"
	action="?/manualAdd"
	class="rounded-[20px] border border-emerald-900/10 bg-white/95 p-4 shadow-[0_14px_40px_rgba(16,35,29,0.08)] sm:p-5"
>
	<div class="flex items-center gap-2.5">
		<span
			class="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
		>
			<ClipboardList size={17} aria-hidden="true" />
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-[10px] font-bold tracking-[0.16em] text-emerald-700/80 uppercase">
				Input manual
			</p>
			<h2 class="text-sm font-bold text-[#10231d]">Isi detail transaksi</h2>
		</div>
		<span
			class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
		>
			<CalendarDays size={11} aria-hidden="true" />
			{today}
		</span>
	</div>

	<input type="hidden" name="type" value={type} />

	<div
		class="mt-3.5 grid grid-cols-2 gap-1 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] p-1"
	>
		<button
			type="button"
			onclick={() => (type = 'expense')}
			class={[
				'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[10px] px-3 text-xs font-bold transition active:scale-[0.98]',
				type === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'
			]}
		>
			<ArrowUpRight size={13} aria-hidden="true" />
			Pengeluaran
		</button>
		<button
			type="button"
			onclick={() => (type = 'income')}
			class={[
				'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[10px] px-3 text-xs font-bold transition active:scale-[0.98]',
				type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
			]}
		>
			<ArrowDownLeft size={13} aria-hidden="true" />
			Pemasukan
		</button>
	</div>

	<div class="mt-3 grid gap-2.5">
		<label class="grid gap-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
			Judul
			<input
				name="title"
				placeholder="Bayar listrik"
				class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 text-sm font-medium text-[#10231d] outline-none placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
			/>
		</label>

		<div class="grid gap-2.5 sm:grid-cols-2">
			<label class="grid gap-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
				Nominal
				<div class="relative">
					<span
						class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold text-slate-400"
					>
						Rp
					</span>
					<input
						name="amount"
						inputmode="decimal"
						placeholder="250000"
						class="min-h-11 w-full rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] pr-3.5 pl-9 text-sm font-medium text-[#10231d] outline-none placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
					/>
				</div>
			</label>

			<label class="grid gap-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
				Tanggal
				<input
					name="occurredOn"
					type="date"
					value={today}
					class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 text-sm font-medium text-[#10231d] outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
				/>
			</label>
		</div>

		<label class="grid gap-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
			Kategori
			<select
				name="category"
				class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 text-sm font-medium text-[#10231d] outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
			>
				{#each CATEGORIES as category (category)}
					<option value={category}>{category}</option>
				{/each}
			</select>
		</label>

		<label class="grid gap-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
			Merchant
			<input
				name="merchant"
				placeholder="Tokopedia, PLN, Warung dekat rumah"
				class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 text-sm font-medium text-[#10231d] outline-none placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
			/>
		</label>

		<label class="grid gap-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
			Catatan
			<textarea
				name="note"
				rows="2"
				placeholder="Opsional"
				class="rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 py-2.5 text-sm font-medium text-[#10231d] outline-none placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
			></textarea>
		</label>

		<button
			type="submit"
			class="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#10231d] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,35,29,0.22)] transition active:scale-[0.98]"
		>
			<Check size={16} aria-hidden="true" />
			Tambah transaksi
		</button>
	</div>
</form>
