import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';

import { db } from './index';
import { appSettings, passkeys, type NewPasskey } from './schema';

const PASSWORD_HASH_KEY = 'password_hash';
const PASSKEY_CHALLENGE_KEY = 'passkey_registration_challenge';
const PASSKEY_AUTH_CHALLENGE_KEY = 'passkey_authentication_challenge';
const SESSION_SECRET_KEY = 'session_secret';
const USER_NAME_KEY = 'user_name';

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

export function getPasswordHash() {
	return getSetting(PASSWORD_HASH_KEY)?.value ?? null;
}

export function getPasskeyChallenge() {
	return getSetting(PASSKEY_CHALLENGE_KEY)?.value ?? null;
}

export function setPasskeyChallenge(challenge: string) {
	setSetting(PASSKEY_CHALLENGE_KEY, challenge);
}

export function getPasskeyAuthChallenge() {
	return getSetting(PASSKEY_AUTH_CHALLENGE_KEY)?.value ?? null;
}

export function setPasskeyAuthChallenge(challenge: string) {
	setSetting(PASSKEY_AUTH_CHALLENGE_KEY, challenge);
}

export function getUserName() {
	return getSetting(USER_NAME_KEY)?.value ?? null;
}

export function setUserName(value: string) {
	const trimmed = value.trim();
	if (!trimmed) {
		db.delete(appSettings).where(eq(appSettings.key, USER_NAME_KEY)).run();
		return;
	}
	setSetting(USER_NAME_KEY, trimmed);
}

export function getSessionSecret() {
	const existing = getSetting(SESSION_SECRET_KEY)?.value;
	if (existing) {
		return existing;
	}

	const generated = randomBytes(32).toString('base64url');
	setSetting(SESSION_SECRET_KEY, generated);
	return generated;
}

export function listPasskeys() {
	return db.select().from(passkeys).all();
}

export function getPasskey(id: string) {
	return db.select().from(passkeys).where(eq(passkeys.id, id)).get();
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

export function updatePasskeyCounter(id: string, counter: number) {
	db.update(passkeys)
		.set({ counter, updatedAt: Date.now() })
		.where(eq(passkeys.id, id))
		.run();
}
