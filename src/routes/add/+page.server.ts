import type { Actions, PageServerLoad } from './$types';

import { DEEPSEEK_API_KEY } from '$env/static/private';
import { manualAddAction, quickAddAction } from '$lib/server/money-actions';
import { getLocalDateInputValue } from '$lib/shared/money';

export const load: PageServerLoad = async () => ({
	today: getLocalDateInputValue(),
	hasDeepSeekKey: Boolean(DEEPSEEK_API_KEY)
});

export const actions: Actions = {
	quickAdd: quickAddAction,
	manualAdd: manualAddAction
};
