export const TRANSACTION_TYPES = ['expense', 'income'] as const;
export const CATEGORIES = [
	'Makan',
	'Transport',
	'Belanja',
	'Tagihan',
	'Hiburan',
	'Kesehatan',
	'Pendidikan',
	'Hadiah',
	'Gaji',
	'Investasi',
	'Lainnya'
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type Category = (typeof CATEGORIES)[number];

export const DEFAULT_CATEGORY: Category = 'Lainnya';

export function isTransactionType(value: unknown): value is TransactionType {
	return value === 'expense' || value === 'income';
}

export function normalizeCategory(value: unknown): Category {
	if (typeof value !== 'string') {
		return DEFAULT_CATEGORY;
	}

	const normalized = value.trim().toLowerCase();
	return CATEGORIES.find((category) => category.toLowerCase() === normalized) ?? DEFAULT_CATEGORY;
}

export function formatCurrency(amount: number) {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	}).format(amount);
}

export function parseAmountInput(value: FormDataEntryValue | string | number | null): number {
	if (typeof value === 'number') {
		return Math.round(value);
	}

	if (typeof value !== 'string') {
		return 0;
	}

	const normalized = value.trim().toLowerCase().replace(/\s/g, '');
	if (!normalized) {
		return 0;
	}

	const multiplier = normalized.endsWith('k') ? 1_000 : normalized.endsWith('jt') ? 1_000_000 : 1;
	const withoutSuffix = normalized.replace(/(jt|k)$/i, '');
	const numeric = Number(
		withoutSuffix
			.replace(/[^\d,.-]/g, '')
			.replace(/\./g, '')
			.replace(',', '.')
	);

	if (!Number.isFinite(numeric)) {
		return 0;
	}

	return Math.max(0, Math.round(numeric * multiplier));
}

export function getLocalDateInputValue(date = new Date()) {
	const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return offsetDate.toISOString().slice(0, 10);
}

export function dateInputToTimestamp(value: FormDataEntryValue | string | null) {
	const dateValue = typeof value === 'string' && value ? value : getLocalDateInputValue();
	const parsed = new Date(`${dateValue}T12:00:00`);

	if (Number.isNaN(parsed.getTime())) {
		return Date.now();
	}

	return parsed.getTime();
}

export function formatShortDate(timestamp: number) {
	return new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(new Date(timestamp));
}

export function formatMonthYear(timestamp: number) {
	return new Intl.DateTimeFormat('id-ID', {
		month: 'long',
		year: 'numeric'
	}).format(new Date(timestamp));
}

export function monthKey(timestamp: number) {
	const d = new Date(timestamp);
	return `${d.getFullYear()}-${d.getMonth()}`;
}
