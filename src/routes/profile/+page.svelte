<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { startRegistration } from '@simplewebauthn/browser';
	import {
		ChevronLeft,
		ChevronRight,
		CircleUser,
		Eye,
		EyeOff,
		Fingerprint,
		KeyRound,
		LockKeyhole,
		LogOut,
		Save,
		Settings2,
		ShieldCheck,
		Sparkles,
		TrendingDown,
		TrendingUp,
		UserRound,
		Wallet
	} from 'lucide-svelte';

	import { formatCurrency } from '$lib/shared/money';

	let { data, form } = $props();

	type Section = 'menu' | 'identitas' | 'preferensi' | 'keamanan';

	let activeSection = $state<Section>('menu');
	let passkeyStatus = $state('');
	let isRegisteringPasskey = $state(false);
	let showPassword = $state(false);
	let showConfirm = $state(false);

	const isOnboarding = $derived(!data.passwordConfigured && data.passkeyCount === 0);

	const titles: Record<Section, string> = {
		menu: 'Pengaturan',
		identitas: 'Identitas',
		preferensi: 'Preferensi',
		keamanan: 'Keamanan'
	};

	$effect(() => {
		if (form?.action) {
			if (form.action === 'setName') activeSection = 'identitas';
			else if (form.action === 'toggleNavLabels') activeSection = 'preferensi';
			else if (form.action === 'setPassword') activeSection = 'keamanan';
		}
	});

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

	function goBack() {
		activeSection = 'menu';
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

		{#if passkeyStatus}
			<section
				class="rounded-[16px] border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-2.5 text-xs font-medium text-emerald-900"
			>
				{passkeyStatus}
			</section>
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

		<section
			class="overflow-hidden rounded-[20px] border border-emerald-700/40 bg-white/95 shadow-[0_14px_40px_rgba(16,35,29,0.08)] ring-2 ring-emerald-600/15"
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
			</div>
			<p class="mt-1 px-4 text-[11px] leading-5 text-slate-500">
				Pakai sidik jari / Face ID dari perangkat ini.
			</p>
			<div class="px-4 pt-3 pb-4">
				<button
					type="button"
					class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#10231d] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,35,29,0.25)] transition active:scale-[0.98] disabled:opacity-60"
					onclick={addPasskey}
					disabled={isRegisteringPasskey}
				>
					<KeyRound size={16} aria-hidden="true" />
					{isRegisteringPasskey ? 'Menunggu passkey...' : 'Buat passkey'}
				</button>
			</div>
		</section>

		<div
			class="flex items-center gap-3 px-1 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase"
		>
			<span class="h-px flex-1 bg-emerald-900/10"></span>
			atau
			<span class="h-px flex-1 bg-emerald-900/10"></span>
		</div>

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
					<h2 class="text-sm font-bold text-[#10231d]">Set password</h2>
				</div>
			</div>
			<form method="POST" action="?/setPassword" class="grid gap-2.5 px-4 pt-3 pb-4">
				<input
					name="password"
					type="password"
					autocomplete="new-password"
					placeholder="Password baru (min. 6 karakter)"
					class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:text-sm"
				/>
				<input
					name="confirmPassword"
					type="password"
					autocomplete="new-password"
					placeholder="Konfirmasi password"
					class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:text-sm"
				/>
				<button
					type="submit"
					class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-700 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(4,120,87,0.22)] transition active:scale-[0.98]"
				>
					<ShieldCheck size={16} aria-hidden="true" />
					Simpan password
				</button>
			</form>
		</section>

		<p class="mt-2 text-center text-[10px] text-slate-400">
			Pilih salah satu untuk lanjut ke aplikasi ✦
		</p>
	{:else}
		<header
			class="flex items-center gap-3 rounded-[20px] border border-emerald-900/10 bg-white/90 p-3.5 shadow-sm"
		>
			{#if activeSection === 'menu'}
				<span
					class="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
				>
					<ShieldCheck size={18} aria-hidden="true" />
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-[10px] font-bold tracking-[0.18em] text-emerald-700/80 uppercase">
						Pengaturan akun
					</p>
					<h1 class="text-base font-bold text-[#10231d]">
						{data.userName ? `Halo, ${data.userName}` : 'Profil'}
					</h1>
				</div>
			{:else}
				<button
					type="button"
					onclick={goBack}
					aria-label="Kembali"
					class="inline-flex size-10 items-center justify-center rounded-full border border-emerald-900/10 bg-white text-[#10231d] shadow-sm transition active:scale-[0.96]"
				>
					<ChevronLeft size={18} aria-hidden="true" />
				</button>
				<div class="min-w-0 flex-1">
					<p class="text-[10px] font-bold tracking-[0.18em] text-emerald-700/80 uppercase">
						Profil
					</p>
					<h1 class="text-base font-bold text-[#10231d]">{titles[activeSection]}</h1>
				</div>
			{/if}
		</header>

		{#if form?.message}
			<section
				class={[
					'rounded-[16px] border px-3.5 py-2.5 text-xs font-semibold shadow-sm',
					form.action === 'setPassword' ||
					form.action === 'setName' ||
					form.action === 'toggleNavLabels'
						? 'border-emerald-200 bg-emerald-50 text-emerald-800'
						: 'border-rose-200 bg-rose-50 text-rose-700'
				]}
			>
				{form.message}
			</section>
		{/if}

		{#if passkeyStatus && activeSection === 'keamanan'}
			<section
				class="rounded-[16px] border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-2.5 text-xs font-medium text-emerald-900"
			>
				{passkeyStatus}
			</section>
		{/if}

		{#if activeSection === 'menu'}
			<section
				class="overflow-hidden rounded-[20px] border border-emerald-900/10 bg-linear-to-br from-[#10231d] via-[#143027] to-[#0f2a22] p-4 text-white shadow-[0_18px_45px_rgba(16,35,29,0.22)]"
			>
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0">
						<p class="text-[10px] font-bold tracking-[0.22em] text-emerald-200/80 uppercase">
							Saldo sekarang
						</p>
						<p class="mt-1 truncate text-2xl font-bold tracking-tight">
							{formatCurrency(data.balance)}
						</p>
					</div>
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-200/15 text-emerald-200 ring-1 ring-emerald-200/30"
					>
						<Wallet size={18} aria-hidden="true" />
					</span>
				</div>

				<div class="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
					<span
						class={[
							'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
							data.monthlyBalance >= 0
								? 'bg-emerald-400/15 text-emerald-200'
								: 'bg-rose-400/20 text-rose-200'
						]}
					>
						{#if data.monthlyBalance >= 0}
							<TrendingUp size={11} aria-hidden="true" />
						{:else}
							<TrendingDown size={11} aria-hidden="true" />
						{/if}
						Bulan ini {formatCurrency(data.monthlyBalance)}
					</span>
				</div>
			</section>

			<nav class="flex flex-col gap-2">
				<button
					type="button"
					onclick={() => (activeSection = 'identitas')}
					class="flex items-center gap-3 rounded-[18px] border border-emerald-900/10 bg-white/95 px-4 py-3.5 text-left shadow-[0_10px_30px_rgba(16,35,29,0.06)] transition active:scale-[0.99]"
				>
					<span
						class="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
					>
						<CircleUser size={18} aria-hidden="true" />
					</span>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-bold text-[#10231d]">Identitas</p>
						<p class="truncate text-[11px] text-slate-500">
							{data.userName ? `Nama: ${data.userName}` : 'Belum atur nama panggilan'}
						</p>
					</div>
					<ChevronRight size={16} class="shrink-0 text-slate-400" aria-hidden="true" />
				</button>

				<button
					type="button"
					onclick={() => (activeSection = 'preferensi')}
					class="flex items-center gap-3 rounded-[18px] border border-emerald-900/10 bg-white/95 px-4 py-3.5 text-left shadow-[0_10px_30px_rgba(16,35,29,0.06)] transition active:scale-[0.99]"
				>
					<span
						class="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sky-700"
					>
						<Settings2 size={18} aria-hidden="true" />
					</span>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-bold text-[#10231d]">Preferensi</p>
						<p class="truncate text-[11px] text-slate-500">
							Tampilan navigasi & opsi antarmuka
						</p>
					</div>
					<ChevronRight size={16} class="shrink-0 text-slate-400" aria-hidden="true" />
				</button>

				<button
					type="button"
					onclick={() => (activeSection = 'keamanan')}
					class="flex items-center gap-3 rounded-[18px] border border-emerald-900/10 bg-white/95 px-4 py-3.5 text-left shadow-[0_10px_30px_rgba(16,35,29,0.06)] transition active:scale-[0.99]"
				>
					<span
						class="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700"
					>
						<ShieldCheck size={18} aria-hidden="true" />
					</span>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-bold text-[#10231d]">Keamanan</p>
						<p class="truncate text-[11px] text-slate-500">
							{data.passkeyCount} passkey · password {data.passwordConfigured ? 'aktif' : 'belum diset'}
						</p>
					</div>
					<ChevronRight size={16} class="shrink-0 text-slate-400" aria-hidden="true" />
				</button>

				{#if data.passwordConfigured || data.passkeyCount > 0}
					<form method="POST" action="/logout" class="mt-2">
						<button
							type="submit"
							class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-rose-200 bg-white px-4 text-sm font-bold text-rose-700 shadow-sm transition active:scale-[0.98]"
						>
							<LogOut size={15} aria-hidden="true" />
							Keluar
						</button>
					</form>
				{/if}
			</nav>
		{:else if activeSection === 'identitas'}
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
						class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 text-base font-medium text-[#10231d] outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:text-sm"
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
		{:else if activeSection === 'preferensi'}
			<section
				class="overflow-hidden rounded-[20px] border border-emerald-900/10 bg-white/95 shadow-[0_14px_40px_rgba(16,35,29,0.08)]"
			>
				<form
					method="POST"
					action="?/toggleNavLabels"
					use:enhance={() => {
						return async ({ update }) => {
							await update({ reset: false });
						};
					}}
					class="flex items-center justify-between gap-3 px-4 py-4"
				>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-bold text-[#10231d]">Label item navigasi</p>
						<p class="text-[11px] leading-5 text-slate-500">
							Tampilkan teks di bawah ikon nav bawah.
						</p>
					</div>
					<input type="hidden" name="enabled" value={data.showNavLabels ? 'false' : 'true'} />
					<button
						type="submit"
						role="switch"
						aria-checked={data.showNavLabels}
						aria-label="Toggle label navigasi"
						class={[
							'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 active:scale-[0.97]',
							data.showNavLabels ? 'bg-emerald-700' : 'bg-slate-300'
						]}
					>
						<span
							class={[
								'inline-block size-5 transform rounded-full bg-white shadow transition-transform duration-200',
								data.showNavLabels ? 'translate-x-6' : 'translate-x-1'
							]}
						></span>
					</button>
				</form>
			</section>
		{:else if activeSection === 'keamanan'}
			<section
				class="overflow-hidden rounded-[20px] border border-emerald-900/10 bg-white/95 shadow-[0_14px_40px_rgba(16,35,29,0.08)]"
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
							class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 pr-11 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:text-sm"
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
							class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 pr-11 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:text-sm"
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
		{/if}
	{/if}
</main>
