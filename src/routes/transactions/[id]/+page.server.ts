import { error, fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';

import {
	deleteTransaction,
	getTransactionById,
	parseTransactionItems,
	updateTransactionItems,
	updateTransactionNote,
	type TransactionItem
} from '$lib/server/db/transactions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, depends }) => {
	depends('app:transactions');
	const row = getTransactionById(params.id);
	if (!row) {
		throw error(404, 'Transaksi tidak ditemukan');
	}

	return {
		transaction: row,
		items: parseTransactionItems(row.items)
	};
};

function readItems(formData: FormData): TransactionItem[] {
	const raw = String(formData.get('items') ?? '[]');
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return [];
	}
	if (!Array.isArray(parsed)) return [];
	const items: TransactionItem[] = [];
	for (const entry of parsed) {
		if (!entry || typeof entry !== 'object') continue;
		const e = entry as Record<string, unknown>;
		const name = typeof e.name === 'string' ? e.name.trim() : '';
		const qty = Number(e.qty);
		const price = Number(e.price);
		if (!name) continue;
		items.push({
			name: name.slice(0, 80),
			qty: Number.isFinite(qty) && qty > 0 ? Math.round(qty) : 1,
			price: Number.isFinite(price) && price >= 0 ? Math.round(price) : 0
		});
	}
	return items;
}

export const actions: Actions = {
	saveItems: async ({ params, request }: RequestEvent) => {
		const formData = await request.formData();
		const items = readItems(formData);
		const note = formData.get('note');
		try {
			updateTransactionItems(params.id!, items);
			if (typeof note === 'string') {
				updateTransactionNote(params.id!, note);
			}
			return { action: 'saveItems', message: 'Detail tersimpan.' };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Gagal menyimpan detail.';
			return fail(500, { action: 'saveItems', message });
		}
	},
	delete: async ({ params }: RequestEvent) => {
		deleteTransaction(params.id!);
		throw redirect(303, '/transactions');
	}
};
