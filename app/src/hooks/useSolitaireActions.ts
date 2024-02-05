import {useAuthentication} from "@/contexts/Authentication";
import {useSui} from "./useSui";
import {
    fromColumnToColumn,
    fromColumnToPile,
    fromDeckToColumn,
    fromDeckToPile,
    fromPileToColumn, initEasyGame, initNormalGame,
    openDeckCard,
    rotateOpenDeckCards,
} from "@/helpers/moveCalls";
import {Game} from "@/models/game";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import {SuiTransactionBlockResponse} from "@mysten/sui.js/client";
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {EnokiKeypair} from "@mysten/enoki";


export const useSolitaireActions = () => {
    const {suiClient} = useSui();
    const {enokiFlow} = useAuthentication();

    const handleFromDeckToColumn = async (
        gameId: string,
        columnIndex: number
    ) => {
        const tx = fromDeckToColumn(gameId, columnIndex);
        const keypair = await enokiFlow.getKeypair();
        await suiClient
            .signAndExecuteTransactionBlock({
                transactionBlock: tx,
                signer: keypair,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            })
            .then((resp) => {
                console.log(resp);
                if (resp.effects?.status.status !== "success") {
                    throw new Error("Transaction failed");
                }
            })
            .catch((err) => {
                console.log(err);
                throw new Error("Transaction failed");
            });
    };

    const handleFromDeckToPile = async (gameId: string, pileIndex: number) => {
        const tx = fromDeckToPile(gameId, pileIndex);
        const keypair = await enokiFlow.getKeypair();
        await suiClient
            .signAndExecuteTransactionBlock({
                transactionBlock: tx,
                signer: keypair,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            })
            .then((resp) => {
                console.log(resp);
                if (resp.effects?.status.status !== "success") {
                    throw new Error("Transaction failed");
                }
            })
            .catch((err) => {
                console.log(err);
                throw new Error("Transaction failed");
            });
    };

    const handleFromColumnToPile = async (
        gameId: string,
        columnIndex: number,
        pileIndex: number
    ) => {
        const tx = fromColumnToPile(gameId, columnIndex, pileIndex);
        const keypair = await enokiFlow.getKeypair();
        await suiClient
            .signAndExecuteTransactionBlock({
                transactionBlock: tx,
                signer: keypair,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            })
            .then((resp) => {
                console.log(resp);
                if (resp.effects?.status.status !== "success") {
                    throw new Error("Transaction failed");
                }
            })
            .catch((err) => {
                console.log(err);
                throw new Error("Transaction failed");
            });
    };

    const handleFromColumnToColumn = async (
        gameId: string,
        fromColumnIndex: number,
        card: number,
        toColumnIndex: number
    ) => {
        const tx = fromColumnToColumn(gameId, fromColumnIndex, card, toColumnIndex);
        const keypair = await enokiFlow.getKeypair();
        await suiClient
            .signAndExecuteTransactionBlock({
                transactionBlock: tx,
                signer: keypair,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            })
            .then((resp) => {
                console.log(resp);
                if (resp.effects?.status.status !== "success") {
                    throw new Error("Transaction failed");
                }
            })
            .catch((err) => {
                console.log(err);
                throw new Error("Transaction failed");
            });
    };

    const handleFromPileToColumn = async (
        gameId: string,
        pileIndex: number,
        columnIndex: number
    ) => {
        const tx = fromPileToColumn(gameId, pileIndex, columnIndex);
        const keypair = await enokiFlow.getKeypair();
        await suiClient
            .signAndExecuteTransactionBlock({
                transactionBlock: tx,
                signer: keypair,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            })
            .then((resp) => {
                console.log(resp);
                if (resp.effects?.status.status !== "success") {
                    throw new Error("Transaction failed");
                }
            })
            .catch((err) => {
                console.log(err);
                throw new Error("Transaction failed");
            });
    };

    const handleOpenDeckCard = async (gameId: string) => {
        const tx = openDeckCard(gameId);
        const keypair = await enokiFlow.getKeypair();
        await suiClient
            .signAndExecuteTransactionBlock({
                transactionBlock: tx,
                signer: keypair,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            })
            .then((resp) => {
                console.log(resp);
                if (resp.effects?.status.status !== "success") {
                    throw new Error("Transaction failed");
                }
            })
            .catch((err) => {
                console.log(err);
                throw new Error("Transaction failed");
            });
    };

    const handleRotateOpenDeckCards = async (gameId: string) => {
        const tx = rotateOpenDeckCards(gameId);
        const keypair = await enokiFlow.getKeypair();
        await suiClient
            .signAndExecuteTransactionBlock({
                transactionBlock: tx,
                signer: keypair,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            })
            .then((resp) => {
                console.log(resp);
                if (resp.effects?.status.status !== "success") {
                    throw new Error("Transaction failed");
                }
            })
            .catch((err) => {
                console.log(err);
                throw new Error("Transaction failed");
            });
    };

    async function execute(transactionBlock: TransactionBlock, keypair: EnokiKeypair) {
        const res = await suiClient.signAndExecuteTransactionBlock({
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

    async function getGameObjectDetails(initGameRes: SuiTransactionBlockResponse) {
        let res = await suiClient.getObject(
            {
                id: initGameRes.effects!.created![0].reference.objectId,
                options: {showContent: true},
            }
        );
        return res;
    }

    const handleExecuteInitNormalGame = async () => {
        const transactionBlock = initNormalGame();
        const keypair = await enokiFlow.getKeypair();
        let res = await execute(transactionBlock, keypair);
        let gameObjectRes = await getGameObjectDetails(res);
        return new Game(gameObjectRes!);
    }

    const handleExecuteInitEasyGame = async () => {
        const transactionBlock = initEasyGame();
        const keypair = await enokiFlow.getKeypair();
        let res = await execute(transactionBlock, keypair);
        let gameObjectRes = await getGameObjectDetails(res);
        return new Game(gameObjectRes!);
    }

    return {
        handleFromDeckToColumn,
        handleFromDeckToPile,
        handleFromColumnToPile,
        handleFromColumnToColumn,
        handleFromPileToColumn,
        handleOpenDeckCard,
        handleRotateOpenDeckCards,
        handleExecuteInitEasyGame,
        handleExecuteInitNormalGame,
    };
};
