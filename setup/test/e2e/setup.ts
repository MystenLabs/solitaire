import type {
	SuiTransactionBlockResponse,
} from '@mysten/sui.js/client';
import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { expect } from 'vitest';

import { ADMIN_SECRET_KEY, SUI_NETWORK } from '../../src/config.ts';
import { fromB64 } from '@mysten/sui.js/utils';

const DEFAULT_FULLNODE_URL = SUI_NETWORK;

export class TestToolbox {
	keypair: Ed25519Keypair;
	client: SuiClient;

	constructor(keypair: Ed25519Keypair, client: SuiClient) {
		this.keypair = keypair;
		this.client = client;
	}

	address() {
		return this.keypair.getPublicKey().toSuiAddress();
	}

	public async getActiveValidators() {
		return (await this.client.getLatestSuiSystemState()).activeValidators;
	}
}

export function getClient(): SuiClient {
	return new SuiClient({
		url: DEFAULT_FULLNODE_URL,
	});
}

export async function setupSuiClient() {
	const keypair = Ed25519Keypair.fromSecretKey(
		fromB64(ADMIN_SECRET_KEY).slice(1)
	  );
	const client = getClient();
	return new TestToolbox(keypair, client);

}

export async function executeTransactionBlock(
	toolbox: TestToolbox,
	txb: TransactionBlock,
): Promise<SuiTransactionBlockResponse> {
	const resp = await toolbox.client.signAndExecuteTransactionBlock({
		signer: toolbox.keypair,
		transactionBlock: txb,
		options: {
			showEffects: true,
			showEvents: true,
			showObjectChanges: true,
		},
	});
	expect(resp.effects?.status.status).toEqual('success');
	return resp;
}
