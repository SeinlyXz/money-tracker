import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { countPasskeys, getPasswordHash, hasPassword } from '$lib/server/db/security';
import { verifyPassword } from '$lib/server/security/password';
import { createSessionToken, setSessionCookie } from '$lib/server/security/session';

export const load: PageServerLoad = async ({ url }) => {
	if (!hasPassword()) {
		throw redirect(303, '/profile');
	}

	return {
		passkeyCount: countPasskeys(),
		redirectTo: url.searchParams.get('redirectTo') ?? '/'
	};
};

function sanitizeRedirect(value: FormDataEntryValue | null) {
	const target = typeof value === 'string' ? value : '';
	if (target.startsWith('/') && !target.startsWith('//')) {
		return target;
	}
	return '/';
}

export const actions: Actions = {
	password: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = String(formData.get('password') ?? '');
		const redirectTo = sanitizeRedirect(formData.get('redirectTo'));

		const stored = getPasswordHash();
		if (!stored) {
			throw redirect(303, '/profile');
		}

		if (!password || !verifyPassword(password, stored)) {
			return fail(400, {
				message: 'Password salah.',
				redirectTo
			});
		}

		setSessionCookie(cookies, createSessionToken());
		throw redirect(303, redirectTo);
	}
};
