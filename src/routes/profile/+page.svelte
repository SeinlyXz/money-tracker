<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { startRegistration } from '@simplewebauthn/browser';
	import {
		CheckCircle2,
		Eye,
		EyeOff,
		Fingerprint,
		KeyRound,
		LockKeyhole,
		LogOut,
		Save,
		ShieldCheck,
		Sparkles,
		UserRound
	} from 'lucide-svelte';

	let { data, form } = $props();

	let passkeyStatus = $state('');
	let isRegisteringPasskey = $state(false);
	let showPassword = $state(false);
	let showConfirm = $state(false);

	const isOnboarding = $derived(!data.passwordConfigured && data.passkeyCount === 0);

	async function addPasskey() {
		if (!browserSupportsPasskeys()) {
			passkeyStatus = 'Browser ini belum mendukung passkey.';
			return;
		}

		isRegisteringPasskey = true;
		passkeyStatus = 'Membuka prompt passkey...';

		try {
			const optionsResponse = await fetch('/api/passkeys/register/options');
			const optionsJSON = await optionsResponse.json();
			const credential = await startRegistration({ optionsJSON });

			const verifyResponse = await fetch('/api/passkeys/register/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credential)
			});
			const result = (await verifyResponse.json()) as { ok: boolean; message?: string };

			if (!result.ok) {
				throw new Error(result.message ?? 'Passkey gagal disimpan.');
			}

			passkeyStatus = 'Passkey berhasil ditambahkan.';
			await invalidateAll();
			if (isOnboarding) {
				window.location.href = resolve('/');
			}
		} catch (error) {
			passkeyStatus = error instanceof Error ? error.message : 'Passkey gagal ditambahkan.';
		} finally {
			isRegisteringPasskey = false;
		}
	}

	function browserSupportsPasskeys() {
		return typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
	}
</script>

<svelte:head>
	<title>{isOnboarding ? 'Mulai - Money Tracker' : 'Profil - Money Tracker'}</title>
</svelte:head>

