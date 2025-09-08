// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
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
  deleteUnfinishedGame,
} from "@/helpers/moveCalls";
import { Game } from "@/models/game";
import { Transaction } from "@mysten/sui/transactions";
import { EnokiKeypair } from "@mysten/enoki";
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";
import { toBase64 } from "@mysten/sui/utils";

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
    const tx = fromDeckToColumn(gameId, columnIndex);
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

    //sign here

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
    return new Game(txResult);
  };

  const handleFromDeckToPile = async (gameId: string, pileIndex: number) => {
    const tx = fromDeckToPile(gameId, pileIndex);
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
    return new Game(txResult);
  };

  const handleFromColumnToPile = async (
    gameId: string,
    columnIndex: number,
    pileIndex: number
  ) => {
    const tx = fromColumnToPile(gameId, columnIndex, pileIndex);
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
    const tx = fromColumnToColumn(gameId, fromColumnIndex, card, toColumnIndex);
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
    const tx = fromPileToColumn(gameId, pileIndex, columnIndex);
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

    const { signature } = await  signTransaction({
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
    return new Game(txResult);
  };

  const handleOpenDeckCard = async (gameId: string) => {
    const tx = openDeckCard(gameId);
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

    const cardRevealedEvent = txResult.events?.find(
      (event) =>
        event.type ===
        `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
    )?.parsedJson as CardRevealedEvent;

    return cardRevealedEvent?.card;
  };

  const handleRotateOpenDeckCards = async (gameId: string) => {
    const tx = rotateOpenDeckCards(gameId);
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
    return new Game(txResult);
  };

  const handleFinishGame = async (gameId: string) => {
    const tx = finishGame(gameId);
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
    return new Game(txResult);
  };

  const handleDeleteUnfinishedGame = async (gameId: string) => {
    const tx = deleteUnfinishedGame(gameId);
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
    return new Game(txResult);
  };

  async function execute(transactionBlock: Transaction, keypair: EnokiKeypair) {
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

  async function getGameObjectDetails(objectId: string | undefined) {
    let res = await suiClient.getObject({
      id: objectId!,
      options: { showContent: true },
    });
    return res;
  }

  const handleExecuteInitNormalGame = async () => {
    const transactionBlock = initNormalGame();
    const txBytes = await transactionBlock.build({
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

    let gameObjectRes = await getGameObjectDetails(
      txResult.effects?.created![0].reference.objectId
    );
    return new Game(gameObjectRes!);
  };

  const handleExecuteInitEasyGame = async () => {
    const transactionBlock = initEasyGame();
    const txBytes = await transactionBlock.build({
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

    let gameObjectRes = await getGameObjectDetails(
      txResult.effects?.created![0].reference.objectId
    );
    return new Game(gameObjectRes!);
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
