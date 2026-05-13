import { redirect, type Handle } from '@sveltejs/kit';

import { countPasskeys, hasPassword } from '$lib/server/db/security';
import { SESSION_COOKIE, verifySessionToken } from '$lib/server/security/session';

const PUBLIC_PATHS = ['/login', '/api/passkeys/authenticate'];
const ONBOARDING_ALLOWED_PATHS = ['/profile', '/api/passkeys/register'];

function matchesPath(pathname: string, paths: string[]) {
	return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.authenticated = verifySessionToken(token);

	const hasCredential = hasPassword() || countPasskeys() > 0;
	const pathname = event.url.pathname;

	if (!hasCredential) {
		if (!matchesPath(pathname, ONBOARDING_ALLOWED_PATHS)) {
			throw redirect(303, '/profile');
		}
		return resolve(event);
	}

	if (!event.locals.authenticated && !matchesPath(pathname, PUBLIC_PATHS)) {
		if (event.request.method === 'GET') {
			throw redirect(303, `/login?redirectTo=${encodeURIComponent(pathname + event.url.search)}`);
		}
		throw redirect(303, '/login');
	}

	if (event.locals.authenticated && pathname === '/login') {
		throw redirect(303, '/');
	}

	return resolve(event);
};
