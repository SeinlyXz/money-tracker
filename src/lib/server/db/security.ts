import { eq } from 'drizzle-orm';

import { db } from './index';
import { appSettings, passkeys, type NewPasskey } from './schema';

const PASSWORD_HASH_KEY = 'password_hash';
const PASSKEY_CHALLENGE_KEY = 'passkey_registration_challenge';

export function getSetting(key: string) {
	return db.select().from(appSettings).where(eq(appSettings.key, key)).get();
}

export function setSetting(key: string, value: string) {
	db.insert(appSettings)
		.values({ key, value, updatedAt: Date.now() })
		.onConflictDoUpdate({
			target: appSettings.key,
			set: { value, updatedAt: Date.now() }
		})
		.run();
}

export function hasPassword() {
	return Boolean(getSetting(PASSWORD_HASH_KEY)?.value);
}

export function setPasswordHash(value: string) {
	setSetting(PASSWORD_HASH_KEY, value);
}

export function getPasskeyChallenge() {
	return getSetting(PASSKEY_CHALLENGE_KEY)?.value ?? null;
}

export function setPasskeyChallenge(challenge: string) {
	setSetting(PASSKEY_CHALLENGE_KEY, challenge);
}

export function listPasskeys() {
	return db.select().from(passkeys).all();
}

export function countPasskeys() {
	return listPasskeys().length;
}

export function createPasskey(input: Omit<NewPasskey, 'createdAt' | 'updatedAt'>) {
	const now = Date.now();

	db.insert(passkeys)
		.values({
			...input,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoNothing()
		.run();
}
