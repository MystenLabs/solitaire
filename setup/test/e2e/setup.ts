// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { expect } from 'vitest';

import { ADMIN_SECRET_KEY, SUI_NETWORK } from '../../src/config';


const DEFAULT_FULLNODE_URL = SUI_NETWORK;

export class TestToolbox {
	keypair: Ed25519Keypair;
	client: SuiGrpcClient;

	constructor(keypair: Ed25519Keypair, client: SuiGrpcClient) {
		this.keypair = keypair;
		this.client = client;
	}

	address() {
		return this.keypair.getPublicKey().toSuiAddress();
	}

}

function inferNetwork(url: string): string {
	if (url.includes('testnet')) return 'testnet';
	if (url.includes('devnet')) return 'devnet';
	if (url.includes('mainnet')) return 'mainnet';
	if (url.includes('127.0.0.1') || url.includes('localhost')) return 'localnet';
	return 'localnet';
}

export function getClient(): SuiGrpcClient {
	return new SuiGrpcClient({
		network: inferNetwork(DEFAULT_FULLNODE_URL),
		baseUrl: DEFAULT_FULLNODE_URL,
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
): Promise<any> {
	const resp = await toolbox.client.signAndExecuteTransaction({
		signer: toolbox.keypair,
		transaction: txb,
		include: {
			effects: true,
			events: true,
			objectTypes: true,
		},
	});
	expect(resp.$kind).toEqual('Transaction');
	if (resp.$kind !== 'Transaction') {
		throw new Error(`Transaction failed: ${resp.FailedTransaction.status.error?.message ?? "unknown error"}`);
	}
	expect(resp.Transaction.status.success).toEqual(true);
	const confirmed = await toolbox.client.waitForTransaction({
		result: resp,
		include: {
			effects: true,
			events: true,
			objectTypes: true,
		},
	});
	if (confirmed.$kind !== 'Transaction') {
		throw new Error(`Transaction failed: ${confirmed.FailedTransaction.status.error?.message ?? "unknown error"}`);
	}
	return confirmed.Transaction;
}
