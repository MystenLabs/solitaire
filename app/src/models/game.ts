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
            (column: any) => new Column(column.fields.cards, column.fields.hidden_cards)
        );
        this.deck = new Deck(contents.deck.fields.cards, contents.deck.fields.hidden_cards);
        this.piles = contents.piles.map(
            (pile: any) => new Pile(pile.fields.cards)
        );
    }
}
