import { randomBytes, scryptSync } from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
	const salt = randomBytes(16).toString('base64url');
	const hash = scryptSync(password, salt, KEY_LENGTH).toString('base64url');

	return `scrypt:${salt}:${hash}`;
}
