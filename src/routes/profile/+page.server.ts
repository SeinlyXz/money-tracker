import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import {
	countPasskeys,
	getShowNavLabels,
	getUserName,
	hasPassword,
	setPasswordHash,
	setShowNavLabels,
	setUserName
} from '$lib/server/db/security';
import { buildSummary, listTransactions } from '$lib/server/db/transactions';
import { hashPassword } from '$lib/server/security/password';
import { createSessionToken, setSessionCookie } from '$lib/server/security/session';

export const load: PageServerLoad = async () => {
	const summary = buildSummary(listTransactions(10000));
	return {
		passwordConfigured: hasPassword(),
		passkeyCount: countPasskeys(),
		userName: getUserName(),
		showNavLabels: getShowNavLabels(),
		balance: summary.totalIncome - summary.totalExpense,
		monthlyBalance: summary.monthlyBalance
	};
};

export const actions: Actions = {
	setPassword: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = String(formData.get('password') ?? '');
		const confirmPassword = String(formData.get('confirmPassword') ?? '');

		if (password.length < 6) {
			return fail(400, {
				action: 'setPassword',
				message: 'Password minimal 6 karakter.'
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				action: 'setPassword',
				message: 'Konfirmasi password tidak sama.'
			});
		}

		setPasswordHash(hashPassword(password));
		setSessionCookie(cookies, createSessionToken());

		return {
			action: 'setPassword',
			message: 'Password berhasil disimpan.'
		};
	},
	setName: async ({ request }) => {
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();

		if (name.length > 40) {
			return fail(400, {
				action: 'setName',
				message: 'Nama maksimal 40 karakter.'
			});
		}

		setUserName(name);

		return {
			action: 'setName',
			message: name ? `Nama disimpan: ${name}.` : 'Nama dihapus.'
		};
	},
	toggleNavLabels: async ({ request }) => {
		const formData = await request.formData();
		const enabled = formData.get('enabled') === 'true';
		setShowNavLabels(enabled);
		return {
			action: 'toggleNavLabels',
			message: enabled ? 'Label navigasi ditampilkan.' : 'Label navigasi disembunyikan.'
		};
	}
};
