function escape(input: string) {
	return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyInline(input: string) {
	return input
		.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[#10231d]">$1</strong>')
		.replace(/__(.+?)__/g, '<strong class="font-bold text-[#10231d]">$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">$1</code>');
}

type Block =
	| { type: 'heading'; level: 1 | 2 | 3; text: string }
	| { type: 'ulist'; items: string[] }
	| { type: 'olist'; items: string[] }
	| { type: 'paragraph'; text: string };

function tokenize(md: string): Block[] {
	const normalized = md.replace(/\r\n/g, '\n');
	const rawLines = normalized.split('\n');
	const blocks: Block[] = [];

	let currentList: { type: 'ulist' | 'olist'; items: string[] } | null = null;
	let paragraphBuf: string[] = [];

	const flushList = () => {
		if (currentList) {
			blocks.push(currentList);
			currentList = null;
		}
	};

	const flushParagraph = () => {
		if (!paragraphBuf.length) return;
		const joined = paragraphBuf.join(' ').replace(/\s+/g, ' ').trim();
		paragraphBuf = [];
		if (joined) blocks.push({ type: 'paragraph', text: joined });
	};

	for (const raw of rawLines) {
		const line = raw.trimEnd();

		if (!line.trim()) {
			flushList();
			flushParagraph();
			continue;
		}

		const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line.trim());
		if (headingMatch) {
			flushList();
			flushParagraph();
			const level = Math.min(3, headingMatch[1].length) as 1 | 2 | 3;
			blocks.push({ type: 'heading', level, text: headingMatch[2].trim() });
			continue;
		}

		const ulMatch = /^\s*[-*]\s+(.+)$/.exec(line);
		if (ulMatch) {
			flushParagraph();
			if (!currentList || currentList.type !== 'ulist') {
				flushList();
				currentList = { type: 'ulist', items: [] };
			}
			currentList.items.push(ulMatch[1].trim());
			continue;
		}

		const olMatch = /^\s*\d+\.\s+(.+)$/.exec(line);
		if (olMatch) {
			flushParagraph();
			if (!currentList || currentList.type !== 'olist') {
				flushList();
				currentList = { type: 'olist', items: [] };
			}
			currentList.items.push(olMatch[1].trim());
			continue;
		}

		flushList();
		paragraphBuf.push(line);
	}

	flushList();
	flushParagraph();
	return blocks;
}

export function renderMarkdown(md: string) {
	const blocks = tokenize(md);
	const html: string[] = [];

	for (const block of blocks) {
		if (block.type === 'heading') {
			const sizeClass =
				block.level === 1
					? 'text-base font-bold text-[#10231d]'
					: 'text-sm font-bold text-[#10231d]';
			const tag = `h${block.level + 1}`;
			html.push(
				`<${tag} class="mt-3 first:mt-0 ${sizeClass}">${applyInline(escape(block.text))}</${tag}>`
			);
			continue;
		}

		if (block.type === 'ulist') {
			html.push(
				'<ul class="list-disc space-y-1.5 pl-5 text-slate-700">' +
					block.items.map((item) => `<li>${applyInline(escape(item))}</li>`).join('') +
					'</ul>'
			);
			continue;
		}

		if (block.type === 'olist') {
			html.push(
				'<ol class="list-decimal space-y-1.5 pl-5 text-slate-700">' +
					block.items.map((item) => `<li>${applyInline(escape(item))}</li>`).join('') +
					'</ol>'
			);
			continue;
		}

		html.push(`<p class="leading-6 text-slate-700">${applyInline(escape(block.text))}</p>`);
	}

	return html.join('\n');
}
