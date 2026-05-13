import { and, desc, eq, gte, lte } from 'drizzle-orm';

import { normalizeCategory, type TransactionType } from '$lib/shared/money';

import { db } from './index';
import { transactions, type NewTransaction, type Transaction } from './schema';

export type TransactionInput = {
	title: string;
	amount: number;
	type: TransactionType;
	category?: string;
	merchant?: string | null;
	note?: string | null;
	sourceText?: string | null;
	occurredAt: number;
};

export type TransactionSummary = {
	monthlyExpense: number;
	monthlyIncome: number;
	monthlyBalance: number;
	totalExpense: number;
	totalIncome: number;
	byCategory: Array<{ category: string; total: number; count: number }>;
};

export function listTransactions(limit = 80) {
	return db
		.select()
		.from(transactions)
		.orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
		.limit(limit)
		.all();
}

export function createTransaction(input: TransactionInput) {
	const now = Date.now();
	const row: NewTransaction = {
		id: crypto.randomUUID(),
		title: input.title.trim(),
		amount: Math.round(input.amount),
		type: input.type,
		category: normalizeCategory(input.category),
		merchant: cleanOptional(input.merchant),
		note: cleanOptional(input.note),
		sourceText: cleanOptional(input.sourceText),
		occurredAt: input.occurredAt,
		createdAt: now,
		updatedAt: now
	};

	db.insert(transactions).values(row).run();
	return row;
}

export function deleteTransaction(id: string) {
	db.delete(transactions).where(eq(transactions.id, id)).run();
}

export function buildSummary(rows: Transaction[], today = new Date()): TransactionSummary {
	const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
	const monthEnd = new Date(
		today.getFullYear(),
		today.getMonth() + 1,
		0,
		23,
		59,
		59,
		999
	).getTime();
	const categoryMap = new Map<string, { total: number; count: number }>();

	let monthlyExpense = 0;
	let monthlyIncome = 0;
	let totalExpense = 0;
	let totalIncome = 0;

	for (const row of rows) {
		if (row.type === 'expense') {
			totalExpense += row.amount;
			const current = categoryMap.get(row.category) ?? { total: 0, count: 0 };
			categoryMap.set(row.category, {
				total: current.total + row.amount,
				count: current.count + 1
			});
		} else {
			totalIncome += row.amount;
		}

		if (row.occurredAt >= monthStart && row.occurredAt <= monthEnd) {
			if (row.type === 'expense') {
				monthlyExpense += row.amount;
			} else {
				monthlyIncome += row.amount;
			}
		}
	}

	return {
		monthlyExpense,
		monthlyIncome,
		monthlyBalance: monthlyIncome - monthlyExpense,
		totalExpense,
		totalIncome,
		byCategory: Array.from(categoryMap.entries())
			.map(([category, value]) => ({ category, ...value }))
			.sort((a, b) => b.total - a.total)
			.slice(0, 6)
	};
}

export function listTransactionsByDateRange(start: number, end: number) {
	return db
		.select()
		.from(transactions)
		.where(and(gte(transactions.occurredAt, start), lte(transactions.occurredAt, end)))
		.orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
		.all();
}

function cleanOptional(value: string | null | undefined) {
	const cleaned = value?.trim();
	return cleaned ? cleaned : null;
}
