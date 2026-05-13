<script lang="ts">
	import { CalendarDays, Check, ClipboardList } from 'lucide-svelte';

	import { CATEGORIES } from '$lib/shared/money';

	let { today }: { today: string } = $props();
</script>

<form
	method="POST"
	action="?/manualAdd"
	class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-[0_18px_45px_rgba(16,35,29,0.08)] sm:p-5"
>
	<div class="flex items-center justify-between gap-3">
		<h2 class="flex items-center gap-2 text-lg font-bold text-[#10231d]">
			<span
				class="flex size-8 items-center justify-center rounded-[8px] bg-emerald-100 text-emerald-700"
			>
				<ClipboardList size={17} aria-hidden="true" />
			</span>
			Input manual
		</h2>
		<span
			class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
		>
			<CalendarDays size={14} aria-hidden="true" />
			{today}
		</span>
	</div>

	<div class="mt-4 grid gap-3">
		<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
			Judul
			<input
				name="title"
				placeholder="Bayar listrik"
				class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
			/>
		</label>

		<div class="grid gap-3 sm:grid-cols-2">
			<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
				Nominal
				<input
					name="amount"
					inputmode="decimal"
					placeholder="250000"
					class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
				/>
			</label>

			<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
				Tanggal
				<input
					name="occurredOn"
					type="date"
					value={today}
					class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
				/>
			</label>
		</div>

		<div class="grid gap-3 sm:grid-cols-2">
			<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
				Tipe
				<select
					name="type"
					class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
				>
					<option value="expense">Pengeluaran</option>
					<option value="income">Pemasukan</option>
				</select>
			</label>

			<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
				Kategori
				<select
					name="category"
					class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
				>
					{#each CATEGORIES as category (category)}
						<option value={category}>{category}</option>
					{/each}
				</select>
			</label>
		</div>

		<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
			Merchant
			<input
				name="merchant"
				placeholder="Tokopedia, PLN, Warung dekat rumah"
				class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
			/>
		</label>

		<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
			Catatan
			<textarea
				name="note"
				rows="3"
				placeholder="Opsional"
				class="border border-emerald-900/10 bg-[#f7fbf7] px-4 py-3 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
			></textarea>
		</label>

		<button
			type="submit"
			class="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-emerald-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]"
		>
			<Check size={18} aria-hidden="true" />
			Tambah transaksi
		</button>
	</div>
</form>
