import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		hookTimeout: 1000000,
		testTimeout: 1000000,
		env: {
			NODE_ENV: 'test',
		},
	},
	resolve: {
		alias: {},
	},
});
