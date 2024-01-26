import { SuiTransactionBlockResponse } from "@mysten/sui.js";
import { Column } from './column';
import { Deck } from './deck';
import { Pile } from './pile';

export class Game {
    id: string;
    columns: Column[];
    deck: Deck;
    piles: Pile[];

    constructor(gameContentsResp: SuiTransactionBlockResponse) {
        let contents = gameContentsResp.data.content.fields;
        this.id = contents.id.id;
        this.columns = contents.columns.map(
            (column: any) => {
                column.fields.cards, column.fields.hidden_cards
            }
        );
        const deckCards: String[] = contents.deck.fields.cards;
        const deckHiddenCards: number = contents.deck.fields.hidden_cards
        this.deck = {
            cards: deckCards,
            hidden_cards: deckHiddenCards,
        };
        this.piles = contents.piles.map(
            (pile: any) => {pile.fields.cards}
        );
    }
}