<main class="relative mx-auto flex w-full max-w-md flex-col gap-3 px-4 pt-5 pb-24 sm:px-6">
	{#if isOnboarding}
		<div
			class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 rounded-b-[40px] bg-gradient-to-b from-amber-100/70 via-emerald-50/40 to-transparent blur-2xl"
			aria-hidden="true"
		></div>

		<header class="flex flex-col items-center gap-3 pt-4 text-center">
			<div class="relative">
				<span
					class="flex size-16 items-center justify-center rounded-[22px] bg-[#10231d] text-amber-200 shadow-[0_18px_45px_rgba(16,35,29,0.25)]"
				>
					<Sparkles size={28} aria-hidden="true" />
				</span>
				<span
					class="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-amber-200 text-[#10231d] ring-4 ring-white"
				>
					<ShieldCheck size={12} aria-hidden="true" />
				</span>
			</div>
			<div class="space-y-1">
				<p class="text-[10px] font-bold tracking-[0.22em] text-emerald-700/80 uppercase">
					Selamat datang
				</p>
				<h1 class="text-2xl font-bold text-[#10231d]">Atur kunci dulu yuk</h1>
				<p class="px-2 text-xs leading-5 text-slate-600">
					Pilih salah satu cara — passkey paling cepat, password klasik juga oke.
				</p>
			</div>
		</header>
	{:else}
		<header
			class="flex items-center gap-3 rounded-[20px] border border-emerald-900/10 bg-white/90 p-3.5 shadow-sm"
		>
			<span
				class="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
			>
				<ShieldCheck size={18} aria-hidden="true" />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[10px] font-bold tracking-[0.18em] text-emerald-700/80 uppercase">
					Keamanan akun
				</p>
				<h1 class="text-base font-bold text-[#10231d]">Profil</h1>
			</div>
		</header>
	{/if}

	{#if form?.message}
		<section
			class={[
				'rounded-[16px] border px-3.5 py-2.5 text-xs font-semibold shadow-sm',
				form.action === 'setPassword'
					? 'border-emerald-200 bg-emerald-50 text-emerald-800'
					: 'border-rose-200 bg-rose-50 text-rose-700'
			]}
		>
			{form.message}
		</section>
	{/if}

	{#if passkeyStatus}
		<section
			class="flex items-center gap-2 rounded-[16px] border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-2.5 text-xs font-medium text-emerald-900"
		>
			<CheckCircle2 size={14} class="shrink-0 text-emerald-700" aria-hidden="true" />
			{passkeyStatus}
		</section>
	{/if}

	<section
		class="overflow-hidden rounded-[20px] border border-emerald-900/10 bg-white/95 shadow-[0_14px_40px_rgba(16,35,29,0.08)]"
	>
		<div class="flex items-center gap-2.5 px-4 pt-3.5">
			<span
				class="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
			>
				<UserRound size={17} aria-hidden="true" />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[10px] font-bold tracking-[0.16em] text-emerald-700/80 uppercase">
					Sapaan
				</p>
				<h2 class="text-sm font-bold text-[#10231d]">Nama panggilan</h2>
			</div>
			{#if data.userName}
				<span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
					Halo, {data.userName}
				</span>
			{:else}
				<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
					Belum diset
				</span>
			{/if}
		</div>

		<p class="mt-1 px-4 text-[11px] leading-5 text-slate-500">
			Dipakai untuk greeting di halaman utama.
		</p>

		<form method="POST" action="?/setName" class="grid gap-2.5 px-4 pt-3 pb-4">
			<input
				name="name"
				type="text"
				maxlength="40"
				value={data.userName ?? ''}
				placeholder="Misal: Lintang"
				class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 text-sm font-medium text-[#10231d] outline-none placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
			/>
			<button
				type="submit"
				class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-700 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(4,120,87,0.22)] transition active:scale-[0.98]"
			>
				<Save size={15} aria-hidden="true" />
				Simpan nama
			</button>
		</form>
	</section>

	<section
		class={[
			'overflow-hidden rounded-[20px] border bg-white/95 shadow-[0_14px_40px_rgba(16,35,29,0.08)]',
			isOnboarding ? 'border-emerald-700/40 ring-2 ring-emerald-600/15' : 'border-emerald-900/10'
		]}
	>
		<div class="flex items-center gap-2.5 px-4 pt-3.5">
			<span
				class="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
			>
				<Fingerprint size={17} aria-hidden="true" />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[10px] font-bold tracking-[0.16em] text-emerald-700/80 uppercase">
					Cara cepat
				</p>
				<h2 class="text-sm font-bold text-[#10231d]">Passkey</h2>
			</div>
			<span
				class={[
					'rounded-full px-2 py-0.5 text-[10px] font-bold',
					data.passkeyCount > 0
						? 'bg-emerald-50 text-emerald-700'
						: 'bg-slate-100 text-slate-500'
				]}
			>
				{data.passkeyCount} aktif
			</span>
		</div>

		<p class="mt-1 px-4 text-[11px] leading-5 text-slate-500">
			Pakai sidik jari / Face ID dari perangkat ini. Tanpa password, tetap aman.
		</p>

		<div class="px-4 pt-3 pb-4">
			<button
				type="button"
				class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#10231d] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,35,29,0.25)] transition active:scale-[0.98] disabled:opacity-60"
				onclick={addPasskey}
				disabled={isRegisteringPasskey}
			>
				<KeyRound size={16} aria-hidden="true" />
				{isRegisteringPasskey
					? 'Menunggu passkey...'
					: data.passkeyCount > 0
						? 'Tambah passkey lain'
						: 'Buat passkey'}
			</button>
		</div>
	</section>

	{#if isOnboarding}
		<div class="flex items-center gap-3 px-1 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
			<span class="h-px flex-1 bg-emerald-900/10"></span>
			atau
			<span class="h-px flex-1 bg-emerald-900/10"></span>
		</div>
	{/if}

	<section
		class="overflow-hidden rounded-[20px] border border-emerald-900/10 bg-white/95 shadow-[0_14px_40px_rgba(16,35,29,0.08)]"
	>
		<div class="flex items-center gap-2.5 px-4 pt-3.5">
			<span
				class="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700"
			>
				<LockKeyhole size={17} aria-hidden="true" />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[10px] font-bold tracking-[0.16em] text-amber-700/80 uppercase">
					Cara klasik
				</p>
				<h2 class="text-sm font-bold text-[#10231d]">
					{data.passwordConfigured ? 'Ganti password' : 'Set password'}
				</h2>
			</div>
			<span
				class={[
					'rounded-full px-2 py-0.5 text-[10px] font-bold',
					data.passwordConfigured
						? 'bg-emerald-50 text-emerald-700'
						: 'bg-slate-100 text-slate-500'
				]}
			>
				{data.passwordConfigured ? 'Aktif' : 'Belum diset'}
			</span>
		</div>

		<form method="POST" action="?/setPassword" class="grid gap-2.5 px-4 pt-3 pb-4">
			<label class="relative grid">
				<input
					name="password"
					type={showPassword ? 'text' : 'password'}
					autocomplete="new-password"
					placeholder="Password baru (min. 6 karakter)"
					class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 pr-11 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
				/>
				<button
					type="button"
					class="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
					onclick={() => (showPassword = !showPassword)}
					aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
				>
					{#if showPassword}
						<EyeOff size={15} aria-hidden="true" />
					{:else}
						<Eye size={15} aria-hidden="true" />
					{/if}
				</button>
			</label>

			<label class="relative grid">
				<input
					name="confirmPassword"
					type={showConfirm ? 'text' : 'password'}
					autocomplete="new-password"
					placeholder="Konfirmasi password"
					class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 pr-11 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
				/>
				<button
					type="button"
					class="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
					onclick={() => (showConfirm = !showConfirm)}
					aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
				>
					{#if showConfirm}
						<EyeOff size={15} aria-hidden="true" />
					{:else}
						<Eye size={15} aria-hidden="true" />
					{/if}
				</button>
			</label>

			<button
				type="submit"
				class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-700 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(4,120,87,0.22)] transition active:scale-[0.98]"
			>
				<ShieldCheck size={16} aria-hidden="true" />
				{data.passwordConfigured ? 'Simpan password baru' : 'Simpan password'}
			</button>
		</form>
	</section>

	{#if !isOnboarding && (data.passwordConfigured || data.passkeyCount > 0)}
		<form method="POST" action="/logout" class="mt-1">
			<button
				type="submit"
				class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-rose-200 bg-white px-4 text-sm font-bold text-rose-700 shadow-sm transition active:scale-[0.98]"
			>
				<LogOut size={15} aria-hidden="true" />
				Keluar
			</button>
		</form>
	{/if}

	{#if isOnboarding}
		<p class="mt-2 text-center text-[10px] text-slate-400">
			Pilih salah satu untuk lanjut ke aplikasi ✦
		</p>
	{/if}
</main>
