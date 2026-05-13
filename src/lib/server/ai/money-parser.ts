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

type AiMoneyEnvelope = {
	transactions?: unknown;
};

export async function parseMoneyInputsWithAi(
	input: string,
	now = new Date()
): Promise<ParsedMoneyInput[]> {
	const trimmed = input.trim();
	if (!trimmed) {
		throw new Error('Input cepat masih kosong.');
	}

	const today = getLocalDateInputValue(now);
	const systemPrompt = `Kamu adalah parser transaksi keuangan personal Indonesia. Balas hanya JSON valid.
Tugasmu: pecah input user menjadi DAFTAR transaksi (bisa lebih dari satu).

Kategori valid: ${CATEGORIES.join(', ')}.
Format JSON wajib:
{
  "transactions": [
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
  ]
}

Aturan:
- Setiap nominal yang berbeda = satu transaksi terpisah. Contoh "pemasukan 85 ribu dan 316 ribu" -> 2 transaksi income.
- Kalimat seperti "kopi 25k dan bensin 30k" -> 2 transaksi expense.
- Jika user nyebut beberapa nominal tapi konteksnya satu transaksi (mis. "bayar listrik 150rb pakai uang 200rb"), tetap satu transaksi pakai nominal pengeluaran sebenarnya.
- amount = integer IDR tanpa simbol. "25k"=25000, "85 ribu"=85000, "316.000"=316000, "1.2jt"=1200000.
- type "expense" atau "income"; default expense kecuali jelas pemasukan/gaji/bonus/refund/terima/masuk -> income.
- Jika tanggal tidak disebut, pakai ${today}.
- Jika ambigu, tetap buat tebakan terbaik dan turunkan confidence.
- "transactions" wajib array, minimal 1 elemen.`;

	const raw = await createDeepSeekJsonCompletion(systemPrompt, trimmed);
	const parsed = JSON.parse(raw) as AiMoneyEnvelope | AiMoneyJson;

	const list = Array.isArray((parsed as AiMoneyEnvelope).transactions)
		? ((parsed as AiMoneyEnvelope).transactions as AiMoneyJson[])
		: [parsed as AiMoneyJson];

	const normalized = list
		.map((entry) => normalizeParsedMoney(entry, trimmed))
		.filter((entry) => entry.amount > 0);

	if (!normalized.length) {
		const fallback = normalizeParsedMoney(list[0] ?? {}, trimmed);
		return [fallback];
	}

	return normalized;
}

export async function parseMoneyInputWithAi(
	input: string,
	now = new Date()
): Promise<ParsedMoneyInput> {
	const list = await parseMoneyInputsWithAi(input, now);
	return list[0];
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
