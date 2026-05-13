import { json, type RequestHandler } from '@sveltejs/kit';

import { countPasskeys } from '$lib/server/db/security';
import { createPasskeyAuthenticationOptions } from '$lib/server/security/passkeys';

export const GET: RequestHandler = async ({ url }) => {
	if (countPasskeys() === 0) {
		return json({ message: 'Belum ada passkey terdaftar.' }, { status: 404 });
	}

	const options = await createPasskeyAuthenticationOptions(url);
	return json(options);
};
