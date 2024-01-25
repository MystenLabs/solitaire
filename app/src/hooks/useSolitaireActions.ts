import { useAuthentication } from "@/contexts/Authentication";
import { useSui } from "./useSui";
import {
  fromColumnToColumn,
  fromColumnToPile,
  fromDeckToColumn,
  fromDeckToPile,
  fromPileToColumn,
  openDeckCard,
  rotateOpenDeckCards,
} from "@/helpers/moveCalls";

export const useSolitaireActions = () => {
  const { suiClient } = useSui();
  const { enokiFlow } = useAuthentication();

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

  return {
    handleFromDeckToColumn,
    handleFromDeckToPile,
    handleFromColumnToPile,
    handleFromColumnToColumn,
    handleFromPileToColumn,
    handleOpenDeckCard,
    handleRotateOpenDeckCards,
  };
};
