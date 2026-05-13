import { json, type RequestHandler } from '@sveltejs/kit';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';

import { verifyPasskeyAuthentication } from '$lib/server/security/passkeys';
import { createSessionToken, setSessionCookie } from '$lib/server/security/session';

export const POST: RequestHandler = async ({ request, url, cookies }) => {
	try {
		const response = (await request.json()) as AuthenticationResponseJSON;
		await verifyPasskeyAuthentication(response, url);

		setSessionCookie(cookies, createSessionToken());
		return json({ ok: true });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Passkey gagal diverifikasi.';
		return json({ ok: false, message }, { status: 400 });
	}
};
