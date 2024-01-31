"use client";

import {use, useEffect, useState} from "react";
import {Pile as PileProps} from "../../models/pile" ;
import {Column as ColumnProps} from "../../models/column";
import {Deck as DeckProps} from "../../models/deck";
import {Card} from "../cards/Card";
import {useSolitaireActions} from "@/hooks/useSolitaireActions";
import toast from "react-hot-toast";
import {DndContext, useDroppable} from "@dnd-kit/core";
import Pile from "./Pile";
import Column from "./Column";
import {EmptyDroppable} from "./EmptyDroppable";
import {CardDetails} from "@/helpers/cardDetails";


interface GameProps {
    id: string;
    columns: ColumnProps[];
    deck: DeckProps;
    piles: PileProps[];
}

type CardStackType =  "pile" | "column" | "deck";

export default function GameBoard({game}: { game: GameProps }) {
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

    /* Is the card on a pile, a column, or on the deck*/
    function findCardOriginType(cardId: String): CardStackType | undefined {
        const isInPile = cardId.includes('pile') || piles.some((pile) => pile.cards.includes(cardId));
        const isInColumn = cardId.includes('column') || columns.some((column) => column.cards.includes(cardId));
        const isInDeck = deck.cards.includes(cardId);
        switch (true) {
            case isInPile:
                return "pile";
            case isInColumn:
                return "column";
            case isInDeck:
                return "deck";
            default:
                return undefined; // Maybe throw an error?
        }
    }

    function updateColumnToColumnMove(active: any, over: any) {
        // Get from-column index
        const columnIndexOfActive = columns.findIndex(
            (column) => column.cards.includes(String(active.id))
        );

        // Get to-column index
        let columnIndexOfOver: number;
        if (over.id.includes('empty-column-droppable')) {
            columnIndexOfOver = Number(over.id.split('-').pop());
        } else {
            columnIndexOfOver = columns.findIndex(
                (column) => column.cards.includes(String(over.id))
            );
        }

        if (columnIndexOfOver === -1 || columnIndexOfActive === -1) {
            console.error("Destination index not found", columnIndexOfActive, columnIndexOfOver)
            return;
        }

        /* Update the values of the columns */
        let newColumns = [...columns];
        const objectsToMove = newColumns[columnIndexOfActive].cards.slice(
            newColumns[columnIndexOfActive].cards.indexOf(String(active.id))
        );

        /* Check if the move is legal! If not, return early. */
        const bottomCardOfObjectToMove = new CardDetails(objectsToMove[0]);
        if (over.id.includes('empty-column-droppable')) {
            const isNotKing = bottomCardOfObjectToMove.rank !== 12;
            const columnIsNotEmpty = columns[columnIndexOfOver].cards.length !== 0;
            if (isNotKing || columnIsNotEmpty) {
                console.error("Illegal move")
                return;
            }
        } else {
            const topCardOfDestination = new CardDetails(columns[columnIndexOfOver].cards[columns[columnIndexOfOver].cards.length - 1]);
            const sameColor = bottomCardOfObjectToMove.color === topCardOfDestination.color;
            const destinationRankDifference = topCardOfDestination.rank - bottomCardOfObjectToMove.rank == 1;
            if (sameColor || !destinationRankDifference) {
                console.error("Illegal move")
                return;
            }
        }

        // Remove the item from the old column
        newColumns[columnIndexOfActive].cards = newColumns[columnIndexOfActive].cards.slice(0, newColumns[columnIndexOfActive].cards.indexOf(String(active.id)));

        // Move the item to the new column
        newColumns[columnIndexOfOver].cards.push(...objectsToMove);

        // TODO - Open column card if revealed
        setColumns(over ? newColumns : columns);
    }

    function updateColumnToPileMove(active: any, over: any) {
        // TODO: Check if the move is legal! If not, return early.
        const columnIndexOfActive = columns.findIndex(
            (column) => column.cards.includes(String(active.id))
        );

        let pileIndexOfOver: number;
        if (over.id.includes('empty-pile-droppable')) {
            pileIndexOfOver = Number(over.id.split('-').pop());
        } else {
            pileIndexOfOver = piles.findIndex(
                (pile) => pile.cards.includes(String(over.id))
            );
        }

        if (pileIndexOfOver === -1 || columnIndexOfActive === -1) {
            console.error("Destination index not found")
            return;
        }

        /* Update the values of the columns */
        let newColumns = [...columns];
        const objectsToMove = newColumns[columnIndexOfActive].cards.slice(
            newColumns[columnIndexOfActive].cards.indexOf(String(active.id))
        );

        /* Check if the move is legal! If not, return early. */
        const bottomCardOfObjectToMove = new CardDetails(objectsToMove[0]);
        if (over.id.includes('empty-pile-droppable')) {
            const isNotAce = bottomCardOfObjectToMove.rank !== 0;
            const pileIsNotEmpty = piles[pileIndexOfOver].cards.length !== 0;
            if (isNotAce || pileIsNotEmpty) {
                console.error("Illegal move")
                return;
            }
        } else {
            const topCardOfDestination = new CardDetails(piles[pileIndexOfOver].cards[piles[pileIndexOfOver].cards.length - 1]);
            const notSameColor = bottomCardOfObjectToMove.color !== topCardOfDestination.color;
            const destinationRankDifference = bottomCardOfObjectToMove.rank - topCardOfDestination.rank == 1;
            if (notSameColor || !destinationRankDifference) {
                console.error("Illegal move")
                return;
            }
        }

        // Remove the item from the old column
        newColumns[columnIndexOfActive].cards = newColumns[columnIndexOfActive].cards.slice(
            0, newColumns[columnIndexOfActive].cards.indexOf(String(active.id))
        );

        // Move the item to the new column
        let newPiles = [...piles];
        newPiles[pileIndexOfOver].cards.push(...objectsToMove);

        setColumns(over ? newColumns : columns);
        setPiles(over ? newPiles : piles);
    }

    function updatePileToColumnMove(active: any, over: any) {
        // TODO: Check if the move is legal! If not, return early.
        const pileIndexOfActive = piles.findIndex(
            (pile) => pile.cards.includes(String(active.id))
        );

        // Get to-column index
        let columnIndexOfOver: number;
        if (over.id.includes('empty-column-droppable')) {
            columnIndexOfOver = Number(over.id.split('-').pop());
        } else {
            columnIndexOfOver = columns.findIndex(
                (column) => column.cards.includes(String(over.id))
            );
        }

        if (columnIndexOfOver === -1 || pileIndexOfActive === -1) {
            console.error("Destination index not found")
            return;
        }

        /* Update the values of the columns */
        let newPiles = [...piles];
        const objectsToMove = newPiles[pileIndexOfActive].cards.pop();

        // Move the item to the new column
        let newColumns = [...columns];
        newColumns[columnIndexOfOver].cards.push(objectsToMove!);

        setColumns(over ? newColumns : columns);
        setPiles(over ? newPiles : piles);
    }

    function handleDragEnd(event: any) {
        const {active, over} = event;
        if (!over || !active) {
            return;
        }
        const cardOriginType = findCardOriginType(active.id);
        const cardDestinationType = findCardOriginType(over.id);
        if (cardOriginType === "column" && cardDestinationType === "column") {
            updateColumnToColumnMove(active, over);
        } else if (cardOriginType === "column" && cardDestinationType === "pile") {
            updateColumnToPileMove(active, over)
        } else if (cardOriginType === "pile" && cardDestinationType === "column") {
            updatePileToColumnMove(active, over)
        }
        // TODO - deck to column
        // TODO - deck to pile
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

                <ul className="w-full h-200 flex justify-between items-center">
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
                        <EmptyDroppable id={`empty-pile-droppable-${index}`}>
                            <Pile pile={pile} />
                        </EmptyDroppable>
                    </li>
                  ))}
                </ul>
                <ul className="w-full flex justify-between  ">
                    {columns.map((column, index) => (
                        <li key={index}>
                            <EmptyDroppable index={index} id={`empty-column-droppable-${index}`}>
                                <Column column={column} index={index}/>
                            </EmptyDroppable>
                        </li>
                    ))}
                </ul>
            </div>
        </DndContext>
    );
}
