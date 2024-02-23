import { useAuthentication } from "@/contexts/Authentication";
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
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { GetTransactionBlockParams } from "@mysten/sui.js/client";
import { GetObjectParams } from "@mysten/sui.js/client";

interface CardRevealedEvent {
  card: string;
}

export const useSolitaireActions = () => {
  const { suiClient } = useSui();
  const { enokiFlow } = useAuthentication();

  const handleFromDeckToColumn = async (
    gameId: string,
    columnIndex: number
  ) => {
    const tx = fromDeckToColumn(gameId, columnIndex);
    try {
      return await execute(tx);
    } catch (error) {
      throw new Error(`From pile to column: ${error}`);
    }
  };

  const handleFromDeckToPile = async (gameId: string, pileIndex: number) => {
    const tx = fromDeckToPile(gameId, pileIndex);
    try {
      return await execute(tx);
    } catch (error) {
      throw new Error(`From deck to pile: ${error}`);
    }
  };

  const handleFromColumnToPile = async (
    gameId: string,
    columnIndex: number,
    pileIndex: number
  ) => {
    const tx = fromColumnToPile(gameId, columnIndex, pileIndex);
    return await execute(tx)
        .then((res) => {
          const { object, events, effects } = res ?? {};
        if (effects?.status.status !== "success") {
          throw new Error("Transaction failed");
        }
        const cardRevealedEvent = events?.find(
            (event) =>
              event.type ===
              `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
          )?.parsedJson as CardRevealedEvent;
          return cardRevealedEvent?.card;
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
    return await execute(tx, true)
        .then((res) => {
          const { object, events, effects } = res ?? {};
          if (effects?.status.status !== "success") {
            throw new Error("Transaction failed");
          }
          const cardRevealedEvent = events?.find(
              (event) =>
                event.type ===
                `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`
            )?.parsedJson as CardRevealedEvent;
            return cardRevealedEvent?.card;
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
    try {
      await execute(tx);
    } catch (error) {
      throw new Error(`From pile to column: ${error}`);
    }
  };

  const handleOpenDeckCard = async (gameId: string) => {
    const tx = openDeckCard(gameId);
    return await execute(tx, true)
      .then((res) => {
        const { object, events, effects } = res ?? {};
        if (effects?.status.status !== "success") {
          throw new Error("Transaction failed");
        }
        const cardRevealedEvent = events?.find(
          (event) => {
            return event.type ===
                `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::CardRevealed`;
          }
        )?.parsedJson as CardRevealedEvent;
        return cardRevealedEvent?.card;
      })
      .catch((err) => {
        console.log(err);
        throw new Error("Transaction failed");
      });
  };

  const handleRotateOpenDeckCards = async (gameId: string) => {
    const tx = rotateOpenDeckCards(gameId);
    try {
      await execute(tx);
    } catch (error) {
      throw new Error(`Rotate open deck cards failed: ${error}`);
    }
  };

  const handleFinishGame = async (gameId: string) => {
    const tx = finishGame(gameId);
    try {
      await execute(tx);
    } catch (error) {
      throw new Error(`Finish game failed: ${error}`);
    }
  }

  const handleDeleteUnfinishedGame = async (gameId: string) => {
    const tx = deleteUnfinishedGame(gameId);
    try {
      await execute(tx);
    } catch (error) {
      throw new Error(`Unfinished game deletion failed: ${error}`);
    }
  }

  /**
   * Executes a transaction block.
   *
   * This function is responsible for executing a transaction block.
   * It first sponsors and executes the transaction block
   * using the `sponsorAndExecuteTransactionBlock` method from the `enokiFlow` object. If the transaction is successful,
   * it returns the digest of the transaction. If the `getTransactionDetails` parameter is set to true, it fetches the
   * details of the transaction using the `getGameObjectDetailsByDigest` method and returns them.
   *
   * @param {TransactionBlock} transactionBlock - The transaction block to be executed.
   * @param {boolean} getTransactionDetails - A boolean indicating whether to fetch the details of the transaction. Defaults to false.
   * @throws Will throw an error if the transaction sponsorship fails.
   * @returns {Promise<SuiObjectResponse>} A promise that resolves to the digest of the transaction if `getTransactionDetails` is false,
   * or the details of the transaction if `getTransactionDetails` is true.
   */
  async function execute(
    transactionBlock: TransactionBlock,
    getTransactionDetails: boolean = false,
  ) {
    let sponsorDigest;
    try {
      const {digest} = await enokiFlow.sponsorAndExecuteTransactionBlock({
        network: 'testnet',
        transactionBlock,
        client: suiClient,
      });
      sponsorDigest = digest;
    } catch (error) {
      console.error(error);
      throw new Error(`Transaction sponsorship failed ${error}`);
    }
    if (getTransactionDetails) {
      const {
        object,
        events,
        effects} = await getGameObjectDetailsByDigest(sponsorDigest);
      const error = object.error;
      if (error) throw new Error(`Transaction sponsorship failed ${error}`);
      return {object, events, effects};
    }
  }

  async function getGameObjectDetailsByDigest(
    digest: string | undefined
  ) {
    if (!digest) throw new Error("NO DIGEST: Not able to get game object details.");
    let res = await suiClient.getTransactionBlock({
      digest,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      }
    } as GetTransactionBlockParams);

    let objectId;
    let objectIdCreated = res.effects?.created
    if (objectIdCreated) { // if the transaction created a new object: i.e., init new game
      objectId = res.effects?.created![0].reference.objectId;
    } else { // if the transaction modified an existing object: i.e., move card from X - to Y
      objectId = res.objectChanges?.find(
          //@ts-ignore
          (objectChange) => objectChange.objectType.includes("solitaire::Game")
      //@ts-ignore
      )?.objectId;
    }

    if (!objectId) throw new Error("NO OBJECT ID: Not able to get game object details. Was the transaction successful?");
    const object =  await suiClient.getObject({
        id: objectId,
        options: {
          showContent: true,
        }
    } as GetObjectParams);
    return {
      object, events: res.events, effects: res.effects
    };
  }

  async function getGameObjectDetailsById(
      objectId: string | undefined
  ) {
    if (!objectId) throw new Error("NO OBJECT ID: Not able to get game object details. Was the transaction successful?");
    return await suiClient.getObject({
      id: objectId,
      options: {
        showContent: true,
      }
    } as GetObjectParams);
  }

  const handleExecuteInitNormalGame = async () => {
    const transactionBlock = initNormalGame();
    let { object } = await execute(transactionBlock, true) ?? {};
    return new Game(object!);
  };

  const handleExecuteInitEasyGame = async () => {
    const transactionBlock = initEasyGame();
    let {object} = await execute(transactionBlock, true) ?? {};
    return new Game(object!);
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
    getGameObjectDetails: getGameObjectDetailsByDigest,
    getGameObjectDetailsById,
  };
};
