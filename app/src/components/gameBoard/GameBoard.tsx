"use client";

import { use, useEffect, useState } from "react";
import cardBack from "../../../../app/public/assets/cards/card_back.svg";
import Image from "next/image";
import Pile from "./Pile";
import Column from "./Column";
import { Card } from "../cards/Card";
import { useSolitaireActions } from "@/hooks/useSolitaireActions";
import toast from "react-hot-toast";

interface CardObject {
  hiddenCards: number;
  cards: number[];
}

interface Props {
  gameId: string;
}

export default function GameBoard({ gameId }: Props) {
  const [deck, setDeck] = useState<CardObject>({
    hiddenCards: 10,
    cards: [13, 26],
  });
  const [piles, setPiles] = useState<number[][]>([[14], [], [33], [41]]);
  const [columns, setColumns] = useState<CardObject[]>([
    { hiddenCards: 0, cards: [2, 3] },
    { hiddenCards: 2, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 3, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 4, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 5, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 6, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 7, cards: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  ]);
  const {
    handleFromDeckToPile,
    handleFromDeckToColumn,
    handleFromColumnToPile,
    handleFromColumnToColumn,
    handleFromPileToColumn,
    handleOpenDeckCard,
    handleRotateOpenDeckCards,
  } = useSolitaireActions();

  const clickDeck = async () => {
    if (deck.hiddenCards !== 0) {
      try {
        const game = await handleOpenDeckCard(gameId);
        // setDeck(game.deck);
      } catch (e) {
        toast.error("Transaction Failed");
      }
    } else {
      try {
        const game = await handleRotateOpenDeckCards(gameId);
        // setDeck(game.deck);
      } catch (e) {
        toast.error("Transaction Failed");
      }
    }
  };

  const deckToPile = async (pileIndex: number) => {
    try {
      const game = await handleFromDeckToPile(gameId, pileIndex);
      // setDeck(game.deck);
      // setPiles(game.piles);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  const deckToColumn = async (columnIndex: number) => {
    try {
      const game = await handleFromDeckToColumn(gameId, columnIndex);
      // setDeck(game.deck);
      // setColumns(game.columns);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  const columnToPile = async (columnIndex: number, pileIndex: number) => {
    try {
      const game = await handleFromColumnToPile(gameId, columnIndex, pileIndex);
      // setColumns(game.columns);
      // setPiles(game.piles);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  const columnToColumn = async (
    fromColumnIndex: number,
    card: number,
    toColumnIndex: number
  ) => {
    try {
      const game = await handleFromColumnToColumn(
        gameId,
        fromColumnIndex,
        card,
        toColumnIndex
      );
      // setColumns(game.columns);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  const pileToColumn = async (pileIndex: number, columnIndex: number) => {
    try {
      const game = await handleFromPileToColumn(gameId, pileIndex, columnIndex);
      // setColumns(game.columns);
      // setPiles(game.piles);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  return (
    <div className="px-60 h-full w-full flex flex-col items-center space-y-7 pt-14">
      <ul className="w-full flex justify-between items-center">
        <li key={"cardDeck"} onClick={clickDeck}>
          <Image
            src={cardBack}
            alt={"Card Back"}
            className="min-w-[120px] h-[166px]"
          />
        </li>
        <li className="min-w-[120px] h-[166px]" key={"openCard"}>
          {!!deck.cards.length && (
            <Card id={deck.cards[deck.cards.length - 1]} />
          )}
        </li>
        <li className="w-[120px] h-[166px]"></li>
        {piles.map((pile, index) => (
          <li key={index}>
            <Pile pile={pile} />
          </li>
        ))}
      </ul>
      <ul className="w-full flex justify-between items-center ">
        {columns.map((column, index) => (
          <li key={index}>
            <Column column={column} />
          </li>
        ))}
      </ul>
    </div>
  );
}
