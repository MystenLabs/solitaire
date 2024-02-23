// @ts-ignore
import { SuiTransactionBlockResponse } from "@mysten/sui.js";
import {Column as ColumnProps, Column} from './column';
import {Deck as DeckProps, Deck} from './deck';
import {Pile as PileProps, Pile} from './pile';

export interface GameProps {
    id: string;
    columns: ColumnProps[];
    deck: DeckProps;
    piles: PileProps[];
}

export class Game {
    id: string;
    columns: Column[];
    deck: Deck;
    piles: Pile[];

    constructor(gameContentsResp: SuiTransactionBlockResponse) {
        let contents = gameContentsResp.data.content.fields;
        this.id = contents.id.id;
        this.columns = contents.columns.map(
            (column: any): Column => {
                return {
                    cards: column.fields.cards,
                    hidden_cards: column.fields.hidden_cards
                };
            }
        );

        const deckCards: String[] = contents.deck.fields.cards;
        const deckHiddenCards: number = contents.deck.fields.hidden_cards
        this.deck = {
            cards: deckCards,
            open_cards: 0,
            hidden_cards: deckHiddenCards,
        };
        this.piles = contents.piles.map(
            (pile: any): Pile => {
                return {
                    cards: pile.fields.cards
                }
            }
        );
    }

    get elements(): GameProps {
        return {
            id: this.id,
            columns: this.columns,
            deck: this.deck,
            piles: this.piles
        }
    }
}
