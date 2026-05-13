import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

import { getSessionSecret } from '$lib/server/db/security';

export const SESSION_COOKIE = 'mt_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function sign(payload: string) {
	return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function encode(value: { issuedAt: number }) {
	return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function decode(payload: string) {
	try {
		const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
		if (typeof parsed?.issuedAt !== 'number') {
			return null;
		}
		return parsed as { issuedAt: number };
	} catch {
		return null;
	}
}

export function createSessionToken() {
	const payload = encode({ issuedAt: Date.now() });
	const signature = sign(payload);
	return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
	if (!token) {
		return false;
	}

	const [payload, signature] = token.split('.');
	if (!payload || !signature) {
		return false;
	}

	const expected = sign(payload);
	const expectedBuffer = Buffer.from(expected, 'base64url');
	const candidateBuffer = Buffer.from(signature, 'base64url');

	if (expectedBuffer.length !== candidateBuffer.length) {
		return false;
	}

	if (!timingSafeEqual(expectedBuffer, candidateBuffer)) {
		return false;
	}

	const data = decode(payload);
	if (!data) {
		return false;
	}

	return Date.now() - data.issuedAt < SESSION_TTL_MS;
}

export function setSessionCookie(cookies: Cookies, token: string) {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_TTL_MS / 1000
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
