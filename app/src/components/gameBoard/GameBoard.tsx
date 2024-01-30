"use client";

import { use, useEffect, useState } from "react";
import cardBack from "../../../../app/public/assets/cards/card_back.svg";
import Image from "next/image";
import {Pile as PileProps} from "../../models/pile" ;
import {Column as ColumnProps} from "../../models/column";
import {Deck as DeckProps} from "../../models/deck";
import { Card } from "../cards/Card";
import { useSolitaireActions } from "@/hooks/useSolitaireActions";
import toast from "react-hot-toast";
import {DndContext} from "@dnd-kit/core";
import Pile from "./Pile";
import Column from "./Column";

interface GameProps {
  id: string;
  columns: ColumnProps[];
  deck: DeckProps;
  piles: PileProps[];
}

export default function GameBoard({ game }: {game: GameProps}) {
  const [deck, setDeck] = useState<DeckProps>(game.deck);
  const [piles, setPiles] = useState<PileProps[]>(game.piles);
  const [columns, setColumns] = useState<ColumnProps[]>(
      game.columns
  );

  const {
    handleFromDeckToPile,
    handleFromDeckToColumn,
    handleFromColumnToPile,
    handleFromColumnToColumn,
    handleFromPileToColumn,
    handleOpenDeckCard,
    handleRotateOpenDeckCards,
  } = useSolitaireActions();

  function handleDragEnd(event: any) {
    const {active, over} = event;
    if (!over || !active) {
      return;
    }

    // Get from-column index
    const columnIndexOfActive = columns.findIndex(
        (column) => column.cards.includes(String(active.id))
    );

    // Get to-column index
    const columnIndexOfOver = columns.findIndex(
        (column) => column.cards.includes(String(over.id))
    );

    /* Update the values of the columns */
    let newColumns = [...columns];
    const objectsToMove = newColumns[columnIndexOfActive].cards.slice(
        newColumns[columnIndexOfActive].cards.indexOf(String(active.id))
    );

    // TODO: Check if the move is legal! If not, return early.

    // Remove the item from the old column
    newColumns[columnIndexOfActive].cards = newColumns[columnIndexOfActive].cards.slice(0, newColumns[columnIndexOfActive].cards.indexOf(String(active.id)));

    // Move the item to the new column
    newColumns[columnIndexOfOver].cards.push(...objectsToMove);

    // If the move is valid, update the state of the game
    // TODO - setDeck if changed
    // TODO - setPiles if changed
    // TODO - Open column card if revealed
    setColumns(over ? newColumns : columns);
  }

  const clickDeck = async () => {
    if (deck.hidden_cards !== 0) {
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
      <DndContext onDragEnd={handleDragEnd}>
        <div className="px-60 h-full w-full flex flex-col items-center space-y-7 pt-14 gap-y-36">

          <ul className="w-full flex justify-between items-center">
            {/* Set up card deck */}
            <li key={"cardDeck"} onClick={clickDeck}>
              <Card id={-1}></Card>
            </li>

            {/* Place where the open deck cards are being displayed */}
            <li className="min-w-[120px] h-[166px]" key={"openCard"}>
              {!!deck.cards.length && (
                <Card id={Number(deck.cards[deck.cards.length - 1])} />
              )}
            </li>

            {/* Empty placeholder */}
            <li className="w-[120px] h-[166px]"></li>

            {/* Set up piles */}
            {piles.map((pile, index) => (
              <li key={index}>
                <Pile pile={pile} />
              </li>
            ))}
          </ul>
          <ul className="w-full flex justify-between items-center ">
            {
              columns.map((column, index) => {
                if (column.cards.length == 0) {
                  return (<li className="w-[120px] h-[166px]"></li>)
                }
                return ( <li key={index}> <Column column={column} /> </li>)
              })
            }
          </ul>
        </div>
      </DndContext>
  );
}
