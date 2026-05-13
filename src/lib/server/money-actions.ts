import { fail, type RequestEvent } from '@sveltejs/kit';

import { parseMoneyInputsWithAi } from '$lib/server/ai/money-parser';
import { createTransaction, deleteTransaction } from '$lib/server/db/transactions';
import {
	dateInputToTimestamp,
	isTransactionType,
	normalizeCategory,
	parseAmountInput
} from '$lib/shared/money';

export async function quickAddAction({ request }: RequestEvent) {
	const formData = await request.formData();
	const prompt = String(formData.get('prompt') ?? '').trim();

	if (!prompt) {
		return fail(400, { action: 'quickAdd', message: 'Tulis transaksi dulu.' });
	}

	try {
		const parsedList = (await parseMoneyInputsWithAi(prompt)).filter((entry) => entry.amount > 0);

		if (!parsedList.length) {
			return fail(400, {
				action: 'quickAdd',
				message: 'Nominal belum terbaca. Coba tulis seperti "kopi 25k tadi pagi".',
				prompt
			});
		}

		for (const parsed of parsedList) {
			createTransaction({
				title: parsed.title,
				amount: parsed.amount,
				type: parsed.type,
				category: parsed.category,
				merchant: parsed.merchant,
				note: parsed.note,
				items: parsed.items,
				sourceText: prompt,
				occurredAt: parsed.occurredAt
			});
		}

		const message =
			parsedList.length === 1
				? `Tersimpan: ${parsedList[0].title}`
				: `Tersimpan ${parsedList.length} transaksi: ${parsedList.map((entry) => entry.title).join(', ')}`;

		return {
			action: 'quickAdd',
			message,
			prompt: ''
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Input cepat gagal diproses.';
		return fail(500, { action: 'quickAdd', message, prompt });
	}
}

export async function manualAddAction({ request }: RequestEvent) {
	const formData = await request.formData();
	const title = String(formData.get('title') ?? '').trim();
	const amount = parseAmountInput(formData.get('amount'));
	const rawType = formData.get('type');
	const type = isTransactionType(rawType) ? rawType : 'expense';

	if (!title) {
		return fail(400, { action: 'manualAdd', message: 'Judul transaksi wajib diisi.' });
	}

	if (amount <= 0) {
		return fail(400, { action: 'manualAdd', message: 'Nominal harus lebih dari 0.' });
	}

	createTransaction({
		title,
		amount,
		type,
		category: normalizeCategory(formData.get('category')),
		merchant: String(formData.get('merchant') ?? ''),
		note: String(formData.get('note') ?? ''),
		sourceText: null,
		occurredAt: dateInputToTimestamp(formData.get('occurredOn'))
	});

	return { action: 'manualAdd', message: 'Transaksi manual tersimpan.' };
}

export async function deleteTransactionAction({ request }: RequestEvent) {
	const formData = await request.formData();
	const id = String(formData.get('id') ?? '');

	if (id) {
		deleteTransaction(id);
	}

	return { action: 'delete', message: 'Transaksi dihapus.' };
}
