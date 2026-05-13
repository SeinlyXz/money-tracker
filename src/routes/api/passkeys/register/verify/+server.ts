import { json, type RequestHandler } from '@sveltejs/kit';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

import { countPasskeys, hasPassword } from '$lib/server/db/security';
import { verifyPasskeyRegistration } from '$lib/server/security/passkeys';
import { createSessionToken, setSessionCookie } from '$lib/server/security/session';

export const POST: RequestHandler = async ({ request, url, cookies, locals }) => {
	try {
		const wasFirstCredential = !hasPassword() && countPasskeys() === 0;
		const response = (await request.json()) as RegistrationResponseJSON;
		await verifyPasskeyRegistration(response, url);

		if (wasFirstCredential && !locals.authenticated) {
			setSessionCookie(cookies, createSessionToken());
		}

		return json({ ok: true });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Passkey gagal didaftarkan.';
		return json({ ok: false, message }, { status: 400 });
	}
};
