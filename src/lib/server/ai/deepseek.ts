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
