import type { LayoutServerLoad } from './$types';

import { hasPassword } from '$lib/server/db/security';

export const load: LayoutServerLoad = async ({ locals }) => ({
	authenticated: locals.authenticated,
	passwordConfigured: hasPassword()
});
