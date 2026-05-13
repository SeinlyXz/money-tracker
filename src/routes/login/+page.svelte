<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { startAuthentication } from '@simplewebauthn/browser';
	import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-svelte';

	let { data, form } = $props();

	let passkeyStatus = $state('');
	let isAuthenticating = $state(false);

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

<main class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-12 pb-2 sm:px-6">
	<header class="flex flex-col items-center gap-2 text-center">
		<span
			class="flex size-12 items-center justify-center rounded-[10px] bg-emerald-100 text-emerald-700"
		>
			<ShieldCheck size={24} aria-hidden="true" />
		</span>
		<h1 class="text-2xl font-bold text-[#10231d]">Masuk ke Money Tracker</h1>
		<p class="text-sm text-slate-600">Verifikasi identitas untuk lanjut.</p>
	</header>

	{#if form?.message}
		<section
			class="rounded-[8px] border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-950 shadow-sm"
		>
			{form.message}
		</section>
	{/if}

	<section
		class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-5"
	>
		<div class="flex items-center gap-3">
			<span
				class="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-emerald-100 text-emerald-700"
			>
				<LockKeyhole size={20} aria-hidden="true" />
			</span>
			<h2 class="text-lg font-bold text-[#10231d]">Password</h2>
		</div>

		<form method="POST" action="?/password" class="mt-4 grid gap-3">
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
			<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
				Password
				<input
					name="password"
					type="password"
					autocomplete="current-password"
					placeholder="Masukkan password"
					class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
					required
				/>
			</label>

			<button
				type="submit"
				class="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-emerald-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]"
			>
				<ShieldCheck size={18} aria-hidden="true" />
				Masuk
			</button>
		</form>
	</section>

	{#if data.passkeyCount > 0}
		<section
			class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-5"
		>
			<div class="flex items-center gap-3">
				<span
					class="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-emerald-100 text-emerald-700"
				>
					<KeyRound size={20} aria-hidden="true" />
				</span>
				<h2 class="text-lg font-bold text-[#10231d]">Passkey</h2>
			</div>

			<button
				type="button"
				class="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#10231d] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 active:scale-[0.99] disabled:opacity-60"
				onclick={signInWithPasskey}
				disabled={isAuthenticating}
			>
				<KeyRound size={18} aria-hidden="true" />
				{isAuthenticating ? 'Menunggu passkey...' : 'Masuk dengan passkey'}
			</button>

			{#if passkeyStatus}
				<p
					class="mt-3 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900"
				>
					{passkeyStatus}
				</p>
			{/if}
		</section>
	{/if}
</main>
