import {
	buildSummary,
	listTransactionsByDateRange,
	type TransactionSummary
} from '$lib/server/db/transactions';
import { formatCurrency } from '$lib/shared/money';

import { createDeepSeekTextCompletion } from './deepseek';

export type ConsultRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

export type ConsultContext = {
	range: ConsultRange;
	from: number;
	to: number;
	rangeLabel: string;
	transactionCount: number;
	summary: TransactionSummary;
	topMerchants: Array<{ merchant: string; total: number; count: number }>;
};

export function resolveRange(range: ConsultRange, now = new Date()) {
	const to = new Date(now);
	to.setHours(23, 59, 59, 999);
	const from = new Date(now);
	from.setHours(0, 0, 0, 0);
	let label = 'Minggu ini';

	switch (range) {
		case 'week':
			from.setDate(from.getDate() - 6);
			label = '7 hari terakhir';
			break;
		case 'month':
			from.setDate(from.getDate() - 29);
			label = '30 hari terakhir';
			break;
		case 'quarter':
			from.setDate(from.getDate() - 89);
			label = '90 hari terakhir';
			break;
		case 'year':
			from.setDate(from.getDate() - 364);
			label = '1 tahun terakhir';
			break;
		case 'all':
			from.setFullYear(2000, 0, 1);
			label = 'Sepanjang waktu';
			break;
	}

	return { from: from.getTime(), to: to.getTime(), label };
}

export function buildConsultContext(range: ConsultRange, now = new Date()): ConsultContext {
	const { from, to, label } = resolveRange(range, now);
	const rows = listTransactionsByDateRange(from, to);
	const summary = buildSummary(rows, now);

	const merchantMap = new Map<string, { total: number; count: number }>();
	for (const row of rows) {
		if (row.type !== 'expense') continue;
		const key = (row.merchant ?? row.title).trim();
		if (!key) continue;
		const current = merchantMap.get(key) ?? { total: 0, count: 0 };
		merchantMap.set(key, { total: current.total + row.amount, count: current.count + 1 });
	}

	const topMerchants = Array.from(merchantMap.entries())
		.map(([merchant, value]) => ({ merchant, ...value }))
		.sort((a, b) => b.total - a.total)
		.slice(0, 5);

	return {
		range,
		from,
		to,
		rangeLabel: label,
		transactionCount: rows.length,
		summary,
		topMerchants
	};
}

function formatDate(timestamp: number) {
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(new Date(timestamp));
}

export async function askFinancialConsultant(context: ConsultContext, userPrompt: string) {
	const summaryLines: string[] = [
		`Rentang: ${context.rangeLabel} (${formatDate(context.from)} - ${formatDate(context.to)})`,
		`Jumlah transaksi: ${context.transactionCount}`,
		`Total pemasukan: ${formatCurrency(context.summary.totalIncome)}`,
		`Total pengeluaran: ${formatCurrency(context.summary.totalExpense)}`,
		`Saldo bersih: ${formatCurrency(context.summary.totalIncome - context.summary.totalExpense)}`
	];

	if (context.summary.byCategory.length) {
		summaryLines.push('Top kategori pengeluaran:');
		context.summary.byCategory.slice(0, 6).forEach((category, index) => {
			summaryLines.push(
				`  ${index + 1}. ${category.category} - ${formatCurrency(category.total)} (${category.count} transaksi)`
			);
		});
	}

	if (context.topMerchants.length) {
		summaryLines.push('Merchant/judul paling sering:');
		context.topMerchants.forEach((merchant, index) => {
			summaryLines.push(
				`  ${index + 1}. ${merchant.merchant} - ${formatCurrency(merchant.total)} (${merchant.count}x)`
			);
		});
	}

	const systemPrompt = `Kamu adalah konsultan keuangan personal bahasa Indonesia yang ramah, jujur, dan praktis.
Selalu jawab dalam markdown ringkas (tanpa heading H1). Pakai bullet, bold, dan emoji sesuai konteks (hemat).
Susun jawaban dengan struktur:
1. **Ringkasan kondisi** (1-2 kalimat).
2. **Yang perlu dikurangi** (bullet, sebutkan kategori/merchant spesifik dari data).
3. **Rekomendasi konkret** (bullet, langkah nyata, target nominal kalau bisa).
4. **Proyeksi** (estimasi keuangan ke depan jika pola ini terus / kalau dikurangi).
5. **Catatan akhir** (1 kalimat motivasi atau peringatan).

Jangan mengarang angka. Berbasis data berikut. Kalau data kurang, bilang.`;

	const userContent = `DATA KEUANGAN:\n${summaryLines.join('\n')}\n\nPERTANYAAN:\n${userPrompt.trim() || 'Berikan analisis menyeluruh dan rekomendasi terbaik untuk keuangan saya.'}`;

	return createDeepSeekTextCompletion(systemPrompt, userContent, { maxTokens: 1600 });
}
