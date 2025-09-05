import { useSui } from "./useSui";
import {
  fromColumnToColumn,
  fromColumnToPile,
  fromDeckToColumn,
  fromDeckToPile,
  fromPileToColumn,
  initEasyGame,
  initNormalGame,
  openDeckCard,
  rotateOpenDeckCards,
  finishGame,
  deleteUnfinishedGame
} from "@/helpers/moveCalls";
import { Game } from "@/models/game";
import { Transaction } from "@mysten/sui/transactions";
import { EnokiKeypair } from "@mysten/enoki";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface CardRevealedEvent {
  card: string;
}

export const useSolitaireActions = () => {
  const { suiClient } = useSui();
  const currentAccount = useCurrentAccount();

  const handleFromDeckToColumn = async (
    gameId: string,
    columnIndex: number
  ) => {
    const tx = fromDeckToColumn(gameId, columnIndex);
    // TODO: What to use instead of this
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showObjectChanges: true,
    //   },
    // });
    
    // await suiClient.waitForTransaction({
    //   digest: resp.digest,
    // });
    
    // if (resp.effects?.status.status !== "success") {
    //   throw new Error("Transaction failed");
    // }
  };

  const handleFromDeckToPile = async (gameId: string, pileIndex: number) => {
    const tx = fromDeckToPile(gameId, pileIndex);
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showObjectChanges: true,
    //   },
    // });
    
    // await suiClient.waitForTransaction({
    //   digest: resp.digest,
    // });
    
    // if (resp.effects?.status.status !== "success") {
    //   throw new Error("Transaction failed");
    // }
  };

  const handleFromColumnToPile = async (
    gameId: string,
    columnIndex: number,
    pileIndex: number
  ) => {
    const tx = fromColumnToPile(gameId, columnIndex, pileIndex);
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showEvents: true,
    //   },
    // });
    
    // const finalResp = await suiClient.waitForTransaction({
    //   digest: resp.digest,
    //   options: {
    //     showEffects: true,
    //     showEvents: true,
    //   },
    // });
    
    // if (finalResp.effects?.status.status !== "success") {
    //   throw new Error("Transaction failed");
    // }
    
    // const cardRevealedEvent = finalResp.events?.find(
    //   (event) =>
    //     event.type ===
    //     `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    // )?.parsedJson as CardRevealedEvent;
    
    // return cardRevealedEvent?.card;
  };

  const handleFromColumnToColumn = async (
    gameId: string,
    fromColumnIndex: number,
    card: number,
    toColumnIndex: number
  ) => {
    const tx = fromColumnToColumn(gameId, fromColumnIndex, card, toColumnIndex);
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showEvents: true,
    //   },
    // });
    
    // const finalResp = await suiClient.waitForTransaction({
    //   digest: resp.digest,
    //   options: {
    //     showEffects: true,
    //     showEvents: true,
    //   },
    // });
    
    // if (finalResp.effects?.status.status !== "success") {
    //   throw new Error("Transaction failed");
    // }
    
    // const cardRevealedEvent = finalResp.events?.find(
    //   (event) =>
    //     event.type ===
    //     `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    // )?.parsedJson as CardRevealedEvent;
    
    // return cardRevealedEvent?.card;
  };

  const handleFromPileToColumn = async (
    gameId: string,
    pileIndex: number,
    columnIndex: number
  ) => {
    const tx = fromPileToColumn(gameId, pileIndex, columnIndex);
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showObjectChanges: true,
    //   },
    // });
    
    // await suiClient.waitForTransaction({
    //   digest: resp.digest,
    // });
    
    // if (resp.effects?.status.status !== "success") {
    //   throw new Error("Transaction failed");
    // }
  };

  const handleOpenDeckCard = async (gameId: string) => {
    const tx = openDeckCard(gameId);
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showEvents: true,
    //   },
    // });
    
    // const finalResp = await suiClient.waitForTransaction({
    //   digest: resp.digest,
    //   options: {
    //     showEffects: true,
    //     showEvents: true,
    //   },
    // });
    
    // if (finalResp.effects?.status.status !== "success") {
    //   throw new Error("Transaction failed");
    // }
    
    // const cardRevealedEvent = finalResp.events?.find(
    //   (event) =>
    //     event.type ===
    //     `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    // )?.parsedJson as CardRevealedEvent;
    
    // return cardRevealedEvent?.card;
  };

  const handleRotateOpenDeckCards = async (gameId: string) => {
    const tx = rotateOpenDeckCards(gameId);
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showObjectChanges: true,
    //   },
    // });
    
    // await suiClient.waitForTransaction({
    //   digest: resp.digest,
    // });
    
    // if (resp.effects?.status.status !== "success") {
    //   throw new Error("Transaction failed");
    // }
  };

  const handleFinishGame = async (gameId: string) => {
    const tx = finishGame(gameId);
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showObjectChanges: true,
    //   },
    // });
    
    // await suiClient.waitForTransaction({
    //   digest: resp.digest,
    // });
    
    // if (resp.effects?.status.status !== "success") {
    //   throw new Error("Transaction failed");
    // }
  }

  const handleDeleteUnfinishedGame = async (gameId: string) => {
    const tx = deleteUnfinishedGame(gameId);
    // const keypair = await enokiFlow.getKeypair();
    // const resp = await suiClient.signAndExecuteTransaction({
    //   transaction: tx,
    //   signer: keypair,
    //   options: {
    //     showEffects: true,
    //     showObjectChanges: true,
    //   },
    // });
    
    // await suiClient.waitForTransaction({
    //   digest: resp.digest,
    // });
    
    // if (resp.effects?.status.status !== "success") {
    //   throw new Error("Game deletion failed");
    // }
  }

  async function execute(
    transactionBlock: Transaction,
    keypair: EnokiKeypair
  ) {
    const resp = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: transactionBlock,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    
    const finalResp = await suiClient.waitForTransaction({
      digest: resp.digest,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    
    return finalResp;
  }

  async function getGameObjectDetails(
    objectId: string | undefined
  ) {
    let res = await suiClient.getObject({
      id: objectId!,
      options: { showContent: true },
    });
    return res;
  }

  const handleExecuteInitNormalGame = async () => {
    const transactionBlock = initNormalGame();
    // const keypair = await enokiFlow.getKeypair();
    // let res = await execute(transactionBlock, keypair);
    // let gameObjectRes = await getGameObjectDetails(res.effects?.created![0].reference.objectId);
    // return new Game(gameObjectRes!);
  };

  const handleExecuteInitEasyGame = async () => {
    const transactionBlock = initEasyGame();
    // const keypair = await enokiFlow.getKeypair();
    // let res = await execute(transactionBlock, keypair);
    // let gameObjectRes = await getGameObjectDetails(res.effects?.created![0].reference.objectId);
    // return new Game(gameObjectRes!);
  };

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
    handleFinishGame,
    handleDeleteUnfinishedGame,
    getGameObjectDetails,
  };
};
