import { DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL } from '$env/static/private';

const deepSeekBaseUrl = DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const deepSeekModel = DEEPSEEK_MODEL || 'deepseek-v4-flash';

type ChatResponse = {
	choices?: Array<{
		message?: {
			content?: string | null;
		};
	}>;
	error?: {
		message?: string;
	};
};

export async function createDeepSeekJsonCompletion(systemPrompt: string, userPrompt: string) {
	if (!DEEPSEEK_API_KEY) {
		throw new Error('DEEPSEEK_API_KEY belum diset.');
	}

	const response = await fetch(`${deepSeekBaseUrl}/chat/completions`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: deepSeekModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			response_format: { type: 'json_object' },
			thinking: { type: 'disabled' },
			temperature: 0.1,
			max_tokens: 500
		})
	});

	const payload = (await response.json().catch(() => null)) as ChatResponse | null;

	if (!response.ok) {
		throw new Error(payload?.error?.message ?? 'DeepSeek gagal memproses input.');
	}

	const content = payload?.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error('DeepSeek mengembalikan respons kosong.');
	}

	return content;
}

export async function createDeepSeekTextCompletion(systemPrompt: string, userPrompt: string) {
	if (!DEEPSEEK_API_KEY) {
		throw new Error('DEEPSEEK_API_KEY belum diset.');
	}

	const response = await fetch(`${deepSeekBaseUrl}/chat/completions`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: deepSeekModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			temperature: 0.5
		})
	});

	const payload = (await response.json().catch(() => null)) as ChatResponse | null;

	if (!response.ok) {
		throw new Error(payload?.error?.message ?? 'DeepSeek gagal memproses konsultasi.');
	}

	const content = payload?.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error('DeepSeek mengembalikan respons kosong.');
	}

	return content;
}

export async function* createDeepSeekTextStream(
	systemPrompt: string,
	userPrompt: string
): AsyncGenerator<string, void, void> {
	if (!DEEPSEEK_API_KEY) {
		throw new Error('DEEPSEEK_API_KEY belum diset.');
	}

	const response = await fetch(`${deepSeekBaseUrl}/chat/completions`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
			'Content-Type': 'application/json',
			Accept: 'text/event-stream'
		},
		body: JSON.stringify({
			model: deepSeekModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			temperature: 0.5,
			stream: true
		})
	});

	if (!response.ok || !response.body) {
		const errBody = await response.text().catch(() => '');
		throw new Error(`DeepSeek error: ${errBody || response.statusText}`);
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });

			let newlineIndex: number;
			while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
				const rawLine = buffer.slice(0, newlineIndex);
				buffer = buffer.slice(newlineIndex + 1);
				const line = rawLine.trim();
				if (!line || !line.startsWith('data:')) continue;
				const data = line.slice(5).trim();
				if (data === '[DONE]') return;
				try {
					const json = JSON.parse(data) as {
						choices?: Array<{ delta?: { content?: string | null } }>;
					};
					const token = json.choices?.[0]?.delta?.content;
					if (typeof token === 'string' && token.length) {
						yield token;
					}
				} catch {
					// ignore malformed keepalive lines
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}
