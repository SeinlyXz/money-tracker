import Database from 'better-sqlite3';
import { SQLITE_DB_PATH } from '$env/static/private';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import * as schema from './schema';

const databasePath = resolve(SQLITE_DB_PATH || 'data/money-tracker.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });

const sqlite = new Database(databasePath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

sqlite.exec(`
	CREATE TABLE IF NOT EXISTS transactions (
		id TEXT PRIMARY KEY NOT NULL,
		title TEXT NOT NULL,
		amount INTEGER NOT NULL,
		type TEXT NOT NULL DEFAULT 'expense',
		category TEXT NOT NULL DEFAULT 'Lainnya',
		merchant TEXT,
		note TEXT,
		items TEXT,
		source_text TEXT,
		occurred_at INTEGER NOT NULL,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);

	CREATE INDEX IF NOT EXISTS transactions_occurred_at_idx ON transactions (occurred_at);

	-- additive column migrations
	`);

const columns = sqlite.prepare("PRAGMA table_info('transactions')").all() as Array<{
	name: string;
}>;
if (!columns.some((column) => column.name === 'items')) {
	sqlite.exec(`ALTER TABLE transactions ADD COLUMN items TEXT;`);
}

sqlite.exec(`
	CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions (type);
	CREATE INDEX IF NOT EXISTS transactions_category_idx ON transactions (category);

	CREATE TABLE IF NOT EXISTS app_settings (
		key TEXT PRIMARY KEY NOT NULL,
		value TEXT NOT NULL,
		updated_at INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS passkeys (
		id TEXT PRIMARY KEY NOT NULL,
		public_key TEXT NOT NULL,
		counter INTEGER NOT NULL DEFAULT 0,
		transports TEXT,
		device_type TEXT,
		backed_up INTEGER NOT NULL DEFAULT 0,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
`);

export const db = drizzle(sqlite, { schema });
