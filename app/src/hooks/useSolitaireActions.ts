// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Game } from "@/models/game";
import { useCurrentAccount, useCurrentClient, useDAppKit } from "@mysten/dapp-kit-react";
import { toBase64 } from "@mysten/sui/utils";
import {
  initNormalGame,
  fromColumnToColumn,
  fromColumnToPile,
  fromDeckToColumn,
  fromDeckToPile,
  fromPileToColumn,
  initEasyGame,
  openDeckCard,
  rotateOpenDeckCards,
  finishGame,
  deleteUnfinishedGame,
} from "@/generated/solitaire/solitaire";
import {Transaction} from "@mysten/sui/transactions";

interface CardRevealedEvent {
  card: string;
}

export const useSolitaireActions = () => {
  const suiClient = useCurrentClient();
  const dAppKit = useDAppKit();
  const currentAccount = useCurrentAccount();

  const requireCurrentSender = () => {
    const sender = currentAccount?.address;
    if (!sender) {
      throw new Error("No connected wallet account. Please sign in again.");
    }
    return sender;
  };

  const handleFromDeckToColumn = async (
    gameId: string,
    columnIndex: number
  ) => {
    const tx = new Transaction();
    tx.add(fromDeckToColumn({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS,
      arguments: [
        gameId,
        columnIndex,
      ]
    }));
    await executeTransaction(tx);
  };

  const handleFromDeckToPile = async (gameId: string, pileIndex: number) => {
    const tx = new Transaction();
    tx.add(fromDeckToPile({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
      arguments: [gameId, pileIndex],
    }));
    await executeTransaction(tx);
  };

  const handleFromColumnToPile = async (
    gameId: string,
    columnIndex: number,
    pileIndex: number
  ) => {
    const tx = new Transaction();
    tx.add(fromColumnToPile({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
      arguments: [gameId, columnIndex, pileIndex],
    }));
    const txResult = await executeTransaction(tx);

    const cardRevealedEvent = txResult.events?.find(
      (event) =>
        event.eventType ===
        `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    )?.json as unknown as CardRevealedEvent;

    return cardRevealedEvent?.card;
  };

  const handleFromColumnToColumn = async (
    gameId: string,
    fromColumnIndex: number,
    card: number,
    toColumnIndex: number
  ) => {
    const tx = new Transaction();
    tx.add(fromColumnToColumn({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
      arguments: [gameId, fromColumnIndex, card, toColumnIndex],
    }));
    const txResult = await executeTransaction(tx);

    const cardRevealedEvent = txResult.events?.find(
      (event) =>
        event.eventType ===
        `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    )?.json as unknown as CardRevealedEvent;

    return cardRevealedEvent?.card;
  };

  const handleFromPileToColumn = async (
    gameId: string,
    pileIndex: number,
    columnIndex: number
  ) => {
    const tx = new Transaction();
    tx.add(fromPileToColumn({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
      arguments: [gameId, pileIndex, columnIndex],
    }));
    await executeTransaction(tx);
  };

  const handleOpenDeckCard = async (gameId: string) => {
    const tx = new Transaction();
    tx.add(openDeckCard({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
      arguments: [gameId],
    }));
    const txResult = await executeTransaction(tx);

    const cardRevealedEvent = txResult.events?.find(
      (event) =>
        event.eventType ===
        `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    )?.json as unknown as CardRevealedEvent;

    return cardRevealedEvent?.card;
  };

  const handleRotateOpenDeckCards = async (gameId: string) => {
    const tx = new Transaction();
    tx.add(rotateOpenDeckCards({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
      arguments: [gameId],
    }));
    await executeTransaction(tx);
  };

  const handleFinishGame = async (gameId: string) => {
    const tx = new Transaction();
    tx.add(finishGame({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
      arguments: [gameId],
    }));
    await executeTransaction(tx);
  };

  const handleDeleteUnfinishedGame = async (gameId: string) => {
    const tx = new Transaction();
    tx.add(deleteUnfinishedGame({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
      arguments: [gameId],
    }));
    await executeTransaction(tx);
  };

  async function getGameObjectDetails(objectId: string | undefined) {
    if (!objectId) {
      throw new Error("Missing game object id");
    }
    return await suiClient.getObject({
      objectId,
      include: { json: true },
    });
  }

  const getCreatedGameObjectId = (txResult: any) => {
    const changedObjects: any[] = txResult.effects?.changedObjects ?? [];

    return changedObjects.find(
      (object) =>
        object.idOperation === "Created" &&
        txResult.objectTypes?.[object.objectId] ===
          `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::Game`
    )?.objectId;
  };

  const handleExecuteInitNormalGame = async () => {
    const tx = new Transaction();
    tx.add(initNormalGame({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
    }));
    const txResult = await executeTransaction(tx);

    const gameId = getCreatedGameObjectId(txResult);
    let gameObjectRes = await getGameObjectDetails(gameId);
    return new Game(gameObjectRes);
  };

  const handleExecuteInitEasyGame = async () => {
    const tx = new Transaction();
    tx.add(initEasyGame({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
    }));
    const txResult = await executeTransaction(tx);

    const gameId = getCreatedGameObjectId(txResult);
    let gameObjectRes = await getGameObjectDetails(gameId);
    return new Game(gameObjectRes);
  };

  const executeTransaction = async (tx: Transaction) => {
    const sender = requireCurrentSender();
    tx.setSenderIfNotSet(sender);

    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    const sponsorResp = await fetch(`api/sponsor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionKindBytes: toBase64(txBytes),
        sender,
      }),
    });

    if (!sponsorResp.ok) {
      throw new Error(`Failed to sponsor transaction: ${sponsorResp.status}`);
    }

    const { bytes: sponsoredBytes, digest: sponsoredDigest } =
      (await sponsorResp.json()) as {
        bytes: string;
        digest: string;
      };

    const { signature } = await dAppKit.signTransaction({
      transaction: sponsoredBytes,
    });

    const execResp = await fetch(`api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digest: sponsoredDigest, signature }),
    });

    if (!execResp.ok) {
      throw new Error(`Failed to execute transaction: ${execResp.status}`);
    }

    const { digest: executedDigest } = (await execResp.json()) as {
      digest: string;
    };

    const txResult = await suiClient.waitForTransaction({
      digest: executedDigest,
      timeout: 10_000,
      include: {
        effects: true,
        events: true,
        objectTypes: true,
      },
    });

    const executedTx = txResult.$kind === "Transaction"
      ? txResult.Transaction
      : txResult.FailedTransaction;
    const status = executedTx.status.success;

    if (!status) {
      throw new Error(
        `Transaction failed: ${
          executedTx.status.error?.message ?? "unknown error"
        }`
      );
    }

    return executedTx;
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
