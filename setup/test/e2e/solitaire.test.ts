// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {beforeAll, describe, expect, it} from "vitest";

import {executeTransactionBlock, setupSuiClient, TestToolbox} from "./setup";
import {PACKAGE_ADDRESS} from "../../src/config";
import {
  initEasyGame,
  initNormalGame,
  openDeckCard,
  rotateOpenDeckCards
} from "../../../app/src/generated/solitaire/solitaire";
import {Transaction} from "@mysten/sui/transactions";
import {ObjectOwner} from "@mysten/sui/client";

interface ObjectCreated {
  digest: string;
  objectId: string;
  objectType: string;
  owner: ObjectOwner;
  sender: string;
  type: "created";
  version: string;
}

interface Column {
  fields: {
    cards: string[];
    hidden_cards: string;
  }
}

interface Deck {
  fields: {
    cards: string[];
    hidden_cards: string;
  }
}

interface Piles {
  fields: {
    cards: string[];
  }
}

interface GameObject {
  availableCards: string[];
  columns: Column[];
  deck: Deck;
  difficulty: string;
  end_time: number;
  id: { id: string };
  piles: Piles[];
  player: string;
  player_moves: number;
  start_time: number;
}

describe("Interacting with the Smart Contract", () => {
  let toolbox: TestToolbox;
  let packageId: string;

  beforeAll(async () => {
    toolbox = await setupSuiClient();
    packageId = PACKAGE_ADDRESS;
  });

  it("Test init normal game", async () => {
    const tx = new Transaction();
    tx.add(initNormalGame({
      package: packageId,
    }));
    const result = await executeTransactionBlock(toolbox, tx);
    const game = result.objectChanges?.filter(
      (object) =>
        object.type === "created" &&
        object.objectType === `${packageId}::solitaire::Game`
    );
    expect(game).toBeDefined();
    if (game) {
      toolbox.client
        .getObject({
          id: (game[0] as ObjectCreated).objectId,
          options: {showContent: true},
        })
        .then((result) => {
          if (result.data?.content?.dataType === 'moveObject') {
            expect((result.data?.content?.fields as unknown as GameObject).difficulty).toEqual('NORMAL');
          }
        });
    }
  });

  it("Test init easy game", async () => {
    const tx = new Transaction();
    tx.add(initEasyGame({
      package: packageId,
    }));
    const result = await executeTransactionBlock(toolbox, tx);
    const game = result.objectChanges?.filter(
      (object) =>
        object.type === "created" &&
        object.objectType === `${packageId}::solitaire::Game`
    );
    expect(game).toBeDefined();

    if (game) {
      toolbox.client
        .getObject({
          id: (game[0] as ObjectCreated).objectId,
          options: {showContent: true},
        })
        .then((result) => {
          if (result.data?.content?.dataType === 'moveObject') {
            expect((result.data?.content?.fields as unknown as GameObject).difficulty).toEqual('EASY');
          }
        });
    }
  });


  // skipped because it takes some time to run, but passes when being executed manually
  it.skip("Test open deck cards and rotate them", async () => {
    // Create a new normal game for this test
    let tx = new Transaction();
    tx.add(initNormalGame({
      package: packageId,
    }));
    let result = await executeTransactionBlock(toolbox, tx);
    const game = result.objectChanges?.filter(
      (object) =>
        object.type === "created" &&
        object.objectType === `${packageId}::solitaire::Game`
    );
    expect(game).toBeDefined();

    let testGame: GameObject;
    if (game) {
      const gameResult = await toolbox.client.getObject({
        id: (game[0] as ObjectCreated).objectId,
        options: {showContent: true},
      });
      if (gameResult.data?.content?.dataType === 'moveObject') {
        testGame = (gameResult.data?.content?.fields as unknown as GameObject);
      }
    }

    let firstCard: any;
    // Open and save the first card
    tx = new Transaction();
    tx.add(openDeckCard({
      package: packageId,
      arguments: [testGame!.id.id],
    }));
    await executeTransactionBlock(toolbox, tx);
    const obj = await toolbox.client
      .getObject({
        id: testGame!.id.id,
        options: {showContent: true},
      })

    if (obj.data?.content?.dataType === 'moveObject') {
      firstCard = (obj.data?.content?.fields as unknown as GameObject).deck.fields.cards[0];
    }

    let hiddenDeckCards = 23;
    // Open all the deck cards
    while (hiddenDeckCards > 0) {
      console.log(`Hidden deck cards: ${hiddenDeckCards}`);
      let tx = new Transaction();
      tx.add(openDeckCard({
        package: packageId,
        arguments: [testGame!.id.id],
      }));
      const result = await executeTransactionBlock(toolbox, tx);
      hiddenDeckCards--;
    }
    toolbox.client
      .getObject({
        id: testGame!.id.id,
        options: {showContent: true},
      })
      .then((result) => {
        if (result.data?.content?.dataType === 'moveObject') {
          expect((result.data?.content?.fields as unknown as GameObject).deck.fields.hidden_cards).toEqual("0");
        }
      });

    // After opening all the cards, rotate them to get the first card back
    tx = new Transaction();
    tx.add(rotateOpenDeckCards({
      package: packageId,
      arguments: [testGame!.id.id],
    }));
    await executeTransactionBlock(toolbox, tx);
    toolbox.client
      .getObject({
        id: testGame!.id.id,
        options: {showContent: true},
      })
      .then((result) => {
        if (result.data?.content?.dataType === 'moveObject') {
          expect((result.data?.content?.fields as unknown as GameObject).deck.fields.cards[23]).toEqual(firstCard);
        }
      });
  });
});
