import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { countPasskeys, hasPassword, setPasswordHash } from '$lib/server/db/security';
import { hashPassword } from '$lib/server/security/password';

export const load: PageServerLoad = async () => ({
	passwordConfigured: hasPassword(),
	passkeyCount: countPasskeys()
});

export const actions: Actions = {
	setPassword: async ({ request }) => {
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

		return {
			action: 'setPassword',
			message: 'Password berhasil disimpan.'
		};
	}
};
