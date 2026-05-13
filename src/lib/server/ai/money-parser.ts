import {
	CATEGORIES,
	dateInputToTimestamp,
	getLocalDateInputValue,
	isTransactionType,
	normalizeCategory,
	parseAmountInput,
	type TransactionType
} from '$lib/shared/money';

import { createDeepSeekJsonCompletion } from './deepseek';

export type ParsedMoneyInput = {
	title: string;
	amount: number;
	type: TransactionType;
	category: string;
	merchant: string | null;
	note: string | null;
	occurredAt: number;
	confidence: number;
};

type AiMoneyJson = {
	title?: unknown;
	amount?: unknown;
	type?: unknown;
	category?: unknown;
	merchant?: unknown;
	note?: unknown;
	occurredOn?: unknown;
	confidence?: unknown;
};

export async function parseMoneyInputWithAi(
	input: string,
	now = new Date()
): Promise<ParsedMoneyInput> {
	const trimmed = input.trim();
	if (!trimmed) {
		throw new Error('Input cepat masih kosong.');
	}

	const today = getLocalDateInputValue(now);
	const systemPrompt = `Kamu adalah parser transaksi keuangan personal Indonesia. Balas hanya JSON valid.
Ambil data dari input user untuk money tracker.

Kategori valid: ${CATEGORIES.join(', ')}.
Format JSON:
{
  "title": "judul transaksi pendek",
  "amount": 25000,
  "type": "expense",
  "category": "Makan",
  "merchant": "nama tempat atau null",
  "note": "catatan tambahan atau null",
  "occurredOn": "${today}",
  "confidence": 0.9
}

Aturan:
- amount adalah integer IDR tanpa simbol mata uang.
- "25k" berarti 25000, "1.2jt" berarti 1200000.
- type hanya "expense" atau "income"; default expense kecuali jelas pemasukan/gaji/bonus/refund masuk.
- Jika tanggal tidak disebut, gunakan ${today}.
- Jika input ambigu, tetap buat tebakan terbaik dan turunkan confidence.`;

	const raw = await createDeepSeekJsonCompletion(systemPrompt, trimmed);
	const parsed = JSON.parse(raw) as AiMoneyJson;

	return normalizeParsedMoney(parsed, trimmed);
}

function normalizeParsedMoney(parsed: AiMoneyJson, fallbackTitle: string): ParsedMoneyInput {
	const amount = parseAmountInput(
		typeof parsed.amount === 'string' || typeof parsed.amount === 'number' ? parsed.amount : null
	);
	const title =
		typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : fallbackTitle;
	const type = isTransactionType(parsed.type) ? parsed.type : inferType(fallbackTitle);
	const occurredAt = dateInputToTimestamp(
		typeof parsed.occurredOn === 'string' ? parsed.occurredOn.slice(0, 10) : null
	);
	const confidence = Number(parsed.confidence);

	return {
		title: title.slice(0, 80),
		amount,
		type,
		category: normalizeCategory(parsed.category),
		merchant: cleanAiString(parsed.merchant),
		note: cleanAiString(parsed.note),
		occurredAt,
		confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0.5
	};
}

function inferType(input: string): TransactionType {
	const normalized = input.toLowerCase();
	return /\b(gaji|salary|bonus|refund|cashback|masuk|dibayar|terima)\b/.test(normalized)
		? 'income'
		: 'expense';
}

function cleanAiString(value: unknown) {
	if (typeof value !== 'string') {
		return null;
	}

	const cleaned = value.trim();
	return cleaned && cleaned.toLowerCase() !== 'null' ? cleaned.slice(0, 120) : null;
}
