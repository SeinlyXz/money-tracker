import type { PageServerLoad } from './$types';

import { buildSummary, listTransactions } from '$lib/server/db/transactions';

export const load: PageServerLoad = async ({ depends }) => {
	depends('app:transactions');
	const transactions = listTransactions(400);

	return {
		transactions,
		summary: buildSummary(transactions)
	};
};
