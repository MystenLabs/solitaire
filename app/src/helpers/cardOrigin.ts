import {Pile as PileProps} from "../../../app/src/models/pile";
import {Column as ColumnProps} from "../../../app/src/models/column";
import {Deck as DeckProps} from "../../../app/src/models/deck";

type CardStackType = "pile" | "column" | "deck";

/// This function will return the type of the card stack where the card is located
export function findCardOriginType(cardId: String, piles: PileProps[], columns: ColumnProps[], deck: DeckProps): CardStackType | undefined {
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