import { json, type RequestHandler } from '@sveltejs/kit';

import { createPasskeyRegistrationOptions } from '$lib/server/security/passkeys';

export const GET: RequestHandler = async ({ url }) => {
	const options = await createPasskeyRegistrationOptions(url);
	return json(options);
};
