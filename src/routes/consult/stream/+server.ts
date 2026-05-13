import type { RequestHandler } from './$types';

import { DEEPSEEK_API_KEY } from '$env/static/private';
import {
	buildConsultContext,
	streamFinancialConsultant,
	type ConsultRange
} from '$lib/server/ai/consultant';

const VALID_RANGES: ConsultRange[] = ['week', 'month', 'quarter', 'year', 'all'];

function parseRange(value: unknown): ConsultRange {
	const candidate = typeof value === 'string' ? value : '';
	return VALID_RANGES.includes(candidate as ConsultRange) ? (candidate as ConsultRange) : 'month';
}

function ndjson(obj: Record<string, unknown>) {
	return JSON.stringify(obj) + '\n';
}

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as
		| { range?: unknown; prompt?: unknown }
		| null;
	const range = parseRange(body?.range);
	const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

	const encoder = new TextEncoder();

	if (!DEEPSEEK_API_KEY) {
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						ndjson({ type: 'error', message: 'DEEPSEEK_API_KEY belum diset. Silakan isi di .env.' })
					)
				);
				controller.close();
			}
		});
		return new Response(stream, {
			headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' }
		});
	}

	const context = buildConsultContext(range);

	if (!context.transactionCount) {
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						ndjson({
							type: 'error',
							message: 'Belum ada transaksi pada rentang waktu ini. Coba rentang lain.'
						})
					)
				);
				controller.close();
			}
		});
		return new Response(stream, {
			headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' }
		});
	}

	const stream = new ReadableStream({
		async start(controller) {
			try {
				controller.enqueue(
					encoder.encode(
						ndjson({
							type: 'meta',
							range,
							rangeLabel: context.rangeLabel,
							transactionCount: context.transactionCount,
							prompt
						})
					)
				);

				for await (const token of streamFinancialConsultant(context, prompt)) {
					controller.enqueue(encoder.encode(ndjson({ type: 'token', text: token })));
				}

				controller.enqueue(encoder.encode(ndjson({ type: 'done' })));
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Konsultasi gagal diproses.';
				controller.enqueue(encoder.encode(ndjson({ type: 'error', message })));
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'application/x-ndjson; charset=utf-8',
			'Cache-Control': 'no-cache, no-transform',
			'X-Accel-Buffering': 'no'
		}
	});
};
