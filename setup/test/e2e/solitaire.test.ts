import { beforeAll, describe, expect, it } from 'vitest';

import {
	executeTransactionBlock,
	setupSuiClient,
	TestToolbox,
} from './setup';
import { PACKAGE_ADDRESS } from '../../src/config';


describe('Interacting with the Smart Contract', () => {
	let toolbox: TestToolbox;
	let packageId: string

	beforeAll(async () => {
		toolbox = await setupSuiClient();
		console.log('toolbox', toolbox);
		packageId = PACKAGE_ADDRESS
	});

	it('test init normal game', async () => {		
		console.log('toolbox', toolbox);
	});
});
