import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse
} from '@simplewebauthn/server';
import type {
	AuthenticationResponseJSON,
	AuthenticatorTransportFuture,
	RegistrationResponseJSON
} from '@simplewebauthn/server';

import {
	createPasskey,
	getPasskey,
	getPasskeyAuthChallenge,
	getPasskeyChallenge,
	listPasskeys,
	setPasskeyAuthChallenge,
	setPasskeyChallenge,
	updatePasskeyCounter
} from '$lib/server/db/security';

const RP_NAME = 'Money Tracker';
const USER_ID = new TextEncoder().encode('money-tracker-local-user');
const USER_NAME = 'local-profile';
const USER_DISPLAY_NAME = 'Local Profile';

export async function createPasskeyRegistrationOptions(origin: URL) {
	const rpID = getRpId(origin);
	const existingPasskeys = listPasskeys();

	const options = await generateRegistrationOptions({
		rpName: RP_NAME,
		rpID,
		userID: USER_ID,
		userName: USER_NAME,
		userDisplayName: USER_DISPLAY_NAME,
		timeout: 60_000,
		attestationType: 'none',
		excludeCredentials: existingPasskeys.map((passkey) => ({
			id: passkey.id,
			transports: parseTransports(passkey.transports)
		})),
		authenticatorSelection: {
			residentKey: 'preferred',
			userVerification: 'preferred'
		}
	});

	setPasskeyChallenge(options.challenge);
	return options;
}

export async function verifyPasskeyRegistration(response: RegistrationResponseJSON, origin: URL) {
	const challenge = getPasskeyChallenge();
	if (!challenge) {
		throw new Error('Challenge passkey tidak ditemukan. Coba ulangi dari tombol tambah passkey.');
	}

	const verification = await verifyRegistrationResponse({
		response,
		expectedChallenge: challenge,
		expectedOrigin: origin.origin,
		expectedRPID: getRpId(origin),
		requireUserVerification: false
	});

	if (!verification.verified) {
		throw new Error('Verifikasi passkey gagal.');
	}

	const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

	createPasskey({
		id: credential.id,
		publicKey: Buffer.from(credential.publicKey).toString('base64url'),
		counter: credential.counter,
		transports: JSON.stringify(response.response.transports ?? credential.transports ?? []),
		deviceType: credentialDeviceType,
		backedUp: credentialBackedUp
	});

	return verification;
}

export async function createPasskeyAuthenticationOptions(origin: URL) {
	const rpID = getRpId(origin);
	const existingPasskeys = listPasskeys();

	const options = await generateAuthenticationOptions({
		rpID,
		timeout: 60_000,
		userVerification: 'preferred',
		allowCredentials: existingPasskeys.map((passkey) => ({
			id: passkey.id,
			transports: parseTransports(passkey.transports)
		}))
	});

	setPasskeyAuthChallenge(options.challenge);
	return options;
}

export async function verifyPasskeyAuthentication(
	response: AuthenticationResponseJSON,
	origin: URL
) {
	const challenge = getPasskeyAuthChallenge();
	if (!challenge) {
		throw new Error('Challenge passkey tidak ditemukan. Coba ulangi proses login.');
	}

	const passkey = getPasskey(response.id);
	if (!passkey) {
		throw new Error('Passkey tidak terdaftar.');
	}

	const verification = await verifyAuthenticationResponse({
		response,
		expectedChallenge: challenge,
		expectedOrigin: origin.origin,
		expectedRPID: getRpId(origin),
		requireUserVerification: false,
		credential: {
			id: passkey.id,
			publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64url')),
			counter: passkey.counter,
			transports: parseTransports(passkey.transports)
		}
	});

	if (!verification.verified) {
		throw new Error('Verifikasi passkey gagal.');
	}

	updatePasskeyCounter(passkey.id, verification.authenticationInfo.newCounter);
	return verification;
}

function getRpId(origin: URL) {
	return origin.hostname;
}

function parseTransports(value: string | null): AuthenticatorTransportFuture[] | undefined {
	if (!value) {
		return undefined;
	}

	const parsed = JSON.parse(value) as AuthenticatorTransportFuture[];
	return parsed.length ? parsed : undefined;
}
