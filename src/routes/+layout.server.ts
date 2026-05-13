import type { LayoutServerLoad } from './$types';

import { countPasskeys, getUserName, hasPassword } from '$lib/server/db/security';

export const load: LayoutServerLoad = async ({ locals }) => {
	const passwordConfigured = hasPassword();
	const passkeyCount = countPasskeys();

	return {
		authenticated: locals.authenticated,
		passwordConfigured,
		passkeyCount,
		hasCredential: passwordConfigured || passkeyCount > 0,
		userName: getUserName()
	};
};
