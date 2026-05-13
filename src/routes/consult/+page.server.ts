import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';

import { DEEPSEEK_API_KEY } from '$env/static/private';
import { buildConsultContext, type ConsultRange } from '$lib/server/ai/consultant';
import { createConsultNote } from '$lib/server/db/consult-notes';
import type { PageServerLoad } from './$types';

const VALID_RANGES: ConsultRange[] = ['week', 'month', 'quarter', 'year', 'all'];

function parseRange(value: FormDataEntryValue | string | null): ConsultRange {
	const value$ = typeof value === 'string' ? value : '';
	return VALID_RANGES.includes(value$ as ConsultRange) ? (value$ as ConsultRange) : 'month';
}

export const load: PageServerLoad = async () => {
	const defaultContext = buildConsultContext('month');
	return {
		hasDeepSeekKey: Boolean(DEEPSEEK_API_KEY),
		defaultRange: 'month' as ConsultRange,
		preview: {
			rangeLabel: defaultContext.rangeLabel,
			transactionCount: defaultContext.transactionCount,
			summary: defaultContext.summary,
			topMerchants: defaultContext.topMerchants
		}
	};
};

export const actions: Actions = {
	saveNote: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const range = parseRange(formData.get('range'));
		const rangeLabel = String(formData.get('rangeLabel') ?? '').trim() || 'Tanpa rentang';
		const prompt = String(formData.get('prompt') ?? '').trim();
		const answer = String(formData.get('answer') ?? '').trim();
		const transactionCount = Number(formData.get('transactionCount'));

		if (!answer) {
			return fail(400, { action: 'saveNote', message: 'Tidak ada jawaban untuk disimpan.' });
		}

		try {
			const note = createConsultNote({
				range,
				rangeLabel,
				prompt,
				answer,
				transactionCount: Number.isFinite(transactionCount) ? transactionCount : 0
			});
			return {
				action: 'saveNote',
				message: 'Catatan AI disimpan.',
				savedNoteId: note.id
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Gagal menyimpan catatan.';
			return fail(500, { action: 'saveNote', message });
		}
	}
};
