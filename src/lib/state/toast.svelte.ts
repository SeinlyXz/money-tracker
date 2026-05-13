export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
	id: string;
	type: ToastType;
	message: string;
	description?: string;
};

type ToastInput = {
	type?: ToastType;
	description?: string;
	duration?: number;
};

class ToastStore {
	items = $state<Toast[]>([]);
	private timers = new Map<string, ReturnType<typeof setTimeout>>();

	push(message: string, opts: ToastInput = {}) {
		const id = crypto.randomUUID();
		const toast: Toast = {
			id,
			type: opts.type ?? 'info',
			message,
			description: opts.description
		};
		this.items = [...this.items, toast];

		const duration = opts.duration ?? 3500;
		const timer = setTimeout(() => this.dismiss(id), duration);
		this.timers.set(id, timer);
		return id;
	}

	success(message: string, opts: Omit<ToastInput, 'type'> = {}) {
		return this.push(message, { ...opts, type: 'success' });
	}

	error(message: string, opts: Omit<ToastInput, 'type'> = {}) {
		return this.push(message, { ...opts, type: 'error' });
	}

	dismiss(id: string) {
		const timer = this.timers.get(id);
		if (timer) {
			clearTimeout(timer);
			this.timers.delete(id);
		}
		this.items = this.items.filter((t) => t.id !== id);
	}
}

export const toast = new ToastStore();
