import type { Actions, PageServerLoad } from './$types';

import { DEEPSEEK_API_KEY } from '$env/static/private';
import { deleteTransactionAction, quickAddAction } from '$lib/server/money-actions';
import {
	buildSummary,
	listTransactions,
	listTransactionsByDateRange
} from '$lib/server/db/transactions';
import { getLocalDateInputValue } from '$lib/shared/money';

export const load: PageServerLoad = async ({ depends }) => {
	depends('app:transactions');
	const transactions = listTransactions(6);

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
	const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
	const monthRows = listTransactionsByDateRange(monthStart, monthEnd);
	const summary = buildSummary(monthRows, now);
	const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(now);

	return {
		transactions,
		summary,
		monthLabel,
		monthlyTransactionCount: monthRows.length,
		today: getLocalDateInputValue(),
		hasDeepSeekKey: Boolean(DEEPSEEK_API_KEY)
	};
};

export const actions: Actions = {
	quickAdd: quickAddAction,
	delete: deleteTransactionAction
};
