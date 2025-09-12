// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { useSui } from "./useSui";
import { Game } from "@/models/game";
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";
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
  const { suiClient } = useSui();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();

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
        event.type ===
        `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    )?.parsedJson as CardRevealedEvent;

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
        event.type ===
        `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    )?.parsedJson as CardRevealedEvent;

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
        event.type ===
        `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    )?.parsedJson as CardRevealedEvent;

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
    return await suiClient.getObject({
      id: objectId!,
      options: { showContent: true },
    });
  }

  const handleExecuteInitNormalGame = async () => {
    const tx = new Transaction();
    tx.add(initNormalGame({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
    }));
    const txResult = await executeTransaction(tx);

    let gameObjectRes = await getGameObjectDetails(
      txResult.effects?.created![0].reference.objectId
    );
    return new Game(gameObjectRes);
  };

  const handleExecuteInitEasyGame = async () => {
    const tx = new Transaction();
    tx.add(initEasyGame({
      package: process.env.NEXT_PUBLIC_PACKAGE_ADDRESS!,
    }));
    const txResult = await executeTransaction(tx);

    let gameObjectRes = await getGameObjectDetails(
      txResult.effects?.created![0].reference.objectId
    );
    return new Game(gameObjectRes);
  };

  const executeTransaction = async (tx: Transaction) => {
    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    const sponsorResp = await fetch(`api/sponsor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionKindBytes: toBase64(txBytes),
        sender: currentAccount?.address!,
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

    const { signature } = await signTransaction({
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

    await suiClient.waitForTransaction({
      digest: executedDigest,
      timeout: 10_000,
    });

    const txResult = await suiClient.getTransactionBlock({
      digest: executedDigest,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: false,
      },
    });

    const status = txResult.effects?.status?.status;

    if (status !== "success") {
      throw new Error(
        `Transaction failed: ${
          txResult.effects?.status?.error ?? "unknown error"
        }`
      );
    }

    return txResult;
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
