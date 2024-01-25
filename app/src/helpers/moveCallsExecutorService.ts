import {SuiTransactionBlockResponse} from "@mysten/sui.js/client";
import {SuiClient, getFullnodeUrl} from "@mysten/sui.js/client";
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {initEasyGame, initNormalGame} from "./moveCalls";
import {Game} from "../models/game";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";

export class MoveCallsExecutorService {
    private client: SuiClient;
    constructor(network: 'mainnet' | 'testnet' | 'localnet') {
        this.client = new SuiClient({
            url: getFullnodeUrl(network),
        });
    }

    private async execute(transactionBlock: TransactionBlock, keypair: Ed25519Keypair) {
        const res = this.client?.signAndExecuteTransactionBlock({
                signer: keypair,
                transactionBlock,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
            });
        return res;
    }

    async executeInitNormalGame(keypair: Ed25519Keypair) {
        const transactionBlock = initNormalGame();
        let res=  await this.execute(transactionBlock, keypair);
        let gameObjectRes = await this.getGameObjectDetails(res);
        return new Game(gameObjectRes!);
    }

    async executeInitEasyGame(keypair: Ed25519Keypair) {
        const transactionBlock = initEasyGame();
        let res = await this.execute(transactionBlock, keypair);
        let gameObjectRes = await this.getGameObjectDetails(res);

        return new Game(gameObjectRes!);
    }

    private async getGameObjectDetails(initGameRes: SuiTransactionBlockResponse) {
        let res = await this.client.getObject(
            {
                id: initGameRes.effects!.created![0].reference.objectId,
                options: {showContent: true},
            }
        );
        return res;
    }
}