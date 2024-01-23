import {SuiTransactionBlockResponse} from "@mysten/sui.js";
import {SuiClient} from "@mysten/sui.js/client";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {initEasyGame, initNormalGame} from "./moveCalls";
import {Game} from "../models/game";

// Singleton class to execute move calls
export class MoveCallsExecutorService {
    private static executor: MoveCallsExecutorService | undefined = undefined
    private client: SuiClient | undefined;

    static async initialize(clientUrl: string) {
        if (MoveCallsExecutorService.executor === undefined) {
            MoveCallsExecutorService.executor = new MoveCallsExecutorService(
                clientUrl,
            );
            return MoveCallsExecutorService.executor
        }
    }

    private constructor(clientUrl: string) {
        this.client = new SuiClient({
            url: clientUrl,
        });
    }

    private async execute(transactionBlock: TransactionBlock, keypair: Ed25519Keypair) {
        const res = MoveCallsExecutorService
            .executor?.client?.signAndExecuteTransactionBlock({
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
        let res=  await this.execute(transactionBlock, keypair);
        let gameObjectRes = await this.getGameObjectDetails(res);

        return new Game(gameObjectRes!);
    }

    private async getGameObjectDetails(initGameRes: SuiTransactionBlockResponse) {
        let res = await MoveCallsExecutorService.executor?.client?.getObject(
            {
                id: initGameRes.effects!.created![0].reference.objectId,
                options: {showContent: true},
            }
        );
        return res;
    }
}