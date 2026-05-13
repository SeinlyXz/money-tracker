import type { PageServerLoad } from './$types';

import { buildSummary, listTransactions } from '$lib/server/db/transactions';

export const load: PageServerLoad = async () => {
	const transactions = listTransactions(200);

	return {
		transactions,
		summary: buildSummary(transactions)
	};
};
