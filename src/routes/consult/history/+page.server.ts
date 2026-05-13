import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';

import { deleteConsultNote, listConsultNotes } from '$lib/server/db/consult-notes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends }) => {
	depends('app:consult-notes');
	return {
		notes: listConsultNotes(100)
	};
};

export const actions: Actions = {
	delete: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();
		if (!id) {
			return fail(400, { action: 'delete', message: 'ID kosong.' });
		}
		try {
			deleteConsultNote(id);
			return { action: 'delete', message: 'Catatan dihapus.' };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Gagal menghapus.';
			return fail(500, { action: 'delete', message });
		}
	}
};
