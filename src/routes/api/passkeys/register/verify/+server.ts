import { json, type RequestHandler } from '@sveltejs/kit';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

import { verifyPasskeyRegistration } from '$lib/server/security/passkeys';

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const response = (await request.json()) as RegistrationResponseJSON;
		await verifyPasskeyRegistration(response, url);

		return json({ ok: true });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Passkey gagal didaftarkan.';
		return json({ ok: false, message }, { status: 400 });
	}
};
