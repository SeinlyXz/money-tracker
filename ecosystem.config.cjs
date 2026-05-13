module.exports = {
	apps: [
		{
			name: 'my-money-tracker',
			script: './build/index.js',
			cwd: __dirname,
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			watch: false,
			max_memory_restart: '512M',
			node_args: '--enable-source-maps',
			env: {
				NODE_ENV: 'production',
				HOST: '0.0.0.0',
				PORT: 3000,
				ORIGIN: 'http://localhost:3000',
				BODY_SIZE_LIMIT: '1mb',
				DEEPSEEK_API_KEY: '',
				DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
				DEEPSEEK_MODEL: 'deepseek-v4-flash',
				SQLITE_DB_PATH: './data/money-tracker.sqlite'
			},
			error_file: './logs/err.log',
			out_file: './logs/out.log',
			merge_logs: true,
			time: true
		}
	]
};
