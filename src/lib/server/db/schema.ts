import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable(
	'transactions',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		amount: integer('amount').notNull(),
		type: text('type', { enum: ['expense', 'income'] })
			.notNull()
			.default('expense'),
		category: text('category').notNull().default('Lainnya'),
		merchant: text('merchant'),
		note: text('note'),
		items: text('items'),
		sourceText: text('source_text'),
		occurredAt: integer('occurred_at').notNull(),
		createdAt: integer('created_at').notNull(),
		updatedAt: integer('updated_at').notNull()
	},
	(table) => [
		index('transactions_occurred_at_idx').on(table.occurredAt),
		index('transactions_type_idx').on(table.type),
		index('transactions_category_idx').on(table.category)
	]
);

export const appSettings = sqliteTable('app_settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	updatedAt: integer('updated_at').notNull()
});

export const passkeys = sqliteTable('passkeys', {
	id: text('id').primaryKey(),
	publicKey: text('public_key').notNull(),
	counter: integer('counter').notNull().default(0),
	transports: text('transports'),
	deviceType: text('device_type'),
	backedUp: integer('backed_up', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at').notNull(),
	updatedAt: integer('updated_at').notNull()
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type Passkey = typeof passkeys.$inferSelect;
export type NewPasskey = typeof passkeys.$inferInsert;
