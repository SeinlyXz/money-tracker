<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { startAuthentication } from '@simplewebauthn/browser';
	import {
		Eye,
		EyeOff,
		Fingerprint,
		KeyRound,
		LockKeyhole,
		ShieldCheck,
		Sparkles
	} from 'lucide-svelte';

	let { data, form } = $props();

	let passkeyStatus = $state('');
	let isAuthenticating = $state(false);
	let showPassword = $state(false);

	async function signInWithPasskey() {
		if (!browserSupportsPasskeys()) {
			passkeyStatus = 'Browser ini belum mendukung passkey.';
			return;
		}

		isAuthenticating = true;
		passkeyStatus = 'Membuka prompt passkey...';

		try {
			const optionsResponse = await fetch('/api/passkeys/authenticate/options');
			if (!optionsResponse.ok) {
				throw new Error('Tidak ada passkey terdaftar.');
			}
			const optionsJSON = await optionsResponse.json();
			const credential = await startAuthentication({ optionsJSON });

			const verifyResponse = await fetch('/api/passkeys/authenticate/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credential)
			});
			const result = (await verifyResponse.json()) as { ok: boolean; message?: string };

			if (!result.ok) {
				throw new Error(result.message ?? 'Passkey gagal diverifikasi.');
			}

			passkeyStatus = 'Login berhasil. Mengalihkan...';
			await invalidateAll();
			await goto(data.redirectTo ?? '/', { invalidateAll: true });
		} catch (error) {
			passkeyStatus = error instanceof Error ? error.message : 'Passkey gagal diverifikasi.';
		} finally {
			isAuthenticating = false;
		}
	}

	function browserSupportsPasskeys() {
		return typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
	}
</script>

<svelte:head>
	<title>Masuk - Money Tracker</title>
</svelte:head>

<main
	class="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center gap-4 px-4 py-8 sm:px-6"
>
	<div
		class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 rounded-b-[40px] bg-gradient-to-b from-emerald-200/60 via-emerald-50/40 to-transparent blur-2xl"
		aria-hidden="true"
	></div>

	<header class="flex flex-col items-center gap-3 text-center">
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
				Money Tracker
			</p>
			<h1 class="text-2xl font-bold text-[#10231d]">Halo, balik lagi 👋</h1>
			<p class="px-4 text-xs leading-5 text-slate-600">
				Verifikasi dulu biar catatan keuanganmu tetap aman.
			</p>
		</div>
	</header>

	{#if form?.message}
		<section
			class="rounded-[16px] border border-rose-200 bg-rose-50/90 px-3.5 py-2.5 text-xs font-semibold text-rose-700 shadow-sm"
		>
			{form.message}
		</section>
	{/if}

	{#if data.passkeyCount > 0}
		<section
			class="rounded-[20px] border border-emerald-900/10 bg-white/95 p-4 shadow-[0_14px_40px_rgba(16,35,29,0.08)]"
		>
			<div class="flex items-center gap-2.5">
				<span
					class="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
				>
					<Fingerprint size={17} aria-hidden="true" />
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-[10px] font-bold tracking-[0.16em] text-emerald-700/80 uppercase">
						Cara cepat
					</p>
					<h2 class="text-sm font-bold text-[#10231d]">Masuk dengan passkey</h2>
				</div>
				<span
					class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
				>
					{data.passkeyCount} aktif
				</span>
			</div>

			<button
				type="button"
				class="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#10231d] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,35,29,0.25)] transition active:scale-[0.98] disabled:opacity-60"
				onclick={signInWithPasskey}
				disabled={isAuthenticating}
			>
				<KeyRound size={16} aria-hidden="true" />
				{isAuthenticating ? 'Menunggu passkey...' : 'Pakai passkey'}
			</button>

			{#if passkeyStatus}
				<p
					class="mt-2.5 rounded-[12px] bg-emerald-50/80 px-3 py-2 text-[11px] font-medium text-emerald-900"
				>
					{passkeyStatus}
				</p>
			{/if}
		</section>
	{/if}

	{#if data.passwordConfigured}
		{#if data.passkeyCount > 0}
			<div class="relative flex items-center gap-3 px-1 py-1 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
				<span class="h-px flex-1 bg-emerald-900/10"></span>
				atau
				<span class="h-px flex-1 bg-emerald-900/10"></span>
			</div>
		{/if}

		<section
			class="rounded-[20px] border border-emerald-900/10 bg-white/95 p-4 shadow-[0_14px_40px_rgba(16,35,29,0.08)]"
		>
			<div class="flex items-center gap-2.5">
				<span
					class="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700"
				>
					<LockKeyhole size={17} aria-hidden="true" />
				</span>
				<div>
					<p class="text-[10px] font-bold tracking-[0.16em] text-amber-700/80 uppercase">
						Cara klasik
					</p>
					<h2 class="text-sm font-bold text-[#10231d]">Masuk pakai password</h2>
				</div>
			</div>

			<form method="POST" action="?/password" class="mt-3 grid gap-2.5">
				<input type="hidden" name="redirectTo" value={data.redirectTo} />
				<label class="relative grid">
					<input
						name="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="current-password"
						placeholder="Masukkan password"
						class="min-h-11 rounded-[14px] border border-emerald-900/10 bg-[#f7fbf7] px-3.5 pr-11 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
						required
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

				<button
					type="submit"
					class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-700 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(4,120,87,0.25)] transition active:scale-[0.98]"
				>
					<ShieldCheck size={16} aria-hidden="true" />
					Masuk
				</button>
			</form>
		</section>
	{/if}

	<p class="mt-2 text-center text-[10px] text-slate-400">
		Data tersimpan lokal di perangkatmu ✦
	</p>
</main>
