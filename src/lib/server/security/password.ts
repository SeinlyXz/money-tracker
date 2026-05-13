import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
	const salt = randomBytes(16).toString('base64url');
	const hash = scryptSync(password, salt, KEY_LENGTH).toString('base64url');

	return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
	const parts = stored.split(':');
	if (parts.length !== 3 || parts[0] !== 'scrypt') {
		return false;
	}

	const [, salt, expected] = parts;
	const expectedBuffer = Buffer.from(expected, 'base64url');
	const candidate = scryptSync(password, salt, expectedBuffer.length);

	if (candidate.length !== expectedBuffer.length) {
		return false;
	}

	return timingSafeEqual(candidate, expectedBuffer);
}
