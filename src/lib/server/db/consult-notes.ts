import { desc, eq } from 'drizzle-orm';

import { db } from './index';
import { consultNotes, type ConsultNote, type NewConsultNote } from './schema';

export type ConsultNoteInput = {
	range: string;
	rangeLabel: string;
	prompt: string;
	answer: string;
	transactionCount: number;
};

export function createConsultNote(input: ConsultNoteInput): ConsultNote {
	const row: NewConsultNote = {
		id: crypto.randomUUID(),
		range: input.range,
		rangeLabel: input.rangeLabel,
		prompt: input.prompt.trim(),
		answer: input.answer.trim(),
		transactionCount: input.transactionCount,
		createdAt: Date.now()
	};

	db.insert(consultNotes).values(row).run();
	return row as ConsultNote;
}

export function listConsultNotes(limit = 50) {
	return db.select().from(consultNotes).orderBy(desc(consultNotes.createdAt)).limit(limit).all();
}

export function getConsultNoteById(id: string) {
	return db.select().from(consultNotes).where(eq(consultNotes.id, id)).get();
}

export function deleteConsultNote(id: string) {
	db.delete(consultNotes).where(eq(consultNotes.id, id)).run();
}
