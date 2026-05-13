import {
	CATEGORIES,
	dateInputToTimestamp,
	getLocalDateInputValue,
	isTransactionType,
	normalizeCategory,
	parseAmountInput,
	type TransactionType
} from '$lib/shared/money';

import type { TransactionItem } from '$lib/server/db/transactions';

import { createDeepSeekJsonCompletion } from './deepseek';

export type ParsedMoneyInput = {
	title: string;
	amount: number;
	type: TransactionType;
	category: string;
	merchant: string | null;
	note: string | null;
	items: TransactionItem[];
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
	items?: unknown;
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
      "items": [
        { "name": "sabun cuci muka", "qty": 1, "price": 0 },
        { "name": "ATK", "qty": 1, "price": 0 }
      ],
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
- "transactions" wajib array, minimal 1 elemen.

Aturan items (rincian barang dibeli):
- Jika user menyebut beberapa barang dalam satu transaksi (contoh "beli sabun cuci muka dan ATK 150rb"), pecah jadi items terpisah: [{name:"sabun cuci muka", qty:1, price:0}, {name:"ATK", qty:1, price:0}].
- Hanya isi price jika user menyebut harga per item ("kopi 25k dan roti 15k" -> price masing-masing 25000, 15000). Kalau cuma total disebut, set price 0 supaya user isi sendiri nanti.
- qty default 1 kecuali user sebut jumlah (mis "beli 2 botol air").
- Untuk income atau transaksi single (mis "gaji 5jt", "kopi 25k"), items boleh array kosong [].
- Hindari masukin items kalau cuma satu barang ya sudah jadi title.`;

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
	const items = normalizeItems(parsed.items, amount);

	return {
		title: title.slice(0, 80),
		amount,
		type,
		category: normalizeCategory(parsed.category),
		merchant: cleanAiString(parsed.merchant),
		note: cleanAiString(parsed.note),
		items,
		occurredAt,
		confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0.5
	};
}

function normalizeItems(raw: unknown, totalAmount: number): TransactionItem[] {
	if (!Array.isArray(raw)) return [];
	const items: TransactionItem[] = [];
	for (const entry of raw) {
		if (!entry || typeof entry !== 'object') continue;
		const obj = entry as Record<string, unknown>;
		const name = typeof obj.name === 'string' ? obj.name.trim() : '';
		if (!name) continue;
		const qty = Number(obj.qty);
		const price = Number(obj.price);
		items.push({
			name: name.slice(0, 80),
			qty: Number.isFinite(qty) && qty > 0 ? Math.round(qty) : 1,
			price: Number.isFinite(price) && price >= 0 ? Math.round(price) : 0
		});
	}

	if (items.length <= 1) return items.length === 1 ? [] : items;

	const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
	if (subtotal === 0 && totalAmount > 0) {
		const split = Math.floor(totalAmount / items.length);
		const remainder = totalAmount - split * items.length;
		return items.map((item, index) => ({
			...item,
			price: split + (index === items.length - 1 ? remainder : 0)
		}));
	}

	return items;
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
