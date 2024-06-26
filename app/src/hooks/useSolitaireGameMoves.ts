import {CardDetails} from "@/helpers/cardDetails";
import {Column as ColumnProps} from "../models/column";
import {Pile as PileProps} from "../models/pile" ;
import {Deck as DeckProps} from "../models/deck";
import {Dispatch, SetStateAction} from "react";

export function useSolitaireGameMoves() {
    const updateColumnToColumnMove = (
        active: any, over: any,  columns: ColumnProps[], setColumns: Dispatch<SetStateAction<ColumnProps[]>>,
    ) => {
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
        let newColumns = columns.map(column => ({
            ...column, 
            cards: [...column.cards] // This creates a deep copy of the cards array
          }));
        const objectsToMove = newColumns[columnIndexOfActive].cards.slice(
            newColumns[columnIndexOfActive].cards.indexOf(String(active.id))
        );

        /* Check if the move is legal! If not, return early. */
        const bottomCardOfObjectToMove = new CardDetails(objectsToMove[0]);
        if (over.id.includes('empty-column-droppable')) {
            const isNotKing = bottomCardOfObjectToMove.rank !== 12;
            const columnIsNotEmpty = columns[columnIndexOfOver].cards.length !== 0;
            if (columnIsNotEmpty) {
                const topCardOfDestination = new CardDetails(columns[columnIndexOfOver].cards[columns[columnIndexOfOver].cards.length - 1]);
                const sameColor = bottomCardOfObjectToMove.color === topCardOfDestination.color;
                const destinationRankDifference = topCardOfDestination.rank - bottomCardOfObjectToMove.rank == 1;
                if (sameColor || !destinationRankDifference) {
                    console.error("Illegal move")
                    return;
                }
            } else if (isNotKing) {
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

        return { from: columnIndexOfActive, card: active.id, to: columnIndexOfOver}
    }

    const updateColumnToPileMove = (active: any, over: any,
                                    columns: ColumnProps[], setColumns: Dispatch<SetStateAction<ColumnProps[]>>,
                                    piles: PileProps[], setPiles: Dispatch<SetStateAction<PileProps[]>>) => {
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
        let newColumns = columns.map(column => ({
            ...column, // This copies the column's primitive properties and references
            cards: [...column.cards] // This creates a deep copy of the cards array
          }));
        const objectsToMove = newColumns[columnIndexOfActive].cards.slice(
            newColumns[columnIndexOfActive].cards.indexOf(String(active.id))
        );

        /* Check if the move is legal! If not, return early. */
        if (objectsToMove.length > 1) {
            console.error("Illegal move")
            return;
        }
        const bottomCardOfObjectToMove = new CardDetails(objectsToMove[0]);
        if (over.id.includes('empty-pile-droppable')) {
            const isNotAce = bottomCardOfObjectToMove.rank !== 0;
            const pileIsNotEmpty = piles[pileIndexOfOver].cards.length !== 0;
            if (pileIsNotEmpty) {
                const topCardOfDestination = new CardDetails(piles[pileIndexOfOver].cards[piles[pileIndexOfOver].cards.length - 1]);
                const notSameSuit = bottomCardOfObjectToMove.suit !== topCardOfDestination.suit;
                const destinationRankDifference = bottomCardOfObjectToMove.rank - topCardOfDestination.rank == 1;
                if (notSameSuit || !destinationRankDifference) {
                    console.error("Illegal move")
                    return;
                }
            } else if (isNotAce) {
                console.error("Illegal move")
                return;
            }
        } else {
            const topCardOfDestination = new CardDetails(piles[pileIndexOfOver].cards[piles[pileIndexOfOver].cards.length - 1]);
            const notSameSuit = bottomCardOfObjectToMove.suit !== topCardOfDestination.suit;
            const destinationRankDifference = bottomCardOfObjectToMove.rank - topCardOfDestination.rank == 1;
            if (notSameSuit || !destinationRankDifference) {
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

        // TODO - Open column card if revealed

        setColumns(over ? newColumns : columns);
        setPiles(over ? newPiles : piles);
        return { from: columnIndexOfActive, to: pileIndexOfOver}
    }

    const updatePileToColumnMove = (active: any, over: any,
                                    piles: PileProps[], setPiles: Dispatch<SetStateAction<PileProps[]>>,
                                    columns: ColumnProps[], setColumns: Dispatch<SetStateAction<ColumnProps[]>>) => {
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
        let newPiles = piles.map((pile) => ({
            ...pile,
            cards: [...pile.cards] // This creates a deep copy of the cards array
        }));
        const objectToMove = newPiles[pileIndexOfActive].cards.pop()!;

        /* Check if the move is legal! If not, return early. */
        const bottomCardOfObjectToMove = new CardDetails(objectToMove);
        if (over.id.includes('empty-column-droppable')) {
            const isNotKing = bottomCardOfObjectToMove.rank !== 12;
            const columnIsNotEmpty = columns[columnIndexOfOver].cards.length !== 0;
            if (columnIsNotEmpty) {
                const topCardOfDestination = new CardDetails(columns[columnIndexOfOver].cards[columns[columnIndexOfOver].cards.length - 1]);
                const sameColor = bottomCardOfObjectToMove.color === topCardOfDestination.color;
                const destinationRankDifference = topCardOfDestination.rank - bottomCardOfObjectToMove.rank == 1;
                if (sameColor || !destinationRankDifference) {
                    console.error("Illegal move")
                    return;
                }
            } else if (isNotKing) {
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

        // Move the item to the new column
        let newColumns = [...columns];
        newColumns[columnIndexOfOver].cards.push(objectToMove);

        setColumns(over ? newColumns : columns);
        setPiles(over ? newPiles : piles);
        return { from: pileIndexOfActive, to: columnIndexOfOver}
    }

    const updateDeckToColumnMove = (active: any, over: any,
                                    deck: DeckProps, setDeck: Dispatch<SetStateAction<DeckProps>>,
                                    columns: ColumnProps[], setColumns: Dispatch<SetStateAction<ColumnProps[]>>) => {
        // Get to-column index
        let columnIndexOfOver: number;
        if (over.id.includes('empty-column-droppable')) {
            columnIndexOfOver = Number(over.id.split('-').pop());
        } else {
            columnIndexOfOver = columns.findIndex(
                (column) => column.cards.includes(String(over.id))
            );
        }

        if (columnIndexOfOver === -1) {
            console.error("Destination index not found")
            return;
        }

        /* Update the values of the columns */
        let newDeck = {
            ...deck,
            cards: [...deck.cards] // Creates a new array copy of deck.cards
          };
        const objectToMove = newDeck.cards.pop()!;
        newDeck.open_cards -= 1;

        /* Check if the move is legal! If not, return early. */
        const bottomCardOfObjectToMove = new CardDetails(objectToMove);
        if (over.id.includes('empty-column-droppable')) {
            const isNotKing = bottomCardOfObjectToMove.rank !== 12;
            const columnIsNotEmpty = columns[columnIndexOfOver].cards.length !== 0;
            if (columnIsNotEmpty) {
                const topCardOfDestination = new CardDetails(columns[columnIndexOfOver].cards[columns[columnIndexOfOver].cards.length - 1]);
                const sameColor = bottomCardOfObjectToMove.color === topCardOfDestination.color;
                const destinationRankDifference = topCardOfDestination.rank - bottomCardOfObjectToMove.rank == 1;
                if (sameColor || !destinationRankDifference) {
                    console.error("Illegal move")
                    return;
                }
            } else if (isNotKing) {
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

        // Move the item to the new column
        let newColumns = [...columns];
        newColumns[columnIndexOfOver].cards.push(objectToMove);

        setColumns(over ? newColumns : columns);
        setDeck(over ? newDeck : deck);
        return {to: columnIndexOfOver}
    }

    const updateDeckToPileMove = (active: any, over: any,
                                  deck: DeckProps, setDeck: Dispatch<SetStateAction<DeckProps>>,
                                  piles: PileProps[], setPiles: Dispatch<SetStateAction<PileProps[]>>) => {
        let pileIndexOfOver: number;
        if (over.id.includes('empty-pile-droppable')) {
            pileIndexOfOver = Number(over.id.split('-').pop());
        } else {
            pileIndexOfOver = piles.findIndex(
                (pile) => pile.cards.includes(String(over.id))
            );
        }

        if (pileIndexOfOver === -1) {
            console.error("Destination index not found")
            return;
        }

        /* Update the values of the columns */
        let newDeck = {
            ...deck,
            cards: [...deck.cards] // Creates a new array copy of deck.cards
          };
        const objectToMove = newDeck.cards.pop()!;
        newDeck.open_cards -= 1;

        /* Check if the move is legal! If not, return early. */
        const bottomCardOfObjectToMove = new CardDetails(objectToMove);
        if (over.id.includes('empty-pile-droppable')) {
            const isNotAce = bottomCardOfObjectToMove.rank !== 0;
            const pileIsNotEmpty = piles[pileIndexOfOver].cards.length !== 0;
            if (pileIsNotEmpty) {
                const topCardOfDestination = new CardDetails(piles[pileIndexOfOver].cards[piles[pileIndexOfOver].cards.length - 1]);
                const notSameSuit = bottomCardOfObjectToMove.suit !== topCardOfDestination.suit;
                const destinationRankDifference = bottomCardOfObjectToMove.rank - topCardOfDestination.rank == 1;
                if (notSameSuit || !destinationRankDifference) {
                    console.error("Illegal move")
                    return;
                }
            } else if (isNotAce) {
                console.error("Illegal move")
                return;
            }
        } else {
            const topCardOfDestination = new CardDetails(piles[pileIndexOfOver].cards[piles[pileIndexOfOver].cards.length - 1]);
            const notSameSuit = bottomCardOfObjectToMove.suit !== topCardOfDestination.suit;
            const destinationRankDifference = bottomCardOfObjectToMove.rank - topCardOfDestination.rank == 1;
            if (notSameSuit || !destinationRankDifference) {
                console.error("Illegal move")
                return;
            }
        }

        // Move the item to the new column
        let newPiles = [...piles];
        newPiles[pileIndexOfOver].cards.push(objectToMove);

        setPiles(over ? newPiles : piles);
        setDeck(over ? newDeck : deck);
        return {to: pileIndexOfOver}
    }


    return {
        updateColumnToColumnMove,
        updateColumnToPileMove,
        updatePileToColumnMove,
        updateDeckToColumnMove,
        updateDeckToPileMove,
    };
}