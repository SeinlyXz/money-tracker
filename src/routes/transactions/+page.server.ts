import type { Actions, PageServerLoad } from './$types';

import { deleteTransactionAction } from '$lib/server/money-actions';
import { listTransactions } from '$lib/server/db/transactions';

export const load: PageServerLoad = async ({ depends }) => {
	depends('app:transactions');
	return {
		transactions: listTransactions(200)
	};
};

export const actions: Actions = {
	delete: deleteTransactionAction
};
