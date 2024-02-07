"use client";

import { use, useEffect, useState } from "react";
import { Pile as PileProps } from "../../models/pile";
import { Column as ColumnProps } from "../../models/column";
import { Deck as DeckProps } from "../../models/deck";
import { Card } from "../cards/Card";
import { useSolitaireActions } from "@/hooks/useSolitaireActions";
import toast from "react-hot-toast";
import { DndContext } from "@dnd-kit/core";
import Pile from "./Pile";
import Column from "./Column";
import { EmptyDroppable } from "./EmptyDroppable";
import { useSolitaireGameMoves } from "@/hooks/useSolitaireGameMoves";
import { findCardOriginType } from "@/helpers/cardOrigin";

interface GameProps {
  id: string;
  columns: ColumnProps[];
  deck: DeckProps;
  piles: PileProps[];
}

export default function GameBoard({ game }: { game: GameProps }) {
  const [deck, setDeck] = useState<DeckProps>({
    hidden_cards: game.deck.hidden_cards,
    open_cards: 0,
    cards: [],
  });
  const [piles, setPiles] = useState<PileProps[]>(game.piles);
  const [columns, setColumns] = useState<ColumnProps[]>(game.columns);

  const {
    handleFromDeckToPile,
    handleFromDeckToColumn,
    handleFromColumnToPile,
    handleFromColumnToColumn,
    handleFromPileToColumn,
    handleOpenDeckCard,
    handleRotateOpenDeckCards,
  } = useSolitaireActions();

  const {
    updateColumnToColumnMove,
    updateColumnToPileMove,
    updatePileToColumnMove,
    updateDeckToColumnMove,
    updateDeckToPileMove,
  } = useSolitaireGameMoves();

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || !active || active.id === over.id) {
      return;
    }
    const cardOriginType = findCardOriginType(active.id, piles, columns, deck);
    const cardDestinationType = findCardOriginType(
      over.id,
      piles,
      columns,
      deck
    );
    if (cardOriginType === "column" && cardDestinationType === "column") {
      const move = updateColumnToColumnMove(active, over, columns, setColumns);
      if (move) columnToColumn(move.from, move.card, move.to);
    } else if (cardOriginType === "column" && cardDestinationType === "pile") {
      const move = updateColumnToPileMove(
        active,
        over,
        columns,
        setColumns,
        piles,
        setPiles
      );
      if (move) columnToPile(move.from, move.to);
    } else if (cardOriginType === "pile" && cardDestinationType === "column") {
      const move = updatePileToColumnMove(
        active,
        over,
        piles,
        setPiles,
        columns,
        setColumns
      );
      if (move) pileToColumn(move.from, move.to);
    } else if (cardOriginType === "deck" && cardDestinationType === "column") {
      const move = updateDeckToColumnMove(
        active,
        over,
        deck,
        setDeck,
        columns,
        setColumns
      );
      if (move) deckToColumn(move.to);
    } else if (cardOriginType === "deck" && cardDestinationType === "pile") {
      const move = updateDeckToPileMove(
        active,
        over,
        deck,
        setDeck,
        piles,
        setPiles
      );
      if (move) deckToPile(move.to);
    }
  }

  const clickDeck = async () => {
    if (!deck.hidden_cards && deck.cards.length === deck.open_cards) {
      setDeck((prevDeck) => ({
        ...prevDeck,
        hidde_cards: prevDeck.hidden_cards,
        open_cards: 0,
        cards: [...prevDeck.cards],
      }));
      return;
    }
    if (deck.hidden_cards !== 0) {
      try {
        const newCard = await handleOpenDeckCard(game.id);
        setDeck((prevDeck) => ({
          ...prevDeck, // Spread the previous deck to copy its properties
          hidden_cards: prevDeck.hidden_cards - 1, // Subtract 1 from hidden_cards
          open_cards: prevDeck.open_cards + 1, // Add 1 to open_cards
          cards: [...prevDeck.cards, newCard], // Add newCard to the end of cards array
        }));
      } catch (e) {
        toast.error("Transaction Failed");
      }
    } else {
      try {
        const deck = await handleRotateOpenDeckCards(game.id);
        // TODO: deserialize updatedGame using GameProps
        //setDeck(deck);
      } catch (e) {
        toast.error("Transaction Failed");
      }
    }
  };

  const deckToPile = async (pileIndex: number) => {
    try {
      await handleFromDeckToPile(game.id, pileIndex);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  const deckToColumn = async (columnIndex: number) => {
    try {
      await handleFromDeckToColumn(game.id, columnIndex);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  const columnToPile = async (columnIndex: number, pileIndex: number) => {
    try {
      const newCard = await handleFromColumnToPile(
        game.id,
        columnIndex,
        pileIndex
      );
      if (newCard) {
        setColumns((prevColumns) =>
          prevColumns.map((column, index) => {
            if (index === columnIndex) {
              return {
                ...column,
                hidden_cards: column.hidden_cards - 1,
                cards: [...column.cards, newCard],
              };
            } else {
              return column;
            }
          })
        );
      }
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
      const newCard = await handleFromColumnToColumn(
        game.id,
        fromColumnIndex,
        card,
        toColumnIndex
      );
      if (newCard) {
        setColumns((prevColumns) =>
          prevColumns.map((column, index) => {
            if (index === fromColumnIndex) {
              return {
                ...column,
                hidden_cards: column.hidden_cards - 1,
                cards: [...column.cards, newCard],
              };
            } else {
              return column;
            }
          })
        );
      }
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  const pileToColumn = async (pileIndex: number, columnIndex: number) => {
    try {
      await handleFromPileToColumn(game.id, pileIndex, columnIndex);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="px-60 h-full w-full flex flex-col items-center space-y-7 pt-14 gap-y-36">
        <ul className="w-full h-200 flex justify-between items-center">
          {/* Set up card deck */}
          <li key={"cardDeck"} onClick={clickDeck}>
            {!!deck.hidden_cards && <Card id={-1}></Card>}
            {!deck.hidden_cards && <div className="w-[120px] h-[166px]"></div>}
          </li>

          {/* Place where the open deck cards are being displayed */}
          <li className="min-w-[120px] h-[166px]" key={"openCard"}>
            {!!deck.open_cards && (
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", zIndex: 2 }}>
                  <Card id={Number(deck.cards[deck.open_cards - 1])} />
                </div>
                {
                  // Show the following card if there is one after the top deck card
                  deck.open_cards > 1 && (
                    <div style={{ position: "absolute", zIndex: 1 }}>
                      <Card id={Number(deck.cards[deck.open_cards - 2])} />
                    </div>
                  )
                }
              </div>
            )}
          </li>

          {/* Empty placeholder */}
          <li className="w-[120px] h-[166px]"></li>

          {/* Set up piles */}
          {piles.map((pile, index) => (
            <li key={index}>
              <EmptyDroppable id={`empty-pile-droppable-${index}`}>
                <Pile pile={pile} />
              </EmptyDroppable>
            </li>
          ))}
        </ul>
        <ul className="w-full flex justify-between  ">
          {columns.map((column, index) => (
            <li key={index}>
              <EmptyDroppable
                index={index}
                id={`empty-column-droppable-${index}`}
              >
                <Column column={column} index={index} />
              </EmptyDroppable>
            </li>
          ))}
        </ul>
      </div>
    </DndContext>
  );
}
