<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { startRegistration } from '@simplewebauthn/browser';
	import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-svelte';

	import FlashMessage from '$lib/components/FlashMessage.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let { data, form } = $props();

	let passkeyStatus = $state('');
	let isRegisteringPasskey = $state(false);

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
	<title>Profil - Money Tracker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pt-5 pb-2 sm:px-6 lg:px-8">
	<PageHeader title="Profil" />

	<FlashMessage {form} />

	<section class="grid gap-4">
		<div class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-5">
			<div class="flex items-start justify-between gap-4">
				<div class="flex gap-3">
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-emerald-100 text-emerald-700"
					>
						<LockKeyhole size={20} aria-hidden="true" />
					</span>
					<div>
						<h2 class="text-lg font-bold text-[#10231d]">Set password</h2>
					</div>
				</div>
				<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
					{data.passwordConfigured ? 'Aktif' : 'Belum diset'}
				</span>
			</div>

			<form method="POST" action="?/setPassword" class="mt-5 grid gap-3">
				<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
					Password baru
					<input
						name="password"
						type="password"
						autocomplete="new-password"
						placeholder="Minimal 6 karakter"
						class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
					/>
				</label>

				<label class="grid gap-1.5 text-sm font-semibold text-slate-700">
					Konfirmasi password
					<input
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						placeholder="Ulangi password"
						class="min-h-12 border border-emerald-900/10 bg-[#f7fbf7] px-4 text-base outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
					/>
				</label>

				<button
					type="submit"
					class="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-emerald-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]"
				>
					<ShieldCheck size={18} aria-hidden="true" />
					Simpan password
				</button>
			</form>
		</div>

		<div class="rounded-[8px] border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-5">
			<div class="flex items-start justify-between gap-4">
				<div class="flex gap-3">
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-emerald-100 text-emerald-700"
					>
						<KeyRound size={20} aria-hidden="true" />
					</span>
					<div>
						<h2 class="text-lg font-bold text-[#10231d]">Passkey</h2>
					</div>
				</div>
				<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
					{data.passkeyCount} tersimpan
				</span>
			</div>

			<button
				type="button"
				class="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#10231d] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 active:scale-[0.99]"
				onclick={addPasskey}
				disabled={isRegisteringPasskey}
			>
				<KeyRound size={18} aria-hidden="true" />
				{isRegisteringPasskey ? 'Menunggu passkey...' : 'Tambah passkey'}
			</button>

			{#if passkeyStatus}
				<p class="mt-3 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
					{passkeyStatus}
				</p>
			{/if}
		</div>
	</section>
</main>
