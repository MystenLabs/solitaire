// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import type {
	SuiTransactionBlockResponse,
} from '@mysten/sui/client';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { expect } from 'vitest';

import { ADMIN_SECRET_KEY, SUI_NETWORK } from '../../src/config';
import { fromBase64 } from '@mysten/sui/utils';


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
  // `sui keytool export --key-identity <addr>`
  // suipriv...
	const keypair = Ed25519Keypair.fromSecretKey(ADMIN_SECRET_KEY);
	const client = getClient();
	return new TestToolbox(keypair, client);

}

export async function executeTransactionBlock(
	toolbox: TestToolbox,
	txb: Transaction,
): Promise<SuiTransactionBlockResponse> {
	const resp = await toolbox.client.signAndExecuteTransaction({
		signer: toolbox.keypair,
		transaction: txb,
		options: {
			showEffects: true,
			showEvents: true,
			showObjectChanges: true,
		},
	});
	expect(resp.effects?.status.status).toEqual('success');
  await toolbox.client.waitForTransaction({ digest: resp.digest });
	return resp;
}
