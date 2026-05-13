import { redirect, type RequestHandler } from '@sveltejs/kit';

import { clearSessionCookie } from '$lib/server/security/session';

export const POST: RequestHandler = ({ cookies }) => {
	clearSessionCookie(cookies);
	throw redirect(303, '/login');
};

export const GET: RequestHandler = ({ cookies }) => {
	clearSessionCookie(cookies);
	throw redirect(303, '/login');
};
