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
import {useSolitaireGameMoves} from "@/hooks/useSolitaireGameMoves";


interface GameProps {
    id: string;
    columns: ColumnProps[];
    deck: DeckProps;
    piles: PileProps[];
}

type CardStackType =  "pile" | "column" | "deck";

export default function GameBoard({game}: { game: GameProps }) {
    const [deck, setDeck] = useState<DeckProps>({
        hidden_cards: game.deck.hidden_cards,
        cards: []
    });
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

    const {
        updateColumnToColumnMove,
        updateColumnToPileMove,
        updatePileToColumnMove,
        updateDeckToColumnMove,
        updateDeckToPileMove,
    } = useSolitaireGameMoves();


    function handleDragEnd(event: any) {
        const {active, over} = event;
        if (!over || !active || active.id === over.id) {
            return;
        }
        const cardOriginType = findCardOriginType(active.id);
        const cardDestinationType = findCardOriginType(over.id);
        console.log(cardOriginType, 'to', cardDestinationType)
        if (cardOriginType === "column" && cardDestinationType === "column") {
            updateColumnToColumnMove(active, over, columns, setColumns);
        } else if (cardOriginType === "column" && cardDestinationType === "pile") {
            updateColumnToPileMove(active, over, columns, setColumns, piles, setPiles)
        } else if (cardOriginType === "pile" && cardDestinationType === "column") {
            updatePileToColumnMove(active, over, piles, setPiles, columns, setColumns)
        } else if (cardOriginType === "deck" && cardDestinationType === "column") {
            updateDeckToColumnMove(active, over, deck, setDeck, columns, setColumns)
        } else if (cardOriginType === "deck" && cardDestinationType === "pile") {
            updateDeckToPileMove(active, over, deck, setDeck, piles, setPiles)
        }
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
                        {!!deck.hidden_cards && (<Card id={-1}></Card>)}
                        {!deck.hidden_cards && (<div className="w-[120px] h-[166px]"></div>)}
                    </li>

                    {/* Place where the open deck cards are being displayed */}
                  <li className="min-w-[120px] h-[166px]" key={"openCard"}>
                    {!!deck.cards.length && (
                        <div style={{position: 'relative'}}>
                            <div style={{position: 'absolute', zIndex: 2}}><Card
                                id={Number(deck.cards[deck.cards.length - 1])}/></div>
                            {   // Show the following card if there is one after the top deck card
                                deck.cards.length > 1 &&
                                <div style={{position: 'absolute', zIndex: 1}}>
                                    <Card id={Number(deck.cards[deck.cards.length - 2])}/>
                                </div>
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
